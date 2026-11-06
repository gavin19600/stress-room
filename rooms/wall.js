/* 익명 응원 벽 방 (공유) */
H.register('wall',{title:'응원 벽',sub:'힘든 일을 익명으로 붙이고, 서로 하트와 응원 한 줄',floor:3,icon:'💌',color:'#f2b84b',scroll:true,
blurb:'익명 쪽지에 하트와 응원 한 줄',
mount(root){
const COLORS=['#fff3a8','#ffd1dc','#c9f2d4','#cfe6ff','#ffe0b8','#e5d4ff'];
root.innerHTML=`
<style>
.wl-compose{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:14px;background:var(--panel);border:1px solid var(--line)}
.wl-colors{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.wl-colors .btn{white-space:nowrap;flex:none}
.wl-colors button[data-c]{width:26px;height:26px;border-radius:50%;border:2px solid transparent;cursor:pointer}
.wl-colors button[data-c][aria-pressed="true"]{border-color:var(--fg)}
.wl-board{columns:2 200px;column-gap:12px}
.note-card{break-inside:avoid;margin:0 0 12px;padding:12px 12px 10px;border-radius:4px 4px 12px 4px;color:#2a2117;box-shadow:0 6px 14px rgba(0,0,0,.35);transform:rotate(var(--r));display:flex;flex-direction:column;gap:8px}
.note-card p{margin:0;font-family:var(--hand);font-size:24px;line-height:1.15;word-break:keep-all;overflow-wrap:anywhere}
.note-meta{display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(42,33,23,.65)}
.note-meta .sp{flex:1}
.heart{border:0;background:rgba(255,255,255,.55);border-radius:999px;padding:4px 9px;font-size:13px;cursor:pointer;color:#2a2117;font-variant-numeric:tabular-nums}
.heart[aria-pressed="true"]{background:#ff6b8a;color:#fff}
.mini{border:0;background:none;font-size:11px;color:rgba(42,33,23,.7);cursor:pointer;text-decoration:underline;padding:2px}
.replies{display:flex;flex-direction:column;gap:4px;border-top:1px dashed rgba(42,33,23,.25);padding-top:6px}
.replies div{font-size:13px;line-height:1.35}
.replies div::before{content:"↳ ";color:rgba(42,33,23,.5)}
.rep-form{display:flex;gap:4px}
.rep-form input{flex:1;min-width:0;border:1px solid rgba(42,33,23,.25);background:rgba(255,255,255,.6);border-radius:6px;padding:6px 8px;font-size:13px;color:#2a2117}
.rep-form button{border:0;background:#2a2117;color:#fff;border-radius:6px;padding:6px 9px;font-size:12px;cursor:pointer}
.mosaic{display:inline-block;padding:0 2px;border-radius:3px;color:transparent;text-shadow:none;user-select:none;
  background:repeating-conic-gradient(rgba(42,33,23,.55) 0 25%,rgba(42,33,23,.25) 0 50%) 0 0/8px 8px;filter:blur(.4px)}
.note-card.hid p,.note-card.hid .replies{filter:blur(7px);user-select:none;pointer-events:none}
.note-card.hid{position:relative;min-height:128px}
.note-card.hid .note-meta{visibility:hidden}
.hid-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:10px;
  background:repeating-conic-gradient(rgba(0,0,0,.09) 0 25%,rgba(255,255,255,.12) 0 50%) 0 0/14px 14px;border-radius:inherit;font-size:13px;font-weight:700;color:#2a2117}
.hid-cover small{font-weight:400;font-size:11px;opacity:.75}
.hid-cover .mini{font-size:12px}
.flag[aria-pressed="true"]{color:#c0392b;font-weight:700;text-decoration:none}
.help-line{font-size:12px;background:rgba(255,255,255,.6);border-radius:8px;padding:5px 8px;line-height:1.4}
.help-line a{color:#c0392b;font-weight:700}
.rx{border:0;background:none;color:rgba(42,33,23,.5);cursor:pointer;font-size:12px;padding:0 4px}
.tch{font-size:11px;padding:3px 8px;border-radius:999px;background:#2a2117;color:#ffd34d;align-self:flex-start}
.wl-empty{padding:28px 16px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:14px;font-size:14px;line-height:1.6}
</style>
<div class="wl-compose">
  <textarea class="field" id="wl-txt" rows="2" maxlength="80" placeholder="오늘 힘들었던 일, 한 줄로 털어놓기 (이름은 안 남아요)"></textarea>
  <div class="wl-colors" data-r="colors">${COLORS.map((c,i)=>`<button style="background:${c}" aria-pressed="${i===0}" aria-label="쪽지 색 ${i+1}" data-c="${i}"></button>`).join('')}
    <span class="note" data-r="left" style="margin-left:auto">0/80</span><button class="btn" data-r="post">익명으로 붙이기</button></div>
</div>
<p class="note" data-r="status">불러오는 중…</p>
<div class="wl-board" data-r="board"></div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`),txt=root.querySelector('#wl-txt');
let color=0,posts=[],hearts=[],replies=[],sh=null,local=false,unsubs=[],alive=true,openReply=null,timer=null;
q('colors').querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{color=+b.dataset.c;q('colors').querySelectorAll('[data-c]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
txt.addEventListener('input',()=>{q('left').textContent=`${[...txt.value].length}/80`});
/* ---- 거르기: 욕설·비하·개인정보는 모자이크, 신고 3번이면 쪽지 전체를 가려요 ---- */
const {BAD,PRIV,CRISIS,hasBad,safeHTML}=H.filter;
const HIDE_AT=3,GONE_AT=6;let reports=[],reveal=new Set();

function render(){const board=q('board');const ri=openReply&&root.querySelector(`[data-rin="${openReply}"]`),keep=ri?ri.value:'',foc=ri&&document.activeElement===ri;
  renderInner(board);if(keep||foc){const n=root.querySelector(`[data-rin="${openReply}"]`);if(n){n.value=keep;if(foc)n.focus()}}}
function renderInner(board){
  if(!posts.length){board.innerHTML=`<div class="wl-empty">아직 붙은 쪽지가 없어요.<br>첫 쪽지를 붙이면 친구들이 하트와 응원을 남겨 줄 거예요.</div>`;return}
  const hc={},mine={};hearts.forEach(h=>{hc[h.post]=(hc[h.post]||0)+1;if(h.by===sh?.uid)mine[h.post]=true});
  const rp={};replies.forEach(r=>{(rp[r.post]=rp[r.post]||[]).push(r)});
  const rc={},myRep={};reports.forEach(r=>{rc[r.post]=(rc[r.post]||0)+1;if(r.by===sh?.uid)myRep[r.post]=true});
  const T=!!sh?.owner;
  const list=posts.filter(p=>T||(rc[p.id]||0)<GONE_AT);
  if(!list.length){board.innerHTML=`<div class="wl-empty">아직 붙은 쪽지가 없어요.<br>첫 쪽지를 붙이면 친구들이 하트와 응원을 남겨 줄 거예요.</div>`;return}
  board.innerHTML=list.map(p=>{const rot=((p.id.charCodeAt(0)+p.id.charCodeAt(p.id.length-1))%7-3)*.6;const rs=(rp[p.id]||[]).sort((a,b)=>a.at-b.at);
    const canDel=local||p.author===sh?.uid||T;const n=rc[p.id]||0,hid=n>=HIDE_AT&&!reveal.has(p.id),mineP=p.author===sh?.uid;
    const cover=hid?`<div class="hid-cover">🙈 가려진 쪽지<small>친구들이 ${T?n+'번 ':''}신고해서 가렸어요</small>${T?`<button class="mini" data-show="${p.id}">선생님만 보기</button>`:''}${canDel?`<button class="mini" data-del="${p.id}">떼기</button>`:''}</div>`:'';
    return `<article class="note-card${hid?' hid':''}" style="background:${COLORS[p.color]||COLORS[0]};--r:${rot}deg">
      ${T&&n?`<span class="tch">🚩 신고 ${n}${n>=GONE_AT?' · 학생들에게 안 보임':n>=HIDE_AT?' · 가려짐':''}</span>`:''}
      <p>${safeHTML(String(p.text||''))}</p>
      ${CRISIS.test(p.text||'')?`<div class="help-line">💛 많이 힘들면 <a href="tel:1388">1388</a>, <a href="tel:109">109</a>로 전화해 줘. 24시간 들어 줘요.</div>`:''}
      <div class="note-meta"><span>${H.ago(p.at)}</span><span class="sp"></span>
        ${canDel?`<button class="mini" data-del="${p.id}">떼기</button>`:''}
        ${T&&n?`<button class="mini" data-clear="${p.id}">가림 풀기</button>`:''}
        ${!local&&!mineP&&!T?`<button class="mini flag" aria-pressed="${!!myRep[p.id]}" data-flag="${p.id}">${myRep[p.id]?'🚩 신고함':'🚩 신고'}</button>`:''}
        <button class="mini" data-rep="${p.id}">응원 달기</button>
        <button class="heart" aria-pressed="${!!mine[p.id]}" data-heart="${p.id}" aria-label="하트">♥ ${hc[p.id]||0}</button></div>
      ${rs.length?`<div class="replies">${rs.slice(-5).map(r=>`<div>${safeHTML(String(r.text||''))}${T||r.author===sh?.uid||local?`<button class="rx" data-rdel="${r.id}" aria-label="응원 지우기">×</button>`:''}</div>`).join('')}</div>`:''}
      ${openReply===p.id?`<form class="rep-form" data-form="${p.id}"><input maxlength="40" placeholder="따뜻한 한 마디" data-rin="${p.id}"><button>달기</button></form>`:''}
      ${cover}
    </article>`}).join('');
  board.querySelectorAll('[data-flag]').forEach(b=>b.onclick=()=>flag(b.dataset.flag,b));
  board.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>{reveal.add(b.dataset.show);render()});
  board.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>clearReports(b.dataset.clear));
  board.querySelectorAll('[data-rdel]').forEach(b=>b.onclick=()=>delReply(b.dataset.rdel));
  board.querySelectorAll('[data-heart]').forEach(b=>b.onclick=()=>toggleHeart(b.dataset.heart));
  board.querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{openReply=openReply===b.dataset.rep?null:b.dataset.rep;render();const i=root.querySelector(`[data-rin="${openReply}"]`);i&&i.focus()});
  board.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>delPost(b.dataset.del,b));
  board.querySelectorAll('[data-form]').forEach(f=>f.onsubmit=e=>{e.preventDefault();const v=f.querySelector('input').value.trim();if(v)addReply(f.dataset.form,v)})}

