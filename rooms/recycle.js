/* 분리수거 방 — 와르르 쏟아진 쓰레기를 알맞은 통에 */
H.register('recycle',{title:'분리수거',sub:'쓰레기를 꾹 잡아 알맞은 통에 · 휙 던져도 쏙',floor:2,icon:'♻️',color:'#2f9a5d',
blurb:'와르르 쌓인 쓰레기 싹 치우기',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.rc-top{display:flex;align-items:center;gap:8px}
.rc-stats{display:flex;gap:6px;margin-left:auto;font-variant-numeric:tabular-nums}
.rc-stats .s{text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:3px 9px;min-width:3em}
.rc-stats b{display:block;font-family:"Jua",var(--display);font-weight:400;font-size:18px;color:#6fd59a;line-height:1.1}
.rc-stats span{font-size:10px;color:var(--muted)}
.rc-gauge{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);flex:1;min-width:150px}
.rc-gauge b{color:var(--fg);font-variant-numeric:tabular-nums;font-family:"Jua",var(--display);font-weight:400;font-size:15px;min-width:3.2em;text-align:right}
.rc-track{flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden}
.rc-fill{height:100%;width:100%;border-radius:6px;transition:width .35s;background:repeating-linear-gradient(90deg,#2f9a5d 0 14px,#45b373 14px 28px)}
.rc-toast{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:calc(100% - 32px);box-sizing:border-box;background:#fffdf7;color:#2c2a22;border:2px solid #e3d7bd;border-left:6px solid #e5483a;border-radius:14px;padding:9px 14px;font-size:13.5px;line-height:1.45;pointer-events:none;opacity:0;transition:opacity .25s;text-wrap:balance;box-shadow:0 4px 12px rgba(80,60,20,.15)}
.rc-hint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:calc(100% - 32px);box-sizing:border-box;background:rgba(255,253,247,.92);color:#2c2a22;border-radius:999px;padding:6px 14px;text-align:center;font-size:13px;font-weight:700;pointer-events:none;transition:opacity .4s;text-wrap:balance}
.rc-tray{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--muted)}
.rc-tray b{color:var(--fg);font-variant-numeric:tabular-nums}
.rc-tray .btn{margin-left:auto}
</style>
<div class="rc-top">
  <div class="rc-gauge" aria-label="남은 쓰레기"><span>남은 쓰레기</span><div class="rc-track"><div class="rc-fill" data-r="fill"></div></div><b data-r="left">0개</b></div>
  <div class="rc-stats" data-r="stats"></div>
</div>
<div class="stage" data-r="stage" style="background:#f5efdf">
  <canvas data-r="cv" aria-label="쓰레기 더미와 분리수거 통 여섯 개. 쓰레기를 끌어서 알맞은 통에 넣으세요" style="touch-action:none;cursor:grab"></canvas>
  <div class="rc-hint" data-r="hint">쓰레기를 꾹 잡아 알맞은 통에 넣으세요 · 휙 던져도 들어가요</div>
  <div class="rc-toast" data-r="toast" role="status" aria-live="polite"></div>
</div>
<div class="rc-tray">
  <span>치운 쓰레기 <b data-r="total">0</b></span>
  <span>최고 콤보 <b data-r="bestCombo">0</b></span>
  <button class="btn" data-r="dump" type="button">쓰레기 더 쏟기</button>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Jua","Noto Sans KR",sans-serif';
const EMOJI='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const reduce=Hp.reduce;
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k;
let alive=true;const timers=new Set();const later=(f,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(alive)f()},ms);timers.add(id);return id};

const BINS=[
  {id:'paper',  n:'종이',    sub:'펴서 묶기',     c:'#3a78d2', e:'📦'},
  {id:'plastic',n:'플라스틱',sub:'비우고 헹구기', c:'#ec8526', e:'🧴'},
  {id:'can',    n:'캔·고철', sub:'내용물 비우기', c:'#c24c3c', e:'🥫'},
  {id:'glass',  n:'유리병',  sub:'뚜껑은 따로',   c:'#2c9d68', e:'🍯'},
  {id:'vinyl',  n:'비닐',    sub:'이물질 털기',   c:'#cfa923', e:'🛍️'},
  {id:'general',n:'일반',    sub:'종량제 봉투',   c:'#666d77', e:'🗑️'}
].map((b,i)=>({...b,slot:i,count:0,shake:0,bounce:0,open:0,x:0,y:0,tx:0,ty:0,w:0,h:0,placed:false}));
const ITEMS=[
  ['📰','신문지','paper','신문지는 종이류예요. 차곡차곡 펴서 묶어요.'],
  ['📦','택배 상자','paper','택배 상자는 테이프와 송장을 떼고 종이류로!'],
  ['📒','헌 공책','paper','공책은 종이류예요. 스프링이 있으면 빼고 버려요.'],
  ['🧴','샴푸 통','plastic','샴푸 통은 내용물을 비우고 플라스틱류로!'],
  ['🥤','플라스틱 컵','plastic','플라스틱 컵은 헹궈서 플라스틱류로 버려요.'],
  ['🪣','양동이','plastic','플라스틱 양동이는 플라스틱류예요.'],
  ['🥫','통조림 캔','can','캔은 헹군 뒤 캔·고철류로 버려요.'],
  ['🔩','쇠 나사','can','작은 쇠붙이도 캔·고철류예요.'],
  ['🍳','헌 프라이팬','can','프라이팬은 캔·고철류(고철)예요.'],
  ['🍯','꿀 병','glass','유리병은 뚜껑을 떼고 유리병 통으로!'],
  ['🧪','유리 약병','glass','깨지지 않은 유리병은 유리병류예요.'],
  ['🛍️','비닐봉지','vinyl','깨끗한 비닐봉지는 비닐류예요.'],
  ['🍬','사탕 봉지','vinyl','과자·사탕 봉지는 비닐류! 부스러기는 털어요.'],
  ['🍫','과자 포장지','vinyl','과자 포장지도 비닐류예요.'],
  ['🧻','쓴 휴지','general','쓴 휴지는 재활용이 안 돼요. 일반쓰레기!'],
  ['🪥','칫솔','general','칫솔은 여러 재질이 섞여 있어 일반쓰레기예요.'],
  ['🥛','유리컵','general','유리컵은 유리병과 달라요. 일반쓰레기(불연성)예요.'],
  ['🏺','깨진 도자기','general','도자기는 유리병이 아니에요. 일반쓰레기(불연성)!'],
  ['🎈','터진 풍선','general','고무풍선은 비닐이 아니라 일반쓰레기예요.'],
  ['🖍️','몽당 크레파스','general','크레파스는 일반쓰레기예요.']
];
const binIdx=id=>BINS.findIndex(b=>b.id===id);

let W=0,H=0,DPR=1,SZ=40,binTop=0,cols=6,roofH=30,groundY=0;
let binGeo=null,pileK=.5;
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0);
  cols=W<560?3:6; const rows=6/cols, pad=12, gap=10;
  const bh=cols===3?clamp(H*.14,72,100):clamp(H*.2,88,124);
  const bw=(W-pad*2-gap*(cols-1))/cols;
  roofH=clamp(H*.075,26,42); binTop=roofH+16; groundY=binTop+rows*bh+(rows-1)*gap+14;
  binGeo={pad,gap,bw,bh}; placeBins(true);
  SZ=clamp(Math.min(W*.13,(H-groundY-30)*.26),36,76);
  layout(true); }
