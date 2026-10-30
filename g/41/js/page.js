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

/* 41 형광펜 — 20초: 기사 한 장을 카메라가 3D 로 미끄러지며 훑고, 노란 형광펜·빨간 펜이 긋는다
   장면: 제목 형광펜(0–3.4) → 인용 1 '영수증은 사진 찍어 카톡으로.'(3.4–7.6) → 인용 2 '신고는 세무사가, 사장님은 장사만.'(7.6–11.5)
        → 본문 속 '월 5만원' 동그라미·밑줄·메모(11.5–15.4) → 기사 아래 광고 박스(끝 화면, 15.4–20)
   시간 하나(t)로 모든 그림이 정해짐 → ?t=초 · ?cap=1 + window.__seek(초) */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), mgv = $('mgv'), art = $('art'), cam = $('cam');
  var q = new URLSearchParams(location.search), CAP = q.get('cap') === '1', SEEK = parseFloat(q.get('t'));
  var DUR = 20, tl = null, W = 0, H = 0, raf = 0, T0 = null, now = 0, stopped = false;
  var E = MG.E;

  function pos(el, fx, fy) {
    var x = 0, y = 0, n = el;
    while (n && n !== art) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return [x + el.offsetWidth * fx, y + el.offsetHeight * fy];
  }

  function build() {
    W = stage.clientWidth; H = stage.clientHeight; var U = Math.min(H, W * 1.78);
    mgv.style.setProperty('--H', H + 'px'); mgv.style.setProperty('--W', W + 'px'); mgv.style.setProperty('--U', U + 'px');
    [].forEach.call(mgv.querySelectorAll('*'), function (el) { el.style.transform = ''; delete el.__mg; });
    var g = $, t = new MG(), ZK = U / 925;

    /* 카메라 길(기사 좌표 · 배율 · 기울기) */
    function mid(ids, dy) {   // 여러 줄을 감싼 상자의 가운데
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      ids.forEach(function (id) { var a = pos(g(id), 0, 0), b = pos(g(id), 1, 1); x0 = Math.min(x0, a[0]); y0 = Math.min(y0, a[1]); x1 = Math.max(x1, b[0]); y1 = Math.max(y1, b[1]); });
      return [(x0 + x1) / 2, (y0 + y1) / 2 + (dy || 0)];
    }
    var head = [mid(['h1', 'h2'])[0], mid(['h1', 'h2', 'deck'], 30)[1]], pq1 = mid(['q1a', 'q1b']), pq2 = mid(['q2a', 'q2b']);
    var pp = pos(g('price'), 0, 0), pr = [pp[0] + 50, pp[1] + 46], ad = pos(g('ad'), 0.5, 0.5);
    var K = [
      [0.0, pos(g('head'), 0.32, -0.4), 0.72, 26, -20, -4, 'lin'],
      [1.3, head, 1.0, 9, -5, -1.2, 'out3'],
      [3.4, [head[0] + 4, head[1] + 14], 1.06, 6, -3, -0.8, 'lin'],
      [4.7, pq1, 1.42, 6, 9, 1.2, 'io'],
      [7.6, [pq1[0], pq1[1] + 10], 1.5, 4, 6, 0.8, 'lin'],
      [8.9, pq2, 1.42, 7, -8, -1.2, 'io'],
      [11.5, [pq2[0], pq2[1] + 10], 1.5, 4, -5, -0.8, 'lin'],
      [12.9, pr, 2.95, 14, 10, 2.5, 'io'],
      [15.4, [pr[0] + 3, pr[1] + 3], 3.1, 10, 7, 2, 'lin'],
      [16.7, ad, 0.93, 0, 0, 0, 'out3'],
      [20.0, [ad[0], ad[1] - 4], 0.97, 0, 0, 0, 'lin']
    ];
    function camAt(s) {
      var i = 0; while (i < K.length - 2 && s >= K[i + 1][0]) i++;
      var a = K[i], b = K[i + 1], u = Math.max(0, Math.min(1, (s - a[0]) / (b[0] - a[0]))); u = E[b[6]](u);
      var L = function (p, q2) { return p + (q2 - p) * u; };
      return { x: L(a[1][0], b[1][0]), y: L(a[1][1], b[1][1]), z: L(a[2], b[2]), rx: L(a[3], b[3]), ry: L(a[4], b[4]), rz: L(a[5], b[5]) };
    }
    t.each(function (s) {
      var c = camAt(s), bre = s < 16.9 ? 1 : Math.max(0, 1 - (s - 16.9) / 1.2);
      var rx = c.rx + Math.sin(s * 0.9) * 0.7 * bre, ry = c.ry + Math.sin(s * 0.63 + 1) * 0.8 * bre;
      art.style.transform = 'translate(' + (W / 2).toFixed(2) + 'px,' + (H * 0.42).toFixed(2) + 'px) rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg) rotateZ(' + c.rz.toFixed(3) + 'deg) scale(' + (c.z * ZK).toFixed(4) + ') translate(' + (-c.x).toFixed(2) + 'px,' + (-c.y).toFixed(2) + 'px)';
    });
    t.to(cam, 0, 0.95, { blur: [9, 0] }, 'out3');
    t.to(g('prog'), 0, 20, { sx: [0, 1] }, 'lin');

    /* 형광펜 · 빨간 펜 */
    var M = function (id, a, d) { t.to(g(id), a, d, { sx: [0, 1] }, 'io'); };
    M('mk1', 0.95, 0.6); M('mk2', 1.62, 0.78);
    t.to(g('dul'), 2.55, 0.45, { draw: [0, 1] }, 'io');
    M('mk3', 5.0, 0.7); M('mk4', 5.76, 0.42);
    M('mk5', 9.25, 0.7); M('mk6', 10.0, 0.62);
    t.to(g('circ'), 13.05, 0.85, { draw: [0, 1] }, 'io');
    t.to(g('ul2a'), 14.0, 0.28, { draw: [0, 1] }, 'out3').to(g('ul2b'), 14.3, 0.28, { draw: [0, 1] }, 'out3');
    t.to(g('arw'), 14.62, 0.35, { draw: [0, 1] }, 'io');
    t.to(g('noteT'), 0, 0.001, { cl: [0, 0] }).to(g('noteT'), 14.85, 0.5, { cl: [0, 1] }, 'lin');

    /* 끝 화면: 기사 아래 광고 박스 */
    ['lg-m', 'lg-i', 'lg-n'].forEach(function (id, i) { t.to(g(id), 16.0 + i * 0.16, 0.45, { draw: [0, 1] }, 'io'); });
    t.to(g('lg-d'), 0, 0.001, { o: [0, 0] }).to(g('lg-d'), 16.5, 0.001, { o: [0, 1] }, 'lin').to(g('lg-d'), 16.5, 0.7, { y: [-160, 0] }, 'drop');
    t.to(g('adp'), 0, 0.001, { o: [0, 0] }).to(g('adp'), 16.3, 0.5, { o: [0, 1], y: [24, 0] }, 'out5');
    M('mk7', 16.9, 0.6);
    t.to(g('adv'), 0, 0.001, { o: [0, 0] }).to(g('adv'), 17.2, 0.4, { o: [0, 1] }, 'out3');
    t.to(g('adt'), 0, 0.001, { o: [0, 0] }).to(g('adt'), 17.55, 0.5, { o: [0, 1], y: [14, 0] }, 'out5');
    t.to(g('capcta'), 0, 0.001, { o: [0, 0] }).to(g('capcta'), 18.0, 0.45, { o: [0, 1], y: [24, 0] }, 'out5');
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

  /* ── 놀이: 독자 설문 — 해당하는 줄에 형광펜 ── */
  var play = $('play'), kick = $('kick'), qq = $('q'), opts = $('opts'), more = $('more');
  var bars = [].slice.call(document.querySelectorAll('.pl-bar i'));
  var busy = false, A = {}, step = 0, esc = T.esc;
  var Q = [
    { q: '어떤 일을 하세요?', name: 'g',
      o: [['A', '도소매 · 온라인 판매'], ['B', '음식점 · 카페 · 제조'], ['C', '서비스 · 프리랜서 · 학원'], ['?', '그 밖의 업종']],
      m: [['P', '전문직이에요', '의료·법률·세무 등'], ['X', '법인사업자예요']] },
    { q: '4대보험 직원은 몇 명이에요?', name: 'emp', o: [['few', '없음 ~ 5명'], ['many', '6명 이상']], m: [] },
    { q: '', name: 'rev', o: [['low', '이하예요', '올해 시작했어도 이쪽'], ['high', '넘어요']], m: [['unk', '잘 모르겠어요']] }
  ];
  function render(n) {
    step = n; var d = Q[n];
    bars.forEach(function (b, i) { b.className = i < n ? 'done' : i === n ? 'on' : ''; });
    kick.textContent = '독자 설문 ' + (n + 1) + ' / 3';
    qq.textContent = n === 2 ? T.revQ(A.g) : d.q;
    opts.innerHTML = d.o.map(function (o, i) {
      return '<li><button type="button" data-v="' + esc(o[0]) + '"><em>0' + (i + 1) + '</em><span class="t"><span class="ln"><i class="mk"></i>' + esc(o[1]) + '</span>' + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</span></button></li>';
    }).join('');
    more.innerHTML = d.m.map(function (o) {
      return '<button type="button" data-v="' + esc(o[0]) + '">' + esc(o[1]) + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</button>';
    }).join('');
    play.classList.remove('out'); play.classList.remove('in'); void play.offsetWidth; play.classList.add('in');
  }
  function choose(v, btn) {
    if (busy) return; busy = true;
    if (btn) btn.classList.add('on');
    T.sfx('select');
    A[Q[step].name] = v;
    T.wait(T.calm ? 0 : 640).then(function () { play.classList.add('out'); return T.wait(T.calm ? 0 : 330); }).then(function () {
      busy = false;
      if (step === 0 && v === 'X') return finish();
      if (step < 2) render(step + 1); else finish();
    });
  }
  play.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) choose(b.getAttribute('data-v'), b); });
  $('again').addEventListener('click', function () { if (!busy) { T.sfx('tap'); A = {}; render(0); } });
  function finish() {
    busy = true;
    bars.forEach(function (b) { b.className = 'done'; });
    play.classList.add('out');
    var f = document.createElement('p'); f.className = 'fin';
    f.innerHTML = '<span class="ln"><i class="mk"></i>우리 가게 기장료,</span><br><span class="ln"><i class="mk"></i>나왔습니다</span>';
    stage.appendChild(f); T.sfx('win');
    return T.wait(1500).then(function () {
      f.remove(); busy = false;
      T.result(A, { eye: '설문 끝, 기사 나왔습니다', again: '처음부터 다시', onAgain: function () { A = {}; T.playing(true); render(0); } });
    });
  }
  T.onPlay = function () { stopped = true; cancelAnimationFrame(raf); A = {}; play.hidden = false; render(0); };
})();
