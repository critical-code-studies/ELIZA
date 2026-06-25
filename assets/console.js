/* console.js - the home hero 7094 console.
   1) the red POWER button toggles a "powered down" low-opacity state.
   2) the indicator register lamps blink and change occasionally, like a live machine. */
(function () {
  // --- POWER button: power the site down to low opacity until pressed again ---
  var btn = document.getElementById('power-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      var off = document.documentElement.classList.toggle('powered-off');
      btn.setAttribute('aria-pressed', off ? 'true' : 'false');
    });
  }

  // --- register lamps: occasional flicker and pattern changes ---
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lamps = [].slice.call(document.querySelectorAll('.register .rl'));
  if (!lamps.length || reduce) return;

  function pick() { return lamps[Math.floor(Math.random() * lamps.length)]; }

  // every ~900ms flip a handful of lamps on/off so the pattern drifts
  setInterval(function () {
    if (document.hidden) return;
    var n = 2 + Math.floor(Math.random() * 4);
    for (var i = 0; i < n; i++) pick().classList.toggle('on');
  }, 900);

  // every ~1.3s blink one of the lit lamps briefly
  setInterval(function () {
    if (document.hidden) return;
    var lit = lamps.filter(function (l) { return l.classList.contains('on'); });
    if (!lit.length) return;
    var l = lit[Math.floor(Math.random() * lit.length)];
    l.classList.add('blink');
    setTimeout(function () { l.classList.remove('blink'); }, 150);
  }, 1300);
})();
