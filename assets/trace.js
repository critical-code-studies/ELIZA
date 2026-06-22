/* trace.js - the step-by-step demo, presented as a stable "machine display":
   one step shown at a time in a fixed-size screen, advanced with Back / Step
   (or the arrow keys / Auto-play). You type a phrase; it runs the genuine DOCTOR
   script through assets/eliza.js and walks through clean -> scan -> rank ->
   decompose -> reassemble -> reply. No scrolling, no jumpy reveal. */
(function () {
  function init() {
    var app = document.getElementById('trace-app');
    if (!app || !window.ELIZA) return;
    var engine = window.ELIZA.make();
    var COLORS = ['var(--lamp-red)', 'var(--lamp-amber)', 'var(--lamp-green)', 'var(--lamp-blue)', '#c98bd9', '#6fd6cf'];
    function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

    var bar = el('div', 'trace-bar');
    var input = el('input', 'trace-input');
    input.type = 'text'; input.value = 'You are like my father in some ways.';
    input.setAttribute('aria-label', 'Phrase to trace');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('spellcheck', 'false');
    var runBtn = el('button', 'btn', 'Trace it');
    bar.appendChild(input); bar.appendChild(runBtn); app.appendChild(bar);

    var egs = el('div', 'trace-egs');
    egs.appendChild(el('span', 'trace-egs-lab', 'try:'));
    ['Men are all alike.', 'I am unhappy.', 'My mother hates me.', 'You are afraid of me.', 'Computers worry me.'].forEach(function (x) {
      var b = el('button', 'eg', esc(x)); b.addEventListener('click', function () { input.value = x; run(); }); egs.appendChild(b);
    });
    app.appendChild(egs);

    var demo = el('div', 'demo');
    var ctx = el('div', 'demo-ctx'); demo.appendChild(ctx);
    var stageEl = el('div', 'demo-stage'); demo.appendChild(stageEl);
    var prog = el('div', 'demo-prog'); demo.appendChild(prog);
    var nav = el('div', 'demo-nav'); demo.appendChild(nav);
    app.appendChild(demo);

    var stages = [], cur = 0, autoTimer = null, T = null;

    function chip(text, cls, badge, color) {
      var c = el('span', 'chip' + (cls ? ' ' + cls : ''), esc(text));
      if (color) { c.style.borderColor = color; c.style.color = color; }
      if (badge != null) { var b = el('span', 'chip-badge', esc(badge)); if (color) b.style.background = color; c.appendChild(b); }
      return c;
    }
    function row(label, nodes) {
      var r = el('div', 'srow');
      r.appendChild(el('span', 'srow-lab', esc(label)));
      var box = el('div', 'srow-box'); nodes.forEach(function (n) { box.appendChild(n); }); r.appendChild(box);
      return r;
    }
    function patternNode(pattern) {
      return pattern.map(function (p) {
        return el('span', 'pat' + (p.any ? ' any' : '') + (p.set || p.tag ? ' set' : ''), esc(p.any ? p.t + ' (any words)' : p.t));
      });
    }
    function compNodes(components) {
      return components.map(function (cmp, i) {
        var col = COLORS[i % COLORS.length];
        var node = el('span', 'comp', '<span class="comp-n">' + (i + 1) + '</span>' + (cmp === '' ? '<em class="comp-empty">(empty)</em>' : esc(cmp)));
        node.style.borderColor = col; node.querySelector('.comp-n').style.background = col;
        return node;
      });
    }

    function build(T) {
      var S = [];
      S.push({ title: 'The input', node: function () {
        return el('div', 'paper', '<span class="who you">YOU</span>' + esc(T.input));
      }});
      S.push({ title: 'Clean and split into words', node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'Upper-cased, punctuation dropped, split on spaces. ELIZA only ever sees a list of words.'));
        box.appendChild(row('WORDS', T.words.map(function (w) { return chip(w.raw); })));
        return box;
      }});
      S.push({ title: 'Substitute and scan for keywords', node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'Some words are swapped so the reply faces back at you (MY&rarr;YOUR, ME&rarr;YOU, I&rarr;YOU). Each word is looked up; the ones that are keywords are lit, with their rank.'));
        box.appendChild(row('SCAN', T.words.map(function (w) {
          var label = w.sub ? (w.raw + ' → ' + w.sub) : w.raw;
          return chip(label, w.keyword ? 'key' : 'plain', w.keyword ? ('r' + w.rank) : null, w.keyword ? 'var(--lamp-red)' : null);
        })));
        return box;
      }});
      if (T.keystack && T.keystack.length) S.push({ title: 'Rank the keywords', node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'The keywords are sorted by rank. The highest wins and decides the reply. This is the whole of ELIZA&rsquo;s &ldquo;attention&rdquo;.'));
        box.appendChild(row('STACK', T.keystack.map(function (k, i) {
          return chip(k.word, i === 0 ? 'win' : '', 'rank ' + k.rank, i === 0 ? 'var(--lamp-red)' : 'var(--ink-dim)');
        })));
        if (T.keystack[0]) box.appendChild(el('p', 'swin', 'Winner: <b>' + esc(T.keystack[0].word) + '</b>'));
        return box;
      }});
      T.steps.forEach(function (st) {
        if (st.kind === 'decompose') S.push({ title: 'Decompose with ' + st.keyword, node: function () {
          var box = el('div');
          box.appendChild(el('p', 'snote', 'The keyword <b>' + esc(st.keyword) + '</b> has a pattern. The sentence is matched against it and carved into numbered parts. <code>0</code> means &ldquo;any run of words&rdquo;.'));
          box.appendChild(row('PATTERN', patternNode(st.pattern)));
          box.appendChild(row('PARTS', compNodes(st.components)));
          return box;
        }});
        else if (st.kind === 'goto') S.push({ title: st.from + ' defers to ' + st.to, node: function () {
          return el('div', 'defer', '<b>' + esc(st.from) + '</b> has no reply of its own. It hands over to <b>' + esc(st.to) + '</b>. <span class="arrow">&rarr;</span>');
        }});
        else if (st.kind === 'pre') S.push({ title: st.from + ' rebuilds, then defers to ' + st.to, node: function () {
          var box = el('div');
          box.appendChild(el('p', 'snote', '<b>' + esc(st.from) + '</b> first rebuilds the sentence, then passes it to <b>' + esc(st.to) + '</b>.'));
          box.appendChild(row('REBUILT', st.rebuilt.map(function (w) { return chip(w); })));
          return box;
        }});
        else if (st.kind === 'reassemble') S.push({ title: 'Reassemble into a reply', node: function () {
          var box = el('div');
          box.appendChild(el('p', 'snote', 'A reply template is chosen. The numbers in it are slots: each is replaced by the matching numbered part. Plain words print as-is.'));
          var tnodes = st.template.map(function (tok) {
            if (/^\d+$/.test(tok)) {
              var idx = parseInt(tok, 10) - 1, col = COLORS[idx % COLORS.length];
              var n = el('span', 'tslot', esc(tok) + ' = ' + esc(st.components[idx] || '')); n.style.borderColor = col; n.style.color = col; return n;
            }
            return el('span', 'tword', esc(tok));
          });
          box.appendChild(row('TEMPLATE', tnodes));
          box.appendChild(el('div', 'paper out', '<span class="who eliza">ELIZA</span>' + esc(st.output)));
          return box;
        }});
        else if (st.kind === 'memory-store') S.push({ title: 'Store a memory', node: function () {
          return el('div', 'memnote', 'You mentioned something that is &ldquo;yours&rdquo;, so ELIZA quietly files a transformed copy away: <b>' + esc(st.text) + '</b>. It may resurface in a few turns (the &ldquo;certain counting mechanism&rdquo;).');
        }});
        else if (st.kind === 'memory-recall') S.push({ title: 'Recall a memory', node: function () {
          return el('div', 'memnote', 'No keyword fired and the counter is on its fourth turn, so ELIZA reaches back for a stored memory: <b>' + esc(st.text) + '</b>.');
        }});
        else if (st.kind === 'none') S.push({ title: 'No keyword: a holding phrase', node: function () {
          return el('div', 'memnote', 'Nothing in the sentence was a keyword, so ELIZA falls back to a content-free prompt to keep you talking: <b>' + esc(st.output) + '</b>.');
        }});
      });
      S.push({ title: 'The reply', last: true, node: function () {
        var box = el('div');
        box.appendChild(el('div', 'paper out', '<span class="who eliza">ELIZA</span>' + esc(T.output)));
        box.appendChild(el('p', 'debunk', 'ELIZA understood nothing. It picked the highest-ranked keyword, split your sentence on a fixed pattern, and poured your own words into a canned template. That gap, between what it does and what we feel, is the ELIZA effect.'));
        return box;
      }});
      return S;
    }

    function setCtx() {
      ctx.innerHTML = '';
      ctx.appendChild(el('span', 'lab', 'Input'));
      ctx.appendChild(el('span', 'val', esc(T.input)));
      if (T.keystack && T.keystack.length) {
        ctx.appendChild(el('span', 'lab', 'Keyword'));
        ctx.appendChild(el('span', 'val key', esc(T.keystack[0].word)));
      }
    }

    function show(i) {
      cur = Math.max(0, Math.min(stages.length - 1, i));
      var st = stages[cur];
      stageEl.innerHTML = '';
      var card = el('div', 'stage-card' + (st.last ? ' final' : ''));
      card.appendChild(el('div', 'stage-head', '<span class="stage-n">' + (cur + 1) + '</span>' + esc(st.title)));
      var body = el('div', 'stage-body'); body.appendChild(st.node()); card.appendChild(body);
      stageEl.appendChild(card);
      requestAnimationFrame(function () { card.classList.add('in'); });
      renderProg(); renderNav();
    }
    function renderProg() {
      prog.innerHTML = '';
      stages.forEach(function (_, i) { var c = el('i'); if (i < cur) c.className = 'done'; else if (i === cur) c.className = 'on'; prog.appendChild(c); });
    }
    function renderNav() {
      nav.innerHTML = '';
      var prev = el('button', 'btn ghost', '◀ Back'); prev.disabled = cur === 0; prev.addEventListener('click', function () { stop(); show(cur - 1); });
      var atEnd = cur >= stages.length - 1;
      var next = el('button', 'btn', atEnd ? 'End' : 'Step ▶'); next.disabled = atEnd; next.addEventListener('click', function () { stop(); show(cur + 1); });
      var auto = el('button', 'btn ghost', autoTimer ? 'Pause' : 'Auto ▶'); auto.addEventListener('click', toggleAuto);
      var replay = el('button', 'btn ghost', 'Replay'); replay.addEventListener('click', function () { stop(); show(0); });
      nav.appendChild(prev); nav.appendChild(next); nav.appendChild(auto);
      nav.appendChild(el('span', 'spacer'));
      nav.appendChild(replay);
      nav.appendChild(el('span', 'count', 'Step ' + (cur + 1) + ' / ' + stages.length));
    }
    function toggleAuto() {
      if (autoTimer) { stop(); return; }
      if (cur >= stages.length - 1) show(0);
      autoTimer = setInterval(function () { if (cur >= stages.length - 1) stop(); else show(cur + 1); }, 2000);
      renderNav();
    }
    function stop() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; renderNav(); } }

    function run() {
      stop();
      var phrase = input.value.trim(); if (!phrase) return;
      T = engine.trace(phrase);
      stages = build(T);
      setCtx();
      show(0);
    }

    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { stop(); show(cur + 1); }
      else if (e.key === 'ArrowLeft') { stop(); show(cur - 1); }
    });
    runBtn.addEventListener('click', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    run();
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
