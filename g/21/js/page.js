/* 21 속보 — 첫 화면: LIVE 깜빡 → '속보' 띠 → 하단 자막 '동네 사장님, 세무사 생겼다' 타자 → 월 5만원부터
   놀이: 시청자 실시간 투표 3꼭지(업종 → 직원 → 매출). 표를 누르면 막대가 차오르고 와이프로 다음 꼭지 → '단독' → 결과 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage');
  var news = $('news'), poll = $('poll'), excl = $('excl'), wipe = $('wipe'), wipeT = $('wipe-t');
  var hd1 = $('hd1'), hd2a = $('hd2a'), hd2b = $('hd2b'), clock = $('clock'), tk1 = $('tk1'), tk2 = $('tk2');

  /* 방송 시계 */
  function tick() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    clock.textContent = (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m;
  }
  tick(); setInterval(tick, 20000);
  function ticker(t) { var s = (t + ' · ').repeat(3); tk1.textContent = s; tk2.textContent = s; }

  /* ── 첫 화면 ── */
  var started = false, hookDone = false;
  function hookEnd() {
    stage.classList.add('h1', 'h2', 'h3', 'h4');
    hd1.textContent = '동네 사장님,'; hd2a.textContent = '세무사'; hd2b.textContent = ' 생겼다';
    hookDone = true;
  }
  function hook() {
    if (T.calm) { hookEnd(); return; }
    stage.classList.add('h1');
    T.sfx('blip');
    T.wait(1150)
      .then(function () { if (started) throw 0; stage.classList.add('h2'); T.sfx('swing'); return T.wait(520); })
      .then(function () { if (started) throw 0; stage.classList.add('h3'); T.sfx('tap'); return T.wait(260); })
      .then(function () { if (started) throw 0; return T.type(hd1, '동네 사장님,', 62); })
      .then(function () { return T.wait(180); })
      .then(function () { if (started) throw 0; return T.type(hd2a, '세무사', 70); })
      .then(function () { if (started) throw 0; return T.type(hd2b, ' 생겼다', 62); })
      .then(function () { return T.wait(380); })
      .then(function () { if (started) throw 0; stage.classList.add('h4'); T.sfx('coin'); hookDone = true; })
      .catch(function () { });
  }

  /* ── 꼭지 넘김 와이프 ── */
  function wipeTo(label, swap) {
    wipeT.textContent = label;
    wipe.classList.remove('go'); void wipe.offsetWidth; wipe.classList.add('go'); T.sfx('swing');
    return T.wait(600).then(function () { swap(); return T.wait(620); }).then(function () { wipe.classList.remove('go'); });
  }

  /* ── 시청자 실시간 투표 ── */
  var STEP = { 1: ['1꼭지 · 업종', '어떤 일을 하세요?'], 2: ['2꼭지 · 직원', '4대보험 직원은 몇 명이에요?'], 3: ['3꼭지 · 매출', ''] };
  var ptTag = poll.querySelector('.pt-tag'), dots = [].slice.call(poll.querySelectorAll('.pt-dots li')), A = {}, step = 1, busy = false;
  function setStep(n) {
    step = n; busy = false;
    $('pq-k').textContent = STEP[n][0];
    $('pq').textContent = n === 3 ? T.revQ(A.g) : STEP[n][1];
    ptTag.innerHTML = '<i></i>시청자 실시간 투표'; poll.classList.remove('voted');
    dots.forEach(function (d, i) { d.className = i + 1 < n ? 'done' : i + 1 === n ? 'on' : ''; });
    [].forEach.call(poll.querySelectorAll('.opts'), function (o) { o.hidden = +o.getAttribute('data-st') !== n; });
    [].forEach.call(poll.querySelectorAll('.on, .dim'), function (b) { b.classList.remove('on', 'dim'); });
    poll.classList.remove('in'); void poll.offsetWidth; poll.classList.add('in');
    ticker('시청자 실시간 투표 ' + n + '꼭지 · 투표 세 번이면 우리 가게 기장료가 나와요');
  }
  function openPoll() {
    news.hidden = true; excl.hidden = true; poll.hidden = false; stage.classList.add('mode-poll'); setStep(1);
  }
  poll.addEventListener('click', function (e) {
    if (busy) return;
    var b = e.target.closest('button[data-g], button[data-v]'); if (!b) return;
    busy = true; T.sfx('select');
    var box = b.closest('.opts');
    [].forEach.call(box.querySelectorAll('button'), function (x) { x.classList.toggle('dim', x !== b); });
    b.classList.add('on');
    if (step === 1) A = { g: b.getAttribute('data-g') };
    else if (step === 2) A.emp = b.getAttribute('data-v');
    else A.rev = b.getAttribute('data-v');
    T.wait(520).then(function () {
      poll.classList.add('voted'); ptTag.innerHTML = '<i></i>투표 완료'; T.sfx('coin');
      dots[step - 1].className = 'done';
      return T.wait(700);
    }).then(function () {
      if (step === 3 || A.g === 'X') return scoop();
      return wipeTo((step + 1) + '꼭지', function () { setStep(step + 1); });
    });
  });

  /* ── 단독 → 결과 ── */
  function scoop() {
    return wipeTo('단독', function () {
      poll.hidden = true; excl.hidden = false; stage.classList.remove('mode-poll');
      excl.classList.remove('in'); void excl.offsetWidth; excl.classList.add('in');
      ticker('단독 · 우리 가게 기장료 방금 나왔다');
    }).then(function () { T.sfx('win'); T.flash(stage); return T.wait(1300); })
      .then(function () { T.result(A, { eye: '단독 · 우리 가게 기장료', again: '다시 투표하기', onAgain: restart }); });
  }
  function restart() { A = {}; T.playing(true); openPoll(); }

  T.onPlay = function () {
    started = true;
    if (!hookDone) hookEnd();
    A = {};
    wipeTo('실시간 투표', openPoll);
  };

  hook();
})();