function placeBins(snap){ if(!binGeo) return; const {pad,gap,bw,bh}=binGeo;
  BINS.forEach(b=>{ const i=b.slot; b.w=bw; b.h=bh; b.tx=pad+(i%cols)*(bw+gap); b.ty=binTop+Math.floor(i/cols)*(bh+gap); if(snap||!b.placed){ b.x=b.tx; b.y=b.ty; b.placed=true; } }); }
function shuffleBins(){ const o=BINS.map((_,i)=>i); for(let i=o.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [o[i],o[j]]=[o[j],o[i]]; }
  if(o.every((v,i)=>v===BINS[i].slot)) o.push(o.shift()); BINS.forEach((b,i)=>b.slot=o[i]); placeBins(false); }
const ro=new ResizeObserver(resize); ro.observe(stage);

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null,nb=null;
function audio(){ if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function noise(at,dur,type,f,q,vol,att){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(att||.004)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()); n.stop(t+dur+.02); }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.005); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
const SFX={
  grab(){ noise(0,.09,'highpass',2500,.6,.12,.01); },
  lid(){ tone(0,.08,180,.12,'triangle',120); },
  drop:{
    paper(){ noise(0,.18,'lowpass',700,.7,.5); tone(0,.12,110,.25,'sine',70); },
    plastic(){ tone(0,.14,420,.3,'triangle',260); tone(.05,.1,300,.18,'triangle',200); },
    can(){ [840,1690,2550].forEach((f,i)=>tone(i*.01,.45-i*.1,f*rand(.97,1.03),.16/(i+1),'triangle')); noise(0,.05,'bandpass',3000,2,.2); },
    glass(){ [2300,3450,4600].forEach((f,i)=>tone(i*.015,.5-i*.12,f,.1/(i+1),'sine')); },
    vinyl(){ for(let i=0;i<5;i++) noise(i*.035,.06,'highpass',3500,.5,.14); },
    general(){ tone(0,.2,90,.4,'sine',50); noise(0,.12,'lowpass',500,.6,.35); }
  },
  ding(c){ tone(0,.18,880+c*40,.12,'sine'); tone(.08,.24,1320+c*60,.1,'sine'); },
  wrong(){ tone(0,.22,170,.16,'square',130); tone(.12,.22,130,.14,'square',100); },
  thud(){ tone(0,.08,120,.12,'sine',70); noise(0,.05,'lowpass',900,.5,.12); },
  rumble(){ noise(0,1.1,'lowpass',260,.5,.5,.08); for(let i=0;i<10;i++){ const t=rand(.1,1.1); Math.random()<.5? tone(t,.2,rand(500,1500),.05,'triangle'):noise(t,.06,'bandpass',rand(800,3000),1.5,.1); } },
  fanfare(){ [523,659,784,1047].forEach((f,i)=>tone(i*.12,.35,f,.14,'triangle')); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- state ---------- */
const sv=Hp.store.get('recycleRec',{total:0,best:0});
let pile=[],gone=[],parts=[],pops=[],confetti=[],drag=null,hover=null,score=0,combo=0,lastOk=0,bestCombo=sv.best,okN=0,tries=0,total=sv.total,startN=0,cleared=false,time=0,landT=0,saveT=0;
const save=()=>Hp.store.set('recycleRec',{total,best:bestCombo});
function makeItem(){ const d=ITEMS[Math.floor(Math.random()*ITEMS.length)]; return {e:d[0],n:d[1],b:d[2],tip:d[3],x:0,y:0,tx:0,ty:0,vx:0,vy:0,rot:rand(-.6,.6),jx:rand(-.18,.18),jy:rand(-.12,.12),mode:'pile',s:1}; }
function slots(n){ const base=H-30, topY=groundY+SZ*.7; const dx=SZ*.72; let per0=clamp(Math.floor(W*.76/dx),5,16);
  let rowsN=0,c=0; while(c<n){ c+=Math.max(2,per0-rowsN); rowsN++; }
  const dy=Math.min(SZ*.5,(base-topY-SZ*.5)/Math.max(1,rowsN-1));
  const half=(per0-1)*dx/2, cx=lerp(half+SZ*.7,W-half-SZ*.7,pileK); const out=[]; let r=0; while(out.length<n){ const k=Math.max(2,per0-r), w=(k-1)*dx; for(let j=0;j<k&&out.length<n;j++) out.push({x:cx-w/2+j*dx,y:base-r*dy}); r++; } return out; }
function layout(snap){ const s=slots(pile.length); pile.forEach((it,i)=>{ it.tx=s[i].x+it.jx*SZ; it.ty=s[i].y+it.jy*SZ; if(snap&&it.mode==='pile'){ it.x=it.tx; it.y=it.ty; } }); }
function dump(n,first){ pileK=Math.random(); shuffleBins(); const add=Array.from({length:n},makeItem); pile.push(...add); layout(false);
  add.forEach((it,i)=>{ it.x=it.tx+rand(-60,60); it.y=-SZ*rand(1,8)-i*3; it.vy=0; it.mode='fall'; });
  startN=pile.length; cleared=false; $('dump').textContent='쓰레기 더 쏟기'; if(!first){ audio(); SFX.rumble(); buzz([40,30,60]); }
  hint(first?'쓰레기를 꾹 잡아 알맞은 통에 넣으세요 · 휙 던져도 들어가요':'와르르! 또 쌓였어요. 전부 치워 볼까요?'); ui(); }
function ui(){ const acc=tries?Math.round(okN/tries*100)+'%':'–';
  $('stats').innerHTML=[[score,'점수'],[combo,'콤보'],[acc,'정확도']].map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join('');
  $('left').textContent=pile.length+'개'; $('fill').style.width=(startN?pile.length/startN*100:0)+'%';
  $('total').textContent=total; $('bestCombo').textContent=bestCombo; clearTimeout(saveT); saveT=setTimeout(save,600); }
let hintT=0,toastT=0;
function hint(t){ const h=$('hint'); h.textContent=t; h.style.opacity=1; clearTimeout(hintT); hintT=setTimeout(()=>h.style.opacity=0,3600); }
function toast(it,b){ const el=$('toast'); el.style.borderLeftColor=BINS[binIdx(it.b)].c; el.innerHTML=`<b>${it.n}</b>은(는) <b>${b.n}</b> 통이 아니에요. ${it.tip}`; el.style.opacity=1; $('hint').style.opacity=0; clearTimeout(toastT); toastT=setTimeout(()=>el.style.opacity=0,3000); }
$('dump').onclick=()=>dump(cleared?60:24);

/* ---------- resolve ---------- */
function binAt(x,y){ return BINS.findIndex(b=>x>b.x&&x<b.x+b.w&&y>b.y-SZ*.6&&y<b.y+b.h); }
function resolve(it,bi){ const b=BINS[bi]; tries++;
  if(b.id===it.b){ okN++; total++; const now=time; combo=now-lastOk<4?combo+1:1; lastOk=now; bestCombo=Math.max(bestCombo,combo);
    const pts=10+Math.min(combo-1,10)*2; score+=pts; b.count++; b.bounce=1;
    pile.splice(pile.indexOf(it),1); layout(false);
    it.mode='in'; it.t=0; it.sx=it.x; it.sy=it.y; it.bi=bi; gone.push(it);
    SFX.drop[b.id](); later(()=>SFX.ding(Math.min(combo,12)),60); buzz(combo>=5?[20,20,40]:20);
    if(!reduce) for(let i=0;i<14;i++) parts.push({x:b.x+b.w/2+rand(-b.w*.3,b.w*.3),y:b.y,vx:rand(-90,90),vy:rand(-260,-90),r:rand(2,4),c:i%2?b.c:'#ffb627',t:1});
    pops.push({x:b.x+b.w/2,y:b.y+b.h+18,t:0,txt:combo>=3?`콤보 ×${combo}  +${pts}`:`+${pts}`,col:combo>=3?'#e07f00':'#1f9d57',size:combo>=3?26:22});
    if(!pile.length) finish();
  } else { combo=0; b.shake=1; it.mode='return'; SFX.wrong(); buzz([60,40,60]); toast(it,b);
    pops.push({x:b.x+b.w/2,y:b.y+b.h+18,t:0,txt:'땡!',col:'#e5483a',size:26}); }
  ui(); }
function finish(){ cleared=true; const acc=Math.round(okN/Math.max(1,tries)*100);
  later(()=>{ SFX.fanfare(); buzz([30,40,30,40,80]); hint(`싹 치웠어요! 정확도 ${acc}% · 최고 콤보 ${bestCombo}`); $('dump').textContent='다시 와르르 쏟기'; },350);
  if(!reduce) for(let i=0;i<110;i++) confetti.push({x:rand(0,W),y:rand(-H*.5,0),vx:rand(-40,40),vy:rand(70,190),r:rand(3,6),c:BINS[i%6].c,a:rand(0,TAU),t:1}); }

/* ---------- input ---------- */
const pt=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
function pickAt(p){ for(let i=pile.length-1;i>=0;i--){ const it=pile[i]; if(it.mode!=='pile'&&it.mode!=='return') continue; if(Math.hypot(p.x-it.x,p.y-it.y)<SZ*.52) return it; } return null; }
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); const p=pt(e), it=pickAt(p); if(!it) return;
  try{cv.setPointerCapture(e.pointerId)}catch(_){} drag={it,id:e.pointerId,ox:it.x-p.x,oy:it.y-p.y,hist:[{x:p.x,y:p.y,t:performance.now()}]}; it.mode='drag'; it.vx=it.vy=0;
  cv.style.cursor='grabbing'; SFX.grab(); buzz(8); });
