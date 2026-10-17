// Original equipment hum, synthesized locally and only after an explicit gesture.
export class FieldAudio{
 constructor({volume=.35,onChange=()=>{}}={}){this.volume=Number(volume)||0;this.active=false;this.onChange=onChange;this.context=null;this.revision=0}
 async play(){const token=++this.revision;if(!this.context){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw new Error('Áudio indisponível nesta WebView.');this.context=new Context();this.gain=this.context.createGain();this.gain.gain.value=0;this.gain.connect(this.context.destination);this.oscillator=this.context.createOscillator();this.oscillator.type='triangle';this.oscillator.frequency.value=55;this.oscillator.connect(this.gain);this.oscillator.start()}await this.context.resume();if(token!==this.revision)return;this.active=true;this.setVolume(this.volume);this.onChange(this.active)}
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));if(this.gain)this.gain.gain.setTargetAtTime(this.active?this.volume*.035:0,this.context.currentTime,.08)}
 pause(){this.revision++;this.active=false;this.setVolume(this.volume);this.context?.suspend()?.catch(()=>{});this.onChange(false)}
 async toggle(){if(this.active)this.pause();else await this.play()}
 dispose(){this.pause();this.oscillator?.stop();this.oscillator?.disconnect();this.gain?.disconnect();this.context?.close();this.context=null}
}
