"""Split the legacy AIS speedtest into one start and read-only polling."""
import time
import uuid
from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_post import post_menu
from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_support_diagnostics import _session_value, _number

class NativeSpeedtest:
 def __init__(self,clock=time.monotonic):self.clock=clock;self.clear()
 def clear(self):self.servers=[];self.run=None
 def start(self,client,server_url):
  if self.run and (not self.run.get('complete') or self.run.get('uncertain')) and self.clock()-self.run['started']<120:raise RuntimeError('Já existe uma medição em andamento')
  if not self.servers:self.servers=client.native_speedtest_servers()['servers']
  selected=next((s for s in self.servers if s['url']==server_url),None)
  if selected is None:raise ValueError('Selecione um servidor retornado pelo equipamento')
  client.get_view('homePage',Menu3Location=0)
  run={'id':uuid.uuid4().hex,'started':self.clock(),'complete':False,'server':selected};self.run=run
  try:
   response=post_menu(client,'home_ais_lua.lua',[('IF_ACTION','SpeedtestDIAG'),('Url',selected['url'])],IF_ACTION='SpeedtestDIAG',Url=selected['url'])
   token=_session_value(response)
   if not token:raise RuntimeError('Start sem identificador')
   run['token']=token
   return {'run_id':run['id'],'status':'running','server':selected}
  except Exception:
   run.update(complete=True,uncertain=True)
   return {'run_id':run['id'],'status':'uncertain','uncertain':True,'message':'Start sem confirmação; não será reenviado.'}
 def poll(self,client,identity):
  run=self.run
  if not run or run['id']!=identity:raise ValueError('Medição não pertence à sessão atual')
  if run.get('result'):return run['result']
  if run.get('uncertain'):return {'run_id':identity,'status':'uncertain','uncertain':True}
  if self.clock()-run['started']>120:
   run['complete']=True;run['result']={'run_id':identity,'status':'timeout','uncertain':True};return run['result']
  client.get_view('homePage',Menu3Location=0)
  xml=client.get_menu('home_ais_lua.lua',IF_ACTION='SpeedtestGetDIAG',sessionId=run['token']);client._validar_resposta(xml)
  records=client._parse_instances(xml).get('OBJ_SPEEDTEST_DIAGNOSE_ID',[])
  latest=records[0] if len(records)==1 else {};state=str(latest.get('State') or '0')
  result={'run_id':identity,'status':'running' if state=='0' else 'finished','native_state':state,'download_mbps':_number(latest.get('DownRate')),'upload_mbps':_number(latest.get('UpRate')),'progress':_number(latest.get('Percntage')),'latency_ms':None,'server':run['server']}
  if state!='0':run['complete']=True;run['result']=result
  return result
