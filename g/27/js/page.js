/* 27 라면 — 첫 화면: 봉지가 통통 튀며 등장 → 세무사 1인분 → 끓는 물 필요 없음 → 월 5만원부터
   놀이: 봉지 뜯기 → 뒷면 조리법 ① 면(업종) ② 몇 인분(직원) ③ 불 세기(매출) → 타이머 3초 → 완성 그릇 → 기장료 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage');
  var pk = $('pk'), cl = $('cl'), one = $('one'), note = $('note'), ket = $('ket'), tear = $('tear');
  var rc = $('rc'), rq = $('rq'), zone = $('zone'), kit = $('kit'), pot = $('pot'), fire = $('fire'), timer = $('timer'), tnum = $('tnum'), dish = $('dish'), bowls = $('bowls'), pin = $('p-in');
  var started = false;

  function line(html) { cl.innerHTML = html; cl.classList.remove('pop'); void cl.offsetWidth; cl.classList.add('pop'); }
  var PRICE = '<b class="won">월 5만원부터</b><small>부가세 별도</small>';

  /* ── 첫 화면 ── */
  function endHook() { pk.classList.remove('drop'); pk.classList.add('idle'); one.classList.add('on'); note.classList.add('on'); line(PRICE); }
  function hook() {
    if (T.calm) { endHook(); return; }
    function chk() { if (started) throw 0; }
    pk.classList.add('drop');
    T.wait(420).then(function () { chk(); T.sfx('thud'); return T.wait(330); })
      .then(function () { chk(); T.sfx('tap'); return T.wait(250); })
      .then(function () { chk(); pk.classList.remove('drop'); pk.classList.add('idle'); line('세무사 <em>1인분.</em>'); one.classList.add('on'); T.sfx('select'); return T.wait(1500); })
      .then(function () { chk(); ket.classList.add('in'); T.sfx('swing'); return T.wait(650); })
      .then(function () { chk(); ket.classList.add('no'); T.sfx('error'); T.shake(ket); line('영수증만<br><em>넣으세요.</em>'); return T.wait(650); })
      .then(function () { chk(); ket.classList.add('out'); note.classList.add('on'); return T.wait(1300); })
      .then(function () { chk(); line(PRICE); T.sfx('coin'); T.shake(pk); })
      .catch(function () { });
  }

  /* ── 조리법 단계 ── */
  var A = {}, step = 0, busy = false;
  var Q = { 1: '어떤 일을 하세요?', 2: '4대보험 직원은 몇 명이에요?' };
  var stepsLi = [].slice.call(document.querySelectorAll('#steps li'));
  function fit() { stage.style.setProperty('--rch', rc.offsetHeight + 'px'); }
  function setStep(n) {
    step = n;
    stepsLi.forEach(function (li, i) { li.classList.toggle('cur', i + 1 === n); li.classList.toggle('ok', i + 1 < n); });
    rq.textContent = n === 3 ? T.revQ(A.g) : Q[n];
    rq.classList.remove('pop'); void rq.offsetWidth; rq.classList.add('pop');
    [].forEach.call(rc.querySelectorAll('.rc-fine'), function (p) { p.hidden = +p.getAttribute('data-for') !== n; });
    [].forEach.call(zone.querySelectorAll('.st'), function (s) {
      var on = +s.getAttribute('data-st') === n; s.hidden = !on; s.classList.remove('on');
      if (on) { [].forEach.call(s.querySelectorAll('.pick,.gone'), function (b) { b.classList.remove('pick', 'gone'); }); requestAnimationFrame(function () { requestAnimationFrame(function () { s.classList.add('on'); }); }); }
    });
    fit(); busy = false;
  }

  function center(node) { var s = stage.getBoundingClientRect(), r = node.getBoundingClientRect(); return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: r.width, h: r.height }; }
  function splash() {
    if (T.calm) return;
    var c = center(pot), y = c.y - c.h * .3;
    for (var i = 0; i < 12; i++) {
      var d = T.el('i', 'splash'); d.style.left = c.x + 'px'; d.style.top = y + 'px'; stage.appendChild(d);
      var ang = Math.PI * (1.1 + Math.random() * .8), sp = 40 + Math.random() * 60;
      d.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(' + (Math.cos(ang) * sp - 5) + 'px,' + (Math.sin(ang) * sp + 40) + 'px) scale(.4)', opacity: 0 }],
        { duration: 600 + Math.random() * 200, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = (function (d) { return function () { d.remove(); }; })(d);
    }
  }
  /* 면이 냄비로 날아감 */
  function toss(btn) {
    var svg = btn.querySelector('svg'); btn.classList.add('pick');
    [].forEach.call(btn.parentNode.querySelectorAll('.nd'), function (b) { if (b !== btn) b.classList.add('gone'); });
    if (T.calm || !svg) return Promise.resolve();
    var a = center(svg), b = center(pot), f = T.el('div', 'flyer', svg.outerHTML);
    f.style.width = a.w + 'px'; f.style.left = (a.x - a.w / 2) + 'px'; f.style.top = (a.y - a.h / 2) + 'px'; stage.appendChild(f);
    var dx = b.x - a.x, dy = (b.y - b.h * .3) - a.y;
    T.sfx('throw');
    return new Promise(function (res) {
      var an = f.animate([
        { transform: 'translate(0,0) rotate(0) scale(1)' },
        { transform: 'translate(' + dx * .5 + 'px,' + (Math.min(dy, 0) - 70) + 'px) rotate(200deg) scale(.85)', offset: .5 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(380deg) scale(.45)', opacity: 1, offset: .92 },
        { transform: 'translate(' + dx + 'px,' + (dy + 14) + 'px) rotate(390deg) scale(.4)', opacity: 0 }
      ], { duration: 720, easing: 'cubic-bezier(.35,0,.6,1)' });
      an.onfinish = function () { f.remove(); res(); };
    });
  }
  var NOODLE = {
    A: '<path d="M78 34q8-6 16 0t16 0 16 0 16 0 16 0M76 40q8-6 16 0t16 0 16 0 16 0 16 0 8 0" fill="none" stroke="#FFD66B" stroke-width="5" stroke-linecap="round"/>',
    B: '<path d="M84 36c10-10 22 8 34-2s22 8 34-2" fill="none" stroke="#FFD66B" stroke-width="6" stroke-linecap="round"/><path d="M96 42c8-6 18 4 28-2s18 4 26-1" fill="none" stroke="#F6C55A" stroke-width="4" stroke-linecap="round"/>',
    C: '<path d="M70 36h100M74 41h92" stroke="#FFD66B" stroke-width="6" stroke-linecap="round"/>',
    '?': '<path d="M86 38c6-12 26-10 26 0s-18 8-10-2 30-10 38 2" fill="none" stroke="#FFD66B" stroke-width="5" stroke-linecap="round"/>'
  };
  function plop(g) { pin.innerHTML = NOODLE[g] || NOODLE['?']; splash(); T.sfx('thud'); T.shake(pot); pot.classList.add('warm'); }

  function fillBowls(k) {
    bowls.innerHTML = '';
    for (var i = 0; i < k; i++) { var b = document.createElement('i'); b.style.animationDelay = (i * 70) + 'ms'; bowls.appendChild(b); }
  }
  function cook() {
    busy = true; zone.querySelectorAll('.st').forEach(function (s) { s.classList.remove('on'); });
    stepsLi.forEach(function (li) { li.classList.remove('cur'); li.classList.add('ok'); });
    rq.textContent = '끓는 중… 조금만 기다리세요'; rq.classList.remove('pop'); void rq.offsetWidth; rq.classList.add('pop');
    [].forEach.call(rc.querySelectorAll('.rc-fine'), function (p) { p.hidden = true; });
    var ring = timer.querySelector('.t-ring');
    timer.classList.add('on'); pot.classList.remove('warm'); pot.classList.add('boil', 'shake'); if (!fire.classList.contains('hi')) fire.classList.add('mid');
    ring.style.transition = 'none'; ring.style.strokeDasharray = '100 100'; void ring.getBoundingClientRect(); ring.style.transition = '';
    var n = 3;
    function tick() {
      tnum.textContent = n; timer.classList.remove('tick'); void timer.offsetWidth; timer.classList.add('tick'); T.sfx('blip');
      ring.style.strokeDasharray = ((n - 1) / 3 * 100) + ' 100';
    }
    tick();
    var p = Promise.resolve();
    [2, 1].forEach(function (k) { p = p.then(function () { return T.wait(1000); }).then(function () { n = k; tick(); }); });
    return p.then(function () { return T.wait(1000); }).then(function () {
      tnum.textContent = '0'; T.sfx('win'); pot.classList.remove('shake', 'boil'); pot.classList.add('done'); timer.classList.remove('on');
      dish.classList.add('on'); fire.className = 'fire off'; rq.textContent = '다 됐어요! 맛있게 드세요'; T.flash(stage); T.confetti(stage, 46, ['#E3001B', '#FFD21F', '#FFFFFF', '#FF8A3D', '#3FAF4A']);
      return T.stamp(stage, '완성!', A.g === 'X' ? '법인용 큰 냄비' : '세무사 1인분', 1000);
    }).then(function () {
      var art = '<svg viewBox="0 0 300 220">' + dish.querySelector('svg').innerHTML + '</svg>';
      T.result(A, { eye: A.g === 'X' ? '완성! 법인용 한 솥' : '완성! 세무사 1인분', again: '한 봉지 더 끓이기', onAgain: restart, art: art });
      busy = false;
    });
  }

  stage.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-g],button[data-v]'); if (!b || busy || !step || !stage.classList.contains('play')) return;
    busy = true; T.sfx('select');
    if (b.hasAttribute('data-g')) {
      A = { g: b.getAttribute('data-g') };
      if (b.classList.contains('nd')) toss(b).then(function () { plop(A.g); return T.wait(500); }).then(function () { setStep(2); });
      else {
        b.classList.add('pick'); zone.querySelector('.s1').classList.remove('on'); plop(A.g === 'X' ? 'A' : 'B');
        T.wait(500).then(function () { if (A.g === 'X') { fillBowls(4); fire.className = 'fire hi'; return cook(); } setStep(2); });
      }
    } else if (step === 2) {
      A.emp = b.getAttribute('data-v'); b.classList.add('pick'); T.sfx('tap');
      fillBowls(A.emp === 'many' ? 6 : 2);
      T.wait(800).then(function () { setStep(3); });
    } else if (step === 3) {
      A.rev = b.getAttribute('data-v'); b.classList.add('pick');
      var lv = A.rev === 'high' ? 'hi' : A.rev === 'low' ? 'lo' : 'mid';
      $('knob').className = 'knob ' + lv; fire.className = 'fire ' + lv; T.sfx(lv === 'hi' ? 'power' : 'tap');
      T.wait(900).then(cook);
    }
  });

  function reset() {
    A = {}; pin.innerHTML = ''; bowls.innerHTML = ''; fire.className = 'fire'; $('knob').className = 'knob';
    pot.className = 'pot'; dish.classList.remove('on'); timer.classList.remove('on'); tnum.textContent = '3';
  }
  function restart() { reset(); T.playing(true); setStep(1); }

  T.onPlay = function () {
    started = true; reset();
    if (!stage.classList.contains('play')) {
      endHook(); ket.classList.add('out');
      tear.classList.add('go'); T.sfx('swing');
      stage.classList.add('play');
      rc.hidden = false; zone.hidden = false; kit.hidden = false;
      T.wait(500).then(function () { T.sfx('select'); requestAnimationFrame(function () { rc.classList.add('on'); kit.classList.add('on'); }); setStep(1); });
    } else setStep(1);
  };

  addEventListener('resize', function () { if (!rc.hidden) fit(); });
  hook();
})();
