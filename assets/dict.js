/* dict.js - the DOCTOR dictionary. A searchable index of every keyword in the
   1966 DOCTOR script: type to filter the keyword list, click a keyword to read
   its transformation rules (decomposition patterns and reassembly templates).
   The full script is listed below. All data comes from the authoritative engine
   (assets/eliza-hay.js) via window.ElizaHay.dictionary() / .scriptText. */
(function () {
  function init() {
    var app = document.getElementById('dict-app');
    if (!app || !window.ElizaHay) return;
    function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

    var entries = window.ElizaHay.dictionary();
    var byName = {};
    entries.forEach(function (e) { byName[e.keyword] = e; });

    // ---- search bar -------------------------------------------------------
    var bar = el('div', 'dict-bar');
    var input = el('input', 'dict-input');
    input.type = 'text'; input.placeholder = 'Filter keywords, e.g. MOTHER, ALIKE, DREAM';
    input.setAttribute('aria-label', 'Filter the DOCTOR keyword list');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('spellcheck', 'false');
    var count = el('span', 'dict-count', '');
    bar.appendChild(input); bar.appendChild(count); app.appendChild(bar);

    // ---- keyword list -----------------------------------------------------
    var listWrap = el('div', 'dict-list'); app.appendChild(listWrap);
    var detail = el('div', 'dict-detail'); detail.setAttribute('aria-live', 'polite'); app.appendChild(detail);

    var selected = null;

    function badge(text, cls) { return el('span', 'dict-badge' + (cls ? ' ' + cls : ''), esc(text)); }

    function renderDetail(name) {
      var e = byName[name];
      detail.innerHTML = '';
      if (!e) return;
      var card = el('div', 'dict-card');
      var head = el('div', 'dict-card-head');
      head.appendChild(el('span', 'dict-kw', esc(e.keyword)));
      if (e.precedence != null && e.precedence > 0) head.appendChild(badge('rank ' + e.precedence, 'rank'));
      if (e.isMemory) head.appendChild(badge('memory rule', 'mem'));
      if (e.substitution) head.appendChild(badge(e.keyword + ' → ' + e.substitution, 'sub'));
      (e.tags || []).forEach(function (t) { head.appendChild(badge('/' + t, 'tag')); });
      card.appendChild(head);

      // a short plain-language gloss of what kind of rule this is
      var note = '';
      if (e.isMemory) note = 'A special rule. When you mention something that is &ldquo;yours&rdquo; it stores a transformed copy, to be replayed later. It is keyed off the <b>' + esc(e.memoryKeyword) + '</b> keyword.';
      else if (e.link && !e.transforms.length) note = 'Carries no replies of its own. It is a pointer into the equivalence class <b>' + esc(e.link) + '</b>: ELIZA substitutes <b>' + esc(e.link) + '</b> and uses its rules instead.';
      else if (e.substitution && !e.transforms.length) note = 'A pure word substitution: every <b>' + esc(e.keyword) + '</b> is rewritten as <b>' + esc(e.substitution) + '</b> before the sentence is matched, with no rules of its own.';
      else if ((e.tags || []).length && !e.transforms.length && !e.link) note = 'A dictionary-list member. It carries no rules of its own; it is tagged so other keywords can match it by category (for example a pattern like <code>(/FAMILY)</code> matches any word on the FAMILY list).';
      if (note) {
        var p = el('p', 'dict-note', note);
        card.appendChild(p);
        // make a bare equivalence pointer clickable through to its target
        if (e.link && !e.transforms.length && byName[e.link]) {
          var jp = el('p', 'dict-note');
          var jb = el('button', 'dict-jump', '→ read ' + esc(e.link));
          jb.addEventListener('click', function () { select(e.link); });
          jp.appendChild(jb);
          card.appendChild(jp);
        }
      }

      // each transform: decomposition pattern + reassembly templates
      e.transforms.forEach(function (t, i) {
        var grp = el('div', 'dict-rule');
        grp.appendChild(el('div', 'dict-rule-lab', e.transforms.length > 1 ? ('Rule ' + (i + 1)) : 'Rule'));
        grp.appendChild(el('div', 'dict-decomp', '<span class="dict-rl">decompose</span> <code>' + esc(t.decomposition) + '</code>'));
        if (t.reassembly && t.reassembly.length) {
          var ul = el('ul', 'dict-reasm');
          t.reassembly.forEach(function (rr) {
            var link = /^=\s*([A-Z'\-]+)$/.exec(rr);
            if (link && byName[link[1]]) {
              var li = el('li', 'is-link');
              var b = el('button', 'dict-jump', '→ ' + esc(link[1]));
              b.addEventListener('click', function () { select(link[1]); });
              li.appendChild(el('span', 'dict-rl', 'defer'));
              li.appendChild(b);
              ul.appendChild(li);
            } else {
              ul.appendChild(el('li', null, esc(rr)));
            }
          });
          grp.appendChild(ul);
        }
        card.appendChild(grp);
      });

      // the raw rule, faint
      if (e.sexp) {
        var det = el('details', 'dict-raw');
        det.open = true;
        det.appendChild(el('summary', null, 'Raw rule'));
        det.appendChild(el('pre', 'listing', esc(e.sexp)));
        card.appendChild(det);
      }
      detail.appendChild(card);
    }

    function select(name) {
      selected = name;
      [].forEach.call(listWrap.querySelectorAll('.dict-key'), function (b) {
        b.classList.toggle('on', b.getAttribute('data-kw') === name);
      });
      renderDetail(name);
      detail.scrollIntoView({ block: 'nearest' });
    }

    function renderList(filter) {
      listWrap.innerHTML = '';
      var f = (filter || '').trim().toUpperCase();
      var shown = 0;
      entries.forEach(function (e) {
        if (f && e.keyword.indexOf(f) === -1) return;
        shown++;
        var b = el('button', 'dict-key' + (e.keyword === selected ? ' on' : ''), esc(e.keyword));
        b.setAttribute('data-kw', e.keyword);
        if (e.link && !e.transforms.length) b.appendChild(el('span', 'dict-key-mark', '→'));
        else if (e.substitution && !e.transforms.length) b.appendChild(el('span', 'dict-key-mark', '='));
        b.addEventListener('click', function () { select(e.keyword); });
        listWrap.appendChild(b);
      });
      count.textContent = shown + ' / ' + entries.length + ' keywords';
      if (f && shown === 1) select(listWrap.querySelector('.dict-key').getAttribute('data-kw'));
    }

    input.addEventListener('input', function () { renderList(input.value); });
    renderList('');

    // ---- full script listing ---------------------------------------------
    var listingHost = document.getElementById('dict-script');
    if (listingHost && window.ElizaHay.scriptText) {
      var pre = el('pre', 'listing'); pre.textContent = window.ElizaHay.scriptText.trim();
      listingHost.appendChild(pre);
    }
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
