/* 22 메신저 — 첫 화면: 입력창에 '세금 신고 언제 해야 돼요..?' → 세무사 입력 중… → '이미 다 해 놨어요' → '헐 얼마예요?' → 큰 말풍선 '월 5만원부터요'
   놀이: 세무사가 말풍선으로 묻고, 사장님은 입력창 위 '빠른 답장' 칩으로 답함(내 말풍선 · 읽음 · 시간) → 세무사가 안내서를 보냄 → 결과 */
(function () {
  'use strict';
  var T = window.TM, $ = T.$, esc = T.esc;
  var feed = $('feed'), log = $('log'), quick = $('quick'), inp = $('inp'), typed = $('typed'), send = $('send'), st = $('st'), stT = $('st-t');
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.2 0 3.6 1.2 5.4 3.2C13.8 6.2 15.2 5 17.4 5 21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg>';
  var BOLT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>';

  var gen = 0;                                   // 흐름이 바뀌면 앞선 연출을 멈추는 번호
  function guard(g) { return function (v) { if (g !== gen) throw 0; return v; }; }
  function now() { var d = new Date(), h = d.getHours(), m = d.getMinutes(); return (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m; }
  function down() { if (log.scrollTo) log.scrollTo({ top: log.scrollHeight, behavior: T.calm ? 'auto' : 'smooth' }); else log.scrollTop = log.scrollHeight; }

  /* ── 말풍선 ── */
  function add(side, html, o) {
    o = o || {};
    var prev = feed.lastElementChild, row = T.el('div', 'row ' + side + (o.cls ? ' ' + o.cls : ''));
    if (side === 'yo' && !(prev && prev.classList.contains('yo'))) row.classList.add('first');
    row.innerHTML = (side === 'yo' ? '<span class="av-s" aria-hidden="true">세</span>' : '') + '<div class="bub' + (o.bub ? ' ' + o.bub : '') + '">' + html + '</div>' +
      (o.noMeta ? '' : '<span class="meta">' + (side === 'me' ? '<em' + (o.read ? ' class="rd">읽음' : '>1') + '</em>' : '') + now() + '</span>');
    feed.appendChild(row); down();
    return row;
  }
  function sys(t) { feed.appendChild(T.el('p', 'sys', esc(t))); down(); }
  function status(on) { st.classList.toggle('typing', on); stT.textContent = on ? '입력 중...' : '지금 답장 가능'; }
  function read(row) { var e = row.querySelector('.meta em'); if (e) { e.textContent = '읽음'; e.className = 'rd'; } }

  // 세무사: 입력 중 점 세 개 → 말풍선
  function yo(g, html, o, ms) {
    var dots;
    return Promise.resolve().then(guard(g)).then(function () {
      status(true); dots = add('yo', '<i></i><i></i><i></i>', { cls: 'typing', noMeta: true });
      return T.wait(ms || 850);
    }).then(function (v) { dots.remove(); status(false); return v; }).then(guard(g)).then(function () {
      T.sfx('blip'); return add('yo', html, o);
    });
  }
  // 사장님: 입력창에 글자가 찍히고 → 보내기 → 내 말풍선 → 읽음
  function me(g, text, typeMs, cls) {
    var row;
    return Promise.resolve().then(guard(g)).then(function () {
      inp.classList.add('on'); var sp = T.el('span'); typed.innerHTML = ''; typed.appendChild(sp); return T.type(sp, text, typeMs || 42);
    }).then(guard(g)).then(function () { return T.wait(160); }).then(guard(g)).then(function () {
      send.classList.remove('go'); void send.offsetWidth; send.classList.add('go'); T.sfx('tap');
      typed.innerHTML = ''; inp.classList.remove('on');
      row = add('me', esc(text), { cls: cls });
      return T.wait(520);
    }).then(function () { read(row); return T.wait(220); });
  }
  function bigRow() {
    var r = add('yo', '월 5만원부터요<small>부가세 별도</small>', { bub: 'big', cls: 'h big-in' });
    return r;
  }
  function react(r) { var b = r.querySelector('.bub'); if (b && !b.querySelector('.react')) b.insertAdjacentHTML('beforeend', '<span class="react" aria-hidden="true">' + HEART + '</span>'); }

  /* ── 첫 화면 ── */
  var hookDone = false, started = false;
  function intro() { feed.innerHTML = '<p class="day"><img src="../_s/img/favicon.svg" alt="">택스민 · 오늘</p>'; }
  function hookStatic() {
    gen++; intro(); status(false); typed.innerHTML = ''; inp.classList.remove('on');
    add('me', '세금 신고 언제 해야 돼요..?', { read: true, cls: 'h' });
    add('yo', '이미 다 해 놨어요', { cls: 'h' });
    add('me', '헐 얼마예요?', { read: true, cls: 'h' });
    react(add('yo', '월 5만원부터요<small>부가세 별도</small>', { bub: 'big', cls: 'h' }));
    [].forEach.call(feed.querySelectorAll('.row'), function (r) { r.style.animation = 'none'; });
    hookDone = true; down();
  }
  function hook() {
    if (T.calm) { hookStatic(); return; }
    var g = ++gen; intro();
    T.wait(250).then(guard(g))
      .then(function () { return me(g, '세금 신고 언제 해야 돼요..?', 42, 'h'); })
      .then(function () { return yo(g, '이미 다 해 놨어요', { cls: 'h' }, 1000); })
      .then(function () { return T.wait(350); }).then(guard(g))
      .then(function () { return me(g, '헐 얼마예요?', 42, 'h'); })
      .then(guard(g)).then(function () {
        status(true); var dots = add('yo', '<i></i><i></i><i></i>', { cls: 'typing', noMeta: true });
        return T.wait(1100).then(function () { dots.remove(); status(false); });
      })
      .then(guard(g)).then(function () { T.sfx('coin'); var r = bigRow(); return T.wait(650).then(function () { return r; }); })
      .then(guard(g)).then(function (r) { react(r); T.sfx('select'); hookDone = true; })
      .catch(function () { });
  }

  /* ── 빠른 답장 ── */
  var CH = {
    1: [['A', '도소매 · 온라인 판매'], ['B', '음식점 · 카페 · 제조'], ['C', '서비스 · 프리랜서 · 학원'], ['?', '그 밖의 업종'], ['P', '전문직이에요', '의료·법률·세무 등', 1], ['X', '법인사업자예요', '', 1]],
    2: [['few', '없음 ~ 5명'], ['many', '6명 이상']],
    3: [['low', '이하예요', '올해 시작했어도 이쪽'], ['high', '넘어요'], ['unk', '잘 모르겠어요', '', 1]]
  };
  var A = {}, step = 0, busy = true;
  function chips(n) {
    step = n; busy = false;
    quick.className = 'quick';
    quick.innerHTML = '<p class="q-lb">' + BOLT + '빠른 답장</p>' + CH[n].map(function (c) {
      return '<button class="qr' + (c[3] ? ' s' : '') + '" type="button" data-k="' + esc(c[0]) + '" data-t="' + esc(c[1]) + '">' + esc(c[1]) + (c[2] ? '<small>' + esc(c[2]) + '</small>' : '') + '</button>';
    }).join('');
    quick.hidden = false; down();
  }
  function ask(g, n) {
    var q = n === 1 ? '어떤 일 하세요?' : n === 2 ? '4대보험 직원은 몇 명이에요?' : T.revQ(A.g);
    return yo(g, esc(q), null, n === 1 ? 700 : 900).then(guard(g)).then(function () { chips(n); });
  }
  quick.addEventListener('click', function (e) {
    var b = e.target.closest('.qr'); if (!b || busy) return;
    busy = true; T.sfx('select'); b.classList.add('on'); quick.classList.add('off');
    var k = b.getAttribute('data-k'), t = b.getAttribute('data-t'), g = gen, n = step;
    if (n === 1) A = { g: k }; else if (n === 2) A.emp = k; else A.rev = k;
    T.wait(260).then(function () { quick.hidden = true; return me(g, t, 26); })
      .then(function () {
        if (n === 1 && k === 'X') return yo(g, '법인이시군요. 바로 알려 드릴게요').then(function () { return done(g); });
        if (n === 3) return done(g);
        return ask(g, n + 1);
      }).catch(function () { });
  });

  /* ── 세무사가 결과를 보냄 ── */
  function done(g) {
    return yo(g, '계산 끝났어요!', null, 800)
      .then(function () {
        return yo(g, '<span class="card-h"><img src="../_s/img/favicon.svg" alt="">우리 가게 기장료</span><span class="card-b">이번 답장으로 계산했어요<b>' + esc(T.compute(A).price) + '</b></span><span class="card-go">열어 보기</span>', { bub: 'card' }, 700);
      })
      .then(guard(g)).then(function () { T.sfx('coin'); return T.wait(1000); })
      .then(guard(g)).then(function () { T.result(A, { eye: '우리 가게 세무사 · 기장료 안내', again: '다시 물어보기', onAgain: restart }); });
  }
  function restart() {
    var g = ++gen; A = {}; T.playing(true); quick.hidden = true;
    sys('처음부터 다시 물어볼게요');
    ask(g, 1).catch(function () { });
  }

  T.onPlay = function () {
    started = true;
    if (!hookDone) hookStatic();
    var g = ++gen; A = {}; quick.hidden = true;
    T.wait(450).then(guard(g))
      .then(function () { return yo(g, '좋아요! 세 가지만 물어볼게요', null, 700); })
      .then(function () { return ask(g, 1); })
      .catch(function () { });
  };
  // 첫 화면에서 입력창을 눌러도 시작
  inp.addEventListener('click', function () { if (!started) { var c = document.querySelector('.gm-cta'); if (c) c.click(); } });

  hook();
})();
