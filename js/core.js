/* ================= core ================= */
(()=>{
const ROOMS={},ORDER=[];
const H=window.H={
  register(id,def){ROOMS[id]=def;ORDER.push(id)},
  rooms:ROOMS,order:ORDER,
  reduce:!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches),
  muted:false,
};
try{H.muted=localStorage.getItem('sr-mute')==='1'}catch(e){}

/* ---- audio ---- */
let ac=null,master=null,verb=null,nbuf=null;
H.ac=()=>{
  if(!ac){
    try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}
    master=ac.createGain();master.gain.value=H.muted?0:1;master.connect(ac.destination);
    const len=ac.sampleRate*1.4|0,ir=ac.createBuffer(2,len,ac.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
    verb=ac.createConvolver();verb.buffer=ir;const wet=ac.createGain();wet.gain.value=.28;verb.connect(wet).connect(master);
    nbuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }
  if(ac.state==='suspended')ac.resume();
  return ac;
};
H.out=()=>{H.ac();return master};
H.verb=()=>{H.ac();return verb};
H.noiseBuf=()=>{H.ac();return nbuf};
/* filtered noise burst */
H.noise=(t,dur,type,freq,q,vol,o={})=>{const a=H.ac();if(!a)return;
  const n=a.createBufferSource();n.buffer=nbuf;n.playbackRate.value=(o.rate||1)*(0.85+Math.random()*0.3);
  const f=a.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
  const g=a.createGain();const atk=o.atk||0.002;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(vol,0.0002),t+atk);g.gain.exponentialRampToValueAtTime(0.0001,t+atk+dur);
  n.connect(f).connect(g);g.connect(o.dest||master);if(o.wet)g.connect(verb);
  const off=Math.random()*0.4;n.start(t,off);n.stop(t+atk+dur+0.05)};
/* enveloped tone */
H.tone=(freq,t,dur,vol,type='sine',o={})=>{const a=H.ac();if(!a)return;
  const os=a.createOscillator(),g=a.createGain();os.type=type;os.frequency.setValueAtTime(freq,t);
  if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+(o.glide||dur));
  const atk=o.atk||0.005;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(vol,0.0002),t+atk);g.gain.exponentialRampToValueAtTime(0.0001,t+atk+dur);
  os.connect(g);g.connect(o.dest||master);if(o.wet)g.connect(verb);os.start(t);os.stop(t+atk+dur+0.05)};
H.now=()=>{const a=H.ac();return a?a.currentTime:0};
H.buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

/* ---- canvas & loop helpers ---- */
H.canvas=(host)=>{const c=document.createElement('canvas');host.prepend(c);const ctx=c.getContext('2d');
  const s={c,ctx,W:1,H:1,dpr:1,onresize:null};
  const fit=()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;s.dpr=Math.min(window.devicePixelRatio||1,2);
    s.W=r.width;s.H=r.height;c.width=Math.round(r.width*s.dpr);c.height=Math.round(r.height*s.dpr);ctx.setTransform(s.dpr,0,0,s.dpr,0,0);s.onresize&&s.onresize()};
  const ro=new ResizeObserver(fit);ro.observe(host);fit();
  s.pos=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  s.stop=()=>ro.disconnect();return s};
H.loop=fn=>{let on=true,id,last=performance.now();const f=n=>{if(!on)return;const dt=Math.min(3,(n-last)/16.67);last=n;fn(dt,n);id=requestAnimationFrame(f)};
  id=requestAnimationFrame(f);return()=>{on=false;cancelAnimationFrame(id)}};
