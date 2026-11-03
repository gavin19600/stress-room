/* 여러 명이 함께 — 아바타·위치(presence), 이모트·말풍선(emit), 방 인원 표시 */
H.multiStart=function(){
const W=H.world;if(!W)return;
const {T,scene,P,doors,floors,OUT}=W;
const $=id=>document.getElementById(id);
const DISP='"Black Han Sans","Noto Sans KR",sans-serif',EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const AVAS=['😀','😎','🐱','🐶','🐰','🦊','🐻','🐼','🐸','🐧','🦄','👻'];
const COLS=['#e0533f','#e2873a','#d4b13a','#5fb35a','#3f9d8c','#4f8fd6','#8a6fd6','#d66fb3','#8a8f98'];
const PHRASES=['안녕!','같이 가자','힘내!','고마워','여기 좋다','나 먼저 간다'];
const BAD=/(씨발|시발|ㅅㅂ|병신|ㅂㅅ|좆|존나|개새|새끼|꺼져|죽어|섹스|느금)/;
const ROOMNAME=id=>id&&H.rooms[id]?H.rooms[id].title:null;

/* ---------- my profile ---------- */
let me=H.store.get('me',null);
function randomNick(){const a=['조용한','씩씩한','느긋한','반짝이는','용감한','다정한','졸린','신나는'],b=['고양이','펭귄','여우','판다','토끼','곰','수달','부엉이'];return a[Math.random()*a.length|0]+' '+b[Math.random()*b.length|0]}
const SR=window.SR_CLASS;
function joinUI(){const box=$('wJoin');box.hidden=false;
  if(false){$('wCodeRow').hidden=false;$('wCode').value=SR.code||'';$('wNewCode').onclick=()=>{$('wCode').value=SR.newCode();$('wJoinNote').textContent='새 반 코드를 만들었어요. 입장한 뒤 👥 메뉴에서 우리 반 링크를 복사해 학생들에게 보내 주세요.'}}const nick=$('wNick');nick.value=me?.nick||'';nick.placeholder=randomNick();
  let ava=me?.ava||AVAS[Math.random()*AVAS.length|0],col=me?.col||COLS[Math.random()*COLS.length|0],sty=me?.sty||'teen';
  $('wSty').innerHTML=[['kid','🧒 초등 츄리닝'],['teen','🧑 중고등 체육복']].map(([k,n])=>`<button class="chip" style="font-size:14px" data-s="${k}" aria-pressed="${k===sty}">${n}</button>`).join('');
  $('wSty').querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{sty=b.dataset.s;$('wSty').querySelectorAll('[data-s]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('wAva').innerHTML=AVAS.map(a=>`<button class="chip" data-a="${a}" aria-pressed="${a===ava}">${a}</button>`).join('');
  $('wCol').innerHTML=COLS.map(c=>`<button class="swatch" data-c="${c}" style="background:${c}" aria-pressed="${c===col}" aria-label="색"></button>`).join('');
  $('wAva').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ava=b.dataset.a;$('wAva').querySelectorAll('[data-a]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('wCol').querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{col=b.dataset.c;$('wCol').querySelectorAll('[data-c]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('wGo').onclick=()=>{let n=(nick.value.trim()||nick.placeholder).slice(0,8);if(BAD.test(n)){$('wJoinNote').textContent='다른 별명을 써 주세요.';return}
    if(false){const c=$('wCode').value.trim().toLowerCase();if(!SR.re.test(c)){$('wJoinNote').textContent='반 코드는 영어 소문자와 숫자로 6~20자예요. 선생님께 받은 코드를 넣어 주세요.';return}
      const willReload=SR.code&&SR.code!==c;me={nick:n,ava,col,sty};H.store.set('me',me);if(willReload){SR.set(c);return}SR.set(c)}
    me={nick:n,ava,col,sty};H.store.set('me',me);box.hidden=true;buildSelf&&buildSelf();H.ac();const t=H.now();[523,659,784].forEach((f,i)=>H.tone(f,t+i*.09,.25,.1,'sine',{wet:true}));H.buzz([20,30,20]);pushPresence(true);buildList()}}
if(!me||!me.sty)joinUI();
$('wFloorNo').addEventListener('dblclick',joinUI);

/* ---------- avatars ---------- */
function labelTex(nick,ava,col){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
  x.fillStyle='rgba(16,13,11,.78)';const w=Math.min(500,90+[...nick].length*44);H.rr(x,(512-w)/2,14,w,96,48);x.fill();
  x.fillStyle=col;x.beginPath();x.arc((512-w)/2+48,62,30,0,7);x.fill();x.font=`40px ${EMO}`;x.textAlign='center';x.textBaseline='middle';x.fillText(ava,(512-w)/2+48,64);
  x.fillStyle='#fff';x.font=`44px ${DISP}`;x.textAlign='left';x.fillText(nick,(512-w)/2+90,66);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function emojiTex(txt,isText){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  x.fillStyle='#fffaf0';H.rr(x,20,20,472,170,60);x.fill();x.beginPath();x.moveTo(230,188);x.lineTo(256,236);x.lineTo(282,188);x.fill();
  x.fillStyle='#2a2018';x.textAlign='center';x.textBaseline='middle';x.font=isText?`64px ${DISP}`:`120px ${EMO}`;x.fillText(txt,256,108);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
/* 체육복 학생 캐릭터 — 앞이 -z, 발이 y=0 */
function chestTex(txt,font,bg){const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.beginPath();x.arc(64,64,60,0,7);x.fill()}
  x.textAlign='center';x.textBaseline='middle';x.font=font;x.fillStyle='#fff';x.fillText(txt,64,70);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function backTex(nick,col){const c=document.createElement('canvas');c.width=256;c.height=160;const x=c.getContext('2d');x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#fff';let s=60;x.font=`${s}px ${DISP}`;while(x.measureText(nick).width>236&&s>18){s-=4;x.font=`${s}px ${DISP}`}x.fillText(nick,128,52);
  x.font=`28px ${DISP}`;x.fillStyle='rgba(255,255,255,.75)';x.fillText('MIND GYM',128,120);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
const SKINS=[0xf3d0ad,0xe8bd94,0xd9a77c];const HAIRS=[0x2b1d14,0x3a2618,0x1c1a1a,0x5a3a22];
function hashStr(s){let h=0;for(const ch of String(s))h=(h*31+ch.codePointAt(0))|0;return Math.abs(h)}
function makeStudent(p){const g=new T.Group(),h=hashStr(p.nick||'x');
  const kid=p.sty==='kid',col=new T.Color(p.col||'#4f8fd6'),dark=kid?col.clone().multiplyScalar(.85):col.clone().multiplyScalar(.55);
  const jM=new T.MeshStandardMaterial({color:col,roughness:.65}),pM=new T.MeshStandardMaterial({color:dark,roughness:.7}),wM=new T.MeshStandardMaterial({color:0xffffff,roughness:.6}),
    skinM=new T.MeshStandardMaterial({color:SKINS[h%3],roughness:.7}),hairM=new T.MeshStandardMaterial({color:HAIRS[h%4],roughness:.9}),shoeM=new T.MeshStandardMaterial({color:0xf4f4f4,roughness:.5}),soleM=new T.MeshStandardMaterial({color:0x6b6f75,roughness:.8});
  const add=(geo,m,x,y,z,parent=g)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);parent.add(o);return o};
  // legs (pivot at hip)
  const legs=[-1,1].map(s=>{const pv=new T.Group();pv.position.set(s*.1,.84,0);g.add(pv);
    add(new T.CylinderGeometry(.075,.068,.72,10),pM,0,-.36,0,pv);
    const st=add(new T.BoxGeometry(.012,.7,.03),wM,s*.072,-.36,0,pv);
    add(new T.BoxGeometry(.13,.07,.25),shoeM,0,-.76,-.04,pv);add(new T.BoxGeometry(.135,.025,.26),soleM,0,-.8,-.04,pv);return pv});
  add(new T.BoxGeometry(.36,.16,.22),pM,0,.88,0);
  // torso: jacket with zipper, collar, stripes
  add(new T.BoxGeometry(.42,.52,.24),jM,0,1.18,0);
  add(new T.BoxGeometry(.02,.5,.01),wM,0,1.18,-.122);
  add(new T.BoxGeometry(.44,.06,.26),wM,0,1.45,0);
  add(new T.BoxGeometry(.44,.05,.25),new T.MeshStandardMaterial({color:dark,roughness:.7}),0,.94,0);
  const badge=add(new T.PlaneGeometry(.12,.12),new T.MeshBasicMaterial({map:chestTex(p.ava||'🙂',`88px ${EMO}`),transparent:true}),.11,1.32,-.123);badge.rotation.y=Math.PI;
  const back=add(new T.PlaneGeometry(.36,.225),new T.MeshBasicMaterial({map:backTex(p.nick||'친구'),transparent:true}),0,1.22,.122);
  // arms (pivot at shoulder)
  const arms=[-1,1].map(s=>{const pv=new T.Group();pv.position.set(s*.27,1.4,0);g.add(pv);
    add(new T.CylinderGeometry(.062,.056,.5,10),jM,0,-.25,0,pv);add(new T.BoxGeometry(.012,.48,.02),wM,s*.058,-.25,0,pv);add(new T.BoxGeometry(.012,.48,.02),wM,s*.058,-.25,.03,pv);
    add(new T.CylinderGeometry(.064,.064,.05,10),wM,0,-.5,0,pv);add(new T.SphereGeometry(.058,10,8),skinM,0,-.56,0,pv);pv.rotation.z=s*.08;return pv});
  // head
  add(new T.CylinderGeometry(.06,.07,.08,10),skinM,0,1.5,0);
  const head=new T.Group();head.position.y=1.66;g.add(head);
  add(new T.SphereGeometry(.17,20,16),skinM,0,0,0,head);
  const hair=add(new T.SphereGeometry(.18,18,12,0,Math.PI*2,0,Math.PI*.55),hairM,0,.02,.012,head);
  add(new T.BoxGeometry(.3,.06,.08),hairM,0,.09,-.13,head);
  const eM=new T.MeshBasicMaterial({color:0x1b120c});[-.06,.06].forEach(x=>add(new T.SphereGeometry(.022,8,6),eM,x,.01,-.158,head));
  const cheek=new T.MeshBasicMaterial({color:0xf29a8a,transparent:true,opacity:.6});[-.1,.1].forEach(x=>add(new T.SphereGeometry(.025,8,6),cheek,x,-.04,-.14,head));
  const mouth=add(new T.TorusGeometry(.035,.009,6,12,Math.PI),eM,0,-.055,-.158,head);mouth.rotation.z=Math.PI;
  const shadow=add(new T.CircleGeometry(.32,20),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false}),0,.015,0);shadow.rotation.x=-Math.PI/2;
  if(kid){// 츄리닝: 가슴 흰 띠, 후드, 큰 머리, 작은 몸
    add(new T.BoxGeometry(.43,.07,.25),wM,0,1.24,0);add(new T.BoxGeometry(.43,.03,.25),new T.MeshStandardMaterial({color:col.clone().lerp(new T.Color(0xffffff),.5),roughness:.6}),0,1.19,0);
    const hood=add(new T.SphereGeometry(.16,14,10,0,Math.PI*2,0,Math.PI*.6),jM,0,1.46,.13);hood.rotation.x=-1.9;hood.scale.set(1.15,1,.7);
    [-.05,.05].forEach(x=>{add(new T.CylinderGeometry(.008,.008,.16,6),wM,x,1.36,-.13)});
    head.scale.setScalar(1.32);head.position.y=1.74;g.scale.set(.86,.78,.86)}
  const headY=head.position.y;
  g.userData={legs,arms,head,phase:0};
  g.userData.pose=(dt,speed)=>{const u=g.userData,amt=Math.min(1,speed/2.4);if(amt>.05)u.phase+=dt*speed*4.2;else u.phase*=.85;
    const sw=Math.sin(u.phase)*.7*amt;legs[0].rotation.x=sw;legs[1].rotation.x=-sw;arms[0].rotation.x=-sw*.8;arms[1].rotation.x=sw*.8;
    head.position.y=headY+Math.abs(Math.cos(u.phase))*.025*amt;g.children.forEach(()=>{});};
  return g}

function makeAvatar(p){const g=new T.Group();const body=makeStudent(p);g.add(body);
  const label=new T.Sprite(new T.SpriteMaterial({map:labelTex(p.nick||'친구',p.ava||'🙂',p.col||'#8a8f98'),depthWrite:false}));label.scale.set(1.3,.325,1);label.position.y=p.sty==='kid'?1.95:2.12;label.visible=!p.self;g.add(label);
  const bubble=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false}));bubble.scale.set(.9,.45,1);bubble.position.y=(p.self?2.25:2.6)-(p.sty==='kid'?.2:0);bubble.visible=false;g.add(bubble);
  g.visible=false;scene.add(g);return{g,body,label,bubble}}
