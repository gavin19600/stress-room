/* 쓰담쓰담 방 — 강아지·고양이 쓰다듬기 */
H.register('pet',{title:'쓰담쓰담 방',sub:'천천히 계속 쓰다듬으면 재롱을 부려요',floor:2,icon:'🐶',color:'#e0795a',
blurb:'쓰다듬으면 재롱 부리는 친구',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.pt-top{display:flex;align-items:center;gap:10px}
.pt-stats{display:flex;gap:14px;margin-left:auto;font-variant-numeric:tabular-nums}
.pt-stats .s{text-align:right}
.pt-stats b{display:block;font-family:"Jua",var(--display);font-weight:400;font-size:20px;color:#f09a7c;line-height:1}
.pt-stats span{font-size:10px;color:var(--muted)}
.pt-meter{flex:1;height:8px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden;min-width:80px}
.pt-meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#f2b08f,#e0795a);border-radius:inherit;transition:width .2s}
.pt-hint{position:absolute;left:12px;right:12px;top:10px;text-align:center;font-size:13px;color:#3b2a1f;pointer-events:none;transition:opacity .5s;text-wrap:balance}
.pt-hint span{background:rgba(255,250,242,.88);padding:5px 12px;border-radius:999px;display:inline-block}
.pt-seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.pt-seg button{border:0;background:none;padding:7px 14px;font-family:"Jua",var(--display);font-size:16px;color:var(--muted);cursor:pointer}
.pt-seg button[aria-pressed="true"]{background:#e0795a;color:#fffaf2}
.pt-dot{display:inline-block;width:13px;height:13px;border-radius:50%;border:1px solid rgba(0,0,0,.2);vertical-align:-2px;margin-right:5px}
.pt-name{display:flex;gap:6px;flex:1;min-width:190px}
.pt-name input{flex:1;min-width:0;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--fg);font-family:var(--body);font-size:14px}
.pt-found{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.pt-flabel{font-size:11px;color:var(--muted)}
.pt-badge{font-size:12px;padding:4px 10px;border-radius:999px;border:1px dashed var(--line);color:var(--muted)}
.pt-badge.on{border-style:solid;border-color:#f0b49c;background:#fde8dc;color:#3b2a1f}
</style>
<div class="pt-top"><div class="pt-meter" aria-hidden="true"><i data-r="meter"></i></div><div class="pt-stats" data-r="stats"></div></div>
<div class="stage" data-r="stage" style="background:#f4e7d4">
  <canvas data-r="cv" aria-label="쓰다듬을 수 있는 반려동물" style="touch-action:none;cursor:grab"></canvas>
  <div class="pt-hint" data-r="hint"><span>천천히 계속 쓰다듬으면 재롱을 부려요</span></div>
</div>
<div class="row">
  <div class="pt-seg" role="group" aria-label="동물 고르기">
    <button type="button" data-kind="dog" aria-pressed="true">강아지</button>
    <button type="button" data-kind="cat" aria-pressed="false">고양이</button>
  </div>
  <div class="pt-name"><input data-r="nameIn" maxlength="8" aria-label="이름"><button class="btn" data-r="nameBtn" type="button">이름 붙이기</button></div>
</div>
<div class="row" data-r="breeds"></div>
<div class="pt-found" data-r="found" aria-label="재롱 도감"></div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Jua","Noto Sans KR",sans-serif';
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let W=0,H=0,DPR=1,alive=true;
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
const ro=new ResizeObserver(resize); ro.observe(stage); resize();

/* ---------- pets ---------- */
const BREEDS={
 dog:[
  {id:'shiba',label:'시바견',def:'콩이',base:'#d98a3f',light:'#f7ecdc',dark:'#a8612a',ears:'up',tail:'curl',nose:'#2a1d18'},
  {id:'jindo',label:'진돗개 백구',def:'백구',base:'#f1e7d2',light:'#fffaf0',dark:'#d3c4a8',ears:'up',tail:'curl',nose:'#2a1d18'},
  {id:'maltese',label:'말티즈',def:'구름이',base:'#f8f4ee',light:'#ffffff',dark:'#e2d8c8',ears:'flop',tail:'plume',fluffy:true,nose:'#2a2020'},
  {id:'poodle',label:'푸들',def:'초코',base:'#9b603a',light:'#b4774d',dark:'#74472a',ears:'flop',tail:'pom',fluffy:true,nose:'#2a1a14'},
  {id:'corgi',label:'웰시코기',def:'식빵',base:'#e0954a',light:'#fbf3e6',dark:'#b06a2c',ears:'big',tail:'stub',blaze:true,nose:'#2a1d18'}
 ],
 cat:[
  {id:'cheese',label:'치즈냥',def:'치즈',base:'#eba25a',light:'#fbe9cf',dark:'#bf7331',pattern:'tabby',eye:['#d4a62a','#d4a62a']},
  {id:'mackerel',label:'고등어',def:'고등어',base:'#9b958e',light:'#ebe6de',dark:'#4c4844',pattern:'tabby',eye:['#86b04c','#86b04c']},
  {id:'calico',label:'삼색이',def:'삼순이',base:'#f7f1e6',light:'#ffffff',dark:'#d9cdbb',pattern:'calico',eye:['#d4a62a','#d4a62a']},
  {id:'tuxedo',label:'턱시도',def:'턱시',base:'#2c2828',light:'#f6f2ea',dark:'#151313',pattern:'tux',eye:['#a8c94e','#a8c94e']},
  {id:'white',label:'흰냥이',def:'설기',base:'#f8f5ef',light:'#ffffff',dark:'#ddd4c6',eye:['#6aa8dc','#d9b44a']},
  {id:'black',label:'까만냥',def:'깜냥',base:'#2b272a',light:'#3b363a',dark:'#151315',eye:['#e3bb3a','#e3bb3a']}
 ]
};
let kind='dog',breed=BREEDS.dog[0],petName=breed.def;
const names=Hp.store.get('petnames',{});
petName=names[breed.id]||breed.def;
function renderBreeds(){ $('breeds').innerHTML=BREEDS[kind].map(b=>`<button class="chip" type="button" data-b="${b.id}" aria-pressed="${b===breed}"><span class="pt-dot" style="background:${b.base}"></span>${b.label}</button>`).join(''); }
function pick(b){ breed=b; petName=names[b.id]||b.def; $('nameIn').value=petName; renderBreeds(); mood=Math.min(mood,20); happyShown=false; act=null; combo=0; marksHit.clear(); renderFound(); stats(); hello(); }
root.querySelectorAll('[data-kind]').forEach(btn=>btn.onclick=()=>{ kind=btn.dataset.kind; root.querySelectorAll('[data-kind]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn))); pick(BREEDS[kind][0]); });
$('breeds').addEventListener('click',e=>{ const c=e.target.closest('[data-b]'); if(c) pick(BREEDS[kind].find(b=>b.id===c.dataset.b)); });
function setName(){ const v=$('nameIn').value.trim().slice(0,8); if(!v) return; petName=v; names[breed.id]=v; Hp.store.set('petnames',names); hint(`이제 이름은 ${Hp.esc(v)}예요`); $('nameIn').blur(); }
$('nameBtn').onclick=setName; $('nameIn').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); setName(); } });

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null,nb=null,purr=null,rustle=null;
function audio(){
  if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=nb.getChannelData(0); let l=0; for(let i=0;i<d.length;i++){ const w=Math.random()*2-1; l=(l+.02*w)/1.02; d[i]=w*.5+l*2; }
    const n=ac.createBufferSource(); n.buffer=nb; n.loop=true; const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=300;
    const am=ac.createGain(); am.gain.value=.5; const lfo=ac.createOscillator(); lfo.type='triangle'; lfo.frequency.value=26; const dep=ac.createGain(); dep.gain.value=.5; lfo.connect(dep); dep.connect(am.gain);
    const lv=ac.createGain(); lv.gain.value=0; n.connect(lp); lp.connect(am); am.connect(lv); lv.connect(master); n.start(); lfo.start(); purr={lv,lfo,n};
    const r=ac.createBufferSource(); r.buffer=nb; r.loop=true; const hp=ac.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=2800; const rg=ac.createGain(); rg.gain.value=0; r.connect(hp); hp.connect(rg); rg.connect(master); r.start(); rustle=rg; rustle._src=r; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function noise(at,dur,type,f,q,vol){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()); n.stop(t+dur+.02); }
function voice(at,pts,vol,type,formant){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sawtooth'; o.frequency.setValueAtTime(pts[0][1],t); pts.slice(1).forEach(([dt,f])=>o.frequency.exponentialRampToValueAtTime(f,t+dt));
  const end=pts[pts.length-1][0]; const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=formant||1400; bp.Q.value=1.4; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.05); g.gain.setValueAtTime(vol,t+end*.7); g.gain.exponentialRampToValueAtTime(.0001,t+end);
  o.connect(bp); bp.connect(g); g.connect(master); o.start(t); o.stop(t+end+.02); }
const timers=new Set(); const later=(f,ms)=>{ const id=setTimeout(()=>{ timers.delete(id); if(alive) f(); },ms); timers.add(id); };
const SFX={
  meow(h){ const k=h?1.25:1; voice(0,[[0,520*k],[.16,820*k],[.5,470*k]],.22,'sawtooth',1500); voice(0,[[0,1040*k],[.16,1640*k],[.5,940*k]],.05,'sine',2400); },
  mew(){ voice(0,[[0,780],[.12,980],[.26,700]],.16,'sawtooth',1800); },
  bark(){ noise(0,.09,'lowpass',1100,.7,.35); voice(0,[[0,330],[.05,420],[.14,210]],.3,'sawtooth',900); },
  whine(){ voice(0,[[0,880],[.18,1380],[.42,1080]],.07,'sine',1400); },
  pant(){ noise(0,.12,'bandpass',1400,.8,.08); noise(.18,.1,'bandpass',1150,.8,.06); },
  sneeze(){ noise(0,.04,'bandpass',900,1,.15); noise(.12,.12,'highpass',2500,.6,.3); },
  swat(){ noise(0,.06,'bandpass',2200,1,.18); voice(.02,[[0,600],[.1,900],[.18,500]],.12,'sawtooth',1600); },
  chime(){ [784,1175,1568].forEach((f,i)=>voice(i*.1,[[0,f],[1.2,f]],.05,'sine',f)); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- state ---------- */
let mood=10,strokes=0,travel=0,seconds=0,happyShown=false,bellyT=0,swat=0,boop=0,blinkT=2,blinking=0,slowBlink=0,earTw=0,lastPant=0,tWag=0;
let ptr=null; const hearts=[],furs=[],pops=[];
const TRICKS={
 dog:[{id:'paw',name:'손!',dur:1.7},{id:'spin',name:'빙글빙글',dur:1.3},{id:'jump',name:'깡총깡총',dur:1.4},{id:'lick',name:'할짝 뽀뽀',dur:1.6},{id:'tilt',name:'갸웃갸웃',dur:1.9},{id:'roll',name:'발라당',dur:2.6}],
 cat:[{id:'knead',name:'꾹꾹이',dur:2.6},{id:'rub',name:'부비부비',dur:2.1},{id:'blink',name:'눈키스',dur:2},{id:'stretch',name:'기지개 하암~',dur:2.2},{id:'punch',name:'냥냥펀치',dur:1.6},{id:'roll',name:'발라당',dur:2.6}]
};
let act=null,actCD=0,combo=0,comboIdle=0;
const fs=Hp.store.get('petfound',{dog:[],cat:[]});
const found={dog:new Set(fs.dog||[]),cat:new Set(fs.cat||[])},marksHit=new Set(),MARKS=[45,75,100];
function saveFound(){ Hp.store.set('petfound',{dog:[...found.dog],cat:[...found.cat]}); }
function renderFound(){ const L=TRICKS[kind]; $('found').innerHTML=`<span class="pt-flabel">재롱 도감 ${found[kind].size}/${L.length}</span>`+L.map(x=>found[kind].has(x.id)?`<span class="pt-badge on">${x.name}</span>`:`<span class="pt-badge">???</span>`).join(''); }
function trickSound(id){ if(!audio()) return;
  const S2={
   paw:()=>{ SFX.whine(); later(SFX.bark,500); },
   spin:()=>{ noise(0,.9,'bandpass',700,.6,.12); later(SFX.bark,1000); },
   jump:()=>{ voice(0,[[0,320],[.22,900]],.08,'sine',900); voice(.7,[[0,320],[.22,900]],.08,'sine',900); },
   lick:()=>{ noise(0,.08,'bandpass',2600,1.5,.18); noise(.3,.08,'bandpass',2400,1.5,.18); noise(.6,.08,'bandpass',2600,1.5,.16); SFX.whine(); },
   tilt:()=>{ voice(0,[[0,700],[.3,1300]],.07,'sine',1300); voice(.9,[[0,750],[.3,1350]],.07,'sine',1300); },
   roll:()=>{ if(kind==='dog'){ SFX.whine(); later(SFX.bark,900); } else SFX.meow(true); },
   knead:()=>{ for(let i=0;i<8;i++) noise(i*.3,.07,'lowpass',420,.7,.14); },
   rub:()=>{ SFX.mew(); later(SFX.mew,900); },
   blink:()=>{ SFX.mew(); },
   stretch:()=>{ voice(.2,[[0,520],[.5,620],[1.1,360]],.16,'sawtooth',1000); },
   punch:()=>{ for(let i=0;i<4;i++) noise(i*.2,.05,'bandpass',2300,1,.16); later(SFX.mew,900); }
  }; (S2[id]||(()=>{}))(); }
function startTrick(){ if(act||actCD>0) return false; const L=TRICKS[kind],fresh=L.filter(x=>!found[kind].has(x.id));
  const tr=(fresh.length&&Math.random()<.8)?fresh[Math.floor(Math.random()*fresh.length)]:L[Math.floor(Math.random()*L.length)];
  const isNew=!found[kind].has(tr.id); act=Object.assign({},tr,{t:0}); actCD=2.2; found[kind].add(tr.id); if(isNew) saveFound();
  if(kind==='dog'&&(tr.id==='paw'||tr.id==='spin'||tr.id==='jump')) tWag=tr.dur;
  if(tr.id==='blink') slowBlink=tr.dur;
  pops.push({t:0,txt:tr.name+(isNew?' · 새 재롱!':'')}); trickSound(tr.id); buzz([20,30,40]);
  for(let i=0;i<8;i++) hearts.push({x:cx+rand(-90,90)*S,y:cy+rand(-120,20)*S,vy:rand(-70,-40),vx:rand(-20,20),t:1,s:rand(.8,1.3)});
  renderFound(); stats();
  if(isNew&&found[kind].size===L.length) later(()=>{ pops.push({t:0,txt:'재롱 도감 완성!'}); SFX.chime(); },1700);
  return true; }
let hintTimer=0; function hint(t){ const h=$('hint'); h.innerHTML=`<span>${t}</span>`; h.style.opacity=1; clearTimeout(hintTimer); hintTimer=setTimeout(()=>h.style.opacity=0,3800); }
function hello(){ const n=Hp.esc(petName); hint(kind==='dog'?`${n}가 꼬리를 흔들며 기다려요. 머리와 등, 배를 계속 쓰다듬으면 재롱을 부려요`:`${n}가 슬쩍 다가왔어요. 머리와 턱 밑을 계속 쓰다듬으면 재롱을 부려요`); }
function stats(){ const m=Math.round(mood);
  $('stats').innerHTML=[[m+'%','기분'],[Math.floor(combo)+'초','연속 쓰담'],[`${found[kind].size}/${TRICKS[kind].length}`,'재롱']].map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join(''); $('meter').style.width=m+'%'; }

/* ---------- geometry (pet units) ---------- */
let cx=0,cy=0,S=1,lean=0,leanY=0;
function geo(){ S=Math.min(W/430,H/420)*.95; cx=W/2; cy=H*.5+H*.02; }
function toPet(x,y){ return {x:(x-cx)/S,y:(y-cy)/S}; }
function headC(){ return {x:lean,y:-78+leanY}; }
function zone(p){ const h=headC(); if(Math.hypot(p.x-h.x,p.y-(h.y+22))<15) return 'nose';
  if(Math.pow((p.x-h.x)/86,2)+Math.pow((p.y-h.y)/74,2)<1) return p.y>h.y+34?'chin':'head';
  const rx=kind==='cat'?84:94; if(Math.pow(p.x/rx,2)+Math.pow((p.y-55)/104,2)<1) return (Math.abs(p.x)<44&&p.y>40&&p.y<140)?'belly':'back';
  if(p.y>130&&p.y<170&&Math.abs(p.x)<60) return 'paw';
  return null; }

/* ---------- input ---------- */
const pt=e=>{ const r=cv.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; };
let hover=null;
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); try{cv.setPointerCapture(e.pointerId)}catch(_){} const [x,y]=pt(e); ptr={id:e.pointerId,x,y,lx:x,ly:y,sx:x,sy:y,v:0,moved:0,t0:performance.now(),z:zone(toPet(x,y))}; });
cv.addEventListener('pointermove',e=>{ const [x,y]=pt(e); if(!ptr){ hover={x,y}; return; } if(ptr.id!==e.pointerId) return; const d=Math.hypot(x-ptr.lx,y-ptr.ly); ptr.moved+=d; ptr.acc=(ptr.acc||0)+d; ptr.x=x; ptr.y=y; ptr.lx=x; ptr.ly=y; ptr.z=zone(toPet(x,y)); hover={x,y}; });
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{ if(!ptr||ptr.id!==e.pointerId) return; if(ptr.moved<8&&performance.now()-ptr.t0<350) tap(ptr.z); ptr=null; }));
cv.addEventListener('pointerleave',()=>{ if(!ptr) hover=null; });
function tap(z){ if(!z) return;
  if(z==='nose'){ boop=1; if(kind==='dog'){ SFX.sneeze(); pops.push({t:0,txt:'에취!'}); } else { SFX.mew(); pops.push({t:0,txt:'냥?'}); } buzz(15); return; }
  if(kind==='dog'){ SFX.bark(); pops.push({t:0,txt:'멍!'}); tWag=1.2; } else { SFX.meow(mood>60); pops.push({t:0,txt:'야옹'}); earTw=1; }
  mood=clamp(mood+2,0,100); buzz(10); if(mood>60&&Math.random()<.3) later(startTrick,500); }

/* ---------- update ---------- */
let rustleV=0,strokeBuzz=0;
function update(dt,t){
  seconds+=dt; geo();
  const stroking=ptr&&ptr.z&&ptr.z!=='nose'&&ptr.z!=='paw'&&ptr.moved>6;
  let speed=0;
  if(ptr){ speed=(ptr.acc||0)/Math.max(dt,.001)/S; ptr.acc=0; ptr.v+=(speed-ptr.v)*Math.min(1,dt*10); }
  const v=ptr?ptr.v:0, gentle=v>40&&v<900;
  if(stroking&&v>15){
    let rate={head:8,chin:10,back:6.5,belly:kind==='dog'?11:0}[ptr.z]||0;
    if(kind==='cat'&&ptr.z==='belly'){ bellyT+=dt; if(bellyT>1.1&&swat<=0){ swat=1; bellyT=0; mood=clamp(mood-6,0,100); SFX.swat(); pops.push({t:0,txt:'앗, 배는 싫대요!'}); buzz([20,30,20]); } }
    else bellyT=Math.max(0,bellyT-dt);
    mood=clamp(mood+rate*dt*(gentle?1:.3),0,100);
    travel+=v*dt; if(travel>150){ travel=0; strokes++; }
    strokeBuzz+=dt; if(strokeBuzz>.35){ strokeBuzz=0; buzz(kind==='cat'?[6,20,6]:8); }
    if(!gentle&&v>=900&&Math.random()<dt*1.2) hint('너무 빨라요. 천천히 쓰다듬어 주세요');
    if(Math.random()<dt*(1+mood/18)) hearts.push({x:ptr.x+rand(-12,12),y:ptr.y-10,vy:rand(-60,-36),vx:rand(-14,14),t:1,s:rand(.7,1.2)});
    if(Math.random()<dt*Math.min(30,v/30)) furs.push({x:ptr.x,y:ptr.y,vx:rand(-50,50),vy:rand(-60,-10),t:1,a:rand(0,TAU)});
    if(ptr.z==='head'||ptr.z==='chin'){ const p=toPet(ptr.x,ptr.y); lean+=(clamp(p.x*.12,-12,12)-lean)*Math.min(1,dt*6); leanY+=((ptr.z==='chin'?-6:4)-leanY)*Math.min(1,dt*6); }
    if(kind==='dog'&&mood>55&&t-lastPant>.6){ lastPant=t; SFX.pant(); }
    if(kind==='dog'&&Math.random()<dt*.15) SFX.whine();
  } else { mood=clamp(mood-dt*1.2,0,100); lean+=(Math.sin(t*.6)*3-lean)*Math.min(1,dt*2); leanY+=(0-leanY)*Math.min(1,dt*3); bellyT=Math.max(0,bellyT-dt); }
  actCD=Math.max(0,actCD-dt); if(act){ act.t+=dt; if(act.t>=act.dur) act=null; }
  if(stroking&&gentle&&(kind==='dog'||ptr.z!=='belly')){ comboIdle=0; const b0=Math.floor(combo/4); combo+=dt; if(Math.floor(combo/4)>b0) startTrick(); }
  else { comboIdle+=dt; if(comboIdle>.8) combo=0; }
  MARKS.forEach(mk=>{ if(mood>=mk-.5&&!marksHit.has(mk)&&startTrick()) marksHit.add(mk); if(mood<mk-25) marksHit.delete(mk); });
  if(mood>=99.5&&!happyShown){ happyShown=true; pops.push({t:0,txt:kind==='dog'?`${petName} 행복 최고!`:'골골송 최고!'}); SFX.chime(); if(kind==='dog'){ SFX.bark(); tWag=2; } else slowBlink=1.4; buzz([30,40,70]); }
  if(mood<70) happyShown=false;
  if(ac&&purr){ const tt=ac.currentTime; const pl=kind==='cat'?(stroking?.12+.4*mood/100:(mood>65?.07:0)):0; purr.lv.gain.setTargetAtTime(pl,tt,.25); purr.lfo.frequency.setTargetAtTime(24+mood*.05,tt,.5);
    rustleV+=((stroking?Math.min(.05,v*.00007):0)-rustleV)*Math.min(1,dt*10); rustle.gain.setTargetAtTime(rustleV,tt,.05); }
  blinkT-=dt; if(blinkT<=0){ blinking=.14; blinkT=rand(2.5,5.5); } blinking=Math.max(0,blinking-dt);
  slowBlink=Math.max(0,slowBlink-dt); swat=Math.max(0,swat-dt*2.2); boop=Math.max(0,boop-dt*3); earTw=Math.max(0,earTw-dt*3); tWag=Math.max(0,tWag-dt);
  if(kind==='cat'&&Math.random()<dt*.12) earTw=1;
  if(Math.random()<dt*.5) stats();
}

/* ---------- drawing helpers ---------- */
function E(x,y,rx,ry,rot,fill){ ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rot||0,0,TAU); ctx.fillStyle=fill; ctx.fill(); }
function fluffE(x,y,rx,ry,fill,n){ E(x,y,rx,ry,0,fill); if(!breed.fluffy) return; const r=Math.min(rx,ry)*.2; for(let i=0;i<n;i++){ const a=i/n*TAU; E(x+Math.cos(a)*rx*.96,y+Math.sin(a)*ry*.96,r,r,0,fill); } }
function heart(x,y,s,a){ ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.globalAlpha=a; ctx.fillStyle='#ef6f6c'; ctx.beginPath(); ctx.moveTo(0,4); ctx.bezierCurveTo(-12,-6,-6,-14,0,-7); ctx.bezierCurveTo(6,-14,12,-6,0,4); ctx.fill(); ctx.restore(); }
function rrect(x,y,w,h,r){ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h); }

