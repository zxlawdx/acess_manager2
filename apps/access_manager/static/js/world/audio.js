// No remote music or copyrighted recordings: optional synthesized ambient chord.
export class AudioManager {
 constructor(){this.context=null;this.active=false;this.nodes=[];this.volume=.08;}
 async toggle(){
  if(!this.context){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw new Error('Áudio indisponível nesta WebView.');this.context=new Context();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);this.music=this.context.createGain();this.music.connect(this.master);}
  await this.context.resume();this.active=!this.active;
  if(this.active&&!this.nodes.length){for(const f of [130.81,196,261.63,329.63]){const o=this.context.createOscillator();o.type='sine';o.frequency.value=f;o.connect(this.music);o.start();this.nodes.push(o)}}
  this.master.gain.setTargetAtTime(this.active?this.volume:0,this.context.currentTime,.4);return this.active;
 }
 pause(){this.active=false;if(this.context)this.master.gain.setTargetAtTime(0,this.context.currentTime,.1);}
 dispose(){this.nodes.forEach(n=>n.stop());this.nodes=[];this.context?.close();}
}
