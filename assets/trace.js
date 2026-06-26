/* trace.js - the step-by-step demo, presented as a stable "machine display":
   one step shown at a time in a fixed-size screen, advanced with Back / Step
   (or the arrow keys / Auto-play). You type a phrase; it runs the genuine DOCTOR
   script through assets/eliza.js and walks through clean -> scan -> rank ->
   decompose -> reassemble -> reply. No scrolling, no jumpy reveal. */
(function () {
  function init() {
    var app = document.getElementById('trace-app');
    if (!app || !window.ElizaHay) return;
    var COLORS = ['var(--lamp-red)', 'var(--lamp-amber)', 'var(--lamp-green)', 'var(--lamp-blue)', '#c98bd9', '#6fd6cf'];
    function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

    var input = el('input', 'trace-input');
    input.type = 'text'; input.value = 'You are like my father in some ways.';
    input.setAttribute('aria-label', 'Phrase to trace');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('spellcheck', 'false');
    var runBtn = el('button', 'btn', 'Trace it');
    var resetBtn = el('button', 'btn ghost', '↻ Reset');

    // one editable combobox: type a sentence, or pick a suggestion from the list
    var EXAMPLES = ['Men are all alike.', 'You are not very aggressive but I think you don\'t want me to notice that.', 'I am unhappy.', 'My mother hates me.', 'Computers worry me.'];
    var dl = el('datalist'); dl.id = 'eg-list';
    dl.innerHTML = EXAMPLES.map(function (x) { return '<option value="' + escAttr(x) + '"></option>'; }).join('');
    input.setAttribute('list', 'eg-list');
    input.placeholder = 'type a sentence, or pick an example…';
    input.addEventListener('input', function () { if (EXAMPLES.indexOf(input.value) !== -1) run(); });

    var playBtn = el('button', 'btn play', 'Play the 1966 conversation');

    var demo = el('div', 'demo');
    var ctx = el('div', 'demo-ctx'); demo.appendChild(ctx);
    // the typing input lives inside the demo: type here and Trace it
    var kwEl = el('span', 'ctx-kw');
    ctx.appendChild(input);
    ctx.appendChild(dl);
    ctx.appendChild(runBtn);
    ctx.appendChild(resetBtn);
    ctx.appendChild(kwEl);
    var memEl = el('div', 'demo-mem'); demo.appendChild(memEl);
    var stageEl = el('div', 'demo-stage'); demo.appendChild(stageEl);
    var prog = el('div', 'demo-prog'); demo.appendChild(prog);
    var nav = el('div', 'demo-nav'); demo.appendChild(nav);
    app.appendChild(demo);

    var playRow = el('div', 'play-row');
    playRow.appendChild(el('span', 'play-lab', 'Or watch the original:'));
    playRow.appendChild(playBtn);
    app.appendChild(playRow);

    var stages = [], cur = 0, autoTimer = null, T = null;
    var session = null, playing = false, paused = false, playIdx = 0, transcript = [];
    // ELIZA's reply is withheld from the conversation panel until the walk-through
    // reaches the final "reply" stage, then teletyped in. pendingEliza holds it
    // meanwhile; typeToken cancels an in-flight teletype when a new turn starts.
    var pendingEliza = null, typeToken = 0, convoEl = null;
    // the stage is a fixed-size screen; each step is scaled to fit it so the box
    // never resizes and the whole panel stays inside the window. userZoom (driven
    // by the - / + buttons) lets the reader enlarge or shrink on top of that fit.
    var userZoom = 1, curCard = null;
    var recallSlotEl = null;   // the memory slot to flash when a recall step is shown
    var CACM = [
      'Men are all alike.',
      'They\'re always bugging us about something or other.',
      'Well, my boyfriend made me come here.',
      'He says I\'m depressed much of the time.',
      'It\'s true. I am unhappy.',
      'I need some help, that much seems certain.',
      'Perhaps I could learn to get along with my mother.',
      'My mother takes care of me.',
      'My father.',
      'You are like my father in some ways.',
      'You are not very aggressive but I think you don\'t want me to notice that.',
      'You don\'t argue with me.',
      'You are afraid of me.',
      'My father is afraid of everybody.',
      'Bullies.'
    ];

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
      // work out how the input divides at ELIZA's delimiters (comma, full stop, BUT)
      var DELIMS = { 'BUT': true, '.': true, ',': true };
      var clauses = [], cur = [];
      T.words.forEach(function (w) { if (DELIMS[w.raw]) { clauses.push({ words: cur, delim: w.raw }); cur = []; } else cur.push(w); });
      if (cur.length) clauses.push({ words: cur, delim: null });
      var keptIdx = -1;
      for (var ci = 0; ci < clauses.length; ci++) { if (clauses[ci].words.length && clauses[ci].words.some(function (w) { return w.keyword; })) { keptIdx = ci; break; } }
      var splitHappened = clauses.filter(function (c) { return c.words.length; }).length >= 2;
      var scanWords = (splitHappened && keptIdx >= 0) ? clauses[keptIdx].words : T.words;

      S.push({ title: 'The input', node: function () {
        return el('div', 'paper', '<span class="who you">YOU</span>' + esc(T.input));
      }});
      S.push({ title: 'Clean and split into words', node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'Upper-cased and split into words. ELIZA also breaks the input into clauses at three delimiters: the comma, the full stop, and the word &ldquo;BUT&rdquo; (the last undocumented by Weizenbaum).'));
        box.appendChild(row('WORDS', T.words.map(function (w) { return chip(w.raw, DELIMS[w.raw] ? 'delim' : '', null, DELIMS[w.raw] ? 'var(--lamp-amber)' : null); })));
        return box;
      }});
      if (splitHappened) S.push({ title: 'Break at delimiters', node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'At a delimiter, ELIZA keeps the first clause that contains a keyword and discards the rest. The &ldquo;BUT&rdquo; delimiter does the work here.'));
        clauses.forEach(function (c) {
          if (!c.words.length) return;
          var kept = (clauses.indexOf(c) === keptIdx);
          var nodes = c.words.map(function (w) { return chip(w.raw, w.keyword ? 'key' : 'plain', null, w.keyword ? 'var(--lamp-red)' : null); });
          if (c.delim) nodes.push(chip(c.delim, 'delim', null, 'var(--lamp-amber)'));
          var r = row(kept ? 'KEEP' : 'DROP', nodes);
          if (!kept) r.style.opacity = '0.4';
          box.appendChild(r);
        });
        return box;
      }});
      S.push({ title: 'Substitute and scan for keywords', node: function () {
        var box = el('div');
        box.appendChild(el('p', 'snote', 'Some words are swapped so the reply faces back at you (MY&rarr;YOUR, ME&rarr;YOU, I&rarr;YOU). Each word is looked up; the ones that are keywords are lit, with their rank.'));
        box.appendChild(row('SCAN', scanWords.map(function (w) {
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
          var box = el('div', 'defer');
          box.appendChild(el('p', 'snote', '<b>' + esc(st.from) + '</b> carries no replies of its own. Its rule is a pointer into an <em>equivalence class</em>: a shared pool of replies kept under the keyword <b>' + esc(st.to) + '</b>. ELIZA substitutes <b>' + esc(st.to) + '</b> and uses its rules instead. This is how synonyms (LIKE, SAME, ALIKE) share one set of answers without repeating them. (<b>' + esc(st.to) + '</b> is not an English word, just an internal label Weizenbaum chose.)'));
          var ruleLine = '(' + esc(st.from) + (st.fromRank ? ' ' + st.fromRank : '') + ' (=' + esc(st.to) + '))';
          box.appendChild(el('p', 'defer-rule', 'rule: ' + ruleLine));
          if (st.targetResponses && st.targetResponses.length) {
            box.appendChild(el('p', 'snote', 'The replies now in play, pooled under <b>' + esc(st.to) + '</b> (one is chosen, then cycled):'));
            var ul = el('ul', 'defer-resp');
            st.targetResponses.forEach(function (rr) { ul.appendChild(el('li', null, esc(rr))); });
            box.appendChild(ul);
          }
          return box;
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
        else if (st.kind === 'memory-recall') S.push({ title: 'Recall a memory', recall: true, node: function () {
          return el('div', 'memnote', 'No keyword fired and the counter is on its fourth turn, so ELIZA reaches back for a stored memory: <b>' + esc(st.text) + '</b>.');
        }});
        else if (st.kind === 'none') S.push({ title: 'No keyword: a holding phrase', node: function () {
          return el('div', 'memnote', 'Nothing in the sentence was a keyword, so ELIZA falls back to a content-free prompt to keep you talking: <b>' + esc(st.output) + '</b>.');
        }});
      });
      S.push({ title: 'The reply', last: true, node: function () {
        var box = el('div');
        box.appendChild(el('div', 'paper out', '<span class="who eliza">ELIZA</span>' + esc(T.output)));
        box.appendChild(el('p', 'debunk', 'ELIZA didn’t need to understand anything. It picked the highest-ranked keyword, split your sentence on a fixed pattern, and used a preprogrammed template to create the reply.'));
        return box;
      }});
      return S;
    }

    function setCtx() {
      if (document.activeElement !== input) input.value = T.input;
      kwEl.innerHTML = (T.keystack && T.keystack.length)
        ? '<span class="lab">Keyword</span> <span class="val key">' + esc(T.keystack[0].word) + '</span>' : '';
      // full-width memory queue bar under the input line, numbered as ELIZA stores them
      memEl.innerHTML = '';
      // left: the memory queue (four slots by default; grows if the queue does)
      var left = el('div', 'mem-left');
      left.appendChild(el('span', 'mlab', 'Memory'));
      // on a turn that recalls a memory, ELIZA pops the oldest item; show the
      // queue as it was *before* the pop so the recalled slot is still visible
      // (and can be flashed when the "Recall a memory" step is reached)
      var recalls = T.steps.some(function (s) { return s.kind === 'memory-recall'; });
      var mem = (recalls && T.memoryBefore && T.memoryBefore.length) ? T.memoryBefore : (T.memory || []);
      var slots = Math.max(5, mem.length);
      var ol = el('ol');
      recallSlotEl = null;
      for (var mi = 0; mi < slots; mi++) {
        var m = mem[mi];
        var li = el('li', m ? null : 'slot-empty');
        li.innerHTML = '<span class="mn">' + (mi + 1) + '</span><span' + (m ? ' title="' + escAttr(m) + '"' : '') + '>' + (m ? esc(m) : 'empty') + '</span>';
        ol.appendChild(li);
        if (recalls && mi === 0) recallSlotEl = li;   // the oldest slot is the one recalled
      }
      left.appendChild(ol);
      // right: the conversation so far, in green, scrolling up
      var right = el('div', 'mem-right');
      var convo = el('div', 'mem-convo');
      transcript.forEach(function (t) { convo.appendChild(el('div', 'cline ' + t.who, esc(t.text))); });
      right.appendChild(convo);
      convoEl = convo;
      memEl.appendChild(left); memEl.appendChild(right);
      convo.scrollTop = convo.scrollHeight;
    }

    function show(i) {
      cur = Math.max(0, Math.min(stages.length - 1, i));
      var st = stages[cur];
      stageEl.innerHTML = '';
      var card = el('div', 'stage-card' + (st.last ? ' final' : ''));
      card.appendChild(el('div', 'stage-head', '<span class="stage-n">' + (cur + 1) + '</span>' + esc(st.title)));
      var body = el('div', 'stage-body'); body.appendChild(st.node()); card.appendChild(body);
      stageEl.appendChild(card);
      curCard = card; fitCard();
      requestAnimationFrame(function () { card.classList.add('in'); });
      renderProg(); renderNav();
      if (st.recall) flashRecall();   // light up the memory slot being pulled back
      if (st.last) revealEliza();   // reached "(N) The reply": let ELIZA answer
    }
    // pulse the recalled memory slot so the reader links the reply to the queue
    function flashRecall() {
      if (!recallSlotEl) return;
      recallSlotEl.classList.remove('flash');
      void recallSlotEl.offsetWidth;   // restart the animation if already applied
      recallSlotEl.classList.add('flash');
    }
    // scale the current step so it fits the fixed-height stage (never enlarging
    // past 1 on its own), times the reader's chosen zoom
    function fitCard() {
      if (!curCard) return;
      // measure at natural size, then scale via the CSS `zoom` property so the
      // layout footprint shrinks too (a CSS transform would not, leaving the box
      // scrollable with empty space)
      curCard.style.zoom = 1;
      var cs = getComputedStyle(stageEl);
      var avail = stageEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var natural = curCard.scrollHeight;
      var s = Math.min(1, avail / natural) * userZoom;
      if (!isFinite(s) || s <= 0) s = 1;
      curCard.style.zoom = s;
    }
    function zoomBy(delta) { userZoom = Math.min(1.8, Math.max(0.6, Math.round((userZoom + delta) * 10) / 10)); fitCard(); }
    window.addEventListener('resize', fitCard);
    // teletype ELIZA's withheld reply into the conversation panel once revealed
    function revealEliza() {
      if (pendingEliza == null || !convoEl) return;
      var text = pendingEliza; pendingEliza = null;
      transcript.push({ who: 'eliza', text: text });   // commit to history
      var line = el('div', 'cline eliza typing');
      convoEl.appendChild(line);
      typeInto(line, text);
    }
    function typeInto(node, text) {
      var token = ++typeToken, i = 0;
      (function tick() {
        if (token !== typeToken) return;   // a new turn cancelled this teletype
        node.textContent = text.slice(0, i);
        if (convoEl) convoEl.scrollTop = convoEl.scrollHeight;
        if (i <= text.length) { i++; setTimeout(tick, 32); }
        else node.classList.remove('typing');
      })();
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
      var zoom = el('div', 'demo-zoom');
      zoom.appendChild(el('span', 'zlab', 'Zoom'));
      var zbtns = el('div', 'zbtns');
      var zout = el('button', 'zbtn', '&minus;'); zout.title = 'Smaller'; zout.setAttribute('aria-label', 'Shrink the panel'); zout.addEventListener('click', function () { zoomBy(-0.1); });
      var zin = el('button', 'zbtn', '+'); zin.title = 'Larger'; zin.setAttribute('aria-label', 'Enlarge the panel'); zin.addEventListener('click', function () { zoomBy(0.1); });
      zbtns.appendChild(zout); zbtns.appendChild(zin);
      zoom.appendChild(zbtns);
      nav.appendChild(zoom);
    }
    function toggleAuto() {
      if (autoTimer) { stop(); return; }
      if (cur >= stages.length - 1) show(0);
      autoTimer = setInterval(function () { if (cur >= stages.length - 1) stop(); else show(cur + 1); }, 2000);
      renderNav();
    }
    function updatePlayBtn() { playBtn.innerHTML = playing ? 'Stop the 1966 conversation' : (paused ? 'Continue the 1966 conversation' : 'Play the 1966 conversation'); }
    function stop() { playing = false; paused = false; if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } updatePlayBtn(); renderNav(); }

    function run() {
      stop();
      var phrase = input.value.trim(); if (!phrase) return;
      window.ElizaHay.trace(phrase).then(function (res) {
        T = res;
        typeToken++; pendingEliza = T.output;          // withheld until the reply stage
        transcript = [{ who: 'you', text: T.input }];
        stages = build(T);
        setCtx();
        show(0);
      });
    }

    function reset() {
      stop();
      input.value = 'You are like my father in some ways.';
      run();
    }

    // replay the whole 1966 CACM conversation on one persistent engine, so memory
    // accumulates and is recalled, auto-stepping through each line until the end
    function startAutoStep() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        if (!playing) { clearInterval(autoTimer); autoTimer = null; return; }
        if (cur >= stages.length - 1) {
          clearInterval(autoTimer); autoTimer = null;
          setTimeout(playLine, 1600);   // hold on the reply, then the next line
        } else show(cur + 1);
      }, 1500);
    }
    function playCacm() {
      stop();
      session = window.ElizaHay.make();
      playing = true; paused = false; playIdx = 0; transcript = []; pendingEliza = null;
      updatePlayBtn();
      playLine();
    }
    function playLine() {
      if (!playing) return;
      if (playIdx >= CACM.length) { playing = false; paused = false; updatePlayBtn(); return; }
      var line = CACM[playIdx++];
      input.value = line;
      session.trace(line).then(function (res) {
        if (!playing) return;
        T = res; typeToken++; pendingEliza = res.output; transcript.push({ who: 'you', text: line });
        stages = build(T); setCtx(); show(0);
        startAutoStep();
        renderNav();
      });
    }
    function pausePlay() { playing = false; paused = true; if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } updatePlayBtn(); renderNav(); }
    function resumePlay() {
      if (!session || playIdx >= CACM.length) { playCacm(); return; }
      playing = true; paused = false; updatePlayBtn();
      if (cur < stages.length - 1) startAutoStep();   // finish the current line
      else setTimeout(playLine, 200);                 // current line done, go to the next
    }
    playBtn.addEventListener('click', function () { if (playing) pausePlay(); else if (paused) resumePlay(); else playCacm(); });
    resetBtn.addEventListener('click', reset);

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
