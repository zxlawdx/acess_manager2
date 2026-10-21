"""Nonsecret BNG endpoint preferences; reject unknown/secret fields."""
import json
from pathlib import Path
from threading import RLock
from apps.access_manager.runtime import data_dir


class InfrastructureSettings:
    FIELDS={'id','label','vendor','platform','role','host','ssh_port','auth','enabled'}

    def __init__(self,path=None):
        self.path=Path(path) if path else data_dir()/'infrastructure-endpoints.json'
        self.lock=RLock()

    @classmethod
    def validate(cls, rows):
        from apps.access_manager.infrastructure.common.endpoint import normalize_ssh_target
        if not isinstance(rows,list) or len(rows)>32: raise ValueError('Lista de concentradores inválida.')
        result=[];seen=set()
        for row in rows:
            if not isinstance(row,dict) or set(row)-cls.FIELDS: raise ValueError('Campo de configuração não permitido.')
            import re
            identity=row.get('id')
            if not isinstance(identity,str) or not re.fullmatch(r'[a-zA-Z0-9_-]{1,64}',identity) or identity in seen:
                raise ValueError('Identificador inválido ou duplicado.')
            seen.add(identity)
            if row.get('vendor') not in {'huawei_bng','juniper'} or row.get('auth','ad')!='ad': raise ValueError('Provider inválido.')
            host=row.get('host','');port=row.get('ssh_port',22)
            if host: host,port=normalize_ssh_target(host,port)
            else: _,port=normalize_ssh_target('example.invalid',port)
            result.append({'id':identity,'label':str(row.get('label',identity))[:100],
                'vendor':row['vendor'],'platform':str(row.get('platform',''))[:64],
                'role':'bng','host':host,'ssh_port':port,'auth':'ad','enabled':bool(row.get('enabled',True))})
        return result

    def read(self):
        with self.lock:
            try: return self.validate(json.loads(self.path.read_text()))
            except (OSError,ValueError,TypeError): return []

    def save(self,rows):
        clean=self.validate(rows)
        with self.lock:
            self.path.parent.mkdir(parents=True,exist_ok=True)
            tmp=self.path.with_suffix('.tmp')
            tmp.write_text(json.dumps(clean,indent=2)+'\n')
            tmp.replace(self.path)
        return clean