function disposeAvatar(av){scene.remove(av.g);av.g.traverse(m=>{m.geometry&&m.geometry.dispose();if(m.material){(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>{x.map&&x.map.dispose();x.dispose()})}})}

let selfAv=null,selfBubbleT=0;
function buildSelf(){if(selfAv)disposeAvatar(selfAv);selfAv=makeAvatar({nick:me?.nick||'나',ava:me?.ava||'🙂',col:me?.col||'#4f8fd6',sty:me?.sty||'teen',self:true})}
buildSelf();
const others=new Map();// peer -> state
let room=null,connected=false,canEmote=true;

function applyPresence(peer){const pr=peer.presence||{};let o=others.get(peer.peer);
  const nick=String(pr.nick||'친구').slice(0,8),ava=AVAS.includes(pr.ava)?pr.ava:'🙂',col=COLS.includes(pr.col)?pr.col:'#8a8f98',sty=pr.sty==='kid'?'kid':'teen';
  if(!o){o={peer:peer.peer,av:makeAvatar({nick,ava,col,sty}),x:+pr.x||0,z:+pr.z||0,yaw:+pr.yaw||0,bob:0,bubbleT:0};others.set(peer.peer,o)}
  if(o.nick!==undefined&&(o.nick!==nick||o.ava!==ava||o.col!==col||o.sty!==sty)){disposeAvatar(o.av);o.av=makeAvatar({nick,ava,col,sty})}
  Object.assign(o,{nick,ava,col,sty,fl:Number.isInteger(pr.fl)?pr.fl:-1,rm:typeof pr.rm==='string'&&H.rooms[pr.rm]?pr.rm:null,tx:+pr.x||0,tz:+pr.z||0,tyaw:+pr.yaw||0,guest:peer.guest,idle:Date.now()-peer.updatedAt>120000})}
