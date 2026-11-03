/* 스트레스 두더지 잡기 방 */
H.register('mole',{title:'스트레스 두더지',sub:'튀어나오는 고민을 30초 안에 뿅망치로',floor:1,icon:'🔨',color:'#d4b13a',
blurb:'튀어나오는 고민을 뿅망치로',
mount(root){
root.innerHTML=`
<div class="stage" data-r="stage">
  <span class="badge" data-r="hud">점수 0 · 30초</span>
  <div class="overlay" data-r="ov">
    <h2>스트레스 두더지</h2>
    <p>튀어나오는 고민을 30초 동안 최대한 많이 때리세요.<br>금색 두더지는 3점, 하트 두더지(쉬는 시간)는 때리면 안 돼요.</p>
    <button class="btn" data-r="start">시작하기</button>
    <p data-r="best"></p>
  </div>
</div>
<div class="row">
  <input class="field" id="mo-txt" maxlength="8" placeholder="고민 단어 추가 (예: 수학)">
  <button class="btn ghost" data-r="add">추가</button>
</div>
<div class="row" data-r="words"></div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`),inp=root.querySelector('#mo-txt');
const S=H.canvas(q('stage')),ctx=S.ctx;
const DISPLAY='"Black Han Sans","Noto Sans KR",sans-serif';
let words=H.store.get('moleWords',['시험','숙제','잔소리','월요일','지각','수행평가','야자','성적표']);
function paintWords(){q('words').innerHTML=words.map((w,i)=>`<button class="chip" data-i="${i}" aria-label="${H.esc(w)} 빼기">${H.esc(w)} ✕</button>`).join('');
  q('words').querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{if(words.length<=2)return;words.splice(+b.dataset.i,1);H.store.set('moleWords',words);paintWords()})}
paintWords();
const add=()=>{const w=inp.value.trim();if(!w)return;if(!words.includes(w))words.push(w);H.store.set('moleWords',words);inp.value='';paintWords()};
q('add').onclick=add;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add()}});
let best=H.store.get('moleBest',0);q('best').textContent=best?`최고 기록 ${best}점`:'';

const holes=[];function layout(){holes.length=0;const W=S.W,Hh=S.H,cols=3,rows=3,cw=W/cols,rh=(Hh-40)/rows;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)holes.push({x:cw*(c+.5),y:40+rh*(r+.72),rw:Math.min(cw*.38,70),m:null})}
S.onresize=layout;layout();

let playing=false,score=0,timeLeft=30,spawnT=0,combo=0,shake=0;const fx=[],hammer={x:0,y:0,t:0};
function hud(){q('hud').textContent=`점수 ${score} · ${Math.ceil(timeLeft)}초`}
function start(){H.ac();score=0;timeLeft=30;combo=0;playing=true;holes.forEach(h=>h.m=null);q('ov').hidden=true;hud();
  const t=H.now();H.tone(660,t,.12,.2,'square');H.tone(880,t+.15,.2,.2,'square')}
q('start').onclick=start;
function end(){playing=false;if(score>best){best=score;H.store.set('moleBest',best)}
  q('ov').hidden=false;q('ov').querySelector('h2').textContent=`${score}점!`;q('ov').querySelector('p').textContent=score>=best?'신기록이에요! 고민들이 혼쭐났어요.':'수고했어요. 한 판 더?';
  q('start').textContent='다시 하기';q('best').textContent=`최고 기록 ${best}점`;const t=H.now();[523,659,784,1046].forEach((f,i)=>H.tone(f,t+i*.1,.2,.15,'triangle'))}

function spawn(){const free=holes.filter(h=>!h.m);if(!free.length)return;const h=free[Math.random()*free.length|0];
  const r=Math.random(),kind=r<.12?'gold':r<.24?'heart':'normal';
  const speed=Math.max(.55,1-(30-timeLeft)/45);
  h.m={kind,word:kind==='heart'?'쉬는 시간':words[Math.random()*words.length|0],up:0,phase:'up',stay:(50+Math.random()*40)*speed,hit:0}}
