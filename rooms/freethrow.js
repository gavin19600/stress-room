/* 자유투 방 (야외 · 농구장) */
H.register('freethrow',{title:'자유투',sub:'공을 위로 쓸어 올려 슛! 10구 중 몇 개?',floor:0,icon:'🏀',color:'#f07c2a',
blurb:'농구장 자유투 10구 도전',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.ft-sheet{display:flex;gap:6px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:8px 12px;flex-wrap:wrap}
.ft-sheet b{font-size:12px;color:var(--muted);margin-right:4px}
.ft-dot{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--line);display:grid;place-items:center;font-size:10px}
.ft-dot.g{background:#4fd18b;border-color:#4fd18b}
.ft-dot.sw{background:#f07c2a;border-color:#f07c2a}
.ft-dot.m{border-color:#ff6b5a;color:#ff6b5a}
.ft-dot.now{border-color:var(--fg)}
.ft-stats{position:absolute;top:10px;right:10px;display:flex;gap:10px;pointer-events:none;font-variant-numeric:tabular-nums}
.ft-stats .s{text-align:right;background:rgba(0,0,0,.45);padding:4px 9px;border-radius:8px}
.ft-stats b{display:block;font-family:var(--display);font-weight:400;font-size:18px;color:#f07c2a;line-height:1}
.ft-stats span{font-size:10px;color:#cfc4b6}
.ft-tray{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--muted)}
.ft-tray b{color:var(--fg);font-variant-numeric:tabular-nums}
.ft-tray .btn{margin-left:auto}
</style>
<div class="ft-sheet" aria-label="이번 판 기록"><b>이번 판</b><span data-r="dots" style="display:flex;gap:6px;flex-wrap:wrap"></span></div>
<div class="stage" data-r="stage" style="background:#120e0c">
  <canvas data-r="cv" aria-label="농구 골대. 아래에서 위로 쓸어 올려 공을 던지세요" style="touch-action:none;cursor:grab"></canvas>
  <div class="ft-stats" data-r="stats"></div>
  <div class="hint" data-r="hint">공을 위로 쭉 쓸어 올려 던지세요 · 힘 막대가 초록 칸에 오면 딱 좋아요</div>
</div>
<div class="ft-tray">
  <span>최고 기록 <b data-r="bestRound">–</b></span>
  <span>전체 성공률 <b data-r="allPct">–</b></span>
  <span>최고 연속 <b data-r="bestStreak">0</b></span>
  <button class="btn" data-r="again" type="button" hidden>새 10구 시작</button>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Black Han Sans","Noto Sans KR",sans-serif';
const reduce=Hp.reduce;
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k;
let W=0,H=0,DPR=1,S=1,crowd=[],alive=true;
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); S=Math.min(W/400,H/560);
  crowd=[]; const cols=['#e8e0d6','#f07c2a','#ffd23f','#5aa7ff','#4fd18b','#c97bd6','#ff6b5a']; for(let y=8;y<H*.46;y+=11*S+3) for(let x=4;x<W;x+=11*S+3) crowd.push({x:x+rand(-2,2),y:y+rand(-1,1),c:cols[Math.floor(rand(0,cols.length))],p:rand(0,TAU)}); }
const ro=new ResizeObserver(resize); ro.observe(stage);
const hoop=()=>({x:W/2,y:H*.22,rx:42*S,ry:42*S*.28});
const home=()=>({x:W/2,y:H*.84,r:30*S});
const sRim=()=>(hoop().rx*.52)/home().r;

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null,nb=null,amb=null,ambG=null;
function audio(){ if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const n=ac.createBufferSource(); n.buffer=nb; n.loop=true; const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=800; bp.Q.value=.4; const g=ac.createGain(); g.gain.value=.025; n.connect(bp); bp.connect(g); g.connect(master); n.start(); amb=n; ambG=g; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function noise(at,dur,type,f,q,vol,att){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(att||.004)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()); n.stop(t+dur+.02); }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.005); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
const SFX={
  dribble(){ tone(0,.12,95,.35,'sine',60); noise(0,.04,'bandpass',600,.9,.3); },
  release(){ noise(0,.12,'bandpass',900,.8,.12,.02); },
  swish(){ noise(0,.32,'highpass',3000,.5,.35,.02); noise(.02,.25,'bandpass',1800,.8,.18); },
  rim(v){ [520,1040,1560].forEach((f,i)=>tone(0,.35-i*.08,f*rand(.97,1.03),(v||1)*.12/(i+1),'triangle')); noise(0,.04,'bandpass',2500,2,.2*(v||1)); },
  board(){ tone(0,.18,160,.35,'sine',90); noise(0,.1,'lowpass',900,.6,.4); },
  floor(){ tone(0,.1,90,.25,'sine',55); },
  cheer(big){ noise(0,big?2:1.2,'bandpass',1100,.45,big?.4:.22,.25); noise(.1,big?1.6:1,'bandpass',2300,.6,big?.15:.08,.3); },
  aww(){ noise(0,1,'bandpass',450,.8,.2,.2); },
  buzzer(){ tone(0,.6,220,.12,'square'); tone(0,.6,223,.08,'square'); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- state ---------- */
const sv=Hp.store.get('ftRec',{best:null,made:0,shots:0,streak:0});
let round=[],state='ready',st=0,ball=null,drag=null,net=0,pops=[],confetti=[],streak=0,bestStreak=sv.streak,allMade=sv.made,allShots=sv.shots,bestRound=sv.best,dribT=0,dribSnd=0;
const save=()=>Hp.store.set('ftRec',{best:bestRound,made:allMade,shots:allShots,streak:bestStreak});
function stats(){ const made=round.filter(r=>r!=='m').length; $('stats').innerHTML=[[`${made}/${round.length}`,'성공'],[streak,'연속'],[round.length?Math.round(made/round.length*100)+'%':'–','성공률']].map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join('');
  $('dots').innerHTML=Array.from({length:10},(_,i)=>{ const r=round[i]; if(r==='sw') return '<span class="ft-dot sw"></span>'; if(r==='in') return '<span class="ft-dot g"></span>'; if(r==='m') return '<span class="ft-dot m">✕</span>'; return `<span class="ft-dot${i===round.length?' now':''}"></span>`; }).join('');
  $('bestRound').textContent=bestRound===null?'–':`${bestRound}/10`; $('allPct').textContent=allShots?Math.round(allMade/allShots*100)+'%':'–'; $('bestStreak').textContent=bestStreak; }
function hint(t){ $('hint').textContent=t; $('hint').style.opacity=1; }
function newRound(){ round=[]; state='ready'; ball=null; $('again').hidden=true; stats(); hint('공을 위로 쭉 쓸어 올려 던지세요 · 힘 막대가 초록 칸에 오면 딱 좋아요'); }
$('again').onclick=()=>{ audio(); newRound(); };

/* ---------- shot ---------- */
const IDEAL=1, BAND=.11;
function powerOf(d){ return clamp((d.y0-d.y)/(H*.34),0,1.6); }
function aimOf(d){ return (d.x-d.x0)/(115*S); }
function shoot(ex,p){ audio(); const ed=(p-IDEAL)/.26; ex+=rand(-.06,.06); const dist=Math.hypot(ex,ed*.85);
  let res; if(dist<.34) res='swish'; else if(dist<.66) res=Math.random()<.62-(dist-.34)*.9?'rimin':'rimout'; else if(ed>.6&&ed<1.6&&Math.abs(ex)<.75) res=Math.random()<.3?'bankin':'bankoff'; else if(dist<1.15) res='rimout'; else res='air';
  const hp=hoop(),h=home(),sr=sRim(),sg=Math.sign(ex)||(Math.random()<.5?-1:1); const segs=[];
  const F=(x1,y1,s1,d,hh,layer,snd)=>segs.push({x1,y1,s1,d,h:hh||0,layer:layer||'front',snd});
  const top=hp.y-6*S, arc=Math.max(140*S,(h.y-hp.y)*.95);
  if(res==='swish'){ F(hp.x+ex*hp.rx*.5,top,sr,.95,arc,'front'); F(hp.x+ex*hp.rx*.2,hp.y+70*S,sr*.96,.32,0,'mid','swish'); F(hp.x+rand(-20,20)*S,H*.66,sr*1.05,.38,0,'front','floor'); F(hp.x+rand(-40,40)*S,H*.66,sr*1.05,.4,22*S,'front','floor'); }
  else if(res==='rimin'){ F(hp.x+sg*hp.rx*.55,top,sr,.95,arc); F(hp.x-sg*hp.rx*.45,top-2*S,sr,.3,24*S,'front','rim'); F(hp.x+sg*hp.rx*.15,top,sr,.24,12*S,'front','rim2'); F(hp.x,hp.y+70*S,sr*.96,.34,0,'mid','swish'); F(hp.x,H*.66,sr*1.05,.36,0,'front','floor'); }
  else if(res==='rimout'){ const front=ed<0; F(hp.x+sg*hp.rx*.8,front?hp.y+hp.ry*.5:top,sr,.95,arc); F(hp.x+sg*hp.rx*1.4,top-6*S,sr,.3,30*S,'front','rim'); F(hp.x+sg*hp.rx*3.2,H*.68,sr*1.2,.55,50*S,'front','floor'); F(hp.x+sg*hp.rx*4.4,H*.68,sr*1.25,.4,20*S,'front','floor'); }
  else if(res==='bankin'){ F(hp.x+ex*hp.rx*.6,hp.y-62*S,sr,.95,arc,'front'); F(hp.x,top,sr,.26,0,'front','board'); F(hp.x,hp.y+70*S,sr*.96,.34,0,'mid','swish'); F(hp.x,H*.66,sr*1.05,.36,0,'front','floor'); }
  else if(res==='bankoff'){ F(hp.x+ex*hp.rx*.6,hp.y-62*S,sr,.95,arc,'front'); F(hp.x+sg*hp.rx*.6,hp.y+hp.ry,sr,.24,0,'front','board'); F(hp.x+sg*hp.rx*2.6,H*.68,sr*1.2,.55,40*S,'front','rim'); }
  else { const shortS=ed<0; if(shortS){ F(hp.x+ex*hp.rx*1.2,hp.y+hp.ry+30*S,sr*1.05,.9,arc*.85); F(hp.x+ex*hp.rx*1.3,H*.68,sr*1.15,.35,0,'front','floor'); }
    else { F(hp.x+ex*hp.rx*1.6,hp.y-150*S,sr*.85,.95,arc*1.1,'front'); F(hp.x+ex*hp.rx*1.9,hp.y-40*S,sr*.75,.4,0,'back','floor'); } }
  ball={res,segs,seg:0,segT:0,x:h.x,y:h.y,s:1,sx:h.x,sy:h.y,ss:1,spin:0,layer:'front',done:false,alpha:1};
  state='flight'; st=0; SFX.release(); buzz(10+Math.round(Math.min(p,1.4)*15)); $('hint').style.opacity=0; }
function scored(r){ return r==='swish'||r==='rimin'||r==='bankin'; }
function settle(){ const r=ball.res,ok=scored(r); allShots++; if(ok){ allMade++; streak++; bestStreak=Math.max(bestStreak,streak); } else streak=0;
  round.push(r==='swish'?'sw':ok?'in':'m');
  if(ok){ const big=r==='swish'; pops.push({t:0,txt:big?'클린슛!':r==='bankin'?'백보드 맞고 쏙!':'통통… 들어갔다!',col:big?'#f07c2a':'#4fd18b',size:big?62:44,big}); SFX.cheer(big||streak>=3); buzz(big?[30,30,60]:30);
    if(streak>=3) setTimeout(()=>{ if(alive) pops.push({t:0,txt:`${streak}연속 성공!`,col:'#ffd23f',size:30,y:.48}); },350);
    if(big&&!reduce) for(let i=0;i<24;i++) confetti.push({x:hoop().x+rand(-30,30)*S,y:hoop().y+60*S,vx:rand(-120,120)*S,vy:rand(-220,-80)*S,r:rand(3,5),c:['#f07c2a','#ffd23f','#4fd18b','#fff'][i%4],a:rand(0,TAU),t:1}); }
  else { pops.push({t:0,txt:r==='air'?'에어볼…':r==='bankoff'?'백보드만 쾅!':'림 맞고 튕겼다!',col:'#a8968a',size:42}); SFX.aww(); buzz(12); }
  stats(); save();
  if(round.length>=10){ const made=round.filter(x=>x!=='m').length; bestRound=Math.max(bestRound??0,made); save(); stats(); state='over'; SFX.buzzer(); buzz([40,30,40]); $('again').hidden=false;
    const msg=made===10?'10개 모두 성공! 완벽한 슈터':made>=8?'에이스 슈터!':made>=5?'좋은 손끝이에요':'다음엔 더 잘 들어갈 거예요';
    hint(`10개 중 ${made}개 성공 · ${msg}`); if(made>=8&&!reduce) for(let i=0;i<100;i++) confetti.push({x:rand(0,W),y:rand(-H*.4,0),vx:rand(-40,40),vy:rand(60,180),r:rand(3,6),c:['#f07c2a','#ffd23f','#4fd18b','#5aa7ff','#fff'][i%5],a:rand(0,TAU),t:1,fall:true}); }
  else { state='reset'; st=0; } }
function animBall(dt){ const g=ball.segs[ball.seg]; if(!g){ if(!ball.done){ ball.done=true; settle(); } return; }
  if(ball.segT===0&&g.snd) ({swish:()=>{SFX.swish(); net=1; buzz(15);},rim:()=>{SFX.rim(1); buzz(20);},rim2:()=>SFX.rim(.6),board:()=>{SFX.board(); buzz(25);},floor:()=>SFX.floor()})[g.snd]();
  ball.segT+=dt; const e=Math.min(1,ball.segT/g.d);
  ball.x=lerp(ball.sx,g.x1,e); ball.y=lerp(ball.sy,g.y1,e)-Math.sin(Math.PI*e)*g.h; ball.s=lerp(ball.ss,g.s1,e); ball.layer=g.layer; ball.spin+=dt*(ball.seg===0?-8:-4);
  if(g.layer==='back') ball.alpha=1-e;
  if(e>=1){ ball.seg++; ball.segT=0; ball.sx=ball.x; ball.sy=ball.y; ball.ss=ball.s; if(ball.seg===2&&!ball.done){ ball.done=true; settle(); } } }
function step(dt){ st+=dt; dribT+=dt;
  if(ball) animBall(dt);
  if(state==='reset'&&st>1.5){ state='ready'; ball=null; SFX.dribble(); }
  if(state==='ready'&&!drag&&ac){ const ph=Math.floor(dribT*2.2/Math.PI); if(ph!==dribSnd){ dribSnd=ph; tone(0,.08,85,.12,'sine',55); } } }

/* ---------- input ---------- */
const pt=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); if(state!=='ready') return; try{cv.setPointerCapture(e.pointerId)}catch(_){} const p=pt(e); drag={x0:p.x,y0:p.y,x:p.x,y:p.y,id:e.pointerId}; buzz(8); });
cv.addEventListener('pointermove',e=>{ if(drag&&drag.id===e.pointerId){ const p=pt(e); drag.x=p.x; drag.y=p.y; } });
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{ if(!drag||drag.id!==e.pointerId) return; const d=drag; drag=null; if(e.type!=='pointerup') return; const p=powerOf(d); if(p<.12){ hint('위로 더 길게 쓸어 올려 주세요'); return; } shoot(aimOf(d),p); }));