cv.addEventListener('pointermove',e=>{ const p=pt(e);
  if(drag&&drag.id===e.pointerId){ const it=drag.it; it.x=p.x+drag.ox; it.y=p.y+drag.oy; drag.hist.push({x:p.x,y:p.y,t:performance.now()}); if(drag.hist.length>6) drag.hist.shift(); }
  else if(e.pointerType==='mouse') hover=pickAt(p); });
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{ if(!drag||drag.id!==e.pointerId) return; const d=drag,it=d.it; drag=null; cv.style.cursor='grab';
  const bi=binAt(it.x,it.y); if(e.type==='pointerup'&&bi>=0){ resolve(it,bi); return; }
  const h=d.hist, a=h[0], z=h[h.length-1], dt=Math.max(16,z.t-a.t)/1000, vx=(z.x-a.x)/dt, vy=(z.y-a.y)/dt;
  if(e.type==='pointerup'&&Math.hypot(vx,vy)>900){ it.mode='fly'; it.vx=clamp(vx,-2600,2600)*.8; it.vy=clamp(vy,-2600,2600)*.8; it.spin=rand(-12,12); noise(0,.12,'bandpass',1200,.8,.15,.02); }
  else it.mode='return'; }));

/* ---------- step ---------- */
function step(dt){ time+=dt;
  const hov=drag?binAt(drag.it.x,drag.it.y):-1;
  BINS.forEach(b=>{ const k=Math.min(1,dt*6); b.x=lerp(b.x,b.tx,k); b.y=lerp(b.y,b.ty,k); });
  BINS.forEach((b,i)=>{ const want=i===hov?1:0; if(want&&b.open<.1){ SFX.lid(); buzz(6); } b.open=lerp(b.open,want,Math.min(1,dt*14)); b.shake=Math.max(0,b.shake-dt*2.2); b.bounce=Math.max(0,b.bounce-dt*3); });
  for(const it of pile){
    if(it.mode==='pile'||it.mode==='return'){ const k=Math.min(1,dt*(it.mode==='return'?9:7)); it.x=lerp(it.x,it.tx,k); it.y=lerp(it.y,it.ty,k); it.s=lerp(it.s,1,k);
      if(it.mode==='return'&&Math.hypot(it.x-it.tx,it.y-it.ty)<2) it.mode='pile'; }
    else if(it.mode==='fall'){ it.vy+=2600*dt; it.y+=it.vy*dt; it.x=lerp(it.x,it.tx,Math.min(1,dt*4));
      if(it.y>=it.ty){ it.y=it.ty; if(it.vy>420){ it.vy=-it.vy*.22; if(time-landT>.05){ landT=time; if(Math.random()<.35) SFX.thud(); } } else { it.mode='pile'; it.vy=0; } } }
    else if(it.mode==='drag'){ it.s=lerp(it.s,1.25,Math.min(1,dt*12)); }
    else if(it.mode==='fly'){ it.vy+=1800*dt; it.x+=it.vx*dt; it.y+=it.vy*dt; it.rot+=it.spin*dt;
      const bi=binAt(it.x,it.y); if(bi>=0){ resolve(it,bi); continue; }
      if(it.x<-SZ||it.x>W+SZ||it.y>H+SZ){ it.mode='return'; it.x=clamp(it.x,0,W); it.y=Math.min(it.y,H); SFX.thud(); } }
  }
  for(let i=gone.length-1;i>=0;i--){ const it=gone[i],b=BINS[it.bi]; it.t+=dt/.28; const e=Math.min(1,it.t);
    it.x=lerp(it.sx,b.x+b.w/2,e); it.y=lerp(it.sy,b.y+4,e)-Math.sin(Math.PI*e)*20; it.s=lerp(1.2,.25,e); it.rot+=dt*8; if(e>=1) gone.splice(i,1); }
  parts=parts.filter(p=>(p.vy+=700*dt,p.x+=p.vx*dt,p.y+=p.vy*dt,p.t-=dt*1.6)>0);
  pops=pops.filter(p=>(p.t+=dt)<1.1);
  confetti=confetti.filter(c=>(c.x+=c.vx*dt,c.y+=c.vy*dt,c.a+=dt*5,c.y<H+20)); }

