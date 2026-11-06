/* 4층 미술전시관 — 아틀리에(그리기·전시) · 전시장 · 영상관 */
H.register('gallery',{title:'미술 아틀리에',sub:'그림을 그려 4층 전시관 벽에 걸어요',floor:4,icon:'🎨',color:'#7b5cc4',scroll:true,
blurb:'그리고 걸고 함께 감상해요',
mount(root){
const Hp=window.H,F=window.SR_FB;
const PLAYLIST='PL1dZ6AFrgmWQ6j-t53Rhg5YKFwoN2Irmu';
root.innerHTML=`
<style>
.ga-tabs{display:flex;gap:6px}
.ga-tabs button{flex:1;padding:10px 6px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--muted);font-family:var(--display);font-size:15px;cursor:pointer}
.ga-tabs button[aria-pressed="true"]{background:#7b5cc4;border-color:#7b5cc4;color:#fff}
.ga-pane{display:flex;flex-direction:column;gap:10px}
.ga-pane[hidden]{display:none}
.ga-guide{border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:2px 12px}
.ga-guide summary{cursor:pointer;padding:9px 0;font-weight:700;font-size:14px}
.ga-guide ol{margin:0 0 10px;padding-left:20px;font-size:13.5px;line-height:1.7;color:var(--fg)}
.ga-canvas{position:relative;width:100%;max-width:480px;margin:0 auto;aspect-ratio:1;border-radius:10px;overflow:hidden;border:6px solid #c9a24a;background:#fff;touch-action:none;box-sizing:border-box}
.ga-canvas canvas{display:block;width:100%;height:100%;cursor:crosshair;touch-action:none}
.ga-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ga-sw{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.25);padding:0;cursor:pointer;flex:none}
.ga-sw[aria-pressed="true"]{outline:3px solid #f5d27a;outline-offset:1px}
.ga-row input[type=color]{width:34px;height:32px;border:0;padding:0;background:none;cursor:pointer}
.ga-row input[type=range]{flex:1;min-width:90px;accent-color:#7b5cc4}
.ga-tool{padding:7px 10px;border-radius:9px;border:1px solid var(--line);background:var(--panel);color:var(--fg);font-size:13.5px;cursor:pointer}
.ga-tool[aria-pressed="true"]{background:#7b5cc4;border-color:#7b5cc4;color:#fff}
.ga-form{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:var(--panel);border:1px solid var(--line)}
.ga-form input,.ga-form textarea{width:100%;box-sizing:border-box;padding:9px 11px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font-family:var(--body);font-size:14.5px}
.ga-form textarea{min-height:76px;resize:vertical}
.ga-form .cnt{font-size:11px;color:var(--muted);text-align:right;margin-top:-4px}
.ga-status{font-size:13px;color:var(--muted);min-height:1.2em}
.ga-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.ga-card{position:relative;background:#fffdf8;color:#2a2320;border-radius:12px;padding:8px;cursor:pointer;border:0;text-align:left;font-family:var(--body);box-shadow:0 3px 10px rgba(0,0,0,.25)}
.ga-card img{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:#f4f0e8;border:5px solid #c9a24a;border-radius:3px;box-sizing:border-box}
.ga-card b{display:block;margin-top:6px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-card span{display:flex;justify-content:space-between;font-size:12px;color:#7a6f62}
.ga-card.hid img{filter:blur(14px)}
.ga-card .cover{position:absolute;inset:8px 8px auto 8px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#2a2320;text-align:center}
.ga-empty{padding:30px 10px;text-align:center;color:var(--muted);font-size:14px;line-height:1.7}
.ga-detail{position:fixed;inset:0;z-index:50;background:rgba(10,8,14,.75);display:flex;align-items:center;justify-content:center;padding:14px}
.ga-detail[hidden]{display:none}
.ga-dcard{position:relative;width:min(460px,100%);max-height:100%;overflow:auto;background:#fffdf8;color:#2a2320;border-radius:16px;padding:14px}
.ga-dcard img{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:#f4f0e8;border:10px solid #c9a24a;border-radius:4px;box-sizing:border-box}
.ga-dcard h3{margin:10px 0 2px;font-family:var(--display);font-weight:400;font-size:22px}
.ga-dcard .by{margin:0 0 8px;color:#7a6f62;font-size:13px}
.ga-dcard .desc{margin:0 0 12px;font-size:14.5px;line-height:1.6;white-space:pre-wrap;background:#f6f1e7;border-radius:10px;padding:10px 12px}
.ga-dcard .acts{display:flex;gap:6px;flex-wrap:wrap}
.ga-dcard .acts button{flex:1;min-width:90px;padding:9px;border-radius:10px;border:1px solid #d8cfbf;background:#fff;color:#2a2320;font-size:14px;cursor:pointer}
.ga-dcard .acts button[aria-pressed="true"]{background:#ffe3ea;border-color:#e86a8a;color:#c0304f;font-weight:700}
.ga-dcard .tch{font-size:12px;color:#b5332b;margin:0 0 6px}
.ga-dx{position:absolute;top:8px;right:8px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:16px;cursor:pointer;z-index:1}
.ga-video{position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;border:1px solid var(--line)}
.ga-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.mosaic{display:inline-block;color:transparent;background:repeating-conic-gradient(#999 0 25%,#ccc 0 50%) 0 0/8px 8px}
</style>
<div class="ga-tabs" role="group" aria-label="미술전시관 메뉴">
  <button type="button" data-tab="draw" aria-pressed="true">🎨 그리기</button>
  <button type="button" data-tab="hall" aria-pressed="false">🖼️ 전시장</button>
  <button type="button" data-tab="video" aria-pressed="false">📺 영상관</button>
</div>

<section class="ga-pane" data-pane="draw">
  <details class="ga-guide"><summary>📖 이용 안내 (처음이면 눌러 보세요)</summary>
    <ol>
      <li>아래 하얀 캔버스에 손가락이나 마우스로 그림을 그려요. 종이에 그린 그림은 <b>📷 사진 불러오기</b>로 올려도 돼요.</li>
      <li>펜·붓·지우개·채우기 도구와 색, 굵기를 골라요. 실수하면 <b>↩ 되돌리기</b>!</li>
      <li>작품 제목, 그린 사람(별명), 작품 설명을 적어요.</li>
      <li><b>🖼️ 전시관에 걸기</b>를 누르면 4층 전시관 벽 액자에 걸리고, 전시장에서 친구들이 하트를 눌러 줄 수 있어요.</li>
      <li>얼굴 사진·개인 정보·남을 놀리는 그림은 걸지 말아요. 친구들의 신고가 3번 모이면 작품이 가려지고 선생님이 확인해요.</li>
    </ol>
  </details>
  <div class="ga-canvas"><canvas data-r="cv" width="720" height="720" aria-label="그림판"></canvas></div>
  <div class="ga-row" data-r="tools">
    <button class="ga-tool" data-tool="pen" aria-pressed="true" type="button">✏️ 펜</button>
    <button class="ga-tool" data-tool="brush" aria-pressed="false" type="button">🖌️ 붓</button>
    <button class="ga-tool" data-tool="erase" aria-pressed="false" type="button">🧽 지우개</button>
    <button class="ga-tool" data-tool="fill" aria-pressed="false" type="button">🪣 채우기</button>
  </div>
  <div class="ga-row" data-r="pal"></div>
  <div class="ga-row"><span class="note">굵기</span><input type="range" min="2" max="60" value="8" data-r="size" aria-label="굵기"><span class="note" data-r="sizeN">8</span></div>
  <div class="ga-row">
    <button class="ga-tool" data-r="undo" type="button">↩ 되돌리기</button>
    <button class="ga-tool" data-r="clear" type="button">🗑 새 종이</button>
    <label class="ga-tool">📷 사진 불러오기<input type="file" accept="image/*" data-r="file" style="position:absolute;opacity:0;width:1px;height:1px"></label>
  </div>
  <div class="ga-form">
    <input type="text" data-r="title" maxlength="20" placeholder="작품 제목 (예: 나의 꿈, 여름 바다)" aria-label="작품 제목">
    <input type="text" data-r="artist" maxlength="8" placeholder="그린 사람 (별명)" aria-label="그린 사람">
    <textarea data-r="desc" maxlength="150" placeholder="작품 설명 — 무엇을 그렸는지, 어떤 마음을 담았는지 적어 주세요" aria-label="작품 설명"></textarea>
    <div class="cnt" data-r="cnt">0/150</div>
    <button class="btn" data-r="post" type="button">🖼️ 전시관에 걸기</button>
    <div class="ga-status" data-r="status" role="status" aria-live="polite"></div>
  </div>
</section>

<section class="ga-pane" data-pane="hall" hidden>
  <p class="note" data-r="hallNote">최근에 걸린 작품부터 보여요. 작품을 누르면 크게 보고 하트를 줄 수 있어요.</p>
  <div class="ga-grid" data-r="grid"><div class="ga-empty">작품을 불러오는 중…</div></div>
</section>

<section class="ga-pane" data-pane="video" hidden>
  <div class="ga-video" data-r="vbox"></div>
  <p class="note">한문김선생 채널의 <b>한문수업</b> 재생목록이에요. 영상 오른쪽 위 목록 버튼으로 다른 편을 고를 수 있어요.</p>
  <a class="btn ghost" href="https://www.youtube.com/playlist?list=${PLAYLIST}" target="_blank" rel="noopener">▶ 유튜브에서 재생목록 열기</a>
</section>

<div class="ga-detail" data-r="detail" hidden><div class="ga-dcard">
  <button class="ga-dx" data-r="dx" aria-label="닫기">✕</button>
  <img data-r="dimg" alt="">
  <h3 data-r="dtitle"></h3><p class="by" data-r="dby"></p><p class="tch" data-r="dtch" hidden></p><p class="desc" data-r="ddesc"></p>
  <div class="acts"><button data-r="dheart" type="button">🤍 하트</button><button data-r="dflag" type="button">🚩 신고</button><button data-r="ddel" type="button" hidden>🗑 떼기</button><button data-r="dclear" type="button" hidden>가림 풀기</button></div>
</div></div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
let alive=true;const subs=[];const timers=new Set();const later=(f,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(alive)f()},ms);timers.add(id)};
const filt=Hp.filter||{hasBad:()=>false,safeHTML:Hp.esc,CRISIS:/$^/};

/* ---------- 탭 ---------- */
let tab='draw',videoOn=false;
function setTab(t){tab=t;root.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===t)));root.querySelectorAll('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==t);
  if(t==='video'&&!videoOn){videoOn=true;const f=document.createElement('iframe');f.src=`https://www.youtube-nocookie.com/embed/videoseries?list=${PLAYLIST}&rel=0`;f.title='한문수업 재생목록';
    f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';$('vbox').appendChild(f)}
  if(t==='hall')startHall()}
root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));