H.rr=(ctx,x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()};
H.wrap=(ctx,text,maxW)=>{const out=[];String(text).split('\n').forEach(par=>{let line='';for(const ch of [...par]){const t=line+ch;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=ch.trim()?ch:''}else line=t}out.push(line)});return out};
H.store={get(k,d){try{const v=localStorage.getItem('sr-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('sr-'+k,JSON.stringify(v))}catch(e){}}};
H.esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
H.ago=ms=>{const s=(Date.now()-ms)/1000;if(s<60)return'방금';if(s<3600)return Math.floor(s/60)+'분 전';if(s<86400)return Math.floor(s/3600)+'시간 전';return Math.floor(s/86400)+'일 전'};

/* ---- shared data (db + user) ---- */
let dbP=null;
H.shared=()=>{if(dbP)return dbP;
  dbP=(async()=>{const c=window.claude;if(!c||!c.use)return{db:null,user:null,uid:null};
    const [db,user]=await Promise.all([c.use('db').catch(()=>null),c.use('user').catch(()=>null)]);
    let uid=null,owner=false,canWrite=null;
    if(user){try{uid=await user.id()}catch(e){}try{owner=await user.isOwner()}catch(e){}try{canWrite=await user.can('data.write')}catch(e){}}
    return{db,user,uid,owner,canWrite}})();
  return dbP};

/* ---- UI feedback: every tap, tab, door and keystroke makes a sound + vibration ---- */
H.ui=kind=>{const a=H.ac();if(!a)return;const t=a.currentTime;
  switch(kind){
    case'door':H.noise(t,.35,'bandpass',700,6,.25,{atk:.04,wet:true});H.tone(180,t+.02,.25,.12,'triangle',{to:120,wet:true});H.noise(t+.3,.06,'lowpass',500,1,.5,{wet:true});H.buzz([20,40,30]);break;
    case'back':H.noise(t,.05,'lowpass',400,1,.6,{wet:true});H.tone(110,t,.15,.3,'sine',{to:60});H.buzz(30);break;
    case'tab':H.tone(1046,t,.05,.12,'triangle');H.tone(1568,t+.04,.06,.08,'triangle');H.buzz(12);break;
    case'chip':H.tone(880+Math.random()*120,t,.06,.12,'sine');H.noise(t,.01,'highpass',4000,1,.15);H.buzz(10);break;
    case'btn':H.tone(660,t,.06,.15,'square',{to:990,glide:.05});H.buzz(18);break;
    case'key':H.noise(t,.012,'bandpass',2500+Math.random()*2500,3,.18);H.tone(180+Math.random()*60,t,.02,.06,'triangle');H.buzz(6);break;
    case'slide':H.tone(1200+Math.random()*400,t,.02,.05,'sine');H.buzz(4);break;
    default:H.noise(t,.015,'bandpass',3000,2,.2);H.tone(1400,t,.03,.08,'sine');H.buzz(8)}};
document.addEventListener('click',e=>{const el=e.target.closest('button,a,label,summary');if(!el||el.disabled)return;
  const k=el.classList.contains('door')||el.classList.contains('step')?'door':el.id==='back'?'back':el.matches('.tab,[role=tab],.wx')?'tab':el.matches('.chip,.heart,.mini')?'chip':el.matches('.btn,.corner')?'btn':'tap';H.ui(k)},true);
let lastSlide=0;
document.addEventListener('input',e=>{const el=e.target;if(el.matches('input[type=range]')){const n=performance.now();if(n-lastSlide>45){lastSlide=n;H.ui('slide')}}
  else if(el.matches('input,textarea'))H.ui('key')},true);
document.addEventListener('change',e=>{if(e.target.matches('input[type=file]'))H.ui('btn')},true);
/* soft tick while dragging something (crop editor etc.) */
H.dragTick=(state,dx,dy)=>{state.acc=(state.acc||0)+Math.hypot(dx,dy);if(state.acc>28){state.acc=0;H.ui('slide')}};

/* ---- mute ---- */
const muteBtn=document.getElementById('mute');
function paintMute(){[muteBtn,document.getElementById('wMute')].forEach(b=>{if(!b)return;b.textContent=H.muted?'🔇':'🔊';b.setAttribute('aria-label',H.muted?'소리 켜기':'소리 끄기')})}
muteBtn.onclick=H.toggleMute=()=>{H.muted=!H.muted;if(master)master.gain.value=H.muted?0:1;H.store.set('mute',H.muted);try{localStorage.setItem('sr-mute',H.muted?'1':'0')}catch(e){}paintMute()};
paintMute();

/* ---- router ---- */
let cleanup=null;
const hub=document.getElementById('hub'),room=document.getElementById('room');
H.route=()=>{
  if(cleanup){try{cleanup()}catch(e){console.error(e)}cleanup=null}
  const id=location.hash.replace('#','');const def=ROOMS[id];
  if(!def){room.hidden=true;document.body.classList.remove('in-room');
    if(H.world&&!H.listMode){hub.hidden=true;H.world.show(H.lastRoom);document.body.classList.add('in-room')}else{hub.hidden=false;H.world&&H.world.hide()}
    H.lastRoom=null;H.onRoute&&H.onRoute(null);return}
  H.lastRoom=id;H.world&&H.world.hide();H.onRoute&&H.onRoute(id);
  hub.hidden=true;room.hidden=false;document.body.classList.add('in-room');
  room.style.setProperty('--accent',def.color);
  document.getElementById('rTitle').textContent=def.title;document.getElementById('rSub').textContent=def.sub;
  const cur=document.getElementById('rbody'),fresh=cur.cloneNode(false);cur.replaceWith(fresh);fresh.id='rbody';fresh.className='rbody'+(def.scroll?' scroll':'');
  window.__rbody=fresh;
  try{cleanup=def.mount(fresh)||null}catch(e){console.error(e)}
};
document.getElementById('back').onclick=()=>{if(history.length>1&&H._came){history.back()}else{location.hash=''}};
window.addEventListener('hashchange',()=>{H._came=true;H.route()});

H.buildHub=()=>{
  const floors=[
    {no:'1F',name:'터뜨리는 방',desc:'세게 치고, 깨고, 갈아 버려요',c:'var(--f1)'},
    {no:'2F',name:'쉬어가는 방',desc:'천천히, 손끝으로 가라앉혀요',c:'var(--f2)'},
    {no:'3F',name:'함께하는 방',desc:'나누고, 쉬고, 숨 고르기',c:'var(--f3)'},
    {no:'밖',name:'운동장',desc:'건물 밖, 운동장 옆에서 뛰어놀아요',c:'#4fa35a',key:0,plate:'야외'}];
  const host=document.getElementById('floors');host.innerHTML='';
  floors.forEach((f,fi)=>{const sec=document.createElement('section');sec.className='floor';sec.style.setProperty('--c',f.c);
    sec.innerHTML=`<div class="floor-head"><span class="no">${f.no}</span><h3>${f.name}</h3><span>${f.desc}</span></div><div class="doors"></div>`;
    const doors=sec.querySelector('.doors');let n=1;
    const key=f.key??fi+1;const ids=ORDER.filter(id=>ROOMS[id].floor===key);if(!ids.length)return;
    ids.forEach(id=>{const r=ROOMS[id];const a=document.createElement('a');a.className='door';a.href='#'+id;
      a.innerHTML=`<span class="plate">${f.plate?f.plate+' '+(n++):`${fi+1}0${n++}호`}</span><span class="ic" aria-hidden="true">${r.icon}</span><div><b>${H.esc(r.title)}</b><small>${H.esc(r.blurb)}</small></div>`;
      doors.appendChild(a)});
    host.appendChild(sec)})};
})();