/* ---------- drawing ---------- */
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawYard(){
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#9fd8ff'); sky.addColorStop(1,'#dff3ff'); ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  ctx.fillStyle='rgba(255,182,39,.25)'; ctx.beginPath(); ctx.arc(W-40,roofH+30,46,0,TAU); ctx.fill();
  ctx.fillStyle='#f7eed6'; ctx.fillRect(6,roofH,W-12,groundY-roofH);
  ctx.fillStyle='rgba(160,130,80,.12)'; for(let y=roofH+18;y<groundY;y+=18) ctx.fillRect(6,y,W-12,2);
  ctx.fillStyle='#c9b88f'; ctx.fillRect(6,roofH,6,groundY-roofH); ctx.fillRect(W-12,roofH,6,groundY-roofH);
  ctx.fillStyle='#2f9a5d'; ctx.beginPath(); ctx.moveTo(-10,roofH); ctx.lineTo(18,0); ctx.lineTo(W-18,0); ctx.lineTo(W+10,roofH); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#247a49'; const sc=22; for(let x=-10;x<W+10;x+=sc){ ctx.beginPath(); ctx.arc(x+sc/2,roofH,sc/2,0,Math.PI); ctx.fill(); }
  ctx.fillStyle='rgba(255,255,255,.18)'; for(let x=30;x<W-20;x+=34) ctx.fillRect(x,4,12,roofH-8);
  ctx.font=`${clamp(roofH*.62,16,26)}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; const tw=ctx.measureText('분리수거장').width+28;
  ctx.fillStyle='#fffaf0'; rr(W/2-tw/2,roofH*.14,tw,roofH*.72,roofH*.36); ctx.fill(); ctx.fillStyle='#247a49'; ctx.fillText('분리수거장',W/2,roofH*.52);
  const pg=ctx.createLinearGradient(0,groundY,0,H); pg.addColorStop(0,'#d8d2c3'); pg.addColorStop(1,'#cbc4b2'); ctx.fillStyle=pg; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#b9b19c'; ctx.fillRect(0,groundY,W,4);
  ctx.fillStyle='rgba(255,255,255,.55)'; for(let x=24;x<W;x+=W/5) ctx.fillRect(x,groundY+12,4,(H-groundY)*.4);
  ctx.fillStyle='#7cc46b'; for(let x=0;x<W;x+=9){ ctx.beginPath(); ctx.moveTo(x,H); ctx.lineTo(x+4,H-9-((x*7)%6)); ctx.lineTo(x+9,H); ctx.fill(); }
  if(pile.length){ const s=slots(pile.length), mn=Math.min(...s.map(p=>p.x)), mx=Math.max(...s.map(p=>p.x)), w=mx-mn+SZ*1.4; ctx.fillStyle='rgba(90,70,30,.18)'; ctx.beginPath(); ctx.ellipse((mn+mx)/2,H-22,w/2,SZ*.3,0,0,TAU); ctx.fill(); } }
function drawItem(it){ ctx.save(); ctx.translate(it.x,it.y); ctx.rotate(it.mode==='drag'?Math.sin(time*9)*.08:it.rot); ctx.scale(it.s,it.s);
  if(it.mode==='drag'||it.mode==='fly'){ ctx.fillStyle='rgba(90,70,30,.22)'; ctx.beginPath(); ctx.ellipse(6,SZ*.45,SZ*.36,SZ*.12,0,0,TAU); ctx.fill(); }
  ctx.font=`${SZ}px ${EMOJI}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(it.e,0,2); ctx.restore(); }
