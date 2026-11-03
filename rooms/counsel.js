/* 마음 상담실 — 고민을 들어 주는 '마음 선생님'과 이야기하기
   · 인터넷 AI를 쓰지 않고 이 기기 안에서만 답해요. 대화는 저장하지 않고, 방을 나가면 사라져요.
   · 공감 → 되묻기 → 작은 제안 순서로 들어 주는 연습 상대예요. 위기 신호가 보이면 도움받을 곳을 먼저 알려 줘요. */
H.register('counsel',{title:'마음 상담실',sub:'마음 선생님에게 고민을 이야기하고 털어 내기',floor:3,icon:'🧑‍🏫',color:'#f0a46b',
blurb:'고민을 들어 주는 마음 선생님',
mount(root){
root.innerHTML=`
<style>
.cs-wrap{display:flex;flex-direction:column;gap:8px;flex:1;min-height:0}
.cs-portrait{flex:none;height:150px;position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line)}
.cs-portrait canvas{display:block;width:100%;height:100%}
.cs-name{position:absolute;left:12px;bottom:10px;padding:4px 10px;border-radius:999px;background:rgba(255,250,240,.9);color:#5a3a24;font-size:13px;font-weight:700}
.cs-note{font-size:11px;color:var(--muted);line-height:1.5}
.cs-log{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 2px}
.cs-msg{max-width:84%;padding:10px 13px;border-radius:16px;font-size:15px;line-height:1.55;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere}
.cs-t{align-self:flex-start;background:#fff4e6;color:#3b2a1c;border-bottom-left-radius:4px}
.cs-u{align-self:flex-end;background:var(--accent);color:#2a1a0e;border-bottom-right-radius:4px}
.cs-typing{align-self:flex-start;background:#fff4e6;border-radius:16px;padding:12px 14px;display:flex;gap:4px}
.cs-typing i{width:7px;height:7px;border-radius:50%;background:#c79a72;animation:csb 1s infinite}
.cs-typing i:nth-child(2){animation-delay:.15s}.cs-typing i:nth-child(3){animation-delay:.3s}
@keyframes csb{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}
.cs-help{align-self:stretch;background:#fff;border:2px solid #e8743b;color:#3b2a1c;border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.6}
.cs-help b{color:#c2410c}.cs-help a{color:#c2410c;font-weight:700}
.cs-fly{position:fixed;pointer-events:none;z-index:30;font-size:15px;color:#2a1a0e;transition:transform 1.6s cubic-bezier(.2,.6,.3,1),opacity 1.6s;will-change:transform}
@media (prefers-reduced-motion:reduce){.cs-typing i{animation:none}.cs-fly{transition:none}}
</style>
<div class="cs-wrap">
  <div class="cs-portrait" data-r="por"><canvas data-r="cv"></canvas><span class="cs-name">마음 선생님</span></div>
  <p class="cs-note">마음 선생님은 이야기를 들어 주는 연습 상대예요. 이 대화는 저장되지 않고 이 기기 밖으로 나가지 않으며, 방을 나가면 사라져요. 진짜 상담이 필요하면 학교 Wee클래스 선생님이나 청소년상담전화 1388에 이야기해요.</p>
  <div class="cs-log" data-r="log" aria-live="polite"></div>
  <div class="row" data-r="chips">
    ${['공부·시험','친구 관계','가족','진로·꿈','나 자신이 싫어요','그냥 답답해요'].map(t=>`<button class="chip" data-topic="${t}">${t}</button>`).join('')}
  </div>
  <div class="row">
    <input class="field" id="cs-in" maxlength="200" placeholder="마음 선생님에게 하고 싶은 말" autocomplete="off">
    <button class="btn" data-r="send">보내기</button>
    <button class="btn ghost" data-r="blow" title="지금까지 털어놓은 고민을 날려 보내요">💨 털어 내기</button>
  </div>
</div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`),log=q('log'),inp=root.querySelector('#cs-in');
const pick=a=>a[Math.random()*a.length|0];
const used=new Set();const say=a=>{const fresh=a.filter(x=>!used.has(x));const s=pick(fresh.length?fresh:a);used.add(s);return s};

/* ---------- 마음 선생님 그림 ---------- */
const cv=q('cv'),cx=cv.getContext('2d');let talk=0,nod=0,blinkT=0;
function fitCv(){const r=q('por').getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=r.width*d;cv.height=r.height*d;cx.setTransform(d,0,0,d,0,0)}
const ro=new ResizeObserver(fitCv);ro.observe(q('por'));fitCv();
function draw(now){const r=q('por').getBoundingClientRect(),W=r.width,Hh=r.height;
  const bg=cx.createLinearGradient(0,0,0,Hh);bg.addColorStop(0,'#fdf1e1');bg.addColorStop(1,'#f3dcc0');cx.fillStyle=bg;cx.fillRect(0,0,W,Hh);
  // window + plant + shelf
  cx.fillStyle='#e4f1f6';cx.fillRect(W*.06,16,W*.2,Hh*.5);cx.strokeStyle='#d1b896';cx.lineWidth=4;cx.strokeRect(W*.06,16,W*.2,Hh*.5);cx.beginPath();cx.moveTo(W*.16,16);cx.lineTo(W*.16,16+Hh*.5);cx.stroke();
  cx.fillStyle='#b5835a';cx.fillRect(W*.72,Hh*.42,W*.22,6);['#e8743b','#5f9e48','#4f8fd6'].forEach((c,i)=>{cx.fillStyle=c;cx.fillRect(W*.74+i*16,Hh*.42-26,12,26)});
  cx.fillStyle='#c07a52';cx.fillRect(W*.86,Hh*.42-18,18,18);cx.fillStyle='#5f9e48';cx.beginPath();cx.arc(W*.86+9,Hh*.42-24,12,0,7);cx.fill();
  const x=W/2,y=Hh+8,s=Math.min(1.15,Hh/150);nod*=.92;const ny=Math.sin(now/180)*nod*3;
  cx.save();cx.translate(x,y+ny*.3);cx.scale(s,s);
  // body (cardigan)
  cx.fillStyle='#7aa58a';cx.beginPath();cx.moveTo(-70,0);cx.quadraticCurveTo(-66,-62,-30,-70);cx.lineTo(30,-70);cx.quadraticCurveTo(66,-62,70,0);cx.fill();
  cx.fillStyle='#f6f1e7';cx.beginPath();cx.moveTo(-14,-70);cx.lineTo(0,-40);cx.lineTo(14,-70);cx.fill();
  cx.fillStyle='#5f8c70';cx.fillRect(-2,-40,4,40);
  // neck & head
  cx.fillStyle='#f1c9a5';cx.fillRect(-9,-84,18,16);
  cx.translate(0,ny);
  cx.fillStyle='#3b2618';cx.beginPath();cx.ellipse(0,-112,36,40,0,0,7);cx.fill();
  cx.fillStyle='#f3d0ad';cx.beginPath();cx.ellipse(0,-108,28,32,0,0,7);cx.fill();
  cx.fillStyle='#3b2618';cx.beginPath();cx.ellipse(-6,-134,30,14,-.2,0,7);cx.fill();
  // eyes (blink) + glasses
  blinkT-=1;if(blinkT<-180)blinkT=8;const closed=blinkT>0;
  cx.strokeStyle='#5a3a24';cx.lineWidth=2.2;[-11,11].forEach(ex=>{cx.beginPath();cx.arc(ex,-110,8,0,7);cx.stroke();
    if(closed){cx.beginPath();cx.moveTo(ex-4,-110);cx.lineTo(ex+4,-110);cx.stroke()}else{cx.fillStyle='#2a1a10';cx.beginPath();cx.arc(ex,-110,2.6,0,7);cx.fill()}});
  cx.beginPath();cx.moveTo(-3,-110);cx.lineTo(3,-110);cx.stroke();
  cx.fillStyle='rgba(240,140,120,.45)';[-17,17].forEach(ex=>{cx.beginPath();cx.ellipse(ex,-98,5,3,0,0,7);cx.fill()});
  // mouth (talking)
  cx.strokeStyle='#9a4a3a';cx.lineWidth=2.4;talk*=.9;const mo=talk>.1?2+Math.abs(Math.sin(now/90))*4:0;
  if(mo){cx.fillStyle='#9a4a3a';cx.beginPath();cx.ellipse(0,-92,5,mo/2+1,0,0,7);cx.fill()}else{cx.beginPath();cx.arc(0,-96,7,.25,Math.PI-.25);cx.stroke()}
  cx.restore();
  // mug
  cx.fillStyle='#fff';cx.fillRect(x+70*s,y-34*s,22*s,26*s);cx.strokeStyle='#fff';cx.lineWidth=4;cx.beginPath();cx.arc(x+94*s,y-21*s,7*s,-1.2,1.2);cx.stroke();
  cx.strokeStyle='rgba(180,160,140,.6)';cx.lineWidth=2;cx.beginPath();cx.moveTo(x+80*s,y-40*s);cx.quadraticCurveTo(x+76*s,y-50*s,x+82*s,y-58*s);cx.stroke()}
const stopLoop=H.loop((dt,now)=>draw(now));

/* ---------- 대화 화면 ---------- */
function add(cls,txt){const d=document.createElement('div');d.className='cs-msg '+cls;d.textContent=txt;log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
let busy=false,helpShown={};
function teacher(lines,extra){busy=true;const ty=document.createElement('div');ty.className='cs-typing';ty.innerHTML='<i></i><i></i><i></i>';log.appendChild(ty);log.scrollTop=log.scrollHeight;
  const arr=Array.isArray(lines)?lines:[lines];let i=0;
  const next=()=>{const txt=arr[i];const wait=Math.min(2200,600+txt.length*28);talk=1;
    setTimeout(()=>{ty.remove();add('cs-t',txt);talk=1.5;nod=1;const t=H.now();H.tone(740,t,.12,.05,'sine',{wet:true});H.buzz(8);i++;
      if(i<arr.length){log.appendChild(ty);log.scrollTop=log.scrollHeight;next()}else{busy=false;extra&&extra()}},wait)};next()}
function helpCard(kind){if(helpShown[kind])return;helpShown[kind]=1;const d=document.createElement('div');d.className='cs-help';
  d.innerHTML=kind==='safety'?`<b>지금 많이 힘들다면, 혼자 견디지 않아도 돼요.</b><br>
    · 자살예방상담전화 <a href="tel:109">109</a> (24시간)<br>· 청소년상담전화 <a href="tel:1388">1388</a> · 문자 #1388 · 카카오톡 '청소년상담1388'<br>
    · 지금 위험하다면 <a href="tel:119">119</a> 또는 <a href="tel:112">112</a><br>· 담임 선생님이나 학교 Wee클래스 상담 선생님께 "이야기하고 싶어요" 한마디만 해도 돼요.`
   :`<b>몸이나 마음이 다치는 일을 겪고 있다면 꼭 어른에게 알려요.</b><br>
    · 지금 위험하다면 <a href="tel:112">112</a><br>· 청소년상담전화 <a href="tel:1388">1388</a> · 문자 #1388<br>· 학교폭력 신고·상담 <a href="tel:117">117</a><br>· 믿을 수 있는 선생님이나 Wee클래스 상담 선생님께 이야기해요.`;
  log.appendChild(d);log.scrollTop=log.scrollHeight}

/* ---------- 들어 주는 엔진 ---------- */
const N=s=>s.replace(/\s+/g,' ').trim();
const RISK=/(죽고\s?싶|자살|자해|사라지고\s?싶|살기\s?싫|없어지고\s?싶|살고\s?싶지|뛰어내리|목숨|다\s?끝내고\s?싶|죽어\s?버리|손목|목\s?매|약을?\s?(많이|잔뜩)\s?먹)/;
const HARM=/(맞았|때려요|때린다|때려서|폭행|학대|성추행|성폭력|협박|돈\s?뺏|괴롭혀|괴롭힘|스토킹|몰카)/;
const TOPICS=[
 {k:'study',re:/(공부|시험|성적|수행|숙제|학원|등급|모의고사|중간고사|기말|점수|과제|수능|내신)/,
  ref:['공부랑 성적 때문에 마음이 많이 무겁구나.','시험이 다가오면 머리도 마음도 꽉 찬 느낌이 들지.','열심히 하는데 결과가 안 따라오면 정말 지치지.'],
  ask:['요즘 공부하면서 제일 버거운 순간은 언제야?','그 성적이 너한테 어떤 의미로 느껴져? 누구 기대가 제일 신경 쓰여?','하루에 쉬는 시간은 조금이라도 있어?'],
  tip:['오늘 할 일을 딱 3개만 적고, 하나 끝낼 때마다 지워 보는 건 어때? 작은 성공이 쌓이면 마음이 조금 가벼워져.','공부 50분 하면 10분은 꼭 일어나서 몸을 움직여 봐. 2층 숨 풍선 방에서 숨 다섯 번 쉬어도 좋고.']},
 {k:'friend',re:/(친구|왕따|따돌|무시|단톡|싸웠|절교|소외|뒷담|무리|혼자\s?다니|같이\s?안)/,
  ref:['친구 사이에서 생긴 일이라 더 마음이 쓰이겠다.','믿었던 친구랑 틀어지면 정말 속상하지.','혼자 남겨진 느낌이 들었다면 많이 외로웠겠다.'],
  ask:['그 일이 있었을 때 너는 어떤 마음이 제일 컸어? 서운함, 화남, 아니면 불안함?','그 친구에게 정말 하고 싶은 말이 있다면 뭐야?','그래도 네 편이 되어 주는 사람이 한 명이라도 있어?'],
  tip:['하고 싶은 말을 먼저 여기에 적어 보고, 직접 말할지 천천히 정해도 괜찮아.','"나는 ~해서 서운했어"처럼 내 마음을 주어로 말하면 싸움이 덜 커지는 경우가 많아.']},
 {k:'family',re:/(엄마|아빠|부모|가족|형|누나|오빠|언니|동생|잔소리|집에|부모님|할머니|할아버지)/,
  ref:['가족이랑 부딪히면 집에서도 마음 편히 쉴 곳이 없는 느낌이지.','가장 가까운 사람이라 더 서운하고 아플 수 있어.','잔소리를 들으면 내 마음은 아무도 몰라주는 것 같지.'],
  ask:['가족이 네 마음을 알아줬으면 하는 게 있다면 뭐야?','그럴 때 너는 보통 어떻게 해? 방에 들어가거나, 같이 화를 내거나?','집 말고 마음 편히 쉴 수 있는 곳이 있어?'],
  tip:['감정이 클 때는 바로 말하기보다, 하고 싶은 말을 쪽지나 문자로 정리해서 전해 보는 방법도 있어.','화가 많이 날 때는 1층 샌드백 방에서 먼저 풀고 이야기하는 것도 좋아.']},
 {k:'future',re:/(진로|꿈|대학|미래|직업|장래|하고\s?싶은\s?게|뭘\s?해야|적성|전공)/,
  ref:['앞날이 잘 안 보이면 불안하고 막막하지.','하고 싶은 게 아직 없어도 이상한 게 아니야. 많은 친구들이 그래.','다들 정해 놓은 것 같은데 나만 제자리인 느낌이 들 수 있어.'],
  ask:['시간 가는 줄 모르고 했던 일이 있다면 뭐였어?','누가 칭찬해 줬을 때 기분 좋았던 일은 뭐야?','진로 이야기를 들으면 어떤 생각이 제일 먼저 떠올라?'],
  tip:['좋아하는 것 세 가지, 잘하는 것 세 가지를 적어 보면 생각보다 실마리가 보여.','꿈은 한 번에 정하는 게 아니라 조금씩 찾아가는 거야. 이번 주에 궁금한 직업 하나만 찾아보자.']},
 {k:'self',re:/(외모|살쪘|뚱뚱|못생|자신감|키가|비교|열등|내가\s?싫|나\s?자신|쓸모|못난|잘하는\s?게\s?없|자존감)/,
  ref:['스스로가 마음에 안 드는 날은 정말 힘들지.','다른 사람과 비교하다 보면 내가 작아지는 느낌이 들어.','그런 생각이 들 만큼 요즘 많이 지쳤나 보다.'],
  ask:['요즘 너 자신한테 제일 많이 하는 말은 뭐야?','친한 친구가 똑같은 고민을 말하면, 너는 그 친구에게 뭐라고 해 줄 것 같아?','최근에 작게라도 해낸 일이 있다면 뭐야?'],
  tip:['자기 전에 오늘 잘한 일 하나만 떠올려 보자. 아주 작은 것도 괜찮아.','친구에게 해 주는 말투로 나한테도 말해 주기. 그게 마음 근육을 키우는 연습이야.']},
 {k:'love',re:/(좋아하는\s?사람|짝사랑|고백|헤어|사귀|썸|남친|여친|연애)/,
  ref:['좋아하는 마음은 설레기도 하지만 그만큼 흔들리기도 하지.','마음을 쏟은 만큼 아프고 허전하겠다.'],
  ask:['그 사람 생각을 하면 어떤 마음이 제일 커?','지금 네가 제일 바라는 건 뭐야?'],
  tip:['마음이 복잡할 땐 내 감정을 글로 적어 보는 것만으로도 정리가 될 때가 있어.']},
 {k:'tired',re:/(피곤|잠이|못\s?자|지쳐|지쳤|무기력|귀찮|아무것도\s?하기|기운|힘이\s?없)/,
  ref:['많이 지쳐 있구나. 몸도 마음도 쉬어야 한다는 신호일 수 있어.','아무것도 하기 싫을 만큼 힘든 날이 있지.'],
  ask:['요즘 잠은 몇 시간쯤 자?','제일 기운 빠지게 만드는 게 뭐라고 생각해?','쉬는 시간에 너를 조금이라도 채워 주는 게 있어?'],
  tip:['오늘은 해야 할 일 대신 "쉬어도 괜찮아"라고 나한테 허락해 주자.','3층 명상의 방에서 싱잉볼 소리 1분만 들어 봐. 몸이 조금 풀릴 거야.']},
 {k:'anger',re:/(화나|화가|짜증|열받|빡치|억울|분해|미치겠|미쳐)/,
  ref:['정말 화가 났구나. 그럴 만한 일이 있었던 것 같아.','억울한 마음이 크면 가슴이 답답하고 뜨거워지지.'],
  ask:['제일 화가 났던 순간을 조금 더 이야기해 줄래?','그 화 밑에 서운함이나 억울함 같은 마음도 숨어 있어?'],
  tip:['화는 나쁜 게 아니야. 다만 안전하게 풀어야 해. 1층 샌드백이나 접시 깨기 방에서 먼저 시원하게 풀어 보자.','숨을 4초 들이쉬고 6초 내쉬기를 세 번만 해 볼래? 화의 온도가 조금 내려가.']},
 {k:'sad',re:/(슬퍼|슬프|우울|눈물|울었|울고|외로|허전|공허)/,
  ref:['많이 슬펐구나. 이야기해 줘서 고마워.','눈물이 날 만큼 마음이 아팠겠다.','외로운 마음은 말로 꺼내기도 쉽지 않은데, 잘 꺼냈어.'],
  ask:['그 슬픔이 언제부터 시작된 것 같아?','슬플 때 곁에 있어 줬으면 하는 사람이 있어?'],
  tip:['슬플 땐 슬퍼해도 괜찮아. 다만 혼자 오래 품고 있지는 말자. 믿을 만한 어른 한 명에게 이야기해 보는 건 어때?']},
 {k:'anxious',re:/(불안|걱정|떨려|긴장|무서|두려|초조|조마조마)/,
  ref:['불안할 땐 머릿속에 걱정이 꼬리에 꼬리를 물지.','걱정이 많으면 몸도 같이 긴장하게 돼.'],
  ask:['제일 걱정되는 장면을 하나 떠올리면 어떤 거야?','그 걱정이 실제로 일어날 가능성은 얼마나 된다고 느껴?'],
  tip:['걱정을 종이에 다 적고 1층 걱정 파쇄기에 넣어 보자. 머릿속이 조금 비워질 거야.','발바닥이 바닥에 닿은 느낌에 집중하면서 숨을 천천히 쉬어 봐. 지금 여기로 돌아오는 연습이야.']},
 {k:'teacher',re:/(선생님한테|선생님이|쌤이|쌤한테|혼났|혼나|벌점)/,
  ref:['선생님께 혼나면 억울하기도 하고 창피하기도 하지.','어른한테 내 마음을 설명하기가 쉽지 않지.'],
  ask:['그때 선생님께 하고 싶었던 말이 있었어?','네 입장에서는 어떤 사정이 있었어?'],
  tip:['나중에 마음이 가라앉았을 때 "그때 제 마음은 이랬어요"라고 짧게 말씀드려 보는 것도 방법이야.']},
 {k:'phone',re:/(폰|핸드폰|휴대폰|게임|유튜브|숏츠|sns|인스타|틱톡)/i,
  ref:['폰이나 게임이 잠깐 쉼이 되기도 하지.','그만해야지 하면서도 손이 가는 그 마음, 많이들 겪어.'],
  ask:['폰을 볼 때 어떤 기분을 피하고 싶은 걸까?','줄이고 싶은 마음이 있어, 아니면 지금이 괜찮아?'],
  tip:['자기 30분 전엔 폰을 손 닿지 않는 곳에 두는 것부터 해 보자. 잠이 달라질 거야.']}];
const OPEN=['응, 듣고 있어. 천천히 이야기해 줘.','그랬구나. 조금 더 말해 줄 수 있어?','그 마음 충분히 이해돼. 그다음엔 어떻게 됐어?','이야기해 줘서 고마워. 그때 네 기분은 어땠어?'];
const SHORT=['괜찮아, 천천히 해도 돼. 생각나는 대로 한 단어만 말해도 좋아.','말하기 어려우면 아래 버튼에서 비슷한 주제를 눌러도 돼.','그냥 답답한 마음만 있어도 괜찮아. 오늘 하루 중에 제일 힘들었던 순간은 언제였어?'];
const THANKS=/(고마워|고맙|감사|괜찮아졌|나아졌|좀\s?낫|후련|이제\s?갈게|가볼게|잘\s?있어|안녕히)/;
const ASKME=/(선생님은|쌤은|선생님도|너는|넌)\s?.*(\?|어때|있어|해요|했어)/;
const AGREE=/^(응|어|네|예|ㅇㅇ|웅|그래|맞아|맞아요|그런가|몰라|모르겠|글쎄|그냥)[.!?~\s]*$/;
const SOFT=/(그만두고\s?싶|포기하고\s?싶|다\s?놓고\s?싶|도망가고\s?싶|아무도\s?없|버티기\s?힘들|숨\s?막혀)/;let riskSeen=false,softAsked=false;
const SWEAR=/(씨발|시발|ㅅㅂ|병신|ㅂㅅ|좆|존나|개새|새끼)/;
let turns=0,topic=null,tipGiven={},lastTopicTurn=0;
const quote=s=>{const t=s.length>22?s.slice(0,22)+'…':s;return`"${t}"`};
function reply(raw){const s=N(raw);turns++;
  if(RISK.test(s)){riskSeen=true;helpCard('safety');return['그 말을 꺼내기까지 정말 많이 힘들었을 것 같아. 말해 줘서 고마워.','너는 소중한 사람이야. 이 마음은 혼자 견디기엔 너무 무거워. 위에 있는 전화나 문자로 지금 바로 이야기할 수 있어.','그리고 오늘 꼭, 믿을 수 있는 어른 한 명에게 "나 요즘 많이 힘들어"라고 말해 줄래? 그게 너를 지키는 첫걸음이야.']}
  if(HARM.test(s)){helpCard('harm');return['그런 일을 겪었다면 정말 무서웠겠다. 네 잘못이 아니야.','이건 어른이 꼭 알아야 하는 일이야. 위에 있는 곳으로 연락하거나, 오늘 믿을 수 있는 선생님께 꼭 알려 줘.']}
  if(THANKS.test(s)&&turns>1)return riskSeen?['나도 이야기해 줘서 정말 고마워. 오늘 용기 낸 너, 정말 잘했어.','아까 이야기한 것처럼 오늘 꼭 믿을 수 있는 어른 한 명에게 이야기해 줘. 109와 1388은 언제든 열려 있어. 너는 혼자가 아니야.']
    :[say(['나도 이야기 나눠서 고마워. 마음이 조금이라도 가벼워졌다면 다행이야.','오늘 용기 내서 이야기한 너, 정말 잘했어.']),'힘들 땐 언제든 다시 와. 다음엔 3층 응원 벽에 한 줄 남겨 보는 것도 좋아.'];
  if(SOFT.test(s)&&!softAsked){softAsked=true;return['그만큼 지치고 버거웠구나. 그런 마음이 드는 게 이상한 게 아니야.','하나만 물어볼게. 혹시 너무 힘들어서 사라지고 싶다는 생각까지 들 때가 있어? 그렇다면 솔직하게 말해 줘도 괜찮아. 함께 방법을 찾아볼게.']}
  if(ASKME.test(s))return[say(['나한테 관심 가져 줘서 고마워. 그래도 오늘은 네 이야기를 더 듣고 싶어.','선생님도 힘든 날이 있지. 그럴 땐 누군가에게 털어놓아. 지금 너처럼 말이야.']),'요즘 너는 어떻게 지내?'];
  const out=[];if(SWEAR.test(s))out.push(say(['욕이 나올 만큼 정말 속상하고 화가 났구나.','그만큼 마음이 터질 것 같았나 보다.']));
  const T=TOPICS.find(t=>t.re.test(s));
  if(T){const fresh=topic!==T.k;topic=T.k;lastTopicTurn=turns;
    if(fresh||Math.random()<.5)out.push(say(T.ref));
    if(turns>=3&&!tipGiven[T.k]&&Math.random()<.65){tipGiven[T.k]=1;out.push(say(T.tip));out.push(say(['이건 그냥 하나의 방법이야. 너한테 맞을 것 같아?','해 볼 만한 것 같아, 아니면 다른 게 필요해?']))}
    else out.push(say(T.ask));return out}
  if(AGREE.test(s)||s.length<4)return[say(SHORT)];
  if(topic&&turns-lastTopicTurn<3){const t=TOPICS.find(x=>x.k===topic);out.push(`${quote(s)}라고 느꼈구나.`);out.push(!tipGiven[topic]&&turns>=3?(tipGiven[topic]=1,say(t.tip)):say(t.ask));return out}
  out.push(`${quote(s)}… 그런 마음이었구나.`);out.push(say(OPEN));return out}
function send(txt){txt=(txt||'').trim();if(!txt||busy)return;H.ac();add('cs-u',txt);inp.value='';teacher(reply(txt))}
q('send').onclick=()=>send(inp.value);
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();send(inp.value)}});
const TOPIC_MSG={'공부·시험':'공부랑 시험 때문에 힘들어요','친구 관계':'친구 관계 때문에 고민이에요','가족':'가족 때문에 속상해요','진로·꿈':'진로가 걱정돼요','나 자신이 싫어요':'요즘 내가 싫어요','그냥 답답해요':'그냥 마음이 답답해요'};
root.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>send(TOPIC_MSG[b.dataset.topic]));