function chime(){const t=H.now();H.tone(784,t,.15,.1,'sine',{wet:true});H.tone(1175,t+.08,.25,.08,'sine',{wet:true});H.buzz(15)}
function saveLocal(){H.store.set('wallLocal',{posts,hearts,replies})}
async function post(){const v=txt.value.trim();if(!v){txt.focus();return}
  BAD.lastIndex=0;if(BAD.test(v)){warn('욕설이나 상처 주는 말은 빼고 적어 줄래요? 마음은 충분히 전해져요.');return}
  PRIV.lastIndex=0;if(PRIV.test(v)){warn('전화번호·주소·아이디 같은 개인 정보는 붙일 수 없어요.');return}
  const wait=15000-(Date.now()-(post.last||0));if(!local&&wait>0){q('status').textContent=`쪽지는 15초에 한 장씩 붙일 수 있어요. ${Math.ceil(wait/1000)}초 뒤에 다시 붙여 주세요.`;return}
  H.ac();const doc={text:v,at:Date.now(),color,author:sh?.uid||'me'};
  if(local){posts.unshift({id:'l'+Date.now(),...doc});saveLocal();txt.value='';q('left').textContent='0/80';render();chime();return}
  q('post').disabled=true;
  try{await sh.db.collection('wall').add(doc);post.last=Date.now();txt.value='';q('left').textContent='0/80';chime();q('status').textContent=CRISIS.test(v)?'쪽지를 붙였어요. 많이 힘들면 1388이나 109로 전화해 줘. 언제든 들어 줘요.':'쪽지를 붙였어요.'}
  catch(e){q('status').textContent=e&&e.code==='quota_exceeded'?'벽이 가득 찼어요. 선생님께 정리를 부탁해 주세요.':'지금은 붙일 수 없어요. 15초쯤 뒤에 다시 해 보세요.'}
  q('post').disabled=false}
