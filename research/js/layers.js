/*
 * layers.js - code in layers: texts that run on, or call, the texts below them (a script runs on
 * ELIZA, which calls SLIP), and a reader's way through them, after an IDE's: the stack (the
 * version chosen in each layer), names resolved down the stack, a definition peeked at and gone
 * to, a history to go back and forward through, a breadcrumb, and Read ▾, which lists each layer
 * and its versions. Written for the ELIZA bench and kept general for bench-kit: everything about
 * the bench comes from SW.BENCH.layers.
 *
 * SW.BENCH.layers:
 *   list   [{ id, label, below (the layer's id under it), relation ('runs on', 'calls'), start
 *          (the version first chosen), more ([[pick, label, text]]: Read ▾ items of the layer's
 *          own, as a catalogue), note }], top first. A version's layer is v.layer (else the first).
 *   forms  { layer: { FORM: { re (a pattern for the line of the layer below that handles it),
 *          what (what that line does), missing (said where no line matches) } } }: the words of
 *          a layer that the layer below acts on (a script's MEMORY, NONE, NEWKEY)
 *   pick(p)  a Read ▾ item of the bench's own (from more); true when handled
 * SW.layers: list(), byId(id), of(vid), stack(), choose(vid), below(id), chain(id), built(vid),
 *   pending(id) (the first layer below still being read, or null), above(id), callers(name, id)
 *   (where the layers above use a name this one defines),
 *   resolve(name, layer) -> { layer, v, b, s, p, n } of the first layer under it that defines the name
 *   (p, n: where it begins to run, where a definition is marked start, else its first),
 *   form(name, layer) -> { layer, v, b, p, n, what } or { missing }, peek(b, p, n, k) (HTML).
 * SW.nav: go({ v, p, n }), back(), forward(), the history of where Read has been.
 */
