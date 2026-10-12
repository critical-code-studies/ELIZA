/*
 * analyse.js - ELIZA's lenses, drawn in bench-kit's Analyse view (kit/lenses.js), which gives
 * each its heading, its menu (Text ▾), its modes and its export. Each draws cards into the grid
 * it is given and returns a function giving its export. Keep the numbers stable, so that a lens
 * can be named in discussion ("lens 3").
 *   1 Remarks and comments   the remark cards and the script's comments, searchable
 *   2 Names                  the decks, functions and statement labels, and where each is used
 *   3 Calls into the layer below   the functions called and not defined here, and where the layer
 *                                below defines them
 *   4 The script's keywords  each keyword's entry: its decompositions, and what refers to it
 */
(function (root) {
  'use strict';
  var SW = root.SW, M = root.SWLang.mad, card = SW.lenses.card, wide = SW.lenses.wide, bars = SW.lenses.bars;

  function fileName(b, p) { return b.parts[p].src.split('/').pop(); }
  function where(b, p, n) { return { html: '<a href="#" data-go="' + p + ':' + n + '">' + SW.esc(fileName(b, p) + ':' + n) + '</a>', sort: p * 100000 + n, text: fileName(b, p) + ':' + n }; }
  function linkRows(el) {
    el.addEventListener('click', function (e) {
      var a = e.target.closest('[data-go]'); if (!a) return;
      e.preventDefault();
      var x = a.dataset.go.split(':'), p = +x[0], n = +x[1];
      SW.state.sel = { p: p, n0: n, n1: n }; SW.setTab('read'); SW.emit('goto', { p: p, n: n, tab: 'read' });
    });
  }
  function plain(rows) { return rows.map(function (r) { return r.map(function (c) { return c && c.text != null ? c.text : c; }); }); }
  function short(v) { return SW.refOf(v.id) + ' ' + v.label; }
  function none(el, text) { var c = wide(card('Nothing to show', text)); el.appendChild(c); return function () { return []; }; }

  // ---------- 1 remarks and comments ----------
  function remarksOf(b) {
    var out = [];
    b.lines.forEach(function (ls, p) {
      ls.forEach(function (L) { var c = SW.parseLine(L.raw).comment.replace(/^[*\s]+/, '').trim(); if (c) out.push({ p: p, n: L.n, c: c, script: L.script }); });
    });
    return out;
  }
  function remarks(b, el) {
    var items = remarksOf(b), rows = [];
    var c = wide(card('Remarks and comments', items.length + ' in this version: MAD’s remark cards (R in column 12) and the script’s comments. Type to keep only those that contain a word; click a place to read it in Read.'));
    var inp = SW.el('input', { type: 'search', placeholder: 'Find in remarks…', value: SW.store.get('an.rq', ''), style: 'width:260px' });
    var out = SW.el('div');
    c.appendChild(inp); c.appendChild(out); el.appendChild(c);
    function draw() {
      var q = inp.value.trim().toLowerCase(); SW.store.set('an.rq', inp.value);
      rows = items.filter(function (x) { return !q || x.c.toLowerCase().indexOf(q) >= 0; }).map(function (x) { return [where(b, x.p, x.n), x.script ? 'script' : 'remark', x.c]; });
      out.innerHTML = '';
      out.appendChild(rows.length ? SW.table(['Where', 'Kind', 'Text'], rows, { cls: ['mono', '', ''] }) : SW.el('p', { class: 'hint' }, items.length ? 'None contains “' + inp.value + '”.' : 'This version has none.'));
    }
    inp.addEventListener('input', draw); draw(); linkRows(c);
    return function () { return [SW.tableBlock('Remarks and comments' + (inp.value.trim() ? ' containing “' + inp.value.trim() + '”' : ''), ['Where', 'Kind', 'Text'], plain(rows))]; };
  }
  function remarksAcross(vs, bs, el) {
    var rows = vs.map(function (v, i) { var b = bs[i], r = remarksOf(b); return [short(v), r.filter(function (x) { return !x.script; }).length, r.filter(function (x) { return x.script; }).length]; });
    var c = wide(card('Remarks across the versions', 'The remark cards and the script’s comments each held version carries.'));
    c.appendChild(SW.table(['Version', 'Remark cards', 'Script comments'], rows, { cls: ['', 'num', 'num'] }));
    el.appendChild(c);
    return function () { return [SW.tableBlock('Remarks across the versions', ['Version', 'Remark cards', 'Script comments'], rows)]; };
  }

  // ---------- 2 names ----------
  var KINDS = { deck: 'routine', 'function': 'function', label: 'label' };
  function names(b, el) {
    var ns = Object.keys(b.sym).map(function (k) { return b.sym[k]; }).filter(function (s) { return KINDS[s.kind]; })
      .sort(function (x, y) { return x.p - y.p || x.n - y.n; });
    if (!ns.length) return none(el, 'This version’s text defines no routines, functions or labels: it is a script (lens 4 reads its keywords).');
    var rows = ns.map(function (s) { return [s.name, KINDS[s.kind], s.refs.length, where(b, s.p, s.n)]; });
    var c = wide(card('Names the program defines', ns.length + ' names: the routines (each compiled on its own: on the 7094, a deck of punched cards), the functions they enter, and the statement labels a transfer goes to. Sort by a column; click a place to read it.'));
    c.appendChild(SW.table(['Name', 'Kind', 'Used', 'Defined at'], rows, { cls: ['mono', '', 'num', 'mono'] }));
    el.appendChild(c); linkRows(c);
    var decks = b.decks || [];
    if (decks.length) {
      var dc = card('The routines', 'Each routine in the order of the listing (headed there by its name and language, as YMATCH MAD), and the function it enters.');
      dc.appendChild(SW.table(['Routine', 'Entry', 'Begins at'], decks.map(function (d) { return [d.name, d.entry || '–', where(b, d.p, d.n)]; }), { cls: ['mono', 'mono', 'mono'] }));
      el.appendChild(dc); linkRows(dc);
    }
    return function () { return [SW.tableBlock('Names the program defines', ['Name', 'Kind', 'Used', 'Defined at'], plain(rows))]; };
  }

  // ---------- 3 calls into the layer below ----------
  function calls(b, el) {
    var L = SW.layers, lay = L ? L.of(b.v.id) : null, dn = L && lay ? L.below(lay) : null;
    var cs = Object.keys(b.sym).map(function (k) { return b.sym[k]; }).filter(function (s) { return !s.defs.length && s.calls; })
      .sort(function (x, y) { return y.calls - x.calls || (x.name < y.name ? -1 : 1); });
    if (!cs.length) return none(el, 'This text calls no function it does not define' + (dn ? '' : ', or it is the lowest layer') + '.');
    var rows = cs.map(function (s) {
      var r = L ? L.resolve(s.name, lay) : null;
      return [s.name, s.calls, r ? { html: '<a href="#" data-xgo="' + SW.esc(r.v.id + '|' + r.s.p + '|' + r.s.n) + '">' + SW.esc(r.layer.label + ', ' + r.b.parts[r.s.p].src.split('/').pop() + ':' + r.s.n) + '</a>', text: r.layer.label + ', ' + r.b.parts[r.s.p].src.split('/').pop() + ':' + r.s.n, sort: 0 } : { html: '<span class="faint">not found below</span>', text: 'not found below', sort: 1 },
              where(b, s.refs[0].file, s.refs[0].line)];
    });
    var found = rows.filter(function (r) { return r[2].sort === 0; }).length;
    var c = wide(card('Calls into the layer below', cs.length + ' functions this text calls and does not define' + (dn ? ', looked up in ' + dn.label + ' (the version chosen in it, under Read ▾): ' + found + ' found there' : '') + '. Click a definition to jump to it; ◀ comes back.'));
    c.appendChild(SW.table(['Function', 'Calls', 'Defined in', 'First called at'], rows, { cls: ['mono', 'num', 'mono', 'mono'] }));
    el.appendChild(c); linkRows(c);
    var tc = card('Most called', 'The functions called most often.');
    tc.insertAdjacentHTML('beforeend', bars(cs.slice(0, 15).map(function (s) { return [s.name, s.calls]; })));
    el.appendChild(tc);
    return function () { return [SW.tableBlock('Calls into the layer below', ['Function', 'Calls', 'Defined in', 'First called at'], plain(rows))]; };
  }

  // ---------- 4 the script's keywords ----------
  function keywordsOf(b) {
    var out = [];
    b.lines.forEach(function (ls, p) {
      if (!ls.length || !ls[0].script) return;
      var cur = null, started = false;   // before START: the opening message, not a keyword
      ls.forEach(function (L) {
        var s = M.parseScript(L.raw);
        if (/^START$/.test(s.code)) { started = true; return; }
        if (!started) return;
        if (s.top) { var w = /^\(\s*([^\s()]+)/.exec(L.raw); cur = { name: w ? w[1] : '?', p: p, n: L.n, decomps: 0, dlist: false, newkey: false, pre: false, eq: '' }; out.push(cur); }
        if (!cur || !s.code) return;
        cur.decomps += (s.code.match(/\(\(/g) || []).length;
        if (/\bDLIST\b/.test(s.code)) cur.dlist = true;
        if (/\bNEWKEY\b/.test(s.code)) cur.newkey = true;
        if (/\bPRE\b/.test(s.code)) cur.pre = true;
        var eq = s.top && /^\(\s*[^\s()]+\s*=\s*([^\s()]+)/.exec(L.raw); if (eq) cur.eq = eq[1];
      });
    });
    return out.filter(function (k) { return !/^\d/.test(k.name); });
  }
  function keywords(b, el) {
    var ks = keywordsOf(b);
    if (!ks.length) return none(el, 'This version holds no script.');
    var rows = ks.map(function (k) {
      var s = b.sym[k.name], used = s ? s.refs.length : 0;
      return [k.name, k.eq || '', k.decomps, [k.dlist ? 'DLIST' : '', k.newkey ? 'NEWKEY' : '', k.pre ? 'PRE' : ''].filter(Boolean).join(' '), used, where(b, k.p, k.n)];
    });
    var c = wide(card('The script’s keywords', ks.length + ' entries, in the order of the script: each keyword, the word it is replaced by (=), its decomposition rules, the script’s own words in it, and how many other entries send to it (=KEYWORD). Sort by a column; click a place to read it.'));
    c.appendChild(SW.table(['Keyword', 'Replaced by', 'Decompositions', 'Marks', 'Sent to it', 'Entry at'], rows, { cls: ['mono', 'mono', 'num', 'mono', 'num', 'mono'] }));
    el.appendChild(c); linkRows(c);
    var tc = card('Most decompositions', 'The keywords with the most decomposition rules.');
    tc.insertAdjacentHTML('beforeend', bars(ks.slice().sort(function (x, y) { return y.decomps - x.decomps; }).slice(0, 12).map(function (k) { return [k.name, k.decomps]; })));
    el.appendChild(tc);
    return function () { return [SW.tableBlock('The script’s keywords', ['Keyword', 'Replaced by', 'Decompositions', 'Marks', 'Sent to it', 'Entry at'], plain(rows))]; };
  }

  // ---------- for kit/lenses.js ----------
  SW.BENCH.lenses = {
    list: [[1, 'Remarks and comments', 'Every remark card and script comment, searchable'],
           [2, 'Names', 'The routines, functions and labels the program defines, and their use'],
           [3, 'Calls into the layer below', 'The functions called and not defined here, and where SLIP defines them'],
           [4, 'The script’s keywords', 'Each keyword’s entry: its rules, and what sends to it']],
    menus: { text: [['The program', [1, 2, 3]], ['The script', [4]]] },
    one: { 1: remarks, 2: names, 3: calls, 4: keywords },
    across: { 1: remarksAcross },
    acrossLabel: 'Across the versions'
  };
})(this);
