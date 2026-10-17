// Representative normalized API schemas; identities/addresses are synthetic QA data.
const operations=[
 ['/api/infrastructure/system','POST',{app_session_id:'INTERNAL-BNG'},{manufacturer:'Juniper',model:'MX204',hostname:'bng-qa',firmware:'Junos OS 23.4R2-S5.6',metadata:{never:'INTERNAL-METADATA'},capabilities:{never:'INTERNAL-CAPABILITY'}}],
 ['/api/infrastructure/resources','POST',{app_session_id:'INTERNAL-BNG'},[{slot:'0',cpu_idle_percent:73,memory_used_percent:18,temperature:41,load_average_1:.96,load_average_5:.60,load_average_15:.51}]],
 ['/api/infrastructure/interfaces','POST',{app_session_id:'INTERNAL-BNG'},Array.from({length:14},(_,i)=>({name:i<2?'et-0/0/'+i:'ge-0/0/'+i,oper_state:i<5?'Up':'Down',speed:i<2?'100 Gbps':null}))],
 ['/api/infrastructure/subscribers/lookup','POST',{query:'61571',app_session_id:'INTERNAL-BNG'},{query:{kind:'CONTRACT_NUMBER',value:'61571'},sessions:[{username:'brd_61571',contract:'61571',state:'Active',ipv4_address:'192.0.2.5',mac_address:'02:00:00:00:00:05',vlan_id:2000,interface:'demux0.3221515710',radius_accounting_id:'INTERNAL-RADIUS',session_id:'INTERNAL-SUBSCRIBER'}],candidates:[{status:'NOT_FOUND',username:'cdy_61571'}],complete:true}],
 ['/api/infrastructure/subscribers/connect-cpe','POST',{contract:'61571',host:'192.0.2.5',port:6080,app_session_id:'INTERNAL-BNG'},{connected:true,session:{vendor:'zte',model:'F6600P',host:'192.0.2.5',session_id:'INTERNAL-CPE'}}],
 ['/api/device','GET',{}, {manufacturer:'ZTE',model:'F6600P',firmware:'V9.0.10P6N34',metadata:{transport_active:true},session_id:'INTERNAL-CPE'}],
 ['/api/device/wan','GET',{},[{name:'Internet_TR069',status:'Connected',connection_type:'pppoe',ipv4:'192.0.2.5',gateway:'192.0.2.1',vlan:2000,dns:['192.0.2.53','192.0.2.54'],route_reason:'INTERNAL-ROUTE',connection_states:[]}]],
 ['/api/device/optical','GET',{}, {rx_power_dbm:-22.8399,tx_power_dbm:1.95,serial:null}],
 ['/api/device/clients','GET',{}, []],
 ['/api/device/diagnostics/ping','POST',{host:'192.0.2.53',count:4},{target:'192.0.2.53',sent:4,received:4,loss_percent:0,avg_ms:30.5,raw:'DO-NOT-EXPORT'}],
 ['/api/device/diagnostics/traceroute','POST',{host:'192.0.2.53'},{target:'192.0.2.53',hops:[{address:'192.0.2.1',times_ms:[1,2,3]},{address:'192.0.2.53',times_ms:[30.5,30.7]}]}]
];
module.exports={operations};
