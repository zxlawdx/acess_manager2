"""Known protocol adapters consumed by operational configuration use cases."""
from __future__ import annotations
import hashlib
import json
import re
import secrets
import time
from urllib.parse import parse_qs, urlsplit
from ipaddress import ip_address
from apps.access_manager.infrastructure.operational_surfaces import F6201BSurfaces, label
from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_management as zm
from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_network_management as zn
from apps.access_manager.infrastructure.huawei.mapped_surface import HUAWEI_MAPPED_WRITES, _WRITE_FIELD_LABELS
from apps.access_manager.infrastructure.huawei.captured import parse_huawei_js_records, _record_domain
from apps.access_manager.infrastructure.huawei.mapped_surface import _input_values
from apps.access_manager.infrastructure.huawei.ipv4_filter import HuaweiIPv4FilterRule, _MUTABLE_FIELDS
from apps.access_manager.domain.redaction import redact_sensitive, _is_secret

BOOLS={'Enable','AllInterface','DefaultQueue','NeedStats','DaylightSavingsUsed','AutoSetTzname','NtpConfigPermission','MacFilterEnable','UrlFilterEnable'}
TITLES={'mode':'Modo','enabled':'Habilitado','wps_enabled':'WPS habilitado','isolation':'Isolamento','broadcast':'Broadcast','max_clients':'Máximo de clientes','frag_threshold':'Limite de fragmentação','band_steering_policy':'Política de steering','airtime_fairness':'Airtime fairness','auto_channel_scope':'Escopo do canal automático','start_hour':'Hora inicial','start_minute':'Minuto inicial','end_hour':'Hora final','end_minute':'Minuto final','new_password':'Nova senha administrativa','periodic_inform_enabled':'Inform periódico','periodic_inform_interval':'Intervalo inform (s)','connection_request_username':'Usuário connection request','connection_request_password':'Senha connection request','url':'URL ACS','default_wan':'Interface WAN padrão','support_cert_auth':'Autenticação por certificado','cert_id':'Certificado','remote_upgrade_cert_auth':'Certificado de upgrade','channel':'Canal','standard':'Padrão','country':'País','bandwidth':'Largura','beacon_interval':'Intervalo beacon','tx_power':'Potência','rts_cts':'RTS/CTS','dtim':'DTIM','mu_mimo':'MU-MIMO','downlink_mu_mimo':'MU-MIMO download','uplink_mu_mimo':'MU-MIMO upload','uplink_ofdma':'OFDMA upload','downlink_ofdma':'OFDMA download','twt':'TWT','spatial_reuse':'Spatial Reuse','qos_type':'Tipo QoS / WMM','work_mode':'Modo de operação','preamble_type':'Preâmbulo','auto_channel':'Canal automático','sgi':'SGI','NtpServer1':'Servidor NTP 1','NtpServer2':'Servidor NTP 2','NtpServer3':'Servidor NTP 3','NtpServer4':'Servidor NTP 4','NtpServer5':'Servidor NTP 5','CurrentLocalTime':'Hora local','DaylightSavingsUsed':'Horário de verão','PollTimeInterval':'Intervalo (s)','Dscp':'DSCP','ZoneIndex':'Fuso horário','AutoSetTzname':'Fuso automático','NtpConfigPermission':'Permissão NTP','SntpBindWanName':'Interface WAN','Alias':'Nome','InternalClient':'IP interno','ExternalPort':'Porta externa','ExternalPortEndRange':'Porta externa final','InternalPort':'Porta interna','InternalPortEndRange':'Porta interna final','RemoteHost':'Host remoto','RemoteHostEndRange':'Host remoto final','AllInterface':'Todas as interfaces','Protocol':'Protocolo','ViewName':'Nome da regra','INCViewName':'Interface de entrada','OUTCViewName':'Interface de saída','IPVersion':'Versão IP','SourceIP':'IP de origem','SourceIPMask':'Máscara de origem','MinSrcPort':'Porta de origem inicial','MaxSrcPort':'Porta de origem final','MinDstPort':'Porta de destino inicial','MaxDstPort':'Porta de destino final','FilterTarget':'Ação','FilterIndex':'Ordem da regra','SrcMacAddr':'MAC de origem','DstMacAddr':'MAC de destino','TrafficClasses':'Classes de tráfego','QueueInterface':'Interface da fila','DefaultQueue':'Fila padrão','NeedStats':'Estatísticas','SchedulerAlgorithm':'Escalonamento','Weight':'Peso','QueueNum':'Número da fila','ShapingRate':'Taxa de shaping','CommittedRate':'Taxa garantida','CommittedBurstSize':'Burst garantido','ExcessBurstSize':'Burst excedente','PeakRate':'Taxa de pico','PeakBurstSize':'Burst de pico','MeterType':'Tipo de medição','ConformingAction':'Ação dentro do limite','PartialConformingAction':'Ação parcial','NonConformingAction':'Ação fora do limite', 'MacFilterTarget':'Política MAC','MacFilterEnable':'Filtro MAC','UrlFilterTarget':'Política URL','UrlFilterEnable':'Filtro URL'}
NATIVE={
 'port_forwarding':(zn.PORT_FORWARD_SPEC,'Redirecionamento de portas','NAT',True),
 'sntp':(zm.SNTP_SPEC,'NTP / horário','Gerenciamento',False),
 'firewall_ip':(zm.IP_FILTER_SPEC,'Regras firewall IPv4 / IPv6','Segurança',True),
 'firewall_mac':(zm.MAC_FILTER_SPEC,'Regras MAC','Segurança',True),
 'filter_policy':(zm.FILTER_GLOBAL_SPEC,'Políticas de filtros','Segurança',False),
 'qos_queue':(zm.QOS_QUEUE_SPEC,'Filas QoS','QoS',True),
 'qos_shaper':(zm.QOS_SHAPER_SPEC,'Traffic shaping','QoS',True),
 'qos_policer':(zm.QOS_POLICER_SPEC,'Policers QoS','QoS',True),
}
# Firmware handlers pinned in references/firmware-evidence; each adapter still
# requires the actual authenticated XML object before allowing a proposal.
NATIVE.update({
 'alg':(zn.CrudSpec('alg','firewall_alg_lua.lua','OBJ_FWALG_ID',tuple('Is'+name+'Alg' for name in ('FTP','H323','IPSEC','L2TP','PPTP','RTSP','SIP','TFTP'))),'Protocolos ALG','NAT',False),
 'remote_ipv4':(zn.CrudSpec('localServiceCtrl','firewall_ipv4service_lua.lua','OBJ_FWSC_ID',('Name','Enable','INCViewName','MinSrcIp','MaxSrcIp','FilterTarget','ServiceList','IPMode')),'Acesso remoto IPv4','Gerenciamento',True),
 'remote_ipv6':(zn.CrudSpec('localServiceCtrl','firewall_ipv6service_lua.lua','OBJ_FWSCv6_ID',('Name','Enable','INCViewName','Prefix','PrefixLen','FilterTarget','ServiceList','IPMode')),'Acesso remoto IPv6','Gerenciamento',True),
 'telnet':(zn.CrudSpec('telnet','telnet_lua.lua','OBJ_TELNET_ID',('TS_Enable','Wan_Enable','Lan_Enable')),'Acesso Telnet LAN / WAN','Gerenciamento',False),
})
BOOLS.update({'TS_Enable','Wan_Enable','Lan_Enable',*NATIVE['alg'][0].fields})
TITLES.update({'TS_Enable':'Servidor Telnet','Wan_Enable':'Permitir pela WAN','Lan_Enable':'Permitir pela LAN','MinSrcIp':'IP de origem inicial','MaxSrcIp':'IP de origem final','Prefix':'Prefixo IPv6','PrefixLen':'Comprimento do prefixo','ServiceList':'Serviços','IPMode':'Família IP',**{key:key[2:-3]+' ALG' for key in NATIVE['alg'][0].fields}})
MAPPED={'speed_test':('speed_test','Teste de velocidade por seção','Diagnóstico'),'sntp_general':('sntp','NTP / sincronização','Gerenciamento'), 'sntp_dst':('sntp','Horário de verão','Gerenciamento'), 'dscp_to_pbit':('dscp_to_pbit','Mapeamento DSCP → P-bit','QoS'), 'wlan_mac_filter':('mac_filter','Política MAC Wi-Fi','Wi-Fi'), 'lan_service':('lan_service','Serviços LAN','Gerenciamento'), 'wan_config':('wan_config','Conexão WAN capturada','WAN')}


