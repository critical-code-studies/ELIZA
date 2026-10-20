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
     '*setup       - Set-Up mode, as on a VT220 (also the F3 key or the',
     '               Set-Up key under the screen)',
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
    var PHOSPHORS = ['green', 'amber', 'white'];
    function phosphor() { var m = term.className.match(/theme-(\w+)/); return m ? m[1] : 'green'; }
    function setPhosphor(p) { term.className = term.className.replace(/theme-\w+/, 'theme-' + p); if (logo) logo.title = 'VT220, ' + p + ' screen (click to change)'; }
    var logo = null;
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
    // the chin: the maker's logo (a click changes the phosphor, as DEC sold the VT220 with a white,
    // green or amber screen), the model, the Set-Up key and the power lamp
    logo = el('button', 'vt-logo'); logo.type = 'button';
    'digital'.split('').forEach(function (ch) { logo.appendChild(el('span', '', ch)); });
    var chinL = el('span', 'vt-chin-l'); chinL.appendChild(logo); chinL.appendChild(el('span', 'vt-model', 'VT220'));
    chin.appendChild(chinL);
    var setupKey = el('button', 'vt-key', 'Set-Up');
    setupKey.type = 'button'; setupKey.title = 'Set-Up (F3)';
    var chinR = el('span', 'vt-chin-r'); chinR.appendChild(setupKey); chinR.appendChild(el('span', 'vt-led'));
    chin.appendChild(chinR);
    vt.appendChild(chin);
    container.appendChild(vt);
    container.appendChild(el('div', 'vt-stand'));

    function add(cls, text) { var l = el('div', 'l ' + cls, text); log.appendChild(l); log.scrollTop = log.scrollHeight; return l; }
    function bot(text) { add('bot', text); }
    // a reply arrives a character at a time at the receive speed (Comm Set-Up), as down a serial line
    function arrive(text, done) {
      var l = add('bot', ''), k = 0, rate = typeof cps === 'function' ? cps() : 480, t0 = performance.now();
      if (rate >= 960 || !text) { l.textContent = text; log.scrollTop = log.scrollHeight; done(); return; }
      (function tick() {
        var n = Math.min(text.length, Math.floor((performance.now() - t0) / 1000 * rate) + 1);
        if (n !== k) { k = n; l.textContent = text.slice(0, k); log.scrollTop = log.scrollHeight; }
        if (k < text.length) requestAnimationFrame(tick); else done();
      })();
    }
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
        case '*SETUP': enter(); return;
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

    // ---- Set-Up, after the VT220 Owner's Manual (DEC EK-VT220-UG-003, 1984, chapter 4). The Set-Up key
    // (F3 on the LK201 keyboard, or the key under this screen) puts the terminal in set-up: the screen's
    // text is hidden and a set-up screen takes the bottom third. Arrow keys move the reverse-video field
    // cursor, Enter performs an action field or steps a parameter field to its next value, Set-Up again
    // leaves. Fields that bear on this page take effect (On Line/Local, Clear Display, columns, wrap,
    // scroll, light or dark screen, cursor, the receive speed at which replies arrive, Save, Recall,
    // Default); the rest step through the manual's values as on the terminal.
    var setup = el('div', 'vt-setup'); setup.hidden = true; term.insertBefore(setup, inputWrap);
    function V(list, k) { return { list: list, k: k || 0 }; }
    var SPEEDS = ['75', '110', '150', '300', '600', '1200', '2400', '4800', '9600', '19200'];
    var DEF = function () { return {
      online: V(['On Line', 'Local']), lang: V(['Set-Up=English', 'Set-Up=Francais', 'Set-Up=Deutsch']),
      kbd: V(['North American Keyboard', 'British Keyboard', 'Flemish Keyboard', 'Canadian (French) Keyboard', 'Danish Keyboard', 'Finnish Keyboard', 'German Keyboard', 'Dutch Keyboard', 'Italian Keyboard', 'Swiss (French) Keyboard', 'Swiss (German) Keyboard', 'Swedish Keyboard', 'Norwegian Keyboard', 'French/Belgian Keyboard', 'Spanish Keyboard']),
      cols: V(['80 Columns', '132 Columns']), ctrl: V(['Interpret Controls', 'Display Controls']), wrap: V(['No Auto Wrap', 'Auto Wrap'], 1),
      scroll: V(['Smooth Scroll', 'Jump Scroll']), screen: V(['Light Text, Dark Screen', 'Dark Text, Light Screen']), cursor: V(['Cursor', 'No Cursor']), cstyle: V(['Block Cursor Style', 'Underline Cursor Style']),
      mode: V(['VT200 Mode, 7 Bit Controls', 'VT200 Mode, 8 Bit Controls', 'VT100 Mode', 'VT52 Mode']), id: V(['VT220 ID', 'VT100 ID', 'VT101 ID', 'VT102 ID']),
      udk: V(['User Defined Keys Unlocked', 'User Defined Keys Locked']), uf: V(['User Features Unlocked', 'User Features Locked']), cset: V(['Multinational', 'National']),
      keypad: V(['Numeric Keypad', 'Application Keypad']), ckeys: V(['Normal Cursor Keys', 'Application Cursor Keys']), nl: V(['No New Line', 'New Line']),
      tx: V(SPEEDS.map(function (x) { return 'Transmit=' + x; }), 7), rx: V(['Receive=Transmit'].concat(SPEEDS.map(function (x) { return 'Receive=' + x; }))),
      xoff: V(['XOFF at 64', 'XOFF at 128', 'No XOFF']), bits: V(['8 Bits, No Parity', '8 Bits, Even Parity', '8 Bits, Odd Parity', '7 Bits, Even Parity', '7 Bits, Odd Parity', '7 Bits, Mark Parity', '7 Bits, Space Parity']),
      stop: V(['1 Stop Bit', '2 Stop Bits']), echo: V(['No Local Echo', 'Local Echo']), port: V(['EIA Port, Data Leads Only', 'EIA Port, Modem Control', '20 mA Port']),
      disc: V(['Disconnect, 2 s Delay', 'Disconnect, 60 ms Delay']), limit: V(['Limited Transmit', 'Unlimited Transmit']),
      pspeed: V(SPEEDS.map(function (x) { return 'Speed=' + x; }), 7), pmode: V(['Normal Print Mode', 'Auto Print Mode', 'Printer Controller Mode']), pbits: V(['8 Bits, No Parity', '8 Bits, Even Parity', '8 Bits, Odd Parity', '7 Bits, Even Parity', '7 Bits, Odd Parity']),
      pstop: V(['1 Stop Bit', '2 Stop Bits']), ppage: V(['Print Full Page', 'Print Scrolling Region']), pnat: V(['Print National Only', 'Print All Characters']), pterm: V(['No Terminator', 'Terminator=FF']),
      keys: V(['Typewriter Keys', 'Data Processing Keys']), lock: V(['Caps Lock', 'Shift Lock']), rep: V(['Auto Repeat', 'No Auto Repeat']), click: V(['Keyclick', 'No Keyclick']),
      mbell: V(['Margin Bell', 'No Margin Bell']), wbell: V(['Warning Bell', 'No Warning Bell']), brk: V(['Break', 'No Break']), aab: V(['No Auto Answerback', 'Auto Answerback']), conceal: V(['Not Concealed', 'Concealed']),
      tabs: 8
    }; };
    var P = DEF(), KEY = 'eliza.vt220.setup', clearOnExit = false;
    function val(n) { return P[n].list[P[n].k]; }
    function step(n) { P[n].k = (P[n].k + 1) % P[n].list.length; effects(); }
    function effects() {
      term.classList.toggle('vt-132', P.cols.k === 1);
      term.classList.toggle('vt-wrap', P.wrap.k === 1);
      term.classList.toggle('vt-light', P.screen.k === 1);
      term.classList.toggle('vt-nocursor', P.cursor.k === 1);
      term.classList.toggle('vt-ucursor', P.cstyle.k === 1);
      log.style.scrollBehavior = P.scroll.k === 0 ? 'smooth' : 'auto';
    }
    // the speed at which ELIZA's replies arrive, in characters a second: a tenth of the receive rate
    // (ten bits a character with start and stop bits); Receive=Transmit takes the transmit rate
    function cps() { var r = P.rx.k === 0 ? SPEEDS[P.tx.k] : SPEEDS[P.rx.k - 1]; return (+r) / 10; }
    function store() { var o = {}; for (var n in P) if (P[n] && P[n].list) o[n] = P[n].k; o.tabs = P.tabs; o.phosphor = phosphor(); o.crt = term.classList.contains('crt'); return o; }
    function restore(o) { if (!o) return false; P = DEF(); for (var n in o) if (P[n] && P[n].list && o[n] < P[n].list.length) P[n].k = o[n]; if (o.tabs) P.tabs = o.tabs; if (o.phosphor) setPhosphor(o.phosphor); term.classList.toggle('crt', o.crt !== false); effects(); return true; }
    try { restore(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) {}
    function F(name, label, act) { return { name: name, label: label, act: act }; }
    function par(n) { return F(n, function () { return val(n); }, function () { step(n); }); }
    function to(sc) { return function () { go(sc); }; }
    var ORDER = ['display', 'general', 'comm', 'printer', 'keyboard', 'tab'];
    function next(sc) { return F('next', 'To Next Set-Up', function () { go(ORDER[(ORDER.indexOf(sc) + 1) % ORDER.length]); }); }
    var TODIR = F('dir', 'To Directory', to('dir'));
    var SCREENS = {
      dir: { title: 'Set-Up Directory', rows: [
        [F('d', 'Display', to('display')), F('g', 'General', to('general')), F('c', 'Comm', to('comm')), F('p', 'Printer', to('printer')), F('k', 'Keyboard', to('keyboard')), F('t', 'Tab', to('tab'))],
        [par('online'), F('cd', 'Clear Display', function () { clearOnExit = true; msg('Done'); }), F('cc', 'Clear Comm', function () { C.interrupt(); cacm = -1; msg('Done'); }),
         F('rt', 'Reset Terminal', function () { C.reset(); conversation = ''; traceText = ''; cacm = -1; msg('Done'); }),
         F('rc', 'Recall', function () { var o = null; try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} if (restore(o)) { clearOnExit = true; msg('Done'); } else msg('Nothing saved'); }),
         F('sv', 'Save', function () { try { localStorage.setItem(KEY, JSON.stringify(store())); msg('Done'); } catch (e) { msg('Not saved'); } })],
        [par('lang'), par('kbd'), F('df', 'Default', function () { var ph = 'green'; P = DEF(); setPhosphor(ph); term.classList.add('crt'); effects(); clearOnExit = true; msg('Done'); }), F('x', 'Exit', function () { leave(); })]] },
      display: { title: 'Display Set-Up', rows: [[next('display'), TODIR, par('cols'), par('ctrl')], [par('wrap'), par('scroll'), par('screen')], [par('cursor'), par('cstyle')]] },
      general: { title: 'General Set-Up', rows: [[next('general'), TODIR, par('mode'), par('id')], [par('udk'), par('uf'), par('cset')], [par('keypad'), par('ckeys'), par('nl')]] },
      comm: { title: 'Communications Set-Up', rows: [[next('comm'), TODIR, par('tx'), par('rx')], [par('xoff'), par('bits'), par('stop'), par('echo')], [par('port'), par('disc'), par('limit')]] },
      printer: { title: 'Printer Set-Up', rows: [[next('printer'), TODIR, par('pspeed')], [par('pmode'), par('pbits'), par('pstop')], [par('ppage'), par('pnat'), par('pterm')]] },
      keyboard: { title: 'Keyboard Set-Up', rows: [[next('keyboard'), TODIR, par('keys'), par('lock')], [par('rep'), par('click'), par('mbell'), par('wbell'), par('brk')], [par('aab'), F('ab', 'Answerback=', function () {}), par('conceal')]] },
      tab: { title: 'Tab Set-Up', rows: [[next('tab'), TODIR, F('ca', 'Clear All Tabs', function () { P.tabs = 0; }), F('s8', 'Set 8 Column Tabs', function () { P.tabs = 8; })]] }
    };
    var ST = { open: false, sc: 'dir', r: 0, c: 0 }, note = '';
    function msg(t) { note = t; if (ST.open) draw(); setTimeout(function () { if (note === t) { note = ''; if (ST.open) draw(); } }, 1500); }
    function lab(f) { return typeof f.label === 'function' ? f.label() : f.label; }
    function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function draw() {
      var S = SCREENS[ST.sc], h = '<div class="vt-hd"><span>' + esc(S.title) + '</span><span>VT220 V2.0</span></div>';
      S.rows.forEach(function (row, r) {
        h += '<div class="vt-row">' + row.map(function (f, c) { return '<span class="vt-f' + (r === ST.r && c === ST.c ? ' rev' : '') + '" data-r="' + r + '" data-c="' + c + '">' + esc(lab(f)) + '</span>'; }).join('') + '</div>';
      });
      if (ST.sc === 'tab') { var ruler = ''; for (var k = 1; k <= 80; k++) ruler += (P.tabs && k > 1 && (k - 1) % P.tabs === 0) ? 'T' : (k % 10 === 0 ? String(k / 10 % 10) : '.'); h += '<div class="vt-row vt-ruler">' + ruler + '</div>'; }
      var status = note || ('Replace Mode  Printer: None' + (P.port.k === 1 ? '  Modem: DSR, Connected' : '') + (P.online.k === 1 ? '  Local' : ''));
      h += '<div class="vt-status">' + esc(status) + '</div>';
      setup.innerHTML = h;
    }
    function go(sc) { ST.sc = sc; ST.r = 0; ST.c = 0; draw(); }
    function enter() { ST.open = true; ST.sc = 'dir'; ST.r = 0; ST.c = 0; setup.hidden = false; log.classList.add('vt-blank'); inputWrap.classList.add('vt-hidden'); term.classList.add('in-setup'); draw(); try { input.focus({ preventScroll: true }); } catch (e) {} }
    function leave() {
      ST.open = false; setup.hidden = true; log.classList.remove('vt-blank'); inputWrap.classList.remove('vt-hidden'); term.classList.remove('in-setup');
      if (clearOnExit) { log.innerHTML = ''; clearOnExit = false; }
      log.scrollTop = log.scrollHeight; try { input.focus({ preventScroll: true }); } catch (e) {}
    }
    function move(dr, dc) {
      var rows = SCREENS[ST.sc].rows;
      if (dc) { var n = rows[ST.r].length; ST.c += dc; if (ST.c >= n) { ST.r = (ST.r + 1) % rows.length; ST.c = 0; } else if (ST.c < 0) { ST.r = (ST.r + rows.length - 1) % rows.length; ST.c = rows[ST.r].length - 1; } }
      if (dr) { var x = (setup.querySelector('.vt-f.rev') || {}).offsetLeft || 0; ST.r = (ST.r + dr + rows.length) % rows.length; var best = 0, bd = 1e9; setup.querySelectorAll('.vt-f[data-r="' + ST.r + '"]').forEach(function (e) { var d = Math.abs(e.offsetLeft - x); if (d < bd) { bd = d; best = +e.dataset.c; } }); ST.c = best; }
    }
    function setupKeys(e) {
      if (e.key === 'F3' || e.key === 'Escape') leave();
      else if (e.key === 'ArrowRight' || e.key === 'Tab') move(0, 1);
      else if (e.key === 'ArrowLeft') move(0, -1);
      else if (e.key === 'ArrowDown') move(1, 0);
      else if (e.key === 'ArrowUp') move(-1, 0);
      else if (e.key === 'Enter') SCREENS[ST.sc].rows[ST.r][ST.c].act();
      else { e.preventDefault(); return; }   // in set-up the keyboard drives the fields only
      e.preventDefault(); if (ST.open) draw();
    }
    setup.addEventListener('click', function (e) { var f = e.target.closest('.vt-f'); e.stopPropagation(); if (!f) return; ST.r = +f.dataset.r; ST.c = +f.dataset.c; SCREENS[ST.sc].rows[ST.r][ST.c].act(); if (ST.open) draw(); });
    setupKey.addEventListener('click', function (e) { e.stopPropagation(); if (ST.open) leave(); else enter(); });
    logo.addEventListener('click', function (e) { e.stopPropagation(); var p = phosphor(), i = PHOSPHORS.indexOf(p); setPhosphor(PHOSPHORS[(i + 1) % PHOSPHORS.length]); });
    setPhosphor(phosphor());
    var online = function () { return P.online.k === 0; };

    function handle(raw) {
      if (busy) return;
      var text = raw.trim();
      if (!text) {
        if (cacm >= 0 && cacm < CACM.length) { input.value = CACM[cacm]; cacm += 2; }
        return;
      }
      usr(text);
      if (text.charAt(0) === '*') { command(text); return; }
      if (!online()) return;   // Local: what is typed goes to the screen only
      conversation += text + '\n'; traceText += text + '\n';
      busy = true;
      C.response(text).then(function (reply) {
        busy = false;
        traceText += C.traceText() + reply + '\n\n'; conversation += reply + '\n\n';
        if (C.traceMode() === 'auto') pre(C.traceText());
        busy = true;
        arrive(reply, function () {
          busy = false;
          if (cacm >= CACM.length) { sys('-- end of CACM conversation --'); cacm = -1; }
        });
      }, function () { busy = false; });
    }

    input.addEventListener('keydown', function (e) {
      if (ST.open) { setupKeys(e); return; }
      if (e.key === 'F3') { e.preventDefault(); enter(); return; }
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
