H.buildHub();
try{H.world=H.makeWorld()}catch(e){console.error(e);H.world=null}
if(H.world){
  document.getElementById('wMute').onclick=()=>H.toggleMute();
  document.getElementById('wList').onclick=()=>{H.listMode=true;H.route()};
  const b=document.getElementById('to3d');b.hidden=false;b.onclick=()=>{H.listMode=false;H.route()};
  document.getElementById('wMute').textContent=H.muted?'🔇':'🔊';
}
H.multiStart&&H.multiStart();
H.route();
