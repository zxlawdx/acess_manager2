// Pure movement model shared by the renderer and deterministic tests.
export function terrainHeight(x,z){return .5*Math.sin(x*.055)*Math.cos(z*.055);}
export class PlayerController {
 constructor(){this.x=0;this.z=10;this.y=terrainHeight(0,10);this.velocity=0;this.heading=0;this.grounded=true;this.moving=false;this.running=false;}
 update(dt,keys,yaw){
  dt=Math.min(Math.max(dt,0),.05);
  let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  let z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  this.moving=Boolean(x||z);this.running=keys.has('ShiftLeft')||keys.has('ShiftRight');
  if(this.moving){const length=Math.hypot(x,z);x/=length;z/=length;const dx=x*Math.cos(yaw)+z*Math.sin(yaw),dz=-x*Math.sin(yaw)+z*Math.cos(yaw);const speed=this.running?10:5;
   this.x=Math.max(-48,Math.min(48,this.x+dx*speed*dt));this.z=Math.max(-48,Math.min(48,this.z+dz*speed*dt));
   const target=Math.atan2(dx,dz);this.heading+=Math.atan2(Math.sin(target-this.heading),Math.cos(target-this.heading))*Math.min(1,dt*12);
  }
  const floor=terrainHeight(this.x,this.z);
  if(this.grounded&&keys.has('Space')){this.velocity=7;this.grounded=false;keys.delete('Space');}
  this.velocity-=18*dt;this.y+=this.velocity*dt;
  if(this.y<=floor){this.y=floor;this.velocity=0;this.grounded=true;}
 }
}
export function nearestHotspot(player,hotspots,radius=5){let nearest=null,distance=radius;for(const h of hotspots){const d=Math.hypot(player.x-h.x,player.z-h.z);if(d<distance){nearest=h;distance=d}}return nearest;}
