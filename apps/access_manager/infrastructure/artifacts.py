"""Local managed artifacts: opaque IDs, integrity hashes and device metadata."""
import base64
import hashlib
import json
import os
import re
import uuid
from datetime import datetime,timezone
from pathlib import Path
from threading import RLock
from apps.access_manager.runtime import data_dir

class ArtifactRepository:
 def __init__(self,root=None):self.root=Path(root or data_dir()/'managed-artifacts');self.root.mkdir(parents=True,exist_ok=True);self.lock=RLock()
 def add(self,content,*,name,kind,device,provenance):
  if not content or len(content)>32*1024*1024:raise ValueError('Arquivo vazio ou maior que 32 MiB')
  if content[:128].lstrip().lower().startswith((b'<html',b'<!doctype html')):raise ValueError('Página HTML não é um arquivo de configuração/firmware')
  identity=uuid.uuid4().hex;filename=re.sub(r'[^A-Za-z0-9_.-]','_',Path(name).name) or 'artifact.bin'
  metadata={'id':identity,'filename':filename,'kind':kind,'size':len(content),'sha256':hashlib.sha256(content).hexdigest(),'created_at':datetime.now(timezone.utc).isoformat(),'device':dict(device),'metadata_provenance':provenance}
  with self.lock:
   path=self.root/(identity+'.bin');path.write_bytes(content);os.chmod(path,0o600)
   index=self.root/(identity+'.json');index.write_text(json.dumps(metadata));os.chmod(index,0o600)
  return metadata
 def read(self,identity):
  if not re.fullmatch(r'[0-9a-f]{32}',str(identity)):raise ValueError('Identificador inválido')
  with self.lock:
   meta=json.loads((self.root/(identity+'.json')).read_text());path=self.root/(identity+'.bin');content=path.read_bytes()
   if hashlib.sha256(content).hexdigest()!=meta['sha256']:raise ValueError('Integridade do arquivo alterada')
   return meta,path,content
 def list(self):
  with self.lock:return sorted([json.loads(p.read_text()) for p in self.root.glob('*.json')],key=lambda r:r['created_at'],reverse=True)
 def download(self,identity):
  meta,_,content=self.read(identity);return {**meta,'content_base64':base64.b64encode(content).decode()}

class ManagementArtifacts:
 def __init__(self,sessions,commands,repository=None):self.sessions,self.commands=sessions,commands;self.repository=repository or ArtifactRepository()
 def identity(self):
  session=self.sessions.session
  if session is None:raise RuntimeError('Nenhum equipamento conectado')
  return {'vendor':session.vendor.value,'model':session.model,'firmware':session.firmware,'host':session.host,'identifier':session.metadata.get('device_identity')}
 def backup(self):
  with self.sessions.operation_lock:
   device=self.identity();result=self.commands.execute('backup','export_backup');content=Path(result['path']).read_bytes()
   return self.repository.add(content,name=result['filename'],kind='backup',device=device,provenance='authenticated_device_export')
 def upload(self,config):
  device=dict(config.get('device') or {})
  if config.get('kind') not in {'backup','firmware'}:raise ValueError('Tipo de artefato inválido')
  current=self.identity()
  for key in ('vendor','model'):
   if not device.get(key) or device[key]!=current[key]:raise ValueError('Fabricante/modelo declarado diverge do equipamento conectado')
  if len(str(config.get('content_base64') or ''))>45_000_000:raise ValueError('Limite de transferência do aplicativo excedido')
  try:content=base64.b64decode(config.get('content_base64') or '',validate=True)
  except Exception:raise ValueError('Arquivo inválido') from None
  return self.repository.add(content,name=config.get('filename') or 'artifact.bin',kind=config['kind'],device=device,provenance='operator_declared_unverified_header')
 def apply(self,config):
  with self.sessions.operation_lock:
   meta,path,_=self.repository.read(config['id']);current=self.identity();expected='ATUALIZAR' if meta['kind']=='firmware' else 'RESTAURAR'
   if config.get('confirmation')!=expected:raise ValueError('Digite '+expected+' para confirmar')
   for key in ('vendor','model'):
    if meta['device'].get(key)!=current.get(key):raise ValueError('Artefato pertence a outro fabricante/modelo')
   serial=meta['device'].get('identifier')
   if serial and current.get('identifier') and serial!=current['identifier']:raise ValueError('Backup pertence a outro equipamento')
   # Firmware identity is not asserted by hashing opaque binary headers.
   # Require explicit acknowledgement of that concrete limitation.
   if config.get('compatibility_ack') is not True:raise ValueError('Confirme compatibilidade do arquivo e possível perda de sessão')
   if meta['kind']=='firmware':return self.commands.execute('firmware','upload_firmware',str(path))
   return self.commands.execute('restore','restore_backup',str(path))
