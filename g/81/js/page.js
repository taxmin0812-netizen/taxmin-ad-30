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

/* 81_도미노 — 첫 화면은 실사 키 이미지 + 훅 줄 드러남 + 칩(css). 그 밖은 공용 계산창.js */
