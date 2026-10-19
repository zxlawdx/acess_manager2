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
export class InteractionManager {
 constructor(registry,raycaster,{distance=5,onFocus=()=>{}}={}){this.registry=registry;this.raycaster=raycaster;this.distance=distance;this.onFocus=onFocus;this.focus=null;}
 update(camera,player,occluders=[]){this.raycaster.setFromCamera({x:0,y:0},camera);const hits=this.raycaster.intersectObjects([...this.registry.objects,...occluders],true);let next=null;for(const hit of hits){const item=this.registry.fromObject(hit.object);if(!item)break;const p=item.object.getWorldPosition?item.object.getWorldPosition(item.object.position.clone()):item.object.position;if(Math.hypot(p.x-player.x,p.z-player.z)<=(item.distance||this.distance)&&item.enabled!==false)next=item;break;}if(next!==this.focus){this.focus=next;this.onFocus(next);}return next;}
 interact(secondary=false){if(!this.focus)return false;(secondary?this.focus.secondary||this.focus.run:this.focus.run)();return true;}
}