q('post').onclick=post;
async function toggleHeart(pid){H.ac();const me=sh?.uid||'me',has=hearts.find(h=>h.post===pid&&h.by===me);const t=H.now();H.tone(has?440:880,t,.12,.1,'sine');H.buzz(10);
  if(local){if(has)hearts=hearts.filter(h=>h!==has);else hearts.push({post:pid,by:me});saveLocal();render();return}
  const ref=sh.db.doc(`hearts/${pid}__${me}`);
  try{if(has)await ref.delete();else await ref.set({post:pid,by:me,at:Date.now()})}catch(e){q('status').textContent='하트를 남기지 못했어요.'}}
async function addReply(pid,v){if(hasBad(v)){warn('욕설이나 개인 정보 없이 따뜻하게 부탁해요.');return}
  const doc={post:pid,text:v,at:Date.now(),author:sh?.uid||'me'};openReply=null;chime();
  if(local){replies.push({id:'r'+Date.now(),...doc});saveLocal();render();return}
  try{await sh.db.collection('replies').add(doc)}catch(e){q('status').textContent='응원을 달지 못했어요.'}}
function warn(m){q('status').textContent=m;const t=H.now();H.tone(330,t,.12,.12,'square',{to:220});H.buzz([30,40,30]);txt.focus()}
async function flag(pid,btn){if(local||!sh?.uid)return;const me=sh.uid,has=reports.find(r=>r.post===pid&&r.by===me);
  if(!has&&btn.dataset.sure!=='1'){btn.dataset.sure='1';btn.textContent='이상한 내용인가요? 한 번 더';setTimeout(()=>{if(btn.isConnected){btn.dataset.sure='';btn.textContent='🚩 신고'}},3000);return}
  const ref=sh.db.doc(`reports/${pid}__${me}`);const t=H.now();H.tone(has?440:300,t,.12,.1,'triangle');H.buzz(15);
  try{if(has)await ref.delete();else{await ref.set({post:pid,by:me,at:Date.now()});q('status').textContent='신고했어요. 친구들 신고가 모이면 쪽지가 가려지고 선생님이 확인해요.'}}catch(e){q('status').textContent='신고하지 못했어요.'}}
