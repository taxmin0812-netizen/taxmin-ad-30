 
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


 
  (function (g) {
  var BUF = null, CURVE = null, JIT = 1;
  function noise(c) {
    if (!BUF || BUF.sampleRate !== c.sampleRate) {
      var n = Math.floor(c.sampleRate * 0.5); BUF = c.createBuffer(1, n, c.sampleRate);
      var d = BUF.getChannelData(0), s = 12345;
      for (var i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 1073741823.5) - 1; }
    }
    return BUF;
  }

  function hit(c, out, t, modes, exc, v) {
    var src = c.createBufferSource(); src.buffer = noise(c);
    var eg = c.createGain(); eg.gain.setValueAtTime(1, t); eg.gain.exponentialRampToValueAtTime(0.0001, t + exc);
    src.connect(eg);
    modes.forEach(function (m) {
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = m[0] * JIT; f.Q.value = m[1];
      var gg = c.createGain(); gg.gain.setValueAtTime(m[3] * v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + m[2]);
      eg.connect(f); f.connect(gg); gg.connect(out);
    });
    src.start(t, Math.random() * 0.4); src.stop(t + 0.7);
  }

  function wash(c, out, t, type, freq, q, dur, peak, v) {
    var src = c.createBufferSource(); src.buffer = noise(c);
    var f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq * JIT; f.Q.value = q;
    var gg = c.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(peak * v, t + 0.002); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(gg); gg.connect(out); src.start(t, Math.random() * 0.4); src.stop(t + dur + 0.05);
  }

  function boom(c, out, t, dur, f0, f1, peak, v) {
    if (!CURVE) { CURVE = new Float32Array(1024); for (var i = 0; i < 1024; i++) { var x = i / 511.5 - 1; CURVE[i] = Math.tanh(3 * x); } }
    var o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    var ws = c.createWaveShaper(); ws.curve = CURVE;
    var gg = c.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(peak * v, t + 0.004); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(ws); ws.connect(gg); gg.connect(out); o.start(t); o.stop(t + dur + 0.02);
  }
  function scale(modes, fk, dk) { return modes.map(function (m) { return [m[0] * fk, m[1], m[2] * dk, m[3]]; }); }

  var R = {

    '타건1': { name: '도각 — 커스텀 기계식(참고 영상처럼 낮고 부드러운 thock)', fn: function (c, o, t, v, sp) {
      var fk = sp ? 0.72 : 1, dk = sp ? 1.5 : 1;
      hit(c, o, t, scale([[330, 5, 0.055, 1], [700, 5, 0.035, 0.55], [1500, 4, 0.018, 0.28], [2500, 3, 0.008, 0.12]], fk, dk), 0.003, v);
      wash(c, o, t, 'lowpass', 280 * fk, 0.7, 0.03 * dk, 0.45, v);
      hit(c, o, t + 0.065 * dk, scale([[1000, 5, 0.015, 0.12], [2100, 4, 0.008, 0.07]], fk, 1), 0.002, v);
    } },
    '타건2': { name: '도각도각 — 조금 높고 또렷한 커스텀(마블 같은 소리)', fn: function (c, o, t, v, sp) {
      var fk = sp ? 0.72 : 1, dk = sp ? 1.5 : 1;
      hit(c, o, t, scale([[520, 6, 0.04, 1], [1200, 6, 0.025, 0.6], [2800, 4, 0.012, 0.3]], fk, dk), 0.003, v);
      wash(c, o, t, 'lowpass', 400 * fk, 0.7, 0.025 * dk, 0.3, v);
      hit(c, o, t + 0.06 * dk, scale([[1600, 5, 0.012, 0.12]], fk, 1), 0.002, v);
    } },
    '타건3': { name: '스윽톡 — 아주 낮고 크리미한 소리', fn: function (c, o, t, v, sp) {
      var fk = sp ? 0.72 : 1, dk = sp ? 1.5 : 1;
      wash(c, o, t, 'lowpass', 900 * fk, 0.7, 0.03 * dk, 0.8, v);
      hit(c, o, t, scale([[260, 4, 0.06, 0.8], [560, 4, 0.04, 0.4]], fk, dk), 0.004, v);
    } },
    '타건4': { name: '딸깍 — 청축 클릭(비교용)', fn: function (c, o, t, v, sp) {
      var fk = sp ? 0.75 : 1, dk = sp ? 1.4 : 1;
      hit(c, o, t, scale([[3000, 8, 0.02, 1], [5400, 6, 0.01, 0.45]], fk, dk), 0.002, v);
      hit(c, o, t + 0.011, scale([[2500, 8, 0.02, 0.7]], fk, dk), 0.002, v);
      hit(c, o, t + 0.02, scale([[640, 4, 0.045, 0.55], [1500, 4, 0.025, 0.3]], fk, dk), 0.004, v);
    } },

    '도장1': { name: '쾅 — 참고 영상처럼 묵직한 효과음(울림 조금)', fn: function (c, o, t, v) {
      var d = c.createDelay(1); d.delayTime.value = 0.06;
      var fb = c.createGain(); fb.gain.value = 0.2;
      var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
      var mix = c.createGain(); mix.connect(o); mix.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(o);
      boom(c, mix, t, 0.4, 130, 50, 0.4, v);
      hit(c, mix, t, [[190, 3, 0.26, 4], [330, 4, 0.18, 3.6], [560, 5, 0.12, 2.6], [950, 5, 0.06, 1.6], [1700, 4, 0.03, 0.8]], 0.012, v);
      wash(c, mix, t, 'lowpass', 900, 0.7, 0.16, 0.9, v);
      wash(c, mix, t, 'bandpass', 1500, 1, 0.025, 0.5, v);
    } },
    '도장2': { name: '쿵 — 아주 묵직하게(낮은 울림 많이)', fn: function (c, o, t, v) {
      boom(c, o, t, 0.42, 150, 50, 0.6, v);
      hit(c, o, t, [[170, 3, 0.3, 4.5], [300, 4, 0.2, 3], [520, 5, 0.12, 1.6]], 0.012, v);
      wash(c, o, t, 'lowpass', 700, 0.7, 0.2, 0.9, v);
    } },
    '도장3': { name: '탁쾅 — 고무 도장 + 종이 소리', fn: function (c, o, t, v) {
      hit(c, o, t, [[200, 3, 0.22, 3.6], [380, 4, 0.15, 3.4], [700, 5, 0.09, 2.2], [1300, 5, 0.05, 1.2]], 0.01, v);
      boom(c, o, t, 0.3, 120, 50, 0.3, v);
      wash(c, o, t + 0.002, 'bandpass', 2200, 1, 0.045, 0.7, v);
      wash(c, o, t, 'lowpass', 1000, 0.8, 0.07, 0.8, v);
    } },
    '도장4': { name: '쾅— 넓은 방 울림', fn: function (c, o, t, v) {
      var d = c.createDelay(1); d.delayTime.value = 0.085;
      var fb = c.createGain(); fb.gain.value = 0.35;
      var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
      var mix = c.createGain(); mix.connect(o); mix.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(o);
      boom(c, mix, t, 0.45, 130, 48, 0.4, v);
      hit(c, mix, t, [[190, 3, 0.34, 4], [330, 4, 0.22, 3.4], [560, 5, 0.14, 2.4], [950, 5, 0.07, 1.4]], 0.012, v);
      wash(c, mix, t, 'lowpass', 800, 0.7, 0.18, 0.9, v);
    } }
  };
  g.TMSFX = {
    list: R,
    gain: {"타건1": 10.43, "타건2": 11.24, "타건3": 3.7, "타건4": 9.17, "도장1": 1.48, "도장2": 1.48, "도장3": 1.57, "도장4": 1.72},
    play: function (c, out, key, t, v, space, still) { var r = R[key]; if (!r) return; JIT = still ? 1 : 0.96 + Math.random() * 0.08; r.fn(c, out, t, (v || 1) * (this.gain[key] || 1), !!space); }
  };
})(window);


  var SND_KIND = root.getAttribute('data-sound');
  var SND = { on: !!SND_KIND, ctx: null, out: null, pick: { key: '타건1', stamp: '도장1' }, stampBuf: null, loading: false };
  function sndCtx(wake) {
    if (!SND.ctx) {
      if (!wake) return null;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      SND.ctx = new AC();
      var comp = SND.ctx.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.12; comp.connect(SND.ctx.destination);
      SND.out = SND.ctx.createGain(); SND.out.gain.value = 0.9; SND.out.connect(comp);
    }
    if (wake && SND.ctx.state !== 'running') SND.ctx.resume();
    return SND.ctx;
  }

  function prepStamp(c) {
    if (SND_KIND !== 'stamp' || SND.stampBuf || SND.loading) return;
    var dc = c || (window.OfflineAudioContext ? new OfflineAudioContext(1, 1, 44100) : null); if (!dc) return;
    SND.loading = true;
    var got = window.TM_STAMP_MP3 ? Promise.resolve().then(function () {
      var bin = atob(window.TM_STAMP_MP3), u8 = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return u8.buffer;
    }) : (window.fetch ? fetch('sfx/stamp.mp3').then(function (r) { return r.arrayBuffer(); }) : Promise.reject());
    got.then(function (ab) {
      return new Promise(function (ok, no) { var r = dc.decodeAudioData(ab, ok, no); if (r && r.catch) r.catch(no); });
    }).then(function (buf) { SND.stampBuf = buf; }, function () { SND.loading = false; });
  }

  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var keepAlive = null;
  function iosKeep(on) {
    if (!IOS) return;
    if (on) {
      if (!keepAlive) {
        keepAlive = doc.createElement('audio'); keepAlive.src = 'sfx/silence.mp3'; keepAlive.loop = true; keepAlive.preload = 'auto';
        keepAlive.setAttribute('playsinline', ''); keepAlive.setAttribute('webkit-playsinline', ''); keepAlive.setAttribute('x-webkit-airplay', 'deny');
        SND.keep = keepAlive;
      }
      var pr = keepAlive.play(); if (pr && pr.catch) pr.catch(function () {   });
    } else if (keepAlive) keepAlive.pause();
  }
  function wakeSound() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (x) {   }
    var c = sndCtx(true); if (!c) return;
    try { var sb0 = c.createBufferSource(); sb0.buffer = c.createBuffer(1, 1, 22050); sb0.connect(c.destination); sb0.start(0); } catch (x) {   }
    prepStamp(c);
  }


  SND.play = function (kind, vol, delay) {
    if (!SND.on || doc.hidden || root.classList.contains('hold')) return;
    var c = SND.ctx; if (!c || c.state !== 'running') return;
    var t = c.currentTime + Math.max(0, delay || 0) + 0.003, v = (vol || 1) * (0.9 + Math.random() * 0.2);
    if (kind === 'stamp' && SND.stampBuf) {
      var src = c.createBufferSource(); src.buffer = SND.stampBuf; src.playbackRate.value = 0.96 + Math.random() * 0.08;
      var gg = c.createGain(); gg.gain.value = v; src.connect(gg); gg.connect(SND.out); src.start(t);
    } else if (kind === 'stamp') window.TMSFX.play(c, SND.out, SND.pick.stamp, t, v);
    else window.TMSFX.play(c, SND.out, SND.pick.key, t, v, kind === 'space');
  };
  SND.latency = function () { var c = SND.ctx; return c ? (c.outputLatency || c.baseLatency || 0) : 0; };
  window.TMSound = SND;
  if (SND_KIND) {
    var hdr = doc.querySelector('.hd-r');
    var sb = doc.createElement('button');
    sb.type = 'button'; sb.className = 'snd'; sb.setAttribute('data-sound-btn', '');
    hdr.insertBefore(sb, hdr.firstChild);
    var setSnd = function (on) {
      SND.on = on; if (!on) iosKeep(false); else if (SND.ctx && SND.ctx.state === 'running') iosKeep(true);
      [].slice.call(doc.querySelectorAll('[data-sound-btn]')).forEach(function (b) {
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.setAttribute('aria-label', on ? '소리 끄기' : '소리 켜기');
        b.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-snd-' + (on ? 'on' : 'off') + '"/></svg><span>' + (on ? '소리 끄기' : '소리 켜기') + '</span>';
      });
    };
    setSnd(true);
    prepStamp();

    var WAKE_EV = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'], wokeAt = 0, lastDown = 0;
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { doc.addEventListener(ev, function () { lastDown = Date.now(); }, true); });
    var tryWake = function () {
      if (SND.on) iosKeep(true);
      var before = SND.ctx && SND.ctx.state;
      if (before === 'running' && keepOk()) return stopWake();
      if (before !== 'running') wakeSound();
      var c = SND.ctx; if (!c) return;
      var after = function () { if (c.state === 'running') { if (!wokeAt) wokeAt = Date.now(); if (keepOk()) stopWake(); } };
      var r = c.resume && c.resume(); if (r && r.then) r.then(after, function () {}); else after();
    };
    var keepOk = function () { return !IOS || !SND.on || (SND.keep && !SND.keep.paused); };
    var stopWake = function () { WAKE_EV.forEach(function (ev) { doc.removeEventListener(ev, tryWake, true); }); if (hint && hint.parentNode) { hint.classList.add('bye'); setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 400); } };

    var hint = null;
    if (!calm) {
      hint = doc.createElement('button'); hint.type = 'button'; hint.className = 'snd-hint';
      hint.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-snd-on"/></svg><span>화면을 톡 누르면 소리가 나요</span>';
      hint.addEventListener('click', function (e) { e.preventDefault(); tryWake(); });
      doc.body.appendChild(hint);
    }
    WAKE_EV.forEach(function (ev) { doc.addEventListener(ev, tryWake, true); });
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) iosKeep(false);
      else if (SND.on && SND.ctx) { if (SND.ctx.state === 'running') iosKeep(true); else WAKE_EV.forEach(function (ev) { doc.addEventListener(ev, tryWake, true); }); }
    });
    doc.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-sound-btn]'); if (!b) return;
      e.preventDefault();

      if (SND.on && !(wokeAt && wokeAt >= lastDown - 30)) setSnd(false);
      else { tryWake(); setSnd(true); setTimeout(function () { SND.play(SND_KIND === 'stamp' ? 'stamp' : 'key'); }, 80); }
      wokeAt = 0;
    });
  }


 
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


  var MGd = (function () {
    var tl = new MG(), E = MG.E, dz = $('dz'), plane = $('dz-plane');
    function q1(s, r) { return (r || doc).querySelector(s); }
    function qa(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
    function cl01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function lerp(a, b, u) { return a + (b - a) * u; }
    E.in2 = function (u) { return u * u; };

    function keys(K) {
      K.sort(function (a, b) { return a[0] - b[0]; });
      return function (t) {
        if (t <= K[0][0]) return K[0][1];
        for (var i = 0; i < K.length - 1; i++) {
          var a = K[i], b = K[i + 1];
          if (t < b[0]) {
            var e = (E[a[2] || 'io'])(cl01((t - a[0]) / Math.max(1e-4, b[0] - a[0])));
            if (typeof a[1] === 'number') return a[1] + (b[1] - a[1]) * e;
            var o = []; for (var j = 0; j < a[1].length; j++) o.push(a[1][j] + (b[1][j] - a[1][j]) * e);
            return o;
          }
        }
        return K[K.length - 1][1];
      };
    }
    function fadeIn(el, t, d, dy) {
      tl.to(el, 0, .01, { o: [0, 0] }).to(el, t, d, { o: [0, 1] }, 'out3');
      if (dy) tl.to(el, 0, .01, { y: [dy, dy] }).to(el, t, d + .15, { y: [dy, 0] }, 'out5');
    }
    function drawIn(el, t, d, ease) { tl.to(el, 0, .01, { o: [0, 0] }).to(el, t, .01, { o: [0, 1] }, 'lin').to(el, t, d, { draw: [0, 1] }, ease || 'io'); }


    var FPS = 30;
    var HITS = [
      [4, 'big'],
      [102, 'big'],
      [210, 'run'], [219, 'run'], [228, 'run'], [237, 'run'], [246, 'run'],
      [315, 'mid'],
      [414, 'mid'],
      [540, 'tap'], [546, 'tap'],
      [606, 'big']
    ];

    var SFX = [
      ['s_paper_slide.mp3', 2.3, 0.3],
      ['s_paper_crumpled.mp3', 3.36, 0.22],
      ['s_paper_slide.mp3', 5.9, 0.26],
      ['s_paper_slide.mp3', 9.38, 0.24],
      ['s_paper_slide.mp3', 12.68, 0.24],
      ['s_ding_attention_bell.mp3', 13.98, 0.3],
      ['s_pop_light_whoosh.mp3', 16.94, 0.3],
      ['s_paper_slide.mp3', 19.12, 0.22],
      ['s_bell_relaxing_chime.mp3', 21.35, 0.45]
    ];
    var HT = HITS.map(function (h) { return h[0] / FPS; });
    var F1 = 1 / FPS;


    function p2(n) { return (n < 10 ? '0' : '') + n; }
    var TXT = {
      sd: today.getFullYear() + '.' + p2(today.getMonth() + 1) + '.' + p2(today.getDate()),
      wm: String(WHT.getMonth() + 1), wy: String(WHT.getFullYear())
    };
    qa('[data-d]').forEach(function (e) { var v = TXT[e.getAttribute('data-d')]; if (v != null) e.textContent = v; });

    var CAL = (function () {
      var y = WHT.getFullYear(), m = WHT.getMonth(), first = new Date(y, m, 1).getDay(), nd = new Date(y, m + 1, 0).getDate(), pn = new Date(y, m, 0).getDate(), h = '', at = [-40, -11];
      for (var i = 0; i < 42; i++) {
        var d = i - first + 1, out = d < 1 || d > nd, n = d < 1 ? pn + d : d > nd ? d - nd : d, c = i % 7, r = Math.floor(i / 7);
        h += '<i class="' + (out ? 'o' : '') + (c === 0 ? ' sun' : '') + (!out && d === WHT.getDate() ? ' wht' : '') + '" style="left:' + (c * 40) + 'px;top:' + (r * 34) + 'px">' + n + '</i>';
        if (!out && d === WHT.getDate()) at = [-120 + 40 * c, -45 + 34 * r];
      }
      $('dz-calg').innerHTML = h;
      return at;
    })();
    var mkCal = $('mk-cal');
    mkCal.style.left = (CAL[0] - 42) + 'px'; mkCal.style.top = (CAL[1] - 42) + 'px';


    var DP = 1100, B = 96, TH = 45 * Math.PI / 180;
    var CAM = [195, 420, 1, TH], W = 390, H = 844;
    function proj(u, v, z) {
      var s = Math.sin(CAM[3]), c = Math.cos(CAM[3]), Y = v * c - z * s, Z = v * s + z * c, p = DP / (DP - Z);
      return [CAM[0] + CAM[2] * u * p, CAM[1] + CAM[2] * Y * p, CAM[2] * p];
    }
    function planeTf() {
      var s = Math.sin(CAM[3]), c = Math.cos(CAM[3]), k = CAM[2], cx = CAM[0], cy = CAM[1];
      var m = [k, 0, 0, 0, -cx * s / DP, k * c - cy * s / DP, 0, -s / DP, 0, 0, 1, 0, cx, cy, 0, 1];
      return 'matrix3d(' + m.map(function (v) { return Math.abs(v) < 1e-9 ? 0 : +v.toPrecision(8); }).join(',') + ')';
    }


    var IMG = {"w": 542, "h": 720, "cx": 272.0, "baseFront": 710.9, "baseW": 438.1, "bodyBottom": 479.4, "top": 8.3, "press": 78.5};
    var AX = IMG.cx, AY = IMG.baseFront - IMG.baseW * .5 * .63, PRESS = IMG.press;


    var G = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return $('g' + i); });
    var GIN = [[-1, -1], [2.52, 3.0], [6.08, 6.7], [9.58, 10.08], [12.88, 13.38], [16.3, 16.8], [19.32, 19.8]];
    var GOUT = [2.52, 6.05, 9.52, 12.85, 16.22, 19.28, 99];
    var GX = G.map(function (g, i) {
      var K = [], a = GIN[i], o = GOUT[i], far = 640;
      if (a[0] < 0) K.push([0, [0, 0], 'in3']);
      else { K.push([0, [far, 9], 'lin']); K.push([a[0], [far, 9 - 2 * i], 'out5']); K.push([a[1], [0, 0], 'lin']); }
      K.push([o, [0, 0], 'in3']); K.push([o + .42, [-far, -6], 'lin']);
      return keys(K);
    });
    var GHIT = [[0], [1], [2, 3, 4, 5, 6], [7], [8], [], [11]];
    var HXY = [[0, 0], [40, 45], [-232, 14], [-116, 14], [0, 14], [116, 14], [232, 14], [70, 100], [CAL[0], CAL[1]], [118, 40], [118, 40], [0, 0]];
    function dip(t, list) {
      var v = 0;
      list.forEach(function (i) { var x = t - HT[i], a = HITS[i][1] === 'run' ? .009 : .014; if (x >= 0 && x < .6) v += x < F1 ? a * x / F1 : a * Math.exp(-(x - F1) * 13) * Math.cos((x - F1) * 22); });
      return v;
    }


    var KU = [], KV = [], KH = [], KP = [];
    function at(t, u, v, e) { KU.push([t, u, e || 'io']); KV.push([t, v, e || 'io']); }
    function hk(t, h, e) { KH.push([t, h, e || 'io']); }
    function pressAt(T, amt, quick) {
      amt = amt || 1;
      if (quick) KP.push([T - F1, 0, 'lin'], [T, .72 * amt, 'lin'], [T + F1, amt, 'lin'], [T + 2 * F1, .85 * amt, 'out3'], [T + .15, -.05 * amt, 'io'], [T + .22, 0, 'lin']);
      else KP.push([T - F1, 0, 'lin'], [T, .72 * amt, 'lin'], [T + F1, amt, 'lin'], [T + 2 * F1, .9 * amt, 'out3'], [T + .2, -.07 * amt, 'io'], [T + .34, 0, 'lin']);
    }
    function slam(i, top, pre, after, afterAt) {
      var T = HT[i], u = HXY[i][0], v = HXY[i][1];
      at(T - pre - .08, u, v); at(T, u, v, 'lin');
      hk(T - pre, top * .8, 'out3'); hk(T - .135, top, 'in2'); hk(T, 0, 'lin'); hk(T + .09, 0, 'out3');
      if (after) hk(T + .55, after, 'io');
      pressAt(T, 1);
      if (afterAt) { at(T + .12, u, v, 'io'); at(T + .7, afterAt[0], afterAt[1], 'io'); }
    }

    at(0, 0, 0, 'lin'); hk(0, 150, 'in2'); hk(HT[0], 0, 'lin'); hk(HT[0] + .1, 0, 'out3'); hk(HT[0] + .62, 132, 'io');
    pressAt(HT[0], 1); at(HT[0] + .12, 0, 0, 'io'); at(HT[0] + .75, 70, -14, 'io'); at(2.4, 74, -10, 'io');

    hk(2.45, 128, 'io'); at(2.55, 74, -10, 'io');
    slam(1, 170, .4, 140, [-80, -78]);

    hk(5.9, 140, 'io'); at(6.0, -80, -78, 'io'); at(6.78, HXY[2][0], 14, 'io'); hk(6.7, 104, 'out3'); hk(HT[2] - .135, 120, 'in2');
    for (var r = 2; r <= 6; r++) {
      var T = HT[r];
      hk(T, 0, 'lin'); hk(T + 2 * F1, 0, 'out3'); pressAt(T, .92, true);
      if (r < 6) { hk(T + 5 * F1, 64, 'lin'); hk(T + 6 * F1, 64, 'in2'); at(T + 2 * F1, HXY[r][0], 14, 'io'); at(T + 6 * F1, HXY[r + 1][0], 14, 'lin'); }
    }
    hk(HT[6] + .55, 150, 'io'); at(HT[6] + .1, HXY[6][0], 14, 'io'); at(HT[6] + .8, 120, -100, 'io');

    hk(9.6, 150, 'io'); at(9.62, 120, -100, 'io');
    slam(7, 175, .42, 160, [118, -112]);

    hk(12.9, 160, 'io'); at(12.95, 118, -112, 'io');
    slam(8, 170, .4, 150, [CAL[0] + 120, CAL[1] - 50]);

    hk(16.3, 150, 'io'); at(16.4, CAL[0] + 120, CAL[1] - 50, 'io'); at(17.3, 118, 40, 'io'); hk(17.35, 70, 'io'); hk(17.82, 30, 'io');
    hk(HT[9] - .1, 34, 'in2'); hk(HT[9], 0, 'lin'); hk(HT[9] + F1, 0, 'out3'); hk(HT[9] + .1, 26, 'in2'); hk(HT[10], 0, 'lin'); hk(HT[10] + F1, 0, 'out3'); hk(HT[10] + .45, 120, 'io');
    KP.push([HT[9] - F1, 0, 'lin'], [HT[9], .3, 'lin'], [HT[9] + 2 * F1, 0, 'out3'], [HT[10] - F1, 0, 'lin'], [HT[10], .3, 'lin'], [HT[10] + 2 * F1, 0, 'out3']);
    at(HT[9], 118, 40, 'lin'); at(HT[10] + .1, 118, 40, 'io'); at(HT[10] + .7, 128, -30, 'io');

    hk(19.3, 140, 'io'); at(19.35, 128, -30, 'io');
    slam(11, 205, .45, 0);
    at(HT[11] + .14, 0, 0, 'in3'); at(HT[11] + .62, 330, -170, 'lin');
    hk(HT[11] + .42, 70, 'in3'); hk(HT[11] + .62, 420, 'lin');
    KP.push([0, 0, 'lin']);
    var SU = keys(KU), SV = keys(KV), SH = keys(KH), SP = keys(KP), ST_OFF = HT[11] + .6;
    function bob(t, h) { return h + Math.sin(t * 3.7) * 3.2 * cl01((h - 60) / 50); }
    function stamp(t) { var h = SH(t); return [SU(t), SV(t), Math.max(0, bob(t, h)), SP(t)]; }


    var stEl = $('dz-st'), gh = [$('dz-gh1'), $('dz-gh2')], shc = $('dz-shc'), sh = $('dz-sh');
    function placeSt(el, s, lean) {
      var p = proj(s[0], s[1], s[2]), sc = B * p[2] / IMG.baseW;
      el.style.transform = 'translate(' + p[0].toFixed(2) + 'px,' + p[1].toFixed(2) + 'px) scale(' + sc.toFixed(5) + ') translate(' + (-AX) + 'px,' + (-AY).toFixed(1) + 'px)';
      el.firstElementChild.style.transform = 'rotate(' + lean.toFixed(2) + 'deg)';
      el.firstElementChild.lastElementChild.style.transform = 'translateY(' + (Math.max(-.08, s[3]) * PRESS).toFixed(2) + 'px)';
    }
    function leanAt(t) { var d = (SU(t + .04) - SU(t - .04)) / .08; return Math.max(-7, Math.min(7, d * .012)); }


    var caps = qa('.dz-cap'), CAMK = null, MARK = [0, 0, 84, 84];

    var SHOT = [
      [0, [-115, 115, -125, 125], [0, 2.45], 1],
      [1, [-62, 100, -135, 112], [2.95, 3.9], 1],
      [1, [-212, 122, -12, 116], [4.45, 5.95], 1.3],
      [2, [-290, -174, -70, 70], [6.92, 7.1], 1.08],
      [2, [-96, 96, -92, 92], [8.95, 9.4], 1.05],
      [3, [-127, 127, -152, 152, 128], [10.1, 12.7], 1],
      [4, [-152, 152, -152, 152], [13.45, 16.1], 1],
      [5, [-134, 150, -142, 142], [16.85, 19.1], 1],
      [-1, [-108, 108, -108, 108], [19.85, 20.22], 1]
    ];
    function shotExt(sh) {
      var sv = CAM.slice(); CAM = [0, 0, 1, TH];
      var b = sh[1], pts = [[b[0], b[2], 0], [b[1], b[2], 0], [b[0], b[3], 0], [b[1], b[3], 0]], x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      if (b[4]) pts.push([b[0], b[2], b[4]], [b[1], b[2], b[4]]);
      pts.forEach(function (q) { var p = proj(q[0], q[1], q[2]); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
      for (var t = sh[2][0]; t <= sh[2][1] + 1e-6; t += 1 / 30) {
        var st = stamp(t), p = proj(st[0], st[1], st[2]), sc = B * p[2] / IMG.baseW;
        x0 = Math.min(x0, p[0] - (AX - 14) * sc); x1 = Math.max(x1, p[0] + (IMG.w - AX - 14) * sc);
        y0 = Math.min(y0, p[1] - (AY - IMG.top) * sc); y1 = Math.max(y1, p[1] + (IMG.baseFront - AY) * sc);
      }
      CAM = sv;
      return [x0, x1, y0, y1];
    }
    function layout() {
      W = dz.clientWidth; H = dz.clientHeight;

      caps.forEach(function (c) {
        var h = q1('.dz-h', c); if (!h) return;
        h.style.fontSize = '';
        var av = c.clientWidth, w = 0;
        qa('.ln > span', c).forEach(function (s) { w = Math.max(w, s.offsetWidth); });
        if (w > av) h.style.fontSize = (parseFloat(getComputedStyle(h).fontSize) * av / w * .98).toFixed(1) + 'px';
      });

      var lg = q1('.dz-legal'), ec = q1('.dz-end');
      if (lg && ec) {
        lg.style.fontSize = ''; lg.style.whiteSpace = 'nowrap';
        var ecs = getComputedStyle(ec), la = ec.clientWidth - parseFloat(ecs.paddingLeft) - parseFloat(ecs.paddingRight), lw = lg.scrollWidth;
        if (lw > la) lg.style.fontSize = (parseFloat(getComputedStyle(lg).fontSize) * la / lw * .98).toFixed(2) + 'px';
        lg.style.whiteSpace = '';
      }
      var hd = q1('.dz-hd'), hdB = hd.offsetTop + hd.offsetHeight, pr = dz.getBoundingClientRect();

      var cta = q1('.tm-cta'), cr = cta ? cta.getBoundingClientRect() : null;
      var yB = cr && cr.height ? Math.min(H - 16, cr.top - pr.top - 14) : H - 16;
      var kMax = Math.min(W / 390, H / 700) * 1.18;
      var P = SHOT.map(function (sh) {
        var c = sh[0] >= 0 ? caps[sh[0]] : null, y0, y1;
        if (!c) { y0 = hdB + 10; y1 = yB - 6; }
        else if (c.classList.contains('top')) { y0 = c.offsetTop + c.offsetHeight + 12; y1 = yB; }
        else { y0 = hdB + 6; y1 = c.offsetTop - 12; }
        var e = shotExt(sh), k = Math.min(kMax * sh[3], (W - 20) / (e[1] - e[0]), (y1 - y0) / (e[3] - e[2]));
        return [W / 2 - k * (e[0] + e[1]) / 2, (y0 + y1) / 2 - k * (e[2] + e[3]) / 2, k, TH];
      });
      function push(p, f) { return [p[0], p[1], p[2] * f, p[3]]; }

      var pv = DP / (DP - 14 * Math.sin(TH)), P3b = [P[3][0] - P[3][2] * pv * (HXY[6][0] - HXY[2][0]), P[3][1], P[3][2], TH];

      var top = [W / 2, Math.min(H * .47, (hdB + yB) / 2), Math.min(kMax * 1.15, (W * .44) / 84), 0];
      var K = [
        [0, P[0], 'io'], [2.55, push(P[0], 1.025), 'io'],
        [3.05, P[1], 'io'], [4.12, push(P[1], 1.02), 'io'],
        [4.72, P[2], 'io'], [6.05, push(P[2], 1.02), 'io'],
        [6.62, P[3], 'lin'], [HT[2], P[3], 'lin'], [HT[6], P3b, 'io'], [HT[6] + .14, P3b, 'io'],
        [HT[6] + .78, P[4], 'io'], [9.5, push(P[4], 1.02), 'io'],
        [10.05, P[5], 'io'], [12.85, push(P[5], 1.025), 'io'],
        [13.35, P[6], 'io'], [16.22, push(P[6], 1.025), 'io'],
        [16.75, P[7], 'io'], [19.25, push(P[7], 1.025), 'io'],
        [19.8, P[8], 'io'], [HT[11] + .16, P[8], 'io'], [HT[11] + .78, top, 'io'], [21.75, push(top, 1.02), 'io']
      ];
      CAMK = keys(K);
      var mr = q1('.dz-mark .lg-svg').getBoundingClientRect();
      MARK = [mr.left - pr.left, mr.top - pr.top, mr.width, mr.height];
    }


    tl.each(function (t) {
      if (!CAMK) return;
      CAM = CAMK(t);
      plane.style.transform = planeTf();
      G.forEach(function (g, i) {
        var x = GX[i](t), d = i === 2 ? 0 : dip(t, GHIT[i]), hx = GHIT[i].length ? HXY[GHIT[i][0]][0] : 0, hy = GHIT[i].length ? HXY[GHIT[i][0]][1] : 0;
        if (Math.abs(x[0]) >= 630) { if (g.style.visibility !== 'hidden') g.style.visibility = 'hidden'; return; }
        if (g.style.visibility === 'hidden') g.style.visibility = 'visible';
        var s = 1 - d;
        g.style.transform = 'translate(' + x[0].toFixed(2) + 'px,0) rotate(' + x[1].toFixed(2) + 'deg)' + (d ? ' translate(' + hx + 'px,' + hy + 'px) scale(' + s.toFixed(5) + ') translate(' + (-hx) + 'px,' + (-hy) + 'px)' : '');
      });
      if (t > 6.9 && t < 8.8) PAYP.forEach(function (p, k) { var d2 = dip(t, [2 + k]); p.style.transform = d2 ? 'scale(' + (1 - d2).toFixed(5) + ')' : ''; });
      var on = t < ST_OFF + .25;
      [stEl, gh[0], gh[1], shc, sh].forEach(function (e) { var v = on ? 'visible' : 'hidden'; if (e.style.visibility !== v) e.style.visibility = v; });
      if (!on) return;
      var s = stamp(t), lean = leanAt(t);
      placeSt(stEl, s, lean);
      stEl.style.opacity = (1 - cl01((t - ST_OFF) / .2)).toFixed(3);

      [1, 2].forEach(function (n) {
        var s2 = stamp(t - n / 90), sp = Math.abs(s2[2] - s[2]) + Math.abs(s2[0] - s[0]) * .5, e = gh[n - 1];
        if (sp < 5 || s[2] < .5 && s2[2] < .5) { if (e.style.visibility !== 'hidden') e.style.visibility = 'hidden'; return; }
        e.style.visibility = 'visible'; e.style.opacity = (Math.min(1, sp / 30) * (n === 1 ? .34 : .16)).toFixed(3);
        placeSt(e, s2, leanAt(t - n / 90));
      });

      var h = s[2], c1 = cl01(1 - h / 38) * (1 - cl01((t - ST_OFF) / .2));
      shc.style.transform = 'translate(' + (s[0] - 50 + 1.5).toFixed(2) + 'px,' + (s[1] - 48 + 3).toFixed(2) + 'px) scale(' + (1 + h * .004).toFixed(4) + ')';
      shc.style.opacity = (c1 * .85).toFixed(3);
      var ox = 30 + h * .42, oy = 22 + h * .3, bl = 10 + h * .085;
      sh.style.transform = 'translate(' + (s[0] - 56 + ox).toFixed(2) + 'px,' + (s[1] - 54 + oy).toFixed(2) + 'px) scale(' + (1 + h * .0016).toFixed(4) + ')';
      sh.style.opacity = (Math.max(.42, .95 - h * .0026) * (1 - cl01((t - ST_OFF) / .2))).toFixed(3);
      sh.style.filter = 'blur(' + bl.toFixed(1) + 'px)';
    });


    var MK = [['mk-hook', 0], ['mk-led', 1], ['mk-p0', 2], ['mk-p1', 3], ['mk-p2', 4], ['mk-p3', 5], ['mk-p4', 6], ['mk-rep', 7], ['mk-cal', 8], ['mk-logo', 11]];
    MK.forEach(function (m) {
      var el = $(m[0]), T = HT[m[1]], wet = q1('.wet', el);
      tl.to(el, 0, .01, { o: [0, 0] }).at(el, T + F1, { o: 1 });
      tl.to(wet, 0, .01, { o: [1, 1] }).to(wet, T + .45, 1.3, { o: [1, 0] }, 'io');
    });


    var crum = $('dz-rc-crum'), flat = $('dz-rc-flat'), morph = $('dz-morph'), led = $('dz-led'), T1 = HT[1];
    tl.to(crum, 0, .01, { o: [1, 1], s: [.84, .84], r: [-9, -9] }).to(crum, 2.52, .5, { r: [-9, 3] }, 'out3')
      .to(crum, T1 + F1, .14, { o: [1, 0] }, 'out3').to(crum, T1 + F1, .2, { s: [.84, 1], r: [3, 0] }, 'out3');
    tl.to(flat, 0, .01, { o: [0, 0], s: [.9, .9] }).to(flat, T1 + F1, .12, { o: [0, 1] }, 'out3').to(flat, T1 + F1, .45, { s: [.9, 1] }, 'spring')
      .to(flat, 3.9, .16, { o: [1, 0] }, 'out3');
    var MR0 = [-55, -130, 150, 240], MR1 = [-210, -10, 330, 128], fMorph = keys([[0, MR0], [3.88, MR0, 'io'], [4.42, MR1]]);
    tl.to(morph, 0, .01, { o: [0, 0] }).at(morph, 3.88, { o: 1 });
    tl.each(function (t) {
      if (t < 3.8 || t > 6.6) return;
      var r = fMorph(t), st = morph.style;
      st.left = r[0].toFixed(2) + 'px'; st.top = r[1].toFixed(2) + 'px'; st.width = r[2].toFixed(2) + 'px'; st.height = r[3].toFixed(2) + 'px';
    });
    tl.to(led, 0, .01, { o: [0, 0] }).at(led, 4.36, { o: 1 });
    qa('.dz-led > i', led).forEach(function (e, i) { fadeIn(e, 4.3 + .05 * i, .4, 6); });


    var SL = qa('.dz-sl', G[2]), STK = [[-16, 8, -8], [12, -6, 6], [-8, -12, -3], [10, 9, 4], [0, 0, -1]];
    SL.forEach(function (p, i) {
      tl.to(p, 0, .01, { x: [70 + 26 * i, 70 + 26 * i], y: [0, 0], r: [0, 0] }).to(p, 6.12, .62 + .05 * i, { x: [70 + 26 * i, 0] }, 'out5');
      var g0 = HT[6] + .2 + .045 * (4 - i);
      tl.to(p, g0, .62, { x: [0, STK[i][0] - HXY[2 + i][0]], y: [0, STK[i][1]], r: [0, STK[i][2]] }, 'out5');
    });
    var PAYP = qa('.dz-pay', G[2]);


    var barsG = $('dz-bars-g'), BARS = [[-90, 52, 0], [-30, 76, 0], [30, 104, 1]], BW2 = 18, BD = 22, BV = 26;
    var BCOL = [['#FFCDBA', '#FFE2D7', '#EDB49F'], ['#FF5B2E', '#FF8A63', '#D9461F']];
    barsG.innerHTML = BARS.map(function () { return '<path class="sh" filter="url(#dz-bsh)"/><path class="sd"/><path class="fr"/><path class="tp"/>'; }).join('');
    var bp = qa('path', barsG);
    function poly(pts) { return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'Z'; }
    tl.each(function (t) {
      var vis = t > HT[7] + .08 && t < 13.4;
      barsG.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      var gx = GX[3](t)[0];
      BARS.forEach(function (b, i) {
        var u = (t - (HT[7] + .1 + .09 * i)) / .62, hh = b[1] * (u <= 0 ? 0 : E.back(cl01(u))), cu = b[0] + gx, col = BCOL[b[2]];
        var P = bp.slice(i * 4, i * 4 + 4);
        if (hh < .5) { P.forEach(function (p) { p.setAttribute('d', ''); }); return; }
        var x0 = cu - BW2, x1 = cu + BW2, vb = BV - BD, vf = BV;
        var f0 = proj(x0, vf, 0), f1 = proj(x1, vf, 0), f2 = proj(x1, vf, hh), f3 = proj(x0, vf, hh);
        var b2 = proj(x1, vb, hh), b3 = proj(x0, vb, hh), b1 = proj(x1, vb, 0), b0 = proj(x0, vb, 0);
        var side = cu < 0 ? [f1, b1, b2, f2] : [f0, b0, b3, f3];
        var s1 = proj(x0 + hh * .42, vb + hh * .3, 0), s2 = proj(x1 + hh * .42, vb + hh * .3, 0), s3 = proj(x1 + hh * .42, vf + hh * .3, 0);
        P[0].setAttribute('d', poly([f0, f1, s3, s2, s1, b0])); P[0].setAttribute('fill', 'rgba(60,40,28,.11)');
        P[1].setAttribute('d', poly(side)); P[1].setAttribute('fill', col[2]);
        P[2].setAttribute('d', poly([f0, f1, f2, f3])); P[2].setAttribute('fill', col[0]);
        P[3].setAttribute('d', poly([f3, f2, b2, b3])); P[3].setAttribute('fill', col[1]);
      });
      barsG.style.opacity = (1 - cl01((t - 12.85) / .3)).toFixed(3);
    });


    var bq = $('dz-bq'), ba = $('dz-ba'), typ = $('dz-typ'), ans = $('dz-ans');
    tl.to(bq, 0, .01, { o: [0, 0], s: [.6, .6] }).to(bq, 16.95, .22, { o: [0, 1] }, 'out3').to(bq, 16.95, .5, { s: [.6, 1] }, 'out5').to(bq, 19.2, .25, { o: [1, 0] }, 'in3');
    tl.to(ba, 0, .01, { o: [0, 0], s: [.6, .6] }).to(ba, 17.42, .22, { o: [0, 1] }, 'out3').to(ba, 17.42, .5, { s: [.6, 1] }, 'out5').to(ba, 19.2, .25, { o: [1, 0] }, 'in3');
    tl.to(typ, 0, .01, { o: [1, 1] }).at(typ, 17.95, { o: 0 });
    tl.to(ans, 0, .01, { o: [0, 0] }).to(ans, 17.95, .12, { o: [0, 1] }, 'out3');
    tl.to($('dz-phq'), 0, .01, { o: [0, 0] }).to($('dz-phq'), 16.95, .2, { o: [0, 1] }, 'out3');
    tl.to($('dz-pha'), 0, .01, { o: [0, 0] }).to($('dz-pha'), 17.95, .2, { o: [0, 1] }, 'out3');
    var tdots = qa('i', typ);
    tl.each(function (t) {
      tdots.forEach(function (d, k) { var u = t * 7.4 - k * .95; d.style.transform = 'translateY(' + (-Math.max(0, Math.sin(u)) * 4).toFixed(2) + 'px)'; });
      if (t < 16.8 || t > 19.6) return;
      var gx = GX[5](t)[0], a = proj(-130 + gx, -140, 0), b = proj(10 + gx, -140, 0), c = proj(-130 + gx, 140, 0);
      var qw = bq.offsetWidth, qh = bq.offsetHeight, aw = ba.offsetWidth;
      var qx = Math.max(14, Math.min(W - 14 - qw, b[0] + 12 - qw)), qy = a[1] + (c[1] - a[1]) * .3 - qh;
      var ax = Math.max(14, Math.min(W - 14 - aw, a[0] - 18)), ay = qy + qh + 14;
      bq.style.left = qx.toFixed(1) + 'px'; bq.style.top = qy.toFixed(1) + 'px';
      ba.style.left = ax.toFixed(1) + 'px'; ba.style.top = ay.toFixed(1) + 'px';
    });


    var tile = $('dz-tile'), dot = $('dz-tile-dot'), mkLogo = $('mk-logo'), T9 = HT[11];
    var TL0 = 21.0, TL1 = 21.26, MV0 = 21.78, MV1 = 22.3, DROP = 21.12;
    tl.to(mkLogo, T9 + F1 + .01, .01, { o: [1, 1] }).to(mkLogo, TL0 + .12, .16, { o: [1, 0] }, 'io');
    tl.to(tile, 0, .01, { o: [0, 0] }).to(tile, TL0, .14, { o: [0, 1] }, 'io');
    tl.to(dot, 0, .01, { o: [0, 0] }).to(dot, DROP, .05, { o: [0, 1] }, 'lin').to(dot, 0, .01, { y: [-200, -200] }).to(dot, DROP, .75, { y: [-200, 0] }, 'drop');
    var mk = q1('.dz-mark .lg-svg');
    tl.to(mk, 0, .01, { o: [0, 0] }).at(mk, MV1, { o: 1 });
    tl.each(function (t) {
      if (t < TL0 - .02 || t >= MV1) { if (tile.style.visibility !== 'hidden') tile.style.visibility = 'hidden'; return; }
      tile.style.visibility = 'visible';
      var gx = GX[6](t)[0], p0 = proj(-42 + gx, -42, 0), p1 = proj(42 + gx, 42, 0);
      var r0 = [p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]], u = E.io(cl01((t - MV0) / (MV1 - MV0)));
      var r = r0.map(function (v, i) { return v + (MARK[i] - v) * u; });
      tile.style.transform = 'translate(' + r[0].toFixed(2) + 'px,' + r[1].toFixed(2) + 'px) scale(' + (r[2] / 100).toFixed(5) + ',' + (r[3] / 100).toFixed(5) + ')';
    });
    tl.to(G[6], MV0 - .05, .4, { o: [1, 0] }, 'io');
    tl.to($('dz-veil'), 0, .01, { o: [0, 0] }).to($('dz-veil'), MV0, .6, { o: [0, 1] }, 'io');


    caps.forEach(function (cap) {
      var tin = +cap.getAttribute('data-in'), tout = +cap.getAttribute('data-out'), lns = qa('.ln > span', cap);
      tl.to(cap, 0, .01, { o: [0, 0] }).to(cap, tin, .01, { o: [0, 1] }, 'lin').to(cap, tout + .6, .01, { o: [1, 0] }, 'lin');
      lns.forEach(function (l, k) {
        tl.to(l, 0, .01, { yp: [115, 115] }).to(l, tin + .1 + .08 * k, .7, { yp: [115, 0] }, 'out5').to(l, tout - .02 + .05 * k, .4, { yp: [0, -115] }, 'in3');
      });
      qa('.ul path', cap).forEach(function (p) { drawIn(p, tin + .55, .45, 'io'); tl.to(p, tout - .04, .2, { o: [1, 0] }, 'out3'); });
    });


    var END = MV1, word = q1('.dz-mark .lg-word');
    tl.to(word, 0, .01, { o: [0, 0], y: [12, 12] }).to(word, END + .02, .5, { o: [0, 1], y: [12, 0] }, 'out5');
    qa('.dz-end-c > :not(.dz-mark), .dz-foot').forEach(function (e, k) { tl.to(e, 0, .01, { o: [0, 0], y: [18, 18] }).to(e, END + .1 + .15 * k, .6, { o: [0, 1], y: [18, 0] }, 'out5'); });

    layout();
    return { seek: function (t) { tl.seek(t); }, layout: layout, hits: HITS.map(function (h) { return [h[0] / FPS, h[1]]; }), end: END };
  })();


  var END_AT = MGd.end, DUR = 25.2;
  var running = false, held = false, tOff = 0, t0 = 0, ended = false, lastT = 0, sched = {};
  var SVOL = { big: 1, mid: .9, run: .55, tap: .28 }, SLEAD = .035;
  function now() { return (held || !running) ? tOff : tOff + (performance.now() - t0) / 1000; }
  function paint(t) {
    lastT = t; MGd.seek(t);
    var past = t >= END_AT;
    if (past !== ended) { ended = past; root.classList.toggle('dz-done', past); }
  }
  function sound(t) {
    var S = window.TMSound; if (!S || !S.on || !running || held) return;
    var lat = S.latency ? S.latency() : 0;
    MGd.hits.forEach(function (h, i) {
      if (sched[i]) return;
      var d = h[0] - SLEAD - lat - t;
      if (d < .12) { sched[i] = 1; if (d > -.04) S.play('stamp', SVOL[h[1]], Math.max(0, d)); }
    });
  }
  function loop() {
    if (!running || held) return;
    var t = now(); sound(t); paint(t);
    if (t < DUR) requestAnimationFrame(loop); else { running = false; tOff = DUR; }
  }
  function play(from) {
    sched = {}; MGd.hits.forEach(function (h, i) { if (h[0] < from) sched[i] = 1; });
    tOff = from; t0 = performance.now(); running = true; held = false; requestAnimationFrame(loop);
  }
  function toEnd() {
    running = false; held = false; tOff = 30; paint(30);
    var e = $('dz-end'); if (e && !calm) e.focus({ preventScroll: true });
  }

  function ready(fn) {
    var done = false;
    function go() { if (done) return; done = true; MGd.layout(); fn(); }
    void $('dz').offsetHeight;
    requestAnimationFrame(function () { if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(go); else go(); });
    setTimeout(go, 2500);
  }

  function imgs(fn) {
    var list = [].slice.call(doc.querySelectorAll('.dz-st img')), n = list.length, k = 0;
    function one() { if (++k >= n) fn(); }
    list.forEach(function (im) { if (im.complete) one(); else { im.addEventListener('load', one); im.addEventListener('error', one); } });
  }
  var SEEK = parseFloat(q.get('t')), CAP = q.get('cap') === '1';
  if (CAP) {
    root.classList.add('dz-capmode');
    window.__seek = function (t) { paint(t); return t; };
    ready(function () { imgs(function () { paint(0); root.classList.add('sb-shot'); }); });
  } else if (!isNaN(SEEK)) {
    ready(function () { imgs(function () { paint(SEEK); root.classList.add('sb-shot'); }); });
  } else if (calm) {
    paint(30); ready(function () { paint(30); });
  } else {
    paint(0); ready(function () { imgs(function () { play(0); }); });
  }
  $('dz-skip').addEventListener('click', toEnd);

  function hold(on) {
    root.classList.toggle('hold', on);
    if (on) { if (running && !held) { tOff = now(); held = true; } }
    else if (held) { held = false; t0 = performance.now(); requestAnimationFrame(loop); }
  }
  doc.addEventListener('visibilitychange', function () {
    if (doc.hidden) { if (running && !held) { tOff = now(); held = true; } }
    else if (held && !root.classList.contains('hold')) { held = false; t0 = performance.now(); requestAnimationFrame(loop); }
  });
  window.addEventListener('resize', function () { MGd.layout(); paint(lastT); });

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