/* ---------- 그림판 ---------- */
const cv=$('cv'),cx=cv.getContext('2d',{willReadFrequently:true}),N=720;
const PAL=['#1d1b20','#ffffff','#e5483a','#f28c28','#f5c518','#7ac143','#2f9a5d','#3fb6d8','#3a78d2','#7b5cc4','#d36bb5','#8a5a2b','#f3c9a5','#9aa1a8'];
let color='#1d1b20',tool='pen',size=8,bg='#ffffff',undo=[],drawing=null,dirty=false;
$('pal').innerHTML=PAL.map(c=>`<button class="ga-sw" data-c="${c}" aria-pressed="${c===color}" style="background:${c}" aria-label="색 ${c}" type="button"></button>`).join('')+`<input type="color" data-r="pick" value="#ff6699" aria-label="다른 색 고르기">`;
const selC=c=>{color=c;root.querySelectorAll('[data-c]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.c===c)));if(tool==='erase')setTool('pen')};
root.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>selC(b.dataset.c));$('pick').oninput=e=>selC(e.target.value);
function setTool(t){tool=t;root.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===t)))}
root.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
$('size').oninput=e=>{size=+e.target.value;$('sizeN').textContent=size};
function blank(){cx.globalCompositeOperation='source-over';cx.globalAlpha=1;cx.fillStyle=bg;cx.fillRect(0,0,N,N)}
function snap(){try{undo.push(cx.getImageData(0,0,N,N));if(undo.length>25)undo.shift()}catch(e){}}
blank();
const draft=Hp.store.get('artDraft',null);if(draft&&draft.img){const im=new Image();im.onload=()=>{if(alive){cx.drawImage(im,0,0,N,N)}};im.src=draft.img}
if(draft){$('title').value=draft.title||'';$('desc').value=draft.desc||''}
const me=Hp.store.get('me',null);$('artist').value=(draft&&draft.artist)||(me&&me.nick)||'';
let saveT=0;const saveDraft=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{Hp.store.set('artDraft',{img:cv.toDataURL('image/webp',.6),title:$('title').value,artist:$('artist').value,desc:$('desc').value})}catch(e){}},700)};
$('undo').onclick=()=>{const im=undo.pop();if(im){cx.putImageData(im,0,0);saveDraft();Hp.buzz(10)}};
$('clear').onclick=()=>{if($('clear').dataset.sure!=='1'){$('clear').dataset.sure='1';$('clear').textContent='🗑 정말 지울까요?';later(()=>{$('clear').dataset.sure='';$('clear').textContent='🗑 새 종이'},2500);return}
  snap();blank();$('clear').dataset.sure='';$('clear').textContent='🗑 새 종이';saveDraft();const t=Hp.now();Hp.noise(t,.35,'bandpass',900,.6,.25,{atk:.05});Hp.buzz(20)};