function removePeer(id){const o=others.get(id);if(!o)return;disposeAvatar(o.av);others.delete(id)}

/* ---------- door badges: how many friends are in each room ---------- */
const badgeTexCache={};
function badgeTex(n){if(badgeTexCache[n])return badgeTexCache[n];const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
  x.fillStyle='#7ee0a8';H.rr(x,8,8,240,112,56);x.fill();x.fillStyle='#10301f';x.font=`64px ${DISP}`;x.textAlign='center';x.textBaseline='middle';x.fillText(`👥 ${n}`,128,68);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return badgeTexCache[n]=t}
doors.forEach(d=>{if(d.enter)return;const s=new T.Sprite(new T.SpriteMaterial({depthWrite:false}));s.scale.set(.6,.3,1);
  const side=d.front.x<0?-1:1;s.position.set(side*1.85,2.75,d.front.z);s.visible=false;floors[d.floor].g.add(s);d.badge=s});
function refreshCounts(){const cnt={};others.forEach(o=>{if(o.rm)cnt[o.rm]=(cnt[o.rm]||0)+1});
  doors.forEach(d=>{if(!d.badge)return;const n=cnt[d.id]||0;d.badge.visible=n>0;if(n){d.badge.material.map=badgeTex(n);d.badge.material.needsUpdate=true}});
  const total=others.size+1;$('wCount').textContent=total;
  const rp=$('rPeople');if(H.lastRoom&&cnt[H.lastRoom]){rp.hidden=false;rp.textContent=`👥 친구 ${cnt[H.lastRoom]}명 같이 있어요`}else rp.hidden=true;
  if(!$('wPlist').hidden)buildList()}