function chip(txt,x,y,col){ ctx.font=`700 13px "Noto Sans KR",sans-serif`; const w=ctx.measureText(txt).width+16; x=clamp(x,w/2+4,W-w/2-4);
  ctx.fillStyle='#fffdf7'; rr(x-w/2,y-13,w,24,12); ctx.fill(); ctx.strokeStyle=col||'#e3d7bd'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#2c2a22'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(txt,x,y); }
function drawBin(b){ const sh=reduce?0:Math.sin(time*55)*7*b.shake, bo=reduce?0:Math.sin(b.bounce*Math.PI)*.1;
  ctx.save(); ctx.translate(b.x+b.w/2+sh,b.y+b.h); ctx.scale(1+bo*.5,1-bo); ctx.translate(-b.w/2,-b.h);
  const w=b.w,h=b.h,lidH=Math.max(9,h*.11),wr=Math.max(5,h*.06),bodyB=h-wr;
  ctx.fillStyle='rgba(90,70,30,.18)'; ctx.beginPath(); ctx.ellipse(w/2,h-1,w*.42,4,0,0,TAU); ctx.fill();
  ctx.fillStyle='#3a3a3a'; [w*.24,w*.76].forEach(x=>{ ctx.beginPath(); ctx.arc(x,h-wr,wr,0,TAU); ctx.fill(); }); ctx.fillStyle='#9a9a9a'; [w*.24,w*.76].forEach(x=>{ ctx.beginPath(); ctx.arc(x,h-wr,wr*.4,0,TAU); ctx.fill(); });
  ctx.fillStyle=b.c; ctx.beginPath(); ctx.moveTo(w*.06,lidH); ctx.lineTo(w*.94,lidH); ctx.lineTo(w*.86,bodyB); ctx.quadraticCurveTo(w*.86,bodyB+2,w*.8,bodyB+2); ctx.lineTo(w*.2,bodyB+2); ctx.quadraticCurveTo(w*.14,bodyB+2,w*.14,bodyB); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.22)'; ctx.fillRect(w*.13,lidH+3,Math.max(3,w*.05),bodyB-lidH-10);
  ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(w*.06,lidH,w*.88,3);
  ctx.save(); ctx.translate(w*.03,lidH); ctx.rotate(-b.open*1.1); ctx.fillStyle=b.c; rr(0,-lidH,w*.94,lidH,lidH*.45); ctx.fill(); ctx.fillStyle='rgba(0,0,0,.18)'; rr(w*.35,-lidH-4,w*.24,6,3); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(5,-lidH+2,w*.94-10,2); ctx.restore();
  const fy=lidH+(bodyB-lidH)*.24, er=clamp(w*.075,4,9), ex=clamp(w*.15,9,18);
  let lx=0,ly=0; if(drag){ const dx=drag.it.x-(b.x+w/2), dy=drag.it.y-(b.y+fy), d=Math.hypot(dx,dy)||1; lx=dx/d*er*.45; ly=dy/d*er*.45; }
  const happy=b.bounce>0, sad=b.shake>0;
  [-1,1].forEach(sg=>{ const x=w/2+sg*ex;
    if(happy){ ctx.strokeStyle='#2c2a22'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(x,fy+er*.4,er*.7,Math.PI*1.15,Math.PI*1.85); ctx.stroke(); }
    else { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,fy,er,0,TAU); ctx.fill(); ctx.fillStyle='#2c2a22'; ctx.beginPath(); ctx.arc(x+lx,fy+ly,er*.5,0,TAU); ctx.fill();
      if(sad){ ctx.strokeStyle='#2c2a22'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-er,fy-er*1.3+(sg<0?-3:3)); ctx.lineTo(x+er,fy-er*1.3+(sg<0?3:-3)); ctx.stroke(); } } });
  const my=fy+er*1.9; ctx.strokeStyle='#2c2a22'; ctx.fillStyle='#7a2b22'; ctx.lineWidth=2.5; ctx.lineCap='round';
  if(b.open>.3&&!sad){ ctx.beginPath(); ctx.ellipse(w/2,my,er*.8*b.open,er*.9*b.open,0,0,TAU); ctx.fill(); }
  else { ctx.beginPath(); if(sad) ctx.arc(w/2,my+er*.8,er*.8,Math.PI*1.2,Math.PI*1.8); else ctx.arc(w/2,my-er*.4,er*.8,Math.PI*.2,Math.PI*.8); ctx.stroke(); }
  const nameS=clamp(w*.17,13,21), py=lidH+(bodyB-lidH)*.66, pw=w*.7, ph=nameS*1.45;
  ctx.fillStyle='#fffaf0'; rr(w/2-pw/2,py-ph/2,pw,ph,ph*.4); ctx.fill();
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#2c2a22'; ctx.font=`${nameS}px ${DISPLAY}`; ctx.fillText(b.n,w/2,py+1);
  if(h>84&&w>70){ ctx.fillStyle='rgba(255,255,255,.95)'; ctx.font=`700 ${clamp(w*.085,9,11)}px "Noto Sans KR",sans-serif`; ctx.fillText(b.sub,w/2,py+ph/2+9); }
  if(b.count){ const t=String(b.count); ctx.font=`${12}px ${DISPLAY}`; const bw=Math.max(22,ctx.measureText(t).width+12); ctx.fillStyle='#ffb627'; rr(w-bw+2,lidH-4,bw,20,10); ctx.fill(); ctx.fillStyle='#2c2a22'; ctx.fillText(t,w-bw/2+2,lidH+6.5); }
  if(b.open>.05){ ctx.globalAlpha=b.open*.9; ctx.strokeStyle='#ffb627'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(w*.06-3,lidH-2); ctx.lineTo(w*.94+3,lidH-2); ctx.lineTo(w*.87+3,bodyB+4); ctx.lineTo(w*.13-3,bodyB+4); ctx.closePath(); ctx.stroke(); ctx.globalAlpha=1; }
  ctx.restore(); }
