/* 숨 풍선 방 */
H.register('breath',{title:'숨 풍선',sub:'풍선에 맞춰 천천히 들이쉬고 내쉬기',floor:2,icon:'🎈',color:'#7cc7a8',
blurb:'풍선 따라 천천히 숨 쉬기',
mount(root){
root.innerHTML=`
<div class="stage" data-r="stage">
  <span class="badge" data-r="cyc">0 / 5회</span>
  <div class="overlay" data-r="done" hidden>
    <h2>잘했어요</h2><p>지금 마음은 어때요?</p>
    <div class="row" style="justify-content:center">${['😣','😕','😐','🙂','😌'].map((e,i)=>`<button class="chip" style="font-size:24px" data-f="${i}">${e}</button>`).join('')}</div>
    <p data-r="fb"></p>
    <button class="btn ghost" data-r="again">한 번 더</button>
  </div>
</div>
<div class="row">
  <button class="chip" aria-pressed="true" data-pace="4,2,6,0">기본 4·2·6</button>
  <button class="chip" aria-pressed="false" data-pace="4,4,4,4">네모 호흡 4·4·4·4</button>
  <button class="chip" aria-pressed="false" data-pace="4,7,8,0">잠 오는 4·7·8</button>
</div>
<div class="row"><button class="btn" data-r="go" style="flex:1">시작하기</button><button class="chip" aria-pressed="true" data-r="snd">🎵 소리</button></div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const S=H.canvas(q('stage')),ctx=S.ctx;
let pace=[4,2,6,0],running=false,phase=0,pt=0,cycles=0,goal=5,level=0,hue=150,sound=true;
const NAMES=['들이쉬기','멈추기','내쉬기','멈추기'];
root.querySelectorAll('[data-pace]').forEach(b=>b.onclick=()=>{pace=b.dataset.pace.split(',').map(Number);root.querySelectorAll('[data-pace]').forEach(x=>x.setAttribute('aria-pressed',x===b));reset()});
q('snd').onclick=()=>{sound=!sound;q('snd').setAttribute('aria-pressed',sound)};
function reset(){running=false;phase=0;pt=0;cycles=0;level=0;q('go').textContent='시작하기';q('cyc').textContent=`0 / ${goal}회`;stopPad()}
q('go').onclick=()=>{H.ac();running=!running;q('go').textContent=running?'잠깐 멈추기':'계속하기';if(running)cue();else stopPad()};
q('again').onclick=()=>{q('done').hidden=true;reset()};
root.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const i=+b.dataset.f;q('fb').textContent=['많이 힘들었구나. 응원 벽에 한 줄 남겨 볼래요?','조금 더 쉬어 가도 괜찮아요.','괜찮아요, 천천히 가요.','좋아요, 한결 가벼워졌네요.','편안해졌네요. 오늘도 잘 버텼어요.'][i]});

S.c.addEventListener('pointerdown',()=>{const t=H.now();H.tone(528,t,.8,.08,'sine',{wet:true});H.tone(792,t,.6,.04,'sine',{wet:true});H.buzz(12)});
let pad=null;
function cue(){const t=H.now();H.buzz(18);
  if(!sound)return;
  const dur=pace[phase];if(!dur)return;
  stopPad();const a=H.ac();if(!a)return;
  if(phase===0||phase===2){const base=phase===0?196:262,to=phase===0?262:196;
    const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.6);g.gain.setValueAtTime(.08,t+dur-.6);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    g.connect(H.out());g.connect(H.verb());const os=[];
    [1,1.5,2].forEach((m,i)=>{const o=a.createOscillator();o.type='sine';o.frequency.setValueAtTime(base*m,t);o.frequency.linearRampToValueAtTime(to*m,t+dur);const og=a.createGain();og.gain.value=[1,.4,.25][i];o.connect(og).connect(g);o.start(t);o.stop(t+dur+.1);os.push(o)});
    const n=a.createBufferSource();n.buffer=H.noiseBuf();n.loop=true;const f=a.createBiquadFilter();f.type='bandpass';f.Q.value=.7;
    f.frequency.setValueAtTime(phase===0?500:1200,t);f.frequency.linearRampToValueAtTime(phase===0?1200:400,t+dur);const ng=a.createGain();ng.gain.value=.12;n.connect(f).connect(ng).connect(g);n.start(t);n.stop(t+dur+.1);os.push(n);
    pad={g,os}}
  else H.tone(528,t,1.2,.04,'sine',{wet:true})}
function stopPad(){if(!pad)return;const a=H.ac(),t=a.currentTime;try{pad.g.gain.cancelScheduledValues(t);pad.g.gain.setTargetAtTime(.0001,t,.1);pad.os.forEach(o=>o.stop(t+.4))}catch(e){}pad=null}

const motes=Array.from({length:40},()=>({x:Math.random(),y:Math.random(),s:.2+Math.random()*.8}));
const ease=x=>.5-.5*Math.cos(Math.PI*x);
const stop=H.loop((dt,now)=>{const W=S.W,Hh=S.H;
  if(running){pt+=dt/60;const dur=pace[phase];if(pt>=dur){pt=0;phase=(phase+1)%4;let guard=0;while(!pace[phase]&&guard++<4)phase=(phase+1)%4;
      if(phase===0){cycles++;hue=(hue+28)%360;q('cyc').textContent=`${cycles} / ${goal}회`;if(cycles>=goal){running=false;stopPad();q('done').hidden=false;q('go').textContent='시작하기';const t=H.now();[523,659,784].forEach((f,i)=>H.tone(f,t+i*.18,.6,.08,'sine',{wet:true}))}}
      if(running)cue()}
    const d=pace[phase]||1,x=Math.min(1,pt/d);level=phase===0?ease(x):phase===1?1:phase===2?1-ease(x):0}
  const bg=ctx.createLinearGradient(0,0,0,Hh);bg.addColorStop(0,`hsl(${hue+20} 35% 16%)`);bg.addColorStop(1,`hsl(${hue} 30% 8%)`);ctx.fillStyle=bg;ctx.fillRect(0,0,W,Hh);
  motes.forEach(m=>{m.y-=.0006*m.s*dt;if(m.y<0)m.y=1;ctx.fillStyle=`rgba(255,255,255,${.12*m.s})`;ctx.beginPath();ctx.arc(m.x*W+Math.sin(now/2000+m.s*9)*8,m.y*Hh,1.5*m.s+.5,0,7);ctx.fill()});
  const cx=W/2,cy=Hh*.42,minR=Math.min(W,Hh)*.1,maxR=Math.min(W*.36,Hh*.3),r=minR+(maxR-minR)*level;
  // guide ring
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.setLineDash([4,8]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,maxR,0,7);ctx.stroke();ctx.setLineDash([]);
  // string
  const by=cy+r*1.08;ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,by+6);
  for(let i=1;i<=20;i++){const yy=by+6+i*(Hh-by-6)/20;ctx.lineTo(cx+Math.sin(now/600+i*.5)*6*(i/20),yy)}ctx.stroke();
  // balloon
  ctx.save();ctx.translate(cx,cy);const g=ctx.createRadialGradient(-r*.35,-r*.4,r*.05,0,0,r*1.1);
  g.addColorStop(0,`hsl(${hue} 80% 85%)`);g.addColorStop(.5,`hsl(${hue} 65% 60%)`);g.addColorStop(1,`hsl(${hue} 60% 35%)`);ctx.fillStyle=g;
  ctx.beginPath();ctx.ellipse(0,0,r*.92,r*1.05,0,0,7);ctx.fill();
  ctx.fillStyle=`hsl(${hue} 60% 38%)`;ctx.beginPath();ctx.moveTo(-6,r*1.03);ctx.lineTo(6,r*1.03);ctx.lineTo(0,r*1.03+9);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.ellipse(-r*.38,-r*.45,r*.14,r*.24,-.5,0,7);ctx.fill();ctx.restore();
  // label
  const label=running?NAMES[phase]:(cycles?'잠깐 쉬는 중':'준비되면 시작');const left=running?Math.ceil(pace[phase]-pt):'';
  ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font=`${Math.min(34,W*.08)}px "Black Han Sans",sans-serif`;ctx.fillText(label,cx,Hh*.86);
  if(left){ctx.font='18px "Noto Sans KR",sans-serif';ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillText(left+'초',cx,Hh*.86+28)}
});
return()=>{stop();S.stop();stopPad()};
}});
