/* 감정 날씨 체크인 방 (공유) */
H.register('weather',{title:'마음 날씨',sub:'오늘 내 마음을 날씨로 고르면 우리 반 하늘이 그려져요',floor:3,icon:'🌦️',color:'#8fc6ee',scroll:true,
blurb:'우리 반 오늘의 마음 하늘',
mount(root){
const WX=[
  {k:'sun',e:'☀️',n:'맑음',d:'기분 좋아요'},{k:'part',e:'🌤️',n:'구름 조금',d:'그럭저럭 괜찮아요'},{k:'cloud',e:'☁️',n:'흐림',d:'좀 가라앉아요'},
  {k:'fog',e:'🌫️',n:'안개',d:'멍하고 헷갈려요'},{k:'rain',e:'🌧️',n:'비',d:'슬프거나 지쳐요'},{k:'storm',e:'⛈️',n:'천둥번개',d:'화나고 답답해요'},
  {k:'snow',e:'❄️',n:'눈',d:'외롭고 쓸쓸해요'},{k:'rainbow',e:'🌈',n:'무지개',d:'힘들었지만 나아졌어요'}];
const MAP=Object.fromEntries(WX.map(w=>[w.k,w]));
root.innerHTML=`
<style>
.wx-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.wx{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer;min-width:0}
.wx span{font-size:30px;line-height:1.1}.wx b{font-size:13px}.wx small{font-size:10px;color:var(--muted);text-align:center;line-height:1.3}
.wx[aria-pressed="true"]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 22%,var(--panel));box-shadow:0 0 0 2px var(--accent) inset}
.sky{position:relative;border-radius:16px;padding:16px;min-height:170px;display:flex;flex-direction:column;gap:12px;background:linear-gradient(180deg,var(--s1,#24425f),var(--s2,#12202f));overflow:hidden}
.sky h3{margin:0;font-family:var(--display);font-weight:400;font-size:22px}
.sky .sum{font-size:13px;color:rgba(255,255,255,.8);line-height:1.5}
.crowd{display:flex;flex-wrap:wrap;gap:4px;font-size:24px;line-height:1}
.crowd .me{outline:2px solid #fff;border-radius:8px}
.bars{display:flex;flex-direction:column;gap:5px}
.bar{display:grid;grid-template-columns:5.5em 1fr 2.2em;gap:8px;align-items:center;font-size:12px;font-variant-numeric:tabular-nums}
.bar i{display:block;height:10px;border-radius:5px;background:rgba(255,255,255,.85)}
.bar u{text-decoration:none;background:rgba(255,255,255,.15);border-radius:5px;display:block}
.care{padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.25);font-size:13px;line-height:1.5}
.care a{color:#ffe08a}
@media (max-width:420px){.wx-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.wx small{display:none}}
</style>
<section class="sky" data-r="sky">
  <h3 data-r="title">오늘 우리 반 하늘</h3>
  <div class="crowd" data-r="crowd"></div>
  <div class="sum" data-r="sum">불러오는 중…</div>
  <div class="bars" data-r="bars"></div>
  <div class="care" data-r="care" hidden></div>
</section>
<h4 style="margin:4px 0 0;font-size:15px">지금 내 마음 날씨는?</h4>
<div class="wx-grid" data-r="grid">${WX.map(w=>`<button class="wx" aria-pressed="false" data-k="${w.k}"><span>${w.e}</span><b>${w.n}</b><small>${w.d}</small></button>`).join('')}</div>
<p class="note" data-r="note">이름은 저장하지 않아요. 하루에 한 번, 바꾸고 싶으면 다시 누르면 돼요.</p>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const today=new Date(Date.now()+9*3600e3).toISOString().slice(0,10); // KST date
const dateLabel=`${+today.slice(5,7)}월 ${+today.slice(8,10)}일`;
q('title').textContent=`${dateLabel} 우리 반 하늘`;
let mine=null,rows=[],sh=null,local=false,unsub=null,timer=null,alive=true;
const SKY={sun:['#3b7fc4','#9bd0f5'],part:['#3f6f9a','#8db5d6'],cloud:['#4a5563','#7b8796'],fog:['#5d6670','#a3abb3'],rain:['#2b3a4c','#4f6378'],storm:['#1d1b2e','#433b5c'],snow:['#5d7389','#c9d6e3'],rainbow:['#5b4f9e','#e8a0b8']};
function render(){
  const counts={};rows.forEach(r=>{if(MAP[r.w])counts[r.w]=(counts[r.w]||0)+1});const n=rows.length;
  root.querySelectorAll('.wx').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===mine));
  const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);const top=sorted[0]?.[0];
  const s=SKY[top]||['#24425f','#12202f'];q('sky').style.setProperty('--s1',s[0]);q('sky').style.setProperty('--s2',s[1]);
  const order=WX.map(w=>w.k);const list=[...rows].sort((a,b)=>order.indexOf(a.w)-order.indexOf(b.w));
  q('crowd').innerHTML=list.map(r=>`<span class="${r.me?'me':''}" title="${MAP[r.w]?.n||''}">${MAP[r.w]?.e||''}</span>`).join('');
  if(!n){q('sum').textContent=local?'이 기기에서만 기록돼요. 첫 날씨를 골라 보세요.':'아직 아무도 고르지 않았어요. 첫 번째로 골라 보세요!';q('bars').innerHTML='';q('care').hidden=true;return}
  q('sum').textContent=`${n}명이 골랐어요 · 가장 많은 날씨는 ${MAP[top].e} ${MAP[top].n}`;
  q('bars').innerHTML=sorted.map(([k,c])=>`<div class="bar"><span>${MAP[k].e} ${MAP[k].n}</span><u><i style="width:${Math.round(c/n*100)}%"></i></u><span>${c}명</span></div>`).join('');
  const heavy=(counts.rain||0)+(counts.storm||0)+(counts.snow||0)+(counts.fog||0);
  const care=q('care');
  if(n>=3&&heavy/n>=.4){care.hidden=false;care.innerHTML=`오늘은 흐리고 비 오는 마음이 많아요. 다 같이 <a href="#breath">숨 풍선</a>으로 1분만 쉬어 갈까요? 서로에게 <a href="#wall">응원 한 줄</a>도 좋아요.`}
  else if(mine&&['rain','storm','snow','fog'].includes(mine)){care.hidden=false;care.innerHTML=`오늘 마음이 무겁구나. <a href="#sandbag">샌드백</a>이나 <a href="#breath">숨 풍선</a>에 들러 봐요. 이야기하고 싶으면 선생님께 언제든 말해 줘요.`}
  else care.hidden=true}

function localLoad(){const all=H.store.get('weatherLocal',{});rows=(all[today]?[{w:all[today],me:true}]:[]);mine=all[today]||null;render()}
(async()=>{sh=await H.shared();if(!alive)return;
  if(!sh.db||!sh.uid){local=true;q('note').textContent='지금 화면에서는 반 친구들과 공유가 안 돼서, 이 기기에만 기록돼요.';localLoad();return}
  timer=setTimeout(()=>{q('sum').textContent='반 기록을 아직 못 불러왔어요. 잠시 후 다시 들어와 보세요.'},10000);
  try{unsub=sh.db.collection('weather').where('date','==',today).onSnapshot(snap=>{
      if(!snap.metadata.fromCache)clearTimeout(timer);
      rows=snap.docs.map(d=>{const v=d.data()||{};return{w:v.w,me:d.id===today+'_'+sh.uid}});
      const m=rows.find(r=>r.me);mine=m?m.w:mine;render()},
    err=>{clearTimeout(timer);local=true;q('note').textContent='반 기록을 불러올 수 없어서 이 기기에만 기록돼요.';localLoad()})}
  catch(e){local=true;localLoad()}})();

let busy=false;
root.querySelectorAll('.wx').forEach(b=>b.onclick=async()=>{const k=b.dataset.k;if(busy)return;mine=k;H.ac();
  const t=H.now();H.tone(660,t,.15,.12,'sine',{wet:true});H.tone(990,t+.08,.2,.08,'sine',{wet:true});H.buzz(15);
  if(local){const all=H.store.get('weatherLocal',{});all[today]=k;H.store.set('weatherLocal',all);localLoad();return}
  rows=rows.filter(r=>!r.me).concat([{w:k,me:true}]);render();busy=true;
  try{await sh.db.doc(`weather/${today}_${sh.uid}`).set({date:today,w:k,at:Date.now()})}
  catch(e){q('note').textContent=e&&e.code==='quota_exceeded'?'저장 공간이 가득 찼어요. 선생님께 알려 주세요.':'지금은 기록할 수 없어서 화면에만 보여요.'}
  busy=false});
return()=>{alive=false;clearTimeout(timer);unsub&&unsub()};
}});
