/*
 * core.js - the ELIZA bench's own part of reading its texts. The MAD cards and the script are
 * divided by bench-kit's kit/lang-mad.js; fetching, the cache of builds, opening a version at a
 * line and an export's details are kit/builds.js's.
 *
 * A build: b.v (the version), b.parts (its files), b.lines[file][line - 1] ({ p, n, raw, norm,
 * script }), b.kind (marks by "file:line": def where a deck, an entry or a script's keyword
 * begins, com for a remark or a script's comment), b.sym (every name: { name, kind, p, n, defs,
 * refs }, defs and refs as [{ file, line }]), b.decks ([{ name, p, n, entry }]), b.asm (null:
 * nothing is assembled).
 * Names: a deck, a function (ENTRY TO, INTERNAL FUNCTION), a statement label, an external
 * function (called NAME.(…), not defined in these files: SLIP's, or another library's), a
 * variable; in a script, a keyword (its entry) and a class (/WORD in a DLIST).
 */
(function (root) {
  'use strict';

  var SW = root.SW;   // made by kit/base.js
  var M = root.SWLang.mad;

  // the lines of the bench's scripts, so a line given alone is read as the script it came from
  var scriptLines = new Set();
  SW.isScriptLine = function (raw) { return scriptLines.has(String(raw)); };

  SW.parseLine = function (raw) {
    var p = scriptLines.has(String(raw)) ? M.parseScript(raw) : M.parseLine(raw);
    return { labels: p.labels, loc: '', code: p.code, comment: p.comment, kind: p.kind, seq: p.seq, cont: p.cont, deck: p.deck, script: !!p.script };
  };
  function splitLines(t) { var ls = String(t).replace(/\r\n?/g, '\n').split('\n'); if (ls.length > 1 && ls[ls.length - 1] === '') ls.pop(); return ls; }

  SW.builds({
    read: function (v, L) { var b = { v: v, dialect: v.dialect, parts: L.parts, asm: null }; index(b); return b; }
  });

  // SLIP's functions as the project names them (findingeliza.org/slip.html)
  SW.SLIP = { SEQRDR: 1, SEQLR: 1, POPTOP: 1, POPBOT: 1, NEWTOP: 1, NEWBOT: 1, LSSCPY: 1, SUBST: 1, IRALST: 1 };

  function index(b) {
    b.lines = b.parts.map(function (part, pi) {
      var script = M.isScript(part.src);
      return splitLines(part.raw).map(function (r, i) { if (script) scriptLines.add(r); return { p: pi, n: i + 1, raw: r, norm: r, script: script }; });
    });
    b.errorsAt = {}; b.kind = {}; b.sym = {}; b.decks = [];
    function sym(name, kind) { return b.sym[name] || (b.sym[name] = { name: name, kind: kind, kinds: {}, defs: [], refs: [], calls: 0 }); }
    // a name may be several things at once (CHANGE: a deck, the function it enters, a label)
    function def(name, kind, pi, n) { var s = sym(name, kind); if (!s.defs.length || kind === 'deck' || kind === 'function') s.kind = kind; s.kinds[kind] = 1; s.defs.push({ file: pi, line: n }); if (s.p == null) { s.p = pi; s.n = n; } }
    function ref(name, pi, n, called) { var s = sym(name, called ? 'external' : 'variable'); s.refs.push({ file: pi, line: n }); if (called) s.calls++; }
    b.lines.forEach(function (ls, pi) {
      if (b.parts[pi].role === 'doc') return;
      // in a script, what comes before the line START is the opening message, not a keyword
      var deck = null, started = !(ls.length && ls[0].script);
      ls.forEach(function (L) {
        var k = pi + ':' + L.n, p = L.script ? M.parseScript(L.raw) : M.parseMad(L.raw);
        if (p.kind === 'comment') { b.kind[k] = 'com'; return; }
        if (L.script) {
          if (/^START$/.test(p.code)) { started = true; return; }
          if (!started) return;
          if (p.top) {
            var w = /^\(\s*([^\s()]+)/.exec(L.raw);
            if (w && !/^\d+$/.test(w[1])) { def(w[1], 'keyword', pi, L.n); b.kind[k] = 'def'; }
          }
          M.scriptTokens(p.code).forEach(function (t) {
            if (t[0] === 'key') ref(t[1].slice(1), pi, L.n);
            else if (t[0] === 'tag') { var c = sym(t[1], 'class'); if (/DLIST/.test(p.code)) def(t[1], 'class', pi, L.n); else c.refs.push({ file: pi, line: L.n }); }
          });
          return;
        }
        if (p.kind === 'deck') { deck = { name: p.deck, p: pi, n: L.n, entry: null }; b.decks.push(deck); def(p.deck, 'deck', pi, L.n); b.kind[k] = 'def'; return; }
        p.labels.forEach(function (lab) { def(lab.replace(/\(.*$/, ''), 'label', pi, L.n); });
        var entry = /^ENTRY TO\s+([A-Z][A-Z0-9]*)\./.exec(p.code), internal = /^INTERNAL FUNCTION\b.*?\b([A-Z][A-Z0-9]*)\.\(/.exec(p.code);
        if (entry) { def(entry[1], 'function', pi, L.n); if (deck && !deck.entry) deck.entry = entry[1]; b.kind[k] = 'def'; }
        if (internal) { def(internal[1], 'function', pi, L.n); b.kind[k] = 'def'; }
        M.tokens(p.code).forEach(function (t, i, a) {
          if (t[0] === 'call') { if (!(entry && t[1] === entry[1]) && !(internal && t[1] === internal[1])) ref(t[1], pi, L.n, true); }
          else if (t[0] === 'name' && !/'/.test(t[1]) && !(entry && t[1] === entry[1])) ref(t[1], pi, L.n, false);
        });
      });
    });
    // a name called and never defined here is external; SLIP's, where the project says so
    Object.keys(b.sym).forEach(function (n) {
      var s = b.sym[n];
      if (!s.defs.length && s.calls) s.kind = SW.SLIP[n] ? 'slip' : 'external';
      if (s.p == null && s.refs.length) { s.p = s.refs[0].file; s.n = s.refs[0].line; }
    });
  }

  // ---------- ghosts (kit/base.js, SW.ghostMatch) ----------
  // a line as a key: its label and statement, spacing and case set aside; the sequence number
  // and remarks left out
  SW.lineKey = function (t) {
    var p = SW.parseLine(t);
    return ((p.labels || []).join(' ') + ' ' + p.code).replace(/\s+/g, ' ').trim().toLowerCase();
  };
})(this);