def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,default=str).encode()).hexdigest()

def validate(fields):
 for key,value in fields.items():
  if isinstance(value,(dict,list)) or len(str(value))>4096:raise ValueError('Valor de configuração inválido')
  if key in BOOLS and str(value) not in {'0','1','True','False'}:raise ValueError('Estado booleano inválido')
  if value and key in {'InternalClient','SourceIP','DestIP','IPAddress','Gateway6'}:ip_address(str(value))
  if value and key in {'ExternalPort','ExternalPortEndRange','InternalPort','InternalPortEndRange','MinSrcPort','MaxSrcPort','MinDstPort','MaxDstPort'}:
   if not str(value).isdigit() or not 0<=int(value)<=65535:raise ValueError('Porta inválida')
  if key=='new_password' and not str(value):raise ValueError('Nova senha não pode ficar vazia')
  if key in {'UserName','Password'} and any(c in str(value) for c in ('\n','\r','\x00')):raise ValueError('Credencial inválida')


class NativeGateway:
 def __init__(self,client,spec,crud):self.client,self.spec,self.crud=client,spec,crud
 @property
 def fields(self):return self.spec.fields
 def read(self):
  import xml.etree.ElementTree as ET
  self.client.get_view(self.spec.view,Menu3Location=0);xml=self.client.get_menu(self.spec.tag);self.client._validar_resposta(xml)
  root=ET.fromstring(xml)
  if root.tag!='ajax_response_xml_root' or root.find(self.spec.object_key) is None:raise RuntimeError('Objeto de configuração não retornado pelo firmware')
  return self.client._parse_instances(xml).get(self.spec.object_key,[])
 def write(self,identity,changes,action):
  gateway=zn.ThinkLuaCrudGateway(self.client)
  return gateway.delete(self.spec,identity) if action=='delete' else gateway.save(self.spec,values=changes,instance_id=None if action=='create' else identity)
 def verify(self,before,after,identity,desired,action):
  if action=='delete':return not any(r.get('_InstID')==identity for r in after)
  candidates=after if action=='create' else [r for r in after if r.get('_InstID')==identity]
  old={r.get('_InstID') for r in before}
  return any((action!='create' or r.get('_InstID') not in old) and all(str(r.get(k))==str(v) for k,v in desired.items()) for r in candidates)


