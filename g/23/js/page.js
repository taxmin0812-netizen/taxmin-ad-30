/* 23 호외 — 첫 화면: 윤전기에서 신문이 툭 → 펼쳐짐 → 호외 쾅 → '우리 가게에 세무사 생겼다' → 월 5만원부터(부가세 별도)
   놀이: 지면 아래 '오려 쓰는 쿠폰'에 펜으로 세 칸 표시 → 가위가 점선을 따라 오림 → 쿠폰이 들려 올라가며 결과 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), scroll = $('scroll'), paper = $('paper');
  var coupon = $('coupon'), hole = $('hole'), scis = $('scis'), cutsvg = $('cutsvg'), cutp = $('cutp'), q3t = $('q3t');
  var qs = [].slice.call(coupon.querySelectorAll('.q'));
  var Q3 = q3t.textContent;
  var started = false, hookDone = false, busy = false, step = 0, A = {};

  /* ── 첫 화면 ── */
  function endHook() { stage.classList.remove('intro', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'); hookDone = true; }
  function beat(cls, ms) { return function () { if (started) throw 0; stage.classList.add(cls); return T.wait(ms); }; }
  function hook() {
    if (T.calm) { endHook(); return; }
    T.wait(700)
      .then(beat('h1', 500))
      .then(function () { if (started) throw 0; T.sfx('thud'); T.shake(stage); return T.wait(300); })
      .then(beat('h2', 0)).then(function () { T.sfx('swing'); return T.wait(820); })
      .then(beat('h3', 0)).then(function () { T.sfx('boom'); setTimeout(function () { T.shake(paper); }, 120); return T.wait(800); })
      .then(beat('h4', 0)).then(function () { T.sfx('thud'); return T.wait(480); })
      .then(beat('h5', 0)).then(function () { T.sfx('thud'); return T.wait(950); })
      .then(beat('h6', 0)).then(function () { T.sfx('swing'); return T.wait(650); })
      .then(beat('h7', 0)).then(function () { T.sfx('hit'); T.sfx('coin'); T.shake(stage); return T.wait(500); })
      .then(endHook)
      .catch(function () { });
  }

  /* ── 지면 스크롤 ── */
  function goTo(node, pad) {
    var r = node.getBoundingClientRect(), s = scroll.getBoundingClientRect();
    var top = scroll.scrollTop + r.top - s.top - (pad == null ? 14 : pad);
    scroll.scrollTo({ top: Math.max(0, top), behavior: T.calm ? 'auto' : 'smooth' });
  }

  /* ── 쿠폰 ── */
  function setQ(n) {
    step = n;
    qs.forEach(function (q) {
      var k = +q.getAttribute('data-q');
      q.classList.toggle('act', k === n);
      q.classList.toggle('wait', k > n);
    });
    if (n === 3) q3t.textContent = T.revQ(A.g);
    if (n === 1) goTo(coupon.closest('.cp-wrap'), 10);
    else {
      // 다음 칸이 화면 아래에 걸리면 끌어 올림
      var r = qs[n - 1].getBoundingClientRect(), s = scroll.getBoundingClientRect();
      if (r.bottom > s.bottom - 20 || r.top < s.top) goTo(qs[n - 1], Math.max(20, s.height - r.height - 40) * .35);
    }
  }
  function reset() {
    A = {}; step = 0; busy = false;
    coupon.classList.remove('cut', 'cutting'); hole.classList.remove('on'); scis.classList.remove('done', 'snap');
    scis.style.transform = ''; cutp.style.strokeDashoffset = ''; cutp.setAttribute('d', '');
    qs.forEach(function (q) { q.classList.remove('act', 'wait', 'done', 'skip'); });
    [].forEach.call(coupon.querySelectorAll('.ck.on'), function (b) { b.classList.remove('on'); });
    q3t.textContent = Q3;
  }
  function begin() {
    started = true;
    if (!hookDone) endHook();
  }

  coupon.addEventListener('click', function (e) {
    var b = e.target.closest('.ck'); if (!b || busy) return;
    var q = b.closest('.q'), n = +q.getAttribute('data-q');
    if (!step) {                     // 단추 없이 쿠폰부터 눌렀을 때
      if (n !== 1) return;
      begin(); T.playing(true); T.hit('play', true); setQ(1);
    }
    if (n !== step) return;
    busy = true;
    b.classList.add('on'); q.classList.add('done'); q.classList.remove('act');
    T.sfx('tap'); setTimeout(function () { T.sfx('blip'); }, 160); setTimeout(function () { T.sfx('blip'); }, 330);
    if (n === 1) A = { g: b.getAttribute('data-g') };
    else if (n === 2) A.emp = b.getAttribute('data-v');
    else A.rev = b.getAttribute('data-v');
    T.wait(720).then(function () {
      if (n === 1 && A.g === 'X') {
        qs[1].classList.remove('wait'); qs[2].classList.remove('wait');
        qs[1].classList.add('skip'); T.sfx('swing');
        return T.wait(320).then(function () { qs[2].classList.add('skip'); T.sfx('swing'); return T.wait(800); }).then(cut);
      }
      if (n < 3) { busy = false; setQ(n + 1); return; }
      return cut();
    });
  });

  /* 가위: 점선 둘레를 한 바퀴 */
  function scissors() {
    var w = coupon.offsetWidth, h = coupon.offsetHeight, P = 2 * (w + h);
    cutsvg.setAttribute('viewBox', '-2.5 -2.5 ' + (w + 5) + ' ' + (h + 5));
    cutp.setAttribute('d', 'M0 0H' + w + 'V' + h + 'H0Z');
    cutp.style.strokeDasharray = P; cutp.style.strokeDashoffset = P;
    coupon.classList.add('cutting'); scis.classList.remove('done');
    function at(d) {
      var x, y, a;
      if (d < w) { x = d; y = 0; a = 0; }
      else if (d < w + h) { x = w; y = d - w; a = 90; }
      else if (d < 2 * w + h) { x = w - (d - w - h); y = h; a = 180; }
      else { x = 0; y = h - (d - 2 * w - h); a = 270; }
      scis.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + a + 'deg)';
      cutp.style.strokeDashoffset = P - d;
    }
    return new Promise(function (res) {
      if (T.calm) { at(P - .01); cutp.style.strokeDashoffset = 0; scis.classList.add('done'); return res(); }
      var t0 = performance.now(), D = 1900, last = 0, snap = false;
      (function f(now) {
        var t = Math.min(1, (now - t0) / D), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        at(e * P);
        if (now - last > 120) { last = now; snap = !snap; scis.classList.toggle('snap', snap); if (snap) T.sfx('tap'); }
        if (t < 1) requestAnimationFrame(f); else { scis.classList.add('done'); res(); }
      })(t0);
    });
  }
  function cut() {
    busy = true; step = 0;
    qs.forEach(function (q) { q.classList.remove('act', 'wait'); });
    var s = scroll.getBoundingClientRect(), r = coupon.getBoundingClientRect();
    goTo(coupon, r.height < s.height ? (s.height - r.height) / 2 : 40);
    return T.wait(520).then(scissors)
      .then(function () { coupon.classList.add('cut'); coupon.classList.remove('cutting'); hole.classList.add('on'); T.sfx('swing'); return T.wait(160); })
      .then(function () { T.sfx('win'); return T.wait(820); })
      .then(function () {
        busy = false;
        T.result(A, { eye: '우리 가게 기장료, 나왔다', again: '쿠폰 다시 쓰기', onAgain: again });
      });
  }
  function again() { reset(); T.playing(true); setTimeout(function () { setQ(1); }, T.calm ? 0 : 200); }

  T.onPlay = function () {
    begin(); reset();
    setTimeout(function () { setQ(1); }, T.calm ? 0 : 200);
  };

  hook();
})();
