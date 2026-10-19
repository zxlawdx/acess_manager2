import {normalizeDialogue} from './settings.js';
export class DialogueManager {
 constructor(rules,{random=Math.random,now=()=>Date.now()/1000}={}){this.rules=normalizeDialogue(rules);this.random=random;this.now=now;this.last=new Map();this.sequence=new Map();}
 choose(trigger,{preview=false,profanity='off'}={}){const rule=this.rules[trigger];if(!rule?.enabled||!rule.lines.length)return null;const now=this.now();if(!preview&&now-(this.last.get(trigger)??-Infinity)<rule.cooldownSeconds)return null;let line;if(rule.mode==='sequential'){const n=this.sequence.get(trigger)||0;line=rule.lines[n%rule.lines.length];if(!preview)this.sequence.set(trigger,n+1);}else{let pick=this.random()*rule.lines.reduce((n,l)=>n+l.weight,0);line=rule.lines.find(l=>(pick-=l.weight)<0)||rule.lines.at(-1);}if(!preview)this.last.set(trigger,now);const text=line.text;return profanity==='livre/local'?text:text.replace(/\b(porra|caralho|merda|puta|foder|foda|cacete)\b/gi,profanity==='moderado'?'***':'…');}
}
