/* 3D 복도 — 1인칭으로 걸어 다니며 문을 열고 방에 들어가기 */
H.makeWorld=function(){
if(!window.THREE)return null;
const T=THREE;
let renderer;
try{const tc=document.createElement('canvas');if(!(tc.getContext('webgl2')||tc.getContext('webgl')))return null;
  renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(e){return null}
const $=id=>document.getElementById(id);
const host=$('w3'),worldEl=$('world'),fadeEl=$('wFade'),enterBtn=$('wEnter'),helpEl=$('wHelp');
host.appendChild(renderer.domElement);
renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none;cursor:grab';
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputEncoding=T.sRGBEncoding;
const DISP='"Black Han Sans","Noto Sans KR",sans-serif',BODY='"Noto Sans KR",sans-serif',EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const scene=new T.Scene();scene.background=new T.Color(0x100d0b);scene.fog=new T.Fog(0x100d0b,9,30);
const cam=new T.PerspectiveCamera(72,1,.05,260);cam.rotation.order='YXZ';
function resize(){const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?82:70;cam.updateProjectionMatrix()}
new ResizeObserver(resize).observe(host);

/* ---------- canvas textures (redrawn once web fonts arrive) ---------- */
const texs=[];
function ctex(w,h,draw,repeat){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat[0],repeat[1])}texs.push({x,w,h,draw,t});return t}
const redrawAll=()=>texs.forEach(o=>{o.x.clearRect(0,0,o.w,o.h);o.draw(o.x,o.w,o.h);o.t.needsUpdate=true});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(redrawAll);setTimeout(redrawAll,2500);
function grain(x,w,h,a){const im=x.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*a;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0)}
function fitText(x,txt,max,size,font){let s=size;x.font=`${s}px ${font}`;while(x.measureText(txt).width>max&&s>10){s-=2;x.font=`${s}px ${font}`}return s}
const shade=(hex,k)=>{const c=new T.Color(hex);c.multiplyScalar(k);return'#'+c.getHexString()};

/* ---------- building ---------- */
const FL=[
  {no:1,name:'터뜨리는 방',desc:'세게 치고, 깨고, 갈아 버려요',c:'#c4402f',wall:'#efe3d3',tile:['#d9cbb6','#c7b497']},
  {no:2,name:'쉬어가는 방',desc:'천천히, 손끝으로 가라앉혀요',c:'#3f9d8c',wall:'#e2ece6',tile:['#cbd8d0','#b2c5ba']},
  {no:3,name:'함께하는 방',desc:'나누고, 쉬고, 숨 고르기',c:'#d79a2b',wall:'#f2e8d3',tile:['#ddd0b3','#c9b892']}];
const POSTERS=[
  {title:'추천 코스',lines:['① 마음 날씨  3F','② 샌드백  1F','③ 숨 풍선  2F','④ 응원 벽  3F'],foot:'10분이면 충분해요'},
  {title:'숨 고르기',lines:['4초 들이쉬고','2초 멈추고','6초 내쉬기','다섯 번만 해 봐요'],foot:'202호 숨 풍선'},
  {title:'오늘 한 줄',lines:['힘든 마음은','쪽지로 붙이고','친구 쪽지에는','하트 하나'],foot:'302호 응원 벽'}];
const CW=4,CH=3,floors=[],doors=[];
const frameMat=new T.MeshStandardMaterial({color:0x3b2f27,roughness:.6});
const steel=new T.MeshStandardMaterial({color:0xa9aeb5,metalness:.75,roughness:.32});
const white=new T.MeshStandardMaterial({color:0xf5f0e8,roughness:.5});

function wallPiece(g,side,z,w,h,y,mat,depth=.012){const m=new T.Mesh(new T.PlaneGeometry(w,h),mat);m.position.set(side*(CW/2-depth),y,z);m.rotation.y=side<0?Math.PI/2:-Math.PI/2;g.add(m);return m}

