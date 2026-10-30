 
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

  var GB = {"VBW":1000,"VBH":1400,"P":{"origin":[464.145,897.415],"scale":2.02824,"azimuth":40,"elevation":30},"AX":{"x":[1.6491,0.9827],"y":[-1.9653,0.8246],"z":[0,-2.2218]},"KS":2.57,"SHOTS":{"whole":{"cx":500,"cy":700,"w":950.3,"h":1388},"s1":{"cx":340.1,"cy":338.8,"w":210,"h":513.5},"s2":{"cx":555.4,"cy":553.4,"w":359.6,"h":292.6},"s3":{"cx":319.1,"cy":729.4,"w":290.5,"h":304.4},"s4":{"cx":596.5,"cy":810,"w":307.8,"h":277.2},"s5":{"cx":344.4,"cy":963.8,"w":290.9,"h":341.4},"s6":{"cx":659.3,"cy":980.2,"w":305.2,"h":373.9},"plate":{"cx":523.4,"cy":1270.2,"w":231.6,"h":271.7},"pile":{"cx":600.3,"cy":89.1,"w":150,"h":239.3},"shop":{"cx":475.2,"cy":202.4,"w":438.4,"h":334.1},"mark":{"cx":480.4,"cy":1157.5,"w":436.2,"h":537.5}},"LAMPS":["l-slot","l-scan","l-sortIn","l-sortOut","l-ledger","l-pay1","l-pay2","l-pay3","l-pay4","l-pay5","l-print","l-beacon","l-tube","l-bus0","l-bus1","l-bus2"],"card":{"id":"g-card","from":[58,-89.5,9.199999999999989],"drop":-22},"pile":{"n":20,"slips":[[102.73,16.12,381.8],[104.41,17.68,383.05],[108.82,14.62,384.3],[101.44,14.22,385.55],[105.15,17.81,386.8],[94.04,15.39,388.05],[101.72,21.17,389.3],[112.7,16.58,390.55],[109.62,21.41,391.8],[111.85,19.69,393.05],[99.88,18.81,394.3],[101.62,20.51,395.55],[104.76,19.15,396.8],[110.26,21.04,398.05],[100.18,15.38,399.3],[102.03,18.28,400.55],[102.49,16.31,401.8],[99.28,20.35,403.05],[102.56,19.66,404.3],[104.34,16.95,405.55]],"slot":[49,110,375],"flag":[106,19,406.4]},"scan":{"id":"g-scanbar","len":36,"card":"g-card3","ax":[1.65,0.98]},"card2":{"id":"g-card2","fall":[0,104.42],"top":[0,-57.77]},"belt":{"x0":90,"x1":140,"y0":111.8,"y1":126.2,"z":253.05},"strips":["g-strip0","g-strip1","g-strip2","g-strip3","g-strip4","g-strip5"],"gate":{"id":"g-gate","ax":[-1.97,0.82],"span":17},"trays":{"in":{"fly":"g-fly-in","stack":"g-stack-in"},"out":{"fly":"g-fly-out","stack":"g-stack-out"}},"fly":{"ax":[1.65,0.98],"az":[0,-2.22]},"rows":12,"stamp":{"id":"g-stamp","down":[0,10.64]},"env":["g-env1","g-env2","g-env3","g-env4","g-env5"],"envDrop":[0,-142.2],"bars":[{"plan":{"x":191,"y":73.7,"w":5,"d":4.6,"r":0.3},"h":6,"z":130.7},{"plan":{"x":191,"y":67.1,"w":5,"d":4.6,"r":0.3},"h":9,"z":130.7},{"plan":{"x":191,"y":60.5,"w":5,"d":4.6,"r":0.3},"h":12.5,"z":130.7},{"plan":{"x":191,"y":53.9,"w":5,"d":4.6,"r":0.3},"h":16,"z":130.7},{"plan":{"x":191,"y":47.3,"w":5,"d":4.6,"r":0.3},"h":22,"z":130.7}],"sheet":{"id":"g-sheet","move":[-42.88,-25.55]},"gears":[{"id":"g-gear0","n":11,"dir":1},{"id":"g-gear1","n":8,"dir":-1},{"id":"g-gear2","n":6,"dir":1}],"beacon":{"c":[400.8,938.9]},"tube":{"base":[733.5,1085.8],"zIn":62.5,"zTop":381,"az":[0,-2.2218]},"pulse":{"id":"g-pulse","top":[793.4,344.6],"bottom":[793.4,1084.5]},"chars":[{"id":"op","b":[20.5,118,233],"s":1.15,"th":0,"to":null},{"id":"so","b":[183,95.5,233],"s":0.85,"th":90,"to":null},{"id":"ck","b":[16,128,118],"s":0.95,"th":0,"to":null},{"id":"ca","b":[196,98,118],"s":1,"th":-90,"to":[172,134]},{"id":"tu","b":[20,139,3],"s":1.1,"th":-20,"to":null},{"id":"ty","b":[139,64,3],"s":1,"th":0,"to":null},{"id":"co","b":[132,106,3],"s":0.9,"th":0,"to":[170,106]}],"dialC":[72,127.4,34],"dialR":19.2,"plate":{"c":[523.4,1237.2],"s":2.57,"w":58,"h":44}};
 
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


  var MGg = (function () {
    var gb = $('gb'), svg = $('gb-svg'), tl = new MG(), E = MG.E;
    var SH = GB.SHOTS, AX = GB.AX;
    function cl01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function sg(t, a, d) { return cl01((t - a) / d); }
    function q1(s, r) { return (r || doc).querySelector(s); }
    function qa(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
    function setT(el, v) { if (el && el.__t !== v) { el.setAttribute('transform', v); el.__t = v; } }
    function setO(el, v) { if (!el) return; v = Math.round(cl01(v) * 1000) / 1000; if (el.__o !== v) { el.setAttribute('opacity', v); el.__o = v; } }
    function setD(el, v) { if (el && el.__d !== v) { el.setAttribute('d', v); el.__d = v; } }
    function mvp(dx, dy, dz) { return [AX.x[0] * dx + AX.y[0] * dy + AX.z[0] * dz, AX.x[1] * dx + AX.y[1] * dy + AX.z[1] * dz]; }
    function tr(v) { return 'translate(' + v[0].toFixed(2) + ' ' + v[1].toFixed(2) + ')'; }

    var PP = GB.P, aA = PP.azimuth * Math.PI / 180, eA = PP.elevation * Math.PI / 180;
    var sA = Math.sin(aA), cA = Math.cos(aA), sE = Math.sin(eA), cE = Math.cos(eA), KK = PP.scale * Math.sqrt(1.6);
    function iso(x, y, z) { return [PP.origin[0] + (x * sA - y * cA) * KK, PP.origin[1] + ((x * cA + y * sA) * sE - z * cE) * KK]; }
    function p2(p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }


    var CAM = [[0, 'pile', 1.0], [1.0, 'pile', 1.05], [1.5, 'shop', 1.0], [2.3, 'whole', 1.0], [3.05, 'whole', 1.03], [3.75, 's1', 1.0], [5.85, 's1', 1.05], [6.55, 's2', 1.0], [9.05, 's2', 1.04],
      [9.8, 's3', 1.0], [12.05, 's3', 1.05], [12.75, 's4', 1.0], [14.95, 's4', 1.05], [15.7, 's5', 1.0], [17.85, 's5', 1.05],
      [18.55, 's6', 1.0], [20.65, 's6', 1.04], [21.3, 'whole', 1.0], [22.0, 'mark', 1.0], [22.75, 'mark', 1.05], [23.55, 'whole', 1.0], [999, 'whole', 1.0]];
    var EW0 = 22.75, EW1 = 23.55;
    var HK0 = 2.95, HK1 = 3.75;
    var DR0 = 3.15, DR1 = 3.78;

    var DRIFT = q.get('cap') === '1' ? 1 : 0;
    var fadeT = q1('.gb-fade-t'), frame = q1('.gb-frame');
    var box = { w: 390, h: 844 }, win = { x: 0, y: 0, w: 1, h: 1 }, winEnd = { x: 0, y: 0, w: 1, h: 1 }, winHook = { x: 0, y: 0, w: 1, h: 1 }, VB = { x: 0, y: 0, s: 1 };
    function rel(el) { var a = el.getBoundingClientRect(), b = gb.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
    function layout() {
      box.w = gb.clientWidth; box.h = gb.clientHeight;
      win = rel($('gb-win'));
      var hc = q1('.gb-hook'), hb = hc ? rel(hc) : null, ht = hb ? Math.max(win.y, hb.y + hb.h + 18) : win.y;
      winHook = { x: win.x, y: ht, w: win.w, h: Math.max(120, win.y + win.h - ht) };
      var end = $('gb-end'), we = rel($('gb-win-end'));
      var eTop = rel(end).y + 8;
      winEnd = { x: we.x, y: we.y, w: we.w, h: Math.max(140, eTop - we.y) };
      uiSize();
    }
    function fitS(sh, w) { return Math.min(w.w / sh.w, w.h / sh.h); }
    function camAt(t) {
      var k = 0; while (k < CAM.length - 2 && t >= CAM[k + 1][0]) k++;
      var a = CAM[k], b = CAM[k + 1], u = cl01((t - a[0]) / (b[0] - a[0])), same = a[1] === b[1];
      var e = same ? E.io(u) * 0.25 + u * 0.75 : E.io(u);
      var we = sg(t, EW0, EW1 - EW0), ww = E.io(we), hk = 1 - E.io(sg(t, HK0, HK1 - HK0));
      var W0 = { x: win.x, y: win.y + (winHook.y - win.y) * hk, w: win.w, h: win.h + (winHook.h - win.h) * hk };
      var W = { x: W0.x + (winEnd.x - W0.x) * ww, y: W0.y + (winEnd.y - W0.y) * ww, w: W0.w + (winEnd.w - W0.w) * ww, h: W0.h + (winEnd.h - W0.h) * ww };
      var A = SH[a[1]], B = SH[b[1]];
      var s0 = fitS(A, W) * (1 + (a[2] - 1) * DRIFT), s1 = fitS(B, W) * (1 + (b[2] - 1) * DRIFT), s = Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * e);
      var f = Math.abs(Math.log(s1 / s0)) > 0.04 ? (1 / s - 1 / s0) / (1 / s1 - 1 / s0) : e;
      var cx = A.cx + (B.cx - A.cx) * f, cy = A.cy + (B.cy - A.cy) * f;
      if (!(s > 0 && isFinite(s) && isFinite(cx) && isFinite(cy) && box.w > 0 && box.h > 0)) return;
      VB.s = s; VB.x = cx - (W.x + W.w / 2) / s; VB.y = cy - (W.y + W.h / 2) / s;
      var v = VB.x.toFixed(2) + ' ' + VB.y.toFixed(2) + ' ' + (box.w / s).toFixed(2) + ' ' + (box.h / s).toFixed(2);
      if (svg.__vb !== v) { svg.setAttribute('viewBox', v); svg.__vb = v; }
      var fh = ((W0.y + 20) + (62 - (W0.y + 20)) * ww).toFixed(1) + 'px';
      if (fadeT.__h !== fh) { fadeT.style.height = fh; fadeT.__h = fh; }
      var fo = ((1 - hk) * (1 - ww)).toFixed(3);
      if (frame.__o !== fo) { frame.style.opacity = fo; frame.__o = fo; }
    }
    function scr(p) { return [(p[0] - VB.x) * VB.s, (p[1] - VB.y) * VB.s]; }
    tl.each(camAt);


    var flood = $('gb-flood'), OT = [250, 84, 36], OB = [255, 106, 59], PA = [251, 251, 250], fadeB = q1('.gb-fade-b');
    function mixc(a, b, k) { k = cl01(k); return Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k); }
    function setVar(n, v) { if (gb['__' + n] !== v) { gb.style.setProperty(n, v); gb['__' + n] = v; } }
    function setCls(c, on) { if (root.__c === undefined) root.__c = {}; if (root.__c[c] !== on) { root.classList.toggle(c, on); root.__c[c] = on; } }
    tl.each(function (t) {
      var u = E.io(sg(t, DR0, DR1 - DR0)), Hh = box.h, Ww = box.w, AMP = 14, edge = u * (Hh + AMP * 2) - AMP;
      var cp = 'none', disp = u >= 1 ? 'none' : '';
      if (u > 0 && u < 1) {
        var pts = ['0px ' + Hh + 'px'];
        for (var i = 0; i <= 12; i++) { var x = Ww * i / 12; pts.push(x.toFixed(1) + 'px ' + (edge + Math.sin(i * 0.85 + t * 13) * AMP * (1 - 0.4 * u)).toFixed(1) + 'px'); }
        pts.push(Ww + 'px ' + Hh + 'px'); cp = 'polygon(' + pts.join(',') + ')';
      }
      if (flood.__cp !== cp) { flood.style.clipPath = cp; flood.style.webkitClipPath = cp; flood.__cp = cp; }
      if (flood.__d !== disp) { flood.style.display = disp; flood.__d = disp; }
      var fth = parseFloat(fadeT.__h) || 200, fbh = fadeB.offsetHeight || 110;
      setVar('--ft', mixc(OT, PA, edge / (fth * 0.6))); setVar('--fb', mixc(OB, PA, (edge - (Hh - fbh)) / fbh));
      setCls('gb-hot', edge < 60); setCls('gb-hotb', edge < Hh - 60);
    });


    var LIT = {}; GB.LAMPS.forEach(function (id) { LIT[id] = $(id); });
    var FLT = [1.5, 1.72, 1.94, 2.16];
    var LAMP_ON = { 'l-slot': 1.0, 'l-bus2': FLT[1], 'l-scan': FLT[1] + 0.04, 'l-ledger': FLT[1] + 0.08, 'l-bus1': FLT[2], 'l-print': FLT[2] + 0.05, 'l-bus0': FLT[3], 'l-tube': FLT[3] + 0.05 };
    function onAt(t, a) { return t < a ? 0 : Math.min(1, (t - a) / 0.2); }
    var lampFx = {};
    tl.each(function (t) {
      Object.keys(LAMP_ON).forEach(function (id) { var v = onAt(t, LAMP_ON[id]); if (lampFx[id]) v = lampFx[id](t, v); setO(LIT[id], v); });
    });

    var FL = [0, 1, 2, 3].map(function (i) { return $('g-fl' + i); });
    function flick(t, a) { var u = t - a; return u < 0 ? 0 : u < 0.05 ? 1 : u < 0.1 ? 0.2 : 1; }
    tl.each(function (t) { FL.forEach(function (el, i) { setO(el, flick(t, FLT[i]) * (1 - E.io(sg(t, DR0, 0.55)))); }); });

    var card = $(GB.card.id), CF = GB.card.from;
    var pulse = $(GB.pulse.id), PT = GB.pulse.top, PB = GB.pulse.bottom;
    var card2 = $(GB.card2.id), cardB = $('g-card-b');
    tl.each(function (t) {

      [[card, 3.72], [cardB, 3.9]].forEach(function (cp) {
        var el = cp[0], a = cp[1], v = null;
        if (t >= a && t < a + 0.62) {
          var u = sg(t, a, 0.42);
          if (u < 1) { var e = u * u * (1.4 - 0.4 * u); v = [CF[0] * (1 - e), CF[1] * (1 - e), CF[2] * (1 - e) + 14 * e + Math.sin(e * Math.PI) * 10]; }
          else { var w2 = E.in3(sg(t, a + 0.42, 0.2)); v = [0, 0, 14 - 36 * w2]; }
        }
        if (v) { setO(el, 1); setT(el, tr(mvp(v[0], v[1], v[2]))); } else setO(el, 0);
      });

      if (t >= 4.3 && t < 4.95) { var u2 = E.io(sg(t, 4.3, 0.62)); var a2 = GB.card2.top, b2 = GB.card2.fall; setO(card2, 1); setT(card2, tr([a2[0] + (b2[0] - a2[0]) * u2, a2[1] + (b2[1] - a2[1]) * u2])); }
      else setO(card2, 0);

      if (t >= 1.42 && t < 2.3) { var u3 = E.io(sg(t, 1.45, 0.75)); setO(pulse, t < 1.52 ? (t - 1.42) / 0.1 : t > 2.2 ? (2.3 - t) / 0.1 : 1); setT(pulse, tr([PT[0] + (PB[0] - PT[0]) * u3, PT[1] + (PB[1] - PT[1]) * u3])); }
      else setO(pulse, 0);
    });


    var PL = GB.pile, PN = PL.n, rcs = [];
    for (var i0 = 0; i0 < PN; i0++) rcs.push($('g-rc' + i0));
    function rcIn(i) { return i < 3 ? -1 : 0.02 + (i - 3) * 0.021; }
    function rcOut(i) { return 1.08 + (PN - 1 - i) * 0.024; }
    tl.each(function (t) {
      rcs.forEach(function (el, i) {
        var a = rcIn(i), b = rcOut(i), c = PL.slips[i], v = [0, 0, 0], o = 1;
        if (a >= 0) { if (t < a) { setO(el, 0); return; } var u = sg(t, a, 0.17); v[2] = 56 * (1 - u * u); }
        if (t >= b) {
          var w = sg(t, b, 0.32); if (w >= 1) { setO(el, 0); return; }
          var e = w * w, d = [PL.slot[0] - c[0], PL.slot[1] - c[1], PL.slot[2] - c[2]];
          v = [d[0] * e, d[1] * e, d[2] * e + Math.sin(w * Math.PI) * 12]; o = w < 0.7 ? 1 : 1 - (w - 0.7) / 0.3;
        }
        setO(el, o); setT(el, tr(mvp(v[0], v[1], v[2])));
      });
    });
    var flag = $('g-flag'), fPole = $('g-flag-pole'), fCloth = $('g-flag-cloth'), fFold = $('g-flag-fold'), fHand = $('g-flag-hand'), FB = PL.flag;
    fPole.setAttribute('stroke-width', (1.05 * KK).toFixed(2)); fHand.setAttribute('r', (2.8 * KK).toFixed(2));
    var fArmO = $('g-flag-arm-o'), fArm = $('g-flag-arm');
    fArmO.setAttribute('stroke-width', (4.6 * KK + 1.1).toFixed(2)); fArm.setAttribute('stroke-width', (4.6 * KK).toFixed(2));
    function sp(p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    tl.each(function (t) {
      var up = E.back(sg(t, 0.36, 0.26)) * (1 - E.in3(sg(t, 0.98, 0.14)));
      if (up <= 0.02) { setO(flag, 0); return; }
      setO(flag, 1);
      var Lp = 34 * up, top = iso(FB[0], FB[1], FB[2] + Lp), bot = iso(FB[0], FB[1], FB[2] - 1), hd = iso(FB[0], FB[1], FB[2] + 1.6 * up);
      setD(fPole, 'M' + sp(bot) + 'L' + sp(top));
      var sl = iso(FB[0] + 2.5, FB[1] + 3, FB[2] - 3.5), arm = 'M' + sp(sl) + 'L' + sp(hd); setD(fArmO, arm); setD(fArm, arm);
      if (fHand.__y !== hd[1]) { fHand.setAttribute('cx', hd[0].toFixed(1)); fHand.setAttribute('cy', hd[1].toFixed(1)); fHand.__y = hd[1]; }
      var low = iso(FB[0], FB[1], FB[2] + Lp - 13 * up), Wc = 19 * KK * up, ph = t * 11;
      var sway = (1.3 + 1.2 * (1 - sg(t, 0.4, 0.6))) * KK, wa = Math.sin(ph) * sway, wb = Math.sin(ph - 1.3) * sway, wc = Math.sin(ph - 2.4) * sway;
      var A0 = top, B0 = low, A1 = [A0[0] - Wc, A0[1] + wc], B1 = [B0[0] - Wc, B0[1] + wc];
      setD(fCloth, 'M' + sp(A0) + 'Q' + sp([A0[0] - Wc * 0.5, A0[1] + wa * 1.4 - wb]) + ' ' + sp(A1) + 'L' + sp(B1) + 'Q' + sp([B0[0] - Wc * 0.5, B0[1] + wa * 1.4 - wb]) + ' ' + sp(B0) + 'Z');
      setD(fFold, 'M' + sp([A0[0] - Wc * 0.55, A0[1] + wa * 0.9 - wb * 0.6 + 1]) + 'L' + sp([B0[0] - Wc * 0.55, B0[1] + wa * 0.9 - wb * 0.6 - 1]));
    });


    var gears = GB.gears.map(function (g) { return { el: $(g.id), n: g.n, dir: g.dir }; });
    var dial = $('g-dial');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var hasW = typeof WHT !== 'undefined';
    var dA = -((today.getDate() - 1) / 31) * 360, dLeft = hasW ? Math.round((WHT - today) / 864e5) : 13, dB = dA - (dLeft / 31) * 360;
    var DA0 = 15.6, DA1 = 16.75;
    var slats = $('g-slats'), BT = GB.belt;
    tl.each(function (t) {
      var dialU = E.io(sg(t, DA0, DA1 - DA0)), dialAng = dA + (dB - dA) * dialU;
      setT(dial, 'rotate(' + dialAng.toFixed(2) + ')');
      var spin = Math.max(0, t - FLT[1]) * 40 + (dA - dialAng) * 3.2;
      gears.forEach(function (g, i) { setT(g.el, 'rotate(' + (g.dir * spin * (11 / g.n)).toFixed(2) + ')'); });

      var ph = Math.max(0, t - FLT[1]) * 52, d = '';
      for (var i = 0; i < 10; i++) {
        var x = BT.x0 + ((i * 5 + ph) % 50);
        d += 'M' + p2(iso(x, BT.y0, BT.z)) + 'L' + p2(iso(x, BT.y1, BT.z));
      }
      setD(slats, d);
    });


    var scanbar = $(GB.scan.id);
    tl.to(scanbar, 4.98, 0.1, { o: [0, 1] }, 'lin').to(scanbar, 5.56, 0.16, { o: [1, 0] }, 'lin');
    var card3 = $(GB.scan.card);
    tl.each(function (t) {
      setT(scanbar, 'translate(0 ' + (GB.scan.len * E.io(sg(t, 5.0, 0.58))).toFixed(2) + ')');

      var u = E.out3(sg(t, 4.78, 0.34)), o = t < 4.78 ? 0 : t < 5.55 ? 1 : 1 - sg(t, 5.55, 0.25);
      setO(card3, o); setT(card3, tr([GB.scan.ax[0] * -9 * (1 - u), GB.scan.ax[1] * -9 * (1 - u)]));
    });


    var ROUTE = ['in', 'out', 'in', 'out', 'in', 'out'], S0 = 5.5, GAP = 0.42, RUN = 0.95;
    var strips = GB.strips.map(function (id) { return $(id); });
    var gate = $(GB.gate.id), stamp = $(GB.stamp.id), rows = [];
    for (var r = 0; r < GB.rows; r++) rows.push($('g-row' + r));
    var fly = { 'in': $(GB.trays['in'].fly), out: $(GB.trays.out.fly) };
    var stk = { 'in': [], out: [] };
    for (var n = 1; n <= 6; n++) { stk['in'].push($(GB.trays['in'].stack + n)); stk.out.push($(GB.trays.out.stack + n)); }
    var lensIn = LIT['l-sortIn'], lensOut = LIT['l-sortOut'];
    function rowAt(k) { return S0 + Math.floor(k / 2) * GAP + RUN + 0.27 + (k % 2) * 0.04; }
    rows.forEach(function (row, k) {
      var at = rowAt(k);
      tl.to(row, at, 0.12, { o: [0, 1] }, 'out3');
      qa('path', row).forEach(function (p, j) { tl.to(p, at, 0.22 + j * 0.05, { draw: [0, 1] }, 'out3'); });
    });
    function arrOf(i) { return S0 + i * GAP + RUN; }
    tl.each(function (t) {
      var cnt = { 'in': 0, out: 0 }, lin = 0, lout = 0, press = 0;

      var gp = ROUTE[0] === 'in' ? 0 : 1;
      ROUTE.forEach(function (rt, i) { var g1 = rt === 'in' ? 0 : 1, g0 = i ? (ROUTE[i - 1] === 'in' ? 0 : 1) : g1; var e = arrOf(i) - 0.3; if (t >= e) gp = g0 + (g1 - g0) * E.io(sg(t, e, 0.18)); });
      setT(gate, tr([GB.gate.ax[0] * GB.gate.span * gp, GB.gate.ax[1] * GB.gate.span * gp]));
      strips.forEach(function (el, i) {
        var t0 = S0 + i * GAP, x = BT.x0 + (t - t0) / RUN * (BT.x1 - BT.x0 + 4), arr = arrOf(i), rt = ROUTE[i];
        if (t >= t0 && x < BT.x1 + 4) { setO(el, Math.min(1, (t - t0) / 0.12, (BT.x1 + 4 - x) / 3)); setT(el, tr(mvp(x, 0, 0))); }
        else setO(el, 0);
        var age = t - arr;
        if (age >= 0 && age < 0.5) { if (rt === 'in') lin = Math.max(lin, 1 - age / 0.5); else lout = Math.max(lout, 1 - age / 0.5); }
        if (t >= arr + 0.42) cnt[rt]++;
        var pa = t - (arr + 0.18);
        if (pa >= 0 && pa < 0.3) press = Math.max(press, pa < 0.07 ? E.in3(pa / 0.07) : pa < 0.12 ? 1 : 1 - E.out3((pa - 0.12) / 0.18));
      });
      if (t >= FLT[1] && t < FLT[1] + 0.52) lin = Math.max(lin, 1 - (t - FLT[1]) / 0.52);
      if (t >= 20.9) { lin = Math.max(lin, onAt(t, 20.9)); lout = Math.max(lout, onAt(t, 21.0)); }
      setO(lensIn, lin); setO(lensOut, lout);
      ['in', 'out'].forEach(function (nm) { stk[nm].forEach(function (el, j) { setO(el, j === cnt[nm] - 1 ? 1 : 0); }); });
      ['in', 'out'].forEach(function (nm) {
        var el = fly[nm], vis = false;
        strips.forEach(function (_, i) {
          if (ROUTE[i] !== nm) return;
          var a = t - (arrOf(i) + 0.04);
          if (a >= 0 && a < 0.38) {
            var u = E.out3(a / 0.38), below = 0; for (var j = 0; j < i; j++) if (ROUTE[j] === nm) below++;
            var dz = -(10 - 1.6 - 0.95 * (below + 1)) * E.in3(Math.min(1, a / 0.38));
            vis = true; setT(el, tr(mvp(6 + 13 * u, 0, dz)));
          }
        });
        setO(el, vis ? 1 : 0);
      });
      setT(stamp, tr([GB.stamp.down[0] * press, GB.stamp.down[1] * press]));
    });


    var envs = GB.env.map(function (id) { return $(id); }), ED = GB.envDrop, EV0 = 9.75, EVG = 0.36;
    tl.each(function (t) {
      envs.forEach(function (el, i) {
        var a = t - (EV0 + i * EVG);
        if (a < 0) { setO(el, 0); return; }
        var u = Math.min(1, a / 0.42), y = 1 - E.out3(u);
        setO(el, Math.min(1, a / 0.08)); setT(el, tr([ED[0] * y, ED[1] * y]));
      });
      for (var i = 0; i < 5; i++) setO(LIT['l-pay' + (i + 1)], t >= EV0 + i * EVG + 0.34 ? Math.min(1, (t - (EV0 + i * EVG + 0.34)) / 0.15) : 0);
    });


    var sheet = $(GB.sheet.id), SM = GB.sheet.move;
    tl.each(function (t) { var u = E.out3(sg(t, 12.7, 0.85)); setT(sheet, tr([SM[0] * (1 - u), SM[1] * (1 - u)])); });
    lampFx['l-print'] = function (t, v) { return t >= 12.5 && t < 12.9 ? 0.35 + 0.65 * Math.abs(Math.cos((t - 12.5) * 8)) : v; };
    var bars = GB.bars.map(function (b, i) {
      var g = $('g-bar' + i);
      g.innerHTML = '<path class="gb-bx"/><path class="gb-by"/><path class="gb-bt"/><path class="iso-line gb-bc" data-tone="lo"/><path class="iso-line gb-bo" data-tone="hi"/>';
      return { g: g, p: qa('path', g), b: b, t0: 13.55 + i * 0.11 };
    });
    function barH(bb, t) { return bb.b.h * E.back(sg(t, bb.t0, 0.62)); }
    function boxPaths(x, y, w, d, z, h) {
      var b = [iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)], tp = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
      return ['M' + p2(b[1]) + 'L' + p2(b[2]) + 'L' + p2(tp[2]) + 'L' + p2(tp[1]) + 'Z', 'M' + p2(b[2]) + 'L' + p2(b[3]) + 'L' + p2(tp[3]) + 'L' + p2(tp[2]) + 'Z',
        'M' + p2(tp[0]) + 'L' + p2(tp[1]) + 'L' + p2(tp[2]) + 'L' + p2(tp[3]) + 'Z', 'M' + p2(tp[1]) + 'L' + p2(tp[2]) + 'L' + p2(tp[3]) + 'M' + p2(tp[2]) + 'L' + p2(b[2]),
        'M' + p2(tp[0]) + 'L' + p2(tp[1]) + 'L' + p2(b[1]) + 'L' + p2(b[2]) + 'L' + p2(b[3]) + 'L' + p2(tp[3]) + 'Z'];
    }
    var trend = $('g-trend'), tdots = GB.bars.map(function (_, i) { return $('g-tdot' + i); });
    tl.to(trend, 14.28, 0.5, { draw: [0, 1] }, 'io');
    tdots.forEach(function (c, i) { tl.to(c, 14.28 + i * 0.1, 0.18, { o: [0, 1] }, 'out3'); });
    tl.each(function (t) {
      var pts = [];
      bars.forEach(function (bb) {
        var h = barH(bb, t), pl = bb.b.plan;
        if (h < 0.05) { bb.g.style.visibility = 'hidden'; } else {
          bb.g.style.visibility = 'visible';
          var ps = boxPaths(pl.x, pl.y, pl.w, pl.d, bb.b.z, h);
          for (var j = 0; j < 5; j++) setD(bb.p[j], ps[j]);
        }
        pts.push(iso(pl.x + pl.w / 2, pl.y + pl.d / 2, bb.b.z + Math.max(h, 0) + 5));
      });
      setD(trend, 'M' + pts.map(p2).join('L'));
      tdots.forEach(function (c, i) { if (c.__cx !== pts[i][0]) { c.setAttribute('cx', pts[i][0].toFixed(1)); c.setAttribute('cy', pts[i][1].toFixed(1)); c.__cx = pts[i][0]; } });
    });


    var beacon = LIT['l-beacon'];
    tl.each(function (t) { setO(beacon, t < DA1 ? 0 : Math.min(1, (t - DA1) / 0.15) * (0.72 + 0.28 * (0.5 + 0.5 * Math.cos((t - DA1) * Math.PI * 3.2)))); });


    var capQ = qa('.gb-capq'), capA = qa('.gb-capa'), TB = GB.tube;
    function capAt(list, z) { var v = z === null ? 'translate(-999 -999)' : tr([TB.base[0] + TB.az[0] * z, TB.base[1] + TB.az[1] * z]); list.forEach(function (el) { setT(el, v); }); }
    tl.each(function (t) {
      var zq = null, za = null;
      if (t >= 0.9 && t < 2.6) zq = TB.zTop + (TB.zIn - TB.zTop) * E.io(sg(t, 0.9, 1.6));
      if (t >= 18.4 && t < 19.2) zq = 128 + (TB.zIn - 128) * E.out3(sg(t, 18.4, 0.55));
      if (t >= 19.95 && t < 20.9) za = TB.zIn + (TB.zTop - TB.zIn) * E.in3(sg(t, 19.95, 0.9));
      capAt(capQ, zq); capAt(capA, za);
    });

    lampFx['l-slot'] = function (t, v) { return t >= 4.1 && t < 4.6 ? 0.35 + 0.65 * Math.abs(Math.cos((t - 4.1) * 12)) : v; };
    lampFx['l-tube'] = function (t, v) { return t >= 18.9 && t < 19.6 ? 0.4 + 0.6 * Math.abs(Math.cos((t - 18.9) * 9)) : v; };


    var ui = $('gb-ui');
    function mk(cls, html) { var e = doc.createElement('div'); e.className = cls; e.innerHTML = html; ui.appendChild(e); return e; }
    var bq = mk('gb-bub q', '<span class="txt">이거 경비 처리 되나요?</span>');
    var ba = mk('gb-bub a', '<span class="dots"><i></i><i></i><i></i></span><span class="txt">네, 영수증 사진만 보내 주세요</span>');
    var baDots = q1('.dots', ba), baTxt = q1('.txt', ba), dotEls = qa('.dots i', ba);
    var sz = {};
    function uiSize() {
      var ty = ba.__ty; baDots.style.display = 'none'; baTxt.style.display = '';
      [['q', bq], ['a', ba]].forEach(function (p) { sz[p[0]] = [p[1].offsetWidth, p[1].offsetHeight]; });
      baDots.style.display = ty === false ? 'none' : ''; baTxt.style.display = ty === false ? '' : 'none';
    }
    var anQ = iso(171, 20, 80), anA = iso(150, 44, 48);
    function place(el, x, y, sc, o) {
      var v = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
      if (el.__v !== v) { el.style.transform = v; el.__v = v; }
      o = Math.round(cl01(o) * 1000) / 1000; if (el.__o !== o) { el.style.opacity = o; el.__o = o; }
    }
    tl.each(function (t) {

      var sq = scr(anQ), pq = sg(t, 19.0, 0.5), qo = t < 19.0 || t > 20.75 ? 0 : Math.min(1, (t - 19.0) / 0.12) * (t > 20.5 ? (20.75 - t) / 0.25 : 1);
      place(bq, sq[0] - sz.q[0], sq[1] - sz.q[1], 0.5 + 0.5 * E.spring(pq), qo);
      var sa = scr(anA), pa = sg(t, 19.4, 0.5), ao = t < 19.4 || t > 20.75 ? 0 : Math.min(1, (t - 19.4) / 0.12) * (t > 20.5 ? (20.75 - t) / 0.25 : 1);
      place(ba, sa[0] - sz.a[0] * 0.15, sa[1], 0.5 + 0.5 * E.spring(pa), ao);
      var typing = t < 19.95;
      if (ba.__ty !== typing) { baDots.style.display = typing ? '' : 'none'; baTxt.style.display = typing ? 'none' : ''; ba.__ty = typing; }
      if (typing) dotEls.forEach(function (d, k) { d.style.transform = 'translateY(' + (-Math.max(0, Math.sin(t * 6.2 - k * 0.7)) * 5).toFixed(1) + 'px)'; });
    });


    var SVGNS = 'http://www.w3.org/2000/svg';
    var VV = [cA * cE, sA * cE, sE];
    var LL = (function () { var l = [-sA, cA, 1.2], n = Math.sqrt(l[0] * l[0] + l[1] * l[1] + l[2] * l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })();
    var BANDS = [0, 0.2, 0.42, 0.62];
    function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function ad(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
    function nrm(a) { var n = Math.sqrt(dot3(a, a)) || 1; return [a[0] / n, a[1] / n, a[2] / n]; }
    function mkEl(tag, cls, parent) { var e = doc.createElementNS(SVGNS, tag); if (cls) e.setAttribute('class', cls); if (parent) parent.appendChild(e); return e; }
    function band(sc) { var b = 0; while (b < BANDS.length && sc >= BANDS[b]) b++; return b; }

    function boxPaths3(C, U, Vv, Wv, a, b, c, S3) {
      var pts = [];
      for (var i = 0; i < 8; i++) pts.push(ad(ad(ad(C, U, i & 1 ? a : -a), Vv, i & 2 ? b : -b), Wv, i & 4 ? c : -c));
      var neg = function (v) { return [-v[0], -v[1], -v[2]]; };
      var F = [[U, [1, 3, 7, 5]], [neg(U), [0, 4, 6, 2]], [Vv, [2, 6, 7, 3]], [neg(Vv), [0, 1, 5, 4]], [Wv, [4, 5, 7, 6]], [neg(Wv), [0, 2, 3, 1]]];
      var sp = pts.map(S3), out = [];
      F.forEach(function (f) { if (dot3(f[0], VV) > 1e-3) out.push({ d: 'M' + f[1].map(function (j) { return p2(sp[j]); }).join('L') + 'Z', b: band(dot3(f[0], LL)) }); });
      var hull = sp.slice().sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; }), lo = [], up = [];
      var cr = function (o, a2, b2) { return (a2[0] - o[0]) * (b2[1] - o[1]) - (a2[1] - o[1]) * (b2[0] - o[0]); };
      hull.forEach(function (p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
      hull.slice().reverse().forEach(function (p) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
      return { faces: out, outline: 'M' + lo.slice(0, -1).concat(up.slice(0, -1)).map(p2).join('L') + 'Z' };
    }
    var chars = GB.chars.map(function (c) {
      var g = $('g-ch-' + c.id), s = c.s;
      var ch = { c: c, g: g, legs: qa('.ch-legs path', g), slotA: q1('.ch-armA', g), slotB: q1('.ch-armB', g), propA: q1('.ch-propA', g), propB: q1('.ch-propB', g),
        collar: q1('.ch-collar', g), tie: q1('.ch-tie', g), eyes: qa('.ch-eye', g) };
      var lw = 2 * 2.6 * s * KK;
      ch.legs.forEach(function (p, i) { p.setAttribute('stroke-width', (i % 2 ? lw : lw + 1.1).toFixed(2)); });
      ch.arms = [0, 1].map(function () {
        var a = mkEl('g', 'ch-arm-g'), o = mkEl('path', 'ch-arm-o', a), f = mkEl('path', 'ch-arm', a), h = mkEl('circle', 'ch-hand', a);
        var aw = 2 * 2.3 * s * KK; o.setAttribute('stroke-width', (aw + 1.1).toFixed(2)); f.setAttribute('stroke-width', aw.toFixed(2)); h.setAttribute('r', (2.6 * s * KK).toFixed(2));
        return { g: a, o: o, f: f, h: h };
      });
      ch.prop = mkEl('g', 'ch-prop'); ch.propParts = null;
      if (c.id === 'tu') {
        ch.pole = mkEl('g', 'ch-pole-g'); var po = mkEl('path', 'ch-pole-o', ch.pole), pf = mkEl('path', 'ch-pole', ch.pole), tip = mkEl('circle', 'gb-or-fill', ch.pole);
        po.setAttribute('stroke-width', (1.9 * KK).toFixed(2)); pf.setAttribute('stroke-width', (1.2 * KK).toFixed(2)); tip.setAttribute('r', (1.5 * KK).toFixed(2));
        ch.poleP = [po, pf, tip]; g.appendChild(ch.pole);
      }
      return ch;
    });
    function putIn(slot, node) { if (node.parentNode !== slot) slot.appendChild(node); }
    function drawChar(ch, ps) {
      var c = ch.c, s = c.s, th = ps.th * Math.PI / 180;
      var f = [Math.cos(th), Math.sin(th), 0], r = [Math.sin(th), -Math.cos(th), 0], z = [0, 0, 1], O = [0, 0, 0];
      var base = c.b;
      var S3 = function (p) { return iso(base[0] + p[0], base[1] + p[1], base[2] + p[2]); };
      setT(ch.g, tr(mvp(ps.off[0], ps.off[1], ps.off[2])));

      for (var i = 0; i < 2; i++) {
        var side = i ? 1 : -1, hip = ad(ad(O, r, side * 3.1 * s), z, 5.4 * s), sw = ps.legs ? ps.legs[i] : 0;
        var foot = ad(ad(hip, z, -3.6 * s + Math.max(0, sw) * 0.8 * s), f, sw * 3.4 * s);
        var dl = 'M' + p2(S3(hip)) + 'L' + p2(S3(foot));
        setD(ch.legs[i * 2], dl); setD(ch.legs[i * 2 + 1], dl);
      }

      var sh = [ad(ad(O, r, -8.4 * s), z, 18.8 * s), ad(ad(O, r, 8.4 * s), z, 18.8 * s)];
      var far = dot3(sh[0], VV) < dot3(sh[1], VV) ? 0 : 1;
      for (var j = 0; j < 2; j++) {
        var A = ps.arms[j], hand;
        if (A.at) hand = A.at;
        else {
          var pp = A.p * Math.PI / 180, yy = (A.y || 0) * Math.PI / 180 * (j ? 1 : -1);
          hand = ad(sh[j], ad(ad(ad(O, f, Math.cos(pp) * Math.cos(yy)), r, Math.cos(pp) * Math.sin(yy)), z, Math.sin(pp)), (A.len || 8) * s);
        }
        var aa = ch.arms[j], da = 'M' + p2(S3(sh[j])) + 'L' + p2(S3(hand)), hs = S3(hand);
        setD(aa.o, da); setD(aa.f, da);
        if (aa.h.__cx !== hs[0] || aa.h.__cy !== hs[1]) { aa.h.setAttribute('cx', hs[0].toFixed(1)); aa.h.setAttribute('cy', hs[1].toFixed(1)); aa.h.__cx = hs[0]; aa.h.__cy = hs[1]; }
        putIn(j === far ? ch.slotA : ch.slotB, aa.g);
        ch['hand' + j] = hand;
      }

      var front = dot3(f, VV);
      if (front > 0.05) {
        var Oc = ad(ad(O, f, 6.9 * s), z, 21.4 * s), vdn = nrm(ad(ad(O, f, 0.24), z, -0.97));
        var D2 = function (u, v) { return p2(S3(ad(ad(Oc, r, u * s), vdn, v * s))); };
        setD(ch.collar, 'M' + D2(-3.7, 0) + 'L' + D2(3.7, 0) + 'L' + D2(0, 5.8) + 'Z');
        setD(ch.tie, 'M' + D2(-0.95, 0.9) + 'L' + D2(0.95, 0.9) + 'L' + D2(1.35, 6.8) + 'L' + D2(0, 8.6) + 'L' + D2(-1.35, 6.8) + 'Z');
      } else { setD(ch.collar, ''); setD(ch.tie, ''); }

      var hy = (ps.th + (ps.head || 0)) * Math.PI / 180, nod = (ps.nod || 0) * Math.PI / 180, hc = [0, 0, 32 * s], hr = 11.5 * s;
      for (var e = 0; e < 2; e++) {
        var yaw = hy + (e ? 0.36 : -0.36), pit = 0.08 + nod, n = [Math.cos(yaw) * Math.cos(pit), Math.sin(yaw) * Math.cos(pit), Math.sin(pit)];
        var vis = dot3(n, VV), ey = ch.eyes[e];
        if (vis < 0.1) { if (ey.__r !== 0) { ey.setAttribute('r', '0'); ey.__r = 0; } continue; }
        var ep = S3(ad(hc, n, hr)), rr = Math.round(1.05 * s * KK * (0.6 + 0.4 * vis) * 100) / 100;
        if (ey.__cx !== ep[0] || ey.__cy !== ep[1] || ey.__r !== rr) { ey.setAttribute('cx', ep[0].toFixed(1)); ey.setAttribute('cy', ep[1].toFixed(1)); ey.setAttribute('r', rr); ey.__cx = ep[0]; ey.__cy = ep[1]; ey.__r = rr; }
      }

      if (ps.prop) {
        var pr = ps.prop, C = ad(ad(ad(O, f, pr.f * s), r, (pr.r || 0) * s), z, pr.z * s);
        var tilt = (pr.tilt || 0) * Math.PI / 180, Vt = nrm(ad(ad(O, z, Math.cos(tilt)), f, -Math.sin(tilt))), Wt = nrm(ad(ad(O, f, Math.cos(tilt)), z, Math.sin(tilt)));
        var bx = boxPaths3(C, r, Vt, Wt, pr.a * s, pr.b * s, pr.c * s, S3);
        if (!ch.propParts) ch.propParts = { f: [0, 1, 2].map(function () { return mkEl('path', '', ch.prop); }), band: mkEl('path', 'ch-band', ch.prop), o: mkEl('path', 'ch-po', ch.prop) };
        ch.propParts.f.forEach(function (p, k) { var fc = bx.faces[k]; setD(p, fc ? fc.d : ''); if (fc && p.__b !== fc.b) { p.setAttribute('class', 'ch-pf' + fc.b); p.__b = fc.b; } });
        setD(ch.propParts.o, bx.outline);
        if (pr.band) { var bb = boxPaths3(C, r, Vt, Wt, pr.a * s * 1.02, pr.b * s * 0.22, pr.c * s * 1.02, S3); setD(ch.propParts.band, bb.outline); } else setD(ch.propParts.band, '');
        putIn(front > 0 ? ch.propB : ch.propA, ch.prop);
        if (ch.prop.style.display === 'none') ch.prop.style.display = '';
      } else if (ch.prop.style.display !== 'none') ch.prop.style.display = 'none';
      if (ch.pole && ps.pole) {
        var a0 = S3(ch.hand1), a1 = S3(ps.pole), dp = 'M' + p2(a0) + 'L' + p2(a1);
        setD(ch.poleP[0], dp); setD(ch.poleP[1], dp);
        if (ch.poleP[2].__cx !== a1[0]) { ch.poleP[2].setAttribute('cx', a1[0].toFixed(1)); ch.poleP[2].setAttribute('cy', a1[1].toFixed(1)); ch.poleP[2].__cx = a1[0]; }
      }
    }
    function bobOf(t, ph) { return 0.32 * Math.sin((t / 2.4 + ph) * Math.PI * 2); }
    var DOWN = { p: -80, y: 8 };
    var ARR = [0, 1, 2, 3, 4, 5].map(function (i) { return S0 + i * GAP + RUN + 0.42; });
    function rotL(v, deg) { var c2 = Math.cos(deg * Math.PI / 180), s2 = Math.sin(deg * Math.PI / 180); return [v[0] * c2 + v[1] * s2, v[0] * s2 - v[1] * c2, v[2]]; }
    function dialRim(t) {
      var ang = dA + (dB - dA) * E.io(sg(t, DA0, DA1 - DA0)), al = (200 + (ang - dA)) * Math.PI / 180, C = GB.dialC, R = GB.dialR;
      return [C[0] + Math.cos(al) * R, C[1], C[2] - Math.sin(al) * R];
    }
    var POSE = {
      op: function (t) {
        var up = sg(t, 3.85, 0.25) * (1 - sg(t, 4.55, 0.3)), rc = E.io(sg(t, 4.62, 0.22)) * (1 - E.io(sg(t, 5.7, 0.3))), pr = rc * 0.5 * (1 + Math.sin((t - 4.8) * 15));
        var arms = rc > 0.02 ? [{ at: rotL([8.5 + 4 * rc, -6.5, 22 + (9.5 - 1.6 * pr) * rc], 0) }, { at: rotL([8.5 + 4 * rc, 6.5, 22 + (9.5 - 1.6 * pr) * rc], 0) }] : [DOWN, DOWN];
        return { off: [0, 0, bobOf(t, 0.1)], th: 0, nod: 16 * up - 10 * rc, head: 0, arms: arms };
      },
      so: function (t) {
        var on = sg(t, 6.2, 0.3) * (1 - sg(t, 9.1, 0.4)), dip = [0, 0];
        ARR.forEach(function (a, i) { var u = (t - a + 0.12) / 0.5; if (u > 0 && u < 1) dip[i % 2] = Math.max(dip[i % 2], Math.sin(u * Math.PI)); });
        var arm = function (k) { return on > 0.02 ? { at: rotL([8.4 + 2 * dip[k], (k ? 1 : -1) * 4.6, 12 - 4.5 * dip[k] + 4 * (1 - on)], 90) } : DOWN; };
        return { off: [0, 0, bobOf(t, 0.4)], th: 90, nod: -6 * on - 6 * Math.max(dip[0], dip[1]), head: (dip[0] - dip[1]) * 12, arms: [arm(0), arm(1)] };
      },
      ck: function (t) {
        var slot = 0; for (var i = 0; i < 5; i++) if (t >= EV0 + i * EVG) slot = i;
        var sx = 40 + slot * 15, look = Math.atan2(121 - 128, sx - 16) * 180 / Math.PI;
        var hold = sg(t, 9.55, 0.3) * (1 - sg(t, 12.1, 0.3)), turn = E.io(sg(t, 11.65, 0.45)) * (1 - sg(t, 12.6, 0.4));
        var nodA = 0; for (var k = 0; k < 5; k++) { var u = (t - (EV0 + k * EVG + 0.34)) / 0.35; if (u > 0 && u < 1) nodA = Math.max(nodA, Math.sin(u * Math.PI)); }
        var nod2 = t > 11.95 && t < 12.35 ? Math.sin((t - 11.95) * Math.PI / 0.4) : 0;
        var armL = hold > 0.02 ? { at: rotL([5.5 + 2 * hold, -9.5, 18 + 9 * hold], 0) } : DOWN;
        return { off: [0, 0, bobOf(t, 0.7)], th: 0, head: look * (1 - turn) * hold + 38 * turn, nod: -8 * nodA - 12 * nod2 + 4 * hold,
          arms: [armL, DOWN], prop: hold > 0.02 ? { f: 5.5 + 2 * hold, r: -9.5, z: 20 + 9 * hold, a: 3.4, b: 2.4, c: 0.35, tilt: 20 } : null };
      },
      ca: function (t) {
        var c0 = GB.chars[3], dx = c0.to[0] - c0.b[0], dy = c0.to[1] - c0.b[1], wa = Math.atan2(dy, dx) * 180 / Math.PI;
        var we = E.io(sg(t, 15.2, 1.6)), walking = t > 15.2 && t < 16.8, turnU = E.io(sg(t, 14.95, 0.3));
        var th = -90 + (wa + 90) * turnU, ph = (t - 15.2) * 2.4 * Math.PI * 2;
        var sw = walking ? Math.sin(ph) : 0, hop = walking ? Math.abs(Math.sin(ph)) * 0.6 : 0;
        var holding = t >= 14.85, look = sg(t, 12.6, 0.3) * (1 - sg(t, 14.85, 0.2));
        var arms = holding ? [{ at: rotL([6.5, -5.2, 17.5], th) }, { at: rotL([6.5, 5.2, 17.5], th) }] : (look > 0.02 ? [{ p: -60, y: 10 }, { p: -60, y: 10 }] : [DOWN, DOWN]);
        return { off: [dx * we, dy * we, bobOf(t, 0.2) + hop], th: th, nod: -12 * look + (holding && !walking ? -6 : 0), head: walking ? 0 : (holding ? -30 : 0),
          arms: arms, legs: [sw, -sw], prop: holding ? { f: 8.6, r: 0, z: 18.5, a: 4.6, b: 6, c: 0.3, tilt: 35 } : null };
      },
      tu: function (t) {
        var push = E.io(sg(t, DA0 - 0.3, 0.3)) * (1 - E.io(sg(t, DA0 + 0.7, 0.4)));
        var tip = dialRim(Math.min(t, DA0 + 0.7)), rest = [GB.dialC[0] - 24, GB.dialC[1] + 4, 4];
        var tw = ad(rest, ad(tip, rest, -1), push), b = GB.chars[4].b;
        return { off: [0, 0, bobOf(t, 0.55)], th: -20, nod: 6 * push, head: 8 * push, arms: [{ p: -50, y: 30 }, { at: rotL([7.5, 3.2, 17 + 3 * push], -20) }],
          pole: [tw[0] - b[0], tw[1] - b[1], tw[2] - b[2]] };
      },
      ty: function (t) {
        var fast = t > 18.95 && t < 20.0 ? 1 : 0, k1 = fast * Math.max(0, Math.sin(t * 2 * Math.PI * 7.5)), k2 = fast * Math.max(0, Math.sin(t * 2 * Math.PI * 7.5 + Math.PI));
        return { off: [0, 0, bobOf(t, 0.85)], th: 0, nod: -12 - 4 * sg(t, 18.5, 0.3), head: 0, arms: [{ at: [11.6, 4.6, 21.6 + 1.6 * k1] }, { at: [11.6, -4.6, 21.6 + 1.6 * k2] }] };
      },
      co: function (t) {
        var c0 = GB.chars[6], L2 = c0.to[0] - c0.b[0], u = ((t + 1.3) % 5.6) / 5.6, pos, th, walking;
        if (u < 0.44) { pos = E.io(u / 0.44); th = 0; walking = true; }
        else if (u < 0.5) { pos = 1; th = 180 * E.io((u - 0.44) / 0.06); walking = false; }
        else if (u < 0.94) { pos = 1 - E.io((u - 0.5) / 0.44); th = 180; walking = true; }
        else { pos = 0; th = 180 + 180 * E.io((u - 0.94) / 0.06); walking = false; }
        var ph = t * 2.3 * Math.PI * 2, sw = walking ? Math.sin(ph) : 0;
        return { off: [L2 * pos, 0, bobOf(t, 0.3) + (walking ? Math.abs(Math.sin(ph)) * 0.55 : 0)], th: th, nod: -4, head: 0,
          arms: [{ at: rotL([7.4, -5.6, 14.5], th) }, { at: rotL([7.4, 5.6, 14.5], th) }], legs: [sw, -sw], prop: { f: 9.6, r: 0, z: 15.5, a: 5, b: 4.2, c: 3.4, tilt: 0, band: true } };
      }
    };

    var lvs = []; GB.chars.forEach(function (c) { if (lvs.indexOf(c.b[2]) < 0) lvs.push(c.b[2]); }); lvs.sort(function (a, b) { return b - a; });
    function hop(ch, t, ps) {
      var T = FLT[1 + lvs.indexOf(ch.c.b[2])] + 0.07 + (GB.chars.indexOf(ch.c) % 3) * 0.035, u = (t - T) / 0.44;
      if (!(u > 0 && u < 1)) return ps;
      var h = Math.sin(u * Math.PI), arm = { p: -80 + 158 * h, y: 8 + 24 * h };
      ps.off = [ps.off[0], ps.off[1], ps.off[2] + 6.5 * h];
      if (!ps.prop && !ps.pole) ps.arms = [arm, arm];
      ps.nod = (ps.nod || 0) * (1 - h) + 14 * h;
      return ps;
    }
    tl.each(function (t) { chars.forEach(function (ch) { drawChar(ch, hop(ch, t, POSE[ch.c.id](t))); }); });


    var END = 21.35, mTile = $('g-mk-tile'), mDot = $('g-mk-dot'), mWord = $('g-mk-word'), mS = qa('.gb-mk-s');
    var tileBase = mTile ? mTile.getAttribute('transform') : '';
    mS.forEach(function (p, k) { tl.to(p, END + 0.3 + 0.14 * k, 0.5, { draw: [0, 1] }, 'io'); });
    tl.each(function (t) {
      if (!mTile) return;
      var u = sg(t, END, 0.75), s = t < END ? 0 : 0.35 + 0.65 * E.spring(u), r = -14 * (1 - E.spring(u));
      setT(mTile, tileBase + ' rotate(' + r.toFixed(2) + ') scale(' + Math.max(0.001, s).toFixed(4) + ')');
      setO(mTile, t < END ? 0 : Math.min(1, (t - END) / 0.2));
      var dd = sg(t, END + 0.88, 0.75);
      setO(mDot, t < END + 0.88 ? 0 : 1); setT(mDot, 'translate(0 ' + (-170 * (1 - E.drop(dd))).toFixed(1) + ')');
      var wu = sg(t, END + 1.1, 0.6);
      setO(mWord, E.out5(wu)); setT(mWord, 'translate(0 ' + (4 * (1 - E.out5(wu))).toFixed(2) + ')');
    });


    qa('.gb-cap').forEach(function (cap) {
      var tin = +cap.getAttribute('data-in'), tout = +cap.getAttribute('data-out');
      var lns = qa('.ln > span', cap);
      tl.to(cap, 0, 0.01, { o: [0, 0] }).to(cap, tin, 0.01, { o: [0, 1] }, 'lin').to(cap, tout + 0.55, 0.01, { o: [1, 0] }, 'lin');
      lns.forEach(function (l, k) {
        tl.to(l, 0, 0.01, { yp: [118, 118] }).to(l, tin + 0.12 + 0.09 * k, 0.75, { yp: [118, 0] }, 'out5').to(l, tout - 0.02 + 0.05 * k, 0.4, { yp: [0, -118] }, 'in3');
      });
      var note = q1('.gb-note', cap);
      if (note) tl.to(note, 0, 0.01, { o: [0, 0] }).to(note, tin + 0.12 + 0.09 * lns.length, 0.5, { o: [0, 1] }, 'out3').to(note, tout, 0.3, { o: [1, 0] }, 'in3');
      qa('.ul path', cap).forEach(function (p) { tl.to(p, tin + 0.6, 0.45, { draw: [0, 1] }, 'io'); });

      qa('.ul', cap).forEach(function (u) { var k = Math.max(0, lns.indexOf(u.closest('.ln > span'))); tl.to(u, tout - 0.02 + 0.05 * k + 0.22, 0.12, { o: [1, 0] }, 'lin'); });
    });

    var ENDTXT = 23.1;
    qa('.gb-end > *').forEach(function (e, k) { tl.to(e, 0, 0.01, { o: [0, 0], y: [18, 18] }).to(e, ENDTXT + 0.12 * k, 0.6, { o: [0, 1], y: [18, 0] }, 'out5'); });

    layout();
    window.addEventListener('resize', function () { layout(); });
    return { seek: function (t) { tl.seek(t); }, layout: layout, END_AT: 22.75, LEN: 25 };
  })();


  var END_AT = MGg.END_AT, LEN = MGg.LEN;
  var held = false, t0 = 0, tOff = 0, ended = false, running = false;
  function now() { return tOff + (held ? 0 : (Date.now() - t0) / 1000); }
  function paint(t) {
    MGg.seek(t);
    var past = t >= END_AT;
    if (past && !ended) { ended = true; root.classList.add('gb-done'); }
    if (!past && ended) { ended = false; root.classList.remove('gb-done'); }
  }
  function loop() {
    var t = now();
    paint(Math.min(t, LEN));
    if (t < LEN && !held && !doc.hidden) requestAnimationFrame(loop); else running = false;
  }
  function run() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function toEnd() {
    tOff = LEN; t0 = Date.now(); paint(LEN);
    var e = $('gb-end'); if (e && !calm) e.focus({ preventScroll: true });
  }
  var SEEK = parseFloat(q.get('t')), CAP = q.get('cap') === '1';
  function ready(fn) { if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fn, fn); else fn(); }
  if (CAP) {
    root.classList.add('gb-capmode');
    window.__seek = function (t) { paint(t); return t; };
    ready(function () { MGg.layout(); paint(0); root.classList.add('sb-shot'); });
  } else if (!isNaN(SEEK)) {
    ready(function () { MGg.layout(); paint(SEEK); root.classList.add('sb-shot'); });
  } else if (calm) {
    ready(function () { MGg.layout(); paint(LEN); });
  } else {
    paint(0);
    ready(function () { MGg.layout(); t0 = Date.now(); tOff = 0; run(); });
  }
  $('gb-skip').addEventListener('click', toEnd);

  function hold(on) {
    root.classList.toggle('hold', on);
    if (on) { if (!held) { tOff = now(); held = true; } }
    else { held = false; t0 = Date.now(); if (!ended && isNaN(SEEK) && !CAP && !calm) run(); }
  }
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) { if (!held) { tOff = now(); t0 = Date.now(); } }
    else if (!held && isNaN(SEEK) && !CAP && !calm) { t0 = Date.now(); run(); }
  });

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
