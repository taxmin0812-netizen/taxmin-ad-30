/* 28 탑승권 — 첫 화면: 비행기가 지나가며 '이번 달부터, 장부 없는 노선.' → 출발 안내판 촤르륵 '세무사행' → 탑승권 '월 5만원부터'
   놀이: 셀프 체크인 ① 노선 지도(업종) ② 동반 승객(직원) ③ 좌석(매출) → 탑승권 인쇄 → 이륙 → 기장료 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage');
  var plane = $('plane'), trail = $('trail'), hl = $('hl'), fids = $('fids'), pass = $('pass');
  var flapCells = [].slice.call(document.querySelectorAll('#flaps i'));
  var started = false;

  /* ── 출발 안내판 ── */
  var POOL = '가나다라마바사아자차카타파하노선장부세무혼행출발탑승';
  var TARGET = '세무사행';
  function flipCell(cell, ch, n) {
    var b = cell.querySelector('b');
    return new Promise(function (res) {
      if (T.calm) { b.textContent = ch; cell.classList.add('hit'); return res(); }
      var k = 0;
      (function f() {
        if (k++ < n) {
          b.textContent = POOL.charAt(Math.floor(Math.random() * POOL.length));
          cell.classList.remove('f'); void cell.offsetWidth; cell.classList.add('f');
          if (k % 2) T.sfx('blip');
          setTimeout(f, 62);
        } else { b.textContent = ch; cell.classList.remove('f'); void cell.offsetWidth; cell.classList.add('f', 'hit'); res(); }
      })();
    });
  }
  function board() { return Promise.all(flapCells.map(function (c, i) { return T.wait(i * 110).then(function () { return flipCell(c, TARGET.charAt(i), 9 + i * 2); }); })); }

  /* ── 첫 화면 ── */
  function endHook() {
    plane.classList.remove('fly'); plane.classList.add('idle'); hl.classList.add('on'); fids.classList.add('on'); pass.classList.add('on');
    flapCells.forEach(function (c, i) { c.querySelector('b').textContent = TARGET.charAt(i); c.classList.add('hit'); });
  }
  function hook() {
    if (T.calm) { endHook(); return; }
    function chk() { if (started) throw 0; }
    plane.classList.add('fly'); T.sfx('throw');
    T.wait(250).then(function () { chk(); trail.classList.add('on'); hl.classList.add('on'); return T.wait(1500); })
      .then(function () { chk(); plane.classList.remove('fly'); plane.classList.add('idle'); fids.classList.add('on'); T.sfx('tap'); return T.wait(350); })
      .then(function () { chk(); return board(); })
      .then(function () { chk(); T.sfx('select'); return T.wait(700); })
      .then(function () { chk(); pass.classList.add('on'); T.sfx('swing'); return T.wait(500); })
      .then(function () { chk(); T.sfx('coin'); })
      .catch(function () { });
  }

  /* ── 셀프 체크인 ── */
  var ks = $('ks'), kq = $('kq'), map = $('map'), mini = $('mini'), tk = $('tk'), jet = $('jet');
  var prog = [].slice.call(document.querySelectorAll('#prog li'));
  var A = {}, step = 0, busy = false;
  var Q = { 1: '어떤 일을 하세요?', 2: '4대보험 직원은 몇 명이에요?' };
  var CODE = { A: 'SHP', B: 'EAT', C: 'SVC', '?': 'ETC', P: 'PRO', X: 'CORP' };
  function setStep(n) {
    step = n;
    prog.forEach(function (li, i) { li.classList.toggle('cur', i + 1 === n); li.classList.toggle('ok', i + 1 < n); });
    if (n <= 3) { kq.textContent = n === 3 ? T.revQ(A.g) : Q[n]; kq.classList.remove('pop'); void kq.offsetWidth; kq.classList.add('pop'); }
    [].forEach.call(ks.querySelectorAll('.pg'), function (p) {
      var on = +p.getAttribute('data-st') === n; p.hidden = !on; p.classList.remove('on');
      if (on) {
        [].forEach.call(p.querySelectorAll('.pick,.dim,.go,.me'), function (x) { x.classList.remove('pick', 'dim', 'go', 'me'); });
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.classList.add('on'); }); });
      }
    });
    busy = false;
  }

  /* 노선 따라 작은 비행기 */
  function flyRoute(g) {
    var path = map.querySelector('.routes path[data-to="' + g + '"]');
    [].forEach.call(map.querySelectorAll('.routes path'), function (p) { p.classList.toggle('go', p === path); p.classList.toggle('dim', p !== path); });
    if (T.calm || !path) return Promise.resolve();
    var W = map.clientWidth, H = map.clientHeight, L = path.getTotalLength(), mw = mini.getBoundingClientRect().width || 38;
    function pt(l) { var p = path.getPointAtLength(Math.max(0, Math.min(L, l))); return { x: p.x / 100 * W, y: p.y / 100 * H }; }
    mini.style.opacity = 1; T.sfx('throw');
    return new Promise(function (res) {
      var t0 = performance.now(), dur = 900;
      (function f(now) {
        var t = Math.min(1, (now - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var a = pt(e * L), b = pt(e * L + 1), ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        mini.style.transform = 'translate(' + (a.x - mw / 2) + 'px,' + (a.y - mw * .2) + 'px) rotate(' + ang + 'deg)';
        if (t < 1) requestAnimationFrame(f); else { T.sfx('coin'); setTimeout(function () { mini.style.opacity = 0; res(); }, 250); }
      })(t0);
    });
  }

  function printAndFly() {
    busy = true;
    prog.forEach(function (li) { li.classList.remove('cur'); li.classList.add('ok'); });
    kq.textContent = '체크인 완료'; kq.classList.remove('pop'); void kq.offsetWidth; kq.classList.add('pop');
    $('tk-r').textContent = CODE[A.g] || 'ETC';
    $('tk-p').textContent = A.g === 'X' ? '-' : A.emp === 'many' ? '6+' : '0~5';
    $('tk-s').textContent = A.g === 'X' ? 'FREE' : A.rev === 'high' ? '2A' : A.rev === 'low' ? '23C' : 'OPEN';
    setStep(4);
    var tkh = Math.round(Math.min(stage.clientHeight * .3, 250));
    stage.style.setProperty('--tkh', tkh + 'px');
    return T.wait(500).then(function () { ks.classList.add('up'); return T.wait(650); })
      .then(function () {
        tk.classList.add('out');
        if (!T.calm) { var k = 0, iv = setInterval(function () { T.sfx('tap'); if (++k >= 8) clearInterval(iv); }, 170); }
        return T.wait(1500);
      })
      .then(function () { $('prt-t').textContent = '좋은 비행 되세요'; T.sfx('select'); return T.wait(700); })
      .then(function () {
        ks.classList.remove('up'); ks.classList.add('away'); stage.classList.add('lift');
        return T.wait(400);
      })
      .then(function () {
        jet.classList.remove('go'); void jet.getBoundingClientRect(); jet.classList.add('go'); T.sfx('power');
        return T.wait(800);
      })
      .then(function () { T.confetti(stage, 36, ['#FFFFFF', '#FF5B2E', '#0F6B7A', '#FFC93C', '#7CC6E8']); return T.stamp(stage, '이륙!', A.g === 'X' ? '법인 노선' : '세무사행', 950); })
      .then(function () {
        T.result(A, { eye: '탑승 완료 · 세무사행', again: '다른 노선으로 다시', onAgain: restart, art: plane.outerHTML.replace('class="plane', 'class="plane-s').replace(/ id="plane"/, '').replace('#fff', '#FF5B2E') });
        busy = false;
      });
  }

  ks.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-g],button[data-v]'); if (!b || busy || !step) return;
    busy = true; T.sfx('select');
    if (b.hasAttribute('data-g')) {
      A = { g: b.getAttribute('data-g') };
      if (b.classList.contains('dst')) {
        b.classList.add('pick'); [].forEach.call(map.querySelectorAll('.dst'), function (d) { if (d !== b) d.classList.add('dim'); });
        flyRoute(A.g).then(function () { return T.wait(250); }).then(function () { setStep(2); });
      } else {
        b.classList.add('pick');
        T.wait(350).then(function () { if (A.g === 'X') return printAndFly(); setStep(2); });
      }
    } else if (step === 2) {
      A.emp = b.getAttribute('data-v'); b.classList.add('pick');
      [].forEach.call(ks.querySelectorAll('.pax'), function (p) { if (p !== b) p.classList.add('dim'); });
      T.wait(800).then(function () { setStep(3); });
    } else if (step === 3) {
      A.rev = b.getAttribute('data-v'); b.classList.add('pick');
      var sec = A.rev === 'high' ? ks.querySelector('.sec.biz') : A.rev === 'low' ? ks.querySelector('.sec.eco') : null;
      [].forEach.call(ks.querySelectorAll('.sec'), function (s) { if (s !== sec) s.classList.add('dim'); });
      if (sec) { var seats = sec.querySelectorAll('.seats i'); seats[A.rev === 'high' ? 0 : seats.length - 4].classList.add('me'); T.sfx('coin'); }
      T.wait(900).then(printAndFly);
    }
  });

  function reset() {
    A = {}; tk.classList.remove('out'); ks.classList.remove('up', 'away'); stage.classList.remove('lift'); jet.classList.remove('go');
    $('prt-t').textContent = '탑승권을 뽑고 있어요'; mini.style.opacity = 0;
  }
  function restart() { reset(); T.playing(true); requestAnimationFrame(function () { ks.classList.add('on'); }); setStep(1); }

  T.onPlay = function () {
    started = true; reset();
    if (!stage.classList.contains('play')) {
      endHook(); stage.classList.add('play'); ks.hidden = false;
      T.wait(300).then(function () { requestAnimationFrame(function () { ks.classList.add('on'); }); T.sfx('tap'); setStep(1); });
    } else setStep(1);
  };

  hook();
})();
