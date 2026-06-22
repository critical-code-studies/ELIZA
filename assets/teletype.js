/* Hero foreground: a simulated teletype types out the canonical 1966 DOCTOR
   exchange (Weizenbaum, CACM) one character at a time, at roughly teletype
   pace. The person types lower case; ELIZA answers in CAPITALS. A bank of IBM
   7094 indicator lamps pulses while ELIZA "decomposes and reassembles" each
   reply, going quiet while the person types. Decorative (aria-hidden); the full
   transcript also lives on dialogue.html. Honours prefers-reduced-motion. */
(function () {
  var feed = document.getElementById('tt-feed');
  if (!feed) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lamps = Array.prototype.slice.call(document.querySelectorAll('#lampbank .lamp'));

  // s: 0 = person (input, lower case), 1 = ELIZA (CAPS)
  var D = [
    { s: 0, t: "Men are all alike." },
    { s: 1, t: "IN WHAT WAY" },
    { s: 0, t: "They're always bugging us about something or other." },
    { s: 1, t: "CAN YOU THINK OF A SPECIFIC EXAMPLE" },
    { s: 0, t: "Well, my boyfriend made me come here." },
    { s: 1, t: "YOUR BOYFRIEND MADE YOU COME HERE" },
    { s: 0, t: "He says I'm depressed much of the time." },
    { s: 1, t: "I AM SORRY TO HEAR YOU ARE DEPRESSED" },
    { s: 0, t: "It's true. I am unhappy." },
    { s: 1, t: "DO YOU THINK COMING HERE WILL HELP YOU NOT TO BE UNHAPPY" },
    { s: 0, t: "I need some help, that much seems certain." },
    { s: 1, t: "WHAT WOULD IT MEAN TO YOU IF YOU GOT SOME HELP" },
    { s: 0, t: "Perhaps I could learn to get along with my mother." },
    { s: 1, t: "TELL ME MORE ABOUT YOUR FAMILY" },
    { s: 0, t: "You are like my father in some ways." },
    { s: 1, t: "WHAT RESEMBLANCE DO YOU SEE" }
  ];

  var CHAR_YOU = 60, CHAR_EL = 42, GAP_TO_EL = 700, GAP_TO_YOU = 1500, LOOP_PAUSE = 6000;

  var cursor = document.createElement('span');
  cursor.className = 'tt-cursor';
  var lampTimer = null;

  function lampsOn() {
    if (reduce || !lamps.length) return;
    if (lampTimer) clearInterval(lampTimer);
    lampTimer = setInterval(function () {
      lamps.forEach(function (l) { l.classList.toggle('on', Math.random() > 0.45); });
    }, 110);
  }
  function lampsOff() { if (lampTimer) clearInterval(lampTimer); lamps.forEach(function (l) { l.classList.remove('on'); }); }

  function newLine(s) {
    var p = document.createElement('p');
    p.className = 'tt-line ' + (s ? 'sh' : 'you');
    feed.appendChild(p);
    return p;
  }

  if (reduce) { D.slice(-4).forEach(function (turn) { newLine(turn.s).textContent = turn.t; }); return; }

  var timer = null;
  function typeLine(turn, done) {
    var el = newLine(turn.s);
    el.appendChild(cursor);
    if (turn.s) lampsOn(); else lampsOff();
    var txt = turn.t, i = 0, speed = turn.s ? CHAR_EL : CHAR_YOU;
    (function step() {
      if (i < txt.length) {
        el.insertBefore(document.createTextNode(txt.charAt(i)), cursor);
        i++;
        feed.scrollTop = feed.scrollHeight; // keep the newest line in the window
        var c = txt.charAt(i - 1);
        timer = setTimeout(step, c === ' ' ? speed * 0.6 : speed);
      } else { if (turn.s) lampsOff(); done(); }
    })();
  }

  function run(i) {
    if (i >= D.length) {
      timer = setTimeout(function () {
        feed.style.opacity = '0';
        timer = setTimeout(function () { feed.innerHTML = ''; feed.style.opacity = '1'; run(0); }, 800);
      }, LOOP_PAUSE);
      return;
    }
    var gap = D[i].s ? GAP_TO_YOU : GAP_TO_EL;
    typeLine(D[i], function () { timer = setTimeout(function () { run(i + 1); }, gap); });
  }

  feed.style.transition = 'opacity 0.7s ease';
  if (document.readyState !== 'loading') run(0);
  else document.addEventListener('DOMContentLoaded', function () { run(0); });
})();
