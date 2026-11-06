/* 끝말잇기 방 — 컴퓨터와 / 친구와 둘이, 두음법칙 OK */
H.register('wordchain',{title:'끝말잇기',sub:'캐릭터와 끝말잇기 · 두음법칙도 OK',floor:3,icon:'🔤',color:'#2f6fb0',
blurb:'봇이나 친구와 끝말잇기 한 판',
mount(root){
const Hp=window.H;
root.innerHTML=`
<style>
.wc{--paper:#f6f1e4;--sheet:#fffdf7;--ink:#2a2723;--mu:#7c7466;--ln:#e2d8c3;--grid:#e7a99a;--left:#2f6fb0;--right:#c0573f;--dh:"Do Hyeon","Noto Sans KR",system-ui,sans-serif;display:flex;flex-direction:column;gap:8px;min-height:0;flex:1}
.wc-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wc-stats{display:flex;gap:12px;margin-left:auto;font-variant-numeric:tabular-nums}
.wc-stats .s{text-align:right}.wc-stats b{display:block;font-family:var(--dh);font-weight:400;font-size:21px;line-height:1;color:var(--fg)}.wc-stats span{font-size:10px;color:var(--muted)}
.wc-seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--panel)}
.wc-seg button{border:0;background:none;padding:7px 11px;font-family:var(--dh);font-size:15px;color:var(--muted);cursor:pointer}
.wc-seg button[aria-pressed="true"]{background:#f1ebdd;color:#2a2723}
.wc-pick{padding:7px 11px;border-radius:10px;border:1px solid var(--line);background:var(--panel);font-family:var(--dh);font-size:15px;cursor:pointer;color:var(--fg)}
.wc-stage{flex:1;min-height:250px;position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--line);color:var(--ink)}
.wc-stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.wc-center{position:absolute;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:5px;pointer-events:none;width:34%}
.wc-cell{width:60px;height:60px;display:grid;place-items:center;font-family:var(--dh);font-size:42px;line-height:1;color:var(--ink);
  background:linear-gradient(var(--grid),var(--grid)) center/1px 100% no-repeat,linear-gradient(var(--grid),var(--grid)) center/100% 1px no-repeat;background-color:#fff;border:2px solid var(--grid);border-radius:4px;box-shadow:0 4px 0 rgba(0,0,0,.06)}
.wc-cell.pop,.wc-bub.pop{animation:wcpop .35s ease-out}
@keyframes wcpop{0%{transform:scale(.6)}70%{transform:scale(1.12)}100%{transform:scale(1)}}
.wc-rule{font-size:11.5px;color:var(--ink);text-align:center;background:rgba(255,253,247,.88);padding:3px 8px;border-radius:999px;text-wrap:balance}
.wc-bub{position:absolute;max-width:46%;padding:8px 14px;border-radius:18px;background:#fff;border:2px solid var(--c);font-family:var(--dh);font-size:25px;line-height:1.1;box-shadow:0 4px 0 rgba(0,0,0,.07);text-align:center;word-break:keep-all;pointer-events:none;color:var(--ink)}
.wc-bub::after{content:"";position:absolute;left:50%;bottom:-11px;width:16px;height:16px;background:#fff;border-right:2px solid var(--c);border-bottom:2px solid var(--c);transform:translateX(-50%) rotate(45deg)}
.wc-bub em{font-style:normal;color:var(--c)}.wc-bub small{display:block;font-family:var(--body);font-size:10.5px;color:var(--mu);margin-top:2px}
.wc-bub.l,.wc-plate.l{--c:var(--left)}.wc-bub.r,.wc-plate.r{--c:var(--right)}
.wc-plate{position:absolute;bottom:8px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:1px;padding:4px 10px;border-radius:10px;background:rgba(255,253,247,.92);border:1px solid var(--ln);pointer-events:none;white-space:nowrap;color:var(--ink)}
.wc-plate b{font-family:var(--dh);font-weight:400;font-size:15px}.wc-plate span{font-size:12px;color:var(--right);letter-spacing:1px}
.wc-plate.on{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
.wc-toast{position:absolute;left:50%;top:10px;transform:translateX(-50%);max-width:88%;padding:6px 14px;border-radius:999px;background:rgba(42,39,35,.86);color:#fffdf7;font-size:13px;text-align:center;text-wrap:balance;transition:opacity .35s;pointer-events:none}
.wc-toast.big{font-family:var(--dh);font-size:19px;background:var(--right)}
.wc-timer{position:absolute;left:0;right:0;bottom:0;height:6px;background:rgba(0,0,0,.06)}.wc-timer i{display:block;height:100%;width:100%;background:var(--left)}
.wc-strip{display:flex;gap:4px;overflow-x:auto;align-items:center;min-height:30px;padding-bottom:2px}
.wc-strip .lab{font-size:11px;color:var(--muted);flex:none;margin-right:2px}
.wc-chip{flex:none;padding:3px 9px;border-radius:999px;font-family:var(--dh);font-size:15px;color:#fff}.wc-chip.l{background:var(--left)}.wc-chip.r{background:var(--right)}
.wc-arrow{flex:none;color:var(--muted);font-size:11px}
.wc-judge{display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:#fff7e3;color:#2a2723;border:1px solid #efd9a2;border-radius:12px;padding:8px 12px;font-size:13px}
.wc-judge[hidden]{display:none}.wc-judge b{font-family:var(--dh);font-size:18px;font-weight:400}
.wc-bar{display:flex;gap:6px;align-items:stretch}
.wc-bar input{flex:1;min-width:0;padding:11px 13px;border-radius:12px;border:2px solid var(--line);background:#fff;color:#2a2723;font-family:var(--dh);font-size:21px}
.wc-bar input:focus{border-color:var(--left);outline:none}.wc-bar input:disabled{background:#f1ebdd}
.wc-btn{padding:0 15px;border-radius:12px;border:0;background:var(--left);color:#fff;font-family:var(--dh);font-size:18px;cursor:pointer}
.wc-btn.ghost{background:var(--panel);color:var(--fg);border:1px solid var(--line);font-size:15px;padding:0 10px}
.wc-btn:disabled{opacity:.45;cursor:default}.wc-judge .wc-btn{padding:6px 12px;font-size:15px}
.wc-picker{position:fixed;inset:0;z-index:60;background:rgba(42,39,35,.6);display:flex;align-items:center;justify-content:center;padding:16px}
.wc-picker[hidden]{display:none}
.wc-pcard{width:min(560px,100%);max-height:100%;overflow-y:auto;background:var(--sheet);color:var(--ink);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 20px 50px rgba(0,0,0,.3)}
.wc-pcard h2{margin:0;font-family:var(--dh);font-weight:400;font-size:24px}.wc-pcard h3{margin:0;font-size:13px;color:var(--mu);font-weight:700}.wc-pcard h3 b{color:var(--c)}
.wc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.wc-ch{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border-radius:12px;border:2px solid var(--ln);background:#fff;cursor:pointer;font-family:var(--dh);font-size:15px;color:var(--ink);min-width:0}
.wc-ch canvas{width:64px;height:72px;max-width:100%}.wc-ch[aria-pressed="true"]{border-color:var(--c);box-shadow:0 0 0 2px var(--c)}
.wc-go{align-self:stretch;padding:12px;font-size:20px}
@media (max-width:480px){.wc-stats{gap:8px}.wc-stats b{font-size:18px}.wc-cell{width:50px;height:50px;font-size:34px}.wc-bub{font-size:21px;padding:7px 11px}.wc-btn{padding:0 11px;font-size:16px}}
</style>
<div class="wc">
  <div class="wc-top">
    <div class="wc-seg" role="group" aria-label="상대"><button type="button" data-mode="bot" aria-pressed="true">컴퓨터와</button><button type="button" data-mode="duo" aria-pressed="false">친구와 둘이</button></div>
    <div class="wc-seg" role="group" aria-label="난이도" data-r="levels"><button type="button" data-lv="0" aria-pressed="false">쉬움</button><button type="button" data-lv="1" aria-pressed="true">보통</button><button type="button" data-lv="2" aria-pressed="false">어려움</button></div>
    <button class="wc-pick" data-r="pickBtn" type="button">캐릭터 바꾸기</button>
    <div class="wc-stats" data-r="stats"></div>
  </div>
  <div class="wc-stage" data-r="stage">
    <canvas data-r="cv" aria-hidden="true"></canvas>
    <div class="wc-center" data-r="center"><div class="wc-cell" data-r="cell">?</div><div class="wc-rule" data-r="rule">아무 낱말이나 두 글자 이상</div></div>
    <div class="wc-bub l" data-r="bubL" hidden></div><div class="wc-bub r" data-r="bubR" hidden></div>
    <div class="wc-plate l" data-r="plateL"></div><div class="wc-plate r" data-r="plateR"></div>
    <div class="wc-toast" data-r="toast" style="opacity:0"></div>
    <div class="wc-timer" aria-hidden="true"><i data-r="timebar"></i></div>
  </div>
  <div class="wc-strip" data-r="strip" aria-label="이어진 낱말"><span class="lab">이어진 말</span></div>
  <div class="wc-judge" data-r="judge" hidden><span><b data-r="jWord"></b> 은(는) 이 방 사전에 없는 말이에요. 진짜 있는 낱말이면 인정해 주세요.</span>
    <button class="wc-btn" data-r="jOk" type="button">인정</button><button class="wc-btn ghost" data-r="jNo" type="button">다시 쓰기</button></div>
  <div class="wc-bar">
    <input data-r="word" type="text" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="10" placeholder="낱말을 써 보세요" aria-label="낱말 입력">
    <button class="wc-btn" data-r="send" type="button">내기</button><button class="wc-btn ghost" data-r="hintBtn" type="button">힌트</button><button class="wc-btn ghost" data-r="restart" type="button">새 판</button>
  </div>
  <div class="wc-picker" data-r="picker" role="dialog" aria-label="캐릭터 고르기"><div class="wc-pcard">
    <h2>누구랑 끝말잇기 할까요?</h2>
    <h3 data-r="pLabelL" style="--c:var(--left)"><b>나</b>의 캐릭터</h3><div class="wc-grid" data-r="gridL" style="--c:var(--left)"></div>
    <h3 data-r="pLabelR" style="--c:var(--right)"><b>상대 봇</b> 캐릭터</h3><div class="wc-grid" data-r="gridR" style="--c:var(--right)"></div>
    <button class="wc-btn wc-go" data-r="goBtn" type="button">이 친구들로 시작</button></div></div>
</div>`;
const $=k=>root.querySelector(`[data-r="${k}"]`);
const reduce=Hp.reduce;
const rand=(a,b)=>a+Math.random()*(b-a),TAU=Math.PI*2;
let alive=true;const timers=new Set();const later=(f,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(alive)f()},ms);timers.add(id);return id};

/* ---------- dictionary ---------- */
const RAW=`가방 가구 가수 가위 가족 가을 가지 가게 가격 가로수 가면 가뭄 가슴 가사 각도 각오 간식 간호사 간판 간장 감자 감기 감동 감사 감옥 감정 강아지 강물 강당 강도 강의 개구리 개미 개나리 개울 개학 개성 거울 거미 거북이 거리 거인 거품 건물 건강 건전지 검사 검정 게임 게시판 겨울 겨자 결혼 결과 결심 경찰 경기 경주 경치 경험 계단 계란 계절 계산기 계획 계곡 고구마 고래 고양이 고추 고향 고기 고무 고민 고속도로 고등어 고드름 고집 고개 곡식 곡선 골목 골대 곰돌이 곰팡이 공원 공부 공기 공책 공룡 공주 공장 공항 공연 과자 과일 과학 과제 과거 관광 관심 관객 광장 광고 교실 교과서 교복 교회 교통 교사 교문 구름 구두 구슬 구멍 구급차 구역 구조대 국수 국어 국자 국기 국가 국화 군대 군인 군고구마 굴뚝 귀신 귀걸이 귀마개 그림 그네 그릇 그늘 그물 극장 글씨 글자 금요일 금붕어 금메달 기차 기린 기자 기술 기억 기온 기적 기타 기분 기도 기름 기계 기사 기저귀 길이 길거리 김치 김밥 김장 깃발 까치 까마귀 꼬리 꼬마 꽃병 꽃잎 꽃게 꿀벌 꿈나무 나무 나비 나라 나이 나팔 나침반 나그네 낙타 낙엽 낙서 날씨 날개 날짜 남자 남쪽 남산 남편 낮잠 내일 내복 내용 냄비 냄새 너구리 넉살 노래 노루 노트 노인 노을 노력 녹차 녹음 놀이터 놀이 농구 농부 농장 농사 누나 누에 눈사람 눈물 눈썹 눈동자 뉴스 늑대 다리 다람쥐 다리미 다이아몬드 단추 단풍 단어 달력 달팽이 달걀 달리기 닭고기 담요 담장 당근 당나귀 대나무 대문 대학교 대통령 대화 대추 도서관 도시 도깨비 도로 도시락 도자기 도마 도토리 도장 도구 도둑 독서 독수리 돈가스 동물 동생 동화 동네 동굴 동전 동요 돼지 두부 두더지 두꺼비 두통 드라마 드럼 등대 등산 딸기 땅콩 떡볶이 떡국 라면 라디오 라켓 레몬 로봇 로켓 리본 리듬 마을 마음 마술 마차 마늘 마당 마라톤 마스크 만두 만화 만세 말씀 망치 망원경 매미 매일 매듭 머리 머리띠 메뚜기 메아리 메달 메뉴 며느리 면도기 면봉 명절 명함 모자 모래 모기 모험 모양 모니터 목도리 목소리 목욕 목장 목수 무지개 무대 무릎 무궁화 무술 무게 문구 문어 문제 문화 문방구 물감 물고기 물병 물개 미소 미술 미래 미역 미용실 미끄럼틀 민들레 민속 바다 바람 바지 바나나 바위 바구니 바늘 바퀴 바둑 박수 박물관 박쥐 반지 반찬 반달 반장 발가락 발톱 발명 발표 밥상 밥솥 방학 방석 방송 방울 방패 방법 배추 배꼽 배구 배낭 배우 배달 백조 백화점 버스 버섯 버터 버릇 번개 번호 벌레 벌집 벚꽃 베개 벽돌 벽시계 별자리 별명 병원 병아리 보물 보리 보석 보자기 보름달 보건실 복숭아 복도 볼펜 봄비 봄날 부엉이 부채 부엌 부모님 부자 부산 부탁 북쪽 북극곰 분수 분필 불꽃 불고기 비행기 비누 비둘기 비밀 비빔밥 비옷 빗자루 빗방울 빵집 사과 사자 사진 사탕 사람 사랑 사슴 사다리 사막 사전 사계절 사거리 산책 산타 산소 산호 삼촌 삼각형 상자 상어 상추 상장 상처 새우 새벽 새해 색연필 색종이 생일 생선 생각 생쥐 서울 서점 서랍 서리 서커스 선물 선생님 선풍기 선수 선반 설탕 설날 설거지 성격 성공 세수 세탁기 세상 세배 소풍 소리 소나무 소금 소방차 소나기 소원 소설 소라 손가락 손수건 손님 손톱 송편 송아지 수박 수영 수건 수업 수학 수첩 수레 수도 수염 수저 수달 숙제 순서 순대 숟가락 숲속 스키 스케이트 스님 스웨터 시계 시간 시장 시소 시험 시골 시금치 식당 식물 식탁 식빵 신발 신문 신호등 실내화 실수 심장 심부름 쌀밥 쓰레기 아기 아빠 아침 아이스크림 아파트 아저씨 아줌마 악어 악기 악수 안경 안개 안녕 앵무새 야구 야채 야자수 약국 약속 양말 양파 양초 양치 어린이 어머니 어깨 어부 얼음 얼굴 엄마 에어컨 여름 여우 여행 여자 여왕 역사 연필 연못 연극 연기 연습 열쇠 열매 열차 엽서 영화 영어 영웅 예절 예술 오리 오이 오징어 오렌지 오후 오전 오두막 옥수수 옥상 온도 옷장 와플 왕자 왕관 외국 외투 요리 요정 요일 요구르트 용기 용돈 우산 우유 우주 우체국 우물 우정 운동 운동장 운동화 울타리 웃음 원숭이 원피스 월요일 유리 유치원 유령 유자 육지 윷놀이 은행 은하수 음악 음식 의자 의사 이불 이야기 이름 이사 이빨 이웃 인형 인사 인삼 일기 일요일 일출 임금 입술 입학 자동차 자전거 자석 자연 자두 자리 작가 작품 잔디 잠자리 잠옷 장갑 장미 장난감 장마 장구 장화 장독대 재미 저녁 저금통 전화 전기 전등 전시회 점심 점수 정원 정글 정답 정류장 제비 제주도 조개 조각 조끼 조약돌 종이 종소리 주사위 주머니 주스 주말 주전자 주인 죽순 줄넘기 지구 지도 지갑 지렁이 지우개 지하철 지붕 지팡이 진달래 진주 진흙 짐승 집게 짜장면 차례 차표 참새 참외 창문 창고 채소 책상 책가방 천사 천둥 철새 철도 청소 청바지 청개구리 초콜릿 초가집 초밥 촛불 축구 축제 치약 치즈 치마 치과 치킨 친구 칠판 침대 칫솔 카메라 칼국수 커튼 커피 컴퓨터 코끼리 코알라 코스모스 콩나물 크레파스 크리스마스 키위 타조 탁구 탈춤 태권도 태극기 태양 택시 터널 토끼 토마토 토요일 통조림 투수 튤립 트럭 파도 파리 파랑새 파인애플 파티 파전 판다 판사 팔찌 팔꿈치 팽이 편지 편의점 포도 포크 포장 표정 풀잎 풍선 풍경 피아노 피자 피리 필통 하늘 하마 하루 하모니카 학교 학생 학원 한복 한글 한국 할머니 할아버지 해바라기 해님 해적 해변 햄버거 햇살 행복 행운 향기 허수아비 호랑이 호박 호수 호떡 호루라기 홍시 홍수 화분 화가 화요일 화장실 환자 황소 회의 회사 후추 후식 휴지 휴가 흙탕물 희망 널뛰기 탕수육 육상 자유 유행 행사 사냥 이마 마녀 여드름 기와 와이셔츠 스타 타원 원두막 막대 대왕 왕비 비상구 구급상자 자판기 기러기 기둥 둥지 지하 하품 품앗이 이삭 삭발 발바닥 닥나무 무녀 수수께끼 끼니 니트 트로피 피구 구경 경비 비상 상품 품질 질문 문지기 기침 침착 착시 시인 인어 어항 항구 구령 영양 양궁 궁전 전설 설명 명랑 낭떠러지 지름길 길목 목걸이 이슬 슬기 기쁨 장승 승리 이력 역도 도토리묵 묵찌빠 나팔꽃 꽃밭 밭고랑 부메랑 소쿠리 리어카 카드 드레스 스승 승부 부싯돌 돌고래 래프팅 팅커벨 벨소리 리코더 더하기 기름종이 이정표 표범 범고래 레고 고슴도치 치타 타이어 어묵 묵상 상추쌈 삼각김밥 밥알 알밤 밤하늘 늘보 보름`;
const DICT=new Set(RAW.split(/\s+/).filter(w=>w.length>=2));
const BYSTART=new Map(); DICT.forEach(w=>{ const c=w[0]; if(!BYSTART.has(c)) BYSTART.set(c,[]); BYSTART.get(c).push(w); });
const userAdded=new Set(Hp.store.get('wcAdded',[]));
const isSyl=c=>{ const n=c.charCodeAt(0); return n>=0xAC00&&n<=0xD7A3; };
function parts(c){ const n=c.charCodeAt(0)-0xAC00; return {cho:Math.floor(n/588),jung:Math.floor((n%588)/28),jong:n%28}; }
const make=(cho,jung,jong)=>String.fromCharCode(0xAC00+cho*588+jung*28+jong);
function dueum(c){ if(!isSyl(c)) return null; const p=parts(c),Y=[2,6,7,12,17,20];
  if(p.cho===5) return make(Y.includes(p.jung)?11:2,p.jung,p.jong);
  if(p.cho===2&&[6,12,17,20].includes(p.jung)) return make(11,p.jung,p.jong); return null; }
function starts(last){ const s=[last],d=dueum(last); if(d&&d!==last) s.push(d); return s; }
const followers=(last,used)=>starts(last).flatMap(c=>(BYSTART.get(c)||[]).filter(w=>!used.has(w)));

/* ---------- characters ---------- */
const CHARS=[
 {id:'bear',name:'곰돌이',body:'#b07a4f',belly:'#ead0ad',dark:'#7f5434',inner:'#ead0ad'},
 {id:'rabbit',name:'토순이',body:'#f5f1ea',belly:'#ffffff',dark:'#d8cfc2',inner:'#f5b5c4'},
 {id:'cat',name:'냥냥이',body:'#f0a65a',belly:'#fbe3c4',dark:'#c97a35',inner:'#f7c1b0'},
 {id:'dog',name:'멍멍이',body:'#e8cfa6',belly:'#fff5e6',dark:'#a8774a',inner:'#a8774a'},
 {id:'penguin',name:'펭펭이',body:'#2f3542',belly:'#fbfbfb',dark:'#f0a03a',inner:'#2f3542'},
 {id:'frog',name:'개굴이',body:'#7cc47a',belly:'#e1f4cf',dark:'#4f9a4e',inner:'#7cc47a'},
 {id:'fox',name:'여우비',body:'#ea7c3a',belly:'#fff1e3',dark:'#6b3a20',inner:'#fff1e3'},
 {id:'chick',name:'삐약이',body:'#ffd84a',belly:'#fff0a8',dark:'#f0a03a',inner:'#ffd84a'}
];
const svc=Hp.store.get('wcChars',null);
let charL=CHARS.find(c=>svc&&c.id===svc[0])||CHARS[0],charR=CHARS.find(c=>svc&&c.id===svc[1])||CHARS[2];
function E(c,x,y,rx,ry,fill,rot){ c.beginPath(); c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU); c.fillStyle=fill; c.fill(); }
function drawChar(c,k,o){
  c.save(); c.translate(o.x,o.y); c.scale(o.s*(o.mirror?-1:1),o.s); c.rotate(o.tilt||0);
  E(c,0,2,34,7,'rgba(60,40,20,.14)');
  const ink='#2a2420', hy=-80;
  E(c,-14,-3,11,6,k.dark); E(c,14,-3,11,6,k.dark);
  if(k.id==='fox'){ c.save(); c.translate(-26,-22); c.rotate(-.6+Math.sin(o.t*3)*.15); E(c,-12,0,18,9,k.body); E(c,-26,0,7,6,'#fff1e3'); c.restore(); }
  if(k.id==='cat'){ c.strokeStyle=k.body; c.lineWidth=7; c.lineCap='round'; c.beginPath(); c.moveTo(-24,-14); c.quadraticCurveTo(-46,-24,-40,-48+Math.sin(o.t*3)*4); c.stroke(); }
  E(c,0,-30,28,29,k.body); E(c,0,-26,18,19,k.belly);
  const up=o.armsUp||0;
  for(const sx of [-1,1]){ c.save(); c.translate(sx*24,-40); c.rotate(sx*(.5+up*2.1)); E(c,0,10,8,13,k.body); c.restore(); }
  if(k.id==='bear'){ for(const sx of [-1,1]){ E(c,sx*24,hy-26,11,11,k.body); E(c,sx*24,hy-26,6,6,k.inner); } }
  if(k.id==='rabbit'){ for(const sx of [-1,1]){ c.save(); c.translate(sx*13,hy-28); c.rotate(sx*.15+(o.expr==='sad'?sx*.7:0)); E(c,0,-20,9,25,k.body); E(c,0,-20,4.5,18,k.inner); c.restore(); } }
  if(k.id==='cat'||k.id==='fox'){ for(const sx of [-1,1]){ c.fillStyle=k.body; c.beginPath(); c.moveTo(sx*10,hy-28); c.lineTo(sx*30,hy-52); c.lineTo(sx*32,hy-16); c.closePath(); c.fill(); c.fillStyle=k.id==='fox'?'#3a2014':k.inner; c.beginPath(); c.moveTo(sx*17,hy-28); c.lineTo(sx*29,hy-44); c.lineTo(sx*29,hy-24); c.closePath(); c.fill(); } }
  if(k.id==='chick'){ c.strokeStyle='#f0b830'; c.lineWidth=3; c.lineCap='round'; c.beginPath(); c.moveTo(0,hy-33); c.quadraticCurveTo(-4,hy-46,4,hy-48); c.moveTo(0,hy-33); c.quadraticCurveTo(6,hy-44,10,hy-42); c.stroke(); }
  E(c,0,hy,35,32,k.body);
  if(k.id==='penguin') E(c,0,hy+5,25,22,'#fbfbfb');
  if(k.id==='fox') { c.fillStyle='#fff1e3'; c.beginPath(); c.moveTo(-30,hy+4); c.quadraticCurveTo(0,hy+40,30,hy+4); c.quadraticCurveTo(0,hy+16,-30,hy+4); c.fill(); }
  if(k.id==='cat'){ c.strokeStyle=k.dark; c.lineWidth=3; for(const x of [-7,0,7]){ c.beginPath(); c.moveTo(x,hy-30); c.lineTo(x*.8,hy-20); c.stroke(); } }
  if(k.id==='dog'){ for(const sx of [-1,1]){ c.save(); c.translate(sx*30,hy-14); c.rotate(sx*(.25+(o.expr==='sad'?.3:0))+Math.sin(o.t*4)*.05*sx); E(c,0,16,11,22,k.inner); c.restore(); } E(c,0,hy+10,15,11,k.belly); }
  if(k.id==='bear') E(c,0,hy+10,14,10,k.belly);
  const ex=13, ey=k.id==='frog'?hy-24:hy-4, look=3;
  if(k.id==='frog'){ for(const sx of [-1,1]) E(c,sx*ex+look,ey,11,11,k.body); for(const sx of [-1,1]) E(c,sx*ex+look,ey,8,8,'#fff'); }
  c.strokeStyle=ink; c.fillStyle=ink; c.lineWidth=3; c.lineCap='round';
  const ex2=o.expr;
  for(const sx of [-1,1]){ const x=sx*ex+look;
    if(ex2==='happy'){ c.beginPath(); c.arc(x,ey+2,5,Math.PI*1.1,Math.PI*1.9); c.stroke(); }
    else if(ex2==='sad'){ c.beginPath(); c.moveTo(x-5,ey-2); c.lineTo(x+5,ey+1); c.stroke(); }
    else if(o.blink){ c.beginPath(); c.moveTo(x-4,ey); c.lineTo(x+4,ey); c.stroke(); }
    else if(ex2==='think'){ E(c,x+2,ey-2,3.4,4,ink); }
    else { E(c,x,ey,3.6,4.4,ink); E(c,x-1.2,ey-1.6,1.3,1.3,'#fff'); } }
  if(ex2==='sad'){ E(c,ex+look+4,ey+9,2.6,4,'#8cc8ea'); }
  E(c,-22+look,hy+8,6,3.6,'rgba(255,130,140,.55)'); E(c,22+look,hy+8,6,3.6,'rgba(255,130,140,.55)');
  const my=hy+13;
  if(k.id==='penguin'||k.id==='chick'){ c.fillStyle='#f0a03a'; c.beginPath(); c.moveTo(look-7,my-4); c.lineTo(look+9,my-1); c.lineTo(look-7,my+(o.mouth?6:2)); c.closePath(); c.fill(); }
  else { E(c,look,my-6,4,3,k.id==='frog'?'#4f9a4e':'#3a2a24');
    if(o.mouth){ E(c,look,my+2,6,5,'#7a3030'); E(c,look,my+4,3.5,2.4,'#ef8a90'); }
    else if(ex2==='sad'){ c.beginPath(); c.arc(look,my+5,5,Math.PI*1.15,Math.PI*1.85); c.stroke(); }
    else { c.beginPath(); c.arc(look-3,my-1,3.4,.1*Math.PI,.9*Math.PI); c.stroke(); c.beginPath(); c.arc(look+3,my-1,3.4,.1*Math.PI,.9*Math.PI); c.stroke(); } }
  c.restore(); }

