/* 벌레 잡기 방 — 파리채·손바닥·전기 모기채 */
H.register('bugs',{title:'벌레 잡기',sub:'윙윙대는 파리·모기를 찰싹! 앉아 있을 때가 기회',floor:1,icon:'🪰',color:'#2f8f6b',
blurb:'파리채로 찰싹, 모기채로 지지직',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.bg-top{display:flex;align-items:center;gap:10px}
.bg-stats{display:flex;gap:14px;margin-left:auto;font-variant-numeric:tabular-nums}
.bg-stats .s{text-align:right}
.bg-stats b{display:block;font-family:"Jua",var(--display);font-weight:400;font-size:20px;color:#f08a6c;line-height:1}
.bg-stats span{font-size:10px;color:var(--muted)}
.bg-hint{position:absolute;left:12px;right:12px;top:10px;text-align:center;font-size:13px;color:#2c2620;pointer-events:none;transition:opacity .5s;text-wrap:balance}
.bg-hint span{background:rgba(255,252,246,.9);padding:5px 12px;border-radius:999px;display:inline-block}
.bg-seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.bg-seg button{border:0;background:none;padding:7px 12px;font-family:"Jua",var(--display);font-size:15px;color:var(--muted);cursor:pointer}
.bg-seg button[aria-pressed="true"]{background:#2f8f6b;color:#fffcf6}
.bg-lab{font-size:11px;color:var(--muted)}
@media (max-width:420px){.bg-seg button{padding:7px 9px;font-size:14px}.bg-stats{gap:9px}.bg-stats b{font-size:17px}}
</style>
<div class="bg-top"><div class="bg-stats" data-r="stats"></div></div>
<div class="stage" data-r="stage" style="background:#efe3cc">
  <canvas data-r="cv" aria-label="파리와 모기가 날아다니는 방. 탭해서 잡으세요" style="touch-action:none;cursor:none"></canvas>
  <div class="bg-hint" data-r="hint"><span>윙윙대는 파리를 탭해서 찰싹! 앉아 있을 때가 기회예요</span></div>
</div>
<div class="row"><span class="bg-lab">장소</span>
  <div class="bg-seg" role="group" aria-label="장소">
    <button type="button" data-scene="fly" aria-pressed="true">낮 부엌 · 파리</button>
    <button type="button" data-scene="mos" aria-pressed="false">밤 침실 · 모기</button>
  </div></div>
<div class="row"><span class="bg-lab">도구</span>
  <div class="bg-seg" role="group" aria-label="도구">
    <button type="button" data-tool="swatter" aria-pressed="true">파리채</button>
    <button type="button" data-tool="palm" aria-pressed="false">손바닥</button>
    <button type="button" data-tool="zap" aria-pressed="false">전기 모기채</button>
  </div></div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Jua","Noto Sans KR",sans-serif';
const reduce=Hp.reduce;
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let W=0,H=0,DPR=1,S=1,alive=true;
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); S=clamp(Math.min(W,H)/480,.75,1.35); }
const ro=new ResizeObserver(resize); ro.observe(stage); resize();
const rrect=(x,y,w,h,r)=>{ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h); };

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null,nb=null,hum=null,humO=null,voiceCount=0;
function audio(){ if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const o=ac.createOscillator(); o.type='square'; o.frequency.value=120; const lp=ac.createBiquadFilter(); lp.type='bandpass'; lp.frequency.value=2400; lp.Q.value=2; const g=ac.createGain(); g.gain.value=0; o.connect(lp); lp.connect(g); g.connect(master); o.start(); hum=g; humO=o; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function noise(at,dur,type,f,q,vol,att){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(att||.003)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()); n.stop(t+dur+.02); }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
const SFX={
  swat(){ noise(0,.13,'highpass',1700,.6,.7); tone(0,.14,140,.25,'sine',60); noise(.01,.05,'bandpass',4200,2,.18); },
  palm(){ noise(0,.07,'bandpass',1500,.9,.8); noise(.012,.09,'bandpass',900,.8,.45); tone(0,.08,180,.18,'sine',90); },
  miss(){ noise(0,.18,'bandpass',700,.7,.16,.05); },
  zap(){ for(let i=0;i<5;i++){ noise(i*.025,.03,'highpass',3500,.7,.4); } tone(0,.16,1400,.07,'square',600); tone(.02,.12,90,.15,'sawtooth',50); },
  ouch(){ tone(0,.18,420,.09,'triangle',300); },
  scratch(){ for(let i=0;i<3;i++) noise(i*.08,.06,'bandpass',2800,1.2,.2); },
  bite(){ tone(0,.35,900,.04,'sawtooth',1300); },
  combo(n){ tone(0,.2,660+n*40,.06); tone(.07,.25,990+n*40,.05); }
};
function makeVoice(b){ if(!ac||voiceCount>=8) return null; voiceCount++;
  const fly=b.type==='fly',o=ac.createOscillator(),o2=ac.createOscillator(); o.type='sawtooth'; o2.type=fly?'square':'sawtooth'; o.frequency.value=b.f; o2.frequency.value=b.f*1.012;
  const lfo=ac.createOscillator(); lfo.frequency.value=fly?rand(16,24):rand(28,38); const ld=ac.createGain(); ld.gain.value=fly?12:28; lfo.connect(ld); ld.connect(o.frequency); ld.connect(o2.frequency);
  const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=fly?650:1500; bp.Q.value=.9; const g=ac.createGain(); g.gain.value=0;
  o.connect(bp); o2.connect(bp); bp.connect(g); let pan=null; if(ac.createStereoPanner){ pan=ac.createStereoPanner(); g.connect(pan); pan.connect(master); } else g.connect(master);
  o.start(); o2.start(); lfo.start(); return {o,o2,lfo,g,pan}; }
function killVoice(b){ const v=b.v; if(!v) return; b.v=null; voiceCount--; v.g.gain.setTargetAtTime(0,ac.currentTime,.03); setTimeout(()=>{ try{ v.o.stop(); v.o2.stop(); v.lfo.stop(); }catch(e){} },300); }
const buzz=p=>Hp.buzz(p);

/* ---------- state ---------- */
let scene='fly',tool='swatter',bugs=[],splats=[],pops=[],sparks=[],swats=[],bites=[],handprints=[];
let kills=0,combo=0,best=Hp.store.get('bugsBest',0),swings=0,hitsTap=0,bitten=0,lastZap=0,score=0,shake=0,spawnT=0,total=Hp.store.get('bugsTotal',0),saveT=0;
let hover=null,down=false,touchHide=0;
function stats(){ const acc=swings?Math.round(hitsTap/swings*100)+'%':'–';
  const arr=[[kills,'잡음'],[combo,'콤보'],[best,'최고 콤보'],scene==='mos'?[bitten,'물린 곳']:[acc,'명중률']];
  $('stats').innerHTML=arr.map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join('');
  clearTimeout(saveT); saveT=setTimeout(()=>{ Hp.store.set('bugsBest',best); Hp.store.set('bugsTotal',total); },800); }
let hintTimer=0; function hint(t,ms){ const h=$('hint'); h.innerHTML=`<span>${t}</span>`; h.style.opacity=1; clearTimeout(hintTimer); hintTimer=setTimeout(()=>h.style.opacity=0,ms||3800); }

const diff=()=>1+Math.min(kills,50)*.012;
const want=()=>scene==='fly'?Math.min(8,3+Math.floor(kills/7)):Math.min(6,2+Math.floor(kills/9));

/* ---------- arm (night) ---------- */
function arm(){ return {ax:W*1.04,ay:H*1.02,bx:W*.42,by:H*.83,r:34*S}; }
function distSeg(px,py,a){ const dx=a.bx-a.ax,dy=a.by-a.ay,l2=dx*dx+dy*dy; let t=((px-a.ax)*dx+(py-a.ay)*dy)/l2; t=clamp(t,0,1); return Math.hypot(px-(a.ax+dx*t),py-(a.ay+dy*t)); }
function armPoint(){ const a=arm(),t=rand(.25,.85); return {x:a.ax+(a.bx-a.ax)*t+rand(-8,8),y:a.ay+(a.by-a.ay)*t-a.r*rand(.2,.6),onArm:true}; }

/* ---------- bugs ---------- */
function fruit(){ return {x:W*.5,y:H*.79,r:62*S}; }
function landSpot(type){
  if(type==='mos'&&Math.random()<.62) return armPoint();
  if(type==='fly'&&Math.random()<.55){ const c=fruit(); return {x:c.x+rand(-c.r*.8,c.r*.8),y:c.y-rand(0,c.r*.35)}; }
  return {x:rand(W*.08,W*.92),y:rand(H*.12,H*(scene==='fly'?.9:.7))}; }
function spawn(){ const type=scene; const side=Math.floor(rand(0,3)); let x,y;
  if(side===0){ x=W*.18+rand(-20,20); y=H*.24; } else if(side===1){ x=-20; y=rand(H*.15,H*.6); } else { x=W+20; y=rand(H*.15,H*.6); }
  bugs.push({type,x,y,vx:(W/2-x)*.6,vy:rand(-30,30),state:'fly',tx:rand(W*.2,W*.8),ty:rand(H*.2,H*.6),tT:rand(.6,1.4),landing:null,landT:0,biteT:0,panic:0,f:type==='fly'?rand(165,215):rand(560,680),R:(type==='fly'?8:7)*S,wing:Math.random()*10,head:0,dead:0,zapped:false,rub:0}); }
function newTarget(b){ b.tT=rand(.5,1.5)/(b.type==='mos'?1.3:1); const landRate=b.type==='fly'?.32:.36;
  if(Math.random()<landRate){ b.landing=landSpot(b.type); b.tx=b.landing.x; b.ty=b.landing.y; }
  else { b.landing=null; b.tx=rand(W*.06,W*.94); b.ty=rand(H*.08,H*.78); } }
function updateBug(b,dt){
  const max=(b.type==='fly'?230:170)*diff()*S;
  if(b.state==='land'){ b.landT-=dt; b.rub+=dt; if(b.landing&&b.landing.onArm){ b.biteT+=dt; if(b.biteT>2.3){ bite(b); takeoff(b); return; } } if(b.landT<=0) takeoff(b); return; }
  b.tT-=dt; if(b.tT<=0&&!b.landing) newTarget(b);
  if(b.panic>0){ b.panic-=dt; }
  else { const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy)||1;
    if(b.landing&&d<7*S){ b.state='land'; b.x=b.tx; b.y=b.ty; b.vx=b.vy=0; b.landT=b.landing.onArm?2.6:rand(1.4,3.2)/diff(); b.biteT=0; b.rub=0; return; }
    const sp=b.landing?Math.min(max,d*3+40):max, steer=b.type==='fly'?3.2:4.5;
    b.vx+=((dx/d)*sp-b.vx)*Math.min(1,dt*steer); b.vy+=((dy/d)*sp-b.vy)*Math.min(1,dt*steer);
    const j=b.type==='fly'?260:520; b.vx+=rand(-j,j)*dt; b.vy+=rand(-j,j)*dt; }
  const v=Math.hypot(b.vx,b.vy),lim=max*(b.panic>0?2:1.15); if(v>lim){ b.vx*=lim/v; b.vy*=lim/v; }
  b.x+=b.vx*dt; b.y+=b.vy*dt;
  if(b.panic<=0){ if(b.x<10){ b.vx=Math.abs(b.vx); } if(b.x>W-10) b.vx=-Math.abs(b.vx); if(b.y<10) b.vy=Math.abs(b.vy); if(b.y>H-10) b.vy=-Math.abs(b.vy); }
  b.x=clamp(b.x,-30,W+30); b.y=clamp(b.y,-30,H+30);
  if(v>8) b.head=Math.atan2(b.vy,b.vx); }
function takeoff(b){ b.state='fly'; b.landing=null; const a=rand(-Math.PI*.9,-Math.PI*.1); b.vx=Math.cos(a)*160*S; b.vy=Math.sin(a)*160*S; b.tx=rand(W*.1,W*.9); b.ty=rand(H*.1,H*.6); b.tT=rand(.6,1.2); }
function bite(b){ bitten++; bites.push({x:b.x,y:b.y+4*S,r:0,R:rand(7,10)*S}); if(bites.length>14) bites.shift(); SFX.bite(); buzz([10,40,10]); pops.push({x:b.x,y:b.y-24*S,t:0,txt:'앵~ 물렸다!',col:'#c0453a'}); stats(); }
function kill(b,how){ b.state='dead'; b.dead=0; b.zapped=how==='zap'; killVoice(b); kills++; total++; const pts=b.type==='fly'?10:15; score+=pts;
  splats.push({x:b.x,y:b.y,type:b.type,head:b.head,t:0,zapped:b.zapped,rot:rand(-.4,.4)}); if(splats.length>40) splats.shift();
  for(let i=0;i<(b.zapped?14:8);i++){ const a=rand(0,TAU),s=rand(60,200)*S; sparks.push({x:b.x,y:b.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:1,c:b.zapped?(Math.random()<.5?'#7fd6ff':'#fff3a0'):(Math.random()<.5?'#ffd45a':'#ffffff')}); } }
function dodge(x,y){ bugs.forEach(b=>{ if(b.state==='dead') return; const d=Math.hypot(b.x-x,b.y-y); if(d>150*S) return;
  const ch=(b.state==='land'?.1:.38)*diff()*(b.type==='mos'?1.15:1); if(Math.random()<ch){ const a=Math.atan2(b.y-y,b.x-x)+rand(-.6,.6),s=(b.type==='fly'?430:320)*S; b.state='fly'; b.landing=null; b.vx=Math.cos(a)*s; b.vy=Math.sin(a)*s; b.panic=.35; b.tx=b.x+Math.cos(a)*200; b.ty=b.y+Math.sin(a)*200; b.tT=.5; } }); }

/* ---------- swatting ---------- */
const TOOLR={swatter:46,palm:32,zap:44};
function swat(x,y){ swings++; dodge(x,y); swats.push({x,y,t:0,tool,done:false}); }
function impact(s){ s.done=true; const r=TOOLR[s.tool]*S; let n=0;
  bugs.forEach(b=>{ if(b.state==='dead') return; if(Math.hypot(b.x-s.x,b.y-s.y)<r+b.R*.6){ kill(b,s.tool); n++; } });
  if(s.tool==='swatter') SFX.swat(); else SFX.palm();
  if(n){ hitsTap++; combo+=n; best=Math.max(best,combo); shake=.18+n*.06; buzz(n>1?[25,30,40]:20);
    const words=s.tool==='palm'?['짝!','딱!','잡았다!']:['찰싹!','철썩!','탁!'];
    pops.push({x:s.x,y:s.y-30*S,t:0,txt:n>1?(n>2?'트리플!':'더블!'):words[Math.floor(rand(0,words.length))],col:'#d0563f',big:n>1});
    pops.push({x:s.x+26*S,y:s.y-6*S,t:0,txt:'+'+(n*(scene==='fly'?10:15)),col:'#2f8f6b',small:true});
    if(combo>0&&combo%5===0){ pops.push({x:W/2,y:H*.3,t:0,txt:`${combo} 콤보!`,col:'#e8a02a',big:true}); SFX.combo(combo/5); }
  } else {
    combo=0; SFX.miss(); buzz(8);
    if(scene==='mos'){ const a=arm(); const bt=bites.find(q=>Math.hypot(q.x-s.x,q.y-s.y)<r);
      if(bt){ bt.R-=4*S; SFX.scratch(); pops.push({x:s.x,y:s.y-26*S,t:0,txt:'벅벅… 시원해',col:'#7d7266'}); if(bt.R<3) bites.splice(bites.indexOf(bt),1); }
      else if(distSeg(s.x,s.y,a)<a.r){ SFX.ouch(); handprints.push({x:s.x,y:s.y,t:0}); pops.push({x:s.x,y:s.y-26*S,t:0,txt:'아야! 내 팔…',col:'#c0453a'}); buzz(30); } }
    else if(Math.random()<.5) pops.push({x:s.x,y:s.y-26*S,t:0,txt:['휙~','놓쳤다','어디 갔지?'][Math.floor(rand(0,3))],col:'#7d7266',small:true});
  }
  stats(); }
function zapCheck(){ if(!down||tool!=='zap'||!hover) return; const r=TOOLR.zap*S;
  bugs.forEach(b=>{ if(b.state==='dead') return; if(Math.hypot(b.x-hover.x,b.y-hover.y)<r+b.R*.5){ kill(b,'zap'); SFX.zap(); const now=performance.now(); if(now-lastZap<2200) combo++; else combo=1; lastZap=now; best=Math.max(best,combo);
    pops.push({x:b.x,y:b.y-28*S,t:0,txt:['지지직!','타닥!','파직!'][Math.floor(rand(0,3))],col:'#2b7bbf'}); buzz(18); shake=.12;
    if(combo%5===0){ pops.push({x:W/2,y:H*.3,t:0,txt:`${combo} 콤보!`,col:'#e8a02a',big:true}); SFX.combo(combo/5); } stats(); } }); }

/* ---------- input ---------- */
const pt=e=>{ const r=cv.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); try{cv.setPointerCapture(e.pointerId)}catch(_){} hover=pt(e); hover.touch=e.pointerType!=='mouse'; down=true; if(tool!=='zap') swat(hover.x,hover.y); else buzz(10); });
cv.addEventListener('pointermove',e=>{ hover=Object.assign(pt(e),{touch:e.pointerType!=='mouse'}); });
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{ down=false; if(e.pointerType!=='mouse') touchHide=.45; }));
cv.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse'&&!down) hover=null; });
function setScene(s){ scene=s; bugs.forEach(killVoice); bugs=[]; splats=[]; bites=[]; handprints=[]; combo=0; spawnT=0; for(let i=0;i<want();i++) spawn();
  root.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===s)));
  hint(s==='fly'?'수박에 앉은 파리가 잡기 쉬워요':'모기가 팔에 앉아 피를 빨기 전에 잡으세요! 물린 곳을 톡 치면 긁어요'); stats(); }
