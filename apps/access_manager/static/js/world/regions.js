import {applicableRoutes,capabilityAllows} from '../core/routes.js';
const palette=[0x13a9ce,0x53b441,0x039bbb,0x776cdb,0xe6a53d,0x2c91d7];
export function deriveWorldRegions(registry,session,capabilities){
 const layout=session?.vendor==='juniper'?'juniper':'router';const routes=applicableRoutes(registry,session,capabilities);
 const items=routes.flatMap(route=>[{routeId:route.id,id:route.id,label:route.label,kind:route.kind,capabilities:route.capabilities,available:true},...(route.actions||[]).filter(a=>a.available()&&(!a.capability||capabilityAllows(capabilities?.[a.capability]))).map(a=>({routeId:route.id,id:a.id,actionId:a.id,label:a.label,kind:a.kind,available:true}))]);
 // Stable, non-overlapping layout from the applicable route set. No invented features.
 return items.map((r,i)=>{const col=i%5,row=Math.floor(i/5);return {...r,layout,x:layout==='juniper'?(col-2)*15:(col-2)*17,z:layout==='juniper'?-16+row*15:-12+row*18,color:palette[i%palette.length]}});
}
