/* 졸음 교실 깨우기 방 */
H.register('wakeup',{title:'졸음 교실 깨우기',sub:'꾸벅꾸벅 조는 친구를 톡톡! 45분 수업 집중도 지키기',floor:2,icon:'😴',color:'#3f9a6a',
blurb:'조는 친구들 톡톡 깨우기',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.wk-top{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}
.wk-meter{flex:1;height:10px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}
.wk-meter i{display:block;height:100%;width:100%;border-radius:inherit;background:#3f9a6a;transition:width .25s,background .25s}
.wk-top b{font-variant-numeric:tabular-nums;color:var(--fg);min-width:38px;text-align:right}
.wk-stats{position:absolute;top:10px;right:10px;display:flex;gap:8px;pointer-events:none;font-variant-numeric:tabular-nums}
.wk-stats .s{text-align:right;background:rgba(43,42,38,.6);padding:4px 8px;border-radius:8px}
.wk-stats b{display:block;font-family:"Jua",var(--display);font-weight:400;font-size:18px;color:#ffe08a;line-height:1}
.wk-stats span{font-size:10px;color:#eee}
.wk-hint{position:absolute;left:12px;right:12px;bottom:10px;text-align:center;font-size:13px;color:#2b2a26;pointer-events:none;transition:opacity .5s;text-wrap:balance}
.wk-hint span{background:rgba(255,252,245,.92);padding:5px 12px;border-radius:999px;display:inline-block}
.wk-seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.wk-seg button{border:0;background:none;padding:8px 12px;font-family:"Jua",var(--display);font-size:15px;color:var(--muted);cursor:pointer}
.wk-seg button[aria-pressed="true"]{background:#2f5a48;color:#fffcf5}
.wk-tool{padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--fg);font-family:"Jua",var(--display);font-size:15px;cursor:pointer;font-variant-numeric:tabular-nums}
.wk-tool:disabled{opacity:.45;cursor:default}
.wk-row .btn{margin-left:auto;font-family:"Jua",var(--display);font-size:16px}
@media (max-width:420px){.wk-seg button,.wk-tool{padding:8px 9px;font-size:14px}}
</style>
<div class="wk-top"><span>수업 집중도</span><div class="wk-meter" aria-hidden="true"><i data-r="meter"></i></div><b data-r="focusPct">100%</b></div>
<div class="stage" data-r="stage" style="background:#f1e9da">
  <canvas data-r="cv" aria-label="교실. 졸거나 자는 학생을 탭해서 깨우세요" style="touch-action:none"></canvas>
  <div class="wk-stats" data-r="stats"></div>
  <div class="wk-hint" data-r="hint"><span>꾸벅꾸벅 조는 학생, 엎드려 자는 학생을 톡톡 깨워 주세요</span></div>
</div>
<div class="row wk-row">
  <div class="wk-seg" role="group" aria-label="교시">
    <button type="button" data-mode="1" aria-pressed="true">1교시</button>
    <button type="button" data-mode="5" aria-pressed="false">5교시 · 점심 직후</button>
  </div>
</div>
<div class="row wk-row">
  <button class="wk-tool" data-r="clap" type="button" disabled>👏 박수 짝짝</button>
  <button class="wk-tool" data-r="win" type="button" disabled>🪟 창문 열기</button>
  <button class="btn" data-r="start" type="button">수업 시작</button>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Jua","Noto Sans KR",sans-serif';
const reduce=Hp.reduce;
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k;
let W=0,H=0,DPR=1,alive=true;
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); layout(); }

/* ---------- students ---------- */
const NAMES=['민준','서연','지호','하은','도윤','지우','시우','서윤','예준','하린','주원','수아','지안','유나','건우','채원'];
const HAIR=['#2a1f1a','#3b2a1f','#1f1a1d','#4a3424','#2d2420'];
const SKIN=['#f4cfae','#eebf98','#f7d8bd','#e8b48c'];
const WAKE=['헉! 안 잤어요!','네! 듣고 있어요!','죄송해요~','앗, 몇 쪽이죠?','깜짝이야!','정신 차릴게요!','눈 떴어요!'];
const COLS=4,ROWS=4;
let kids=[];
function makeKids(){ kids=[]; for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ const i=r*COLS+c; kids.push({r,c,name:NAMES[i],hair:HAIR[i%HAIR.length],skin:SKIN[(i*3)%SKIN.length],style:(i*7)%4,state:'awake',t:rand(6,18),d:0,nod:0,wake:0,blink:rand(1,4),writing:Math.random()<.6,ph:rand(0,TAU),bubble:0}); } layout(); }
function layout(){ kids.forEach(k=>{ const f=k.r/(ROWS-1),s=lerp(.62,1,f); const u=Math.min(W/4.3,H/3.9)*s; const span=W*lerp(.6,.98,f); k.u=u; k.x=W/2+(k.c-(COLS-1)/2)*(span/COLS); k.yd=lerp(H*.36,H*.9,f); }); }
const ro=new ResizeObserver(resize); ro.observe(stage);

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null,nb=null,snore=null,wind=null,loops=[];
function audio(){ if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate); const d=nb.getChannelData(0); let l=0; for(let i=0;i<d.length;i++){ const w=Math.random()*2-1; l=(l+.02*w)/1.02; d[i]=w*.4+l*2.5; }
    const n=ac.createBufferSource(); n.buffer=nb; n.loop=true; const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=260; const am=ac.createGain(); am.gain.value=.5; const lfo=ac.createOscillator(); lfo.frequency.value=.28; const ld=ac.createGain(); ld.gain.value=.5; lfo.connect(ld); ld.connect(am.gain);
    const g=ac.createGain(); g.gain.value=0; n.connect(lp); lp.connect(am); am.connect(g); g.connect(master); n.start(); lfo.start(); snore=g;
    const n2=ac.createBufferSource(); n2.buffer=nb; n2.loop=true; const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=700; bp.Q.value=.5; const g2=ac.createGain(); g2.gain.value=0; n2.connect(bp); bp.connect(g2); g2.connect(master); n2.start(0,.5); wind=g2;
    loops=[n,lfo,n2]; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
function noise(at,dur,type,f,q,vol){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()); n.stop(t+dur+.02); }
const SFX={
  bell(){ [659,523,587,392, 392,587,659,523].forEach((f,i)=>{ tone(i*.42,1.1,f,.12,'sine'); tone(i*.42,.8,f*2,.03,'sine'); }); },
  tap(){ noise(0,.05,'bandpass',1800,2,.35); noise(.11,.05,'bandpass',1900,2,.3); },
  gasp(){ tone(0,.18,300,.08,'triangle',620); tone(.02,.12,900,.03,'sine',1300); },
  oops(){ tone(0,.16,420,.06,'triangle',330); },
  clap(){ for(let i=0;i<4;i++){ noise(i*.13,.07,'bandpass',1500,.9,.7); noise(i*.13+.01,.05,'highpass',3000,.6,.25); } },
  window(){ noise(0,.4,'lowpass',500,.7,.3); [2400,2900,2600,3200].forEach((f,i)=>tone(.5+i*.14,.09,f,.04,'sine',f*1.25)); },
  combo(n){ tone(0,.2,660+n*30,.06); tone(.08,.25,990+n*30,.05); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- game ---------- */
const LESSON=75;
const sv=Hp.store.get('wakeRec',{best:0,bestFocus:0});
let mode=1,state='idle',time=0,score=0,wakes=0,combo=0,best=0,focusSum=0,focusN=0,clapCD=0,winCD=0,winOpen=0,pops=[],sparks=[],zs=[],result=null;
function rate(){ const ramp=1+time/LESSON*(mode===5?.9:.6); return (mode===5?1:.65)*ramp*(winOpen>0?.45:1); }
function focus(){ let v=0; kids.forEach(k=>v+=k.state==='awake'||k.state==='woke'?1:k.state==='drowsy'?.5:0); return v/kids.length; }
function stats(){ const left=Math.max(0,LESSON-time),mm=Math.floor(left/LESSON*45); $('stats').innerHTML=[[wakes,'깨움'],[combo,'연속'],[state==='idle'&&!result?'45분':mm+'분','남은 수업']].map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join(''); }
function setMeter(f){ const p=Math.round(f*100); $('meter').style.width=p+'%'; $('meter').style.background=p>=70?'#3f9a6a':p>=45?'#e0a63a':'#d4553f'; $('focusPct').textContent=p+'%'; }
let hintTimer=0; function hint(t,ms){ const h=$('hint'); h.innerHTML=`<span>${t}</span>`; h.style.opacity=1; clearTimeout(hintTimer); if(ms!==0) hintTimer=setTimeout(()=>h.style.opacity=0,ms||3600); }
function start(){ audio(); makeKids(); state='play'; time=0; score=0; wakes=0; combo=0; best=0; focusSum=0; focusN=0; clapCD=2; winCD=5; winOpen=0; pops=[]; zs=[]; result=null;
  $('start').textContent='처음부터'; $('clap').disabled=false; $('win').disabled=false; SFX.bell(); buzz([20,40,20]); hint(mode===5?'점심 먹고 난 5교시… 다들 졸릴 거예요. 힘내요!':'1교시 시작! 졸기 시작하는 학생을 살펴봐요'); stats(); }
$('start').onclick=start;
root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{ mode=+b.dataset.mode; root.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); if(state==='play') hint('다음 수업부터 적용돼요'); });
function finish(){ state='idle'; const avg=focusN?focusSum/focusN:1; $('clap').disabled=true; $('win').disabled=true; $('start').textContent='다음 수업'; SFX.bell(); buzz([30,40,60]);
  const p=Math.round(avg*100); const msg=p>=85?'모두가 반짝이는 교실! 최고의 수업이에요':p>=70?'집중 잘한 수업이었어요':p>=50?'꾸벅꾸벅… 그래도 잘 버텼어요':'오늘은 다들 많이 피곤했나 봐요';
  Hp.store.set('wakeRec',{best:Math.max(sv.best,best),bestFocus:Math.max(sv.bestFocus,p)});
  result={p,msg}; kids.forEach(k=>{ k.state='awake'; k.d=0; }); hint(`수업 끝! 평균 집중도 ${p}% · ${msg}`,0); }

function wakeKid(k,how){ const was=k.state; if(was==='awake'||was==='woke') return false;
  k.state='woke'; k.wake=1; k.d=0; k.t=rand(5,11)/rate(); wakes++;
  const pts=was==='asleep'?20:10; score+=pts; if(how==='tap'){ combo++; best=Math.max(best,combo); }
  pops.push({x:k.x,y:k.yd-k.u*1.05,t:0,txt:WAKE[Math.floor(rand(0,WAKE.length))],u:k.u});
  for(let i=0;i<6;i++){ const a=rand(-Math.PI,0),s=rand(40,110); sparks.push({x:k.x,y:k.yd-k.u*.7,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:1}); }
  return true; }
function tapAt(x,y){ if(state!=='play') return; let hit=null;
  for(let i=kids.length-1;i>=0;i--){ const k=kids[i]; if(Math.abs(x-k.x)<k.u*.46&&y>k.yd-k.u*.95&&y<k.yd+k.u*.35){ hit=k; break; } }
  if(!hit) return; SFX.tap(); buzz(12);
  if(wakeKid(hit,'tap')){ SFX.gasp(); buzz([10,30,25]); if(combo>0&&combo%5===0){ pops.push({x:W/2,y:H*.2,t:0,txt:`${combo}명 연속 깨움!`,big:true}); SFX.combo(combo/5); } }
  else { combo=0; SFX.oops(); pops.push({x:hit.x,y:hit.yd-hit.u*1.05,t:0,txt:'저 열공 중인데요?',u:hit.u,muted:true}); }
  stats(); }
$('clap').onclick=()=>{ if(state!=='play'||clapCD>0) return; audio(); SFX.clap(); buzz([20,40,20,40]); clapCD=10; let n=0;
  kids.forEach(k=>{ if(k.state==='drowsy'){ wakeKid(k,'clap'); n++; } else if(k.state==='asleep'){ k.state='drowsy'; k.d=.35; n++; } });
  pops.push({x:W/2,y:H*.22,t:0,txt:n?'짝짝! 다들 집중!':'짝짝!',big:true}); stats(); };
$('win').onclick=()=>{ if(state!=='play'||winCD>0) return; audio(); SFX.window(); buzz(20); winOpen=9; winCD=22; pops.push({x:W*.2,y:H*.2,t:0,txt:'상쾌한 바람~',big:false}); hint('창문을 열었더니 졸음이 천천히 와요'); };

const pt=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); if(state!=='play'){ if(!result) hint('아래 [수업 시작]을 눌러 주세요'); return; } const p=pt(e); tapAt(p.x,p.y); });

