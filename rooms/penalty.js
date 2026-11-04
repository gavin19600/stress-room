/* 승부차기 방 (야외 · 운동장 옆) */
H.register('penalty',{title:'승부차기',sub:'공을 쓸어 올려 슛! 5번씩 차서 이기면 승리',floor:0,icon:'⚽',color:'#4fd18b',
blurb:'운동장 옆 승부차기 한 판',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.pk-top{display:flex;align-items:center;gap:10px}
.pk-score{margin-left:auto;font-family:var(--display);font-size:26px;font-variant-numeric:tabular-nums;letter-spacing:.04em}
.pk-score span{color:var(--muted);font-size:16px;margin:0 6px}
.pk-sheet{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
.pk-sheet b{font-size:12px;color:var(--muted);font-weight:700}
.pk-dots{display:flex;gap:5px;flex-wrap:wrap}
.pk-dot{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line);display:grid;place-items:center;font-size:10px;line-height:1}
.pk-dot.g{background:#4fd18b;border-color:#4fd18b}
.pk-dot.m{background:transparent;border-color:#ff6b5a;color:#ff6b5a}
.pk-dot.now{border-color:#ffd23f}
.pk-tray{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--muted)}
.pk-tray b{color:var(--fg);font-variant-numeric:tabular-nums}
.pk-tray .btn{margin-left:auto}
</style>
<div class="pk-sheet" aria-label="승부차기 기록">
  <b>우리 팀</b><div class="pk-dots" data-r="me"></div>
  <b>상대 팀</b><div class="pk-dots" data-r="op"></div>
</div>
<div class="stage" data-r="stage" style="background:#0d1626">
  <canvas data-r="cv" aria-label="골대. 공에서 원하는 곳으로 쓸어 올리거나, 골대 안을 탭해서 차세요" style="touch-action:none"></canvas>
  <div class="hint" data-r="hint">공을 원하는 곳으로 쭉 쓸어 올리면 슛! 골대 안을 그냥 탭해도 돼요</div>
  <div class="badge pk-score" data-r="score" style="font-size:20px;left:auto;right:10px">0<span>:</span>0</div>
</div>
<div class="pk-tray">
  <span>전적 <b data-r="rec">0승 0패</b></span>
  <span>골 <b data-r="goals">0</b></span>
  <span>연속 골 <b data-r="streak">0</b></span>
  <button class="btn" data-r="again" type="button" hidden>다시 하기</button>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Black Han Sans","Noto Sans KR",sans-serif';
const reduce=Hp.reduce;
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k;
let W=0,H=0,DPR=1,S=1,crowd=[],alive=true;
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); S=Math.min(W/460,H/560);
  crowd=[]; const g=goal(); const cols=['#e8e8f0','#ff6b5a','#ffd23f','#5aa7ff','#4fd18b','#f39bd0'];
  for(let y=6;y<g.y0-g.gh*.05;y+=9*S+3) for(let x=4;x<W;x+=10*S+3) crowd.push({x:x+rand(-2,2),y:y+rand(-1,1),c:cols[Math.floor(rand(0,cols.length))],p:rand(0,TAU)}); }
const ro=new ResizeObserver(resize); ro.observe(stage);
const rrect=(x,y,w,h,r)=>{ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h); };

function goal(){ const gw=Math.min(W*.8,H*1.3),gh=gw*.34,y0=H*.2; return {gw,gh,x0:W/2-gw/2,x1:W/2+gw/2,y0,yG:y0+gh}; }
const home=()=>{ const g=goal(); return {x:W/2,y:Math.min(H*.85,g.yG+Math.max(170*S,g.gw*.85)),r:24*S}; };
const fromGoal=(u,v)=>{ const g=goal(); return {x:W/2+u*g.gw/2,y:g.yG-v*g.gh}; };
const toGoal=(x,y)=>{ const g=goal(); return {u:(x-W/2)/(g.gw/2),v:(g.yG-y)/g.gh}; };

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null,nb=null,crowdG=null,crowdSrc=null;
function audio(){ if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const n=ac.createBufferSource(); n.buffer=nb; n.loop=true; const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=900; bp.Q.value=.4; crowdG=ac.createGain(); crowdG.gain.value=.035; n.connect(bp); bp.connect(crowdG); crowdG.connect(master); n.start(); crowdSrc=n; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function noise(at,dur,type,f,q,vol,att){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(att||.004)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()); n.stop(t+dur+.02); }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.005); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
const SFX={
  kick(p){ tone(0,.12,120,.5+p*.3,'sine',55); noise(0,.06,'bandpass',1100,.9,.5); },
  whistle(){ if(!ac) return; const t=ac.currentTime,o=ac.createOscillator(); o.frequency.value=2900; const l=ac.createOscillator(); l.frequency.value=28; const lg=ac.createGain(); lg.gain.value=120; l.connect(lg); lg.connect(o.frequency); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.02); g.gain.setValueAtTime(.12,t+.32); g.gain.exponentialRampToValueAtTime(.0001,t+.4); o.connect(g); g.connect(master); o.start(t); l.start(t); o.stop(t+.42); l.stop(t+.42); },
  net(){ noise(0,.45,'bandpass',600,.7,.3,.02); noise(0,.25,'highpass',2500,.5,.12); },
  roar(big){ noise(0,big?2.4:1.4,'bandpass',1000,.45,big?.5:.25,.25); noise(.1,big?2:1.2,'bandpass',2200,.6,big?.2:.1,.3); },
  ooh(){ noise(0,1.2,'bandpass',500,.8,.25,.2); },
  glove(){ noise(0,.09,'lowpass',900,.7,.6); tone(0,.1,180,.3,'sine',90); },
  post(){ [880,1320,2210].forEach((f,i)=>tone(0,.9-i*.2,f,.12/(i+1),'triangle')); noise(0,.05,'highpass',3000,.6,.3); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- match state ---------- */
const rec=Hp.store.get('pkRec',{w:0,l:0,g:0});
let me=[],op=[],wins=rec.w,losses=rec.l,goalsTotal=rec.g,streak=0,state='aim',st=0,over=null;
let shot=null,keeper={dir:0,high:false,k:0},drag=null,netShake=0,flash=0,pops=[],confetti=[];
const saveRec=()=>Hp.store.set('pkRec',{w:wins,l:losses,g:goalsTotal});
function goalsOf(a){ return a.filter(Boolean).length; }
function renderSheet(){ const n=Math.max(5,me.length+(state==='aim'&&!over?1:0),op.length);
  const row=(a,isMe)=>Array.from({length:n},(_,i)=>{ if(i<a.length) return a[i]?'<span class="pk-dot g"></span>':'<span class="pk-dot m">✕</span>'; const now=isMe&&i===a.length&&!over&&state!=='opp'; return `<span class="pk-dot${now?' now':''}"></span>`; }).join('');
  $('me').innerHTML=row(me,true); $('op').innerHTML=row(op,false);
  $('score').innerHTML=`${goalsOf(me)}<span>:</span>${goalsOf(op)}`; $('rec').textContent=`${wins}승 ${losses}패`; $('goals').textContent=goalsTotal; $('streak').textContent=streak; }
function decided(){ const a=goalsOf(me),b=goalsOf(op);
  if(me.length<=5&&op.length<=5){ const remA=5-me.length,remB=5-op.length; if(a+remA<b) return 'lose'; if(b+remB<a) return 'win'; if(me.length<5||op.length<5) return null; }
  if(me.length===op.length&&a!==b) return a>b?'win':'lose'; return null; }
function newMatch(){ me=[]; op=[]; over=null; state='aim'; st=0; shot=null; keeper={dir:0,high:false,k:0}; $('again').hidden=true; renderSheet(); hint('공을 원하는 곳으로 쭉 쓸어 올리면 슛! 골대 안을 그냥 탭해도 돼요'); if(ac) SFX.whistle(); }
$('again').onclick=()=>{ audio(); newMatch(); };
function hint(t){ $('hint').textContent=t; $('hint').style.opacity=1; }

/* ---------- shooting ---------- */
function shoot(u,v,power){ if(state!=='aim'||over) return; audio();
  const n=.05+power*.07; u+=rand(-n,n); v+=rand(-n*.8,n*.8); v=Math.max(.05,v);
  const read=Math.random()<.33; let dir,high;
  if(read){ dir=Math.abs(u)<.3?0:Math.sign(u); high=v>.5; } else { const r=Math.random(); dir=r<.4?-1:r<.6?0:1; high=Math.random()<.4; }
  keeper={dir,high,k:0};
  let res;
  if(Math.abs(u)>1.06||v>1.07) res='miss';
  else if((Math.abs(u)>.95&&v<1.05)||(v>.95&&Math.abs(u)<1)) res='post';
  else { const uk=dir*.6; let cov; if(dir===0) cov=Math.abs(u)<.32&&v<.92; else cov=u*dir>0&&Math.abs(u-uk)<.42&&(high?(v>.18&&v<.99):v<.62);
    res=cov&&Math.random()<.88?'save':'goal'; }
  const h=home(),p=fromGoal(u,v); shot={u,v,res,t:0,dur:.62-power*.14,x0:h.x,y0:h.y,x1:p.x,y1:p.y,spin:0,segs:[],seg:0,segT:0,x:h.x,y:h.y,s:1,behind:false,alpha:1};
  state='flight'; st=0; SFX.kick(power); buzz(15+Math.round(power*25)); $('hint').style.opacity=0; }
function afterSegs(sh){ const g=goal(),p={x:sh.x1,y:sh.y1},sg=Math.sign(sh.u)||1;
  if(sh.res==='goal') return [{d:.22,x1:lerp(p.x,W/2,.1),y1:p.y-g.gh*.1,s1:.34,behind:true},{d:.45,x1:lerp(p.x,W/2,.15),y1:g.yG-g.gh*.14,s1:.32,h:-6*S,behind:true}];
  if(sh.res==='save') return [{d:.55,x1:p.x+sg*g.gw*.18+rand(-30,30)*S,y1:g.yG+60*S,s1:.62,h:45*S},{d:.5,x1:p.x+sg*g.gw*.3,y1:g.yG+110*S,s1:.75,h:18*S}];
  if(sh.res==='post') return [{d:.5,x1:p.x-sg*g.gw*.22,y1:g.yG+50*S,s1:.55,h:40*S},{d:.45,x1:p.x-sg*g.gw*.32,y1:g.yG+90*S,s1:.66,h:12*S}];
  return [{d:.5,x1:p.x+(p.x-W/2)*.3,y1:p.y-(sh.v>1?g.gh*.5:g.gh*.12),s1:.28,fade:true}]; }
function resolve(sh){ const big=sh.res==='goal';
  if(big){ SFX.net(); SFX.roar(true); netShake=1; flash=1; goalsTotal++; streak++; saveRec(); pops.push({t:0,txt:'골!!!',col:'#ffd23f',size:84,big:true}); buzz([40,40,80]);
    if(!reduce) for(let i=0;i<70;i++) confetti.push({x:rand(0,W),y:rand(-H*.3,0),vx:rand(-40,40),vy:rand(60,180),r:rand(3,6),c:['#ffd23f','#4fd18b','#5aa7ff','#ff6b5a','#fff'][i%5],a:rand(0,TAU),t:1}); }
  else { streak=0; if(sh.res==='save'){ SFX.glove(); SFX.ooh(); pops.push({t:0,txt:'선방!',col:'#ff6b5a',size:60}); buzz(30); } else if(sh.res==='post'){ SFX.post(); SFX.ooh(); pops.push({t:0,txt:'땡! 골대!',col:'#eef2f8',size:52}); buzz([20,20,20]); } else { SFX.ooh(); pops.push({t:0,txt:'아깝다, 밖으로!',col:'#93a1ba',size:44}); buzz(10); } }
  sh.segs=afterSegs(sh); sh.seg=0; sh.segT=0; sh.sx=sh.x; sh.sy=sh.y; sh.ss=sh.s; }
function step(dt){
  st+=dt;
  if(state==='flight'){ const sh=shot; sh.t+=dt; const e=Math.min(1,sh.t/sh.dur);
    sh.x=lerp(sh.x0,sh.x1,e); sh.y=lerp(sh.y0,sh.y1,e)-Math.sin(Math.PI*e)*28*S*(1.1-sh.v*.4); sh.s=lerp(1,.42,e); sh.spin+=dt*22;
    keeper.k=clamp((sh.t-.1)/(.42),0,1);
    if(e>=1){ resolve(sh); state='after'; st=0; } }
  else if(state==='after'){ const sh=shot; keeper.k=Math.min(1,keeper.k+dt*2); const g=sh.segs[sh.seg];
    if(g){ sh.segT+=dt; const e=Math.min(1,sh.segT/g.d); sh.x=lerp(sh.sx,g.x1,e); sh.y=lerp(sh.sy,g.y1,e)-Math.sin(Math.PI*e)*(g.h||0); sh.s=lerp(sh.ss,g.s1,e); sh.behind=!!g.behind; if(g.fade) sh.alpha=1-e; sh.spin+=dt*12*(1-e);
      if(e>=1){ sh.seg++; sh.segT=0; sh.sx=sh.x; sh.sy=sh.y; sh.ss=sh.s; } }
    if(st>1.7){ me.push(sh.res==='goal'); renderSheet(); const d=decided(); if(d) return finish(d); state='opp'; st=0; oppKick(); } }
  else if(state==='opp'){ if(st>1.6){ const d=decided(); if(d) return finish(d); state='aim'; st=0; shot=null; keeper={dir:0,high:false,k:0}; renderSheet(); hint(me.length>=5?'서든데스! 한 골이면 승부가 갈려요':`${me.length+1}번째 키커 차례예요`); } } }
function oppKick(){ const ok=Math.random()<.72; op.push(ok); renderSheet(); pops.push({t:0,txt:ok?`상대 ${op.length}번 키커 · 골`:`상대 ${op.length}번 키커 · 실축!`,col:ok?'#93a1ba':'#4fd18b',size:30,y:.42}); if(ac){ ok?noise(0,.9,'bandpass',700,.5,.12,.2):SFX.roar(false); } buzz(ok?10:[15,30,15]); }
function finish(d){ over=d; state='over'; st=0; if(d==='win'){ wins++; SFX.roar(true); if(!reduce) for(let i=0;i<120;i++) confetti.push({x:rand(0,W),y:rand(-H*.5,0),vx:rand(-40,40),vy:rand(60,180),r:rand(3,6),c:['#ffd23f','#4fd18b','#5aa7ff','#ff6b5a','#fff'][i%5],a:rand(0,TAU),t:1}); buzz([50,40,50,40,100]); }
  else { losses++; SFX.ooh(); buzz(40); } saveRec(); renderSheet(); $('again').hidden=false; hint(d==='win'?'승부차기 승리! 다시 하기로 한 판 더':'아쉽게 졌어요. 다시 하기로 설욕해요'); }

/* ---------- input ---------- */
const pt=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); if(state!=='aim'||over) return; try{cv.setPointerCapture(e.pointerId)}catch(_){} const p=pt(e); drag={x0:p.x,y0:p.y,x:p.x,y:p.y,t0:performance.now(),id:e.pointerId}; });
cv.addEventListener('pointermove',e=>{ if(drag&&drag.id===e.pointerId){ const p=pt(e); drag.x=p.x; drag.y=p.y; } });
function aimOf(d){ const dx=d.x-d.x0,dy=d.y-d.y0,len=Math.hypot(dx,dy); if(len<14){ const g=toGoal(d.x,d.y); return g.v>-.15?{u:g.u,v:Math.max(.05,g.v),power:.5,tap:true}:null; }
  if(dy>-10) return null; const h=home(),k=1.8; const tx=h.x+dx*k,ty=h.y+dy*k; const g=toGoal(tx,ty); const dt=Math.max(60,performance.now()-d.t0); return {u:g.u,v:g.v,power:clamp(len/dt/2.2,0,1)}; }
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{ if(!drag||drag.id!==e.pointerId) return; const a=aimOf(drag); drag=null; if(a&&e.type==='pointerup') shoot(a.u,a.v,a.power); }));

