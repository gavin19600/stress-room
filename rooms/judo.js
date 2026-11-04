/* 엎어치기 방 — 연타로 힘을 채워 한판! */
H.register('judo',{title:'엎어치기',sub:'탭해서 깃을 잡고 연타! 스트레스를 한판으로',floor:2,icon:'🥋',color:'#e8b23a',
blurb:'연타해서 스트레스를 엎어치기',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.jd-stats{position:absolute;top:10px;right:10px;display:flex;gap:8px;pointer-events:none;font-variant-numeric:tabular-nums}
.jd-stats .s{text-align:right;background:rgba(0,0,0,.45);padding:4px 8px;border-radius:8px}
.jd-stats b{display:block;font-family:var(--display);font-weight:400;font-size:17px;color:#e8b23a;line-height:1}
.jd-stats span{font-size:10px;color:#cfc4b6}
.jd-row input{flex:1;min-width:0;padding:9px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--fg);font-family:var(--body);font-size:15px}
.jd-lab{font-size:11px;color:var(--muted);margin-right:2px}
.jd-row .chip{font-size:13px;padding:6px 10px}
</style>
<div class="stage" data-r="stage" style="background:#2a231c">
  <canvas data-r="cv" aria-label="유도장. 탭해서 잡고, 연타로 힘을 채워 엎어치세요" style="touch-action:none"></canvas>
  <div class="jd-stats" data-r="stats"></div>
  <div class="hint" data-r="hint">화면을 탭해서 깃을 잡고, 빠르게 연타해서 힘 게이지를 꽉 채우면 엎어쳐요 · PC는 스페이스 연타</div>
</div>
<div class="row jd-row">
  <input type="text" data-r="txt" maxlength="8" value="스트레스" aria-label="상대 등판에 붙일 말">
  <button class="btn" data-r="apply" type="button">등판에 붙이기</button>
</div>
<div class="row jd-row">
  <button class="chip" data-t="시험" type="button">시험</button>
  <button class="chip" data-t="숙제" type="button">숙제</button>
  <button class="chip" data-t="월요일" type="button">월요일</button>
  <button class="chip" data-t="잔소리" type="button">잔소리</button>
  <button class="chip" data-t="걱정" type="button">걱정</button>
  <button class="chip" data-t="미루기" type="button">미루기</button>
</div>
<div class="row jd-row" role="group" aria-label="상대 체급">
  <span class="jd-lab">상대 체급</span>
  <button class="chip" data-kg="50" aria-pressed="false" type="button">50kg</button>
  <button class="chip" data-kg="66" aria-pressed="false" type="button">66kg</button>
  <button class="chip" data-kg="81" aria-pressed="true" type="button">81kg</button>
  <button class="chip" data-kg="100" aria-pressed="false" type="button">100kg</button>
  <button class="chip" data-kg="130" aria-pressed="false" type="button">130kg</button>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Black Han Sans","Noto Sans KR",sans-serif';
const reduce=Hp.reduce;
const TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,k)=>a+(b-a)*k, ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
let W=0,H=0,DPR=1,S=1,GY=0,CX=0,alive=true;
const timers=new Set();const later=(f,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(alive)f()},ms);timers.add(id)};
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); S=Math.min(H/430,W/560); GY=H*.8; CX=W/2+30*S; }
const ro=new ResizeObserver(resize); ro.observe(stage); resize();