$('file').onchange=e=>{const f=e.target.files[0];if(!f||!/^image\//.test(f.type))return;const url=URL.createObjectURL(f);const im=new Image();im.onload=()=>{snap();blank();const k=Math.min(N/im.width,N/im.height),w=im.width*k,h=im.height*k;cx.drawImage(im,(N-w)/2,(N-h)/2,w,h);URL.revokeObjectURL(url);saveDraft();Hp.buzz(15);status('사진을 불러왔어요. 그 위에 그려도 돼요.')};im.src=url;e.target.value=''};
const pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*N/r.width,y:(e.clientY-r.top)*N/r.height,p:e.pressure&&e.pointerType==='pen'?e.pressure:1}};
function strokeTo(a,b,m){const w=size*(tool==='brush'?1.6:1)*(.4+.6*b.p);cx.lineCap='round';cx.lineJoin='round';
  cx.globalCompositeOperation='source-over';cx.strokeStyle=tool==='erase'?bg:color;cx.globalAlpha=tool==='brush'?.35:1;cx.lineWidth=w;
  cx.beginPath();cx.moveTo(m.x,m.y);cx.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);cx.stroke();cx.globalAlpha=1}
let acc=0;
cv.addEventListener('pointerdown',e=>{e.preventDefault();Hp.ac();const p=pos(e);
  if(tool==='fill'){snap();flood(p.x|0,p.y|0,color);saveDraft();const t=Hp.now();Hp.tone(520,t,.15,.08,'sine',{to:780});Hp.buzz(15);return}
  snap();try{cv.setPointerCapture(e.pointerId)}catch(_){}drawing={id:e.pointerId,last:p,mid:p};strokeTo(p,{...p,x:p.x+.1},p);Hp.buzz(6)});
