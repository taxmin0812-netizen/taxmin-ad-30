/* 26 청첩장 — 첫 화면: 봉투가 놓임 → 밀랍 봉인이 톡 깨짐 → 카드가 스르륵 → 사장님 & 세무사, 저희 함께합니다 → 매달 월 5만원부터
   놀이: 청첩장을 뒤집으면 참석 회신 카드 — 금박 테두리 선택지로 세 가지(업종 · 직원 · 매출), 고를 때마다 금빛 반짝임 → '함께하겠습니다' 도장 · 꽃잎 → 기장료 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), scene = $('scene'), rsvp = $('rsvp'), petals = $('petals'), dust = $('dust');

  function each(list, f) { [].forEach.call(list, f); }
  function add(c) { scene.classList.add(c); }

  /* ── 금빛 먼지 ── */
  if (!T.calm) {
    for (var i = 0; i < 16; i++) {
      var d = document.createElement('i');
      d.style.left = (4 + Math.random() * 92) + '%'; d.style.top = (6 + Math.random() * 80) + '%';
      d.style.setProperty('--z', (2 + Math.random() * 3.5).toFixed(1) + 'px');
      d.style.setProperty('--d', (4.5 + Math.random() * 4).toFixed(1) + 's');
      d.style.setProperty('--dl', (Math.random() * 5).toFixed(1) + 's');
      dust.appendChild(d);
    }
  }

  /* ── 첫 화면 ── */
  var run = 0, started = false, FINAL = 'land crack open rise out price';
  function hookPlay() {
    var id = ++run;
    function alive() { if (id !== run || started) throw 0; }
    if (T.calm) { scene.className = 'scene calm ' + FINAL; return; }
    scene.className = 'scene';
    T.wait(250)
      .then(function () { alive(); add('land'); T.sfx('thud'); return T.wait(1350); })
      .then(function () { alive(); add('tap'); T.sfx('tap'); return T.wait(420); })
      .then(function () { alive(); add('crack'); T.sfx('hit'); return T.wait(420); })
      .then(function () { alive(); add('open'); T.sfx('swing'); return T.wait(700); })
      .then(function () { alive(); add('rise'); T.sfx('throw'); return T.wait(1500); })
      .then(function () { alive(); add('out'); return T.wait(1100); })
      .then(function () { alive(); add('price'); T.sfx('coin'); })
      .catch(function () { });
  }

  /* ── 참석 회신 카드 ── */
  var A = {}, step = 1, busy = false;
  function q(n) { return rsvp.querySelector('.rs-q[data-q="' + n + '"]'); }
  function dots(n) { each($('rs-dots').children, function (li, k) { li.classList.toggle('on', k === n - 1); li.classList.toggle('ok', k < n - 1); }); }
  function show(n) {
    step = n;
    [1, 2, 3].forEach(function (k) { var e = q(k); e.hidden = k !== n; e.classList.remove('leave', 'enter'); });
    if (n === 3) $('rev-q').textContent = T.revQ(A.g);
    dots(n);
    var e = q(n); void e.offsetWidth; e.classList.add('enter');
  }
  function reset() {
    A = {}; busy = false;
    each(rsvp.querySelectorAll('.pick, .no'), function (b) { b.classList.remove('pick', 'no'); });
    var end = $('rs-end'); end.hidden = true; end.classList.remove('on'); $('rs-re').hidden = false;
    show(1);
  }
  function sparkle(btn) {
    if (T.calm) return;
    for (var k = 0; k < 14; k++) {
      var s = document.createElement('i'), a = (k / 14) * Math.PI * 2 + Math.random() * .4, r = 46 + Math.random() * 70;
      s.className = 'spk';
      s.style.setProperty('--dx', (Math.cos(a) * r * 1.6).toFixed(0) + 'px'); s.style.setProperty('--dy', (Math.sin(a) * r * .7).toFixed(0) + 'px');
      s.style.setProperty('--z', (8 + Math.random() * 10).toFixed(0) + 'px'); s.style.animationDelay = (Math.random() * .12).toFixed(2) + 's';
      btn.appendChild(s); setTimeout(s.remove.bind(s), 1100);
    }
  }
  function choose(btn) {
    var cur = q(step);
    btn.classList.add('pick');
    each(cur.querySelectorAll('button'), function (b) { if (b !== btn) b.classList.add('no'); });
    sparkle(btn); T.sfx('select');
    return T.wait(800).then(function () { cur.classList.add('leave'); return T.wait(330); });
  }
  function petalRain() {
    if (T.calm) return;
    var C = ['#F4CFCB', '#FBE7DF', '#F6B9A3', '#EED6A6', '#FFF6EE', '#F2C4C0'];
    for (var k = 0; k < 38; k++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--c', C[k % C.length]); p.style.setProperty('--z', (10 + Math.random() * 10).toFixed(0) + 'px');
      p.style.setProperty('--d', (3.2 + Math.random() * 2.4).toFixed(1) + 's'); p.style.setProperty('--dl', (Math.random() * 1.2).toFixed(2) + 's');
      petals.appendChild(p);
    }
    setTimeout(function () { petals.innerHTML = ''; }, 7200);
  }
  function finish() {
    [1, 2, 3].forEach(function (k) { q(k).hidden = true; });
    $('rs-re').hidden = true; dots(4);
    var end = $('rs-end'); end.hidden = false;
    return T.wait(60)
      .then(function () { end.classList.add('on'); petalRain(); return T.wait(350); })
      .then(function () { T.sfx('hit'); return T.wait(450); })
      .then(function () { T.sfx('win'); return T.wait(1500); })
      .then(function () {
        busy = false;
        T.result(A.g === 'X' ? { g: 'X' } : A, { eye: 'R.S.V.P. 함께하겠습니다', again: '회신 카드 다시 쓰기', onAgain: again });
      });
  }
  rsvp.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || busy) return;
    if (b.id === 'rs-re') { T.sfx('tap'); reset(); return; }
    var cur = b.closest('.rs-q'); if (!cur || +cur.getAttribute('data-q') !== step) return;
    busy = true;
    if (step === 1) {
      A = { g: b.getAttribute('data-g') };
      choose(b).then(function () { if (A.g === 'X') return finish(); busy = false; show(2); });
    } else if (step === 2) {
      A.emp = b.getAttribute('data-v');
      choose(b).then(function () { busy = false; show(3); });
    } else {
      A.rev = b.getAttribute('data-v');
      choose(b).then(finish);
    }
  });

  function again() { T.playing(true); reset(); }
  T.onPlay = function () {
    started = true; run++;
    scene.className = 'scene ' + FINAL + ' play' + (T.calm ? ' calm' : '');
    reset();
    T.wait(60).then(function () { add('flip'); T.sfx('swing'); });
  };

  hookPlay();
})();
