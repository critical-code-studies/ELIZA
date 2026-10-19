/*
 * implementations.js - the ELIZA bench's Implementations tab: every known implementation of ELIZA,
 * from implementations/catalogue.json, with List, Read, Tree, Matrix and Compare. Made from the
 * test viewer (_tmp/implementations/prototype) as a view of the bench, so that the bench's header,
 * tabs, menus and themes stay in place; its state rides in the address as iv, ic, ia, ib, ifeat,
 * ifam and ist beside the bench's own v and tab. The kit module for implementations will start
 * from this. Loaded after kit/notes.js and before kit/shell.js.
 */
(function (rootWin) {
  'use strict';
  var SW = rootWin.SW;

  var CAT, BY = {}, view = 'list', cur = null, F = { fam: '', st: '', pub: '', q: '' }, SORT = { k: 'date', dir: 1 }, SHOWF = false, CMP = { a: null, b: null }, PICK = null;
  var CATURL = 'implementations/catalogue.json', BASE = 'implementations/';
  var ROOTS = { 'v:1965b': 'ELIZA 1965b, the MAD-SLIP source', 'v:1966': 'ELIZA as described in CACM, January 1966', 'v:doctor': 'DOCTOR, the script printed in CACM, 1966' };
  var FAMORDER = [], PAL = ['#b5651d', '#2f6f8f', '#7a4f9a', '#6f7f3f', '#9a3b5f', '#3f7f6f', '#8a6d1f', '#555'];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  function year(r) { var m = String(r.date || '').match(/(1[89]\d\d|20\d\d)/); return m ? +m[1] : null; }
  function vmap(c) { var v = (CAT.variorum || {})[c] || (CAT.variorum || {})[c.replace(/^v:/, '')]; return v == null ? null : typeof v === 'string' ? { label: v } : v; }
  function rootLabel(c) { var v = vmap(c); return v ? (v.label || v.title || c) + (v.date ? ' (' + v.date + ')' : '') : ROOTS[c] || c.replace(/^v:/, 'variorum: '); }
  function famName(id) { var f = (CAT.families || []).filter(function (x) { return x.id === id; })[0]; return f ? f.name : id; }
  function famColour(f) { var i = FAMORDER.indexOf(f); return i < 0 ? '#888' : PAL[i % PAL.length]; }
  function label(code) { return BY[code] ? BY[code].title : /^v:/.test(code) ? rootLabel(code) : code; }
  function chip(st) { return '<span class="chip st-' + esc(st) + '">' + esc(st) + '</span>'; }
  function dot(fam) { return '<span class="fam" style="background:' + famColour(fam) + '"></span>'; }
  function feats() { return CAT.features || []; }
  function fval(v, k) { return v == null ? '?' : v === true ? '✓' : v === false ? '✗' : String(v); }
  function fcls(v) { return v == null ? 'unk' : v === false || v === 'no BUT' ? 'no' : 'yes'; }

  // the files an entry can show: published ones, or (locally only) the private copies awaiting clearance
  function filesOf(r) {
    if (r.file) return [{ url: BASE + r.file, label: 'Main file', mime: r.mime, name: r.file }].concat((r.alts || []).filter(function (a) { return a.file; }).map(function (a) { return { url: BASE + a.file, label: a.label || a.file.split('/').pop(), mime: a.mime, name: a.file }; }));
    return (r._localPrivateFiles || []).map(function (n, i) { return { url: BASE + 'private/' + n, label: (i ? 'Alternate ' + i : 'Main file') + ' (private copy)', mime: '', name: n, priv: true }; });
  }
  var TEXT = /\.(l|el|lsp|lisp|mac|for|f|asm|s|ez|spec|txt|bas|py|cpp|java|pl|pm|php|cbl|awk|tcl|lg|p|pli|pas|tec|rls|mad|ascii|eli|scr|js|json|html?|listing\.txt|c|z80|plisp|runbasic|c64basic)$/i;
  function isText(f) { return /^text\/|json|javascript/.test(f.mime || '') || TEXT.test(f.name || ''); }
  function textFileOf(r) { return filesOf(r).filter(function (f) { return isText(f) && !/\.html?$/i.test(f.name); })[0] || filesOf(r).filter(isText)[0] || null; }
  function langFam(s) { s = String(s || '').toLowerCase(); return /lisp/.test(s) ? 'lisp' : /basic/.test(s) ? 'basic' : /eliza script/.test(s) ? 'eliza script' : s; }

  // ---------- List (with feature columns behind a toggle) ----------
  function filtered() {
    var q = F.q.toLowerCase();
    return CAT.items.filter(function (r) {
      if (F.fam && r.family !== F.fam) return false; if (F.st && r.status !== F.st) return false; if (F.pub && r.publish !== F.pub) return false;
      if (q && [r.code, r.title, r.creator, r.progLanguage, r.machine, r.date, r.description].join(' ').toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function sortKey(r, k) {
    if (k === 'date') return year(r) || 9999;
    if (k.indexOf('f:') === 0) { var v = (r.features || {})[k.slice(2)]; return v == null ? 'zz' : String(v); }
    return String(k === 'family' ? famName(r.family) : r[k] || '').toLowerCase();
  }
  function sorted(l) { return l.sort(function (a, b) { var x = sortKey(a, SORT.k), y = sortKey(b, SORT.k); return (x < y ? -1 : x > y ? 1 : String(a.title).localeCompare(b.title)) * SORT.dir; }); }
  function opts(list, val, all) { return '<option value="">' + all + '</option>' + list.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
  function filters(extra) {
    return '<div class="filters"><input id="iv-q" type="search" placeholder="Find (title, author, language, machine)" value="' + esc(F.q) + '">' +
      '<select id="iv-ffam">' + opts(FAMORDER.map(function (f) { return [f, famName(f)]; }), F.fam, 'Every family') + '</select>' +
      '<select id="iv-fst">' + opts((CAT.statuses || []).map(function (s) { return [s.id, s.id]; }), F.st, 'Every status') + '</select>' +
      '<select id="iv-fpub">' + opts([['files', 'Files published'], ['entry', 'Entry only']], F.pub, 'Published or not') + '</select>' + (extra || '') + '</div>';
  }
  function wireFilters(after) {
    $('#iv-q').oninput = function (e) { F.q = e.target.value; after(); var q = $('#iv-q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); };
    $('#iv-ffam').onchange = function (e) { F.fam = e.target.value; after(); }; $('#iv-fst').onchange = function (e) { F.st = e.target.value; after(); }; $('#iv-fpub').onchange = function (e) { F.pub = e.target.value; after(); };
  }
  function cell(v, k) {
    if (v == null) return '<td class="c unk">?</td>';
    if (k === 'delimit') return v === 'no BUT' ? '<td class="c no">no BUT</td>' : /BUT/.test(v) ? '<td class="c yes">' + esc(v) + '</td>' : '<td class="c">' + esc(v) + '</td>';
    if (typeof v === 'number' || typeof v === 'string') return '<td class="c">' + esc(v) + '</td>';
    return v ? '<td class="c yes">✓</td>' : '<td class="c no">✗</td>';
  }
  function list() {
    var l = sorted(filtered()), fs = feats();
    var cols = [['code', 'Code'], ['date', 'Date'], ['title', 'Title'], ['progLanguage', 'Language'], ['machine', 'Machine'], ['family', 'Family'], ['status', 'Status'], ['publish', 'Files']];
    var head = cols.map(function (c) { return '<th data-sort="' + c[0] + '">' + c[1] + (SORT.k === c[0] ? (SORT.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>'; }).join('') +
      (SHOWF ? fs.map(function (f) { return '<th data-sort="f:' + esc(f.id) + '" title="' + esc(f.note) + '">' + esc(f.label) + (SORT.k === 'f:' + f.id ? (SORT.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>'; }).join('') : '');
    $('#iv-main').innerHTML = filters('<button class="btn' + (SHOWF ? ' on' : '') + '" id="iv-tf">Features</button>') + '<table><thead><tr>' + head + '</tr></thead><tbody>' +
      l.map(function (r) {
        return '<tr class="row" data-code="' + esc(r.code) + '"><td class="mono">' + esc(r.code) + '</td><td>' + esc(r.date) + '</td><td>' + esc(r.title) + '</td><td>' + esc(r.progLanguage) + '</td><td>' + esc(r.machine) + '</td><td>' + dot(r.family) + esc(famName(r.family)) + '</td><td>' + chip(r.status) + '</td><td>' + (r.publish === 'files' ? 'published' : '<span class="unk">private</span>') + '</td>' +
          (SHOWF ? fs.map(function (f) { return cell((r.features || {})[f.id], f.id); }).join('') : '') + '</tr>';
      }).join('') + '</tbody></table>';
    $('#iv-count').textContent = l.length + ' of ' + CAT.items.length;
    wireFilters(list);
    $('#iv-tf').onclick = function () { SHOWF = !SHOWF; list(); };
    $$('th[data-sort]').forEach(function (th) { th.onclick = function () { var k = th.dataset.sort; SORT = { k: k, dir: SORT.k === k ? -SORT.dir : 1 }; list(); }; });
    rows();
  }
  function rows() { $$('[data-code]').forEach(function (el) { if (el.dataset.code) el.onclick = function () { pickOrOpen(el.dataset.code); }; }); }
  function pickOrOpen(code) {
    if (!BY[code]) return;
    if (PICK) { CMP[PICK] = code; PICK = null; go('compare'); return; }
    cur = code; go('read'); root.scrollTop = 0;
  }

  // ---------- Read ----------
  function nb(code, rel, conf, via, ev) {
    return '<div class="nb ' + esc(conf || 'established') + '" data-code="' + esc(BY[code] ? code : '') + '" title="' + esc(ev || '') + '">' + esc(label(code)) + '<small>' + esc([rel, via ? 'via ' + via : '', conf].filter(Boolean).join(' · ')) + '</small></div>';
  }
  function card(r, open) {
    var fs = feats();
    var fchips = fs.map(function (f) { var v = r.features ? r.features[f.id] : null; return '<span class="chip ' + fcls(v) + '" title="' + esc(f.note) + '">' + esc(f.label) + ' ' + esc(fval(v)) + '</span>'; }).join('');
    var parents = r.parents.map(function (p) { return nb(p.code, p.relation, p.confidence, p.via, p.evidence); }).join('') || '<div class="nb"><small>no declared parent</small></div>';
    var kids = (r.children || []).map(function (c) { var k = BY[c], p = k && k.parents.filter(function (x) { return x.code === r.code; })[0]; return nb(c, p && p.relation, p && p.confidence, p && p.via, p && p.evidence); }).join('') || '<div class="nb"><small>no known descendant</small></div>';
    var meta = [['Date', r.date + (r.dateBasis ? ' (' + r.dateBasis + ')' : '')], ['Author', r.creator], ['Language', r.progLanguage], ['Machine', r.machine], ['OS', r.os], ['Family', famName(r.family)],
      ['Runs on', (r.runsOn || []).map(label).join('; ')], ['Paratexts', (r.paratexts || []).join(', ')], ['Files', r.publish === 'files' ? 'published' + (r.clearance ? ' (' + r.clearance.basis + ')' : '') : 'held privately' + (r.heldAt && !/^(NEW:|private$)/.test(r.heldAt) ? ' at ' + r.heldAt : ', awaiting clearance')],
      ['Rights', r.rights], ['Source', r.source]].filter(function (x) { return x[1]; });
    return '<details class="card"' + (open ? ' open' : '') + '><summary><span class="mono">' + esc(r.code) + '</span><b>' + esc(r.title) + '</b>' + chip(r.status) + '</summary><div class="body">' +
      '<div class="grid">' + meta.map(function (m) { return '<div>' + esc(m[0]) + '</div><div>' + esc(m[1]) + '</div>'; }).join('') + '</div>' +
      '<div class="lineage"><div class="col">' + parents + '</div><div class="arrow">→</div><div class="self">' + esc(r.title) + '</div><div class="arrow">→</div><div class="col">' + kids + '</div></div>' +
      '<div class="feats">' + fchips + '</div><div class="desc">' + esc(r.description) + '</div></div></details>';
  }
  function emptyNote(r) {
    return r.heldAt ? (/^(NEW:|private$)/.test(r.heldAt) ? 'The project holds a copy of this file privately until its publication is cleared.' : 'File held privately: ' + esc(r.heldAt)) : r.status === 'printed' ? 'The program text is in print: ' + esc((r.paratexts || []).join(', ')) :
      r.status === 'linked' ? 'Held elsewhere: <a href="' + esc(r.archiveUrl || r.url || '') + '" target="_blank">' + esc(r.archiveUrl || r.url || '') + '</a>' : 'No copy is held.';
  }
  function showFile(el, f) {
    if (/^image\//.test(f.mime || '') || /\.(png|jpe?g|gif)$/i.test(f.name)) { el.innerHTML = '<img src="' + esc(f.url) + '" style="max-width:100%">'; return; }
    if (/pdf/.test(f.mime || '') || /\.pdf$/i.test(f.name)) { el.innerHTML = '<p class="held-privately"><a href="' + esc(f.url) + '" target="_blank">Open the PDF</a></p>'; return; }
    if (isText(f)) {
      fetch(f.url).then(function (x) { if (!x.ok) throw 0; return x.text(); }).then(function (t) { el.innerHTML = '<pre class="code">' + t.replace(/\r/g, '').split('\n').map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') + '</pre>'; }, function () { el.innerHTML = '<p class="held-privately">Could not read the file.</p>'; });
      return;
    }
    el.innerHTML = '<p class="held-privately">A binary file (' + esc(f.mime || f.name.split('.').pop()) + '). <a href="' + esc(f.url) + '" download>Download it</a>.</p>';
  }
  function source(r, id) {
    var files = filesOf(r);
    // alternates held privately (a carrier with other programs on it, say): named, with the paratext holding them
    var held = (r.alts || []).filter(function (a) { return !a.file && a.heldAt; });
    var heldHTML = held.map(function (a) { return '<span class="private" title="' + esc((a.mime || '') + (a.size ? ', ' + a.size + ' bytes' : '')) + '">' + esc(a.label || 'An alternate') + (/held privately/i.test(a.label || '') ? '' : ', held privately') + ': <a href="?code=' + esc(a.heldAt) + '">' + esc(a.heldAt) + '</a></span>'; }).join(' ');
    var html = '<div class="source"><div class="bar">' + (files.length ? files.map(function (f, i) { return '<button data-f="' + i + '"' + (i ? '' : ' class="on"') + '>' + esc(f.label) + '</button>'; }).join('') + (files[0].priv ? ' <span class="private">private copy, shown locally for testing; not published</span>' : '') : '<span class="unk">No file to show</span>') + (heldHTML ? ' ' + heldHTML : '') + '</div><div id="' + id + '"></div></div>';
    return { html: html, wire: function () {
      var el = root.querySelector('#' + id); if (!files.length) { el.innerHTML = '<p class="held-privately">' + emptyNote(r) + '</p>'; return; }
      var bar = el.previousElementSibling;
      [].forEach.call(bar.querySelectorAll('button'), function (b) { b.onclick = function () { [].forEach.call(bar.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); }); showFile(el, files[+b.dataset.f]); }; });
      showFile(el, files[0]);
    } };
  }
  function read() {
    var r = BY[cur];
    if (!r) { $('#iv-main').innerHTML = '<p class="empty">Choose an implementation in the List or the Tree.</p>'; $('#iv-count').textContent = ''; return; }
    var firstParent = r.parents.map(function (p) { return p.code; }).filter(function (c) { return BY[c]; })[0];
    var src = source(r, 'iv-src');
    $('#iv-main').innerHTML = card(r, true) + '<div class="actions">' + (firstParent ? '<button class="btn" id="iv-cmpp">Compare with its parent</button>' : '') + '<button class="btn" id="iv-cmpo">Compare with…</button></div>' + src.html;
    $('#iv-count').textContent = ''; rows(); src.wire();
    if (firstParent) $('#iv-cmpp').onclick = function () { CMP = { a: firstParent, b: r.code }; go('compare'); };
    $('#iv-cmpo').onclick = function () { CMP = { a: r.code, b: CMP.b && CMP.b !== r.code ? CMP.b : null }; go('compare'); };
  }

  // ---------- Tree ----------
  function tree() {
    var items = filtered();
    var years = items.map(year).filter(Boolean), y0 = Math.min.apply(null, years.concat([1964])) - 1, y1 = Math.max.apply(null, years.concat([2026])), PX = 34, LEFT = 170, W = LEFT + (y1 - y0 + 3) * PX + 240;
    var roots = []; items.forEach(function (r) { r.parents.forEach(function (p) { if (/^v:/.test(p.code) && roots.indexOf(p.code) < 0) roots.push(p.code); }); });
    var lanes = [{ id: 'variorum', name: 'The original (variorum)' }].concat(FAMORDER.map(function (f) { return { id: f, name: famName(f) }; }));
    var pos = {}, laneTop = {}, y = 30, ROW = 17;
    lanes.forEach(function (ln) {
      var rootYear = function (k) { var vm = vmap(k), vy = vm && String(vm.date || vm.label || '').match(/(1[89]\d\d|20\d\d)/); if (vy) return +vy[1]; var kids = items.filter(function (r) { return r.parents.some(function (p) { return p.code === k; }); }).map(year).filter(Boolean); return k === 'v:1965b' ? 1965 : k === 'v:1966' || k === 'v:doctor' ? 1966 : (kids.length ? Math.min.apply(null, kids) - 1 : y0); };
      var nodes = ln.id === 'variorum' ? roots.map(function (k) { return { code: k, yr: rootYear(k) }; }) : items.filter(function (r) { return r.family === ln.id; }).map(function (r) { return { code: r.code, yr: year(r) || y1 + 2 }; });
      nodes.sort(function (a, b) { return a.yr - b.yr; });
      var slots = []; laneTop[ln.id] = y;
      nodes.forEach(function (n) { var x = LEFT + (n.yr - y0) * PX, s = 0; while (slots[s] != null && slots[s] > x - 170) s++; slots[s] = x; pos[n.code] = { x: x, y: y + 14 + s * ROW }; });
      y += 22 + Math.max(1, slots.length) * ROW + 14; ln.h = y - laneTop[ln.id];
    });
    var H = y + 20, svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">';
    lanes.forEach(function (ln, i) { svg += '<rect x="0" y="' + laneTop[ln.id] + '" width="' + W + '" height="' + (ln.h - 6) + '" fill="' + (i % 2 ? 'var(--surface-2)' : 'transparent') + '" opacity="0.6"/><text x="8" y="' + (laneTop[ln.id] + 14) + '" style="font-weight:700">' + esc(ln.name) + '</text>'; });
    for (var yr = y0; yr <= y1; yr += 2) { var gx = LEFT + (yr - y0) * PX; svg += '<line x1="' + gx + '" y1="18" x2="' + gx + '" y2="' + H + '" stroke="var(--line)" stroke-width="0.5"/>' + (yr % 4 === 0 ? '<text x="' + (gx - 12) + '" y="13" style="fill:var(--faint)">' + yr + '</text>' : ''); }
    svg += '<text x="' + (LEFT + (y1 - y0 + 2) * PX - 10) + '" y="13" style="fill:var(--faint)">undated</text>';
    var DASH = { established: '', probable: '5,3', possible: '1.5,3' };
    items.forEach(function (r) {
      r.parents.forEach(function (p) {
        var a = pos[p.code], b = pos[r.code]; if (!a || !b) return; var mx = (a.x + b.x) / 2;
        svg += '<path d="M' + (a.x + 4) + ',' + a.y + ' C' + mx + ',' + a.y + ' ' + mx + ',' + b.y + ' ' + (b.x - 4) + ',' + b.y + '" fill="none" stroke="' + famColour(r.family) + '" stroke-width="1.4" stroke-dasharray="' + (DASH[p.confidence] || '') + '" opacity="' + (/^v:/.test(p.code) ? 0.22 : 0.8) + '"><title>' + esc(p.relation + (p.via ? ', via ' + p.via : '') + ' (' + p.confidence + '): ' + p.evidence) + '</title></path>';
      });
    });
    Object.keys(pos).forEach(function (c) {
      var r = BY[c], p = pos[c], st = r ? r.status : 'held', col = r ? famColour(r.family) : '#777', sel = c === CMP.a || c === CMP.b;
      var fill = st === 'held' ? col : 'var(--surface)', dash = st === 'lost' ? ' stroke-dasharray="2,2"' : st === 'attested' ? ' stroke-dasharray="1,1.5"' : '';
      var t = r ? String(r.title).replace(/\s*\((?:[^()]*)\)\s*$/, '').split(/,\s(?=(?:in|for|from|on|the)\b)/)[0] : label(c);
      svg += '<g data-code="' + esc(r ? c : '') + '" style="cursor:' + (r ? 'pointer' : 'default') + '"><title>' + esc(label(c) + (r ? ' · ' + r.date + ' · ' + r.status : '')) + '</title>' +
        (sel ? '<circle cx="' + p.x + '" cy="' + p.y + '" r="9" fill="none" stroke="var(--accent)" stroke-width="2"/>' : '') +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" fill="' + fill + '" stroke="' + col + '" stroke-width="2"' + dash + '/>' + (st === 'printed' ? '<circle cx="' + p.x + '" cy="' + p.y + '" r="2" fill="' + col + '"/>' : '') +
        '<text x="' + (p.x + 8) + '" y="' + (p.y + 4) + '">' + esc(t.length > 34 ? t.slice(0, 33) + '…' : t) + '</text></g>';
    });
    svg += '</svg>';
    $('#iv-main').innerHTML = filters() + (PICK ? '<p class="summary"><b>Choose side ' + PICK.toUpperCase() + ' for Compare:</b> click an implementation in the tree. <button class="btn" id="iv-cancelpick">Cancel</button></p>' : '') +
      '<div class="legend"><span><svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke="currentColor" stroke-width="1.5"/></svg> established</span><span><svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke="currentColor" stroke-dasharray="5,3" stroke-width="1.5"/></svg> probable</span><span><svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke="currentColor" stroke-dasharray="1.5,3" stroke-width="1.5"/></svg> possible</span>' +
      '<span>● held</span><span>◉ printed</span><span>○ attested, linked or lost</span><span>Hover an edge for its relation and evidence; click a node to read it.</span></div><div id="iv-tree">' + svg + '</div>';
    $('#iv-count').textContent = items.length + ' in the tree';
    wireFilters(tree); rows();
    if (PICK) $('#iv-cancelpick').onclick = function () { PICK = null; go('compare'); };
  }

  // ---------- Matrix: every implementation against the features, grouped by family ----------
  function matrix() {
    var fs = feats(), l = filtered().sort(function (a, b) { var fa = FAMORDER.indexOf(a.family), fb = FAMORDER.indexOf(b.family); return fa - fb || (year(a) || 9999) - (year(b) || 9999); });
    var known = function (r) { return fs.filter(function (f) { return (r.features || {})[f.id] != null; }).length; };
    var html = filters('<label class="note"><input type="checkbox" id="iv-onlyknown"' + (F.known ? ' checked' : '') + '> only rows with a feature read</label>') + '<table><thead><tr><th>Date</th><th>Implementation</th>' + fs.map(function (f) { return '<th class="c" title="' + esc(f.note) + '">' + esc(f.label) + '</th>'; }).join('') + '</tr></thead><tbody>', fam = null;
    l.filter(function (r) { return !F.known || known(r); }).forEach(function (r) {
      if (r.family !== fam) { fam = r.family; html += '<tr><td colspan="' + (fs.length + 2) + '" style="font-weight:700;padding-top:12px">' + dot(fam) + esc(famName(fam)) + '</td></tr>'; }
      html += '<tr class="row" data-code="' + esc(r.code) + '"><td>' + esc(r.date) + '</td><td>' + esc(r.title) + '</td>' + fs.map(function (f) { return cell((r.features || {})[f.id], f.id); }).join('') + '</tr>';
    });
    $('#iv-main').innerHTML = html + '</tbody></table>';
    $('#iv-count').textContent = l.length + ' rows';
    wireFilters(matrix); $('#iv-onlyknown').onchange = function (e) { F.known = e.target.checked; matrix(); }; rows();
  }

  // ---------- Compare ----------
  function lcsAlign(A, B) {
    var n = A.length, m = B.length, i, j, W = m + 1, L = new Uint16Array((n + 1) * (m + 1));
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i * W + j] = A[i] === B[j] ? L[(i + 1) * W + j + 1] + 1 : Math.max(L[(i + 1) * W + j], L[i * W + j + 1]);
    var out = []; i = 0; j = 0;
    while (i < n && j < m) { if (A[i] === B[j]) { out.push(['=', i++, j++]); } else if (L[(i + 1) * W + j] >= L[i * W + j + 1]) out.push(['a', i++, -1]); else out.push(['b', -1, j++]); }
    while (i < n) out.push(['a', i++, -1]); while (j < m) out.push(['b', -1, j++]);
    return out;
  }
  function norm(l) { return l.replace(/\s+/g, ' ').trim().toUpperCase(); }
  // top-level Lisp forms, keyed by the name they define. Two dialects: BBN-LISP and Interlisp (DEFINEQ; | is an ordinary
  // character; % escapes) and MIT's PDP-6 Lisp and Maclisp (DEFPROP … EXPR, DEFUN; |…| quotes a symbol; / escapes).
  // Definitions are compared as their tokens without parentheses, so DEFINEQ, DEFPROP … LAMBDA … EXPR and DEFUN line up.
  function topForms(text, bbn) {
    var forms = [], depth = 0, start = -1, i, c, inStr = false, inBar = false;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (inStr) { if (c === '"') inStr = false; continue; }
      if (inBar) { if (c === '|') inBar = false; continue; }
      if (c === ';' && !bbn) { while (i < text.length && text[i] !== '\n') i++; continue; }
      if ((c === '/' && !bbn) || (c === '%' && bbn)) { i++; continue; }
      if (c === '"') { var q = text.indexOf('"', i + 1), nl = text.indexOf('\n', i + 1); if (q > 0 && (nl < 0 || q < nl)) inStr = true; continue; }   // a quote opens a string only if it closes on the line (Maclisp readers may make " a letter)
      if (c === '|' && !bbn) { inBar = true; continue; }
      if (c === '(') { if (depth === 0) start = i; depth++; } else if (c === ')' && depth > 0) { depth--; if (depth === 0) forms.push(text.slice(start, i + 1)); }
    }
    return forms;
  }
  function toks(f) { return f.toUpperCase().replace(/"[^"]*"/g, ' STR ').replace(/[()]/g, ' $& ').split(/\s+/).filter(Boolean); }
  function lispForms(text) {
    var bbn = /\(\s*defineq\b/i.test(text), out = {}, n = 0;
    var add = function (name, t) { var body = t.filter(function (x) { return x !== '(' && x !== ')' && x !== 'EXPR' && x !== 'LAMBDA' && x !== 'DEFUN' && x !== 'DEFPROP'; }); if (!out[name]) out[name] = body; };
    topForms(text, bbn).forEach(function (f) {
      var t = toks(f), head = t[1];
      if (head === 'DEFINEQ') topForms(f.slice(f.indexOf('(') + 1, f.lastIndexOf(')')).replace(/^\s*defineq/i, ''), bbn).forEach(function (sub) { var u = toks(sub); add(u[1], u.slice(2)); });
      else if (/^(DEFPROP|DEFUN|DE|DF|DEFINE|DEFMACRO)$/.test(head)) {
        if (head === 'DEFPROP' && !(t[3] === '(' && t[4] === 'LAMBDA')) add(t[2] + ' ' + (t[t.length - 2] || ''), t.slice(3));
        else add(t[2], t.slice(3));
      } else add('(form ' + (++n) + ')', t);
    });
    return out;
  }
  function tokSim(a, b) {
    if (a.length * b.length > 4e6) return null;
    var m = b.length, prev = new Uint16Array(m + 1), curr = new Uint16Array(m + 1), i, j;
    for (i = 1; i <= a.length; i++) { for (j = 1; j <= m; j++) curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]); var t = prev; prev = curr; curr = t; }
    return 2 * prev[m] / (a.length + m);
  }
  function byFunction(la, lb) {
    var fa = lispForms(la), fb = lispForms(lb), names = Object.keys(fa).concat(Object.keys(fb).filter(function (k) { return !fa[k]; }));
    var named = names.filter(function (k) { return !/^\(form/.test(k); });
    var rowsH = named.map(function (k) {
      var a = fa[k], b = fb[k], s = a && b ? tokSim(a, b) : null, st = !a ? 'only in B' : !b ? 'only in A' : s === 1 ? 'identical' : 'changed';
      return { k: k, a: a, b: b, s: s, st: st };
    });
    var both = rowsH.filter(function (r) { return r.a && r.b; }), ident = both.filter(function (r) { return r.s === 1; });
    return { rows: rowsH, both: both.length, ident: ident.length, onlyA: rowsH.filter(function (r) { return !r.b; }).length, onlyB: rowsH.filter(function (r) { return !r.a; }).length };
  }
  function pickSide(side) {
    var r = BY[CMP[side]];
    return '<div class="side"><div class="t">' + side.toUpperCase() + ': ' + (r ? '<span class="mono">' + esc(r.code) + '</span> ' + esc(r.title) : '<span class="unk">not chosen</span>') + '</div>' +
      '<input list="iv-codes" data-side="' + side + '" placeholder="Type an I-code or a title" value="">' +
      '<div class="actions"><button class="btn" data-pick="' + side + '">Choose in the Tree</button>' + (r ? '<button class="btn" data-read="' + esc(r.code) + '">Read</button>' : '') + '</div></div>';
  }
  function compare() {
    var A = BY[CMP.a], B = BY[CMP.b], fs = feats();
    var html = '<datalist id="iv-codes">' + CAT.items.map(function (r) { return '<option value="' + esc(r.code + ' ' + r.title) + '">'; }).join('') + '</datalist>' +
      '<div class="cmp-pick">' + pickSide('a') + '<div class="mid"><button class="btn" id="iv-swap" title="Swap the sides">⇄</button></div>' + pickSide('b') + '</div>';
    if (A && B) {
      var diffs = 0;
      html += '<table class="ftab"><thead><tr><th>Feature</th><th>' + esc(A.code) + '</th><th>' + esc(B.code) + '</th></tr></thead><tbody>' + fs.map(function (f) {
        var va = (A.features || {})[f.id], vb = (B.features || {})[f.id], key = function (v) { return f.id === 'delimit' && v != null ? (/(^|[^O] )BUT|^BUT/.test(String(v)) && String(v) !== 'no BUT' ? 'BUT' : 'no BUT') : String(v); };
        var d = va != null && vb != null && key(va) !== key(vb); if (d) diffs++;
        return '<tr><td title="' + esc(f.note) + '">' + esc(f.label) + '</td><td class="' + (d ? 'd ' : '') + fcls(va) + '">' + esc(fval(va)) + '</td><td class="' + (d ? 'd ' : '') + fcls(vb) + '">' + esc(fval(vb)) + '</td></tr>';
      }).join('') + '</tbody></table><p class="summary">' + diffs + ' feature' + (diffs === 1 ? ' differs' : 's differ') + ' where both are known; ? is unread.</p><div id="iv-cmpbody"><p class="empty">Reading the two texts…</p></div>';
    } else html += '<p class="empty">Choose two implementations: type a code or title, choose one in the Tree, or open Compare from an entry in Read.</p>';
    $('#iv-main').innerHTML = html; $('#iv-count').textContent = '';
    $$('input[data-side]').forEach(function (inp) { inp.onchange = function () { var c = (inp.value.match(/[IP]-[0-9A-Z]{5}/) || [])[0]; if (c && BY[c]) { CMP[inp.dataset.side] = c; compare(); } }; });
    $$('[data-pick]').forEach(function (b) { b.onclick = function () { PICK = b.dataset.pick; go('tree'); }; });
    $$('[data-read]').forEach(function (b) { b.onclick = function () { cur = b.dataset.read; go('read'); }; });
    $('#iv-swap').onclick = function () { CMP = { a: CMP.b, b: CMP.a }; compare(); };
    if (!(A && B)) return;
    var ta = textFileOf(A), tb = textFileOf(B), same = ta && tb && langFam(A.progLanguage) === langFam(B.progLanguage);
    var body = $('#iv-cmpbody');
    if (!same) { parallel(body, A, B, ta || tb ? (ta && tb ? 'Different languages (' + (A.progLanguage || '?') + ' and ' + (B.progLanguage || '?') + '), so the two are shown side by side.' : 'Only one of the two has a text to read.') : 'Neither has a text to read.'); return; }
    Promise.all([ta, tb].map(function (f) { return fetch(f.url).then(function (x) { if (!x.ok) throw 0; return x.text(); }); })).then(function (tt) {
      var la = tt[0].replace(/\r/g, '').split('\n'), lb = tt[1].replace(/\r/g, '').split('\n');
      if (la.length * lb.length > 8e6) { parallel(body, A, B, 'The texts are too long to align line by line here, so they are shown side by side.'); return; }
      var fun = langFam(A.progLanguage) === 'lisp' ? byFunction(tt[0], tt[1]) : null;
      var al = lcsAlign(la.map(norm), lb.map(norm)), same = al.filter(function (x) { return x[0] === '='; }).length, oa = al.filter(function (x) { return x[0] === 'a'; }).length, ob = al.filter(function (x) { return x[0] === 'b'; }).length;
      var sim = Math.round(200 * same / (la.length + lb.length));
      body.innerHTML = '<p class="summary">' + esc(ta.name.split('/').pop()) + ' against ' + esc(tb.name.split('/').pop()) + ': <b>' + same + '</b> lines in common, ' + oa + ' only in A, ' + ob + ' only in B; similarity ' + sim + '% (lines compared without case or spacing). ' +
        (ta.priv || tb.priv ? '<span class="private">Includes a private copy, shown locally for testing.</span>' : '') + '</p>' +
        (fun && fun.rows.length ? '<h3 style="font-size:14px;margin:14px 0 4px">By function</h3><p class="summary"><b>' + fun.both + '</b> definitions in common, <b>' + fun.ident + '</b> identical as token sequences (DEFINEQ, DEFPROP and DEFUN read alike, parentheses ignored); ' + fun.onlyA + ' only in A, ' + fun.onlyB + ' only in B.</p>' +
          '<table class="ftab"><thead><tr><th>Definition</th><th>In A</th><th>In B</th><th>Similarity</th><th></th></tr></thead><tbody>' + fun.rows.map(function (r) {
            return '<tr><td class="mono">' + esc(r.k) + '</td><td class="c">' + (r.a ? r.a.length + ' tokens' : '<span class="unk">·</span>') + '</td><td class="c">' + (r.b ? r.b.length + ' tokens' : '<span class="unk">·</span>') + '</td><td class="c">' + (r.s == null ? '' : Math.round(r.s * 100) + '%') + '</td><td class="' + (r.st === 'identical' ? 'yes' : r.st === 'changed' ? '' : 'no') + '">' + esc(r.st) + '</td></tr>';
          }).join('') + '</tbody></table><h3 style="font-size:14px;margin:14px 0 4px">By line</h3>' : '') +
        '<p class="key"><span style="background:var(--onlyA)">only in A</span><span style="background:var(--onlyB)">only in B</span></p>' +
        '<div class="diffwrap"><table class="diff"><tbody>' + al.map(function (x) {
          var k = x[0] === '=' ? '' : x[0];
          return '<tr class="' + k + '"><td class="n">' + (x[1] >= 0 ? x[1] + 1 : '') + '</td><td class="ta">' + esc(x[1] >= 0 ? la[x[1]] : '') + '</td><td class="n">' + (x[2] >= 0 ? x[2] + 1 : '') + '</td><td class="tb">' + esc(x[2] >= 0 ? lb[x[2]] : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }, function () { parallel(body, A, B, 'One of the texts could not be read, so they are shown side by side.'); });
  }
  function parallel(body, A, B, why) {
    var sa = source(A, 'iv-srcA'), sb = source(B, 'iv-srcB');
    var cls = function (h, c) { return h.replace(/^<(details|div) class="/, '<$1 class="' + c + ' '); };
    body.innerHTML = '<p class="summary">' + esc(why) + '</p><div class="par">' + cls(card(A, false), 'a1') + cls(card(B, false), 'b1') + cls(sa.html, 'a2') + cls(sb.html, 'b2') + '</div>';
    rows(); sa.wire(); sb.wire();
  }

  // the view's state in the address, beside the bench's own (v, tab): iv the view, ic the entry read,
  // ia and ib the two compared, ifeat the feature columns, ifam and ist the filters
  function writeQ() {
    if (SW.state.tab !== 'implementations') return;
    SW.writeQuery({ iv: view !== 'list' ? view : null, ic: view === 'read' ? cur : null, ia: view === 'compare' ? CMP.a : null, ib: view === 'compare' ? CMP.b : null, ifeat: SHOWF ? 1 : null, ifam: F.fam || null, ist: F.st || null });
  }
  function go(v) {
    view = v; $$('.iv-nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    ({ list: list, read: read, tree: tree, matrix: matrix, compare: compare })[v]();
    var h = $('.iv-head'); if (h) root.style.setProperty('--iv-headh', h.offsetHeight + 'px');
    writeQ();
  }
  // the address as the page was opened, read before the shell rewrites it with v and tab alone
  var Q0 = SW.readQuery();
  var root = null, done = false, loading = null;
  function skeleton() {
    root = SW.$('#view-implementations');
    root.innerHTML = '<div class="iv-head"><span class="iv-title">Implementations</span><nav class="iv-nav"><button data-v="list" class="on">List</button><button data-v="read">Read</button><button data-v="tree">Tree</button><button data-v="matrix">Matrix</button><button data-v="compare">Compare</button></nav><span class="note" id="iv-count"></span></div>' +
      '<div class="iv-main" id="iv-main"><p class="empty">Loading…</p></div>' +
      '<footer id="iv-credit" class="note iv-credit">Many of the implementations here were collected and shared by <a href="http://shrager.org/" target="_blank" rel="noopener">Jeff Shrager</a> at <a href="https://elizagen.org/" target="_blank" rel="noopener">ELIZAGEN</a>, and are held with his permission.</footer>';
    $$('.iv-nav button').forEach(function (b) { b.onclick = function () { if (b.dataset.v !== 'tree') PICK = null; go(b.dataset.v); }; });
  }
  function load() {
    if (loading) return loading;
    loading = fetch(CATURL).then(function (r) { if (!r.ok) throw new Error('catalogue ' + r.status); return r.json(); }).then(function (c) {
      CAT = c; c.items.forEach(function (r) { BY[r.code] = r; r.parents = r.parents || []; });
      FAMORDER = (c.families || []).map(function (f) { return f.id; });
      c.items.forEach(function (r) { if (r.family && FAMORDER.indexOf(r.family) < 0) FAMORDER.push(r.family); });
      return c;
    });
    return loading;
  }
  // first showing: the skeleton, the catalogue, and the state the address carries
  function init() {
    skeleton(); done = true;
    var Q = Q0; Q0 = {};
    load().then(function () {
      if (Q.ic) cur = Q.ic; if (Q.ia) CMP.a = Q.ia; if (Q.ib) CMP.b = Q.ib;
      if (Q.ifeat) SHOWF = true; if (Q.ifam) F.fam = Q.ifam; if (Q.ist) F.st = Q.ist;
      go(['list', 'read', 'tree', 'matrix', 'compare'].indexOf(Q.iv) >= 0 ? Q.iv : 'list');
    }, function (e) { $('#iv-main').innerHTML = '<p class="empty">Could not load the catalogue: ' + esc(e.message || e) + '</p>'; });
  }
  SW.views.implementations = {
    show: function () { if (!done) init(); else writeQ(); },
    enter: function () { if (!done) init(); else writeQ(); }
  };
  // an entry by its I-code: the tab opened at Read
  SW.implementations = {
    open: function (code) {
      code = String(code || '').trim().toUpperCase();
      if (SW.state.tab !== 'implementations') SW.setTab('implementations');
      var then = function () { if (!BY[code]) { SW.toast(code + ' is not in the Implementations catalogue.', 5000); return; } PICK = null; cur = code; go('read'); root.scrollTop = 0; };
      if (!done) { init(); load().then(function () { setTimeout(then, 0); }); } else load().then(then);
    }
  };
  // Go to a code (# in the top bar, ?code= in a link) takes I-codes too
  if (SW.notes && SW.notes.goCode) {
    var goCode0 = SW.notes.goCode;
    SW.notes.goCode = function (code) { var c = String(code || '').trim().toUpperCase().replace(/^\[|\]$/g, ''); if (/^I-[0-9A-Z]{5}$/.test(c)) { SW.implementations.open(c); return; } return goCode0(code); };
  }
})(this);
