import * as THREE from 'three';
export function makeOperator(assets){const group=new THREE.Group(),limbs=[];
 assets.mesh(group,'cylinder',[0,1.15,0],[.38,.85,.3],0x344332);assets.mesh(group,'sphere',[0,1.95,0],[.3,.34,.3],0x655239);assets.mesh(group,'cylinder',[0,2.14,0],[.36,.22,.36],0x303a2c);assets.mesh(group,'box',[0,1.96,-.28],[.4,.14,.05],0x6aff8c,true);
 for(const x of [-.22,.22]){const limb=new THREE.Group();limb.position.set(x,.8,0);assets.mesh(limb,'cylinder',[0,-.35,0],[.12,.7,.13],0x252e24);assets.mesh(limb,'box',[0,-.7,-.1],[.28,.17,.4],0x111a12);group.add(limb);limbs.push(limb)}
 for(const x of [-.48,.48]){const limb=new THREE.Group();limb.position.set(x,1.5,0);assets.mesh(limb,'cylinder',[0,-.25,0],[.11,.55,.12],0x4d5536);group.add(limb);limbs.push(limb)}
 assets.mesh(group,'box',[0,1.2,.38],[.65,.8,.35],0x7b4a2c);assets.mesh(group,'box',[0,1.35,.58],[.3,.22,.08],0x33ff66,true);assets.mesh(group,'cylinder',[.3,1.9,.45],[.025,1.5,.025],0x1b251b);
 return {group,animate(time,moving,running){const phase=Math.sin(time*(running?13:8)),amount=moving ? .48 : .025;limbs.forEach((l,i)=>l.rotation.x=phase*amount*(i%2?1:-1));group.children[0].rotation.z=Math.sin(time*1.7)*.012},dispose(){}};
}