function update(dt){
  if(state==='play'){ time+=dt; if(time>=LESSON){ finish(); return; }
    clapCD=Math.max(0,clapCD-dt); winCD=Math.max(0,winCD-dt); winOpen=Math.max(0,winOpen-dt);
    $('clap').disabled=clapCD>0; $('clap').textContent=clapCD>0?`👏 박수 ${Math.ceil(clapCD)}초`:'👏 박수 짝짝';
    $('win').disabled=winCD>0; $('win').textContent=winOpen>0?`🪟 환기 중 ${Math.ceil(winOpen)}초`:winCD>0?`🪟 창문 ${Math.ceil(winCD)}초`:'🪟 창문 열기';
    const rt=rate();
    kids.forEach(k=>{
      const near=kids.filter(o=>o!==k&&Math.abs(o.r-k.r)+Math.abs(o.c-k.c)===1&&o.state==='asleep').length;
      if(k.state==='awake'||k.state==='woke'){ k.t-=dt*rt*(1+near*.2); if(k.state==='woke'&&k.wake<=0) k.state='awake'; if(k.t<=0){ k.state='drowsy'; k.d=0; } }
      else if(k.state==='drowsy'){ k.d+=dt*rt/rand(6,7.5); if(winOpen>0&&Math.random()<dt*.25){ k.state='awake'; k.t=rand(5,10)/rt; } if(k.d>=1){ k.state='asleep'; k.d=0; } }
      else if(k.state==='asleep'){ if(Math.random()<dt*.9) zs.push({x:k.x+k.u*.18,y:k.yd-k.u*.45,t:0,u:k.u}); }
    });
    const f=focus(); focusSum+=f*dt; focusN+=dt; setMeter(f);
    if(ac&&snore){ const sl=kids.filter(k=>k.state==='asleep').length; snore.gain.setTargetAtTime(Math.min(.16,sl*.03),ac.currentTime,.4); wind.gain.setTargetAtTime(winOpen>0?.06:0,ac.currentTime,.6); }
    if(Math.random()<dt*2) stats();
  } else if(ac&&snore){ snore.gain.setTargetAtTime(0,ac.currentTime,.3); wind.gain.setTargetAtTime(0,ac.currentTime,.3); }
  kids.forEach(k=>{ k.wake=Math.max(0,k.wake-dt*1.4); k.blink-=dt; if(k.blink<0) k.blink=rand(2,5); k.bubble+=dt; });
}

