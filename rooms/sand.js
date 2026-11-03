/* 모래 정원 방 */
H.register('sand',{title:'모래 정원',sub:'갈퀴로 모래에 물결을 그리고 돌을 놓기',floor:2,icon:'🪨',color:'#d8c08a',
blurb:'갈퀴로 모래에 물결 그리기',
mount(root){
root.innerHTML=`
<div class="stage" data-r="stage" style="background:#d9c79e"></div>
<div class="row">
  <button class="chip" aria-pressed="true" data-tool="rake">갈퀴</button>
  <button class="chip" aria-pressed="false" data-tool="finger">손가락</button>
  <button class="chip" aria-pressed="false" data-tool="stone">돌 놓기</button>
  <button class="btn ghost" data-r="clear" style="margin-left:auto">평평하게</button>
</div>
<p class="note">천천히 그릴수록 모래 소리가 부드러워요. 돌을 놓으면 둘레에 물결이 생겨요.</p>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const S=H.canvas(q('stage')),ctx=S.ctx;
let tool='rake';root.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;root.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
let sand=null,sx=null,stones=[];
function base(c,x,w,h){const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#e6d6ae');g.addColorStop(1,'#cfba8a');x.fillStyle=g;x.fillRect(0,0,w,h);
  const img=x.getImageData(0,0,c.width,c.height),d=img.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*26;d[i]+=n;d[i+1]+=n;d[i+2]+=n*.8}x.putImageData(img,0,0)}
function makeSand(keep){const c=document.createElement('canvas');c.width=S.c.width;c.height=S.c.height;const x=c.getContext('2d');
  base(c,x,c.width,c.height);if(keep&&sand)x.drawImage(sand,0,0,c.width,c.height);sand=c;sx=x;sx.setTransform(S.dpr,0,0,S.dpr,0,0)}
S.onresize=()=>makeSand(true);makeSand(false);

function groove(x0,y0,x1,y1,w){sx.lineCap='round';
  sx.strokeStyle='rgba(120,90,50,.16)';sx.lineWidth=w;sx.beginPath();sx.moveTo(x0+1,y0+1.2);sx.lineTo(x1+1,y1+1.2);sx.stroke();
  sx.strokeStyle='rgba(150,118,72,.10)';sx.lineWidth=w*.6;sx.beginPath();sx.moveTo(x0,y0);sx.lineTo(x1,y1);sx.stroke();
  sx.strokeStyle='rgba(255,248,226,.16)';sx.lineWidth=w*.45;sx.beginPath();sx.moveTo(x0-w*.45,y0-w*.45);sx.lineTo(x1-w*.45,y1-w*.45);sx.stroke()}
function stroke(a,b){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<.5)return;const nx=-dy/L,ny=dx/L;
  if(tool==='finger')groove(a.x,a.y,b.x,b.y,9);
  else{const tines=5,gap=11;for(let i=0;i<tines;i++){const o=(i-(tines-1)/2)*gap;groove(a.x+nx*o,a.y+ny*o,b.x+nx*o,b.y+ny*o,5)}}}
function ripple(x,y,r){for(let k=1;k<=3;k++){const R=r+k*13;let prev=null;for(let a=0;a<=Math.PI*2+.01;a+=.12){const p={x:x+Math.cos(a)*R,y:y+Math.sin(a)*R*.92};if(prev)groove(prev.x,prev.y,p.x,p.y,5);prev=p}}}

/* sand scrape sound */
let scrape=null;
function scrapeOn(){const a=H.ac();if(!a||scrape)return;const n=a.createBufferSource();n.buffer=H.noiseBuf();n.loop=true;
  const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2200;f.Q.value=.6;const f2=a.createBiquadFilter();f2.type='highshelf';f2.frequency.value=4000;f2.gain.value=-8;
  const g=a.createGain();g.gain.value=0;n.connect(f).connect(f2).connect(g).connect(H.out());n.start();scrape={n,g,f}}
function scrapeLevel(v){if(!scrape)return;const t=H.now();scrape.g.gain.setTargetAtTime(Math.min(.35,v),t,.05);scrape.f.frequency.setTargetAtTime(1600+v*3000,t,.08)}
function scrapeOff(){if(!scrape)return;const t=H.now();scrape.g.gain.setTargetAtTime(0,t,.08);const s=scrape;scrape=null;s.n.stop(t+.5)}

let down=false,last=null,lastT=0;
S.c.addEventListener('pointerdown',e=>{e.preventDefault();H.ac();const p=S.pos(e);
  if(tool==='stone'){const r=12+Math.random()*16;stones.push({x:p.x,y:p.y,r,rot:Math.random()*3,hue:20+Math.random()*30,l:28+Math.random()*25});ripple(p.x,p.y,r);
    const t=H.now();H.tone(140,t,.2,.3,'sine',{to:70});H.noise(t,.08,'lowpass',600,1,.3);H.buzz(25);return}
  down=true;S.c.setPointerCapture(e.pointerId);last=p;lastT=performance.now();scrapeOn()});
S.c.addEventListener('pointermove',e=>{if(!down)return;const p=S.pos(e),now=performance.now();const d=Math.hypot(p.x-last.x,p.y-last.y);
  const steps=Math.ceil(d/3);let a=last;for(let i=1;i<=steps;i++){const b={x:last.x+(p.x-last.x)*i/steps,y:last.y+(p.y-last.y)*i/steps};stroke(a,b);a=b}
  const v=d/Math.max(1,now-lastT);scrapeLevel(v*.25);if(v>1.2&&Math.random()<.2)H.buzz(5);last=p;lastT=now});
const up=()=>{down=false;scrapeOff()};S.c.addEventListener('pointerup',up);S.c.addEventListener('pointercancel',up);

let wipe=-1;
q('clear').onclick=()=>{if(wipe>=0)return;wipe=0;H.buzz([30,30,30,30,30,30,30]);const t=H.now();H.noise(t,1.1,'bandpass',1800,.5,.25,{atk:.2})};

const stop=H.loop(dt=>{const W=S.W,Hh=S.H;
  if(wipe>=0){wipe+=dt*.025;const x=wipe*W;
    sx.save();sx.beginPath();sx.rect(0,0,Math.min(W,x),Hh);sx.clip();sx.setTransform(1,0,0,1,0,0);
    if(!makeSand.fresh||makeSand.fresh.width!==sand.width){const f=document.createElement('canvas');f.width=sand.width;f.height=sand.height;base(f,f.getContext('2d'),f.width,f.height);makeSand.fresh=f}
    sx.drawImage(makeSand.fresh,0,0);sx.restore();sx.setTransform(S.dpr,0,0,S.dpr,0,0);
    if(wipe>=1){wipe=-1;stones=[]}}
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(sand,0,0);ctx.setTransform(S.dpr,0,0,S.dpr,0,0);
  if(wipe>=0){const x=wipe*W;ctx.fillStyle='#6b4f2a';ctx.fillRect(x-4,0,8,Hh);ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(x+4,0,10,Hh)}
  stones.forEach(s=>{ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);ctx.fillStyle='rgba(60,40,20,.3)';ctx.beginPath();ctx.ellipse(4,5,s.r,s.r*.8,0,0,7);ctx.fill();
    const g=ctx.createRadialGradient(-s.r*.3,-s.r*.35,s.r*.1,0,0,s.r*1.1);g.addColorStop(0,`hsl(${s.hue} 6% ${s.l+30}%)`);g.addColorStop(1,`hsl(${s.hue} 8% ${s.l-10}%)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,s.r,s.r*.8,0,0,7);ctx.fill();ctx.restore()});
  const v=ctx.createRadialGradient(W/2,Hh/2,Math.min(W,Hh)*.4,W/2,Hh/2,Math.max(W,Hh)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(40,25,10,.35)');ctx.fillStyle=v;ctx.fillRect(0,0,W,Hh);
});
return()=>{stop();S.stop();scrapeOff()};
}});
