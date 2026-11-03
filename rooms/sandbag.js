/* 샌드백 방 */
H.register('sandbag',{title:'샌드백',sub:'글자·사진·캐릭터를 붙이고 마음껏 치기',floor:1,icon:'🥊',color:'#e0533f',
blurb:'사진을 붙이면 코피도 터져요',
mount(root){
root.innerHTML=`
<style>
.sb-editor{position:fixed;inset:0;z-index:20;background:rgba(10,8,7,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));
  padding-top:calc(16px + env(safe-area-inset-top,0px));padding-bottom:calc(16px + env(safe-area-inset-bottom,0px));box-sizing:border-box}
.sb-editor h2{margin:0;font-family:var(--display);font-weight:400;font-size:20px}
.sb-editor p{margin:0;font-size:12px;color:var(--muted);text-align:center}
.sb-crop{position:relative;height:min(52vh,560px);aspect-ratio:400/643;max-width:100%;border-radius:14px;overflow:hidden;border:3px solid var(--gold);background:#000;touch-action:none;cursor:grab}
.sb-zoom{display:flex;align-items:center;gap:10px;width:min(100%,360px)}
.sb-zoom input{flex:1;accent-color:var(--gold)}
.sb-zoom button{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--fg);font-size:20px;cursor:pointer;flex:none}
.sb-act{display:flex;gap:8px;width:min(100%,360px)}.sb-act .btn{flex:1}
.sb-stats{display:flex;gap:14px;font-variant-numeric:tabular-nums;position:absolute;top:10px;left:12px;pointer-events:none}
.sb-stats div{text-align:left}.sb-stats b{display:block;font-family:var(--display);font-weight:400;font-size:20px;color:var(--gold);line-height:1}
.sb-stats span{font-size:10px;color:var(--muted);letter-spacing:.1em}
.sb-file{position:absolute;opacity:0;width:1px;height:1px}
.sb-pick{flex:1;display:flex;align-items:center;justify-content:center;padding:11px;border-radius:8px;border:1px dashed var(--muted);font-weight:700;cursor:pointer;font-size:14px}
.emoji{font-size:22px;padding:4px 9px}
</style>
<div class="stage" data-r="stage">
  <div class="sb-stats"><div><b data-r="hits">0</b><span>타격</span></div><div><b data-r="combo">0</b><span>콤보</span></div><div><b data-r="best">0</b><span>최고</span></div></div>
  <button class="corner" data-r="heal">🩹 회복</button>
  <div class="hint" data-r="hint">샌드백을 두드리세요 · PC는 F / J 키</div>
</div>
<div class="tabs" role="tablist">
  <button class="tab" role="tab" aria-selected="true" data-p="text">글자</button>
  <button class="tab" role="tab" aria-selected="false" data-p="photo">사진</button>
  <button class="tab" role="tab" aria-selected="false" data-p="char">캐릭터</button>
</div>
<div data-panel="text" class="row">
  <input class="field" type="text" id="sb-txt" maxlength="12" placeholder="때리고 싶은 말 (예: 월요일)" value="스트레스">
  <button class="btn" data-r="apply">붙이기</button>
  <div class="row" style="width:100%">
    <button class="chip" data-t="월요일">월요일</button><button class="chip" data-t="야근">야근</button>
    <button class="chip" data-t="숙제">숙제</button><button class="chip" data-t="시험">시험</button><button class="chip" data-t="미루기">미루기</button>
  </div>
</div>
<div data-panel="photo" class="row" hidden>
  <label class="sb-pick" for="sb-file">📷 사진 고르기</label><input class="sb-file" type="file" id="sb-file" accept="image/*">
  <button class="btn ghost" data-r="recrop">✂️ 크기 조절</button><button class="btn ghost" data-r="setnose">👃 코 위치</button>
</div>
<div data-panel="char" class="row" hidden>
  ${['😠','👹','🤖','👾','🐉','💀','🦟','⏰'].map(e=>`<button class="chip emoji" data-e="${e}">${e}</button>`).join('')}
</div>
<div class="sb-editor" data-r="editor" hidden role="dialog" aria-label="사진 크기 조절">
  <h2>사진 맞추기</h2>
  <p>끌어서 위치를 옮기고, 두 손가락이나 슬라이더로 확대·축소하세요.<br>노란 틀 안이 샌드백에 붙어요.</p>
  <div class="sb-crop" data-r="crop"><canvas data-r="ccv" style="display:block"></canvas></div>
  <div class="sb-zoom"><button data-r="zout" aria-label="축소">−</button><input type="range" id="sb-zoom" min="0.5" max="5" step="0.01" value="1" aria-label="확대 비율"><button data-r="zin" aria-label="확대">+</button></div>
  <div class="sb-act"><button class="btn ghost" data-r="cancel">취소</button><button class="btn" data-r="ok">샌드백에 붙이기</button></div>
</div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const AC=new AbortController(),sig={signal:AC.signal};
const stage=q('stage');const S=H.canvas(stage);const ctx=S.ctx;const cv=S.c;
const DISPLAY='"Black Han Sans","Noto Sans KR",sans-serif';
let W=S.W,Ht=S.H;S.onresize=()=>{W=S.W;Ht=S.H};

/* damage layers */
const DW=400,DH=Math.round(400*(0.66*1.85)/0.76);
const bruiseC=document.createElement('canvas'),bloodC=document.createElement('canvas');
bruiseC.width=bloodC.width=DW;bruiseC.height=bloodC.height=DH;
const bx=bruiseC.getContext('2d'),blx=bloodC.getContext('2d');
let drips=[];
function heal(){bx.clearRect(0,0,DW,DH);blx.clearRect(0,0,DW,DH);drips=[]}
q('heal').onclick=heal;

/* face */
let face={type:'text',value:'스트레스'};let nose={u:.5,v:.55},noseMode=false;
const txt=root.querySelector('#sb-txt');
function hint(t,call){const h=q('hint');h.textContent=t;h.classList.toggle('call',!!call);h.style.opacity=1}
function setText(t){t=(t||'').trim();if(!t)return;face={type:'text',value:t};txt.value=t;heal()}
q('apply').onclick=()=>setText(txt.value);
txt.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();setText(txt.value);txt.blur()}});
root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>setText(b.dataset.t));
root.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{face={type:'emoji',value:b.dataset.e};heal()});
root.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{root.querySelectorAll('.tab').forEach(x=>{x.setAttribute('aria-selected',x===t);root.querySelector(`[data-panel="${x.dataset.p}"]`).hidden=x!==t})});

/* crop editor */
let origImg=null,ed={z:1,x:0,y:0},edSaved=null;
const crop=q('crop'),ccv=q('ccv'),cc=ccv.getContext('2d'),zoom=root.querySelector('#sb-zoom');
root.querySelector('#sb-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{const im=new Image();im.onload=()=>{origImg=im;openEditor(true)};im.src=rd.result};rd.readAsDataURL(f);e.target.value=''};
function paintImg(c,cw,ch){const s=Math.max(cw/origImg.width,ch/origImg.height)*ed.z,iw=origImg.width*s,ih=origImg.height*s;c.drawImage(origImg,cw/2-iw/2+ed.x*cw,ch/2-ih/2+ed.y*ch,iw,ih)}
function drawCrop(){if(!origImg)return;const r=crop.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
  ccv.width=Math.round(r.width*d);ccv.height=Math.round(r.height*d);ccv.style.width=r.width+'px';ccv.style.height=r.height+'px';
  cc.setTransform(d,0,0,d,0,0);cc.fillStyle='#000';cc.fillRect(0,0,r.width,r.height);paintImg(cc,r.width,r.height);
  cc.strokeStyle='rgba(232,178,58,.45)';cc.setLineDash([6,6]);cc.lineWidth=1.5;cc.beginPath();cc.ellipse(r.width/2,r.height*.5,r.width*.32,r.height*.26,0,0,7);cc.stroke();cc.setLineDash([])}
function openEditor(fresh){if(!origImg){hint('먼저 사진을 고르세요',true);return}edSaved={...ed};if(fresh)ed={z:1,x:0,y:0};zoom.value=ed.z;q('editor').hidden=false;requestAnimationFrame(drawCrop)}
function setZoom(z,cx,cy){const r=crop.getBoundingClientRect();z=Math.max(.5,Math.min(5,z));const k=z/ed.z;
  if(cx!=null){const px=(cx-r.left)/r.width-.5,py=(cy-r.top)/r.height-.5;ed.x=px-(px-ed.x)*k;ed.y=py-(py-ed.y)*k}else{ed.x*=k;ed.y*=k}
  ed.z=z;zoom.value=z;drawCrop()}
zoom.oninput=e=>setZoom(+e.target.value);q('zin').onclick=()=>setZoom(ed.z*1.15);q('zout').onclick=()=>setZoom(ed.z/1.15);
crop.addEventListener('wheel',e=>{e.preventDefault();H.ui('slide');setZoom(ed.z*Math.exp(-e.deltaY*.0015),e.clientX,e.clientY)},{passive:false});
const ptrs=new Map(),dragS={};let pinch0=null;
crop.addEventListener('pointerdown',e=>{crop.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0={d:Math.hypot(a.x-b.x,a.y-b.y),z:ed.z}}});
crop.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId),r=crop.getBoundingClientRect();
  if(ptrs.size===1){H.dragTick(dragS,e.clientX-p.x,e.clientY-p.y);ed.x+=(e.clientX-p.x)/r.width;ed.y+=(e.clientY-p.y)/r.height;p.x=e.clientX;p.y=e.clientY;drawCrop()}
  else if(ptrs.size===2&&pinch0){p.x=e.clientX;p.y=e.clientY;const[a,b]=[...ptrs.values()];H.dragTick(dragS,e.clientX-p.x,0);setZoom(pinch0.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch0.d,(a.x+b.x)/2,(a.y+b.y)/2)}});
const endPtr=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=null};
crop.addEventListener('pointerup',endPtr);crop.addEventListener('pointercancel',endPtr);
window.addEventListener('resize',()=>{if(!q('editor').hidden)drawCrop()},sig);
q('cancel').onclick=()=>{q('editor').hidden=true;if(edSaved)ed=edSaved};
q('ok').onclick=()=>{const out=document.createElement('canvas');out.width=DW*2;out.height=DH*2;const oc=out.getContext('2d');
  oc.fillStyle='#2a1612';oc.fillRect(0,0,out.width,out.height);paintImg(oc,out.width,out.height);face={type:'image',img:out};q('editor').hidden=true;heal();startNose()};
q('recrop').onclick=()=>openEditor(false);
function startNose(){if(face.type!=='image'){hint('먼저 사진을 고르세요',true);return}noseMode=true;hint('👃 사진 속 얼굴의 코를 탭하세요',true)}
q('setnose').onclick=startNose;

/* audio */
function punchSound(power,zone){const a=H.ac();if(!a)return;const t=a.currentTime,out=H.out(),verb=H.verb();
  H.noise(t,.05,'bandpass',1400,.8,.25);
  H.noise(t+.012,.03,'highpass',3000,.7,.8*power,{wet:true});
  const o=a.createOscillator(),og=a.createGain();o.type='sine';o.frequency.setValueAtTime(110+Math.random()*15,t+.01);o.frequency.exponentialRampToValueAtTime(38,t+.22);
  og.gain.setValueAtTime(.0001,t);og.gain.exponentialRampToValueAtTime(1.1*Math.min(power,1.6),t+.015);og.gain.exponentialRampToValueAtTime(.0001,t+.35);
  o.connect(og);og.connect(out);og.connect(verb);o.start(t);o.stop(t+.36);
  H.noise(t+.01,.18,'lowpass',700,.7,.9,{wet:true});
  for(let i=0;i<3;i++)H.noise(t+.07+i*.045+Math.random()*.02,.03,'bandpass',4200+Math.random()*1500,6,.12);
  if(zone==='nose'||zone==='mouth')H.noise(t+.02,.09,'bandpass',600,1.5,.5)}
function bell(){const t=H.now();[1,2.76,5.4].forEach((m,i)=>H.tone(620*m,t,1.6,.25/(i+1),'sine',{wet:true}))}

/* physics */
let theta=0,omega=0,squash=0,squashV=0,shake=0,kick=0,freeze=0,hits=0,combo=0,best=0,lastHit=0,flash=0;
const pops=[],parts=[],dents=[],gloves={L:0,R:0,Lx:0,Ly:0,Rx:0,Ry:0};
const WORDS=['퍽!','빡!','쾅!','팍!','퍼억!'];
function geom(){const bw=Math.min(W*.5,(Ht*.66)/1.85,230),bh=bw*1.85,px=W/2,py=-4,chain=Math.max(26,Ht*.1);
  return{bw,bh,px,py,chain,cy:chain+bh/2,fx:-bw*.38,fy:-bh/2+bh*.14,fw:bw*.76,fh:bh*.66}}
function toLocal(x,y){const g=geom(),dx=x-g.px,dy=y-g.py,c=Math.cos(-theta),s=Math.sin(-theta);return{x:dx*c-dy*s,y:dx*s+dy*c-g.cy}}
function toWorld(lx,ly){const g=geom(),c=Math.cos(theta),s=Math.sin(theta),y=ly+g.cy;return{x:g.px+lx*c-y*s,y:g.py+lx*s+y*c}}

function bruise(u,v,r,a,col){const x=u*DW,y=v*DH,R=r*DW,g=bx.createRadialGradient(x,y,0,x,y,R);
  g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(.6,`rgba(${col},${a*.55})`);g.addColorStop(1,`rgba(${col},0)`);bx.fillStyle=g;bx.beginPath();bx.ellipse(x,y,R,R*(.8+Math.random()*.3),Math.random()*3,0,7);bx.fill()}
function blackEye(u,v,a){const x=u*DW,y=v*DH,R=DW*.11,g=bx.createRadialGradient(x,y,R*.25,x,y,R);
  g.addColorStop(0,'rgba(70,20,60,0)');g.addColorStop(.45,`rgba(70,20,70,${a})`);g.addColorStop(.75,`rgba(90,30,90,${a*.6})`);g.addColorStop(1,'rgba(90,30,90,0)');bx.fillStyle=g;bx.beginPath();bx.ellipse(x,y,R,R*.8,0,0,7);bx.fill()}
function splat(u,v,n,spread){for(let i=0;i<n;i++){const a=Math.random()*7,d=Math.random()*spread,x=(u+Math.cos(a)*d)*DW,y=(v+Math.sin(a)*d*.8)*DH;
  blx.fillStyle=Math.random()<.5?'#7a0606':'#a10d0d';blx.beginPath();blx.arc(x,y,1+Math.random()*3.2,0,7);blx.fill()}}
function bleed(u,v,c){for(let i=0;i<c;i++)drips.push({u:u+(Math.random()-.5)*.03,v,vy:.002+Math.random()*.003,r:3+Math.random()*2.5,life:1})}
function updateDrips(dt){for(let i=drips.length-1;i>=0;i--){const d=drips[i];
  for(let s=0;s<3;s++){d.v+=d.vy*dt/3;const x=d.u*DW,y=d.v*DH;blx.fillStyle='#8c0808';blx.beginPath();blx.arc(x,y,d.r,0,7);blx.fill();
    blx.fillStyle='rgba(255,90,90,.25)';blx.beginPath();blx.arc(x-d.r*.3,y-d.r*.3,d.r*.35,0,7);blx.fill()}
  d.u+=(Math.random()-.5)*.0015;d.vy*=.985;d.r*=.994;d.life-=.006*dt;if(d.life<=0||d.v>1.05||d.r<.8||d.vy<.0004)drips.splice(i,1)}}
function damage(u,v,power){if(u<0||u>1||v<0||v>1)return'body';
  if(face.type!=='image'){bruise(u,v,.07,.25*power,'110,20,60');return'body'}
  const eL={u:nose.u-.13,v:nose.v-.12},eR={u:nose.u+.13,v:nose.v-.12},mo={u:nose.u,v:nose.v+.11},dist=p=>Math.hypot(u-p.u,(v-p.v)*.62);
  if(dist(nose)<.075){bruise(nose.u,nose.v,.06,.25*power,'140,20,40');splat(nose.u,nose.v+.02,8+Math.round(power*6),.06+power*.02);
    bleed(nose.u-.025,nose.v+.03,1+Math.round(power));bleed(nose.u+.025,nose.v+.03,1+Math.round(power));return'nose'}
  for(const e of[eL,eR])if(dist(e)<.085){blackEye(e.u,e.v,.35*power);return'eye'}
  if(dist(mo)<.07){bruise(mo.u,mo.v,.05,.3*power,'150,15,30');splat(mo.u+(Math.random()-.5)*.05,mo.v+.01,5,.03);bleed(mo.u+(Math.random()-.5)*.06,mo.v+.02,1);return'mouth'}
  bruise(u,v,.07+Math.random()*.03,.28*power,Math.random()<.5?'120,30,80':'150,40,60');return'cheek'}

function punch(x,y,side){const g=geom(),now=performance.now();
  if(now-lastHit<650)combo++;else combo=1;lastHit=now;hits++;best=Math.max(best,combo);
  const power=1+Math.min(combo,12)*.07;let l=toLocal(x,y);
  l.x=Math.max(-g.bw*.45,Math.min(g.bw*.45,l.x));l.y=Math.max(-g.bh*.45,Math.min(g.bh*.45,l.y));
  if(side==null)side=l.x<0?'L':'R';const dir=side==='L'?1:-1;
  omega+=dir*(.006+Math.random()*.003)*power;squashV+=.045*power;shake=Math.min(12,4+combo*.6);kick=1;flash=.6;freeze=power>1.3?3:2;
  dents.push({x:l.x,y:l.y,a:1});if(dents.length>4)dents.shift();
  const zone=damage((l.x-g.fx)/g.fw,(l.y-g.fy)/g.fh,power);const w=toWorld(l.x,l.y);
  for(let i=0;i<10;i++){const a=(dir>0?Math.PI:0)+(Math.random()-.5)*2.2,s=2+Math.random()*4;
    parts.push({x:w.x,y:w.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,t:1,r:1+Math.random()*2,blood:(zone==='nose'||zone==='mouth')&&Math.random()<.6})}
  const big=combo%10===0;
  pops.push({x:w.x,y:w.y,t:0,txt:big?combo+' 콤보!':zone==='nose'?'코피!':zone==='eye'?'눈탱이!':WORDS[Math.random()*WORDS.length|0],big:big||zone==='nose'});
  gloves[side]=1;gloves[side+'x']=w.x;gloves[side+'y']=w.y;
  punchSound(power,zone);H.buzz(zone==='nose'?[60,30,60]:big?[40,30,90]:Math.round(30+Math.min(combo,10)*4));if(big)bell();
  q('hits').textContent=hits;q('combo').textContent=combo;q('best').textContent=best;q('hint').style.opacity=0}
let alt=false;
cv.addEventListener('pointerdown',e=>{e.preventDefault();H.ac();const p=S.pos(e);
  if(noseMode){const g=geom(),l=toLocal(p.x,p.y),u=(l.x-g.fx)/g.fw,v=(l.y-g.fy)/g.fh;
    if(u>=0&&u<=1&&v>=0&&v<=1){nose={u,v};noseMode=false;H.ui('btn');hint('준비 끝! 코를 노려보세요 🥊',true);setTimeout(()=>{q('hint')&&(q('hint').style.opacity=0)},1800)}
    else{hint('샌드백 사진 안쪽의 코를 탭하세요',true);H.ui('tap')}return}
  punch(p.x,p.y,p.x<W/2?'L':'R')});
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const g=geom(),k=e.key.toLowerCase();let side=null;
  if(k==='f'||k==='arrowleft')side='L';else if(k==='j'||k==='arrowright')side='R';else if(k===' ')side=(alt=!alt)?'L':'R';
  if(!side)return;e.preventDefault();H.ac();const w=toWorld(g.fx+g.fw*(.25+Math.random()*.5),g.fy+g.fh*(.2+Math.random()*.6));punch(w.x,w.y,side)},sig);

/* drawing */
const rr=(x,y,w,h,r)=>H.rr(ctx,x,y,w,h,r);
function fitLines(t,maxW,maxH){const ch=[...t];let best={size:12,lines:[t]};ctx.font=`100px ${DISPLAY}`;
  for(let rows=1;rows<=Math.min(4,ch.length);rows++){const per=Math.ceil(ch.length/rows),lines=[];for(let i=0;i<ch.length;i+=per)lines.push(ch.slice(i,i+per).join(''));
    const wMax=Math.max(...lines.map(l=>ctx.measureText(l).width)),size=Math.min(100*maxW/wMax,maxH/(rows*1.1));if(size>best.size)best={size,lines}}return best}
function drawGym(){ctx.fillStyle='#17120f';ctx.fillRect(0,0,W,Ht);
  ctx.strokeStyle='rgba(255,255,255,.025)';ctx.lineWidth=1;
  for(let y=0;y<Ht*.72;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();for(let x=(y/22%2)*24;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+22);ctx.stroke()}}
  const lg=ctx.createRadialGradient(W/2,-20,10,W/2,Ht*.4,Ht*.8);lg.addColorStop(0,'rgba(255,214,150,.38)');lg.addColorStop(.5,'rgba(255,190,120,.10)');lg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=lg;ctx.fillRect(0,0,W,Ht);
  const fy=Ht*.78,fg=ctx.createLinearGradient(0,fy,0,Ht);fg.addColorStop(0,'#2a211b');fg.addColorStop(1,'#0e0b09');ctx.fillStyle=fg;ctx.fillRect(0,fy,W,Ht-fy);
  ['#7d1f1f','#c9bfae','#25407a'].forEach((c,i)=>{const y=Ht*.5+i*Ht*.07;ctx.strokeStyle=c;ctx.globalAlpha=.35;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(W/2,y+8,W,y);ctx.stroke()});ctx.globalAlpha=1;
  ctx.fillStyle='rgba(60,50,45,.8)';ctx.fillRect(W*.04,Ht*.44,10,fy-Ht*.44);ctx.fillRect(W*.96-10,Ht*.44,10,fy-Ht*.44);
  const vg=ctx.createRadialGradient(W/2,Ht*.45,Math.min(W,Ht)*.3,W/2,Ht*.45,Math.max(W,Ht)*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.7)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,Ht)}
function drawBag(g){const{bw,bh,fx,fy,fw,fh}=g,x=-bw/2,y=-bh/2,r=bw*.22;
  const grad=ctx.createLinearGradient(x,0,x+bw,0);grad.addColorStop(0,'#3a0707');grad.addColorStop(.3,'#a81f1f');grad.addColorStop(.47,'#c42a2a');grad.addColorStop(.75,'#861616');grad.addColorStop(1,'#2e0606');
  rr(x,y,bw,bh,r);ctx.fillStyle=grad;ctx.fill();
  ctx.save();rr(x,y,bw,bh,r);ctx.clip();ctx.setLineDash([4,5]);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;[.22,.5,.78].forEach(f=>{ctx.beginPath();ctx.moveTo(x+bw*f,y);ctx.lineTo(x+bw*f,y+bh);ctx.stroke()});ctx.setLineDash([]);ctx.restore();
  ctx.save();rr(fx,fy,fw,fh,bw*.08);ctx.clip();ctx.fillStyle='#2a1612';ctx.fillRect(fx,fy,fw,fh);
  if(face.type==='image'&&face.img){const im=face.img,s=Math.max(fw/im.width,fh/im.height),iw=im.width*s,ih=im.height*s;ctx.drawImage(im,fx+(fw-iw)/2,fy+(fh-ih)/2,iw,ih)}
  else if(face.type==='emoji'){const size=Math.min(fw,fh)*.78;ctx.font=`${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(face.value,0,fy+fh/2+size*.05)}
  else{const f=fitLines(face.value,fw*.86,fh*.86);ctx.font=`${f.size}px ${DISPLAY}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#efe4cf';
    const lh=f.size*1.08,st=fy+fh/2-(f.lines.length-1)*lh/2;f.lines.forEach((l,i)=>ctx.fillText(l,0,st+i*lh))}
  ctx.globalCompositeOperation='multiply';ctx.drawImage(bruiseC,fx,fy,fw,fh);ctx.globalCompositeOperation='source-over';ctx.drawImage(bloodC,fx,fy,fw,fh);
  if(flash>0){ctx.fillStyle=`rgba(255,240,220,${flash*.35})`;ctx.fillRect(fx,fy,fw,fh)}
  if(noseMode){ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(fx,fy,fw,fh)}ctx.restore();
  if(noseMode){const t=performance.now()/300;ctx.strokeStyle='#e8b23a';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(fx+nose.u*fw,fy+nose.v*fh,14+Math.sin(t)*3,0,7);ctx.stroke();ctx.setLineDash([])}
  ctx.save();rr(x,y,bw,bh,r);ctx.clip();
  const sh=ctx.createLinearGradient(x,0,x+bw,0);sh.addColorStop(0,'rgba(0,0,0,.6)');sh.addColorStop(.28,'rgba(0,0,0,0)');sh.addColorStop(.4,'rgba(255,230,200,.12)');sh.addColorStop(.46,'rgba(255,255,255,0)');sh.addColorStop(.72,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.65)');
  ctx.fillStyle=sh;ctx.fillRect(x,y,bw,bh);
  dents.forEach(d=>{if(d.a<.02)return;const R=bw*.22,dg=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,R);
    dg.addColorStop(0,`rgba(0,0,0,${.45*d.a})`);dg.addColorStop(.65,`rgba(0,0,0,${.15*d.a})`);dg.addColorStop(.85,`rgba(255,220,190,${.12*d.a})`);dg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=dg;ctx.beginPath();ctx.ellipse(d.x,d.y,R*(1+.3*d.a),R*.9,0,0,7);ctx.fill()});
  ctx.fillStyle='#161111';ctx.fillRect(x,y+bh*.06,bw,bh*.045);ctx.fillRect(x,y+bh*.86,bw,bh*.045);
  ctx.fillStyle='rgba(232,178,58,.85)';ctx.font=`${bw*.07}px ${DISPLAY}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('HEAVY BAG · 40KG',0,y+bh*.935);ctx.restore();
  rr(fx,fy,fw,fh,bw*.08);ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=3;ctx.stroke()}
function drawChain(g){ctx.strokeStyle='#8a8580';ctx.lineWidth=3;for(let yy=6;yy<g.chain-8;yy+=12){ctx.beginPath();ctx.ellipse(0,yy,4,7,0,0,7);ctx.stroke()}
  ctx.strokeStyle='#5d5852';ctx.lineWidth=2;[-.4,-.15,.15,.4].forEach(f=>{ctx.beginPath();ctx.moveTo(0,g.chain-10);ctx.lineTo(f*g.bw,g.chain+4);ctx.stroke()})}
function drawGlove(side,amt,tx,ty){const bx0=side==='L'?W*.15:W*.85,by0=Ht+24,e=amt>0?Math.sin(amt*Math.PI):0;
  const gx=bx0+(tx-bx0)*e*.85,gy=by0+(ty-by0)*e*.85,s=Math.min(W,Ht)*.13*(1-e*.3);
  ctx.save();ctx.translate(gx,gy);ctx.rotate(side==='L'?-.35+e*.3:.35-e*.3);if(side==='R')ctx.scale(-1,1);
  ctx.fillStyle='#efe4cf';rr(-s*.55,s*.55,s*1.1,s*.9,s*.15);ctx.fill();ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-s*.55,s*.85,s*1.1,s*.08);
  const gr=ctx.createRadialGradient(-s*.25,-s*.3,s*.1,0,0,s*1.1);gr.addColorStop(0,'#e8463a');gr.addColorStop(1,'#6e0b0b');ctx.fillStyle=gr;
  ctx.beginPath();ctx.ellipse(0,0,s*.85,s*.95,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(s*.65,s*.15,s*.35,s*.45,.4,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.ellipse(-s*.3,-s*.45,s*.25,s*.14,-.5,0,7);ctx.fill();ctx.restore()}

const stop=H.loop(dt=>{
  if(freeze>0)freeze--;else{
    for(let i=0;i<dt;i++){omega+=-.0028*Math.sin(theta);omega*=.972;theta+=omega}
    squashV+=-.3*squash;squashV*=.72;squash+=squashV;shake*=Math.pow(.84,dt);flash*=Math.pow(.78,dt);kick*=Math.pow(.8,dt);
    dents.forEach(d=>d.a*=Math.pow(.9,dt));updateDrips(dt);
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.25*dt;p.t-=.03*dt;if(p.t<=0)parts.splice(i,1)}}
  if(performance.now()-lastHit>650&&combo){combo=0;q('combo').textContent=0}
  ctx.save();
  if(!H.reduce){const z=1+kick*.035;ctx.translate(W/2,Ht/2);ctx.scale(z,z);ctx.translate(-W/2,-Ht/2);if(shake>.3)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake)}
  const g=geom();drawGym();
  const sx=g.px+Math.sin(theta)*(g.chain+g.bh);ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(sx,Math.min(Ht-14,g.chain+g.bh+36),g.bw*.55,9,0,0,7);ctx.fill();
  ctx.save();ctx.translate(g.px,g.py);ctx.rotate(theta);drawChain(g);ctx.translate(0,g.cy);ctx.scale(1+squash*.5,1-squash*.25);drawBag(g);ctx.restore();
  parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.t);ctx.fillStyle=p.blood?'#a10d0d':'#e9dcc4';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()});ctx.globalAlpha=1;
  for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.t+=dt/42;if(p.t>=1){pops.splice(i,1);continue}
    const sc=(p.big?1.45:1)*(.7+Math.min(p.t*4,1)*.5);ctx.save();ctx.translate(p.x,p.y-p.t*50);ctx.scale(sc,sc);ctx.globalAlpha=1-p.t;
    ctx.font=`32px ${DISPLAY}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=6;ctx.strokeStyle='#14110f';ctx.strokeText(p.txt,0,0);ctx.fillStyle=p.big?'#e8b23a':'#fff3dc';ctx.fillText(p.txt,0,0);
    if(p.t<.25){ctx.globalAlpha=(.25-p.t)*4;ctx.strokeStyle='#e8b23a';ctx.lineWidth=3;for(let k=0;k<8;k++){const a=k*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*22,Math.sin(a)*22+50*p.t);ctx.lineTo(Math.cos(a)*40,Math.sin(a)*40+50*p.t);ctx.stroke()}}
    ctx.restore()}
  ctx.restore();
  ['L','R'].forEach(s=>{if(gloves[s]>0)gloves[s]=Math.max(0,gloves[s]-.1*dt);drawGlove(s,gloves[s]>0?1-gloves[s]:0,gloves[s+'x']||W/2,gloves[s+'y']||Ht/2)});
});
return()=>{stop();S.stop();AC.abort()};
}});
