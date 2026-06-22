// Nav for the SHRDLU site: hamburger panel (mobile) + click-to-open dropdown groups.
(function () {
  function init() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!nav) return;

    function closeGroups() {
      var open = nav.querySelectorAll('.nav-menu.open');
      Array.prototype.forEach.call(open, function (m) { m.classList.remove('open'); });
      var btns = nav.querySelectorAll('.nav-top[aria-expanded="true"]');
      Array.prototype.forEach.call(btns, function (b) { b.setAttribute('aria-expanded', 'false'); });
    }
    function closeAll() {
      nav.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      closeGroups();
    }

    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (!open) closeGroups();
      });
    }

    var tops = nav.querySelectorAll('.nav-group > .nav-top');
    Array.prototype.forEach.call(tops, function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = btn.parentNode.querySelector('.nav-menu');
        if (!menu) return;
        var willOpen = !menu.classList.contains('open');
        closeGroups();
        if (willOpen) { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && (!toggle || !toggle.contains(e.target))) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