FL.forEach((f,fi)=>{
  const g=new T.Group();g.visible=false;scene.add(g);
  const ids=H.order.filter(id=>H.rooms[id].floor===f.no);
  const z0=2,L=5+ids.length*2.6+2.5,z1=z0-L,mid=(z0+z1)/2;
  const ft=ctex(256,256,(x,w,h)=>{x.fillStyle=f.tile[0];x.fillRect(0,0,w,h);x.fillStyle=f.tile[1];x.fillRect(0,0,w/2,h/2);x.fillRect(w/2,h/2,w/2,h/2);grain(x,w,h,12);
    x.strokeStyle='rgba(0,0,0,.14)';x.lineWidth=3;x.strokeRect(0,0,w,h);x.beginPath();x.moveTo(w/2,0);x.lineTo(w/2,h);x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke()},[CW/1.2,L/1.2]);
  const floor=new T.Mesh(new T.PlaneGeometry(CW,L),new T.MeshStandardMaterial({map:ft,roughness:.45}));floor.rotation.x=-Math.PI/2;floor.position.set(0,0,mid);g.add(floor);
  // runner carpet
  const rug=new T.Mesh(new T.PlaneGeometry(1.3,L-1.2),new T.MeshStandardMaterial({color:new T.Color(shade(f.c,.8)),roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(0,.004,mid-.2);g.add(rug);
  const ceil=new T.Mesh(new T.PlaneGeometry(CW,L),new T.MeshStandardMaterial({color:0xf3efe8,roughness:.9}));ceil.rotation.x=Math.PI/2;ceil.position.set(0,CH,mid);g.add(ceil);
  const wt=ctex(256,256,(x,w,h)=>{x.fillStyle=f.wall;x.fillRect(0,0,w,h);grain(x,w,h,8)},[L/2,CH/2]);
  const wallMat=new T.MeshStandardMaterial({map:wt,roughness:.95});
  const wainMat=new T.MeshStandardMaterial({color:new T.Color(shade(f.c,.62)),roughness:.75});
  [-1,1].forEach(s=>{const w=new T.Mesh(new T.PlaneGeometry(L,CH),wallMat);w.position.set(s*CW/2,CH/2,mid);w.rotation.y=-s*Math.PI/2;g.add(w);
    const wa=new T.Mesh(new T.BoxGeometry(.04,.95,L),wainMat);wa.position.set(s*(CW/2-.02),.475,mid);g.add(wa);
    const rail=new T.Mesh(new T.BoxGeometry(.07,.05,L),white);rail.position.set(s*(CW/2-.035),.97,mid);g.add(rail);
    const base=new T.Mesh(new T.BoxGeometry(.05,.1,L),frameMat);base.position.set(s*(CW/2-.025),.05,mid);g.add(base)});
  // far wall mural
  const mural=ctex(1024,768,(x,w,h)=>{x.fillStyle=f.wall;x.fillRect(0,0,w,h);grain(x,w,h,8);x.fillStyle=f.c;x.fillRect(0,h*.66,w,h*.34);
    x.textAlign='center';x.fillStyle=f.c;x.font=`240px ${DISP}`;x.fillText(f.no+'F',w/2,h*.4);x.fillStyle='#2a2018';fitText(x,f.name,w*.8,96,DISP);x.fillText(f.name,w/2,h*.57);
    x.fillStyle='#fff';fitText(x,f.desc,w*.85,52,BODY);x.fillText(f.desc,w/2,h*.85)});
  const end=new T.Mesh(new T.PlaneGeometry(CW,CH),new T.MeshStandardMaterial({map:mural,roughness:.9}));end.position.set(0,CH/2,z1);g.add(end);
  // elevator wall
  const ew=new T.Mesh(new T.PlaneGeometry(CW,CH),new T.MeshStandardMaterial({color:new T.Color(f.wall),roughness:.95}));ew.position.set(0,CH/2,z0);ew.rotation.y=Math.PI;g.add(ew);
  const elevHits=[];
  const ef=new T.Mesh(new T.BoxGeometry(1.7,2.45,.08),steel);ef.position.set(0,1.225,z0-.04);g.add(ef);elevHits.push(ef);
  const doorMat=new T.MeshStandardMaterial({color:0xc6cbd2,metalness:.85,roughness:.25});
  [-1,1].forEach(s=>{const d=new T.Mesh(new T.BoxGeometry(.72,2.2,.04),doorMat);d.position.set(s*.37,1.1,z0-.1);g.add(d);elevHits.push(d)});
  const ind=ctex(256,96,(x,w,h)=>{x.fillStyle='#111';x.fillRect(0,0,w,h);x.fillStyle='#ff9b3d';x.font=`64px ${DISP}`;x.textAlign='center';x.fillText(f.no+'F',w/2,h*.72)});
  const im=new T.Mesh(new T.PlaneGeometry(.5,.19),new T.MeshBasicMaterial({map:ind}));im.position.set(0,2.6,z0-.02);im.rotation.y=Math.PI;g.add(im);
  const bt=ctex(128,256,(x,w,h)=>{x.fillStyle='#2b2f35';x.fillRect(0,0,w,h);['3','2','1'].forEach((n,i)=>{const y=50+i*72;x.fillStyle=(+n===f.no)?'#ffb347':'#d9dde3';x.beginPath();x.arc(w/2,y,26,0,7);x.fill();x.fillStyle='#222';x.font=`30px ${DISP}`;x.textAlign='center';x.fillText(n,w/2,y+11)})});
  const bp=new T.Mesh(new T.PlaneGeometry(.22,.44),new T.MeshStandardMaterial({map:bt,roughness:.4}));bp.position.set(-1.1,1.3,z0-.02);bp.rotation.y=Math.PI;g.add(bp);elevHits.push(bp);
  // ceiling lights
  for(let z=z0-1.5;z>z1+.5;z-=3){const p=new T.Mesh(new T.BoxGeometry(1.2,.04,.5),new T.MeshBasicMaterial({color:0xfff6e0}));p.position.set(0,CH-.02,z);g.add(p)}
  [.2,.5,.8].forEach(k=>{const l=new T.PointLight(0xffe7c4,.85,11,1.6);l.position.set(0,CH-.25,z0-L*k);g.add(l)});
  // doors
  ids.forEach((id,i)=>{const r=H.rooms[id],side=i%2?1:-1,z=z0-4.2-i*2.6,no=`${f.no}0${i+1}호`;
    const dg=new T.Group();dg.position.set(side*(CW/2),0,z);dg.rotation.y=side<0?Math.PI/2:-Math.PI/2;g.add(dg);
    const col=new T.Color(r.color);
    const inside=ctex(256,500,(x,w,h)=>{x.fillStyle=shade(r.color,.35);x.fillRect(0,0,w,h);
      x.fillStyle=shade(r.color,.55);x.beginPath();x.moveTo(0,h);x.lineTo(w*.2,h*.66);x.lineTo(w*.8,h*.66);x.lineTo(w,h);x.closePath();x.fill();
      const gr=x.createRadialGradient(w/2,h*.45,10,w/2,h*.5,h*.6);gr.addColorStop(0,'rgba(255,240,215,.95)');gr.addColorStop(.35,r.color);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);
      x.globalAlpha=.85;x.font=`110px ${EMO}`;x.textAlign='center';x.fillText(r.icon,w/2,h*.5);x.globalAlpha=1});
    const glow=new T.Mesh(new T.PlaneGeometry(1.1,2.15),new T.MeshBasicMaterial({map:inside}));glow.position.set(0,1.075,.014);dg.add(glow);
    [[-.6,1.13,.1,2.3],[.6,1.13,.1,2.3],[0,2.24,1.3,.1]].forEach(([x,y,w,h])=>{const b=new T.Mesh(new T.BoxGeometry(w,h,.12),frameMat);b.position.set(x,y,.04);dg.add(b)});
    const face=ctex(512,1000,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,shade(r.color,1));gr.addColorStop(1,shade(r.color,.62));x.fillStyle=gr;x.fillRect(0,0,w,h);
      x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=8;x.strokeRect(40,60,w-80,h*.42);x.strokeRect(40,h*.52,w-80,h*.4);
      x.fillStyle='rgba(0,0,0,.35)';x.fillRect(w/2-90,90,180,54);x.fillStyle='#fff';x.font=`36px ${DISP}`;x.textAlign='center';x.fillText(no,w/2,130);
      x.font=`190px ${EMO}`;x.fillText(r.icon,w/2,400);
      x.fillStyle='#fff8ec';fitText(x,r.title,w-90,84,DISP);x.fillText(r.title,w/2,620);x.fillStyle='rgba(255,248,236,.85)';fitText(x,r.blurb,w-90,36,BODY);x.fillText(r.blurb,w/2,690)});
    const sideM=new T.MeshStandardMaterial({color:new T.Color(shade(r.color,.5)),roughness:.6});
    const pivot=new T.Group();pivot.position.set(-.55,0,.045);dg.add(pivot);
    const panel=new T.Mesh(new T.BoxGeometry(1.1,2.15,.06),[sideM,sideM,sideM,sideM,new T.MeshStandardMaterial({map:face,roughness:.55}),sideM]);panel.position.set(.55,1.075,0);pivot.add(panel);
    const knob=new T.Mesh(new T.SphereGeometry(.05,16,12),new T.MeshStandardMaterial({color:0xe8b23a,metalness:.8,roughness:.3}));knob.position.set(1.0,1.0,.07);pivot.add(knob);
    const lamp=new T.Mesh(new T.BoxGeometry(.5,.07,.08),new T.MeshBasicMaterial({color:col}));lamp.position.set(0,2.42,.06);dg.add(lamp);
    const pl=ctex(512,256,(x,w,h)=>{x.fillStyle='#2a2320';x.fillRect(0,0,w,h);x.fillStyle=r.color;x.fillRect(0,0,16,h);x.fillStyle='#fff';x.font=`54px ${DISP}`;x.textAlign='left';x.fillText(no,44,96);
      x.fillStyle='#f1e7d6';fitText(x,r.title,w-70,66,DISP);x.fillText(r.title,44,190)});
    const pm=new T.Mesh(new T.PlaneGeometry(.5,.25),new T.MeshStandardMaterial({map:pl,roughness:.6}));pm.position.set(.95,1.55,.02);dg.add(pm);
    doors.push({id,r,floor:fi,pivot,open:0,target:0,front:{x:side*.7,z},look:{x:side*2,z},hits:[panel,pm,glow]})});
  // posters (left = floor poster, right = how-to)
  const P=POSTERS[fi];
  const pt=ctex(560,760,(x,w,h)=>{x.fillStyle='#fffaf0';x.fillRect(0,0,w,h);x.fillStyle=f.c;x.fillRect(0,0,w,130);x.fillStyle='#fff';x.font=`70px ${DISP}`;x.textAlign='center';x.fillText(P.title,w/2,92);
    x.fillStyle='#2a2018';x.font=`46px ${BODY}`;P.lines.forEach((l,i)=>x.fillText(l,w/2,230+i*100));x.fillStyle=f.c;x.font=`36px ${DISP}`;x.fillText(P.foot,w/2,h-50)});
  wallPiece(g,-1,z0-1.5,.95,1.3,1.75,new T.MeshStandardMaterial({map:pt,roughness:.8}),.02);
  const ht=ctex(560,760,(x,w,h)=>{x.fillStyle='#232a33';x.fillRect(0,0,w,h);x.fillStyle='#e8b23a';x.font=`62px ${DISP}`;x.textAlign='center';x.fillText('이렇게 다녀요',w/2,100);
    x.fillStyle='#e9eef3';x.font=`40px ${BODY}`;['왼쪽 조이스틱으로 걷기','화면을 끌어서 둘러보기','문을 탭하면 걸어가서 열기','엘리베이터로 층 이동'].forEach((l,i)=>x.fillText(l,w/2,230+i*110));
    x.fillStyle='rgba(233,238,243,.6)';x.font=`30px ${BODY}`;x.fillText('PC: WASD · Space 점프 · Shift 달리기',w/2,h-50)});
  wallPiece(g,1,z0-1.5,.95,1.3,1.75,new T.MeshStandardMaterial({map:ht,roughness:.8}),.02);
  // plant + bench at the far end
  const pot=new T.Mesh(new T.CylinderGeometry(.22,.17,.45,20),new T.MeshStandardMaterial({color:0xd9cfc2,roughness:.7}));pot.position.set(-1.45,.225,z1+.5);g.add(pot);
  const leafM=new T.MeshStandardMaterial({color:0x3f7d4a,roughness:.8});[[0,.75,0,.32],[.12,.95,.05,.22],[-.12,.9,-.05,.24],[0,1.12,0,.18]].forEach(([x,y,z,r])=>{const s=new T.Mesh(new T.SphereGeometry(r,14,10),leafM);s.position.set(-1.45+x,y,z1+.5+z);g.add(s)});
  const bench=new T.Mesh(new T.BoxGeometry(.45,.08,1.4),new T.MeshStandardMaterial({color:0xa0703f,roughness:.6}));bench.position.set(1.65,.45,z1+1.2);g.add(bench);
  [-.55,.55].forEach(o=>{const leg=new T.Mesh(new T.BoxGeometry(.4,.45,.06),frameMat);leg.position.set(1.65,.225,z1+1.2+o);g.add(leg)});
  floors.push({g,z0,z1,elevHits,walk:[floor,rug],name:f.name,no:f.no+'F',xb:CW/2-.35,zMin:z1+.5,zMax:z0-.55});
});
/* ---------- outside: 석조 본관, 잔디 운동장, 생태 정원 ---------- */
const OUT=3;const ANIMS=[];
const FZ=-2;
function groundY(x,z){ // 현관 단과 돌계단 높이
  if(Math.abs(x)<3.6&&z>FZ-.2&&z<FZ+3.0)return .72;
  if(Math.abs(x)<4.6&&z>=FZ+3.0&&z<FZ+5.0)return .72-.18*(1+Math.floor((z-(FZ+3.0))/.5));
  return 0}