function where(o){if(o.rm)return ROOMNAME(o.rm)+' 방';if(o.fl===OUT)return'건물 밖';if(o.fl>=0&&o.fl<3)return`${o.fl+1}층 복도`;return'목록 보는 중'}
function buildList(){const L=$('wPlist');const mine={nick:me?.nick||'나',col:me?.col||'#888',rm:H.lastRoom,fl:H.listMode?-1:P.floor};
  const rows=[[mine,true],...[...others.values()].map(o=>[o,false])];
  L.innerHTML=rows.map(([o,isMe])=>`<div><i style="background:${o.col}"></i><span>${H.esc(o.nick)}${isMe?' (나)':''}</span><small>${H.esc(where(o))}</small></div>`).join('')+
    `<div><button class="chip" id="wEditMe" style="width:100%;font-size:13px">✏️ 내 캐릭터 바꾸기</button></div>`+
    (SR&&SR.ok?`<div><button class="chip" id="wCopyLink" style="width:100%;font-size:13px">🔗 사이트 주소 복사</button></div><div><button class="chip" id="wCopyId" style="width:100%;font-size:12px">🪪 선생님 등록용 내 ID 복사</button></div>`:'')+
    (connected?'':'<div><small>함께 보기에 연결되지 않았어요. 혼자서도 모든 방을 쓸 수 있어요.</small></div>')}
