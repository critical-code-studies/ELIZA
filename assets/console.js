/* console.js - the home hero 7094 console.
   - the indicator register lamps drift/blink like a live machine.
   - the rocker action buttons rock left->right when clicked, then navigate.
   - the red POWER button runs a shutdown: lamps go crazy, then all flash and cut
     off together, then a dark veil falls (the POWER button staying lit above it)
     while a Web Audio oboe plays "Daisy Bell" (notes + rhythm from a G-major MIDI),
     winding down at the end like HAL 9000.
   - the lit "WHAT IS THIS?" button opens a modal about the 1961 Bell Labs recording. */
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

  // --- Daisy Bell: [midi, beats] straight from "Daisy, Daisy (G Major).mid" ---
  var DAISY = [[74,1.5],[71,1.5],[67,1.5],[62,1.5],[64,0.5],[66,0.5],[67,0.5],[64,1],[67,0.5],[62,2],
    [59,1.5],[69,1.5],[74,1.5],[71,1.5],[67,1.5],[64,0.5],[66,0.5],[67,0.5],[69,1],[71,0.5],[69,2],
    [62,1.5],[71,0.5],[72,0.5],[71,0.5],[69,0.5],[74,1],[71,0.5],[69,0.5],[67,1],[59,1.5],[69,0.5],
    [71,1],[67,0.5],[64,1],[67,0.5],[64,0.5],[62,1],[59,1.5],[62,0.5],[67,1],[71,0.5],[69,1],[62,0.5],
    [67,1],[71,0.5],[69,0.5],[71,0.5],[72,0.5],[74,0.5],[71,0.5],[67,0.5],[69,1],[62,0.5],[67,3]];
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function oboeWave(ac) {
    var amps = [0, 0.18, 0.36, 1.0, 0.72, 0.5, 0.33, 0.26, 0.17, 0.11, 0.07, 0.05];
    return ac.createPeriodicWave(new Float32Array(amps.length), new Float32Array(amps));
  }

  function sing() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try { audio = new Ctx(); } catch (e) { return; }
    if (audio.resume) audio.resume();
    var wave = oboeWave(audio), spb = 0.82, t = audio.currentTime + 0.25, n = DAISY.length;
    var master = audio.createGain(); master.gain.value = 0.5; master.connect(audio.destination);
    var lp = audio.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = 0.7; lp.connect(master);
    var lfo = audio.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.4;
    var lfoG = audio.createGain(); lfoG.gain.value = 6; lfo.connect(lfoG); lfo.start(t); nodes.push(lfo);
    DAISY.forEach(function (nb, i) {
      var last = i === n - 1;
      var slow = i >= n - 6 ? 1 + (i - (n - 6)) * 0.16 : 1;   // wind down over the last 6 notes
      var dur = nb[1] * spb * slow * (last ? 1.5 : 1);
      var f = mtof(nb[0]);
      var o = audio.createOscillator(), g = audio.createGain();
      o.setPeriodicWave(wave);
      o.frequency.setValueAtTime(f, t);
      if (last) o.frequency.linearRampToValueAtTime(f * 0.5, t + dur);  // dying fall
      lfoG.connect(o.detune);
      var atk = 0.05, rel = Math.min(0.18, dur * 0.4);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + atk);
      g.gain.setValueAtTime(0.22, t + dur - rel);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g); g.connect(lp);
      o.start(t); o.stop(t + dur + 0.05);
      nodes.push(o);
      t += dur;
    });
  }
  function stopSong() {
    nodes.forEach(function (o) { try { o.stop(); } catch (e) {} });
    nodes = [];
    if (audio) { try { audio.close(); } catch (e) {} audio = null; }
  }

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

  // --- "WHAT IS THIS?" button -> modal about the 1961 Bell Labs Daisy Bell ---
  var info = document.getElementById('info-btn'), modal = document.getElementById('info-modal');
  if (info && modal) {
    var esc = function (e) { if (e.key === 'Escape') closeM(); };
    function openM() { modal.hidden = false; document.addEventListener('keydown', esc); }
    function closeM() { modal.hidden = true; document.removeEventListener('keydown', esc); }
    info.addEventListener('click', openM);
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.classList.contains('modal-close')) closeM(); });
  }
})();
