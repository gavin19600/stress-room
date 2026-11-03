/* 명상의 방 — 싱잉볼 소리와 함께 잠시 멈추기 */
/* 싱잉볼 소리 합성: 서로 어긋난 배음 쌍이 맥놀이(웅웅)를 만들고 길게 사라짐 */
H.bowl=function(base,vol,dur){const a=H.ac();if(!a)return;const t=a.currentTime;base=base||220;vol=vol==null?.35:vol;dur=dur||12;
  const out=a.createGain();out.gain.value=1;out.connect(H.out());out.connect(H.verb());
  [[1,1],[2.76,.5],[5.4,.22],[8.93,.1]].forEach(([r,amp],i)=>{[-1,1].forEach(s=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';
    o.frequency.value=base*r+s*(.6+i*.5);const d=dur*(1-i*.18);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol*amp*.5,t+.012+i*.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g).connect(out);o.start(t);o.stop(t+d+.1)})});
  H.noise(t,.03,'bandpass',base*6,2,vol*.25)};

H.register('meditation',{title:'명상의 방',sub:'싱잉볼 소리를 따라 잠시 멈추고 숨 고르기',floor:3,icon:'🔔',color:'#b9a3e3',
blurb:'싱잉볼 소리에 마음 가라앉히기',
mount(root){
root.innerHTML=`
<style>.md-time{font-family:var(--display);font-size:13px}</style>
<div class="stage" data-r="stage">
  <span class="badge" data-r="left">준비</span>
  <div class="hint" data-r="hint">싱잉볼을 탭해서 울려 보세요 · 가장자리를 손가락으로 빙글 돌리면 노래해요</div>
</div>
<div class="row">
  <span class="note">시간</span>
  ${[1,3,5].map((m,i)=>`<button class="chip" data-min="${m}" aria-pressed="${i===1}">${m}분</button>`).join('')}
  <span class="note" style="margin-left:8px">싱잉볼</span>
  ${[['낮은',174],['중간',220],['높은',294]].map(([n,f],i)=>`<button class="chip" data-f="${f}" aria-pressed="${i===1}">${n}</button>`).join('')}
</div>
<div class="row">
  <button class="btn" data-r="go" style="flex:1">명상 시작</button>
  <button class="chip" data-r="drone" aria-pressed="false">🎵 잔잔한 바탕음</button>
</div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const S=H.canvas(q('stage')),ctx=S.ctx;
let mins=3,base=220,running=false,left=0,nextStrike=0,phaseT=0,msg='',msgA=0,done=false;
const rings=[];let glow=0,rub=null,rubLevel=0,droneN=null;
root.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>{if(running)return;mins=+b.dataset.min;root.querySelectorAll('[data-min]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
root.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{base=+b.dataset.f;root.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',x===b));strike(.25)});
const GUIDE=['어깨 힘을 빼요','코로 천천히 들이쉬고','입으로 길게 내쉬어요','소리가 사라질 때까지 들어 보세요','떠오르는 생각은 구름처럼 흘려보내요','지금 여기, 내 숨에 머물러요','몸이 바닥에 닿은 느낌을 느껴요'];
function strike(v){H.bowl(base,v==null?.35:v,14);H.buzz(25);glow=1;rings.push({r:0,a:.8});rings.push({r:-30,a:.5})}
function fmt(s){s=Math.max(0,Math.ceil(s));return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
q('go').onclick=()=>{H.ac();if(running){stop(false);return}running=true;done=false;left=mins*60;nextStrike=20;phaseT=0;msg='눈을 살며시 감거나, 한 곳을 편하게 바라봐요';msgA=0;q('go').textContent='그만하기';q('hint').style.opacity=0;strike(.4)};
function stop(finished){running=false;q('go').textContent='명상 시작';q('left').textContent=finished?'끝':'준비';
  if(finished){done=true;msg='수고했어요. 천천히 눈을 뜨고 기지개를 켜 보세요';msgA=0;let i=0;const iv=setInterval(()=>{strike(.3-i*.06);if(++i>=3)clearInterval(iv)},2600)}}
/* 바탕음 */
q('drone').onclick=()=>{const a=H.ac();if(!a)return;const on=q('drone').getAttribute('aria-pressed')!=='true';q('drone').setAttribute('aria-pressed',on);
  if(on){const g=a.createGain();g.gain.value=0;g.gain.setTargetAtTime(.05,a.currentTime,1.5);g.connect(H.out());g.connect(H.verb());
    const os=[base/2,base*3/4,base].map((f,i)=>{const o=a.createOscillator();o.type='sine';o.frequency.value=f;const og=a.createGain();og.gain.value=[1,.5,.25][i];
      const l=a.createOscillator(),lg=a.createGain();l.frequency.value=.07+i*.03;lg.gain.value=.3;l.connect(lg).connect(og.gain);l.start();o.connect(og).connect(g);o.start();return[o,l]}).flat();
    droneN={g,os}}else stopDrone()};
function stopDrone(){if(!droneN)return;const a=H.ac(),t=a.currentTime;droneN.g.gain.setTargetAtTime(0,t,.6);const d=droneN;droneN=null;setTimeout(()=>d.os.forEach(o=>{try{o.stop()}catch(e){}}),3000)}
/* 가장자리 문지르기 → 계속 노래 */
function rubOn(){const a=H.ac();if(!a||rub)return;const g=a.createGain();g.gain.value=0;g.connect(H.out());g.connect(H.verb());
  const os=[[1,1],[2.76,.35]].flatMap(([r,amp])=>[-1,1].map(s=>{const o=a.createOscillator(),og=a.createGain();o.type='sine';o.frequency.value=base*r+s*.8;og.gain.value=amp*.5;o.connect(og).connect(g);o.start();return o}));
  rub={g,os}}
function rubOff(){if(!rub)return;const a=H.ac(),t=a.currentTime;rub.g.gain.cancelScheduledValues(t);rub.g.gain.setTargetAtTime(0,t,1.2);const r=rub;rub=null;setTimeout(()=>r.os.forEach(o=>{try{o.stop()}catch(e){}}),6000)}
function bowlGeo(){const W=S.W,Hh=S.H,bw=Math.min(W*.5,260),cx=W/2,cy=Hh*.66;return{cx,cy,bw,bh:bw*.42}}
let drag=null;
S.c.addEventListener('pointerdown',e=>{e.preventDefault();H.ac();const p=S.pos(e),g=bowlGeo();const dx=(p.x-g.cx)/(g.bw/2),dy=(p.y-g.cy)/(g.bh);
  if(dx*dx+dy*dy<1.6){drag={x:p.x,y:p.y,ang:Math.atan2(p.y-g.cy,p.x-g.cx),moved:0};S.c.setPointerCapture(e.pointerId)}else{H.ui&&H.ui('tap')}});
S.c.addEventListener('pointermove',e=>{if(!drag)return;const p=S.pos(e),g=bowlGeo();const a=Math.atan2(p.y-g.cy,p.x-g.cx);let d=a-drag.ang;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;drag.ang=a;
  drag.moved+=Math.hypot(p.x-drag.x,p.y-drag.y);drag.x=p.x;drag.y=p.y;if(drag.moved>25){rubOn();rubLevel=Math.min(1,rubLevel+Math.abs(d)*1.5);if(Math.random()<.05)H.buzz(6)}});
const up=()=>{if(drag&&drag.moved<=25)strike();drag=null;rubOff()};S.c.addEventListener('pointerup',up);S.c.addEventListener('pointercancel',up);

const stars=Array.from({length:60},()=>({x:Math.random(),y:Math.random()*.6,s:Math.random()}));
const stopLoop=H.loop((dt,now)=>{const W=S.W,Hh=S.H,g=bowlGeo();
  if(running){left-=dt/60;phaseT+=dt/60;q('left').textContent=fmt(left);
    if(phaseT>=nextStrike){nextStrike+=20+Math.random()*10;strike(.22)}
    if(Math.floor(phaseT/12)!==Math.floor((phaseT-dt/60)/12)){msg=GUIDE[Math.floor(phaseT/12)%GUIDE.length];msgA=0}
    if(left<=0)stop(true)}
  if(rub){rubLevel*=Math.pow(.96,dt);const t=H.now();rub.g.gain.setTargetAtTime(rubLevel*.25,t,.15);if(rubLevel>.2)glow=Math.max(glow,rubLevel*.6);if(rubLevel>.4&&Math.random()<dt*.05)rings.push({r:0,a:.4})}
  // background
  const bg=ctx.createLinearGradient(0,0,0,Hh);bg.addColorStop(0,'#1d1733');bg.addColorStop(.6,'#2c2650');bg.addColorStop(1,'#3a2f4a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,Hh);
  stars.forEach(s=>{ctx.fillStyle=`rgba(255,255,255,${.15+.25*Math.abs(Math.sin(now/1500+s.s*9))})`;ctx.beginPath();ctx.arc(s.x*W,s.y*Hh,1+s.s,0,7);ctx.fill()});
  // breathing halo (6s cycle)
  const br=.5-.5*Math.cos(now/1000*Math.PI*2/8);
  const hr=Math.min(W,Hh)*(.18+.08*br);const hg=ctx.createRadialGradient(g.cx,g.cy-g.bh*1.6,0,g.cx,g.cy-g.bh*1.6,hr*1.8);
  hg.addColorStop(0,`rgba(214,196,255,${.18+glow*.25})`);hg.addColorStop(1,'rgba(214,196,255,0)');ctx.fillStyle=hg;ctx.fillRect(0,0,W,Hh);
  // ripples
  for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.r+=dt*1.6;r.a*=Math.pow(.985,dt);if(r.a<.02){rings.splice(i,1);continue}if(r.r<0)continue;
    ctx.strokeStyle=`rgba(230,215,255,${r.a})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(g.cx,g.cy,g.bw/2+r.r,(g.bw/2+r.r)*.32,0,0,7);ctx.stroke()}
  glow*=Math.pow(.985,dt);
  // cushion
  ctx.fillStyle='#7a3b52';ctx.beginPath();ctx.ellipse(g.cx,g.cy+g.bh*.55,g.bw*.62,g.bh*.42,0,0,7);ctx.fill();
  ctx.fillStyle='#93506b';ctx.beginPath();ctx.ellipse(g.cx,g.cy+g.bh*.45,g.bw*.58,g.bh*.34,0,0,7);ctx.fill();
  // bowl body
  ctx.save();const bodyG=ctx.createLinearGradient(g.cx-g.bw/2,0,g.cx+g.bw/2,0);bodyG.addColorStop(0,'#5c3f1c');bodyG.addColorStop(.35,'#c99a4c');bodyG.addColorStop(.5,'#f0cf86');bodyG.addColorStop(.7,'#a87a35');bodyG.addColorStop(1,'#4d3317');
  ctx.fillStyle=bodyG;ctx.beginPath();ctx.moveTo(g.cx-g.bw/2,g.cy-g.bh*.35);ctx.bezierCurveTo(g.cx-g.bw/2,g.cy+g.bh*.6,g.cx+g.bw/2,g.cy+g.bh*.6,g.cx+g.bw/2,g.cy-g.bh*.35);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3a2810';ctx.beginPath();ctx.ellipse(g.cx,g.cy-g.bh*.35,g.bw/2,g.bh*.22,0,0,7);ctx.fill();
  const inner=ctx.createRadialGradient(g.cx,g.cy-g.bh*.4,4,g.cx,g.cy-g.bh*.35,g.bw/2);inner.addColorStop(0,`rgba(255,226,160,${.35+glow*.5})`);inner.addColorStop(1,'rgba(90,60,20,.9)');
  ctx.fillStyle=inner;ctx.beginPath();ctx.ellipse(g.cx,g.cy-g.bh*.33,g.bw/2-6,g.bh*.18,0,0,7);ctx.fill();
  ctx.strokeStyle=`rgba(255,230,170,${.6+glow*.4})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(g.cx,g.cy-g.bh*.35,g.bw/2,g.bh*.22,0,0,7);ctx.stroke();ctx.restore();
  // mallet hint when rubbing
  if(drag&&drag.moved>25){ctx.fillStyle='#d9c4a0';ctx.beginPath();ctx.arc(drag.x,drag.y,9,0,7);ctx.fill()}
  // text
  msgA=Math.min(1,msgA+dt*.02);ctx.textAlign='center';ctx.fillStyle=`rgba(240,232,255,${msgA*(running||done?1:0)})`;ctx.font=`${Math.min(22,W*.055)}px "Noto Sans KR",sans-serif`;
  H.wrap(ctx,msg,W*.84).forEach((l,i)=>ctx.fillText(l,W/2,Hh*.17+i*Math.min(30,W*.075)));
  if(!running&&!done){ctx.fillStyle='rgba(240,232,255,.85)';ctx.font=`${Math.min(30,W*.07)}px "Black Han Sans",sans-serif`;ctx.fillText('잠시, 멈춤',W/2,Hh*.2)}
});
return()=>{stopLoop();S.stop();rubOff();stopDrone()};
}});