$('wPeople').onclick=()=>{const L=$('wPlist');L.hidden=!L.hidden;$('wPeople').setAttribute('aria-expanded',!L.hidden);if(!L.hidden)buildList()};
function copyText(t,btn){const done=()=>{const o=btn.textContent;btn.textContent='복사했어요 ✓';setTimeout(()=>{btn.textContent=o},1500)};
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(done).catch(()=>{window.prompt('아래 내용을 복사하세요',t)})}
$('wPlist').addEventListener('click',e=>{const id=e.target.id;if(id==='wEditMe'){$('wPlist').hidden=true;joinUI()}
  else if(id==='wCopyLink')copyText(SR.link(),e.target);else if(id==='wCopyId')copyText(SR.uid||'',e.target)});

/* ---------- emotes & phrases ---------- */
function showBubble(o,txt,isText){const b=o.av.bubble;b.material.map&&b.material.map.dispose();b.material.map=emojiTex(txt,isText);b.material.needsUpdate=true;b.visible=true;o.bubbleT=3.2;b.scale.set(isText?1.3:.9,isText?.65:.45,1)}
const selfBubble=document.createElement('div');selfBubble.style.cssText='position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:46px;pointer-events:none;transition:opacity .5s,transform .5s;opacity:0;text-shadow:0 4px 12px rgba(0,0,0,.4);font-family:"Black Han Sans",sans-serif;color:#fff';
$('world').appendChild(selfBubble);let selfT=0;
function showSelf(txt){selfBubble.textContent=txt;selfBubble.style.opacity=1;selfBubble.style.transform='translate(-50%,-70%)';clearTimeout(selfT);selfT=setTimeout(()=>{selfBubble.style.opacity=0;selfBubble.style.transform='translate(-50%,-50%)'},1400)}
function send(topic,data,txt){if(selfAv){showBubble({av:selfAv,set bubbleT(v){selfBubbleT=v}},txt,topic==='say')}else showSelf(txt);const t=H.now();H.tone(880,t,.1,.1,'sine');H.buzz(12);
  if(!room||!connected)return;room.emit(topic,data).catch(e=>{if(e&&e.code==='not_permitted'){canEmote=false;showSelf('보기 전용이라 보낼 수 없어요')}})}
const EM=['👋','💪','❤️','👏','😂'];
$('wEmotes').querySelectorAll('[data-em]').forEach(b=>b.onclick=()=>{if(!canEmote)return;send('emote',{e:EM.indexOf(b.dataset.em)},b.dataset.em)});
$('wSay').innerHTML=PHRASES.map((p,i)=>`<button data-ph="${i}">${p}</button>`).join('');
$('wSayBtn').onclick=()=>{const s=$('wSay');s.hidden=!s.hidden;$('wSayBtn').setAttribute('aria-expanded',!s.hidden)};
$('wSay').querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>{$('wSay').hidden=true;if(!canEmote)return;send('say',{i:+b.dataset.ph},PHRASES[+b.dataset.ph])});
$('wEmotes').hidden=false;

