/*
 * core.js - the ELIZA bench's own part of reading its texts. The MAD cards and the script are
 * divided by bench-kit's kit/lang-mad.js; fetching, the cache of builds, opening a version at a
 * line and an export's details are kit/builds.js's.
 *
 * A build: b.v (the version), b.parts (its files), b.lines[file][line - 1] ({ p, n, raw, norm,
 * script }), b.kind (marks by "file:line": def where a deck, an entry or a script's keyword
 * begins, com for a remark or a script's comment), b.sym (every name, by key: { key, name,
 * kind, kinds, home, p, n, defs, refs, calls }, defs as [{ file, line, kind, start }] (start: where
 * a function begins to run), refs as [{ file, line }]; a statement
 * label's key is NAME·DECK, as labels belong to their deck), b.decks ([{ name, lang, p, n,
 * entry, entries }]), b.asm (null: nothing is assembled).
 * Names: a deck, a function (ENTRY TO, INTERNAL FUNCTION), a statement label, an external
 * function (called NAME.(…), not defined in these files: SLIP's, or another library's), a
 * variable; in a script, a keyword (its entry) and a class (/WORD in a DLIST).
 */
(function (root) {
  'use strict';

  var SW = root.SW;   // made by kit/base.js
  var M = root.SWLang.mad;

  // each line's language and deck (a script's, a MAD deck's or a FAP deck's), so a line given
  // alone is read as what it is
  var lineInfo = new Map();
  SW.lineInfo = function (raw) { return lineInfo.get(String(raw)) || null; };
  SW.isScriptLine = function (raw) { var x = lineInfo.get(String(raw)); return !!(x && x.lang === 'script'); };
  function parseAs(raw, lang) { return lang === 'text' ? parseText(raw) : lang === 'script' ? M.parseScript(raw) : lang === 'fap' ? M.parseFap(raw) : M.parseMad(raw); }
  // an output (a conversation) is read as text: a line starting ; is the transcriber's note
  function parseText(raw) {
    var t = String(raw), note = /^\s*;/.test(t);
    return { labels: [], code: note ? '' : t.replace(/\s+$/, ''), comment: note ? t : '', kind: note ? 'comment' : t.trim() ? 'code' : 'blank' };
  }
  function isOutput(part) { return part.role === 'text'; }   // an output, read as text (kit/versionlist.js)
  // where a script's keywords begin: after the line START, or, in a copy without one, after the
  // first list, the opening message (the tapes of 1965)
  SW.scriptStart = function (ls) {
    var i, seen = false;
    for (i = 0; i < ls.length; i++) if (/^\s*START\s*$/.test(ls[i].raw)) return ls[i].n + 1;
    for (i = 0; i < ls.length; i++) { if (!/^\(/.test(ls[i].raw)) continue; if (seen) return ls[i].n; seen = true; }
    return 1;
  };

  SW.parseLine = function (raw) {
    var x = lineInfo.get(String(raw)), p = x ? parseAs(raw, x.lang) : M.parseLine(raw);
    return { labels: p.labels, loc: '', code: p.code, comment: p.comment, kind: p.kind, seq: p.seq, cont: p.cont, deck: p.deck, script: !!p.script, fap: !!p.fap };
  };
  function splitLines(t) { var ls = String(t).replace(/\r\n?/g, '\n').split('\n'); if (ls.length > 1 && ls[ls.length - 1] === '') ls.pop(); return ls; }

  SW.builds({
    read: function (v, L) { var b = { v: v, dialect: v.dialect, parts: L.parts, asm: null }; index(b); return b; }
  });

  // SLIP's functions as the project names them (findingeliza.org/slip.html)
  SW.SLIP = { SEQRDR: 1, SEQLR: 1, POPTOP: 1, POPBOT: 1, NEWTOP: 1, NEWBOT: 1, LSSCPY: 1, SUBST: 1, IRALST: 1 };

  // where a file stands: ELIZA's own, the SLIP listing, or SLIP's routines reconstructed in 2024
  function isOutputSrc(src) { return /^outputs\//.test(src); }
  function homeOf(src) { return /^SLIP\/SLIP-/.test(src) ? 'SLIP' : /^SLIP\//.test(src) ? 'reconstructed' : isOutputSrc(src) ? 'output' : M.isScript(src) ? 'script' : 'ELIZA'; }
  SW.homeOf = homeOf;

  function index(b) {
    b.lines = b.parts.map(function (part) { return splitLines(part.raw); }).map(function (rs, pi) {
      var out = isOutput(b.parts[pi]), script = !out && M.isScript(b.parts[pi].src), lang = out ? 'text' : script ? 'script' : 'mad', deck = null;
      return rs.map(function (r, i) {
        if (!script) { var d = M.deckOf(r); if (d) { lang = d.lang === 'FAP' ? 'fap' : 'mad'; deck = d.name; } }
        lineInfo.set(r, { lang: lang, deck: deck });
        return { p: pi, n: i + 1, raw: r, norm: r, script: script, lang: lang, deck: deck };
      });
    });
    b.errorsAt = {}; b.kind = {}; b.sym = {}; b.decks = [];
    // a name may be several things at once (CHANGE: a deck, the function it enters, a label);
    // a statement label belongs to its deck, keyed NAME·DECK
    function sym(key, name, kind) { return b.sym[key] || (b.sym[key] = { key: key, name: name, kind: kind, kinds: {}, defs: [], refs: [], calls: 0 }); }
    // start: where a function begins to run (MAD's ENTRY TO, a FAP entry's labelled line)
    function def(key, name, kind, pi, n, start) { var s = sym(key, name, kind); if (!s.defs.length || kind === 'deck' || kind === 'function') s.kind = kind; s.kinds[kind] = 1; s.defs.push({ file: pi, line: n, kind: kind, start: !!start }); if (s.p == null) { s.p = pi; s.n = n; s.home = homeOf(b.parts[pi].src); } }
    var pending = [];   // names used, placed once every label is known: the deck's label, or the name
    b.lines.forEach(function (ls, pi) {
      if (b.parts[pi].role === 'doc') return;
      // in a script, the opening message is not a keyword (SW.scriptStart)
      var deck = null, from = ls.length && ls[0].script ? SW.scriptStart(ls) : 1;
      ls.forEach(function (L) {
        var k = pi + ':' + L.n, p = parseAs(L.raw, L.lang);
        if (p.kind === 'comment') { b.kind[k] = 'com'; return; }
        if (L.lang === 'text') return;
        if (L.script) {
          if (L.n < from) return;
          if (p.top) {
            var w = /^\(\s*([^\s()]+)/.exec(L.raw);
            if (w && !/^\d+$/.test(w[1])) { def(w[1], w[1], 'keyword', pi, L.n); b.kind[k] = 'def'; }
          }
          M.scriptTokens(p.code).forEach(function (t) {
            if (t[0] === 'key') pending.push({ name: t[1].slice(1), deck: null, pi: pi, n: L.n });
            else if (t[0] === 'tag') { var c = sym(t[1], t[1], 'class'); if (/DLIST/.test(p.code)) def(t[1], t[1], 'class', pi, L.n); else c.refs.push({ file: pi, line: L.n }); }
          });
          return;
        }
        if (p.kind === 'deck') { deck = { name: p.deck, lang: p.deckLang, p: pi, n: L.n, entry: null, entries: [] }; b.decks.push(deck); def(p.deck, p.deck, 'deck', pi, L.n); b.kind[k] = 'def'; return; }
        var dn = deck ? deck.name : '';
        if (L.lang === 'fap') {
          if (p.op === 'ENTRY') { var en = (p.args || '').replace(/[^A-Z0-9].*$/, ''); if (en) { def(en, en, 'function', pi, L.n); if (deck) { deck.entries.push(en); if (!deck.entry) deck.entry = en; } b.kind[k] = 'def'; } return; }
          p.labels.forEach(function (lab) { if (deck && deck.entries.indexOf(lab) >= 0) def(lab, lab, 'function', pi, L.n, true); else def(lab + '·' + dn, lab, 'label', pi, L.n); });
          var prev = '';
          M.fapTokens(p.args || '').forEach(function (t) {
            if (t[0] === 'name') pending.push({ name: t[1], deck: dn, pi: pi, n: L.n, called: prev === '$' });
            prev = t[1];
          });
          return;
        }
        p.labels.forEach(function (lab) { var nm = lab.replace(/\(.*$/, ''); def(nm + '·' + dn, nm, 'label', pi, L.n); });
        var entry = /^ENTRY TO\s+([A-Z][A-Z0-9]*)\./.exec(p.code), internal = /^INTERNAL FUNCTION\b.*?\b([A-Z][A-Z0-9]*)\.\(/.exec(p.code);
        if (entry) { def(entry[1], entry[1], 'function', pi, L.n, true); if (deck) { deck.entries.push(entry[1]); if (!deck.entry) deck.entry = entry[1]; } b.kind[k] = 'def'; }
        if (internal) { def(internal[1], internal[1], 'function', pi, L.n, true); b.kind[k] = 'def'; }
        M.tokens(p.code).forEach(function (t) {
          if (t[0] === 'call') { if (!(entry && t[1] === entry[1]) && !(internal && t[1] === internal[1])) pending.push({ name: t[1], deck: null, pi: pi, n: L.n, called: true }); }
          else if (t[0] === 'name' && !/'/.test(t[1]) && !(entry && t[1] === entry[1])) pending.push({ name: t[1], deck: dn, pi: pi, n: L.n });
        });
      });
    });
    pending.forEach(function (r) {
      var lk = r.deck != null ? r.name + '·' + r.deck : null;
      var s = lk && b.sym[lk] ? b.sym[lk] : sym(r.name, r.name, r.called ? 'external' : 'variable');
      s.refs.push({ file: r.pi, line: r.n }); if (r.called) s.calls++;
    });
    // a name called and defined nowhere here is external; SLIP's, where the project says so
    Object.keys(b.sym).forEach(function (n) {
      var s = b.sym[n];
      if (!s.defs.length && s.calls) s.kind = SW.SLIP[s.name] ? 'slip' : 'external';
      if (s.p == null && s.refs.length) { s.p = s.refs[0].file; s.n = s.refs[0].line; }
    });
  }

  // the key of a name used on a line: its deck's label, if there is one, or the name
  SW.symKey = function (b, name, raw) {
    var x = lineInfo.get(String(raw)), lk = x && x.deck != null ? name + '·' + x.deck : null;
    return lk && b.sym[lk] ? lk : name;
  };

  // ---------- ghosts (kit/base.js, SW.ghostMatch) ----------
  // a line as a key: its label and statement, spacing and case set aside; the sequence number
  // and remarks left out
  SW.lineKey = function (t) {
    var p = SW.parseLine(t);
    return ((p.labels || []).join(' ') + ' ' + p.code).replace(/\s+/g, ' ').trim().toLowerCase();
  };
})(this);
