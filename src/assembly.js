/** Mechanical assembly: a deterministic timeline shared by the renderer and checks.
 * Coordinates are SVG units, never CSS pixels. All links remain rigid.
 */
export const DURATION = 5.8;
export const TIMING = Object.freeze({ enter: .25, travel: 2.15, stagger: .14, release: 3.12, clear: .3, retract: 3.6, retreat: 1.5 });
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x*x*(3-2*x); };
const lerp = (a,b,t) => a+(b-a)*t;
const add = (a,b) => [a[0]+b[0],a[1]+b[1]];
const mul = (a,k) => [a[0]*k,a[1]*k];
export const LETTERS = [
  { char:'M', width:118, path:'M0 132V0H27L59 57 91 0H118V132H90V48L59 101 28 48V132Z', bolts:[[13,13],[105,13],[13,119],[105,119]] },
  { char:'I', width:56, path:'M0 0H56V24H42V108H56V132H0V108H14V24H0Z', bolts:[[9,12],[47,12],[9,120],[47,120]] },
  { char:'E', width:94, path:'M0 0H94V26H29V51H82V77H29V106H94V132H0Z', bolts:[[13,13],[13,119],[80,13],[80,119]] },
  { char:'S', width:100, path:'M96 10C79 0 62 -3 40 1C12 5 0 20 0 40C0 62 16 71 45 77L62 81C72 84 75 87 75 94C75 104 63 109 49 109C32 109 17 104 5 95L0 123C16 132 34 137 55 134C86 131 100 115 100 94C100 70 82 59 56 53L39 49C29 46 26 43 26 37C26 29 35 25 49 25C65 25 77 29 91 36Z', bolts:[[20,26],[78,110]] },
  { char:'S', width:100, path:'M96 10C79 0 62 -3 40 1C12 5 0 20 0 40C0 62 16 71 45 77L62 81C72 84 75 87 75 94C75 104 63 109 49 109C32 109 17 104 5 95L0 123C16 132 34 137 55 134C86 131 100 115 100 94C100 70 82 59 56 53L39 49C29 46 26 43 26 37C26 29 35 25 49 25C65 25 77 29 91 36Z', bolts:[[20,26],[78,110]] },
];
export function solveArm(base, target, l1, l2, bend) {
  const dx=target[0]-base[0],dy=target[1]-base[1],distance=Math.hypot(dx,dy);
  // Paths are validated as reachable; clamping handles subpixel roundoff only.
  const d=Math.max(.0001,distance),along=(l1*l1-l2*l2+d*d)/(2*d);
  const height=Math.sqrt(Math.max(0,l1*l1-along*along));
  return [base[0]+along*dx/d-bend*height*dy/d,base[1]+along*dy/d+bend*height*dx/d];
}
export function computeScene(time, mobile=false) {
  const w=mobile?600:1000,h=mobile?510:440,s=mobile?.89:1,gap=22*s;
  const total=LETTERS.reduce((sum,l)=>sum+l.width*s,0)+4*gap;
  let cursor=(w-total)/2;
  const y=mobile?224:158;
  const starts=[[0,-400],[0,-400],[0,-400],[0,-400],[0,-400]];
  const dirs=[[0,1],[0,1],[0,1],[0,1],[0,1]];
  const lengths=[[200,200],[200,200],[200,200],[200,200],[200,200]];
  const bends=[1,-1,1,-1,1];
  const arms=LETTERS.map((l,i)=>{
    const final=[cursor,y];
    const base=[cursor+l.width*s/2, mobile?-60:-80];
    cursor+=l.width*s+gap;
    const travel=ease((time-TIMING.enter-i*TIMING.stagger)/TIMING.travel);
    const releaseAt=TIMING.release+i*.045;
    const opened=ease((time-releaseAt)/TIMING.clear);
    const retract=ease((time-TIMING.retract-i*.06)/TIMING.retreat);
    const position=add(final,mul(starts[i],1-travel));
    const dir=dirs[i],gripLocal=i===0?[l.width/2,57]:[l.width/2,3];
    const grip=add(position,mul(gripLocal,s));
    const wrist=add(add(grip,mul(dir,-31*s-18*opened)),mul(starts[i],retract));
    const elbow=solveArm(base,wrist,...lengths[i],bends[i]);
    return { ...l,index:i,final,position,grip,wrist,base,elbow,lengths:lengths[i],dir,opened,scale:s,alpha:1-ease((retract-.65)/.35),travel,retract,releaseAt };
  });
  return {w,h,arms,time,wordLeft:(w-total)/2,wordWidth:total,letterY:y,scale:s,done:time>=DURATION};
}
const f=n=>Number(n.toFixed(3));
const point=p=>p.map(f).join(' ');
const circle=(x,y,r,fill,extra='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" ${extra}/>`;
const defs=`<defs>
<linearGradient id="steel-link" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#687b88"/><stop offset=".19" stop-color="#c9d6df"/><stop offset=".42" stop-color="#fcfdff"/><stop offset=".63" stop-color="#c4d2dc"/><stop offset="1" stop-color="#657a8b"/></linearGradient>
<linearGradient id="steel-letter" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="#344f63"/><stop offset=".17" stop-color="#879eae"/><stop offset=".4" stop-color="#dbe6ed"/><stop offset=".49" stop-color="#b5c7d2"/><stop offset=".51" stop-color="#819bad"/><stop offset=".82" stop-color="#3e596e"/><stop offset="1" stop-color="#688597"/></linearGradient>
<linearGradient id="blue-joint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#daedf6"/><stop offset=".5" stop-color="#a8cede"/><stop offset="1" stop-color="#76aac8"/></linearGradient>
<radialGradient id="joint-rim"><stop stop-color="#edf3f6"/><stop offset=".72" stop-color="#dce5eb"/><stop offset="1" stop-color="#6f8594"/></radialGradient>
<filter id="letter-shadow" x="-30%" y="-30%" width="180%" height="190%"><feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#31536a" flood-opacity=".15"/></filter>
</defs>`;
function segment(a,b,width) {
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
  return `<g transform="translate(${point(a)}) rotate(${f(angle)})"><rect x="0" y="${-width/2}" width="${f(length)}" height="${width}" rx="${width/2}" fill="url(#steel-link)" stroke="#607989" stroke-width="1.2"/><path d="M18 ${-width*.28}H${f(length-18)}" stroke="#fff" stroke-opacity=".8"/><path d="M15 ${width*.29}H${f(length-15)}" stroke="#344f62" stroke-opacity=".4"/><rect x="13" y="${-width/2}" width="6" height="${width}" rx="2" fill="#566e7f"/><rect x="${f(length-20)}" y="${-width/2}" width="6" height="${width}" rx="2" fill="#566e7f"/></g>`;
}
function joint(p,r){return `<g transform="translate(${point(p)})">${circle(0,0,r,'url(#joint-rim)','stroke="#637e90" stroke-width="1.3"')}${circle(0,0,r*.77,'url(#blue-joint)','stroke="#81a9c0" stroke-width="1"')}${[0,1,2,3].map(i=>{let a=i*Math.PI/2+.6;return circle(Math.cos(a)*r*.59,Math.sin(a)*r*.59,1.6,'#6c91a8')}).join('')}<path d="M${-r*.3} ${-r*.48}Q0 ${-r*.68} ${r*.34} ${-r*.44}" fill="none" stroke="#f3fbff" stroke-width="1.5"/></g>`}
function gripper(a){
  const angle=Math.atan2(a.dir[1],a.dir[0])*180/Math.PI,spread=(a.index===1?29:21)*a.scale+17*a.opened;
  return `<g class="gripper" transform="translate(${point(a.wrist)}) rotate(${f(angle)})" opacity="${f(a.alpha)}"><rect x="-2" y="-8" width="12" height="16" rx="3" fill="url(#steel-link)" stroke="#4f6d80"/><path d="M7 -5L12 ${f(-spread)}H${f(39*a.scale)}V${f(-spread+5)}M7 5L12 ${f(spread)}H${f(39*a.scale)}V${f(spread-5)}" fill="none" stroke="#476376" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 -5L13 ${f(-spread+1)}H${f(37*a.scale)}M8 5L13 ${f(spread-1)}H${f(37*a.scale)}" fill="none" stroke="#b9ccd7" stroke-width="1"/></g>`;
}
export function sceneMarkup(scene){
  const {arms,w,wordLeft,wordWidth,letterY,scale}=scene;
  const dimY=letterY+167*scale;
  return defs+`<g aria-hidden="true"><path d="M${f(wordLeft-12)} ${f(dimY)}H${f(wordLeft+wordWidth+12)}M${f(wordLeft-12)} ${f(dimY-5)}V${f(dimY+5)}M${f(wordLeft+wordWidth+12)} ${f(dimY-5)}V${f(dimY+5)}" stroke="#93acbc" stroke-opacity=".4" stroke-width="1" fill="none"/>
  ${arms.filter(a=>a.alpha>0.001).map(a=>`<g class="robot-arm" data-letter="${a.char}" opacity="${f(a.alpha)}">${segment(a.base,a.elbow,16*scale)}${segment(a.elbow,a.wrist,12*scale)}${joint(a.base,14*scale)}${joint(a.elbow,12*scale)}${joint(a.wrist,8*scale)}</g>`).join('')}
  ${arms.map(a=>`<g class="metal-letter" data-index="${a.index}" transform="translate(${point(a.position)}) scale(${scale})"><path d="${a.path}" transform="translate(0 4)" fill="#29475c" opacity=".7"/><path d="${a.path}" fill="url(#steel-letter)" stroke="#456176" stroke-width="1" stroke-linejoin="round" filter="url(#letter-shadow)"/>${a.bolts.map(([x,y])=>`${circle(x,y,3,'#d9e6ed','stroke="#496579" stroke-width=".9"')}<path d="M${x-1.5} ${y}H${x+1.5}" stroke="#506f84" stroke-width=".8"/>`).join('')}</g>`).join('')}
  ${arms.filter(a=>a.alpha>0.001).map(gripper).join('')}</g>`;
}
export function renderScene(time,mobile=false){const scene=computeScene(time,mobile);return `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.w}" height="${scene.h}" viewBox="0 0 ${scene.w} ${scene.h}">${sceneMarkup(scene)}</svg>`}
export function initAssembly(){
  const svg=document.querySelector('#assembly'),hero=document.querySelector('#home'),replay=document.querySelector('#replay-assembly'),skip=document.querySelector('#skip-assembly');
  if(!svg||!hero)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 650px)');
  let elapsed=DURATION,previous=null,raf=0,visible=true,disposed=false;
  const draw=()=>{const scene=computeScene(elapsed,mobile.matches);svg.setAttribute('viewBox',`0 0 ${scene.w} ${scene.h}`);svg.innerHTML=sceneMarkup(scene);hero.classList.toggle('is-assembled',elapsed>=4.25);hero.classList.toggle('show-institute',elapsed>=4.65);skip.hidden=elapsed>=DURATION;hero.dataset.assemblyTime=elapsed.toFixed(3)};
  const stop=()=>{cancelAnimationFrame(raf);raf=0;previous=null};
  const tick=now=>{raf=0;if(disposed||!visible||document.hidden)return;if(previous!==null)elapsed=Math.min(DURATION,elapsed+(now-previous)/1000);previous=now;draw();if(elapsed<DURATION)raf=requestAnimationFrame(tick);else previous=null};
  const resume=()=>{if(!raf&&visible&&!document.hidden&&elapsed<DURATION)raf=requestAnimationFrame(tick)};
  const play=()=>{stop();elapsed=motion.matches?DURATION:0;draw();resume()};
  const finish=()=>{stop();elapsed=DURATION;draw()};
  const visibility=()=>{if(document.hidden)stop();else resume()};
  const resize=()=>draw();
  const reduced=()=>{if(motion.matches)finish()};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)resume();else stop()});observer.observe(hero);
  replay.addEventListener('click',play);skip.addEventListener('click',finish);document.addEventListener('visibilitychange',visibility);mobile.addEventListener('change',resize);motion.addEventListener('change',reduced);
  hero.classList.add('animation-ready');play();
  return ()=>{disposed=true;stop();observer.disconnect();replay.removeEventListener('click',play);skip.removeEventListener('click',finish);document.removeEventListener('visibilitychange',visibility);mobile.removeEventListener('change',resize);motion.removeEventListener('change',reduced)};
}
