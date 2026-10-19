/* lightbox.js: a picture in .talk-shots opens over the page, with its caption; Escape, a click
   outside it or the close button shuts it. Without JavaScript the link opens the image itself. */
(function () {
  'use strict';
  var dlg = null;
  function box() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close">&times;</button><figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.lightbox-close')) dlg.close(); });
    return dlg;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.talk-shots a');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var img = a.querySelector('img'), cap = a.closest('figure') && a.closest('figure').querySelector('figcaption');
    var d = box();
    if (typeof d.showModal !== 'function') return;   // an old browser: the link opens the image
    e.preventDefault();
    var big = d.querySelector('img');
    big.src = a.getAttribute('href'); big.alt = img ? img.alt : '';
    d.querySelector('figcaption').textContent = cap ? cap.textContent : '';
    d.showModal();
  });
})();
