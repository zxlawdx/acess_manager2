export class WorldEventBus {
 constructor(){this.listeners=new Map();}
 on(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);return ()=>this.listeners.get(name)?.delete(fn);}
 emit(name,detail){this.listeners.get(name)?.forEach(fn=>fn(detail));}
 clear(){this.listeners.clear();}
}
export class InteractionRegistry {
 constructor(){this.items=new Map();}
 register(item){if(!item?.id||!item.object||typeof item.run!=='function')throw new Error('Interação inválida');if(this.items.has(item.id))throw new Error('Interação duplicada');this.items.set(item.id,item);return ()=>this.items.delete(item.id);}
 clear(){this.items.clear();}
 get objects(){return [...this.items.values()].filter(i=>i.enabled!==false&&i.object.visible!==false).map(i=>i.object);}
 fromObject(object){while(object){const found=[...this.items.values()].find(i=>i.object===object);if(found)return found;object=object.parent;}return null;}
}
// Raycaster is injected so the registry and occlusion rules are testable without WebGL.
// Third-person mode prefers the avatar heading cone because the camera ray may cross
// furniture behind the avatar before it reaches the object the operator is approaching.
export class InteractionManager {
 constructor(registry,raycaster,{distance=5,onFocus=()=>{}}={}){this.registry=registry;this.raycaster=raycaster;this.distance=distance;this.onFocus=onFocus;this.focus=null;}
 update(camera,player,occluders=[],preferHeading=false){const byRay=()=>{this.raycaster.setFromCamera({x:0,y:0},camera);const hits=this.raycaster.intersectObjects([...this.registry.objects,...occluders],true);for(const hit of hits){const item=this.registry.fromObject(hit.object);if(!item)break;const p=item.object.getWorldPosition?item.object.getWorldPosition(item.object.position.clone()):item.object.position;if(Math.hypot(p.x-player.x,p.z-player.z)<=(item.distance||this.distance)&&item.enabled!==false)return item;break;}return null;};const byHeading=()=>{if(!player)return null;let next=null,best=Infinity;for(const item of this.registry.items.values()){if(item.enabled===false||item.object.visible===false)continue;const p=item.object.getWorldPosition?item.object.getWorldPosition(item.object.position.clone()):item.object.position,d=Math.hypot(p.x-player.x,p.z-player.z),limit=item.distance||this.distance;if(d>limit)continue;const direction=Math.atan2(p.x-player.x,p.z-player.z),heading=Number.isFinite(player.heading)?player.heading:direction,angle=Math.abs(Math.atan2(Math.sin(direction-heading),Math.cos(direction-heading)));if(angle>Math.PI/3)continue;const score=angle*4+d*.25;if(score<best){best=score;next=item;}}return next;};const next=preferHeading?(byHeading()||byRay()):byRay();if(next!==this.focus){this.focus=next;this.onFocus(next);}return next;}
 interact(secondary=false){if(!this.focus)return false;(secondary?this.focus.secondary||this.focus.run:this.focus.run)();return true;}
}