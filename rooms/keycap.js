/* 딸깍 키캡 방 — 기계식 키보드 ASMR */
H.register('keycap',{title:'딸깍 키캡',sub:'누를 때마다 찰칵 — 여러 손가락으로 동시에',floor:1,icon:'⌨️',color:'#e8b23a',
blurb:'찰칵찰칵 기계식 키보드',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.kc-stats{position:absolute;top:10px;right:10px;display:flex;gap:12px;pointer-events:none;font-variant-numeric:tabular-nums}
.kc-stats .s{text-align:right;background:rgba(0,0,0,.45);padding:4px 9px;border-radius:8px}
.kc-stats b{display:block;font-family:var(--display);font-weight:400;font-size:18px;color:#e8b23a;line-height:1}
.kc-stats span{font-size:10px;color:#cfc4b6}
.kc-sw{width:26px;height:26px;border-radius:50%;border:2px solid var(--line);padding:0;cursor:pointer}
.kc-sw[aria-pressed="true"]{border-color:#fff;box-shadow:0 0 0 2px #e8b23a}
.kc-lab{font-size:11px;color:var(--muted);margin-right:2px}
</style>
<div class="stage" data-r="stage" style="background:#201b17">
  <canvas data-r="cv" aria-label="키캡 놀이 화면" style="touch-action:none"></canvas>
  <div class="kc-stats" data-r="stats"></div>
  <div class="hint" data-r="hint"></div>
</div>
<div class="row"><span class="kc-lab">스위치</span>
  <button class="chip" data-sw="blue" aria-pressed="true" type="button">청축 · 찰칵</button>
  <button class="chip" data-sw="brown" aria-pressed="false" type="button">갈축 · 톡</button>
  <button class="chip" data-sw="red" aria-pressed="false" type="button">적축 · 도각</button>
</div>
<div class="row"><span class="kc-lab">키캡</span>
  <button class="kc-sw" data-cw="cream" aria-pressed="true" style="background:#efe6d2" aria-label="크림" type="button"></button>
  <button class="kc-sw" data-cw="ink" aria-pressed="false" style="background:#2e2c30" aria-label="먹색" type="button"></button>
  <button class="kc-sw" data-cw="mint" aria-pressed="false" style="background:#bfe3d2" aria-label="민트" type="button"></button>
  <button class="chip" data-r="rgb" aria-pressed="true" type="button">무지개 불빛</button>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const DISPLAY='"Black Han Sans","Noto Sans KR",sans-serif';
const rand=(a,b)=>a+Math.random()*(b-a);
let W=0,H=0,DPR=1,alive=true;
function resize(){ DPR=Math.min(devicePixelRatio||1,2); const r=stage.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
function rr(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function setStats(arr){ $('stats').innerHTML=arr.map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join(''); }
let hintTimer=0; function hint(t){ const h=$('hint'); h.textContent=t; h.style.opacity=1; clearTimeout(hintTimer); hintTimer=setTimeout(()=>h.style.opacity=0,4200); }
const buzz=p=>Hp.buzz(p);

/* audio — 사이트 공용 오디오(음소거 버튼과 연동) */
let ac=null,master=null,noiseBuf=null;
function audio(){ ac=Hp.ac(); if(!ac) return null; master=Hp.out();
  if(!noiseBuf){ noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  return ac; }
function noise(at,dur,type,f,q,vol,rate){ if(!ac) return; const t=ac.currentTime+(at||0); const n=ac.createBufferSource(); n.buffer=noiseBuf; n.playbackRate.value=rate||rand(.85,1.15);
  const fl=ac.createBiquadFilter(); fl.type=type; fl.frequency.value=f; fl.Q.value=q; const g=ac.createGain();
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur); n.connect(fl); fl.connect(g); g.connect(master); n.start(t,Math.random()*1.5); n.stop(t+dur+.02); }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+(at||0); const o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur);
  const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }

const KEYC={
  rows:[['Q','W','E','R','T'],['A','S','D','F','G'],['Z','X','C','V','B']],
  jamo:{Q:'ㅂ',W:'ㅈ',E:'ㄷ',R:'ㄱ',T:'ㅅ',A:'ㅁ',S:'ㄴ',D:'ㅇ',F:'ㄹ',G:'ㅎ',Z:'ㅋ',X:'ㅌ',C:'ㅊ',V:'ㅍ',B:'ㅠ'},
  ways:{
    cream:{plate:'#2a2522',caseC:'#3b332d',base:'#efe6d2',top:'#f8f2e4',side:'#cbbd9f',legend:'#3a3430',jamo:'#b0573f',acc:'#c4543a',accTop:'#d6654a',accSide:'#93402d',accLegend:'#fff2e2'},
    ink:{plate:'#141316',caseC:'#232126',base:'#2e2c30',top:'#3a383d',side:'#1b1a1d',legend:'#e9e4da',jamo:'#e8b23a',acc:'#e8b23a',accTop:'#f2c457',accSide:'#a87d1e',accLegend:'#1c1308'},
    mint:{plate:'#22302c',caseC:'#2f403a',base:'#bfe3d2',top:'#d3efe2',side:'#93bfaa',legend:'#24423a',jamo:'#d0563f',acc:'#f2efe6',accTop:'#ffffff',accSide:'#c9c4b6',accLegend:'#24423a'}
  }
};
const keyToy=(()=>{
  const keys=[]; KEYC.rows.forEach((row,r)=>row.forEach((id,c)=>keys.push({id,jamo:KEYC.jamo[id],r,c,u:1,off:[0,.25,.5][r],press:0,down:0,glow:0})));
  keys.push({id:'SPACE',jamo:'',r:3,c:0,u:4,off:.75,press:0,down:0,glow:0});
  let sw='blue',way='cream',rgb=true,count=Hp.store.get('keycap',0),stamps=[],ripples=[],pops=[],U=60,ptr=new Map(),t=0,saveT=0;
  function layout(){ U=Math.min((W-28)/5.75,(H-30)/4.7,118); const ox=(W-5.5*U)/2,oy=(H-4*U)/2-U*.06;
    keys.forEach(k=>{ k.x=ox+(k.off+k.c)*U; k.y=oy+k.r*U; k.w=k.u*U; k.cx=k.x+k.w/2; k.cy=k.y+U/2; }); return {ox,oy}; }
  function sound(k,phase){ if(!audio()) return; const sp=k.id==='SPACE', j=rand(.9,1.1);
    if(phase==='down'){
      if(sw==='blue'){ noise(0,.012,'highpass',3600*j,.7,.6); tone(0,.012,3100*j,.04,'square'); noise(.016,.045,'bandpass',1500*j,.9,.38); }
      else if(sw==='brown'){ noise(0,.016,'bandpass',1900*j,1.2,.22); noise(.012,.05,'lowpass',1300*j,.8,.55); tone(.012,.05,260*j,.22,'sine',140); }
      else { noise(0,.055,'lowpass',900*j,.8,.62); tone(0,.06,220*j,.3,'sine',120); }
      if(sp){ noise(.004,.08,'lowpass',600,.7,.5); noise(.022,.025,'bandpass',2600,4,.16); noise(.038,.02,'bandpass',2300,4,.12); }
    } else {
      if(sw==='blue'){ noise(0,.01,'highpass',3200*j,.7,.32); }
      else noise(0,.03,'lowpass',1300*j,.8,.17);
      if(sp) noise(.01,.03,'bandpass',2400,4,.12);
    } }
  function pressKey(k){ if(k.down) return; k.down=1; count++; stamps.push(performance.now()); sound(k,'down'); buzz(12);
    ripples.push({x:k.cx,y:k.cy,t:0}); if(ripples.length>12) ripples.shift();
    pops.push({x:k.cx+rand(-8,8),y:k.y,txt:k.jamo||'␣',t:0}); if(pops.length>30) pops.shift(); stats();
    clearTimeout(saveT); saveT=setTimeout(()=>Hp.store.set('keycap',count),600); }
  function releaseKey(k){ if(!k.down) return; k.down=0; sound(k,'up'); }
  function hit(x,y){ return keys.find(k=>x>=k.x&&x<=k.x+k.w&&y>=k.y&&y<=k.y+U); }
  function kpm(){ const now=performance.now(); stamps=stamps.filter(s=>now-s<10000); return stamps.length*6; }
  const swName={blue:'청축',brown:'갈축',red:'적축'};
  function stats(){ setStats([[count,'딸깍'],[kpm(),'분당'],[swName[sw],'스위치']]); }
  function drawKey(k,c){ const g=U*.05,x=k.x+g,y=k.y+g,w=k.w-2*g,h=U-2*g,acc=(k.id==='SPACE'||k.id==='Q'),d=k.press,trv=h*.075,rad=h*.12;
    const gl=Math.min(1,k.glow+d*.6);
    if(gl>.03){ const col=rgb?`hsla(${(t*50+k.cx*.6+k.cy*.4)%360},95%,62%,${.85*gl})`:`rgba(255,205,140,${.6*gl})`;
      ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=U*.45*gl; ctx.fillStyle=col; rr(ctx,x+2,y+2+trv,w-4,h-4,rad); ctx.fill(); ctx.restore(); }
    const sy=y+d*trv; ctx.fillStyle=acc?c.accSide:c.side; rr(ctx,x,sy,w,h-d*trv*.5,rad); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.18)'; rr(ctx,x,sy+h*.55,w,h*.45-d*trv*.5,rad); ctx.fill();
    const si=h*.12,tx=x+si,ty=sy+si*.45,tw=w-2*si,th=h-si*2.15; const grd=ctx.createLinearGradient(0,ty,0,ty+th);
    grd.addColorStop(0,acc?c.accTop:c.top); grd.addColorStop(1,acc?c.acc:c.base); ctx.fillStyle=grd; rr(ctx,tx,ty,tw,th,rad*.8); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=1; rr(ctx,tx+.5,ty+.5,tw-1,th-1,rad*.8); ctx.stroke();
    ctx.fillStyle=acc?c.accLegend:c.legend; ctx.textBaseline='top'; ctx.textAlign='left';
    if(k.id==='SPACE'){ ctx.font=`${U*.16}px ${DISPLAY}`; ctx.textAlign='center'; ctx.fillText('스페이스',tx+tw/2,ty+th*.38); }
    else { ctx.font=`${U*.2}px ${DISPLAY}`; ctx.fillText(k.id,tx+tw*.13,ty+th*.1); ctx.fillStyle=acc?c.accLegend:c.jamo; ctx.font=`${U*.19}px "Noto Sans KR",sans-serif`; ctx.textAlign='right'; ctx.textBaseline='bottom'; ctx.fillText(k.jamo,tx+tw*.88,ty+th*.92); }
    if(k.id==='F'){ ctx.fillStyle='rgba(0,0,0,.22)'; rr(ctx,tx+tw*.36,ty+th*.8,tw*.28,h*.035,2); ctx.fill(); }
  }
  return {
    hint:'키캡을 누르세요 · 여러 손가락으로 동시에 · PC는 Q~B 키와 스페이스바',
    enter(){ layout(); stats(); },
    down(x,y,id){ const k=hit(x,y); if(k){ ptr.set(id,k); pressKey(k); } },
    move(x,y,id){ const k=ptr.get(id); if(!k) return; const n=hit(x,y); if(n!==k){ releaseKey(k); ptr.delete(id); if(n){ ptr.set(id,n); pressKey(n);} } },
    up(x,y,id){ const k=ptr.get(id); if(k){ releaseKey(k); ptr.delete(id); } },
    key(e,down){ let id=null; if(e.code==='Space') id='SPACE'; else if(/^Key[A-Z]$/.test(e.code)) id=e.code.slice(3);
      if(!id) return false; let k=keys.find(q=>q.id===id); if(!k){ if(!down) return true; k=keys[Math.floor(rand(0,keys.length-1))]; pressKey(k); setTimeout(()=>releaseKey(k),90); return true; }
      if(down){ if(!e.repeat) pressKey(k); } else releaseKey(k); return true; },
    setSwitch(s){ sw=s; stats(); }, setWay(w){ way=w; }, setRgb(v){ rgb=v; },
    save(){ Hp.store.set('keycap',count); },
    draw(dt){ t+=dt; const {ox,oy}=layout(); const c=KEYC.ways[way];
      const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#2b241e'); bg.addColorStop(1,'#120f0c'); ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(255,255,255,.03)'; for(let y=8;y<H;y+=14){ ctx.beginPath(); ctx.moveTo(0,y); ctx.bezierCurveTo(W*.3,y+4,W*.6,y-4,W,y+2); ctx.stroke(); }
      const px=ox-U*.22,py=oy-U*.22,pw=5.5*U+U*.44,ph=4*U+U*.44;
      ctx.fillStyle='rgba(0,0,0,.45)'; rr(ctx,px+6,py+12,pw,ph,U*.22); ctx.fill();
      ctx.fillStyle=c.caseC; rr(ctx,px,py,pw,ph,U*.22); ctx.fill(); ctx.fillStyle=c.plate; rr(ctx,px+U*.1,py+U*.1,pw-U*.2,ph-U*.2,U*.14); ctx.fill();
      ripples.forEach(r=>r.t+=dt); ripples=ripples.filter(r=>r.t<1.3);
      keys.forEach(k=>{ let g=0; ripples.forEach(r=>{ const d=Math.hypot(k.cx-r.x,k.cy-r.y); const f=Math.exp(-Math.pow((d-r.t*U*5.5)/(U*.75),2))*(1-r.t/1.3); g=Math.max(g,f); }); k.glow+=(g-k.glow)*Math.min(1,dt*18);
        const tgt=k.down?1:0; k.press+=(tgt-k.press)*Math.min(1,dt*(k.down?45:22)); drawKey(k,c); });
      ctx.textAlign='center'; ctx.textBaseline='middle';
      pops.forEach(p=>{ p.t+=dt; if(p.t>1) return; const a=1-p.t; ctx.globalAlpha=a; ctx.font=`${U*.36}px ${DISPLAY}`; ctx.lineWidth=5; ctx.strokeStyle='#120f0c';
        const yy=p.y-p.t*U*1.1; ctx.strokeText(p.txt,p.x,yy); ctx.fillStyle=rgb?`hsl(${(t*50+p.x*.6)%360},90%,70%)`:'#ffe2b0'; ctx.fillText(p.txt,p.x,yy); }); ctx.globalAlpha=1;
      if(Math.random()<dt*2) stats();
    }};
})();

const toy=keyToy;
const ro=new ResizeObserver(resize); ro.observe(stage); resize();
const pt=e=>{ const r=cv.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; };
cv.addEventListener('pointerdown',e=>{ e.preventDefault(); audio(); try{cv.setPointerCapture(e.pointerId)}catch(_){} const [x,y]=pt(e); toy.down(x,y,e.pointerId); });
cv.addEventListener('pointermove',e=>{ const [x,y]=pt(e); toy.move(x,y,e.pointerId); });
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{ const [x,y]=pt(e); toy.up(x,y,e.pointerId); }));
const kd=e=>{ if(e.target.matches&&e.target.matches('input,textarea')||e.metaKey||e.ctrlKey||e.altKey) return; if(e.target.tagName==='BUTTON'&&(e.code==='Space'||e.code==='Enter')) return; audio(); if(toy.key(e,true)) e.preventDefault(); };
const ku=e=>{ toy.key(e,false); };
addEventListener('keydown',kd); addEventListener('keyup',ku);
root.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{ root.querySelectorAll('[data-sw]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); keyToy.setSwitch(b.dataset.sw); });
root.querySelectorAll('[data-cw]').forEach(b=>b.onclick=()=>{ root.querySelectorAll('[data-cw]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); keyToy.setWay(b.dataset.cw); });
$('rgb').onclick=()=>{ const v=$('rgb').getAttribute('aria-pressed')!=='true'; $('rgb').setAttribute('aria-pressed',String(v)); keyToy.setRgb(v); };
toy.enter(); hint(toy.hint);

let last=performance.now();
function frame(now){ if(!alive) return; const dt=Math.min(.05,(now-last)/1000); last=now; if(W>0&&H>0){ ctx.save(); toy.draw(dt); ctx.restore(); } requestAnimationFrame(frame); }
requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); removeEventListener('keydown',kd); removeEventListener('keyup',ku); clearTimeout(hintTimer); toy.save(); };
}});
