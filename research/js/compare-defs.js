/*
 * compare-defs.js - the ELIZA bench's second mode in Compare (bench-kit's kit/compare.js): the
 * decks, functions and script keywords each version defines (core.js indexes them), and
 * whether each one's code is the same.
 */
(function (root) {
  'use strict';
  var SW = root.SW;
  // A routine's code: from its line to the next routine in the same file, comments and
  // spacing aside.
  function routineText(b, s) {
    var ls = b.lines[s.p], end = ls.length;
    for (var n = s.n + 1; n <= ls.length; n++) if (b.kind[s.p + ':' + n] === 'def') { end = n - 1; break; }
    return ls.slice(s.n - 1, end).map(function (L) { return SW.parseLine(L.raw).code; }).join(' ').replace(/\s+/g, ' ').trim();
  }
  function where(b, s) { return b.parts[s.p].src.split('/').pop() + ':' + s.n; }
  // the routines: decks, functions and script keywords, not labels or variables
  function defs(b) { var o = {}; Object.keys(b.sym || {}).forEach(function (k) { var s = b.sym[k]; if (s.defs.length && /^(deck|function|keyword)$/.test(s.kind)) o[k] = s; }); return o; }
  function routinesDiff(el, A, B, h) {
    var sa = defs(A), sb = defs(B), names = {};
    Object.keys(sa).concat(Object.keys(sb)).forEach(function (k) { names[k] = 1; });
    var srow = [], same = 0;
    Object.keys(names).sort().forEach(function (k) {
      var a = sa[k], x = sb[k];
      var st = !a ? 'only in ' + B.v.label : !x ? 'only in ' + A.v.label : routineText(A, a) !== routineText(B, x) ? 'changed' : '';
      if (!st) { same++; return; }
      srow.push([k, a ? where(A, a) : '', x ? where(B, x) : '', st]);
    });
    var pad = SW.el('div', { class: 'pad' });
    pad.innerHTML = '<h3>Routines that differ</h3><p class="hint">' + Object.keys(names).length + ' routines are named in one or both; ' + same + ' have the same code in both (comments and spacing set aside).</p>';
    pad.appendChild(SW.table(['Routine', h.vl(A), h.vl(B), 'Change'], srow, { cls: ['mono', 'mono', 'mono', ''] }));
    el.appendChild(pad);
    return { crow: [], mrow: [], srow: srow };
  }

  SW.BENCH.compareDefs = {
    label: 'Routines',
    render: function (el, A, B, h) { return routinesDiff(el, A, B, h); },
    doc: function (A, B, r, h) {
      return { title: A.v.label + ' and ' + B.v.label + ': routines that differ', blocks: [SW.tableBlock('Routines that differ', ['Routine', h.vl(A), h.vl(B), 'Change'], r.srow)] };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