let label='스트레스';
const KG={50:{bw:.78,hs:.9,name:'깃털처럼 가벼운'},66:{bw:.92,hs:.96,name:'날렵한'},81:{bw:1.05,hs:1,name:'다부진'},100:{bw:1.3,hs:1.04,name:'묵직한'},130:{bw:1.62,hs:1.08,name:'산만 한'}};
let UKE=Object.assign({kg:81},KG[81]),pendingKg=null;
function applyKg(kg){ UKE=Object.assign({kg},KG[kg]); pendingKg=null; const need=Math.ceil(.94/tapGain()); hint(`${KG[kg].name} ${kg}kg 상대! 연타 ${need}번쯤 필요해요`); }
function setLabel(t){ t=(t||'').trim().slice(0,8); if(!t) return; label=t; $('txt').value=t; }
$('apply').onclick=()=>setLabel($('txt').value);
$('txt').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); setLabel($('txt').value); $('txt').blur(); } });
root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>setLabel(b.dataset.t));
root.querySelectorAll('[data-kg]').forEach(b=>b.onclick=()=>{ const kg=+b.dataset.kg; root.querySelectorAll('[data-kg]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); if(state==='ready') applyKg(kg); else { pendingKg=kg; hint(`이번 판이 끝나면 ${kg}kg 상대가 나와요`); } });

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null,nb=null;
function audio(){ if(!ac){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
    nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  if(ac.state==='suspended') ac.resume(); return ac; }
function noise(at,dur,type,f,q,vol,att){ if(!ac) return; const t=ac.currentTime+at,n=ac.createBufferSource(); n.buffer=nb; const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(att||.004)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()*.5); n.stop(t+dur+.02); }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
const SFX={
  grab(){ noise(0,.09,'bandpass',1800,.8,.35); noise(.04,.06,'highpass',3000,.6,.15); },
  kiai(){ tone(0,.28,260,.12,'sawtooth',380); noise(0,.25,'bandpass',900,1.2,.08); },
  whoosh(){ noise(0,.45,'bandpass',600,.7,.22,.2); },
  slam(big,w){ w=w||1; tone(0,.5+w*.1,95/Math.sqrt(w),Math.min(1.2,(big?1:.7)*w),'sine',38/Math.sqrt(w)); noise(0,.32,'lowpass',420,.7,big?.9:.6); noise(.005,.09,'bandpass',1500,.9,big?.7:.45); for(let i=0;i<4;i++) noise(.08+i*.05,.04,'bandpass',rand(2500,4000),3,.06); },
  cheer(){ noise(.1,1.8,'bandpass',1300,.5,.16,.35); noise(.2,1.5,'bandpass',2200,.6,.08,.4); },
  gong(){ [1,2.4,3.9].forEach((m,i)=>tone(0,1.4,330*m,.12/(i+1),'sine')); },
  resist(){ noise(0,.15,'lowpass',500,.7,.3); tone(0,.2,200,.1,'triangle',140); },
  tap(k){ noise(0,.05,'bandpass',1400+k*900,1,.22); tone(0,.05,160+k*140,.07,'triangle'); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- figure ---------- */
const TL=58,NK=6,HR=17,L1=42,L2=42,A1=32,A2=30;
const POSE={
  stance:{lean:.14,lf:.35,kf:.5,lb:-.3,kb:.3,af:1.15,ef:.55,ab:.95,eb:.7},
  grip:{lean:.28,lf:.45,kf:.55,lb:-.4,kb:.3,af:1.55,ef:.15,ab:1.35,eb:.25},
  load:{lean:.75,lf:.9,kf:1.55,lb:-.05,kb:1.3,af:2.95,ef:-.5,ab:2.4,eb:.4},
  follow:{lean:.95,lf:.55,kf:.8,lb:-.35,kb:.55,af:1.7,ef:.1,ab:1.3,eb:.2},
  pulled:{lean:.55,lf:.15,kf:.3,lb:-.15,kb:.2,af:1.6,ef:.2,ab:1.1,eb:.3},
  fly:{lean:.1,lf:.35,kf:.15,lb:-.55,kb:.4,af:2.3,ef:.4,ab:-1.0,eb:.6},
  lie:{lean:0,lf:.35,kf:.6,lb:.15,kb:.25,af:1.6,ef:.3,ab:-1.3,eb:.2},
  stumble:{lean:-.25,lf:.6,kf:.4,lb:-.6,kb:.2,af:.4,ef:.4,ab:2.4,eb:.6},
  brace:{lean:-.15,lf:.5,kf:.6,lb:-.5,kb:.5,af:1.2,ef:.5,ab:1,eb:.5}
};
function mix(a,b,k){ const o={}; for(const key in a) o[key]=lerp(a[key],b[key],k); return o; }
const limb=(x,y,ang,len)=>[x+Math.sin(ang)*len,y+Math.cos(ang)*len];
function joints(p){ const ch=[Math.sin(p.lean)*TL,-Math.cos(p.lean)*TL]; const hd=[ch[0]+Math.sin(p.lean)*(NK+HR),ch[1]-Math.cos(p.lean)*(NK+HR)];
  const kF=limb(0,0,p.lf,L1),fF=limb(kF[0],kF[1],p.lf-p.kf,L2),kB=limb(0,0,p.lb,L1),fB=limb(kB[0],kB[1],p.lb-p.kb,L2);
  const eF=limb(ch[0],ch[1],p.af,A1),hF=limb(eF[0],eF[1],p.af+p.ef,A2),eB=limb(ch[0],ch[1],p.ab,A1),hB=limb(eB[0],eB[1],p.ab+p.eb,A2);
  return {ch,hd,kF,fF,kB,fB,eF,hF,eB,hB}; }
function footDrop(p){ const j=joints(p); return Math.max(j.fF[1],j.fB[1])+5; }
function seg(pts,w,col){ ctx.strokeStyle=col; ctx.lineWidth=w; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]); ctx.stroke(); }
function figure(x,y,rot,dir,p,gi,giDark,belt,isUke,bw,hs){ bw=bw||1; hs=hs||1;
  const j=joints(p); ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.scale(dir*S*hs,S*hs);
  const skin='#e8b98f';
  seg([j.ch,j.eB,j.hB],14*bw,giDark); seg([[0,0],j.kB,j.fB],17*bw,giDark);
  ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(j.hB[0],j.hB[1],6,0,TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(j.fB[0]+3,j.fB[1],8,4,0,0,TAU); ctx.fill();
  seg([[0,4],j.ch],32*bw,gi);
  if(bw>1.15){ const c=Math.cos(p.lean),sn=Math.sin(p.lean),off=(bw-1)*14; ctx.fillStyle=gi; ctx.beginPath(); ctx.ellipse(j.ch[0]*.42+c*off,j.ch[1]*.42+sn*off,15*bw,24,p.lean,0,TAU); ctx.fill(); }
  ctx.strokeStyle=giDark; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(j.ch[0]*.95+4,j.ch[1]*.95); ctx.lineTo(j.ch[0]*.45+6,j.ch[1]*.45); ctx.stroke();
  seg([[0,0],j.kF,j.fF],17*bw,gi); ctx.fillStyle=skin; ctx.beginPath(); ctx.ellipse(j.fF[0]+3,j.fF[1],8,4,0,0,TAU); ctx.fill();
  const bx=Math.sin(p.lean)*6,by=-Math.cos(p.lean)*6; ctx.strokeStyle=belt; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(bx-15*Math.cos(p.lean),by-15*Math.sin(p.lean)); ctx.lineTo(bx+15*Math.cos(p.lean),by+15*Math.sin(p.lean)); ctx.stroke();
  ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(bx+10,by); ctx.lineTo(bx+14,by+16); ctx.moveTo(bx+10,by); ctx.lineTo(bx+20,by+13); ctx.stroke();
  ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(j.hd[0],j.hd[1],HR*(.92+bw*.08),0,TAU); ctx.fill();
  ctx.fillStyle=isUke?'#3a2418':'#1d1714'; ctx.beginPath(); ctx.arc(j.hd[0]-3,j.hd[1]-3,HR,Math.PI*.9+p.lean,Math.PI*2.05+p.lean); ctx.fill();
  ctx.fillStyle='#1d1714'; ctx.beginPath(); ctx.arc(j.hd[0]+8*Math.cos(p.lean),j.hd[1]+8*Math.sin(p.lean)-1,2.2,0,TAU); ctx.fill();
  seg([j.ch,j.eF,j.hF],14*bw,gi); ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(j.hF[0],j.hF[1],6,0,TAU); ctx.fill();
  ctx.restore();
  if(isUke){
    const mx=(j.ch[0]*.5)*dir*S*hs,my=(j.ch[1]*.5)*S*hs; const c=Math.cos(rot),s=Math.sin(rot); const wx=x+mx*c-my*s,wy=y+mx*s+my*c;
    ctx.save(); ctx.translate(wx,wy); ctx.rotate(rot-p.lean*dir); const fs=Math.max(9,(label.length>4?11:14)*S); ctx.font=`${fs}px ${DISPLAY}`; const tw=ctx.measureText(label).width+10*S;
    ctx.fillStyle='#f7f3ea'; ctx.fillRect(-tw/2,-fs*.75,tw,fs*1.5); ctx.fillStyle='#14110e'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,0,0); ctx.restore(); }
  return j; }

/* ---------- game state ---------- */
const sv=Hp.store.get('judoRec',{ippon:0,waza:0,best:0});
let cam={z:1,r:0,fx:0,fy:0},camT={z:1,r:0,fx:0,fy:0,k:3},cine=0,flashW=0,speedL=0;
let state='ready',st=0,power=0,taps=0,tapKick=0,result=null,ippon=sv.ippon,wazaari=sv.waza,combo=0,best=sv.best,shake=0,slow=0,impactDone=false;
const dust=[],pops=[],ripples=[];
function stats(){ $('stats').innerHTML=[[ippon,'한판'],[wazaari,'절반'],[combo,'연속'],[best,'최고']].map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join(''); Hp.store.set('judoRec',{ippon,waza:wazaari,best}); }
stats();
let hintT=0;function hint(t){ const h=$('hint'); h.textContent=t; h.style.opacity=1; clearTimeout(hintT); hintT=setTimeout(()=>{h.style.opacity=0},5000); }
function act(){ audio();
  if(state==='ready'){ state='grip'; st=0; power=.06; taps=1; SFX.grab(); buzz(15); hint(`연타! 연타! ${IPPON_T()}초 안에 꽉 채우면 한판이에요`); return; }
  if(state==='grip'){ taps++; power=Math.min(1,power+tapGain()); tapKick=1; SFX.tap(power); buzz(8+Math.round(power*10));
    if(taps%5===0) pops.push({t:0,txt:['영차!','으랏!','버텨!','조금만!'][Math.floor(taps/5)%4],col:'#f3ead8',size:24,y:.3});
    if(power>=1){ result=st<=IPPON_T()?'ippon':'waza'; state='throw'; st=0; impactDone=false; SFX.kiai(); buzz([20,20,30]); pops.push({t:0,txt:'이얍!',col:'#f3ead8',size:30,y:.28}); later(SFX.whoosh,220); } } }
const IPPON_T=()=>Math.round((2.1+UKE.kg/81*.5)*10)/10, GIVEUP_T=7;
const tapGain=()=>(.1-Math.min(combo,6)*.006)*Math.pow(81/UKE.kg,.55);
function fail(){ state='resist'; st=0; SFX.resist(); combo=0; pops.push({t:0,txt:'버텼다!',col:'#c9bba5',size:40}); stats(); buzz(30); }
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); act(); });
const kd=e=>{ if(e.target.matches&&e.target.matches('input,textarea')) return; if(e.code==='Space'||e.code==='Enter'){ if(e.target.tagName==='BUTTON') return; e.preventDefault(); if(!e.repeat) act(); } };
addEventListener('keydown',kd);