function heard(msg,isText){if(msg.sameTab)return;const o=others.get(msg.peer);if(!o)return;
  let txt=null;if(isText){const i=msg.data&&msg.data.i;if(Number.isInteger(i)&&PHRASES[i])txt=PHRASES[i]}else{const i=msg.data&&msg.data.e;if(Number.isInteger(i)&&EM[i])txt=EM[i]}
  if(!txt)return;showBubble(o,txt,isText);
  if(o.fl===P.floor&&!o.rm&&W.isRunning()){const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<12){const t=H.now();H.tone(isText?660:990,t,.12,.08*(1-d/12)+.02,'sine',{wet:true});H.buzz(10)}}}

/* ---------- presence out ---------- */
let lastSent={},lastT=0;
function myState(){const inWorld=W.isRunning();return{nick:me?.nick||'친구',ava:me?.ava||'🙂',col:me?.col||'#8a8f98',sty:me?.sty==='kid'?'kid':'teen',
  fl:H.listMode&&!H.lastRoom?-1:(inWorld||H.lastRoom?P.floor:-1),rm:H.lastRoom||null,x:Math.round(P.x*100)/100,z:Math.round(P.z*100)/100,yaw:Math.round(P.face*100)/100}}
function pushPresence(force){if(!room||!me)return;const s=myState();const ch=force||Object.keys(s).some(k=>s[k]!==lastSent[k]);if(!ch)return;lastSent=s;room.presence(s).catch(()=>{})}
H.onRoute=()=>{pushPresence(true);refreshCounts()};

/* ---------- per-frame ---------- */
W.tick=(dt,running)=>{const now=performance.now();if(now-lastT>90){lastT=now;pushPresence(false)}
  if(selfAv){selfAv.g.visible=running;selfAv.g.position.set(P.x,0,P.z);selfAv.g.rotation.y=P.face;selfAv.body.userData.pose(dt,P.speed||0);
    if(selfBubbleT>0){selfBubbleT-=dt;selfAv.bubble.material.opacity=Math.min(1,selfBubbleT*2);if(selfBubbleT<=0)selfAv.bubble.visible=false}}
  others.forEach(o=>{const vis=running&&!o.rm&&o.fl===P.floor;o.av.g.visible=vis;if(!vis){o.x=o.tx;o.z=o.tz;o.yaw=o.tyaw;return}
    const k=Math.min(1,dt*8),px=o.x,pz=o.z;o.x+=(o.tx-o.x)*k;o.z+=(o.tz-o.z)*k;let dy=((o.tyaw-o.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;o.yaw+=dy*k;
    const sp=Math.hypot(o.x-px,o.z-pz)/Math.max(dt,.001);if(sp>.3)o.bob+=dt*10;else o.bob*=.9;
    o.av.g.position.set(o.x,0,o.z);o.av.g.rotation.y=o.yaw;o.av.body.userData.pose(dt,Math.min(3,sp));o.av.label.material.opacity=o.idle?.5:1;
    if(o.bubbleT>0){o.bubbleT-=dt;o.av.bubble.material.opacity=Math.min(1,o.bubbleT*2);if(o.bubbleT<=0)o.av.bubble.visible=false}})};

/* ---------- connect ---------- */
(async()=>{const c=window.claude;if(!c||!c.use)return;room=await c.use('room').catch(()=>null);if(!room)return;
  room.onConnection(v=>{connected=v;if(v)pushPresence(true);refreshCounts()},()=>{connected=false;refreshCounts()});
  room.onPeers(ch=>{ch.left.forEach(p=>removePeer(p.peer));
    ch.peers.forEach(p=>{if(p.sameTab||p.kind!=='viewer')return;if(!p.presence||!p.presence.nick)return;applyPresence(p)});
    // drop anything no longer present
    const live=new Set(ch.peers.map(p=>p.peer));[...others.keys()].forEach(k=>{if(!live.has(k))removePeer(k)});
    const joined=ch.joined.filter(p=>!p.isMe&&p.presence&&p.presence.nick);
    if(joined.length&&W.isRunning()){const t=H.now();H.tone(784,t,.15,.06,'sine',{wet:true});H.tone(1175,t+.1,.2,.05,'sine',{wet:true})}
    refreshCounts()},()=>{});
  room.on('emote',m=>heard(m,false),()=>{});room.on('say',m=>heard(m,true),()=>{});
  pushPresence(true)})();
};
