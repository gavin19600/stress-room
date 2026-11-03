/* 접시 깨기 방 */
H.register('plates',{title:'접시 깨기',sub:'접시에 적고 벽에 던져서 와장창',floor:1,icon:'🍽️',color:'#e2873a',
blurb:'벽에 던지면 와장창 깨져요',
mount(root){
root.innerHTML=`
<div class="stage" data-r="stage">
  <span class="badge" data-r="count">깬 접시 0장</span>
  <button class="corner" data-r="sweep">🧹 치우기</button>
  <div class="hint" data-r="hint">벽 아무 곳이나 탭하면 접시가 날아가요</div>
</div>
<div class="row">
  <input class="field" id="pl-txt" maxlength="10" placeholder="접시에 쓸 말" value="수행평가">
  <button class="btn" data-r="apply">적기</button>
</div>
<div class="row">
  ${['잔소리','성적','지각','단톡방','학원','다이어트','숙제'].map(t=>`<button class="chip" data-t="${t}">${t}</button>`).join('')}
</div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`),txt=root.querySelector('#pl-txt');
const S=H.canvas(q('stage')),ctx=S.ctx;
const HAND='"Nanum Pen Script","Noto Sans KR",cursive';
let word='수행평가',count=H.store.get('plates',0);q('count').textContent=`깬 접시 ${count}장`;
const setWord=t=>{t=(t||'').trim();if(!t)return;word=t;txt.value=t;plateTex=null};
q('apply').onclick=()=>setWord(txt.value);
txt.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();setWord(txt.value);txt.blur()}});
root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>setWord(b.dataset.t));

const R=()=>Math.min(S.W*.2,S.H*.16,90);
let plateTex=null,texR=0;
function makeTex(r){const c=document.createElement('canvas'),d=2;c.width=c.height=Math.ceil(r*2*d);const x=c.getContext('2d');x.scale(d,d);
  const g=x.createRadialGradient(r*.7,r*.6,r*.1,r,r,r);g.addColorStop(0,'#ffffff');g.addColorStop(.7,'#f2efe8');g.addColorStop(1,'#d9d3c6');
  x.fillStyle=g;x.beginPath();x.arc(r,r,r,0,7);x.fill();
  x.strokeStyle='#2c5aa0';x.lineWidth=r*.05;x.beginPath();x.arc(r,r,r*.86,0,7);x.stroke();
  x.lineWidth=r*.015;x.beginPath();x.arc(r,r,r*.78,0,7);x.stroke();
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;x.save();x.translate(r+Math.cos(a)*r*.93,r+Math.sin(a)*r*.93);x.rotate(a);x.fillStyle='#2c5aa0';x.beginPath();x.ellipse(0,0,r*.03,r*.06,0,0,7);x.fill();x.restore()}
  x.strokeStyle='rgba(0,0,0,.06)';x.lineWidth=2;x.beginPath();x.arc(r,r,r*.55,0,7);x.stroke();
  x.fillStyle='#1d1d1d';x.textAlign='center';x.textBaseline='middle';
  let fs=r*.55;x.font=`${fs}px ${HAND}`;while(x.measureText(word).width>r*1.3&&fs>10){fs-=2;x.font=`${fs}px ${HAND}`}
  x.fillText(word,r,r+fs*.05);return c}
function tex(){const r=R();if(!plateTex||Math.abs(texR-r)>1){plateTex=makeTex(r);texR=r}return plateTex}

let plate={state:'ready',t:0,appear:1,tx:0,ty:0,spin:0};
const shards=[],decals=[],dust=[];let shake=0;
function floorY(){return S.H*.8}
function home(){return{x:S.W/2,y:S.H-R()*1.05}}

function crash(x,y,s){const t=H.now();
  H.noise(t,.06,'highpass',2500,.7,.9,{wet:true});H.noise(t,.25,'bandpass',1800,1.2,.5,{wet:true});H.tone(90,t,.15,.6,'sine',{to:45});
  for(let i=0;i<14;i++)H.tone(2200+Math.random()*4500,t+Math.random()*.35,.08+Math.random()*.15,.05+Math.random()*.06,'sine',{wet:true});
  H.buzz([50,20,30]);
  // build shards
  const r=texR*s,k=7+(Math.random()*4|0),angs=[];for(let i=0;i<k;i++)angs.push(Math.random()*Math.PI*2);angs.sort((a,b)=>a-b);
  const T=tex();
  for(let i=0;i<k;i++){const a0=angs[i],a1=i===k-1?angs[0]+Math.PI*2:angs[i+1],r1=r*(.3+Math.random()*.35);
    const inner=[[0,0],[Math.cos(a0)*r1,Math.sin(a0)*r1],[Math.cos(a1)*r1,Math.sin(a1)*r1]];
    const outer=[[Math.cos(a0)*r1,Math.sin(a0)*r1]];const steps=4;for(let j=0;j<=steps;j++){const a=a0+(a1-a0)*j/steps;outer.push([Math.cos(a)*r,Math.sin(a)*r])}outer.push([Math.cos(a1)*r1,Math.sin(a1)*r1]);
    [inner,outer].forEach(poly=>{const cx=poly.reduce((s,p)=>s+p[0],0)/poly.length,cy=poly.reduce((s,p)=>s+p[1],0)/poly.length,d=Math.hypot(cx,cy)||1,sp=3+Math.random()*5;
      shards.push({poly:poly.map(p=>[p[0]-cx,p[1]-cy]),ox:cx,oy:cy,x:x+cx,y:y+cy,vx:cx/d*sp+(Math.random()-.5)*2,vy:cy/d*sp-2-Math.random()*2,rot:0,vr:(Math.random()-.5)*.3,s,T,floor:floorY()+Math.random()*S.H*.15,rest:false,life:1})})}
  for(let i=0;i<18;i++){const a=Math.random()*7,sp=1+Math.random()*5;dust.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:1})}
  decals.push({x,y,r:r*.7,a:.7});if(decals.length>12)decals.shift();
  while(shards.length>260)shards.shift();
  shake=10;count++;H.store.set('plates',count);q('count').textContent=`깬 접시 ${count}장`}

