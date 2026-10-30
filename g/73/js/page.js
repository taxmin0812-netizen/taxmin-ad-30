/* 이야기형 시안(69~73) 공통 — 시안_합치기.py 가 각 시안의 _page.js 앞에 붙인다.
   스크롤 드러남 · 하단 단추로 여는 기장료 계산창(질문 3개 → 공용 TM.result). 시안은 CALC.open({ g: 'B' }) 로 업종을 미리 골라 열 수 있다. */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, doc = document, root = doc.documentElement, body = doc.body;
  if (T.SHOT) root.classList.add('shot');
  if (T.calm) root.classList.add('calm');

  var rv = [].slice.call(doc.querySelectorAll('.rv'));
  if (T.SHOT || T.calm || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .15 });
    rv.forEach(function (e) { io.observe(e); });
  }

  var calc = doc.createElement('section');
  calc.className = 'calc'; calc.id = 'calc'; calc.hidden = true; calc.setAttribute('aria-label', '기장료 계산');
  calc.innerHTML = '<div class="calc-in"><div class="calc-top"><p class="calc-st" id="cst">1 / 3</p><button class="calc-x" type="button" id="cx" aria-label="닫기">×</button></div>' +
    '<div class="calc-bar"><i id="cbar"></i></div><h2 class="calc-q" id="cq"></h2><p class="calc-s" id="cs"></p><ul class="calc-o" id="co"></ul><p class="calc-m" id="cm"></p>' +
    '<button class="calc-back" type="button" id="cb" hidden>← 이전 질문</button></div>';
  (doc.querySelector('.gm-stage') || body).appendChild(calc);

  var A = {}, step = 0, hist = [];
  var IND = [['A', '도소매 · 온라인 판매', '옷가게, 마트, 스마트스토어'], ['B', '음식점 · 카페 · 제조', '식당, 카페, 공방, 건설·운수'],
             ['C', '서비스 · 학원 · 프리랜서', '미용실, 학원, 디자인, 강사'], ['P', '전문직', '병원, 법률 사무소 등'], ['?', '그 밖의 업종', '잘 모르겠으면 이쪽']];
  function render() {
    var h = '', m = '';
    $('cst').textContent = (step + 1) + ' / 3'; $('cbar').style.width = ((step + 1) / 3 * 100) + '%';
    $('cb').hidden = !hist.length;
    if (step === 0) {
      $('cq').textContent = '어떤 일을 하세요?'; $('cs').textContent = '';
      IND.forEach(function (o) { h += '<li><button type="button" data-v="' + o[0] + '"><span>' + o[1] + '<small>' + o[2] + '</small></span></button></li>'; });
      m = '<button type="button" data-v="X">법인사업자예요</button>';
    } else if (step === 1) {
      $('cq').textContent = '4대보험 가입한 직원은 몇 명이에요?'; $('cs').textContent = '사장님 본인은 빼고 세어 주세요.';
      h = '<li><button type="button" data-v="few"><span>없음 ~ 5명</span></button></li><li><button type="button" data-v="many"><span>6명 이상</span></button></li>';
    } else {
      $('cq').textContent = T.revQ(A.g); $('cs').textContent = '1월부터 12월까지 들어온 돈 기준이에요.';
      h = '<li><button type="button" data-v="low"><span>네, 이하예요<small>올해 문을 열었어도 이쪽</small></span></button></li><li><button type="button" data-v="high"><span>넘어요</span></button></li>';
      m = '<button type="button" data-v="unk">잘 모르겠어요</button>';
    }
    $('co').innerHTML = h; $('cm').innerHTML = m;
    var f = $('co').querySelector('button'); if (f && !T.SHOT) f.focus({ preventScroll: true });
  }
  function open(pre) {
    A = {}; step = 0; hist = [];
    if (pre && pre.g) { A.g = pre.g; step = 1; }
    render(); calc.hidden = false; body.classList.add('calc-on'); calc.scrollTop = 0; T.playing(true);
  }
  function close() { calc.hidden = true; body.classList.remove('calc-on'); T.playing(false); }
  function done() {
    close();
    T.result(A.g === 'X' ? { g: 'X' } : A, { eye: '우리 가게 예상 기장료', again: '다시 계산하기', onAgain: function () { open(); } });
  }
  function pick(v, btn) {
    if (btn) btn.classList.add('on');
    T.sfx('select');
    setTimeout(function () {
      if (step === 0) { A.g = v; if (v === 'X') return done(); }
      else if (step === 1) A.emp = v;
      else { A.rev = v; return done(); }
      hist.push(step); step++; render();
    }, T.calm ? 0 : 170);
  }
  calc.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-v]'); if (b) { pick(b.getAttribute('data-v'), b); return; }
    if (e.target.closest('#cx')) { T.sfx('tap'); close(); return; }
    if (e.target.closest('#cb')) { T.sfx('tap'); step = hist.pop(); if (step === 0) delete A.emp; render(); }
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !calc.hidden) close(); });
  T.onPlay = function () { open(); };

  var res = doc.querySelector('.gm-res');
  if (res) res.addEventListener('click', function (e) { if (e.target === res) T.closeResult(); });

  window.CALC = { open: open };
})();