function impact(){ impactDone=true; const big=result==='ippon',w=UKE.kg/81; SFX.slam(big,w); buzz(big?[60,40,90]:[40]); shake=(big?1:.55)*(.7+w*.35); cam.z+=.22; flashW=1; if(big&&!reduce) slow=.45;
  const lx=landX(); for(let i=0;i<26;i++) dust.push({x:lx+rand(-60,60)*S,y:GY-rand(0,6),vx:rand(-120,120)*S,vy:rand(-120,-20)*S,t:1,r:rand(2,5)*S});
  ripples.push({x:lx,t:0});
  if(big){ ippon++; combo++; best=Math.max(best,combo); pops.push({t:0,txt:'한판!',col:'#e8b23a',size:78,big:true}); SFX.cheer(); later(SFX.gong,250);
    if(combo>1) later(()=>pops.push({t:0,txt:`${combo}연속 한판`,col:'#f3ead8',size:26,y:.5}),400); }
  else { wazaari++; pops.push({t:0,txt:'절반!',col:'#f3ead8',size:56}); }
  pops.push({t:0,txt:`${UKE.kg}kg '${label}' 내던짐`,col:'#ab9c88',size:20,y:.62}); if(UKE.kg>=130&&big) later(()=>pops.push({t:0,txt:'괴력!',col:'#ff8a5a',size:34,y:.24}),300); stats(); }