cv.addEventListener('pointermove',e=>{if(!drawing||drawing.id!==e.pointerId)return;const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];
  for(const ev of evs){const p=pos(ev);strokeTo(drawing.last,p,drawing.mid);drawing.mid={x:(drawing.last.x+p.x)/2,y:(drawing.last.y+p.y)/2};acc+=Math.hypot(p.x-drawing.last.x,p.y-drawing.last.y);drawing.last=p}
  if(acc>60){acc=0;const t=Hp.now();Hp.noise(t,.05,tool==='brush'?'lowpass':'highpass',tool==='brush'?1200:3200,.7,tool==='erase'?.06:.04);Hp.buzz(3)}});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{if(drawing&&drawing.id===e.pointerId){drawing=null;saveDraft()}}));
function hex(c){const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function flood(x,y,c){const im=cx.getImageData(0,0,N,N),d=im.data,i0=(y*N+x)*4,t=[d[i0],d[i0+1],d[i0+2]],[r,g,b]=hex(c);if(Math.abs(t[0]-r)+Math.abs(t[1]-g)+Math.abs(t[2]-b)<6)return;
  const same=i=>Math.abs(d[i]-t[0])+Math.abs(d[i+1]-t[1])+Math.abs(d[i+2]-t[2])<60;const st=[[x,y]];let guard=0;
  while(st.length&&guard++<800000){let [px,py]=st.pop();let i=(py*N+px)*4;while(px>=0&&same(i)){px--;i-=4}px++;i+=4;let up=false,dn=false;
    while(px<N&&same(i)){d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;if(py>0){const j=i-N*4;if(same(j)){if(!up){st.push([px,py-1]);up=true}}else up=false}if(py<N-1){const j=i+N*4;if(same(j)){if(!dn){st.push([px,py+1]);dn=true}}else dn=false}px++;i+=4}}
  cx.putImageData(im,0,0)}
$('desc').oninput=()=>{$('cnt').textContent=$('desc').value.length+'/150';saveDraft()};$('title').oninput=saveDraft;$('artist').oninput=saveDraft;

/* ---------- 전시하기 ---------- */
function status(t){$('status').textContent=t}
function exportImg(){const o=document.createElement('canvas');o.width=o.height=480;const c=o.getContext('2d');c.drawImage(cv,0,0,480,480);
  let q=.78,u=o.toDataURL('image/webp',q);if(!u.startsWith('data:image/webp')){q=.82;u=o.toDataURL('image/jpeg',q);while(u.length>150000&&q>.4){q-=.1;u=o.toDataURL('image/jpeg',q)}return u}
  while(u.length>150000&&q>.35){q-=.1;u=o.toDataURL('image/webp',q)}return u}
function isBlank(){const d=cx.getImageData(0,0,N,N).data,[r,g,b]=hex(bg);let diff=0;for(let i=0;i<d.length;i+=4*97){if(Math.abs(d[i]-r)+Math.abs(d[i+1]-g)+Math.abs(d[i+2]-b)>30)diff++}return diff<8}
let posting=false;
$('post').onclick=async()=>{if(posting)return;const title=$('title').value.trim(),artist=$('artist').value.trim(),desc=$('desc').value.trim();
  if(isBlank()){status('먼저 그림을 그려 주세요 🎨');Hp.buzz([30,40,30]);return}
  if(!title){status('작품 제목을 적어 주세요.');$('title').focus();return}
  if(!artist){status('그린 사람(별명)을 적어 주세요.');$('artist').focus();return}
  if(filt.hasBad(title)||filt.hasBad(artist)||filt.hasBad(desc)){status('욕설이나 개인 정보(전화번호·아이디 등)는 빼고 적어 주세요.');Hp.buzz([60,40,60]);return}
  if(!F){status('지금은 전시 서버에 연결할 수 없어요.');return}
  posting=true;$('post').disabled=true;status('전시관에 거는 중…');
  try{await F.ready();const uid=F.uid(),b=F.base(),key=F.db.ref(b+'/art').push().key;const up={};
    up['art/'+key]={img:exportImg(),title,artist,desc,at:F.TS,author:uid};up['lasta/'+uid]=F.TS;await F.db.ref(b).update(up);
    const t=Hp.now();[523,659,784,1047].forEach((f,i)=>Hp.tone(f,t+i*.1,.35,.12,'triangle'));Hp.buzz([30,40,30,40,80]);
    status(filt.CRISIS.test(desc)?'전시관에 걸렸어요! 많이 힘들면 1388이나 109로 전화해 줘.':'전시관에 걸렸어요! 4층 복도 액자에서도 볼 수 있어요 🎉');
    Hp.store.set('artDraft',null);$('title').value='';$('desc').value='';$('cnt').textContent='0/150';undo=[];blank();
    later(()=>{setTab('hall');openDetailWhenReady(key)},900)}
  catch(e){status('걸지 못했어요. 1분에 한 작품씩 걸 수 있어요. 잠시 뒤 다시 해 주세요.');Hp.buzz([60,40,60])}
  finally{posting=false;$('post').disabled=false}};

/* ---------- 전시장 ---------- */
let arts=[],hearts={},myHearts={},reps={},myReps={},hallOn=false,owner=false,focusId=null,curId=null;
const HIDE_AT=3,GONE_AT=6;
function startHall(){if(hallOn||!F)return;hallOn=true;F.ready().then(async()=>{const b=F.base(),uid=F.uid();try{const s=await Hp.shared();owner=!!(s&&s.owner)}catch(e){}
  const ra=F.db.ref(b+'/art').orderByChild('at').limitToLast(48),cb=sn=>{const a=[];sn.forEach(c=>{const v=c.val();if(v&&typeof v.img==='string')a.push({id:c.key,...v})});a.sort((x,y)=>(y.at||0)-(x.at||0));arts=a;renderHall();if(focusId&&arts.some(x=>x.id===focusId)){openDetail(focusId);focusId=null}};
  ra.on('value',cb,()=>{$('grid').innerHTML='<div class="ga-empty">작품을 불러오지 못했어요.</div>'});subs.push(()=>ra.off('value',cb));
  const rh=F.db.ref(b+'/hearts'),ch=sn=>{const h={},m={};sn.forEach(c=>{const v=c.val();if(v&&v.post){h[v.post]=(h[v.post]||0)+1;if(v.by===uid)m[v.post]=true}});hearts=h;myHearts=m;renderHall();refreshDetail()};
  rh.on('value',ch,()=>{});subs.push(()=>rh.off('value',ch));
  const rr=F.db.ref(b+'/reports'),cr=sn=>{const h={},m={};sn.forEach(c=>{const v=c.val();if(v&&v.post){h[v.post]=(h[v.post]||0)+1;if(v.by===uid)m[v.post]=true}});reps=h;myReps=m;renderHall();refreshDetail()};
  rr.on('value',cr,()=>{});subs.push(()=>rr.off('value',cr))}).catch(()=>{})}
function renderHall(){const g=$('grid');const list=arts.filter(a=>owner||(reps[a.id]||0)<GONE_AT);
  if(!list.length){g.innerHTML='<div class="ga-empty">아직 걸린 작품이 없어요.<br>🎨 그리기에서 첫 작품을 걸어 주세요!</div>';return}
  g.innerHTML=list.map(a=>{const hid=(reps[a.id]||0)>=HIDE_AT;return`<button class="ga-card${hid?' hid':''}" data-id="${a.id}" type="button"><img src="${a.img}" alt="${Hp.esc(a.title)}" loading="lazy">${hid?'<div class="cover">🙈 신고로 가려진 작품</div>':''}
    <b>${filt.safeHTML(a.title)}</b><span><em style="font-style:normal">${filt.safeHTML(a.artist)}</em><em style="font-style:normal">❤️ ${hearts[a.id]||0}</em></span></button>`}).join('');
  g.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>openDetail(b.dataset.id))}
