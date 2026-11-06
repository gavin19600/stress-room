/* Firebase 연결층
   해소방 코드가 쓰는 claude.use('room' | 'db' | 'user') 를 Firebase 익명 로그인 + Realtime Database 로 대신합니다.
   - 반 코드(c=...)마다 데이터 공간이 완전히 나뉩니다. 코드를 모르면 그 반의 어떤 데이터도 읽을 수 없습니다.
   - 모든 쓰기는 서버 보안 규칙(database.rules.json)이 다시 검사합니다. 이 파일의 검사는 편의용입니다. */
(function(){
const CODE_RE=/^[a-z0-9]{6,20}$/;
const cfg=window.FIREBASE_CONFIG||{};
const ready=!!(window.firebase&&cfg.apiKey&&cfg.databaseURL&&!/여기에/.test(cfg.apiKey+cfg.databaseURL));
/* 반 코드 없이 모두 한 공간(main)을 씁니다. 데이터 경로: c/mainroom/... */
let code='mainroom';
let codeResolve;const codeP=new Promise(r=>codeResolve=r);codeResolve(code);
const SR=window.SR_CLASS={ok:ready,re:CODE_RE,get code(){return code},uid:null,
  link(){const u=new URL(location.href);u.search='';u.hash='';return u.toString()},
  newCode(){return code},set(){return true}};
if(!ready){if(window.firebase===undefined)console.warn('Firebase를 불러오지 못해 혼자 모드로 실행합니다.');else console.warn('fb-config.js 설정값이 비어 있어 혼자 모드로 실행합니다.');return}

firebase.initializeApp(cfg);
const auth=firebase.auth(),db=firebase.database(),TS=firebase.database.ServerValue.TIMESTAMP;
let uid=null;
const authP=new Promise(res=>{auth.onAuthStateChanged(u=>{if(u){uid=u.uid;SR.uid=u.uid;res(u.uid)}});
  auth.signInAnonymously().catch(e=>console.error('익명 로그인 실패 — Firebase 콘솔에서 익명 로그인을 켰는지 확인하세요.',e))});
const ok=()=>Promise.all([authP,codeP]);
const base=()=>`c/${code}`;
let offset=0;db.ref('.info/serverTimeOffset').on('value',s=>{offset=s.val()||0});
const err=e=>({code:e&&e.code==='PERMISSION_DENIED'?'invalid_argument':'unavailable',message:String(e&&e.message||e)});

/* ---------------- db ---------------- */
const STAMP=['at'];const RATE={wall:'last',replies:'lastr'};
const prep=d=>{const o={};Object.keys(d).forEach(k=>{if(d[k]!==undefined&&d[k]!==null)o[k]=STAMP.includes(k)?TS:d[k]});return o};
const okSeg=s=>/^[A-Za-z0-9_\-]{1,120}$/.test(s);
function docsOf(snap,desc){const docs=[];snap.forEach(ch=>{const v=ch.val();docs.push({id:ch.key,exists:true,data:()=>v,metadata:{fromCache:false,hasPendingWrites:false}})});if(desc)docs.reverse();return docs}
function query(col,m){return{
  where(f,op,v){return query(col,{...m,where:[f,op,v]})},
  orderBy(f,dir){return query(col,{...m,order:[f,dir||'asc']})},
  limit(n){return query(col,{...m,limit:Math.max(1,Math.min(1000,n|0))})},
  onSnapshot(next,onErr){let alive=true,off=()=>{};
    ok().then(()=>{if(!alive)return;let q=db.ref(`${base()}/${col}`);
      if(m.where)q=q.orderByChild(m.where[0]).equalTo(m.where[2]);else if(m.order)q=q.orderByChild(m.order[0]);
      const desc=m.order&&m.order[1]==='desc';
      if(m.limit)q=(desc||!m.order)?q.limitToLast(m.limit):q.limitToFirst(m.limit);
      const cb=s=>{const docs=docsOf(s,desc);next({docs,size:docs.length,empty:!docs.length,metadata:{fromCache:false,hasPendingWrites:false},docChanges:()=>[]})};
      q.on('value',cb,e=>{onErr&&onErr(err(e))});off=()=>q.off('value',cb)});
    return()=>{alive=false;off()}},
  async get(){await ok();const s=await db.ref(`${base()}/${col}`).once('value');const docs=docsOf(s,false);return{docs,size:docs.length,empty:!docs.length}}}}
function collection(col){if(!okSeg(col))throw new TypeError('bad collection');return Object.assign(query(col,{}),{path:col,
  doc(id){return doc(`${col}/${id||db.ref().push().key}`)},
  async add(d){await ok();const key=db.ref(`${base()}/${col}`).push().key,up={};up[`${col}/${key}`]=prep(d);if(RATE[col])up[`${RATE[col]}/${uid}`]=TS;
    try{await db.ref(base()).update(up)}catch(e){throw err(e)}return doc(`${col}/${key}`)}})}
function doc(path){const [col,id]=String(path).split('/');if(!okSeg(col)||!okSeg(id))throw new TypeError('bad doc path');const r=()=>db.ref(`${base()}/${col}/${id}`);
  return{id,path,
    async get(){await ok();const s=await r().once('value');const v=s.val();return{id,exists:v!==null,data:()=>v===null?undefined:v,metadata:{fromCache:false,hasPendingWrites:false}}},
    async set(d){await ok();try{await r().set(prep(d))}catch(e){throw err(e)}},
    async update(d){await ok();try{await r().update(prep(d))}catch(e){throw err(e)}},
    async delete(){await ok();try{await r().remove()}catch(e){throw err(e)}},
    onSnapshot(next,onErr){let alive=true,off=()=>{};ok().then(()=>{if(!alive)return;const ref=r(),cb=s=>{const v=s.val();next({id,exists:v!==null,data:()=>v===null?undefined:v,metadata:{fromCache:false,hasPendingWrites:false}})};
      ref.on('value',cb,e=>{onErr&&onErr(err(e))});off=()=>ref.off('value',cb)});return()=>{alive=false;off()}}}}
const dbApi=Object.freeze({collection,doc});

/* ---------------- user ---------------- */
let adminP=null;
const userApi=Object.freeze({
  async id(){await authP;return uid},
  async isOwner(){await authP;if(!adminP)adminP=db.ref(`admins/${uid}`).once('value').then(s=>s.val()===true).catch(()=>false);return adminP},
  async canEdit(){return userApi.isOwner()},
  async can(){return true}});

/* ---------------- room (함께 보기) ---------------- */
const peers=new Map();let peersArr=Object.freeze([]);const peerHs=new Set(),connHs=new Set(),topicHs={};
let connected=false,mine={},sendT=0,lastSend=0,pending=false,pend={joined:[],left:[],updated:[]},raf=0;
const myRef=()=>db.ref(`${base()}/presence/${uid}`);
const clean=v=>{const o={};const s=(x,n)=>typeof x==='string'?x.slice(0,n):undefined;
  if(v.nick)o.nick=s(v.nick,8);if(v.ava)o.ava=s(v.ava,8);if(typeof v.col==='string'&&/^#[0-9a-f]{6}$/.test(v.col))o.col=v.col;if(v.sty==='kid'||v.sty==='teen')o.sty=v.sty;
  if(Number.isInteger(v.fl)&&v.fl>=-1&&v.fl<=6)o.fl=v.fl;if(typeof v.rm==='string'&&v.rm.length<=12)o.rm=v.rm;if(Number.isInteger(v.jp)&&v.jp>=0&&v.jp<=999)o.jp=v.jp;
  ['x','z','yaw'].forEach(k=>{if(typeof v[k]==='number'&&isFinite(v[k]))o[k]=Math.round(v[k]*100)/100});
  o.x=Math.max(-45,Math.min(45,o.x||0));o.z=Math.max(-45,Math.min(45,o.z||0));if(!o.nick)o.nick='친구';return o};
function flush(){pending=false;lastSend=Date.now();if(!connected||!uid||!code)return;myRef().set({...clean(mine),t:TS}).catch(e=>console.warn('presence',e))}
function schedule(){if(pending)return;pending=true;const wait=Math.max(0,300-(Date.now()-lastSend));clearTimeout(sendT);sendT=setTimeout(flush,wait)}
function toPeer(id,v){return Object.freeze({peer:id,by:id,isMe:id===uid,sameTab:id===uid,kind:'viewer',guest:false,updatedAt:Date.now(),presence:Object.freeze({...v})})}
function notify(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;peersArr=Object.freeze([...peers.values()]);const ch={peers:peersArr,joined:pend.joined,left:pend.left,updated:pend.updated};pend={joined:[],left:[],updated:[]};peerHs.forEach(h=>{try{h(ch)}catch(e){console.error(e)}})})}
let started=false;
function start(){if(started)return;started=true;
  ok().then(()=>{
    db.ref('.info/connected').on('value',s=>{connected=s.val()===true;if(connected){myRef().onDisconnect().remove();schedule()}connHs.forEach(h=>h(connected))});
    const pr=db.ref(`${base()}/presence`);
    const fresh=v=>v&&typeof v==='object'&&(!v.t||Date.now()+offset-v.t<15*60*1000);
    pr.on('child_added',s=>{const v=s.val();if(!fresh(v))return;const p=toPeer(s.key,v);peers.set(s.key,p);pend.joined.push(p);notify()});
    pr.on('child_changed',s=>{const v=s.val();const p=toPeer(s.key,v);const had=peers.has(s.key);peers.set(s.key,p);(had?pend.updated:pend.joined).push(p);notify()});
    pr.on('child_removed',s=>{const p=peers.get(s.key);if(p){peers.delete(s.key);pend.left.push(p);notify()}});
    db.ref(`${base()}/ev`).orderByChild('t').startAt(Date.now()+offset-3000).on('child_added',s=>{const v=s.val();if(!v||!topicHs[v.k])return;
      const msg=Object.freeze({topic:v.k,data:v.k==='emote'?{e:v.i}:{i:v.i},peer:v.by,by:v.by,isMe:v.by===uid,sameTab:v.by===uid,kind:'viewer',guest:false});
      topicHs[v.k].forEach(h=>{try{h(msg)}catch(e){console.error(e)}})});
    // 오래 방치된 내 이모트 기록 지우기
    db.ref(`${base()}/ev`).orderByChild('by').equalTo(uid).once('value').then(s=>s.forEach(ch=>{ch.ref.remove().catch(()=>{})})).catch(()=>{});
  })}
let lastEmit=0;
const roomApi=Object.freeze({
  connected:()=>connected,
  onConnection(h){connHs.add(h);setTimeout(()=>h(connected),0);start();return()=>connHs.delete(h)},
  onPeers(h){peerHs.add(h);start();setTimeout(()=>h({peers:peersArr,joined:peersArr,left:[],updated:[]}),0);return()=>peerHs.delete(h)},
  peers:()=>peersArr,
  async presence(patch){Object.keys(patch||{}).forEach(k=>{if(patch[k]===null)delete mine[k];else mine[k]=patch[k]});start();await ok();schedule()},
  on(topic,h){(topicHs[topic]=topicHs[topic]||new Set()).add(h);start();return()=>topicHs[topic].delete(h)},
  async emit(topic,data){await ok();if(topic!=='emote'&&topic!=='say')throw{code:'invalid_argument',message:'topic'};
    const n=Date.now();if(n-lastEmit<700)return;lastEmit=n;
    const i=data&&(Number.isInteger(data.e)?data.e:data.i);if(!Number.isInteger(i)||i<0||i>5)throw{code:'invalid_argument',message:'data'};
    const ref=db.ref(`${base()}/ev`).push();ref.onDisconnect().remove();
    try{await ref.set({k:topic,i,by:uid,t:TS})}catch(e){throw err(e)}setTimeout(()=>ref.remove().catch(()=>{}),15000)}});

window.SR_FB=Object.freeze({db,TS,ready:ok,base,uid:()=>uid,now:()=>Date.now()+offset});
window.claude=Object.freeze({use:async n=>n==='db'?dbApi:n==='user'?userApi:n==='room'?roomApi:null});
})();