root.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{ audio(); setScene(b.dataset.scene); });
root.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{ tool=b.dataset.tool; root.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  if(tool==='zap') hint('누른 채로 휘두르면 닿는 벌레가 지지직!'); });

/* ---------- drawing: scenes ---------- */
function E(x,y,rx,ry,rot,fill){ ctx.beginPath(); ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU); ctx.fillStyle=fill; ctx.fill(); }
function drawKitchen(t){
  ctx.fillStyle='#f4ead6'; ctx.fillRect(0,0,W,H);
  const ty=H*.42; ctx.fillStyle='#e9f1ee'; ctx.fillRect(0,ty,W,H*.32); ctx.strokeStyle='rgba(120,150,140,.35)'; ctx.lineWidth=1;
  const ts=34*S; for(let x=0;x<W;x+=ts){ ctx.beginPath(); ctx.moveTo(x,ty); ctx.lineTo(x,H*.74); ctx.stroke(); } for(let y=ty;y<H*.74;y+=ts){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const wx=W*.06,wy=H*.07,ww=W*.26,wh=H*.3; ctx.fillStyle='#fffaf0'; ctx.fillRect(wx-6,wy-6,ww+12,wh+12); const sk=ctx.createLinearGradient(0,wy,0,wy+wh); sk.addColorStop(0,'#9fd3ef'); sk.addColorStop(1,'#d9f0f7'); ctx.fillStyle=sk; ctx.fillRect(wx,wy,ww,wh);
  E(wx+ww*.7,wy+wh*.3,18*S,18*S,0,'#fff2b0'); E(wx+ww*.3,wy+wh*.6,30*S,10*S,0,'rgba(255,255,255,.9)'); ctx.fillStyle='#fffaf0'; ctx.fillRect(wx+ww/2-3,wy,6,wh); ctx.fillRect(wx,wy+wh/2-3,ww,6);
  ctx.fillStyle='#f2b8a6'; ctx.beginPath(); ctx.moveTo(wx-14,wy-10); ctx.quadraticCurveTo(wx+ww*.22,wy+wh*.5,wx-6,wy+wh+14); ctx.lineTo(wx-14,wy+wh+14); ctx.fill();
  ctx.beginPath(); ctx.moveTo(wx+ww+14,wy-10); ctx.quadraticCurveTo(wx+ww*.78,wy+wh*.5,wx+ww+6,wy+wh+14); ctx.lineTo(wx+ww+14,wy+wh+14); ctx.fill();
  ctx.fillStyle='#b98b5c'; ctx.fillRect(W*.6,H*.2,W*.32,8*S); E(W*.68,H*.15,9*S,12*S,0,'#7fae6a'); E(W*.76,H*.155,12*S,10*S,0,'#e0a35a'); ctx.fillStyle='#d9c7a8'; ctx.fillRect(W*.82,H*.12,18*S,H*.08);
  ctx.fillStyle='#c18b56'; ctx.fillRect(0,H*.74,W,H*.26); ctx.fillStyle='#a87444'; ctx.fillRect(0,H*.74,W,6*S);
  ctx.strokeStyle='rgba(90,50,20,.15)'; for(let y=H*.78;y<H;y+=16*S){ ctx.beginPath(); ctx.moveTo(0,y); ctx.bezierCurveTo(W*.3,y+5,W*.7,y-5,W,y+2); ctx.stroke(); }
  const f=fruit(); E(f.x,f.y+f.r*.42,f.r*1.5,f.r*.36,0,'rgba(80,45,15,.25)'); E(f.x,f.y+f.r*.3,f.r*1.45,f.r*.34,0,'#f7f4ee'); E(f.x,f.y+f.r*.28,f.r*1.15,f.r*.24,0,'#ece6db');
  for(const dx of [-.55,.55]){ const cx=f.x+dx*f.r,cy=f.y+f.r*.22; ctx.save(); ctx.translate(cx,cy); ctx.rotate(dx*.25);
    ctx.fillStyle='#3d8a3d'; ctx.beginPath(); ctx.moveTo(-f.r*.62,0); ctx.lineTo(f.r*.62,0); ctx.lineTo(0,-f.r*.95); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#e8524a'; ctx.beginPath(); ctx.moveTo(-f.r*.5,-f.r*.1); ctx.lineTo(f.r*.5,-f.r*.1); ctx.lineTo(0,-f.r*.9); ctx.closePath(); ctx.fill();
    [[-.15,-.35],[.12,-.4],[0,-.58],[-.25,-.22],[.25,-.24]].forEach(([a,b2])=>E(a*f.r,b2*f.r,2.2*S,3.4*S,0,'#2a1a14')); ctx.restore(); }
}
function drawBedroom(t){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#232a4a'); g.addColorStop(1,'#353c62'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,.03)'; for(let x=0;x<W;x+=40*S) ctx.fillRect(x,0,14*S,H*.7);
  const wx=W*.08,wy=H*.08,ww=W*.24,wh=H*.28; ctx.fillStyle='#4a5180'; ctx.fillRect(wx-6,wy-6,ww+12,wh+12); ctx.fillStyle='#10142b'; ctx.fillRect(wx,wy,ww,wh);
  E(wx+ww*.68,wy+wh*.35,16*S,16*S,0,'#f6efc8'); E(wx+ww*.68+6*S,wy+wh*.35-4*S,13*S,13*S,0,'#10142b');
  for(let i=0;i<10;i++){ ctx.fillStyle=`rgba(255,255,255,${.4+.5*Math.abs(Math.sin(t*1.3+i))})`; ctx.fillRect(wx+((i*53)%ww),wy+((i*37)%wh),2,2); }
  ctx.fillStyle='#4a5180'; ctx.fillRect(wx+ww/2-3,wy,6,wh);
  const lx=W*.86,ly=H*.5; const lg=ctx.createRadialGradient(lx,ly,10,lx,ly,Math.max(W,H)*.7); lg.addColorStop(0,'rgba(255,205,130,.42)'); lg.addColorStop(.5,'rgba(255,190,110,.12)'); lg.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=lg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#5b4a3a'; ctx.fillRect(lx-24*S,H*.62,48*S,H*.1); ctx.fillStyle='#3a2e24'; ctx.fillRect(lx-3*S,ly,6*S,H*.12); ctx.fillStyle='#f2d49a'; ctx.beginPath(); ctx.moveTo(lx-26*S,ly); ctx.lineTo(lx+26*S,ly); ctx.lineTo(lx+16*S,ly-34*S); ctx.lineTo(lx-16*S,ly-34*S); ctx.fill();
  ctx.fillStyle='#e9e3f2'; ctx.fillRect(0,H*.72,W,H*.28); ctx.fillStyle='#8a9ad6'; ctx.beginPath(); ctx.moveTo(0,H*.76); ctx.bezierCurveTo(W*.3,H*.72,W*.6,H*.8,W,H*.75); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();
  for(let x=20;x<W;x+=46*S) for(let y=H*.82;y<H;y+=34*S) E(x+((y/34)%2)*20,y,5*S,5*S,0,'rgba(255,255,255,.28)');
  ctx.fillStyle='#f7f3fb'; rrect(W*.04,H*.66,W*.3,H*.12,20*S); ctx.fill();
  const a=arm(),ang=Math.atan2(a.by-a.ay,a.bx-a.ax),len=Math.hypot(a.bx-a.ax,a.by-a.ay);
  ctx.save(); ctx.translate(a.ax,a.ay); ctx.rotate(ang);
  ctx.fillStyle='rgba(30,30,60,.25)'; rrect(0,-a.r+8*S,len,a.r*2,a.r); ctx.fill();
  const sg=ctx.createLinearGradient(0,-a.r,0,a.r); sg.addColorStop(0,'#f6d0ae'); sg.addColorStop(.6,'#eebe96'); sg.addColorStop(1,'#d9a47c'); ctx.fillStyle=sg;
  rrect(0,-a.r,len,a.r*2,a.r); ctx.fill();
  E(len+8*S,0,a.r*1.05,a.r*.92,0,'#f2c6a2'); for(let i=0;i<4;i++) E(len+a.r*1.0,-a.r*.6+i*a.r*.4,a.r*.42,a.r*.17,0,'#f2c6a2');
  ctx.fillStyle='#5a6ab0'; ctx.fillRect(0,-a.r-2,len*.18,a.r*2+4);
  ctx.restore();
  bites.forEach(b=>{ b.r+=(b.R-b.r)*.15; E(b.x,b.y,b.r*1.5,b.r*1.2,0,'rgba(232,110,110,.35)'); E(b.x,b.y,b.r,b.r*.85,0,'#ec9a90'); E(b.x-b.r*.25,b.y-b.r*.25,b.r*.35,b.r*.3,0,'rgba(255,255,255,.5)'); });
  handprints.forEach(h=>{ h.t+=1/60; ctx.globalAlpha=Math.max(0,1-h.t/1.5)*.5; E(h.x,h.y,22*S,18*S,0,'#e0645a'); ctx.globalAlpha=1; }); handprints=handprints.filter(h=>h.t<1.5);
}

/* ---------- drawing: bugs (귀여운 꼬마 벌레) ---------- */
const BS=()=>S*.72;
function star(x,y,r,c){ ctx.fillStyle=c; ctx.beginPath(); for(let i=0;i<10;i++){ const a=i/10*TAU-Math.PI/2,rr=i%2?r*.45:r; ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } ctx.closePath(); ctx.fill(); }
function eyes(y,lx,ly,sp){ for(const sx of [-1,1]){ const x=sx*sp; E(x,y,3.4,3.8,0,'#ffffff'); E(x+lx,y+.5+ly,2.1,2.4,0,'#2a2230'); E(x+lx-.8,y-.6+ly,.9,.9,0,'#ffffff'); }
  for(const sx of [-1,1]) E(sx*(sp+2.8),y+4,1.9,1.1,0,'rgba(255,135,160,.75)');
  ctx.strokeStyle='#2a2230'; ctx.lineWidth=.9; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(0,y+4.2,1.6,.15*Math.PI,.85*Math.PI); ctx.stroke(); }
function antenna(y,col){ ctx.strokeStyle=col; ctx.lineWidth=1; for(const sx of [-1,1]){ ctx.beginPath(); ctx.moveTo(sx*2,y); ctx.quadraticCurveTo(sx*3,y-5,sx*5,y-6); ctx.stroke(); E(sx*5,y-6,1.3,1.3,0,col); } }
function drawFly(b,t){ const fl=b.state==='fly',bs=BS(); ctx.save(); ctx.translate(b.x,b.y+(fl?Math.sin(t*9+b.wing)*1.5*bs:0)); ctx.scale(bs,bs); ctx.rotate(fl?clamp(b.vx/500,-.3,.3):0);
  if(fl) E(0,14,7,2.4,0,'rgba(0,0,0,.12)');
  const flap=fl?Math.sin(t*60+b.wing):0;
  for(const sx of [-1,1]){ ctx.save(); ctx.translate(sx*3,-6); ctx.rotate(sx*(fl?-.45-flap*.4:-.15)); E(sx*5,-4,5.5,7.5,sx*.5,'rgba(205,232,255,.8)'); ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=.8; ctx.beginPath(); ctx.ellipse(sx*5,-4,5.5,7.5,sx*.5,0,TAU); ctx.stroke(); ctx.restore(); }
  if(!fl){ ctx.strokeStyle='#4a5466'; ctx.lineWidth=1.2; ctx.lineCap='round'; for(const sx of [-1,1]){ ctx.beginPath(); ctx.moveTo(sx*4,7); ctx.lineTo(sx*6,10); ctx.moveTo(sx*1.5,8); ctx.lineTo(sx*2,11); ctx.stroke(); }
    const r=Math.sin(b.rub*12)*1.2; E(-1.6+r,6,1.6,1.3,0,'#4a5466'); E(1.6-r,6,1.6,1.3,0,'#4a5466'); }
  antenna(-7,'#4a5466');
  E(0,0,9,8.5,0,'#66738a'); E(0,3,5.8,4.2,0,'#8e9bb2'); E(-3.2,-4.6,2.6,1.5,-.5,'rgba(255,255,255,.4)');
  const lx=fl?clamp(b.vx/280,-1,1)*.8:0,ly=fl?clamp(b.vy/280,-1,1)*.6:.4; eyes(-1,lx,ly,3.7);
  ctx.restore(); }
function drawMos(b,t){ const fl=b.state==='fly',bs=BS(); ctx.save(); ctx.translate(b.x,b.y+(fl?Math.sin(t*11+b.wing)*1.8*bs:0)); ctx.scale(bs,bs); ctx.rotate(fl?clamp(b.vx/500,-.3,.3):0);
  if(fl) E(0,16,6,2,0,'rgba(0,0,0,.12)');
  ctx.strokeStyle='#8a8f9c'; ctx.lineWidth=.9; ctx.lineCap='round'; for(const sx of [-1,1]) for(let i=0;i<3;i++){ const sw=fl?Math.sin(t*5+i+sx)*1.5:0; ctx.beginPath(); ctx.moveTo(sx*2.5,3+i*1.6); ctx.quadraticCurveTo(sx*(7+i*1.5),5+i*2,sx*(8+i*2),(fl?11:12)+i*1.5+sw); ctx.stroke(); }
  const flap=fl?Math.sin(t*90+b.wing):0;
  for(const sx of [-1,1]){ ctx.save(); ctx.translate(sx*2,-2); ctx.rotate(sx*(fl?-.6-flap*.35:-.25)); E(sx*5,-3,3.4,7,sx*.6,'rgba(220,236,250,.8)'); ctx.restore(); }
  E(0,4,4.6,6,0,'#d3d6df'); ctx.save(); ctx.beginPath(); ctx.ellipse(0,4,4.6,6,0,0,TAU); ctx.clip(); ctx.fillStyle='#aab0bd'; ctx.fillRect(-5,4,10,1.3); ctx.fillRect(-5,7,10,1.3);
  if(!fl&&b.landing&&b.landing.onArm){ const f=Math.min(1,b.biteT/2.3); E(0,5,4.6*f,6*f,0,'rgba(244,120,150,.85)'); } ctx.restore();
  antenna(-9,'#8a8f9c');
  E(0,-4,6.8,6.2,0,'#c3c7d2'); E(-2.6,-7.4,2,1.2,-.5,'rgba(255,255,255,.5)');
  ctx.strokeStyle='#e58fa0'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(1,0.5); ctx.lineTo(4.5,5); ctx.stroke();
  const lx=fl?clamp(b.vx/280,-1,1)*.8:0,ly=fl?clamp(b.vy/280,-1,1)*.6:.4; eyes(-5,lx,ly,3.2);
  ctx.restore(); }
function drawSplat(s){ const life=s.t,a=life<2.1?1:Math.max(0,1-(life-2.1)/.6); if(a<=0) return; const bs=BS(),fly=s.type==='fly';
  ctx.save(); ctx.globalAlpha=a; ctx.translate(s.x,s.y); ctx.scale(bs,bs); const pop=life<.15?1.35-life*2.3:1; ctx.scale(pop*1.12,pop*.86); ctx.rotate(s.rot*.5);
  const col=s.zapped?'#3d3d46':(fly?'#66738a':'#c3c7d2'),bel=s.zapped?'#5a5a64':(fly?'#8e9bb2':'#e4e6ec');
  ctx.strokeStyle=col; ctx.lineWidth=1.2; ctx.lineCap='round'; for(let i=0;i<3;i++){ const w=Math.sin(life*20+i)*1.2*(life<1?1:0); ctx.beginPath(); ctx.moveTo(-4+i*4,6); ctx.lineTo(-5+i*5,10+w); ctx.stroke(); }
  E(0,0,9,8,0,col); E(0,3,5.8,3.8,0,bel);
  if(s.zapped){ ctx.strokeStyle='#3d3d46'; ctx.lineWidth=1.3; for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*2.5,-7); ctx.lineTo(i*3.4,-12-Math.abs(i)); ctx.stroke(); } }
  ctx.strokeStyle=s.zapped?'#ffe27a':'#2a2230'; ctx.lineWidth=1.3; for(const sx of [-1,1]){ const x=sx*3.6; ctx.beginPath(); ctx.moveTo(x-1.8,-2.8); ctx.lineTo(x+1.8,.8); ctx.moveTo(x+1.8,-2.8); ctx.lineTo(x-1.8,.8); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0,4,1.3,0,TAU); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.globalAlpha=a; ctx.translate(s.x,s.y); ctx.scale(bs,bs);
  for(let k=0;k<3;k++){ const an=life*4+k*TAU/3; star(Math.cos(an)*12,-12+Math.sin(an)*3.5,2.6,'#ffd23f'); }
  if(s.zapped&&life<1.6){ ctx.globalAlpha=a*(1-life/1.6)*.55; E(2,-16-life*12,4+life*5,4+life*5,0,'#c9c9cf'); }
  if(life>1.9){ const k=(life-1.9)/.8; ctx.globalAlpha=Math.max(0,1-k)*.9; for(let i=0;i<7;i++){ const an=i/7*TAU; E(Math.cos(an)*(6+k*14),Math.sin(an)*(6+k*14),4*(1-k*.5),4*(1-k*.5),0,'#ffffff'); } }
  ctx.restore(); }

