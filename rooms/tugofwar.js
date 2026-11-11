/* AI 줄다리기 방 — 문제를 맞힐 때마다 영차! 컴퓨터 팀과 줄다리기 */
H.register('tugofwar',{title:'AI 줄다리기',sub:'구구단·덧셈뺄셈·한자·우리 반 문제를 맞혀 줄을 당겨요',floor:2,icon:'🪢',color:'#2f6fd0',
blurb:'문제 맞히고 컴퓨터와 줄다리기',
mount(root){
const Hp=window.H;
root.style.maxWidth='1180px';
root.innerHTML=`
<style>
.tg{--ground:#f4ecd8;--ink:#24211c;--tmuted:#7a705f;--tline:#e0d4bb;--card:#fffdf7;--blue:#2f6fd0;--blue-d:#1f4f9e;--red:#e0483e;--red-d:#a92e26;--gold:#f1b434;
  --disp:"Do Hyeon","Jua","Noto Sans KR",sans-serif;--han:"Noto Serif KR","Batang",serif;
  flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;color:var(--ink);user-select:none;-webkit-user-select:none}
.tg-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.tg-seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--panel)}
.tg-seg button{border:0;background:none;padding:7px 10px;font-family:var(--disp);font-size:15px;color:var(--muted);cursor:pointer}
.tg-seg button[aria-pressed="true"]{background:#2f6fd0;color:#fff}
.tg-ib{background:var(--panel);border:1px solid var(--line);border-radius:10px;height:34px;padding:0 10px;font-family:var(--disp);font-size:15px;color:var(--fg);cursor:pointer}
.tg-arena{flex:1;min-height:0;display:grid;gap:8px;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(150px,.9fr) minmax(0,1.25fr);grid-template-areas:"field field" "left right"}
@media (min-width:900px) and (min-aspect-ratio:5/4){.tg-arena{grid-template-columns:minmax(0,1fr) minmax(0,1.6fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);grid-template-areas:"left field right"}}
.tg-field{grid-area:field;position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line);min-height:0}
.tg-field canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.tg-hud{position:absolute;left:50%;top:8px;transform:translateX(-50%);display:flex;align-items:center;gap:10px;background:rgba(255,253,247,.92);border-radius:999px;padding:4px 14px;border:1px solid var(--tline);font-variant-numeric:tabular-nums;white-space:nowrap}
.tg-hud b{font-family:var(--disp);font-weight:400;font-size:22px;line-height:1}
.tg-hud .t{min-width:50px;text-align:center;color:var(--ink)} .tg-hud .t.low{color:var(--red)}
.tg-hud .sb{color:var(--blue)} .tg-hud .sr{color:var(--red)}
.tg-ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(36,33,28,.38);text-align:center;padding:14px;box-sizing:border-box}
.tg-ov h2{margin:0;font-family:var(--disp);font-weight:400;font-size:clamp(30px,6vw,58px);color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.25);line-height:1.05}
.tg-ov p{margin:0;color:#fff;font-size:14px;text-shadow:0 1px 3px rgba(0,0,0,.5)}
.tg-go{padding:10px 26px;border-radius:999px;border:0;background:var(--gold);color:#3a2700;font-family:var(--disp);font-size:22px;cursor:pointer;box-shadow:0 5px 0 #c08a15}
.tg-go:active{transform:translateY(3px);box-shadow:0 2px 0 #c08a15}
.tg-panel{display:flex;flex-direction:column;gap:6px;min-height:0;min-width:0;border-radius:14px;padding:8px;box-sizing:border-box;background:var(--card);border:3px solid var(--c);touch-action:manipulation}
.tg-panel.blue{grid-area:left;--c:var(--blue);--cd:var(--blue-d)}
.tg-panel.red{grid-area:right;--c:var(--red);--cd:var(--red-d)}
.tg-panel.bot .tg-pad{pointer-events:none}
.tg-think{font-size:11px;color:var(--tmuted);margin-left:5px}
.tg-ph{display:flex;align-items:center;gap:6px}
.tg-ph b{font-family:var(--disp);font-weight:400;font-size:19px;color:var(--c);line-height:1}
.tg-ph span{margin-left:auto;font-size:12px;color:var(--tmuted);font-variant-numeric:tabular-nums}
.tg-q{border-radius:10px;background:var(--c);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px;min-height:56px;text-align:center;transition:background .15s}
.tg-q .qt{font-family:var(--disp);font-size:clamp(22px,4vw,40px);line-height:1.05;word-break:keep-all}
.tg-q .qt.han{font-family:var(--han);font-weight:900;font-size:clamp(34px,6vw,62px)}
.tg-q .qt.long{font-size:clamp(16px,2.6vw,24px)}
.tg-q .ans{font-family:var(--disp);font-size:clamp(18px,3vw,26px);min-height:1.1em;letter-spacing:.05em}
.tg-q.ok{background:#3aa66a} .tg-q.no{background:#4a4540;animation:tgshake .35s}
@keyframes tgshake{20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
.tg-pad{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:5px}
.tg-pad.choice{grid-template-columns:repeat(2,minmax(0,1fr))}
.tg-key{border:0;border-radius:10px;background:#f1ebde;color:var(--ink);font-family:var(--disp);font-size:clamp(20px,3.4vw,34px);cursor:pointer;box-shadow:0 4px 0 #d9cfba;min-height:34px;touch-action:manipulation;padding:2px 4px;word-break:keep-all;line-height:1.1}
.tg-key.act{background:var(--c);color:#fff;box-shadow:0 4px 0 var(--cd)}
.tg-key.ch{font-size:clamp(15px,2.4vw,24px)}
.tg-key.down{transform:translateY(3px);box-shadow:0 1px 0 #d9cfba}
.tg-key:disabled{opacity:.5;cursor:default}
.tg-dlg{position:absolute;inset:0;z-index:20;background:rgba(36,33,28,.55);display:flex;align-items:center;justify-content:center;padding:12px;border-radius:14px}
.tg-dcard{width:min(540px,100%);max-height:100%;overflow-y:auto;background:var(--card);color:var(--ink);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:9px;box-shadow:0 20px 50px rgba(0,0,0,.3);user-select:text;-webkit-user-select:text}
.tg-dcard h3{margin:0;font-family:var(--disp);font-weight:400;font-size:22px}
.tg-dcard label{font-size:13px;color:var(--tmuted);display:flex;flex-direction:column;gap:4px}
.tg-dcard input,.tg-dcard textarea{font-family:inherit;font-size:15px;padding:8px 10px;border-radius:8px;border:1px solid var(--tline);background:#fff;color:var(--ink)}
.tg-dcard textarea{min-height:140px;resize:vertical;line-height:1.6}
.tg-row{display:flex;gap:8px} .tg-row>*{flex:1;min-width:0}
.tg-ok{padding:10px 16px;border-radius:10px;border:0;background:var(--ink);color:#fff;font-family:var(--disp);font-size:18px;cursor:pointer}
@media (prefers-reduced-motion:reduce){.tg-q.no{animation:none}}
@media (max-width:420px){.tg-seg button{padding:7px 7px;font-size:14px}}
</style>
<div class="tg">
  <div class="tg-top">
    <div class="tg-seg" role="group" aria-label="문제 종류">
      <button type="button" data-q="mul" aria-pressed="true">구구단</button>
      <button type="button" data-q="add" aria-pressed="false">덧셈·뺄셈</button>
      <button type="button" data-q="han" aria-pressed="false">한자</button>
      <button type="button" data-q="own" aria-pressed="false">우리 반 문제</button>
    </div>
    <div class="tg-seg" role="group" aria-label="컴퓨터 실력">
      <button type="button" data-lv="0" aria-pressed="false">쉬움</button>
      <button type="button" data-lv="1" aria-pressed="true">보통</button>
      <button type="button" data-lv="2" aria-pressed="false">어려움</button>
    </div>
    <div class="tg-seg" role="group" aria-label="시간">
      <button type="button" data-t="60" aria-pressed="false">1분</button>
      <button type="button" data-t="90" aria-pressed="true">1분30초</button>
      <button type="button" data-t="120" aria-pressed="false">2분</button>
    </div>
    <button class="tg-ib" data-r="setBtn" type="button">⚙ 설정</button>
  </div>
  <div class="tg-arena" style="position:relative">
    <section class="tg-panel blue" aria-label="우리 팀">
      <div class="tg-ph"><b data-r="nameL">우리 팀</b><span data-r="statL">정답 0</span></div>
      <div class="tg-q" data-r="qL"><div class="qt" data-r="qtL"></div><div class="ans" data-r="aL"></div></div>
      <div class="tg-pad" data-r="padL"></div>
    </section>
    <section class="tg-field" data-r="field">
      <canvas data-r="cv" aria-hidden="true"></canvas>
      <div class="tg-hud"><b class="sb" data-r="scL">0</b><b class="t" data-r="time">1:30</b><b class="sr" data-r="scR">0</b></div>
      <div class="tg-ov" data-r="ov">
        <h2 data-r="ovTitle">운동회 줄다리기!</h2>
        <p data-r="ovSub">컴퓨터보다 빨리 맞혀서 줄을 우리 쪽으로 당겨요!</p>
        <button class="tg-go" data-r="goBtn" type="button">시작!</button>
      </div>
    </section>
    <section class="tg-panel red bot" aria-label="컴퓨터 팀">
      <div class="tg-ph"><b data-r="nameR">컴퓨터</b><span data-r="statR">정답 0</span></div>
      <div class="tg-q" data-r="qR"><div class="qt" data-r="qtR"></div><div class="ans" data-r="aR"></div></div>
      <div class="tg-pad" data-r="padR"></div>
    </section>
    <div class="tg-dlg" data-r="dlg" hidden role="dialog" aria-label="설정">
      <div class="tg-dcard">
        <h3>설정</h3>
        <div class="tg-row">
          <label>우리 팀 이름<input data-r="inL" maxlength="8"></label>
          <label>컴퓨터 이름<input data-r="inR" maxlength="8"></label>
        </div>
        <label>우리 반 문제 (한 줄에 하나씩 · 문제 = 답)<textarea data-r="own" spellcheck="false" maxlength="3000"></textarea></label>
        <p style="margin:0;font-size:12px;color:var(--tmuted)">답이 보기 4개 중 하나로 나오고, 나머지 보기는 다른 문제의 답에서 골라요. 문제는 4개 이상 넣어 주세요. 이 기기에만 저장돼요.</p>
        <button class="tg-ok" data-r="dlgOk" type="button">저장하고 닫기</button>
      </div>
    </div>
  </div>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const reduce=Hp.reduce;
const rand=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rand(a,b+1)),TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
let alive=true; const timers=new Set();
const later=(fn,ms)=>{ const id=setTimeout(()=>{ timers.delete(id); if(alive) fn(); },ms); timers.add(id); return id; };

/* ---------- 저장값 ---------- */
const DEF_OWN=`우리나라의 수도 = 서울
물이 어는 온도 = 0도
한글을 만든 왕 = 세종대왕
지구에서 가장 큰 대양 = 태평양
삼각형 세 각의 합 = 180도
光(빛 광)의 반대말 한자 = 暗
'학교'의 '교' 한자 = 校
1년은 며칠 = 365일`;
const sv=Hp.store.get('tugCfg',{L:'우리 팀',R:'컴퓨터',own:DEF_OWN,q:'mul',lv:1,t:90});
$('inL').value=sv.L; $('inR').value=sv.R; $('own').value=sv.own;
function save(){ Hp.store.set('tugCfg',{L:T.L.name,R:T.R.name,own:$('own').value,q:qtype,lv,t:dur}); }

/* ---------- 문제 ---------- */
const HAN=[['一','한 일'],['二','두 이'],['三','석 삼'],['四','넉 사'],['五','다섯 오'],['六','여섯 륙'],['七','일곱 칠'],['八','여덟 팔'],['九','아홉 구'],['十','열 십'],
 ['日','날 일'],['月','달 월'],['火','불 화'],['水','물 수'],['木','나무 목'],['金','쇠 금'],['土','흙 토'],['山','메 산'],['川','내 천'],['人','사람 인'],
 ['口','입 구'],['目','눈 목'],['耳','귀 이'],['手','손 수'],['足','발 족'],['大','큰 대'],['小','작을 소'],['上','윗 상'],['下','아래 하'],['中','가운데 중'],
 ['天','하늘 천'],['地','땅 지'],['父','아비 부'],['母','어미 모'],['兄','형 형'],['弟','아우 제'],['王','임금 왕'],['女','여자 녀'],['子','아들 자'],['學','배울 학'],
 ['校','학교 교'],['先','먼저 선'],['生','날 생'],['心','마음 심'],['力','힘 력'],['白','흰 백'],['靑','푸를 청'],['門','문 문'],['東','동녘 동'],['西','서녘 서'],['南','남녘 남'],['北','북녘 북']];
let qtype=['mul','add','han','own'].includes(sv.q)?sv.q:'mul',own=[];
function parseOwn(){ own=$('own').value.split('\n').map(l=>l.split('=')).filter(p=>p.length>=2&&p[0].trim()&&p[1].trim()).map(p=>[p[0].trim().slice(0,40),p.slice(1).join('=').trim().slice(0,16)]); }
function choicesFrom(answer,pool){ const others=shuffle([...new Set(pool.filter(x=>x!==answer))]).slice(0,3); return shuffle([answer,...others]); }
function makeQ(prev){ let q,n=0;
  do{ if(qtype==='mul'){ const a=ri(2,9),b=ri(1,9); q={text:`${a} × ${b} = ?`,ans:String(a*b),kind:'num'}; }
    else if(qtype==='add'){ let a=ri(10,99),b=ri(10,99); if(Math.random()<.5){ q={text:`${a} + ${b} = ?`,ans:String(a+b),kind:'num'}; } else { if(b>a) [a,b]=[b,a]; q={text:`${a} − ${b} = ?`,ans:String(a-b),kind:'num'}; } }
    else if(qtype==='han'){ const h=HAN[ri(0,HAN.length-1)]; q={text:h[0],ans:h[1],kind:'choice',han:true,choices:choicesFrom(h[1],HAN.map(x=>x[1]))}; }
    else { const src=own.length>=4?own:HAN.map(h=>[h[0]+' 의 훈음',h[1]]); const o=src[ri(0,src.length-1)]; q={text:o[0],ans:o[1],kind:'choice',choices:choicesFrom(o[1],src.map(x=>x[1]))}; }
  } while(prev&&q.text===prev.text&&++n<8);
  return q; }

/* ---------- 소리 (사이트 공용 오디오·음소거) ---------- */
let ac=null,master=null,nb=null;
function audio(){ if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function tone(at,dur,f,vol,type,glide,pan){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur);
  const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g);
  if(pan&&ac.createStereoPanner){ const p=ac.createStereoPanner(); p.pan.value=pan; g.connect(p); p.connect(master); } else g.connect(master); o.start(t); o.stop(t+dur+.02); }
function noise(at,dur,type,f,q,vol,att){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(att||.005)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()); n.stop(t+dur+.02); }
const SFX={
  key(p){ tone(0,.04,700+Math.random()*200,.05,'triangle',null,p); },
  pull(p){ tone(0,.16,220,.16,'sawtooth',300,p); tone(.15,.2,330,.12,'sawtooth',260,p); noise(0,.25,'lowpass',500,.7,.25); },
  ok(p){ tone(0,.12,880,.08,'triangle',null,p); tone(.07,.2,1320,.07,'triangle',null,p); },
  no(p){ tone(0,.25,160,.12,'square',110,p); },
  beep(hi){ tone(0,hi?.5:.18,hi?1320:880,.1,'sine'); },
  whistle(){ if(!ac) return; const t=ac.currentTime,o=ac.createOscillator(); o.frequency.value=2900; const l=ac.createOscillator(); l.frequency.value=30; const lg=ac.createGain(); lg.gain.value=140; l.connect(lg); lg.connect(o.frequency); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.02); g.gain.setValueAtTime(.12,t+.5); g.gain.exponentialRampToValueAtTime(.0001,t+.6); o.connect(g); g.connect(master); o.start(t); l.start(t); o.stop(t+.62); l.stop(t+.62); },
  cheer(){ noise(0,2.2,'bandpass',1100,.45,.4,.3); noise(.1,1.8,'bandpass',2300,.6,.16,.35); [523,659,784,1046].forEach((f,i)=>tone(.2+i*.12,.5,f,.08,'triangle')); },
  sad(){ [392,349,311,262].forEach((f,i)=>tone(i*.22,.4,f,.08,'triangle')); },
  creak(){ noise(0,.3,'bandpass',300,6,.12,.1); },
  click(){ tone(0,.05,600,.05,'triangle'); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- 게임 상태 ---------- */
const STEP=.1;
let state='idle',dur=[60,90,120].includes(sv.t)?sv.t:90,timeLeft=dur,rope=0,ropeShown=0,cd=0,winner=null;
const T={L:{name:sv.L||'우리 팀',q:null,typed:'',ok:0,tries:0,lock:0,pull:0,stumble:0},R:{name:sv.R||'컴퓨터',q:null,typed:'',ok:0,tries:0,lock:0,pull:0,stumble:0}};
function fmt(s){ s=Math.max(0,Math.ceil(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function hud(){ $('scL').textContent=T.L.ok; $('scR').textContent=T.R.ok; $('time').textContent=fmt(timeLeft); $('time').classList.toggle('low',state==='play'&&timeLeft<=10);
  for(const s of ['L','R']){ const t=T[s]; $('name'+s).textContent=t.name; $('stat'+s).textContent=`정답 ${t.ok}${t.tries?` · ${Math.round(t.ok/t.tries*100)}%`:''}`; } }
function buildPad(side){ const pad=$('pad'+side),t=T[side],q=t.q,live=state==='play'; pad.innerHTML=''; pad.classList.toggle('choice',!!q&&q.kind==='choice');
  const mk=(v,cls)=>{ const b=document.createElement('button'); b.type='button'; b.className='tg-key'+cls; b.textContent=v; b.disabled=!live; b.dataset.v=v; pad.appendChild(b); };
  if(q&&q.kind==='choice') q.choices.forEach(c=>mk(c,' ch'));
  else ['1','2','3','4','5','6','7','8','9','⌫','0','✓'].forEach(k=>mk(k,k==='✓'?' act':'')); }
function showQ(side){ const t=T[side],q=t.q,qt=$('qt'+side); qt.textContent=q?q.text:''; qt.classList.toggle('han',!!(q&&q.han)); qt.classList.toggle('long',!!(q&&!q.han&&q.text.length>9));
  $('a'+side).textContent=q&&q.kind==='num'?(t.typed||' '):(q&&q.han?'훈과 음은?':' '); }
function newQ(side){ const t=T[side]; t.q=makeQ(t.q); t.typed=''; showQ(side); buildPad(side); }
function flash(side,cls){ const el=$('q'+side); el.classList.remove('ok','no'); void el.offsetWidth; el.classList.add(cls); later(()=>el.classList.remove(cls),cls==='ok'?260:700); }
function correct(side){ const t=T[side],o=T[side==='L'?'R':'L'],pan=side==='L'?-.6:.6; t.ok++; t.tries++; t.pull=1; o.stumble=1;
  rope=clamp(rope+(side==='L'?-STEP:STEP),-1,1); SFX.ok(pan); SFX.pull(pan); buzz(side==='L'?25:[8]); flash(side,'ok'); burst(side);
  hud(); if(Math.abs(rope)>=.999){ finish(side); return; } later(()=>{ if(state==='play') newQ(side); },220); }
function wrong(side){ const t=T[side]; t.tries++; t.lock=.8; t.typed=''; SFX.no(side==='L'?-.6:.6); if(side==='L') buzz([40,30,40]); flash(side,'no'); $('a'+side).textContent='땡!'; hud();
  later(()=>{ if(state==='play') newQ(side); },750); }
function press(side,v,btn){ if(state!=='play') return; const t=T[side]; if(t.lock>0||!t.q) return; audio(); if(btn){ btn.classList.add('down'); later(()=>btn.classList.remove('down'),90); }
  const q=t.q,pan=side==='L'?-.6:.6;
  if(q.kind==='choice'){ if(v===q.ans) correct(side); else wrong(side); return; }
  SFX.key(pan); if(side==='L') buzz(6);
  if(v==='⌫'){ t.typed=t.typed.slice(0,-1); showQ(side); return; }
  if(v==='✓'){ if(!t.typed) return; if(t.typed===q.ans) correct(side); else wrong(side); return; }
  if(t.typed.length>=4) return; t.typed+=v; showQ(side);
  if(t.typed===q.ans) correct(side); else if(t.typed.length>=q.ans.length&&!q.ans.startsWith(t.typed)) wrong(side); }
$('padL').addEventListener('pointerdown',e=>{ const b=e.target.closest('.tg-key'); if(!b||b.disabled) return; e.preventDefault(); press('L',b.dataset.v,b); });
// PC 키보드: 숫자·Enter·Backspace (보기 문제는 1~4)
function onKey(e){ if(state!=='play'||!$('dlg').hidden) return; const tg=e.target&&e.target.tagName; if(tg==='INPUT'||tg==='TEXTAREA') return; let v=null;
  if(/^(Numpad|Digit)\d$/.test(e.code)) v=e.code.slice(-1); else if(e.code==='Enter'||e.code==='NumpadEnter') v='✓'; else if(e.code==='Backspace') v='⌫';
  if(v==null) return; const q=T.L.q; if(q&&q.kind==='choice'){ const i=+v-1; if(i>=0&&i<4) v=q.choices[i]; else return; }
  e.preventDefault(); e.stopPropagation(); press('L',v); }
addEventListener('keydown',onKey,true);

/* ---------- 컴퓨터 선수 ---------- */
const BOT=[{t:[3.6,5.6],acc:.72},{t:[2.4,3.8],acc:.86},{t:[1.5,2.5],acc:.94}];
let lv=[0,1,2].includes(sv.lv)?sv.lv:1,plan=null;
function makePlan(){ const q=T.R.q; if(!q) return null; const L=BOT[lv],right=Math.random()<L.acc;
  const extra=q.kind==='choice'?.4:(q.ans.length-1)*.35+(q.text.includes('−')?.6:0);
  let keys;
  if(q.kind==='choice'){ keys=[right?q.ans:q.choices.filter(c=>c!==q.ans)[Math.floor(Math.random()*3)]]; }
  else { let a=q.ans; if(!right){ const n=(+a+(Math.random()<.5?1:-1)*(1+Math.floor(Math.random()*3)*(q.text.includes('×')?1:10))); a=String(Math.max(0,n)); if(a===q.ans) a=String(+a+1); }
    keys=[...a]; if(a.length<q.ans.length) keys.push('✓'); else if(a.length>q.ans.length) keys=keys.slice(0,q.ans.length); }
  return {q,keys,i:0,t:0,total:rand(L.t[0],L.t[1])+extra}; }
let thinkShown='';
function botTick(dt){ const t=T.R; if(state!=='play'||t.lock>0||!t.q){ plan=null; return; }
  if(!plan||plan.q!==t.q) plan=makePlan(); if(!plan) return; plan.t+=dt;
  const due=plan.total*(0.55+0.45*(plan.i+1)/plan.keys.length);
  if(plan.t>=due&&plan.i<plan.keys.length){ const v=plan.keys[plan.i++]; const btn=[...$('padR').querySelectorAll('.tg-key')].find(b=>b.dataset.v===v); press('R',v,btn); }
  const th=`정답 ${t.ok}${t.tries?` · ${Math.round(t.ok/t.tries*100)}%`:''}|${plan&&plan.i===0?'생각 중…':''}`;
  if(th!==thinkShown){ thinkShown=th; const [a,b]=th.split('|'); const s=$('statR'); s.textContent=a; if(b){ const sp=document.createElement('span'); sp.className='tg-think'; sp.textContent=b; s.appendChild(sp); } } }

function start(){ audio(); plan=null; parseOwn(); state='count'; cd=3.999; lastBeep=4; rope=0; winner=null; timeLeft=dur; confetti=[];
  for(const s of ['L','R']){ Object.assign(T[s],{q:null,typed:'',ok:0,tries:0,lock:0,pull:0,stumble:0}); T[s].q=makeQ(); showQ(s); buildPad(s); }
  $('ovTitle').textContent='3'; $('ovTitle').style.color=''; $('ovSub').textContent='준비…'; $('goBtn').hidden=true; SFX.beep(); buzz(15); hud(); }
function begin(){ state='play'; $('ov').hidden=true; SFX.whistle(); buzz([30,30,30]); buildPad('L'); buildPad('R'); }
function finish(side){ state='over'; winner=side; for(const s of ['L','R']) buildPad(s);
  $('ov').hidden=false; const w=side?T[side].name:null;
  $('ovTitle').textContent=w?`${w} 승리!`:'무승부!'; $('ovTitle').style.color=side==='L'?'#cfe0ff':side==='R'?'#ffd6d2':'#fff';
  $('ovSub').textContent=`${T.L.name} ${T.L.ok}개 · ${T.R.name} ${T.R.ok}개 정답`; $('goBtn').textContent='한 판 더!'; $('goBtn').hidden=false;
  SFX.whistle(); if(side==='R') later(SFX.sad,300); else later(SFX.cheer,300); buzz(side==='L'?[60,40,100,40,160]:[120]);
  if(side==='L'){ const rec=Hp.store.get('tugWins',0)+1; Hp.store.set('tugWins',rec); $('ovSub').textContent+=` · 지금까지 ${rec}번 이겼어요`; }
  if(!reduce&&side!=='R') for(let i=0;i<90;i++) confetti.push({x:rand(0,W),y:rand(-H*.4,0),vx:rand(-30,30),vy:rand(60,160),r:rand(3,6),c:['#2f6fd0','#e0483e','#f1b434','#3aa66a','#fff'][i%5],a:rand(0,TAU)}); hud(); }
$('goBtn').onclick=()=>{ $('dlg').hidden=true; start(); };

/* ---------- 설정 ---------- */
const locked=()=>state==='play'||state==='count';
const segs=(attr,cur)=>root.querySelectorAll(`[data-${attr}]`).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset[attr]===String(cur))));
segs('q',qtype); segs('lv',lv); segs('t',dur);
root.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ if(locked()) return; audio(); SFX.click(); buzz(8); qtype=b.dataset.q; segs('q',qtype); if(qtype==='own'){ parseOwn(); if(own.length<4) $('dlg').hidden=false; } save(); preview(); });
root.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ if(locked()) return; audio(); SFX.click(); buzz(8); lv=+b.dataset.lv; segs('lv',lv); save(); });
root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ if(locked()) return; audio(); SFX.click(); buzz(8); dur=+b.dataset.t; timeLeft=dur; segs('t',dur); save(); hud(); });
$('setBtn').onclick=()=>{ audio(); SFX.click(); buzz(8); $('dlg').hidden=false; };
$('dlgOk').onclick=()=>{ audio(); SFX.click(); buzz(10); const f=s=>Hp.filter&&Hp.filter.hasBad&&Hp.filter.hasBad(s);
  let L=$('inL').value.trim()||'우리 팀',R=$('inR').value.trim()||'컴퓨터'; if(f(L)) L='우리 팀'; if(f(R)) R='컴퓨터'; $('inL').value=L; $('inR').value=R;
  T.L.name=L; T.R.name=R; parseOwn(); $('dlg').hidden=true; save(); hud(); if(!locked()) preview(); };
function preview(){ for(const s of ['L','R']){ T[s].q=makeQ(T[s].q); T[s].typed=''; showQ(s); buildPad(s); } }

/* ---------- 운동장 그리기 ---------- */
const cv=$('cv'),ctx=cv.getContext('2d'),field=$('field'); let W=0,H=0,S=1,confetti=[],dust=[];
function resize(){ const d=Math.min(devicePixelRatio||1,2),r=field.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return; cv.width=Math.round(W*d); cv.height=Math.round(H*d); ctx.setTransform(d,0,0,d,0,0); S=clamp(Math.min(W/430,H/300),.45,1.7); }
const ro=new ResizeObserver(resize); ro.observe(field);
function E(x,y,rx,ry,fill,rot){ ctx.beginPath(); ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU); ctx.fillStyle=fill; ctx.fill(); }
function burst(side){ const cx=W/2+ropeShown*W*.2+(side==='L'?-1:1)*W*.14, y=H*.86; for(let i=0;i<10;i++) dust.push({x:cx+rand(-50,50)*S,y,vx:rand(-40,40)*S,vy:rand(-50,-10)*S,t:1}); }
const SKIN=['#f2c7a0','#e8b78f','#f6d2b0'];
function kid(x,y,dir,lean,team,i,t,mood){
  const col=team==='L'?'#2f6fd0':'#e0483e',band=team==='L'?'#1f4f9e':'#a92e26';
  ctx.save(); ctx.translate(x,y); ctx.scale(S,S); ctx.rotate(lean*dir);
  const step=Math.sin(t*10+i)*mood.walk*4;
  ctx.strokeStyle='#3b3a40'; ctx.lineWidth=7; ctx.lineCap='round';
  const bf=-dir*12+step,ff=dir*10-step; ctx.beginPath(); ctx.moveTo(-4*dir,-30); ctx.lineTo(bf,-2); ctx.moveTo(4*dir,-30); ctx.lineTo(ff,-2); ctx.stroke();
  E(bf,0,7,4,'#2a2a30'); E(ff,0,7,4,'#2a2a30');
  ctx.fillStyle=col; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(-13,-62,26,36,10); else ctx.rect(-13,-62,26,36); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(i+1),0,-46);
  ctx.strokeStyle=SKIN[i%3]; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,-54); ctx.lineTo(dir*24,-40); ctx.stroke();
  E(0,-78,15,15,SKIN[i%3]); ctx.fillStyle='#2b2220'; ctx.beginPath(); ctx.arc(0,-81,15,Math.PI*1.05,Math.PI*1.95); ctx.fill();
  ctx.fillStyle=band; ctx.fillRect(-15,-86,30,5); ctx.beginPath(); ctx.moveTo(-dir*14,-84); ctx.lineTo(-dir*24,-90+Math.sin(t*12+i)*3); ctx.lineTo(-dir*24,-80+Math.sin(t*12+i)*3); ctx.fill();
  const fx=dir*5; ctx.fillStyle='#2b2220';
  if(mood.face==='happy'){ ctx.strokeStyle='#2b2220'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(fx-4,-76,2.5,Math.PI,TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(fx+4,-76,2.5,Math.PI,TAU); ctx.stroke(); E(fx,-70,4,3,'#a33'); }
  else if(mood.face==='strain'){ ctx.strokeStyle='#2b2220'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(fx-6,-78); ctx.lineTo(fx-2,-76); ctx.moveTo(fx+6,-78); ctx.lineTo(fx+2,-76); ctx.stroke(); ctx.fillRect(fx-4,-71,8,2.5); }
  else if(mood.face==='sad'){ E(fx-4,-76,1.8,2.2,'#2b2220'); E(fx+4,-76,1.8,2.2,'#2b2220'); ctx.strokeStyle='#2b2220'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(fx,-67,3.5,Math.PI*1.15,Math.PI*1.85); ctx.stroke(); }
  else { E(fx-4,-76,2,2.4,'#2b2220'); E(fx+4,-76,2,2.4,'#2b2220'); ctx.strokeStyle='#2b2220'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(fx,-72,3,.15*Math.PI,.85*Math.PI); ctx.stroke(); }
  E(fx-9,-71,3,1.8,'rgba(255,120,120,.5)'); E(fx+9,-71,3,1.8,'rgba(255,120,120,.5)');
  ctx.restore(); }
function drawField(t,dt){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#bfe3f7'); g.addColorStop(.5,'#e7f4fb'); g.addColorStop(.5,'#ecd9a8'); g.addColorStop(1,'#e2c98f'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const fc=['#e0483e','#f1b434','#2f6fd0','#3aa66a','#fff','#9b59d0'];
  for(let k=0;k<2;k++){ const y0=H*(.12+k*.1); ctx.strokeStyle='rgba(80,70,60,.5)'; ctx.lineWidth=1.2; ctx.beginPath();
    for(let x=0;x<=W;x+=10){ const y=y0+Math.sin(x/W*Math.PI)*H*.05; x?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.stroke();
    for(let i=0,x=12+k*14;x<W;x+=28,i++){ const y=y0+Math.sin(x/W*Math.PI)*H*.05,sw=Math.sin(t*3+i)*2; ctx.fillStyle=fc[(i+k)%fc.length]; ctx.beginPath(); ctx.moveTo(x-8,y); ctx.lineTo(x+8,y); ctx.lineTo(x+sw,y+16*Math.min(1.2,S+.2)); ctx.closePath(); ctx.fill(); } }
  ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fillRect(0,H*.38,W,H*.12);
  for(let i=0;i<W/14;i++){ const x=i*14+7,y=H*.44+((i*37)%7)-Math.abs(Math.sin(t*(state==='over'?9:2)+i))*(state==='over'?5:1.5); E(x,y,5,5,['#2f6fd0','#e0483e','#f1b434','#3aa66a','#7a705f'][i%5]); }
  const gy=H*.86,cx=W/2,lim=W*.2;
  ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=4; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(cx,H*.52); ctx.lineTo(cx,H); ctx.stroke();
  ctx.lineWidth=3; ctx.setLineDash([8,8]); for(const s of [-1,1]){ ctx.strokeStyle=s<0?'rgba(47,111,208,.8)':'rgba(224,72,62,.8)'; ctx.beginPath(); ctx.moveTo(cx+s*lim,H*.52); ctx.lineTo(cx+s*lim,H); ctx.stroke(); } ctx.setLineDash([]);
  ropeShown+=(rope-ropeShown)*Math.min(1,dt*(state==='over'?3:7)); const rx=cx+ropeShown*lim;
  const ry=gy-38*S, sag=Math.sin(t*4)*1.5;
  ctx.strokeStyle='#a87a42'; ctx.lineWidth=9*S; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(rx-W*.47,ry); ctx.quadraticCurveTo(rx,ry+sag+3,rx+W*.47,ry); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2*S; ctx.setLineDash([6*S,8*S]); ctx.beginPath(); ctx.moveTo(rx-W*.47,ry-2*S); ctx.lineTo(rx+W*.47,ry-2*S); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#e0483e'; ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx-9*S,ry+24*S); ctx.lineTo(rx+9*S,ry+24*S); ctx.closePath(); ctx.fill(); E(rx,ry,7*S,7*S,'#f1b434');
  for(const side of ['L','R']){ const tm=T[side]; tm.pull=Math.max(0,tm.pull-dt*2.2); tm.stumble=Math.max(0,tm.stumble-dt*2.2); tm.lock=Math.max(0,tm.lock-dt);
    const dir=side==='L'?1:-1;
    const win=state==='over'&&winner===side, lose=state==='over'&&winner&&winner!==side;
    for(let i=0;i<3;i++){ const x=rx-dir*(52+i*46)*S; let lean=.32+tm.pull*.25-tm.stumble*.3, face='strain', walk=state==='play'?.2+tm.pull:0;
      if(state==='idle'||state==='count'){ lean=.18; face='normal'; walk=0; }
      if(win){ lean=-.05; face='happy'; walk=0; }
      if(lose){ lean=-.5; face='sad'; walk=0; }
      const hop=win?Math.abs(Math.sin(t*7+i))*14*S:0;
      kid(x,gy-hop,dir,-lean,side,i,t,{face,walk}); } }
  dust.forEach(d=>{ d.x+=d.vx*dt; d.y+=d.vy*dt; d.vy+=60*dt; d.t-=dt*1.6; E(d.x,d.y,5*S*d.t+1,4*S*d.t+1,`rgba(200,170,110,${Math.max(0,d.t)*.7})`); }); dust=dust.filter(d=>d.t>0);
  ctx.font=`${16*S+6}px "Do Hyeon","Jua",sans-serif`; ctx.textBaseline='middle'; ctx.textAlign='center';
  ctx.fillStyle='rgba(47,111,208,.85)'; ctx.fillText(T.L.name,cx-lim-8*S-ctx.measureText(T.L.name).width/2,H*.95);
  ctx.fillStyle='rgba(224,72,62,.85)'; ctx.fillText(T.R.name,cx+lim+8*S+ctx.measureText(T.R.name).width/2,H*.95);
  confetti.forEach(c=>{ c.x+=c.vx*dt; c.y+=c.vy*dt; c.a+=dt*6; ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.a); ctx.fillStyle=c.c; ctx.fillRect(-c.r/2,-c.r/4,c.r,c.r/2); ctx.restore(); }); confetti=confetti.filter(c=>c.y<H+10);
}

/* ---------- 루프 ---------- */
let last=performance.now(),lastBeep=4,lastSec=0;
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000),t=now/1000; last=now;
  if(state==='count'){ cd-=dt; const n=Math.ceil(cd-1); if(cd<=1){ $('ovTitle').textContent='당겨!'; $('ovSub').textContent=''; if(lastBeep!==0){ lastBeep=0; SFX.beep(true); buzz(40); } if(cd<=.4) begin(); }
    else { $('ovTitle').textContent=String(n); if(n!==lastBeep){ lastBeep=n; SFX.beep(); buzz(15); } } }
  botTick(dt);
  if(state==='play'){ timeLeft-=dt; if(Math.random()<dt*.15) SFX.creak();
    const s=Math.ceil(timeLeft); if(s<=5&&s>0&&s!==lastSec){ lastSec=s; SFX.beep(); buzz(10); }
    if(timeLeft<=0){ timeLeft=0; finish(Math.abs(rope)<.001?null:(rope<0?'L':'R')); } $('time').textContent=fmt(timeLeft); $('time').classList.toggle('low',timeLeft<=10); }
  if(W>0&&H>0) drawField(t,dt);
  requestAnimationFrame(frame); }
resize(); preview(); hud(); requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); removeEventListener('keydown',onKey,true); timers.forEach(clearTimeout); timers.clear(); };
}});