function throwAt(x,y){if(plate.state!=='ready'||plate.appear<1){H.ui('tap');return}H.ac();
  y=Math.min(y,S.H*.62);plate={state:'fly',t:0,appear:1,tx:x,ty:y,spin:0};q('hint').style.opacity=0;
  const t=H.now();H.noise(t,.18,'bandpass',900,.6,.25);H.buzz(15)}
S.c.addEventListener('pointerdown',e=>{e.preventDefault();const p=S.pos(e);throwAt(p.x,p.y)});
q('sweep').onclick=()=>{shards.length=0;decals.length=0;const t=H.now();for(let i=0;i<5;i++)H.noise(t+i*.09,.08,'bandpass',3000,1,.08)};

function drawWall(){const W=S.W,Hh=S.H,fy=floorY();
  ctx.fillStyle='#3b2a22';ctx.fillRect(0,0,W,fy);
  const bh=26,bw=58;
  for(let r=0;r*bh<fy;r++){for(let c=-1;c*bw<W;c++){const x=c*bw+(r%2?bw/2:0),y=r*bh;const v=((r*7+c*13)%5)*6;
    ctx.fillStyle=`rgb(${120+v},${62+v/2},${48+v/3})`;ctx.fillRect(x+2,y+2,bw-4,bh-4)}}
  const lg=ctx.createRadialGradient(W/2,0,10,W/2,fy*.5,Math.max(W,fy));lg.addColorStop(0,'rgba(255,220,170,.18)');lg.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=lg;ctx.fillRect(0,0,W,fy);
  const fg=ctx.createLinearGradient(0,fy,0,Hh);fg.addColorStop(0,'#4a4038');fg.addColorStop(1,'#1d1814');ctx.fillStyle=fg;ctx.fillRect(0,fy,W,Hh-fy);
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,fy,W,4);
  decals.forEach(d=>{ctx.save();ctx.translate(d.x,d.y);ctx.globalAlpha=d.a;ctx.strokeStyle='rgba(30,15,10,.8)';ctx.lineWidth=1.5;
    for(let i=0;i<9;i++){const a=i*0.7+d.x;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*d.r*(.5+((i*37)%10)/14),Math.sin(a)*d.r*(.5+((i*53)%10)/14));ctx.stroke()}
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(0,0,d.r*.25,0,7);ctx.fill();ctx.restore()})}
function drawPlate(x,y,s,rot,alpha=1){const T=tex(),r=texR*s;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rot);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(4,r*.12,r,r*.96,0,0,7);ctx.fill();ctx.drawImage(T,-r,-r,r*2,r*2);ctx.restore()}

const stop=H.loop(dt=>{const W=S.W,Hh=S.H;
  ctx.save();if(shake>.3&&!H.reduce)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=Math.pow(.85,dt);
  drawWall();
  decals.forEach(d=>d.a*=Math.pow(.997,dt));
  // shards
  for(const s of shards){if(!s.rest){s.vy+=.35*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot+=s.vr*dt;
      if(s.y>s.floor){s.y=s.floor;if(Math.abs(s.vy)>2){s.vy*=-.3;s.vx*=.6;s.vr*=.5;if(Math.random()<.3)H.tone(3000+Math.random()*3000,H.now(),.04,.02)}else{s.rest=true;s.vx=s.vy=0}}}
    const T=s.T,r=texR*s.s;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);
    ctx.beginPath();s.poly.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
    ctx.save();ctx.clip();ctx.drawImage(T,-r-s.ox,-r-s.oy,r*2,r*2);ctx.restore();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=.8;ctx.stroke();ctx.restore()}
  for(let i=dust.length-1;i>=0;i--){const p=dust[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.15*dt;p.t-=.04*dt;if(p.t<=0){dust.splice(i,1);continue}
    ctx.fillStyle=`rgba(240,235,225,${p.t*.7})`;ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,7);ctx.fill()}
  // plate
  const h=home();
  if(plate.state==='ready'){plate.appear=Math.min(1,plate.appear+.08*dt);const bob=Math.sin(performance.now()/400)*3;drawPlate(h.x,h.y+bob+(1-plate.appear)*60,1,0,plate.appear)}
  else if(plate.state==='fly'){plate.t+=dt/17;const e=Math.min(1,plate.t),x=h.x+(plate.tx-h.x)*e,y=h.y+(plate.ty-h.y)*e-Math.sin(e*Math.PI)*40,s=1-.45*e;
    plate.spin+=.5*dt;drawPlate(x,y,s,plate.spin);
    if(e>=1){crash(plate.tx,plate.ty,.55);plate={state:'ready',t:0,appear:0,tx:0,ty:0,spin:0}}}
  ctx.restore()});
return()=>{stop();S.stop()};
}});
