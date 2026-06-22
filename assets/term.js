/* term.js - the live ELIZA terminal, driven by assets/eliza.js. Used in two
   places: the Try ELIZA page (mounts into #try-eliza-mount) and the hidden
   easter egg (type the letters e-l-i-z-a anywhere and the DOCTOR wakes in an
   overlay; Esc closes it). Nothing leaves the browser. A few of the original
   asterisk commands are supported: *help, *clear, *key. */
(function () {
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function buildTerm(container, opts) {
    opts = opts || {};
    var engine = window.ELIZA.make();
    var term = el('div', 'eliza-term');

    var bar = el('div', 'bar');
    bar.appendChild(el('span', 'dot'));
    bar.appendChild(el('span', 'dot a'));
    bar.appendChild(el('span', 'dot g'));
    bar.appendChild(el('span', 'ttl', opts.title || 'ELIZA · DOCTOR · CTSS (emulated)'));
    term.appendChild(bar);

    var log = el('div', 'eliza-log');
    term.appendChild(log);

    var inputWrap = el('div', 'eliza-input');
    inputWrap.appendChild(el('span', 'prompt', '>'));
    var input = el('input');
    input.setAttribute('type', 'text');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', 'Type to ELIZA');
    input.placeholder = 'type and press enter…';
    inputWrap.appendChild(input);
    term.appendChild(inputWrap);

    container.appendChild(term);

    function add(cls, text) { var l = el('div', 'l ' + cls, text); log.appendChild(l); log.scrollTop = log.scrollHeight; return l; }
    function bot(text) { add('bot', text); }
    function usr(text) { add('usr', text); }
    function sys(text) { add('sys', text); }

    bot(engine.greeting());

    function handle(raw) {
      var text = raw.trim();
      if (!text) return;
      usr(text);
      var low = text.toLowerCase();
      if (low === '*help') { sys('commands: *help  *clear  *key  (everything else is spoken to the DOCTOR)'); return; }
      if (low === '*clear') { log.innerHTML = ''; bot(engine.greeting()); return; }
      if (low === '*key') { sys('keywords: ' + engine.keywords().join(' ')); return; }
      bot(engine.reply(text));
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var v = input.value; input.value = ''; handle(v); }
    });
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 50);
    return { focus: function () { input.focus(); } };
  }

  // ---- mount the Try ELIZA terminal, if present ----
  function initTryPage() {
    var mount = document.getElementById('try-eliza-mount');
    if (mount && window.ELIZA) buildTerm(mount, {});
  }

  // ---- the easter egg: type "eliza" anywhere to summon ELIZA (Anthony Hay's) ----
  var SECRET = 'eliza', buf = '', open = false;
  var HAY = 'https://anthay.github.io/eliza.html';
  function openEgg() {
    if (open) return;
    open = true;
    var overlay = el('div', 'egg-overlay');
    var close = el('button', 'egg-close', 'Esc ×');
    overlay.appendChild(close);
    var holder = el('div', 'egg-embed');
    var frame = el('iframe');
    frame.src = HAY; frame.title = 'ELIZA'; frame.setAttribute('loading', 'lazy');
    holder.appendChild(frame);
    overlay.appendChild(holder);
    document.body.appendChild(overlay);
    function shut() { if (!open) return; open = false; overlay.remove(); }
    close.addEventListener('click', shut);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) shut(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { shut(); document.removeEventListener('keydown', esc); }
    });
  }

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;     // don't capture while typing in a field
    if (e.key && e.key.length === 1 && /[a-z]/i.test(e.key)) {
      buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
      if (buf === SECRET) { buf = ''; openEgg(); }
    }
  });

  if (document.readyState !== 'loading') initTryPage();
  else document.addEventListener('DOMContentLoaded', initTryPage);
})();
