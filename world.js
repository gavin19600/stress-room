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
const cam=new T.PerspectiveCamera(72,1,.05,80);cam.rotation.order='YXZ';
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
    x.fillStyle='rgba(233,238,243,.6)';x.font=`30px ${BODY}`;x.fillText('PC: WASD · 방향키 · E',w/2,h-50)});
  wallPiece(g,1,z0-1.5,.95,1.3,1.75,new T.MeshStandardMaterial({map:ht,roughness:.8}),.02);
  // plant + bench at the far end
  const pot=new T.Mesh(new T.CylinderGeometry(.22,.17,.45,20),new T.MeshStandardMaterial({color:0xd9cfc2,roughness:.7}));pot.position.set(-1.45,.225,z1+.5);g.add(pot);
  const leafM=new T.MeshStandardMaterial({color:0x3f7d4a,roughness:.8});[[0,.75,0,.32],[.12,.95,.05,.22],[-.12,.9,-.05,.24],[0,1.12,0,.18]].forEach(([x,y,z,r])=>{const s=new T.Mesh(new T.SphereGeometry(r,14,10),leafM);s.position.set(-1.45+x,y,z1+.5+z);g.add(s)});
  const bench=new T.Mesh(new T.BoxGeometry(.45,.08,1.4),new T.MeshStandardMaterial({color:0xa0703f,roughness:.6}));bench.position.set(1.65,.45,z1+1.2);g.add(bench);
  [-.55,.55].forEach(o=>{const leg=new T.Mesh(new T.BoxGeometry(.4,.45,.06),frameMat);leg.position.set(1.65,.225,z1+1.2+o);g.add(leg)});
  floors.push({g,z0,z1,elevHits,walk:[floor,rug],name:f.name,no:f.no+'F',xb:CW/2-.35,zMin:z1+.5,zMax:z0-.55});
});
/* ---------- outside: the building, its plaza and the path in ---------- */
const OUT=3;
(()=>{const g=new T.Group();g.visible=false;scene.add(g);
  const BW=12,BH=10,BD=8,FZ=-2;
  // sky dome
  const sky=ctex(64,512,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#4f9ad6');gr.addColorStop(.45,'#9fcdee');gr.addColorStop(.5,'#e6f2f8');gr.addColorStop(1,'#cfe3c4');x.fillStyle=gr;x.fillRect(0,0,w,h)});
  const dome=new T.Mesh(new T.SphereGeometry(70,32,16),new T.MeshBasicMaterial({map:sky,side:T.BackSide,fog:false}));g.add(dome);
  // clouds
  const cloudM=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,fog:false});
  [[-25,30,-50],[18,34,-55],[40,26,-30],[-45,28,-20],[5,38,-60]].forEach(([x,y,z],i)=>{const c=new T.Group();
    [[0,0,0,4],[3.5,-.6,0,3],[-3.4,-.8,0,2.8],[1.5,1.6,0,2.6]].forEach(([a,b,cc,r])=>{const s=new T.Mesh(new T.SphereGeometry(r,12,8),cloudM);s.position.set(a,b,cc);s.scale.y=.6;c.add(s)});
    c.position.set(x,y,z);c.lookAt(0,y,0);g.add(c)});
  // ground
  const grass=ctex(256,256,(x,w,h)=>{x.fillStyle='#7fae5a';x.fillRect(0,0,w,h);for(let i=0;i<2200;i++){x.fillStyle=Math.random()<.5?'#6e9e4b':'#8fbd68';x.fillRect(Math.random()*w,Math.random()*h,2,4)}},[30,30]);
  const ground=new T.Mesh(new T.PlaneGeometry(140,140),new T.MeshStandardMaterial({map:grass,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.z=10;g.add(ground);
  const stone=ctex(256,256,(x,w,h)=>{x.fillStyle='#d8d2c6';x.fillRect(0,0,w,h);x.strokeStyle='#b9b1a3';x.lineWidth=4;for(let r=0;r<4;r++){x.beginPath();x.moveTo(0,r*64);x.lineTo(w,r*64);x.stroke();for(let c=0;c<3;c++){const xx=c*96+(r%2?48:0);x.beginPath();x.moveTo(xx,r*64);x.lineTo(xx,r*64+64);x.stroke()}}grain(x,w,h,14)},[1,8]);
  const path=new T.Mesh(new T.PlaneGeometry(3,26),new T.MeshStandardMaterial({map:stone,roughness:.9}));path.rotation.x=-Math.PI/2;path.position.set(0,.01,FZ+13);g.add(path);
  const plazaT=ctex(256,256,(x,w,h)=>{x.fillStyle='#d8d2c6';x.fillRect(0,0,w,h);x.strokeStyle='#b9b1a3';x.lineWidth=4;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,h);x.moveTo(0,i*64);x.lineTo(w,i*64);x.stroke()}grain(x,w,h,14)},[4,2]);
  const plaza=new T.Mesh(new T.PlaneGeometry(14,4.5),new T.MeshStandardMaterial({map:plazaT,roughness:.9}));plaza.rotation.x=-Math.PI/2;plaza.position.set(0,.012,FZ+2.25);g.add(plaza);
  // building
  const facade=ctex(1200,1000,(x,w,h)=>{x.fillStyle='#ece3d6';x.fillRect(0,0,w,h);grain(x,w,h,8);
    const fh=h/3.2,cols=[FL[2].c,FL[1].c,FL[0].c],names=['3F 함께하는 방','2F 쉬어가는 방','1F 터뜨리는 방'];
    for(let i=0;i<3;i++){const y0=h-(3-i)*fh-.2*fh*0;const top=h*.06+i*fh;x.fillStyle=cols[i];x.fillRect(0,top+fh-18,w,18);
      for(let c=0;c<6;c++){if(i===2&&(c===2||c===3))continue;const wx=60+c*186,wy=top+fh*.18,ww=140,wh=fh*.56;
        const gl=x.createLinearGradient(wx,wy,wx+ww,wy+wh);gl.addColorStop(0,'#bfe0f3');gl.addColorStop(.5,'#7fb2d4');gl.addColorStop(1,'#5b8fb4');x.fillStyle='#4a3e36';x.fillRect(wx-8,wy-8,ww+16,wh+16);x.fillStyle=gl;x.fillRect(wx,wy,ww,wh);
        x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.moveTo(wx+10,wy+wh-10);x.lineTo(wx+50,wy+10);x.lineTo(wx+70,wy+10);x.lineTo(wx+30,wy+wh-10);x.fill();
        x.fillStyle=cols[i];x.globalAlpha=.25;x.fillRect(wx,wy+wh*.7,ww,wh*.3);x.globalAlpha=1}
      x.fillStyle=cols[i];x.font=`40px ${DISP}`;x.textAlign='left';x.fillText(names[i],24,top+fh-30)}
    x.fillStyle='#3a302a';x.fillRect(0,0,w,h*.04)});
  const wallC=new T.MeshStandardMaterial({color:0xe2d8ca,roughness:.95});
  const bld=new T.Mesh(new T.BoxGeometry(BW,BH,BD),[wallC,wallC,new T.MeshStandardMaterial({color:0x4a3e36,roughness:.8}),wallC,new T.MeshStandardMaterial({map:facade,roughness:.9}),wallC]);
  bld.position.set(0,BH/2,FZ-BD/2);g.add(bld);
  const roof=new T.Mesh(new T.BoxGeometry(BW+.4,.35,BD+.4),new T.MeshStandardMaterial({color:0x3a302a,roughness:.7}));roof.position.set(0,BH+.17,FZ-BD/2);g.add(roof);
  // entrance: frame, sliding glass doors, canopy, sign
  const ef=new T.MeshStandardMaterial({color:0x2f2924,roughness:.5,metalness:.3});
  [[-1.25,1.3,.16,2.6],[1.25,1.3,.16,2.6],[0,2.62,2.66,.16]].forEach(([x,y,w,h])=>{const b=new T.Mesh(new T.BoxGeometry(w,h,.25),ef);b.position.set(x,y,FZ+.08);g.add(b)});
  const inside=ctex(256,256,(x,w,h)=>{const gr=x.createRadialGradient(w/2,h*.4,10,w/2,h/2,h*.7);gr.addColorStop(0,'#fff1d6');gr.addColorStop(1,'#c4402f');x.fillStyle=gr;x.fillRect(0,0,w,h)});
  const back=new T.Mesh(new T.PlaneGeometry(2.34,2.5),new T.MeshBasicMaterial({map:inside}));back.position.set(0,1.25,FZ+.005);g.add(back);
  const glassM=new T.MeshStandardMaterial({color:0x9fd0ea,transparent:true,opacity:.55,metalness:.6,roughness:.08});
  const L=new T.Mesh(new T.BoxGeometry(1.15,2.5,.05),glassM),R=new T.Mesh(new T.BoxGeometry(1.15,2.5,.05),glassM);L.position.set(-.58,1.25,FZ+.06);R.position.set(.58,1.25,FZ+.06);g.add(L,R);
  [L,R].forEach(p=>{const h=new T.Mesh(new T.BoxGeometry(.04,.6,.06),new T.MeshStandardMaterial({color:0xd9dde3,metalness:.8,roughness:.3}));h.position.set(p===L?.48:-.48,0,.05);p.add(h)});
  const canopy=new T.Mesh(new T.BoxGeometry(4.6,.18,2),new T.MeshStandardMaterial({color:new T.Color(FL[0].c),roughness:.6}));canopy.position.set(0,3.05,FZ+1);g.add(canopy);
  const signT=ctex(1024,256,(x,w,h)=>{x.fillStyle='#231d19';x.fillRect(0,0,w,h);x.fillStyle='#e8b23a';x.textAlign='center';fitText(x,'스트레스 해소방',w*.86,140,DISP);x.fillText('스트레스 해소방',w/2,h*.62);
    x.fillStyle='#f1e7d6';x.font=`36px ${BODY}`;x.fillText('MIND GYM · 오늘 쌓인 건 여기 두고 가요',w/2,h*.9)});
  const sign=new T.Mesh(new T.PlaneGeometry(5.2,1.3),new T.MeshBasicMaterial({map:signT}));sign.position.set(0,3.95,FZ+.03);g.add(sign);
  const signGlow=new T.PointLight(0xffd59a,.6,6,2);signGlow.position.set(0,3.4,FZ+1.6);g.add(signGlow);
  // trees, lamps, benches, flower beds, a sign board
  const trunkM=new T.MeshStandardMaterial({color:0x7a5236,roughness:.9}),leafs=[0x4f8f3e,0x5fa148,0x3f7d35].map(c=>new T.MeshStandardMaterial({color:c,roughness:.85}));
  [[-8,4],[8,3.5],[-11,11],[11,12],[-7,19],[8,20],[-13,-1],[13,-.5]].forEach(([x,z],i)=>{const tr=new T.Mesh(new T.CylinderGeometry(.18,.26,2.2,10),trunkM);tr.position.set(x,1.1,z);g.add(tr);
    [[0,2.8,0,1.5],[.6,2.4,.3,1.1],[-.5,2.5,-.2,1.2],[0,3.6,0,1]].forEach(([a,b,c,r],k)=>{const s=new T.Mesh(new T.SphereGeometry(r,12,10),leafs[(i+k)%3]);s.position.set(x+a,b,z+c);g.add(s)})});
  const poleM=new T.MeshStandardMaterial({color:0x2f2924,roughness:.5,metalness:.4}),bulbM=new T.MeshBasicMaterial({color:0xfff2cc});
  [[-2.3,5],[2.3,5],[-2.3,13],[2.3,13],[-2.3,21],[2.3,21]].forEach(([x,z])=>{const p=new T.Mesh(new T.CylinderGeometry(.06,.08,3.2,8),poleM);p.position.set(x,1.6,z);g.add(p);const b=new T.Mesh(new T.SphereGeometry(.2,12,10),bulbM);b.position.set(x,3.3,z);g.add(b)});
  const benchM=new T.MeshStandardMaterial({color:0xa0703f,roughness:.6});
  [[-4,8,1],[4,8,-1],[-4,16,1],[4,16,-1]].forEach(([x,z,s])=>{const seat=new T.Mesh(new T.BoxGeometry(.5,.08,1.6),benchM);seat.position.set(x,.45,z);g.add(seat);
    const backr=new T.Mesh(new T.BoxGeometry(.06,.45,1.6),benchM);backr.position.set(x-s*.25,.72,z);g.add(backr);
    [-.65,.65].forEach(o=>{const leg=new T.Mesh(new T.BoxGeometry(.45,.45,.06),poleM);leg.position.set(x,.225,z+o);g.add(leg)})});
  const bedM=new T.MeshStandardMaterial({color:0x5b4636,roughness:1});const flowerC=[0xff6b8a,0xffd34d,0xffffff,0xc99be0,0xff9b3d];
  [[-4.6,FZ+1.2],[4.6,FZ+1.2]].forEach(([x,z])=>{const bed=new T.Mesh(new T.BoxGeometry(3.2,.35,1.2),bedM);bed.position.set(x,.175,z);g.add(bed);
    for(let i=0;i<26;i++){const f=new T.Mesh(new T.SphereGeometry(.09,8,6),new T.MeshStandardMaterial({color:flowerC[i%5],roughness:.7}));f.position.set(x+(Math.random()-.5)*2.9,.42+Math.random()*.12,z+(Math.random()-.5)*1);g.add(f)}});
  const boardT=ctex(512,384,(x,w,h)=>{x.fillStyle='#fffaf0';x.fillRect(0,0,w,h);x.fillStyle=FL[0].c;x.fillRect(0,0,w,80);x.fillStyle='#fff';x.font=`48px ${DISP}`;x.textAlign='center';x.fillText('어서 와요!',w/2,58);
    x.fillStyle='#2a2018';x.font=`32px ${BODY}`;['1F 터뜨리는 방','2F 쉬어가는 방','3F 함께하는 방'].forEach((l,i)=>x.fillText(l,w/2,140+i*52));x.fillStyle=FL[0].c;x.font=`28px ${DISP}`;x.fillText('입구 문을 탭하면 들어가요',w/2,h-26)});
  const board=new T.Mesh(new T.PlaneGeometry(1.3,.98),new T.MeshStandardMaterial({map:boardT,roughness:.8}));board.position.set(-2.2,1.35,12);board.rotation.y=.35;g.add(board);
  [-.5,.5].forEach(o=>{const leg=new T.Mesh(new T.BoxGeometry(.06,.9,.06),poleM);leg.position.set(-2.2+o*Math.cos(.35),.45,12-o*Math.sin(.35));g.add(leg)});
  // light
  const sun=new T.DirectionalLight(0xfff4e0,.95);sun.position.set(-12,20,14);g.add(sun);g.add(new T.AmbientLight(0xdfefff,.28));
  floors.push({g,elevHits:[],walk:[ground,path,plaza],name:'스트레스 해소방 앞',no:'밖',xb:14,zMin:FZ+1.3,zMax:24,outside:true});
  doors.push({id:'__enter',enter:true,r:{title:'스트레스 해소방'},floor:OUT,L,R,open:0,target:0,front:{x:0,z:FZ+1.5},look:{x:0,z:FZ-1},hits:[L,R,back,sign]});
})();

