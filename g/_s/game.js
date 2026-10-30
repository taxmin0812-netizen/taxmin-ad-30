/* 택스민 게임 랜딩 공용 엔진 (window.TM)
   시안 page.js 는 이 파일 뒤에 읽히고, TM.onPlay = function () { … } 로 게임을 시작한다.
   질문은 세 가지로 모든 시안이 같다:
     ① 업종  g: 'A' 도소매·온라인 | 'B' 음식점·카페·제조 | 'C' 서비스·프리랜서·학원 | '?' 그 밖의 업종 | 'P' 전문직 | 'X' 법인
     ② 직원  emp: 'few'(없음~5명) | 'many'(6명 이상)
     ③ 매출  rev: 'low'(작년 한 달 평균 기준 이하 · 올해 시작 포함) | 'high'(넘음) | 'unk'(잘 모름)
   다 고르면 TM.result({ g, emp, rev }, { eye: '삼진 아웃!' }) 로 결과 카드를 띄운다. 법인(X)은 ②③ 없이 바로. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var q = new URLSearchParams(location.search);
  var LIVE_HOST = (root.getAttribute('data-live-host') || '').toLowerCase();
  var LOCAL = !LIVE_HOST || (location.hostname !== LIVE_HOST && location.hostname !== 'www.' + LIVE_HOST);
  var SHOT = q.has('shot');
  var calm = SHOT || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var KAKAO = 'https://pf.kakao.com/_Mxojqs/chat', TEL = '0507-1428-6446';
  function $(id) { return doc.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(tag, cls, html) { var e = doc.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ── 들어온 곳 · 숫자 세기(hit.php) ── */
  var ALIAS = { insta: 'insta', instagram: 'insta', ig: 'insta', daangn: 'daangn', karrot: 'daangn', danggeun: 'daangn', youtube: 'youtube', yt: 'youtube',
    kakao: 'kakao', kakaotalk: 'kakao', blog: 'blog', naver: 'naver', facebook: 'facebook', fb: 'facebook', google: 'google', homepage: 'homepage' };
  var NAME = { insta: '인스타그램', daangn: '당근', youtube: '유튜브', kakao: '카카오톡', blog: '블로그', naver: '네이버', facebook: '페이스북', google: '구글',
    homepage: '세무회계 민 홈페이지', direct: '(주소에 표시 없음)' };
  function clean(s, n) { return String(s || '').replace(/[^0-9A-Za-z_\-]/g, '').slice(0, n || 24); }
  var rawSrc = clean(q.get('src') || q.get('utm_source')).toLowerCase(), srcKey = ALIAS[rawSrc] || rawSrc, guessed = false;
  if (!srcKey) {
    var ua = navigator.userAgent || '', ref = doc.referrer || '';
    if (/Instagram/i.test(ua) || /instagram\.com/i.test(ref)) srcKey = 'insta';
    else if (/karrot|daangn/i.test(ua) || /daangn|karrot/i.test(ref)) srcKey = 'daangn';
    else if (/FBAN|FBAV/i.test(ua) || /facebook\.com/i.test(ref)) srcKey = 'facebook';
    else if (/KAKAOTALK/i.test(ua)) srcKey = 'kakao';
    else if (/naver\.com/i.test(ref)) srcKey = 'naver';
    else if (/google\./i.test(ref)) srcKey = 'google';
    guessed = !!srcKey;
  }
  if (!srcKey) srcKey = 'direct';
  var srcLabel = (NAME[srcKey] || srcKey) + (guessed ? '(주소 표시 없음 · 앱 정보로 짐작)' : '');
  var adKey = clean(q.get('v') || q.get('utm_content'), 30).toUpperCase(), campaign = clean(q.get('utm_campaign'), 40);
  var VARIANT = clean(root.getAttribute('data-variant'), 12).toLowerCase(), VNAME = root.getAttribute('data-variant-name') || '게임';
  var statAd = VARIANT ? (adKey ? adKey + '-' : '') + VARIANT.toUpperCase().slice(0, 6) : adKey;
  var sent = {};
  function hit(e, once) {
    if (LOCAL || SHOT || (once && sent[e])) return;
    sent[e] = 1;
    var b = 'e=' + e + '&s=' + encodeURIComponent(srcKey) + '&v=' + encodeURIComponent(statAd);
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('hit.php', new Blob([b], { type: 'application/x-www-form-urlencoded' }));
      else fetch('hit.php', { method: 'POST', body: b, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, keepalive: true });
    } catch (x) { }
  }
  hit('view');
  doc.addEventListener('click', function (ev) { var a = ev.target.closest && ev.target.closest('[data-hit]'); if (a) hit(a.getAttribute('data-hit')); });

  /* ── 8비트 효과음(처음 누른 뒤부터, 배경음 없음) ── */
  var AC = null, muted = false, SMOOTH = root.getAttribute('data-look') === 'smooth';
  try { muted = localStorage.getItem('tm-mute') === '1'; } catch (x) { }
  function ac() {
    if (muted) return null;
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (x) { return null; } }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(c, f, t, d, type, vol, to) {
    var o = c.createOscillator(), g = c.createGain(), s = c.currentTime + t;
    o.type = SMOOTH && (!type || type === 'square' || type === 'sawtooth') ? 'sine' : (type || 'square'); o.frequency.setValueAtTime(f, s); if (to) o.frequency.exponentialRampToValueAtTime(to, s + d);
    g.gain.setValueAtTime(vol || .06, s); g.gain.exponentialRampToValueAtTime(.0001, s + d);
    o.connect(g); g.connect(c.destination); o.start(s); o.stop(s + d + .02);
  }
  function noise(c, t, d, vol) {
    var n = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, n, c.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource(), g = c.createGain(); src.buffer = buf; g.gain.value = vol || .12;
    src.connect(g); g.connect(c.destination); src.start(c.currentTime + t);
  }
  var SFX = {
    blip: [[1200, 0, .035]], tap: [[660, 0, .05]], select: [[880, 0, .06], [1320, .06, .09]],
    throw: [[260, 0, .2, 'sawtooth', .05, 980]], swing: [[700, 0, .12, 'triangle', .07, 180]],
    hit: [[140, 0, .14, 'square', .12, 55]], strike: [[523, 0, .09], [659, .09, .09], [784, .18, .16]],
    win: [[523, 0, .11], [659, .11, .11], [784, .22, .11], [1047, .33, .32]], coin: [[988, 0, .07], [1319, .07, .3]],
    error: [[220, 0, .16, 'square', .07, 110]], power: [[200, 0, .5, 'sawtooth', .05, 1600]], down: [[700, 0, .3, 'square', .05, 120]],
    boom: 'boom', thud: 'thud'
  };
  function sfx(name) {
    var c = ac(); if (!c) return;
    var s = SFX[name]; if (!s) return;
    if (s === 'boom') { noise(c, 0, .5, .16); tone(c, 90, 0, .4, 'square', .1, 40); return; }
    if (s === 'thud') { noise(c, 0, .12, .1); tone(c, 110, 0, .1, 'square', .08, 60); return; }
    s.forEach(function (a) { tone(c, a[0], a[1], a[2], a[3], a[4], a[5]); });
  }
  var snd = el('button', 'gm-snd', muted ? '소리 꺼짐' : '소리 켜짐');
  snd.type = 'button'; snd.setAttribute('aria-pressed', muted ? 'false' : 'true'); snd.setAttribute('aria-label', '효과음 켜고 끄기');
  snd.addEventListener('click', function () {
    muted = !muted; try { localStorage.setItem('tm-mute', muted ? '1' : '0'); } catch (x) { }
    snd.textContent = muted ? '소리 꺼짐' : '소리 켜짐'; snd.setAttribute('aria-pressed', muted ? 'false' : 'true'); if (!muted) sfx('blip');
  });

  /* ── 작은 도구들 ── */
  function wait(ms) { return new Promise(function (r) { setTimeout(r, calm ? 0 : ms); }); }
  function sprite(rows, pal, o) {
    o = o || {};
    var w = 0, h = rows.length, r = '';
    rows.forEach(function (row, y) {
      w = Math.max(w, row.length);
      for (var x = 0; x < row.length;) {
        var c = row[x]; if (c === '.' || !pal[c]) { x++; continue; }
        var x2 = x; while (x2 < row.length && row[x2] === c) x2++;
        r += '<rect x="' + x + '" y="' + y + '" width="' + (x2 - x) + '" height="1" fill="' + pal[c] + '"/>';
        x = x2;
      }
    });
    var px = o.px || 4;
    return '<svg class="spr ' + (o.cls || '') + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w * px + '" height="' + h * px + '" shape-rendering="crispEdges" aria-hidden="true">' + r + '</svg>';
  }
  function stamp(host, text, small, ms) {
    var s = el('div', 'gm-stamp', esc(text) + (small ? '<small>' + esc(small) + '</small>' : ''));
    host.appendChild(s);
    return wait(ms || 900).then(function () { s.classList.add('out'); return wait(300); }).then(function () { s.remove(); });
  }
  function shake(node) { node.classList.remove('gm-shake'); void node.offsetWidth; node.classList.add('gm-shake'); }
  function flash(node) { node.classList.remove('gm-flash'); void node.offsetWidth; node.classList.add('gm-flash'); setTimeout(function () { node.classList.remove('gm-flash'); }, 400); }
  function confetti(host, n, colors) {
    if (calm) return;
    var c = el('div', 'gm-confetti'); colors = colors || ['#FF5B2E', '#FFE14A', '#4AD9FF', '#7CE04A', '#fff'];
    for (var i = 0; i < (n || 46); i++) {
      var p = el('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.4 + Math.random() * 1.4) + 's'; p.style.animationDelay = Math.random() * .5 + 's'; c.appendChild(p);
    }
    host.appendChild(c); setTimeout(function () { c.remove(); }, 3600);
  }
  function type(node, text, speed) {
    if (calm) { node.textContent = text; return Promise.resolve(); }
    node.textContent = '';
    return new Promise(function (res) {
      var i = 0; (function step() { node.textContent = text.slice(0, ++i); if (i % 2) sfx('blip'); if (i < text.length) setTimeout(step, speed || 38); else res(); })();
    });
  }

  /* ── 기장료 계산 = 택스민 요금 등급표(10/29, 개인사업자 · 직전 연도 매출(수입금액) 기준) ──
     업종군(소득세법 시행령 복식부기·외부조정·성실신고 업종 구분): 가군 도소매·농림어업·광업·부동산매매 / 나군 제조·음식·숙박·건설·운수·정보통신 / 다군 서비스·임대·교육·보건·전문직
     등급: Lite 월 5~6만원(복식부기 장부 포함, 직원 3명까지 5만 · 4~5명 6만) | Plus 월 7~8만원(Lite 상한 ~ 성실 전) | 성실 월 12~15만원(성실신고확인 대상)
     경계: Lite 상한 가 9억 · 나 5억 · 다 3억 / 성실신고 가 15억 · 나 7.5억 · 다 5억. 부가세 별도 · 조정료 별도 · 6개월 약정 기준. Plus·성실의 직원 수 기준은 미정.
     질문은 그대로 두 갈래: 직원 few(없음~5명)·many(6명 이상), 매출 low(Lite 상한 이하)·high(넘음)·unk(모름). */
  var GRP = {
    '가': { lite: '9억원', sin: '15억원' },
    '나': { lite: '5억원', sin: '7억 5천만원' },
    '다': { lite: '3억원', sin: '5억원' }
  };
  var G = {
    A: { name: '도소매 · 온라인 판매', grp: '가', who: '도소매·온라인 판매는' },
    B: { name: '음식점 · 카페 · 제조', grp: '나', who: '음식점·카페·제조는' },
    C: { name: '서비스 · 프리랜서 · 학원', grp: '다', who: '서비스·프리랜서·학원은' },
    '?': { name: '그 밖의 업종', grp: '다' },
    P: { name: '전문직(의료·법률·세무 등)', grp: '다', who: '전문직은' },
    X: { name: '법인사업자' }
  };
  function grp(g) { return GRP[(G[g] || G.C).grp || '다']; }
  function revQ(g) { return '작년 매출이 ' + grp(g).lite + ' 이하인가요?'; }
  function compute(a) {
    var g = G[a.g] ? a.g : '?', many = a.emp === 'many', L = grp(g);
    var R = { g: g, ind: G[g].name, emp: g === 'X' ? '-' : (many ? '6명 이상' : '없음 ~ 5명'), rev: '-', plan: '', price: '', sub: '', why: '', kind: '' };
    if (g === 'X') { R.kind = 'corp'; R.plan = '법인 기장'; R.price = '월 12만원부터'; R.why = '택스민 등급표는 개인사업자 기준이에요. 법인은 상담 때 따로 안내해 드려요.'; return R; }
    R.rev = a.rev === 'low' ? '작년 매출 ' + L.lite + ' 이하(올해 시작 포함)' : a.rev === 'high' ? '작년 매출 ' + L.lite + ' 넘음' : '잘 모름';
    if (a.rev === 'unk') {
      R.kind = 'unk'; R.plan = '택스민 Lite 또는 Plus'; R.price = many ? '월 7~8만원' : '월 5~8만원';
      R.why = '작년 매출에 따라 등급이 정해져요. 상담 때 홈택스 자료로 함께 확인해 드릴게요.';
      return R;
    }
    if (a.rev === 'high') {
      R.kind = 'plus'; R.plan = '택스민 Plus'; R.price = '월 7~8만원';
      R.sub = '작년 매출이 ' + L.sin + '을 넘으면 월 12~15만원';
      R.why = g === '?' ? '업종에 따라 기준이 달라요. 상담 때 함께 확인해 드릴게요.' : G[g].who + ' 작년 매출이 ' + L.lite + '을 넘으면 Plus 등급이에요.';
      return R;
    }
    if (many) {
      R.kind = 'plus'; R.plan = '택스민 Plus'; R.price = '월 7~8만원';
      R.why = 'Lite는 직원 5명까지예요. 6명부터는 Plus예요.';
      return R;
    }
    R.kind = 'lite'; R.plan = '택스민 Lite'; R.price = '월 5만원'; R.sub = '직원이 4~5명이면 월 6만원';
    return R;
  }

  /* ── 결과 카드 ── */
  var stage = doc.querySelector('.gm-stage') || body, R = null, onAgain = null;
  var CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.6c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 5.9l-.9 3.5c-.1.4.4.7.7.4l4.2-2.8h.8c5 0 9-3.1 9-7s-4-7-9-7z"/></svg>';
  var PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1z"/></svg>';
  var LEGAL = doc.querySelector('.gm-stage > .gm-legal');
  var res = el('section', 'gm-res'); res.setAttribute('aria-live', 'polite'); res.setAttribute('aria-hidden', 'true'); stage.appendChild(res);
  stage.appendChild(snd);
  function result(a, o) {
    o = o || {};
    R = compute(a);
    var inc = R.kind === 'corp' ? ['법인 장부 기장', '부가세·법인세 신고', '인건비 신고'] : ['장부 정리', '부가세 신고', '직원 월급 신고'];
    var est = R.kind !== 'lite';
    res.innerHTML = '<div class="gm-res-card">' + (o.art ? '<div class="gm-res-art">' + o.art + '</div>' : '') +
      '<p class="gm-res-eye">' + esc(o.eye || '계산 끝!') + '</p>' +
      '<p class="gm-res-plan">' + esc(R.plan) + '</p>' +
      '<p class="gm-res-price"><b>' + esc(R.price) + '</b><small>부가세 별도' + (est ? ' · 예상 금액' : '') + '</small></p>' +
      (R.sub ? '<p class="gm-res-sub">' + esc(R.sub) + '</p>' : '') +
      (R.why ? '<p class="gm-res-why">' + esc(R.why) + '</p>' : '') +
      '<ul class="gm-res-inc">' + inc.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<p class="gm-res-note">' + (R.kind === 'corp' ? '법인세 신고 비용은 따로이고, 신고 전에 먼저 알려 드려요.' : '6개월 이용 기준이에요. 5월 종합소득세 신고 비용은 따로이고, 신고 전에 먼저 알려 드려요.') + '</p>' +
      '<div class="gm-res-act"><a class="gm-btn kakao" href="' + KAKAO + '" target="_blank" rel="noopener" data-hit="kakao">' + CHAT + '카카오톡으로 상담하기</a>' +
      '<button class="gm-btn tel" type="button" data-book>' + PHONE + '전화 상담 예약하기</button>' +
      '<button class="gm-again" type="button" data-again>' + esc(o.again || '처음부터 다시') + '</button></div>' +
      (LEGAL ? '<p class="gm-legal">' + LEGAL.innerHTML + '</p>' : '') + '</div>';
    onAgain = o.onAgain || null;
    body.classList.remove('gm-playing'); body.classList.add('gm-done');
    res.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { res.classList.add('on'); });
    hit('result', true);
    return R;
  }
  function closeResult() { res.classList.remove('on'); res.setAttribute('aria-hidden', 'true'); body.classList.remove('gm-done'); }
  res.addEventListener('click', function (e) {
    if (e.target.closest('[data-book]')) { sfx('select'); book(); }
    else if (e.target.closest('[data-again]')) { sfx('tap'); closeResult(); if (onAgain) onAgain(); }
  });

  /* ── 전화 상담 예약 ── */
  var sheet = el('dialog', 'gm-sheet');
  sheet.setAttribute('aria-labelledby', 'gm-sheet-h');
  sheet.innerHTML = '<div class="gm-sheet-in"><button class="gm-x" type="button" aria-label="닫기">×</button>' +
    '<div class="gm-form"><h2 id="gm-sheet-h">번호를 남겨 주시면<br>전화드릴게요</h2><p class="gm-pick" id="gm-pick"></p>' +
    '<form id="gm-f" novalidate><input class="gm-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<div class="gm-fld"><label for="gm-name">이름<em>*</em></label><input id="gm-name" type="text" autocomplete="name" maxlength="40" required></div>' +
    '<div class="gm-fld"><label for="gm-tel">휴대폰 번호<em>*</em></label><input id="gm-tel" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="010-0000-0000" required></div>' +
    '<div class="gm-fld"><label for="gm-msg">전화받기 편한 시간 <span class="gm-opt">(선택)</span></label><input id="gm-msg" type="text" maxlength="200" placeholder="예) 평일 오후 2시 이후"></div>' +
    '<label class="gm-agree"><input id="gm-ok" type="checkbox"><span>[필수] 상담을 위한 개인정보 수집·이용에 동의합니다</span></label>' +
    '<ul class="gm-agree-d"><li><b>목적</b> 상담 연락, 예상 기장료 안내, 들어온 경로 확인</li>' +
    '<li><b>항목</b> 이름, 휴대폰 번호, 업종, 작년 매출 구간, 직원 수, 계산 결과, 남기신 말씀, 들어온 경로(광고 매체·광고 번호)</li>' +
    '<li><b>보관</b> 마지막 상담일부터 1년 뒤 파기(계약하시면 계약·법령에 따른 기간 동안 보관)</li></ul>' +
    '<p class="gm-agree-d">동의하지 않으셔도 됩니다. 이 경우 예약은 접수되지 않지만 카카오톡·전화로 똑같이 상담하실 수 있어요. <a href="privacy.html" target="_blank" rel="noopener">개인정보처리방침</a></p>' +
    '<button class="gm-btn tel" type="submit">' + PHONE + '전화 상담 예약하기</button><p class="gm-msg" id="gm-out" role="alert"></p></form></div>' +
    '<div class="gm-done" hidden><h2>전화 상담 예약이<br>접수되었어요</h2><p id="gm-done-p">평일 10:00~17:30 사이, 말씀하신 시간에 맞춰 전화드릴게요.<br>먼저 물어보실 게 있으면 카카오톡으로 말씀해 주세요.</p>' +
    '<a class="gm-btn kakao" href="' + KAKAO + '" target="_blank" rel="noopener" data-hit="kakao">' + CHAT + '카카오톡으로 상담하기</a></div></div>';
  body.appendChild(sheet);
  var fm = sheet.querySelector('#gm-f'), nameI = $('gm-name'), telI = $('gm-tel'), msgI = $('gm-msg'), okI = $('gm-ok'), out = $('gm-out');
  function book() {
    hit('form', true);
    $('gm-pick').innerHTML = R ? esc([R.ind, R.kind === 'corp' ? '' : R.rev, R.kind === 'corp' ? '' : '직원 ' + R.emp].filter(Boolean).join(' · ')) + '<br>→ ' + esc(R.plan) + ' · <b>' + esc(R.price) + '</b> (부가세 별도)' : '';
    sheet.querySelector('.gm-form').hidden = false; sheet.querySelector('.gm-done').hidden = true;
    if (sheet.showModal) sheet.showModal(); else sheet.setAttribute('open', '');
  }
  sheet.querySelector('.gm-x').addEventListener('click', function () { sheet.close ? sheet.close() : sheet.removeAttribute('open'); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });
  telI.addEventListener('input', function () {
    var d = telI.value.replace(/\D/g, '').slice(0, 11); if (!/^01/.test(d)) return;
    var mid = d.length === 10 ? 6 : 7;
    telI.value = d.length < 4 ? d : d.length <= mid ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, mid) + '-' + d.slice(mid);
  });
  [nameI, telI].forEach(function (i) { i.addEventListener('input', function () { i.parentNode.classList.remove('bad'); }); });
  okI.addEventListener('change', function () { okI.closest('.gm-agree').classList.remove('bad'); });
  function finish() { sheet.querySelector('.gm-form').hidden = true; sheet.querySelector('.gm-done').hidden = false; sfx('win'); }
  fm.addEventListener('submit', function (ev) {
    ev.preventDefault(); out.textContent = '';
    var bad = [], tel = telI.value.trim();
    if (!nameI.value.trim()) bad.push(nameI);
    if (!/^[0-9 +\-()]{9,20}$/.test(tel) || tel.replace(/\D/g, '').length < 9) bad.push(telI);
    bad.forEach(function (i) { i.parentNode.classList.add('bad'); });
    if (!okI.checked) { okI.closest('.gm-agree').classList.add('bad'); if (!bad.length) bad.push(okI); }
    if (bad.length) { sfx('error'); out.textContent = bad[0] === okI ? '개인정보 수집·이용에 동의해 주세요.' : '이름과 휴대폰 번호를 확인해 주세요.'; bad[0].focus(); return; }
    var data = {
      '이름': nameI.value.trim(), '연락처': tel, '업종': R ? R.ind : '-', '작년 매출': R ? R.rev : '-', '직원(4대보험)': R ? R.emp : '-',
      '추천 요금제': R ? R.plan : '-', '예상 기장료': R ? R.price + ' (부가세 별도)' : '-', '남기실 말씀': msgI.value.trim() ? '편한 시간: ' + msgI.value.trim() : '',
      '들어온 곳': srcLabel, '광고': adKey || '-', '캠페인': campaign || '-', '시안': VNAME, '개인정보 수집·이용 동의': '동의함',
      '_honey': fm.querySelector('.gm-hp').value, '_s': srcKey, '_v': statAd
    };
    if (LOCAL) { $('gm-done-p').insertAdjacentHTML('beforeend', '<br><small>(미리보기 — 실제로 보내지는 않았어요)</small>'); finish(); return; }
    var btn = fm.querySelector('button[type=submit]'); btn.disabled = true;
    fetch('apply.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.success === 'true', code: r.status }; }); })
      .then(function (r) {
        btn.disabled = false;
        if (r.ok) { finish(); return; }
        out.textContent = r.code === 429 ? '방금 예약하셨어요. 잠시 뒤에 다시 보내 주시거나 카카오톡·전화로 연락 주세요.' : '보내지 못했어요. 카카오톡이나 전화(' + TEL + ')로 연락 주세요.';
      })
      .catch(function () { btn.disabled = false; out.textContent = '인터넷 연결을 확인해 주세요. 카카오톡이나 전화(' + TEL + ')로도 상담하실 수 있어요.'; });
  });

  /* ── 하단 단추 → 게임 시작 ── */
  var TM = window.TM = {
    LOCAL: LOCAL, SHOT: SHOT, calm: calm, G: G, $: $, esc: esc, el: el,
    hit: hit, sfx: sfx, wait: wait, sprite: sprite, stamp: stamp, shake: shake, flash: flash, confetti: confetti, type: type,
    revQ: revQ, compute: compute, result: result, closeResult: closeResult, book: book, onPlay: null,
    playing: function (on) { body.classList.toggle('gm-playing', on !== false); }
  };
  doc.addEventListener('click', function (e) {
    var p = e.target.closest && e.target.closest('[data-play]'); if (!p) return;
    e.preventDefault(); ac(); sfx('select'); hit('play', true);
    closeResult(); TM.playing(true);
    if (TM.onPlay) TM.onPlay();
  });
  doc.addEventListener('pointerdown', function once() { ac(); doc.removeEventListener('pointerdown', once); }, { once: true });
})();
