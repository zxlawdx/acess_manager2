"""Two explicit HG8245H authentication-family reboot flows from the legacy."""

def supported(client,model):
 return str(model or '').upper()=='HG8245H' and str(getattr(client,'auth_flow','')) in {'rand_count','api_ses_token'}

def reboot(client,model):
 if not supported(client,model):raise RuntimeError('Reboot writer not mapped for this authentication/runtime family')
 if str(client.auth_flow)=='rand_count':
  page='/html/ssmp/reset/reset.asp';token=client.extract_token(client.get_page(page))
  path='/html/ssmp/reset/set.cgi?x=InternetGatewayDevice.X_HW_DEBUG.SMP.DM.ResetBoard&RequestFile=html/ssmp/reset/reset.asp'
  try:result=client.session.post(client.url(path),data={'x.X_HW_Token':token},headers={'Referer':client.url(page)},timeout=client.timeout,allow_redirects=False)
  except Exception:return {'success':False,'uncertain':True,'submitted':True,'message':'Reboot sem confirmação; não será repetido.'}
  return {'success':result.status_code in {200,204},'verified':False,'uncertain':True,'submitted':True,'message':'Confirme pela queda e retorno do equipamento.'}
 token=client.session.headers.get('__RequestVerificationToken') or getattr(client,'_session_token',None)
 if not token:raise RuntimeError('Token API atual não disponível')
 try:
  response=client.session.post(client.url('/api/system/reboot'),data='<?xml version="1.0" encoding="UTF-8"?><request><Reboot>1</Reboot></request>',headers={'Content-Type':'text/xml','__RequestVerificationToken':str(token),'Referer':client.base_url+'/html/index.html'},timeout=client.timeout,allow_redirects=False)
  accepted=response.status_code in {200,204} and '<error' not in str(response.text).lower() and '<html' not in str(response.text).lower()
  return {'success':accepted,'accepted':accepted,'verified':False,'uncertain':True,'submitted':True,'message':'Reboot solicitado uma vez; confirme retorno da sessão.'}
 except Exception:return {'success':False,'uncertain':True,'submitted':True,'message':'Reboot sem confirmação; não será repetido.'}