class HuaweiMapped:
 def __init__(self,owner,operation,feature):self.owner,self.operation,self.feature=owner,operation,feature;self.spec=HUAWEI_MAPPED_WRITES[operation];self.crud=False
 @property
 def fields(self):return tuple(self.spec['fields'])
 def read(self):
  source=self.owner.client.get_page(self.spec['token_page']);records=parse_huawei_js_records(source);inputs=_input_values(source)
  domains={k:v[0] for k,v in parse_qs(urlsplit(self.spec['path']).query).items() if k in {'x','y','m','n'}}
  result={}
  for field in self.fields:
   if '.' not in field:
    if field in inputs:result[field]=inputs[field]
    continue
   prefix,name=field.split('.',1);domain=domains.get(prefix)
   matches=[r for r in records if domain and _record_domain(r)==domain]
   if len(matches)==1 and name in matches[0]:result[field]=('1' if matches[0][name] else '0') if type(matches[0][name]) is bool else matches[0][name]
  if not result:raise RuntimeError('Object model capturado não reconhecido nesta sessão')
  return [{'_InstID':'captured',**result}]
 def write(self,identity,changes,action):
  payload=dict(changes)
  # Undocumented scalar flags are not fabricated. Only explicit known-field
  # changes and fields observed in the exact captured object graph are sent.
  return self.owner.mapped.write_feature(self.operation,payload)
 def verify(self,before,after,identity,desired,action):
  return bool(after) and all(str(after[0].get(k))==str(v) for k,v in desired.items() if not _is_secret(k))


class HuaweiIPv4:
 fields=_MUTABLE_FIELDS;crud=True
 def __init__(self,owner):self.owner=owner
 def read(self):return [{'_InstID':r['domain'],**r} for r in self.owner.ipv4.list_ipv4_filters()['rules']]
 def write(self,identity,changes,action):
  if action=='delete':return self.owner.ipv4.delete_ipv4_filter(identity)
  rule=HuaweiIPv4FilterRule(domain='' if action=='create' else identity,**{k:str(v) for k,v in changes.items() if k in self.fields})
  return self.owner.ipv4.create_ipv4_filter(rule) if action=='create' else self.owner.ipv4.update_ipv4_filter(identity,rule)
 def verify(self,before,after,identity,desired,action):
  return NativeGateway.verify(self,before,after,identity,desired,action)


