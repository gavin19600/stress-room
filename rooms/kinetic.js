/* 키네틱 샌드 자르기 방 */
H.register('kinetic',{title:'키네틱 샌드 자르기',sub:'칼로 위에서 아래로 쓱 — 사각사각 ASMR',floor:2,icon:'🔪',color:'#c99be0',
blurb:'사각사각 잘리는 모래 블록',
mount(root){
root.innerHTML=`
<div class="stage" data-r="stage">
  <span class="badge" data-r="count">0조각</span>
  <div class="hint" data-r="hint">블록 위에서 아래로 쓱 그어 자르세요 (탭해도 돼요)</div>
</div>
<div class="row" data-r="pal"></div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const S=H.canvas(q('stage')),ctx=S.ctx;
const PALS=[['#f7a8c4','#fbd38d','#9ae6b4','#90cdf4','#d6bcfa'],['#c4b5fd','#c4b5fd','#a78bfa','#c4b5fd','#ddd6fe'],['#fca5a5','#fdba74','#fde68a'],['#5eead4','#60a5fa','#818cf8','#5eead4'],['#e7d8c2','#e7d8c2','#c9a97d']];
const PNAMES=['무지개','라벤더','노을','바다','모래'];
let pi=0,count=H.store.get('kinetic',0);q('count').textContent=`${count}조각`;
q('pal').innerHTML=PNAMES.map((n,i)=>`<button class="chip" aria-pressed="${i===0}" data-p="${i}">${n}</button>`).join('');
q('pal').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{pi=+b.dataset.p;q('pal').querySelectorAll('[data-p]').forEach(x=>x.setAttribute('aria-pressed',x===b));newBlock(true)});

let blk=null,tex=null,slices=[],crumbs=[],pileC=[];
function geo(){const W=S.W,Hh=S.H,bw=Math.min(W*.7,360),bh=Math.min(Hh*.32,170),bx=(W-bw)/2,by=Hh*.62-bh;return{W,Hh,bw,bh,bx,by,tray:Hh*.62}}
function makeTex(w,h){const d=2,c=document.createElement('canvas');c.width=w*d;c.height=h*d;const x=c.getContext('2d');x.scale(d,d);
  const pal=PALS[pi],n=pal.length;for(let i=0;i<n;i++){const y0=h*i/n,y1=h*(i+1)/n;x.fillStyle=pal[i];x.beginPath();x.moveTo(0,y0);
    for(let xx=0;xx<=w;xx+=10)x.lineTo(xx,y0+Math.sin(xx*.05+i)*3);x.lineTo(w,y1+4);x.lineTo(0,y1+4);x.closePath();x.fill()}
  const img=x.getImageData(0,0,c.width,c.height),dd=img.data;for(let i=0;i<dd.length;i+=4){const k=(Math.random()-.5)*34;dd[i]+=k;dd[i+1]+=k;dd[i+2]+=k}x.putImageData(img,0,0);
  return c}
function newBlock(instant){const g=geo();tex=makeTex(g.bw,g.bh);blk={left:0,right:g.bw,enter:instant?0:1}}
S.onresize=()=>{newBlock(true)};newBlock(true);

function crunch(){const t=H.now();for(let i=0;i<22;i++){const tt=t+Math.random()*.22;H.noise(tt,.006+Math.random()*.012,'bandpass',2500+Math.random()*4500,2,.12+Math.random()*.2)}
  H.noise(t+.05,.12,'lowpass',400,1,.25);H.buzz([8,12,8,12,8,12,15])}
function cut(xLocal){const g=geo();if(!blk||blk.enter>0)return;const x=Math.max(blk.left+6,Math.min(blk.right,xLocal));if(x-blk.left<6)return;
  slices.push({l:blk.left,r:x,ang:0,va:0,fall:true});blk.left=x;crunch();count++;H.store.set('kinetic',count);q('count').textContent=`${count}조각`;q('hint').style.opacity=0;
  if(blk.right-blk.left<14){blk.left=blk.right;setTimeout(()=>newBlock(false),500)}}

let down=null,knife=null,cutDone=false;const kS={};
S.c.addEventListener('pointerdown',e=>{e.preventDefault();H.ac();const p=S.pos(e);down=p;knife=p;cutDone=false;const t=H.now();H.noise(t,.08,'highpass',5000,.7,.12);H.buzz(8);S.c.setPointerCapture(e.pointerId)});
S.c.addEventListener('pointermove',e=>{const p=S.pos(e);if(down&&knife)H.dragTick(kS,p.x-knife.x,p.y-knife.y);knife=p;if(!down||cutDone)return;const g=geo();
  if(down.y<g.by+g.bh*.4&&p.y>g.by+g.bh*.7){const lx=p.x-g.bx;if(lx>blk.left&&lx<blk.right){cutDone=true;cut(lx)}}});
S.c.addEventListener('pointerup',e=>{const p=S.pos(e),g=geo();if(down&&!cutDone&&Math.hypot(p.x-down.x,p.y-down.y)<12){const lx=p.x-g.bx;if(lx>blk.left&&lx<blk.right&&p.y>g.by-20&&p.y<g.tray+10)cut(lx)}
  down=null;setTimeout(()=>{if(!down)knife=null},250)});

const stop=H.loop(dt=>{const g=geo(),W=g.W,Hh=g.Hh;
  const bg=ctx.createLinearGradient(0,0,0,Hh);bg.addColorStop(0,'#2a2433');bg.addColorStop(1,'#141118');ctx.fillStyle=bg;ctx.fillRect(0,0,W,Hh);
  // tray
  ctx.fillStyle='#e9e3da';H.rr(ctx,g.bx-40,g.tray,g.bw+80,14,6);ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(g.bx-36,g.tray+14,g.bw+72,6);
  pileC.forEach(c=>{ctx.fillStyle=c.c;ctx.fillRect(c.x,c.y,c.s,c.s)});
  // block
  if(blk){if(blk.enter>0)blk.enter=Math.max(0,blk.enter-.05*dt);const off=blk.enter*W;
    const w=blk.right-blk.left;if(w>0){const sx=blk.left/g.bw*tex.width,sw=w/g.bw*tex.width;ctx.drawImage(tex,sx,0,sw,tex.height,g.bx+blk.left+off,g.by,w,g.bh);
      ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(g.bx+blk.left+off,g.by,4,g.bh);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(g.bx+blk.left+off,g.by,w,3)}}
  // slices
  for(let i=slices.length-1;i>=0;i--){const s=slices[i],w=s.r-s.l;s.va+=.012*dt;s.ang=Math.min(Math.PI/2,s.ang+s.va*dt);
    ctx.save();ctx.translate(g.bx+s.l,g.tray);ctx.rotate(-s.ang);ctx.drawImage(tex,s.l/g.bw*tex.width,0,w/g.bw*tex.width,tex.height,0,-g.bh,w,g.bh);ctx.restore();
    if(s.ang>=Math.PI/2){// crumble
      const pal=PALS[pi];for(let k=0;k<Math.min(160,w*g.bh/40);k++){const yy=Math.random()*g.bh,col=pal[Math.min(pal.length-1,Math.floor(yy/g.bh*pal.length))];
        crumbs.push({x:g.bx+s.l-yy,y:g.tray-Math.random()*w,vx:(Math.random()-.7)*2,vy:-Math.random()*2,c:col,s:2+Math.random()*3})}
      slices.splice(i,1);const t=H.now();H.noise(t,.18,'lowpass',700,1,.2);for(let k=0;k<8;k++)H.noise(t+Math.random()*.15,.01,'bandpass',3000+Math.random()*3000,2,.08)}}
  for(let i=crumbs.length-1;i>=0;i--){const c=crumbs[i];c.vy+=.3*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(c.y>g.tray-c.s){c.y=g.tray-c.s-Math.random()*4;pileC.push(c);crumbs.splice(i,1);continue}
    ctx.fillStyle=c.c;ctx.fillRect(c.x,c.y,c.s,c.s)}
  if(pileC.length>1800)pileC.splice(0,pileC.length-1800);
  // knife
  if(knife){ctx.save();ctx.translate(knife.x,knife.y);ctx.rotate(.08);ctx.fillStyle='#d9dde3';ctx.beginPath();ctx.moveTo(-3,-70);ctx.lineTo(5,-70);ctx.lineTo(5,8);ctx.lineTo(-3,0);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(-3,-70,2,70);ctx.fillStyle='#3b2a20';H.rr(ctx,-5,-110,12,42,4);ctx.fill();ctx.restore()}
});
return()=>{stop();S.stop()};
}});
