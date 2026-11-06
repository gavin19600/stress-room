/* 공용 글 거르기 (응원 벽·미술전시관) */
(function(){
const SEP='[.,_~!?*^·ㆍ\\-+=/|\'"`0-9]*',SEPW='[\\s.,_~!?*^·ㆍ\\-+=/|\'"`0-9]*';
const mk=(w,not,ws)=>[...w].map(c=>c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join(ws?SEPW:SEP)+(not?`(?!${not})`:'');
/* [낱말, 뒤에 오면 욕이 아닌 말, 띄어 써도 잡기] */
const BADW=[['씨발','',1],['씨바','',1],['씨빨','',1],['시발','점'],['시바','견|스|프|이누'],['쉬발','',1],['ㅅㅂ'],['ㅆㅂ'],['ㅅㅃ'],['병신','',1],['븅신','',1],['빙신'],['ㅂㅅ'],['ㅄ'],['좆'],['존나'],['졸라'],['ㅈㄴ'],['개새끼','',1],['개색'],['개세끼','',1],['이새끼'],['저새끼'],['니새끼'],['새끼야'],['쌔끼'],['ㅅㄲ'],
  ['미친놈'],['미친년'],['미친새'],['ㅁㅊ'],['지랄'],['ㅈㄹ'],['닥쳐'],['꺼져'],['뒤져'],['디져'],['죽어라'],['죽여'],['엿먹'],['느금'],['니애미','',1],['니애비'],['애미'],['애비'],['느그'],['섹스','',1],['야동'],['찐따'],['장애새'],['틀딱'],['한남충'],['김치녀'],['씹새'],['씹년'],['씹창'],['씨팔','',1],['ㅗ'],
  ['fuck','',1],['shit'],['bitch'],['sex']];
const BAD=new RegExp(BADW.map(([w,n,ws])=>mk(w,n,ws)).join('|'),'gi');
const PRIV=/(01[016789][\s.\-]?\d{3,4}[\s.\-]?\d{4})|(https?:\/\/\S+|www\.\S+)|((카톡|kakao|인스타|insta|페메|디엠|dm)\s*(아이디|id)?\s*[:：]?\s*[A-Za-z0-9_.]{3,})/gi;
const CRISIS=/(죽고\s*싶|자살|사라지고\s*싶|살기\s*싫|없어지고\s*싶|그만\s*살)/;
const hasBad=v=>{BAD.lastIndex=0;const a=BAD.test(v);PRIV.lastIndex=0;return a||PRIV.test(v)};
function safeHTML(v){const marks=[];[BAD,PRIV].forEach(re=>{re.lastIndex=0;let m;while((m=re.exec(v))){if(!m[0].length){re.lastIndex++;continue}marks.push([m.index,m.index+m[0].length])}});
  if(!marks.length)return H.esc(v);marks.sort((a,b)=>a[0]-b[0]);let out='',i=0;
  marks.forEach(([a,b])=>{if(a<i)a=i;if(b<=a)return;out+=H.esc(v.slice(i,a))+`<span class="mosaic" aria-label="가려진 말">${'■'.repeat(Math.min(6,[...v.slice(a,b)].length))}</span>`;i=b});
  return out+H.esc(v.slice(i))}
H.filter={BAD,PRIV,CRISIS,hasBad,safeHTML};
})();