class OperationalConfigurations:
 def __init__(self,owner):self.owner=owner;self.f6201b=F6201BSurfaces();self.pending=None;self.clock=time.monotonic
 def clear(self):self.pending=None;self.f6201b.clear()
 def is_captured(self):return self.owner.vendor=='zte' and self.owner._is_f6201b()
 def catalog(self):
  if self.is_captured():return self.f6201b.catalog()+[{'id':'wifi_advanced','title':'Rádio avançado capturado','category':'Wi-Fi','read':True,'write':True,'evidence':'FIRMWARE_CONFIRMED','destructive':True}]
  if self.owner.vendor=='zte':return [{'id':key,'title':title,'category':group,'read':True,'write':True,'evidence':'SOURCE_CONFIRMED','physical_validation':'pending','destructive':True} for key,(_,title,group,_) in NATIVE.items()]+[{'id':key,'title':title,'category':group,'read':True,'write':True,'evidence':'SOURCE_CONFIRMED','destructive':True} for key,title,group in [('wan_crud','Conexões WAN','WAN'),('tr069_extended','TR-069 completo','Gerenciamento'),('admin_password','Senha administrativa','Gerenciamento'),('wifi_advanced','Rádio avançado','Wi-Fi'),('wps_native','WPS — Disabled / PBC','Wi-Fi'),('schedule_native','Agendamento Wi-Fi','Wi-Fi'),('steering_enable','Band steering habilitado','Wi-Fi'),('steering_parameters','Parâmetros de steering / RSSI','Wi-Fi'),('service_ports','Portas dos serviços administrativos','Gerenciamento')]]
  profile=self.owner.profile;features=profile.captured_features if profile else {}
  result=[{'id':key,'title':title,'category':group,'read':True,'write':True,'evidence':'FIRMWARE_CONFIRMED','physical_validation':'pending','destructive':True} for key,(feature,title,group) in MAPPED.items() if features.get(feature,{}).get('update')]
  if features.get('wifi_basic',{}).get('update'):result.append({'id':'ssid_advanced','title':'WPS, isolamento e associação','category':'Wi-Fi','read':True,'write':True,'evidence':'FIXTURE_VALIDATED','destructive':True})
  if features.get('wifi_radio',{}).get('update'):result.append({'id':'wifi_advanced','title':'Rádio avançado','category':'Wi-Fi','read':True,'write':True,'evidence':'FIXTURE_VALIDATED','destructive':True})
  if profile and profile.ipv4_filter.create:result.append({'id':'ipv4_filter','title':'Regras IPv4 de entrada','category':'Segurança','read':True,'write':True,'evidence':'FIXTURE_VALIDATED','physical_validation':'pending','destructive':True})
  return result
 def adapter(self,feature):
  if feature not in {r['id'] for r in self.catalog()}:raise ValueError('Configuração não mapeada para este runtime')
  if self.owner.vendor=='zte':
   if feature=='service_ports':return NativeServicePorts(self.owner._need())
   if feature=='wan_crud':return NativeWan(self.owner)
   if feature=='tr069_extended':return NativeTr069(self.owner)
   if feature=='admin_password':return NativeAccount(self.owner)
   if feature=='wifi_advanced':return NativeRadio(self.owner)
   if feature in {'wps_native','schedule_native','steering_enable','steering_parameters'}:return NativeWifiService(self.owner,feature)
   spec,_,_,crud=NATIVE[feature];return NativeGateway(self.owner._need(),spec,crud)
  if feature=='ssid_advanced':return HuaweiSSIDAdvanced(self.owner)
  if feature=='wifi_advanced':return HuaweiRadio(self.owner)
  if feature=='ipv4_filter':return HuaweiIPv4(self.owner)
  return HuaweiMapped(self.owner,feature,MAPPED[feature][0])
 def inspect(self,client,feature):
  if self.is_captured() and feature!='wifi_advanced':return self.f6201b.inspect(client,feature)
  a=self.adapter(feature);records=a.read();mapping={f'field_{i}':k for i,k in enumerate(a.fields)}
  if a.crud:records=[*records,{'_InstID':'new'}]
  result=[]
  for r in records:
   result.append({'id':r['_InstID'],'label':r.get('Alias') or r.get('Name') or r.get('name') or ('Nova regra' if r['_InstID']=='new' else f'Configuração {len(result)+1}'),
     'actions':['create'] if r['_InstID']=='new' else ['update','delete'] if a.crud else ['update'],
     'fields':[{'key':key,'label':_WRITE_FIELD_LABELS.get(raw,TITLES.get(raw,label(raw))),'secret':_is_secret(raw),'value':None if _is_secret(raw) else r.get(raw),
      'options':self._options(a,raw,r), 'select':raw in {'channel','standard','country','bandwidth','tx_power'}} for key,raw in mapping.items() if raw in r or a.crud],
     'missing':[TITLES.get(k,label(k)) for k in a.fields if k not in r] if r['_InstID']!='new' else [],'ready':True})
  return {'feature':feature,'available':True,'instances':result}
 def _options(self,adapter,raw,row):
  if raw in BOOLS or raw in RF_BOOLS or raw in {'enabled','wps_enabled','isolation','broadcast','airtime_fairness'} or raw.endswith('.Enable'):return [{'value':'0','label':'Não'},{'value':'1','label':'Sim'}]
  if isinstance(adapter,NativeRadio) and raw in {'channel','standard','country','bandwidth','tx_power'}:
   return adapter.options.get(raw,[])
  if isinstance(adapter,NativeWifiService) and adapter.kind=='wps_native':return [{'value':'Disabled','label':'Desativado'},{'value':'PBC','label':'PBC'}]
  return []
 def preview(self,client,host,feature,instance,changes,action='update'):
  self.pending=None;self.f6201b.clear()
  if self.is_captured() and feature!='wifi_advanced':
   if action!='update':raise ValueError('A captura comprova Apply; Add/Delete não são inferidos')
   return self.f6201b.preview(client,host,feature,instance,changes)
  a=self.adapter(feature);records=a.read();mapping={f'field_{i}':k for i,k in enumerate(a.fields)}
  if action not in (['update','create','delete'] if a.crud else ['update']):raise ValueError('Ação desconhecida')
  if set(changes)-set(mapping):raise ValueError('Campo fora do formulário')
  targets=[r for r in records if r.get('_InstID')==instance]
  if action!='create' and len(targets)!=1:raise ValueError('Selecione uma instância atual')
  original=targets[0] if targets else {};desired={k:v for k,v in original.items() if k in a.fields};clean={mapping[k]:v for k,v in changes.items()}
  validate(clean);desired.update(clean)
  if isinstance(a,NativeServicePorts) and 'ServPort' in clean:
   if not str(clean['ServPort']).isdigit() or not 1<=int(clean['ServPort'])<=65535:raise ValueError('Porta administrativa inválida')
  if isinstance(a,NativeRadio):
   if set(clean)-set(original):raise ValueError('O rádio não retornou o campo solicitado')
   a.preflight(instance,clean)
  if isinstance(a,NativeWifiService) and a.kind=='wps_native' and clean.get('mode') not in {'Disabled','PBC'}:raise ValueError('Writer WPS comprova somente Disabled/PBC')
  if action!='delete' and not clean:raise ValueError('Nenhuma alteração selecionada')
  if isinstance(a,NativeGateway) and action!='delete' and set(a.fields)-set(desired):raise ValueError('Formulário incompleto; campos atuais ausentes')
  if isinstance(a,HuaweiMapped):
   # A WAN secret not observable from the firmware must be provided explicitly,
   # never guessed, replaced with asterisks, or recovered from UI cache.
   missing=[k for k in a.fields if k not in desired]
   if missing:raise ValueError('Campos capturados não retornados: '+', '.join(_WRITE_FIELD_LABELS.get(k,label(k)) for k in missing))
   for k,v in desired.items():
    if _is_secret(k) and (not v or str(v).startswith(('***','••'))):raise ValueError('Informe a credencial necessária para preservar o formulário WAN')
  nonce=secrets.token_urlsafe(24);self.pending={'feature':feature,'id':instance,'action':action,'changes':clean,'desired':desired,'fingerprint':digest(records),'nonce':nonce,'created':self.clock(),'host':host}
  return {'feature':feature,'nonce':nonce,'expires_in_seconds':120,'impact_warning':True,'changes':[{'field':_WRITE_FIELD_LABELS.get(k,TITLES.get(k,label(k))),'before':'••••' if _is_secret(k) else original.get(k),'after':'•••• (alterado)' if _is_secret(k) else v} for k,v in clean.items()]+([{'field':'Operação','before':'Configuração selecionada','after':{'create':'Criar','delete':'Excluir'}.get(action,action)}] if action!='update' else [])}
 def apply(self,client,host,nonce,confirmation):
  if self.is_captured() and self.pending is None:return self.f6201b.apply(client,host,nonce,confirmation)
  p=self.pending;self.pending=None
  if confirmation!='APLICAR':raise ValueError('Digite APLICAR para confirmar')
  if not p or not secrets.compare_digest(p['nonce'],str(nonce)) or p['host']!=host or self.clock()-p['created']>120:raise ValueError('Prévia expirada ou já utilizada')
  a=self.adapter(p['feature']);before=a.read()
  if digest(before)!=p['fingerprint']:raise RuntimeError('Configuração alterada desde a prévia')
  try:
   wanted=p['changes'] if getattr(a,'writes_changes_only',False) else p['desired']
   outcome=a.write(p['id'],wanted,p['action'])
  except Exception as error:return {'success':False,'verified':False,'uncertain':True,'detail':'Mutation sem confirmação; não será repetida.','error_type':type(error).__name__}
  if outcome.get('success') is False and not outcome.get('accepted'):return {'success':False,'verified':False,'uncertain':bool(outcome.get('uncertain')),'detail':'Equipamento não confirmou a operação.'}
  try:
   after=a.read();verified=a.verify(before,after,p['id'],p['desired'],p['action']);manual=any(_is_secret(k) for k in p['changes'])
   return {'success':verified,'verified':verified and not manual,'uncertain':not verified,'manual_verification':manual,'detail':'Readback confirmado.' if verified and not manual else 'Confirme a nova credencial por autenticação.' if verified else 'Readback não confirmou; não reenviar automaticamente.'}
  except Exception:return {'success':False,'verified':False,'uncertain':True,'detail':'Readback indisponível; não reenviar automaticamente.'}