function openDetailWhenReady(id){if(arts.some(a=>a.id===id))openDetail(id);else focusId=id}
function openDetail(id){const a=arts.find(x=>x.id===id);if(!a)return;curId=id;const t=Hp.now();Hp.tone(880,t,.25,.06,'sine');Hp.tone(1320,t+.08,.35,.05,'sine');Hp.buzz(10);
  $('dimg').src=a.img;$('dimg').alt=a.title;$('dtitle').innerHTML=filt.safeHTML(a.title);$('dby').textContent='그린 사람 · '+a.artist+(a.at?' · '+new Date(a.at).toLocaleDateString('ko-KR'):'');
  $('ddesc').innerHTML=filt.safeHTML(a.desc||'(작품 설명이 없어요)')+(filt.CRISIS.test(a.desc||'')?'\n\n💛 많이 힘들면 1388, 109로 전화해 줘.':'');refreshDetail();$('detail').hidden=false}
function refreshDetail(){if(!curId)return;const a=arts.find(x=>x.id===curId);if(!a)return;const uid=F&&F.uid&&F.uid(),mine=a.author===uid,n=reps[a.id]||0;
  $('dheart').setAttribute('aria-pressed',String(!!myHearts[a.id]));$('dheart').textContent=`${myHearts[a.id]?'❤️':'🤍'} 하트 ${hearts[a.id]||0}`;
  $('dflag').hidden=mine||owner;$('dflag').textContent=myReps[a.id]?'🚩 신고 취소':'🚩 신고';$('ddel').hidden=!(mine||owner);$('dclear').hidden=!(owner&&n);
  $('dtch').hidden=!(owner&&n);$('dtch').textContent=`🚩 신고 ${n}번${n>=GONE_AT?' · 학생들에게 안 보임':n>=HIDE_AT?' · 가려짐':''}`;
  $('dimg').style.filter=(n>=HIDE_AT&&!owner)?'blur(14px)':''}
