import * as THREE from 'three';
// Original geometric icons. A failed optional model never removes a route.
export function createWorldIcon(region){
 const group=new THREE.Group();const material=new THREE.MeshPhysicalMaterial({color:region.color,metalness:.15,roughness:.16,clearcoat:1});const white=new THREE.MeshStandardMaterial({color:0xf1fbff,roughness:.25});
 const add=(geometry,x=0,y=0,z=0,mat=material)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.castShadow=true;group.add(mesh);return mesh;};
 const box=(x,y,z,w,h,d,mat=material)=>add(new THREE.BoxGeometry(w,h,d),x,y,z,mat);
 const sphere=(x,y,z,r,mat=material)=>add(new THREE.SphereGeometry(r,24,16),x,y,z,mat);
 const ring=(r,x=0,y=0,z=0)=>add(new THREE.TorusGeometry(r,.07,10,48),x,y,z);
 switch(region.kind){
  case 'wifi':box(0,-.6,0,1.8,.35,1.1,white);box(-.65,0,0,.09,1.1,.09);box(.65,0,0,.09,1.1,.09);for(const r of [.4,.8,1.2]){const wave=add(new THREE.TorusGeometry(r,.07,8,40,Math.PI),0,.1,.1);wave.rotation.z=0;}break;
  case 'clients':case 'subscribers':case 'cpe':sphere(0,.45,0,.5);box(0,-.3,0,.8,.8,.6);for(const sign of [-1,1]){sphere(sign*1,.1,.1,.3,white);box(sign*1,-.45,.1,.5,.55,.4,white);}if(region.kind==='cpe')box(0,-1,0,2,.2,1,white);break;
  case 'rack':case 'ports':for(let i=0;i<3;i++){box(0,i*.5-.6,0,1.8,.4,1,white);for(let j=0;j<4;j++)box(-.6+j*.4,i*.5-.6,.52,.22,.16,.05);}break;
  case 'traffic':case 'fiber':case 'tunnel':for(const sign of [-1,1]){const shaft=add(new THREE.CylinderGeometry(.1,.1,1.6,12),sign*.45,0,0);shaft.rotation.z=Math.PI/2;const tip=add(new THREE.ConeGeometry(.35,.55,20),sign*1.1,0,0);tip.rotation.z=-sign*Math.PI/2;}ring(.9).rotation.y=Math.PI/2;break;
  case 'dns':case 'profiles':add(new THREE.OctahedronGeometry(1.05,0));ring(1.35).rotation.x=Math.PI/2;break;
  case 'probe':ring(1);box(.8,-.95,0,.18,.85,.18);sphere(0,0,0,.5,white);break;
  case 'gear':ring(.75);for(let i=0;i<8;i++){const a=i*Math.PI/4;const tooth=box(Math.cos(a)*.95,Math.sin(a)*.95,0,.35,.35,.4);tooth.rotation.z=a;}break;
  case 'hub':case 'routes':sphere(0,0,0,.6);for(let i=0;i<5;i++){const a=i*Math.PI*.4;sphere(Math.cos(a)*1.4,Math.sin(a)*1.4,0,.25,white);const line=add(new THREE.CylinderGeometry(.035,.035,1,8),Math.cos(a),Math.sin(a),0);line.rotation.z=a-Math.PI/2;}break;
  default:sphere(0,0,0,1);ring(1.2).rotation.y=.5;ring(1.2).rotation.x=Math.PI/2;
 }
 return group;
}
export function createSvgBillboard(region){const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><circle cx="64" cy="64" r="55" fill="#${region.color.toString(16).padStart(6,'0')}" stroke="white" stroke-width="5"/><path d="M24 64h80M64 24v80" stroke="white" stroke-width="5"/></svg>`;const texture=new THREE.TextureLoader().load('data:image/svg+xml,'+encodeURIComponent(svg));texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture}));sprite.scale.set(2.5,2.5,1);return sprite;}