/* ---------- drawing ---------- */
function E(x,y,rx,ry,rot,fill){ ctx.beginPath(); ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU); ctx.fillStyle=fill; ctx.fill(); }
function drawStadium(t){ const g=goal();
  const sky=ctx.createLinearGradient(0,0,0,g.yG); sky.addColorStop(0,'#0a1222'); sky.addColorStop(1,'#1a2a48'); ctx.fillStyle=sky; ctx.fillRect(0,0,W,g.yG);
  ctx.fillStyle='#121c30'; ctx.fillRect(0,0,W,g.y0-g.gh*.04);
  const cheer=(state==='after'&&shot&&shot.res==='goal')||over==='win';
  crowd.forEach(c=>{ const j=cheer?Math.abs(Math.sin(t*9+c.p))*4*S:Math.sin(t*1.5+c.p)*.6; E(c.x,c.y-j,3.4*S+1,3.4*S+1,0,c.c); });
  [W*.08,W*.92].forEach(x=>{ const lg=ctx.createRadialGradient(x,0,4,x,0,W*.5); lg.addColorStop(0,'rgba(255,255,240,.55)'); lg.addColorStop(1,'rgba(255,255,240,0)'); ctx.fillStyle=lg; ctx.fillRect(0,0,W,H); });
  const ay=g.yG-g.gh*.3; ctx.fillStyle='#1d3c6e'; ctx.fillRect(0,ay,W,g.gh*.18); ctx.fillStyle='rgba(255,255,255,.75)'; ctx.font=`${g.gh*.11}px ${DISPLAY}`; ctx.textBaseline='middle'; ctx.textAlign='center';
  const ad='스트레스 날려버려 · 마음정비소',gap=ctx.measureText(ad).width+60*S; for(let x=-((t*40)%gap);x<W+gap;x+=gap) ctx.fillText(ad,x+gap/2,ay+g.gh*.09);
  const gy=ay+g.gh*.18; for(let i=0,y=gy;y<H;i++){ const h=8*S*(1+i*.55); ctx.fillStyle=i%2?'#2f8a3e':'#37994a'; ctx.fillRect(0,y,W,h+1); y+=h; }
  ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=2.5*S; ctx.beginPath(); ctx.moveTo(0,g.yG); ctx.lineTo(W,g.yG); ctx.stroke();
  const bx=g.gw*.2; ctx.beginPath(); ctx.moveTo(g.x0-bx,g.yG); ctx.lineTo(g.x0-bx*2.2,g.yG+g.gh*.6); ctx.lineTo(g.x1+bx*2.2,g.yG+g.gh*.6); ctx.lineTo(g.x1+bx,g.yG); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-W*.2,H*.98); ctx.lineTo(g.x0-g.gw*.75,g.yG); ctx.moveTo(W*1.2,H*.98); ctx.lineTo(g.x1+g.gw*.75,g.yG); ctx.stroke();
  const h=home(); E(h.x,h.y+h.r*.75,h.r*.55,h.r*.18,0,'rgba(255,255,255,.85)'); }
