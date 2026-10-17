import * as THREE from 'three';
import {terrainHeight} from '../world/controller.js';
export class FieldAssets{
 constructor(){this.geometries=new Map();this.materials=new Map();this.owned=new Set()}
 geometry(kind){if(!this.geometries.has(kind)){const g=kind==='cylinder'?new THREE.CylinderGeometry(1,1,1,8):kind==='rock'?new THREE.DodecahedronGeometry(1,0):kind==='sphere'?new THREE.IcosahedronGeometry(1,1):new THREE.BoxGeometry(1,1,1);this.geometries.set(kind,g)}return this.geometries.get(kind)}
 material(color,glow=false){const key=color+':'+glow;if(!this.materials.has(key))this.materials.set(key,new THREE.MeshStandardMaterial({color,roughness:glow ? .4 : .82,metalness:glow ? .05 : .2,...(glow?{color:new THREE.Color(color).multiplyScalar(.12),emissive:color,emissiveIntensity:.9}:{})}));return this.materials.get(key)}
 mesh(group,kind,pos,scale,color,glow=false){const mesh=new THREE.Mesh(this.geometry(kind),this.material(color,glow));mesh.position.set(...pos);mesh.scale.set(...scale);mesh.castShadow=!glow;mesh.receiveShadow=!glow;group.add(mesh);return mesh}
 own(resource){this.owned.add(resource);return resource}
 dispose(){for(const x of [...this.geometries.values(),...this.materials.values(),...this.owned])x.dispose();this.geometries.clear();this.materials.clear();this.owned.clear()}
}
export function makeEnvironment(scene,assets){
 const groundGeo=assets.own(new THREE.PlaneGeometry(220,220,100,100));groundGeo.rotateX(-Math.PI/2);const vertices=groundGeo.attributes.position;for(let i=0;i<vertices.count;i++)vertices.setY(i,terrainHeight(vertices.getX(i),vertices.getZ(i))-.02);groundGeo.computeVertexNormals();const noise=new Uint8Array(64*64*4);let seed=619;for(let i=0;i<64*64;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=170+(seed%75);noise.set([n,n,n,255],i*4)}const texture=assets.own(new THREE.DataTexture(noise,64,64));texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(60,60);texture.needsUpdate=true;const earth=assets.material(0x69634e);earth.metalness=0;earth.roughness=1;earth.map=texture;const terrain=new THREE.Mesh(groundGeo,earth);terrain.receiveShadow=true;scene.add(terrain);
 const skyline=new THREE.Group();scene.add(skyline);for(let i=0;i<24;i++){const x=-85+i*7.5,h=5+Math.sin(i*7)**2*19;assets.mesh(skyline,'box',[x,h/2,-73],[2+(i%3),h,3],0x24291f);if(i%5===0){assets.mesh(skyline,'cylinder',[x,h+4,-73],[.12,10,.12],0x3e4034);assets.mesh(skyline,'box',[x,h+7,-73],[2,.15,.15],0x3e4034)}}
 const cables=new THREE.Group();scene.add(cables);for(let i=0;i<6;i++){const x=-24+i*10;assets.mesh(cables,'cylinder',[x,2.8,-32],[.1,6,.1],0x23281f);assets.mesh(cables,'box',[x,5,-32],[2,.15,.2],0x7b4a2c);if(i<5){const points=[];for(let t=0;t<=10;t++)points.push(new THREE.Vector3(x+t,5-Math.sin(t/10*Math.PI)*1.4,-32));const line=new THREE.Line(assets.own(new THREE.BufferGeometry().setFromPoints(points)),assets.own(new THREE.LineBasicMaterial({color:0x131a14})));cables.add(line)}}
 const sunDisc=assets.mesh(scene,'sphere',[-70,26,-100],[5,5,5],0xffbf70,true);
 sunDisc.material.fog=false;return {skyline,sunDisc};
}
export function makeProps(scene,assets,count){
 const group=new THREE.Group(),matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),color=new THREE.Color();const rocks=new THREE.InstancedMesh(assets.geometry('rock'),assets.material(0x51422d),count);for(let i=0;i<count;i++){const angle=i*2.39996,radius=i%2?50+(i%17)*2:12+(i%17)*2,x=Math.sin(angle)*radius,z=Math.cos(angle)*radius,s=i%2?.5+(i%7)*.35:.12+(i%5)*.07;matrix.compose(new THREE.Vector3(x,terrainHeight(x,z)+s*.25,z),q,new THREE.Vector3(s,s*.7,s));rocks.setMatrixAt(i,matrix);color.setHex(i%3?0x55452d:0x6d5639);rocks.setColorAt(i,color)}rocks.instanceMatrix.needsUpdate=true;rocks.receiveShadow=true;rocks.castShadow=true;group.add(rocks);scene.add(group);return group;
}
export function makeStation(group,region,assets){
 const metal=0x303a30,rust=0x7b4a2c,green=0x33ff66,dark=0x0b120d;
 const box=(p,s,c=metal,g=false)=>assets.mesh(group,'box',p,s,c,g),cyl=(p,s,c=rust)=>assets.mesh(group,'cylinder',p,s,c);
 box([0,.15,0],[5,.3,5],0x464b3b);
 const tower=region.routeId==='wan'||region.routeId==='wifi'||/diagnostic/i.test(region.routeId||'');
 if(tower){for(const x of [-1.35,1.35])for(const z of [-1.35,1.35])cyl([x,5,z],[.08,10,.08]);for(let i=1;i<9;i+=2){box([0,i,0],[2.8,.12,2.8]);const beam=box([0,i+.8,1.35],[3.8,.07,.1]);beam.rotation.z=.6}cyl([0,11,0],[.13,4,.13],metal);box([0,13,0],[.35,.4,.35],0xffc857,true);const dish=cyl([1.5,7,0],[1.2,.22,1.2],0x848b6d);dish.rotation.z=.85;box([1.8,7.5,0],[.08,1.8,.08],green,true)}
 else if(region.kind==='service'){box([0,1,0],[2,1.7,1.1],rust);box([0,2,0],[2.1,1.3,1.2]);box([0,2.05,.64],[1.6,.85,.08],green,true);box([0,1.15,.8],[2,.15,.8],dark)}
 else if(/client|subscriber/i.test(region.routeId||'')){box([0,1.5,0],[4.7,3,3.7]);box([0,3.2,0],[5,.3,4],rust);for(const x of [-1.4,1.4])box([x,1.6,1.9],[.8,.6,.1],green,true);cyl([0,4.4,0],[.07,2.5,.07]);const dish=cyl([.5,4.4,0],[.8,.16,.8],0x686b51);dish.rotation.z=.9}
 else {box([0,1.6,0],[5,3.2,4],rust);box([0,3.5,0],[4.6,.65,3.7],metal);box([0,1.4,2.05],[1.8,2.5,.14],dark);box([0,1.8,2.15],[1.4,.8,.1],green,true);for(const x of [-1.9,1.9])box([x,2.8,2.08],[.35,.22,.15],0xffc857,true);box([0,.35,2.7],[2,.3,.5],metal)}
 // Every station has an actual interaction marker; decorative signals imply no network health.
 const marker=cyl([0,.6,3.6],[.55,.35,.55],dark);marker.userData.region=region;box([0,1.1,3.6],[.35,.45,.35],green,true);
 return tower?14:5;
}