/* ---------- drawing ---------- */
function E(x,y,rx,ry,rot,fill){ ctx.beginPath(); ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU); ctx.fillStyle=fill; ctx.fill(); }
function RR(x,y,w,h,r,fill){ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h); ctx.fillStyle=fill; ctx.fill(); }
function drawRoom(t){
  ctx.fillStyle='#f1e9da'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e6dccb'; ctx.fillRect(0,H*.27,W,H*.04);
  const cx=W*.5,cy=H*.11,cr=Math.min(W,H)*.055; E(cx,cy,cr+3,cr+3,0,'#5b4a3a'); E(cx,cy,cr,cr,0,'#fffdf7');
  const left=state==='play'?time/LESSON:0, mins=left*45; ctx.strokeStyle='#2b2a26'; ctx.lineCap='round';
  const mh=(9*60+mins)/60, ma=mins/60*TAU-Math.PI/2, ha=(mh/12)*TAU-Math.PI/2;
  ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(ha)*cr*.5,cy+Math.sin(ha)*cr*.5); ctx.stroke();
  ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(ma)*cr*.8,cy+Math.sin(ma)*cr*.8); ctx.stroke();
  RR(W*.66,H*.05,W*.26,H*.15,6,'#c9a06a'); ['#fff4c7','#d8efe6','#ffd9d2','#dfe6ff'].forEach((c,i)=>{ ctx.save(); ctx.translate(W*.69+i*W*.055,H*.08+(i%2)*H*.04); ctx.rotate((i-1.5)*.08); RR(0,0,W*.045,H*.05,2,c); ctx.restore(); });
  ctx.font=`${Math.max(11,H*.024)}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle';
  RR(W*.1,H*.09,W*.28,H*.08,6,'rgba(255,255,255,.55)'); ctx.fillStyle='#3b5f4f'; ctx.fillText('함께 배우는 우리 반',W*.24,H*.13);
  const op=winOpen>0?Math.min(1,winOpen*1.5):0;
  ctx.fillStyle='#e9e2d2'; ctx.beginPath(); ctx.moveTo(0,H*.02); ctx.lineTo(W*.07,H*.06); ctx.lineTo(W*.07,H*.55); ctx.lineTo(0,H*.72); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#bfe3f2'; ctx.beginPath(); ctx.moveTo(4,H*.08); ctx.lineTo(W*.06,H*.1); ctx.lineTo(W*.06,H*.42); ctx.lineTo(4,H*.5); ctx.closePath(); ctx.fill();
  const sw=Math.sin(t*2.2)*op*8; ctx.fillStyle='rgba(240,200,170,.9)'; ctx.beginPath(); ctx.moveTo(2,H*.06); ctx.quadraticCurveTo(W*.035+sw,H*.3,6+sw*1.6,H*.54); ctx.lineTo(2,H*.56); ctx.fill();
  if(op>0&&!reduce){ ctx.strokeStyle=`rgba(255,255,255,${op*.6})`; ctx.lineWidth=2; for(let i=0;i<5;i++){ const y=H*(.18+i*.08),ph=(t*120+i*80)%(W*.8); ctx.beginPath(); ctx.moveTo(W*.04+ph,y); ctx.quadraticCurveTo(W*.1+ph,y-8,W*.16+ph,y); ctx.stroke(); } }
  const fg=ctx.createLinearGradient(0,H*.31,0,H); fg.addColorStop(0,'#c9a879'); fg.addColorStop(1,'#dcbf92'); ctx.fillStyle=fg; ctx.fillRect(0,H*.31,W,H*.69);
  ctx.strokeStyle='rgba(110,75,40,.12)'; ctx.lineWidth=1; for(let i=-10;i<=10;i++){ ctx.beginPath(); ctx.moveTo(W/2+i*W*.05,H*.31); ctx.lineTo(W/2+i*W*.16,H); ctx.stroke(); }
}
function hairCap(k,hx,hy,hr,down){ const st=k.style; ctx.fillStyle=k.hair;
  if(down){ E(hx,hy-hr*.1,hr*1.05,hr*.92,0,k.hair); if(st===1){ E(hx-hr*.9,hy+hr*.3,hr*.35,hr*.6,.2,k.hair); E(hx+hr*.9,hy+hr*.3,hr*.35,hr*.6,-.2,k.hair); } if(st===2) E(hx,hy-hr*.95,hr*.32,hr*.28,0,k.hair); return; }
  ctx.beginPath(); ctx.arc(hx,hy-hr*.08,hr*1.04,Math.PI*1.02,Math.PI*1.98); ctx.closePath(); ctx.fill();
  E(hx,hy-hr*.62,hr*.98,hr*.44,0,k.hair);
  if(st===1){ E(hx-hr*.92,hy+hr*.15,hr*.3,hr*.75,.1,k.hair); E(hx+hr*.92,hy+hr*.15,hr*.3,hr*.75,-.1,k.hair); }
  if(st===2){ E(hx+hr*.9,hy-hr*.4,hr*.3,hr*.3,0,k.hair); E(hx+hr*1.15,hy-hr*.1,hr*.22,hr*.42,-.4,k.hair); }
  if(st===3){ for(let i=-2;i<=2;i++) E(hx+i*hr*.42,hy-hr*.85,hr*.28,hr*.24,0,k.hair); } }
function drawKid(k,t){ const u=k.u,x=k.x,yd=k.yd,hr=u*.2;
  let hy=yd-u*.6, hx=x, tilt=0; const s=k.state;
  if(s==='drowsy'){ const cyc=(t*.7+k.ph)%1, nod=cyc<.82?Math.pow(cyc/.82,2):1-(cyc-.82)/.18; hy+=nod*u*(.1+k.d*.16); tilt=Math.sin(k.ph)*.15*k.d; }
  if(s==='asleep'){ hy=yd-u*.2; tilt=Math.sin(k.ph)>0?.35:-.35; }
  if(s==='woke'){ hy-=Math.sin(Math.min(1,(1-k.wake)*3)*Math.PI)*u*.12; }
  RR(x-u*.3,yd-u*.62,u*.6,u*.34,u*.05,'#8f6a45');
  const ty=s==='asleep'?yd-u*.36:yd-u*.45; RR(x-u*.3,ty,u*.6,yd-ty+u*.05,u*.14,'#2f3f66');
  ctx.fillStyle='#f4f1ea'; ctx.beginPath(); ctx.moveTo(x-u*.08,ty+2); ctx.lineTo(x,ty+u*.13); ctx.lineTo(x+u*.08,ty+2); ctx.fill(); ctx.fillStyle='#b8433a'; ctx.fillRect(x-u*.02,ty+u*.06,u*.04,u*.13);
  ctx.save(); ctx.translate(hx,hy); ctx.rotate(tilt); ctx.translate(-hx,-hy);
  if(s==='asleep'){ E(hx,hy,hr,hr*.9,0,k.skin); hairCap(k,hx,hy,hr,true); }
  else { E(hx,hy,hr,hr*1.02,0,k.skin); E(hx-hr*1.0,hy+hr*.1,hr*.18,hr*.26,0,k.skin); E(hx+hr*1.0,hy+hr*.1,hr*.18,hr*.26,0,k.skin);
    hairCap(k,hx,hy,hr,false);
    const ey=hy+hr*.12,ex=hr*.38; ctx.strokeStyle='#2b2220'; ctx.fillStyle='#2b2220'; ctx.lineCap='round'; ctx.lineWidth=Math.max(1.4,hr*.12);
    if(s==='drowsy'){ const lid=.3+k.d*.7; for(const sx of [-1,1]){ ctx.beginPath(); ctx.moveTo(hx+sx*ex-hr*.15,ey); ctx.quadraticCurveTo(hx+sx*ex,ey+hr*.12*lid,hx+sx*ex+hr*.15,ey); ctx.stroke(); } }
    else if(s==='woke'&&k.wake>.3){ for(const sx of [-1,1]){ E(hx+sx*ex,ey,hr*.16,hr*.2,0,'#fff'); E(hx+sx*ex,ey,hr*.09,hr*.11,0,'#2b2220'); } }
    else if(k.blink<.12){ for(const sx of [-1,1]){ ctx.beginPath(); ctx.moveTo(hx+sx*ex-hr*.12,ey); ctx.lineTo(hx+sx*ex+hr*.12,ey); ctx.stroke(); } }
    else for(const sx of [-1,1]) E(hx+sx*ex,ey,hr*.1,hr*.12,0,'#2b2220');
    E(hx-hr*.62,hy+hr*.42,hr*.16,hr*.09,0,'rgba(240,130,130,.5)'); E(hx+hr*.62,hy+hr*.42,hr*.16,hr*.09,0,'rgba(240,130,130,.5)');
    ctx.lineWidth=Math.max(1.2,hr*.09);
    if(s==='woke'&&k.wake>.3){ E(hx,hy+hr*.5,hr*.13,hr*.16,0,'#7a3a32'); }
    else if(s==='drowsy'&&k.d>.6){ E(hx,hy+hr*.5,hr*.12,hr*.1,0,'#7a3a32'); }
    else { ctx.beginPath(); ctx.arc(hx,hy+hr*.38,hr*.18,.2*Math.PI,.8*Math.PI); ctx.stroke(); } }
  ctx.restore();
  if(s==='woke'&&k.wake>.2){ ctx.fillStyle='#f2c230'; ctx.font=`${u*.32}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('!',hx+hr*1.3,hy-hr*1.2); E(hx-hr*1.15,hy-hr*.4,hr*.12,hr*.2,0,'#8ccbea'); }
  const dw=u*.9,dt=u*.13;
  ctx.fillStyle='#c48a52'; ctx.beginPath(); ctx.moveTo(x-dw/2,yd); ctx.lineTo(x+dw/2,yd); ctx.lineTo(x+dw/2+u*.03,yd+dt); ctx.lineTo(x-dw/2-u*.03,yd+dt); ctx.closePath(); ctx.fill();
  RR(x-dw/2-u*.03,yd+dt,dw+u*.06,u*.28,u*.03,'#a56f3d');
  ctx.fillStyle='#5b4a3a'; ctx.fillRect(x-dw/2+u*.02,yd+dt+u*.28,u*.04,u*.1); ctx.fillRect(x+dw/2-u*.06,yd+dt+u*.28,u*.04,u*.1);
  if(s!=='asleep'){ ctx.fillStyle='#fffdf6'; ctx.beginPath(); ctx.moveTo(x-u*.24,yd+dt*.85); ctx.lineTo(x-u*.2,yd+dt*.1); ctx.lineTo(x,yd+dt*.2); ctx.lineTo(x+u*.2,yd+dt*.1); ctx.lineTo(x+u*.24,yd+dt*.85); ctx.closePath(); ctx.fill(); }
  if(s==='asleep'){ RR(x-u*.34,yd-u*.06,u*.68,u*.13,u*.065,'#2f3f66'); E(x-u*.3,yd,u*.06,u*.05,0,k.skin); E(x+u*.3,yd,u*.06,u*.05,0,k.skin);
    if(k.bubble%3<2.2){ const b=Math.sin((k.bubble%3)/2.2*Math.PI); E(x+hr*.55,yd-u*.14,hr*.15+b*hr*.35,hr*.15+b*hr*.35,0,'rgba(190,225,245,.75)'); } }
  else { const wr=k.writing&&s==='awake'?Math.sin(t*9+k.ph)*u*.02:0; E(x-u*.2,yd+dt*.5,u*.07,u*.05,0,k.skin); E(x+u*.18+wr,yd+dt*.45,u*.07,u*.05,0,k.skin);
    if(k.writing&&s!=='drowsy'){ ctx.strokeStyle='#e0a63a'; ctx.lineWidth=Math.max(1.5,u*.02); ctx.beginPath(); ctx.moveTo(x+u*.17+wr,yd+dt*.4); ctx.lineTo(x+u*.25+wr,yd-u*.07); ctx.stroke(); } }
  ctx.font=`${Math.max(9,u*.12)}px ${DISPLAY}`; const tw=ctx.measureText(k.name).width+u*.12; RR(x-tw/2,yd+dt+u*.07,tw,u*.15,u*.03,'#fffaf0'); ctx.fillStyle='#4a3a2c'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(k.name,x,yd+dt+u*.145);
  if(s==='drowsy'&&((t*.7+k.ph)%1)>.8){ ctx.fillStyle='rgba(60,60,80,.6)'; ctx.font=`${u*.13}px ${DISPLAY}`; ctx.fillText('꾸벅',x+hr*1.6,hy-hr*.3); }
}

