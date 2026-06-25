/* console.js - the home hero 7094 console.
   - the indicator register lamps drift/blink like a live machine.
   - the rocker action buttons rock left->right when clicked, then navigate.
   - the red POWER button runs a shutdown: lamps go crazy, then all flash and cut
     off together, then a dark veil falls (the POWER button staying lit above it)
     while a Web Audio oboe plays "Daisy Bell" slowly, sagging at the end like
     HAL 9000. Press POWER again to power back up. */
(function () {
  var btn = document.getElementById('power-btn');
  var lamps = [].slice.call(document.querySelectorAll('.register .rl'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var driftA, driftB, craze, t1, blinkIv, audio, nodes = [], powered = true, veil;

  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  function getVeil() {
    if (!veil) { veil = document.createElement('div'); veil.className = 'power-veil'; document.body.appendChild(veil); }
    return veil;
  }
  function allOn() { lamps.forEach(function (l) { l.classList.add('on'); }); }
  function allOff() { lamps.forEach(function (l) { l.classList.remove('on', 'blink'); }); }

  // --- ambient drift ---
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

  // --- Daisy Bell melody (note letters as transcribed), grouped by phrase ---
  var PARTS = [
    ['G','E','C','G','A','B','C', 'A','C','G','D', 'G','E','C','A','B','C','D','E','D'],
    ['E','F','E','D','G', 'E','D','C','D','E','C', 'A','C','A','G'],
    ['G','C','E','D', 'E','F','G','E','C','D'],
    ['G','C','E','D', 'E','F','G','E','C', 'D','C']
  ];
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function buildNotes() {
    var seq = [];
    PARTS.forEach(function (p) { p.forEach(function (L) { seq.push(L); }); });
    var prev = 67, out = []; // start at G4 (oboe range)
    seq.forEach(function (L, idx) {
      var best = null, bd = 1e9;
      for (var o = 3; o <= 6; o++) { var m = 12 * (o + 1) + PC[L]; var d = Math.abs(m - prev); if (d < bd) { bd = d; best = m; } }
      prev = best;
      var midi = best;
      if (idx === seq.length - 1) midi -= 12; // final "Low C"
      out.push({ midi: midi, last: idx === seq.length - 1 });
    });
    return out;
  }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  // an oboe-ish timbre: reedy/nasal harmonic spectrum (peak around the 3rd partial)
  function oboeWave(ac) {
    var amps = [0, 0.18, 0.36, 1.0, 0.72, 0.5, 0.33, 0.26, 0.17, 0.11, 0.07, 0.05];
    var real = new Float32Array(amps.length), imag = new Float32Array(amps);
    return ac.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  function sing() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try { audio = new Ctx(); } catch (e) { return; }
    if (audio.resume) audio.resume();
    var notes = buildNotes(), wave = oboeWave(audio);
    var beat = 0.46, t = audio.currentTime + 0.25;     // steady, slowish
    var master = audio.createGain(); master.gain.value = 0.5; master.connect(audio.destination);
    var lp = audio.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = 0.7; lp.connect(master);
    var lfo = audio.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.4;
    var lfoG = audio.createGain(); lfoG.gain.value = 6; lfo.connect(lfoG); lfo.start(t); nodes.push(lfo);
    notes.forEach(function (n) {
      var dur = n.last ? beat * 2.8 : beat;
      var f = mtof(n.midi);
      var o = audio.createOscillator(), g = audio.createGain();
      o.setPeriodicWave(wave);
      o.frequency.setValueAtTime(f, t);
      if (n.last) o.frequency.linearRampToValueAtTime(f * 0.6, t + dur); // dying fall
      lfoG.connect(o.detune);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.05);                   // soft reed attack
      g.gain.setValueAtTime(0.22, t + dur * (n.last ? 0.55 : 0.8));
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g); g.connect(lp);
      o.start(t); o.stop(t + dur + 0.05);
      nodes.push(o);
      t += dur;                                          // steady tempo, no compounding drift
    });
  }
  function stopSong() {
    nodes.forEach(function (o) { try { o.stop(); } catch (e) {} });
    nodes = [];
    if (audio) { try { audio.close(); } catch (e) {} audio = null; }
  }

  // all lamps flash together a few times, then cut off together
  function flashThenOff(done) {
    var i = 0, flashes = 3;
    blinkIv = setInterval(function () {
      if (powered) { clearInterval(blinkIv); return; }
      (i % 2 === 0 ? allOn : allOff)();
      if (++i >= flashes * 2) { clearInterval(blinkIv); allOff(); done(); }
    }, 150);
  }

  function powerDown() {
    powered = false;
    btn.setAttribute('aria-pressed', 'true');
    stopDrift();
    if (reduce) { allOff(); root.classList.add('powered-off'); getVeil().classList.add('on'); return; }
    craze = setInterval(function () { for (var i = 0; i < 8; i++) rand(lamps).classList.toggle('on'); }, 70);
    t1 = setTimeout(function () {
      if (powered) return;
      clearInterval(craze);
      flashThenOff(function () {
        if (powered) return;
        root.classList.add('powered-off');
        getVeil().classList.add('on');
        sing();
      });
    }, 1300);
  }
  function powerUp() {
    powered = true;
    btn.setAttribute('aria-pressed', 'false');
    clearInterval(craze); clearTimeout(t1); clearInterval(blinkIv); stopSong();
    root.classList.remove('powered-off');
    if (veil) veil.classList.remove('on');
    allOff(); startDrift();
  }
  if (btn) btn.addEventListener('click', function () { powered ? powerDown() : powerUp(); });
  startDrift();

  // --- rocker action buttons: rock left->right (ON) when clicked, then navigate ---
  [].forEach.call(document.querySelectorAll('.console .hero-actions .rocker-btn'), function (b) {
    b.addEventListener('click', function (e) {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      if (b.dataset.go) return;
      e.preventDefault();
      var rk = b.querySelector('.rocker'); if (rk) rk.classList.add('on');
      b.dataset.go = '1';
      var href = b.getAttribute('href');
      setTimeout(function () { window.location.href = href; }, 300);
    });
  });
})();