class NativeWan:
 fields=tuple(zm._WAN_API_MAP);crud=True;writes_changes_only=True
 def __init__(self,owner):self.owner=owner
 def read(self):return [{'_InstID':r['_InstID'],**{key:r.get(raw) for key,raw in zm._WAN_API_MAP.items() if raw in r}} for r in self.owner._need().wan_configurations()]
 def write(self,identity,changes,action):
  c=self.owner._need()
  return c.delete_wan(identity) if action=='delete' else c.create_wan(changes) if action=='create' else c.update_wan(identity,changes)
 def verify(self,before,after,identity,desired,action):return NativeGateway.verify(self,before,after,identity,{k:v for k,v in desired.items() if not _is_secret(k)},action)

TR_MAP={'url':'URL','username':'UserName','password':'UserPassword','connection_request_password':'ConnectionRequestPassword','periodic_inform_enabled':'PeriodicInformEnable','periodic_inform_interval':'PeriodicInformInterval','connection_request_username':'ConnectionRequestUsername','default_wan':'DefaultWan','support_cert_auth':'SupportCertAuth','cert_id':'CertID','remote_upgrade_cert_auth':'RemoteUpgradeCertAuth'}
class NativeTr069:
 fields=tuple(TR_MAP);crud=False;writes_changes_only=True
 def __init__(self,owner):self.owner=owner
 def read(self):
  data=self.owner._need().tr069_management_status()
  if not data.get('available'):raise RuntimeError('Objeto TR-069 ausente')
  row=data['server'];return [{'_InstID':row.get('_InstID') or 'acs',**{k:row[raw] for k,raw in TR_MAP.items() if raw in row}}]
 def write(self,identity,changes,action):return self.owner._need().set_tr069_management(changes)
 def verify(self,before,after,identity,desired,action):return bool(after) and all(str(after[0].get(k))==str(v) for k,v in desired.items() if not _is_secret(k))