/* ---------- drawing ---------- */
function E(x,y,rx,ry,rot,fill){ ctx.beginPath(); ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU); ctx.fillStyle=fill; ctx.fill(); }
function drawArena(t){ const hp=hoop();
  ctx.fillStyle='#120e0c'; ctx.fillRect(0,0,W,H);
  const cheer=state!=='ready'&&ball&&ball.done&&scored(ball.res);
  crowd.forEach(c=>{ const j=cheer?Math.abs(Math.sin(t*9+c.p))*4*S:Math.sin(t*1.2+c.p)*.5; E(c.x,c.y-j,4*S+1,4*S+1,0,c.c); });
  ctx.fillStyle='rgba(18,14,12,.35)'; ctx.fillRect(0,0,W,H*.46);
  const lg=ctx.createRadialGradient(hp.x,0,10,hp.x,H*.4,W*.8); lg.addColorStop(0,'rgba(255,235,200,.35)'); lg.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=lg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#2b211b'; ctx.fillRect(0,H*.46,W,H*.06); ctx.fillStyle='#f07c2a'; ctx.font=`${H*.032}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle';
  const ad='스트레스 슛! · 마음정비소',gap=ctx.measureText(ad).width+80*S; for(let x=-((t*30)%gap);x<W+gap;x+=gap) ctx.fillText(ad,x+gap/2,H*.49);
  const fy=H*.52; const fg=ctx.createLinearGradient(0,fy,0,H); fg.addColorStop(0,'#b8834f'); fg.addColorStop(1,'#d9a46a'); ctx.fillStyle=fg; ctx.fillRect(0,fy,W,H-fy);
  ctx.strokeStyle='rgba(90,55,25,.18)'; ctx.lineWidth=1; for(let i=-12;i<=12;i++){ ctx.beginPath(); ctx.moveTo(W/2+i*W*.04,fy); ctx.lineTo(W/2+i*W*.16,H); ctx.stroke(); }
  const lw=2.5*S, ftY=H*.93, kw0=W*.12, kw1=W*.3, pyAt=k=>lerp(fy,ftY,k), pxAt=k=>lerp(kw0,kw1,k);
  ctx.fillStyle='rgba(200,60,40,.55)'; ctx.beginPath(); ctx.moveTo(W/2-kw0,fy); ctx.lineTo(W/2+kw0,fy); ctx.lineTo(W/2+kw1,ftY); ctx.lineTo(W/2-kw1,ftY); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=lw; ctx.lineCap='butt';
  ctx.beginPath(); ctx.moveTo(0,fy); ctx.lineTo(W,fy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2-kw0,fy); ctx.lineTo(W/2-kw1,ftY); ctx.moveTo(W/2+kw0,fy); ctx.lineTo(W/2+kw1,ftY); ctx.stroke();
  ctx.lineWidth=lw*1.4; ctx.beginPath(); ctx.moveTo(W/2-kw1,ftY); ctx.lineTo(W/2+kw1,ftY); ctx.stroke(); ctx.lineWidth=lw;
  [.18,.34,.5,.66].forEach(k=>{ const y=pyAt(k),x=pxAt(k),tl=10*S*(.6+k*.6); ctx.beginPath(); ctx.moveTo(W/2-x,y); ctx.lineTo(W/2-x-tl,y); ctx.moveTo(W/2+x,y); ctx.lineTo(W/2+x+tl,y); ctx.stroke(); });
  ctx.setLineDash([10*S,9*S]); ctx.beginPath(); ctx.ellipse(W/2,ftY,kw1,(ftY-fy)*.32,0,Math.PI,TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.ellipse(W/2,ftY,kw1,(ftY-fy)*.32,0,0,Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2-W*.4,fy); ctx.lineTo(-W*.05,H); ctx.moveTo(W/2+W*.4,fy); ctx.lineTo(W*1.05,H); ctx.stroke();
  const rimDot=lerp(fy,ftY,.08); ctx.beginPath(); ctx.ellipse(W/2,rimDot,kw0*.35,(ftY-fy)*.03,0,0,TAU); ctx.stroke();
  ctx.fillStyle='#3a3f48'; ctx.fillRect(hp.x-7*S,hp.y-110*S,14*S,fy-(hp.y-110*S)); }
function drawBoard(){ const hp=hoop(),bw=170*S,bh=112*S,bx=hp.x-bw/2,by=hp.y-bh+14*S;
  ctx.fillStyle='rgba(235,245,255,.9)'; ctx.fillRect(bx,by,bw,bh); ctx.strokeStyle='#1d2430'; ctx.lineWidth=4*S; ctx.strokeRect(bx,by,bw,bh);
  ctx.strokeStyle='#d6453a'; ctx.lineWidth=3*S; ctx.strokeRect(hp.x-30*S,hp.y-46*S,60*S,44*S);
  ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(bx+6*S,by+6*S,bw*.3,4*S);
  ctx.fillStyle='#8a8f98'; ctx.fillRect(hp.x-8*S,hp.y-6*S,16*S,8*S); }
function rimHalf(back){ const hp=hoop(); ctx.strokeStyle=back?'#b8501c':'#f07c2a'; ctx.lineWidth=4.5*S; ctx.beginPath(); ctx.ellipse(hp.x,hp.y,hp.rx,hp.ry,0,back?Math.PI:0,back?TAU:Math.PI); ctx.stroke(); }
function drawNet(t,front){ const hp=hoop(),n=12,sw=net*Math.sin(t*22)*5*S,len=58*S*(1+net*.18),rb=hp.rx*.55;
  ctx.strokeStyle=front?'rgba(255,255,255,.9)':'rgba(255,255,255,.45)'; ctx.lineWidth=1.4*S;
  for(let i=0;i<n;i++){ const a=i/n*TAU,c=Math.cos(a),s=Math.sin(a); if(front!==(s>=0)) continue;
    const x0=hp.x+c*hp.rx,y0=hp.y+s*hp.ry,x1=hp.x+c*rb+sw,y1=hp.y+len+s*hp.ry*.5; const a2=(i+1)/n*TAU,x2=hp.x+Math.cos(a2)*rb+sw,y2=hp.y+len+Math.sin(a2)*hp.ry*.5;
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.quadraticCurveTo(lerp(x0,x1,.5)+sw*.5,lerp(y0,y1,.5),x1,y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.quadraticCurveTo(lerp(x0,x2,.5)+sw*.5,lerp(y0,y2,.5),x2,y2); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(hp.x+sw,hp.y+len*.55,hp.rx*.78,hp.ry*.7,0,front?0:Math.PI,front?Math.PI:TAU); ctx.stroke(); }
function drawBall(x,y,s,spin,alpha){ const r=home().r*s; ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y);
  const gr=ctx.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r); gr.addColorStop(0,'#f8a04e'); gr.addColorStop(1,'#c4561a'); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill();
  ctx.rotate(spin); ctx.strokeStyle='#3a1a0a'; ctx.lineWidth=Math.max(1,r*.07); ctx.beginPath(); ctx.moveTo(-r,0); ctx.lineTo(r,0); ctx.moveTo(0,-r); ctx.lineTo(0,r); ctx.stroke();
  ctx.beginPath(); ctx.arc(-r*1.15,0,r*.75,-1.1,1.1); ctx.stroke(); ctx.beginPath(); ctx.arc(r*1.15,0,r*.75,Math.PI-1.1,Math.PI+1.1); ctx.stroke(); ctx.restore(); }

let last=performance.now();
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000),t=now/1000; last=now;
  if(W>0&&H>0){ step(dt); net=Math.max(0,net-dt*1.6);
    drawArena(t);
    const b=ball, show=(layer)=>{ if(b&&b.layer===layer) drawBall(b.x,b.y,b.s,b.spin,b.alpha); };
    show('back'); drawBoard(); rimHalf(true); drawNet(t,false); show('mid'); drawNet(t,true); rimHalf(false);
    const h=home();
    if(b) { if(b.layer==='front'){ const fy=lerp(h.y+h.r,H*.66+b.s*h.r,clamp(1-b.s,0,1)); E(b.x,Math.max(fy,b.y+b.s*h.r*.9),h.r*b.s*.8,h.r*b.s*.22,0,'rgba(0,0,0,.22)'); drawBall(b.x,b.y,b.s,b.spin,b.alpha); } }
    else if(state==='ready'){ let ox=0,oy=0,sc=1; if(drag){ ox=(drag.x-drag.x0)*.15; oy=Math.min(0,(drag.y-drag.y0)*.12); sc=1-Math.min(.06,powerOf(drag)*.04); } else { oy=-Math.abs(Math.sin(dribT*2.2))*6*S; }
      E(h.x+ox,h.y+h.r*1.05,h.r*.85,h.r*.22,0,'rgba(0,0,0,.3)'); drawBall(h.x+ox,h.y+oy,sc,0,1);
      if(drag){ const p=powerOf(drag),ex=aimOf(drag); const bw=150*S,bx=h.x-bw/2,by=h.y+h.r+14*S,mx=1.6;
        ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(bx-3,by-3,bw+6,12*S+6); ctx.fillStyle='rgba(79,209,139,.55)'; ctx.fillRect(bx+bw*(IDEAL-BAND)/mx,by,bw*BAND*2/mx,12*S);
        ctx.fillStyle=Math.abs(p-IDEAL)<BAND?'#4fd18b':p>IDEAL?'#ff6b5a':'#f07c2a'; ctx.fillRect(bx,by,bw*Math.min(p,mx)/mx,12*S);
        const hp=hoop(); ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.setLineDash([6,8]); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(h.x+ox,h.y-h.r); ctx.lineTo(hp.x+ex*hp.rx*1.4,hp.y+hp.ry+20*S); ctx.stroke(); ctx.setLineDash([]); } }
    confetti.forEach(c=>{ if(!c.fall) c.vy+=500*S*dt; c.x+=c.vx*dt; c.y+=c.vy*dt; c.a+=dt*6; if(c.y>H) c.t=0; ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.a); ctx.fillStyle=c.c; ctx.fillRect(-c.r/2,-c.r/4,c.r,c.r/2); ctx.restore(); }); confetti=confetti.filter(c=>c.t>0);
    pops.forEach(p=>{ p.t+=dt/(p.big?1.6:1.3); if(p.t>1) return; const sc=p.big?(p.t<.1?1.6-p.t*6:1):1; ctx.save(); ctx.translate(W/2,H*(p.y||.56)-p.t*16); ctx.scale(sc,sc); ctx.globalAlpha=Math.min(1,(1-p.t)*2.5);
      ctx.font=`${p.size*Math.max(.6,Math.min(1.1,S*1.15))}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineWidth=8; ctx.strokeStyle='#120e0c'; ctx.strokeText(p.txt,0,0); ctx.fillStyle=p.col; ctx.fillText(p.txt,0,0); ctx.restore(); }); pops=pops.filter(p=>p.t<1);
  }
  requestAnimationFrame(frame); }
resize(); stats(); requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); save(); try{ if(amb){ ambG.gain.setTargetAtTime(0,ac.currentTime,.05); amb.stop(ac.currentTime+.3); } }catch(e){} };
}});