function draw(){ drawYard();
  BINS.forEach(drawBin);
  for(const it of pile) if(it.mode!=='drag'&&it.mode!=='fly') drawItem(it);
  for(const it of gone) drawItem(it);
  for(const it of pile) if(it.mode==='drag'||it.mode==='fly') drawItem(it);
  if(drag){ chip(drag.it.n,drag.it.x,drag.it.y-SZ*.95,'#ffb627'); }
  else if(hover&&pile.includes(hover)&&hover.mode==='pile') chip(hover.n,hover.x,hover.y-SZ*.8);
  parts.forEach(p=>{ ctx.globalAlpha=Math.max(0,p.t); ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,TAU); ctx.fill(); }); ctx.globalAlpha=1;
  pops.forEach(p=>{ const e=p.t/1.1; ctx.globalAlpha=1-e*e; ctx.fillStyle=p.col; ctx.font=`${p.size}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineWidth=5; ctx.lineJoin='round'; ctx.strokeStyle='#fffaf0'; ctx.strokeText(p.txt,clamp(p.x,60,W-60),p.y-e*40); ctx.fillText(p.txt,clamp(p.x,60,W-60),p.y-e*40); }); ctx.globalAlpha=1;
  if(cleared&&!gone.length){ ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`${clamp(W*.1,32,60)}px ${DISPLAY}`; ctx.lineWidth=8; ctx.lineJoin='round'; ctx.strokeStyle='#fffaf0'; ctx.strokeText('싹 치웠다!',W/2,(groundY+H)/2); ctx.fillStyle='#2f9a5d'; ctx.fillText('싹 치웠다!',W/2,(groundY+H)/2); }
  confetti.forEach(c=>{ ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.a); ctx.fillStyle=c.c; ctx.fillRect(-c.r,-c.r*.4,c.r*2,c.r*.8); ctx.restore(); }); }

let last=performance.now(),started=false;
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000); last=now;
  if(W){ if(!started){ started=true; dump(48,true); } step(dt); draw(); }
  requestAnimationFrame(frame); }
resize(); ui(); requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); timers.forEach(clearTimeout); clearTimeout(hintT); clearTimeout(toastT); clearTimeout(saveT); save(); };
}});
