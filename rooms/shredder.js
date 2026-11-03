/* 걱정 파쇄기 방 */
H.register('shredder',{title:'걱정 파쇄기',sub:'걱정을 적고 갈아 버리거나 태워 버리기',floor:1,icon:'🗑️',color:'#9aa4b1',
blurb:'적은 걱정을 드르륵 갈아요',
mount(root){
root.innerHTML=`
<div class="stage" data-r="stage">
  <span class="badge" data-r="count">없앤 걱정 0개</span>
  <div class="hint" data-r="hint"></div>
</div>
<div class="tabs" role="tablist">
  <button class="tab" role="tab" aria-selected="true" data-m="shred">파쇄기</button>
  <button class="tab" role="tab" aria-selected="false" data-m="burn">태우기</button>
</div>
<div class="row">
  <textarea class="field" id="sh-txt" rows="2" maxlength="80" placeholder="요즘 머릿속을 맴도는 걱정을 적어 보세요"></textarea>
  <button class="btn" data-r="go" style="align-self:stretch">갈아 버리기</button>
</div>`;
const q=k=>root.querySelector(`[data-r="${k}"]`),txt=root.querySelector('#sh-txt');
const S=H.canvas(q('stage')),ctx=S.ctx;
const HAND='"Nanum Pen Script","Noto Sans KR",cursive';
let mode='shred',count=H.store.get('shred',0);q('count').textContent=`없앤 걱정 ${count}개`;
root.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{if(state!=='idle')return;mode=b.dataset.m;
  root.querySelectorAll('[data-m]').forEach(x=>x.setAttribute('aria-selected',x===b));q('go').textContent=mode==='shred'?'갈아 버리기':'태워 버리기';paper=null});
S.c.addEventListener('pointerdown',()=>{const t=H.now();H.noise(t,.12,'bandpass',3500,.8,.2);H.buzz(10);if(state==='idle')txt.focus()});
const hint=t=>{q('hint').textContent=t;q('hint').style.opacity=t?1:0};
hint('걱정을 적고 버튼을 누르세요');

/* geometry */
function G(){const W=S.W,Hh=S.H,mw=Math.min(W*.78,340),mh=Math.max(54,Hh*.12),my=Hh*.46,pw=mw*.78,ph=Math.min(pw*1.3,my-24);
  return{W,Hh,mw,mh,mx:(W-mw)/2,my,pw,ph,px:(W-pw)/2,py:my-ph-6,binTop:my+mh,binBot:Hh-8}}

let paper=null,pText='',state='idle',p=0,strips=[],pile=[],embers=[],flames=[];
function makePaper(text){const g=G(),d=2,c=document.createElement('canvas');c.width=g.pw*d;c.height=g.ph*d;const x=c.getContext('2d');x.scale(d,d);
  x.fillStyle='#fbf7ec';x.fillRect(0,0,g.pw,g.ph);
  x.strokeStyle='rgba(80,130,200,.35)';x.lineWidth=1;for(let y=34;y<g.ph;y+=24){x.beginPath();x.moveTo(0,y);x.lineTo(g.pw,y);x.stroke()}
  x.strokeStyle='rgba(220,80,80,.45)';x.beginPath();x.moveTo(22,0);x.lineTo(22,g.ph);x.stroke();
  x.fillStyle='#22324a';let fs=Math.min(30,g.pw*.12);x.font=`${fs}px ${HAND}`;
  let lines=H.wrap(x,text,g.pw-40);while(lines.length*fs*1.1>g.ph-40&&fs>12){fs-=2;x.font=`${fs}px ${HAND}`;lines=H.wrap(x,text,g.pw-40)}
  x.textBaseline='alphabetic';lines.forEach((l,i)=>x.fillText(l,30,30+fs+i*fs*1.12));
  return c}

let grindNodes=null;
function grindSound(on){const a=H.ac();if(!a)return;
  if(on){const t=a.currentTime,o=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();
    o.type='sawtooth';o.frequency.value=62;o2.type='square';o2.frequency.value=124.5;f.type='lowpass';f.frequency.value=900;
    lfo.frequency.value=13;lg.gain.value=.12;lfo.connect(lg).connect(g.gain);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.08);
    o.connect(f);o2.connect(f);f.connect(g).connect(H.out());o.start();o2.start();lfo.start();
    const n=a.createBufferSource();n.buffer=H.noiseBuf();n.loop=true;const nf=a.createBiquadFilter();nf.type='bandpass';nf.frequency.value=2600;nf.Q.value=.8;const ng=a.createGain();ng.gain.value=.25;
    n.connect(nf).connect(ng).connect(H.out());n.start();grindNodes={o,o2,lfo,n,g,ng}}
  else if(grindNodes){const t=a.currentTime,n=grindNodes;n.g.gain.cancelScheduledValues(t);n.g.gain.setTargetAtTime(.0001,t,.05);n.ng.gain.setTargetAtTime(.0001,t,.05);
    [n.o,n.o2,n.lfo,n.n].forEach(x=>x.stop(t+.3));grindNodes=null}}
let crackleT=0;

q('go').onclick=()=>{if(state!=='idle')return;const t=txt.value.trim();if(!t){txt.focus();hint('먼저 걱정을 적어 주세요');return}
  H.ac();pText=t;paper=makePaper(t);p=0;state='feed';txt.value='';hint('');
  if(mode==='shred'){grindSound(true);buzzLoop()}
  else{const tt=H.now();H.noise(tt,.4,'lowpass',500,.7,.5,{atk:.05,wet:true});H.buzz(40)}};
let buzzT=null;function buzzLoop(){H.buzz([90,40,90,40,90,40,90,40,90,40,90,40,90,40,90]);}

function done(){state='idle';count++;H.store.set('shred',count);q('count').textContent=`없앤 걱정 ${count}개`;
  hint(mode==='shred'?'걱정 1장, 가루가 됐어요':'걱정 1장, 재가 되어 날아갔어요');paper=null;
  const t=H.now();H.tone(880,t,.12,.12,'sine');H.tone(1320,t+.12,.25,.12,'sine')}

function drawRoom(g){const gr=ctx.createLinearGradient(0,0,0,g.Hh);gr.addColorStop(0,'#2b2e33');gr.addColorStop(1,'#14161a');ctx.fillStyle=gr;ctx.fillRect(0,0,g.W,g.Hh);
  const l=ctx.createRadialGradient(g.W/2,g.Hh*.2,10,g.W/2,g.Hh*.3,g.Hh);l.addColorStop(0,'rgba(255,255,255,.08)');l.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=l;ctx.fillRect(0,0,g.W,g.Hh)}
function drawBin(g){ctx.fillStyle='rgba(255,255,255,.04)';ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(g.mx+6,g.binTop);ctx.lineTo(g.mx+g.mw-6,g.binTop);ctx.lineTo(g.mx+g.mw-18,g.binBot);ctx.lineTo(g.mx+18,g.binBot);ctx.closePath();ctx.fill();ctx.stroke();
  pile.forEach(s=>{ctx.strokeStyle=s.c;ctx.lineWidth=s.w;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.quadraticCurveTo(s.x+s.dx*.5,s.y-6,s.x+s.dx,s.y+s.dy);ctx.stroke()})}
function drawMachine(g){const{mx,my,mw,mh}=g;const b=ctx.createLinearGradient(0,my,0,my+mh);b.addColorStop(0,'#5d636c');b.addColorStop(1,'#33373d');
  ctx.fillStyle=b;H.rr(ctx,mx,my,mw,mh,10);ctx.fill();
  ctx.fillStyle='#0b0c0e';ctx.fillRect(mx+mw*.08,my-3,mw*.84,6);
  ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(mx+8,my+6,mw-16,2);
  ctx.fillStyle='#c9ced6';ctx.font=`${Math.max(12,mh*.26)}px "Black Han Sans",sans-serif`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('걱정 파쇄기',mx+14,my+mh*.6);
  const on=state==='feed';ctx.fillStyle=on?'#4ade80':'#3a4a3e';ctx.beginPath();ctx.arc(mx+mw-22,my+mh*.6,6,0,7);ctx.fill();
  if(on){ctx.fillStyle='rgba(74,222,128,.3)';ctx.beginPath();ctx.arc(mx+mw-22,my+mh*.6,12,0,7);ctx.fill()}}
function drawTray(g){const y=g.my+10,w=g.pw*1.15,x=(g.W-w)/2;ctx.fillStyle='#3d3f44';ctx.beginPath();ctx.ellipse(g.W/2,y,w/2,14,0,0,7);ctx.fill();
  ctx.fillStyle='#24262a';ctx.beginPath();ctx.ellipse(g.W/2,y-2,w/2-6,10,0,0,7);ctx.fill()}

const stop=H.loop((dt,now)=>{const g=G();drawRoom(g);
  const shk=state==='feed'&&mode==='shred'&&!H.reduce?2:0;ctx.save();if(shk)ctx.translate((Math.random()-.5)*shk,(Math.random()-.5)*shk);
  if(mode==='shred'){drawBin(g);
    if(paper){const L=p*g.ph;
      // above slot
      ctx.save();ctx.beginPath();ctx.rect(0,0,g.W,g.my);ctx.clip();ctx.drawImage(paper,0,0,paper.width,paper.height*(1-p),g.px,g.my-(g.ph-L)-(state==='idle'?6:0)+0,g.pw,g.ph-L);
      ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(g.px+g.pw,g.my-(g.ph-L),4,g.ph-L);ctx.restore();
      // strips emerging
      if(L>0){const n=12,sw=g.pw/n,sy=paper.height*(1-p);
        for(let i=0;i<n;i++){const wob=Math.sin(now/90+i*1.7)*2*p;ctx.drawImage(paper,i*paper.width/n,sy,paper.width/n*.82,paper.height*p,g.px+i*sw+wob,g.my+g.mh,sw*.82,L)}}}
    drawMachine(g);
    if(state==='feed'){p+=dt/150;if(p>=1){p=1;state='fall';grindSound(false);
        const n=12,sw=g.pw/n;strips=[];for(let i=0;i<n;i++)strips.push({i,x:g.px+i*sw,y:g.my+g.mh,vy:Math.random()*.5,vr:(Math.random()-.5)*.02,r:0})}}
    if(state==='fall'){let alive=0;const n=12;
      strips.forEach(s=>{s.vy+=.3*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;const bot=g.binBot-4;
        if(s.y<bot-10){alive++;ctx.save();ctx.translate(s.x+g.pw/n*.4,s.y+g.ph/2);ctx.rotate(s.r);ctx.drawImage(paper,s.i*paper.width/n,0,paper.width/n*.82,paper.height,-g.pw/n*.4,-g.ph/2,g.pw/n*.82,g.ph);ctx.restore()}
        else if(!s.done){s.done=true;for(let k=0;k<6;k++)pile.push({x:g.mx+30+Math.random()*(g.mw-60),y:g.binBot-6-Math.random()*Math.min(60,pile.length*.08+8),dx:(Math.random()-.5)*30,dy:(Math.random()-.5)*8,w:3,c:Math.random()<.5?'#efe8d8':'#d7dde6'})}});
      if(pile.length>500)pile.splice(0,pile.length-500);
      if(!alive){strips=[];done()}}
    if(state==='idle'&&!paper){ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='15px "Noto Sans KR",sans-serif';ctx.textAlign='center';ctx.fillText('↓ 여기에 걱정이 들어가요',g.W/2,g.my-20)}
  }else{ // burn
    drawTray(g);
    if(paper){const top=g.py+14,front=top+g.ph-p*(g.ph+40);
      ctx.save();ctx.beginPath();ctx.moveTo(g.px-10,top-10);ctx.lineTo(g.px+g.pw+10,top-10);
      for(let x=g.pw+10;x>=-10;x-=8){ctx.lineTo(g.px+x,front+Math.sin(x*.07+now/200)*7+Math.sin(x*.21)*4)}ctx.closePath();ctx.clip();
      ctx.drawImage(paper,g.px,top,g.pw,g.ph);
      // char band
      ctx.globalCompositeOperation='multiply';const cb=ctx.createLinearGradient(0,front-40,0,front);cb.addColorStop(0,'rgba(255,255,255,1)');cb.addColorStop(.6,'rgba(160,110,60,1)');cb.addColorStop(1,'rgba(40,20,10,1)');
      ctx.fillStyle=cb;ctx.fillRect(g.px,front-40,g.pw,48);ctx.globalCompositeOperation='source-over';ctx.restore();
      if(state==='feed'){for(let k=0;k<4;k++){const x=g.px+Math.random()*g.pw;flames.push({x,y:front+Math.sin((x-g.px)*.07+now/200)*7,vy:-1-Math.random()*2.2,vx:(Math.random()-.5)*.6,t:1,r:6+Math.random()*10})}
        if(Math.random()<.15)embers.push({x:g.px+Math.random()*g.pw,y:front,vx:(Math.random()-.5)*1.5,vy:-1.5-Math.random()*2,t:1});
        crackleT-=dt;if(crackleT<=0){crackleT=2+Math.random()*6;const t=H.now();H.noise(t,.015+Math.random()*.03,'highpass',2000+Math.random()*3000,1,.15+Math.random()*.25);if(Math.random()<.15)H.buzz(15)}
        p+=dt/200;if(p>=1){state='fall';for(let i=0;i<40;i++)embers.push({x:g.px+Math.random()*g.pw,y:top+Math.random()*30,vx:(Math.random()-.5)*2,vy:-1-Math.random()*2,t:1});setTimeout(()=>{if(state==='fall')done()},1400)}}}
    ctx.globalCompositeOperation='lighter';
    for(let i=flames.length-1;i>=0;i--){const f=flames[i];f.x+=f.vx*dt;f.y+=f.vy*dt;f.t-=.035*dt;f.r*=.985;if(f.t<=0){flames.splice(i,1);continue}
      const gg=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);gg.addColorStop(0,`rgba(255,${180+60*f.t|0},80,${.6*f.t})`);gg.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill()}
    for(let i=embers.length-1;i>=0;i--){const e=embers[i];e.x+=e.vx*dt+Math.sin(now/300+i)*.3;e.y+=e.vy*dt;e.t-=.012*dt;if(e.t<=0){embers.splice(i,1);continue}
      ctx.fillStyle=`rgba(255,${120+100*e.t|0},40,${e.t})`;ctx.beginPath();ctx.arc(e.x,e.y,1.6,0,7);ctx.fill()}
    ctx.globalCompositeOperation='source-over';
    if(state==='idle'&&!paper){ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='15px "Noto Sans KR",sans-serif';ctx.textAlign='center';ctx.fillText('걱정을 적으면 여기서 태워요',g.W/2,g.my-30)}
  }
  ctx.restore()});
return()=>{stop();S.stop();grindSound(false);try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}};
}});