async function clearReports(pid){const mine=reports.filter(r=>r.post===pid);try{await Promise.all(mine.map(r=>sh.db.doc(`reports/${r.id}`).delete()));reveal.delete(pid);q('status').textContent='가림을 풀었어요.'}catch(e){q('status').textContent='가림을 풀지 못했어요.'}}
async function delReply(rid){if(local){replies=replies.filter(r=>r.id!==rid);saveLocal();render();return}
  try{await sh.db.doc(`replies/${rid}`).delete()}catch(e){q('status').textContent='응원을 지우지 못했어요.'}}
async function delPost(pid,btn){if(btn.dataset.sure!=='1'){btn.dataset.sure='1';btn.textContent='정말 뗄까요?';setTimeout(()=>{if(btn.isConnected){btn.dataset.sure='';btn.textContent='떼기'}},3000);return}
  if(local){posts=posts.filter(p=>p.id!==pid);saveLocal();render();return}
  try{await sh.db.doc(`wall/${pid}`).delete()}catch(e){q('status').textContent='쪽지를 떼지 못했어요.'}}

(async()=>{sh=await H.shared();if(!alive)return;
  if(!sh.db||!sh.uid){local=true;const d=H.store.get('wallLocal',{posts:[],hearts:[],replies:[]});posts=d.posts;hearts=d.hearts;replies=d.replies;
    q('status').textContent='지금 화면에서는 반 친구들과 공유가 안 돼서, 이 기기에만 붙어요.';render();return}
  if(sh.canWrite===false){q('status').textContent='이 벽은 읽기만 할 수 있어요. 쪽지를 붙이려면 선생님께 참여 권한을 받아야 해요.';q('post').disabled=true}
  else q('status').textContent=sh.owner?'선생님 보기: 신고된 쪽지와 가려진 쪽지를 확인하고 떼거나 가림을 풀 수 있어요.':'이름은 남지 않아요. 욕설과 개인 정보는 자동으로 가려지고, 이상한 쪽지는 🚩 신고할 수 있어요.';
  render();
  timer=setTimeout(()=>{if(!posts.length)q('status').textContent='쪽지를 아직 못 불러왔어요. 잠시 후 다시 들어와 보세요.'},10000);
  const err=()=>{clearTimeout(timer);q('status').textContent='벽을 불러오지 못했어요.'};
  unsubs.push(sh.db.collection('wall').orderBy('at','desc').limit(80).onSnapshot(s=>{if(!s.metadata.fromCache)clearTimeout(timer);posts=s.docs.map(d=>({id:d.id,...d.data()}));render()},err));
  unsubs.push(sh.db.collection('hearts').limit(1000).onSnapshot(s=>{hearts=s.docs.map(d=>d.data());render()},()=>{}));
  unsubs.push(sh.db.collection('reports').limit(1000).onSnapshot(s=>{reports=s.docs.map(d=>({id:d.id,...d.data()}));render()},()=>{}));
  unsubs.push(sh.db.collection('replies').orderBy('at','desc').limit(400).onSnapshot(s=>{replies=s.docs.map(d=>({id:d.id,...d.data()}));render()},()=>{}));
})();
return()=>{alive=false;clearTimeout(timer);unsubs.forEach(u=>u())};
}});