(()=>{const g=new T.Group();g.visible=false;scene.add(g);
  const M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:o.r??.85,metalness:o.m??0,...(o.map?{map:o.map}:{}),...(o.t?{transparent:true,opacity:o.t}:{})});
  const box=(w,h,d,mat,x,y,z,parent=g)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m};
  /* ----- textures ----- */
  function stoneDraw(x,w,h,bh,tone){const base=tone||[205,190,160];x.fillStyle='#8f8470';x.fillRect(0,0,w,h);
    for(let y=0,r=0;y<h;y+=bh,r++){let xx=-(r%2)*bh*.9;while(xx<w){const bw=bh*(1.3+Math.random()*1.4);const j=(Math.random()-.5)*34,g2=(Math.random()-.5)*14;
      x.fillStyle=`rgb(${base[0]+j+g2|0},${base[1]+j|0},${base[2]+j-g2|0})`;x.fillRect(xx+1.5,y+1.5,bw-3,bh-3);xx+=bw}}grain(x,w,h,16)}
  const stoneT=(rx,ry,tone)=>ctex(256,256,(x,w,h)=>stoneDraw(x,w,h,32,tone),[rx,ry]);
  const PPM=72; // pixels per meter on facades
  function windowDraw(x,wx,wy,ww,wh){x.fillStyle='#4a3e32';x.fillRect(wx-6,wy-6,ww+12,wh+12);
    const gl=x.createLinearGradient(wx,wy,wx+ww,wy+wh);gl.addColorStop(0,'#9ab7bd');gl.addColorStop(.5,'#5d7880');gl.addColorStop(1,'#3d5359');x.fillStyle=gl;x.fillRect(wx,wy,ww,wh);
    x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.moveTo(wx+8,wy+wh-8);x.lineTo(wx+ww*.45,wy+8);x.lineTo(wx+ww*.6,wy+8);x.lineTo(wx+ww*.2,wy+wh-8);x.fill();
    x.strokeStyle='#e9e4da';x.lineWidth=4;for(let i=1;i<3;i++){x.beginPath();x.moveTo(wx+ww*i/3,wy);x.lineTo(wx+ww*i/3,wy+wh);x.stroke()}x.beginPath();x.moveTo(wx,wy+wh*.32);x.lineTo(wx+ww,wy+wh*.32);x.stroke();
    x.fillStyle='#b3a688';x.fillRect(wx-10,wy+wh+6,ww+20,10)}
  const WW=26,WH=8.5,WD=10;
  const wingT=ctex(Math.round(WW*PPM),Math.round(WH*PPM),(x,w,h)=>{stoneDraw(x,w,h,24);
    x.fillStyle='rgba(60,50,35,.25)';x.fillRect(0,h-.8*PPM,w,.8*PPM); // plinth
    for(let px=0;px<=WW;px+=2.6){const X=px*PPM;const pg=x.createLinearGradient(X-18,0,X+18,0);pg.addColorStop(0,'rgba(0,0,0,.18)');pg.addColorStop(.5,'rgba(255,245,225,.18)');pg.addColorStop(1,'rgba(0,0,0,.12)');x.fillStyle=pg;x.fillRect(X-18,0,36,h)}
    for(let px=1.3;px<WW;px+=2.6){if(Math.abs(px-WW/2)<4.2)continue;const X=(px-.7)*PPM,ww=1.4*PPM;
      windowDraw(x,X,h-3.7*PPM,ww,2.3*PPM);windowDraw(x,X,h-7.5*PPM,ww,2.4*PPM)}
    x.fillStyle='#d9ccb0';x.fillRect(0,0,w,.35*PPM);x.fillStyle='rgba(0,0,0,.2)';x.fillRect(0,.35*PPM,w,6)});
  const wingSide=stoneT(WD/2,WH/2),wingMat=new T.MeshStandardMaterial({map:wingSide,roughness:.9});
  const wing=new T.Mesh(new T.BoxGeometry(WW,WH,WD),[wingMat,wingMat,M(0x5a5048),wingMat,new T.MeshStandardMaterial({map:wingT,roughness:.9}),wingMat]);wing.position.set(0,WH/2,FZ-WD/2);g.add(wing);
  box(WW+.6,.45,WD+.6,M(0xd6c9ad),0,WH+.2,FZ-WD/2); // cornice
  // central pavilion
  const PW=7.6,PH=9.6,PD=WD+1.2,PF=FZ+.6;
  const pavT=ctex(Math.round(PW*PPM),Math.round(PH*PPM),(x,w,h)=>{stoneDraw(x,w,h,26,[214,200,170]);
    for(let i=0;i<4;i++){const X=(.75+i*1.6)*PPM;windowDraw(x,X,h-7.3*PPM,1.1*PPM,1.5*PPM)}
    x.fillStyle='rgba(60,50,35,.25)';x.fillRect(0,h-.8*PPM,w,.8*PPM)});
  const pavSide=new T.MeshStandardMaterial({map:stoneT(PD/2,PH/2,[214,200,170]),roughness:.9});
  const pav=new T.Mesh(new T.BoxGeometry(PW,PH,PD),[pavSide,pavSide,M(0x5a5048),pavSide,new T.MeshStandardMaterial({map:pavT,roughness:.9}),pavSide]);pav.position.set(0,PH/2,PF-PD/2);g.add(pav);
  // gable (pediment) with round window
  const sh=new T.Shape();sh.moveTo(-PW/2-.35,0);sh.lineTo(PW/2+.35,0);sh.lineTo(0,2.5);sh.lineTo(-PW/2-.35,0);
  const gab=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:PD,bevelEnabled:false}),new T.MeshStandardMaterial({map:stoneT(.6,.3,[214,200,170]),roughness:.9}));gab.position.set(0,PH,PF-PD);g.add(gab);
  const trimM=M(0xe3d8c0);
  const t1=box(Math.hypot(PW/2+.35,2.5)+.2,.22,.3,trimM,-(PW/2+.35)/2,PH+1.25,PF+.08);t1.rotation.z=Math.atan2(2.5,PW/2+.35);
  const t2=box(Math.hypot(PW/2+.35,2.5)+.2,.22,.3,trimM,(PW/2+.35)/2,PH+1.25,PF+.08);t2.rotation.z=-Math.atan2(2.5,PW/2+.35);
  box(PW+.9,.3,.5,trimM,0,PH+.05,PF+.05);
  const ring=new T.Mesh(new T.TorusGeometry(.52,.11,10,30),trimM);ring.position.set(0,PH+1.0,PF+.06);g.add(ring);
  const rw=new T.Mesh(new T.CircleGeometry(.48,30),M(0x7fa3ab,{r:.2,m:.4}));rw.position.set(0,PH+1.0,PF+.03);g.add(rw);
  // roofs behind
  box(WW-.2,.2,WD-.4,M(0x6b625a),0,WH+.45,FZ-WD/2);
  /* ----- porch, steps, columns, canopy ----- */
  const stepM=new T.MeshStandardMaterial({map:stoneT(4,1,[150,150,148]),roughness:.8});
  box(7.2,.72,3.2,stepM,0,.36,FZ+1.4);
  for(let i=0;i<4;i++){const z0=FZ+3.0+i*.5;box(9.2-i*.0,.72-.18*(i+1)+.0001,.5,stepM,0,(.72-.18*(i+1))/2,z0+.25)}
  const colM=new T.MeshStandardMaterial({map:stoneT(1.2,2,[200,195,180]),roughness:.85});
  [-1.95,1.95].forEach(x=>{const c=new T.Mesh(new T.CylinderGeometry(.42,.46,3.1,24),colM);c.position.set(x,.72+1.55+.12,FZ+2.55);g.add(c);
    box(1.05,.24,1.05,M(0xd9d0bd),x,.72+.12,FZ+2.55);box(1.05,.24,1.05,M(0xd9d0bd),x,.72+3.1+.24,FZ+2.55)});
  const canopyY=.72+3.5;
  box(PW+.6,.35,3.1,M(0xe8e2d4),0,canopyY+.17,FZ+1.95);
  const signT=ctex(1024,96,(x,w,h)=>{x.fillStyle='#5a3a24';x.fillRect(0,0,w,h);x.fillStyle='#e8c46a';x.textAlign='center';x.textBaseline='middle';fitText(x,'스트레스 마음정비소',w*.9,62,DISP);x.fillText('스트레스 마음정비소',w/2,h*.56)});
  const fascia=new T.Mesh(new T.PlaneGeometry(PW+.6,.36),new T.MeshBasicMaterial({map:signT}));fascia.position.set(0,canopyY+.17,FZ+3.51);g.add(fascia);
  const reliefT=ctex(1024,160,(x,w,h)=>{stoneDraw(x,w,h,40,[206,196,175]);for(let i=0;i<5;i++){const cx=w*(i+.5)/5,cy=h/2,pw=w/5-36;x.fillStyle='rgba(0,0,0,.25)';x.fillRect(cx-pw/2,22,pw,h-44);x.fillStyle='#d8cdb4';x.fillRect(cx-pw/2+4,26,pw-8,h-52);
      x.strokeStyle='rgba(90,75,55,.6)';x.lineWidth=5;for(let k=0;k<6;k++){const a=k*Math.PI/3;x.beginPath();x.ellipse(cx+Math.cos(a)*18,cy+Math.sin(a)*14,18,9,a,0,7);x.stroke()}x.beginPath();x.arc(cx,cy,9,0,7);x.stroke()}});
  const par=new T.Mesh(new T.BoxGeometry(PW+.6,.95,.28),[M(0xd8cdb4),M(0xd8cdb4),M(0xd8cdb4),M(0xd8cdb4),new T.MeshStandardMaterial({map:reliefT,roughness:.9}),M(0xd8cdb4)]);par.position.set(0,canopyY+.35+.47,FZ+3.36);g.add(par);
  [-1,1].forEach(s=>box(.28,.95,3.0,M(0xd8cdb4),s*(PW/2+.16),canopyY+.82,FZ+1.95));
  /* ----- arched wooden doors ----- */
  const archT=ctex(256,320,(x,w,h)=>{stoneDraw(x,w,h,22,[214,200,170]);x.fillStyle='#2b2018';x.beginPath();x.moveTo(40,h);x.lineTo(40,h*.42);x.arc(w/2,h*.42,w/2-40,Math.PI,0);x.lineTo(w-40,h);x.fill();
    x.strokeStyle='#cbb894';x.lineWidth=14;x.beginPath();x.arc(w/2,h*.42,w/2-33,Math.PI,0);x.stroke()});
  const arch=new T.Mesh(new T.PlaneGeometry(2.9,3.6),new T.MeshStandardMaterial({map:archT,roughness:.9}));arch.position.set(0,.72+1.8,PF+.02);g.add(arch);
  const inside=ctex(128,128,(x,w,h)=>{const gr=x.createRadialGradient(w/2,h/2,5,w/2,h/2,w*.7);gr.addColorStop(0,'#fff1d6');gr.addColorStop(1,'#a85a3a');x.fillStyle=gr;x.fillRect(0,0,w,h)});
  const back=new T.Mesh(new T.PlaneGeometry(2.1,2.55),new T.MeshBasicMaterial({map:inside}));back.position.set(0,.72+1.28,PF+.025);g.add(back);
  const woodT=ctex(128,256,(x,w,h)=>{x.fillStyle='#8a4f2c';x.fillRect(0,0,w,h);x.strokeStyle='rgba(40,20,10,.35)';x.lineWidth=3;for(let i=0;i<10;i++){x.beginPath();x.moveTo(0,i*26);x.lineTo(w,i*26+6);x.stroke()}
    x.strokeStyle='#5c321b';x.lineWidth=10;x.strokeRect(12,14,w-24,h*.42);x.strokeRect(12,h*.52,w-24,h*.42);grain(x,w,h,12)});
  const doorM=new T.MeshStandardMaterial({map:woodT,roughness:.6});
  const pivL=new T.Group(),pivR=new T.Group();pivL.position.set(-1.04,.72,PF+.06);pivR.position.set(1.04,.72,PF+.06);g.add(pivL,pivR);
  const L=new T.Mesh(new T.BoxGeometry(1.03,2.55,.08),doorM),R=new T.Mesh(new T.BoxGeometry(1.03,2.55,.08),doorM);L.position.set(.515,1.275,0);R.position.set(-.515,1.275,0);pivL.add(L);pivR.add(R);
  [L,R].forEach((p,i)=>{const k=new T.Mesh(new T.SphereGeometry(.05,10,8),M(0xd9b45a,{m:.8,r:.3}));k.position.set(i?.4:-.4,0,.06);p.add(k)});
  const fanT=ctex(256,128,(x,w,h)=>{x.fillStyle='#cfe3ea';x.fillRect(0,0,w,h);x.strokeStyle='#f2efe6';x.lineWidth=6;for(let i=0;i<=8;i++){const a=Math.PI+i*Math.PI/8;x.beginPath();x.moveTo(w/2,h);x.lineTo(w/2+Math.cos(a)*w,h+Math.sin(a)*w);x.stroke()}
    x.beginPath();x.arc(w/2,h,h*.45,Math.PI,0);x.stroke()});
  const fan=new T.Mesh(new T.CircleGeometry(1.04,24,0,Math.PI),new T.MeshBasicMaterial({map:fanT}));fan.position.set(0,.72+2.58,PF+.04);g.add(fan);
  /* ----- flag & mast ----- */
  const white=M(0xf4f4f2,{r:.5});const mastX=-7.2,mastZ=FZ+5.5,mastH=11;
  [[0,0],[.35,0],[.17,.3]].forEach(([dx,dz])=>{const c=new T.Mesh(new T.CylinderGeometry(.04,.06,mastH,6),white);c.position.set(mastX+dx,mastH/2,mastZ+dz);g.add(c)});
  for(let y=.6;y<mastH-1;y+=.7){const r=new T.Mesh(new T.TorusGeometry(.2,.02,4,3),white);r.rotation.x=Math.PI/2;r.position.set(mastX+.17,y,mastZ+.1);g.add(r)}
  const pole=new T.Mesh(new T.CylinderGeometry(.03,.03,2.4,8),white);pole.position.set(mastX+.17,mastH+1.1,mastZ+.1);g.add(pole);
  const flagT=ctex(360,240,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.save();x.translate(w/2,h/2);x.rotate(Math.atan2(2,3));const R=h/4;
    x.fillStyle='#0047a0';x.beginPath();x.arc(0,0,R,0,7);x.fill();x.fillStyle='#cd2e3a';x.beginPath();x.arc(0,0,R,Math.PI,0);x.fill();
    x.beginPath();x.arc(-R/2,0,R/2,0,7);x.fill();x.fillStyle='#0047a0';x.beginPath();x.arc(R/2,0,R/2,0,7);x.fill();x.restore();
    const tri=(cx,cy,ang,pat)=>{x.save();x.translate(cx,cy);x.rotate(ang);x.fillStyle='#000';const bw=h/12*1.5,bh=h/24,gap=bh*.5;pat.forEach((b,i)=>{const y=(i-1)*(bh+gap)-bh/2;if(b)x.fillRect(-bw/2,y,bw,bh);else{x.fillRect(-bw/2,y,bw*.45,bh);x.fillRect(bw*.05,y,bw*.45,bh)}});x.restore()};
    const d=h*.42,a=Math.atan2(2,3);tri(w/2-Math.cos(a)*d,h/2-Math.sin(a)*d,a+Math.PI/2,[1,1,1]);tri(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,a+Math.PI/2,[0,0,0]);
    tri(w/2+Math.cos(a)*d,h/2-Math.sin(a)*d,-a+Math.PI/2,[0,1,0]);tri(w/2-Math.cos(a)*d,h/2+Math.sin(a)*d,-a+Math.PI/2,[1,0,1])});
  const fgeo=new T.PlaneGeometry(1.8,1.2,14,6),fpos=fgeo.attributes.position,fx0=Float32Array.from(fpos.array);
  const flag=new T.Mesh(fgeo,new T.MeshStandardMaterial({map:flagT,side:T.DoubleSide,roughness:.8}));flag.position.set(mastX+.17+.92,mastH+1.6,mastZ+.1);g.add(flag);
  ANIMS.push((dt,t)=>{for(let i=0;i<fpos.count;i++){const x=fx0[i*3]+.9;fpos.array[i*3+2]=Math.sin(x*3.2-t*4)*.12*x}fpos.needsUpdate=true});
  /* ----- ground, path, hedges, palm ----- */
  const grass=ctex(256,256,(x,w,h)=>{x.fillStyle='#78a854';x.fillRect(0,0,w,h);for(let i=0;i<2200;i++){x.fillStyle=Math.random()<.5?'#6a9a49':'#8bbd64';x.fillRect(Math.random()*w,Math.random()*h,2,4)}},[50,50]);
  const ground=new T.Mesh(new T.PlaneGeometry(260,260),new T.MeshStandardMaterial({map:grass,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.z=0;g.add(ground);
  const paveT=ctex(256,256,(x,w,h)=>{x.fillStyle='#cfc8ba';x.fillRect(0,0,w,h);x.strokeStyle='#ada594';x.lineWidth=4;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,h);x.moveTo(0,i*64);x.lineTo(w,i*64);x.stroke()}grain(x,w,h,14)},[6,1.5]);
  const plaza=new T.Mesh(new T.PlaneGeometry(24,6),new T.MeshStandardMaterial({map:paveT,roughness:.9}));plaza.rotation.x=-Math.PI/2;plaza.position.set(0,.012,FZ+8);g.add(plaza);
  const pathT=ctex(256,256,(x,w,h)=>{x.fillStyle='#d6cfc1';x.fillRect(0,0,w,h);x.strokeStyle='#b4ab99';x.lineWidth=4;for(let r=0;r<4;r++){x.beginPath();x.moveTo(0,r*64);x.lineTo(w,r*64);x.stroke();for(let c=0;c<3;c++){const xx=c*96+(r%2?48:0);x.beginPath();x.moveTo(xx,r*64);x.lineTo(xx,r*64+64);x.stroke()}}grain(x,w,h,14)},[1,6]);
  const path=new T.Mesh(new T.PlaneGeometry(3.4,22),new T.MeshStandardMaterial({map:pathT,roughness:.9}));path.rotation.x=-Math.PI/2;path.position.set(0,.01,FZ+21);g.add(path);
  const hedgeM=M(0x3f7a3a);[-1,1].forEach(s=>{box(7.5,1,1.1,hedgeM,s*8.6,.5,FZ+.9);for(let i=0;i<10;i++){const b=new T.Mesh(new T.SphereGeometry(.5,8,6),hedgeM);b.position.set(s*(5.2+i*.75),.95,FZ+.9);g.add(b)}});
  const palm=new T.Group();palm.position.set(4.9,0,FZ+3.6);g.add(palm);
  for(let i=0;i<8;i++){const s=new T.Mesh(new T.CylinderGeometry(.16-i*.008,.2-i*.008,.42,8),M(0x7b5a3c));s.position.y=.21+i*.4;s.rotation.z=Math.sin(i)*.04;palm.add(s)}
  for(let i=0;i<9;i++){const f=new T.Mesh(new T.ConeGeometry(.22,2.2,4),M(0x3e7d3a));f.position.y=3.3;f.rotation.z=1.15;f.rotation.y=i*Math.PI*2/9;f.translateY(1.0);palm.add(f)}
  /* ----- backdrop: hills, modern buildings, sky ----- */
  const sky=ctex(64,512,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3f86d6');gr.addColorStop(.45,'#9ccbee');gr.addColorStop(.5,'#e9f3f8');gr.addColorStop(1,'#cfe3c4');x.fillStyle=gr;x.fillRect(0,0,w,h)});
  g.add(new T.Mesh(new T.SphereGeometry(170,32,16),new T.MeshBasicMaterial({map:sky,side:T.BackSide,fog:false})));
  const cloudM=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92,fog:false});
  [[-60,55,-110],[30,62,-120],[90,48,-70],[-110,50,-40],[10,70,-140],[-30,60,-90]].forEach(([x,y,z])=>{const c=new T.Group();
    [[0,0,7],[6,-1,5],[-6,-1.4,5],[2.5,2.6,4.6]].forEach(([a,b,r])=>{const s=new T.Mesh(new T.SphereGeometry(r,12,8),cloudM);s.position.set(a,b,0);s.scale.y=.55;c.add(s)});c.position.set(x,y,z);c.lookAt(0,y,0);g.add(c)});
  const hillM=[M(0x5d8f4a),M(0x4f7f3f),M(0x6a9a52)];
  [[-70,-95,40],[-20,-110,48],[40,-100,44],[95,-85,38],[-120,-70,36],[140,-60,34]].forEach(([x,z,r],i)=>{const h=new T.Mesh(new T.SphereGeometry(r,24,12),hillM[i%3]);h.scale.y=.42;h.position.set(x,-2,z);g.add(h)});
  const modernT=ctex(256,256,(x,w,h)=>{x.fillStyle='#e8eaea';x.fillRect(0,0,w,h);for(let r=0;r<10;r++)for(let c=0;c<6;c++){x.fillStyle=(r+c)%3?'#7d97a3':'#9fb6bf';x.fillRect(8+c*41,10+r*24,30,14)}},[1,1]);
  const glassT=ctex(128,256,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#86a6b3');gr.addColorStop(1,'#b8ced6');x.fillStyle=gr;x.fillRect(0,0,w,h);x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;for(let y=0;y<h;y+=16){x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}});
  const tower=new T.Mesh(new T.BoxGeometry(5,16,5),new T.MeshStandardMaterial({map:glassT,roughness:.3,metalness:.3}));tower.position.set(7,8,-26);g.add(tower);
  const wide=new T.Mesh(new T.BoxGeometry(30,10,6),new T.MeshStandardMaterial({map:modernT,roughness:.8}));wide.position.set(-6,5,-34);g.add(wide);
  box(16,7,6,new T.MeshStandardMaterial({map:modernT,roughness:.8}),20,3.5,-24);
  /* ----- trees ----- */
  const trunkM=M(0x6e4b31),leafM=[M(0x5d9a45),M(0x74ad55),M(0x4c8a3d)];
  const tree=(x,z,s=1)=>{const t=new T.Mesh(new T.CylinderGeometry(.16*s,.24*s,2.4*s,8),trunkM);t.position.set(x,1.2*s,z);g.add(t);
    [[0,3,0,1.5],[.7,2.6,.3,1.1],[-.6,2.7,-.3,1.2],[0,3.8,0,1]].forEach(([a,b,c,r],k)=>{const m=new T.Mesh(new T.SphereGeometry(r*s,10,8),leafM[(k+Math.abs(x|0))%3]);m.position.set(x+a*s,b*s,z+c*s);g.add(m)})};
  [[-15,-4],[-28,-3],[15,-5],[-9,33],[10,34],[-36,8],[-34,20],[49,2],[49,22],[-15,30]].forEach(([x,z])=>tree(x,z,1.2));
  /* ----- soccer field (오른쪽) ----- */
  const FX=23,FZc=12,FWd=20,FLn=28;
  const fieldT=ctex(512,720,(x,w,h)=>{for(let i=0;i<12;i++){x.fillStyle=i%2?'#6aa548':'#77b253';x.fillRect(0,i*h/12,w,h/12)}grain(x,w,h,8);
    x.strokeStyle='#fff';x.lineWidth=6;x.strokeRect(14,14,w-28,h-28);x.beginPath();x.moveTo(14,h/2);x.lineTo(w-14,h/2);x.stroke();x.beginPath();x.arc(w/2,h/2,62,0,7);x.stroke();
    x.strokeRect(w*.25,14,w*.5,h*.14);x.strokeRect(w*.25,h-14-h*.14,w*.5,h*.14);x.strokeRect(w*.38,14,w*.24,h*.05);x.strokeRect(w*.38,h-14-h*.05,w*.24,h*.05)});
  const field=new T.Mesh(new T.PlaneGeometry(FWd,FLn),new T.MeshStandardMaterial({map:fieldT,roughness:1}));field.rotation.x=-Math.PI/2;field.position.set(FX,.015,FZc);g.add(field);
  [-1,1].forEach(s=>{const gz=FZc+s*(FLn/2-.4),gw=4;[[-gw/2,0],[gw/2,0]].forEach(([dx])=>box(.12,2,.12,white,FX+dx,1,gz));box(gw+.12,.12,.12,white,FX,2,gz);
    const net=new T.Mesh(new T.PlaneGeometry(gw,2),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25,side:T.DoubleSide}));net.position.set(FX,1,gz+s*.6);g.add(net)});
  // 뛰는 학생들
  const runners=[];const kit=[0xe8743b,0xffffff,0xe8743b,0x2f6fb3,0xffffff,0x2f6fb3,0xe8743b];
  kit.forEach((c,i)=>{const r=new T.Group();const body=new T.Mesh(new T.CylinderGeometry(.18,.2,.7,8),M(c));body.position.y=1.0;r.add(body);
    const sh2=new T.Mesh(new T.CylinderGeometry(.2,.2,.3,8),M(0x22303f));sh2.position.y=.55;r.add(sh2);
    const head=new T.Mesh(new T.SphereGeometry(.17,10,8),M(0xf0c9a2));head.position.y=1.55;r.add(head);
    const hair=new T.Mesh(new T.SphereGeometry(.18,10,6,0,Math.PI*2,0,Math.PI/2),M(0x2a1d14));hair.position.y=1.58;r.add(hair);
    const legs=[-1,1].map(s=>{const p=new T.Group();p.position.set(s*.09,.42,0);const l=new T.Mesh(new T.CylinderGeometry(.06,.06,.42,6),M(0xf0c9a2));l.position.y=-.21;p.add(l);r.add(p);return p});
    g.add(r);runners.push({r,legs,ph:i*.9,rx:4+i%3*1.6,rz:7+i%4*1.5,sp:.18+i*.02})});
  ANIMS.push((dt,t)=>{runners.forEach(o=>{const a=t*o.sp+o.ph;const x=FX+Math.cos(a)*o.rx,z=FZc+Math.sin(a)*o.rz;o.r.position.set(x,Math.abs(Math.sin(t*9+o.ph))*.06,z);
    o.r.rotation.y=Math.atan2(-(-Math.sin(a)*o.rx),-(Math.cos(a)*o.rz));const sw=Math.sin(t*9+o.ph)*.6;o.legs[0].rotation.x=sw;o.legs[1].rotation.x=-sw})});
  /* ----- 승부차기 구역 (운동장 오른쪽 옆) ----- */
  const PKX=41,PKZ=12;
  const pkT=ctex(256,448,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#5f9e45':'#6cab50';x.fillRect(0,i*h/8,w,h/8)}grain(x,w,h,8);
    x.strokeStyle='#fff';x.lineWidth=5;x.strokeRect(8,8,w-16,h-16);x.strokeRect(w*.2,8,w*.6,h*.32);x.strokeRect(w*.36,8,w*.28,h*.12);x.beginPath();x.arc(w/2,h*.4,36,.2*Math.PI,.8*Math.PI);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(w/2,h*.27,6,0,7);x.fill()});
  const pk=new T.Mesh(new T.PlaneGeometry(7.4,13),new T.MeshStandardMaterial({map:pkT,roughness:1}));pk.rotation.x=-Math.PI/2;pk.position.set(PKX,.017,PKZ);g.add(pk);
  const gzP=PKZ-6.1,gwP=3.6;[[-gwP/2],[gwP/2]].forEach(([dx])=>box(.12,1.9,.12,white,PKX+dx,.95,gzP));box(gwP+.12,.12,.12,white,PKX,1.9,gzP);
  [-1,1].forEach(s=>box(.06,.06,1.1,white,PKX+s*gwP/2,1.9,gzP-.55));
  const pkNet=new T.Mesh(new T.PlaneGeometry(gwP,1.9),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.28,side:T.DoubleSide}));pkNet.position.set(PKX,.95,gzP-1.1);g.add(pkNet);
  const pkNetTop=new T.Mesh(new T.PlaneGeometry(gwP,1.1),pkNet.material);pkNetTop.rotation.x=Math.PI/2;pkNetTop.position.set(PKX,1.9,gzP-.55);g.add(pkNetTop);
  // 골키퍼
  const kp=new T.Group();const kb=new T.Mesh(new T.CylinderGeometry(.2,.22,.72,8),M(0xf07c2a));kb.position.y=1.0;kp.add(kb);
  const kh=new T.Mesh(new T.SphereGeometry(.17,10,8),M(0xe8b98f));kh.position.y=1.55;kp.add(kh);
  const kl=new T.Mesh(new T.CylinderGeometry(.2,.2,.62,8),M(0x22262e));kl.position.y=.33;kp.add(kl);
  const karms=[-1,1].map(s=>{const a=new T.Group();a.position.set(s*.24,1.28,0);const m=new T.Mesh(new T.CylinderGeometry(.06,.06,.5,6),M(0xf07c2a));m.position.y=-.25;a.add(m);
    const gl=new T.Mesh(new T.SphereGeometry(.09,8,6),M(0xc6f24a));gl.position.y=-.52;a.add(gl);a.rotation.z=s*2.2;kp.add(a);return a});
  kp.position.set(PKX,0,gzP+.3);g.add(kp);
  const pkBall=new T.Mesh(new T.IcosahedronGeometry(.17,1),new T.MeshStandardMaterial({color:0xffffff,roughness:.5,flatShading:true}));pkBall.position.set(PKX,.17,PKZ-2.6);g.add(pkBall);
  ANIMS.push((dt,t)=>{kp.position.x=PKX+Math.sin(t*1.6)*.9;karms.forEach((a,i)=>a.rotation.z=(i?1:-1)*(2.0+Math.sin(t*3+i)*.25));pkBall.rotation.y+=dt*.3});
  // 간판
  const pkSignT=ctex(512,300,(x,w,h)=>{x.fillStyle='#14304f';x.fillRect(0,0,w,h);x.fillStyle='#4fd18b';x.fillRect(0,0,w,18);x.fillStyle='#fff';x.textAlign='center';
    x.font=`96px ${EMO}`;x.fillText('⚽',w*.18,150);x.font=`76px ${DISP}`;x.fillText('승부차기',w*.6,138);x.fillStyle='#ffd23f';x.font=`34px ${BODY}`;x.fillText('공 앞에 서면 시작!',w/2,230)});
  const pkSign=new T.Mesh(new T.PlaneGeometry(2.1,1.23),new T.MeshStandardMaterial({map:pkSignT,roughness:.7}));pkSign.position.set(PKX-4.3,1.75,PKZ+3.2);pkSign.rotation.y=-Math.PI/2+.5;g.add(pkSign);
  {const ry=pkSign.rotation.y,lx=Math.cos(ry),lz=-Math.sin(ry),legM=M(0x2f2924,{r:.5,m:.4});[-1,1].forEach(k=>box(.08,1.2,.08,legM,PKX-4.3+k*.9*lx,.6,PKZ+3.2+k*.9*lz-.02))}
  // 응원 관중석 (오른쪽)
  {const bM=M(0xb9b2a4),seatM=[M(0xe8423a),M(0xffffff)];const fans=[];
   for(let r=0;r<3;r++){box(1.2,.45+r*.45,10,bM,PKX+5.3+r*1.1,(.45+r*.45)/2,PKZ-1.5);box(1.15,.06,10,seatM[r%2],PKX+5.3+r*1.1,.48+r*.45,PKZ-1.5);
     for(let i=0;i<6;i++){const f=new T.Group();const red=(i+r)%3!==2;const bd=new T.Mesh(new T.CylinderGeometry(.17,.19,.55,8),M(red?0xe8423a:0xffffff));bd.position.y=.3;f.add(bd);
       const hd=new T.Mesh(new T.SphereGeometry(.15,10,8),M([0xf1c9a5,0xe8b98f,0xd9a47c][(i+r)%3]));hd.position.y=.72;f.add(hd);
       const arms=[-1,1].map(sd=>{const ag=new T.Group();ag.position.set(0,.5,sd*.2);const am=new T.Mesh(new T.CylinderGeometry(.045,.045,.4,6),M(red?0xe8423a:0xffffff));am.position.y=.2;ag.add(am);f.add(ag);return ag});
       let flag=null;if((i*7+r*3)%5===0){flag=new T.Group();const pole=new T.Mesh(new T.CylinderGeometry(.015,.015,.9,4),M(0xdddddd));pole.position.y=.45;flag.add(pole);
         const cl=new T.Mesh(new T.PlaneGeometry(.5,.32),new T.MeshStandardMaterial({color:(i+r)%2?0xe8423a:0xffffff,side:T.DoubleSide}));cl.position.set(0,.78,.25);cl.rotation.y=Math.PI/2;flag.add(cl);flag.position.set(0,.55,.22);f.add(flag)}
       const baseY=.5+r*.45;f.position.set(PKX+5.2+r*1.1,baseY,PKZ-5.5+i*1.6+(r%2)*.4);f.rotation.y=-Math.PI/2;g.add(f);fans.push({f,arms,flag,baseY,ph:Math.random()*7})}}
   const banT=ctex(512,96,(x,w,h)=>{x.fillStyle='#e8423a';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font=`64px ${DISP}`;x.textAlign='center';x.fillText('대~한민국 할 수 있다!',w/2,72)});
   const ban=new T.Mesh(new T.PlaneGeometry(6,1.1),new T.MeshStandardMaterial({map:banT,side:T.DoubleSide}));ban.position.set(PKX+4.6,.6,PKZ-1.5);ban.rotation.y=-Math.PI/2;g.add(ban);
   ANIMS.push((dt,t)=>{const wave=(Math.sin(t*.7)+1)/2;fans.forEach(o=>{const k=Math.max(0,Math.sin(t*.9-o.f.position.z*.35));const hop=k>.7?Math.abs(Math.sin(t*9+o.ph))*.18:0;o.f.position.y=o.baseY+hop;
     o.arms.forEach((a,i)=>{a.rotation.x=(i?1:-1)*(k>.5?2.6+Math.sin(t*10+o.ph)*.3:.3+Math.sin(t*2+o.ph)*.1)});if(o.flag)o.flag.rotation.x=Math.sin(t*4+o.ph)*.5})})}
  const pkPiv=new T.Group();g.add(pkPiv);
  doors.push({id:'penalty',r:H.rooms.penalty||{title:'승부차기'},floor:OUT,pivot:pkPiv,open:0,target:0,front:{x:PKX,z:PKZ-1.5},look:{x:PKX,z:gzP},hits:[pkSign,pkBall,kb,kh,pkNet],badgePos:{x:PKX,y:2.8,z:gzP+.3}});
  /* ----- eco garden (왼쪽) ----- */
  const GX=-21,GZ=11;
  const water=new T.Mesh(new T.CircleGeometry(6,40),M(0x4f8f8a,{r:.08,m:.35,t:.9}));water.rotation.x=-Math.PI/2;water.scale.set(1.35,1,1);water.position.set(GX,.03,GZ);g.add(water);
  const shore=new T.Mesh(new T.CircleGeometry(6.6,40),M(0x9d8e72));shore.rotation.x=-Math.PI/2;shore.scale.set(1.35,1,1);shore.position.set(GX,.02,GZ);g.add(shore);
  const rockM=[M(0x9a9690),M(0xb5aea2),M(0x8a857c)];
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2,rr=6.1+Math.random()*.5;const r=new T.Mesh(new T.DodecahedronGeometry(.35+Math.random()*.5,0),rockM[i%3]);r.position.set(GX+Math.cos(a)*rr*1.35,.15,GZ+Math.sin(a)*rr);r.scale.y=.6;r.rotation.set(Math.random(),Math.random(),0);g.add(r)}
  for(let i=0;i<18;i++){const a=Math.random()*7,rr=Math.random()*4.6;const pad=new T.Mesh(new T.CircleGeometry(.28+Math.random()*.2,10,.3,Math.PI*1.8),M(0x5f9c4a));pad.rotation.x=-Math.PI/2;pad.position.set(GX+Math.cos(a)*rr*1.35,.05,GZ+Math.sin(a)*rr);g.add(pad)}
  const woodM=M(0xa8784a,{r:.7});
  const deck=new T.Mesh(new T.CylinderGeometry(2.3,2.3,.16,36),woodM);deck.position.set(GX,.35,GZ);g.add(deck);
  const rail=new T.Mesh(new T.TorusGeometry(2.25,.05,6,48),woodM);rail.rotation.x=Math.PI/2;rail.position.set(GX,1.1,GZ);g.add(rail);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;if(Math.abs(a)<.35)continue;box(.08,.75,.08,woodM,GX+Math.cos(a)*2.25,.72,GZ+Math.sin(a)*2.25)}
  box(6,.14,1.5,woodM,GX+5.2,.33,GZ);[-1,1].forEach(s=>box(6,.07,.07,woodM,GX+5.2,1.05,GZ+s*.72));
  // amphitheater
  const ampM=new T.MeshStandardMaterial({map:stoneT(3,1,[190,182,165]),roughness:.9});
  [[5.6,.45],[4.8,.9],[4.0,1.35]].forEach(([r,h])=>{const a=new T.Mesh(new T.CylinderGeometry(r,r,h,30,1,false,Math.PI*.5,Math.PI),ampM);a.position.set(GX,h/2,GZ-8);g.add(a)});
  // pergola with vines + table
  const PX=GX-7,PZ=GZ+7;[[-1.6,-1.2],[1.6,-1.2],[-1.6,1.2],[1.6,1.2]].forEach(([dx,dz])=>box(.18,2.6,.18,woodM,PX+dx,1.3,PZ+dz));
  for(let i=0;i<7;i++)box(3.8,.1,.12,woodM,PX,2.65,PZ-1.3+i*.43);
  const vineM=[M(0x5f9e48),M(0x7ab55a)];for(let i=0;i<26;i++){const v=new T.Mesh(new T.SphereGeometry(.35+Math.random()*.25,8,6),vineM[i%2]);v.position.set(PX+(Math.random()-.5)*3.6,2.8+Math.random()*.25,PZ+(Math.random()-.5)*2.6);v.scale.y=.5;g.add(v)}
  box(1.6,.08,.9,woodM,PX,.75,PZ);box(.12,.7,.12,woodM,PX,.38,PZ);[-1,1].forEach(s=>box(1.6,.07,.32,woodM,PX,.45,PZ+s*.75));
  // irises
  const stemM=M(0x4f8f3e),irisM=M(0xf2d03b),purpleM=M(0x8a6fd6);
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2+.1,rr=6.9+Math.random()*.6;const cx=GX+Math.cos(a)*rr*1.35,cz=GZ+Math.sin(a)*rr;if(cz<GZ-5)continue;
    for(let k=0;k<4;k++){const c=new T.Mesh(new T.ConeGeometry(.04,.9,4),stemM);c.position.set(cx+(Math.random()-.5)*.4,.45,cz+(Math.random()-.5)*.4);c.rotation.z=(Math.random()-.5)*.3;g.add(c)}
    const f=new T.Mesh(new T.SphereGeometry(.09,6,5),i%4?irisM:purpleM);f.position.set(cx,.95,cz);g.add(f)}
  // garden sign
  const gsT=ctex(512,200,(x,w,h)=>{x.fillStyle='#5a3a24';x.fillRect(0,0,w,h);x.fillStyle='#f3e6c4';x.textAlign='center';x.font=`64px ${DISP}`;x.fillText('생태 정원',w/2,92);x.font=`34px ${BODY}`;x.fillText('잠깐 쉬어 가요',w/2,152)});
  const gs=new T.Mesh(new T.PlaneGeometry(1.6,.62),new T.MeshStandardMaterial({map:gsT}));gs.position.set(GX+9.5,1.25,GZ+6);gs.rotation.y=-.6;g.add(gs);box(.08,1,.08,woodM,GX+9.5,.5,GZ+6);
  /* ----- welcome board, lamps, benches ----- */
  const boardT=ctex(512,384,(x,w,h)=>{x.fillStyle='#fffaf0';x.fillRect(0,0,w,h);x.fillStyle=FL[0].c;x.fillRect(0,0,w,80);x.fillStyle='#fff';x.font=`48px ${DISP}`;x.textAlign='center';x.fillText('어서 와요!',w/2,58);
    x.fillStyle='#2a2018';x.font=`32px ${BODY}`;['1F 터뜨리는 방','2F 쉬어가는 방','3F 함께하는 방','⚽ 운동장 옆 승부차기'].forEach((l,i)=>x.fillText(l,w/2,132+i*48));x.fillStyle=FL[0].c;x.font=`28px ${DISP}`;x.fillText('현관 문을 탭하면 들어가요',w/2,h-26)});
  const board=new T.Mesh(new T.PlaneGeometry(1.3,.98),new T.MeshStandardMaterial({map:boardT,roughness:.8}));board.position.set(-2.4,1.35,15);board.rotation.y=.35;g.add(board);
  const poleM=M(0x2f2924,{r:.5,m:.4}),bulbM=new T.MeshBasicMaterial({color:0xfff2cc});
  [[-2.4,9],[2.4,9],[-2.4,18],[2.4,18],[-2.4,26],[2.4,26]].forEach(([x,z])=>{const p=new T.Mesh(new T.CylinderGeometry(.06,.08,3.2,8),poleM);p.position.set(x,1.6,z);g.add(p);const b=new T.Mesh(new T.SphereGeometry(.2,12,10),bulbM);b.position.set(x,3.3,z);g.add(b)});
  const benchM=M(0xa0703f,{r:.6});[[-4.5,12,1],[4.5,12,-1],[-4.5,21,1],[4.5,21,-1]].forEach(([x,z,s])=>{box(.5,.08,1.6,benchM,x,.45,z);box(.06,.45,1.6,benchM,x-s*.25,.72,z);[-.65,.65].forEach(o=>box(.45,.45,.06,poleM,x,.225,z+o))});
  /* ----- light ----- */
  const sun=new T.DirectionalLight(0xfff4e0,1.0);sun.position.set(-20,40,30);g.add(sun);g.add(new T.AmbientLight(0xdfefff,.3));
  floors.push({g,elevHits:[],walk:[ground,plaza,path,field],name:'스트레스 마음정비소 앞',no:'밖',xb:34,zMin:FZ+.9,zMax:30,outside:true,
    clamp(P){P.x=Math.max(-38,Math.min(44.5,P.x));P.z=Math.min(30,P.z);const minZ=Math.abs(P.x)<13.6?FZ+.9:-12;if(P.z<minZ)P.z=minZ}});
  doors.push({id:'__enter',enter:true,r:{title:'스트레스 마음정비소'},floor:OUT,pivL,pivR,open:0,target:0,front:{x:0,z:FZ+1.6},look:{x:0,z:FZ-1},hits:[L,R,back,fan,arch,fascia]});
})();

