/* 24 전단지 — 첫 화면: 전단지가 펄럭이며 전봇대에 붙음 → '세무사 구함'에 빨간 줄 → '구했습니다!' → 한 달 5만원부터(부가세 별도)
   놀이: 질문마다 새 쪽지 전단지가 겹쳐 붙고, 아래 '뜯는 쪽지'를 하나 뜯어 답한다 → 사장님 손에 쪽지 한 장 → 결과 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), stack = $('stack'), main = $('fl0'), hand = $('hand'), q3 = $('qf3');
  var QF = {}; [].forEach.call(stack.querySelectorAll('.qf'), function (f) { QF[f.getAttribute('data-q')] = f; });
  var Q3 = q3.textContent;
  var started = false, hookDone = false, busy = false, step = 0, A = {};

  /* ── 첫 화면 ── */
  var HK = ['intro', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  function endHook() { HK.forEach(function (c) { stage.classList.remove(c); }); hookDone = true; }
  function beat(cls, fx, ms) { return function () { if (started) throw 0; stage.classList.add(cls); if (fx) fx(); return T.wait(ms); }; }
  function hook() {
    if (T.calm) { endHook(); return; }
    T.wait(350)
      .then(beat('h1', function () { T.sfx('swing'); setTimeout(function () { T.sfx('swing'); }, 380); }, 950))
      .then(beat('h2', function () { T.sfx('thud'); }, 260))
      .then(beat('h3', function () { T.sfx('thud'); }, 700))
      .then(beat('h4', function () { T.sfx('swing'); }, 600))
      .then(beat('h5', function () { T.sfx('boom'); T.shake(main); }, 900))
      .then(beat('h6', function () { T.sfx('coin'); }, 600))
      .then(endHook)
      .catch(function () { });
  }
  function begin() { started = true; if (!hookDone) endHook(); }

  /* ── 쪽지 전단지 ── */
  function showQ(n) {
    step = n; busy = true;
    var f = QF[n];
    if (n === 3) q3.textContent = T.revQ(A.g);
    f.hidden = false; f.classList.remove('away', 'slap'); void f.offsetWidth; f.classList.add('slap');
    T.sfx('swing');
    setTimeout(function () { T.sfx('thud'); busy = false; }, T.calm ? 0 : 520);
    setTimeout(function () { T.sfx('thud'); }, T.calm ? 0 : 740);
  }

  /* 쪽지 하나 뜯기: 살짝 당김 → 찢김 → 날아감(뜯긴 자리엔 들쭉날쭉한 조각) */
  function rip(btn) {
    return new Promise(function (res) {
      var li = btn.parentNode;
      btn.classList.add('pull'); T.sfx('tap');
      setTimeout(function () {
        var r = btn.getBoundingClientRect(), s = stage.getBoundingClientRect();
        var fa = document.createElement('div'); fa.className = 'flyaway'; fa.innerHTML = btn.innerHTML;
        fa.style.left = (r.left - s.left) + 'px'; fa.style.top = (r.top - s.top) + 'px';
        fa.style.width = r.width + 'px'; fa.style.height = r.height + 'px'; fa.style.background = getComputedStyle(btn).backgroundColor;
        stage.appendChild(fa);
        li.classList.add('torn'); btn.classList.remove('pull'); btn.style.visibility = 'hidden';
        T.sfx('thud'); T.sfx('swing');
        var left = r.left + r.width / 2 < s.left + s.width / 2, dx = (left ? -1 : 1) * (70 + Math.random() * 70), rot = left ? -1 : 1;
        if (T.calm || !fa.animate) { fa.remove(); return res(); }
        var an = fa.animate([
          { transform: 'translate(0,0) rotate(0deg)' },
          { transform: 'translate(' + dx * .25 + 'px,28px) rotate(' + rot * 12 + 'deg)', offset: .25 },
          { transform: 'translate(' + dx * .6 + 'px,' + s.height * .4 + 'px) rotate(' + rot * -18 + 'deg)', offset: .6 },
          { transform: 'translate(' + dx + 'px,' + s.height + 'px) rotate(' + rot * 50 + 'deg)', opacity: .85 }
        ], { duration: 1150, easing: 'cubic-bezier(.35,.1,.6,1)', fill: 'forwards' });
        an.onfinish = function () { fa.remove(); };
        setTimeout(res, 380);
      }, T.calm ? 0 : 150);
    });
  }

  stack.addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b || busy) return;
    var fl = b.closest('.fl'), li = b.parentNode;
    if (li.classList.contains('torn') || li.classList.contains('gone')) return;
    if (fl === main) {                       // 첫 전단지 쪽지를 뜯어도 시작
      if (step) return;
      busy = true; begin(); T.playing(true); T.hit('play', true); reset();
      busy = true;
      rip(b).then(function () { return T.wait(250); }).then(function () { showQ(1); });
      return;
    }
    var n = +fl.getAttribute('data-q'); if (n !== step) return;
    busy = true;
    if (n === 1) A = { g: b.getAttribute('data-g') };
    else if (n === 2) A.emp = b.getAttribute('data-v');
    else A.rev = b.getAttribute('data-v');
    rip(b).then(function () { return T.wait(420); }).then(function () {
      if ((n === 1 && A.g === 'X') || n === 3) return finish();
      showQ(n + 1);
    });
  });

  function finish() {
    busy = true; step = 0;
    hand.classList.add('on'); T.sfx('select');
    return T.wait(1150).then(function () {
      T.sfx('win'); busy = false;
      T.result(A, { eye: '세무사 구했습니다!', again: '쪽지 다시 뜯기', onAgain: again });
    });
  }
  function reset() {
    A = {}; step = 0; busy = false; hand.classList.remove('on');
    Object.keys(QF).forEach(function (k) { var f = QF[k]; f.hidden = true; f.classList.remove('slap', 'away'); });
    [].forEach.call(stack.querySelectorAll('.qf li.torn'), function (li) { li.classList.remove('torn'); li.querySelector('.tab').style.visibility = ''; });
    q3.textContent = Q3;
  }
  function again() {
    T.playing(true); busy = true; hand.classList.remove('on');
    Object.keys(QF).forEach(function (k) { var f = QF[k]; if (!f.hidden) { f.classList.remove('slap'); void f.offsetWidth; f.classList.add('away'); } });
    T.sfx('swing');
    T.wait(520).then(function () { reset(); showQ(1); });
  }

  T.onPlay = function () {
    begin(); reset(); busy = true;
    setTimeout(function () { showQ(1); }, T.calm ? 0 : 220);
  };

  hook();
})();