function drawRoom(t){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#f6ead8'); g.addColorStop(.62,'#efdcc2'); g.addColorStop(.62,'#d8b58a'); g.addColorStop(1,'#c49e72'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const wx=W*.18,wy=H*.1,ww=Math.min(W*.24,140),wh=H*.3; ctx.fillStyle='#fbf5ea'; ctx.fillRect(wx,wy,ww,wh); ctx.fillStyle='#cfe3ea'; ctx.fillRect(wx+6,wy+6,ww-12,wh-12);
  ctx.fillStyle='#fbf5ea'; ctx.fillRect(wx+ww/2-2,wy,4,wh); ctx.fillRect(wx,wy+wh/2-2,ww,4);
  const lg=ctx.createRadialGradient(wx+ww/2,H*.7,10,wx+ww/2,H*.7,W*.6); lg.addColorStop(0,'rgba(255,240,210,.45)'); lg.addColorStop(1,'rgba(255,240,210,0)'); ctx.fillStyle=lg; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(120,80,45,.18)'; ctx.lineWidth=1; for(let y=H*.62+18;y<H;y+=22){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const px=W*.86,py=H*.62; ctx.fillStyle='#c9774f'; ctx.beginPath(); ctx.moveTo(px-22,py-34); ctx.lineTo(px+22,py-34); ctx.lineTo(px+16,py); ctx.lineTo(px-16,py); ctx.fill();
  for(let i=0;i<6;i++){ ctx.save(); ctx.translate(px,py-34); ctx.rotate(-1.1+i*.44+Math.sin(t*.8+i)*.04); E(0,-28,9,28,0,'#6f9a5a'); ctx.restore(); }
  E(cx,cy+170*S,190*S,46*S,0,'#e9b9a0'); ctx.strokeStyle='rgba(255,250,242,.7)'; ctx.lineWidth=3; ctx.setLineDash([2,7]); ctx.beginPath(); ctx.ellipse(cx,cy+170*S,170*S,38*S,0,0,TAU); ctx.stroke(); ctx.setLineDash([]);
}