function whack(x,y){hammer.x=x;hammer.y=y;hammer.t=1;if(!playing){const t=H.now();H.noise(t,.06,'lowpass',300,1,.5);H.buzz(15);return}
  let hitAny=false;
  for(const h of holes){const m=h.m;if(!m||m.hit||m.up<.35)continue;const top=h.y-h.rw*1.5*m.up;
    if(Math.abs(x-h.x)<h.rw*1.05&&y>top-h.rw*.6&&y<h.y+h.rw*.3){hitAny=true;m.hit=1;m.phase='down';const t=H.now();
      if(m.kind==='heart'){score=Math.max(0,score-2);combo=0;fx.push({x:h.x,y:top,txt:'앗! −2',c:'#ff9eb5',t:0});H.tone(300,t,.25,.25,'sawtooth',{to:150});H.buzz([20,40,20])}
      else{combo++;const pts=(m.kind==='gold'?3:1)+(combo>=5?1:0);score+=pts;
        fx.push({x:h.x,y:top,txt:`+${pts}`,c:m.kind==='gold'?'#ffd34d':'#fff',t:0,stars:true});
        H.tone(520,t,.08,.4,'square',{to:180,glide:.08});H.noise(t,.05,'lowpass',900,1,.6);if(m.kind==='gold')H.tone(1320,t+.05,.25,.15,'sine',{wet:true});
        H.buzz(m.kind==='gold'?[30,20,50]:35);shake=6}
      hud();break}}
  if(!hitAny){combo=0;const t=H.now();H.noise(t,.06,'lowpass',300,1,.5);H.buzz(10)}}
S.c.addEventListener('pointerdown',e=>{e.preventDefault();const p=S.pos(e);whack(p.x,p.y)});

function drawMole(h,m){const rw=h.rw,up=m.up,top=h.y-rw*1.5*up;
  ctx.save();ctx.beginPath();ctx.rect(h.x-rw*1.6,0,rw*3.2,h.y);ctx.clip();
  const body=m.kind==='gold'?['#ffe07a','#c99412']:m.kind==='heart'?['#ffb4c6','#d9607f']:['#a87452','#6b4529'];
  const sq=m.hit?1-.25*Math.min(1,m.hit):1;
  ctx.translate(h.x,top+rw*1.2);ctx.scale(1/sq*.98+.02,sq);
  const g=ctx.createRadialGradient(-rw*.3,-rw*.6,rw*.1,0,0,rw*1.3);g.addColorStop(0,body[0]);g.addColorStop(1,body[1]);
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,rw*.85,rw*1.25,0,0,7);ctx.fill();
  // face
  ctx.fillStyle='#1b120c';const ey=-rw*.55;
  if(m.hit){ctx.strokeStyle='#1b120c';ctx.lineWidth=2.5;[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(s*rw*.3-5,ey-5);ctx.lineTo(s*rw*.3+5,ey+5);ctx.moveTo(s*rw*.3+5,ey-5);ctx.lineTo(s*rw*.3-5,ey+5);ctx.stroke()})}
  else{[-1,1].forEach(s=>{ctx.beginPath();ctx.arc(s*rw*.3,ey,rw*.09,0,7);ctx.fill()});
    if(m.kind==='normal'){ctx.strokeStyle='#1b120c';ctx.lineWidth=2;[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(s*rw*.45,ey-rw*.2);ctx.lineTo(s*rw*.15,ey-rw*.12);ctx.stroke()})}}
  ctx.fillStyle=m.kind==='heart'?'#a8324f':'#3a1d10';ctx.beginPath();ctx.ellipse(0,ey+rw*.25,rw*.14,rw*.1,0,0,7);ctx.fill();
  // sign
  const sw=rw*1.5,sh=rw*.55,sy=-rw*.05;ctx.fillStyle='#fbf3df';H.rr(ctx,-sw/2,sy,sw,sh,6);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#2a1a10';let fs=sh*.62;ctx.font=`${fs}px ${DISPLAY}`;while(ctx.measureText(m.word).width>sw*.9&&fs>8){fs-=1;ctx.font=`${fs}px ${DISPLAY}`}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(m.word,0,sy+sh/2+1);
  ctx.restore()}

