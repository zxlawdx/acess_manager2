import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {PlayerController,terrainHeight,nearestHotspot,regions} from './controller.js';

const presets={low:{ratio:1,shadows:false,particles:12},medium:{ratio:1.5,shadows:true,particles:28},high:{ratio:2,shadows:true,particles:50}};
export class WorldRenderer {
 constructor(host,{interact,onError,modelURL}={}){
  this.host=host;this.interact=interact;this.onError=onError;this.player=new PlayerController();this.keys=new Set();this.yaw=0;this.pitch=.42;this.distance=13;this.active=false;this.paused=false;this.time=0;this.frames=0;this.elapsed=0;this.visited=new Set();this.cleanups=[];this.quality='medium';
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  this.renderer.setClearColor(0x71cafa);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
  const canvas=this.renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Mundo 3D: WASD para andar, Shift correr, espaço pular, E inspecionar, arraste para girar a câmera.');host.prepend(canvas);
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x71cafa);this.scene.fog=new THREE.Fog(0x9bdaf5,55,160);this.camera=new THREE.PerspectiveCamera(50,1,.1,220);
  this.scene.add(new THREE.HemisphereLight(0xdffaff,0x4f8c2b,2.6));this.sun=new THREE.DirectionalLight(0xfff5d0,3);this.sun.position.set(-25,45,15);this.sun.shadow.camera.left=-55;this.sun.shadow.camera.right=55;this.sun.shadow.camera.top=55;this.sun.shadow.camera.bottom=-55;this.scene.add(this.sun);
  this.buildWorld();this.buildPlayer();this.applyQuality('medium');
  this.listen(canvas,'webglcontextlost',e=>{e.preventDefault();this.stop();onError?.('O contexto WebGL foi perdido. A interface continua disponível.');});
  this.listen(canvas,'keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight','KeyE'].includes(e.code)){e.preventDefault();if(!this.paused)this.keys.add(e.code)}if(e.code==='KeyE'&&!e.repeat&&!this.paused){const hotspot=nearestHotspot(this.player,regions);if(hotspot){this.visited.add(hotspot.id);this.interact?.(hotspot)}}});
  this.listen(window,'keyup',e=>this.keys.delete(e.code));this.listen(window,'blur',()=>this.clearInput());this.listen(document,'visibilitychange',()=>{this.clearInput();this.last=0;});
  let drag=null;this.listen(canvas,'pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.focus()});
  this.listen(canvas,'pointermove',e=>{if(!drag||this.paused)return;this.yaw-=(e.clientX-drag.x)*.006;this.pitch=THREE.MathUtils.clamp(this.pitch+(e.clientY-drag.y)*.004,.15,1.05);drag={x:e.clientX,y:e.clientY}});
  this.listen(canvas,'pointerup',()=>{drag=null});this.listen(canvas,'lostpointercapture',()=>{drag=null});
  this.listen(canvas,'wheel',e=>{e.preventDefault();this.distance=THREE.MathUtils.clamp(this.distance+e.deltaY*.01,7,23)},{passive:false});
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();this.updateCamera(1);
  if(modelURL)this.loadModel(modelURL);
 }
 listen(target,name,fn,options){target.addEventListener(name,fn,options);this.cleanups.push(()=>target.removeEventListener(name,fn,options));}
 mesh(geometry,color,x,y,z,material={}){const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.45,...material}));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;this.scene.add(mesh);return mesh;}
 buildWorld(){
  const ground=new THREE.PlaneGeometry(110,110,60,60);ground.rotateX(-Math.PI/2);const p=ground.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainHeight(p.getX(i),p.getZ(i)));ground.computeVertexNormals();this.mesh(ground,0x6cce36,0,0,0);
  // Paths and clear pond sit above the traversable, shallow terrain.
  this.mesh(new THREE.CircleGeometry(12,64),0x57d9ed,30,.8,22,{transparent:true,opacity:.78,metalness:.4,roughness:.08}).rotation.x=-Math.PI/2;
  this.water=this.scene.children.at(-1);
  for(const h of regions){const base=terrainHeight(h.x,h.z);this.mesh(new THREE.CylinderGeometry(3.2,3.6,.3,48),0xe6f8ec,h.x,base+.2,h.z);const orb=this.mesh(new THREE.SphereGeometry(1.35,28,20),h.color,h.x,base+2.7,h.z,{metalness:.25,roughness:.06,transparent:true,opacity:.85});
   const ring=this.mesh(new THREE.TorusGeometry(2,.06,8,48),0xffffff,h.x,base+1,h.z,{emissive:h.color,emissiveIntensity:.4});ring.rotation.x=Math.PI/2;
   const label=document.createElement('span');label.className='world-region-label';label.textContent=h.label;this.host.append(label);this.labels??=[];this.labels.push({label,h});
   this.orbs??=[];this.orbs.push({orb,base:base+2.7,h});
  }
  for(let i=0;i<36;i++){const a=i*2.39996,r=30+(i%5)*3,x=Math.cos(a)*r,z=Math.sin(a)*r,y=terrainHeight(x,z);this.mesh(new THREE.CylinderGeometry(.18,.3,3,6),0x9b7543,x,y+1.5,z);this.mesh(new THREE.SphereGeometry(1.7,8,6),i%2?0x218f48:0x3fb852,x,y+3.5,z,{roughness:.8});}
  for(let i=0;i<15;i++){const x=(i-7)*6,height=4+(i*7%13);this.mesh(new THREE.BoxGeometry(3.5,height,4),i%2?0x79c8e2:0xd8f5ff,x,height/2,-46,{metalness:.4,roughness:.15});}
  for(let i=0;i<12;i++){const cloud=new THREE.Group();for(let j=0;j<3;j++){const m=new THREE.Mesh(new THREE.SphereGeometry(3,12,8),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}));m.scale.set(1.6,.55,1);m.position.x=j*3;cloud.add(m)}cloud.position.set(Math.cos(i*2.4)*65,19+i%3*3,Math.sin(i*2.4)*65);this.scene.add(cloud);}
  this.mesh(new THREE.SphereGeometry(13,32,24),0x78ddff,32,25,-65,{wireframe:true,transparent:true,opacity:.25,emissive:0x5dbddd,emissiveIntensity:.5});
  this.bubbles=[];for(let i=0;i<50;i++){const m=this.mesh(new THREE.SphereGeometry(.2+(i%4)*.12,10,8),0xdbfcff,Math.sin(i*7)*43,2+i%9,Math.cos(i*7)*43,{transparent:true,opacity:.35,metalness:.5,roughness:.02});this.bubbles.push(m)}
 }
 buildPlayer(){this.avatar=new THREE.Group();this.procedural=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0x63cd3b,roughness:.13,metalness:.22});const part=(g,x,y,z,material=mat)=>{const m=new THREE.Mesh(g,material);m.position.set(x,y,z);m.castShadow=true;this.procedural.add(m);return m};
  part(new THREE.SphereGeometry(.53,24,16),0,1.65,0);const body=part(new THREE.SphereGeometry(.65,24,16),0,.8,0);body.scale.set(.85,1.15,.65);this.feet=[part(new THREE.SphereGeometry(.25,12,8),-.28,.2,.12),part(new THREE.SphereGeometry(.25,12,8),.28,.2,.12)];
  const blue=new THREE.MeshStandardMaterial({color:0x068edb,roughness:.1});part(new THREE.SphereGeometry(.29,16,12),.48,1.1,-.1,blue);for(const x of [-.19,.19])part(new THREE.SphereGeometry(.065,12,8),x,1.73,.46,new THREE.MeshStandardMaterial({color:0x123b52}));
  this.avatar.add(this.procedural);this.scene.add(this.avatar);
 }
 async loadModel(url){try{const gltf=await new GLTFLoader().loadAsync(url);if(this.disposed){this.disposeObject(gltf.scene);return;}const box=new THREE.Box3().setFromObject(gltf.scene),height=box.max.y-box.min.y;if(!Number.isFinite(height)||height<=0)throw new Error('Invalid model bounds');gltf.scene.scale.setScalar(2.2/height);const bounds=new THREE.Box3().setFromObject(gltf.scene);gltf.scene.position.y-=bounds.min.y;this.avatar.add(gltf.scene);this.procedural.visible=false;this.mixer=new THREE.AnimationMixer(gltf.scene);this.actions={};for(const clip of gltf.animations)this.actions[clip.name.toLowerCase()]=this.mixer.clipAction(clip);this.modelStatus='Modelo GLB local';}catch{this.modelStatus='Mascote procedural (GLB indisponível)';}}
 applyQuality(level){const p=presets[level]||presets.low;this.quality=level;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,p.ratio));this.renderer.shadowMap.enabled=p.shadows;this.sun.castShadow=p.shadows;this.sun.shadow.mapSize.set(level==='high'?2048:1024,level==='high'?2048:1024);this.sun.shadow.map?.dispose();this.sun.shadow.map=null;this.bubbles?.forEach((b,i)=>b.visible=i<p.particles);this.resize();}
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 updateCamera(dt){const p=this.player;const target=new THREE.Vector3(p.x, p.y+1.2,p.z);const desired=new THREE.Vector3(p.x+Math.sin(this.yaw)*this.distance*Math.cos(this.pitch),p.y+2+Math.sin(this.pitch)*this.distance,p.z+Math.cos(this.yaw)*this.distance*Math.cos(this.pitch));desired.y=Math.max(desired.y,terrainHeight(desired.x,desired.z)+1.5);this.camera.position.lerp(desired,1-Math.exp(-dt*7));this.camera.lookAt(target);}
 clearInput(){this.keys.clear();}
 setPaused(value){this.paused=value;this.clearInput();if(!value)this.renderer.domElement.focus();}
 start(){if(this.active)return;this.active=true;this.last=0;this.resize();this.renderer.domElement.focus();const tick=now=>{if(!this.active)return;this.frame=requestAnimationFrame(tick);if(document.hidden){this.last=0;return;}const dt=this.last?Math.min((now-this.last)/1000,.05):.016;this.last=now;if(this.paused)return;this.time+=dt;if(!this.paused)this.player.update(dt,this.keys,this.yaw);const p=this.player;this.avatar.position.set(p.x,p.y,p.z);this.avatar.rotation.y=p.heading;this.feet.forEach((f,i)=>{f.position.y=.2+(!this.paused&&p.moving?Math.sin(this.time*(p.running?16:10)+i*Math.PI)*.14:0)});
   if(this.mixer){const state=!p.grounded?'jump':p.moving?(p.running?'run':'walk'):'idle';if(state!==this.animationState){this.currentAction?.fadeOut(.2);const action=Object.entries(this.actions).find(([name])=>name.includes(state))?.[1];action?.reset().fadeIn(.2).play();this.currentAction=action;this.animationState=state;}this.mixer.update(dt)}
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced){this.orbs.forEach(({orb,base},i)=>orb.position.y=base+Math.sin(this.time+i)*.18);this.bubbles.forEach((b,i)=>b.position.y=1+(this.time*.4+i)%12);}
   this.updateCamera(dt);this.renderer.render(this.scene,this.camera);
   for(const {label,h} of this.labels){const v=new THREE.Vector3(h.x,terrainHeight(h.x,h.z)+4.6,h.z).project(this.camera);label.hidden=v.z>1||v.z< -1||Math.abs(v.x)>1||Math.abs(v.y)>1;label.style.left=`${(v.x*.5+.5)*this.host.clientWidth}px`;label.style.top=`${(-v.y*.5+.5)*this.host.clientHeight}px`;}
   this.frames++;this.elapsed+=dt;if(this.elapsed>.4){this.fps=Math.round(this.frames/this.elapsed);this.frames=0;this.elapsed=0;this.host.dispatchEvent(new CustomEvent('world-frame',{detail:{player:p,hotspot:nearestHotspot(p,regions),fps:this.fps,visited:this.visited.size}}));}
  };this.frame=requestAnimationFrame(tick);}
 stop(){this.active=false;cancelAnimationFrame(this.frame);this.clearInput();}
 disposeObject(object){object.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m)continue;for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose()}});}
 dispose(){this.disposed=true;this.stop();this.resizeObserver.disconnect();this.cleanups.forEach(fn=>fn());this.mixer?.stopAllAction();this.disposeObject(this.scene);this.renderer.dispose();this.renderer.domElement.remove();this.labels?.forEach(({label})=>label.remove());}
}
window.AccessManagerWorld={WorldRenderer};