class NativeAccount:
 fields=('new_password',);crud=False;writes_changes_only=True
 def __init__(self,owner):self.owner=owner
 def read(self):
  current=[r for r in self.owner._need().account_status() if r.get('current')]
  if len(current)!=1:raise RuntimeError('Conta autenticada não identificada')
  return [{'_InstID':current[0]['id'],'new_password':None}]
 def write(self,identity,changes,action):return self.owner._need().change_admin_password(changes['new_password'])
 def verify(self,before,after,identity,desired,action):return bool(after) and after[0]['_InstID']==identity

RF_MAP={'channel':'Channel','standard':'Standard','country':'CountryCode','bandwidth':'BandWidth','sgi':'SGIEnabled','beacon_interval':'BeaconInterval','tx_power':'TxPower','rts_cts':'RtsCts','dtim':'DTIM','mu_mimo':'MUMIMOEnable','downlink_mu_mimo':'DownLinkMUMIMO','uplink_mu_mimo':'UPLinkMUMIMO','uplink_ofdma':'UPLinkOFDMA','downlink_ofdma':'DownLinkOFDMA','twt':'TWTSupport','spatial_reuse':'SpatialReuse','ssid_isolation':'SSIDIsolationEnable','qos_type':'QosType','work_mode':'WorkMode','preamble_type':'PreambleType','auto_channel':'AutoChannelEnabled'}
RF_BOOLS={'sgi','mu_mimo','downlink_mu_mimo','uplink_mu_mimo','uplink_ofdma','downlink_ofdma','twt','spatial_reuse','ssid_isolation','auto_channel'}
class NativeRadio:
 fields=tuple(RF_MAP);crud=False;writes_changes_only=True
 def __init__(self,owner):
  self.owner=owner;self.parsed=None;self.raw=None;self.options={}
  if owner._is_f6201b():
   from apps.access_manager.infrastructure.zte.f6201b.f6201b_evidence import OBSERVED_APPLY_FIELDS
   self.fields=tuple(k for k,raw in RF_MAP.items() if raw in OBSERVED_APPLY_FIELDS['wlan_wlanbasicadconf_lua.lua'])
 def read(self):
  from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_wlan_channel_configuration as rf
  client=self.owner._need();xml=rf.get_channel(client);client._validar_resposta(xml);self.parsed=client._parse_instances(xml);self.raw=self.parsed.get('OBJ_WLANSETTING_ID',[])
  if not self.raw:raise RuntimeError('Objeto de rádio não reconhecido')
  from apps.access_manager.infrastructure.radio_options import radio_options
  self.options=radio_options(client.get_view('wlanBasic',Menu3Location=0))
  return [{'_InstID':r['_InstID'],**{k:r[raw] for k,raw in RF_MAP.items() if raw in r and k in self.fields}} for r in self.raw]
 def preflight(self,identity,changes):
  if not self.owner._is_f6201b():return
  from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_wlan_channel_configuration as rf
  from apps.access_manager.infrastructure.zte.f6201b.f6201b_evidence import OBSERVED_APPLY_FIELDS
  from apps.access_manager.infrastructure.zte.f6201b.f6201b_writes import EXACT_FIRMWARE
  raw=next(r for r in self.raw if r['_InstID']==identity);target=dict(raw)
  if target.get('AutoChRange') in (None,'') and self.owner.firmware==EXACT_FIRMWARE:target['AutoChRange']='0'
  config={k:(str(v)=='1') if k in RF_BOOLS else v for k,v in changes.items()}
  rf._apply_standard(target,raw['Band'],config);rf._apply_channel(self.parsed,target,raw['Band'],config);rf._apply_advanced(target,config)
  missing=[k for k in OBSERVED_APPLY_FIELDS['wlan_wlanbasicadconf_lua.lua'] if k not in {'IF_ACTION','_InstID','_sessionTOKEN'} and target.get(k) is None]
  if missing:raise ValueError('Formulário RF não retornou todos os campos capturados')
 def write(self,identity,changes,action):
  from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_wlan_channel_configuration as rf
  raw=next(r for r in self.raw if r['_InstID']==identity);config={k:(str(v)=='1') if k in RF_BOOLS else v for k,v in changes.items()}
  if not self.owner._is_f6201b():return self.owner._need().set_radio_config(raw['Band'],config)
  from apps.access_manager.infrastructure.zte.f6201b.f6201b_evidence import OBSERVED_APPLY_FIELDS
  from apps.access_manager.infrastructure.zte.f6201b.f6201b_writes import EXACT_FIRMWARE
  from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_post import post_menu
  target=dict(raw)
  if target.get('AutoChRange') in (None,'') and self.owner.firmware==EXACT_FIRMWARE:target['AutoChRange']='0'
  rf._apply_standard(target,raw['Band'],config);rf._apply_channel(self.parsed,target,raw['Band'],config);rf._apply_advanced(target,config)
  target.update(IF_ACTION='Apply',_InstID=identity)
  schema=OBSERVED_APPLY_FIELDS['wlan_wlanbasicadconf_lua.lua'];missing=[k for k in schema if k!='_sessionTOKEN' and k not in target]
  if missing:raise ValueError('Formulário RF completo não retornado: '+', '.join(label(k) for k in missing))
  self.owner._need().get_view('wlanBasic',Menu3Location=0)
  xml=post_menu(self.owner._need(),'wlan_wlanbasicadconf_lua.lua',[(k,target[k]) for k in schema if k!='_sessionTOKEN']);self.owner._need()._validar_resposta(xml);return {'success':True}
 def verify(self,before,after,identity,desired,action):
  expected={k:v for k,v in desired.items() if not (k=='channel' and str(desired.get('auto_channel'))=='1')}
  return NativeGateway.verify(self,before,after,identity,expected,action)