const stop=H.loop((dt,now)=>{const W=S.W,Hh=S.H;
  if(playing){timeLeft-=dt/60;if(timeLeft<=0){timeLeft=0;hud();end()}else{hud();spawnT-=dt;if(spawnT<=0){spawn();spawnT=(18+Math.random()*22)*Math.max(.5,timeLeft/30)}}}
  holes.forEach(h=>{const m=h.m;if(!m)return;
    if(m.phase==='up'){m.up=Math.min(1,m.up+.12*dt);if(m.up>=1){m.stay-=dt;if(m.stay<=0)m.phase='down'}}
    else{if(m.hit)m.hit=Math.min(1,m.hit+.15*dt);m.up-=(m.hit?.06:.1)*dt;if(m.up<=0)h.m=null}});
  ctx.save();if(shake>.3&&!H.reduce)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=Math.pow(.8,dt);
  const gr=ctx.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,'#5d8a3a');gr.addColorStop(1,'#2f4d1c');ctx.fillStyle=gr;ctx.fillRect(-10,-10,W+20,Hh+20);
  ctx.fillStyle='rgba(255,255,255,.04)';for(let i=0;i<60;i++){const x=(i*97)%W,y=(i*53)%Hh;ctx.fillRect(x,y,2,6)}
  holes.forEach(h=>{ctx.fillStyle='#1c1208';ctx.beginPath();ctx.ellipse(h.x,h.y,h.rw*1.1,h.rw*.38,0,0,7);ctx.fill();
    ctx.fillStyle='#0d0904';ctx.beginPath();ctx.ellipse(h.x,h.y+2,h.rw*.95,h.rw*.28,0,0,7);ctx.fill();
    if(h.m)drawMole(h,h.m);
    ctx.strokeStyle='#4a3218';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(h.x,h.y,h.rw*1.1,h.rw*.38,0,0,Math.PI);ctx.stroke()});
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt/40;if(f.t>=1){fx.splice(i,1);continue}
    ctx.globalAlpha=1-f.t;ctx.font=`28px ${DISPLAY}`;ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#1a1208';ctx.strokeText(f.txt,f.x,f.y-f.t*40);ctx.fillStyle=f.c;ctx.fillText(f.txt,f.x,f.y-f.t*40);
    if(f.stars){ctx.fillStyle='#ffe27a';for(let k=0;k<5;k++){const a=now/200+k*1.25;ctx.beginPath();ctx.arc(f.x+Math.cos(a)*30,f.y-10+Math.sin(a)*10,3,0,7);ctx.fill()}}ctx.globalAlpha=1}
  ctx.restore();
  // hammer
  if(hammer.t>0){hammer.t=Math.max(0,hammer.t-.08*dt);const swing=hammer.t>.75?(1-hammer.t)/.25:1,L=64;
    const a0=Math.atan2(-40,-50),ang=a0+(1-swing)*1.0;
    ctx.save();ctx.translate(hammer.x+50,hammer.y+40);ctx.rotate(ang);ctx.globalAlpha=Math.min(1,hammer.t*3);
    ctx.fillStyle='#c98b4d';ctx.fillRect(0,-4,L,8);
    ctx.translate(L,0);ctx.fillStyle='#e04848';H.rr(ctx,-16,-28,32,56,9);ctx.fill();ctx.fillStyle='#ffd34d';ctx.fillRect(-16,-4,32,8);ctx.restore()}
});
return()=>{stop();S.stop()};
}});