/* 털어 내기: 내가 한 말들이 바람에 날아가요 */
q('blow').onclick=()=>{const mine=[...log.querySelectorAll('.cs-u')];if(!mine.length){teacher('먼저 마음속 이야기를 조금 들려줘. 그다음에 함께 털어 내 보자.');return}
  const t=H.now();H.noise(t,1.4,'bandpass',700,.5,.35,{atk:.25,wet:true});H.buzz([30,40,30,40,60]);
  mine.forEach((m,i)=>{const r=m.getBoundingClientRect(),f=document.createElement('div');f.className='cs-fly cs-msg cs-u';f.textContent=m.textContent;
    f.style.left=r.left+'px';f.style.top=r.top+'px';f.style.width=r.width+'px';document.body.appendChild(f);m.style.visibility='hidden';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transform=`translate(${120+Math.random()*200}px,${-200-Math.random()*200}px) rotate(${(Math.random()-.5)*60}deg) scale(.3)`;f.style.opacity=0}));
    setTimeout(()=>{f.remove();m.remove()},1700+i*30)});
  setTimeout(()=>teacher(['훌훌 날려 보냈어. 방금 그 이야기들, 네가 혼자 짊어지지 않아도 돼.','지금 마음은 어때? 조금 가벼워졌다면 숨 한 번 크게 쉬어 보자.']),1300)};

teacher(['안녕, 나는 마음 선생님이야. 여기까지 와 줘서 반가워.','요즘 마음에 걸리는 일이 있으면 편하게 이야기해 줘. 잘 들을게. 말하기 어려우면 아래 주제를 눌러도 돼.']);
return()=>{stopLoop();ro.disconnect();document.querySelectorAll('.cs-fly').forEach(f=>f.remove())};
}});
