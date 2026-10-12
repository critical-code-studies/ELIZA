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
  var KIND = { deck: 'A deck (a separately compiled program)', 'function': 'A function', label: 'A statement label', slip: 'A SLIP function',
               external: 'A function not defined in this text', variable: 'A name', keyword: 'A keyword of the script', 'class': 'A class of words (DLIST)' };
  var FORMS = ((SW.BENCH.layers || {}).forms || {}).script || {};

  // a name as a link to its pop-up: data-s is its key (a label's is NAME·DECK)
  function symSpan(cls, key, text) {
    var s = build && build.sym[key];
    return s && (s.defs.length || s.calls || s.kind === 'keyword' || s.kind === 'class') ?
      '<span class="' + (cls ? cls + ' ' : '') + 'sym" data-s="' + esc(key) + '">' + esc(text) + '</span>' : (cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text));
  }
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
  function below(name, b) {
    var L = SW.layers, lay = L && L.of(b.v.id), r = L && L.resolve(name, lay);
    if (r) return '<div class="layer-def"><div>Defined in <b>' + L.where(r) + '</b></div>' + L.peek(r.b, r.s.p, r.s.n, 7) +
      '<a href="#" data-xgo="' + esc(r.v.id + '|' + r.s.p + '|' + r.s.n) + '">Jump to ' + esc(name) + ' in ' + esc(r.layer.label) + ' ▸</a></div>';
    var ch = L ? L.chain(lay) : [];
    if (!ch.length) return '';
    var st = L.stack(), w = ch.map(function (x) { var v = root.SWVersions.byId(st[x.id]); return x.label + (v ? ' (' + v.label + ')' : ''); }).join(', ');
    return '<div class="layer-def unres-note">Not defined in this text, nor in the layers below as chosen: ' + esc(w) + '.</div>';
  }
  function formPop(name, b) {
    var L = SW.layers, r = L && L.form(name, L.of(b.v.id)), h = '<h4>' + esc(name) + '</h4><div class="faint">A form of the script, which ELIZA acts on.</div>';
    if (!r) return h;
    if (r.missing) return h + '<div class="layer-def unres-note">' + esc(r.missing) + ' <span class="faint">(' + esc(r.layer.label) + ': ' + esc(r.v ? r.v.label : '') + ')</span></div>';
    return h + '<div class="layer-def"><div>' + esc(r.what || '') + ' <b>' + L.where(r) + '</b></div>' + L.peek(r.b, r.p, r.n, 6) +
      '<a href="#" data-xgo="' + esc(r.v.id + '|' + r.p + '|' + r.n) + '">Jump to it in ' + esc(r.layer.label) + ' ▸</a></div>';
  }

  // the pop-up on a name
  function symbol(key, b) {
    if (/^form:/.test(key)) return formPop(key.slice(5), b);
    var s = b.sym[key], name = s ? s.name : key;
    var h = '<h4>' + esc(name) + '</h4>';
    if (!s) return h + below(name, b);
    var ks = Object.keys(s.kinds || {}), what = ks.length > 1 ? ks.map(function (k) { return (KIND[k] || k).replace(/^A /, 'a ').replace(/ \(.*$/, ''); }).join(', ') : (KIND[s.kind] || 'A name');
    h += '<div>' + esc(what.charAt(0).toUpperCase() + what.slice(1)) + ' <span class="faint">· ' + (s.defs.length ? 'defined ' + s.defs.length + '×, ' : '') + 'used ' + s.refs.length + '×</span></div>';
    if (GLOSS[name]) h += '<div style="margin-top:4px;font-family:var(--serif);font-size:14px">' + esc(GLOSS[name]) + ' <span class="faint">(the project’s SLIP page)</span></div>';
    if (s.kind === 'deck') { var d = (b.decks || []).filter(function (x) { return x.name === name; })[0]; if (d && d.entries.length && (d.entries.length > 1 || d.entries[0] !== name)) h += '<div class="faint">Its ' + (d.entries.length > 1 ? 'entries' : 'entry') + ': ' + esc(d.entries.join(', ')) + '.</div>'; }
    if (!s.defs.length) h += below(name, b);
    return h + SW.symbolRefs(b, s, { file: b.parts.length > 1, width: 44 });
  }

  var ctx = SW.readView({
    hl: hl,
    files: {
      word: 'File', remember: true, jump: 'one',
      sub: function (b, pi) {
        var part = b.parts[pi], home = SW.homeOf(part.src), decks = (b.decks || []).filter(function (d) { return d.p === pi; });
        var what = home === 'script' ? 'An ELIZA script' : home === 'reconstructed' ? 'MAD, reconstructed in 2024 (not in the listing)' : decks.some(function (d) { return d.lang === 'FAP'; }) ? 'MAD and FAP' : 'MAD-SLIP';
        return '<span class="ph-lang">' + esc(what) + '</span> · ' + SW.sourceLink(part.src, part.src.split('/').pop()) + ' · ' + b.lines[pi].length + ' lines' +
          (decks.length ? ' · ' + decks.length + ' decks' + (decks.length <= 8 ? ': ' + esc(decks.map(function (d) { return d.name; }).join(', ')) : '') : '');
      }
    },
    key: function () {
      return '<h4>Key</h4><div class="keylist">' +
        '<div><i class="kx kdef"></i>a deck, an entry or a function begins here; in a script, a keyword’s entry</div>' +
        '<div><i class="kx kcom"></i>a remark card (R), a FAP comment card (*), or a script’s comment</div>' +
        '<div><i class="kx knoted"></i>covered by an annotation (initials at the right; click them)</div>' +
        '<div class="faint flow" style="margin-top:6px">MAD: <span class="lab">labels and functions defined here</span>, <span class="op">keywords</span> (W’R is WHENEVER, T’O TRANSFER TO, T’H THROUGH, E’L END OF CONDITIONAL, O’E OTHERWISE, F’N FUNCTION RETURN, V’S VECTOR VALUES, E’N END OF FUNCTION, E’M END OF PROGRAM), <span class="mac">functions defined elsewhere (in the layer below)</span>, <span class="ps">relations</span> (.E. equal, .G. greater, .L. less), <span class="var">$text$</span>, <span class="num">numbers</span>, <span class="cm">remarks and the cards’ sequence numbers</span>. A digit before a statement marks a continuation card. FAP: <span class="lab">label</span>, <span class="op">operation</span>, address, <span class="cm">comment</span>.</div>' +
        '<div class="faint flow" style="margin-top:6px">Script: <span class="lab">keywords</span>, <span class="op">DLIST, NEWKEY, PRE, MEMORY, NONE, =</span> (click one for the ELIZA code that acts on it), <span class="mac">/classes</span>, <span class="num">decomposition numbers</span>.</div>' +
        '<div class="faint flow" style="margin-top:6px">Layers: a name used here and defined in a layer below jumps there from its pop-up; ◀ ▶ (Alt+← and Alt+→) go back and forward.</div></div>';
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
})(this);