const TX=()=>CX-95*S, UX=()=>CX+15*S;
const landX=()=>TX()+60*S-160*S;

/* ---------- draw ---------- */
function drawDojo(){
  const wg=ctx.createLinearGradient(0,0,0,GY); wg.addColorStop(0,'#3b2c1f'); wg.addColorStop(1,'#5a4330'); ctx.fillStyle=wg; ctx.fillRect(-W,-H,W*3,GY+H);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=2; for(let x=-W;x<W*2;x+=46*S){ ctx.beginPath(); ctx.moveTo(x,-H); ctx.lineTo(x,GY*.62); ctx.stroke(); }
  ctx.fillStyle='#2c2017'; ctx.fillRect(-W,GY*.62,W*3,8*S);
  const sw=70*S,sh=150*S,sx=W*.5-sw/2+40*S,sy=GY*.06; ctx.fillStyle='#2a1d14'; ctx.fillRect(sx-6*S,sy-6*S,sw+12*S,6*S); ctx.fillStyle='#efe5cf'; ctx.fillRect(sx,sy,sw,sh);
  ctx.fillStyle='#1a1410'; ctx.font=`${58*S}px "Noto Serif KR","Batang",serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('柔',sx+sw/2,sy+sh*.42);
  ctx.fillStyle='#b5332b'; ctx.fillRect(sx+sw*.62,sy+sh*.75,10*S,10*S); ctx.fillStyle='#2a1d14'; ctx.fillRect(sx-6*S,sy+sh,sw+12*S,6*S);
  const lg=ctx.createRadialGradient(CX-40*S,GY*.2,10,CX-40*S,GY*.6,W*.7); lg.addColorStop(0,'rgba(255,215,160,.22)'); lg.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=lg; ctx.fillRect(-W,-H,W*3,H*3);
  ctx.fillStyle='#8fa75a'; ctx.fillRect(-W,GY,W*3,H*2); ctx.fillStyle='#a7bd6b'; ctx.fillRect(-W,GY,W*3,4*S);
  ctx.strokeStyle='rgba(50,60,20,.35)'; ctx.lineWidth=1.5; for(let x=-W-((GY*.4)%(120*S));x<W*2;x+=120*S){ ctx.beginPath(); ctx.moveTo(x,GY); ctx.lineTo(x-60*S,H*1.6); ctx.stroke(); }
  ctx.fillStyle='#b8433a'; ctx.fillRect(-W,GY+(H-GY)*.55,W*3,(H-GY)*.12);
}
function bez(p0,p1,p2,k){ const a=1-k; return [a*a*p0[0]+2*a*k*p1[0]+k*k*p2[0],a*a*p0[1]+2*a*k*p1[1]+k*k*p2[1]]; }
const WHITE='#f4f1ea',WHITE_D='#cfc9bd',BLUE='#2f5fae',BLUE_D='#21467f';

function scene(dt){
  st+=dt;
  let tx=TX(),tDir=1,tPose=POSE.stance,ux=UX(),uy=null,uRot=0,uPose=POSE.stance,uDir=-1;
  const sway=Math.sin(performance.now()/600)*.05;
  if(state==='ready'){ tPose=POSE.stance; uPose=Object.assign({},POSE.stance,{lean:POSE.stance.lean+sway}); }
  else if(state==='grip'){ const k=ease(Math.min(1,st/.25)); power=Math.max(0,power-dt*(.22+Math.min(combo,6)*.02)*Math.pow(UKE.kg/81,.3)); tapKick=Math.max(0,tapKick-dt*6);
    const tug=Math.sin(st*34)*tapKick;
    tx=lerp(TX(),TX()+30*S,k)+power*20*S+tug*3*S; tPose=mix(mix(POSE.stance,POSE.grip,k),POSE.load,power*.38); uPose=mix(mix(POSE.stance,POSE.brace,k*.6),POSE.pulled,power*.5); ux=lerp(UX(),UX()-6*S,k)-power*14*S-tug*2*S;
    if(st>GIVEUP_T||(st>1.6&&power<=.01)) fail(); }
  else if(state==='throw'){ const dur=1.05,p=Math.min(1,st/dur);
    if(p<.25){ const k=ease(p/.25); tx=lerp(TX()+30*S,TX()+60*S,k); tDir=Math.cos(Math.min(1,k*1.25)*Math.PI); tPose=mix(POSE.grip,POSE.load,k);
      ux=lerp(UX()-6*S,TX()+60*S+30*S,k); uPose=mix(POSE.brace,POSE.pulled,k); uRot=-.35*k; uy=lerp(GY-footDrop(uPose)*S*UKE.hs,GY-110*S,k); }
    else { tx=TX()+60*S; tDir=-1; const k=(p-.25)/.5;
      if(k<1){ const e=ease(clamp(k,0,1)); tPose=mix(POSE.load,POSE.follow,clamp((k-.4)/.6,0,1));
        const hp=bez([TX()+90*S,GY-110*S],[TX()+10*S,GY-330*S],[landX(),GY-16*S],e); ux=hp[0]; uy=hp[1]; uRot=lerp(-.35,-1.5*Math.PI,e); uPose=mix(POSE.pulled,POSE.fly,clamp(e*2,0,1)); if(e>.75) uPose=mix(POSE.fly,POSE.lie,(e-.75)/.25); }
      else { if(!impactDone) impact(); tPose=POSE.follow; ux=landX(); uy=GY-16*S; uRot=-1.5*Math.PI; uPose=POSE.lie; }
      if(p>=1){ state='down'; st=0; } } }
  else if(state==='down'){ tx=TX()+60*S; tDir=-1; const k=ease(Math.min(1,st/.6)); tPose=mix(POSE.follow,POSE.stance,k); ux=landX(); uy=GY-16*S; uRot=-1.5*Math.PI; uPose=POSE.lie;
    if(st>1.5){ state='getup'; st=0; } }
  else if(state==='getup'){ const k=ease(Math.min(1,st/1.1)); tx=lerp(TX()+60*S,TX(),k); tDir=lerp(-1,1,clamp((k-.3)/.4,0,1))||.01; tPose=POSE.stance;
    const r=lerp(-1.5*Math.PI,-2*Math.PI,clamp(k*1.6,0,1)); uRot=r; ux=lerp(landX(),UX(),clamp((k-.35)/.65,0,1)); uPose=mix(POSE.lie,POSE.stance,clamp(k*1.5,0,1));
    const stand=GY-footDrop(uPose)*S*UKE.hs; uy=lerp(GY-16*S,stand,clamp(k*1.6,0,1)); if(k>=1){ uRot=0; state='ready'; st=0; hint('다시 탭해서 잡아요'); } }
  else if(state==='resist'){ const k=Math.min(1,st/.9),b=Math.sin(k*Math.PI); tx=TX()+30*S-30*S*b; tPose=mix(POSE.grip,POSE.stumble,b); uPose=mix(POSE.brace,POSE.stance,k); ux=UX()+8*S*b;
    if(k>=1){ state='ready'; st=0; hint('타이밍을 노려 다시 탭!'); } }
  if(uRot<=-2*Math.PI+.001) uRot=0;
  const tY=GY-footDrop(tPose)*S, uY=uy===null?GY-footDrop(uPose)*S*UKE.hs:uy;
  const ukeFirst=state==='throw'&&st/1.05>.25&&st/1.05<.6;
  const drawT=()=>figure(tx,tY,0,tDir,tPose,WHITE,WHITE_D,'#111',false);
  const drawU=()=>figure(ux,uY,uRot,uDir,uPose,BLUE,BLUE_D,'#f4f1ea',true,UKE.bw,UKE.hs);
  ctx.fillStyle='rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(tx,GY+3,40*S,7*S,0,0,TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(ux,GY+3,clamp(40*S+(GY-uY)*.1,30*S,70*S),7*S,0,0,TAU); ctx.fill();
  if(ukeFirst){ drawU(); drawT(); } else { drawT(); drawU(); }
  const mid=(tx+ux)/2; let z=1,r=0,fx=W/2,fy=H/2,k=3; speedL=0;
  if(state==='grip'){ z=1.12+power*.2; r=-power*.03; fx=lerp(W/2,mid,.8); fy=lerp(H/2,GY-95*S,.7); k=5; }
  else if(state==='throw'){ const p=st/1.05; fx=mid; k=8;
    if(p<.25){ const e=p/.25; z=1.34+.08*e; r=lerp(-.03,.06,e); fy=GY-100*S; }
    else { const e=clamp((p-.25)/.5,0,1); z=1.48-.08*e; r=lerp(.06,-.11,e); fx=lerp(mid,(tx+ux)/2,.5); fy=lerp(GY-110*S,(tY+uY)/2-40*S,.5); speedL=Math.sin(e*Math.PI); } }
  else if(state==='down'){ z=1.22; r=-.02; fx=lerp(tx,ux,.5); fy=GY-70*S; k=2.5; }
  else if(state==='getup'){ k=2.2; }
  if(pendingKg&&state==='ready') applyKg(pendingKg);
  camT={z,r,fx,fy,k};
}
function drawGauge(){ if(state!=='grip') return; const w=Math.min(W*.7,300),h=20,x=W/2-w/2,y=Math.max(30,GY*.12)+(H<420?0:10)+30;
  const chance=st<=IPPON_T(), left=Math.max(0,IPPON_T()-st);
  ctx.fillStyle='rgba(10,8,6,.78)'; ctx.fillRect(x-8,y-26,w+16,h+40);
  ctx.fillStyle='#3a3029'; ctx.fillRect(x,y,w,h);
  const fill=ctx.createLinearGradient(x,0,x+w,0); fill.addColorStop(0,'#b8433a'); fill.addColorStop(1,chance?'#e8b23a':'#f3ead8'); ctx.fillStyle=fill; ctx.fillRect(x,y,w*power,h);
  for(let i=1;i<10;i++){ ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(x+w*i/10-1,y,2,h); }
  if(tapKick>0){ ctx.strokeStyle=`rgba(255,240,210,${tapKick*.8})`; ctx.lineWidth=2; ctx.strokeRect(x-2,y-2,w+4,h+4); }
  ctx.font='12px "Noto Sans KR",sans-serif'; ctx.textBaseline='bottom'; ctx.textAlign='left'; ctx.fillStyle='#f3ead8'; ctx.fillText(`힘 · ${taps}회 연타`,x,y-5);
  ctx.textAlign='right'; ctx.fillStyle=chance?'#e8b23a':'#ab9c88'; ctx.fillText(chance?`한판 찬스 ${left.toFixed(1)}초`:'채우면 절반',x+w,y-5);
  ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillStyle='#ab9c88'; ctx.fillText(power<.25&&st>.8?'상대가 버티는 중! 더 빨리!':'',x+w/2,y+h+3); }

let last=performance.now();
function frame(now){ if(!alive) return; let dt=Math.min(.05,(now-last)/1000); last=now;
  if(slow>0){ slow-=dt; dt*=.3; }
  if(W>0&&H>0){ if(!cam.fx){ cam.fx=W/2; cam.fy=H/2; }
    const ck=reduce?1:1-Math.exp(-dt*camT.k); const tz=reduce?1:camT.z,tr=reduce?0:camT.r; cam.z+=(tz-cam.z)*ck; cam.r+=(tr-cam.r)*ck; cam.fx+=((reduce?W/2:camT.fx)-cam.fx)*ck; cam.fy+=((reduce?H/2:camT.fy)-cam.fy)*ck;
    const cineT=(state==='throw'||state==='down')?1:0; cine+=(cineT-cine)*(1-Math.exp(-dt*6));
    ctx.fillStyle='#1c1712'; ctx.fillRect(0,0,W,H);
    ctx.save(); if(shake>0&&!reduce){ const k=shake*10*S; ctx.translate(rand(-k,k),rand(-k,k)); } shake=Math.max(0,shake-dt*2.2);
    ctx.translate(W/2,H/2); ctx.scale(cam.z,cam.z); ctx.rotate(cam.r); ctx.translate(-cam.fx,-cam.fy);
    drawDojo();
    ripples.forEach(r=>{ r.t+=dt*1.6; if(r.t>1) return; ctx.strokeStyle=`rgba(243,234,216,${(1-r.t)*.6})`; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(r.x,GY+6,(30+r.t*220)*S,(6+r.t*30)*S,0,0,TAU); ctx.stroke(); });
    for(let i=ripples.length-1;i>=0;i--) if(ripples[i].t>1) ripples.splice(i,1);
    scene(dt);
    dust.forEach(d=>{ d.vy+=300*S*dt; d.x+=d.vx*dt; d.y+=d.vy*dt; if(d.y>GY){ d.y=GY; d.vy*=-.2; d.vx*=.6; } d.t-=dt*1.1; ctx.fillStyle=`rgba(230,220,195,${Math.max(0,d.t)*.7})`; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,TAU); ctx.fill(); });
    for(let i=dust.length-1;i>=0;i--) if(dust[i].t<=0) dust.splice(i,1);
    ctx.restore();
    const vg=ctx.createRadialGradient(W/2,H*.45,Math.min(W,H)*.35,W/2,H*.45,Math.max(W,H)*.8); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,`rgba(0,0,0,${.55+cine*.25})`); ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
    if(speedL>.02&&!reduce){ ctx.strokeStyle=`rgba(255,250,235,${speedL*.35})`; ctx.lineWidth=2; for(let i=0;i<22;i++){ const a=rand(0,TAU),r0=Math.min(W,H)*rand(.32,.45),r1=r0+rand(40,120)*S; ctx.beginPath(); ctx.moveTo(W/2+Math.cos(a)*r0,H/2+Math.sin(a)*r0); ctx.lineTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1); ctx.stroke(); } }
    if(flashW>0){ ctx.fillStyle=`rgba(255,248,230,${flashW*.55})`; ctx.fillRect(0,0,W,H); flashW=Math.max(0,flashW-dt*4); }
    if(cine>.01){ const bh=cine*H*.085; ctx.fillStyle='#000'; ctx.fillRect(0,0,W,bh); ctx.fillRect(0,H-bh,W,bh); }
    drawGauge();
    pops.forEach(p=>{ p.t+=dt/(p.big?1.8:1.3); if(p.t>1) return; const sc=p.big?(p.t<.12?1.6-p.t*5:1):1+Math.min(1,p.t*6)*.1; ctx.save(); ctx.translate(W/2,H*(p.y||.38)-p.t*16); ctx.scale(sc,sc); ctx.globalAlpha=Math.min(1,(1-p.t)*2.5);
      ctx.font=`${p.size*Math.min(1,S*1.1+.2)}px ${DISPLAY}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineWidth=8; ctx.strokeStyle='#120e0a'; ctx.strokeText(p.txt,0,0); ctx.fillStyle=p.col; ctx.fillText(p.txt,0,0); ctx.restore(); });
    for(let i=pops.length-1;i>=0;i--) if(pops[i].t>=1) pops.splice(i,1);
  }
  requestAnimationFrame(frame); }
requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); removeEventListener('keydown',kd); timers.forEach(clearTimeout); clearTimeout(hintT); };
}});
