// Explicit operational facts only: never enumerate arbitrary API objects here.
const present=v=>v!==undefined&&v!==null&&v!==''&&v!=='—'&&(!Array.isArray(v)||v.length>0);
const scalar=v=>present(v)&&['string','number','boolean'].includes(typeof v)?String(v):'';
const pick=(o,...keys)=>{for(const k of keys)if(present(o?.[k]))return o[k]};
const number=(o,...keys)=>{for(const k of keys){const v=o?.[k];if(present(v)&&!(typeof v==='string'&&!v.trim())&&typeof v!=='boolean'&&Number.isFinite(Number(v)))return Number(v)}return undefined};
const list=v=>Array.isArray(v)?v:Array.isArray(v?.registros)?v.registros:Array.isArray(v?.data)?v.data:Array.isArray(v?.rows)?v.rows:[];
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const line=(label,v,unit='')=>scalar(v)?`${label}: ${scalar(v)}${unit}.`:'';
const join=lines=>lines.filter(Boolean).join('\n');
const clock=time=>{const d=new Date(time);return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
const numeric=(v,digits=2)=>v===undefined?'':Number(v.toFixed(digits)).toString();
const temperature=r=>{const value=number(r,'temperature_c','temperature');if(value!==undefined)return value;const match=scalar(r.temperature).match(/^\s*(-?\d+(?:\.\d+)?)\s*(?:degrees\s*)?(?:°\s*)?C(?:\b|$)/i);return match?Number(match[1]):undefined};
const up=v=>/^(up|active|ativo|online|connected|conectado|associated)$/i.test(String(v));
const down=v=>/^(down|inactive|inativo|offline|disconnected|desconectado)$/i.test(String(v));
export function opticalFacts(data){
 const rx=number(data,'rx_power_dbm','rx_dbm','rxPower','rx','rx_power'),tx=number(data,'tx_power_dbm','tx_dbm','txPower','tx','tx_power');
 return join([rx!==undefined?`Sinal óptico RX: ${rx.toFixed(2)} dBm.`:'',tx!==undefined?`Sinal óptico TX: ${tx.toFixed(2)} dBm.`:'']);
}
function identification(data){
 const d=object(data);return join([line('Equipamento identificado',[scalar(d.manufacturer||d.vendor)?.toUpperCase(),scalar(d.model)].filter(Boolean).join(' ')),line('Nome do equipamento',d.hostname),line('Firmware',pick(d,'firmware','software_version','junos_version','version'))]);
}
function wanFacts(data){return list(Array.isArray(data)||data?.registros?data:[data]).map(r=>{
 const status=pick(r,'status','state'),rawType=scalar(pick(r,'connection_type','type')),type=/^pppoe$/i.test(rawType)?'PPPoE':rawType.toUpperCase();
 return join([`WAN${scalar(r.name)?' '+r.name:''}${up(status)?' conectada':down(status)?' desconectada':scalar(status)?': '+status:' consultada'}${type?' via '+type:''}.`,line('IP WAN',pick(r,'ipv4','ip','ipv4_address')),line('Gateway',r.gateway),line('VLAN',r.vlan),line('DNS',Array.isArray(r.dns)?r.dns.map(scalar).filter(Boolean).join(' / '):r.dns)]);
}).join('\n\n')}
function resources(data){return list(Array.isArray(data)||data?.registros?data:[data]).slice(0,8).map(r=>join([
 `Recursos do equipamento${present(r.slot)?' — slot '+scalar(r.slot):''}:`,line('CPU livre',pick(r,'cpu_idle_percent','cpu_idle'),'%'),line('CPU em uso',r.cpu_percent,'%'),line('Memória em uso',pick(r,'memory_used_percent','memory_percent'),'%'),line('Temperatura',numeric(temperature(r)),' °C'),line('Load average',[r.load_average_1,r.load_average_5,r.load_average_15].map(scalar).filter(Boolean).join(' / '))
 ])).filter(text=>text.split('\n').length>1).join('\n\n')}
function interfaces(data){
 const rows=list(data);if(!rows.length)return 'Nenhuma interface retornada na consulta.';
 const total=number(data,'quantidade')??rows.length;const active=rows.filter(r=>up(pick(r,'oper_state','oper_status','link_state','status'))).length,inactive=rows.filter(r=>down(pick(r,'oper_state','oper_status','link_state','status'))).length;
 return join([`Interfaces consultadas: ${total}.`,`${total>rows.length?'Estados na amostra de '+rows.length+' interfaces — ':''}Ativas: ${active}; inativas: ${inactive}${rows.length-active-inactive?`; sem estado informado: ${rows.length-active-inactive}`:''}.`,...rows.filter(r=>up(pick(r,'oper_state','oper_status','link_state','status'))&&/^(et-|xe-|ae\d)/.test(String(r.name))).slice(0,3).map(r=>`${scalar(r.name)}: ativa${scalar(r.speed)?' / '+r.speed:''}.`)]);
}
function subscriber(row){return join([line('Assinante encontrado',row.username),line('Contrato',row.contract),line('IP do assinante',pick(row,'ipv4_address','ip','ipv4')),line('MAC',pick(row,'mac_address','mac')),line('VLAN',pick(row,'vlan','vlan_id')),line('Interface',row.interface),line('Estado do assinante',up(row.state)?'ativo':down(row.state)?'inativo':row.state)])}
function lookup(data,input){
 const rows=Array.isArray(data.sessions)?data.sessions:['username','ipv4_address','mac_address','interface'].some(k=>present(data[k]))?[data]:[];
 const rawQuery=pick(input,'query','contract','username')||data.query;const query=scalar(typeof rawQuery==='object'?rawQuery?.value:rawQuery);
 return join([query?`Consultado o contrato ou identificador ${query}.`:'Consulta de assinante realizada.',rows.length?rows.slice(0,3).map(subscriber).join('\n\n'):data.complete===true||data.status==='NOT_FOUND'?'Nenhum assinante localizado na consulta.':'Consulta sem resultado confirmado.']);
}
function ping(data,target){
 const host=scalar(pick(data,'target','host','destination'))||scalar(target),sent=number(data,'sent','packets_sent','transmitted'),received=number(data,'received','packets_received'),loss=number(data,'loss_percent','packet_loss_percent','packet_loss_reported'),avg=number(data,'avg_ms','average_ms','latency_ms');
 return join([`Ping${host?' para '+host:''}${received===0?' sem resposta.':' realizado.'}`,sent!==undefined&&received!==undefined?`${sent} pacotes enviados, ${received} recebidos.`:'',line('Perda',numeric(loss),'%'),line('Latência média',numeric(avg),' ms')]);
}
function trace(data,target){
 const hops=Array.isArray(data.hops)?data.hops:[],host=scalar(data.target||target),last=hops.at(-1);
 const reached=data.reached===true||data.destination_reached===true||Boolean(host&&last&&(last.address===host||last.ip===host));
 const times=Array.isArray(last?.times_ms)?last.times_ms.filter(v=>typeof v==='number'&&Number.isFinite(v)):[];const avg=times.length?times.reduce((a,b)=>a+b,0)/times.length:number(last,'latency_ms','avg_ms');
 return join([`Traceroute${host?' para '+host:''} realizado.`,reached?`Destino alcançado em ${hops.length} saltos.`:hops.length?`${hops.length} saltos retornados; alcance do destino não confirmado.`:'Sem confirmação de alcance do destino.',reached?line('Latência final aproximada',numeric(avg),' ms'):'']);
}
const fields={ssid:'Nome da rede',channel:'Canal',auto_channel:'Canal automático',bandwidth:'Largura de canal',enabled:'Estado',broadcast:'Visibilidade do SSID',isolation:'Isolamento',ipv4_1:'DNS primário',ipv4_2:'DNS secundário',dns1:'DNS primário',dns2:'DNS secundário',lan_ip:'IP da LAN',pool_start:'Início do pool DHCP',pool_end:'Fim do pool DHCP',lease_seconds:'Tempo de concessão',internal_client:'Cliente interno',external_port:'Porta externa',internal_port:'Porta interna',protocol:'Protocolo',tx_power:'Potência',standard:'Padrão Wi-Fi',country:'País'};
function changes(e,secrets){
 const before=object(e.before),after=object(e.after?.config||e.after),target=scalar(e.target);const failed=e.ok===false||/falha|erro/i.test(e.result||'');
 const status=failed?'Falha reportada pelo equipamento':/confirmado por leitura/i.test(e.result||'')?'Confirmado por leitura':/cancelad|não confirmado/i.test(e.result||'')?'Resultado remoto não confirmado':'Comando enviado; aplicação não confirmada por leitura';
 const title=e.secrets?`${failed?'Não foi confirmada a alteração da senha Wi-Fi':/confirmado por leitura/i.test(e.result||'')?'Senha Wi-Fi alterada':'Solicitada alteração da senha Wi-Fi'}${target?' na rede '+target:''}.`:`${e.category==='Wi-Fi'?'Configuração Wi-Fi':'Alteração de configuração'}${target&&target!=='Equipamento'?' em '+target:''}.`;
 return join([title,...Object.entries(fields).filter(([k])=>present(after[k])).map(([k,label])=>{const value=v=>typeof v==='boolean'?(v?'habilitado':'desabilitado'):scalar(v);return present(before[k])?`${label} alterado de ${value(before[k])} para ${value(after[k])}.`:`${label} solicitado: ${value(after[k])}.`}),e.secrets?`Senha anterior: ${secrets?scalar(e.secrets.old):'********'}`:'',e.secrets?`Senha nova: ${secrets?scalar(e.secrets.new):'********'}`:'',status+'.']);
}
function clientDiagnostic(e){const d=object(e.data),c=object(d.cliente||d.client||d);const tests=Array.isArray(d.testes)?d.testes:[],p=tests.find(t=>/^Ping a partir/.test(t.teste||''))?.resultado;return join([`${e.result==='Dados observados'?'Registradas informações':'Diagnóstico específico realizado'} no dispositivo ${scalar(e.target)||scalar(c.Hostname)||'selecionado'}.`,...['Hostname','IPv4','IPv6','IP','MAC','Banda','SSID','Interface'].map(k=>line(k,c[k])),line('RSSI',c.RSSI,' dBm'),line('SNR',c.SNR,' dB'),p?ping(p,c.IP||c.IPv4):'',number(c,'RSSI')!==undefined?(Number(c.RSSI)<-70?'Sinal fraco no momento da leitura; distância ou interferência podem estar contribuindo.':'Sinal adequado no momento da leitura; isso não comprova acesso à internet.'):'',tests.some(t=>t.teste==='Tabela de clientes'&&t.resultado==='Presente')?'Dispositivo presente na tabela de clientes.':'',tests.some(t=>t.teste==='Tabela de clientes'&&t.resultado==='Ausente')?'Dispositivo ausente na tabela consultada.':'',p&&number(p,'received')===0?'A ausência de resposta pode decorrer de firewall, isolamento ou standby.':'',...tests.filter(t=>t.teste==='Ping'&&typeof t.resultado==='string').map(t=>`Ping não concluído: ${t.resultado}`)]);}
const pathFor=e=>e.path||({'Identificação do equipamento':'/api/device','Leitura WAN':'/api/device/wan','Sinal óptico':'/api/device/optical','Clientes observados':'/api/device/clients','Consulta de assinante':'/api/infrastructure/subscribers/lookup','Ping':'/api/device/diagnostics/ping','Traceroute':'/api/device/diagnostics/traceroute','Acesso CPE':'/api/infrastructure/subscribers/connect-cpe',system:'/api/infrastructure/system',resources:'/api/infrastructure/resources',interfaces:'/api/infrastructure/interfaces'}[e.action])||'';
export function humanEvent(e,{secrets=false}={}){
 const path=pathFor(e),d=object(e.data),input=object(e.input||e.after),failed=e.ok===false||d.health?.last_read_failed===true||/^(Falha|Erro)/i.test(e.result||'');
 if(e.category==='Conexão'){
  const s=object(e.connection),target=[scalar(s.vendor).toUpperCase(),scalar(s.model),scalar(s.host)].filter(Boolean).join(' · ')||scalar(e.target);
  return {kind:'connection',key:'connection',text:`${e.action==='Sessão iniciada'?'Conectado ao equipamento':'Contexto selecionado'}${target?' '+target:''}.`};
 }
 if(e.category==='Cliente')return {kind:'test',text:clientDiagnostic(e)};
 if(e.secrets||e.before)return {kind:'change',text:changes(e,secrets)};
 const target=scalar(input.host||input.target||e.target);
 if(failed)return {kind:'test',text:`Não foi possível concluir ${/ping/.test(path)?'o ping':/traceroute/.test(path)?'o traceroute':/subscribers/.test(path)?'a consulta do assinante':'a operação solicitada'}${target&&target!=='Equipamento'?' para '+target:''}. Resultado não confirmado.`};
 if(/connect-cpe$/.test(path))return {kind:'connection',key:'cpe',text:join(['Realizado acesso ao CPE do assinante'+(scalar(input.contract)?' '+input.contract:'')+'.',line('IP do CPE',input.host||d.session?.host),line('Porta',input.port)])};
 if(/cpe-draft$/.test(path))return {kind:'read',key:'cpe-preparation',text:join(['Preparado acesso ao CPE; autenticação ainda não confirmada.',line('IP do CPE',d.host),line('Porta',d.port)])};
 if(/cpe-port$/.test(path))return {kind:'test',text:d.status==='CPE_PORT_REACHABLE'?'Porta do CPE acessível a partir deste computador; autenticação ainda não testada.':'Teste da porta do CPE sem confirmação de acesso.'};
 if(/subscribers\/(lookup|detail|context)$/.test(path)){const result=d.data||d,rows=Array.isArray(result.sessions)?result.sessions:[result],fingerprint=rows.map(subscriber).filter(Boolean).join('\n');return {kind:'read',key:'subscriber',fingerprint:fingerprint||undefined,text:lookup(result,input)}};
 if(/\/device$|\/system$/.test(path))return {kind:'read',key:'identification',text:identification(d)};
 if(/\/wan$/.test(path))return {kind:'read',key:'wan',text:wanFacts(e.data)};
 if(/\/optical$/.test(path))return {kind:'read',key:'optical',text:opticalFacts(d)};
 if(/\/resources$/.test(path))return {kind:'read',key:'resources',text:resources(e.data)};
 if(/\/interfaces$/.test(path))return {kind:'read',key:'interfaces',text:interfaces(e.data)};
 if(/\/clients$/.test(path)){const count=Array.isArray(e.data)?e.data.length:number(d,'quantidade');return {kind:'read',key:'clients',text:count===0?'Nenhum cliente conectado foi identificado no momento da consulta.':count!==undefined?`${count} cliente(s) identificado(s) na tabela no momento da consulta.`:''}}
 if(/\/ping$/.test(path))return {kind:'test',text:ping(d,target)};
 if(/\/traceroute$/.test(path))return {kind:'test',text:trace(d,target)};
 if(/\/wifi-neighbors$/.test(path))return {kind:'test',text:'Realizada consulta de redes Wi-Fi vizinhas.'};
 if(/\/full\/run$/.test(path))return {kind:'test',text:join(['Diagnóstico completo executado.',line('Latência',d.latency_ms,' ms'),line('Perda',d.packet_loss_percent,'%')])};
 if(/\/reboot$/.test(path))return {kind:'change',text:'Enviado comando de reinicialização do equipamento; verificar o retorno da conexão.'};
 if(/\/profiles\/(capture|apply)$/.test(path))return {kind:/capture$/.test(path)?'read':'change',text:/capture$/.test(path)?'Capturada a configuração atual como rascunho de perfil.':`Solicitada aplicação do perfil${scalar(input.name)?' '+input.name:''}; consultar o resultado das alterações.`};
 if(/\/wifi\/(radio|ssid)$|\/dns|\/dhcp|\/port-forward|\/dmz|\/nat/.test(path))return {kind:e.read?'read':'change',text:e.read?'Consultada configuração de '+(/dns/.test(path)?'DNS':/dhcp/.test(path)?'DHCP':'rede')+'.':changes({...e,after:input},secrets)};
 // Unknown schemas remain structured for technical mode, never dumped into prose.
 return {kind:e.read?'read':'test',text:e.read?'Consulta técnica concluída no equipamento.':'Operação registrada no equipamento; consulte os detalhes técnicos para verificar o resultado.'};
}
export function formatHumanService(service,{mode='summary',secrets=false,markdown=false}={}){
 const header=service.started?`Atendimento iniciado às ${clock(service.started)}.`:'Nenhum atendimento iniciado.';
 const facts=[],timeline=[],last=new Map();let connectedCpeHost='';
 for(const e of service.entries){if(e.category==='Conexão'&&e.action!=='Sessão iniciada'&&connectedCpeHost&&e.connection?.host===connectedCpeHost){connectedCpeHost='';continue}const fact=humanEvent(e,{secrets});if(fact.key==='cpe')connectedCpeHost=scalar(e.input?.host||e.after?.host||e.data?.session?.host);if(!fact.text)continue;const key=`${e.session||''}:${fact.key||fact.kind}`;if(['read','connection'].includes(fact.kind)&&last.get(key)===(fact.fingerprint||fact.text))continue;last.set(key,fact.fingerprint||fact.text);facts.push(fact);timeline.push(`${clock(e.time)} — ${fact.text}`)}
 const notes=scalar(service.notes);let body;
 if(mode==='timeline')body=timeline.join('\n\n');else if(mode==='prose')body=facts.map(f=>f.text.replaceAll('\n',' ')).join(' ');else{
  const sections=[];let previous='';const titles={read:'Verificações realizadas:',change:'Alterações realizadas:',test:'Diagnósticos e consultas:'};
  for(const fact of facts){if(fact.kind!==previous&&titles[fact.kind])sections.push(titles[fact.kind]);sections.push(fact.text);previous=fact.kind}body=sections.join('\n\n');
 }
 return [markdown?'# Atendimento\n\n'+header:header,body,notes?'Observações do técnico:\n'+notes:'',service.started?'Atendimento permanece em andamento.':''].filter(Boolean).join('\n\n');
}
