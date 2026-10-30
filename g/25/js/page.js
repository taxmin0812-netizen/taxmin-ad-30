/* 25 영입 — 첫 화면: 번쩍 HERE WE GO! → 유니폼이 돌며 등판 '세무사 5' → 우리 가게, 세무사 영입 확정 → 연봉 말고 월 5만원부터 + OFFICIAL
   놀이: 선수 영입 계약서 — 제1조 포지션(업종) · 제2조 스쿼드 인원(직원) · 제3조 연봉 등급(매출)에 형광펜 → 서명 → OFFICIAL 도장 → 기장료 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), hook = $('hook'), bulbs = $('bulbs'), ct = $('ct'), paper = $('paper'), sign = $('sign');

  /* ── 사진기자 플래시 ── */
  var timer = null;
  function bulb(n) {
    if (T.calm) return;
    for (var i = 0; i < (n || 1); i++) {
      var b = document.createElement('i');
      b.style.left = (4 + Math.random() * 92) + '%';
      b.style.top = (Math.random() < .5 ? 4 + Math.random() * 26 : 50 + Math.random() * 34) + '%';
      b.style.setProperty('--s', (.5 + Math.random() * .9).toFixed(2));
      b.style.animationDelay = (Math.random() * .3).toFixed(2) + 's';
      bulbs.appendChild(b);
      setTimeout(b.remove.bind(b), 1000);
    }
  }
  function flashes(on) {
    clearInterval(timer); timer = null;
    if (on && !T.calm) timer = setInterval(function () { if (!document.hidden) bulb(1 + (Math.random() * 2 | 0)); }, 650);
  }

  /* ── 첫 화면 ── */
  var run = 0, started = false;
  function hookPlay() {
    var id = ++run;
    function alive() { if (id !== run || started) throw 0; }
    if (T.calm) { hook.className = 'hook s1 s2 s2b s3 s4 done'; return; }
    hook.className = 'hook';
    T.wait(350)
      .then(function () { alive(); hook.classList.add('s1'); T.flash(stage); T.shake(stage); T.sfx('boom'); bulb(7); flashes(true); return T.wait(1300); })
      .then(function () { alive(); hook.classList.add('s2'); T.sfx('swing'); return T.wait(1350); })
      .then(function () { alive(); hook.classList.add('s2b'); T.sfx('select'); return T.wait(1500); })
      .then(function () { alive(); hook.classList.add('s3'); T.sfx('coin'); return T.wait(500); })
      .then(function () { alive(); hook.classList.add('s4'); T.sfx('hit'); T.shake(stage); bulb(5); return T.wait(500); })
      .then(function () { alive(); hook.classList.add('done'); })
      .catch(function () { });
  }

  /* ── 계약 협상 ── */
  var NAME = {
    A: '도소매 · 온라인', B: '음식점 · 카페 · 제조', C: '서비스 · 프리랜서 · 학원', '?': '그 밖의 업종', P: '전문직', X: '법인사업자',
    few: '없음 ~ 5명', many: '6명 이상', low: '기준 이하', high: '기준 넘음', unk: '잘 모름'
  };
  var A = {}, step = 1, busy = false;
  function clause(n) { return paper.querySelector('.cl[data-cl="' + n + '"]'); }
  function each(sel, f) { [].forEach.call(paper.querySelectorAll(sel), f); }
  function into(node) { setTimeout(function () { if (node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: T.calm ? 'auto' : 'smooth' }); }, 80); }
  function setOn(n) {
    step = n; var c = clause(n);
    if (n === 3) $('rev-q').textContent = T.revQ(A.g);
    c.classList.add('on'); into(c);
  }
  function reset() {
    A = {}; busy = false;
    each('.cl', function (c) { c.classList.remove('on', 'done', 'na'); c.querySelector('.cl-a').textContent = ''; });
    each('.pick, .no', function (b) { b.classList.remove('pick', 'no'); });
    sign.classList.remove('signed', 'sealed'); paper.classList.remove('final'); paper.scrollTop = 0;
    setOn(1);
  }
  function mark(btn, val) {
    var c = clause(step);
    btn.classList.add('pick');
    [].forEach.call(c.querySelectorAll('button'), function (b) { if (b !== btn) b.classList.add('no'); });
    T.sfx('swing');
    return T.wait(750).then(function () {
      c.querySelector('.cl-a').textContent = NAME[val]; c.classList.remove('on'); c.classList.add('done'); T.sfx('tap');
      return T.wait(220);
    });
  }
  function seal() {
    paper.classList.add('final'); into(sign);
    return T.wait(450)
      .then(function () { sign.classList.add('signed'); T.sfx('swing'); return T.wait(1150); })
      .then(function () {
        sign.classList.add('sealed'); T.sfx('hit'); T.shake(stage); T.flash(stage); bulb(9);
        T.confetti(stage, 54, ['#C6FF3D', '#FF6A35', '#FFFFFF', '#C6FF3D']);
        return T.wait(1500);
      })
      .then(function () {
        busy = false;
        T.result(A.g === 'X' ? { g: 'X' } : A, { eye: '영입 완료! 계약 끝', again: '계약서 다시 쓰기', onAgain: again });
      });
  }
  paper.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || busy) return;
    var c = b.closest('.cl'); if (!c || +c.getAttribute('data-cl') !== step) return;
    busy = true;
    if (step === 1) {
      A = { g: b.getAttribute('data-g') };
      mark(b, A.g).then(function () {
        if (A.g !== 'X') { busy = false; setOn(2); return; }
        [2, 3].forEach(function (n) { var x = clause(n); x.classList.add('na'); x.querySelector('.cl-a').textContent = '법인은 따로'; });
        return seal();
      });
    } else if (step === 2) {
      A.emp = b.getAttribute('data-v');
      mark(b, A.emp).then(function () { busy = false; setOn(3); });
    } else {
      A.rev = b.getAttribute('data-v');
      mark(b, A.rev).then(seal);
    }
  });
  $('ct-re').addEventListener('click', function () { if (busy) return; T.sfx('tap'); reset(); });

  function again() { T.playing(true); reset(); }
  T.onPlay = function () {
    started = true; run++; flashes(false);
    hook.classList.add('gone');
    ct.hidden = false; reset();
    requestAnimationFrame(function () { requestAnimationFrame(function () { ct.classList.add('in'); T.sfx('thud'); }); });
  };

  hookPlay();
})();
