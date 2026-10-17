export const CHUNK_SIZE=12;
export const VOXEL_QUALITY={low:{radius:2,dpr:1,shadows:false,particles:0},medium:{radius:3,dpr:1.5,shadows:true,particles:24},high:{radius:4,dpr:2,shadows:true,particles:64}};
export function groundHeight(x,z){return Math.floor(Math.sin(x*.06)*Math.cos(z*.07)*1.5)*.5;}
export function chunkKey(x,z){return `${Math.floor(x/CHUNK_SIZE)},${Math.floor(z/CHUNK_SIZE)}`}
export function desiredChunks(x,z,radius){const cx=Math.floor(x/CHUNK_SIZE),cz=Math.floor(z/CHUNK_SIZE),chunks=[];for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++)chunks.push({x:cx+dx,z:cz+dz,key:`${cx+dx},${cz+dz}`});return chunks.sort((a,b)=>Math.hypot(a.x-cx,a.z-cz)-Math.hypot(b.x-cx,b.z-cz))}
export function blocked(x,z,regions){return regions.some(r=>Math.abs(x-r.x)<2.7&&Math.abs(z-r.z)<2.7)}
export const voxelNames={overview:'Base Central',wan:'WAN Tower',wifi:'Wi-Fi Forest',clients:'Client Village',lan:'LAN Mine',dhcpdns:'DHCP Farm / DNS Library',diagnostics:'Diagnostic Lab',completeDiagnostics:'Diagnostic Lab completo',profiles:'Arquivo de perfis',management:'Centro de gerenciamento',juniperOverview:'BNG Core',subscribers:'Subscriber City',juniperSubscriber:'Session Tunnel','access-cpe':'CPE Gateway',juniperDiagnostics:'Diagnostics Tower'};

export function safeSpawn(regions,x=0,z=12){for(let i=0;i<30&&blocked(x,z,regions);i++){z+=6;if(z>80){z=-75;x+=6}}return {x,z,y:groundHeight(x,z),velocity:0}}
