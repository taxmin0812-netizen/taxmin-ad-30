/* 택스민 모션그래픽 엔진(mg.js) — 시간(초) 하나를 넣으면 모든 요소의 상태가 정해짐
   · 되감기·건너뛰기·광고 영상 캡처가 언제나 같은 그림을 냄(재생 중 상태를 쌓지 않음)
   · 쓰는 법: var tl = new MG(); tl.to(el, 시작초, 길이초, {x:[0,40], o:[0,1]}, 'out5'); … tl.seek(t)
   · 속성: x·y(px) yp(자기 높이 %) s·sx·sy(배율) r(도) o(불투명) draw(선 그리기 0~1, pathLength=1 인 선) blur(px) cl(왼쪽→오른쪽 드러냄 0~1)
   · 붙이기: tl.pin(el, fn) — fn(t) 가 [x, y, 배율] 을 주면 그 점에 붙어 따라감(null 이면 숨김)
   · 매 프레임 직접 그리기: tl.each(function (t) { … }) */
(function (w) {
  'use strict';
  var E = {
    lin: function (t) { return t; },
    in3: function (t) { return t * t * t; },
    out3: function (t) { return 1 - Math.pow(1 - t, 3); },
    out5: function (t) { return 1 - Math.pow(1 - t, 5); },
    io: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    back: function (t) { var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    spring: function (t) { return t >= 1 ? 1 : 1 - Math.exp(-6.5 * t) * Math.cos(11 * t); },
    drop: function (t) {   // 떨어져서 두 번 통통(눈송이·점 내려앉기)
      var n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; }
      if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
      t -= 2.625 / d; return n * t * t + 0.984375;
    }
  };
  var TF = { x: 1, y: 1, yp: 1, s: 1, sx: 1, sy: 1, r: 1 };
  var DEF = { x: 0, y: 0, yp: 0, s: 1, sx: 1, sy: 1, r: 0, o: 1, draw: 1, blur: 0, cl: 1 };

  function MG() { this.rs = []; this.fx = []; }
  MG.E = E;

  MG.prototype._rec = function (el) {
    if (!el.__mg) { el.__mg = { el: el, p: {}, pin: null, last: {} }; this.rs.push(el.__mg); }
    return el.__mg;
  };
  MG.prototype.to = function (el, t0, d, props, ease) {
    if (!el) return this;
    var r = this._rec(el), e = typeof ease === 'function' ? ease : (E[ease || 'out3'] || E.out3);
    for (var k in props) {
      var v = props[k], seg = { t0: t0, d: Math.max(d, 1e-4), a: v[0], b: v[1], e: e };
      var arr = r.p[k] || (r.p[k] = []);
      arr.push(seg); arr.sort(function (p, q) { return p.t0 - q.t0; });
      if (k === 'draw' && !r.dash) { r.dash = 1; el.setAttribute('pathLength', '1'); el.style.strokeDasharray = '1 1'; }
    }
    return this;
  };
  // 한순간에 값 바꾸기
  MG.prototype.at = function (el, t0, props) {
    var p = {}; for (var k in props) p[k] = [props[k], props[k]];
    return this.to(el, t0, 1e-4, p, 'lin');
  };
  MG.prototype.pin = function (el, fn) { this._rec(el).pin = fn; return this; };
  MG.prototype.each = function (fn) { this.fx.push(fn); return this; };

  function val(arr, t) {
    var v = arr[0].a;
    for (var i = 0; i < arr.length; i++) {
      var s = arr[i];
      if (t < s.t0) break;
      var u = (t - s.t0) / s.d; u = u > 1 ? 1 : u;
      v = s.a + (s.b - s.a) * s.e(u);
    }
    return v;
  }

  MG.prototype.seek = function (t) {
    for (var i = 0; i < this.rs.length; i++) {
      var r = this.rs[i], el = r.el, st = el.style, v = {};
      for (var k in r.p) v[k] = val(r.p[k], t);
      var pin = r.pin ? r.pin(t) : 0;
      if (r.pin && !pin) { if (r.last.vis !== 0) { st.visibility = 'hidden'; r.last.vis = 0; } continue; }
      if (r.last.vis === 0 && pin) { st.visibility = ''; r.last.vis = 1; }
      var hasTf = !!pin;
      for (k in v) if (TF[k]) { hasTf = true; break; }
      if (hasTf) {
        var g = function (n) { return n in v ? v[n] : DEF[n]; };
        var tf = '';
        if (pin) tf += 'translate(' + pin[0].toFixed(2) + 'px,' + pin[1].toFixed(2) + 'px) scale(' + pin[2].toFixed(4) + ') ';
        tf += 'translate(' + g('x').toFixed(2) + 'px,' + g('y').toFixed(2) + 'px)';
        if ('yp' in v) tf += ' translateY(' + v.yp.toFixed(2) + '%)';
        if ('r' in v) tf += ' rotate(' + v.r.toFixed(2) + 'deg)';
        var sx = g('s') * g('sx'), sy = g('s') * g('sy');
        if (sx !== 1 || sy !== 1) tf += ' scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
        if (tf !== r.last.tf) { st.transform = tf; r.last.tf = tf; }
      }
      if ('o' in v) { var o = Math.max(0, Math.min(1, v.o)).toFixed(3); if (o !== r.last.o) { st.opacity = o; r.last.o = o; } }
      if ('draw' in v) { var dr = (1 - Math.max(0, Math.min(1, v.draw))).toFixed(4); if (dr !== r.last.dr) { st.strokeDashoffset = dr; r.last.dr = dr; } }
      if ('blur' in v) { var bl = v.blur > 0.05 ? 'blur(' + v.blur.toFixed(2) + 'px)' : 'none'; if (bl !== r.last.bl) { st.filter = bl; r.last.bl = bl; } }
      if ('cl' in v) { var c = 'inset(-20% ' + ((1 - Math.max(0, Math.min(1, v.cl))) * 100).toFixed(2) + '% -20% -5%)'; if (c !== r.last.cl) { st.clipPath = c; r.last.cl = c; } }
    }
    for (var j = 0; j < this.fx.length; j++) this.fx[j](t);
  };

  // 프레임별 점 기록(영상에서 내보낸 앵커) → 시각 t 의 [x, y, 배율] (앞뒤 프레임 사이를 이음)
  MG.track = function (rec, fps) {
    return function (t) {
      var f = t * fps, a = Math.floor(f), p = rec[a], q = rec[a + 1];
      if (!p) return q && f > a + 0.5 ? q : null;
      if (!q) return p;
      var u = f - a;
      return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u];
    };
  };

  // 글자 나누기: 낱말마다 <span class="w"><span>낱말</span></span> (줄 바꿈 <br>·강조 <em> 은 그대로 둠)
  MG.words = function (el) {
    var out = [];
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (s) {
            if (!s) return;
            if (/^\s+$/.test(s)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'), i = document.createElement('span');
            o.className = 'w'; i.textContent = s; o.appendChild(i); frag.appendChild(o); out.push(i);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    return out;
  };

  w.MG = MG;
})(window);

/* 31 MIN 삼행시 2판 — 20초 모션그래픽(첫 화면) + 놀이(M = 업종 · I = 직원 · N = 작년 매출)
   서론 없이 0초에 M 이 쾅. 장면마다 배경색(먹·주황·종이)이 끊어 바뀌고, 글자는 화면 너비를 꽉 채움
   시간 하나(t, 초)로 모든 그림이 정해짐 → ?t=초 로 멈춘 장면, ?cap=1 이면 window.__seek(초) 로 광고 영상 캡처 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), mgv = $('mgv');
  var q = new URLSearchParams(location.search), CAP = q.get('cap') === '1', SEEK = parseFloat(q.get('t'));
  var DUR = 20, tl = null, W = 0, H = 0, raf = 0, T0 = null, now = 0, stopped = false;
  var BG = { k: '#111111', o: '#FF5B2E', c: '#F1EDE4' };
  // 장면: [시작초, 장면 id, 배경, 왼쪽 위 번호]
  var CUT = [[0, 's1', 'k', 'M — 01/03'], [0.62, 's2', 'o', 'M — 01/03'], [1.35, 's3', 'c', 'M — 01/03'],
             [3.7, 's4', 'o', 'I — 02/03'], [4.45, 's5', 'k', 'I — 02/03'], [5.4, 's6', 'c', 'I — 02/03'],
             [8.0, 's7', 'k', 'N — 03/03'], [9.5, 's8', 'o', 'N — 03/03'], [10.6, 's9', 'c', 'N — 03/03'],
             [12.4, 's10', 'k', 'M · I · N'], [14.4, 's11', 'c', '']];

  // 글자를 화면에 꽉 차게: data-f = 너비 비율, data-h = 높이 비율(글자 크기 = 화면 높이 × 값)
  function fit() {
    [].forEach.call(mgv.querySelectorAll('.L[data-f], .L[data-h]'), function (el) {
      var f = parseFloat(el.getAttribute('data-f')), h = parseFloat(el.getAttribute('data-h')), fs = Infinity;
      el.style.fontSize = '100px';
      if (f) fs = 100 * f * W / el.offsetWidth;
      if (h) fs = Math.min(fs, h * H);
      el.style.fontSize = fs.toFixed(1) + 'px';
    });
  }

  function build() {
    W = stage.clientWidth; H = stage.clientHeight; var U = Math.min(H, W * 1.78);
    mgv.style.setProperty('--H', H + 'px'); mgv.style.setProperty('--W', W + 'px'); mgv.style.setProperty('--U', U + 'px');
    [].forEach.call(mgv.querySelectorAll('*'), function (el) { el.style.transform = ''; delete el.__mg; });
    mgv.style.transform = ''; delete mgv.__mg;
    if (!$('t3').querySelector('.ch')) $('t3').innerHTML = $('t3').textContent.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('');
    fit();
    var g = function (id) { return $(id); };
    var t = new MG();

    // 장면 컷: 딱 끊어 바뀜(서서히 사라지지 않음)
    CUT.forEach(function (c, i) {
      var end = i + 1 < CUT.length ? CUT[i + 1][0] : 99, el = g(c[1]);
      t.at(el, 0, { o: c[0] === 0 ? 1 : 0 });
      if (c[0] > 0) t.at(el, c[0], { o: 1 });
      t.at(el, end, { o: 0 });
      t.to(el, c[0], Math.min(end, DUR) - c[0], { s: [1, 1.045] }, 'lin');   // 카메라가 아주 천천히 다가감
    });
    var last = '';
    t.each(function (s) {
      var c = CUT[0];
      for (var i = 0; i < CUT.length; i++) if (s >= CUT[i][0]) c = CUT[i];
      if (c[2] !== last) { last = c[2]; mgv.style.background = BG[c[2]]; if (!stopped) document.body.setAttribute('data-bg', c[2]); }
      $('idx').textContent = c[3];
      $('col7').style.opacity = (s > 8 && Math.floor((s - 8) * 2) % 2) ? 0.15 : 1;   // 5.31 가운데 점 깜빡
    });

    /* M — 0~3.7초 */
    t.to(g('t1'), 0, 0.26, { s: [2.6, 1], blur: [18, 0] }, 'out5')
     .to(g('t1'), 0.26, 0.07, { sy: [1, 0.88], sx: [1, 1.05] }, 'out3').to(g('t1'), 0.33, 0.3, { sy: [0.88, 1], sx: [1.05, 1] }, 'spring');
    t.to(g('t2'), 0.62, 0.22, { x: [W * 0.7, 0], blur: [14, 0] }, 'out5').to(g('t2'), 0.84, 0.5, { x: [0, -W * 0.035] }, 'lin');
    [].forEach.call(g('t3').querySelectorAll('.ch'), function (el, i) {
      t.at(el, 0, { o: 0 }).at(el, 1.37 + i * 0.045, { o: 1 }).to(el, 1.37 + i * 0.045, 0.32, { y: [-H * 0.22, 0], blur: [10, 0] }, 'out5');
    });
    t.at(g('t3k'), 0, { cl: 0 }).to(g('t3k'), 1.85, 0.42, { cl: [0, 1] }, 'out3');
    t.to(g('ul3'), 2.25, 0.45, { draw: [0, 1] }, 'io');
    t.at(g('t3v'), 0, { o: 0 }).to(g('t3v'), 2.55, 0.35, { o: [0, 0.65] }, 'lin');

    /* I — 3.7~8초 */
    t.to(g('t4'), 3.7, 0.42, { sy: [0, 1] }, 'spring').to(g('t4'), 3.7, 0.2, { blur: [8, 0] }, 'lin');
    t.to(g('t5a'), 4.45, 0.24, { x: [-W, 0], blur: [16, 0] }, 'out5');
    t.at(g('t5b'), 0, { o: 0 }).at(g('t5b'), 4.62, { o: 1 }).to(g('t5b'), 4.62, 0.24, { x: [W, 0], blur: [16, 0] }, 'out5');
    t.at(g('t6a'), 0, { o: 0 }).to(g('t6a'), 5.45, 0.35, { o: [0, 1], y: [24, 0] }, 'out5');
    t.at(g('t6b'), 0, { o: 0 }).at(g('t6b'), 5.75, { o: 1 }).to(g('t6b'), 5.75, 0.3, { s: [1.7, 1], blur: [14, 0] }, 'out5');
    t.at(g('t6c'), 0, { cl: 0 }).to(g('t6c'), 6.2, 0.4, { cl: [0, 1] }, 'out3');
    t.at(g('d6'), 0, { o: 0 }).at(g('d6'), 6.6, { o: 1 }).to(g('d6'), 6.6, 0.6, { y: [-H * 0.3, 0] }, 'drop');

    /* N — 8~12.4초 */
    t.at(g('t7'), 8.0, { o: 1 }).at(g('t7'), 8.06, { o: 0.2 }).at(g('t7'), 8.12, { o: 1 }).at(g('t7'), 8.17, { o: 0.35 }).at(g('t7'), 8.22, { o: 1 });
    t.to(g('sp7'), 8.85, 0.28, { draw: [0, 1] }, 'io');
    t.at(g('t8n'), 0, { o: 1 }).to(g('t8n'), 9.5, 0.24, { s: [2.2, 1], blur: [16, 0] }, 'out5').at(g('t8n'), 9.95, { o: 0 });
    t.at(g('t8a'), 0, { o: 0 }).at(g('t8a'), 9.95, { o: 1 }).to(g('t8a'), 9.95, 0.24, { y: [-H * 0.35, 0], blur: [12, 0] }, 'out5');
    t.at(g('t8b'), 0, { o: 0 }).at(g('t8b'), 10.06, { o: 1 }).to(g('t8b'), 10.06, 0.24, { y: [H * 0.35, 0], blur: [12, 0] }, 'out5');
    t.at(g('t9a'), 0, { cl: 0 }).to(g('t9a'), 10.65, 0.4, { cl: [0, 1] }, 'out3');
    t.at(g('t9b'), 0, { o: 0 }).at(g('t9b'), 10.98, { o: 1 }).to(g('t9b'), 10.98, 0.3, { s: [1.5, 1], blur: [12, 0] }, 'out5');
    t.at(g('d9'), 0, { o: 0 }).at(g('d9'), 11.4, { o: 1 }).to(g('d9'), 11.4, 0.6, { y: [-H * 0.3, 0] }, 'drop');

    /* M·I·N 이 쌓였다가 납작하게 눌려 → min 로고 — 12.4~15초 */
    [['t10m', 12.45], ['t10i', 12.7], ['t10n', 12.95]].forEach(function (p) {
      t.at(g(p[0]), 0, { o: 0 }).at(g(p[0]), p[1], { o: 1 }).to(g(p[0]), p[1], 0.22, { s: [2.3, 1], blur: [16, 0] }, 'out5');
    });
    t.to(g('s10'), 13.75, 0.4, { sy: [1, 0.03] }, 'in3');
    t.to(g('lg2'), 14.4, 0.6, { s: [0.82, 1] }, 'back');
    t.to(g('l2-m'), 14.45, 0.4, { draw: [0, 1] }, 'io').to(g('l2-i'), 14.62, 0.25, { draw: [0, 1] }, 'io').to(g('l2-n'), 14.72, 0.35, { draw: [0, 1] }, 'io');
    t.at(g('l2-d'), 0, { o: 0 }).at(g('l2-d'), 15.0, { o: 1 }).to(g('l2-d'), 15.0, 0.7, { y: [-240, 0] }, 'drop');

    /* 끝 화면 — 15.5~20초 */
    t.at(g('pr'), 0, { o: 0 }).to(g('pr'), 15.6, 0.45, { o: [0, 1], y: [30, 0] }, 'out5');
    t.at(g('tg'), 0, { o: 0 }).to(g('tg'), 16.0, 0.45, { o: [0, 1], y: [18, 0] }, 'out5');
    t.at(g('capcta'), 0, { o: 0 }).to(g('capcta'), 16.4, 0.45, { o: [0, 1], y: [24, 0] }, 'out5');
    tl = t;
  }

  function frame(ts) {
    if (T0 === null) T0 = ts;
    now = Math.min(DUR, (ts - T0) / 1000);
    tl.seek(now);
    if (now < DUR && !stopped) raf = requestAnimationFrame(frame);
  }
  function start() {
    build();
    if (CAP) { window.__seek = function (s) { tl.seek(s); return s; }; tl.seek(0); document.documentElement.classList.add('sb-shot'); return; }
    if (!isNaN(SEEK)) { tl.seek(SEEK); document.documentElement.classList.add('sb-shot'); return; }
    if (T.calm) { tl.seek(DUR); return; }
    tl.seek(0); raf = requestAnimationFrame(frame);
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
  var rz = 0;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (!tl) return; var keep = now; build(); tl.seek(CAP || !isNaN(SEEK) ? (SEEK || 0) : keep); }, 150); });

  /* ── 놀이 ── */
  var play = $('play'), ghost = $('ghost'), kick = $('kick'), qq = $('q'), opts = $('opts'), more = $('more');
  var steps = [].slice.call(document.querySelectorAll('.steps span'));
  var busy = false, A = {}, step = 0;
  var Q = [
    { k: 'M', kick: 'M · 1 / 3', q: '어떤 일을 하세요?', name: 'g',
      o: [['A', '도소매 · 온라인 판매'], ['B', '음식점 · 카페 · 제조'], ['C', '서비스 · 프리랜서 · 학원'], ['?', '그 밖의 업종']],
      m: [['P', '전문직이에요', '의료·법률·세무 등'], ['X', '법인사업자예요']] },
    { k: 'I', kick: 'I · 2 / 3', q: '4대보험 직원은 몇 명이에요?', name: 'emp', o: [['few', '없음 ~ 5명'], ['many', '6명 이상']], m: [] },
    { k: 'N', kick: 'N · 3 / 3', q: '', name: 'rev', o: [['low', '이하예요', '올해 시작했어도 이쪽'], ['high', '넘어요']], m: [['unk', '잘 모르겠어요']] }
  ];
  var esc = T.esc;
  function render(n, first) {
    step = n; var d = Q[n];
    steps.forEach(function (s, i) { s.className = i < n ? 'done' : i === n ? 'now' : ''; });
    kick.textContent = d.kick;
    qq.textContent = n === 2 ? T.revQ(A.g) : d.q;
    opts.innerHTML = d.o.map(function (o, i) {
      return '<li><button type="button" data-v="' + esc(o[0]) + '"><i>0' + (i + 1) + '</i><span>' + esc(o[1]) + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</span></button></li>';
    }).join('');
    more.innerHTML = d.m.map(function (o) {
      return '<button type="button" data-v="' + esc(o[0]) + '">' + esc(o[1]) + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</button>';
    }).join('');
    if (!first) ghost.classList.add('swap');
    setTimeout(function () { ghost.textContent = d.k; ghost.classList.remove('fill', 'swap', 'gone'); }, first || T.calm ? 0 : 260);
    play.classList.remove('out'); play.classList.remove('in'); void play.offsetWidth; play.classList.add('in');
  }
  function choose(v, btn) {
    if (busy) return; busy = true;
    if (btn) btn.classList.add('on');
    T.sfx('select');
    A[Q[step].name] = v;
    ghost.classList.add('fill');
    T.wait(420).then(function () { play.classList.add('out'); return T.wait(260); }).then(function () {
      busy = false;
      if (step === 0 && v === 'X') return finish();
      if (step < 2) render(step + 1); else finish();
    });
  }
  play.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) choose(b.getAttribute('data-v'), b); });
  $('again').addEventListener('click', function () { if (!busy) { T.sfx('tap'); A = {}; render(0); } });
  function finish() {
    busy = true;
    steps.forEach(function (s) { s.className = 'done'; });
    play.classList.add('out'); ghost.classList.add('gone');
    var f = document.createElement('div'); f.className = 'fin'; f.innerHTML = '<span>M</span><span>I</span><span>N</span>';
    stage.appendChild(f); T.sfx('win'); T.confetti(stage, 36, ['#FF5B2E', '#17181C', '#FFB08F']);
    return T.wait(1300).then(function () {
      f.remove(); busy = false;
      T.result(A, { eye: 'min, 완성.', again: '처음부터 다시', onAgain: function () { A = {}; T.playing(true); render(0, true); } });
    });
  }
  T.onPlay = function () { stopped = true; cancelAnimationFrame(raf); document.body.setAttribute('data-bg', 'c'); A = {}; play.hidden = false; render(0, true); };
})();
