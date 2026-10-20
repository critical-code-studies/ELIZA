/* term.js - the live ELIZA terminal on the Try ELIZA page (mounts into
   #try-eliza-mount), driven by Anthony and Max Hay's engine (assets/eliza-hay.js)
   with their asterisk commands; and the hidden easter egg (type the letters
   e-l-i-z-a anywhere and Hay's page opens in an overlay; Esc closes it).
   Nothing leaves the browser. */
(function () {
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  var BANNER = [
    '-----------------------------------------------------------------',
    '      ELIZA -- A Computer Program for the Study of Natural',
    '         Language Communication Between Man and Machine',
    'DOCTOR script (c) 1966 Association for Computing Machinery, Inc.',
    'ELIZA implementation by Ant & Max Hay, 2023  (CC0 1.0) Pub Domain',
    '-----------------------------------------------------------------',
    'Type *help and press the Enter key to see a list of commands.'].join('\n');

  var HELP = [
    "ELIZA is configured with Joseph Weizenbaum's 1966 DOCTOR script. Type about your feelings and thoughts; make the sort of statements you might make to a psychiatrist in an initial psychiatric interview. When you wish a reply to what you have said, press the Enter key. We believe the reply you receive will be exactly the same as the original 1966 ELIZA/DOCTOR would have made.",
    "Your conversation is private to your machine; nothing you say is transmitted anywhere else. (But ELIZA/DOCTOR is not a real psychiatrist!)",
    "Commands have been added to this implementation that were not part of the original ELIZA. All of these commands begin with an asterisk. Type the command and then press the Enter key. For example, you can replace the DOCTOR script with your own using the *load command. The 'trace' referred to shows how ELIZA produced its reply and is best understood in conjunction with Weizenbaum's January 1966 Communications of the Association for Computing Machinery paper. The commands are:",
    ['*            - show a trace of the most recent reply',
     '**           - show the transformation rules used in the most recent reply',
     '*amber       - change display colour; also *black, *green, *white',
     "*cacm        - replay conversation from Weizenbaum's 1966 CACM paper",
     '*clear       - clear screen and conversation and trace logs',
     '*crt         - toggle "Cathode-Ray Tube" text-blur',
     '*fontsize    - show the current font size in pixels',
     '*fontsize N  - set the font size to N pixels',
     '*full        - toggle fullscreen mode',
     '*help        - show this list of commands',
     '*key         - show all keywords in the current script (with precedence)',
     '*key KEYWORD - show the rule for the given KEYWORD',
     '*load        - load an ELIZA script file (UTF-8 encoded) from disk (you',
     '               can download the DOCTOR script as an example with *savedoc)',
     '*maxtran N   - specify the maximum number of transformations (default 500),',
     '               0 means no limit (for limiting Turing machine operation;',
     '               also the Escape key will interrupt Turing machines)',
     '*reset       - restart ELIZA and clear conversation and trace logs',
     '*save        - save the current conversation to a text file',
     "*savedoc     - save Weizenbaum's 1966 DOCTOR script to a text file",
     '*savetrace   - save current conversation and trace to a text file',
     '*traceauto   - turn on tracing; trace shown for every exchange',
     "*traceon     - turn on tracing; enter '*' after an exchange to see trace",
     '*tracepre    - show only input sentence and currently active keyword',
     '               (for watching the operation of Turing machines)',
     '*traceoff    - turn off tracing',
     '*version     - show the version number of this implementation'].join('\n')];

  // a terminal on the page, after Anthony and Max Hay's (anthay.github.io/eliza.html, CC0):
  // the same banner, replies and asterisk commands, in a VT220-style housing
  function buildTerm(container, opts) {
    opts = opts || {};
    var C = window.ElizaHay.console(), CACM = window.ElizaHay.conversation;
    var vt = el('div', 'vt220');
    var term = el('div', 'eliza-term theme-green crt');
    var log = el('div', 'eliza-log');
    log.setAttribute('aria-live', 'polite');
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
    vt.appendChild(term);
    var chin = el('div', 'vt-chin');
    chin.appendChild(el('span', 'vt-badge', opts.title || 'ELIZA · DOCTOR · 1966'));
    chin.appendChild(el('span', 'vt-led'));
    vt.appendChild(chin);
    container.appendChild(vt);
    container.appendChild(el('div', 'vt-stand'));

    function add(cls, text) { var l = el('div', 'l ' + cls, text); log.appendChild(l); log.scrollTop = log.scrollHeight; return l; }
    function bot(text) { add('bot', text); }
    function usr(text) { add('usr', text); }
    function sys(text) { add('sys', text); }
    function pre(text) { add('sys pre', text); }

    var conversation = '', traceText = '', cacm = -1, busy = false;
    function start() { var h = C.hello(); pre(BANNER); bot(h); conversation = h + '\n\n'; traceText = conversation; }
    start();
    C.setTrace('on', function (t) { sys(t); });

    function save(content, name) {
      var a = document.createElement('a'), u = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
      a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
    }
    function load() {
      var f = document.createElement('input'); f.type = 'file';
      f.onchange = function () {
        var file = f.files[0]; if (!file) return;
        var fr = new FileReader();
        fr.onload = function () {
          sys("Loading '" + file.name + "'...");
          var st = C.load(fr.result);
          if (st === 'success') bot(C.hello()); else sys(st);
        };
        fr.onerror = function () { sys("Failed to load script file '" + file.name + "'."); };
        fr.readAsText(file);
      };
      f.click();
    }
    var THEMES = { '*AMBER': 'theme-amber', '*BLACK': 'theme-black', '*GREEN': 'theme-green', '*WHITE': 'theme-white' };
    function command(text) {
      var parts = text.trim().split(/\s+/), cmd = parts[0].toUpperCase();
      if (THEMES[cmd]) { term.className = term.className.replace(/theme-\w+/, THEMES[cmd]); return; }
      switch (cmd) {
        case '*CACM':
          sys("Replaying conversation from Weizenbaum's January 1966 CACM paper.\nPress Enter to see each exchange. Press Escape to exit replay mode.\n(Use * or *traceauto to see trace, ** to see transformation rules.)");
          cacm = 0; return;
        case '*CRT': term.classList.toggle('crt'); return;
        case '*FULL':
          if (document.fullscreenElement) document.exitFullscreen(); else if (vt.requestFullscreen) vt.requestFullscreen().catch(function () {});
          return;
        case '*FONTSIZE':
          if (parts.length === 1) { sys(String(Math.floor(parseFloat(getComputedStyle(log).fontSize)))); return; }
          var n = parseInt(parts[1], 10);
          if (parts.length > 2) sys("too many parameters; e.g. '*fontsize 24' sets 24 pixel font");
          else if (isNaN(n) || n < 1) sys("invalid number; e.g. '*fontsize 24' sets 24 pixel font");
          else term.style.fontSize = n + 'px';
          return;
        case '*SAVE': sys("saving conversation to 'conversation.txt'"); save(conversation, 'conversation.txt'); return;
        case '*SAVETRACE': sys("saving trace to 'conversation.txt'"); save(traceText, 'conversation.txt'); return;
        case '*SAVEDOC': sys("saving DOCTOR script to 'doctor.txt'"); save(C.doctorText(), 'doctor.txt'); return;
        case '*LOAD': load(); return;
        case '*':
        case '**':
          if (C.traceMode() === 'pre') sys('tracing disabled by *tracepre; re-enable it with *traceon or *traceauto');
          else if (C.traceMode() === 'off') sys('tracing disabled; re-enable it with *traceon or *traceauto');
          else pre(cmd === '*' ? C.traceText() : C.traceScript());
          return;
        case '*TRACEAUTO': C.setTrace('auto'); sys('tracing enabled'); return;
        case '*TRACEON': C.setTrace('on'); sys('tracing enabled'); return;
        case '*TRACEOFF': C.setTrace('off'); sys('tracing disabled'); return;
        case '*TRACEPRE': C.setTrace('pre'); sys('minimal pre-transformation tracing enabled'); return;
        case '*MAXTRAN':
          if (parts.length === 2) {
            var m = parseInt(parts[1], 10);
            if (isNaN(m) || m < 0) sys("missing or invalid number; e.g. '*maxtran 500' limits ELIZA to 500 transformations");
            else C.maxtran(m);
          }
          sys(C.maxtran() === 0 ? '0 (unlimited transformations)' : String(C.maxtran()));
          return;
        case '*VERSION': sys(window.ElizaHay.VERSION); return;
        case '*KEY':
          if (parts.length === 2) { var r = C.key(parts[1]); if (r) pre(r); else sys("No '" + parts[1].toUpperCase() + "' keyword in current script"); return; }
          var ks = C.keys();
          pre(ks.map(function (k) { return (k[0] < 10 ? ' ' : '') + k[0] + ' ' + k[1]; }).join('\n') + '\n(' + ks.length + ' keywords, plus MEMORY and NONE)');
          return;
        case '*CLEAR': log.innerHTML = ''; conversation = ''; traceText = ''; return;
        case '*RESET':
          log.innerHTML = ''; cacm = -1;
          var st = C.reset();
          if (st === 'success') { bot(C.hello()); conversation = C.hello() + '\n\n'; traceText = conversation; } else sys(st);
          return;
        case '*HELP': HELP.forEach(function (h, k) { if (k === HELP.length - 1) pre(h); else sys(h); }); return;
      }
      sys('Unknown command - type *help to see commands');
    }

    function handle(raw) {
      if (busy) return;
      var text = raw.trim();
      if (!text) {
        if (cacm >= 0 && cacm < CACM.length) { input.value = CACM[cacm]; cacm += 2; }
        return;
      }
      usr(text);
      if (text.charAt(0) === '*') { command(text); return; }
      conversation += text + '\n'; traceText += text + '\n';
      busy = true;
      C.response(text).then(function (reply) {
        busy = false;
        traceText += C.traceText() + reply + '\n\n'; conversation += reply + '\n\n';
        if (C.traceMode() === 'auto') pre(C.traceText());
        bot(reply);
        if (cacm >= CACM.length) { sys('-- end of CACM conversation --'); cacm = -1; }
      }, function () { busy = false; });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var v = input.value; input.value = ''; handle(v); }
      else if (e.key === 'Escape') {
        C.interrupt();
        if (cacm >= 0) { cacm = -1; sys('-- CACM conversation interrupted --'); }
      }
    });
    // a tap anywhere in the terminal focuses the input (and opens the keyboard on a phone)
    term.addEventListener('click', function () { if (!window.getSelection || !String(window.getSelection())) try { input.focus(); } catch (e) {} });
    setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 50);
    return { focus: function () { input.focus(); } };
  }

  // ---- mount the Try ELIZA terminal, if present ----
  function initTryPage() {
    var mount = document.getElementById('try-eliza-mount');
    if (!mount) return;
    if (window.ElizaHay) buildTerm(mount, {});
    else setTimeout(initTryPage, 40);   // wait for the deferred eliza-hay.js to load
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
    // give focus to the ELIZA panel so you can type straight away
    function focusFrame() { try { frame.focus(); if (frame.contentWindow) frame.contentWindow.focus(); } catch (e) {} }
    frame.addEventListener('load', focusFrame);
    setTimeout(focusFrame, 250);
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
