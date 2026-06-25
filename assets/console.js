/* console.js - the home hero 7094 console.
   - the indicator register lamps drift/blink like a live machine.
   - the red POWER button runs a shutdown sequence: the lamps go crazy, then the
     site powers down to low opacity while a Web Audio synth sings "Daisy Bell"
     slowing and dropping in pitch, the way HAL 9000 dies in 2001. (Daisy Bell was
     first computer-synthesised on an IBM 7094 at Bell Labs in 1961, which is what
     inspired the HAL scene.) Press POWER again to power back up. */
(function () {
  var btn = document.getElementById('power-btn');
  var lamps = [].slice.call(document.querySelectorAll('.register .rl'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var driftA, driftB, craze, downTimer, audio, oscs = [], powered = true;

  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }

  // --- ambient drift: flip a few lamps now and then, blink a lit one ---
  function startDrift() {
    if (reduce || !lamps.length) return;
    driftA = setInterval(function () {
      if (document.hidden || !powered) return;
      var n = 2 + Math.floor(Math.random() * 4);
      for (var i = 0; i < n; i++) rand(lamps).classList.toggle('on');
    }, 900);
    driftB = setInterval(function () {
      if (document.hidden || !powered) return;
      var lit = lamps.filter(function (l) { return l.classList.contains('on'); });
      if (!lit.length) return;
      var l = rand(lit); l.classList.add('blink');
      setTimeout(function () { l.classList.remove('blink'); }, 150);
    }, 1300);
  }
  function stopDrift() { clearInterval(driftA); clearInterval(driftB); }
  function allOn() { lamps.forEach(function (l) { l.classList.add('on'); }); }
  function allOff() { lamps.forEach(function (l) { l.classList.remove('on', 'blink'); }); }

  // --- Daisy Bell, degrading like HAL ---
  var NOTE = { D4: 293.66, E4: 329.63, 'F#4': 369.99, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33 };
  var DAISY = [
    ['D5', 2], ['B4', 1], ['G4', 2], ['D4', 1],                          // Dai-sy, Dai-sy,
    ['E4', 1], ['F#4', 1], ['G4', 1], ['A4', 1], ['B4', 1], ['A4', 3],   // give me your an-swer do,
    ['D5', 2], ['B4', 1], ['G4', 2], ['D4', 1],                          // I'm half cra-zy,
    ['E4', 1], ['F#4', 1], ['G4', 1], ['A4', 1], ['B4', 1], ['G4', 4]    // all for the love of you.
  ];
  function sing() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try { audio = new Ctx(); } catch (e) { return; }
    if (audio.resume) audio.resume();
    var t = audio.currentTime + 0.2;
    var beat = 0.5, slow = 1.0, detune = 0;
    DAISY.forEach(function (nb, i) {
      var dur = nb[1] * beat * slow;
      var f = NOTE[nb[0]] * Math.pow(2, detune / 1200);
      var osc = audio.createOscillator(), g = audio.createGain(), lp = audio.createBiquadFilter();
      osc.type = 'triangle'; lp.type = 'lowpass'; lp.frequency.value = 1500;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.linearRampToValueAtTime(f * Math.pow(2, -(slow - 1) * 0.05), t + dur); // sag
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.05);
      g.gain.setValueAtTime(0.16, t + dur * 0.72);
      g.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(lp); lp.connect(g); g.connect(audio.destination);
      osc.start(t); osc.stop(t + dur + 0.05);
      oscs.push(osc);
      t += dur;
      slow += 0.045;        // each note a little slower
      detune -= 14 + i * 2; // and a little lower
    });
  }
  function stopSong() {
    oscs.forEach(function (o) { try { o.stop(); } catch (e) {} });
    oscs = [];
    if (audio) { try { audio.close(); } catch (e) {} audio = null; }
  }
  // turn the lamps off in a random wave as the machine dies
  function fadeLamps() {
    lamps.slice().sort(function () { return Math.random() - 0.5; })
      .forEach(function (l, i) { setTimeout(function () { if (!powered) l.classList.remove('on'); }, 700 + i * 220); });
  }

  function powerDown() {
    powered = false;
    btn.setAttribute('aria-pressed', 'true');
    stopDrift();
    if (reduce) { root.classList.add('powered-off'); return; }
    craze = setInterval(function () {
      for (var i = 0; i < 8; i++) rand(lamps).classList.toggle('on');
    }, 70);
    downTimer = setTimeout(function () {
      if (powered) return;            // cancelled
      clearInterval(craze);
      root.classList.add('powered-off');
      allOn(); sing(); fadeLamps();
    }, 1700);
  }
  function powerUp() {
    powered = true;
    btn.setAttribute('aria-pressed', 'false');
    clearInterval(craze); clearTimeout(downTimer); stopSong();
    root.classList.remove('powered-off');
    allOff(); startDrift();
  }

  if (btn) btn.addEventListener('click', function () { powered ? powerDown() : powerUp(); });
  startDrift();
})();
