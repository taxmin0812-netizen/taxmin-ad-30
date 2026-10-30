/* 30 비포·애프터 — 영수증 세 장을 정리할 때마다 가운데 선이 밀려 밤이 밝아짐 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), scene = $('scene'), pile = $('pile'), slip = $('slip'), knob = $('knob'), knobN = $('knob-n');
  var badge = $('badge'), hl = $('hl'), clk = $('clk'), dark = $('dark'), light = $('light');
  var X = [50, 38, 28, 0], TIME = [['D', '1'], ['D', '1'], ['D', '1']], LIT = [0, .35, .7, 1];
  var RC = [[2, 4, 36, 26, -14], [30, 0, 30, 44, 9], [4, 38, 40, 24, 6], [36, 30, 30, 34, -20], [0, 64, 36, 26, 18], [30, 66, 36, 22, -6], [55, 6, 24, 40, 24], [0, 0, 26, 20, -26],
    [18, 24, 32, 28, 4], [62, 44, 28, 32, -10], [52, 70, 32, 22, 12], [12, 50, 30, 22, -8]];

  function buildPile(anim) {
    pile.innerHTML = RC.map(function (r, i) {
      return '<i style="left:' + r[0] + '%;top:' + r[1] + '%;width:' + r[2] + '%;height:' + r[3] + '%;transform:rotate(' + r[4] + 'deg);--d:' + (i * .08).toFixed(2) + 's"></i>';
    }).join('');
    pile.classList.toggle('drop', !!anim);
  }
  function setX(p, instant) {
    if (instant) scene.classList.add('noanim');
    scene.style.setProperty('--x', p + '%');
    if (instant) { void scene.offsetWidth; scene.classList.remove('noanim'); }
  }
  function setLit(v) { scene.style.setProperty('--lit', v); }
  function setClock(t, roll) {
    var s = clk.querySelectorAll('span');
    if (!roll || T.calm || !s[0].animate) { s[0].textContent = t[0]; s[1].textContent = t[1]; return; }
    [0, 1].forEach(function (k) {
      if (s[k].textContent === t[k]) return;
      var a = s[k].animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-60%)', opacity: 0 }], { duration: 160, easing: 'ease-in' });
      a.onfinish = function () { s[k].textContent = t[k]; s[k].animate([{ transform: 'translateY(60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, easing: 'ease-out' }); };
    });
  }

  /* ── 첫 화면 ── */
  var hookDone = false, started = false, busy = false, step = 0, A = {};
  function hookEnd() {
    pile.classList.remove('drop'); setX(50, true); scene.classList.remove('hid'); setClock(TIME[0]);
    hl.classList.add('on'); badge.classList.add('on'); hookDone = true;
  }
  function hook() {
    buildPile(!T.calm);
    if (T.calm) { hookEnd(); return; }
    setX(100, true); scene.classList.add('hid'); setClock(['D', '4']);
    var cap = dark.querySelector('.cap'); cap.classList.add('pop');
    [0, 1, 2, 3].forEach(function (k) { setTimeout(function () { if (!started) T.sfx('thud'); }, 150 + k * 240); });
    T.wait(300).then(function () { if (started) throw 0; setClock(['D', '3'], 1); return T.wait(350); })
      .then(function () { if (started) throw 0; setClock(['D', '2'], 1); return T.wait(350); })
      .then(function () { if (started) throw 0; setClock(['D', '1'], 1); T.sfx('error'); return T.wait(500); })
      .then(function () { if (started) throw 0; scene.classList.remove('hid'); setX(50); T.sfx('swing'); light.querySelector('.cap').classList.add('pop'); return T.wait(900); })
      .then(function () { if (started) throw 0; hl.classList.add('on'); T.sfx('select'); return T.wait(1000); })
      .then(function () { if (started) throw 0; badge.classList.add('on'); T.sfx('coin'); hookDone = true; })
      .catch(function () { });
  }

  /* ── 영수증(질문) ── */
  var GO = '<span class="go"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M9 2 4 7l5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  var Q = [
    { q: function () { return '어떤 일을 하세요?'; }, ops: [['A', '도소매 · 온라인 판매'], ['B', '음식점 · 카페 · 제조'], ['C', '서비스 · 프리랜서 · 학원'], ['?', '그 밖의 업종']],
      mini: [['P', '전문직이에요', '의료·법률·세무 등'], ['X', '법인사업자예요']] },
    { q: function () { return '4대보험 직원은 몇 명이에요?'; }, ops: [['few', '없음 ~ 5명'], ['many', '6명 이상']] },
    { q: function () { return T.revQ(A.g); }, ops: [['low', '이하예요', '올해 시작했어도 이쪽'], ['high', '넘어요']], mini: [['unk', '잘 모르겠어요']] }
  ];
  var KEY = ['g', 'emp', 'rev'];
  function slipHTML(i) {
    var S = Q[i], n = 0;
    var ops = S.ops.map(function (o) { n++; return '<button class="stub" type="button" data-v="' + o[0] + '"><span class="no">0' + n + '</span><span class="tx">' + T.esc(o[1]) + (o[2] ? '<small>' + T.esc(o[2]) + '</small>' : '') + '</span>' + GO + '</button>'; }).join('');
    var mini = S.mini ? '<p class="smr">' + S.mini.map(function (o) { return '<button class="mini" type="button" data-v="' + o[0] + '">' + T.esc(o[1]) + (o[2] ? '<small>' + T.esc(o[2]) + '</small>' : '') + '</button>'; }).join('') + '</p>' : '';
    return '<div class="paper"><p class="sh"><span>RECEIPT ' + (i + 1) + '/3</span><span>' + TIME[i][0] + ':' + TIME[i][1] + '</span></p>' +
      '<h2 class="sq">' + T.esc(S.q()) + '</h2><div class="stubs' + (S.ops.length === 2 ? ' two' : '') + '">' + ops + '</div>' + mini +
      '<p class="sf">- - - - 영수증 ' + (i + 1) + ' / 3 - - - -</p></div>';
  }
  function placeSlip(i) {
    var W = scene.clientWidth, w = slip.offsetWidth, x = W * X[i] / 100;
    slip.style.left = Math.max(14, Math.min(W - 14 - w, x - w / 2)) + 'px';
  }
  function showSlip(i) {
    step = i; slip.innerHTML = slipHTML(i); slip.hidden = false; slip.classList.remove('out', 'print'); placeSlip(i);
    void slip.offsetWidth; slip.classList.add('print');
    if (!T.calm) [0, 1, 2, 3, 4].forEach(function (k) { setTimeout(function () { T.sfx('blip'); }, k * 110); });
    return T.wait(700).then(function () { busy = false; var b = slip.querySelector('.stub'); if (b) b.focus({ preventScroll: true }); });
  }
  function rel(node) { var s = scene.getBoundingClientRect(), r = node.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; }
  function fly(text, from, delay) {
    var k = rel(knob), f = document.createElement('p'); f.className = 'flyer'; f.textContent = text;
    f.style.left = from.x + 'px'; f.style.top = from.y + 'px'; scene.appendChild(f);
    var dx = k.x + k.w / 2 - from.x - f.offsetWidth / 2, dy = k.y + k.h / 2 - from.y - f.offsetHeight / 2;
    if (T.calm || !f.animate) { f.remove(); return; }
    var a = f.animate([{ transform: 'rotate(-3deg)', opacity: 1 }, { transform: 'translate(' + dx * .55 + 'px,' + (dy * .55 - 40) + 'px) rotate(8deg) scale(.8)', opacity: 1, offset: .55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(18deg) scale(.12)', opacity: 0 }], { duration: 620, delay: delay || 0, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'both' });
    a.onfinish = function () { f.remove(); };
  }
  function sweepPile(n) {
    var left = [].slice.call(pile.querySelectorAll('i:not(.gone)'));
    left.slice(-n).forEach(function (r, j) {
      var p = rel(r); r.classList.add('gone'); r.style.visibility = 'hidden';
      fly('영수증', { x: p.x + p.w / 2 - 30, y: p.y + p.h / 2 - 14 }, 120 + j * 90);
    });
  }
  function choose(b) {
    var i = step, v = b.getAttribute('data-v'); busy = true; A[KEY[i]] = v;
    b.classList.add('tear'); T.sfx('swing');
    var p = rel(b), txt = b.querySelector('.tx') ? b.querySelector('.tx').firstChild.textContent : b.firstChild.textContent;
    return T.wait(320).then(function () {
      fly(txt, { x: p.x + 12, y: p.y + 10 }); b.style.visibility = 'hidden'; slip.classList.add('out');
      sweepPile(i === 2 || v === 'X' ? 12 : 4);
      return T.wait(600);
    }).then(function () {
      T.sfx('coin'); knob.classList.remove('gulp', 'pull'); void knob.offsetWidth; knob.classList.add('gulp', 'pull');
      var nx = v === 'X' ? 3 : i + 1; knobN.textContent = nx + '/3';
      setX(X[nx]); setLit(LIT[nx]); if (nx < 3) setClock(TIME[nx], 1);
      T.sfx('power');
      return T.wait(1050);
    }).then(function () {
      slip.hidden = true;
      if (v === 'X' || i === 2) return finale();
      return showSlip(i + 1);
    });
  }
  function finale() {
    scene.classList.add('end'); T.sfx('win'); T.confetti(stage, 44, ['#FF5B2E', '#FFB27A', '#FFE7CF', '#2B3A67', '#ffffff']);
    return T.wait(1700).then(function () {
      busy = false;
      T.result(A, { eye: '정리 끝, 신고 준비 끝', again: '다시 바꿔 보기', onAgain: restart });
    });
  }
  function reset() {
    A = {}; scene.classList.remove('end'); setX(X[0], true); setLit(0); buildPile(false); setClock(TIME[0]); knobN.textContent = '0/3';
  }
  function restart() { T.playing(true); reset(); busy = true; T.wait(300).then(function () { showSlip(0); }); }

  slip.addEventListener('click', function (e) {
    var b = e.target.closest('.stub, .mini'); if (!b || busy || slip.classList.contains('out')) return;
    choose(b);
  });
  addEventListener('resize', function () { if (!slip.hidden) placeSlip(step); });

  T.onPlay = function () {
    started = true; if (busy) return;
    if (!hookDone) hookEnd();
    busy = true; stage.classList.add('play'); reset();
    T.wait(T.calm ? 0 : 700).then(function () { showSlip(0); });
  };
  hook();
})();
