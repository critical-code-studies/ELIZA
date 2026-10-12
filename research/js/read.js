/*
 * read.js - Read: bench-kit's Read view (kit/read.js), with what is ELIZA's: the highlighting of
 * MAD and FAP cards and of the scripts (kit/lang-mad.js divides them), the pop-up on a name
 * (where it is defined and used; a name defined in a layer below, peeked at, with a jump to it;
 * what the project's SLIP page says of the calls it names), the Key, the files' labels, and the
 * layers' ◀ ▶ and breadcrumb (js/layers.js).
 */
(function (root) {
  'use strict';
  var SW = root.SW, M = root.SWLang.mad, esc = SW.esc;
  var build = null;

  // what the project's SLIP page says of the calls it names (findingeliza.org/slip.html)
  var GLOSS = {
    SEQRDR: 'Makes a sequence reader for a list (with SEQLR, how ELIZA scans a list: what a modern language would call an iterator).',
    SEQLR: 'Reads the next cell of a list, left to right, through a sequence reader made by SEQRDR.',
    POPTOP: 'Removes and returns the cell at the top of a list.', POPBOT: 'Removes and returns the cell at the bottom of a list.',
    NEWTOP: 'Adds a new cell at the top of a list.', NEWBOT: 'Adds a new cell at the bottom of a list.',
    LSSCPY: 'Copies a list.', SUBST: 'Substitutes a cell.', IRALST: 'Returns a list’s cells to free space.',
    HASH: 'Hashes a word into a table index. In the SLIP listing but not part of SLIP as published: it does ELIZA’s work.',
    YMATCH: 'Matches a decomposition pattern. In the SLIP listing but not part of SLIP as published: it does ELIZA’s work.',
    ASSMBL: 'Assembles a reply from a template. In the SLIP listing but not part of SLIP as published: it does ELIZA’s work.',
    CHANGE: 'ELIZA’s teach mode: lets a user revise and extend a script while the program is running.'
  };
  var KIND = { deck: 'A routine (compiled on its own)', 'function': 'A function', label: 'A statement label', slip: 'A SLIP function',
               external: 'A function not defined in this text', variable: 'A name', keyword: 'A keyword of the script', 'class': 'A class of words (DLIST)' };
  var FORMS = ((SW.BENCH.layers || {}).forms || {}).script || {};

  // a name as a link to its pop-up: data-s is its key (a label's is NAME·DECK)
  function symSpan(cls, key, text) {
    var s = build && build.sym[key];
    return s && (s.defs.length || s.calls || s.kind === 'keyword' || s.kind === 'class') ?
      '<span class="' + (cls ? cls + ' ' : '') + 'sym" data-s="' + esc(key) + '">' + esc(text) + '</span>' : (cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text));
  }
  // a name; one called here and defined in a layer below opens, in its pop-up, a jump there
  function nameHTML(x, raw, call) {
    var key = SW.symKey(build, x, raw), s = build && build.sym[key];
    var own = s && (s.kind === 'label' || s.kind === 'deck' || s.kind === 'function');
    return symSpan(own ? 'lab' : call || (s && s.kind === 'external') ? 'mac' : '', key, x);
  }
  function madHTML(code, raw) {
    return M.tokens(code).map(function (t) {
      var k = t[0], x = t[1];
      if (k === 'kw') return '<span class="op">' + esc(x) + '</span>';
      if (k === 'rel') return '<span class="ps">' + esc(x) + '</span>';
      if (k === 'str') return '<span class="var">' + esc(x) + '</span>';
      if (k === 'num') return '<span class="num">' + esc(x) + '</span>';
      if (k === 'call') return nameHTML(x, raw, true);
      if (k === 'name') return nameHTML(x, raw, false);
      return esc(x);
    }).join('');
  }
  function fapHTML(code, raw) {
    return M.fapTokens(code).map(function (t) {
      if (t[0] === 'op') return '<span class="op">' + esc(t[1]) + '</span>';
      if (t[0] === 'num') return '<span class="num">' + esc(t[1]) + '</span>';
      if (t[0] === 'name') return nameHTML(t[1], raw, false);
      return esc(t[1]);
    }).join('');
  }
  // a script's words; its forms (MEMORY, NONE, NEWKEY…) open what ELIZA does with them
  function scriptHTML(code, top) {
    return M.scriptTokens(code).map(function (t) {
      var k = t[0], x = t[1];
      if (top && k === 'word' && x === top) { top = null; return symSpan('lab', x, x); }
      if (k === 'num') return '<span class="num">' + esc(x) + '</span>';
      if (k === 'op') return FORMS[x] ? '<span class="op sym form" data-s="form:' + esc(x) + '">' + esc(x) + '</span>' : '<span class="op">' + esc(x) + '</span>';
      if (k === 'key') return '<span class="op sym form" data-s="form:=">=</span>' + symSpan('lab', x.slice(1), x.slice(1));
      if (k === 'tag') return symSpan('mac', x, x);
      return esc(x);
    }).join('');
  }

  function hl(raw, b) {
    build = b || build;
    var s = String(raw || ''), info = SW.lineInfo(s) || { lang: 'mad' };
    if (info.lang === 'text') return /^\s*;/.test(s) ? '<span class="cm">' + esc(s) + '</span>' : esc(s);   // an output, as text
    if (info.lang === 'script') {
      var p = M.parseScript(s), ci = s.indexOf(';'), code = ci < 0 ? s : s.slice(0, ci);
      var lead = /^\s*/.exec(code)[0], w = /^\(\s*([^\s()]+)/.exec(s);
      return esc(lead) + scriptHTML(code.slice(lead.length), p.top && w ? w[1] : null) + (ci < 0 ? '' : '<span class="cm">' + esc(s.slice(ci)) + '</span>');
    }
    var q = info.lang === 'fap' ? M.parseFap(s) : M.parseMad(s);
    if (q.kind === 'blank') return esc(s);
    if (q.kind === 'deck') {
      var dm = /^(\s*)(\S+)(\s+)(MAD|FAP)(\s*)(\S*)(\s*)$/.exec(s) || ['', '', q.deck, ' ', q.deckLang, '', '', ''];
      return esc(dm[1]) + symSpan('lab', q.deck, dm[2]) + esc(dm[3]) + '<span class="op">' + esc(dm[4]) + '</span>' + esc(dm[5]) + (dm[6] ? '<span class="cm">' + esc(dm[6]) + '</span>' : '') + esc(dm[7]);
    }
    var body = s.length > 72 ? s.slice(0, 72) : s, seq = s.length > 72 ? s.slice(72) : '';
    var seqHTML = seq ? '<span class="cm">' + esc(seq) + '</span>' : '';
    function labHTML(lab) { var nm = lab.replace(/\(.*$/, ''), key = build && build.sym[nm + '·' + info.deck] ? nm + '·' + info.deck : nm; return symSpan('lab', key, lab); }
    if (info.lang === 'fap') {
      if (q.kind === 'comment') return '<span class="cm">' + esc(body) + '</span>' + seqHTML;
      var m = /^(\S*)(\s+)(\S+)(\s*)(\S*)(.*)$/.exec(body);
      if (!m) return esc(body) + seqHTML;
      return (m[1] ? labHTML(m[1]) : '') + esc(m[2]) + '<span class="op">' + esc(m[3]) + '</span>' + esc(m[4]) + fapHTML(m[5], s) +
        (m[6] ? '<span class="cm">' + esc(m[6]) + '</span>' : '') + seqHTML;
    }
    // MAD: the label, a remark's R or a continuation's digit, the statement, the sequence number
    var lm = /^\S+/.exec(body), label = lm ? lm[0] : '', i = label.length;
    while (i < body.length && body.charAt(i) === ' ') i++;
    var head = (label ? labHTML(label) : '') + esc(body.slice(label.length, i));
    if (q.kind === 'comment') return head + '<span class="cm">' + esc(body.slice(i)) + '</span>' + seqHTML;
    var rest = body.slice(i), lead2 = '';
    if (q.cont) { lead2 = '<span class="num" title="A continuation card">' + esc(rest.charAt(0)) + '</span>'; rest = rest.slice(1); }
    var tail = /\s*$/.exec(rest)[0], core = rest.slice(0, rest.length - tail.length), sp = /^\s*/.exec(core)[0];
    return head + lead2 + esc(sp) + madHTML(core.slice(sp.length), s) + esc(tail) + seqHTML;
  }

  // a definition in a layer below: where it is, its first lines, and a jump to it
  // a pop-up opened before the layers below have been read: fill it in when they have
  function refill(key, b) {
    SW.layers.preload(SW.layers.of(b.v.id)).then(function () {
      var pop = document.querySelector('.pop'), mark = pop && pop.querySelector('[data-pending-sym]');
      if (mark && mark.getAttribute('data-pending-sym') === key) pop.innerHTML = symbol(key, b);
    });
  }
  function below(name, b, key) {
    var L = SW.layers, lay = L && L.of(b.v.id), r = L && L.resolve(name, lay);
    if (!r && L && L.pending(lay)) { refill(key || name, b); return '<div class="layer-def unres-note" data-pending-sym="' + esc(key || name) + '">Looking for it in ' + esc(L.pending(lay)) + '…</div>'; }
    if (r) return '<div class="pop-sec">Defined in ' + esc(r.layer.label) + ' · ' + esc(r.v.label) + '</div>' + L.peek(r.b, r.p, r.n, 7) +
      '<a href="#" class="pop-jump" data-xgo="' + esc(r.v.id + '|' + r.p + '|' + r.n) + '">Jump to ' + esc(name) + ' in ' + esc(r.layer.label) + ' <span class="pop-go">↘</span></a>';
    var ch = L ? L.chain(lay) : [];
    if (!ch.length) return '';
    var st = L.stack(), w = ch.map(function (x) { var v = root.SWVersions.byId(st[x.id]); return x.label + (v ? ' (' + v.label + ')' : ''); }).join(', ');
    return '<div class="layer-def unres-note">Not defined in this text, nor in the layers below as chosen: ' + esc(w) + '.</div>';
  }
  function formPop(name, b) {
    var L = SW.layers, r = L && L.form(name, L.of(b.v.id)), h = '<h4>' + esc(name) + '</h4><div class="faint">A form of the script, which ELIZA acts on.</div>';
    if (!r) return h;
    if (r.loading) { refill('form:' + name, b); return h + '<div class="layer-def unres-note" data-pending-sym="form:' + esc(name) + '">Looking for it in ' + esc(r.layer.label) + '…</div>'; }
    if (r.missing) return h + '<div class="layer-def unres-note">' + esc(r.missing) + ' <span class="faint">(' + esc(r.layer.label) + ': ' + esc(r.v ? r.v.label : '') + ')</span></div>';
    return h + '<div class="layer-def"><div>' + esc(r.what || '') + ' <b>' + L.where(r) + '</b></div>' + L.peek(r.b, r.p, r.n, 6) +
      '<a href="#" data-xgo="' + esc(r.v.id + '|' + r.p + '|' + r.n) + '">Jump to it in ' + esc(r.layer.label) + ' <span class="pop-go">↘</span></a></div>';
  }

  // the pop-up on a name, as an IDE's hover card: what it is and where it lives; what the
  // project says of it; where it is defined; where it is used here; where the layers above use it
  var WHAT = { deck: 'Routine', 'function': 'Function', label: 'Statement label', external: 'Function defined elsewhere',
               slip: 'Function defined elsewhere', variable: 'Name', keyword: 'Script keyword', 'class': 'Word class (DLIST)' };
  function deckAt(b, p, n) { var L = (b.lines[p] || [])[n - 1]; return L && L.deck; }
  function codeAt(b, p, n) { var L = (b.lines[p] || [])[n - 1]; if (!L) return ''; var q = SW.parseLine(L.raw); return ((q.labels || []).join(' ') + ' ' + q.code).trim(); }
  // a row: the line, its deck when it differs, the code, and a jump there (→ in this text, ↗ to
  // the layer above), which selects the line and can be gone back from (◀)
  function row(b, r, deckOf, up) {
    var d = deckAt(b, r.file, r.line), file = b.parts.length > 1 ? b.parts[r.file].src.split('/').pop() + ' ' : '';
    var go = up ? 'Jump to line ' + r.line + ' in the layer above' : 'Jump to line ' + r.line;
    return '<a href="#" class="pop-row" title="' + go + '" data-xgo="' + esc(b.v.id + '|' + r.file + '|' + r.line) + '"><span class="pop-at">' + esc(file) + 'line ' + r.line + (d && d !== deckOf ? ' · in ' + esc(d) : '') + '</span><code>' + esc(codeAt(b, r.file, r.line).slice(0, 56)) + '</code><span class="pop-go" aria-label="' + go + '">' + (up ? '↗' : '→') + '</span></a>';
  }
  function section(title, rows) { return rows.length ? '<div class="pop-sec">' + title + '</div>' + rows.join('') : ''; }

  function symbol(key, b) {
    if (/^form:/.test(key)) return formPop(key.slice(5), b);
    var s = b.sym[key], name = s ? s.name : key, L = SW.layers, lay = L ? L.of(b.v.id) : null, layer = L && L.byId(lay);
    var h = '<h4>' + esc(name) + '</h4>';
    if (!s) return h + below(name, b, key);
    // the definition that matters: a function's ENTRY, not the head of its deck
    var defs = s.defs.slice(), isFn = s.kinds && s.kinds['function'];
    if (isFn) defs = defs.filter(function (d) { return !/ (MAD|FAP)$/.test(codeAt(b, d.file, d.line)) && !/^\S+\s+(MAD|FAP)\b/.test(codeAt(b, d.file, d.line)); });
    if (!defs.length) defs = s.defs.slice(0, 1);
    var home = defs[0] ? deckAt(b, defs[0].file, defs[0].line) : null;
    var what = (WHAT[isFn ? 'function' : s.kind] || 'Name') + (layer ? ' in ' + layer.label : '') + (home ? (s.kind === 'deck' || (isFn && home === name) ? ', its own routine' : ', in routine ' + home) : '');
    h += '<div class="pop-what">' + esc(what) + (s.defs.length ? '' : ' (used here, not defined)') + '</div>';
    if (GLOSS[name]) h += '<div class="pop-gloss">' + esc(GLOSS[name]) + '</div>';
    if (s.defs.length) h += section('Defined', defs.slice(0, 3).map(function (d) { return row(b, d, home); }));
    else h += below(name, b, key);
    var uses = s.refs.filter(function (r) { return !s.defs.some(function (d) { return d.file === r.file && d.line === r.line; }); });
    h += section('Used here' + (uses.length ? ' (' + uses.length + ')' : ''), uses.slice(0, 12).map(function (r) { return row(b, r, home); }));
    if (uses.length > 12) h += '<div class="pop-more">and ' + (uses.length - 12) + ' more</div>';
    if (L && s.defs.length) L.callers(name, lay).forEach(function (c) {
      h += section('Called from ' + esc(c.layer.label) + ' · ' + esc(c.v.label) + ' (' + c.refs.length + ')', c.refs.slice(0, 8).map(function (r) { return row(c.b, r, null, true); }));
    });
    return h;
  }

  var ctx = SW.readView({
    hl: hl,
    files: {
      word: 'File', remember: true, jump: 'one',
      sub: function (b, pi) {
        var part = b.parts[pi], home = SW.homeOf(part.src), decks = (b.decks || []).filter(function (d) { return d.p === pi; });
        var what = home === 'output' ? 'A conversation ELIZA produced' : home === 'script' ? 'An ELIZA script' : home === 'reconstructed' ? 'MAD, reconstructed in 2024 (not in the listing)' : decks.some(function (d) { return d.lang === 'FAP'; }) ? 'MAD and FAP' : 'MAD-SLIP';
        return '<span class="ph-lang">' + esc(what) + '</span> · ' + SW.sourceLink(part.src, part.src.split('/').pop()) + ' · ' + b.lines[pi].length + ' lines' +
          (decks.length ? ' · ' + decks.length + ' routines' + (decks.length <= 8 ? ': ' + esc(decks.map(function (d) { return d.name; }).join(', ')) : '') : '');
      }
    },
    key: function () {
      return '<h4>Key</h4><div class="keylist">' +
        '<div><i class="kx kdef"></i>a routine, an entry or a function begins here; in a script, a keyword’s entry</div>' +
        '<div class="faint flow">A routine was punched on cards as a deck and compiled on its own; the listing heads each with its name and language (YMATCH MAD, HASH FAP).</div>' +
        '<div><i class="kx kcom"></i>a remark card (R), a FAP comment card (*), or a script’s comment</div>' +
        '<div><i class="kx knoted"></i>covered by an annotation (initials at the right; click them)</div>' +
        '<div class="faint flow" style="margin-top:6px">MAD: <span class="lab">labels and functions defined here</span>, <span class="op">keywords</span> (W’R is WHENEVER, T’O TRANSFER TO, T’H THROUGH, E’L END OF CONDITIONAL, O’E OTHERWISE, F’N FUNCTION RETURN, V’S VECTOR VALUES, E’N END OF FUNCTION, E’M END OF PROGRAM), <span class="mac">functions defined elsewhere (in the layer below)</span>, <span class="ps">relations</span> (.E. equal, .G. greater, .L. less), <span class="var">$text$</span>, <span class="num">numbers</span>, <span class="cm">remarks and the cards’ sequence numbers</span>. A digit before a statement marks a continuation card. FAP: <span class="lab">label</span>, <span class="op">operation</span>, address, <span class="cm">comment</span>.</div>' +
        '<div class="faint flow" style="margin-top:6px">Script: <span class="lab">keywords</span>, <span class="op">DLIST, NEWKEY, PRE, MEMORY, NONE, =</span> (click one for the ELIZA code that acts on it), <span class="mac">/classes</span>, <span class="num">decomposition numbers</span>.</div>' +
        '<div class="faint flow" style="margin-top:6px">Layers: click a name for its pop-up, where <span class="pop-go">↘</span> jumps to where the layer below defines it (where it begins to run), <span class="pop-go">↗</span> to where the layer above calls it, and <span class="pop-go">→</span> to a line in this text. Ctrl- or Cmd-click on a name goes straight to its definition. ◀ ▶ (Alt+← and Alt+→) go back and forward.</div></div>';
    },
    symbol: symbol,
    lost: 'No source survives for this version. Annotations on it can still be kept under “Versions”.',
    onShow: function (b) { build = b; },
    // the layers' ◀ ▶ and breadcrumb (js/layers.js, loaded after this)
    toolbar: {
      html: function (b) { return SW.layers ? SW.layers.toolbar.html(b) : ''; },
      wire: function (tb) { if (SW.layers) SW.layers.toolbar.wire(tb); },
      after: function (view, b) { if (SW.layers) SW.layers.toolbar.after(view, b); }
    }
  });
  SW.readCtx = ctx;

  // Ctrl- or Cmd-click on a name: straight to its definition, here or in a layer below (an IDE's
  // Go to Definition); a plain click opens the pop-up
  document.addEventListener('click', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    var el = e.target.closest && e.target.closest('#view-read .sym[data-s]'); if (!el || !build) return;
    var key = el.dataset.s, s = build.sym[key], L = SW.layers;
    e.preventDefault(); e.stopPropagation();
    if (/^form:/.test(key)) {
      var f = L && L.form(key.slice(5), L.of(build.v.id));
      if (f && !f.missing && !f.loading) SW.nav.go({ v: f.v.id, p: f.p, n: f.n }); else SW.toast(f && f.missing ? f.missing : 'Still reading the layer below; try again in a moment.');
      return;
    }
    if (s && s.defs.length) { var d = s.defs[0]; SW.nav.go({ v: build.v.id, p: d.file, n: d.line }); return; }
    var r = L && L.resolve(s ? s.name : key, L.of(build.v.id));
    if (r) SW.nav.go({ v: r.v.id, p: r.p, n: r.n });
    else SW.toast(L && L.pending(L.of(build.v.id)) ? 'Still reading ' + L.pending(L.of(build.v.id)) + '; try again in a moment.' : (s ? s.name : key) + ' is not defined here or in the layers below.');
  }, true);
})(this);