/* ---------- stage ---------- */
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
let W=0,H=0;
function resize(){ const d=Math.min(devicePixelRatio||1,2),r=stage.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return; cv.width=Math.round(W*d); cv.height=Math.round(H*d); ctx.setTransform(d,0,0,d,0,0); }
const ro=new ResizeObserver(resize); ro.observe(stage);
const actors={L:{anim:'idle',t:0,blink:0},R:{anim:'idle',t:0,blink:0}};
function act(side,anim){ const a=actors[side]; a.anim=anim; a.t=0; }
function geo(){ const s=Math.min(W/300,(H-70)/240,1.8),y=H-60; return {s,y,xl:W*.21,xr:W*.79,top:y-165*s,mid:y-118*s}; }
function drawStage(t,dt){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#cfe9f4'); g.addColorStop(.55,'#eef7ee'); g.addColorStop(.56,'#a9d48a'); g.addColorStop(1,'#8cc471'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  E(ctx,W*.88,H*.13,22,22,'#fff3c4');
  [[.18,.14,1],[.55,.09,.8]].forEach(([x,y,k])=>{ const cx=(W*x+t*8*k)%(W+120)-60; E(ctx,cx,H*y,34*k,12*k,'rgba(255,255,255,.9)'); E(ctx,cx+20*k,H*y-7*k,22*k,12*k,'rgba(255,255,255,.9)'); });
  ctx.fillStyle='#9fcf86'; ctx.beginPath(); ctx.moveTo(0,H*.56); ctx.quadraticCurveTo(W*.3,H*.47,W*.6,H*.56); ctx.quadraticCurveTo(W*.85,H*.5,W,H*.56); ctx.lineTo(W,H*.6); ctx.lineTo(0,H*.6); ctx.fill();
  for(let i=0;i<14;i++){ const x=(i*97)%W,y=H*.62+((i*53)%(H*.3)); E(ctx,x,y,2.4,2.4,i%2?'#fff':'#ffd84a'); }
  const G=geo();
  ctx.save(); ctx.translate(W/2,G.y+4); ctx.scale(1,.28); ctx.fillStyle='#f2d0c2'; ctx.beginPath(); ctx.ellipse(0,0,W*.44,W*.44,0,0,TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(W/2,G.y+4); ctx.scale(1,.28); ctx.strokeStyle='rgba(224,121,79,.5)'; ctx.lineWidth=6; ctx.setLineDash([14,12]); ctx.beginPath(); ctx.ellipse(0,0,W*.4,W*.4,0,0,TAU); ctx.stroke(); ctx.restore();
  const active=turnSide(); if(active&&!over){ const x=active==='L'?G.xl:G.xr; const sg=ctx.createRadialGradient(x,G.y,4,x,G.y,60*G.s); sg.addColorStop(0,active==='L'?'rgba(47,111,176,.35)':'rgba(192,87,63,.35)'); sg.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=sg; ctx.fillRect(x-70*G.s,G.y-40,140*G.s,80); }
  for(const side of ['L','R']){ const a=actors[side],k=side==='L'?charL:charR; a.t+=dt; a.blink-=dt; if(a.blink<-.12) a.blink=rand(2,5);
    let y=G.y,expr='normal',mouth=false,up=0,tilt=Math.sin(t*1.6+(side==='L'?0:1))*.03;
    y-=Math.abs(Math.sin(t*2.2+(side==='L'?0:1.3)))*2*G.s;
    if(a.anim==='talk'){ if(a.t<.5){ y-=Math.sin(a.t/.5*Math.PI)*10*G.s; mouth=Math.floor(a.t*12)%2===0; } else a.anim='idle'; }
    else if(a.anim==='happy'){ if(a.t<1.1){ y-=Math.abs(Math.sin(a.t*Math.PI*2.4))*28*G.s; expr='happy'; up=1; } else a.anim='idle'; }
    else if(a.anim==='sad'){ if(a.t<1.6){ expr='sad'; tilt+=.08; } else a.anim='idle'; }
    else if(a.anim==='think'){ expr='think'; tilt+=Math.sin(t*2)*.08; }
    if(over&&result===side){ expr='happy'; up=Math.abs(Math.sin(t*4)); y-=Math.abs(Math.sin(t*4))*12*G.s; }
    drawChar(ctx,k,{x:side==='L'?G.xl:G.xr,y,s:G.s,mirror:side==='R',expr,mouth,armsUp:up,tilt,blink:a.blink<0,t});
    if(a.anim==='think'){ const x=(side==='L'?G.xl:G.xr), hy=y-140*G.s; for(let i=0;i<3;i++){ const on=Math.floor(t*3)%3===i; E(ctx,x-14*G.s+i*14*G.s,hy,(on?5:4)*G.s,(on?5:4)*G.s,on?'#2a2723':'rgba(42,39,35,.35)'); } }
  }
}
function placeUI(){ const G=geo();
  $('center').style.top=Math.max(44,G.mid)+'px';
  for(const side of ['L','R']){ const b=$('bub'+side),p=$('plate'+side),x=side==='L'?G.xl:G.xr;
    p.style.left=x+'px';
    if(!b.hidden){ const w=b.offsetWidth,h=b.offsetHeight; b.style.left=Math.max(6,Math.min(W-w-6,x-w/2))+'px'; b.style.top=Math.max(44,G.top-h-14)+'px'; } } }

/* ---------- audio (사이트 공용 오디오·음소거 연동) ---------- */
let ac=null,master=null;
function audio(){ ac=Hp.ac(); if(ac) master=Hp.out(); return ac; }
function tone(at,dur,f,vol,type,glide){ if(!ac) return; const t=ac.currentTime+at,o=ac.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(glide) o.frequency.exponentialRampToValueAtTime(glide,t+dur); const g=ac.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
const SFX={
  ok(n){ const b=520+Math.min(n,12)*30; tone(0,.18,b,.1,'triangle'); tone(.08,.26,b*1.5,.08,'triangle'); },
  bot(){ tone(0,.16,440,.07,'square',330); tone(.09,.2,330,.05,'square'); },
  key(){ tone(0,.025,1600+Math.random()*600,.025,'square'); },
  bad(){ tone(0,.22,180,.12,'sawtooth',120); },
  tick(){ tone(0,.05,1200,.06,'sine'); },
  lose(){ tone(0,.4,300,.12,'triangle',150); tone(.2,.5,200,.1,'triangle',100); },
  win(){ [523,659,784,1046].forEach((f,i)=>tone(i*.1,.4,f,.09,'triangle')); },
  combo(){ [784,988,1175].forEach((f,i)=>tone(i*.07,.3,f,.07,'sine')); },
  pick(){ tone(0,.12,880,.07,'triangle',1320); }
};
const buzz=p=>Hp.buzz(p);

/* ---------- game state ---------- */
const LV=[{name:'쉬움',time:15,think:[1.2,2],give:.12,hard:0},{name:'보통',time:11,think:[.9,1.6],give:.04,hard:.35},{name:'어려움',time:8,think:[.6,1.2],give:0,hard:.85}];
let mode='bot',lv=1,used=new Set(),chain=[],last=null,turn='me',hearts={},score={},combo=0,best=Hp.store.get('wcBest',0),timeLeft=0,timeMax=0,timerOn=false,pending=null,over=false,result=null,botTimer=0,botIv=0,botPre=0;
const sideOf=who=>(who==='me'||who==='p1')?'L':'R';
function turnSide(){ return over?null:sideOf(turn); }
const nameOf=side=>side==='L'?charL.name+(mode==='bot'?' (나)':' (1번)'):charR.name+(mode==='bot'?' 봇':' (2번)');
let toastQ=[],toastT=0;
function toast(txt,big){ toastQ.push({txt,big}); if(toastQ.length===1) showToast(); }
function showToast(){ const t=toastQ[0]; if(!t||!alive) return; const el=$('toast'); el.textContent=t.txt; el.className='wc-toast'+(t.big?' big':''); el.style.opacity=1; clearTimeout(toastT);
  toastT=later(()=>{ el.style.opacity=0; toastQ.shift(); later(showToast,250); },t.big?2300:1700); }
function say(side,word,meta){ const b=$('bub'+side); b.innerHTML=`${Hp.esc(word.slice(0,-1))}<em>${Hp.esc(word.slice(-1))}</em>${meta?`<small>${Hp.esc(meta)}</small>`:''}`; b.hidden=false; b.classList.remove('pop'); void b.offsetWidth; if(!reduce) b.classList.add('pop');
  const other=$('bub'+(side==='L'?'R':'L')); other.style.opacity=.55; b.style.opacity=1; act(side,'talk');
  const strip=$('strip'); if(chain.length>1){ const ar=document.createElement('span'); ar.className='wc-arrow'; ar.textContent='→'; strip.appendChild(ar); }
  const ch=document.createElement('span'); ch.className='wc-chip '+side.toLowerCase(); ch.textContent=word; strip.appendChild(ch); strip.scrollLeft=strip.scrollWidth; placeUI(); }
const heartStr=n=>'♥'.repeat(Math.max(0,n))+'<span style="color:#d9cdb6">'+'♥'.repeat(Math.max(0,3-n))+'</span>';
function renderTop(){
  const kL=mode==='bot'?'me':'p1',kR=mode==='bot'?'bot':'p2';
  if(mode==='bot') $('stats').innerHTML=[[score.me,'점수'],[chain.length,'이어진 말'],[best,'최고 연속']].map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join('');
  else $('stats').innerHTML=[[score.p1,'1번 점수'],[score.p2,'2번 점수'],[chain.length,'이어진 말']].map(([v,l])=>`<div class="s"><b>${v}</b><span>${l}</span></div>`).join('');
  $('plateL').innerHTML=`<b>${nameOf('L')}</b><span>${heartStr(hearts[kL])}</span>`; $('plateR').innerHTML=`<b>${nameOf('R')}</b><span>${heartStr(hearts[kR])}</span>`;
  const ts=turnSide(); $('plateL').classList.toggle('on',ts==='L'); $('plateR').classList.toggle('on',ts==='R');
  $('levels').style.display=mode==='bot'?'':'none'; }
function setNext(){ const cell=$('cell');
  if(last){ const s=starts(last); cell.textContent=last; cell.classList.remove('pop'); void cell.offsetWidth; if(!reduce) cell.classList.add('pop');
    $('rule').textContent=s.length>1?`'${s[0]}'·'${s[1]}'(두음)로 시작`:`'${s[0]}'(으)로 시작`; }
  else { cell.textContent='?'; $('rule').textContent='아무 낱말이나 두 글자 이상'; }
  const ts=turnSide(); $('timebar').style.background=ts==='R'?'#c0573f':'#2f6fb0';
  const human=!over&&turn!=='bot'; $('word').disabled=!human; $('send').disabled=!human; $('hintBtn').disabled=!human||!last;
  $('word').placeholder=over?'[새 판]을 눌러 다시 시작':human?(mode==='duo'?`${turn==='p1'?'1번':'2번'} 차례 · `:'')+(last?`${starts(last).join(' / ')}(으)로 시작…`:'낱말을 써 보세요'):`${charR.name}가 생각 중…`;
  renderTop(); }
function startTimer(){ timeMax=mode==='bot'?LV[lv].time:12; timeLeft=timeMax; timerOn=true; }
function clearBot(){ clearTimeout(botTimer); clearTimeout(botPre); clearInterval(botIv); if(actors.R.anim==='think') act('R','idle'); }
function focusWord(){ if(!$('word').disabled&&$('picker').hidden&&matchMedia('(pointer:fine)').matches) $('word').focus({preventScroll:true}); }
function newGame(){ clearBot(); used=new Set(); chain=[]; last=null; over=false; result=null; pending=null; $('judge').hidden=true; combo=0;
  hearts={me:3,bot:3,p1:3,p2:3}; score={me:0,p1:0,p2:0}; $('bubL').hidden=true; $('bubR').hidden=true; $('strip').innerHTML='<span class="lab">이어진 말</span>';
  turn=mode==='bot'?'me':'p1'; toast(mode==='bot'?`${charR.name} 봇(${LV[lv].name})과 끝말잇기! 먼저 아무 낱말이나 써 보세요`:`${charL.name}부터 시작해요`);
  setNext(); timerOn=false; $('timebar').style.width='100%'; later(focusWord,60); }

/* ---------- judging ---------- */
function check(w){ if(w.length<2) return '두 글자 이상 낱말을 써 주세요';
  if(![...w].every(isSyl)) return '완성된 한글로만 써 주세요';
  if(last&&!starts(last).includes(w[0])) return `'${starts(last).join("' 또는 '")}'(으)로 시작해야 해요`;
  if(used.has(w)) return '이미 나온 낱말이에요';
  if(Hp.filter&&Hp.filter.hasBad(w)) return '고운 말로 이어 가요 😊'; return null; }
function submit(){ if(over||turn==='bot'||pending) return; audio(); const w=$('word').value.trim().replace(/\s+/g,''); if(!w) return;
  const err=check(w); if(err){ SFX.bad(); buzz(40); const i=$('word'); i.style.borderColor='#c0573f'; later(()=>i.style.borderColor='',350); toast(err); act(sideOf(turn),'sad'); return; }
  if(!DICT.has(w)&&!userAdded.has(w)){ pending=w; $('jWord').textContent=w; $('judge').hidden=false; timerOn=false; return; }
  accept(w); }
$('jOk').onclick=()=>{ if(!pending) return; userAdded.add(pending); Hp.store.set('wcAdded',[...userAdded].slice(-200)); const w=pending; pending=null; $('judge').hidden=true; accept(w,true); };
$('jNo').onclick=()=>{ pending=null; $('judge').hidden=true; timerOn=!!(chain.length||last); $('word').select(); $('word').focus(); };
function accept(w,added){ const who=turn,side=sideOf(who); used.add(w); chain.push(w); last=w[w.length-1]; $('word').value='';
  const pts=10+(w.length-2)*5+Math.max(0,Math.round(timeLeft)); combo++; if(combo>best){ best=combo; Hp.store.set('wcBest',best); }
  if(mode==='bot') score.me+=pts; else score[who]+=pts;
  say(side,w,`+${pts}점${added?' · 인정':''}${combo>=3&&mode==='bot'?` · ${combo}연속`:''}`);
  SFX.ok(combo); buzz(15); if(mode==='bot'&&combo%5===0){ toast(`${combo}번 연속 이었어요!`,true); SFX.combo(); act('L','happy'); buzz([20,30,40]); }
  if(mode==='bot'){ turn='bot'; timerOn=false; setNext(); botMove(); }
  else { turn=who==='p1'?'p2':'p1'; setNext(); startTimer(); focusWord(); } }

/* ---------- bot ---------- */
function botMove(){ const L=LV[lv],think=rand(L.think[0],L.think[1])*1000; botPre=setTimeout(()=>{ if(alive&&turn==='bot'&&!over) act('R','think'); },350);
  let ticks=0; botIv=setInterval(()=>{ if(alive&&++ticks%2===0) SFX.key(); },140);
  botTimer=setTimeout(()=>{ clearInterval(botIv); if(over||!alive) return; act('R','idle');
    let cands=last?followers(last,used):[...DICT].filter(w=>!used.has(w));
    if(cands.length&&Math.random()<L.give&&chain.length>6) cands=[];
    if(!cands.length){ botFail(); return; }
    let pick;
    if(Math.random()<L.hard){ const sc=cands.map(w=>({w,n:followers(w[w.length-1],new Set([...used,w])).length})).sort((a,b)=>a.n-b.n);
      const top=sc.slice(0,Math.max(1,Math.ceil(sc.length*.25))); pick=top[Math.floor(Math.random()*top.length)].w; }
    else pick=cands[Math.floor(Math.random()*cands.length)];
    used.add(pick); chain.push(pick); last=pick[pick.length-1]; SFX.bot(); buzz(8);
    const left=followers(last,used).length; say('R',pick,left===0?'한방 단어!':left<=2?'어려운 끝 글자':'');
    turn='me'; setNext(); startTimer(); focusWord(); },think+350); }
function botFail(){ hearts.bot--; score.me+=30; act('R','sad'); act('L','happy'); toast(`${charR.name}가 '${starts(last).join('/')}'(으)로 시작하는 말을 못 찾았어요! +30점`,true); SFX.win(); buzz([30,40,60]);
  if(hearts.bot<=0){ endGame('L'); return; } last=null; turn='me'; setNext(); startTimer(); later(()=>toast('새 줄! 아무 낱말로 다시 시작해요'),100); }
function humanFail(reason){ const who=turn,side=sideOf(who); combo=0; SFX.lose(); buzz([60,40,60]); act(side,'sad'); act(side==='L'?'R':'L','happy');
  if(mode==='bot'){ hearts.me--; toast(`${reason} 하트 하나가 줄었어요`,true); if(hearts.me<=0){ endGame('R'); return; }
    last=null; turn='bot'; timerOn=false; setNext(); botMove(); }
  else { hearts[who]--; toast(`${who==='p1'?charL.name:charR.name} ${reason}`,true); if(hearts[who]<=0){ endGame(who==='p1'?'R':'L'); return; }
    last=null; turn=who==='p1'?'p2':'p1'; setNext(); startTimer(); } }
function endGame(winner){ over=true; result=winner; timerOn=false; clearBot();
  if(mode==='bot') toast(winner==='L'?`${charR.name} 봇에게 이겼어요! ${score.me}점 · 최고 ${best}연속`:`이번엔 ${charR.name} 봇이 이겼어요. ${score.me}점 · 최고 ${best}연속`,true);
  else toast(`${winner==='L'?charL.name:charR.name} 승리! (${score.p1} : ${score.p2})`,true);
  winner==='L'||mode==='duo'?SFX.win():SFX.lose(); buzz([40,40,80]); act(winner==='L'?'R':'L','sad'); setNext(); }

/* ---------- hint & input ---------- */
$('hintBtn').onclick=()=>{ if(!last||over) return; audio(); const c=followers(last,used); if(!c.length){ toast('사전에 이 글자로 시작하는 말이 없어요. 아는 말을 써서 인정받아 보세요!'); return; }
  const w=c[Math.floor(Math.random()*c.length)]; if(mode==='bot') score.me=Math.max(0,score.me-5); else score[turn]=Math.max(0,score[turn]-5);
  toast(`힌트: ${w[0]+'○'.repeat(w.length-1)} (${w.length}글자) · -5점`); renderTop(); $('word').focus(); };
$('word').addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter'&&!e.isComposing&&e.keyCode!==229){ e.preventDefault(); submit(); } });
$('word').addEventListener('input',()=>{ audio(); SFX.key(); });
$('send').onclick=submit;
$('restart').onclick=()=>{ audio(); newGame(); };
root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{ mode=b.dataset.mode; root.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); openPicker(); });
root.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{ lv=+b.dataset.lv; root.querySelectorAll('[data-lv]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); newGame(); });

/* ---------- picker ---------- */
function buildGrid(id,side){ const g=$(id); g.innerHTML='';
  CHARS.forEach(k=>{ const b=document.createElement('button'); b.type='button'; b.className='wc-ch'; b.setAttribute('aria-pressed',String((side==='L'?charL:charR)===k));
    const c=document.createElement('canvas'); c.width=128; c.height=144; const x=c.getContext('2d'); drawChar(x,k,{x:64,y:136,s:1.05,mirror:side==='R',expr:'normal',t:0});
    b.appendChild(c); const n=document.createElement('span'); n.textContent=k.name; b.appendChild(n);
    b.onclick=()=>{ audio(); SFX.pick(); buzz(8); if(side==='L') charL=k; else charR=k; g.querySelectorAll('.wc-ch').forEach(q=>q.setAttribute('aria-pressed',String(q===b))); };
    g.appendChild(b); }); }
function openPicker(){ $('pLabelL').innerHTML=mode==='bot'?'<b>나</b>의 캐릭터':'<b>1번 친구</b> 캐릭터'; $('pLabelR').innerHTML=mode==='bot'?'<b>상대 봇</b> 캐릭터':'<b>2번 친구</b> 캐릭터';
  buildGrid('gridL','L'); buildGrid('gridR','R'); $('picker').hidden=false; }
$('pickBtn').onclick=openPicker;
$('goBtn').onclick=()=>{ audio(); SFX.pick(); Hp.store.set('wcChars',[charL.id,charR.id]); $('picker').hidden=true; newGame(); act('L','happy'); act('R','happy'); };

/* ---------- loop ---------- */
let lastT=performance.now(),lastSec=99;
function frame(now){ if(!alive) return; const dt=Math.min(.1,(now-lastT)/1000),t=now/1000; lastT=now;
  if(timerOn&&!over&&turn!=='bot'&&(chain.length>0||last)){ timeLeft-=dt; $('timebar').style.width=(Math.max(0,timeLeft/timeMax)*100)+'%';
    const s=Math.ceil(timeLeft); if(s<=3&&s>0&&s!==lastSec){ lastSec=s; SFX.tick(); buzz(10); }
    if(timeLeft<=0){ timerOn=false; lastSec=99; humanFail('시간이 다 됐어요!'); } }
  if(W>0&&H>0){ drawStage(t,dt); placeUI(); }
  requestAnimationFrame(frame); }
resize(); newGame(); openPicker(); requestAnimationFrame(frame);
return()=>{ alive=false; ro.disconnect(); clearBot(); timers.forEach(clearTimeout); clearTimeout(toastT); };
}});