scene.add(new T.HemisphereLight(0xfff3e0,0x3a2c22,.55));scene.add(new T.AmbientLight(0xffffff,.18));

/* ---------- player & input ---------- */
const marker=new T.Mesh(new T.RingGeometry(.18,.28,28),new T.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.9,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
const P={dist:1,x:0,z:1,yaw:0,face:0,pitch:-.04,floor:0,bob:0,step:0,speed:0,jy:0,vy:0,air:false,jc:0,run:false,runHold:false};
function jump(){if(P.air||busy||!running)return;P.air=true;P.vy=P.run||P.runHold?4.6:4.2;P.jc=(P.jc+1)%1000;const t=H.now();H.noise(t,.08,'bandpass',900,1,.25);H.tone(330,t,.18,.1,'sine',{to:620,glide:.16});H.buzz(15)}
function land(){const t=H.now();H.noise(t,.07,'lowpass',260,1,.5);H.tone(70,t,.09,.22,'sine',{to:45});H.buzz(30)}
function setRun(v){P.run=v;const b=document.getElementById('wRun');if(b){b.setAttribute('aria-pressed',String(v));}}
const isRun=()=>P.run||P.runHold;
const angLerp=(a,b,k)=>a+((((b-a)+Math.PI*3)%(Math.PI*2))-Math.PI)*k;
let auto=null,busy=false,running=false,raf=0,last=0,moved=false;
const keys=new Set(),stick={x:0,y:0};
function setFloor(fi){floors.forEach((f,i)=>f.g.visible=i===fi);P.floor=fi;$('wFloorNo').textContent=floors[fi].no;$('wFloorName').textContent=floors[fi].name;
  const out=fi===OUT;scene.background.set(out?0xcfe6f2:0x100d0b);scene.fog.color.set(out?0xd6e9f3:0x100d0b);scene.fog.near=out?60:9;scene.fog.far=out?230:30;
  document.querySelectorAll('[data-fl]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.fl===(out?0:fi+1)))}
function fade(cb){fadeEl.style.opacity=1;setTimeout(()=>{cb();setTimeout(()=>{fadeEl.style.opacity=0},60)},330)}
function goFloor(fi){if(fi===P.floor||busy)return;busy=true;auto=null;const t=H.now();H.tone(1047,t+.05,.5,.12,'sine',{wet:true});H.tone(784,t+.35,.7,.12,'sine',{wet:true});H.buzz([20,60,20]);
  fade(()=>{setFloor(fi);placeStart(fi);busy=false})}
function placeStart(fi){if(fi===OUT){P.x=0;P.z=20}else{P.x=0;P.z=floors[fi].z0-1}P.yaw=0;P.face=0;P.pitch=-.04}
document.querySelectorAll('[data-fl]').forEach(b=>b.onclick=()=>{const n=+b.dataset.fl;goFloor(n===0?OUT:n-1)});
const yawTo=(x,z)=>Math.atan2(-(x-P.x),-(z-P.z));
function openDoor(d){if(busy)return;busy=true;auto=null;enterBtn.hidden=true;d.target=1;
  if(d.enter){const t=H.now();H.noise(t,.7,'bandpass',900,.6,.3,{atk:.1});H.tone(659,t+.15,.5,.1,'sine',{wet:true});H.tone(988,t+.4,.7,.1,'sine',{wet:true});H.buzz([30,50,30]);
    setTimeout(()=>fade(()=>{busy=false;d.target=0;d.open=0;setFloor(0);placeStart(0);const tt=H.now();H.tone(523,tt,.4,.08,'sine',{wet:true});H.tone(784,tt+.12,.6,.08,'sine',{wet:true})}),900);return}
  H.ui('door');setTimeout(()=>fade(()=>{busy=false;location.hash=d.id}),620)}
function walkTo(d){auto=d;H.ui('tap')}
function nearest(){let best=null,bd=1.8;const fx=-Math.sin(P.face),fz=-Math.cos(P.face);
  doors.forEach(d=>{if(d.floor!==P.floor)return;const dx=d.look.x-P.x,dz=d.look.z-P.z,dl=Math.hypot(dx,dz)||1;if((fx*dx+fz*dz)/dl<.15)return;
    const dd=Math.hypot(d.front.x-P.x,d.front.z-P.z);if(dd<bd){bd=dd;best=d}});return best}
enterBtn.onclick=()=>{const d=nearest();if(d)openDoor(d)};

addEventListener('keydown',e=>{if(!running||e.target.matches('input,textarea'))return;const k=e.key.toLowerCase();
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys.add(k);auto=null;e.preventDefault()}
  if(k==='e'||k==='enter'){const d=nearest();if(d){e.preventDefault();openDoor(d)}}
  if(e.code==='Space'){e.preventDefault();if(!e.repeat)jump()}
  if(k==='shift'){P.runHold=true}
  if(k==='r'&&!e.repeat){setRun(!P.run)}});
addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(e.key==='Shift')P.runHold=false});
addEventListener('blur',()=>{keys.clear();P.runHold=false});
{const jb=$('wJump'),rb=$('wRun');
 if(jb)jb.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();H.ac();jump()});
 if(rb)rb.addEventListener('click',e=>{e.preventDefault();setRun(!P.run)})}

