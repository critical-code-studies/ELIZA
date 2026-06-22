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
    fetch('blog/posts.json').then(function (r) { return r.json(); }).then(function (posts) {
      list.innerHTML = posts.map(function (p) {
        return '<li><span class="no">' + p.n + '</span><div>' +
          '<h3><a href="blog/post.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + '</a></h3>' +
          '<p class="meta">' + esc(p.date) + ' &middot; ' + esc(p.author) + '</p></div></li>';
      }).join('');
    }).catch(function () { list.innerHTML = '<li><div><p class="meta">Could not load posts.</p></div></li>'; });
  }

  // ---- single post ----
  var art = document.getElementById('post');
  if (art) {
    var slug = param('p');
    if (!slug) { art.innerHTML = '<p>No post specified. <a href="../blog.html">All posts &rarr;</a></p>'; return; }
    fetch('posts.json').then(function (r) { return r.json(); }).then(function (posts) {
      var i = posts.findIndex(function (x) { return x.slug === slug; });
      if (i < 0) { art.innerHTML = '<p>Post not found. <a href="../blog.html">All posts &rarr;</a></p>'; return; }
      var p = posts[i], prev = posts[i - 1], next = posts[i + 1];
      document.title = p.title + ' · ELIZA (1966)';
      fetch('posts/' + slug + '.md').then(function (r) { return r.text(); }).then(function (text) {
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
      }).catch(function () { art.innerHTML = '<p>Could not load this post.</p>'; });
    }).catch(function () { art.innerHTML = '<p>Could not load the blog index.</p>'; });
  }
})();
