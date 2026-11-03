/* 요가 방 — 교실에서도 할 수 있는 서서 하는 요가·스트레칭 따라하기 */
H.register('yoga',{title:'요가 방',sub:'그림을 따라 천천히 몸을 늘리고 숨 쉬기',floor:3,icon:'🧘',color:'#7fc4a4',
blurb:'따라 하는 교실 요가 스트레칭',
mount(root){
const POSES=[
 {n:'산 자세',d:30,say:'발을 나란히 모으고 바르게 서요. 어깨 힘을 빼고 코로 천천히 숨 쉬어요.',p:{T:0,aL:[8,0],aR:[8,0],lL:[3,0],lR:[3,0]}},
 {n:'하늘 뻗기',d:25,say:'숨을 들이쉬며 두 팔을 하늘 높이 쭉 뻗어요. 손끝까지 길게 늘려요.',p:{T:0,aL:[172,0],aR:[172,0],lL:[3,0],lR:[3,0]}},
 {n:'옆구리 늘리기 (오른쪽)',d:20,say:'팔을 위로 올린 채, 숨을 내쉬며 상체를 오른쪽으로 천천히 기울여요.',p:{T:22,aL:[168,0],aR:[160,0],lL:[4,0],lR:[4,0]}},
 {n:'옆구리 늘리기 (왼쪽)',d:20,say:'가운데로 돌아왔다가, 이번에는 왼쪽으로 천천히 기울여요.',p:{T:-22,aL:[160,0],aR:[168,0],lL:[4,0],lR:[4,0]}},
 {n:'목 옆 늘리기',d:20,say:'팔을 내리고, 귀를 어깨 쪽으로 천천히 기울여요. 오른쪽, 왼쪽 번갈아 해요.',anim:t=>({T:0,hT:28*Math.sin(t*.5),aL:[8,0],aR:[8,0],lL:[3,0],lR:[3,0]})},
 {n:'어깨 돌리기',d:20,say:'어깨를 귀까지 올렸다가 뒤로 크게 돌려 내려요. 천천히 여러 번 해요.',anim:t=>({T:0,sh:.5+.5*Math.sin(t*1.4),aL:[10+10*Math.sin(t*1.4),20],aR:[10+10*Math.sin(t*1.4),20],lL:[3,0],lR:[3,0]})},
 {n:'별 자세',d:20,say:'팔과 다리를 크게 벌려 별처럼 서요. 가슴을 활짝 열고 숨 쉬어요.',p:{T:0,aL:[105,0],aR:[105,0],lL:[22,0],lR:[22,0]}},
 {n:'전사 자세 (오른쪽)',d:25,say:'다리를 넓게 벌리고 오른쪽 무릎을 굽혀요. 두 팔은 바닥과 나란히 뻗어요.',p:{T:0,aL:[90,0],aR:[90,0],lL:[34,0],lR:[52,-52]}},
 {n:'전사 자세 (왼쪽)',d:25,say:'이번에는 왼쪽 무릎을 굽혀요. 시선은 왼손 끝을 바라봐요.',p:{T:0,hT:-6,aL:[90,0],aR:[90,0],lL:[52,-52],lR:[34,0]}},
 {n:'나무 자세 (오른발)',d:25,say:'왼발로 서서 오른발을 왼쪽 다리 안쪽에 대요. 두 손은 머리 위로 모아요. 흔들려도 괜찮아요.',p:{T:0,aL:[160,40],aR:[160,40],lL:[0,0],lR:[62,-138]}},
 {n:'나무 자세 (왼발)',d:25,say:'발을 바꿔서, 오른발로 서고 왼발을 들어 올려요.',p:{T:0,aL:[160,40],aR:[160,40],lL:[62,-138],lR:[0,0]}},
 {n:'마무리 산 자세',d:30,say:'처음처럼 바르게 서서 눈을 살며시 감아요. 몸이 어떻게 느껴지는지 가만히 느껴 봐요. 수고했어요.',p:{T:0,aL:[8,0],aR:[8,0],lL:[3,0],lR:[3,0]},close:true}];
root.innerHTML=`
<div class="stage" data-r="stage">
  <span class="badge" data-r="step">1 / ${POSES.length}</span>
</div>
<div class="row">
  <button class="chip" data-len="0.6" aria-pressed="false">짧게 (약 3분)</button>
  <button class="chip" data-len="1" aria-pressed="true">기본 (약 5분)</button>
  <button class="chip" data-r="voice" aria-pressed="true">🔈 음성 안내</button>
</div>
<div class="row">
  <button class="btn ghost" data-r="prev" aria-label="이전 자세">◀ 이전</button>
  <button class="btn" data-r="go" style="flex:1">따라 하기 시작</button>
  <button class="btn ghost" data-r="next" aria-label="다음 자세">다음 ▶</button>
</div>
<p class="note" data-r="say">${POSES[0].say}</p>`;
const q=k=>root.querySelector(`[data-r="${k}"]`);
const S=H.canvas(q('stage')),ctx=S.ctx;
let len=1,idx=0,running=false,t=0,left=POSES[0].d,voice=true,clock=0,lastTick=-1;
const canSpeak='speechSynthesis' in window;if(!canSpeak){q('voice').hidden=true;voice=false}
root.querySelectorAll('[data-len]').forEach(b=>b.onclick=()=>{len=+b.dataset.len;root.querySelectorAll('[data-len]').forEach(x=>x.setAttribute('aria-pressed',x===b));if(!running)left=Math.round(POSES[idx].d*len)});
q('voice').onclick=()=>{voice=!voice;q('voice').setAttribute('aria-pressed',voice);if(!voice&&canSpeak)speechSynthesis.cancel()};
function speak(s){if(!voice||!canSpeak)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s);u.lang='ko-KR';u.rate=.95;speechSynthesis.speak(u)}catch(e){}}
function go(i,announce){idx=Math.max(0,Math.min(POSES.length-1,i));left=Math.round(POSES[idx].d*len);lastTick=-1;
  q('step').textContent=`${idx+1} / ${POSES.length} · ${POSES[idx].n}`;q('say').textContent=POSES[idx].say;
  if(announce){(H.bowl?H.bowl(294,.16,6):H.tone(660,H.now(),.6,.1,'sine',{wet:true}));H.buzz(20);speak(POSES[idx].n+'. '+POSES[idx].say)}}
go(0,false);
q('go').onclick=()=>{H.ac();running=!running;q('go').textContent=running?'잠깐 멈추기':'계속하기';if(running)go(idx,true);else if(canSpeak)speechSynthesis.cancel()};
q('prev').onclick=()=>go(idx-1,running);q('next').onclick=()=>go(idx+1,running);

/* ---- 그림 ---- */
const D=Math.PI/180;
let cur={T:0,hT:0,sh:0,aL:[8,0],aR:[8,0],lL:[3,0],lR:[3,0]};
const lerp=(a,b,k)=>a+(b-a)*k,lerp2=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
function target(){const P=POSES[idx];const p=P.anim?P.anim(clock):P.p;return{T:p.T||0,hT:p.hT||0,sh:p.sh||0,aL:p.aL,aR:p.aR,lL:p.lL,lR:p.lR}}
function figure(p,cx,gy,s,col){
  const U=.15*s,F=.14*s,UL=.23*s,LL=.23*s,TL=.3*s,SW=.1*s,HW=.06*s,HR=.075*s;
  const tr=p.T*D,up=[Math.sin(tr),-Math.cos(tr)],side=[Math.cos(tr),Math.sin(tr)];
  // compute with hip at origin, then anchor to ground
  const hip=[0,0];const hipL=[-HW,0],hipR=[HW,0];
  const leg=(o,ang,sgn)=>{const a1=ang[0]*D,a2=(ang[0]+ang[1])*D;const k=[o[0]+sgn*Math.sin(a1)*UL,o[1]+Math.cos(a1)*UL];const f=[k[0]+sgn*Math.sin(a2)*LL,k[1]+Math.cos(a2)*LL];return[o,k,f]};
  const LLg=leg(hipL,p.lL,-1),LRg=leg(hipR,p.lR,1);
  const neckB=[up[0]*TL,up[1]*TL],shY=-p.sh*.025*s;
  const shL=[neckB[0]-side[0]*SW,neckB[1]-side[1]*SW+shY],shR=[neckB[0]+side[0]*SW,neckB[1]+side[1]*SW+shY];
  const arm=(o,ang,sgn)=>{const a1=ang[0]*D,a2=(ang[0]+ang[1])*D;const R=v=>[v[0]*Math.cos(tr)-v[1]*Math.sin(tr),v[0]*Math.sin(tr)+v[1]*Math.cos(tr)];
    const e1=R([sgn*Math.sin(a1),Math.cos(a1)]),e2=R([sgn*Math.sin(a2),Math.cos(a2)]);const el=[o[0]+e1[0]*U,o[1]+e1[1]*U];return[o,el,[el[0]+e2[0]*F,el[1]+e2[1]*F]]};
  const AL=arm(shL,p.aL,-1),AR=arm(shR,p.aR,1);
  const ht=(p.T+p.hT)*D,headC=[neckB[0]+Math.sin(ht)*(HR+.05*s),neckB[1]-Math.cos(ht)*(HR+.05*s)];
  const lowest=Math.max(LLg[2][1],LRg[2][1]);const ox=cx,oy=gy-lowest;const P=v=>[ox+v[0],oy+v[1]];
  const line=(pts,w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((v,i)=>{const q2=P(v);i?ctx.lineTo(q2[0],q2[1]):ctx.moveTo(q2[0],q2[1])});ctx.stroke()};
  const dark='#2f6f5e',skin='#f3d0ad';
  // shadow
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(cx,gy+4,.2*s,.025*s,0,0,7);ctx.fill();
  line(LLg,.07*s,dark);line(LRg,.07*s,dark);
  [LLg[2],LRg[2]].forEach(f=>{const q2=P(f);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(q2[0],q2[1],.04*s,.02*s,0,0,7);ctx.fill()});
  line([hipL,hipR],.09*s,dark);
  line([[0,0],neckB],.13*s,col);line([shL,shR],.1*s,col);
  line(AL,.055*s,col);line(AR,.055*s,col);
  [AL[2],AR[2]].forEach(h=>{const q2=P(h);ctx.fillStyle=skin;ctx.beginPath();ctx.arc(q2[0],q2[1],.03*s,0,7);ctx.fill()});
  const hc=P(headC);ctx.fillStyle=skin;ctx.beginPath();ctx.arc(hc[0],hc[1],HR,0,7);ctx.fill();
  ctx.fillStyle='#3a2618';ctx.beginPath();ctx.arc(hc[0],hc[1]-HR*.15,HR*1.04,Math.PI+ht,2*Math.PI+ht);ctx.fill();
  // closed or open eyes
  const ex=Math.cos(ht)*HR*.38,ey=Math.sin(ht)*HR*.38;ctx.fillStyle='#2a1a10';ctx.strokeStyle='#2a1a10';ctx.lineWidth=2;
  const closed=POSES[idx].close&&running;[-1,1].forEach(sg=>{const x=hc[0]+sg*ex,y=hc[1]+sg*ey+HR*.1;if(closed){ctx.beginPath();ctx.arc(x,y,HR*.12,0,Math.PI);ctx.stroke()}else{ctx.beginPath();ctx.arc(x,y,HR*.09,0,7);ctx.fill()}});
}
const stopLoop=H.loop((dt,now)=>{const W=S.W,Hh=S.H;clock+=dt/60;
  if(running){left-=dt/60;const sec=Math.ceil(left);if(sec<=3&&sec>0&&sec!==lastTick){lastTick=sec;H.tone(880,H.now(),.08,.05,'sine');H.buzz(8)}
    if(left<=0){if(idx<POSES.length-1)go(idx+1,true);else{running=false;q('go').textContent='처음부터 다시';idx=0;H.bowl&&setTimeout(()=>H.bowl(220,.25,12),300);speak('요가를 모두 마쳤어요. 잘했어요.');go(0,false)}}}
  const tg=target(),k=Math.min(1,dt*.06);
  cur={T:lerp(cur.T,tg.T,k),hT:lerp(cur.hT,tg.hT,k),sh:lerp(cur.sh,tg.sh,k),aL:lerp2(cur.aL,tg.aL,k),aR:lerp2(cur.aR,tg.aR,k),lL:lerp2(cur.lL,tg.lL,k),lR:lerp2(cur.lR,tg.lR,k)};
  // room
  const bg=ctx.createLinearGradient(0,0,0,Hh);bg.addColorStop(0,'#e9f3ec');bg.addColorStop(1,'#cfe3d6');ctx.fillStyle=bg;ctx.fillRect(0,0,W,Hh);
  const gy=Hh*.82;ctx.fillStyle='#b9d4c3';ctx.fillRect(0,gy,W,Hh-gy);
  ctx.fillStyle='#8a6fd6';ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(W/2,gy+6,Math.min(W*.42,200),16,0,0,7);ctx.fill();ctx.globalAlpha=1;
  // window light
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(W*.08,Hh*.08,W*.18,Hh*.3);ctx.fillRect(W*.74,Hh*.08,W*.18,Hh*.3);
  // breathing scale
  const br=1+.012*Math.sin(now/1000*Math.PI*2/6);
  const s=Math.min(Hh*.6,W*.95)*br;figure(cur,W/2,gy,s,'#3f9d8c');
  // title + timer
  ctx.textAlign='center';ctx.fillStyle='#24493d';ctx.font=`${Math.min(26,W*.06)}px "Black Han Sans",sans-serif`;ctx.fillText(POSES[idx].n,W/2,Math.max(Hh*.1,64));
  if(running){const tot=Math.round(POSES[idx].d*len),fr=Math.max(0,left/tot);ctx.fillStyle='rgba(36,73,61,.15)';ctx.fillRect(W*.2,Hh*.94,W*.6,6);ctx.fillStyle='#3f9d8c';ctx.fillRect(W*.2,Hh*.94,W*.6*fr,6);
    ctx.font='15px "Noto Sans KR",sans-serif';ctx.fillText(`${Math.max(0,Math.ceil(left))}초`,W/2,Math.max(Hh*.1,64)+24)}
  else{ctx.font='14px "Noto Sans KR",sans-serif';ctx.fillStyle='#3d6b5c';ctx.fillText('의자 옆 좁은 자리에서도 할 수 있어요',W/2,Math.max(Hh*.1,64)+22)}
});
return()=>{stopLoop();S.stop();if(canSpeak)speechSynthesis.cancel()};
}});