/* 73 골목 가게 — 가게를 누르면 불이 켜지고 그 업종의 기장료 기준이 나옴. '우리 가게로 계산하기'는 업종을 고른 채로 계산창을 엶 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, doc = document;
  var SHOPS = [
    { nm: '옷가게', g: 'A', wall: '#F6B8C8', roof: '#E0708F', item: '<path d="M50 112l14-8 14 8M64 104v-6a4 4 0 1 1 4-4" stroke="#7A3550" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M118 112l14-8 14 8M132 104v-6a4 4 0 1 1 4-4" stroke="#7A3550" stroke-width="2.4" fill="none" stroke-linecap="round"/>' },
    { nm: '카페', g: 'B', wall: '#A9E2CC', roof: '#3FA984', item: '<path d="M60 102h26v10a13 13 0 0 1-26 0z M86 106h5a4 4 0 0 1 0 8h-5" stroke="#1F5E48" stroke-width="2.4" fill="none"/><path d="M118 102h26v10a13 13 0 0 1-26 0z" stroke="#1F5E48" stroke-width="2.4" fill="none"/>' },
    { nm: '미용실', g: 'C', wall: '#CFC4F5', roof: '#7E6AD8', item: '<circle cx="64" cy="118" r="6" stroke="#3E3280" stroke-width="2.4" fill="none"/><circle cx="64" cy="100" r="6" stroke="#3E3280" stroke-width="2.4" fill="none"/><path d="M69 116l22-16M69 102l22 16" stroke="#3E3280" stroke-width="2.4" stroke-linecap="round"/><rect x="122" y="96" width="6" height="30" rx="3" fill="#E35D6A"/><rect x="122" y="96" width="6" height="30" rx="3" fill="none" stroke="#3E3280" stroke-width="2"/>' },
    { nm: '학원', g: 'C', wall: '#FFE08A', roof: '#E3A925', item: '<path d="M54 100h18a6 6 0 0 1 6 6v20a6 6 0 0 0-6-6H54z M102 100H84a6 6 0 0 0-6 6v20a6 6 0 0 1 6-6h18z" stroke="#7A5A0E" stroke-width="2.4" fill="none" stroke-linejoin="round"/><path d="M124 96v30M118 102h12" stroke="#7A5A0E" stroke-width="2.4" stroke-linecap="round"/>' },
    { nm: '공방', g: 'B', wall: '#F7C9A6', roof: '#D2814C', item: '<path d="M56 124l20-26 8 6-20 26z M76 98l6-8 8 6-6 8" stroke="#6E3B17" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="130" cy="112" r="12" stroke="#6E3B17" stroke-width="2.4" fill="none"/><circle cx="130" cy="112" r="4" fill="#6E3B17"/>' }
  ];
  function svg(s) {
    return '<svg viewBox="0 0 200 200" aria-hidden="true">' +
      '<rect x="14" y="44" width="172" height="156" fill="' + s.wall + '"/>' +
      '<rect class="sign" x="40" y="54" width="120" height="26" rx="6" fill="#ffffff" opacity=".95"/>' +
      '<text class="nm" x="100" y="72" text-anchor="middle" fill="' + s.roof + '">' + s.nm + '</text>' +
      '<path d="M8 84h184l-8 14H16z" fill="' + s.roof + '"/>' +
      '<rect class="win" x="36" y="92" width="128" height="44" rx="4" fill="#ffffff"/>' + s.item +
      '<rect x="80" y="148" width="40" height="52" rx="3" fill="' + s.roof + '" opacity=".85"/><circle cx="112" cy="174" r="2.5" fill="#fff"/>' +
      '<g class="tag"><rect x="56" y="6" width="88" height="28" rx="14" fill="#17213A"/><text x="100" y="25" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">세무사 있음</text></g>' +
      '</svg>';
  }
  var st = $('street'), cur = -1;
  st.innerHTML = SHOPS.map(function (s, i) { return '<button type="button" class="shop" role="listitem" data-i="' + i + '" aria-label="' + s.nm + '">' + svg(s) + '</button>'; }).join('');
  var btns = [].slice.call(st.children);
  function lim(g) { var m = /이 (.+?) 이하/.exec(T.revQ(g)); return m ? m[1] : ''; }
  function pick(i, user) {
    cur = i; var s = SHOPS[i];
    btns.forEach(function (b, j) { b.classList.toggle('on', j === i); });
    st.classList.toggle('picked', !!user || T.SHOT);
    $('ik').textContent = s.nm + ' 사장님이라면'; $('calcgo').firstChild.textContent = '이 업종으로 바로 계산하기';
    $('iv').innerHTML = '작년 매출 ' + lim(s.g) + '까지<br><b>월 5만원부터</b>예요.';
    $('is').textContent = '직원 4~5명이면 월 6만원 · 부가세 별도 · 매출이 더 크면 상담 때 안내';
    ['ik', 'iv', 'is'].forEach(function (id) { var e = $(id); e.classList.remove('new'); void e.offsetWidth; e.classList.add('new'); });
  }
  st.addEventListener('click', function (e) {
    var b = e.target.closest('.shop'); if (!b) return;
    T.sfx('tap'); pick(+b.getAttribute('data-i'), true);
    if (!T.SHOT) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: T.calm ? 'auto' : 'smooth' });
  });
  $('calcgo').addEventListener('click', function () { window.CALC.open(cur < 0 ? null : { g: SHOPS[cur].g }); });
  /* 처음에는 가격 없이 안내만(첫 화면 가격 금지) */
  $('ik').textContent = '가게마다 기준이 달라요'; $('iv').innerHTML = '비슷한 가게를 누르면<br>기장료 기준이 나와요.'; $('is').textContent = '';
  $('calcgo').firstChild.textContent = '기장료 바로 계산하기';
  if (st.scrollWidth > st.clientWidth) st.scrollLeft = btns[1].offsetLeft - (st.clientWidth - btns[1].offsetWidth) / 2;
})();