function drawPet(t){
  const b=breed,isCat=kind==='cat',m=mood/100;
  const stroking=ptr&&ptr.z&&ptr.z!=='nose'&&ptr.moved>6;
  const A=act?act.id:null,ap=act?act.t/act.dur:0,env=act?Math.min(1,Math.sin(Math.min(1,ap)*Math.PI)*1.6):0;
  const happyEyes=(stroking&&mood>25)||slowBlink>0||['knead','rub','lick','roll'].includes(A);
  ctx.save(); ctx.translate(cx,cy); ctx.scale(S,S);
  if(A==='spin') ctx.scale(Math.cos(ap*TAU)||.001,1);
  if(A==='jump'){ const hop=Math.abs(Math.sin(ap*Math.PI*2)); ctx.translate(0,-70*hop); ctx.translate(0,160); ctx.scale(1+.06*(1-hop)*env,1-.06*(1-hop)*env); ctx.translate(0,-160); }
  if(A==='roll'){ ctx.translate(0,160-80*env); ctx.rotate(-env*Math.PI/2*.92); ctx.translate(0,-160); }
  if(A==='stretch'){ ctx.translate(0,160); ctx.scale(1-.06*env,1+.13*env); ctx.translate(0,-160); }
  const breathe=1+Math.sin(t*2.2)*.012;
  E(0,168,128,20,0,'rgba(90,50,25,.18)');
  ctx.lineCap='round'; ctx.lineJoin='round';
  if(isCat){ const sway=Math.sin(t*1.3)*22*(1-m*.5),up=m*40;
    ctx.strokeStyle=b.base; ctx.lineWidth=20; ctx.beginPath(); ctx.moveTo(60,140); ctx.quadraticCurveTo(160+sway,120,128+sway*.6,10-up); ctx.quadraticCurveTo(122+sway*.4,-26-up,104+sway,-20-up); ctx.stroke();
    if(b.pattern==='tabby'){ ctx.strokeStyle=b.dark; ctx.globalAlpha=.65; ctx.setLineDash([9,13]); ctx.lineWidth=20; ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1; }
    if(b.pattern==='tux'||b.pattern==='calico'){ ctx.strokeStyle=b.pattern==='tux'?b.base:'#3a3330'; ctx.lineWidth=20; ctx.beginPath(); ctx.moveTo(122+sway*.4,-12-up); ctx.quadraticCurveTo(116+sway*.6,-26-up,104+sway,-20-up); ctx.stroke(); }
  } else { const wagS=6+m*14+tWag*10,amp=.12+m*.45+tWag*.3,w=Math.sin(t*wagS)*amp;
    ctx.save();
    if(b.tail==='curl'){ ctx.translate(72,30); ctx.rotate(w*.5); ctx.strokeStyle=b.base; ctx.lineWidth=26; ctx.beginPath(); ctx.arc(10,-34,26,Math.PI*.55,Math.PI*2.15); ctx.stroke(); ctx.strokeStyle=b.light; ctx.lineWidth=12; ctx.beginPath(); ctx.arc(10,-34,26,Math.PI*1.75,Math.PI*2.15); ctx.stroke(); }
    else { ctx.translate(78,92); ctx.rotate(-.9+w); const L=b.tail==='stub'?26:b.tail==='pom'?52:62; ctx.strokeStyle=b.base; ctx.lineWidth=b.tail==='stub'?24:18; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(L*.5,-8,L,0); ctx.stroke();
      if(b.tail==='pom') E(L+6,0,20,18,0,b.base); if(b.tail==='plume'){ for(let i=0;i<5;i++) E(L*.4+i*9,-4+Math.sin(i)*3,11,9,0,b.base); } }
    ctx.restore(); }
  fluffE(-72,124,50,40,b.base,10); fluffE(72,124,50,40,b.base,10);
  if(b.pattern==='calico'){ ctx.save(); ctx.beginPath(); ctx.ellipse(72,124,50,40,0,0,TAU); ctx.clip(); E(86,112,36,30,0,'#e59a4d'); ctx.restore(); }
  ctx.save(); ctx.translate(0,55); ctx.scale(1,breathe); const brx=isCat?84:94;
  fluffE(0,0,brx,104,b.base,16);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0,0,brx,104,0,0,TAU); ctx.clip();
  if(b.pattern==='calico'){ E(-58,-40,48,44,0,'#3a3330'); E(62,20,46,56,0,'#e59a4d'); }
  if(b.pattern==='tabby'){ ctx.strokeStyle=b.dark; ctx.globalAlpha=.55; ctx.lineWidth=9; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(-brx-30,-46+i*30,70,-.45,.35); ctx.stroke(); ctx.beginPath(); ctx.arc(brx+30,-46+i*30,70,Math.PI-.35,Math.PI+.45); ctx.stroke(); } ctx.globalAlpha=1; }
  E(0,-14,isCat?44:52,78,0,b.light);
  ctx.restore(); ctx.restore();
  for(const sx of [-1,1]){ ctx.save(); const raised=sx===1&&swat>0; let lr=0,ll=0;
    if(A==='paw'&&sx===1){ lr=-1.5*env+Math.sin(act.t*13)*.25*env; ll=16*env; }
    if(A==='knead'){ ll=Math.max(0,Math.sin(act.t*8+(sx>0?Math.PI:0)))*16*env; }
    if(A==='punch'){ const ph=Math.max(0,Math.sin(act.t*15+(sx>0?Math.PI:0))); lr=-1.4*ph*env; ll=10*ph*env; }
    if(A==='roll'){ lr=Math.sin(act.t*9+sx)*.45*env; }
    if(raised){ const k=Math.sin(swat*Math.PI); ctx.translate(30,120); ctx.rotate(-1.4*k); ctx.translate(-30,-120-14*k); }
    else if(lr||ll){ ctx.translate(sx*30,120); ctx.rotate(lr*sx); ctx.translate(-sx*30,-120-ll); }
    const legC=(b.pattern==='tux'||b.id==='shiba'||b.id==='corgi')?b.light:b.base;
    ctx.fillStyle=b.base; rrect(sx*30-18,64,36,90,18); ctx.fill();
    if(legC!==b.base){ ctx.fillStyle=legC; ctx.fillRect(sx*30-18,120,36,30); }
    E(sx*30,152,25,15,0,legC);
    ctx.strokeStyle='rgba(60,35,20,.25)'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(sx*30-7,148); ctx.lineTo(sx*30-7,158); ctx.moveTo(sx*30+7,148); ctx.lineTo(sx*30+7,158); ctx.stroke();
    if(raised){ E(30,150,8,6,0,'#f1a8a8'); }
    ctx.restore(); }
  const h=headC(); ctx.save(); let hx=h.x,hrot=lean*.012+Math.sin(t*.5)*.02,hs=1; if(A==='tilt') hrot+=Math.sin(act.t*3.3)*.45*env; if(A==='rub'){ hrot+=Math.sin(act.t*7)*.28*env; hx+=Math.sin(act.t*7)*16*env; } if(A==='lick') hs=1+.16*env;
  ctx.translate(hx,h.y); ctx.rotate(hrot); ctx.scale(hs,hs); const boopS=1-boop*.06; ctx.scale(1+boop*.03,boopS);
  const HR=isCat?{x:84,y:70}:{x:80,y:74};
  const tw=earTw>0?Math.sin(earTw*TAU*2)*.25:0;
  if(isCat){ for(const sx of [-1,1]){ ctx.save(); ctx.translate(sx*52,-46); ctx.rotate(sx*(.18+(sx===1?tw:0))); ctx.fillStyle=(b.pattern==='calico'&&sx===-1)?'#3a3330':(b.pattern==='calico'?'#e59a4d':b.base);
      ctx.beginPath(); ctx.moveTo(-26,10); ctx.quadraticCurveTo(-6,-60,4,-52); ctx.quadraticCurveTo(22,-30,26,10); ctx.closePath(); ctx.fill(); ctx.fillStyle='#f3b3ad'; ctx.beginPath(); ctx.moveTo(-14,6); ctx.quadraticCurveTo(-4,-38,3,-36); ctx.quadraticCurveTo(14,-20,15,6); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  else if(b.ears==='up'||b.ears==='big'){ const big=b.ears==='big'?1.3:1; for(const sx of [-1,1]){ ctx.save(); ctx.translate(sx*48,-50); ctx.rotate(sx*(.28+Math.sin(t*3)*.02*m)); ctx.scale(big,big); ctx.fillStyle=b.base;
      ctx.beginPath(); ctx.moveTo(-24,14); ctx.quadraticCurveTo(-8,-54,2,-50); ctx.quadraticCurveTo(20,-26,24,14); ctx.closePath(); ctx.fill(); ctx.fillStyle=b.id==='jindo'?'#f2c9bd':'#f0c4a8'; ctx.beginPath(); ctx.moveTo(-12,8); ctx.quadraticCurveTo(-4,-32,2,-30); ctx.quadraticCurveTo(12,-16,13,8); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  fluffE(0,0,HR.x,HR.y,b.base,18);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0,0,HR.x,HR.y,0,0,TAU); ctx.clip();
  if(b.pattern==='calico'){ E(-58,-38,48,42,0,'#3a3330'); E(56,-40,44,38,0,'#e59a4d'); }
  if(b.pattern==='tabby'){ ctx.strokeStyle=b.dark; ctx.globalAlpha=.6; ctx.lineWidth=7; [-14,0,14].forEach(x=>{ ctx.beginPath(); ctx.moveTo(x,-66); ctx.lineTo(x*.8,-40); ctx.stroke(); });
    for(const sx of [-1,1]){ ctx.beginPath(); ctx.moveTo(sx*84,2); ctx.lineTo(sx*58,6); ctx.moveTo(sx*84,18); ctx.lineTo(sx*60,20); ctx.stroke(); } ctx.globalAlpha=1; }
  if(b.blaze){ ctx.fillStyle=b.light; ctx.beginPath(); ctx.moveTo(-6,-74); ctx.lineTo(6,-74); ctx.lineTo(14,0); ctx.lineTo(-14,0); ctx.fill(); }
  if(b.id==='shiba'||b.id==='corgi'){ E(-40,26,30,26,0,b.light); E(40,26,30,26,0,b.light); }
  if(b.pattern==='tux'){ ctx.fillStyle=b.light; ctx.beginPath(); ctx.moveTo(0,-30); ctx.quadraticCurveTo(-30,0,-48,70); ctx.lineTo(48,70); ctx.quadraticCurveTo(30,0,0,-30); ctx.fill(); }
  ctx.restore();
  if(!isCat&&b.ears==='flop'){ for(const sx of [-1,1]){ ctx.save(); ctx.translate(sx*66,-26); ctx.rotate(sx*(-.2+Math.sin(t*2.5)*.04*(.3+m))); fluffE(0,34,24,44,b.dark,10); ctx.restore(); } }
  if(isCat){ E(-12,22,17,13,0,b.light); E(12,22,17,13,0,b.light); }
  else E(0,24,40,30,0,b.light);
  const look=hover?toPet(hover.x,hover.y):{x:0,y:0}; const lx=clamp((look.x-h.x)/40,-4,4),ly=clamp((look.y-h.y)/40,-3,3);
  const ex=isCat?32:30,ey=isCat?-10:-12;
  for(const [i,sx] of [[0,-1],[1,1]]){ const x=sx*ex,y=ey;
    if(happyEyes){ ctx.strokeStyle='#2a1d18'; ctx.lineWidth=4.5; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(x,y+5,12,Math.PI*1.12,Math.PI*1.88); ctx.stroke(); }
    else if(blinking>0){ ctx.strokeStyle='#2a1d18'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x-11,y); ctx.lineTo(x+11,y); ctx.stroke(); }
    else if(isCat){ E(x,y,15,16,0,b.eye[i]); const pw=3+m*5; E(x+lx,y+ly,pw,13,0,'#1b1412'); E(x-4+lx*.5,y-6,3.4,3.4,0,'#fff'); ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(x,y,15,16,0,0,TAU); ctx.stroke(); }
    else { E(x+lx*.5,y+ly*.5,12,13,0,'#2a1d18'); E(x-4+lx*.5,y-5+ly*.5,4,4,0,'#fff'); E(x+4+lx*.5,y+3+ly*.5,2,2,0,'rgba(255,255,255,.8)'); } }
  ctx.globalAlpha=.15+m*.45; E(-50,18,13,8,0,'#f39a96'); E(50,18,13,8,0,'#f39a96'); ctx.globalAlpha=1;
  if(isCat){ ctx.fillStyle='#e8918c'; ctx.beginPath(); ctx.moveTo(-7,10); ctx.lineTo(7,10); ctx.lineTo(0,18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#5a3a30'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(0,18); ctx.lineTo(0,23); ctx.moveTo(0,23); ctx.quadraticCurveTo(-6,30,-12,24); ctx.moveTo(0,23); ctx.quadraticCurveTo(6,30,12,24); ctx.stroke();
    ctx.strokeStyle=b.id==='black'||b.id==='tuxedo'?'rgba(255,255,255,.6)':'rgba(60,40,30,.45)'; ctx.lineWidth=1.4;
    if(A==='stretch'&&env>.25){ E(0,32,12*env,15*env,0,'#6e2a2a'); E(0,40,7*env,6*env,0,'#ef8a90'); }
    for(const sx of [-1,1]) for(let k=-1;k<=1;k++){ ctx.beginPath(); ctx.moveTo(sx*24,22+k*5); ctx.lineTo(sx*(70),16+k*11+Math.sin(t*2+k)*1.5); ctx.stroke(); } }
  else { ctx.fillStyle=b.nose; ctx.beginPath(); ctx.moveTo(-12,6); ctx.quadraticCurveTo(0,0,12,6); ctx.quadraticCurveTo(10,18,0,20); ctx.quadraticCurveTo(-10,18,-12,6); ctx.fill(); E(-4,7,3.5,2,0,'rgba(255,255,255,.5)');
    if(mood>55||tWag>0||A==='lick'){ ctx.fillStyle='#7a2e2a'; ctx.beginPath(); ctx.moveTo(-16,26); ctx.quadraticCurveTo(0,52,16,26); ctx.closePath(); ctx.fill(); if(A==='lick') E(Math.sin(act.t*10)*4,46,12,10+10*env,0,'#ef7f86'); else E(0,40+Math.sin(t*9)*2,9,11,0,'#ef7f86'); ctx.strokeStyle='rgba(180,60,70,.6)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0,32); ctx.lineTo(0,46); ctx.stroke(); }
    ctx.strokeStyle='#3a2620'; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(0,20); ctx.lineTo(0,26); ctx.moveTo(0,26); ctx.quadraticCurveTo(-9,34,-17,26); ctx.moveTo(0,26); ctx.quadraticCurveTo(9,34,17,26); ctx.stroke(); }
  ctx.restore();
  ctx.font=`20px ${DISPLAY}`; const tw2=ctx.measureText(petName).width+30; ctx.fillStyle='#fffaf2'; ctx.strokeStyle='#e2cfb6'; ctx.lineWidth=2;
  rrect(-tw2/2,186,tw2,32,16); ctx.fill(); ctx.stroke(); ctx.fillStyle='#3b2a1f'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(petName,0,203);
  ctx.restore();
}

/* ---------- loop ---------- */
let last=performance.now();
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000),t=now/1000; last=now;
  if(W>0&&H>0){ update(dt,t); drawRoom(t); drawPet(t);
    furs.forEach(f=>{ f.vy+=120*dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.t-=dt*1.4; ctx.save(); ctx.translate(f.x,f.y); ctx.rotate(f.a); ctx.globalAlpha=Math.max(0,f.t); ctx.strokeStyle=breed.base; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(-4,0); ctx.quadraticCurveTo(0,-3,4,0); ctx.stroke(); ctx.restore(); });
    for(let i=furs.length-1;i>=0;i--) if(furs[i].t<=0) furs.splice(i,1);
    hearts.forEach(h=>{ h.x+=h.vx*dt+Math.sin(h.t*8)*.3; h.y+=h.vy*dt; h.t-=dt*.7; heart(h.x,h.y,h.s*(1.4-h.t*.4),Math.max(0,h.t)); });
    for(let i=hearts.length-1;i>=0;i--) if(hearts[i].t<=0) hearts.splice(i,1);
    pops.forEach(p=>{ p.t+=dt/1.6; if(p.t>1) return; const h=headC(); const x=cx+h.x*S,y=cy+(h.y-110)*S-p.t*24; ctx.globalAlpha=Math.min(1,(1-p.t)*2.5);
      ctx.font=`${Math.max(20,26*S)}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineWidth=6; ctx.strokeStyle='#fffaf2'; ctx.strokeText(p.txt,x,y); ctx.fillStyle='#d4614a'; ctx.fillText(p.txt,x,y); ctx.globalAlpha=1; });
    for(let i=pops.length-1;i>=0;i--) if(pops[i].t>=1) pops.splice(i,1);
    if(ptr&&ptr.z&&ptr.z!=='nose'){ ctx.globalAlpha=.5; ctx.fillStyle='#fffaf2'; ctx.beginPath(); ctx.arc(ptr.x,ptr.y,14,0,TAU); ctx.fill(); ctx.globalAlpha=1; }
  }
  requestAnimationFrame(frame); }
$('nameIn').value=petName; renderBreeds(); renderFound(); stats(); hello();
const si=setInterval(stats,1000);
requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); clearInterval(si); clearTimeout(hintTimer); timers.forEach(clearTimeout);
  try{ if(purr){ const tt=ac.currentTime; purr.lv.gain.setTargetAtTime(0,tt,.05); purr.n.stop(tt+.3); purr.lfo.stop(tt+.3); } if(rustle){ rustle.gain.setTargetAtTime(0,ac.currentTime,.05); rustle._src.stop(ac.currentTime+.3); } }catch(e){} };
}});
