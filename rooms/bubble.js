/* 무한 뽁뽁이 방 */
H.register('bubble',{title:'무한 뽁뽁이',sub:'문지르듯 쓸어서 한 번에 여러 개 터뜨리기',floor:2,icon:'🫧',color:'#6fc3d9',
blurb:'끝없이 터지는 에어캡',
mount(root){
root.innerHTML=`
<div class="stage" data-r="stage" style="background:#cfd9dc">
  <span class="badge" data-r="count">뽁 0</span>
  <button class="corner" data-r="new">새 뽁뽁이</button>
</div>
<p class="note">손가락으로 문지르면 지나가는 곳이 다 터져요. 다 터뜨리면 새 장이 올라와요.</p>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const S=H.canvas(q('stage')),ctx=S.ctx;
let total=H.store.get('bubble',0),saveT=0;q('count').textContent=`뽁 ${total}`;
let bubbles=[],sheetY=0,sliding=0,R=22;
function build(){bubbles=[];const W=S.W,Hh=S.H;R=Math.max(18,Math.min(28,W/16));const dx=R*2.25,dy=R*1.95;
  for(let r=0,y=R+10;y<Hh-R*.5;r++,y+=dy)for(let x=R+8+(r%2?dx/2:0);x<W-R*.6;x+=dx)bubbles.push({x,y,popped:false,pt:0,seed:Math.random()})}
S.onresize=()=>{if(!bubbles.length||Math.abs((bubbles.at(-1)?.y||0)-S.H)>S.H*.3)build()};build();
function popSound(){const t=H.now(),f=1400+Math.random()*1800;H.noise(t,.025+Math.random()*.02,'bandpass',f,2.5,.7);H.tone(f*.25,t,.03,.15,'triangle',{to:f*.12})}
function newSheet(){sliding=1;const t=H.now();H.noise(t,.4,'highpass',1500,.5,.15,{atk:.05})}
q('new').onclick=newSheet;
function popAt(x,y,tap){let n=0;for(const b of bubbles){if(b.popped)continue;if(Math.hypot(b.x-x,b.y+sheetY-y)<R*1.05){b.popped=true;b.pt=1;n++;popSound();
  if(Math.random()<.12)pops.push({x:b.x,y:b.y,t:0})}}
  if(!n&&tap){const t=H.now();H.noise(t,.08,'highpass',3000,.7,.15);H.buzz(6)}
  if(n){H.buzz(Math.min(40,12+n*6));total+=n;q('count').textContent=`뽁 ${total}`;clearTimeout(saveT);saveT=setTimeout(()=>H.store.set('bubble',total),600);
    if(bubbles.every(b=>b.popped))setTimeout(newSheet,500)}}
const pops=[];let down=false,last=null;
S.c.addEventListener('pointerdown',e=>{e.preventDefault();H.ac();down=true;S.c.setPointerCapture(e.pointerId);const p=S.pos(e);last=p;popAt(p.x,p.y,true)});
S.c.addEventListener('pointermove',e=>{if(!down)return;const p=S.pos(e);const d=Math.hypot(p.x-last.x,p.y-last.y),steps=Math.ceil(d/(R*.6));
  for(let i=1;i<=steps;i++)popAt(last.x+(p.x-last.x)*i/steps,last.y+(p.y-last.y)*i/steps);last=p});
const up=()=>{down=false};S.c.addEventListener('pointerup',up);S.c.addEventListener('pointercancel',up);

function drawBubble(b){const x=b.x,y=b.y+sheetY;
  if(!b.popped){ctx.fillStyle='rgba(0,0,0,.10)';ctx.beginPath();ctx.ellipse(x+3,y+4,R,R*.95,0,0,7);ctx.fill();
    const g=ctx.createRadialGradient(x-R*.35,y-R*.4,R*.05,x,y,R);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(.8,'rgba(190,225,235,.25)');g.addColorStop(1,'rgba(120,170,185,.55)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();ctx.strokeStyle='rgba(110,150,165,.5)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.ellipse(x-R*.38,y-R*.42,R*.18,R*.1,-.6,0,7);ctx.fill()}
  else{const s=b.pt;ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(160,190,198,.35)';ctx.beginPath();ctx.ellipse(0,0,R*(.95+s*.1),R*(.9+s*.1),b.seed*3,0,7);ctx.fill();
    ctx.strokeStyle='rgba(90,120,130,.55)';ctx.lineWidth=1;for(let i=0;i<5;i++){const a=b.seed*7+i*1.3;ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.15,Math.sin(a)*R*.15);ctx.lineTo(Math.cos(a+.4)*R*.75,Math.sin(a+.4)*R*.7);ctx.stroke()}
    ctx.restore()}}

const stop=H.loop(dt=>{const W=S.W,Hh=S.H;
  if(sliding){sheetY-=(Hh*.06)*dt;if(sheetY<-Hh){build();sheetY=Hh;sliding=2}
    if(sliding===2){sheetY=Math.max(0,sheetY-(Hh*.06)*dt);if(sheetY===0)sliding=0}}
  ctx.fillStyle='#9fb1b6';ctx.fillRect(0,0,W,Hh);
  ctx.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<W;i+=40)ctx.fillRect(i,0,1,Hh);
  ctx.save();ctx.fillStyle='rgba(235,245,248,.45)';ctx.fillRect(0,sheetY,W,Hh);
  bubbles.forEach(b=>{if(b.pt>0)b.pt=Math.max(0,b.pt-.08*dt);drawBubble(b)});ctx.restore();
  for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.t+=dt/35;if(p.t>=1){pops.splice(i,1);continue}
    ctx.globalAlpha=1-p.t;ctx.font='22px "Black Han Sans",sans-serif';ctx.textAlign='center';ctx.fillStyle='#1f5d70';ctx.fillText('뽁!',p.x,p.y+sheetY-R-p.t*26);ctx.globalAlpha=1}
});
return()=>{stop();S.stop();H.store.set('bubble',total)};
}});