// joystick
const stickEl=$('wStick'),knobEl=stickEl.querySelector('i');let stickId=null;
stickEl.addEventListener('pointerdown',e=>{e.preventDefault();stickId=e.pointerId;stickEl.setPointerCapture(e.pointerId);auto=null;H.ac();moveStick(e)});
stickEl.addEventListener('pointermove',e=>{if(e.pointerId===stickId)moveStick(e)});
const endStick=e=>{if(e.pointerId!==stickId)return;stickId=null;stick.x=stick.y=0;knobEl.style.transform='translate(-50%,-50%)'};
stickEl.addEventListener('pointerup',endStick);stickEl.addEventListener('pointercancel',endStick);
function moveStick(e){const r=stickEl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2-18;let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d}
  stick.x=dx/R;stick.y=dy/R;knobEl.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`}

// look + tap
const cv=renderer.domElement;let look=null;const ray=new T.Raycaster(),ndc=new T.Vector2();
cv.addEventListener('pointerdown',e=>{if(look)return;H.ac();look={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),acc:0};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{if(!look||e.pointerId!==look.id)return;const dx=e.clientX-look.x,dy=e.clientY-look.y;look.x=e.clientX;look.y=e.clientY;
  P.yaw-=dx*.0055;P.pitch=Math.max(-.7,Math.min(.6,P.pitch-dy*.0045));look.acc+=Math.abs(dx)+Math.abs(dy);if(look.acc>40){look.acc=0;H.ui('slide')}});
cv.addEventListener('pointerup',e=>{if(!look||e.pointerId!==look.id)return;const tap=Math.hypot(e.clientX-look.sx,e.clientY-look.sy)<8&&performance.now()-look.t<450;look=null;cv.style.cursor='grab';
  if(!tap||busy)return;const r=cv.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,cam);
  const fl=floors[P.floor];const hitsD=doors.filter(d=>d.floor===P.floor).flatMap(d=>d.hits.map(m=>({m,d})));
  const res=ray.intersectObjects(hitsD.map(o=>o.m).concat(fl.elevHits),false)[0];
  if(!res){const wh=ray.intersectObjects(fl.walk||[],false)[0];
    if(wh){const x=Math.max(-fl.xb,Math.min(fl.xb,wh.point.x)),z=Math.max(fl.zMin,Math.min(fl.zMax,wh.point.z));auto={point:true,front:{x,z}};marker.position.set(x,.03,z);marker.visible=true;marker.scale.setScalar(1.4);H.ui('tap')}
    else H.ui('tap');return}
  if(fl.elevHits.includes(res.object)){goFloor((P.floor+1)%3);return}
  const d=hitsD.find(o=>o.m===res.object).d;if(Math.hypot(d.front.x-P.x,d.front.z-P.z)<.25)openDoor(d);else walkTo(d)});
cv.addEventListener('pointercancel',()=>{look=null});
cv.addEventListener('wheel',e=>{e.preventDefault();P.dist=Math.max(.45,Math.min(1.8,P.dist*Math.exp(e.deltaY*.001)));H.ui('slide')},{passive:false});
cv.addEventListener('contextmenu',e=>e.preventDefault());

function stepSound(){const t=H.now();if(P.floor===OUT){H.noise(t,.07,'bandpass',1400+Math.random()*600,1.2,.3);H.noise(t,.05,'lowpass',300,1,.25);H.buzz(6);return}H.noise(t,.06,'lowpass',260+Math.random()*120,1,.45);H.tone(65+Math.random()*10,t,.07,.18,'sine');H.buzz(6)}

/* ---------- loop ---------- */
function frame(n){raf=requestAnimationFrame(frame);const dt=Math.min(.05,last?(n-last)/1000:.016);last=n;
  const fl=floors[P.floor];let mx=0,mz=0;
  if(keys.has('w')||keys.has('arrowup'))mz+=1;if(keys.has('s')||keys.has('arrowdown'))mz-=1;
  if(keys.has('a'))mx-=1;if(keys.has('d'))mx+=1;
  if(keys.has('arrowleft'))P.yaw+=1.8*dt;if(keys.has('arrowright'))P.yaw-=1.8*dt;
  mx+=stick.x;mz+=-stick.y;
  let speed=0;
  if(auto&&!busy){const dx=auto.front.x-P.x,dz=auto.front.z-P.z,d=Math.hypot(dx,dz);
    if(auto.point&&d<=.12){auto=null;marker.visible=false}else{
    const want=d>.15||auto.point?Math.atan2(-dx,-dz):yawTo(auto.look.x,auto.look.z);let dy=((want-P.face+Math.PI*3)%(Math.PI*2))-Math.PI;P.face+=dy*Math.min(1,dt*8);P.yaw=angLerp(P.yaw,want,Math.min(1,dt*2.5));P.pitch+=(-.04-P.pitch)*Math.min(1,dt*3);
    if(d>.08){const s=Math.min((isRun()?4.8:2.6)*dt,d);P.x+=dx/d*s;P.z+=dz/d*s;speed=s/dt;if(!moved){moved=true;helpEl.classList.add('gone')}}else if(!auto.point&&Math.abs(dy)<.06)openDoor(auto)}}
  else if(mx||mz){const len=Math.min(1,Math.hypot(mx,mz)),nx=mx/(Math.hypot(mx,mz)||1),nz=mz/(Math.hypot(mx,mz)||1);
    const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw),sp=(isRun()?5.2:2.8)*len*dt;
    const vx=fx*nz+rx*nx,vz=fz*nz+rz*nx;P.x+=vx*sp;P.z+=vz*sp;speed=sp/dt;P.face=angLerp(P.face,Math.atan2(-vx,-vz),Math.min(1,dt*10));
    if(nz>.3)P.yaw=angLerp(P.yaw,P.face,Math.min(1,dt*.8));if(!moved){moved=true;helpEl.classList.add('gone')}}
  if(fl.clamp)fl.clamp(P);else{P.x=Math.max(-fl.xb,Math.min(fl.xb,P.x));P.z=Math.max(fl.zMin,Math.min(fl.zMax,P.z))}
  {const gy=fl.outside?groundY(P.x,P.z):0;P.gy=(P.gy||0)+(gy-(P.gy||0))*Math.min(1,dt*12)}
  if(P.air){P.vy-=12*dt;P.jy+=P.vy*dt;if(P.jy<=0){P.jy=0;P.vy=0;P.air=false;land()}}
  if(fl.outside)ANIMS.forEach(f=>f(dt,n/1000));
  if(fl.outside&&Math.random()<dt*.3){const t=H.now(),f=2600+Math.random()*1600;H.tone(f,t,.05,.04,'sine',{to:f*1.35,glide:.05});H.tone(f*1.1,t+.11,.05,.035,'sine',{to:f*1.5,glide:.05})}
  if(speed>.2&&!P.air){P.bob+=dt*speed*3.4;P.step+=speed*dt;if(P.step>(speed>3.5?.95:.72)){P.step=0;stepSound()}}else P.bob*=.9;
  P.speed=speed;if(marker.visible){marker.scale.setScalar(Math.max(1,marker.scale.x-dt*2));marker.material.opacity=.6+.3*Math.sin(n/150);if(!auto)marker.visible=false}
  {const elev=Math.max(.06,Math.min(1.0,.3-P.pitch*.9)),D=(fl.outside?4.2:3.3)*P.dist,bx=Math.sin(P.yaw),bz=Math.cos(P.yaw);
   let cx=P.x+bx*D*Math.cos(elev),cz=P.z+bz*D*Math.cos(elev),cy=1.35+(P.gy||0)+D*Math.sin(elev);
   if(!fl.outside){cx=Math.max(-CW/2+.15,Math.min(CW/2-.15,cx));cz=Math.max(fl.z1+.15,Math.min(fl.z0-.15,cz));cy=Math.min(CH-.15,cy)}else{cz=Math.max(-1.6,cz)}
   cam.position.set(cx,cy,cz);cam.position.y+=P.jy*.35;cam.lookAt(P.x,1.25+(P.gy||0)+P.jy*.5,P.z)}
  doors.forEach(d=>{if(d.floor!==P.floor)return;d.open+=(d.target-d.open)*Math.min(1,dt*(d.enter?4:7));if(d.enter){d.pivL.rotation.y=d.open*1.45;d.pivR.rotation.y=-d.open*1.45}else d.pivot.rotation.y=d.open*1.35});
  const nd=busy?null:nearest();if(nd){enterBtn.hidden=false;enterBtn.querySelector('span').textContent=nd.r.title}else enterBtn.hidden=true;
  if(H.world&&H.world.tick)H.world.tick(dt,running);
  renderer.render(scene,cam)}

setFloor(OUT);placeStart(OUT);let started=false;
const api={
  show(fromId){worldEl.hidden=false;resize();running=true;keys.clear();
    const d=doors.find(x=>x.id===fromId);if(!started){started=true;if(!d){setFloor(OUT);placeStart(OUT)}}
    if(d){setFloor(d.floor);P.x=d.front.x;P.z=d.front.z;P.yaw=P.face=yawTo(d.look.x,d.look.z);P.pitch=-.04;d.open=1;d.target=0;
      setTimeout(()=>{const t=H.now();H.noise(t,.05,'lowpass',400,1,.6,{wet:true});H.tone(95,t,.15,.3,'sine',{to:55});H.buzz(25)},380)}
    fadeEl.style.opacity=0;if(!raf){last=0;raf=requestAnimationFrame(frame)}},
  hide(){running=false;P.jy=0;P.vy=0;P.air=false;P.runHold=false;worldEl.hidden=true;cancelAnimationFrame(raf);raf=0;auto=null;busy=false;keys.clear();stick.x=stick.y=0}
};
Object.assign(api,{T,scene,cam,P,doors,floors,OUT,groundY,isRunning:()=>running});
return api;
};
