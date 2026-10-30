 
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var q = new URLSearchParams(location.search);

  var LIVE_HOST = (root.getAttribute('data-live-host') || '').toLowerCase();
  var LOCAL = !LIVE_HOST || LIVE_HOST.indexOf('{') >= 0 || (location.hostname !== LIVE_HOST && location.hostname !== 'www.' + LIVE_HOST);
  var SHOT = q.has('shot');
  if (SHOT) root.classList.add('shot');
  var calm = SHOT || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $(id) { return doc.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }


  var HOOKS = {};
  var ALIAS = { insta: 'insta', instagram: 'insta', ig: 'insta', daangn: 'daangn', karrot: 'daangn', danggeun: 'daangn',
    youtube: 'youtube', yt: 'youtube', kakao: 'kakao', kakaotalk: 'kakao', blog: 'blog', naver: 'naver',
    facebook: 'facebook', fb: 'facebook', google: 'google', homepage: 'homepage' };
  var NAME = { insta: '인스타그램', daangn: '당근', youtube: '유튜브', kakao: '카카오톡', blog: '블로그', naver: '네이버',
    facebook: '페이스북', google: '구글', homepage: '세무회계 민 홈페이지', direct: '(주소에 표시 없음)' };
  function clean(s, n) { return String(s || '').replace(/[^0-9A-Za-z_\-]/g, '').slice(0, n || 24); }
  var rawSrc = clean(q.get('src') || q.get('utm_source')).toLowerCase();
  var srcKey = ALIAS[rawSrc] || rawSrc, guessed = false;
  if (!srcKey) {
    var ua = navigator.userAgent || '', ref = doc.referrer || '';
    if (/Instagram/i.test(ua) || /instagram\.com/i.test(ref)) srcKey = 'insta';
    else if (/karrot|daangn/i.test(ua) || /daangn|karrot/i.test(ref)) srcKey = 'daangn';
    else if (/FBAN|FBAV/i.test(ua) || /facebook\.com/i.test(ref)) srcKey = 'facebook';
    else if (/KAKAOTALK/i.test(ua)) srcKey = 'kakao';
    else if (/youtube\.com|youtu\.be/i.test(ref)) srcKey = 'youtube';
    else if (/naver\.com/i.test(ref)) srcKey = 'naver';
    else if (/google\./i.test(ref)) srcKey = 'google';
    guessed = !!srcKey;
  }
  if (!srcKey) srcKey = 'direct';
  var srcLabel = (NAME[srcKey] || srcKey) + (guessed ? '(주소 표시 없음 · 앱 정보로 짐작)' : '');
  var adKey = clean(q.get('v') || q.get('utm_content'), 30).toUpperCase();
  var campaign = clean(q.get('utm_campaign'), 40);

  var VARIANT = clean(root.getAttribute('data-variant'), 12).toLowerCase(), VNAME = root.getAttribute('data-variant-name') || '일반';
  var statAd = VARIANT ? (adKey ? adKey + '-' : '') + VARIANT.charAt(0).toUpperCase() : adKey;

  


  var sent = {};
  function hit(e, once) {
    if (LOCAL || SHOT || (once && sent[e])) return;
    sent[e] = 1;
    var body = 'e=' + e + '&s=' + encodeURIComponent(srcKey) + '&v=' + encodeURIComponent(statAd);
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('hit.php', new Blob([body], { type: 'application/x-www-form-urlencoded' }));
      else fetch('hit.php', { method: 'POST', body: body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, keepalive: true });
    } catch (x) {   }
  }
  hit('view');
  doc.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('[data-hit]') : null;
    if (a) hit(a.getAttribute('data-hit'));
  });


  var today = new Date(); today.setHours(0, 0, 0, 0);
  function biz(d) { while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return d; }
  function nextOf(list) {
    var best = null;
    for (var y = today.getFullYear(); y <= today.getFullYear() + 1; y++) list.forEach(function (md) {
      var d = biz(new Date(y, md[0], md[1]));
      if (d >= today && (!best || d < best)) best = d;
    });
    return best;
  }
  var WHT = nextOf([[0, 10], [1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10]]);
  var VAT = nextOf([[0, 25], [6, 25]]);
  var INC = nextOf([[4, 31]]);
  function dleft(d) { return Math.round((d - today) / 864e5); }
  function dtag(d) { var n = dleft(d); return n === 0 ? 'D-day' : 'D-' + n; }
  function md(d) { return (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; }
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  [['wht', WHT, '매달'], ['vat', VAT, '1·7월'], ['inc', INC, '해마다']].forEach(function (r) {
    var dd = doc.querySelector('[data-dd="' + r[0] + '"]'), dt = doc.querySelector('[data-dt="' + r[0] + '"]');
    if (dd) dd.textContent = dtag(r[1]);
    if (dt) dt.textContent = (r[1].getFullYear() !== today.getFullYear() ? r[1].getFullYear() + '년 ' : '') + md(r[1]) + '(' + DOW[r[1].getDay()] + ') · ' + r[2];
  });

 
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
    drop: function (t) {
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


  MG.track = function (rec, fps) {
    return function (t) {
      var f = t * fps, a = Math.floor(f), p = rec[a], q = rec[a + 1];
      if (!p) return q && f > a + 0.5 ? q : null;
      if (!q) return p;
      var u = f - a;
      return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u];
    };
  };


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


  var PR = (function () {
    var R = Math.PI / 180, BG = '#F7F5F2';

    var B = { w: 10, wt: 13.5, hr: 8.8, hg: 3.2, L1: 23, L2: 22, T: 28, s0: 2.5, A1: 19, A2: 18, gap: 1.7, sw: 4.6, hw: 3.4, foot: 5 };
    var EZ = {
      lin: function (u) { return u; },
      hold: function () { return 0; },
      in2: function (u) { return u * u; },
      out2: function (u) { return 1 - (1 - u) * (1 - u); },
      io2: function (u) { return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; },
      in3: function (u) { return u * u * u; },
      out3: function (u) { return 1 - Math.pow(1 - u, 3); },
      io: function (u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; },
      out5: function (u) { return 1 - Math.pow(1 - u, 5); },
      io5: function (u) { return u < .5 ? 16 * Math.pow(u, 5) : 1 - Math.pow(-2 * u + 2, 5) / 2; },
      back: function (u) { var c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
      back2: function (u) { var c = 2.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
      spring: function (u) { return u >= 1 ? 1 : 1 - Math.exp(-6.5 * u) * Math.cos(11 * u); },
      soft: function (u) { return u >= 1 ? 1 : 1 - Math.exp(-5 * u) * Math.cos(7.5 * u); }
    };
    function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
    function lerp(a, b, u) { return a + (b - a) * u; }

    function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
    var CH = ['x', 'y', 'lean', 'hd', 'ts', 'v', 'a1', 'e1', 'a2', 'e2', 't1', 'k1', 't2', 'k2'];
    var DEF = { x: 0, y: -50, lean: 0, hd: 0, ts: 1, v: 0, a1: 6, e1: 12, a2: -6, e2: 12, t1: 3, k1: 4, t2: -3, k2: 4, f: 1, F1: null, F2: null, H1: null, H2: null };
    var LIMB = { F1: ['t1', 'k1', 1], F2: ['t2', 'k2', 2], H1: ['a1', 'e1', 1], H2: ['a2', 'e2', 2] };


    function ik2(ox, oy, tx, ty, l1, l2, bend) {
      var dx = tx - ox, dy = ty - oy, d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      var dmax = l1 + l2 - 1e-3, dmin = Math.abs(l1 - l2) + 1e-3;
      if (d > dmax) { dx *= dmax / d; dy *= dmax / d; d = dmax; }
      if (d < dmin) { dx *= dmin / d; dy *= dmin / d; d = dmin; }
      var base = Math.atan2(dx, dy);
      var a = Math.acos(cl((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
      var t1 = base + bend * a, jx = ox + l1 * Math.sin(t1), jy = oy + l1 * Math.cos(t1);
      return [t1, Math.atan2(ox + dx - jx, oy + dy - jy)];
    }

    function near(a, ref) { while (a - ref > 180) a -= 360; while (a - ref < -180) a += 360; return a; }


    function roots(p) {
      var L = p.lean * R, ux = Math.sin(L), uy = -Math.cos(L), px = Math.cos(L), py = Math.sin(L);
      var T = B.T * p.ts, nx = T * ux, ny = T * uy, sx = nx - B.s0 * ux, sy = ny - B.s0 * uy;
      var sw = B.sw * p.v, hw = B.hw * p.v;
      return { nx: nx, ny: ny, s1: [sx - sw * px, sy - sw * py], s2: [sx + sw * px, sy + sw * py], h1: [-hw * px, -hw * py], h2: [hw * px, hw * py] };
    }

    function limbAngles(p, K) {
      var tg = p[K], rt = roots(p), leg = K.charAt(0) === 'F', idx = LIMB[K][2];
      var o = leg ? (idx === 1 ? rt.h1 : rt.h2) : (idx === 1 ? rt.s1 : rt.s2);
      var bend = tg[2] != null ? tg[2] : (leg ? 1 : -1);
      var tx = (tg[0] - p.x) * p.f, ty = tg[1] - p.y;
      var s = ik2(o[0], o[1], tx, ty, leg ? B.L1 : B.A1, leg ? B.L2 : B.A2, bend);
      var a1 = s[0] / R, a2 = s[1] / R;
      a1 = near(a1, p[LIMB[K][0]]);
      return leg ? [a1, a1 - near(a2, a1)] : [a1, near(a2, a1) - a1];
    }

    function mix(A, Bp, u, uc) {
      if (u <= 0 && !uc) return A;
      var p = {}, k, ch;
      for (k = 0; k < CH.length; k++) { ch = CH[k]; var w = uc && uc[ch] != null ? uc[ch] : u; p[ch] = A[ch] + (Bp[ch] - A[ch]) * w; }
      p.f = u < .5 ? A.f : Bp.f;
      for (var K in LIMB) {
        var ta = A[K], tb = Bp[K], c = LIMB[K];
        if (ta && tb) { p[K] = [lerp(ta[0], tb[0], u), lerp(ta[1], tb[1], u), u < .5 ? ta[2] : tb[2]]; continue; }
        p[K] = null;
        if (!ta && !tb) continue;
        if (ta) { var g = limbAngles(A, K); p[c[0]] = lerp(g[0], near(Bp[c[0]], g[0]), u); p[c[1]] = lerp(g[1], Bp[c[1]], u); }
        else { var h = limbAngles(Bp, K); p[c[0]] = lerp(near(A[c[0]], h[0]), h[0], u); p[c[1]] = lerp(A[c[1]], h[1], u); }
      }
      return p;
    }
    function full(d) { var p = {}; for (var k in DEF) p[k] = DEF[k]; for (k in d) p[k] = d[k]; return p; }


    function solve(p) {
      var q = {}, k; for (k in p) q[k] = p[k];
      for (var K in LIMB) if (p[K]) { var g = limbAngles(p, K); q[LIMB[K][0]] = g[0]; q[LIMB[K][1]] = g[1]; }
      var rt = roots(q), f = q.f, X = q.x, Y = q.y;
      function W(lx, ly) { return [X + f * lx, Y + ly]; }
      function seg(o, a, l) { return [o[0] + l * Math.sin(a * R), o[1] + l * Math.cos(a * R)]; }
      var e1 = seg(rt.s1, q.a1, B.A1), w1 = seg(e1, q.a1 + q.e1, B.A2), e2 = seg(rt.s2, q.a2, B.A1), w2 = seg(e2, q.a2 + q.e2, B.A2);
      var k1 = seg(rt.h1, q.t1, B.L1), f1 = seg(k1, q.t1 - q.k1, B.L2), k2 = seg(rt.h2, q.t2, B.L1), f2 = seg(k2, q.t2 - q.k2, B.L2);
      var hl = (q.lean + q.hd) * R, Dh = B.wt / 2 + B.hg + B.hr;
      var hc = [rt.nx + Dh * Math.sin(hl), rt.ny - Dh * Math.cos(hl)];
      return {
        p: q, H: [X, Y], N: W(rt.nx, rt.ny), C: W(hc[0], hc[1]),
        S1: W(rt.s1[0], rt.s1[1]), E1: W(e1[0], e1[1]), W1: W(w1[0], w1[1]), S2: W(rt.s2[0], rt.s2[1]), E2: W(e2[0], e2[1]), W2: W(w2[0], w2[1]),
        P1: W(rt.h1[0], rt.h1[1]), K1: W(k1[0], k1[1]), A1: W(f1[0], f1[1]), P2: W(rt.h2[0], rt.h2[1]), K2: W(k2[0], k2[1]), A2: W(f2[0], f2[1])
      };
    }


    function Keys(keys, opt) {
      var K = [], cur = full(opt && opt.base || {});
      keys.forEach(function (k) { var n = {}; for (var a in cur) n[a] = cur[a]; for (a in k[1]) n[a] = k[1][a]; cur = n; K.push({ t: k[0], p: n, e: k[2] || 'io', ez: k[3] }); });
      function sample(t) {
        if (t <= K[0].t) return K[0].p;
        for (var i = 0; i < K.length - 1; i++) {
          var a = K[i], b = K[i + 1];
          if (t < b.t) {
            var r = (t - a.t) / Math.max(1e-6, b.t - a.t), uc = null;
            if (a.ez) { uc = {}; for (var c in a.ez) uc[c] = EZ[a.ez[c]](r); }
            return mix(a.p, b.p, EZ[a.e](r), uc);
          }
        }
        return K[K.length - 1].p;
      }
      var lag = opt && opt.lag, fns = opt && opt.fn;
      return {
        keys: K,
        at: function (t) {
          var p = sample(t), o = null, k;
          if (lag) { o = {}; for (k in p) o[k] = p[k]; for (k in lag) { var s = sample(t - lag[k]); if (!(k.charAt(0) === 'a' && (p.H1 || p.H2))) o[k] = s[k]; } }

          if (fns) for (var i = 0; i < fns.length; i++) {
            var w = fns[i]; if (t < w[0] || t > w[1]) continue;
            if (!o) { o = {}; for (k in p) o[k] = p[k]; }
            for (k in w[2]) { var v = w[2][k](t); if (v != null) o[k] = v; }
          }
          return o || p;
        }
      };
    }

    function arcY(t0, y0, t1, y1, ya) {
      var T = t1 - t0, s = (Math.sqrt(2 * Math.max(0, y0 - ya)) + Math.sqrt(2 * Math.max(0, y1 - ya))) / T, g = s * s, vy = -Math.sqrt(2 * g * Math.max(0, y0 - ya));
      return function (t) { var u = t - t0; return y0 + vy * u + .5 * g * u * u; };
    }
    function lin(t0, a, t1, b, ez) { return function (t) { var u = cl((t - t0) / (t1 - t0), 0, 1); return a + (b - a) * (ez ? EZ[ez](u) : u); }; }


    function Run(o) {
      var dt = 1 / 240, f = o.f || 1, d = o.d || .36, S0 = o.S || 110, vRef = o.vRef || 200;
      var T = [], X = [], P = [], V = [];
      var t = o.t0, x = o.x0, v = o.v0 || 0, ph = o.ph0 || 0;
      function S(vv) { return S0 * (.55 + .45 * Math.min(vv / vRef, 1.3)); }
      var segs = o.segs.concat([[3, null]]);
      segs.forEach(function (sg) {
        var n = Math.max(1, Math.round(sg[0] / dt)), v0 = v, v1 = sg[1] == null ? v : sg[1];
        for (var i = 0; i < n; i++) {
          T.push(t); X.push(x); P.push(ph); V.push(v);
          var vn = v0 + (v1 - v0) * (i + 1) / n, vm = (v + vn) / 2;
          x += f * vm * dt; ph += vm / S(vm) * dt; v = vn; t += dt;
        }
      });
      T.push(t); X.push(x); P.push(ph); V.push(v);
      var N = T.length;
      function idx(tt) { var i = (tt - o.t0) / dt; return cl(i, 0, N - 1.0001); }
      function at(arr, tt) { var i = idx(tt), a = Math.floor(i), u = i - a; return arr[a] + (arr[a + 1] - arr[a]) * u; }
      function tOfPh(pp) {
        if (pp <= P[0]) return null;
        var lo = 0, hi = N - 1;
        if (pp > P[hi]) return T[hi] + (pp - P[hi]) * S(V[hi]) / Math.max(V[hi], 1);
        while (hi - lo > 1) { var m = (lo + hi) >> 1; if (P[m] < pp) lo = m; else hi = m; }
        var u = (pp - P[lo]) / Math.max(1e-9, P[hi] - P[lo]);
        return T[lo] + (T[hi] - T[lo]) * u;
      }
      var al = o.al || .4;
      function aHead(vv) { return al * d * S(vv); }

      var foot = [0, .5].map(function (off) {
        var memo = {};
        return function (k) {
          if (memo[k] != null) return memo[k];
          var tc = tOfPh(k + off), fx;
          if (tc == null) {
            var fr = P[0] - (k + off), vv = V[0];
            var rel = aHead(vv) - (fr / d) * d * S(vv);
            fx = X[0] + f * rel;
          } else fx = at(X, tc) + f * aHead(at(V, tc));
          memo[k] = fx; return fx;
        };
      });
      var lift = o.lift == null ? 1 : o.lift, LL = B.L1 + B.L2, gy = o.gy || 0;

      function cr(p0, p1, p2, p3, u) { var u2 = u * u, u3 = u2 * u; return .5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3); }
      function swing(pts, u) {
        var n = pts.length - 1, s = cl(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(s)), w = s - i;
        var a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], e = pts[Math.min(n, i + 2)];
        return [cr(a[0], b[0], c[0], e[0], w), cr(a[1], b[1], c[1], e[1], w)];
      }
      function legAt(j, tt, ph2, xh) {
        var off = j ? .5 : 0, pj = ph2 - off, k = Math.floor(pj), fr = pj - k;
        if (fr < d) return [foot[j](k), gy - B.foot];
        var to = tOfPh(k + off + d), tc = tOfPh(k + 1 + off), fx0 = foot[j](k), fx1 = foot[j](k + 1);
        var xo = to == null ? X[0] : at(X, to), xc = tc == null ? X[0] : at(X, tc);
        var r0 = (fx0 - xo) * f, r1 = (fx1 - xc) * f, Sv = S(at(V, tt)), u = (fr - d) / (1 - d);
        var sp = swing([[r0, 0], [r0 - .02 * Sv, .4 * LL * lift], [-.12 * Sv, .58 * LL * lift], [r1 + .16 * Sv, .34 * LL * lift], [r1 + .04 * Sv, .06 * LL * lift], [r1, 0]], u);
        return [xh + f * sp[0], gy - B.foot - sp[1]];
      }
      var arm = o.arm || [10, 52, 86, 20], h = o.h || 45, bob = o.bob == null ? 2.2 : o.bob;
      return {
        X: function (tt) { return at(X, tt); },
        at: function (tt) {
          var xh = at(X, tt), ph2 = at(P, tt), vv = at(V, tt);
          var by = -Math.cos(4 * Math.PI * (ph2 - d / 2)), lean = typeof o.lean === 'function' ? o.lean(tt) : (o.lean == null ? 12 : o.lean);
          var fw = -Math.cos(2 * Math.PI * (ph2 - .06)), k = cl(vv / vRef, 0, 1);
          var p = full({
            x: xh, y: gy - (h + bob * by * k), f: f, lean: lean + 1.6 * Math.sin(4 * Math.PI * ph2) * k, hd: -lean * .45,
            a1: arm[0] + arm[1] * fw * (.35 + .65 * k), e1: arm[2] + arm[3] * fw, a2: arm[0] - arm[1] * fw * (.35 + .65 * k), e2: arm[2] - arm[3] * fw
          });
          p.F1 = legAt(0, tt, ph2, xh).concat([1]); p.F2 = legAt(1, tt, ph2, xh).concat([1]);
          return p;
        }
      };
    }


    function Seq(list) {
      return {
        at: function (t) {
          var i = -1;
          for (var j = 0; j < list.length; j++) if (t >= list[j][1]) i = j;
          if (i < 0) return list[0][0].at(t);
          var c = list[i], p = c[0].at(t), bl = c[2] || 0;
          if (i > 0 && bl > 0 && t < c[1] + bl) p = mix(list[i - 1][0].at(t), p, EZ.io2((t - c[1]) / bl));
          return p;
        }
      };
    }


    var NS = 'http://www.w3.org/2000/svg';
    function el(tag, cls, parent) { var e = doc.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); if (parent) parent.appendChild(e); return e; }
    function Fig(parent, color, name) {
      var g = el('g', 'pf pf-' + name, parent), parts = {};
      ['a2', 'l2', 'tor', 'l1', 'a1', 'hd'].forEach(function (k) {
        var pg = el('g', 'pf-' + k, g), gp, ln;
        if (k === 'hd') { gp = el('circle', 'pf-gap', pg); ln = el('circle', null, pg); gp.setAttribute('r', B.hr + B.gap); ln.setAttribute('r', B.hr); ln.setAttribute('fill', color); }
        else {
          gp = el('path', 'pf-gap', pg); ln = el('path', 'pf-ln', pg);
          var w = k === 'tor' ? B.wt : B.w;
          gp.setAttribute('stroke-width', w + 2 * B.gap); ln.setAttribute('stroke-width', w); ln.setAttribute('stroke', color);
        }
        parts[k] = { g: pg, gp: gp, ln: ln, last: '' };
      });
      var front = false, hidden = false, F = { g: g, J: null, color: color, parts: parts };
      function pt(a) { return a[0].toFixed(2) + ',' + a[1].toFixed(2); }

      function trim(a, b, n) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, u = Math.min(n / l, .9); return [a[0] + dx * u, a[1] + dy * u]; }
      function set(k, d, dg) { var P = parts[k]; if (d !== P.last) { P.ln.setAttribute('d', d); P.gp.setAttribute('d', dg || d); P.last = d; } }
      F.draw = function (p) {
        if (!p) { if (!hidden) { g.style.visibility = 'hidden'; hidden = true; } return null; }
        if (hidden) { g.style.visibility = 'visible'; hidden = false; }
        var J = solve(p); F.J = J;
        var fr = p.v > .5;
        if (fr !== front) {
          front = fr;
          (fr ? ['tor', 'l2', 'l1', 'a2', 'a1', 'hd'] : ['a2', 'l2', 'tor', 'l1', 'a1', 'hd']).forEach(function (k) { g.appendChild(parts[k].g); });
        }

        var tn = B.wt / 2 + B.gap + (fr ? 8 : 0), tl = B.wt / 2 + .5;
        set('a1', 'M' + pt(J.S1) + 'L' + pt(J.E1) + 'L' + pt(J.W1), 'M' + pt(trim(J.S1, J.E1, tn)) + 'L' + pt(J.E1) + 'L' + pt(J.W1));
        set('l1', 'M' + pt(J.P1) + 'L' + pt(J.K1) + 'L' + pt(J.A1), 'M' + pt(trim(J.P1, J.K1, tl)) + 'L' + pt(J.K1) + 'L' + pt(J.A1));
        if (fr) {
          set('a2', 'M' + pt(J.S2) + 'L' + pt(J.E2) + 'L' + pt(J.W2), 'M' + pt(trim(J.S2, J.E2, tn)) + 'L' + pt(J.E2) + 'L' + pt(J.W2));
          set('l2', 'M' + pt(J.P2) + 'L' + pt(J.K2) + 'L' + pt(J.A2), 'M' + pt(trim(J.P2, J.K2, tl)) + 'L' + pt(J.K2) + 'L' + pt(J.A2));
        } else {
          set('a2', 'M' + pt(J.S2) + 'L' + pt(J.E2) + 'L' + pt(J.W2));
          set('l2', 'M' + pt(J.P2) + 'L' + pt(J.K2) + 'L' + pt(J.A2));
        }

        set('tor', 'M' + pt(J.H) + 'L' + pt(J.N));
        var hd = parts.hd, c = pt(J.C);
        if (c !== hd.last) { hd.last = c; hd.ln.setAttribute('cx', J.C[0].toFixed(2)); hd.ln.setAttribute('cy', J.C[1].toFixed(2)); hd.gp.setAttribute('cx', J.C[0].toFixed(2)); hd.gp.setAttribute('cy', J.C[1].toFixed(2)); }
        return J;
      };
      return F;
    }
    return { B: B, EZ: EZ, BG: BG, cl: cl, lerp: lerp, hash: hash, full: full, mix: mix, solve: solve, Keys: Keys, Run: Run, Seq: Seq, Fig: Fig, el: el, near: near, ik2: ik2, arcY: arcY, lin: lin };
  })();


  var MGk = (function () {
    var tl = new MG(), E = MG.E, EZ = PR.EZ, pg = $('pg'), camG = $('pg-cam'), svgW = $('pg-world');
    var OR = '#FF5B2E', K = '#17181C', cl = PR.cl, lerp = PR.lerp, D2R = Math.PI / 180;
    function q1(s, r) { return (r || doc).querySelector(s); }
    function qa(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
    function cl01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function el(tag, cls, parent, at) { var e = PR.el(tag, cls, parent); if (at) for (var k in at) e.setAttribute(k, at[k]); return e; }
    function f2(v) { return v.toFixed(2); }

    function keys(Kk) {
      return function (t) {
        if (t <= Kk[0][0]) return Kk[0][1];
        for (var i = 0; i < Kk.length - 1; i++) {
          var a = Kk[i], b = Kk[i + 1];
          if (t < b[0]) {
            var e = (EZ[a[2] || 'io'] || E[a[2]])(cl01((t - a[0]) / Math.max(1e-4, b[0] - a[0])));
            if (typeof a[1] === 'number') return a[1] + (b[1] - a[1]) * e;
            var o = []; for (var j = 0; j < a[1].length; j++) o.push(a[1][j] + (b[1][j] - a[1][j]) * e);
            return o;
          }
        }
        return Kk[Kk.length - 1][1];
      };
    }
    function bez(p0, p1, p2, u) { var v = 1 - u; return [v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]]; }


    var Lgnd = el('g', null, camG), Lobj = el('g', null, camG), Lsh = el('g', null, camG), Lfig = el('g', null, camG), Lfront = el('g', null, camG);
    var ground = el('path', 'pg-ground', Lgnd, { d: 'M-1200,0H4800' });


    var bossA = PR.Fig(Lfig, K, 'ba'), emps = [0, 1, 2, 3, 4].map(function (i) { return PR.Fig(Lfig, K, 'e' + i); }), bossB = PR.Fig(Lfig, K, 'bb'), tx = PR.Fig(Lfig, OR, 'tx');


    var TS = .46, TE = .92;
    var R0 = PR.Run({ t0: -.4, x0: -28 - 300 * (TS + .4), v0: 300, segs: [[1.3, 300]], S: 135, vRef: 300, d: .3, lean: 15, arm: [14, 62, 84, 24] });
    function slideX(t) { var u = cl(t - TS, 0, TE - TS); return -28 + 300 * u - 150 / (TE - TS) * u * u; }
    var KH = PR.Keys([
      [TS, { x: -28, y: -40, lean: 6, hd: -2, a1: 60, e1: 60, a2: -20, e2: 60, t1: 50, k1: 30, t2: -20, k2: 50 }, 'out3'],
      [.58, { y: -12, lean: -55, hd: 34, a1: 146, e1: 16, a2: 134, e2: 22, t1: 81, k1: 0, t2: 70, k2: 160 }, 'io'],
      [.76, { a1: 124, e1: 42, a2: 114, e2: 48, lean: -50 }, 'io'],
      [TE, { x: 41, y: -15, lean: -30, hd: 16, a1: 104, e1: 70, a2: 94, e2: 74 }, 'out3'],
      [1.08, { x: 44, y: -36, lean: 16, hd: -4, t1: 40, k1: 62, t2: -22, k2: 46, a1: 96, e1: 78, a2: 90, e2: 80 }, 'io'],
      [1.26, { x: 46, y: -49.5, lean: 2, hd: 0, t1: 4, k1: 6, t2: -4, k2: 6, a1: 86, e1: 82, a2: 80, e2: 84, F1: [52, -5], F2: [41, -5] }, 'io'],
      [1.4, { y: -47, a1: 78, e1: 88, lean: 4 }, 'io'],
      [1.58, { y: -51.5, a1: 152, e1: 18, a2: -26, e2: 30, hd: -6, lean: -2, t1: 2, k1: 2, t2: -2, k2: 2 }, 'out3'],
      [1.8, { y: -50, a1: 140, e1: 26, a2: -16, e2: 24, hd: 0, lean: 0 }, 'io'],
      [1.98, { y: -43, lean: 26, hd: -10, a1: 46, e1: 70, a2: -40, e2: 40, F1: [57, -5], F2: [35, -5] }, 'io'],
      [2.3, {}]
    ], { fn: [[TS, TE, { x: slideX }]], lag: { hd: .05, a2: .04, e2: .06 } });
    var R1 = PR.Run({ t0: 2.1, x0: 46, v0: 40, segs: [[.32, 260], [.8, 260]], S: 126, vRef: 260, d: .32, lean: function (t) { return 20 - 6 * cl01((t - 2.1) / .4); }, arm: [12, 55, 85, 22] });
    var XT1 = R1.X(2.62);


    var BX = 228, PLR = 15.5, PLX = 37, GRIP = 15;
    var barY = keys([[0, -PLR], [3.6, -PLR, 'out3'], [3.92, -79, 'out2'], [4.02, -76, 'io'], [4.2, -79, 'io'], [4.34, -74, 'out3'], [4.52, -110, 'out2'], [4.62, -107.5, 'io'], [4.9, -109], [5.76, -109, 'in2'], [6.12, -PLR, 'out2'], [6.2, -PLR - 5, 'in2'], [6.28, -PLR]]);
    function barTilt(t) {
      var a = 0;
      if (t > 4.52 && t < 5.9) { var u = t - 4.52; a += 3.4 * Math.exp(-3.4 * u) * Math.sin(10.5 * u); }
      if (t > 5.76 && t < 6.12) a += 2.4 * Math.sin(Math.PI * (t - 5.76) / .36);
      return a;
    }
    function grip(j) { return function (t) { var a = barTilt(t) * D2R, s = j ? 1 : -1; return [BX + s * GRIP * Math.cos(a), barY(t) + s * GRIP * Math.sin(a), j ? -1 : 1]; }; }
    var KL = PR.Keys([
      [2.62, { x: XT1, y: -46, lean: 12, hd: -6, a1: 128, e1: 24, a2: -40, e2: 30, t1: 62, k1: 70, t2: -32, k2: 12, v: 0, f: 1 }, 'out3'],
      [2.8, { lean: 0, hd: 0, a1: 178, e1: 0, a2: 176, e2: 2, t1: 0, k1: 0, t2: 0, k2: 0 }, 'lin'],
      [2.84, { v: 1, a1: 186, a2: 172 }, 'io'],
      [2.97, { a1: 250, e1: -6, a2: 110, e2: 6, t1: -26, k1: -26, t2: 26, k2: 26 }, 'io'],
      [3.05, { x: BX, y: -34, a1: 300, e1: -10, a2: 60, e2: 10, F1: [BX - 22, -5, -1], F2: [BX + 22, -5, 1] }, 'out3'],
      [3.2, { y: -26, ts: .88, H1: [BX - GRIP, -PLR, 1], H2: [BX + GRIP, -PLR, -1] }, 'io'],
      [3.45, { y: -29, ts: .9 }, 'io'],
      [3.6, { y: -26, ts: .87 }, 'out3'],
      [3.92, { y: -46, ts: 1 }, 'out2'],
      [4.02, { y: -41 }, 'io'],
      [4.2, { y: -48 }, 'io'],
      [4.34, { y: -42 }, 'out3'],
      [4.52, { y: -51 }, 'out2'],
      [4.62, { y: -45 }, 'io'],
      [4.9, { y: -50 }, 'lin'],
      [5.76, {}, 'out3'],
      [5.84, { y: -51, H1: null, H2: null, a1: 218, e1: 4, a2: 142, e2: -4 }, 'io'],
      [6.02, { y: -48, a1: 332, e1: -6, a2: 28, e2: 6 }, 'io'],
      [6.14, { y: -46.5 }, 'io'],
      [6.2, { y: -49.5, a1: 352, e1: -4, a2: 8, e2: 4 }, 'lin'],
      [6.2001, { a1: -8 }, 'out2'],
      [6.26, { y: -54, F1: null, F2: null, t1: 0, k1: 0, t2: 0, k2: 0, a1: -4, e1: 4, a2: 4, e2: 4 }, 'in2'],
      [6.3, { v: 0, y: -50 }, 'out3'],
      [6.38, { y: -44, lean: 24, hd: -10, a1: -45, e1: 60, a2: 40, e2: 70, F1: [BX + 10, -5], F2: [BX - 12, -5] }, 'io'],
      [6.7, {}]
    ], { fn: [[2.62, 3.05, { x: PR.lin(2.62, XT1, 3.05, BX), y: PR.arcY(2.62, -46, 3.05, -34, -72) }], [3.2, 5.76, { H1: grip(0), H2: grip(1) }],
      [4.9, 5.76, { y: function (t) { var u = t - 4.9; return -50 + .75 * Math.sin(2 * Math.PI * 1.7 * u) * Math.min(1, u / .2) * Math.min(1, (5.76 - t) / .2); } }]] });


    var R2 = PR.Run({ t0: 6.4, x0: BX, v0: 30, segs: [[.42, 270], [1.32, 270], [.6, 165], [1.2, 165]], S: 128, vRef: 270, d: .31, lean: 14, arm: [12, 56, 86, 22] });
    var TH = [7.0, 7.27, 7.54, 7.81, 8.08];
    function reach(clip, times, a, e, half) {
      return {
        at: function (t) {
          var p = clip.at(t), w = 0;
          times.forEach(function (th) { var u = 1 - Math.abs(t - th) / half; if (u > w) w = u; });
          if (w <= 0) return p;
          w = EZ.io2(Math.min(1, w * 1.7));
          var o = {}; for (var k in p) o[k] = p[k];
          o.a1 = lerp(p.a1, a, w); o.e1 = lerp(p.e1, e, w);
          return o;
        }
      };
    }
    var R2r = reach(R2, TH, 64, 16, .13);
    var EX = TH.map(function (th) { return R2.X(th) + 64; });


    var TJ = 9.6, XJ = R2.X(TJ), BW = 29, BGP = 6;
    var BXS = [XJ + 34, XJ + 34 + BW + BGP, XJ + 34 + 2 * (BW + BGP)], BHS = [22, 40, 58];
    var hops = [], hopFn = [];
    function hop(t0, x0, y0, t1, x1, top, ya) {
      var yl = top - 45;
      hops.push([t0, { x: x0, y: y0, lean: 10, hd: -4, a1: 128, e1: 30, a2: -24, e2: 40, t1: 62, k1: 76, t2: -30, k2: 14, F1: null, F2: null, v: 0, f: 1 }, 'io']);
      hops.push([t0 + (t1 - t0) * .5, { a1: 152, e1: 16, a2: 116, e2: 30, t1: 90, k1: 110, t2: 46, k2: 104, lean: 4 }, 'io']);
      hops.push([t1, { x: x1, y: yl, a1: 74, e1: 36, a2: 48, e2: 40, F1: [x1 + 6, top - 5], F2: [x1 - 6, top - 5], lean: 14, hd: -2 }, 'out3']);
      hops.push([t1 + .08, { y: yl + 8, lean: 20, hd: -6, a1: 30, e1: 60, a2: -12, e2: 50 }, 'io']);
      hopFn.push([t0, t1, { x: PR.lin(t0, x0, t1, x1), y: PR.arcY(t0, y0, t1, yl, ya) }]);
    }
    hop(TJ, XJ, -44, TJ + .24, BXS[0], -BHS[0], -84);
    hop(10.0, BXS[0], -62, 10.22, BXS[1], -BHS[1], -102);
    hop(10.38, BXS[1], -80, 10.64, BXS[2], -BHS[2], -122);
    var b9 = BXS[2], top9 = -BHS[2];
    var XL = b9 + 72;
    var KB = PR.Keys(hops.concat([
      [10.86, { v: 1, x: b9, y: top9 - 47, F1: [b9 - 8, top9 - 5, -1], F2: [b9 + 8, top9 - 5, 1], a1: -152, e1: -6, a2: 152, e2: 6, lean: 0, hd: 0 }, 'out3'],
      [11.02, { y: top9 - 48, a1: -165, e1: -2, a2: 165, e2: 2 }, 'io'],
      [11.24, { y: top9 - 47, a1: -150, e1: -6, a2: 150, e2: 6 }, 'io'],
      [11.42, { y: top9 - 40, a1: -124, e1: -34, a2: 124, e2: 34 }, 'out3'],
      [11.54, { y: top9 - 53, F1: null, F2: null, t1: -6, k1: -4, t2: 6, k2: 4, a1: -150, e1: -8, a2: 150, e2: 8 }, 'out2'],
      [11.65, { y: top9 - 61, t1: -12, k1: -22, t2: 12, k2: 22, a1: -166, e1: -2, a2: 166, e2: 2 }, 'in2'],
      [11.76, { y: top9 - 49, F1: [b9 - 8, top9 - 5, -1], F2: [b9 + 8, top9 - 5, 1], a1: -156, e1: -6, a2: 156, e2: 6 }, 'out3'],
      [11.86, { y: top9 - 43, a1: -146, a2: 146 }, 'io'],
      [12.02, { y: top9 - 47, a1: -152, a2: 152 }, 'io'],
      [12.24, { y: top9 - 46.6 }, 'io'],
      [12.36, { a1: -178, e1: 0, a2: 178, e2: 0, F1: [b9 - 3.4, top9 - 5, -1], F2: [b9 + 3.4, top9 - 5, 1] }, 'lin'],
      [12.4, { v: 0 }, 'io'],
      [12.52, { y: top9 - 38, lean: 22, hd: -8, a1: -50, e1: 30, a2: -60, e2: 30, F1: [b9 + 5, top9 - 5, 1], F2: [b9 - 5, top9 - 5, 1] }, 'io'],
      [12.66, { y: top9 - 45, lean: 10, hd: -4, a1: 110, e1: 20, a2: 100, e2: 20, F1: null, F2: null, t1: 50, k1: 40, t2: -30, k2: 20 }, 'out3'],
      [12.86, { a1: 92, e1: 24, a2: 70, e2: 30, t1: 58, k1: 34, t2: 28, k2: 54, lean: 6 }, 'io'],
      [13.04, { x: XL, y: -34, a1: 60, e1: 30, a2: 40, e2: 30, lean: 30, hd: -10, F1: [XL + 8, -5], F2: [XL - 20, -5] }, 'out3'],
      [13.16, { y: -30, lean: 70, hd: -40, H1: [XL + 27, -5, -1], H2: [XL + 25, -5, -1] }, 'io'],
      [13.34, { y: -35, lean: 77, hd: -46 }, 'io'],
      [13.6, {}]
    ]), { fn: hopFn.concat([[12.66, 13.04, { x: PR.lin(12.66, b9, 13.04, XL), y: PR.arcY(12.66, top9 - 45, 13.04, -34, top9 - 60) }]]) });


    var TG = 13.38;
    var R3 = PR.Run({ t0: TG, x0: XL, v0: 70, segs: [[.55, 330], [.4, 330], [.373, 0]], S: 140, vRef: 330, d: .3, ph0: .03,
      lean: function (t) { return 16 + 32 * Math.pow(1 - cl01((t - TG) / .75), 2); }, arm: [14, 64, 84, 24] });
    var TXF = 14.25, XF = R3.X(TXF) + 8;
    var XS = R3.X(TG + 1.323);
    var KF = PR.Keys([
      [14.62, { x: XS - 5, y: -46, lean: -8, hd: 6, a1: 50, e1: 50, a2: -40, e2: 40, t1: 24, k1: 10, t2: -20, k2: 20, f: 1, v: 0, F1: null, F2: null, H1: null, H2: null }, 'io'],
      [14.82, { x: XS, y: -50, lean: 0, hd: 0, a1: 4, e1: 10, a2: -4, e2: 10, t1: 3, k1: 4, t2: -3, k2: 4, F1: [XS + 4, -5], F2: [XS - 4, -5] }, 'io'],
      [14.9, { y: -53, F1: null, F2: null, t1: 0, k1: 0, t2: 0, k2: 0, a1: 0, e1: 4, a2: 0, e2: 4 }, 'lin'],
      [14.93, { f: -1 }, 'io'],
      [15.0, { y: -49, F1: [XS - 4, -5], F2: [XS + 4, -5] }, 'io'],
      [15.1, { a1: 158, e1: -12, a2: -6, e2: 12, y: -50, lean: -3 }, 'out3'],
      [15.22, { a1: 140, e1: 14 }, 'io'], [15.34, { a1: 162, e1: -14 }, 'io'], [15.46, { a1: 140, e1: 14 }, 'io'], [15.58, { a1: 158, e1: -10 }, 'io'],
      [15.76, { y: -43, lean: 9, hd: -4, a1: 8, e1: 112, a2: -16, e2: 60, F1: [XS - 9, -5], F2: [XS + 9, -5] }, 'io'],

      [16.86, { a1: 4, e1: 108, lean: 8 }, 'io'],
      [17.0, { y: -42, a1: -12, e1: 70, lean: 4 }, 'out3'],
      [17.08, { a1: 96, e1: 24, lean: 20 }, 'out3'],
      [17.24, { a1: 140, e1: 10, lean: 24, y: -44 }, 'io'],
      [17.56, { a1: 8, e1: 112, lean: 9, y: -43 }, 'io'],
      [18.4, { y: -44, lean: 14 }, 'io'],
      [18.95, { y: -43, lean: 16 }, 'io'],

      [19.02, { y: -53, lean: 0, hd: 0, a1: 0, e1: 4, a2: 0, e2: 4, F1: null, F2: null, t1: 0, k1: 0, t2: 0, k2: 0 }, 'lin'],
      [19.05, { f: 1 }, 'io'],
      [19.13, { y: -44, lean: 26, hd: -10, a1: -45, e1: 60, a2: 40, e2: 70, F1: [XS + 10, -5], F2: [XS - 12, -5] }, 'io'],
      [19.4, {}]
    ], { lag: { hd: .05, a2: .05, e2: .07 } });
    var R4 = PR.Run({ t0: 19.2, x0: XS, v0: 30, segs: [[.32, 300], [.6, 300]], S: 135, vRef: 300, d: .3, lean: 15, arm: [14, 62, 84, 24] });
    var TL0 = 19.62, TL1 = 20.14, XL0 = R4.X(TL0), XL1 = XL0 + 128;
    var KJ = PR.Keys([
      [TL0, { x: XL0, y: -46, lean: 8, hd: -4, a1: 150, e1: 20, a2: -30, e2: 30, t1: 70, k1: 80, t2: -34, k2: 10, f: 1, v: 0, F1: null, F2: null }, 'io'],
      [19.8, { lean: -6, hd: 4, a1: 176, e1: 8, a2: 170, e2: 10, t1: 18, k1: 84, t2: 8, k2: 92 }, 'io'],
      [19.98, { lean: 26, hd: -8, a1: 100, e1: 20, a2: 88, e2: 22, t1: 96, k1: 10, t2: 90, k2: 14 }, 'io'],
      [TL1, { x: XL1, y: -30, lean: 34, a1: 70, e1: 22, a2: 60, e2: 22, F1: [XL1 + 24, -5], F2: [XL1 + 20, -5] }, 'out3'],
      [20.26, { x: XL1 + 12, y: -24, lean: 40, hd: -10, a1: 56, e1: 30, a2: 46, e2: 30 }, 'out3'],
      [21, {}]
    ], { fn: [[TL0, TL1, { x: PR.lin(TL0, XL0, TL1, XL1), y: PR.arcY(TL0, -46, TL1, -30, -116) }]] });

    var TX = PR.Seq([[R0, -1], [KH, TS, .06], [R1, 2.1, .14], [KL, 2.62, .05], [R2r, 6.4, .12], [KB, TJ, .06], [R3, TG, .07], [KF, 14.62, .16], [R4, 19.2, .08], [KJ, TL0, .05]]);
    var LJ = PR.solve(TX.at(20.27)), LMX = (LJ.H[0] + LJ.N[0]) / 2;


    var JW = 2 * Math.PI * 2.3;
    var bossJ = { at: function (t) { return PR.full({ x: 10, y: -48 + 1.1 * Math.sin(2 * JW * t), v: 1, lean: 3.2 * Math.sin(JW * t), hd: 5 * Math.sin(JW * t + 1),
      a1: -60 + 12 * Math.sin(JW * t), e1: -108 + 16 * Math.sin(JW * t + .7), a2: 60 + 12 * Math.sin(JW * t + Math.PI), e2: 108 + 16 * Math.sin(JW * t + Math.PI + .7),
      F1: [1, -5, -1], F2: [19, -5, 1] }); } };
    var KA = PR.Keys([
      [.64, { x: 10, y: -48, v: 1, a1: -60, e1: -108, a2: 60, e2: 108, F1: [1, -5, -1], F2: [19, -5, 1] }, 'out3'],
      [.84, { y: -51, a1: -150, e1: -24, a2: 150, e2: 24, lean: 0, hd: 0 }, 'io'],
      [1.1, { y: -48, a1: -20, e1: -14, a2: 20, e2: 14, hd: 9 }, 'out3'],
      [1.36, { y: -50, H1: [1, -51, -1], H2: [19, -51, 1], hd: -5 }, 'io'],
      [1.62, { y: -48.4, ts: .96, hd: 3 }, 'io'],
      [1.98, { y: -50, ts: 1, hd: 0 }, 'io'],
      [3, {}]
    ], { lag: { hd: .06, e1: .04, e2: .04 } });
    var BA = PR.Seq([[bossJ, -1], [KA, .64, .1]]);


    var TXW = TH.map(function (th) { return PR.solve(TX.at(th)).W1; });
    var EMP = EX.map(function (x, i) {
      var th = TH[i], hp = TXW[i];
      return PR.Keys([
        [0, { x: x, y: -50, v: 1, a1: -10, e1: -6, a2: 10, e2: 6, F1: [x - 9, -5, -1], F2: [x + 9, -5, 1] }, 'io'],
        [th - .44, {}, 'io'],
        [th - .1, { y: -49, lean: -6, H1: [hp[0], hp[1], 1] }, 'out3'],
        [th + .02, {}, 'out3'],
        [th + .24, { y: -52.5, lean: 2, H1: null, a1: -174, e1: 4, a2: 22, e2: 8 }, 'io'],
        [th + .46, { y: -50, lean: 0, a1: -166, e1: -2, a2: 12, e2: 6 }, 'io'],
        [12, {}]
      ], { lag: { hd: .06, a2: .05, e2: .07 } });
    });


    var RB = PR.Run({ t0: 14.2, x0: XF - 2 - (125 * .94 + 125 * .45 / 2), v0: 125, segs: [[.94, 125], [.45, 0]], S: 96, vRef: 125, d: .38, lean: 8, arm: [8, 36, 88, 16], lift: .8 });
    var KBB = PR.Keys([
      [15.5, { x: XF - 2, y: -49, lean: -2, hd: 2, a1: 10, e1: 20, a2: -10, e2: 20, F1: [XF + 3, -5], F2: [XF - 7, -5], f: 1, v: 0 }, 'io'],
      [15.66, { y: -50, a1: 150, e1: -8 }, 'out3'],
      [15.78, { a1: 134, e1: 12 }, 'io'], [15.9, { a1: 150, e1: -8 }, 'io'],
      [16.06, { y: -43, lean: 9, hd: -4, a1: 8, e1: 112, a2: -16, e2: 60, F1: [XF + 7, -5], F2: [XF - 11, -5] }, 'io'],
      [16.2, { hd: -10 }, 'io'],
      [16.38, { a2: 60, e2: 40, hd: -2 }, 'io'],
      [16.47, { a1: -20, e1: 60, lean: 8 }, 'out3'],
      [16.55, { a1: 100, e1: 22, lean: 22 }, 'out3'],
      [16.72, { a1: 140, e1: 10, lean: 26, a2: -16, e2: 60 }, 'io'],
      [16.98, { a1: 8, e1: 112, lean: 9 }, 'io'],
      [17.5, { hd: 16 }, 'io'], [17.64, { hd: -2 }, 'io'], [17.8, { hd: 14 }, 'io'], [17.96, { hd: 0 }, 'io'],
      [18.2, { y: -48, lean: 4, a1: 40, e1: 40, a2: 150, e2: -30 }, 'out3'],
      [18.5, { y: -49, a2: 136, e2: -20 }, 'io'],
      [18.9, { a2: 10, e2: 10, a1: 20, e1: 20, lean: 0 }, 'io'],
      [21, {}]
    ], { lag: { hd: .05, a2: .05, e2: .07 } });
    var BB = PR.Seq([[RB, 14.2], [KBB, 15.4, .18]]);

    function padAt(track, t) { var J = PR.solve(track.at(t)), dx = J.W1[0] - J.E1[0], dy = J.W1[1] - J.E1[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [J.W1[0] + dx / l * 7.5, J.W1[1] + dy / l * 7.5]; }
    var HITB = padAt(BB, 16.55), HITT = padAt(TX, 17.08);


    var RC = [0, 1, 2, 3, 4, 5].map(function (i) {
      var g = el('g', 'rc', Lfront);
      el('rect', 'rc-g', g, { x: -6.5, y: -8.5, width: 13, height: 17, rx: 1 });
      el('rect', 'rc-p', g, { x: -6.5, y: -8.5, width: 13, height: 17, rx: 1 });
      [-4, -1, 2].forEach(function (y, j) { el('path', 'rc-l', g, { d: 'M-3.6,' + y + 'H' + (j === 2 ? 1 : 3.6) }); });
      return g;
    });

    var BBg = el('g', 'bb', Lfront), bbBarG = el('path', 'pg-gapline', BBg, { d: 'M-57,0H57', 'stroke-width': 3.6 + 2 * 1.7 }), bbBar = el('path', 'bb-bar', BBg, { d: 'M-57,0H57' });
    el('path', 'bb-col', BBg, { d: 'M-' + (PLX - PLR - 2) + ',-4.2V4.2M' + (PLX - PLR - 2) + ',-4.2V4.2' });
    var PL = [-1, 1].map(function (s, j) {
      var g = el('g', null, BBg, { transform: 'translate(' + s * PLX + ',0)' });
      el('circle', 'bb-gap', g, { r: PLR + 1.7 });
      el('circle', 'bb-pl0', g, { r: PLR });
      var fill = el('circle', null, g, { r: PLR, fill: j ? K : OR });
      el('circle', null, g, { r: PLR * .34, fill: 'rgba(255,255,255,.14)' });
      return { fill: fill };
    });
    var FIST = [0, 1].map(function () { var g = el('g', null, Lfront); el('circle', 'pf-gap', g, { r: PR.B.w / 2 + 1.7 }); el('circle', 'bb-fist', g, { r: PR.B.w / 2 + .2 }); return g; });

    var EV = [0, 1, 2, 3, 4].map(function () {
      var g = el('g', 'ev', Lfront);
      el('rect', 'ev-g', g, { x: -8.7, y: -6.2, width: 17.4, height: 12.4, rx: 2.6 });
      el('rect', 'ev-b', g, { x: -7, y: -4.5, width: 14, height: 9, rx: 1.6 });
      el('path', 'ev-f', g, { d: 'M-5,-2.6L0,1L5,-2.6' });
      return g;
    });

    var BR = BXS.map(function (x, k) {
      var g = el('g', null, Lobj), last = k === 2;
      var b = el('path', 'br-b' + (last ? ' last' : ''), g);
      var land = [[TJ + .24, 10.22, 10.64][k]].concat(k === 2 ? [11.76] : []), hk = [[0, 0], [9.2 + .12 * k, 0, 'back'], [9.52 + .12 * k, BHS[k]]];
      land.forEach(function (tl0) { hk.push([tl0, BHS[k], 'out3']); hk.push([tl0 + .06, BHS[k] - 2.2, 'soft']); hk.push([tl0 + .4, BHS[k]]); });
      return { g: g, b: b, x: x, h: keys(hk) };
    });
    function barTop(x, t) { for (var k = 0; k < BR.length; k++) { var b = BR[k]; if (Math.abs(x - b.x) <= BW / 2 + 2) return -b.h(t); } return 0; }

    var FNg = el('g', null, Lobj), fnL = el('path', 'fn-l', FNg, { d: 'M' + XF + ',0V-114' }), fnR = el('circle', 'fn-r', FNg, { cx: XF, cy: -62, r: 6 });

    var TT0 = XF + 19, TT1 = XF + 59, TTM = (TT0 + TT1) / 2, TTH = 30;
    var TTg = el('g', null, Lobj), ttLeg = el('path', 'tt-leg', TTg), ttTop = el('path', 'tt-top', TTg), ttNet = el('path', 'tt-net', TTg);
    var ttY = keys([[0, 0], [15.6, 0, 'back'], [15.98, -TTH], [18.98, -TTH, 'in3'], [19.28, 0]]);
    var PD = [[tx, OR], [bossB, K]].map(function (p) { var g = el('g', null, Lfront); el('circle', 'pf-gap', g, { r: 6.8 }); el('path', 'pg-gapline', g, { d: 'M0,0L0,0', 'stroke-width': 2.2 + 3.4 }); el('circle', 'pd-b', g, { r: 5.1, fill: p[1] }); el('path', 'tt-leg', g, { d: 'M0,0L0,0', stroke: p[1] }); return { g: g, F: p[0] }; });
    function bubble(lines, fill) {
      var g = el('g', 'bu', Lfront), gp = el('path', 'bu-g', g), b = el('path', 'bu-b', g, { fill: fill }), ts = [];
      lines.forEach(function (ln, k) { var t = el('text', 'bu-t', g, { y: (2.5 + (k - (lines.length - 1) / 2) * 8.6).toFixed(2) }); t.textContent = ln; ts.push(t); });
      return { g: g, gp: gp, b: b, ts: ts, w: 60, h: lines.length > 1 ? 25 : 16.5 };
    }
    var BQ = bubble(['이거 경비', '되나요?'], K), BA2 = bubble(['네, 영수증 사진만 주세요.'], OR);
    function shapeBubble(B, tail) {
      var w = B.w, h = B.h, r = Math.min(h / 2, 8.25), x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2, tx0 = tail * (w / 2 - Math.max(10, r + 3));
      function A(x, y) { return 'A' + r + ',' + r + ' 0 0 1 ' + f2(x) + ',' + f2(y); }
      var d = 'M' + f2(x0 + r) + ',' + f2(y0) + 'H' + f2(x1 - r) + A(x1, y0 + r) + 'V' + f2(y1 - r) + A(x1 - r, y1) +
        'H' + f2(tx0 + (tail > 0 ? 3 : 6)) + 'L' + f2(tx0 + tail * 3) + ',' + f2(y1 + 5) + 'L' + f2(tx0 - (tail > 0 ? 6 : 3)) + ',' + f2(y1) +
        'H' + f2(x0 + r) + A(x0, y1 - r) + 'V' + f2(y0 + r) + A(x0 + r, y0) + 'Z';
      B.b.setAttribute('d', d); B.gp.setAttribute('d', d); B.gp.setAttribute('stroke', 'var(--bg)'); B.gp.setAttribute('stroke-width', 3.4); B.gp.setAttribute('stroke-linejoin', 'round');
    }

    var SIGH = el('g', null, Lfront), sighP = [0, 1, 2].map(function () { return el('path', 'sigh', SIGH); });

    var SH = [tx, bossA, bossB].concat(emps).map(function (F) { return { F: F, e: el('ellipse', 'pg-shadow', Lsh, { ry: 2.4 }) }; });


    var W = 390, H = 844, FRM = {}, CAM = null, caps = qa('.pg-cap'), CTA_T = 844;
    var FDEF = {
      hook: { box: [-42, -162, 72, 12], cap: 0, m: 8 },
      lift: { box: [BX - 56, -132, BX + 56, 4], cap: 1, m: 6 },
      runL: { follow: 1, box: [0, -132, 112, 4], cap: 0, m: 6 },
      jump: { follow: 1, box: [0, -128, 150, 4], cap: -1 },
      relay: { follow: 1, box: [0, -126, 114, 4], cap: 2 },
      wide: { box: [EX[0] - 32, -250, EX[4] + 44, 6], cap: 2, m: 6 },
      bars0: { box: [BXS[0] - 58, -96, BXS[2] + 26, 6], cap: 3, m: 8 },
      barsTop: { box: [BXS[0] - 20, -186, BXS[2] + 24, 4], cap: 3, m: 8 },
      sprint: { follow: 1, box: [0, -130, 112, 4], cap: 4 },
      finish: { box: [XF - 22, -130, XF + 100, 4], cap: 4, m: 6 },
      pong: { box: [XF - 18, -136, XF + 98, 4], cap: 5, m: 6 },
      logo: { box: [LMX - 64, -118, LMX + 64, 4], cap: -1 }
    };
    function frame(f) {
      var hd = q1('.pg-hd'), hdB = hd.offsetTop + hd.offsetHeight, top, bot, m = 14;
      var floor = Math.min(H - 18, CTA_T - 24);
      var c = f.cap >= 0 ? caps[f.cap] : null;
      if (c && c.classList.contains('top')) { top = c.offsetTop + c.offsetHeight + 18; bot = floor; }
      else if (c) { top = hdB + 22; bot = Math.min(floor, c.offsetTop - 18); }
      else { top = hdB + 20; bot = floor - 12; }
      if (f.m != null) m = f.m;
      var bw = f.box[2] - f.box[0], bh = f.box[3] - f.box[1], zCap = .5 * H / 105;
      if (bot - top < 80) { top = Math.max(0, H * .3); bot = Math.max(top + 80, floor); }
      var z = Math.max(.2, Math.min((W - 2 * m) / bw, (bot - top) / bh, zCap));
      var cx = (f.box[0] + f.box[2]) / 2, cy = (f.box[1] + f.box[3]) / 2 - ((top + bot) / 2 - H / 2) / z;
      return { x: cx, y: cy, z: z, follow: f.follow };
    }
    var CKS = [[0, 'hook'], [2.1, 'hook', 'io'], [2.46, ['runL', 26]], [2.62, ['runL', 26], 'io'], [3.0, 'lift'], [6.34, 'lift', 'io'], [6.9, ['relay', 20]], [8.12, ['relay', 20], 'io'], [8.7, 'wide'], [8.95, 'wide', 'io'],
      [9.62, 'bars0', 'io'], [10.74, 'barsTop'], [12.42, 'barsTop', 'io'], [13.1, ['sprint', 22]], [14.4, ['sprint', 22], 'io'], [15.0, 'finish'], [15.62, 'finish', 'io'], [15.98, 'pong'], [19.12, 'pong', 'io'], [19.5, ['jump', 30]], [19.95, ['jump', 30], 'io'], [20.3, 'logo']];
    function camAt(t) {
      function one(k, tt) {
        var nm = typeof k === 'string' ? k : k[0], f = FRM[nm];
        if (!f.follow) return [f.x, f.y, f.z];
        return [TX.at(tt).x + k[1], f.y, f.z];
      }
      if (t <= CKS[0][0]) return one(CKS[0][1], t);
      for (var i = 0; i < CKS.length - 1; i++) {
        var a = CKS[i], b = CKS[i + 1];
        if (t < b[0]) {
          var u = EZ[a[2] || 'io'](cl01((t - a[0]) / (b[0] - a[0]))), A = one(a[1], t), Bc = one(b[1], t);
          return [lerp(A[0], Bc[0], u), lerp(A[1], Bc[1], u), Math.exp(lerp(Math.log(A[2]), Math.log(Bc[2]), u))];
        }
      }
      return one(CKS[CKS.length - 1][1], t);
    }
    function toScr(p, c) { return [(p[0] - c[0]) * c[2] + W / 2, (p[1] - c[1]) * c[2] + H / 2]; }


    var CUR = [0, 0, 1], lastCam = '', LB0 = 20.27, J262 = null, bbBack = false;
    var headHide = false;
    tl.each(function (t) {
      var c = camAt(t); CUR = c;
      var tf = 'translate(' + f2(W / 2) + ',' + f2(H / 2) + ') scale(' + c[2].toFixed(4) + ') translate(' + f2(-c[0]) + ',' + f2(-c[1]) + ')';
      if (tf !== lastCam) { camG.setAttribute('transform', tf); lastCam = tf; }

      var pT = TX.at(t), JT = tx.draw(pT);
      bossA.draw(t < 3.4 ? BA.at(t) : null);
      emps.forEach(function (F, i) { F.draw(t > 5.6 && t < 10.6 ? EMP[i].at(t) : null); });
      bossB.draw(t > 14.2 && t < 21 ? BB.at(t) : null);

      var hh = t >= LB0;
      if (hh !== headHide) { headHide = hh; tx.parts.hd.g.style.visibility = hh ? 'hidden' : 'visible'; }


      var hand2 = JT ? [(JT.W1[0] + JT.W2[0]) / 2, (JT.W1[1] + JT.W2[1]) / 2] : [0, 0];
      var one = cl01((t - 1.3) / .15), hb = JT ? [lerp(hand2[0], JT.W1[0], one), lerp(hand2[1], JT.W1[1], one)] : hand2;
      RC.forEach(function (g, i) {
        var th = 2 * Math.PI * (1.18 * t + i / 6) + PR.hash(i) * .6, rr = 1 + .12 * (PR.hash(i + 7) - .5);
        var orb = [10 + 25 * rr * Math.cos(th), -116 + 31 * rr * Math.sin(th)], rot = (i % 2 ? 1 : -1) * 260 * t + i * 47;
        var slot = [hb[0] + (i - 2.5) * .5, hb[1] - 7 - i * 1.5], srot = (i - 2.5) * 2.4;
        var tc = .58 + .032 * i, u = E.io(cl01((t - tc) / .15)), x, y, r, s = 1, o = 1;
        if (t < 2.62) { x = lerp(orb[0], slot[0], u); y = lerp(orb[1], slot[1], u); r = lerp(rot, srot, u); }
        else {
          var J0 = J262 || (J262 = PR.solve(TX.at(2.62))), h0 = [J0.W1[0] + (i - 2.5) * .5, J0.W1[1] - 7 - i * 1.5];
          var to = [BX + (i < 3 ? -PLX : PLX), -PLR], ta = 2.86 + .05 * (i % 3) + (i < 3 ? 0 : .025), w = cl01((t - 2.62) / (ta - 2.62));
          var p = bez(h0, [(h0[0] + to[0]) / 2 + (i < 3 ? -10 : 20), -128 - 6 * (i % 3)], to, E.io(w));
          x = p[0]; y = p[1]; r = srot + (i < 3 ? -1 : 1) * 300 * w; s = 1 - .55 * w; o = w >= 1 ? 0 : 1;
        }
        g.setAttribute('transform', 'translate(' + f2(x) + ',' + f2(y) + ') rotate(' + r.toFixed(1) + ') scale(' + s.toFixed(3) + ')');
        g.style.opacity = o;
      });

      var by = barY(t), bt = barTilt(t), back = t >= 6.22;
      if (back !== bbBack) { bbBack = back; (back ? Lobj : Lfront).appendChild(BBg); }
      BBg.setAttribute('transform', 'translate(' + BX + ',' + f2(by) + ') rotate(' + bt.toFixed(2) + ')');
      PL.forEach(function (P, j) {
        var n = 0; for (var i = 0; i < 3; i++) if (t >= 2.86 + .05 * i + (j ? .025 : 0)) n++;
        var a0 = 2.86 + (j ? .025 : 0), s = n ? E.back(cl01((t - a0) / .26)) : 0;
        P.fill.setAttribute('r', (PLR * Math.min(1, s)).toFixed(2));
      });
      var gripOn = t >= 3.2 && t < 5.76;
      FIST.forEach(function (g, j) {
        g.style.visibility = gripOn && JT ? 'visible' : 'hidden';
        if (gripOn && JT) { var w = j ? JT.W2 : JT.W1; g.setAttribute('transform', 'translate(' + f2(w[0]) + ',' + f2(w[1]) + ')'); }
      });

      EV.forEach(function (g, i) {
        if (t < 6.12 || t > 10.4) { g.style.visibility = 'hidden'; return; }
        g.style.visibility = 'visible';
        var on = TH.filter(function (th) { return t >= th; }).length;
        var hand = JT ? JT.W1 : [0, 0], slot = [hand[0] + (i - on) * 1.1, hand[1] - 6.5 - (4 - i) * 1.3], x, y, r;
        var ta = 6.44 + .02 * i;
        if (t < ta) {
          var st = [BX + 26 + i * 3, -4], w = cl01((t - 6.12) / (ta - 6.12)), p = bez(st, [st[0] + 8, -84 - i * 5], slot, E.out3(w));
          x = p[0]; y = p[1]; r = (1 - w) * (i % 2 ? 240 : -240);
        } else if (t < TH[i]) { x = slot[0]; y = slot[1]; r = (i - on) * 4 - 6; }
        else {
          var ew = PR.solve(EMP[i].at(t)).W1, k = E.out3(cl01((t - TH[i]) / .08));
          x = lerp(slot[0], ew[0], k); y = lerp(slot[1], ew[1] - 6.5, k); r = lerp(-6, 0, k);
        }
        g.setAttribute('transform', 'translate(' + f2(x) + ',' + f2(y) + ') rotate(' + r.toFixed(1) + ')');
      });

      BR.forEach(function (b) {
        var h = b.h(t), x0 = b.x - BW / 2, x1 = b.x + BW / 2, rr = Math.min(5, h / 2);
        b.b.setAttribute('d', h > .2 ? 'M' + f2(x0) + ',0V' + f2(-h + rr) + 'Q' + f2(x0) + ',' + f2(-h) + ' ' + f2(x0 + rr) + ',' + f2(-h) + 'H' + f2(x1 - rr) + 'Q' + f2(x1) + ',' + f2(-h) + ' ' + f2(x1) + ',' + f2(-h + rr) + 'V0Z' : '');
      });

      var fu = E.out3(cl01((t - 13.05) / .45)), fo = 1 - cl01((t - 15.5) / .3);
      fnL.setAttribute('d', 'M' + f2(XF) + ',0V' + f2(-114 * fu)); FNg.style.opacity = fo;
      var ru = cl01((t - TXF) / .55);
      fnR.setAttribute('r', (6 + 34 * E.out3(ru)).toFixed(2)); fnR.style.opacity = t < TXF ? 0 : (1 - ru).toFixed(3);

      var ty = ttY(t);
      ttTop.setAttribute('d', ty < -.3 ? 'M' + f2(TT0) + ',' + f2(ty) + 'H' + f2(TT1) : '');
      ttLeg.setAttribute('d', ty < -.3 ? 'M' + f2(TT0 + 5) + ',' + f2(ty) + 'V0M' + f2(TT1 - 5) + ',' + f2(ty) + 'V0' : '');
      ttNet.setAttribute('d', ty < -.3 ? 'M' + f2(TTM) + ',' + f2(ty) + 'V' + f2(ty - 9 * cl01(-ty / TTH)) : '');

      PD.forEach(function (P) {
        var J = P.F.J, s = E.back(cl01((t - 15.86) / .3)) * (1 - cl01((t - 18.9) / .25));
        if (!J || s <= .01) { P.g.style.visibility = 'hidden'; return; }
        P.g.style.visibility = 'visible';
        var dx = J.W1[0] - J.E1[0], dy = J.W1[1] - J.E1[1], l = Math.sqrt(dx * dx + dy * dy) || 1, hx = J.W1[0] + dx / l * 7.5, hy = J.W1[1] + dy / l * 7.5;
        P.g.setAttribute('transform', 'translate(' + f2(hx) + ',' + f2(hy) + ') scale(' + s.toFixed(3) + ')');
        var hd = 'M' + f2(-dx / l * 7.5) + ',' + f2(-dy / l * 7.5) + 'L0,0';
        P.g.children[1].setAttribute('d', hd); P.g.children[3].setAttribute('d', hd);
      });

      var JB = bossB.J;
      if (t > 16.06 && t < 17.12 && JB) {
        BQ.g.style.visibility = 'visible';
        var head = [JB.C[0] + 12, JB.C[1] - 25], bq, sq = E.back(cl01((t - 16.08) / .3));
        var hit = [HITB[0] + 2, HITB[1] - 12], bnc = [TTM + 8, -TTH - 11], rcv = [HITT[0] - 2, HITT[1] - 12];
        if (t < 16.38) bq = head;
        else if (t < 16.55) bq = bez(head, [head[0] - 2, head[1] - 10], hit, E.in3(cl01((t - 16.38) / .17)));
        else if (t < 16.86) bq = bez(hit, [TTM - 6, -150], bnc, cl01((t - 16.55) / .31));
        else bq = bez(bnc, [(bnc[0] + rcv[0]) / 2, -76], rcv, cl01((t - 16.86) / .22));
        var sc = t < 16.38 ? sq : lerp(1, .8, cl01((t - 16.38) / .17));
        BQ.g.setAttribute('transform', 'translate(' + f2(bq[0]) + ',' + f2(bq[1]) + ') scale(' + sc.toFixed(3) + ')');
        BQ.g.style.opacity = t > 17.06 ? cl01((17.12 - t) / .06) : 1;
      } else BQ.g.style.visibility = 'hidden';
      if (t >= 17.06 && t < 19.4) {
        BA2.g.style.visibility = 'visible';
        var from = [HITT[0] - 3, HITT[1] - 9.5], set = [TTM, -123], pa, sa = E.back(cl01((t - 17.06) / .32));
        if (t < 17.42) pa = bez(from, [TTM + 18, -132], set, E.out3(cl01((t - 17.06) / .36)));
        else pa = [set[0], set[1] - 1.2 * Math.sin((t - 17.42) * 3.4)];
        var up = cl01((t - 19.0) / .4);
        BA2.g.setAttribute('transform', 'translate(' + f2(pa[0]) + ',' + f2(pa[1] - 26 * E.in3(up)) + ') scale(' + (sa * (1 - .1 * up)).toFixed(3) + ')');
        BA2.g.style.opacity = (1 - up).toFixed(3);
      } else BA2.g.style.visibility = 'hidden';

      var JA = bossA.J;
      if (JA && t > 1.5 && t < 2.2) {
        SIGH.style.visibility = 'visible';
        var su = cl01((t - 1.52) / .26), sf = 1 - cl01((t - 1.92) / .25);
        sighP.forEach(function (p, k) {
          var a = (-28 + 28 * k) * D2R, r0 = 13.5, r1 = r0 + 7 * E.out3(su);
          p.setAttribute('d', 'M' + f2(JA.C[0] + Math.sin(a) * r0) + ',' + f2(JA.C[1] - Math.cos(a) * r0) + 'L' + f2(JA.C[0] + Math.sin(a) * r1) + ',' + f2(JA.C[1] - Math.cos(a) * r1));
        });
        SIGH.style.opacity = sf.toFixed(3);
      } else SIGH.style.visibility = 'hidden';

      SH.forEach(function (s) {
        var J = s.F.J;
        if (!J || s.F.g.style.visibility === 'hidden') { s.e.style.visibility = 'hidden'; return; }
        s.e.style.visibility = 'visible';
        var mx = (J.A1[0] + J.A2[0]) / 2, gy = s.F === tx ? barTop(mx, t) : 0, hgt = gy - Math.max(J.A1[1], J.A2[1]) - 5;
        var k = 1 - cl01(hgt / 80), sp = Math.abs(J.A1[0] - J.A2[0]);
        s.e.setAttribute('cx', f2(mx)); s.e.setAttribute('cy', f2(gy)); s.e.setAttribute('rx', ((14 + sp * .5) * (.6 + .4 * k)).toFixed(2));
        s.e.style.opacity = (.1 * k * (s.F === tx ? 1 - cl01((t - 20.3) / .2) : 1)).toFixed(3);
      });
    });


    caps.forEach(function (cap) {
      var tin = +cap.getAttribute('data-in'), tout = +cap.getAttribute('data-out'), lns = qa('.ln > span', cap);
      tl.to(cap, 0, .01, { o: [0, 0] }).to(cap, tin, .01, { o: [0, 1] }, 'lin').to(cap, tout + .6, .01, { o: [1, 0] }, 'lin');
      lns.forEach(function (l, k) { tl.to(l, 0, .01, { yp: [115, 115] }).to(l, tin + .1 + .09 * k, .75, { yp: [115, 0] }, 'out5').to(l, tout - .02 + .05 * k, .4, { yp: [0, -115] }, 'in3'); });
      qa('.ul path', cap).forEach(function (p) {
        tl.to(p, 0, .01, { o: [0, 0] }).to(p, tin + .6, .01, { o: [0, 1] }, 'lin').to(p, tin + .6, .5, { draw: [0, 1] }, 'io').to(p, tout - .04, .2, { o: [1, 0] }, 'out3');
      });
    });

    tl.to(ground, 0, .01, { o: [1, 1] }).to(ground, 20.3, .35, { o: [1, 0] }, 'out3');


    var FL = $('pg-flood'), FLG = $('pg-fl-g'), FLD = $('pg-fl-dot'), mk = q1('.pg-mark .lg-svg');
    var LB1 = 20.72, HP1 = 20.46, DR0 = 20.46, DR1 = 21.2, SH0 = 21.3, SH1 = 21.75, END = SH1;
    var LOGO = { c: [0, 0], s: 200, head: [0, 0], hr: 10, mark: [0, 0, 84] };
    qa('.pg-fl-s').forEach(function (p, k) { tl.to(p, 0, .01, { o: [0, 0] }).to(p, 20.44 + .11 * k, .01, { o: [0, 1] }, 'lin').to(p, 20.44 + .11 * k, .42, { draw: [0, 1] }, 'io'); });
    tl.to(mk, 0, .01, { o: [0, 0] }).to(mk, END - .03, .01, { o: [0, 1] }, 'lin');
    tl.to(tx.g, 0, .01, { o: [1, 1] }).to(tx.g, LB0 + .08, .16, { o: [1, 0] }, 'out3');
    tl.to(bossB.g, 0, .01, { o: [1, 1] }).to(bossB.g, LB0, .25, { o: [1, 0] }, 'out3');
    tl.each(function (t) {
      if (t < LB0 || t >= END + .04) { if (FL.style.visibility !== 'hidden') FL.style.visibility = 'hidden'; return; }
      FL.style.visibility = 'visible';
      var g = EZ.soft(cl01((t - LB0) / (LB1 - LB0))), u = E.io(cl01((t - SH0) / (SH1 - SH0)));
      var s0 = LOGO.s * g, cx = lerp(LOGO.c[0], LOGO.mark[0], u), cy = lerp(LOGO.c[1], LOGO.mark[1], u), s = lerp(s0, LOGO.mark[2], u);
      FLG.setAttribute('transform', 'translate(' + f2(cx) + ',' + f2(cy) + ') scale(' + (s / 440).toFixed(4) + ')');

      var dt = [cx + (438 - 399.5) / 440 * s, cy + (255 - 323.5) / 440 * s], dr = 21.5 / 440 * s, pos, r, col;
      var apex = [LOGO.c[0] + (438 - 399.5) / 440 * LOGO.s, LOGO.c[1] + (255 - 323.5) / 440 * LOGO.s - LOGO.s * .5];
      if (t < HP1) { var w = E.out3(cl01((t - LB0) / (HP1 - LB0))); pos = [lerp(LOGO.head[0], apex[0], w), lerp(LOGO.head[1], apex[1], w)]; r = lerp(LOGO.hr, dr, w); col = w; }
      else { var d = E.drop(cl01((t - DR0) / (DR1 - DR0))); pos = [lerp(apex[0], dt[0], cl01((t - DR0) / .2)), lerp(apex[1], dt[1], d)]; r = dr; col = 1; }
      FLD.setAttribute('cx', f2(pos[0])); FLD.setAttribute('cy', f2(pos[1])); FLD.setAttribute('r', f2(r));
      FLD.style.fill = col >= 1 ? K : 'rgb(' + Math.round(lerp(255, 23, col)) + ',' + Math.round(lerp(91, 24, col)) + ',' + Math.round(lerp(46, 28, col)) + ')';
    });


    var word = q1('.pg-mark .lg-word');
    tl.to(word, 0, .01, { o: [0, 0], y: [12, 12] }).to(word, END + .05, .5, { o: [0, 1], y: [12, 0] }, 'out5');
    qa('.pg-end > :not(.pg-mark)').forEach(function (e, k) {
      var dy = e.classList.contains('pg-foot') ? 6 : 18;
      tl.to(e, 0, .01, { o: [0, 0], y: [dy, dy] }).to(e, END + .12 + .16 * k, .6, { o: [0, 1], y: [dy, 0] }, 'out5');
    });


    function layout() {
      W = pg.clientWidth; H = pg.clientHeight;
      svgW.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

      caps.forEach(function (cap) {
        var h = q1('.pg-h', cap), w = cap.clientWidth - 4, m = 0;
        h.style.removeProperty('--fit');
        qa('.ln > span', cap).forEach(function (s) { m = Math.max(m, s.getBoundingClientRect().width); });
        if (w > 0 && m > w) h.style.setProperty('--fit', (Math.floor(w / m * 1000) / 1000).toString());
      });

      var pr = pg.getBoundingClientRect(), cta = doc.querySelector('.tm-cta'), cr = cta ? cta.getBoundingClientRect() : null;
      CTA_T = cr && cr.height ? Math.min(H, cr.top - pr.top) : H;
      for (var k in FDEF) FRM[k] = frame(FDEF[k]);

      [[BQ, -1], [BA2, 1]].forEach(function (a) { var w = 0; a[0].ts.forEach(function (t) { try { w = Math.max(w, t.getComputedTextLength()); } catch (x) { } }); a[0].w = Math.max(30, w + 14); shapeBubble(a[0], a[1]); });

      var c = camAt(LB0), J = PR.solve(TX.at(LB0)), mid = [(J.H[0] + J.N[0]) / 2, (J.H[1] + J.N[1]) / 2];
      LOGO.c = toScr(mid, c); LOGO.head = toScr(J.C, c); LOGO.hr = PR.B.hr * c[2];
      LOGO.s = Math.min(W * .56, H * .34, 280);
      LOGO.c[0] = W / 2; LOGO.c[1] = Math.max(Math.min(LOGO.c[1], CTA_T - 20 - LOGO.s * .5), LOGO.s * .5 + 120);
      var mr = mk.getBoundingClientRect();
      LOGO.mark = [mr.left - pr.left + mr.width / 2, mr.top - pr.top + mr.height / 2, mr.width];
    }

    layout();
    return { seek: function (t) { tl.seek(t); }, layout: layout, END: END };
  })();


  var END_AT = MGk.END, DUR = 25.2;
  var running = false, held = false, tOff = 0, t0 = 0, ended = false, lastT = 0;
  function now() { return (held || !running) ? tOff : tOff + (performance.now() - t0) / 1000; }
  function paint(t) {
    lastT = t; MGk.seek(t);
    var past = t >= END_AT;
    if (past !== ended) { ended = past; root.classList.toggle('pg-done', past); }
  }
  function loop() {
    if (!running || held) return;
    var t = now(); paint(t);
    if (t < DUR) requestAnimationFrame(loop); else { running = false; tOff = DUR; }
  }
  function play(from) { tOff = from; t0 = performance.now(); running = true; held = false; requestAnimationFrame(loop); }
  function toEnd() {
    running = false; held = false; tOff = 30; paint(30);
    var e = $('pg-end'); if (e && !calm) e.focus({ preventScroll: true });
  }

  function ready(fn) {
    var done = false;
    function go() { if (done) return; done = true; MGk.layout(); fn(); }
    void $('pg').offsetHeight;
    requestAnimationFrame(function () { if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(go); else go(); });
    setTimeout(go, 2500);
  }
  var SEEK = parseFloat(q.get('t')), CAP = q.get('cap') === '1';
  if (CAP) {
    root.classList.add('pg-capmode');
    window.__seek = function (t) { paint(t); return t; };
    ready(function () { paint(0); root.classList.add('sb-shot'); });
  } else if (!isNaN(SEEK)) {
    ready(function () { paint(SEEK); root.classList.add('sb-shot'); });
  } else if (calm) {
    paint(30); ready(function () { paint(30); });
  } else {
    paint(0); ready(function () { play(0); });
  }
  $('pg-skip').addEventListener('click', toEnd);

  function hold(on) {
    root.classList.toggle('hold', on);
    if (on) { if (running && !held) { tOff = now(); held = true; } }
    else if (held) { held = false; t0 = performance.now(); requestAnimationFrame(loop); }
  }
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) { if (running && !held) { tOff = now(); held = true; } }
    else if (held && !root.classList.contains('hold')) { held = false; t0 = performance.now(); requestAnimationFrame(loop); }
  });
  window.addEventListener('resize', function () { MGk.layout(); paint(lastT); });

  var faq = $('faq');
  function openFaq(e) { if (e) e.preventDefault(); hold(true); if (!faq.open) { if (faq.showModal) faq.showModal(); else faq.setAttribute('open', ''); } }
  function closeFaq() { if (faq.open) { if (faq.close) faq.close(); else { faq.removeAttribute('open'); if (!$('calc').open) hold(false); } } }
  [].slice.call(doc.querySelectorAll('[data-faq]')).forEach(function (b) { b.addEventListener('click', openFaq); });
  faq.querySelector('[data-close]').addEventListener('click', closeFaq);
  faq.addEventListener('close', function () { if (!$('calc').open) hold(false); });
  faq.addEventListener('click', function (e) { if (e.target === faq) closeFaq(); });


  var dlg = $('calc'), body = $('c-body'), dots = [].slice.call($('c-dots').children);
  var steps = {}; [].slice.call(body.querySelectorAll('.c-step')).forEach(function (s) { steps[s.getAttribute('data-step')] = s; });
  var A = { ind: null, rev: null, emp: null };
  var R = null;
  var hist = [], cur = 'ind';
  var DOT = { ind: 0, rev: 1, emp: 2, wait: 3, result: 3, form: 3, done: 3 };
  function show(name, back) {
    if (steps[cur]) steps[cur].hidden = true;
    var s = steps[name]; s.hidden = false; s.classList.toggle('back', !!back);
    s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
    cur = name;
    dots.forEach(function (d, i) { d.className = i < DOT[name] ? 'done' : i === DOT[name] ? 'on' : ''; });
    $('c-back').classList.toggle('hide', !hist.length || name === 'wait' || name === 'done');
    body.scrollTop = 0;
    var h = s.querySelector('h2'); if (h && !calm) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  function go(name) { hist.push(cur); show(name); }

  function openCalc(ev) {
    if (ev) ev.preventDefault();
    hit('calc', true);
    hold(true);
    if (faq.open) faq.close();
    if (!dlg.open) {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      root.classList.add('lock');
      try { if (history.pushState && !(history.state && history.state.calc)) history.pushState({ calc: 1 }, '', location.pathname + location.search + '#calc'); } catch (x) {   }
    }
    if (cur === 'done') { hist = []; reset(); show('ind'); }
    else show(cur);
  }
  function closeCalc() { if (dlg.open) { if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); onClosed(); } } }
  function onClosed() {
    root.classList.remove('lock');
    hold(false);
    try { if (history.state && history.state.calc) history.back(); } catch (x) {   }
  }
  window.addEventListener('popstate', function () { if (dlg.open) closeCalc(); });
  function reset() { A = { ind: null, rev: null, emp: null }; R = null; [].slice.call(body.querySelectorAll('.c-opts button.on')).forEach(function (b) { b.classList.remove('on'); }); }
  [].slice.call(doc.querySelectorAll('[data-calc]')).forEach(function (a) { a.addEventListener('click', openCalc); });
  $('c-close').addEventListener('click', closeCalc);
  dlg.addEventListener('close', onClosed);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeCalc(); });
  $('c-back').addEventListener('click', function () {
    var prev = hist.pop(); if (!prev) return;
    if (prev === 'wait') prev = hist.pop() || 'emp';
    show(prev, true);
  });
  if (location.hash === '#calc') setTimeout(openCalc, 300);

  body.addEventListener('click', function (e) {
    var b = e.target.closest('.c-opts button'); if (!b) return;
    var grp = b.parentNode, name = grp.getAttribute('data-name');
    [].slice.call(grp.children).forEach(function (x) { x.classList.toggle('on', x === b); });
    A[name] = b;
    setTimeout(function () {
      if (name === 'ind') { if (b.getAttribute('data-v') === 'corp') { compute(); go('result'); hit('result', true); } else go('rev'); }
      else if (name === 'rev') go('emp');
      else { go('wait'); setTimeout(function () { compute(); show('result'); hit('result', true); }, calm ? 0 : 1100); }
    }, calm ? 0 : 220);
  });


  /* 택스민 요금 등급표(10/29, 개인사업자 · 직전 연도 매출(수입금액) 기준)
     업종군: 가 = 도소매(A) · 나 = 음식·제조·건설·운수·정보통신(B) · 다 = 서비스·임대·교육·전문직(C·P·?)
     Lite 월 5~6만원(복식부기 장부 포함, 4대보험 직원 3명까지 5만 · 4~5명 6만) | Plus 월 7~8만원 | 성실 월 12~15만원(성실신고확인 대상)
     Lite 상한 가 9억 · 나 5억 · 다 3억 / 성실 가 15억 · 나 7.5억 · 다 5억. 부가세·조정료 별도, 6개월 약정. Plus·성실 직원 수 기준은 미정.
     매출 보기: new 올해 시작 · r1 3억 미만 · r2 3억~5억 · r3 5억~9억 · r4 9억 이상 · unk */
  var TIER = { A: { r1: 'L', r2: 'L', r3: 'L', r4: 'P+' }, B: { r1: 'L', r2: 'P', r3: 'P/S', r4: 'S' }, C: { r1: 'L', r2: 'P', r3: 'S', r4: 'S' } };
  var SINL = { A: '15억원', B: '7억 5천만원', C: '5억원' };
  function compute() {
    var ind = A.ind, g = ind.getAttribute('data-g');
    var rv = A.rev ? A.rev.getAttribute('data-v') : '', emp = A.emp ? +A.emp.getAttribute('data-v') : 0;
    R = { ind: ind.textContent, rev: A.rev ? A.rev.firstChild.textContent : '-', emp: A.emp ? A.emp.textContent : '-', plan: '', price: '', why: '', sub: '', kind: '' };
    if (g === 'X') { R.rev = '-'; R.emp = '-'; R.kind = 'corp'; R.plan = '<b>법인 기장</b>'; R.price = '월 12만원부터'; R.firm = 1; R.why = '택스민 등급표는 개인사업자 기준이에요. 법인은 상담 때 따로 안내해 드려요.'; return; }
    var gg = g === 'A' || g === 'B' ? g : 'C';
    var t = rv === 'new' ? 'L' : rv === 'unk' ? 'U' : (TIER[gg][rv] || 'U');
    if (g === '?' && t !== 'L' && t !== 'U') t = 'U2';
    if ((t === 'L') && emp > 5) { t = 'P'; R.why = 'Lite는 직원 5명까지예요. 6명부터는 Plus예요.'; }
    if (t === 'L') { R.kind = 'lite'; R.plan = '택스민 <b>Lite</b>'; R.price = emp > 3 ? '월 6만원' : '월 5만원'; R.staff = emp; if (emp <= 3) R.sub = '직원이 4~5명이면 월 6만원이에요.'; return; }
    if (t === 'U' || t === 'U2') {
      R.kind = 'unk'; R.plan = '택스민 <b>Lite</b> 또는 <b>Plus</b>'; R.price = '월 5~8만원';
      R.why = t === 'U' ? '작년 매출에 따라 등급이 정해져요. 상담 때 홈택스 자료로 함께 확인해 드릴게요.' : '업종에 따라 기준이 달라요. 상담 때 함께 확인해 드릴게요.';
      return;
    }
    if (t === 'S') { R.kind = 'sin'; R.plan = '택스민 <b>성실</b>'; R.price = '월 12~15만원'; R.why = '작년 매출이 ' + SINL[gg] + '을 넘는 가게는 신고 때 세무사가 한 번 더 꼼꼼히 확인해요.'; return; }
    R.kind = 'plus'; R.plan = '택스민 <b>Plus</b>'; R.price = '월 7~8만원';
    if (t === 'P+') R.sub = '작년 매출이 15억원을 넘으면 월 12~15만원이에요.';
    if (t === 'P/S') R.sub = '작년 매출이 7억 5천만원을 넘으면 월 12~15만원이에요.';
  }
  function renderResult() {
    var h = '', CK = '<svg aria-hidden="true"><use href="#i-chk"/></svg>';
    h += '<p class="r-eye">사장님 가게에 맞는 요금제</p>';
    h += '<h2 class="r-plan">' + R.plan + '</h2>';
    h += '<div class="r-price"><strong>' + R.price + '</strong><small>부가세 별도</small>' +
         (R.sub ? '<span class="r-sub">' + esc(R.sub) + '</span>' : '') + (R.kind !== 'lite' ? '<span class="r-sub">예상 금액이에요. 장부 상태를 보고 상담 때 확정해 알려 드려요.</span>' : '') + '</div>';
    if (R.why) h += '<p class="r-why">' + esc(R.why) + '</p>';
    var list = R.kind === 'corp' ? ['법인 장부 기장', '부가가치세·법인세 신고', '인건비 신고'] :
      ['장부 정리', '매달 매출 보고서', '부가가치세 신고', '인건비 신고 <small>' + (R.kind === 'lite' ? (R.staff ? '직원 ' + (R.staff === 3 ? '1~3명' : R.staff === 5 ? '4~5명' : R.staff + '명') + ' 포함' : '직원 5명까지') : '포함') + '</small>', '신고 일정 먼저 안내', '카카오톡 상담'];
    h += '<ul class="r-list">' + list.map(function (x) { return '<li>' + CK + '<span>' + x.replace(/ <small>/, '</span><small>').replace(/<\/small>$/, '</small>') + (x.indexOf('<small>') < 0 ? '</span>' : '') + '</li>'; }).join('') + '</ul>';
    h += '<p class="r-note">' + (R.kind === 'corp' ? '법인세 신고 비용은 따로이고, 신고 전에 먼저 알려 드려요.' : '6개월 이용 기준이에요. 5월 종합소득세 신고 비용은 따로이고, 신고 전에 먼저 알려 드려요.') + '</p>';
    h += '<div class="r-act tm"><p class="tm-how">어떻게 상담받으실래요?</p>' +
         '<a class="btn btn-kakao btn-xl" href="https://pf.kakao.com/_Mxojqs/chat" target="_blank" rel="noopener" data-hit="kakao"><svg class="ico" aria-hidden="true"><use href="#i-chat"/></svg>카카오톡으로 상담하기</a>' +
         '<button class="btn btn-blue btn-xl" type="button" data-to="form"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02z"/></svg>전화 상담 예약하기</button>' +
         '<button class="r-again" type="button" data-to="again">다시 계산하기</button></div>';
    $('c-result').innerHTML = h;
    $('c-pick').innerHTML = esc([R.ind, R.kind === 'corp' ? '' : R.rev, R.kind === 'corp' ? '' : '직원 ' + R.emp].filter(Boolean).join(' · ')) + '<br>→ ' + R.plan + ' · <b>' + esc(R.price) + '</b> (부가세 별도)';
  }
  var _show = show;
  show = function (name, back) { if (name === 'result') renderResult(); _show(name, back); };
  body.addEventListener('click', function (e) {
    var t = e.target.closest('[data-to]'); if (!t) return;
    var to = t.getAttribute('data-to');
    if (to === 'again') { hist = []; reset(); show('ind', true); }
    else { go(to); hit('form', true); }
  });


  var form = $('form'), nameI = $('f-name'), telI = $('f-tel'), msgI = $('f-msg'), okI = $('f-ok'), out = $('form-msg');
  telI.addEventListener('input', function () {
    var d = telI.value.replace(/\D/g, '').slice(0, 11);
    if (!/^01/.test(d)) return;
    var mid = d.length === 10 ? 6 : 7;
    telI.value = d.length < 4 ? d : d.length <= mid ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, mid) + '-' + d.slice(mid);
  });
  [nameI, telI].forEach(function (el) { el.addEventListener('input', function () { el.parentNode.classList.remove('bad'); }); });
  okI.addEventListener('change', function () { okI.closest('.agree').classList.remove('bad'); });
  function plain(html) { var d = doc.createElement('div'); d.innerHTML = html; return d.textContent; }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    out.textContent = '';
    var bad = [], tel = telI.value.trim();
    if (!nameI.value.trim()) bad.push(nameI);
    if (!/^[0-9 +\-()]{9,20}$/.test(tel) || tel.replace(/\D/g, '').length < 9) bad.push(telI);
    bad.forEach(function (el) { el.parentNode.classList.add('bad'); });
    if (!okI.checked) { okI.closest('.agree').classList.add('bad'); if (!bad.length) bad.push(okI); }
    if (bad.length) {
      out.textContent = bad[0] === okI ? '개인정보 수집·이용에 동의해 주세요.' : '이름과 휴대폰 번호를 확인해 주세요.';
      bad[0].focus(); return;
    }
    var data = {
      '이름': nameI.value.trim(), '연락처': tel, '업종': R ? R.ind : '-', '작년 매출': R ? R.rev : '-', '직원(4대보험)': R ? R.emp : '-',
      '추천 요금제': R ? plain(R.plan) : '-', '예상 기장료': R ? R.price + ' (부가세 별도)' : '-', '남기실 말씀': msgI.value.trim(),
      '들어온 곳': srcLabel, '광고': adKey || '-', '캠페인': campaign || '-', '시안': VNAME, '개인정보 수집·이용 동의': '동의함',
      '_honey': form.querySelector('.hp').value, '_s': srcKey, '_v': statAd
    };
    if (LOCAL) { $('done-p').insertAdjacentHTML('beforeend', '<br><small>(미리보기 — 실제로 보내지는 않았습니다)</small>'); hist = []; show('done'); return; }
    var btn = form.querySelector('.btn-submit'); btn.disabled = true;
    fetch('apply.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.success === 'true', code: r.status }; }); })
      .then(function (res) {
        btn.disabled = false;
        if (res.ok) { hist = []; show('done'); return; }
        out.textContent = res.code === 429 ? '방금 신청하셨어요. 잠시 뒤에 다시 보내 주시거나 카카오톡·전화로 연락 주세요.'
          : '보내지 못했습니다. 카카오톡이나 전화(0507-1428-6446)로 연락 주세요.';
      })
      .catch(function () { btn.disabled = false; out.textContent = '인터넷 연결을 확인해 주세요. 카카오톡이나 전화(0507-1428-6446)로도 상담하실 수 있습니다.'; });
  });
})();
