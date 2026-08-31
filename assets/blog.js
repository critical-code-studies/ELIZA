/* blog.js - the whole blog, with no per-post HTML. Two modes, chosen by which
   container is on the page:
     #blog-list  (blog.html)        -> renders the index from blog/posts.json
     #post       (blog/post.html)   -> renders one post from blog/posts/<slug>.md
   To add a post, a co-author drops a Markdown file in blog/posts/ and adds one
   line to blog/posts.json. No build step. See blog/CONTRIBUTING.md.
   Markdown is rendered by the vendored marked.min.js. */
(function () {
  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function param(k) { return new URLSearchParams(location.search).get(k); }

  function parseFrontMatter(text) {
    var m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!m) return { meta: {}, body: text };
    var meta = {};
    m[1].split('\n').forEach(function (line) {
      var i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    });
    return { meta: meta, body: m[2] };
  }

  function render(md) {
    if (window.marked && window.marked.parse) return window.marked.parse(md);
    return '<pre>' + esc(md) + '</pre>';
  }

  // ---- index ----
  var list = document.getElementById('blog-list');
  if (list) {
    fetch('blog/posts.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (posts) {
      // newest first, the way a blog reads; posts.json stays in publication order
      var recent = posts.slice().reverse();
      list.innerHTML = recent.map(function (p, i) {
        return '<li' + (i === 0 ? ' class="latest"' : '') + '><span class="no">' + p.n + '</span><div>' +
          (i === 0 ? '<p class="latest-tag">Latest</p>' : '') +
          '<h3><a href="blog/post.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + '</a></h3>' +
          '<p class="meta">' + esc(p.date) + ' &middot; ' + esc(p.author) + '</p></div></li>';
      }).join('');
      var idx = document.getElementById('blog-index-list');
      if (idx) {
        idx.innerHTML = recent.map(function (p) {
          return '<li><a href="blog/post.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + '</a>' +
            '<span class="meta">' + esc(p.date) + '</span></li>';
        }).join('');
      }
    }).catch(function () { list.innerHTML = '<li><div><p class="meta">Could not load posts.</p></div></li>'; });
  }

  // Markdown renders "image line + italic caption line" as one paragraph. Turn
  // each into a figure so it can be floated and the text can flow around it.
  function figurise(root) {
    [].forEach.call(root.querySelectorAll('p > img'), function (im) {
      var p = im.parentNode;
      if (p.tagName !== 'P') return;
      var fig = document.createElement('figure');
      fig.className = 'post-fig';
      fig.appendChild(im);
      var cap = p.querySelector('em');
      if (cap) {
        var fc = document.createElement('figcaption');
        fc.innerHTML = cap.innerHTML;
        fig.appendChild(fc);
      }
      p.parentNode.replaceChild(fig, p);
    });
    // A run of two or more images with no text between them was a gallery on
    // the original site: lay those out as a grid instead of floating them,
    // which would otherwise squeeze the prose into a narrow column.
    var figs = [].slice.call(root.querySelectorAll('figure.post-fig'));
    var i = 0;
    while (i < figs.length) {
      var run = [figs[i]], next = figs[i].nextElementSibling;
      while (next && next.classList.contains('post-fig')) {
        run.push(next);
        next = next.nextElementSibling;
      }
      if (run.length > 1) {
        var gal = document.createElement('div');
        gal.className = 'post-gallery';
        run[0].parentNode.insertBefore(gal, run[0]);
        run.forEach(function (f) { gal.appendChild(f); });
      }
      i += run.length;
    }
    // alternate the side standalone figures sit on, so the page does not list
    // all its pictures down one edge
    var side = 0;
    [].forEach.call(root.querySelectorAll('figure.post-fig'), function (f) {
      if (f.parentNode.classList.contains('post-gallery')) return;
      // a figure written with its own side (where the prose says "on the left")
      // keeps it; the rest alternate
      if (f.classList.contains('fig-left') || f.classList.contains('fig-right')) return;
      f.classList.add(side++ % 2 ? 'fig-right' : 'fig-left');
    });
  }

  // click any post image to view it larger in a lightbox (Esc or click to close)
  function initLightbox(root) {
    root.addEventListener('click', function (e) {
      var im = e.target && e.target.tagName === 'IMG' ? e.target : null;
      if (!im) return;
      var box = document.createElement('div');
      box.className = 'lightbox';
      var big = document.createElement('img');
      big.src = im.currentSrc || im.src; big.alt = im.alt || '';
      box.appendChild(big);
      document.body.appendChild(box);
      document.body.style.overflow = 'hidden';
      function close() { box.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', esc); }
      function esc(ev) { if (ev.key === 'Escape') close(); }
      box.addEventListener('click', close);
      document.addEventListener('keydown', esc);
    });
  }

  // ---- single post ----
  var art = document.getElementById('post');
  if (art) {
    var slug = param('p');
    if (!slug) { art.innerHTML = '<p>No post specified. <a href="../blog.html">All posts &rarr;</a></p>'; return; }
    fetch('posts.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (posts) {
      var i = posts.findIndex(function (x) { return x.slug === slug; });
      if (i < 0) { art.innerHTML = '<p>Post not found. <a href="../blog.html">All posts &rarr;</a></p>'; return; }
      var p = posts[i], prev = posts[i - 1], next = posts[i + 1];
      document.title = p.title + ' · ELIZA (1966)';
      fetch('posts/' + slug + '.md', { cache: 'no-cache' }).then(function (r) { return r.text(); }).then(function (text) {
        var fm = parseFrontMatter(text);
        var nav = '<div class="post-nav"><span>' +
          (prev ? '<a href="post.html?p=' + encodeURIComponent(prev.slug) + '">&larr; ' + esc(prev.title) + '</a>' : '<a href="../blog.html">&larr; All posts</a>') +
          '</span><span>' +
          (next ? '<a href="post.html?p=' + encodeURIComponent(next.slug) + '">' + esc(next.title) + ' &rarr;</a>' : '<a href="../blog.html">All posts &rarr;</a>') +
          '</span></div>';
        art.innerHTML = '<span class="kicker">Blog &middot; no. ' + p.n + '</span>' +
          '<h1 class="page">' + esc(p.title) + '</h1>' +
          '<p class="post-meta">' + esc(p.date) + ' &middot; ' + esc(p.author) + '</p>' +
          render(fm.body) + nav;
        figurise(art);
        initLightbox(art);
      }).catch(function () { art.innerHTML = '<p>Could not load this post.</p>'; });
    }).catch(function () { art.innerHTML = '<p>Could not load the blog index.</p>'; });
  }
})();