let last=performance.now();
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000),t=now/1000; last=now;
  if(W>0&&H>0){ update(dt); drawRoom(t);
    kids.forEach(k=>drawKid(k,t));
    zs.forEach(z=>{ z.t+=dt/2.2; const a=1-z.t; ctx.globalAlpha=Math.max(0,a); ctx.fillStyle='#5a6aa8'; ctx.font=`${z.u*(.14+z.t*.12)}px ${DISPLAY}`; ctx.textAlign='center'; ctx.fillText('Z',z.x+Math.sin(z.t*6)*z.u*.06+z.t*z.u*.2,z.y-z.t*z.u*.6); ctx.globalAlpha=1; }); zs=zs.filter(z=>z.t<1);
    sparks.forEach(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=120*dt; p.t-=dt*2; ctx.globalAlpha=Math.max(0,p.t); ctx.fillStyle='#f2c230'; ctx.beginPath(); ctx.arc(p.x,p.y,2.6,0,TAU); ctx.fill(); ctx.globalAlpha=1; }); sparks=sparks.filter(p=>p.t>0);
    pops.forEach(p=>{ p.t+=dt/(p.big?1.6:1.5); if(p.t>1) return; ctx.globalAlpha=Math.min(1,(1-p.t)*3); const sz=p.big?Math.max(22,Math.min(W,H)*.06):Math.max(12,(p.u||60)*.17);
      ctx.font=`${sz}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; const tw=ctx.measureText(p.txt).width+sz; const y=p.y-p.t*18; let x=clamp(p.x,tw/2+4,W-tw/2-4);
      if(!p.big){ RR(x-tw/2,y-sz*.85,tw,sz*1.7,sz*.85,p.muted?'#eee7da':'#fffcf5'); ctx.fillStyle=p.muted?'#eee7da':'#fffcf5'; ctx.beginPath(); ctx.moveTo(x-6,y+sz*.8); ctx.lineTo(x+4,y+sz*.8); ctx.lineTo(x-2,y+sz*1.3); ctx.fill(); ctx.fillStyle=p.muted?'#7b7466':'#2b2a26'; ctx.fillText(p.txt,x,y); }
      else { ctx.lineWidth=6; ctx.strokeStyle='#fffcf5'; ctx.strokeText(p.txt,x,y); ctx.fillStyle='#e0794f'; ctx.fillText(p.txt,x,y); }
      ctx.globalAlpha=1; }); pops=pops.filter(p=>p.t<1);
    if(result){ RR(W*.1,H*.36,W*.8,H*.22,16,'rgba(255,252,245,.95)'); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#2f5a48'; ctx.font=`${Math.max(22,Math.min(W,H)*.065)}px ${DISPLAY}`; ctx.fillText(`평균 집중도 ${result.p}%`,W/2,H*.43);
      ctx.fillStyle='#7b7466'; ctx.font=`${Math.max(13,Math.min(W,H)*.032)}px "Noto Sans KR",sans-serif`; ctx.fillText(result.msg,W/2,H*.49); ctx.fillText(`깨운 횟수 ${wakes}번 · 최고 연속 ${best}명`,W/2,H*.535); }
  }
  requestAnimationFrame(frame); }
makeKids(); resize(); stats(); setMeter(1); requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); clearTimeout(hintTimer); try{ if(ac){ const t=ac.currentTime; if(snore) snore.gain.setTargetAtTime(0,t,.05); if(wind) wind.gain.setTargetAtTime(0,t,.05); loops.forEach(n=>n.stop(t+.3)); } }catch(e){} };
}});
