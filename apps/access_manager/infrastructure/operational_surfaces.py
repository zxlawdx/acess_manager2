"""Operational use cases for preserved, whitelisted router forms.

UI identifiers are independent of firmware paths. Device forms are never
submitted from an arbitrary browser payload; preview owns the pending command.
"""
from __future__ import annotations
import re
import uuid
from apps.access_manager.infrastructure.zte.f6201b.f6201b_workbench import CapturedFormWorkbench, STRATEGIES
from apps.access_manager.infrastructure.zte.f6201b.f6201b_full_forms import FORM_SPECS, PRIVATE, _BOOLEANS

F6201B_FEATURES = {
 'wps': ('wlan_wps_lua.lua', 'WPS', 'Wi-Fi'),
 'wan_connection': ('wan_internet_lua.lua', 'Conexão WAN / PPPoE / IPv6', 'WAN'),
 'static_route': ('route_routestaticipv4_lua.lua', 'Rota IPv4', 'WAN'),
 'dhcp_ipv4': ('Localnet_LanMgrIpv4_DHCPBasicCfg_lua.lua', 'DHCP IPv4', 'LAN / DHCP'),
 'dhcp_source': ('Localnet_LanDevDHCPSource_lua.lua', 'Origem DHCP por porta', 'LAN / DHCP'),
 'dhcp_ipv6': ('dhcp6s_dhcpserver_lua.lua', 'DHCP IPv6', 'LAN / DHCP'),
 'router_advertisement': ('ra_raservice_lua.lua', 'Router Advertisement', 'LAN / DHCP'),
 'ipv6_ports': ('radhcp6s_portctrl_lua.lua', 'DHCPv6 e RA por porta', 'LAN / DHCP'),
 'lan_port': ('eth_interface_config_lua.lua', 'Porta LAN', 'LAN / DHCP'),
 'wifi_schedule': ('wlan_wlanbasiconoff_lua.lua', 'Rádios e agendamento', 'Wi-Fi'),
 'wifi_acl': ('wlan_macfilteraclpolicy_lua.lua', 'Políticas de acesso Wi-Fi', 'Wi-Fi'),
 'mesh_roaming': ('Localnet_NetSphere_Mode_lua.lua', 'Mesh e roaming NetSphere', 'Wi-Fi'),
 'tr069': ('tr069_remotemgr_lua.lua', 'TR-069 / ACS', 'Gerenciamento'),
 'dmz': ('firewall_dmz_lua.lua', 'DMZ', 'Segurança'),
 'bpdu': ('bpdu_lua.lua', 'BPDU', 'LAN / DHCP'),
 'upnp': ('upnp_upnp_lua.lua', 'UPnP', 'Segurança'),
 'default_route': ('route_routedefault_lua.lua', 'Rota padrão', 'WAN'),
 'lan_ipv6': ('addr6_lanaddr_lua.lua', 'Endereço LAN IPv6', 'LAN / DHCP'),
 'band_steering': ('wlan_BandSteering_lua.lua', 'Band steering', 'Wi-Fi'),
 'firewall_global': ('firewall_config_lua.lua', 'Firewall global', 'Segurança'),
 'alg': ('firewall_alg_lua.lua', 'ALG', 'Segurança'),
}
LABELS = {
 'Enable':'Habilitado','WPSMode':'Modo WPS','WPSChoose':'Ação WPS','WANCName':'Nome da conexão','ServList':'Serviços',
 'MTU':'MTU','linkMode':'Modo do link','TransType':'Tipo de transporte','UserName':'Usuário','Password':'Senha',
 'AuthType':'Autenticação','ConnTrigger':'Acionamento da conexão','IpMode':'Modo IP','Addressingtype':'Endereçamento',
 'IsNAT':'NAT habilitado','IPv6AcquireMode':'Aquisição IPv6','Gua1':'Endereço IPv6','Gua1PrefixLen':'Prefixo IPv6',
 'Gateway6':'Gateway IPv6','Pd':'Prefixo delegado','PdLen':'Tamanho do prefixo delegado','Dns1v6':'DNS IPv6 primário',
 'Dns2v6':'DNS IPv6 secundário','Dns3v6':'DNS IPv6 adicional','IsPD':'Delegação de prefixo','IsSLAAC':'SLAAC',
 'IsGUA':'Endereço global IPv6','IsPdAddr':'Endereço por prefixo delegado','VlanEnable':'VLAN habilitada','VLANID':'VLAN',
 'Priority':'Prioridade','DestIP':'Destino IPv4','DestIPMask':'Máscara do destino','GWIP':'Gateway IPv4','Type':'Tipo',
 'Alias':'Nome','Interface':'Interface','ServerEnable':'Servidor DHCP','MinAddress':'Início do pool','MaxAddress':'Fim do pool',
 'LeaseTime':'Lease (segundos)','DNSServer1':'DNS primário','DNSServer2':'DNS secundário','DnsServerSource':'Origem DNS',
 'DomainName':'Domínio','IPRouters':'Gateway DHCP','IANAEnable':'Atribuição de endereço IPv6','IsPrefixAutoMode':'Prefixo automático',
 'ManualDNSEnable':'DNS manual','DNSAddr1':'DNS IPv6 primário','DNSAddr2':'DNS IPv6 secundário','DNSAddr3':'DNS IPv6 adicional',
 'Ipv6DnsOrigin':'Origem DNS IPv6','DnsRefreshTime':'Atualização DNS (s)','AdvLinkMTUEnable':'Anunciar MTU',
 'S_AdvLinkMTU':'MTU anunciado','AdvPreferredRouterFlag':'Preferência de roteador','MinRtrAdvInterval':'Intervalo mínimo (s)',
 'MaxRtrAdvInterval':'Intervalo máximo (s)','AdvManagedFlag':'Gerenciamento de endereço','AdvOtherConfigFlag':'Outras configurações',
 'PrefixMode':'Modo do prefixo','Autoneg':'Autonegociação','MaxBitRate':'Velocidade máxima','DuplexMode':'Duplex','ModType':'Modo da porta',
 'RadioStatus':'Rádio habilitado','TimerEnable':'Agendamento habilitado','TimeStartHour':'Hora inicial','TimeStartMin':'Minuto inicial',
 'TimeEndHour':'Hora final','TimeEndMin':'Minuto final','RadioStatus_0':'Rádio 2.4 GHz','RadioStatus_1':'Rádio 5 GHz',
 'EnLegacyStaRoam':'Roaming de clientes','RoamRssiLmt24G':'Limite RSSI 2.4 GHz','RoamRssiLmt5G':'Limite RSSI 5 GHz',
 'DefaultWan':'Interface WAN padrão','URL':'URL ACS','UserPassword':'Senha ACS','ConnectionRequestUsername':'Usuário de connection request',
 'ConnectionRequestPassword':'Senha de connection request','PeriodicInformEnable':'Inform periódico','PeriodicInformInterval':'Intervalo inform (s)',
 'SupportCertAuth':'Autenticação por certificado','select_CertID':'Certificado','RemoteUpgradeCertAuth':'Certificado de atualização remota',
 'WANCViewName':'Interface WAN','InternalClient':'IP do cliente','BPDUEnable':'BPDU habilitado','EnableUPnPIGD':'UPnP habilitado',
 'ADPeriod':'Período de anúncio','TTL':'TTL','DefRTInterface':'Interface da rota padrão','IPAddress':'Endereço IP',
 'BsEnable':'Band steering habilitado','BsRssiLmt24G':'Limite RSSI 2.4 GHz','BsRssiLmt5G':'Limite RSSI 5 GHz',
 'BsBounceDwellTimeLmt':'Intervalo de permanência','BsTPLimit':'Limite de throughput','Level':'Nível',
 **{f'Is{x}Alg':f'ALG {x.upper()}' for x in ('FTP','H323','IPSEC','L2TP','PPTP','RTSP','SIP','TFTP')},
}


