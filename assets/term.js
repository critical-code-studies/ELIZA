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
     '*tty, *vt220 - switch to a Teletype Model 33 ASR or back to the VT220',
     '*traceauto   - turn on tracing; trace shown for every exchange',
     "*traceon     - turn on tracing; enter '*' after an exchange to see trace",
     '*tracepre    - show only input sentence and currently active keyword',
     '               (for watching the operation of Turing machines)',
     '*traceoff    - turn off tracing',
     '*version     - show the version number of this implementation'].join('\n')];

  // ---- sound, synthesized (Web Audio; no recordings): a Teletype Model 33's typebar strike for each
  // character, the carriage return and line feed at each line's end, and the motor's hum while it runs;
  // the VT220 keyboard's click. Off until asked for, and only after a click or key (browsers require it).
  var Sound = (function () {
    var ctx = null, noise = null, hum = null;
    function ac() {
      if (!ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); }
      if (ctx.state === 'suspended') ctx.resume();
      if (!noise) { var n = ctx.sampleRate * 0.5, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; noise = b; }
      return ctx;
    }
    function burst(t, dur, f, q, vol, sweepTo) {
      var c = ctx, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
      src.buffer = noise; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); bp.Q.value = q;
      if (sweepTo) bp.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(c.destination); src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
    }
    function thump(t, f, dur, vol) {
      var c = ctx, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      // one character printed: the recorded keypress from ELIZA33 (Shrager, Hay and Armel), else a synthesized strike
      sample: null,
      load: function (url) {
        var self = this; if (self.sample || !ac() || !window.fetch) return;
        fetch(url).then(function (r) { return r.arrayBuffer(); }).then(function (b) { return ctx.decodeAudioData(b); }).then(function (buf) { self.sample = buf; }, function () {});
      },
      strike: function () {
        if (!ac()) return;
        if (this.sample) { var src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = this.sample; src.playbackRate.value = 0.94 + Math.random() * 0.12; g.gain.value = 0.55; src.connect(g); g.connect(ctx.destination); src.start(); return; }
        var t = ctx.currentTime; burst(t, 0.035, 2200 + Math.random() * 1600, 1.4, 0.22); thump(t, 140 + Math.random() * 30, 0.04, 0.18); },
      // end of a line: the carriage runs back and the platen ratchets the paper up a line
      newline: function () { if (!ac()) return; var t = ctx.currentTime; burst(t, 0.22, 500, 0.9, 0.12, 1600); thump(t + 0.2, 90, 0.08, 0.28); burst(t + 0.24, 0.05, 1200, 2, 0.12); },
      // the VT220's keyclick
      click: function () { if (!ac()) return; var t = ctx.currentTime; burst(t, 0.012, 3800, 3, 0.12); },
      hum: function (on) {
        if (!on) { if (hum) { try { hum.stop(); } catch (e) {} hum = null; } return; }
        if (hum || !ac()) return;
        var src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), o = ctx.createOscillator(), og = ctx.createGain();
        src.buffer = noise; src.loop = true; lp.type = 'lowpass'; lp.frequency.value = 220; g.gain.value = 0.035;
        o.type = 'triangle'; o.frequency.value = 58; og.gain.value = 0.012;
        src.connect(lp); lp.connect(g); g.connect(ctx.destination); o.connect(og); og.connect(ctx.destination);
        src.start(); o.start();
        hum = { stop: function () { src.stop(); o.stop(); } };
      }
    };
  })();

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
    // in Teletype mode the chin carries the machine's nameplate in place of the logo and Set-Up key
    var plate = el('span', 'tty-plate', 'TELETYPE  MODEL 33 ASR');
    chinL.appendChild(plate);
    vt.appendChild(chin);
    // the switch between the two machines: the VT220 video terminal (1983) and the Teletype Model 33
    // ASR (1963), the kind of printing terminal on which ELIZA's conversations were typed
    var sw = el('div', 'term-switch'); sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Terminal');
    // the machines, oldest first, each with a kind of ELIZA that ran on such a machine; the replies on
    // every one are Weizenbaum's 1966 DOCTOR, through Hay's engine
    var DEVICES = [
      { id: 'tty', short: 'Teletype 33', year: '1963', name: 'Teletype Model 33 ASR', note: 'A printing terminal of the kind on which ELIZA was used at MIT on the CTSS time-sharing system, ten characters a second on roll paper.' },
      { id: 'pet', short: 'PET 2001', year: '1977', name: 'Commodore PET 2001', prompt: '?', label: 'PET 2001', note: 'Forty columns in capitals and graphics. Creative Computing sold its BASIC ELIZA, by Jeff Shrager and Steve North, for the PET on cassette (CS-1006).' },
      { id: 'vt220', short: 'VT220', year: '1983', name: 'DEC VT220', prompt: '>', note: 'A video terminal of the time-sharing years, when DOCTOR ran in Maclisp, Franz Lisp and GNU Emacs on PDP-10s and VAXes.' },
      { id: 'dos', short: 'IBM PC', year: '1991', name: 'IBM PC, MS-DOS', prompt: '>', label: 'PC  MS-DOS 5.00', note: 'Eighty columns of grey on black. The Software Toolworks\u2019 ELIZA, by Walt Bilofsky, ran on the IBM PC from 1982.' },
      { id: 'imac', short: 'iMac G3', year: '1998', name: 'Apple iMac G3', placeholder: '', note: 'A Mac OS 8 desktop on the iMac\u2019s fifteen-inch screen, with ELIZA as a HyperCard stack. ELIZAs ran on Macs as HyperCard stacks (HyperCard came with every Mac); the Implementations archive lists one by Bellina, undated.' },
      { id: 'im', short: 'Messenger', year: '2001', name: 'Instant messenger', title: 'ELIZA - Instant Message', placeholder: 'Type a message', note: 'Chatbots such as SmarterChild answered on AOL Instant Messenger and MSN Messenger from 2001.' },
      { id: 'web', short: 'Web chat', year: '2016', name: 'Web chat', title: 'ELIZA', placeholder: 'Write a message\u2026', note: 'The chatbot in the corner of a web page, the year Facebook opened Messenger to bots.' },
      { id: 'llm', short: 'AI chat', year: '2023', name: 'AI chat', title: 'ELIZA', placeholder: '\u21b5 to send', note: 'The chat window of the large language model, after ChatGPT (November 2022).' }
    ];
    var DEV = {}, devBtns = {}, tl = el('div', 'tl'); sw.appendChild(tl);
    DEVICES.forEach(function (d) {
      DEV[d.id] = d;
      var b = el('button', 'tl-stop'); b.type = 'button'; b.title = d.year + ', ' + d.name;
      b.innerHTML = '<b>' + d.year + '</b><span>' + d.short + '</span>';
      b.addEventListener('click', function () { setDevice(d.id); try { input.focus({ preventScroll: true }); } catch (e) {} });
      tl.appendChild(b); devBtns[d.id] = b;
    });
    var bSnd = el('button', 'snd', 'Sound off'); bSnd.type = 'button'; bSnd.title = 'The Teletype\u2019s strike, carriage return and motor; the VT220\u2019s keyclick';
    sw.appendChild(bSnd);
    var sound = false; try { sound = localStorage.getItem('eliza.sound') === 'on'; } catch (e) {}
    function setSound(on) {
      sound = !!on; bSnd.textContent = sound ? 'Sound on' : 'Sound off'; bSnd.classList.toggle('on', sound); bSnd.setAttribute('aria-pressed', sound);
      try { localStorage.setItem('eliza.sound', sound ? 'on' : 'off'); } catch (e) {}
      Sound.hum(sound && device === 'tty');
      if (sound && device === 'tty') Sound.load(base + 'assets/audio/asr33keypress.wav');
    }
    bSnd.addEventListener('click', function () { setSound(!sound); input.focus({ preventScroll: true }); });
    container.appendChild(sw);
    container.appendChild(vt);
    var stand = el('div', 'vt-stand'); container.appendChild(stand);
    // ---- the Teletype Model 33 ASR: Anthony Hay's photograph of the machine (from ELIZA33, by Jeff
    // Shrager, Anthony Hay and Leo Armel), the paper rising out of it (the site's fanfold plate, without
    // sprocket holes: the Model 33 printed on friction-fed roll paper), and its keyboard, every key live
    var base = opts.base || '';
    var tty = el('div', 'tty33'); tty.hidden = true;
    var photo = el('div', 'tty-photo');
    var img = el('img'); img.src = base + 'assets/images/asr33-hay.jpg'; img.alt = 'A Teletype Model 33 ASR seen from above: the printer under its cover, the keyboard, and the paper tape reader and punch on the left (photograph by Anthony Hay)'; img.loading = 'lazy';
    var paper = el('div', 'tty-paper'), glass = el('div', 'tty-window'), keys = el('div', 'tty-keys');
    var tpl = document.getElementById('tty-paper-template'), feed;
    if (tpl && tpl.content) { paper.appendChild(tpl.content.cloneNode(true)); feed = paper.querySelector('.tty-feed'); }
    if (!feed) { var ff = el('div', 'fanfold no-sprockets'); feed = el('div', 'tty-feed'); ff.appendChild(feed); paper.appendChild(ff); }
    photo.appendChild(img); photo.appendChild(paper); photo.appendChild(glass); photo.appendChild(keys);
    var view = el('div', 'tty-view'); view.appendChild(photo); tty.appendChild(view);
    // a closer view (the photograph at 1.6 times, the paper and keyboard filling the width) or the whole machine
    var zoomBtn = el('button', 'tty-zoom'); zoomBtn.type = 'button';
    var zoomed = true; try { zoomed = localStorage.getItem('eliza.tty.zoom') !== 'out'; } catch (e) {}
    function setZoom(z) { zoomed = z; tty.classList.toggle('zoom', z); zoomBtn.textContent = z ? 'Whole machine' : 'Closer'; try { localStorage.setItem('eliza.tty.zoom', z ? 'in' : 'out'); } catch (e) {} setTimeout(fitPaper, 0); }
    zoomBtn.addEventListener('click', function (e) { e.stopPropagation(); setZoom(!zoomed); });
    tty.appendChild(zoomBtn);
    tty.appendChild(el('p', 'tty-credit', 'Photograph of a Teletype Model 33 ASR by Anthony Hay, from ELIZA33 (Jeff Shrager, Anthony Hay and Leo Armel).'));
    container.appendChild(tty);
    // the keys as they sit in the photograph (centres, as fractions of its width and height), with
    // their legends: [label, unshifted, shifted, x, y]; the four rows and the space bar
    var KEYMAP = [
      [['!', '1', '!'], ['"', '2', '"'], ['#', '3', '#'], ['$', '4', '$'], ['%', '5', '%'], ['&', '6', '&'], ["'", '7', "'"], ['(', '8', '('], [')', '9', ')'], ['0', '0', '0'], ['*', ':', '*'], ['=', '-', '='], ['HERE IS', 'HEREIS']],
      [['ESC', 'ESC'], ['Q'], ['W'], ['E'], ['R'], ['T'], ['Y'], ['U'], ['I'], ['O'], ['P', 'P', '@'], ['LINE FEED', 'LF'], ['RETURN', 'RETURN']],
      [['CTRL', 'CTRL'], ['A'], ['S'], ['D'], ['F'], ['G'], ['H'], ['J'], ['K', 'K', '['], ['L', 'L', '\\'], ['+', ';', '+'], ['RUB OUT', 'RUBOUT'], ['REPT', 'REPT'], ['BREAK', 'BREAK']],
      [['SHIFT', 'SHIFT'], ['Z'], ['X'], ['C'], ['V'], ['B'], ['N', 'N', '^'], ['M', 'M', ']'], ['<', ',', '<'], ['>', '.', '>'], ['?', '/', '?'], ['SHIFT', 'SHIFT']]
    ];
    var KX = [[427, 491, 555, 618, 682, 746, 810, 874, 938, 1001, 1066, 1130, 1196],
              [385, 450, 515, 580, 647, 712, 778, 843, 908, 973, 1040, 1105, 1170],
              [382, 460, 525, 592, 660, 727, 793, 858, 925, 993, 1062, 1130, 1213, 1278],
              [405, 480, 550, 620, 690, 760, 828, 898, 966, 1034, 1103, 1175]];
    var KY = [742, 810, 880, 952], keyEls = {}, shiftOn = false, ctrlOn = false, lastKey = null;
    KEYMAP.forEach(function (row, r) {
      row.forEach(function (k, c) {
        var b = el('button', 'tk'); b.type = 'button';
        b.style.left = (KX[r][c] / 16) + '%'; b.style.top = (KY[r] / 12.04) + '%';
        b.setAttribute('aria-label', k[0].length > 1 ? k[0] : 'Key ' + k[0]);
        b.dataset.k = k[1] || k[0]; if (k[2]) b.dataset.s = k[2];
        keys.appendChild(b);
        (keyEls[b.dataset.k] = keyEls[b.dataset.k] || []).push(b);
        if (b.dataset.s) (keyEls[b.dataset.s] = keyEls[b.dataset.s] || []).push(b);
      });
    });
    var space = el('button', 'tk tk-space'); space.type = 'button'; space.setAttribute('aria-label', 'Space bar'); space.dataset.k = ' ';
    space.style.left = '50.6%'; space.style.top = '86.8%'; keys.appendChild(space); keyEls[' '] = [space];
    function flash(k) { (keyEls[k] || []).forEach(function (b) { b.classList.add('down'); setTimeout(function () { b.classList.remove('down'); }, 110); }); }
    function press(code, shifted) {
      if (code === 'SHIFT') { shiftOn = !shiftOn; (keyEls.SHIFT || []).forEach(function (b) { b.classList.toggle('held', shiftOn); }); return; }
      if (code === 'CTRL') { ctrlOn = !ctrlOn; (keyEls.CTRL || []).forEach(function (b) { b.classList.toggle('held', ctrlOn); }); return; }
      if (code === 'REPT') { if (lastKey) press(lastKey[0], lastKey[1]); return; }
      lastKey = [code, shifted];
      if (sound) { if (code === 'RETURN') Sound.newline(); else if (code !== 'LF') Sound.strike(); }
      if (code === 'RETURN') { var v = input.value; input.value = ''; handle(v); }
      else if (code === 'RUBOUT') input.value = input.value.slice(0, -1);
      else if (code === 'ESC' || code === 'BREAK') { C.interrupt(); if (cacm >= 0) { cacm = -1; sys('-- CACM conversation interrupted --'); } }
      else if (code === 'LF' || code === 'HEREIS') { /* no line of its own here */ }
      else if (ctrlOn) { ctrlOn = false; (keyEls.CTRL || []).forEach(function (b) { b.classList.remove('held'); }); }   // a control character prints nothing
      else input.value += shifted && shifted !== code ? shifted : code;
      if (shiftOn && code !== 'SHIFT') { shiftOn = false; (keyEls.SHIFT || []).forEach(function (b) { b.classList.remove('held'); }); }
    }
    keys.addEventListener('click', function (e) {
      var b = e.target.closest('.tk'); if (!b) return; e.stopPropagation();
      flash(b.dataset.k); press(b.dataset.k, shiftOn ? b.dataset.s : null);
      try { input.focus({ preventScroll: true }); } catch (x) {}
    });
    photo.addEventListener('click', function (e) { if (!e.target.closest('.tk')) try { input.focus({ preventScroll: true }); } catch (x) {} });
    // the type is sized to the paper: a Model 33 line holds 72 characters; set to 64 here (the width of
    // Hay's banner) so that the print can be read at the size of the photograph
    function fitPaper() { var w = paper.clientWidth; if (w) paper.style.fontSize = Math.max(6, (w * 0.86) / 64 / 0.6) + 'px'; }
    window.addEventListener('resize', fitPaper);
    setZoom(zoomed);
    if ('ResizeObserver' in window) new ResizeObserver(fitPaper).observe(paper);
    var device = 'vt220';
    var winBar = el('div', 'win-bar'); vt.insertBefore(winBar, vt.firstChild);
    var macMenu = el('div', 'mac-menu'); macMenu.innerHTML = '<span class="mac-apple" aria-hidden="true"></span><span>File</span><span>Edit</span><span>View</span><span>Special</span><span>Help</span><span class="mac-clock"></span>';
    var macTitle = el('div', 'mac-title'); macTitle.innerHTML = '<span class="mac-box"></span><span class="mac-name">ELIZA</span><span class="mac-box"></span>';
    term.insertBefore(macTitle, term.firstChild); term.insertBefore(macMenu, macTitle);
    // the iMac runs ELIZA as a HyperCard stack: a black-and-white card with a title, a scrolling field
    // for the conversation, a field to type in and a round-rect button
    var llmPlus = el('span', 'llm-plus', '+'), llmIcons = el('span', 'llm-icons'); llmIcons.innerHTML = '<span class="llm-stop"></span><span class="llm-mic"></span>';
    var llmFoot = el('div', 'llm-foot'); llmFoot.innerHTML = '<span>Auto</span><span class="llm-model"><b>ELIZA 1966</b> High <span class="llm-ring"></span></span>';
    inputWrap.insertBefore(llmPlus, inputWrap.firstChild); inputWrap.appendChild(llmIcons); term.appendChild(llmFoot);
    var hcCard = el('div', 'hc-card');
    var hcHead = el('div', 'hc-head'); hcHead.innerHTML = '<span class="hc-title">ELIZA</span><span class="hc-sub">a conversation with the DOCTOR</span>';
    var hcField = el('div', 'hc-field'), hcRow = el('div', 'hc-row');
    var hcLabel = el('span', 'hc-label', 'You say:');
    var hcReply = el('button', 'hc-btn', 'Reply'); hcReply.type = 'button';
    var hcNav = el('div', 'hc-nav'); hcNav.innerHTML = '<span class="hc-arrow">&#9664;</span><span class="hc-arrow">&#9654;</span>';
    hcCard.appendChild(hcHead); hcCard.appendChild(hcField); hcCard.appendChild(hcRow); hcCard.appendChild(hcNav);
    term.insertBefore(hcCard, macTitle.nextSibling);
    hcReply.addEventListener('click', function (e) { e.stopPropagation(); var v = input.value; input.value = ''; handle(v); try { input.focus({ preventScroll: true }); } catch (x) {} });
    var macChin = el('span', 'mac-chin'); macChin.innerHTML = '<span class="mac-grille"></span><span class="mac-word">iMac</span><span class="mac-grille"></span>'; chin.appendChild(macChin);
    setInterval(function () { var ck = macMenu.querySelector('.mac-clock'); if (ck && device === 'imac') ck.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }, 10000);
    var devLabel = el('span', 'dev-label'); chinL.appendChild(devLabel);
    var devNote = el('p', 'dev-note'); container.appendChild(devNote);
    // Hay's banner, with the script's copyright and the engine's licence, in small type under the machine
    container.appendChild(el('div', 'term-banner', BANNER));
    var promptEl = inputWrap.querySelector('.prompt');
    function setDevice(d) {
      device = DEV[d] ? d : 'vt220';
      var D = DEV[device];
      vt.hidden = device === 'tty'; tty.hidden = device !== 'tty';
      stand.hidden = !(device === 'vt220' || device === 'dos');
      vt.className = 'vt220 dev-' + device;
      if (device === 'tty') { feed.appendChild(log); feed.appendChild(inputWrap); fitPaper(); if (sound) Sound.load(base + 'assets/audio/asr33keypress.wav'); }
      else if (device === 'imac') { hcField.appendChild(log); hcRow.appendChild(hcLabel); hcRow.appendChild(inputWrap); hcRow.appendChild(hcReply); }
      else { term.insertBefore(log, setup); term.appendChild(inputWrap); term.appendChild(llmFoot); }
      var ck0 = macMenu.querySelector('.mac-clock'); if (ck0) ck0.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      DEVICES.forEach(function (x) { devBtns[x.id].classList.toggle('on', x.id === device); devBtns[x.id].setAttribute('aria-pressed', x.id === device); });
      try { var sb = devBtns[device]; tl.scrollLeft = sb.offsetLeft - (tl.clientWidth - sb.offsetWidth) / 2; } catch (e) {}
      log.style.scrollBehavior = device === 'vt220' && P.scroll.k === 0 ? 'smooth' : 'auto';
      if (device !== 'vt220' && typeof ST !== 'undefined' && ST.open) leave();
      winBar.textContent = D.title || ''; devLabel.textContent = D.label || '';
      if (promptEl) promptEl.textContent = D.prompt || '';
      input.placeholder = D.placeholder || (device === 'vt220' ? 'type and press enter\u2026' : '');
      devNote.innerHTML = '<b>' + D.year + ', ' + D.name + '.</b> ' + D.note + ' The replies on every machine here are Weizenbaum\u2019s 1966 DOCTOR, through Anthony Hay\u2019s engine.';
      try { localStorage.setItem('eliza.terminal', device); } catch (e) {}
      if (typeof setSound === 'function') Sound.hum(sound && device === 'tty');
      log.scrollTop = log.scrollHeight;
    }

    function add(cls, text) {
      var l = el('div', 'l ' + cls, text);
      if (/\b(usr|bot)\b/.test(cls)) { var t = new Date(); l.dataset.who = /usr/.test(cls) ? 'You' : 'ELIZA'; l.dataset.time = t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }); }
      log.appendChild(l); log.scrollTop = log.scrollHeight; return l;
    }
    function bot(text) { add('bot', text); }
    // a reply arrives a character at a time at the receive speed (Comm Set-Up), as down a serial line
    function arrive(text, done) {
      if (device === 'im' || device === 'web') {   // the other side is "typing", then the message lands whole
        var w = add('sys typing', device === 'im' ? 'ELIZA is typing a message.' : ''); w.innerHTML = device === 'web' ? '<span></span><span></span><span></span>' : w.textContent;
        setTimeout(function () { w.remove(); var m = add('bot', text); done(); }, 700 + Math.min(1800, text.length * 18));
        return;
      }
      if (device === 'llm') {   // a moment's "thinking", then streamed a few words at a time
        var th = add('sys thinking', ''), t0t = performance.now(), ntok = (lastInput.match(/\S+/g) || []).length;
        th.innerHTML = '<span class="dots"><span></span><span></span><span></span></span><span class="tmeta"></span>';
        var tm = th.querySelector('.tmeta');
        function meta() { tm.textContent = Math.max(1, Math.round((performance.now() - t0t) / 1000)) + 's \u00b7 ' + ntok + ' tokens \u00b7 Thinking'; }
        meta(); log.scrollTop = log.scrollHeight; var tick = setInterval(function () { meta(); log.scrollTop = log.scrollHeight; }, 250);
        var lm, words = text.split(' '), wi = 0;
        setTimeout(function () { clearInterval(tick); th.remove(); lm = add('bot', ''); more(); }, 1200 + Math.random() * 1000);
        return;
        function more() { wi = Math.min(words.length, wi + 1 + Math.floor(Math.random() * 2)); lm.textContent = words.slice(0, wi).join(' '); log.scrollTop = log.scrollHeight; if (wi < words.length) setTimeout(more, 45 + Math.random() * 60); else done(); }
        return;
      }
      var l = add('bot', ''), k = 0, rate = device === 'pet' ? 600 : (device === 'dos' || device === 'imac') ? 5000 : (typeof cps === 'function' ? cps() : 480), t0 = performance.now();
      if (rate >= 960 || !text) { l.textContent = text; log.scrollTop = log.scrollHeight; done(); return; }
      (function tick() {
        var n = Math.min(text.length, Math.floor((performance.now() - t0) / 1000 * rate) + 1);
        if (n !== k) {
          if (sound && device === 'tty') { for (var q = k; q < n; q++) if (text.charAt(q) !== ' ') { Sound.strike(); break; } }
          k = n; l.textContent = text.slice(0, k); log.scrollTop = log.scrollHeight;
        }
        if (k < text.length) requestAnimationFrame(tick);
        else { if (sound && device === 'tty') Sound.newline(); done(); }
      })();
    }
    function usr(text) { add('usr', text); }
    function sys(text) { add('sys', text); }
    function pre(text) { add('sys pre', text); }

    var conversation = '', traceText = '', cacm = -1, busy = false, lastInput = '';
    function start() { var h = C.hello(); bot(h); conversation = h + '\n\n'; traceText = conversation; }
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
        case '*SETUP': if (device !== 'vt220') sys('Set-Up is a VT220\'s; switch to the VT220 (*vt220).'); else enter(); return;
        case '*TTY': setDevice('tty'); return;
        case '*VT220': setDevice('vt220'); return;
        case '*PET': setDevice('pet'); return;
        case '*IMAC': setDevice('imac'); return;
        case '*DOS': setDevice('dos'); return;
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
      log.style.scrollBehavior = (typeof device === 'undefined' || device === 'vt220') && P.scroll.k === 0 ? 'smooth' : 'auto';
    }
    // the speed at which ELIZA's replies arrive, in characters a second: a tenth of the receive rate
    // (ten bits a character with start and stop bits); Receive=Transmit takes the transmit rate
    function cps() { if (device === 'tty') return 10; var r = P.rx.k === 0 ? SPEEDS[P.tx.k] : SPEEDS[P.rx.k - 1]; return (+r) / 10; }
    function store() { var o = {}; for (var n in P) if (P[n] && P[n].list) o[n] = P[n].k; o.tabs = P.tabs; o.phosphor = phosphor(); o.crt = term.classList.contains('crt'); return o; }
    function restore(o) { if (!o) return false; P = DEF(); for (var n in o) if (P[n] && P[n].list && o[n] < P[n].list.length) P[n].k = o[n]; if (o.tabs) P.tabs = o.tabs; if (o.phosphor) setPhosphor(o.phosphor); term.classList.toggle('crt', o.crt !== false); effects(); return true; }
    effects();   // the factory settings, until a saved set is recalled
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

    var savedDevice = null; try { savedDevice = localStorage.getItem('eliza.terminal'); } catch (e) {}
    setDevice(DEV[savedDevice] ? savedDevice : 'vt220');
    setSound(sound);

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
      lastInput = text;
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
      if (sound && !ST.open && !e.metaKey && !e.ctrlKey) {
        if (device === 'tty') { if (e.key.length === 1 && e.key !== ' ') Sound.strike(); else if (e.key === 'Enter') Sound.newline(); }
        else if (P.click.k === 0 && (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace')) Sound.click();
      }
      if (device === 'tty' && !e.metaKey && !e.ctrlKey) {
        var kk = e.key === 'Enter' ? 'RETURN' : e.key === 'Backspace' ? 'RUBOUT' : e.key === 'Escape' ? 'ESC' : e.key.length === 1 ? e.key.toUpperCase() : null;
        if (kk) flash(kk);
      }
      if (ST.open) { setupKeys(e); return; }
      if (e.key === 'F3') { e.preventDefault(); if (device === 'vt220') enter(); return; }
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
