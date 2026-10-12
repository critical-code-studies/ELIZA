/*
 * read.js - Read: bench-kit's Read view (kit/read.js), with what is ELIZA's: the highlighting of
 * MAD-SLIP cards and of the script (kit/lang-mad.js divides them), the pop-up on a name (where
 * it is defined and used, and what SLIP's functions do, as the project's SLIP page has it),
 * the Key, and the files' labels.
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
               external: 'A function not defined in these files (SLIP’s, or another library’s)', variable: 'A name', keyword: 'A keyword of the script',
               'class': 'A class of words (DLIST)' };

  function symSpan(cls, name, text) {
    var s = build && build.sym[name];
    return s && (s.defs.length || s.calls || s.kind === 'keyword' || s.kind === 'class') ?
      '<span class="' + cls + ' sym" data-s="' + esc(name) + '">' + esc(text) + '</span>' : (cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text));
  }
  function madHTML(code) {
    return M.tokens(code).map(function (t) {
      var k = t[0], x = t[1], s = build && build.sym[x];
      if (k === 'kw') return '<span class="op">' + esc(x) + '</span>';
      if (k === 'rel') return '<span class="ps">' + esc(x) + '</span>';
      if (k === 'str') return '<span class="var">' + esc(x) + '</span>';
      if (k === 'num') return '<span class="num">' + esc(x) + '</span>';
      if (k === 'call') return symSpan(s && (s.kind === 'deck' || s.kind === 'function') ? 'lab' : 'mac', x, x);
      if (k === 'name') return symSpan(s && (s.kind === 'label' || s.kind === 'deck' || s.kind === 'function') ? 'lab' : '', x, x);
      return esc(x);
    }).join('');
  }
  // top: the keyword whose entry opens on this line, marked as its definition
  function scriptHTML(code, top) {
    return M.scriptTokens(code).map(function (t) {
      var k = t[0], x = t[1];
      if (top && k === 'word' && x === top) { top = null; return symSpan('lab', x, x); }
      if (k === 'num') return '<span class="num">' + esc(x) + '</span>';
      if (k === 'op') return '<span class="op">' + esc(x) + '</span>';
      if (k === 'key') return '=' + symSpan('lab', x.slice(1), x.slice(1));
      if (k === 'tag') return symSpan('mac', x, x);
      return esc(x);
    }).join('');
  }

  // a line as HTML: a card's label, its continuation mark, the statement and the sequence
  // number; a remark; a deck's head; or a line of the script
  function hl(raw, b) {
    build = b || build;
    var s = String(raw || '');
    if (SW.isScriptLine(s)) {
      var p = M.parseScript(s), ci = s.indexOf(';'), code = ci < 0 ? s : s.slice(0, ci);
      var lead = /^\s*/.exec(code)[0], w = /^\(\s*([^\s()]+)/.exec(s);
      var body = scriptHTML(code.slice(lead.length), p.top && w ? w[1] : null);
      return esc(lead) + body + (ci < 0 ? '' : '<span class="cm">' + esc(s.slice(ci)) + '</span>');
    }
    var q = M.parseMad(s);
    if (q.kind === 'blank') return esc(s);
    if (q.kind === 'deck') return esc(/^\s*/.exec(s)[0]) + symSpan('lab', q.deck, q.deck) + esc(s.trim().slice(q.deck.length).replace(/MAD$/, '')) + '<span class="op">MAD</span>';
    var body72 = s.length > 72 ? s.slice(0, 72) : s, seq = s.length > 72 ? s.slice(72) : '';
    var labelField = body72.slice(0, 11), flag = body72.charAt(11), rest = body72.slice(12);
    var lab = labelField.replace(/^(\s*)(\S+)/, function (m, sp, l) { return sp + symSpan('lab', l.replace(/\(.*$/, ''), l); });
    var seqHTML = seq ? '<span class="cm">' + esc(seq) + '</span>' : '';
    if (q.kind === 'comment') return lab + '<span class="cm">' + esc(flag + rest) + '</span>' + seqHTML;
    var stmt = /[0-9 ]/.test(flag) ? rest : flag + rest, lead = /[0-9 ]/.test(flag) ? (flag === ' ' ? ' ' : '<span class="num" title="A continuation card">' + flag + '</span>') : '';
    var sp = /^\s*/.exec(stmt)[0], tail = /\s*$/.exec(stmt.slice(sp.length))[0], core = stmt.slice(sp.length, stmt.length - tail.length);
    return lab + lead + esc(sp) + madHTML(core) + esc(tail) + seqHTML;
  }

  // the pop-up on a name
  function symbol(name, b) {
    var s = b.sym[name];
    var h = '<h4>' + esc(name) + '</h4>';
    if (!s) return h + '<div class="faint">Not a name in this version’s files.</div>';
    var ks = Object.keys(s.kinds || {}), what = ks.length > 1 ? ks.map(function (k) { return (KIND[k] || k).replace(/^A /, 'a ').replace(/ \(.*$/, ''); }).join(', ') : (KIND[s.kind] || 'A name');
    h += '<div>' + esc(what.charAt(0).toUpperCase() + what.slice(1)) + ' <span class="faint">· ' + (s.defs.length ? 'defined ' + s.defs.length + '×, ' : '') + 'used ' + s.refs.length + '×</span></div>';
    if (GLOSS[name]) h += '<div style="margin-top:4px;font-family:var(--serif);font-size:14px">' + esc(GLOSS[name]) + ' <span class="faint">(the project’s SLIP page)</span></div>';
    if (s.kind === 'deck') { var d = (b.decks || []).filter(function (x) { return x.name === name; })[0]; if (d && d.entry && d.entry !== name) h += '<div class="faint">Its entry: ' + esc(d.entry) + '.</div>'; }
    return h + SW.symbolRefs(b, s, { file: b.parts.length > 1, width: 44 });
  }

  var ctx = SW.readView({
    hl: hl,
    files: {
      word: 'File', remember: true, jump: 'one',
      sub: function (b, pi) {
        var part = b.parts[pi], script = M.isScript(part.src), decks = (b.decks || []).filter(function (d) { return d.p === pi; });
        return '<span class="ph-lang">' + (script ? 'An ELIZA script' : 'MAD-SLIP') + '</span> · ' + SW.sourceLink(part.src, part.src.split('/').pop()) + ' · ' + b.lines[pi].length + ' lines' +
          (decks.length ? ' · ' + decks.length + ' decks: ' + esc(decks.map(function (d) { return d.name; }).join(', ')) : '');
      }
    },
    key: function () {
      return '<h4>Key</h4><div class="keylist">' +
        '<div><i class="kx kdef"></i>a deck, an entry or a function begins here; in the script, a keyword’s entry</div>' +
        '<div><i class="kx kcom"></i>a remark card (R in column 12), or the script’s comment</div>' +
        '<div><i class="kx knoted"></i>covered by an annotation (initials at the right; click them)</div>' +
        '<div class="faint flow" style="margin-top:6px">MAD: <span class="lab">labels and this program’s functions</span>, <span class="op">keywords</span> (W’R is WHENEVER, T’O TRANSFER TO, T’H THROUGH, E’L END OF CONDITIONAL, O’E OTHERWISE, F’N FUNCTION RETURN, V’S VECTOR VALUES, E’N END OF FUNCTION, E’M END OF PROGRAM), <span class="mac">SLIP and other external functions</span>, <span class="ps">relations</span> (.E. equal, .G. greater, .L. less), <span class="var">$text$</span>, <span class="num">numbers</span>, <span class="cm">remarks and the cards’ sequence numbers</span>. A digit before a statement marks a continuation card.</div>' +
        '<div class="faint flow" style="margin-top:6px">Script: <span class="lab">keywords</span>, <span class="op">DLIST, NEWKEY, PRE, MEMORY, NONE, =</span>, <span class="mac">/classes</span>, <span class="num">decomposition numbers</span>. Click a name for where it is defined and used.</div></div>';
    },
    symbol: symbol,
    lost: 'No source survives for this version. Annotations on it can still be kept under “Versions”.',
    onShow: function (b) { build = b; }
  });
})(this);