class HuaweiRadio:
 fields=('beacon_interval','rts_cts','dtim','frag_threshold','band_steering_policy','airtime_fairness','auto_channel_scope')
 crud=False;writes_changes_only=True
 def __init__(self,owner):self.owner=owner
 def read(self):return [{'_InstID':r['banda'],**{k:('1' if r[k] else '0') if type(r[k]) is bool else r[k] for k in self.fields if r.get(k) is not None}} for r in self.owner.get_wifi_radios()]
 def write(self,identity,changes,action):
  config=dict(changes)
  if 'airtime_fairness' in config:config['airtime_fairness']=str(config['airtime_fairness'])=='1'
  return self.owner.captured.set_radio_config(identity,config)
 def verify(self,before,after,identity,desired,action):return NativeGateway.verify(self,before,after,identity,desired,action)

class NativeWifiService:
 crud=False;writes_changes_only=True
 def __init__(self,owner,kind):
  self.owner,self.kind=owner,kind
  from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_advanced import BAND_STEERING_API_MAP
  self.fields=('mode',) if kind=='wps_native' else ('enabled','start_hour','start_minute','end_hour','end_minute') if kind=='schedule_native' else ('enabled',) if kind=='steering_enable' else tuple(BAND_STEERING_API_MAP)
 def read(self):
  c=self.owner._need()
  if self.kind=='wps_native':return [{'_InstID':r['id'],'mode':r['mode'],'band':r['band']} for r in c.wps_status() if r.get('id') and r.get('band')]
  if self.kind=='schedule_native':
   d=c.wifi_schedule_status()
   if not d.get('radios') or not d.get('schedule'):raise RuntimeError('Timer de rádio não retornado')
   return [{'_InstID':'schedule','enabled':'1' if d['enabled'] else '0',**d['schedule']}]
  d=c.band_steering_status()
  if not d.get('available'):raise RuntimeError('Band steering não retornado')
  return [{'_InstID':d['id'] if self.kind=='steering_enable' else d['parameter_id'],**({'enabled':'1' if d['enabled'] else '0'} if self.kind=='steering_enable' else d['parameters'])}]
 def write(self,identity,changes,action):
  c=self.owner._need()
  if self.kind=='wps_native':
   row=next(r for r in self.read() if r['_InstID']==identity);return c.set_wps(row['band'],changes['mode'])
  if self.kind=='schedule_native':
   current=self.read()[0];config={k:current[k] for k in self.fields if k in current};config.update(changes);config['enabled']=str(config['enabled'])=='1';return c.set_wifi_schedule(config)
  if self.kind=='steering_enable':return c.set_band_steering(str(changes['enabled'])=='1')
  return c.configure_band_steering(changes)
 def verify(self,before,after,identity,desired,action):return NativeGateway.verify(self,before,after,identity,desired,action)

