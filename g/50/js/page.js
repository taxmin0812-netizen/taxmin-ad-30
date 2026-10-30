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

/* 50 CD 앨범 — 20초 앨범 홍보 모션(케이스 들어옴 → 스티커 → 열림 → 디스크 회전·무지개 → 뒷면 수록곡 → 끝 화면 앨범 컷)
   + 놀이(앨범 뒷면에서 트랙 고르기). 시간 하나(t)로 모든 그림 → ?t=초, ?cap=1 이면 window.__seek(초) */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), mgv = $('mgv'), E = MG.E;
  var qs = new URLSearchParams(location.search), CAP = qs.get('cap') === '1', SEEK = parseFloat(qs.get('t'));
  var DUR = 20, tl = null, W = 0, H = 0, U = 0, raf = 0, T0 = null, now = 0, stopped = false;

  function K(pts) {
    return function (t) {
      if (t <= pts[0][0]) return pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var b = pts[i];
        if (t <= b[0]) { var a = pts[i - 1], u = (t - a[0]) / Math.max(1e-4, b[0] - a[0]); return a[1] + (b[1] - a[1]) * (E[b[2] || 'io'])(u); }
      }
      return pts[pts.length - 1][1];
    };
  }
  // 회전 속도(도/초) 구간을 쌓아 각도로: [[초, 속도], …] 사이는 속도가 곧게 바뀜
  function spin(pts) {
    return function (t) {
      var a = 0;
      for (var i = 1; i < pts.length; i++) {
        var p = pts[i - 1], q = pts[i]; if (t <= p[0]) break;
        var e = Math.min(t, q[0]), d = e - p[0], v1 = p[1] + (q[1] - p[1]) * (d / (q[0] - p[0]));
        a += (p[1] + v1) / 2 * d;
      }
      if (t > pts[pts.length - 1][0]) a += pts[pts.length - 1][1] * (t - pts[pts.length - 1][0]);
      return a;
    };
  }

  var LOGO = '<svg viewBox="196 214 408 220" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"><path d="M232.5 396V334.5a38.5 38.5 0 0 1 77 0V396M309.5 334.5a38 38 0 0 1 76 0V396"/><path d="M437.5 396V306"/><path d="M489.5 396V334.5a38.5 38.5 0 0 1 77 0V396"/></g><circle cx="438" cy="255" r="21.5" fill="#17181C"/></svg>';
  function discHTML(labelOnly) {
    return '<div class="dm"><div class="dface">' + (labelOnly ? '' : '<div class="dd"></div>') +
      '<div class="dl">' + LOGO + '<span>세무사 1집</span><em>TAXMIN · VOL.1</em></div></div>' + (labelOnly ? '' : '<i class="sheen"></i>') + '<i class="spec"></i></div>';
  }
  $('disc').innerHTML = discHTML(false); $('tdisc').innerHTML = discHTML(true); $('pdisc').innerHTML = discHTML(false);
  $('pdisc').querySelector('.dl').style.opacity = '0';

  // 큰 문장: 낱말마다 아래에서 솟아오름
  var HW = {};
  ['h1', 'h2', 'h3', 'h4', 'h5'].forEach(function (id) { HW[id] = [].slice.call($(id).querySelectorAll('p')).map(function (p) { return MG.words(p); }); });

  function build() {
    W = stage.clientWidth; H = stage.clientHeight; U = Math.min(H, W * 1.78);
    var C = Math.min(U * 0.42, W * 0.74), D = C * 0.8;
    mgv.style.setProperty('--H', H + 'px'); mgv.style.setProperty('--W', W + 'px'); mgv.style.setProperty('--U', U + 'px');
    mgv.style.setProperty('--C', C + 'px'); mgv.style.setProperty('--D', D + 'px');
    [].forEach.call(mgv.querySelectorAll('*'), function (el) { el.style.transform = ''; el.style.opacity = ''; delete el.__mg; });
    var g = function (id) { return $(id); }, t = new MG();
    var caseEl = g('case'), lid = g('lid'), disc = g('disc'), dface = disc.querySelector('.dface'), dl = disc.querySelector('.dl'), sheen = disc.querySelector('.sheen');
    var tdisc = g('tdisc'), floor = g('floor'), halo = g('halo'), glint = g('glint'), gloss = g('gloss');
    var cy0 = H * 0.535, Ce = Math.min(U * 0.31, W * 0.58), se = Ce / C, cxE = W / 2 - Ce * 0.26, cyE = H * 0.47, dxE = cxE + Ce * 0.62;
    g('ep').style.top = (cyE + Ce * 0.45 + U * 0.05) + 'px';
    var Dbig = U * 0.7, sBig = Dbig / D;

    /* 케이스: 위치·회전·크기·뚜껑 */
    var cx = K([[0, W * 1.6], [1.15, W * 0.5, 'out5'], [4.1, W * 0.5], [4.9, W * 0.3, 'io'], [6.9, W * 0.3], [7.7, W * 0.5, 'io'], [11.45, W * 0.5], [12.1, -W * 0.75, 'in3'], [15.5, -W * 0.75], [16.45, cxE, 'out5']]);
    var cy = K([[0, cy0], [6.9, cy0], [7.7, H * 0.56, 'io'], [11.45, H * 0.56], [15.5, cyE], [16.45, cyE]]);
    var ry = K([[0, -64], [1.15, -17, 'out5'], [2.9, -9, 'lin'], [3.4, 0, 'io'], [4.1, 0], [4.9, 24, 'io'], [6.9, 28, 'lin'], [7.75, 180, 'io'], [11.45, 180], [12.1, 245, 'in3'], [15.5, 300], [16.45, 360, 'out5'], [20, 352, 'lin']]);
    var rz = K([[0, 10], [1.15, -3, 'out5'], [2.9, -2, 'lin'], [3.4, 0, 'io'], [11.45, 0], [12.1, -8, 'in3'], [15.5, 6], [16.45, -2.5, 'out5']]);
    var sc = K([[0, 1], [6.9, 1], [7.75, 1.13, 'io'], [11.45, 1.13], [12.1, 0.95, 'in3'], [15.5, se], [16.45, se]]);
    var la = K([[0, 0], [3.42, 0], [4.05, -128, 'io'], [4.55, -128], [5.15, 0, 'io']]);
    function caseAt(s) {
      var f = Math.sin(s * 1.25) * U * 0.005;
      return { x: cx(s), y: cy(s) + f, ry: ry(s), rz: rz(s), s: sc(s), lid: la(s) };
    }
    /* 디스크 */
    var c0x = W * 0.5 + C * 0.03, c0y = cy0;
    var dx = K([[4.05, c0x], [4.9, W * 0.66, 'io'], [6.9, W * 0.68, 'lin'], [7.75, W * 0.8, 'io'], [11.45, W * 0.8], [12.15, W * 0.5, 'io'], [15.5, W * 0.5], [16.45, dxE, 'out5']]);
    var dy = K([[4.05, c0y], [4.9, c0y - H * 0.03, 'io'], [6.9, c0y - H * 0.035, 'lin'], [7.75, H * 0.75, 'io'], [11.45, H * 0.75], [12.15, H * 0.64, 'io'], [15.5, H * 0.62, 'lin'], [16.45, cyE, 'out5']]);
    var ds = K([[4.05, 1], [4.9, 1.18, 'io'], [6.9, 1.2], [7.75, 0.62, 'io'], [11.45, 0.62], [12.15, sBig, 'io'], [15.5, sBig * 1.04, 'lin'], [16.45, se, 'out5']]);
    var dsx = K([[4.3, 1], [4.52, 0, 'in3'], [4.74, 1, 'out3'], [15.25, 1], [15.47, 0, 'in3'], [15.69, 1, 'out3']]);
    var dang0 = spin([[4.05, 0], [4.9, 300], [11.45, 300], [12.15, 620], [15.2, 620], [15.47, 450]]), dang1 = spin([[15.47, 260], [16.45, 4], [20, 2.5]]);
    var dang = function (s) { return s < 15.47 ? dang0(s) : 30 - dang1(16.45) + dang1(s); };
    var sa = K([[4.0, -30], [7.0, 25, 'io'], [11.4, 40, 'io'], [12.2, -10, 'io'], [15.4, 70, 'io'], [20, 60]]);
    var dvis = function (s) { return s >= 4.05; };
    var labelSide = function (s) { return s < 4.52 || s >= 15.47; };
    var behind = function (s) { return (s > 7.3 && s < 11.6) || s > 15.9; };
    var glo = K([[0, 0], [5.0, 0], [5.25, 1, 'out3'], [5.7, 0, 'in3'], [12.9, 0], [13.15, 1, 'out3'], [13.6, 0, 'in3'], [14.3, 0], [14.5, 0.8, 'out3'], [14.9, 0, 'in3'], [17.0, 0], [17.2, 1, 'out3'], [17.7, 0, 'in3']]);
    var glr = K([[0, 0], [5.0, -0.3], [13, 0.32], [14.3, -0.36], [17, 0.3]], 'lin');
    var gl = K([[0.9, -1], [0.901, 0], [1.7, 1, 'io'], [1.701, -1], [2.95, -1], [2.951, 0], [3.5, 1, 'io'], [3.501, -1], [16.5, -1], [16.501, 0], [17.3, 1, 'io'], [17.301, -1]]);

    /* 큰 문장 */
    function rise(id, a, b) {
      var k = 0;
      HW[id].forEach(function (ws, li) {
        ws.forEach(function (w) {
          var t0 = a + li * 0.18 + k * 0.055; k++;
          t.to(w, 0, 0.001, { yp: [115, 115] }).to(w, t0, 0.62, { yp: [115, 0] }, 'out5');
          if (b != null) t.to(w, b + k * 0.025, 0.34, { yp: [0, -115] }, 'in3');
        });
      });
    }
    rise('h1', 0.45, 2.9); rise('h2', 3.4, 6.85); rise('h3', 7.15, 11.4); rise('h4', 12.15, 15.15); rise('h5', 16.5);
    // 스티커 쾅(1.6) · 끝에서 한 번 더
    t.to(g('stk'), 0, 0.001, { o: [0, 0] }).to(g('stk'), 1.62, 0.001, { o: [0, 1] }, 'lin')
     .to(g('stk'), 1.62, 0.5, { s: [2.4, 1], r: [-34, -12] }, 'out5')
     .to(g('stk'), 16.75, 0.45, { s: [1.28, 1], r: [-20, -12] }, 'back');
    // 수록곡 줄
    [7.95, 8.95, 9.95].forEach(function (a, i) {
      var row = g('tr' + (i + 1)), ph = g('ph' + (i + 1));
      t.to(row, 0, 0.001, { o: [0, 0] }).to(row, a, 0.45, { o: [0, 1], x: [C * 0.12, 0] }, 'out5');
      t.to(ph, 0, 0.001, { sx: [0, 0] }).to(ph, a + 0.12, 0.5, { sx: [0, 1] }, 'out5');
      if (i < 2) t.to(ph, a + 1.0, 0.35, { sx: [1, 0] }, 'in3');
    });
    var rows = [g('tr1'), g('tr2'), g('tr3')], eqs = [0, 1, 2].map(function (i) { return [].slice.call(g('eq' + (i + 1)).children); });
    // 끝 문구
    t.to(g('capcta'), 0, 0.001, { o: [0, 0] }).to(g('capcta'), 18.5, 0.5, { o: [0, 1], y: [16, 0] }, 'out5');
    t.to(g('epp'), 0, 0.001, { o: [0, 0] }).to(g('epp'), 17.15, 0.6, { o: [0, 1], y: [U * 0.04, 0] }, 'out5');
    t.to(g('eps'), 0, 0.001, { o: [0, 0] }).to(g('eps'), 17.5, 0.5, { o: [0, 1] }, 'out3');
    t.to(g('epl'), 0, 0.001, { sx: [0, 0] }).to(g('epl'), 17.45, 0.7, { sx: [0, 1] }, 'io');
    t.to(halo, 0, 0.001, { o: [0, 0] }).to(halo, 0.2, 1.2, { o: [0, 1] }, 'out3');

    var last = {};
    function set(el, k, v) { if (last[k] !== v) { el.style.transform = v; last[k] = v; } }
    t.each(function (s) {
      var c = caseAt(s);
      set(caseEl, 'case', 'translate3d(' + (c.x - C / 2).toFixed(2) + 'px,' + (c.y - C * 0.45).toFixed(2) + 'px,0) rotateZ(' + c.rz.toFixed(2) + 'deg) rotateY(' + c.ry.toFixed(2) + 'deg) scale(' + c.s.toFixed(4) + ')');
      set(lid, 'lid', 'translateZ(' + (C * 0.035).toFixed(2) + 'px) rotateY(' + c.lid.toFixed(2) + 'deg)');
      // 바닥 그림자
      var fs = c.s * Math.max(0.35, Math.abs(Math.cos(c.ry * Math.PI / 180)) * 0.6 + 0.4);
      set(floor, 'floor', 'translate(' + (c.x - W / 2).toFixed(1) + 'px,' + (c.y + C * 0.45 * c.s + C * 0.04 - H / 2).toFixed(1) + 'px) scale(' + fs.toFixed(3) + ',1)');
      set(halo, 'halo', 'translate(' + ((c.x - W / 2) * 0.35).toFixed(1) + 'px,' + ((c.y - H / 2) * 0.5).toFixed(1) + 'px)');
      // 디스크
      var on = dvis(s);
      if (last.dv !== on) { disc.style.visibility = on ? '' : 'hidden'; tdisc.style.visibility = on ? 'hidden' : ''; last.dv = on; }
      if (on) {
        set(disc, 'disc', 'translate(' + (dx(s) - D / 2).toFixed(2) + 'px,' + (dy(s) - D / 2).toFixed(2) + 'px) scale(' + (ds(s) * dsx(s)).toFixed(4) + ',' + ds(s).toFixed(4) + ')');
        set(dface, 'dface', 'rotate(' + (dang(s) % 360).toFixed(2) + 'deg)');
        var ls = labelSide(s);
        if (last.ls !== ls) { dl.style.opacity = ls ? '1' : '0'; sheen.style.opacity = ls ? '0' : '1'; last.ls = ls; }
        var sv = sa(s).toFixed(1) + 'deg'; if (last.sa !== sv) { sheen.style.setProperty('--sa', sv); last.sa = sv; }
        var bh = behind(s); if (last.bh !== bh) { disc.style.zIndex = bh ? '1' : '3'; last.bh = bh; }
      }
      // 반짝(디스크 가장자리)
      var go = on ? glo(s) : 0;
      if (go > 0.01) {
        var rr = D / 2 * ds(s) * 0.82, an = glr(s) * Math.PI - Math.PI * 0.35;
        set(glint, 'gl', 'translate(' + (dx(s) + Math.cos(an) * rr).toFixed(1) + 'px,' + (dy(s) + Math.sin(an) * rr).toFixed(1) + 'px) scale(' + (0.5 + go).toFixed(3) + ') rotate(' + (s * 40).toFixed(1) + 'deg)');
      }
      var gs = go.toFixed(3); if (last.go !== gs) { glint.style.opacity = gs; last.go = gs; }
      var gv = gl(s).toFixed(3); if (last.gv !== gv) { gloss.style.setProperty('--g', gv); last.gv = gv; }
      // 수록곡: 지금 트랙 표시 + 이퀄라이저
      var cur = s >= 9.95 + 0.12 ? 2 : s >= 8.95 + 0.12 ? 1 : s >= 7.95 + 0.12 ? 0 : -1;
      if (last.cur !== cur) { rows.forEach(function (r, i) { r.classList.toggle('on', i === cur); }); last.cur = cur; }
      for (var i = 0; i < 3; i++) {
        var act = i === cur && s < 11.45;
        for (var j = 0; j < 4; j++) {
          var h = act ? 0.25 + 0.75 * Math.abs(Math.sin(s * (7 + j * 2.3) + j * 1.7)) : 0.18;
          eqs[i][j].style.transform = 'scaleY(' + h.toFixed(3) + ')';
        }
      }
    });
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
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (!tl || stopped) return; var keep = now; build(); tl.seek(CAP || !isNaN(SEEK) ? (SEEK || 0) : keep); }, 150); });

  /* ── 놀이: 앨범 뒷면에서 트랙 고르기 ── */
  var play = $('play'), pin = $('pin'), tn = $('tn'), tq = $('tq'), qq = $('q'), opts = $('opts'), more = $('more'), pdisc = $('pdisc');
  var busy = false, A = {}, step = 0;
  var Q = [
    { tag: '업종', q: '어떤 일을 하세요?', name: 'g',
      o: [['A', '도소매 · 온라인 판매'], ['B', '음식점 · 카페 · 제조'], ['C', '서비스 · 프리랜서 · 학원'], ['?', '그 밖의 업종']],
      m: [['P', 'BONUS', '전문직이에요', '의료·법률·세무 등'], ['X', 'BONUS', '법인사업자예요']] },
    { tag: '직원', q: '4대보험 직원은 몇 명이에요?', name: 'emp', o: [['few', '없음 ~ 5명'], ['many', '6명 이상']], m: [] },
    { tag: '매출', q: '', name: 'rev', o: [['low', '이하예요', '올해 시작했어도 이쪽'], ['high', '넘어요']], m: [['unk', '?', '잘 모르겠어요']] }
  ];
  var esc = T.esc;
  function render(n) {
    step = n; var d = Q[n];
    tn.textContent = 'TRACK 0' + (n + 1); tq.textContent = d.tag + ' · ' + (n + 1) + ' / 3';
    qq.textContent = n === 2 ? T.revQ(A.g) : d.q;
    opts.innerHTML = d.o.map(function (o, i) {
      return '<li><button type="button" data-v="' + esc(o[0]) + '"><i>0' + (i + 1) + '</i><span>' + esc(o[1]) + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') +
        '</span><span class="pl" aria-hidden="true"><em>▶</em><u class="eq"><b></b><b></b><b></b></u></span></button></li>';
    }).join('');
    more.innerHTML = d.m.map(function (o) {
      return '<button type="button" data-v="' + esc(o[0]) + '"><i>' + esc(o[1]) + '</i><span>' + esc(o[2]) + (o[3] ? '<small>' + esc(o[3]) + '</small>' : '') + '</span></button>';
    }).join('');
    pin.classList.remove('out', 'in'); void pin.offsetWidth; pin.classList.add('in');
  }
  function choose(v, btn) {
    if (busy) return; busy = true;
    if (btn) btn.classList.add('on');
    pdisc.classList.add('fast');
    T.sfx('select');
    A[Q[step].name] = v;
    T.wait(800).then(function () { pin.classList.add('out'); pdisc.classList.remove('fast'); return T.wait(280); }).then(function () {
      busy = false;
      if (step === 0 && v === 'X') return finish();
      if (step < 2) render(step + 1); else finish();
    });
  }
  play.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) choose(b.getAttribute('data-v'), b); });
  $('again').addEventListener('click', function () { if (!busy) { T.sfx('tap'); A = {}; render(0); } });
  function finish() {
    busy = true; pdisc.classList.add('fast');
    var f = document.createElement('div'); f.className = 'fin'; f.innerHTML = '<b>1집 완성</b><small>기장료가 나왔어요</small>';
    stage.appendChild(f); T.sfx('thud'); T.wait(160).then(function () { T.sfx('win'); });
    return T.wait(1300).then(function () {
      f.remove(); busy = false; pdisc.classList.remove('fast');
      T.result(A, { eye: '우리 가게 1집, 완성!', again: '처음부터 다시', onAgain: function () { A = {}; T.playing(true); render(0); } });
    });
  }
  T.onPlay = function () { stopped = true; cancelAnimationFrame(raf); A = {}; busy = false; play.hidden = false; render(0); };
})();
