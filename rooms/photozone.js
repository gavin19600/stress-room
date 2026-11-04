/* 야구장 포토존 — 내 사진 얼굴로 만화 선수와 함께 찰칵 (사진은 이 기기 안에서만 처리) */
H.register('photozone',{title:'야구장 포토존',sub:'내 사진을 넣고 만화 선수와 함께 찰칵!',floor:3,icon:'📸',color:'#e23a3a',scroll:true,
blurb:'만화 야구선수와 기념사진',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.pz-stage{position:relative;width:100%;max-width:420px;margin:0 auto;aspect-ratio:3/4;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#0b1230;flex:none;touch-action:none}
.pz-stage canvas{display:block;width:100%;height:100%}
.pz-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .5s}
.pz-count{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:120px;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.6);pointer-events:none}
.pz-box{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line)}
.pz-box h4{margin:0;font-size:13px;color:var(--muted);font-weight:700}
.pz-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.pz-row input[type=text]{flex:1;min-width:0;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font-size:14px}
.pz-row input.num{flex:none;width:64px}
.pz-row input[type=range]{flex:1;accent-color:#e23a3a}
.pz-file{position:absolute;opacity:0;width:1px;height:1px}
.pz-pick{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;border:1px dashed var(--muted);cursor:pointer;font-size:14px;font-weight:700}
.pz-shoot{display:flex;gap:8px}
.pz-shoot .btn{flex:1;font-size:17px;padding:13px}
.pz-note{font-size:11.5px;color:var(--muted);line-height:1.5}
</style>
<div class="pz-stage" data-r="stage"><canvas data-r="cv" width="900" height="1200" aria-label="야구장 포토존 미리보기"></canvas><div class="pz-count" data-r="count"></div><div class="pz-flash" data-r="flash"></div></div>
<div class="pz-shoot"><button class="btn" data-r="shoot" type="button">📸 3·2·1 찰칵!</button><button class="btn ghost" data-r="save" type="button" disabled>💾 사진 저장</button></div>
<div class="pz-box"><h4>🙋 나</h4>
  <div class="pz-row"><label class="pz-pick">📷 내 사진 불러오기<input class="pz-file" type="file" accept="image/*" data-r="f1"></label><span class="note" data-r="f1n">사진 속 얼굴을 동그라미에 맞춰요</span></div>
  <div class="pz-row"><span class="note">확대</span><input type="range" min="0.5" max="4" step="0.01" value="1.3" data-r="z1" aria-label="내 사진 확대"></div>
  <div class="pz-row"><input type="text" data-r="n1" maxlength="6" placeholder="내 이름" aria-label="내 유니폼 이름"><input type="text" class="num" data-r="u1" maxlength="2" inputmode="numeric" placeholder="번호" aria-label="내 등번호"></div>
</div>
<div class="pz-box"><h4>⚾ 같이 찍을 친구</h4>
  <div class="pz-row" data-r="kinds">
    <button class="chip" data-k="bat" aria-pressed="true" type="button">타자</button>
    <button class="chip" data-k="pitch" aria-pressed="false" type="button">투수</button>
    <button class="chip" data-k="catch" aria-pressed="false" type="button">포수</button>
    <button class="chip" data-k="cheer" aria-pressed="false" type="button">응원단장</button>
    <button class="chip" data-k="tiger" aria-pressed="false" type="button">호랑이 응원단</button>
    <button class="chip" data-k="photo" aria-pressed="false" type="button">📷 사진 넣기</button>
  </div>
  <div class="pz-row" data-r="p2row" hidden><label class="pz-pick">📷 친구 사진 불러오기<input class="pz-file" type="file" accept="image/*" data-r="f2"></label><input type="range" min="0.5" max="4" step="0.01" value="1.3" data-r="z2" aria-label="친구 사진 확대"></div>
  <div class="pz-row"><input type="text" data-r="n2" maxlength="6" placeholder="선수 이름" aria-label="친구 유니폼 이름"><input type="text" class="num" data-r="u2" maxlength="2" inputmode="numeric" placeholder="번호" aria-label="친구 등번호"></div>
</div>
<div class="pz-box"><h4>✨ 꾸미기</h4>
  <div class="pz-row" data-r="poses">
    <button class="chip" data-p="v" aria-pressed="true" type="button">✌️ 브이</button>
    <button class="chip" data-p="hi5" aria-pressed="false" type="button">🙌 하이파이브</button>
    <button class="chip" data-p="hug" aria-pressed="false" type="button">🤝 어깨동무</button>
    <button class="chip" data-p="fist" aria-pressed="false" type="button">💪 파이팅</button>
  </div>
  <div class="pz-row"><input type="text" data-r="banner" maxlength="14" placeholder="전광판 응원 문구" aria-label="전광판 응원 문구"></div>
  <div class="pz-row" data-r="cols">
    <span class="note">유니폼</span>
    <button class="chip" data-c="red" aria-pressed="true" type="button">빨강</button>
    <button class="chip" data-c="black" aria-pressed="false" type="button">검정</button>
    <button class="chip" data-c="white" aria-pressed="false" type="button">흰색</button>
  </div>
</div>
<p class="pz-note">사진은 서버에 올라가지 않고 이 기기 안에서만 합성돼요. 얼굴 동그라미를 끌면 위치를, 확대 막대로 크기를 맞출 수 있어요. 실제 선수 사진·구단 로고 대신 직접 그린 캐릭터와 배경을 써요.</p>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d');const CW=900,CH=1200,GY=1150;
let alive=true;const timers=new Set();const later=(f,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(alive)f()},ms);timers.add(id)};
const sv=Hp.store.get('pzOpt',{n1:'',u1:'',n2:'',u2:'',banner:'우리 팀 최고!',kind:'bat',pose:'v',col:'red'});
const S={kind:sv.kind,pose:sv.pose,col:sv.col,faces:[{img:null,x:0,y:0,z:1.3},{img:null,x:0,y:0,z:1.3}],shot:false};
$('n1').value=sv.n1;$('u1').value=sv.u1;$('n2').value=sv.n2;$('u2').value=sv.u2;$('banner').value=sv.banner;
const saveOpt=()=>Hp.store.set('pzOpt',{n1:$('n1').value,u1:$('u1').value,n2:$('n2').value,u2:$('u2').value,banner:$('banner').value,kind:S.kind,pose:S.pose,col:S.col});
const pressed=(box,attr,val)=>root.querySelectorAll(`[data-r="${box}"] [data-${attr}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===val)));
pressed('kinds','k',S.kind);pressed('poses','p',S.pose);pressed('cols','c',S.col);$('p2row').hidden=S.kind!=='photo';

/* ---------- sound ---------- */
function shutter(){const t=Hp.now();Hp.noise(t,.03,'highpass',3000,.7,.6);Hp.noise(t+.06,.04,'bandpass',1800,1.5,.45);Hp.tone(90,t,.06,.2,'square',{to:60});Hp.buzz([30,20,50])}
function beep(f){const t=Hp.now();Hp.tone(f,t,.12,.18,'sine');Hp.buzz(15)}
function cheer(){const t=Hp.now();Hp.noise(t,1.6,'bandpass',1100,.45,.35,{atk:.2});Hp.noise(t+.1,1.3,'bandpass',2300,.6,.12,{atk:.25});for(let i=0;i<10;i++)Hp.noise(t+.2+Math.random()*.8,.035,'bandpass',2000,1.2,.15)}

/* ---------- background (미리 그려 두기) ---------- */
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const bg=document.createElement('canvas');bg.width=CW;bg.height=CH;
function drawBg(){const c=bg.getContext('2d');seed=7;
  const sky=c.createLinearGradient(0,0,0,560);sky.addColorStop(0,'#070b1f');sky.addColorStop(1,'#1c2752');c.fillStyle=sky;c.fillRect(0,0,CW,600);
  for(let i=0;i<60;i++){c.fillStyle=`rgba(255,255,255,${.3+rnd()*.6})`;c.fillRect(rnd()*CW,rnd()*220,2,2)}
  // 조명탑
  [[70,40],[830,40]].forEach(([x,y])=>{const gl=c.createRadialGradient(x,y+40,10,x,y+40,380);gl.addColorStop(0,'rgba(255,250,220,.55)');gl.addColorStop(1,'rgba(255,250,220,0)');c.fillStyle=gl;c.fillRect(0,0,CW,700);
    c.fillStyle='#2a2f3d';c.fillRect(x-6,y+70,12,460);c.fillStyle='#3a4050';c.fillRect(x-60,y,120,80);
    for(let r=0;r<3;r++)for(let k=0;k<5;k++){c.fillStyle='#fffbe6';c.beginPath();c.arc(x-46+k*23,y+16+r*24,9,0,7);c.fill()}});
  // 관중석
  for(let r=0;r<11;r++){const y=300+r*21;c.fillStyle=r%2?'#a8141f':'#1a1a1d';c.fillRect(0,y,CW,21);
    for(let x=6;x<CW;x+=14){if(rnd()<.85){const col=rnd()<.6?'#e8303a':rnd()<.5?'#111':'#fff';c.fillStyle=['#f1c9a5','#e8b98f','#d9a47c'][(rnd()*3)|0];c.beginPath();c.arc(x,y+6,4.2,0,7);c.fill();c.fillStyle=col;c.fillRect(x-5,y+10,10,9)}}}
  // 응원 깃발들
  for(let i=0;i<9;i++){const x=60+i*98+rnd()*20,y=300+rnd()*120;c.strokeStyle='#ddd';c.lineWidth=2;c.beginPath();c.moveTo(x,y+40);c.lineTo(x,y);c.stroke();c.fillStyle=i%2?'#e8303a':'#111';c.fillRect(x,y,28,18)}
  // 전광판
  c.fillStyle='#0b0b0d';c.fillRect(250,70,400,200);c.strokeStyle='#444';c.lineWidth=6;c.strokeRect(250,70,400,200);
  c.fillStyle='#ffb02e';c.font='34px "Black Han Sans",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('HOME  7 : 3  AWAY',450,118);
  c.fillStyle='#1d1d22';for(let i=0;i<9;i++){c.fillRect(272+i*40,150,32,36)}c.fillStyle='#ffd23f';c.font='22px "Black Han Sans",sans-serif';['0','1','0','2','0','3','0','1','-'].forEach((n,i)=>c.fillText(n,288+i*40,169));
  const bt=($('banner').value||'').trim()||'우리 팀 최고!';c.fillStyle='#e8303a';c.fillRect(270,200,360,54);c.fillStyle='#fff';let fs=38;c.font=`${fs}px "Black Han Sans",sans-serif`;while(c.measureText(bt).width>340&&fs>18){fs-=2;c.font=`${fs}px "Black Han Sans",sans-serif`}c.fillText(bt,450,229);
  // 외야 펜스
  c.fillStyle='#18452e';c.fillRect(0,531,CW,46);c.fillStyle='#ffd23f';c.fillRect(0,531,CW,5);
  const ads=['마음정비소','STRESS OUT!','홈런 한 방','힘내라 우리 팀'];c.font='24px "Black Han Sans",sans-serif';ads.forEach((a,i)=>{const x=i*CW/4;c.fillStyle=i%2?'#e8303a':'#111';c.fillRect(x+8,541,CW/4-16,30);c.fillStyle='#fff';c.fillText(a,x+CW/8,557)});
  // 잔디·내야
  for(let i=0;i<10;i++){c.fillStyle=i%2?'#2f8a3e':'#37994a';c.fillRect(0,577+i*64,CW,64)}
  c.fillStyle='#b9784a';c.beginPath();c.ellipse(450,1250,620,440,0,Math.PI,2*Math.PI);c.fill();c.fillStyle='#37994a';c.beginPath();c.ellipse(450,1250,440,300,0,Math.PI,2*Math.PI);c.fill();
  c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=6;c.beginPath();c.moveTo(-40,1200);c.lineTo(330,820);c.moveTo(940,1200);c.lineTo(570,820);c.stroke();
  const vg=c.createRadialGradient(450,700,300,450,700,900);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');c.fillStyle=vg;c.fillRect(0,0,CW,CH)}
drawBg();

/* ---------- player figure ---------- */
const JER={red:['#d8222e','#111'],black:['#17171b','#d8222e'],white:['#f4f4f2','#d8222e']};
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function limb(c,x,y,a1,a2,col,skin,l1=88,l2=80,w=30){const ex=x+Math.sin(a1)*l1,ey=y+Math.cos(a1)*l1,hx=ex+Math.sin(a2)*l2,hy=ey+Math.cos(a2)*l2;
  c.lineCap='round';c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.strokeStyle=skin;c.lineWidth=w*.72;c.beginPath();c.moveTo(ex,ey);c.lineTo(hx,hy);c.stroke();
  c.fillStyle=skin;c.beginPath();c.arc(hx,hy,w*.62,0,7);c.fill();return[hx,hy]}
const HEAD=-470,HR=66;
function headPos(x){return[x,GY+HEAD]}
function drawFace(c,x,y,f,tiger,catcher){
  if(f&&f.img){c.save();c.beginPath();c.arc(x,y,HR,0,7);c.clip();const im=f.img,sc=f.z*HR*2/Math.min(im.width,im.height);c.drawImage(im,x-im.width*sc/2+f.x,y-im.height*sc/2+f.y,im.width*sc,im.height*sc);c.restore();
    c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=5;c.beginPath();c.arc(x,y,HR,0,7);c.stroke();return}
  if(tiger){c.fillStyle='#f39a2b';[[-48,-52],[48,-52]].forEach(([dx,dy])=>{c.beginPath();c.arc(x+dx,y+dy,22,0,7);c.fill()});c.fillStyle='#ffe0c0';[[-48,-52],[48,-52]].forEach(([dx,dy])=>{c.beginPath();c.arc(x+dx,y+dy,11,0,7);c.fill()});
    c.fillStyle='#f39a2b';c.beginPath();c.arc(x,y,HR,0,7);c.fill();
    c.strokeStyle='#2a1a10';c.lineWidth=7;c.lineCap='round';[[-20,-60,-14,-38],[0,-64,0,-40],[20,-60,14,-38],[-64,-6,-40,-2],[64,-6,40,-2],[-62,14,-42,12],[62,14,42,12]].forEach(([a,b,d,e])=>{c.beginPath();c.moveTo(x+a,y+b);c.lineTo(x+d,y+e);c.stroke()});
    c.fillStyle='#fff6ea';c.beginPath();c.ellipse(x,y+26,38,28,0,0,7);c.fill();c.fillStyle='#2a1a10';c.beginPath();c.ellipse(x,y+12,10,7,0,0,7);c.fill();
    c.fillStyle='#fff';[[-24,-8],[24,-8]].forEach(([dx,dy])=>{c.beginPath();c.arc(x+dx,y+dy,11,0,7);c.fill()});c.fillStyle='#2a1a10';[[-24,-7],[24,-7]].forEach(([dx,dy])=>{c.beginPath();c.arc(x+dx,y+dy,6,0,7);c.fill()});
    c.strokeStyle='#2a1a10';c.lineWidth=4;c.beginPath();c.arc(x-8,y+28,8,0,Math.PI);c.arc(x+8,y+28,8,0,Math.PI);c.stroke();return}
  c.fillStyle='#f1c9a5';c.beginPath();c.arc(x,y,HR,0,7);c.fill();
  c.fillStyle='#2a1d17';[[-24,-4],[24,-4]].forEach(([dx,dy])=>{c.beginPath();c.ellipse(x+dx,y+dy,7,10,0,0,7);c.fill()});c.fillStyle='#fff';[[-22,-8],[26,-8]].forEach(([dx,dy])=>{c.beginPath();c.arc(x+dx,y+dy,3,0,7);c.fill()});
  c.fillStyle='rgba(255,130,140,.55)';[[-40,16],[40,16]].forEach(([dx,dy])=>{c.beginPath();c.ellipse(x+dx,y+dy,12,7,0,0,7);c.fill()});
  c.strokeStyle='#7a2b22';c.lineWidth=5;c.lineCap='round';c.beginPath();c.arc(x,y+14,20,.15*Math.PI,.85*Math.PI);c.stroke();
  if(catcher){c.strokeStyle='#333';c.lineWidth=6;[-30,-10,10,30].forEach(dx=>{c.beginPath();c.moveTo(x+dx,y-30);c.lineTo(x+dx*1.05,y+48);c.stroke()});[-14,12,38].forEach(dy=>{c.beginPath();c.moveTo(x-50,y+dy);c.lineTo(x+50,y+dy);c.stroke()})}}
function drawCap(c,x,y,col,dir,helmet){c.fillStyle=col;c.beginPath();c.arc(x,y-6,HR+4,Math.PI*1.04,Math.PI*1.96);c.closePath();c.fill();
  c.fillStyle=helmet?'#222':'#111';c.beginPath();c.ellipse(x+dir*38,y-22,58,13,dir*.08,0,7);c.fill();
  c.fillStyle='#fff';c.font='30px "Black Han Sans",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('★',x,y-46)}
function player(c,o){const x=o.x,dir=o.dir,[jc,tc]=JER[o.col]||JER.red,skin=o.tiger?'#f39a2b':'#f1c9a5',pants=o.col==='black'?'#2a2a30':'#eeeeec';
  c.fillStyle='rgba(0,0,0,.32)';c.beginPath();c.ellipse(x,GY+6,110,18,0,0,7);c.fill();
  // legs
  [-1,1].forEach(s=>{c.fillStyle=pants;rr(c,x+s*36-24,GY-240,48,190,18);c.fill();c.fillStyle=tc;c.fillRect(x+s*36+(s>0?16:-24),GY-236,8,180);
    c.fillStyle=tc;rr(c,x+s*36-22,GY-70,44,50,10);c.fill();c.fillStyle='#111';c.beginPath();c.ellipse(x+s*36+dir*12,GY-14,38,18,0,0,7);c.fill()});
  // outer arm (behind body)
  const sh=GY-385,outerX=x-dir*80,innerX=x+dir*80;
  const outer=o.outer||{a1:dir*-.25,a2:dir*-.05};const oh=limb(c,outerX,sh,outer.a1,outer.a2,jc,skin);
  // torso
  c.fillStyle=jc;rr(c,x-88,GY-410,176,190,40);c.fill();
  c.fillStyle=tc;c.beginPath();c.moveTo(x-30,GY-410);c.lineTo(x,GY-370);c.lineTo(x+30,GY-410);c.closePath();c.fill();
  c.fillStyle=o.col==='white'?'#ddd':'rgba(255,255,255,.12)';for(let i=0;i<4;i++){c.beginPath();c.arc(x,GY-352+i*30,4,0,7);c.fill()}
  c.fillStyle='#111';c.fillRect(x-88,GY-232,176,16);
  const txtc=o.col==='white'?'#d8222e':'#fff';c.fillStyle=txtc;c.textAlign='center';c.textBaseline='middle';
  if(o.name){let fs=34;c.font=`${fs}px "Black Han Sans",sans-serif`;while(c.measureText(o.name).width>150&&fs>16){fs-=2;c.font=`${fs}px "Black Han Sans",sans-serif`}c.fillText(o.name,x,GY-352)}
  if(o.num){c.font='64px "Black Han Sans",sans-serif';c.lineWidth=6;c.strokeStyle=tc;c.strokeText(o.num,x+dir*-42,GY-290);c.fillText(o.num,x+dir*-42,GY-290)}
  // neck + head
  c.fillStyle=skin;c.fillRect(x-20,GY-420,40,24);
  const [hx,hy]=headPos(x);drawFace(c,hx,hy,o.face,o.tiger,o.catcher&&!o.face?.img);
  if(!o.tiger)drawCap(c,hx,hy-(o.face&&o.face.img?30:0),o.col==='white'?'#d8222e':jc==='#17171b'?'#17171b':jc,dir,o.catcher);
  // props in outer hand
  return{innerX,sh,jc,skin,oh}}
function prop(c,kind,hand,dir){const [hx,hy]=hand;
  if(kind==='bat'){c.save();c.translate(hx,hy);c.rotate(dir*-2.5);c.fillStyle='#c98a4b';rr(c,-9,-10,18,230,9);c.fill();c.fillStyle='#a46a35';rr(c,-13,130,26,100,13);c.fill();c.fillStyle='#222';c.fillRect(-10,-14,20,14);c.restore()}
  if(kind==='glove'||kind==='mitt'){c.fillStyle='#8a5326';c.beginPath();c.ellipse(hx,hy,kind==='mitt'?46:40,kind==='mitt'?46:38,0,0,7);c.fill();c.strokeStyle='#5a3416';c.lineWidth=4;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(hx+i*12,hy-30);c.lineTo(hx+i*10,hy+10);c.stroke()}}
  if(kind==='ball'){c.fillStyle='#fff';c.beginPath();c.arc(hx,hy,20,0,7);c.fill();c.strokeStyle='#d8222e';c.lineWidth=3;c.beginPath();c.arc(hx-12,hy,14,-.8,.8);c.stroke();c.beginPath();c.arc(hx+12,hy,14,Math.PI-.8,Math.PI+.8);c.stroke()}
  if(kind==='mega'){c.save();c.translate(hx,hy);c.rotate(dir*-.9);c.fillStyle='#ffd23f';c.beginPath();c.moveTo(0,-14);c.lineTo(110,-46);c.lineTo(110,46);c.lineTo(0,14);c.closePath();c.fill();c.fillStyle='#e8303a';c.fillRect(-20,-14,24,28);c.restore()}
  if(kind==='pom'){c.fillStyle='#e8303a';for(let i=0;i<14;i++){const a=i/14*7;c.beginPath();c.arc(hx+Math.cos(a)*22,hy+Math.sin(a)*22,16,0,7);c.fill()}}}
function vsign(c,hand,skin){const [hx,hy]=hand;c.strokeStyle=skin;c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(hx,hy);c.lineTo(hx-14,hy-48);c.moveTo(hx,hy);c.lineTo(hx+12,hy-50);c.stroke()}

function compose(c,forShot){c.drawImage(bg,0,0);
  const meX=310,frX=600,pose=S.pose,kind=S.kind;
  // partner first (behind for hug)
  const fOuter={bat:{a1:-.15,a2:.55},pitch:{a1:-.5,a2:-1.4},catch:{a1:-.4,a2:-1.2},cheer:{a1:-2.6,a2:-2.9},tiger:{a1:-2.5,a2:-2.8},photo:{a1:.25,a2:.05}}[kind];
  const f=player(c,{x:frX,dir:-1,col:S.col,name:($('n2').value||'').trim(),num:($('u2').value||'').trim(),face:kind==='photo'?S.faces[1]:null,tiger:kind==='tiger',catcher:kind==='catch',outer:{a1:-fOuter.a1,a2:-fOuter.a2}});
  const fHand=f.oh;
  const propK={bat:'bat',pitch:'glove',catch:'mitt',cheer:'mega',tiger:'pom'}[kind];if(propK)prop(c,propK,fHand,-1);
  // partner inner arm
  let fin;if(pose==='hi5'){fin=limb(c,f.innerX,f.sh,-2.75,-3.0,f.jc,f.skin)}else if(pose==='fist'){fin=limb(c,f.innerX,f.sh,-2.9,-3.1,f.jc,f.skin)}else{fin=limb(c,f.innerX,f.sh,-.35,.35,f.jc,f.skin);if(kind==='pitch')prop(c,'ball',fin,-1)}
  if(pose==='v')vsign(c,limb(c,f.innerX,f.sh,-2.2,-2.75,f.jc,f.skin),f.skin);
  // me
  const m=player(c,{x:meX,dir:1,col:S.col,name:($('n1').value||'').trim()||'나',num:($('u1').value||'').trim(),face:S.faces[0],outer:{a1:pose==='fist'?2.5:.25,a2:pose==='fist'?3.0:.05}});
  if(pose==='v'){vsign(c,limb(c,m.innerX,m.sh,2.2,2.75,m.jc,m.skin),m.skin)}
  else if(pose==='hi5'){const h=limb(c,m.innerX,m.sh,2.7,2.95,m.jc,m.skin);c.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<6;i++){const a=i/6*7;c.fillRect((h[0]+fin[0])/2+Math.cos(a)*44-3,(h[1]+fin[1])/2+Math.sin(a)*44-3,6,6)}}
  else if(pose==='hug'){c.lineCap='round';c.strokeStyle=m.jc;c.lineWidth=30;c.beginPath();c.moveTo(m.innerX,m.sh);c.lineTo(frX-10,GY-405);c.stroke();c.strokeStyle=m.skin;c.lineWidth=22;c.beginPath();c.moveTo(frX-10,GY-405);c.lineTo(frX+70,GY-395);c.stroke();c.fillStyle=m.skin;c.beginPath();c.arc(frX+70,GY-395,18,0,7);c.fill()}
  else if(pose==='fist'){limb(c,m.innerX,m.sh,2.6,3.1,m.jc,m.skin)}
  // frame & date
  if(forShot){c.strokeStyle='#fff';c.lineWidth=18;c.strokeRect(9,9,CW-18,CH-18);
    const d=new Date();c.fillStyle='rgba(0,0,0,.55)';rr(c,26,CH-86,340,56,14);c.fill();c.fillStyle='#ffd23f';c.font='30px "Black Han Sans",sans-serif';c.textAlign='left';c.textBaseline='middle';
    c.fillText(`⚾ 야구장 포토존 · ${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`,42,CH-58)}
  // 비어 있는 얼굴 안내
  if(!forShot){[[meX,S.faces[0]],kind==='photo'?[frX,S.faces[1]]:null].forEach(e=>{if(!e||e[1].img)return;const [x,y]=headPos(e[0]);c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.arc(x,y,HR,0,7);c.fill();c.setLineDash([10,8]);c.strokeStyle='#fff';c.lineWidth=4;c.stroke();c.setLineDash([]);
    c.fillStyle='#fff';c.font='22px "Noto Sans KR",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('📷 탭해서',x,y-12);c.fillText('사진 넣기',x,y+16)})}}
let dirty=true;const redraw=()=>{dirty=true};
function loop(){if(!alive)return;if(dirty&&!S.shot){dirty=false;compose(ctx,false)}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(alive){drawBg();redraw()}});

/* ---------- photos ---------- */
function loadFace(file,i){if(!file||!/^image\//.test(file.type))return;const url=URL.createObjectURL(file);const im=new Image();im.onload=()=>{const f=S.faces[i];if(f.url)URL.revokeObjectURL(f.url);f.img=im;f.url=url;f.x=0;f.y=-HR*.1;f.z=1.3;$(i?'z2':'z1').value=1.3;if(!i)$('f1n').textContent='동그라미를 끌어서 얼굴 위치를 맞춰요';S.shot=false;$('save').disabled=true;redraw();Hp.buzz(15)};im.src=url}
$('f1').onchange=e=>loadFace(e.target.files[0],0);$('f2').onchange=e=>loadFace(e.target.files[0],1);
$('z1').oninput=e=>{S.faces[0].z=+e.target.value;S.shot=false;redraw()};$('z2').oninput=e=>{S.faces[1].z=+e.target.value;S.shot=false;redraw()};
['n1','u1','n2','u2'].forEach(k=>$(k).addEventListener('input',()=>{S.shot=false;$('save').disabled=true;saveOpt();redraw()}));
$('banner').addEventListener('input',()=>{S.shot=false;saveOpt();drawBg();redraw()});
root.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{S.kind=b.dataset.k;pressed('kinds','k',S.kind);$('p2row').hidden=S.kind!=='photo';S.shot=false;$('save').disabled=true;saveOpt();redraw()});
root.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{S.pose=b.dataset.p;pressed('poses','p',S.pose);S.shot=false;$('save').disabled=true;saveOpt();redraw()});
root.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.col=b.dataset.c;pressed('cols','c',S.col);S.shot=false;$('save').disabled=true;saveOpt();redraw()});
// 얼굴 끌기 / 탭해서 사진 넣기
const toC=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*CW/r.width,y:(e.clientY-r.top)*CH/r.height}};
let drag=null;
cv.addEventListener('pointerdown',e=>{const p=toC(e);const hits=[[0,310],[1,600]].filter(([i,x])=>(i===0||S.kind==='photo')&&Math.hypot(p.x-x,p.y-(GY+HEAD))<HR*1.25);
  if(!hits.length)return;const i=hits[0][0],f=S.faces[i];if(!f.img){$(i?'f2':'f1').click();return}
  e.preventDefault();cv.setPointerCapture(e.pointerId);drag={i,x:p.x,y:p.y,fx:f.x,fy:f.y,acc:{}};S.shot=false;$('save').disabled=true});
cv.addEventListener('pointermove',e=>{if(!drag)return;const p=toC(e),f=S.faces[drag.i];f.x=drag.fx+(p.x-drag.x);f.y=drag.fy+(p.y-drag.y);Hp.dragTick(drag.acc,e.movementX||0,e.movementY||0);redraw()});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{drag=null}));
cv.addEventListener('wheel',e=>{const p=toC(e);const i=Math.hypot(p.x-310,p.y-(GY+HEAD))<HR*1.3?0:(S.kind==='photo'&&Math.hypot(p.x-600,p.y-(GY+HEAD))<HR*1.3?1:-1);if(i<0||!S.faces[i].img)return;e.preventDefault();
  const f=S.faces[i];f.z=Math.max(.5,Math.min(4,f.z*Math.exp(-e.deltaY*.0015)));$(i?'z2':'z1').value=f.z;redraw()},{passive:false});

/* ---------- 찰칵 ---------- */
let busy=false;
$('shoot').onclick=()=>{if(busy)return;busy=true;Hp.ac();S.shot=false;compose(ctx,false);const cnt=$('count');let n=3;
  const tick=()=>{if(n>0){cnt.textContent=n;beep(n===1?880:660);n--;later(tick,800)}else{cnt.textContent='';shutter();const fl=$('flash');fl.style.transition='none';fl.style.opacity=1;
    requestAnimationFrame(()=>{fl.style.transition='opacity .6s';fl.style.opacity=0});compose(ctx,true);S.shot=true;$('save').disabled=false;later(cheer,250);busy=false}};tick()};
$('save').onclick=()=>{if(!S.shot)return;cv.toBlob(async b=>{if(!b)return;const d=new Date(),name=`야구장포토존_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${d.getHours()}${d.getMinutes()}.png`;
  const file=new File([b],name,{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})&&/Mobi|Android|iPhone|iPad/.test(navigator.userAgent)){try{await navigator.share({files:[file],title:'야구장 포토존'});return}catch(e){if(e&&e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)},'image/png')};

return()=>{alive=false;timers.forEach(clearTimeout);S.faces.forEach(f=>{if(f.url)URL.revokeObjectURL(f.url)})};
}});