$('dx').onclick=()=>{$('detail').hidden=true;curId=null;Hp.ui('close')};$('detail').addEventListener('click',e=>{if(e.target===$('detail')){$('detail').hidden=true;curId=null}});
$('dheart').onclick=async()=>{if(!curId||!F)return;const b=F.base(),uid=F.uid(),ref=F.db.ref(`${b}/hearts/${curId}__${uid}`);const t=Hp.now();
  try{if(myHearts[curId]){await ref.remove();Hp.tone(440,t,.15,.06,'sine')}else{await ref.set({post:curId,by:uid,at:F.TS});Hp.tone(660,t,.12,.08,'sine');Hp.tone(990,t+.08,.2,.07,'sine');Hp.buzz([15,30,15])}}catch(e){}};
$('dflag').onclick=async()=>{if(!curId||!F)return;const btn=$('dflag'),b=F.base(),uid=F.uid(),ref=F.db.ref(`${b}/reports/${curId}__${uid}`);
  if(!myReps[curId]&&btn.dataset.sure!=='1'){btn.dataset.sure='1';btn.textContent='정말 신고할까요? 한 번 더';later(()=>{btn.dataset.sure='';refreshDetail()},3000);return}
  btn.dataset.sure='';try{if(myReps[curId])await ref.remove();else{await ref.set({post:curId,by:uid,at:F.TS});Hp.buzz(20)}}catch(e){}};