(function (root) {
  'use strict';
  var SW = root.SW, B = SW.BENCH, V = root.SWVersions, esc = SW.esc;
  function C() { return B.layers || { list: [] }; }
  function list() { return C().list || []; }
  function byId(id) { return list().filter(function (l) { return l.id === id; })[0] || null; }
  function of(vid) { var v = V.byId(vid); return (v && v.layer) || (list()[0] || {}).id; }
  function versionsOf(id) { return V.VERSIONS.filter(function (v) { return of(v.id) === id; }).sort(function (a, b) { return a.sort - b.sort; }); }
  function below(id) { var l = byId(id); return l && l.below ? byId(l.below) : null; }
  function chain(id) { var out = [], l = below(id); while (l && out.indexOf(l) < 0) { out.push(l); l = below(l.id); } return out; }

  // ---------- the stack: the version chosen in each layer ----------
  var stack = SW.store.get('layers.stack', {}) || {};
  list().forEach(function (l) {
    if (stack[l.id] && V.byId(stack[l.id])) return;
    var vs = versionsOf(l.id), held = vs.filter(function (v) { return v.build; });
    stack[l.id] = l.start || (held[0] || vs[0] || {}).id;
  });
  function choose(vid) { var l = of(vid); if (l && stack[l] !== vid) { stack[l] = vid; SW.store.set('layers.stack', stack); } }

  // builds of the layers below, loaded as a version is shown, for resolving names at once
  var builds = {};
  function built(vid) { return builds[vid] || null; }
  function load(vid) {
    var v = V.byId(vid); if (!v || !v.build) return Promise.resolve(null);
    if (builds[vid]) return Promise.resolve(builds[vid]);
    return SW.build(vid).then(function (b) { builds[vid] = b; return b; }, function () { return null; });
  }
  function preload(id) { return Promise.all(chain(id).map(function (l) { return load(stack[l.id]); })); }
  // the label of the first layer below still being read, or null
  function pending(id) {
    var ls = chain(id);
    for (var i = 0; i < ls.length; i++) { var v = V.byId(stack[ls[i].id]); if (v && v.build && !builds[v.id]) return ls[i].label + ' (' + v.label + ')'; }
    return null;
  }

  // ---------- resolving down the stack ----------
  function resolve(name, id) {
    var ls = chain(id);
    for (var i = 0; i < ls.length; i++) {
      var vid = stack[ls[i].id], b = built(vid), s = b && b.sym[name];
      if (s && s.defs.length) {
        // the place to go: where it begins to run, if the bench marks it, else its first definition
        var d = s.defs.filter(function (x) { return x.start; })[0] || s.defs[0];
        return { layer: ls[i], v: V.byId(vid), b: b, s: s, p: d.file, n: d.line };
      }
    }
    return null;
  }
  // the layers that run on or call this one, nearest first
  function above(id) { var out = []; list().forEach(function (l) { if (chain(l.id).some(function (x) { return x.id === id; })) out.push(l); }); return out.reverse(); }
  // where the layers above use a name this layer defines: [{ layer, v, b, refs }]
  function callers(name, id) {
    return above(id).map(function (l) {
      var v = V.byId(stack[l.id]), b = v && built(v.id), s = b && b.sym[name];
      return s && !s.defs.length && s.refs.length ? { layer: l, v: v, b: b, refs: s.refs } : null;
    }).filter(Boolean);
  }
  function form(name, id) {
    var F = (C().forms || {})[id] || {}, f = F[name], l = below(id);
    if (!f || !l) return null;
    var vid = stack[l.id], v = V.byId(vid), b = built(vid);
    if (!v || !v.build) return { missing: (v ? v.label : l.label) + ' does not survive, so what it does with ' + name + ' cannot be read.', layer: l, v: v };
    if (!b) return { loading: true, layer: l, v: v };
    if (f.re) for (var p = 0; p < b.lines.length; p++) for (var n = 0; n < b.lines[p].length; n++)
      if (f.re.test(b.lines[p][n].raw)) return { layer: l, v: v, b: b, p: p, n: n + 1, what: f.what };
    return { missing: f.missing || name + ' does not appear in ' + v.label + '’s code.', layer: l, v: v };
  }
  // a few lines from a definition, as an IDE's peek shows them
  function peek(b, p, n, k) {
    var ls = b.lines[p] || [], from = Math.max(0, n - 1), to = Math.min(ls.length, from + (k || 7));
    return '<pre class="mono layer-peek">' + ls.slice(from, to).map(function (L) { return esc(L.raw.replace(/\s+$/, '').slice(0, 72)); }).join('\n') + '</pre>';
  }
  function where(r) { return esc(r.layer.label) + ' · ' + esc(r.v.label) + ' · ' + esc(r.b.parts[r.p != null ? r.p : r.s.p].src.split('/').pop()) + ':' + (r.n != null ? r.n : r.s.n); }

  SW.layers = { list: list, byId: byId, of: of, versionsOf: versionsOf, stack: function () { return stack; }, choose: choose, below: below, chain: chain,
                above: above, callers: callers, built: built, load: load, preload: preload, pending: pending, resolve: resolve, form: form, peek: peek, where: where };

  // ---------- where Read has been: back and forward ----------
  var past = [], future = [];
  function here() { var s = SW.state.sel; return { v: SW.state.v, p: s ? s.p : null, n: s ? s.n0 : null }; }
  function open(t) {
    choose(t.v);
    if (t.p == null) { SW.select(t.v); SW.setTab('read'); return; }
    // a version newly opened is drawn where the listing was scrolled: it is kept out of sight until
    // it has been brought to the line
    var rv = document.getElementById('view-read'), moving = t.v !== SW.state.v;
    if (rv && moving) rv.classList.add('lay-moving');
    function shown() { if (rv) rv.classList.remove('lay-moving'); }
    SW.openAt(t.v, { p: t.p, n0: t.n, n1: t.n });
    var tries = 0;
    (function there() {
      if (SW.state.v !== t.v) return shown();
      var ctx = SW.readCtx, b = ctx && ctx.build && ctx.build(), el = document.getElementById('L' + t.p + '-' + t.n);
      if (b && b.v.id === t.v && el) {
        SW.readCtx.R.goto(t.p, t.n, true); SW.emit('goto', { p: t.p, n: t.n, tab: 'read' });
        requestAnimationFrame(shown);
        setTimeout(function () { if (SW.state.v === t.v) SW.emit('goto', { p: t.p, n: t.n, tab: 'read' }); }, 300);
        return;
      }
      if (++tries < 80) setTimeout(there, 25); else shown();
    })();
  }
  SW.nav = {
    go: function (t) { past.push(here()); future = []; open(t); paint(); },
    back: function () { if (!past.length) return; future.push(here()); open(past.pop()); paint(); },
    forward: function () { if (!future.length) return; past.push(here()); open(future.pop()); paint(); }
  };
  function label(t) { var v = V.byId(t.v); return (v ? v.label : t.v) + (t.n ? ', line ' + t.n : ''); }
  function paint() {
    var bk = SW.$('#lay-back'), fw = SW.$('#lay-fwd');
    if (bk) { bk.disabled = !past.length; bk.title = past.length ? 'Back to ' + label(past[past.length - 1]) + ' (Alt+←)' : 'Back (nowhere yet)'; }
    if (fw) { fw.disabled = !future.length; fw.title = future.length ? 'Forward to ' + label(future[future.length - 1]) + ' (Alt+→)' : 'Forward (nowhere yet)'; }
  }
  document.addEventListener('keydown', function (e) {
    if (!e.altKey || SW.state.tab !== 'read' || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName)) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); SW.nav.back(); } else if (e.key === 'ArrowRight') { e.preventDefault(); SW.nav.forward(); }
  });
  // a link down a layer, from a pop-up: data-xgo="version|file|line"
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-xgo]'); if (!a) return;
    e.preventDefault(); if (SW.unpop) SW.unpop();
    var x = a.dataset.xgo.split('|'); SW.nav.go({ v: x[0], p: +x[1], n: +x[2] });
  });

  // ---------- the breadcrumb: layer › version › file › deck › line ----------
  function crumbHTML() {
    var v = V.byId(SW.state.v); if (!v) return '';
    var l = byId(of(v.id)), s = SW.state.sel, b = built(v.id), bits = [];
    if (l) bits.push('<b title="' + esc(l.note || '') + '">' + esc(l.label) + '</b>');
    bits.push(esc(v.label));
    if (b && s && b.parts[s.p]) {
      var L = (b.lines[s.p] || [])[s.n0 - 1];
      bits.push(esc(b.parts[s.p].src.split('/').pop()));
      if (L && L.deck) bits.push('routine ' + esc(L.deck));
      bits.push('line ' + s.n0 + (s.n1 && s.n1 !== s.n0 ? '–' + s.n1 : ''));
    }
    var dn = l && below(l.id) ? ' <span class="faint">· ' + esc(l.relation || 'on') + ' ' + chain(l.id).map(function (x) { var w = V.byId(stack[x.id]); return esc(x.label) + (w ? ' (' + esc(w.label) + ')' : ''); }).join(' · ') + '</span>' : '';
    return bits.join(' <span class="faint">›</span> ') + dn;
  }
  function crumb() { var c = SW.$('#lay-crumb'); if (c) c.innerHTML = crumbHTML(); }
  SW.on('goto', function () { setTimeout(crumb, 0); });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#view-read')) setTimeout(crumb, 0); });

  // ---------- a jump straight down: the ↘ after a name the layer below defines ----------
  function jumpTo(name, from) {
    var r = resolve(name, from);
    if (r) { SW.nav.go({ v: r.v.id, p: r.p, n: r.n }); return; }
    var w = pending(from);
    if (w) { SW.toast('Reading ' + w + '…', 1500); preload(from).then(function () { var r2 = resolve(name, from); if (r2) SW.nav.go({ v: r2.v.id, p: r2.p, n: r2.n }); else SW.toast(name + ' is not defined in the layers below.'); }); return; }
    SW.toast(name + ' is not defined in the layers below.');
  }
  SW.layers.jumpTo = jumpTo;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-xjump]'); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    jumpTo(a.dataset.xjump, of(SW.state.v));
  }, true);
  // its hover names where it goes, once the layer below is read
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('[data-xjump]'); if (!a || a.dataset.told) return;
    var from = of(SW.state.v), r = resolve(a.dataset.xjump, from);
    if (r) { a.title = 'Jump to ' + a.dataset.xjump + ' in ' + r.layer.label + ': ' + r.b.parts[r.p].src.split('/').pop() + ', line ' + r.n; a.dataset.told = '1'; }
    else if (!pending(from)) { a.title = a.dataset.xjump + ' is not defined in the layers below'; a.classList.add('xjump-none'); a.dataset.told = '1'; }
  });

  // ---------- in Read: the toolbar's ◀ ▶ and the breadcrumb under it ----------
  SW.layers.toolbar = {
    html: function () { return '<span class="lay-nav"><button class="btn" id="lay-back" disabled>◀</button><button class="btn" id="lay-fwd" disabled>▶</button></span>'; },
    wire: function (tb) { SW.$('#lay-back', tb).onclick = SW.nav.back; SW.$('#lay-fwd', tb).onclick = SW.nav.forward; setTimeout(paint, 0); },
    // the breadcrumb as the toolbar's last row, so it stays in view as the listing scrolls
    after: function (view, b) { builds[b.v.id] = b; (SW.$('.toolbar', view) || view).appendChild(SW.el('div', { class: 'lay-crumb', id: 'lay-crumb' }, '')); setTimeout(crumb, 0); }
  };

  // ---------- Read ▾: each layer, and its versions ----------
  var M0 = B.menus || {};
  function readMenu() {
    return list().map(function (l, i) {
      var ws = versionsOf(l.id), cur = SW.state.v;
      return (i ? '<hr class="menu-rule">' : '') + '<div class="menu-group">' + esc(l.label) + (l.below ? ' · ' + esc(l.relation || 'on') + ' ' + esc((byId(l.below) || {}).label || '') : '') + '</div>' +
        ws.map(function (v) {
          return '<button data-pick="v:' + esc(v.id) + '"' + (v.id === cur ? ' class="on"' : '') + '><b>' + esc(v.label) + (stack[l.id] === v.id && v.id !== cur ? ' ·' : '') + '</b><span>' +
            esc(v.build ? (v.medium || 'held') : 'lost: known from the record') + '</span></button>';
        }).join('') +
        (l.more || []).map(function (m) { return '<button data-pick="' + esc(m[0]) + '"><b>' + esc(m[1]) + '</b><span>' + esc(m[2] || '') + '</span></button>'; }).join('');
    }).join('');
  }
  B.menus = Object.assign({}, M0, {
    menu: function (which) { return which === 'read' ? readMenu() : (M0.menu ? M0.menu(which) : null); },
    pick: function (which, p) {
      if (which === 'read') {
        if (/^v:/.test(p)) { var vid = p.slice(2); if (vid !== SW.state.v) SW.nav.go({ v: vid, p: null, n: null }); else SW.setTab('read'); return true; }
        if (C().pick && C().pick(p)) return true;
      }
      return M0.pick ? M0.pick(which, p) : false;
    },
    on: function (which, p) { return M0.on ? M0.on(which, p) : null; }
  });

  // ---------- the stack follows the version chosen; the layers below are read at once ----------
  // every layer of the stack is read as the page opens, so names resolve without waiting
  setTimeout(function () { list().forEach(function (l) { load(stack[l.id]); }); }, 0);
  var S = B.shell || (B.shell = {}), onSel = S.onSelect, q0 = S.query;
  S.onSelect = function (b) { choose(b.v.id); builds[b.v.id] = b; preload(of(b.v.id)).then(function () { crumb(); }); if (onSel) onSel(b); };
  // a link carries the stack: stack=version,version,… in the order of the layers
  S.query = function (q) {
    if (q.stack) q.stack.split(',').forEach(function (vid, i) { var l = list()[i]; if (l && vid && V.byId(vid) && of(vid) === l.id) stack[l.id] = vid; });
    if (q0) q0(q);
  };
  var wq = SW.writeQuery;
  SW.writeQuery = function (extra) { var x = Object.assign({}, extra || {}); x.stack = list().map(function (l) { return stack[l.id] || ''; }).join(','); return wq(x); };
})(typeof window !== 'undefined' ? window : globalThis);
