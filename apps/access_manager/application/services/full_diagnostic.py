"""Provider-neutral diagnostic dashboard using existing query/command buses."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import nullcontext
from datetime import datetime, timezone, timedelta
from threading import Lock
import csv
import io
import math
import time
import requests

DEFAULTS = {'target':'1.1.1.1','hostname':'cloudflare.com','http_url':'https://www.cloudflare.com/cdn-cgi/trace'}
TESTS = ('ping','dns','http','gateway','internet')

def numeric(v):
    try:
        n=float(v)
        return n if math.isfinite(n) else None
    except (TypeError,ValueError): return None

def rssi_quality(value):
    n=numeric(value)
    if n is None:return None
    return next((label for bound,label in [(-50,'Excelente'),(-60,'Muito bom'),(-67,'Bom'),(-75,'Regular')] if n>=bound),'Fraco')

def build_alerts(result):
    alerts=[]
    loss=result.get('packet_loss_percent')
    rssi=result.get('wifi_quality',{}).get('avg_rssi')
    if loss is not None and loss>2:alerts.append({'level':'warning','title':'Perda de pacotes elevada','detail':f'{loss:g}% no ping desta execução (regra: > 2%).'})
    if rssi is not None and rssi < -75:alerts.append({'level':'warning','title':'Sinal Wi-Fi fraco','detail':f'RSSI médio {rssi:g} dBm (regra: < -75 dBm).'})
    for row in result.get('connectivity',[]):
        if row['status']=='failure':alerts.append({'level':'failure','title':row['label']+' sem resposta','detail':'Falha no teste '+row['origin']+'; não classifica os outros caminhos.'})
    return alerts

# Whitelisting avoids leaking secrets even inside unstructured native output.
def select(data, keys):return {k:data[k] for k in keys if k in data}
def safe_sections(sections):
    schemas={'system':('model','manufacturer','firmware','serial','uptime_seconds','cpu_percent','memory_percent','temperature_c','storage_percent'), 'wan':('name','status','ipv4','ipv6','gateway','dns','vlan'), 'radios':('band','banda','channel','canal','bandwidth','largura','standard','padrao','tx_power','potencia','country','pais','enabled','radio_ativo'), 'wifi':('id','ssid','band','banda','enabled','ativo','broadcast'), 'clients':('hostname','name','ip','ipv4','mac','connection_type','band','ssid','rssi','snr'), 'lan':('port','name','link_state','speed'), 'dhcp':('enabled','lan_ip','mask','pool_start','pool_end','lease_seconds','dns1','dns2'), 'dns':('ipv4_1','ipv4_2','ipv6_1','ipv6_2','domain_name'), 'optical':('rx_dbm','tx_dbm','temperature_c','bias_ma','registration_status','los','lof')}
    out={}
    for key,keys in schemas.items():
        data=sections.get(key)
        if isinstance(data,list):out[key]=[select(r,keys) for r in data if isinstance(r,dict)]
        elif isinstance(data,dict):out[key]=select(data,keys)
    mesh=sections.get('mesh') or {}
    out['mesh']={**select(mesh,('available','enabled')),'nodes':[select(n,('id','parent','backhaul','band','rssi')) for n in mesh.get('nodes',[]) if isinstance(n,dict)]}
    traffic=sections.get('traffic') or {}
    out['traffic']={'sources':[select(r,('source','identity','label','ssid','band','rx_mbps','tx_mbps')) for r in traffic.get('sources',[]) if isinstance(r,dict)]}
    return out

def normalize_ping(d):
    value=select(d,('target','sent','received','loss_percent','min_ms','avg_ms','max_ms'))
    for k in ('sent','received','loss_percent','min_ms','avg_ms','max_ms'):value[k]=numeric(value.get(k))
    for k in ('sent','received','min_ms','avg_ms','max_ms'):
        if value[k] is not None and value[k]<0:value[k]=None
    if value['loss_percent'] is not None and not 0<=value['loss_percent']<=100:value['loss_percent']=None
    loss=value['loss_percent']; received=value['received']
    status='success' if received is not None and received>0 else 'failure' if loss==100 or (received==0 and (value['sent'] or 0)>0) else 'unknown'
    if status=='unknown' and str(d.get('status','')).lower() in {'error','failed','error_cannotresolvehostname','error_other'}:status='failure'
    if status=='success' and loss is not None and loss>2:status='warning'
    return value,status

def normalize_hops(d):
    out=[]
    for h in d.get('hops',[]):
        times=[n for v in h.get('latencies_ms',[]) if (n:=numeric(v)) is not None]
        out.append({'hop':h.get('number'),'host':h.get('hostname'),'address':h.get('host'),'latency_ms':sum(times)/len(times) if times else None,'loss_percent':None,'status':'timeout' if h.get('timeout') else 'normal' if times else 'unknown'})
    return out

class FullDiagnosticService:
    def __init__(self,sessions,queries,commands,history,http_test=None):
        self.sessions,self.queries,self.commands,self.history=sessions,queries,commands,history
        self.http_test=http_test or self._http;self.running=Lock()
    def config(self):return dict(DEFAULTS)
    def _http(self):
        start=time.perf_counter()
        try:
            with requests.get(DEFAULTS['http_url'],stream=True,timeout=(3,5),allow_redirects=False) as r:
                return {'status':'success' if 200<=r.status_code<400 else 'failure','status_code':r.status_code,'duration_ms':round((time.perf_counter()-start)*1000,2),'target':DEFAULTS['http_url'],'origin':'host_access_manager'}
        except requests.RequestException:
            return {'status':'failure','duration_ms':None,'target':DEFAULTS['http_url'],'origin':'host_access_manager','error':'HTTPS sem resposta no computador do técnico.'}
    def _test(self,name,config,sections):
        label={'ping':'Ping','dns':'DNS','http':'HTTP/HTTPS','gateway':'Gateway','internet':'Internet'}[name]
        row={'id':name,'label':label,'status':'unknown','duration_ms':None,'origin':'ont','details':{}}
        if name=='http':return {**row,**self.http_test()}
        try:
            if name=='dns':
                d=self.commands.dns_lookup({'hostname':config['hostname']});addresses=d.get('addresses') or []
                row.update(status='success' if addresses else 'failure' if d.get('success') is False else 'unknown',details={'hostname':config['hostname'],'addresses':addresses},target=config['hostname'])
            else:
                target=config['target']
                if name=='gateway':
                    gateways=[w.get('gateway') for w in sections.get('wan',[]) if isinstance(w,dict) and w.get('gateway')]
                    if not gateways:return row
                    target=gateways[0]
                d=self.commands.ping({'host':target,'count':4});details,status=normalize_ping(d)
                row.update(status=status,duration_ms=details['avg_ms'],target=target,details=details)
        except Exception as e:
            # Unsupported/unknown capability is not a failed connectivity test.
            from apps.access_manager.application.error_policy import public_error
            err=public_error(e)
            row.update(error='Operação indisponível ou sem resposta nesta execução.',status='failure' if err.get('type') in {'network','connection','timeout'} else 'unknown')
        return row
    def run(self,config):
        if not self.running.acquire(blocking=False):raise RuntimeError('Diagnóstico já está em execução')
        try:
            return self._run(config)
        finally:self.running.release()
    def _run(self,config):
        target=str(config.get('target') or DEFAULTS['target']).strip();hostname=str(config.get('hostname') or DEFAULTS['hostname']).strip()
        import re
        from ipaddress import ip_address
        for value in (target,hostname):
            try:ip_address(value)
            except ValueError:
                if not value or len(value)>253 or not all(re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?',part) for part in value.rstrip('.').split('.')):raise ValueError('Destino inválido')
        test=config.get('test')
        if test is not None and test not in TESTS:raise ValueError('Teste inválido')
        settings={'target':target,'hostname':hostname};started=datetime.now(timezone.utc).isoformat()
        sections={};errors={}
        # Independent host HTTPS runs alongside ONT reads. Native operations
        # retain the session's lock: ThinkLua menuView/token is stateful.
        with ThreadPoolExecutor(max_workers=1) as pool:
            http=pool.submit(self.http_test) if test in (None,'http') else None
            with getattr(self.sessions,'operation_lock',nullcontext()):
                session=self.sessions.session
                if session is None:raise RuntimeError('Sem sessão conectada')
                if config.get('session_id') and config['session_id']!=getattr(session,'session_id',None):raise ValueError('A sessão do equipamento mudou antes da execução')
                device={'model':session.model,'vendor':session.vendor.value,'host':session.host,'online':True}
                readers=('device','wan','optical','wifi_ssids','wifi_radios','clients','lan','dhcp','dns','traffic','mesh') if test is None else ('wan',) if test=='gateway' else ()
                mapping={'device':'system','wifi_ssids':'wifi','wifi_radios':'radios'}
                for method in readers:
                    key=mapping.get(method,method)
                    try:sections[key]=getattr(self.queries,method)()
                    except Exception:errors[key]='Não disponível neste equipamento ou nesta execução.'
                connectivity=[]
                for name in TESTS if test is None else (test,):
                    connectivity.append({'id':'http','label':'HTTP/HTTPS',**http.result(),'details':{}} if name=='http' else self._test(name,settings,sections))
                hops=[]
                if test is None and config.get('trace',True):
                    try:hops=normalize_hops(self.commands.traceroute({'host':target}))
                    except Exception:errors['traceroute']='Não disponível nesta execução.'
                if test is None and sections.get('traffic'):
                    try:sections['traffic']=self.queries.traffic()
                    except Exception:pass
                clean=safe_sections(sections)
                device['serial']=clean.get('system',{}).get('serial') or getattr(session,'metadata',{}).get('device_identity')
                ping=next((r for r in connectivity if r['id']=='ping'),{})
                clients=clean.get('clients',[]);values=[n for c in clients if (n:=numeric(c.get('rssi'))) is not None]
                avg=sum(values)/len(values) if values else None
                resources=select(clean.get('system',{}),('cpu_percent','memory_percent','temperature_c','storage_percent','uptime_seconds','firmware'))
                for key in ('cpu_percent','memory_percent','temperature_c','storage_percent','uptime_seconds'):
                    resources[key]=numeric(resources.get(key))
                    if key.endswith('_percent') and resources[key] is not None and not 0<=resources[key]<=100:resources[key]=None
                try:resources['active_sessions']=self.queries.nat_sessions()['active'] if test is None else None
                except Exception:resources['active_sessions']=None
                bands=[]
                for radio in clean.get('radios',[]):
                    band=radio.get('band') or radio.get('banda');members=[c for c in clients if c.get('band')==band]
                    rssis=[n for c in members if (n:=numeric(c.get('rssi'))) is not None];snrs=[n for c in members if (n:=numeric(c.get('snr'))) is not None]
                    bands.append({'band':band,'radio':radio,'clients':len(members),'avg_rssi':sum(rssis)/len(rssis) if rssis else None,'avg_snr':sum(snrs)/len(snrs) if snrs else None,'interference':None,'ssids':[w.get('ssid') for w in clean.get('wifi',[]) if (w.get('band') or w.get('banda'))==band]})
                result={'kind':'full_diagnostic','test_type':test or 'complete','started_at':started,'finished_at':datetime.now(timezone.utc).isoformat(),'device':device,'connectivity':connectivity,'traceroute':hops,'latency_ms':ping.get('duration_ms'),'packet_loss_percent':ping.get('details',{}).get('loss_percent'),'availability_percent':None,'wifi_quality':{'avg_rssi':avg,'label':rssi_quality(avg),'bands':bands},'resources':resources,'sections':clean,'section_errors':errors}
                states=[r['status'] for r in connectivity]
                result['status']='failure' if 'failure' in states else 'warning' if 'warning' in states else 'partial' if errors or 'unknown' in states else 'success'
                result['alerts']=build_alerts(result);result['summary']='Diagnóstico '+result['status']
                identity=self.history.save_diagnostic(getattr(self.sessions,'_history_session',None),result)
                return {**result,'history_id':identity}
    def history_rows(self,config):
        hours=int(config.get('hours',24));status=config.get('status')
        if hours not in (1,6,24,168):raise ValueError('Período inválido')
        if status and status not in {'success','failure','warning','partial'}:raise ValueError('Resultado inválido')
        with getattr(self.sessions,'operation_lock',nullcontext()):
            session=self.sessions.session
            if session is None:return []
            since=(datetime.now(timezone.utc)-timedelta(hours=hours)).isoformat()
            return self.history.full_diagnostics(session.host,session.vendor.value,since,status,getattr(session,'metadata',{}).get('device_identity'))
    def export(self,config):
        rows=self.history_rows({'hours':168})
        item=next((r for r in rows if r['history_id']==int(config['id'])),None)
        if item is None:raise ValueError('Execução não pertence ao equipamento atual ou está fora do período')
        if config.get('format','json')=='json':return {'filename':'access-manager-diagnostic.json','data':item}
        if config.get('format')!='csv':raise ValueError('Formato inválido')
        stream=io.StringIO();writer=csv.writer(stream);writer.writerow(['Data','Equipamento','Teste','Origem','Resultado','Tempo ms','Perda %'])
        for r in item['connectivity']:
            values=[item['finished_at'],item['device']['model'],r['label'],r['origin'],r['status'],r.get('duration_ms'),r.get('details',{}).get('loss_percent')]
            writer.writerow(["'"+v if isinstance(v,str) and v.startswith(('=','+','-','@')) else v for v in values])
        return {'filename':'access-manager-diagnostic.csv','content':stream.getvalue()}