class HuaweiSSIDAdvanced:
 fields=('wps_enabled','isolation','broadcast','max_clients');crud=False;writes_changes_only=True
 def __init__(self,owner):self.owner=owner
 def read(self):return [{'_InstID':r['id'],'wps_enabled':'1' if r['wps_enabled'] else '0','isolation':'1' if r['isolamento'] else '0','broadcast':'1' if r['broadcast'] else '0','max_clients':r['max_clientes']} for r in self.owner.get_wifi_networks()]
 def write(self,identity,changes,action):return self.owner.set_ssid_config(identity,{k:str(v)=='1' if k in {'wps_enabled','isolation','broadcast'} else v for k,v in changes.items()})
 def verify(self,before,after,identity,desired,action):return NativeGateway.verify(self,before,after,identity,desired,action)


class NativeServicePorts(NativeGateway):
 # The handler requires all visible instances in one indexed vector. It does
 # not accept a scalar ManagerOBJ body; preserve each unmodified service.
 def __init__(self, client):
  super().__init__(client,zn.CrudSpec('localServiceCtrl','firewall_portservice_lua.lua','OBJ_FW_SERVPORT_ID',('ServPort',)),False)
 def read(self):
  rows=super().read()
  if not rows or any(not r.get('_InstID') or r.get('ServName') not in {'HTTP','HTTPS','FTP','SSH','TELNET'} or not str(r.get('ServPort','')).isdigit() for r in rows):raise RuntimeError('Vetor de portas administrativas não reconhecido')
  if len({r['_InstID'] for r in rows})!=len(rows):raise RuntimeError('Instâncias administrativas ambíguas')
  return rows
 def write(self,identity,changes,action):
  from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_post import post_menu
  rows=self.read();fields=[('IF_ACTION','Apply'),('_InstNum',str(len(rows)))]
  for i,row in enumerate(rows):
   port=changes['ServPort'] if row['_InstID']==identity else row['ServPort']
   fields.extend([(f'_InstID_{i}',row['_InstID']),(f'ServName_{i}',row['ServName']),(f'ServPort_{i}',str(port))])
  self.client._validar_resposta(post_menu(self.client,self.spec.tag,fields))
  return {'success':True,'accepted':True}
