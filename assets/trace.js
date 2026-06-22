/* trace.js - the step-by-step demo. You type a phrase; it runs the genuine
   DOCTOR script through assets/eliza.js and reveals, one stage at a time, exactly
   what ELIZA does: clean the input, scan for keywords and rank them, decompose
   the sentence into numbered parts, then reassemble those parts into a reply.
   The point is pedagogical: you watch a mechanical word-shuffle and the "ELIZA
   effect" evaporates. Mounts into #trace-app. */
(function () {
  function init() {
    var app = document.getElementById('trace-app');
    if (!app || !window.ELIZA) return;
    var engine = window.ELIZA.make();
    var COLORS = ['var(--lamp-red)', 'var(--lamp-amber)', 'var(--lamp-green)', 'var(--lamp-blue)', '#c98bd9', '#6fd6cf'];
    function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

    // ---- controls ----
    var bar = el('div', 'trace-bar');
    var input = el('input', 'trace-input');
    input.type = 'text'; input.value = 'You are like my father in some ways.';
    input.setAttribute('aria-label', 'Phrase to trace');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('spellcheck', 'false');
    var runBtn = el('button', 'btn', 'Trace it');
    bar.appendChild(input); bar.appendChild(runBtn);
    app.appendChild(bar);

    var egs = el('div', 'trace-egs');
    egs.appendChild(el('span', 'trace-egs-lab', 'try:'));
    ['Men are all alike.', 'I am unhappy.', 'My mother hates me.', 'You are afraid of me.', 'Computers worry me.'].forEach(function (x) {
      var b = el('button', 'eg', esc(x)); b.addEventListener('click', function () { input.value = x; run(); }); egs.appendChild(b);
    });
    app.appendChild(egs);

    var viewport = el('div', 'stage-viewport');
    var stageWrap = el('div', 'stages'); viewport.appendChild(stageWrap); app.appendChild(viewport);
    var nav = el('div', 'trace-nav'); app.appendChild(nav);

    var stages = [], shown = 0, autoTimer = null;

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
      return pattern.map(function (p, i) {
        var c = el('span', 'pat' + (p.any ? ' any' : '') + (p.set || p.tag ? ' set' : ''), esc(p.any ? p.t + ' (any words)' : p.t));
        return c;
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

    // ---- build the stage list from a trace ----
    function build(T) {
      var S = [];
      // 1. input
      S.push({ title: 'The input', lamp: false, node: function () {
        return el('div', 'paper', '<span class="who you">YOU</span>' + esc(T.input));
      }});
      // 2. clean / tokenise
      S.push({ title: 'Clean and split into words', node: function () {
        var note = el('p', 'snote', 'Upper-cased, punctuation dropped, split on spaces. ELIZA only ever sees a list of words.');
        var box = el('div'); box.appendChild(note);
        box.appendChild(row('WORDS', T.words.map(function (w) { return chip(w.raw); })));
        return box;
      }});
      // 3. substitute + scan
      S.push({ title: 'Substitute and scan for keywords', lamp: true, node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'Some words are swapped so the reply faces back at you (MY&rarr;YOUR, ME&rarr;YOU, I&rarr;YOU). Each word is looked up; the ones that are keywords are lit, with their rank.'));
        box.appendChild(row('SCAN', T.words.map(function (w) {
          var label = w.sub ? (w.raw + ' → ' + w.sub) : w.raw;
          return chip(label, w.keyword ? 'key' : 'plain', w.keyword ? ('r' + w.rank) : null, w.keyword ? 'var(--lamp-red)' : null);
        })));
        return box;
      }});
      // 4. keystack
      if (T.keystack && T.keystack.length) S.push({ title: 'Rank the keywords', node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'The keywords are sorted by rank. The highest wins and decides the reply. This is the whole of ELIZA&rsquo;s &ldquo;attention&rdquo;.'));
        box.appendChild(row('STACK', T.keystack.map(function (k, i) {
          return chip(k.word, i === 0 ? 'win' : '', 'rank ' + k.rank, i === 0 ? 'var(--lamp-red)' : 'var(--ink-dim)');
        })));
        if (T.keystack[0]) box.appendChild(el('p', 'swin', 'Winner: <b>' + esc(T.keystack[0].word) + '</b>'));
        return box;
      }});
      // 5. each processing step
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
        else if (st.kind === 'reassemble') S.push({ title: 'Reassemble into a reply', lamp: true, node: function () {
          var box = el('div');
          box.appendChild(el('p', 'snote', 'A reply template is chosen. The numbers in it are slots: each is replaced by the matching numbered part from above. Plain words are printed as-is.'));
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
      // final
      S.push({ title: 'The reply', last: true, node: function () {
        var box = el('div');
        box.appendChild(el('div', 'paper out', '<span class="who eliza">ELIZA</span>' + esc(T.output)));
        box.appendChild(el('p', 'debunk', 'ELIZA understood nothing. It picked the highest-ranked keyword, split your sentence on a fixed pattern, and poured your own words into a canned template. No meaning, no memory of you, no model of the world. That gap, between what it does and what we feel, is the ELIZA effect.'));
        return box;
      }});
      return S;
    }

    function render() {
      stageWrap.innerHTML = '';
      stages.forEach(function (st, i) {
        var card = el('div', 'stage' + (i < shown ? ' on' : '') + (st.last ? ' final' : ''));
        var h = el('div', 'stage-head', '<span class="stage-n">' + (i + 1) + '</span>' + esc(st.title));
        card.appendChild(h);
        var body = el('div', 'stage-body'); body.appendChild(st.node()); card.appendChild(body);
        stageWrap.appendChild(card);
      });
      // move the current stage up into the reading window; older/newer stages
      // scroll out past the faded top/bottom edges of the box
      var on = stageWrap.querySelectorAll('.stage.on');
      if (on.length) {
        var cur = on[on.length - 1];
        var top = cur.offsetTop - 80;          // headroom below the top fade
        viewport.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
      }
      renderNav();
    }

    function renderNav() {
      nav.innerHTML = '';
      var done = shown >= stages.length;
      var step = el('button', 'btn' + (done ? ' ghost' : ''), done ? 'Done' : 'Next step ▸');
      step.disabled = done; step.addEventListener('click', next);
      var auto = el('button', 'btn ghost', autoTimer ? 'Pause' : 'Auto-play ▸'); auto.addEventListener('click', toggleAuto);
      var reset = el('button', 'btn ghost', 'Replay'); reset.addEventListener('click', function () { stopAuto(); shown = 1; render(); });
      nav.appendChild(step); nav.appendChild(auto); nav.appendChild(reset);
      nav.appendChild(el('span', 'trace-count', shown + ' / ' + stages.length));
    }

    function next() { if (shown < stages.length) { shown++; render(); } else stopAuto(); }
    function toggleAuto() { if (autoTimer) stopAuto(); else { autoTimer = setInterval(function () { if (shown >= stages.length) stopAuto(); else next(); }, 1500); renderNav(); } }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; renderNav(); } }

    function run() {
      stopAuto();
      var phrase = input.value.trim(); if (!phrase) return;
      var T = engine.trace(phrase);
      stages = build(T); shown = 1; render();
    }

    runBtn.addEventListener('click', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    run(); // start with the default phrase, first stage shown
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