def label(field):
 if field in LABELS:return LABELS[field]
 for prefix,title in [('ProcFlag_','Origem DHCP — porta'),('AllowDHCP6S_','DHCPv6 — porta'),('AllowRA_','RA — porta'),('ACLPolicy_','Política ACL — SSID')]:
  if field.startswith(prefix):return f'{title} {int(field[len(prefix):])+1}'
 return re.sub(r'(?<!^)(?=[A-Z][a-z])',' ',field).replace('_',' ')


def field_map(tag):
 spec=FORM_SPECS.get(tag) or STRATEGIES[tag]
 return {f'field_{i}':raw for i,raw in enumerate(spec.editable)}


class F6201BSurfaces:
 def __init__(self):
  self.workbench=CapturedFormWorkbench();self.revision=uuid.uuid4().hex;self.pending_feature=None
 def clear(self):
  self.workbench.clear();self.revision=uuid.uuid4().hex;self.pending_feature=None
 def catalog(self):
  return [{'id':key,'title':title,'category':group,'read':True,'write':True,'evidence':'FIXTURE_VALIDATED','physical_validation':'pending','destructive':bool((FORM_SPECS.get(tag) or STRATEGIES[tag]).dangerous)} for key,(tag,title,group) in F6201B_FEATURES.items()]
 def _tag(self,feature):
  if feature not in F6201B_FEATURES:raise ValueError('Configuração desconhecida')
  return F6201B_FEATURES[feature][0]
 def inspect(self,client,feature):
  tag=self._tag(feature);mapping=field_map(tag);spec=FORM_SPECS.get(tag) or STRATEGIES[tag]
  data=self.workbench.inspect(client,tag);instances=[]
  for row in data.get('instances') or []:
   fields=[]
   for key,raw in mapping.items():
    if raw not in row.get('current',{}):continue
    private=raw in PRIVATE or raw in getattr(spec,'secrets',())
    boolean=raw in _BOOLEANS or raw.startswith(('AllowDHCP6S_','AllowRA_')) or (raw.startswith('Is') and raw.endswith('Alg')) or raw in ('BsEnable','BPDUEnable')
    metadata={}
    if feature=='wan_connection':
     from apps.access_manager.infrastructure.configuration_adapters import NativeWan
     from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_management import _WAN_API_MAP
     intent=next((k for k,v in _WAN_API_MAP.items() if v==raw),None)
     if intent:metadata=NativeWan.field_spec(intent,{'vlan_enabled':row['current'].get('VlanEnable')})
    fields.append({**metadata,'key':key,'label':label(raw),'value':None if private else row['current'][raw],
      'secret':private,'options':[{'value':'0','label':'Não'},{'value':'1','label':'Sim'}] if boolean else []})
   instances.append({'id':row['id'],'label':f'Configuração {len(instances)+1}','fields':fields,
     'ready':row.get('ready',not row.get('missing')),'missing':[label(k) for k in row.get('missing') or []]})
  return {'feature':feature,'available':data.get('available',False),'instances':instances}
 def preview(self,client,host,feature,instance,changes):
  tag=self._tag(feature);mapping=field_map(tag)
  if set(changes)-set(mapping):raise ValueError('Campo desconhecido')
  self.pending_feature=None
  result=self.workbench.preview(client,tag=tag,instance_id=instance,changes={mapping[k]:v for k,v in changes.items()},host=host,revision=self.revision,attendant='access-manager')
  self.pending_feature=feature
  return {'feature':feature,'nonce':result['nonce'],'expires_in_seconds':result['expires_in_seconds'],'impact_warning':result.get('impact_warning',True),
    'changes':[{'field':label(k),**v} for k,v in result['diff'].items()]}
 def apply(self,client,host,nonce,confirmation):
  if confirmation!='APLICAR':
   self.clear();raise ValueError('Digite APLICAR para confirmar a prévia')
  feature=self.pending_feature;self.pending_feature=None
  result=self.workbench.apply(client,host=host,revision=self.revision,attendant='access-manager',nonce=nonce,confirmation=confirmation,risk_ack=True,original_post=client.session.post)
  return {k:v for k,v in {**result,'feature':feature}.items() if k not in {'tag','instance_id','verified_fields','manual_verification_fields'}}