function drawNet(t){ const g=goal(),bx0=g.x0+g.gw*.05,bx1=g.x1-g.gw*.05,by0=g.y0+g.gh*.04,by1=g.yG-g.gh*.16; const sh=netShake*Math.sin(t*30)*6*S;
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(bx0,by0,bx1-bx0,by1-by0);
  ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1;
  const n=18; for(let i=0;i<=n;i++){ const x=lerp(bx0,bx1,i/n); ctx.beginPath(); ctx.moveTo(x,by0); ctx.lineTo(x+Math.sin(i)*sh*.4,by1+sh*.3); ctx.stroke(); }
  for(let j=0;j<=7;j++){ const y=lerp(by0,by1,j/7); ctx.beginPath(); ctx.moveTo(bx0,y); for(let i=0;i<=n;i++) ctx.lineTo(lerp(bx0,bx1,i/n),y+Math.sin(i*.9+j)*sh*.5); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(g.x0,g.y0); ctx.lineTo(bx0,by0); ctx.moveTo(g.x1,g.y0); ctx.lineTo(bx1,by0); ctx.moveTo(g.x0,g.yG); ctx.lineTo(bx0,by1); ctx.moveTo(g.x1,g.yG); ctx.lineTo(bx1,by1); ctx.stroke();
  for(let j=1;j<6;j++){ const k=j/6; ctx.beginPath(); ctx.moveTo(g.x0,lerp(g.y0,g.yG,k)); ctx.lineTo(bx0,lerp(by0,by1,k)); ctx.moveTo(g.x1,lerp(g.y0,g.yG,k)); ctx.lineTo(bx1,lerp(by0,by1,k)); ctx.stroke(); } }
function drawPosts(){ const g=goal(),pw=7*S; ctx.fillStyle='#f4f6fa'; ctx.fillRect(g.x0-pw,g.y0-pw,pw,g.gh+pw); ctx.fillRect(g.x1,g.y0-pw,pw,g.gh+pw); ctx.fillRect(g.x0-pw,g.y0-pw,g.gw+pw*2,pw);
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(g.x0-pw*.35,g.y0,pw*.35,g.gh); ctx.fillRect(g.x1+pw*.65,g.y0,pw*.35,g.gh); }
function drawKeeper(t){ const g=goal(),k=keeper.k,d=keeper.dir,ease=1-Math.pow(1-k,3);
  const idle=state==='aim'?Math.sin(t*3)*.06:0; const u=d*.6*ease+idle; const x=W/2+u*g.gw/2,y=g.yG; const hgt=g.gh*.78,sc=hgt/100;
  const lift=d===0?(keeper.high?Math.sin(Math.min(1,k)*Math.PI)*hgt*.25:0):Math.sin(Math.min(1,k*1.1)*Math.PI*.6)*hgt*(keeper.high?.42:.12);
  const rot=d*ease*(keeper.high?1.15:1.4);
  E(x,y+2*S,26*sc,5*sc,0,'rgba(0,0,0,.3)');
  ctx.save(); ctx.translate(x,y-lift-hgt*.45); ctx.rotate(rot); ctx.scale(sc,sc);
  const sk='#e8b98f',jer='#f07c2a',jerD='#c95f16',glove='#c6f24a';
  const legSp=state==='aim'?Math.sin(t*3)*3:0;
  ctx.fillStyle='#22262e'; ctx.fillRect(-14-legSp,8,11,42); ctx.fillRect(3+legSp,8,11,42); ctx.fillStyle='#f4f6fa'; ctx.fillRect(-15-legSp,40,12,8); ctx.fillRect(3+legSp,40,12,8);
  ctx.fillStyle='#111'; ctx.fillRect(-16,0,32,14);
  ctx.fillStyle=jer; rrect(-18,-38,36,42,8); ctx.fill(); ctx.fillStyle=jerD; ctx.fillRect(-18,-38,36,6);
  ctx.fillStyle='#fff'; ctx.font=`18px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('1',0,-16);
  const armUp=state==='aim'?.5+Math.sin(t*3)*.15:(keeper.high||d===0?1.25:.95);
  for(const sx of [-1,1]){ ctx.save(); ctx.translate(sx*16,-32); ctx.rotate(-sx*(Math.PI*.5+armUp*.9)); ctx.fillStyle=jer; ctx.fillRect(-5,0,10,30); ctx.fillStyle=glove; ctx.beginPath(); ctx.arc(0,34,8,0,TAU); ctx.fill(); ctx.restore(); }
  E(0,-50,11,12,0,sk); ctx.fillStyle='#2a1d17'; ctx.beginPath(); ctx.arc(0,-53,11,Math.PI,TAU); ctx.fill();
  ctx.restore(); }
function drawBall(x,y,s,spin,alpha){ const r=home().r*s; ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.rotate(spin);
  const gr=ctx.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r); gr.addColorStop(0,'#ffffff'); gr.addColorStop(1,'#cfd5de'); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.clip(); ctx.fillStyle='#1b1e24';
  const pent=(cx,cy,rr,ro2)=>{ ctx.beginPath(); for(let i=0;i<5;i++){ const a=ro2+i/5*TAU; ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); } ctx.closePath(); ctx.fill(); };
  pent(0,0,r*.32,-Math.PI/2); for(let i=0;i<5;i++){ const a=-Math.PI/2+i/5*TAU+Math.PI/5; pent(Math.cos(a)*r*.82,Math.sin(a)*r*.82,r*.3,a+Math.PI); } ctx.restore();
  ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.stroke(); ctx.restore(); }

let last=performance.now();
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000),t=now/1000; last=now;
  if(W>0&&H>0){ step(dt); netShake=Math.max(0,netShake-dt*1.4); flash=Math.max(0,flash-dt*1.5);
    const g=goal(); drawStadium(t); drawNet(t);
    const sh=shot; if(sh&&sh.behind) drawBall(sh.x,sh.y,sh.s,sh.spin,sh.alpha);
    drawKeeper(t); drawPosts();
    if(drag&&state==='aim'){ const a=aimOf(drag); const h=home(); if(a&&!a.tap){ const p=fromGoal(a.u,a.v); ctx.strokeStyle='rgba(255,210,63,.85)'; ctx.lineWidth=3; ctx.setLineDash([8,8]); ctx.beginPath(); ctx.moveTo(h.x,h.y); ctx.quadraticCurveTo((h.x+p.x)/2,(h.y+p.y)/2-30*S,p.x,p.y); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(p.x,p.y,12*S,0,TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x-18*S,p.y); ctx.lineTo(p.x+18*S,p.y); ctx.moveTo(p.x,p.y-18*S); ctx.lineTo(p.x,p.y+18*S); ctx.stroke();
        const bw=90*S; ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(h.x-bw/2,h.y+h.r+10*S,bw,7*S); ctx.fillStyle=a.power>.8?'#ff6b5a':'#ffd23f'; ctx.fillRect(h.x-bw/2,h.y+h.r+10*S,bw*a.power,7*S); } }
    if(!sh||!sh.behind){ const h=home(); if(sh){ const sy=lerp(h.y+h.r*.8,g.yG,clamp(sh.t/sh.dur,0,1)); if(state==='flight') E(sh.x,sy,h.r*sh.s*.9,h.r*sh.s*.25,0,'rgba(0,0,0,.3)'); drawBall(sh.x,sh.y,sh.s,sh.spin,sh.alpha); }
      else if(!over){ E(h.x,h.y+h.r*.8,h.r*.9,h.r*.25,0,'rgba(0,0,0,.3)'); drawBall(h.x,h.y,1,0,1); } }
    if(flash>0){ ctx.fillStyle=`rgba(255,240,180,${flash*.25})`; ctx.fillRect(0,0,W,H); }
    confetti.forEach(c=>{ c.x+=c.vx*dt; c.y+=c.vy*dt; c.a+=dt*6; if(c.y>H) c.t=0; ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.a); ctx.fillStyle=c.c; ctx.fillRect(-c.r/2,-c.r/4,c.r,c.r/2); ctx.restore(); }); confetti=confetti.filter(c=>c.t>0);
    pops.forEach(p=>{ p.t+=dt/(p.big?1.7:1.4); if(p.t>1) return; const sc=p.big?(p.t<.1?1.7-p.t*7:1):1; ctx.save(); ctx.translate(W/2,H*(p.y||.5)-p.t*14); ctx.scale(sc,sc); ctx.globalAlpha=Math.min(1,(1-p.t)*2.5);
      ctx.font=`${p.size*Math.max(.6,Math.min(1.1,S*1.2))}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineWidth=8; ctx.strokeStyle='#08101e'; ctx.strokeText(p.txt,0,0); ctx.fillStyle=p.col; ctx.fillText(p.txt,0,0); ctx.restore(); }); pops=pops.filter(p=>p.t<1);
    if(over){ ctx.fillStyle='rgba(8,16,30,.55)'; ctx.fillRect(0,H*.36,W,H*.22); ctx.font=`${Math.max(30,54*S)}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=over==='win'?'#ffd23f':'#eef2f8';
      ctx.fillText(over==='win'?'승부차기 승리!':'아쉬운 패배',W/2,H*.44); ctx.font=`${Math.max(15,20*S)}px "Noto Sans KR",sans-serif`; ctx.fillStyle='#93a1ba'; ctx.fillText(`${goalsOf(me)} : ${goalsOf(op)}`,W/2,H*.52); }
  }
  requestAnimationFrame(frame); }
resize(); renderSheet(); requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); saveRec(); try{ if(crowdSrc){ crowdG.gain.setTargetAtTime(0,ac.currentTime,.05); crowdSrc.stop(ac.currentTime+.3); } }catch(e){} };
}});