scene.add(new T.HemisphereLight(0xfff3e0,0x3a2c22,.55));scene.add(new T.AmbientLight(0xffffff,.18));

/* ---------- player & input ---------- */
const marker=new T.Mesh(new T.RingGeometry(.18,.28,28),new T.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.9,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
const P={dist:1,x:0,z:1,yaw:0,face:0,pitch:-.04,floor:0,bob:0,step:0,speed:0};
const angLerp=(a,b,k)=>a+((((b-a)+Math.PI*3)%(Math.PI*2))-Math.PI)*k;
let auto=null,busy=false,running=false,raf=0,last=0,moved=false;
const keys=new Set(),stick={x:0,y:0};
function setFloor(fi){floors.forEach((f,i)=>f.g.visible=i===fi);P.floor=fi;$('wFloorNo').textContent=floors[fi].no;$('wFloorName').textContent=floors[fi].name;
  const out=fi===OUT;scene.background.set(out?0xcfe6f2:0x100d0b);scene.fog.color.set(out?0xd6e9f3:0x100d0b);scene.fog.near=out?30:9;scene.fog.far=out?95:30;
  document.querySelectorAll('[data-fl]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.fl===(out?0:fi+1)))}
function fade(cb){fadeEl.style.opacity=1;setTimeout(()=>{cb();setTimeout(()=>{fadeEl.style.opacity=0},60)},330)}
function goFloor(fi){if(fi===P.floor||busy)return;busy=true;auto=null;const t=H.now();H.tone(1047,t+.05,.5,.12,'sine',{wet:true});H.tone(784,t+.35,.7,.12,'sine',{wet:true});H.buzz([20,60,20]);
  fade(()=>{setFloor(fi);placeStart(fi);busy=false})}
function placeStart(fi){if(fi===OUT){P.x=0;P.z=16}else{P.x=0;P.z=floors[fi].z0-1}P.yaw=0;P.face=0;P.pitch=-.04}
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
  if(k==='e'||k==='enter'){const d=nearest();if(d){e.preventDefault();openDoor(d)}}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>keys.clear());

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
    if(d>.08){const s=Math.min(2.6*dt,d);P.x+=dx/d*s;P.z+=dz/d*s;speed=s/dt;if(!moved){moved=true;helpEl.classList.add('gone')}}else if(!auto.point&&Math.abs(dy)<.06)openDoor(auto)}}
  else if(mx||mz){const len=Math.min(1,Math.hypot(mx,mz)),nx=mx/(Math.hypot(mx,mz)||1),nz=mz/(Math.hypot(mx,mz)||1);
    const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw),sp=2.8*len*dt;
    const vx=fx*nz+rx*nx,vz=fz*nz+rz*nx;P.x+=vx*sp;P.z+=vz*sp;speed=sp/dt;P.face=angLerp(P.face,Math.atan2(-vx,-vz),Math.min(1,dt*10));
    if(nz>.3)P.yaw=angLerp(P.yaw,P.face,Math.min(1,dt*.8));if(!moved){moved=true;helpEl.classList.add('gone')}}
  P.x=Math.max(-fl.xb,Math.min(fl.xb,P.x));P.z=Math.max(fl.zMin,Math.min(fl.zMax,P.z));
  if(fl.outside&&Math.random()<dt*.3){const t=H.now(),f=2600+Math.random()*1600;H.tone(f,t,.05,.04,'sine',{to:f*1.35,glide:.05});H.tone(f*1.1,t+.11,.05,.035,'sine',{to:f*1.5,glide:.05})}
  if(speed>.2){P.bob+=dt*speed*3.4;P.step+=speed*dt;if(P.step>.72){P.step=0;stepSound()}}else P.bob*=.9;
  P.speed=speed;if(marker.visible){marker.scale.setScalar(Math.max(1,marker.scale.x-dt*2));marker.material.opacity=.6+.3*Math.sin(n/150);if(!auto)marker.visible=false}
  {const elev=Math.max(.06,Math.min(1.0,.3-P.pitch*.9)),D=(fl.outside?4.2:3.3)*P.dist,bx=Math.sin(P.yaw),bz=Math.cos(P.yaw);
   let cx=P.x+bx*D*Math.cos(elev),cz=P.z+bz*D*Math.cos(elev),cy=1.35+D*Math.sin(elev);
   if(!fl.outside){cx=Math.max(-CW/2+.15,Math.min(CW/2-.15,cx));cz=Math.max(fl.z1+.15,Math.min(fl.z0-.15,cz));cy=Math.min(CH-.15,cy)}else{cz=Math.max(-1.6,cz)}
   cam.position.set(cx,cy,cz);cam.lookAt(P.x,1.25,P.z)}
  doors.forEach(d=>{if(d.floor!==P.floor)return;d.open+=(d.target-d.open)*Math.min(1,dt*(d.enter?4:7));if(d.enter){d.L.position.x=-.58-d.open*1.1;d.R.position.x=.58+d.open*1.1}else d.pivot.rotation.y=d.open*1.35});
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
  hide(){running=false;worldEl.hidden=true;cancelAnimationFrame(raf);raf=0;auto=null;busy=false;keys.clear();stick.x=stick.y=0}
};
Object.assign(api,{T,scene,cam,P,doors,floors,OUT,isRunning:()=>running});
return api;
};
