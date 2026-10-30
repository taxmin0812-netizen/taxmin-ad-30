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

/* 42 지도경로 — 20초: 동네 지도(3D 기울임) 위로 '우리 가게' 핀 → 점선 경로가 그려지며 카메라가 따라 날아감
   → 길가 가게(카페·미용실·식당·옷가게)가 입체로 솟음 → 카톡 말풍선 경유 → '담당 세무사' 건물·핀 → 높이 올라가 전체 경로 + 도착 핀(끝 화면)
   놀이: 같은 지도 위에서 핀을 골라 경로를 이어 감(업종 → 직원 → 매출 → 도착)
   시간 하나(t)로 모든 그림이 정해짐 → ?t=초 · ?cap=1 + window.__seek(초) */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, stage = $('stage'), mgv = $('mgv'), map = $('map'), base = $('base'), world = $('world');
  var q = new URLSearchParams(location.search), CAP = q.get('cap') === '1', SEEK = parseFloat(q.get('t'));
  var DUR = 20, tl = null, W = 0, H = 0, U = 0, ZK = 1, raf = 0, T0 = null, now = 0, stopped = false;
  var E = MG.E, NS = 'http://www.w3.org/2000/svg';
  function cl01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function div(cls, html, parent) { var e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; (parent || map).appendChild(e); return e; }

  /* ── 지도 그리기(한 번) ── */
  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var XS = [140, 460, 780, 1100, 1420, 1740, 2060, 2380], YS = [160, 500, 840, 1180, 1520, 1860, 2200, 2540, 2880, 3220];
  function rwX(x) { return x === 1100 ? 54 : 30; } function rwY(y) { return y === 1860 ? 54 : 30; }
  var PARK = { '1,5': 1, '6,1': 1, '2,3': 1, '4,7': 1 };
  var ROUTE = 'M620 2540H1060Q1100 2540 1100 2500V1900Q1100 1860 1140 1860H1380Q1420 1860 1420 1820V1220Q1420 1180 1460 1180H1700Q1740 1180 1740 1140V880Q1740 840 1780 840H1920';
  var S = [620, 2540], D = [1920, 840];
  var IC = {
    cup: '<path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 11.5h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5c0 1.5 1 1.5 1 3M12.5 3.5c0 1.5 1 1.5 1 3"/>',
    cut: '<circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M8.5 7.8 20 18M8.5 16.2 20 6"/>',
    bowl: '<path d="M3 12h18a9 8 0 0 1-18 0zM9 4l2.5 6M15 3.5l-2.2 6.5"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"/>',
    doc: '<path d="M6 3h9l4 4v14H6zM15 3v4h4M9 13.5l2.4 2.4L16 11.3"/>',
    shop: '<path d="M4 10v10h16V10M3 6l2-3h14l2 3v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM10 20v-5h4v5"/>'
  };
  var SHOPS = [
    { x: 840, y: 2400, w: 130, d: 96, h: 74, c: '#F2784B', c2: '#F9B79A', c3: '#D9643A', ic: 'cup' },
    { x: 632, y: 2588, w: 110, d: 84, h: 62, c: '#3F9E97', c2: '#9ED1CC', c3: '#2F7F79', ic: 'cut' },
    { x: 1160, y: 2040, w: 126, d: 100, h: 68, c: '#E2A93B', c2: '#F3D691', c3: '#C28C24', ic: 'bowl' },
    { x: 950, y: 1960, w: 104, d: 90, h: 58, c: '#8C7FD0', c2: '#C9C2EE', c3: '#7064B5', ic: 'bag' }
  ];
  var OFF = { x: 1850, y: 630, w: 150, d: 120, h: 210 };
  var lots = [], bills = [], blds = [], route, ghost, rmask, head, pinS, pinD, talk;

  function drawMap() {
    var defs = mk('defs', {}, base);
    mk('rect', { x: -400, y: -400, width: 3400, height: 4200, fill: '#E6E9E1' }, base);
    var gB = mk('g', {}, base);
    for (var i = 0; i < XS.length - 1; i++) for (var j = 0; j < YS.length - 1; j++) {
      var x0 = XS[i] + rwX(XS[i]) / 2 + 10, x1 = XS[i + 1] - rwX(XS[i + 1]) / 2 - 10, y0 = YS[j] + rwY(YS[j]) / 2 + 10, y1 = YS[j + 1] - rwY(YS[j + 1]) / 2 - 10;
      if (PARK[i + ',' + j]) {
        mk('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 18, fill: '#CFE0C4' }, gB);
        for (var k = 0; k < 16; k++) mk('circle', { cx: x0 + 30 + rnd() * (x1 - x0 - 60), cy: y0 + 30 + rnd() * (y1 - y0 - 60), r: 14 + rnd() * 14, fill: k % 3 ? '#B9D3AC' : '#A9C89A' }, gB);
        mk('path', { d: 'M' + (x0 + 20) + ' ' + (y1 - 30) + 'C' + (x0 + 120) + ' ' + (y0 + 60) + ' ' + (x1 - 120) + ' ' + (y1 - 40) + ' ' + (x1 - 20) + ' ' + (y0 + 40), fill: 'none', stroke: '#E9E4D2', 'stroke-width': 8, 'stroke-linecap': 'round' }, gB);
        continue;
      }
      mk('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 12, fill: '#F4F5F0' }, gB);
      var nx = rnd() < 0.5 ? 2 : 3, ny = 2, lw = (x1 - x0 - 16) / nx, lh = (y1 - y0 - 16) / ny;
      for (var a = 0; a < nx; a++) for (var b = 0; b < ny; b++) {
        var L = { x: x0 + 8 + a * lw + 7, y: y0 + 8 + b * lh + 7, w: lw - 14 - rnd() * 18, d: lh - 14 - rnd() * 18 };
        L.cx = L.x + L.w / 2; L.cy = L.y + L.d / 2; lots.push(L);
        L.svg = mk('rect', { x: L.x, y: L.y, width: L.w, height: L.d, rx: 4, fill: '#E2E5DD', stroke: '#D7DAD1', 'stroke-width': 2 }, gB);
      }
    }
    mk('path', { d: 'M-300 2470C500 2320 1000 2580 1500 2430S2300 2250 2900 2330', fill: 'none', stroke: '#C3D8DF', 'stroke-width': 130, 'stroke-linecap': 'round' }, base);
    mk('path', { d: 'M-300 2470C500 2320 1000 2580 1500 2430S2300 2250 2900 2330', fill: 'none', stroke: '#B5CFD8', 'stroke-width': 4, 'stroke-dasharray': '40 60', opacity: .7 }, base);
    var gR = mk('g', { 'stroke-linecap': 'butt' }, base);
    function road(x0, y0, x1, y1, w) { mk('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: '#D1D5CB', 'stroke-width': w + 6 }, gR); }
    function roadT(x0, y0, x1, y1, w) { mk('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: '#FFFFFF', 'stroke-width': w }, gR); }
    XS.forEach(function (x) { road(x, -400, x, 3800, rwX(x)); }); YS.forEach(function (y) { road(-400, y, 3000, y, rwY(y)); });
    XS.forEach(function (x) { roadT(x, -400, x, 3800, rwX(x)); }); YS.forEach(function (y) { roadT(-400, y, 3000, y, rwY(y)); });
    mk('line', { x1: 1100, y1: -400, x2: 1100, y2: 3800, stroke: '#EADFB8', 'stroke-width': 3, 'stroke-dasharray': '26 22' }, gR);
    mk('line', { x1: -400, y1: 1860, x2: 3000, y2: 1860, stroke: '#EADFB8', 'stroke-width': 3, 'stroke-dasharray': '26 22' }, gR);
    // 경로: 미리보기(옅게) + 점선(마스크로 그려짐)
    ghost = mk('path', { d: ROUTE, fill: 'none', stroke: 'rgba(255,91,46,.22)', 'stroke-width': 22, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, base);
    var m = mk('mask', { id: 'rmask', maskUnits: 'userSpaceOnUse', x: -400, y: -400, width: 3400, height: 4200 }, defs);
    rmask = mk('path', { d: ROUTE, fill: 'none', stroke: '#fff', 'stroke-width': 60, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
    var gr = mk('g', { mask: 'url(#rmask)', id: 'rg' }, base);
    mk('path', { d: ROUTE, fill: 'none', stroke: '#fff', 'stroke-width': 24, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gr);
    route = mk('path', { d: ROUTE, fill: 'none', stroke: '#FF5B2E', 'stroke-width': 13, 'stroke-linecap': 'round', 'stroke-dasharray': '0.1 25' }, gr);
    base.__legs = mk('g', { id: 'legs' }, base); base.__defs = defs;

    // 입체 건물
    function box(o, cls, style) {
      var e = div('bld ' + cls, '<i class="tp"></i><i class="fr"></i><i class="we"></i><i class="ea"></i>');
      if (style) for (var k in style) e.style.setProperty(k, style[k]);
      var f = e.children;
      f[0].style.cssText = 'width:' + o.w + 'px;height:' + o.d + 'px;transform:translateZ(' + o.h + 'px)';
      f[1].style.cssText = 'width:' + o.w + 'px;height:' + o.h + 'px;transform:translateY(' + o.d + 'px) rotateX(90deg)';
      f[2].style.cssText = 'width:' + o.h + 'px;height:' + o.d + 'px;transform:rotateY(-90deg)';
      f[3].style.cssText = 'width:' + o.h + 'px;height:' + o.d + 'px;transform:translateX(' + o.w + 'px) rotateY(-90deg)';
      var b = { el: e, x: o.x, y: o.y, h: o.h, s: 0, t0: 0, o: o }; blds.push(b); return b;
    }
    function bill(html, x, y, cls) { var e = div('bb ' + (cls || ''), '<div class="bbi">' + html + '</div>'); var b = { el: e, x: x, y: y, z: 0, s: 1, o: 1 }; bills.push(b); return b; }
    // 경로 가까운 집터 → 회색 입체 건물(지나갈 때 솟음)
    var pts = [], len = route.getTotalLength();
    for (var s = 0; s <= len; s += 24) { var p = route.getPointAtLength(s); pts.push([p.x, p.y, s / len]); }
    route.__pts = pts; route.__len = len;
    function near(x, y) { var best = 1e9, bp = 0; pts.forEach(function (p) { var dd = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (dd < best) { best = dd; bp = p[2]; } }); return [Math.sqrt(best), bp]; }
    function hits(L, o) { return !(L.x + L.w < o.x - 20 || L.x > o.x + o.w + 20 || L.y + L.d < o.y - 20 || L.y > o.y + o.d + 20); }
    lots.forEach(function (L) {
      var n = near(L.cx, L.cy); L.np = n[1];
      if (n[0] > 300 || SHOPS.some(function (o) { return hits(L, o); }) || hits(L, OFF)) return;
      L.svg.setAttribute('fill', '#DCDFD6');
      var b = box({ x: L.x, y: L.y, w: L.w, d: L.d, h: 26 + Math.round(rnd() * 96) }, rnd() < 0.55 ? 'win' : '');
      b.np = n[1]; b.kind = 'gray';
    });
    SHOPS.forEach(function (o) {
      var b = box(o, 'shop', { '--c': o.c, '--c2': o.c2, '--c3': o.c3 }); b.np = near(o.x + o.w / 2, o.y + o.d / 2)[1]; b.kind = 'shop';
      b.sign = bill('<div class="sign" style="--c:' + o.c + '"><svg viewBox="0 0 24 24">' + IC[o.ic] + '</svg></div><i style="--c:' + o.c + '"></i>', o.x + o.w / 2, o.y + o.d / 2);
    });
    var ob = box(OFF, 'off'); ob.np = 0.97; ob.kind = 'off';
    ob.sign = bill('<div class="sign" style="--c:#1E2B3C"><svg viewBox="0 0 24 24">' + IC.doc + '</svg></div><i style="--c:#1E2B3C"></i>', OFF.x + OFF.w / 2, OFF.y + OFF.d / 2);
    talk = bill('<div class="talk"><svg viewBox="0 0 118 92"><path d="M59 4C30 4 6 21 6 41c0 13 9 24 22 30l-5 18 19-12c5 1 11 2 17 2 30 0 53-17 53-38S89 4 59 4z" fill="#FEE500"/><rect x="45" y="18" width="28" height="40" rx="3" fill="#fff" stroke="#1E2B3C" stroke-width="3"/><path d="M51 28h16M51 36h16M51 44h10" stroke="#1E2B3C" stroke-width="3" stroke-linecap="round"/></svg></div>', 1250, 1812);
    var ovl = document.createElement('div'); ovl.className = 'ovl'; world.appendChild(ovl);
    function opin(html, x, y) {
      var a = { el: div('bb anc', '<div class="bbi"><i style="display:block;width:2px;height:2px"></i></div>'), x: x, y: y, z: 0, s: 1, o: 1 }; bills.push(a);
      var e = document.createElement('div'); e.className = 'opin'; e.innerHTML = '<div class="opi">' + html + '</div>'; ovl.appendChild(e);
      return { a: a, el: e, drop: 0, o: 1 };
    }
    pinS = opin('<span class="pl or">우리 가게</span><svg class="pin" viewBox="0 0 66 82"><path d="M33 2C16 2 3 15 3 31c0 21 30 49 30 49s30-28 30-49C63 15 50 2 33 2z" fill="#FF5B2E"/><circle cx="33" cy="31" r="17" fill="#fff"/><g transform="translate(21 19)" fill="none" stroke="#FF5B2E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + IC.shop + '</g></svg>', S[0], S[1]);
    pinD = opin('<span class="pl nv">담당 세무사</span><svg class="pin" viewBox="0 0 66 82"><path d="M33 2C16 2 3 15 3 31c0 21 30 49 30 49s30-28 30-49C63 15 50 2 33 2z" fill="#1E2B3C"/><circle cx="33" cy="31" r="17" fill="#fff"/><g transform="translate(21 19)" fill="none" stroke="#1E2B3C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + IC.doc + '</g></svg>', D[0], D[1]);
    head = div('hd', '<u></u><b></b>');
  }

  /* ── 경로 진행(p)과 카메라 ── */
  var PK = [[2.4, 0], [7.3, 0.47, 'io'], [8.4, 0.5, 'lin'], [13.7, 1, 'io']];
  function prog(t) {
    if (t <= PK[0][0]) return 0; if (t >= PK[PK.length - 1][0]) return 1;
    for (var i = 1; i < PK.length; i++) if (t < PK[i][0]) { var a = PK[i - 1], b = PK[i]; return a[1] + (b[1] - a[1]) * E[b[2]]((t - a[0]) / (b[0] - a[0])); }
    return 1;
  }
  function tOf(p) { for (var t = 0; t <= 14; t += 0.02) if (prog(t) >= p) return t; return 14; }
  function ptAt(p) { var P = route.getPointAtLength(cl01(p) * route.__len); return [P.x, P.y]; }
  function eastW(p) {
    var sx = 0, sy = 0;
    [-0.03, 0, 0.03, 0.06].forEach(function (o) { var a = ptAt(p + o - 0.008), b = ptAt(p + o + 0.008); sx += Math.abs(b[0] - a[0]); sy += Math.abs(b[1] - a[1]); });
    return sx + sy > 0 ? sx / (sx + sy) : 1;
  }
  var cam = { x: 0, y: 0, z: 1, tilt: 0, rz: 0, a: 0.58, bs: 1 };
  function applyCam(c) {
    cam = c;
    map.style.transform = 'translate(' + (W / 2).toFixed(2) + 'px,' + (H * c.a).toFixed(2) + 'px) rotateX(' + c.tilt.toFixed(3) + 'deg) rotateZ(' + c.rz.toFixed(3) + 'deg) scale(' + (c.z * ZK).toFixed(4) + ') translate(' + (-c.x).toFixed(2) + 'px,' + (-c.y).toFixed(2) + 'px)';
    var rot = ' rotateZ(' + (-c.rz).toFixed(3) + 'deg) rotateX(' + (-c.tilt).toFixed(3) + 'deg)';
    bills.forEach(function (b) {
      b.el.style.transform = 'translate3d(' + b.x + 'px,' + b.y + 'px,' + b.z.toFixed(1) + 'px)' + rot + ' scale(' + Math.max(0.001, b.s * (c.bs || 1)).toFixed(4) + ')';
      b.el.style.opacity = b.o;
    });
    placeOv();
  }
  function placeOv() {
    if (!pinS) return;
    var sr = stage.getBoundingClientRect(), k = Math.max(0.55, Math.min(1, cam.z * ZK * 1.2));
    [pinS, pinD].forEach(function (p) {
      var r = p.a.el.firstChild.firstChild.getBoundingClientRect();
      p.el.style.transform = 'translate(' + (r.left + 1 - sr.left).toFixed(1) + 'px,' + (r.top + 1 - sr.top - p.drop).toFixed(1) + 'px) scale(' + k.toFixed(3) + ')';
      p.el.style.opacity = p.o;
    });
  }
  function lerpC(a, b, u) { var o = {}; for (var k in a) o[k] = a[k] + (b[k] - a[k]) * u; return o; }

  function build() {
    W = stage.clientWidth; H = stage.clientHeight; U = Math.min(H, W * 1.78); ZK = U / 925;
    mgv.style.setProperty('--H', H + 'px'); mgv.style.setProperty('--W', W + 'px'); mgv.style.setProperty('--U', U + 'px');
    [].forEach.call(mgv.querySelectorAll('*'), function (el) { el.style.transform = ''; delete el.__mg; });
    var g = $, t = new MG();
    var INTRO = { x: S[0] + 160, y: S[1] - 300, z: 0.42, tilt: 0, rz: 0, a: 0.5, bs: 1 };
    var OUT0 = { x: D[0] - 40, y: D[1] + 10, z: 0.58, tilt: 24, rz: -30, a: 0.78, bs: 1.1 };
    blds.forEach(function (b, i) {
      if (b.kind === 'gray') b.t0 = Math.max(0.9 + (i % 7) * 0.08, tOf(Math.max(0, b.np - 0.09)) - 0.2);
      else if (b.kind === 'shop') b.t0 = Math.max(1.4 + i * 0.03, tOf(Math.max(0, b.np - 0.07)));
      else b.t0 = 11.9;
    });
    var tTalk = tOf(0.455) - 0.1;
    t.each(function (s) {
      var p = prog(s), wIn = E.io(cl01((s - 0.15) / 2.1)), wOut = E.io(cl01((s - 14.0) / 1.8));
      var la = ptAt(Math.min(1, p + 0.025)), ew = eastW(p);
      var FOL = { x: la[0], y: la[1], z: 1.05, tilt: 52, rz: -36 * ew - 4 * (1 - ew), a: 0.58, bs: 1 };
      var OUT = lerpC(OUT0, { x: D[0] - 20, y: D[1], z: 0.62, tilt: 26, rz: -14, a: 0.78, bs: 1.1 }, E.lin(cl01((s - 15.8) / 4.2)));
      // 건물 솟기
      blds.forEach(function (b) {
        var u = cl01((s - b.t0) / (b.kind === 'off' ? 1.1 : 0.8)), v = b.kind === 'gray' ? E.out3(u) : E.spring(u);
        b.el.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px) scale3d(1,1,' + Math.max(0.002, v).toFixed(4) + ')';
        if (b.sign) { var su = cl01((s - b.t0 - 0.4) / 0.5); b.sign.s = su <= 0 ? 0.001 : E.back(su); b.sign.z = b.h * v + 4; }
      });
      var tu = cl01((s - tTalk) / 0.55); talk.s = tu <= 0 ? 0.001 : E.back(tu); talk.z = 0;
      var u1 = cl01((s - 0.45) / 0.85); pinS.o = s < 0.45 ? 0 : 1; pinS.drop = 240 * (1 - E.drop(u1));
      var u2 = cl01((s - 12.7) / 0.85); pinD.o = s < 12.7 ? 0 : 1; pinD.drop = 300 * (1 - E.drop(u2));
      // 점선 경로 + 머리
      rmask.style.strokeDashoffset = (1 - p).toFixed(4);
      var hp = ptAt(p), a1 = ptAt(Math.max(0, p - 0.004)), a2 = ptAt(Math.min(1, p + 0.004));
      var ang = Math.atan2(a2[1] - a1[1], a2[0] - a1[0]) * 180 / Math.PI + 90, pu = (s * 1.2) % 1;
      head.style.transform = 'translate3d(' + hp[0].toFixed(1) + 'px,' + hp[1].toFixed(1) + 'px,4px) rotate(' + ang.toFixed(1) + 'deg)';
      head.style.opacity = s < 2.2 ? 0 : 1;
      head.firstChild.style.transform = 'scale(' + (0.5 + pu * 0.9).toFixed(3) + ')'; head.firstChild.style.opacity = (1 - pu).toFixed(3);
      applyCam(lerpC(lerpC(INTRO, FOL, wIn), OUT, wOut));
    });
    t.to(ghost, 1.25, 1.0, { draw: [0, 1] }, 'io');

    /* 화면 글 */
    t.to(g('sum'), 0, 0.001, { o: [0, 0] }).to(g('sum'), 1.7, 0.55, { o: [0, 1], y: [-18, 0] }, 'out5').to(g('sum'), 14.1, 0.35, { o: [1, 0], y: [0, -18] }, 'in3');
    function say(n, a, b, out) {
      [[g('s' + n + 'a'), a], [g('s' + n + 'b'), b]].forEach(function (x) {
        t.to(x[0], 0, 0.001, { cl: [0, 0] }).to(x[0], x[1], 0.6, { cl: [0, 1] }, 'out3').to(x[0], x[1], 0.6, { x: [-16, 0] }, 'out5');
      });
      t.to(g('s' + n), 0, 0.001, { o: [1, 1] }).to(g('s' + n), out, 0.3, { o: [1, 0], y: [0, -14] }, 'in3');
    }
    say(1, 0.35, 0.85, 3.45); say(2, 3.85, 4.35, Math.min(6.9, tTalk - 0.05)); say(3, Math.max(tTalk + 0.3, 6.6), Math.max(tTalk + 0.8, 7.1), 10.8); say(4, 11.15, 11.65, 14.05);
    var veil = $('veil'); if (!veil) { veil = document.createElement('i'); veil.id = 'veil'; veil.className = 'veil'; mgv.insertBefore(veil, $('end')); }
    t.to(veil, 0, 0.001, { o: [0, 0] }).to(veil, 14.5, 0.9, { o: [0, 1] }, 'io');
    t.to(g('epin'), 0, 0.001, { o: [0, 0] }).to(g('epin'), 15.0, 0.001, { o: [0, 1] }, 'lin').to(g('epin'), 15.0, 0.95, { y: [-H * 0.32, 0] }, 'drop');
    t.to(g('ring'), 0, 0.001, { o: [0, 0] }).to(g('ring'), 15.32, 0.5, { o: [0, 1], s: [0.3, 1] }, 'out3');
    t.to(g('ek'), 0, 0.001, { o: [0, 0] }).to(g('ek'), 15.45, 0.4, { o: [0, 1] }, 'out3');
    t.to(g('ep'), 0, 0.001, { cl: [0, 0] }).to(g('ep'), 15.7, 0.55, { cl: [0, 1] }, 'out3').to(g('ep'), 15.7, 0.55, { y: [16, 0] }, 'out5');
    t.to(g('ev'), 0, 0.001, { o: [0, 0] }).to(g('ev'), 16.15, 0.4, { o: [0, 1] }, 'out3');
    t.to(g('et'), 0, 0.001, { o: [0, 0] }).to(g('et'), 16.45, 0.5, { o: [0, 1], y: [14, 0] }, 'out5');
    t.to(g('capcta'), 0, 0.001, { o: [0, 0] }).to(g('capcta'), 17.0, 0.45, { o: [0, 1], y: [24, 0] }, 'out5');
    tl = t;
  }

  function frame(ts) {
    if (T0 === null) T0 = ts;
    now = Math.min(DUR, (ts - T0) / 1000);
    tl.seek(now);
    if (now < DUR && !stopped) raf = requestAnimationFrame(frame);
  }
  function start() {
    drawMap(); build();
    if (CAP) { window.__seek = function (s) { tl.seek(s); return s; }; tl.seek(0); document.documentElement.classList.add('sb-shot'); return; }
    if (!isNaN(SEEK)) { tl.seek(SEEK); document.documentElement.classList.add('sb-shot'); return; }
    if (T.calm) { tl.seek(DUR); return; }
    tl.seek(0); raf = requestAnimationFrame(frame);
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
  var rz = 0;
  addEventListener('resize', function () {
    clearTimeout(rz); rz = setTimeout(function () {
      if (!tl) return; var keep = now; build();
      if (playing) { tl.seek(DUR); applyCam(PCAM[Math.min(step, 3)]); placePins(); } else tl.seek(CAP || !isNaN(SEEK) ? (SEEK || 0) : keep);
    }, 150);
  });

  /* ── 놀이: 지도 위 핀 고르기 → 경로가 이어짐 ── */
  var play = $('play'), pk = $('pk'), qq = $('q'), pinsEl = $('pins'), more = $('more');
  var busy = false, A = {}, step = 0, playing = false, esc = T.esc, cur = S, legN = 0, anchors = [];
  var PCAM = [
    { x: 960, y: 2250, z: 0.64, tilt: 26, rz: 0, a: 0.58, bs: 1.25 },
    { x: 960, y: 1640, z: 0.64, tilt: 26, rz: 0, a: 0.56, bs: 1.25 },
    { x: 960, y: 1130, z: 0.64, tilt: 26, rz: 0, a: 0.56, bs: 1.25 },
    { x: 1820, y: 900, z: 0.86, tilt: 44, rz: -12, a: 0.66, bs: 1 }
  ];
  var Q = [
    { q: '어떤 일을 하세요?', name: 'g', o: [['A', '도소매 · 온라인 판매', '', 780, 2480], ['B', '음식점 · 카페 · 제조', '', 780, 2320], ['C', '서비스 · 프리랜서 · 학원', '', 780, 2160], ['?', '그 밖의 업종', '', 780, 2000]],
      m: [['P', '전문직이에요', '의료·법률·세무 등'], ['X', '법인사업자예요']] },
    { q: '4대보험 직원은 몇 명이에요?', name: 'emp', o: [['few', '없음 ~ 5명', '', 780, 1740], ['many', '6명 이상', '', 780, 1480]], m: [] },
    { q: '', name: 'rev', o: [['low', '이하예요', '올해 시작했어도 이쪽', 780, 1250], ['high', '넘어요', '', 780, 960]], m: [['unk', '잘 모르겠어요']] }
  ];
  var PIN = '<svg viewBox="0 0 30 38" aria-hidden="true"><path d="M15 1C7.3 1 1 7.1 1 14.7 1 24.5 15 37 15 37s14-12.5 14-22.3C29 7.1 22.7 1 15 1z"/><circle cx="15" cy="14.5" r="5.5" fill="#fff"/></svg>';
  function placePins() {
    var sr = stage.getBoundingClientRect();
    anchors.forEach(function (a) {
      var r = a.dot.el.getBoundingClientRect(), x = r.left + r.width / 2 - sr.left, y = r.top + r.height / 2 - sr.top;
      a.btn.style.transform = 'translate(' + (x - 15).toFixed(1) + 'px,' + (y - a.btn.offsetHeight).toFixed(1) + 'px)';
    });
  }
  function clearPins() {
    anchors.forEach(function (a) { a.btn.remove(); a.dot.el.remove(); bills.splice(bills.indexOf(a.dot), 1); }); anchors = [];
  }
  function fly(to, ms) {
    var from = cam;
    if (T.calm || !ms) { applyCam(to); placePins(); return Promise.resolve(); }
    return new Promise(function (res) {
      var t0 = null;
      function f(ts) { if (t0 === null) t0 = ts; var u = cl01((ts - t0) / ms); applyCam(lerpC(from, to, E.io(u))); placePins(); if (u < 1) requestAnimationFrame(f); else res(); }
      requestAnimationFrame(f);
    });
  }
  function leg(a, b) {
    var id = 'lm' + (++legN), mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.1, my = (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.1;
    var d = 'M' + a[0] + ' ' + a[1] + 'Q' + mx.toFixed(0) + ' ' + my.toFixed(0) + ' ' + b[0] + ' ' + b[1];
    var m = mk('mask', { id: id, maskUnits: 'userSpaceOnUse', x: -400, y: -400, width: 3400, height: 4200 }, base.__defs);
    var mp = mk('path', { d: d, fill: 'none', stroke: '#fff', 'stroke-width': 60, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, m);
    var gg = mk('g', { mask: 'url(#' + id + ')' }, base.__legs);
    mk('path', { d: d, fill: 'none', stroke: '#fff', 'stroke-width': 22, 'stroke-linecap': 'round' }, gg);
    mk('path', { d: d, fill: 'none', stroke: '#FF5B2E', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-dasharray': '0.1 24' }, gg);
    mp.style.transition = T.calm ? 'none' : 'stroke-dashoffset .75s cubic-bezier(.6,0,.3,1)';
    requestAnimationFrame(function () { requestAnimationFrame(function () { mp.style.strokeDashoffset = 0; }); });
  }
  function render(n) {
    step = n; var d = Q[n];
    pk.innerHTML = '경유 ' + (n + 1) + ' / 3 ' + [0, 1, 2].map(function (i) { return '<i class="' + (i < n ? 'done' : i === n ? 'on' : '') + '"></i>'; }).join('');
    qq.textContent = n === 2 ? T.revQ(A.g) : d.q;
    clearPins();
    d.o.forEach(function (o, i) {
      var dot = { el: div('bb anc', '<div class="bbi"><i style="display:block;width:2px;height:2px"></i></div>'), x: o[3], y: o[4], z: 0, s: 1, o: 1 }; bills.push(dot);
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pb'; btn.setAttribute('data-v', o[0]);
      btn.innerHTML = PIN + '<span>' + esc(o[1]) + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</span>';
      pinsEl.appendChild(btn); anchors.push({ dot: dot, btn: btn, v: o[0], at: [o[3], o[4]] });
      setTimeout(function () { btn.classList.add('in'); }, T.calm ? 0 : 380 + i * 110);
    });
    more.innerHTML = d.m.map(function (o) { return '<button type="button" data-v="' + esc(o[0]) + '">' + esc(o[1]) + (o[2] ? '<small>' + esc(o[2]) + '</small>' : '') + '</button>'; }).join('');
    play.classList.remove('out'); play.classList.remove('in'); void play.offsetWidth; play.classList.add('in');
    return fly(PCAM[n], n === 0 && !anchors.moved ? 0 : 900);
  }
  function choose(v, btn) {
    if (busy) return; busy = true;
    if (btn) btn.classList.add('on');
    T.sfx('select');
    A[Q[step].name] = v;
    var a = anchors.filter(function (x) { return x.v === v; })[0];
    var to = (step === 0 && v === 'X') ? null : a ? a.at : [Q[step].o[0][3] + 140, Q[step].o[0][4] - 140];
    if (to) { leg(cur, to); cur = to; }
    T.wait(T.calm ? 0 : 820).then(function () { play.classList.add('out'); return T.wait(T.calm ? 0 : 200); }).then(function () {
      busy = false;
      if (step === 0 && v === 'X') return finish();
      if (step < 2) render(step + 1); else finish();
    });
  }
  pinsEl.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) choose(b.getAttribute('data-v'), b); });
  more.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) choose(b.getAttribute('data-v'), b); });
  $('again').addEventListener('click', function () { if (!busy) { T.sfx('tap'); reset(); render(0); } });
  function reset() { A = {}; cur = S; base.__legs.innerHTML = ''; }
  function finish() {
    busy = true; clearPins(); more.innerHTML = '';
    pk.innerHTML = '도착 ' + [0, 1, 2].map(function () { return '<i class="done"></i>'; }).join('');
    qq.textContent = '';
    leg(cur, [D[0], D[1]]); cur = D;
    return fly(PCAM[3], T.calm ? 0 : 1100).then(function () {
      var f = document.createElement('p'); f.className = 'arrive'; f.innerHTML = '<small>도착</small>담당 세무사';
      stage.appendChild(f); T.sfx('win');
      return T.wait(1200).then(function () {
        f.remove(); busy = false;
        T.result(A, { eye: '도착! 우리 가게 담당 세무사', again: '처음부터 다시', onAgain: function () { reset(); T.playing(true); render(0); } });
      });
    });
  }
  T.onPlay = function () {
    stopped = true; cancelAnimationFrame(raf); playing = true;
    if (tl) tl.seek(DUR);
    world.classList.add('pl'); ghost.style.opacity = 0; talk.o = 0; blds.forEach(function (b) { if (b.sign && b.kind === 'shop') b.sign.o = 0; }); rg.style.display = 'none'; reset(); play.hidden = false; render(0);
  };
})();