$('ddel').onclick=async()=>{if(!curId||!F)return;const btn=$('ddel');if(btn.dataset.sure!=='1'){btn.dataset.sure='1';btn.textContent='정말 뗄까요?';later(()=>{btn.dataset.sure='';btn.textContent='🗑 떼기'},3000);return}
  btn.dataset.sure='';btn.textContent='🗑 떼기';try{await F.db.ref(`${F.base()}/art/${curId}`).remove();$('detail').hidden=true;curId=null;Hp.buzz(20)}catch(e){}};
$('dclear').onclick=async()=>{if(!curId||!F)return;const b=F.base();try{const sn=await F.db.ref(b+'/reports').once('value');const dels=[];sn.forEach(c=>{const v=c.val();if(v&&v.post===curId)dels.push(F.db.ref(b+'/reports/'+c.key).remove())});await Promise.all(dels)}catch(e){}};

/* ---------- 들어올 때 탭 ---------- */
const want=Hp.galleryTab;focusId=Hp.galleryFocus||null;Hp.galleryTab=null;Hp.galleryFocus=null;
setTab(want==='video'?'video':want==='hall'?'hall':'draw');
return()=>{alive=false;subs.forEach(f=>{try{f()}catch(e){}});timers.forEach(clearTimeout);clearTimeout(saveT)};
}});