/* ---------- drawing: tools ---------- */
function drawSwatter(x,y,k,alpha,flat){ ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.scale(S,S); ctx.rotate(-.45); const sc=flat?1:1.18+k*.1; ctx.scale(sc,sc);
  ctx.strokeStyle='#2f8f6b'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(20,30); ctx.lineTo(68,110); ctx.stroke();
  ctx.fillStyle='rgba(47,143,107,.85)'; rrect(-34,-34,68,68,10); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1; for(let i=-26;i<=26;i+=8){ ctx.beginPath(); ctx.moveTo(i,-32); ctx.lineTo(i,32); ctx.moveTo(-32,i); ctx.lineTo(32,i); ctx.stroke(); }
  ctx.strokeStyle='#1f6b4f'; ctx.lineWidth=3; rrect(-34,-34,68,68,10); ctx.stroke(); ctx.restore(); }
function drawPalm(x,y,alpha,flat){ ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.scale(S,S); if(!flat) ctx.scale(1.15,1.15); ctx.rotate(-.2);
  const skin='#f2c6a2',edge='#d9a47c'; ctx.fillStyle=skin; ctx.strokeStyle=edge; ctx.lineWidth=2;
  [[-14,-30,8,16],[-4,-36,8,19],[7,-34,8,18],[17,-26,7,14]].forEach(([fx,fy,rx,ry])=>{ ctx.beginPath(); ctx.ellipse(fx,fy,rx,ry,0,0,TAU); ctx.fill(); ctx.stroke(); });
  ctx.beginPath(); ctx.ellipse(-26,0,8,15,-.8,0,TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0,-2,24,26,0,0,TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle=skin; ctx.fillRect(-12,18,24,24); ctx.restore(); }
function drawRacket(x,y,on){ ctx.save(); ctx.translate(x,y); ctx.scale(S,S); ctx.rotate(-.5);
  ctx.fillStyle='#2b2f36'; rrect(-6,40,12,62,6); ctx.fill(); E(0,62,3,3,0,on?'#ff5a4a':'#7a2a24');
  if(on){ ctx.shadowColor='#7fd6ff'; ctx.shadowBlur=18; }
  ctx.strokeStyle='#f2c230'; ctx.lineWidth=6; ctx.beginPath(); ctx.ellipse(0,0,36,42,0,0,TAU); ctx.stroke(); ctx.shadowBlur=0;
  ctx.save(); ctx.beginPath(); ctx.ellipse(0,0,33,39,0,0,TAU); ctx.clip(); ctx.strokeStyle=on?'rgba(150,220,255,.85)':'rgba(255,255,255,.35)'; ctx.lineWidth=1; for(let i=-36;i<=36;i+=6){ ctx.beginPath(); ctx.moveTo(i,-42); ctx.lineTo(i,42); ctx.moveTo(-36,i); ctx.lineTo(36,i); ctx.stroke(); }
  if(on&&!reduce){ ctx.strokeStyle='rgba(220,245,255,.9)'; ctx.lineWidth=1.5; ctx.beginPath(); let px=rand(-30,30),py=rand(-36,36); ctx.moveTo(px,py); for(let i=0;i<4;i++){ px+=rand(-12,12); py+=rand(-12,12); ctx.lineTo(px,py); } ctx.stroke(); }
  ctx.restore(); ctx.fillStyle='#2b2f36'; ctx.fillRect(-10,36,20,8); ctx.restore(); }

/* ---------- loop ---------- */
let last=performance.now();
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000),t=now/1000; last=now;
  if(W>0&&H>0){
    bugs.forEach(b=>{ if(b.state!=='dead') updateBug(b,dt); });
    zapCheck();
    swats.forEach(s=>{ s.t+=dt; if(!s.done&&s.t>=.07) impact(s); }); swats=swats.filter(s=>s.t<.4);
    bugs=bugs.filter(b=>b.state!=='dead');
    if(bugs.length<want()){ spawnT-=dt; if(spawnT<=0){ spawn(); spawnT=rand(.6,1.6); } }
    splats.forEach(s=>s.t+=dt); splats=splats.filter(s=>s.t<2.8);
    if(ac){ const tt=ac.currentTime; bugs.forEach(b=>{ if(!b.v) b.v=makeVoice(b); if(!b.v) return; const sp=Math.hypot(b.vx,b.vy),fl=b.state==='fly';
      const near=hover?Math.max(0,1-Math.hypot(hover.x-b.x,hover.y-b.y)/(260*S)):0; const base=b.type==='fly'?.03:.02;
      b.v.g.gain.setTargetAtTime(fl?base*(.6+Math.min(1,sp/200)*.6)*(1+near*1.4):0,tt,.05); if(b.v.pan) b.v.pan.pan.setTargetAtTime(clamp((b.x/W)*2-1,-1,1)*.85,tt,.05);
      b.v.o.frequency.setTargetAtTime(b.f*(.93+Math.min(1,sp/250)*.14),tt,.08); });
      if(hum) hum.gain.setTargetAtTime(tool==='zap'&&down?.025:0,tt,.03); }
    ctx.save(); if(shake>0&&!reduce){ const k=shake*14; ctx.translate(rand(-k,k),rand(-k,k)); } shake=Math.max(0,shake-dt*1.6);
    if(scene==='fly') drawKitchen(t); else drawBedroom(t);
    splats.forEach(drawSplat);
    bugs.filter(b=>b.state==='land').forEach(b=>b.type==='fly'?drawFly(b,t):drawMos(b,t));
    bugs.filter(b=>b.state==='fly').forEach(b=>b.type==='fly'?drawFly(b,t):drawMos(b,t));
    sparks.forEach(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.9; p.vy*=.9; p.t-=dt*2.4; ctx.fillStyle=p.c; ctx.globalAlpha=Math.max(0,p.t); ctx.beginPath(); ctx.arc(p.x,p.y,2.4*S,0,TAU); ctx.fill(); ctx.globalAlpha=1; }); sparks=sparks.filter(p=>p.t>0);
    swats.forEach(s=>{ const pre=s.t<.07, k=pre?1-s.t/.07:0, fade=pre?1:Math.max(0,1-(s.t-.07)/.33);
      if(!pre&&s.t<.16){ ctx.strokeStyle=`rgba(255,255,255,${(1-(s.t-.07)/.09)*.8})`; ctx.lineWidth=3; for(let i=0;i<8;i++){ const a=i/8*TAU; ctx.beginPath(); ctx.moveTo(s.x+Math.cos(a)*50*S,s.y+Math.sin(a)*50*S); ctx.lineTo(s.x+Math.cos(a)*68*S,s.y+Math.sin(a)*68*S); ctx.stroke(); } }
      if(s.tool==='swatter') drawSwatter(s.x,s.y-k*30*S,k,fade,!pre); else drawPalm(s.x,s.y-k*24*S,fade,!pre); });
    if(touchHide>0) touchHide-=dt;
    if(hover&&(!hover.touch||down||touchHide>0)){ if(tool==='zap') drawRacket(hover.x,hover.y,down); else if(!swats.length&&!hover.touch){ if(tool==='swatter') drawSwatter(hover.x,hover.y-30*S,1,.55,false); else drawPalm(hover.x,hover.y-24*S,.55,false); } }
    pops.forEach(p=>{ p.t+=dt/(p.big?1.4:1.1); if(p.t>1) return; ctx.globalAlpha=Math.min(1,(1-p.t)*2.5); const sz=(p.big?34:p.small?16:24)*Math.max(.85,S*.95);
      ctx.font=`${sz}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineWidth=5; ctx.strokeStyle='rgba(255,252,246,.95)'; const y=p.y-p.t*26*S; ctx.strokeText(p.txt,p.x,y); ctx.fillStyle=p.col; ctx.fillText(p.txt,p.x,y); ctx.globalAlpha=1; });
    pops=pops.filter(p=>p.t<1);
    ctx.restore();
  }
  requestAnimationFrame(frame); }
setScene('fly'); hint('윙윙대는 파리를 탭해서 찰싹! 앉아 있을 때가 기회예요',5000);
requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); clearTimeout(hintTimer); clearTimeout(saveT); Hp.store.set('bugsBest',best); Hp.store.set('bugsTotal',total);
  bugs.forEach(killVoice); try{ if(humO){ hum.gain.setTargetAtTime(0,ac.currentTime,.02); humO.stop(ac.currentTime+.2); } }catch(e){} };
}});
