/* One-shot static-site generator for the ELIZA Archaeology / CCS website.
   Emits HTML pages with identical header/nav/footer chrome into ~/Projects/eliza.
   Not committed as a build step (the site is plain static HTML); this just keeps
   the chrome consistent across ~26 pages. Run: node gen.js  */
const fs = require('fs');
const path = require('path');
const OUT = path.join(process.env.HOME, 'Projects', 'eliza');
const BLOGDIR = path.join(OUT, 'blog');
fs.mkdirSync(BLOGDIR, { recursive: true });

// asset cache-buster: an automatic build stamp (NOT a release version). This
// changes each build so browsers refetch changed CSS/JS/favicon. It is separate
// from the VERSION file, which is bumped only on David's explicit instruction.
const V = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
const SITE = 'https://critical-code-studies.github.io/ELIZA';

// ---- shared chrome ----------------------------------------------------------
function nav(depth) {
  const p = depth ? '../' : '';
  return `
      <a class="brand" href="${p}index.html" aria-label="ELIZA home">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 6 H22 L28 12 V26 H4 Z" fill="#d9cfbc"/><g fill="#14161b"><rect x="8" y="13" width="3" height="5" rx="0.8"/><rect x="14" y="13" width="3" height="5" rx="0.8"/></g><rect x="20" y="13" width="3" height="5" rx="0.8" fill="#ef6f44"/><text x="16" y="24" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="4.4" letter-spacing="0.3" fill="#14161b" opacity="0.5">000010</text></svg>
        <span class="brand-block"><span class="brand-text">${elizaWordmark('brand-wordmark')}</span></span>
      </a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span class="bars" aria-hidden="true">&#9776;</span>&nbsp;Menu</button>
      <nav class="site-nav" id="site-nav">
        <div class="nav-group">
          <button class="nav-top" aria-expanded="false">ELIZA <span class="caret" aria-hidden="true">&#9662;</span></button>
          <div class="nav-menu">
            <a href="${p}overview.html">Overview</a><a href="${p}doctor.html">The DOCTOR script</a><a href="${p}versions.html">The versions</a><a href="${p}book.html">The book</a>
          </div>
        </div>
        <div class="nav-group">
          <button class="nav-top" aria-expanded="false">The code <span class="caret" aria-hidden="true">&#9662;</span></button>
          <div class="nav-menu">
            <a href="${p}code.html">The program</a><a href="${p}slip.html">SLIP</a><a href="${p}how.html">How it works</a><a href="${p}try.html">Try ELIZA</a>
          </div>
        </div>
        <div class="nav-group">
          <button class="nav-top" aria-expanded="false">Project <span class="caret" aria-hidden="true">&#9662;</span></button>
          <div class="nav-menu">
            <a href="${p}people.html">TEAM-ELIZA</a><a href="${p}talks.html">Talks</a><a href="${p}blog.html">Blog</a>
          </div>
        </div>
        <div class="nav-group">
          <button class="nav-top" aria-expanded="false">About <span class="caret" aria-hidden="true">&#9662;</span></button>
          <div class="nav-menu">
            <a href="${p}about.html">About</a><a href="${p}bibliography.html">Bibliography</a><a href="${p}links.html">Resources</a>
          </div>
        </div>
      </nav>`;
}

function page(opts) {
  const depth = opts.depth || 0;
  const p = depth ? '../' : '';
  const hero = opts.hero || '';
  const cls = opts.bodyClass ? ` class="${opts.bodyClass}"` : '';
  const scripts = (opts.scripts || []).map(s => `  <script src="${p}assets/${s}?v=${V}" defer></script>`).join('\n');
  const main = hero
    ? hero + `\n  <main class="wrap content">\n${opts.body}\n  </main>`
    : `  <main class="wrap content" style="padding-top:3rem;">\n    <article class="block">\n${opts.body}\n    </article>\n  </main>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${opts.title} · ELIZA (1966)</title>
  <meta name="description" content="${opts.desc}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ELIZA Archaeology Project">
  <meta property="og:title" content="${opts.title} · ELIZA (1966)">
  <meta property="og:description" content="${opts.desc}">
  <meta property="og:image" content="${SITE}/assets/images/share-card.png?v=${V}">
  <meta property="og:url" content="${SITE}/">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${opts.title} · ELIZA (1966)">
  <meta name="twitter:description" content="${opts.desc}">
  <meta name="twitter:image" content="${SITE}/assets/images/share-card.png?v=${V}">
  <link rel="icon" type="image/svg+xml" href="${p}assets/favicon.svg?v=${V}">
  <link rel="stylesheet" href="${p}assets/css/site.css?v=${V}">
  <script src="${p}assets/nav.js?v=${V}" defer></script>
  <script src="${p}assets/term.js?v=${V}" defer></script>
${scripts}
</head>
<body${cls}>

  <header class="site-header">
    <div class="wrap">${nav(depth)}
    </div>
  </header>

${main}

  <footer class="site-footer">
    <div class="wrap">
      <p class="micro">The ELIZA Archaeology Project &mdash; a Critical Code Studies reading of ELIZA (Joseph Weizenbaum, MIT, 1966). Source: <a href="https://github.com/critical-code-studies/ELIZA">github.com/critical-code-studies/ELIZA</a>. All project documents &copy; 2024&ndash;2026 the authors, except where indicated.</p>
    </div>
  </footer>

</body>
</html>
`.replace(/&mdash;/g, ', ');
}

// every page is run through this to guarantee the house style (no em dashes)
function clean(s) { return s.replace(/—/g, ' - '); }
function write(file, html) { fs.writeFileSync(path.join(OUT, file), clean(html)); }

// a doubly-linked (SLIP) list drawn as cells with forward (next) and backward
// (prev) links. values = middle texts; opts.labels annotates the first cell's
// fields and shows a legend.
// a doubly-linked SLIP list: clean datum cells joined by next (forward) and prev
// (backward) link arrows. The cell holds the datum; the links do the organising.
function slipChain(values, opts) {
  opts = opts || {};
  var ink = opts.paper
    ? { box: 'rgba(20,13,9,0.05)', stroke: 'rgba(20,13,9,0.5)', text: '#2c2318', fwd: '#b5462a', bwd: '#8a5a1f' }
    : { box: 'rgba(232,228,218,0.05)', stroke: 'rgba(232,228,218,0.4)', text: '#e8e3d7', fwd: '#ef6f44', bwd: '#f0a83a' };
  var uid = (opts.id || (opts.paper ? 'p' : 'd') + values.join('').replace(/[^A-Za-z0-9]/g, '') || 'x').toLowerCase();
  var cellW = 100, cellH = 48, pitch = 150, x0 = 24;
  var yTop = opts.labels ? 42 : 24;
  var H = yTop + cellH + 14;
  var n = values.length;
  var s = '<svg viewBox="0 0 660 ' + H + '" role="img" aria-label="' + (opts.alt || 'doubly linked list') + '" style="width:100%;height:auto;display:block">';
  s += '<defs>'
    + '<marker id="fwd-' + uid + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L8 5 L1 9" fill="none" stroke="' + ink.fwd + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>'
    + '<marker id="bwd-' + uid + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L8 5 L1 9" fill="none" stroke="' + ink.bwd + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>'
    + '</defs>';
  if (opts.labels) {
    s += '<text x="' + x0 + '" y="22" font-family="ui-monospace,Menlo,monospace" font-size="11" fill="' + ink.fwd + '">&#8594; next link</text>';
    s += '<text x="' + (x0 + 150) + '" y="22" font-family="ui-monospace,Menlo,monospace" font-size="11" fill="' + ink.bwd + '">&#8592; prev link</text>';
  }
  for (var i = 0; i < n; i++) {
    var x = x0 + i * pitch;
    s += '<rect x="' + x + '" y="' + yTop + '" width="' + cellW + '" height="' + cellH + '" rx="6" fill="' + ink.box + '" stroke="' + ink.stroke + '"/>';
    s += '<text x="' + (x + cellW / 2) + '" y="' + (yTop + cellH / 2 + 5) + '" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="14" fill="' + ink.text + '">' + (values[i] || '') + '</text>';
    if (i < n - 1) s += '<line x1="' + (x + cellW + 3) + '" y1="' + (yTop + 16) + '" x2="' + (x0 + (i + 1) * pitch - 4) + '" y2="' + (yTop + 16) + '" stroke="' + ink.fwd + '" stroke-width="1.5" marker-end="url(#fwd-' + uid + ')"/>';
    if (i > 0) s += '<line x1="' + (x - 3) + '" y1="' + (yTop + 32) + '" x2="' + (x0 + (i - 1) * pitch + cellW + 4) + '" y2="' + (yTop + 32) + '" stroke="' + ink.bwd + '" stroke-width="1.5" marker-end="url(#bwd-' + uid + ')"/>';
  }
  s += '</svg>';
  return s;
}

// a single SLIP cell, drawn as an information carrier: a datum held between a
// previous and a next pointer (the arrows reach out to its neighbours).
function slipCell(opts) {
  opts = opts || {};
  var ink = opts.paper
    ? { box: 'rgba(20,13,9,0.05)', stroke: 'rgba(20,13,9,0.5)', text: '#2c2318', fwd: '#b5462a', bwd: '#8a5a1f' }
    : { box: 'rgba(232,228,218,0.05)', stroke: 'rgba(232,228,218,0.45)', text: '#e8e3d7', fwd: '#ef6f44', bwd: '#f0a83a' };
  var u = 'cell' + (opts.paper ? 'p' : 'd');
  var s = '<svg viewBox="0 0 480 116" role="img" aria-label="a SLIP cell: a datum held between a previous and a next pointer" style="width:100%;height:auto;display:block;max-width:480px;margin:0 auto">';
  s += '<defs>'
    + '<marker id="f-' + u + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L8 5 L1 9" fill="none" stroke="' + ink.fwd + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>'
    + '<marker id="b-' + u + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L8 5 L1 9" fill="none" stroke="' + ink.bwd + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>'
    + '</defs>';
  s += '<text x="118" y="44" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="12" fill="' + ink.bwd + '">prev</text>';
  s += '<text x="362" y="44" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="12" fill="' + ink.fwd + '">next</text>';
  s += '<line x1="182" y1="66" x2="58" y2="66" stroke="' + ink.bwd + '" stroke-width="1.6" marker-end="url(#b-' + u + ')"/>';
  s += '<line x1="298" y1="66" x2="422" y2="66" stroke="' + ink.fwd + '" stroke-width="1.6" marker-end="url(#f-' + u + ')"/>';
  s += '<rect x="185" y="46" width="110" height="40" rx="6" fill="' + ink.box + '" stroke="' + ink.stroke + '"/>';
  s += '<text x="240" y="71" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="15" fill="' + ink.text + '">datum</text>';
  s += '</svg>';
  return s;
}

// deterministic, period-plausible time-of-day + CPU figure, stable per command
function fanStamp(seed) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hh = 8 + (h % 11), mm = (h >>> 4) % 60, t = (h >>> 10) % 10;
  const tod = String(hh).padStart(2, '0') + String(mm).padStart(2, '0') + '.' + t; // hhmm.t
  const cpu = '.' + String(((h >>> 16) % 90) + 10);                                 // .NN cpu seconds
  return { tod, cpu };
}

// shape a typed command into a period-correct session for a given machine.
// CTSS: supervisor prints W (working) then, after output, R (ready) with times.
// ITS: DDT ':' command, '*' prompt returns. UNIX: '$' prompt. PDP1: bare. NONE: verbatim.
function fanSession(cmds, system) {
  const up = s => s.toUpperCase(), low = s => s.toLowerCase();
  switch (system) {
    case 'CTSS': {
      const head = cmds.map(up), { tod, cpu } = fanStamp(cmds.join(' '));
      head.push('W ' + tod);
      return { head, foot: ['R ' + tod + '+' + cpu] };
    }
    case 'ITS':  return { head: cmds.map(c => ':' + up(c)), foot: ['*'] };
    case 'UNIX': return { head: cmds.map(c => '$ ' + low(c)), foot: ['$'] };
    case 'PDP1': return { head: cmds.map(up), foot: [] };
    default:     return { head: cmds.slice(), foot: [] }; // NONE
  }
}

function fanEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

// banner: a short word becomes a boxed ASCII title; a multi-line string is used
// verbatim, so you can paste figlet output or image-to-ASCII from an external
// tool (jp2a, image-to-ascii, etc.) and it lands at the top of the plate.
function fanBanner(text) {
  if (!text) return '';
  const raw = String(text);
  let art;
  if (raw.indexOf('\n') !== -1) {
    art = fanEsc(raw.replace(/\s+$/, ''));
  } else {
    const t = raw.toUpperCase().split('').join(' ');
    const bar = '+' + '-'.repeat(t.length + 4) + '+';
    art = fanEsc(bar + '\n|  ' + t + '  |\n' + bar);
  }
  return `<pre class="ff-banner" aria-hidden="true">${art}</pre>`;
}

// reusable fanfold (continuous-form) plate, printed on archival paper with
// tractor-feed holes (see .fanfold in site.css). See docs/FANFOLD.md for the guide.
//   cmd   command string the `opts.system` shapes into a session (CTSS W/R, ITS,
//         UNIX, PDP1, NONE), OR an array of lines used verbatim.
//   opts  string (shorthand for {system}) or object:
//         { system, age:'clean|aged|damaged', sprockets:true|false|'torn',
//           stain:'coffee', edge:'burned|ripped', banner:'WORD'|ascii, overlay:html }
function fanfold(cmd, inner, opts) {
  opts = (typeof opts === 'string') ? { system: opts } : (opts || {});
  const system = (opts.system || 'CTSS').toUpperCase();
  const cls = ['fanfold'];
  if (opts.age && opts.age !== 'clean') cls.push(opts.age);                 // aged | damaged
  if (opts.sprockets === false) cls.push('no-sprockets');
  else if (opts.sprockets === 'torn') cls.push('torn');
  if (opts.stain) { cls.push('coffee'); if (typeof opts.stain === 'string' && /^coffee-/.test(opts.stain)) cls.push(opts.stain); if (opts.stainPos) cls.push('coffee-' + opts.stainPos); } // size: coffee-small|large; pos: stainPos 'tl'|'tr'|'bl'|'br'
  if (opts.edge && opts.edge !== 'plain') cls.push(opts.edge);             // burned | ripped
  const lines = arr => arr.map(l => `<div class="cmd-line">${l}</div>`).join('');
  // an empty/absent cmd makes a plain paper plate (for a figure, image or diagram)
  const hasCmd = Array.isArray(cmd) ? cmd.length > 0 : (cmd != null && cmd !== '');
  let headHtml = '', footHtml = '';
  if (hasCmd) {
    const { head, foot } = Array.isArray(cmd) ? { head: cmd, foot: [] } : fanSession([cmd], system);
    headHtml = `<div class="fanfold-cmd">${lines(head)}</div>`;
    if (foot.length) footHtml = `\n        <div class="fanfold-cmd fanfold-foot">${lines(foot)}</div>`;
  }
  const banner = fanBanner(opts.banner);
  const overlay = opts.overlay ? `\n        <div class="ff-overlay" aria-hidden="true">${opts.overlay}</div>` : '';   // above the text
  const underlay = opts.underlay ? `\n        <div class="ff-underlay" aria-hidden="true">${opts.underlay}</div>` : ''; // behind the text
  return `<div class="${cls.join(' ')}">${underlay}${overlay}
        ${banner}${headHtml}
${inner}${footHtml}
      </div>`;
}

const TEAM = [
  ['David M. Berry', 'Professor of Digital Humanities, University of Sussex', 'Writes widely on philosophy and technology, particularly computation, software and algorithms; recent work addresses explainability, human understanding, and the history of the university. Co-discovered the original ELIZA source in the MIT archive.', 'berry.png'],
  ['Sarah Ciston', 'Professor of Computational Thinking and Aesthetic Doing, Academy of Media Arts Cologne', 'Builds critical-creative tools to bring intersectional approaches to machine learning. Winner of the 2025 Ars Electronica STARTS Grand Prize. Author of <em>A Critical Field Guide to Working with Machine Learning Datasets</em> and founder of Code Collective.', 'ciston.png'],
  ['Anthony C. Hay', 'Programmer (formerly Digital Research, Novell); BSc, Imperial College London', 'Wrote a near-perfect clone of the original MAD-SLIP ELIZA in C++, first from Weizenbaum&rsquo;s 1966 paper, later corrected against the recovered MIT source. Untangled the &ldquo;certain counting mechanism&rdquo; behind ELIZA&rsquo;s memory.', 'hay.png'],
  ['Mark C. Marino', 'Professor of Writing, USC; Director, Humanities and Critical Code Studies (HaCCS) Lab', 'Scholar of electronic literature; author of <em>Critical Code Studies</em> (MIT Press) and co-author of <em>10 PRINT CHR$(205.5+RND(1))</em>. Director of Communication for the Electronic Literature Organization.', 'marino.png'],
  ['Peter Millican', 'Professor of Philosophy, Hertford College, Oxford', 'Founder of Oxford&rsquo;s Computer Science and Philosophy degree (2012). Author of the Elizabeth chatbot (2000), built to engage humanities students with the mechanics of conversation.', 'millican.png'],
  ['Arthur I. Schwarz', 'Software developer and technical lead (aerospace, automotive); BS Physics, MS Computer Science', 'Developed gSlip, a public-domain implementation of SLIP, the list-processing library underpinning ELIZA. Interests include hashing algorithms and anomaly detection.', 'schwarz.png'],
  ['Jeff Shrager', 'Adjunct Professor, Symbolic Systems, Stanford; Chief Scientist, Blue Dot Change', 'Self-described &ldquo;aging Lisp hacker&rdquo; who rediscovered Weizenbaum&rsquo;s original MAD-SLIP ELIZA in the MIT archive in 2021. Curator of ELIZAgen.org; co-author of 100+ AI publications and co-founder of three biomedical AI startups.', 'shrager.png'],
  ['Peggy Weil', 'Adjunct Assistant Professor, USC School of Cinematic Arts', 'Multidisciplinary artist; did graduate work at the MIT Media Lab&rsquo;s Architecture Machine Group in the early 1980s. Created MrMind, the first net-art chatbot. Her work addresses physical, digital and sociopolitical questions.', 'weil.png']
];

// ---------------------------------------------------------------------------
// HOME
// ---------------------------------------------------------------------------
// the recovered source, listed faint behind the hero as a sheet of fanfold desk paper
const HERO_SRC = fanEsc(fs.readFileSync(path.join(OUT, 'sources', 'ELIZA-1965b.mad'), 'utf8')).replace(/\s+$/, '');

// the ELIZA wordmark, drawn from the Iosevka 800 outlines (closest type to the
// 7094 line printer). Self-contained vector, so no webfont download. Used both
// for the hero title and the masthead brand.
function elizaWordmark(cls) {
  return '<svg class="' + cls + '" viewBox="0 -735 2500 735" aria-hidden="true" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g transform="scale(1,-1)"><path transform="translate(0 0)" d="M66 0V735H442V630H190V435H385V330H190V105H442V0Z"/><path transform="translate(500 0)" d="M86 0V735H210V105H448V0Z"/><path transform="translate(1000 0)" d="M75 0V105H188V630H75V735H425V630H312V105H425V0Z"/><path transform="translate(1500 0)" d="M58 0V105L300 630H58V735H442V630L200 105H442V0Z"/><path transform="translate(2000 0)" d="M35 0 179 735H321L465 0H339L314 155H186L161 0ZM297 260 260 490Q257 505 254.5 519.5Q252 534 250 549Q248 534 245.5 519.5Q243 505 240 490L203 260Z"/></g></svg>';
}

// the IBM 7094 indicator register display: status lamps + the instruction and
// instruction-counter bit rows. Vector recreation; a deterministic scatter of
// lit lamps so the build stays reproducible.
function regLamp(on) { return '<i class="rl' + (on ? ' on' : '') + '"></i>'; }
function regBits(n, start) {
  var s = '';
  for (var i = 0; i < n; i++) {
    var num = start + i;
    var on = ((num * 5 + 2) % 7 === 0) || ((num * 3) % 11 === 0);
    s += '<span class="reg-bit"><b>' + num + '</b>' + regLamp(on) + '</span>';
    if ((i + 1) % 6 === 0 && i < n - 1) s += '<span class="reg-div"></span>';
  }
  return s;
}
function regStat(label, on) { return '<span class="reg-stat"><b>' + label + '</b>' + regLamp(on) + '</span>'; }
const REGISTER = `
         <div class="register" aria-hidden="true">
          <div class="reg-row reg-status">
           ${regStat('Trap', false)}<span class="reg-div"></span>${regStat('Simulate', true)}<span class="reg-div"></span>${regStat('Accumulator<br>Overflow', false)}<span class="reg-div"></span>${regStat('Quotient<br>Overflow', false)}<span class="reg-div"></span>${regStat('Read/Write<br>Select', true)}<span class="reg-div"></span>${regStat('Divide<br>Check', false)}<span class="reg-gap"></span>
           <span class="reg-stat sense"><b>Sense</b><span class="sense-lamps"><span class="reg-bit"><b>1</b>${regLamp(false)}</span><span class="reg-bit"><b>2</b>${regLamp(true)}</span><span class="reg-bit"><b>3</b>${regLamp(false)}</span><span class="reg-bit"><b>4</b>${regLamp(false)}</span></span></span>
          </div>
          <div class="reg-row reg-bits"><span class="reg-caption">Instruction</span><div class="bit-row">${regBits(18, 1)}</div></div>
          <div class="reg-row reg-bits"><span class="reg-caption">Instruction Counter</span><div class="bit-row">${regBits(18, 19)}</div></div>
         </div>`;
const homeHero = `  <section class="hero hero-desk">
    <div class="hero-paper" aria-hidden="true"><pre class="hero-source">${HERO_SRC}
${HERO_SRC}</pre></div>
    <div class="hero-inner">
      <div class="wrap">
       <div class="hero-panel console">
        <div class="console-head">
          <span class="nameplate"><b class="np-num">7094</b><span class="np-sys">Data Processing System</span></span>
        </div>
        <div class="console-face">
         <div class="console-top">
          <div class="face-titles">
           <p class="boot">JOSEPH WEIZENBAUM // 1966</p>
           <h1 class="wm">${elizaWordmark('hero-wordmark')}<span class="vh">ELIZA</span></h1>
           <p class="sub">The first chatbot</p>
           <p class="tagline">In 1966 Joseph Weizenbaum gave people their first conversation with a machine. In 2021 we found its lost source code. This is a close reading of ELIZA: its program, its DOCTOR script, its many versions, and what it still tells us about artificial intelligence.</p>
          </div>
          <div class="control-column">
           <button class="ctl power" id="power-btn" type="button" aria-label="Power" aria-pressed="false">POWER</button>
           <span class="ctl chk" aria-hidden="true">CEN CPU<br>PWR CHK</span>
           <span class="ctl chk" aria-hidden="true">I/O<br>PWR CHK</span>
           <span class="ctl chk" aria-hidden="true">+6<br>MOD CHK</span>
           <span class="ctl chk" aria-hidden="true">-12<br>MOD CHK</span>
           <button class="ctl power on" id="info-btn" type="button" aria-haspopup="dialog">DAISY<br>DAISY</button>
           <span class="ctl off" aria-hidden="true">NORMAL<br>OFF</span>
           <span class="ctl off" aria-hidden="true">POWER<br>ON</span>
          </div>
         </div>
${REGISTER}
         <div class="hero-actions">
           <a class="rocker-btn" href="how.html"><span class="rk-label">Watch how it works</span><span class="rocker"><span class="switch-left">On</span><span class="switch-right">Off</span></span></a>
           <a class="rocker-btn" href="try.html"><span class="rk-label">Talk to ELIZA</span><span class="rocker"><span class="switch-left">On</span><span class="switch-right">Off</span></span></a>
           <a class="rocker-btn" href="overview.html"><span class="rk-label">Start reading</span><span class="rocker"><span class="switch-left">On</span><span class="switch-right">Off</span></span></a>
         </div>
        </div>
       </div>
      </div>
    </div>
  </section>
  <div class="modal" id="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-title" hidden>
    <div class="modal-box">
      <button class="modal-close" type="button" aria-label="Close">&times;</button>
      <h2 id="info-title">Daisy Bell, and HAL</h2>
      <p>A recording made at Bell Labs in Murray Hill, New Jersey, on an IBM 7094 mainframe in 1961 is the earliest known recording of a computer-synthesised voice singing a song: <em>Daisy Bell</em>, also known as &ldquo;Bicycle Built for Two.&rdquo; It was programmed by the physicist John L. Kelly Jr. and Carol Lockbaum, with musical accompaniment by the computer-music pioneer Max Mathews.</p>
      <p>The novelist Arthur C. Clarke witnessed a demonstration while visiting his friend John R. Pierce, an electrical engineer and science-fiction writer then at Bell Labs. Clarke was so struck by it that he wrote the 7094&rsquo;s performance into both the 1968 novel and the screenplay for <em>2001: A Space Odyssey</em>. One of the first things Clarke&rsquo;s HAL 9000 had learned was &ldquo;Daisy Bell&rdquo;, and near the end, as the astronaut Dave Bowman deactivates it, the machine loses its mind and degenerates into singing it.</p>
      <p class="modal-cue">Press <strong>POWER</strong> to hear it.</p>
      <p class="modal-src"><a href="https://www.historyofinformation.com/index.php?str=7094#entry_3986" target="_blank" rel="noopener">historyofinformation.com</a></p>
    </div>
  </div>`;

const homeBody = `
    <section class="block lede">
      <span class="kicker">The ELIZA Archaeology Project</span>
      <p>ELIZA was a small program with an enormous afterlife. Written in MAD-SLIP on MIT&rsquo;s Compatible Time-Sharing System, it let a person type ordinary English and receive a reply that seemed to understand. People confided in it. Weizenbaum spent the rest of his life warning us not to.</p>
    </section>

    <section class="block">
      <h2>Inventing ELIZA</h2>
      <figure class="figure portrait">
        <img src="assets/images/weizenbaum-1980s.jpg" alt="Joseph Weizenbaum in the 1980s" loading="lazy">
        <figcaption>Joseph Weizenbaum, who wrote ELIZA and then spent his life warning against it (1980s).</figcaption>
      </figure>
      <p>This is an interdisciplinary investigation of ELIZA as a cultural and technical artifact, built around the original source code we recovered from Weizenbaum&rsquo;s papers in the MIT archive in 2021. We read the code, the DOCTOR script, the hardware it ran on, and the long shadow it cast over how we talk about thinking machines.</p>
      <p>It is a companion to the Critical Code Studies group&rsquo;s collectively authored book <a href="book.html"><em>Inventing ELIZA</em></a> (MIT Press).</p>
      <p>As we reach the sixtieth anniversary of ELIZA&rsquo;s public debut, the book sets the rediscovered source code beside scripts that had been missing for decades, drawing on archival research at MIT, Stanford and UCLA. Together they reveal a far more sophisticated system than the famous DOCTOR demonstration ever suggested: a conversational programming environment, assembled incrementally between 1965 and 1968, with capabilities well ahead of its time.</p>
      ${fanfold('LISTF', `<div class="index-list">
        <a class="index-row" href="overview.html"><span class="ix-obj">Read</span><span class="ix-ttl">Overview</span><span class="ix-desc">What ELIZA actually was, and why DOCTOR is not the same thing as ELIZA.</span></a>
        <a class="index-row" href="code.html"><span class="ix-obj">The code</span><span class="ix-ttl">The program</span><span class="ix-desc">A close reading of the recovered MAD-SLIP source, line by line.</span></a>
        <a class="index-row" href="doctor.html"><span class="ix-obj">The script</span><span class="ix-ttl">DOCTOR</span><span class="ix-desc">Weizenbaum&rsquo;s Rogerian therapist script, and how its patterns work.</span></a>
        <a class="index-row" href="doctor.html#dictionary"><span class="ix-obj">The dictionary</span><span class="ix-ttl">DOCTOR dictionary</span><span class="ix-desc">Every keyword DOCTOR knows: filter the list, then read the rules behind each one.</span></a>
        <a class="index-row" href="how.html"><span class="ix-obj">Watch</span><span class="ix-ttl">How it works</span><span class="ix-desc">Type a phrase and step through ELIZA&rsquo;s rules, from keywords to reply.</span></a>
        <a class="index-row" href="try.html"><span class="ix-obj">Talk</span><span class="ix-ttl">Try ELIZA</span><span class="ix-desc">A faithful re-creation that runs the genuine 1966 script in your browser.</span></a>
      </div>`)}
    </section>

    <div class="rule">FROM ITS CODE TO ITS IMPACT ON TECHNOCULTURE</div>

    <section class="block">
      <h2>ELIZA is a multiplicity</h2>
      <p>For sixty years a proliferation of BASIC and Lisp copies treated the DOCTOR therapy script as if it were ELIZA itself, rather than one demonstration of a general-purpose system. The archive tells a richer story: at least five major versions between 1965 and 1968, and scripts far beyond DOCTOR, from arithmetic tutoring to a Nixon parody. The program reached print in the January 1966 <cite>Communications of the ACM</cite>; the roughly 420 lines of MAD-SLIP behind it stayed lost until we recovered the source from the MIT archive in 2021.</p>
    </section>

    <div class="rule">A KEYWORD THAT IS NOT A WORD</div>

    <section class="block">
      <span class="kicker">Inside the DOCTOR script</span>
      <h2>DIT, and how ELIZA fakes a vocabulary</h2>
      <p>One of DOCTOR&rsquo;s keywords, <code>DIT</code>, is not an English word at all. Weizenbaum invented it as a collecting point for a single set of replies, the ones about likeness and resemblance:</p>
      <pre class="listing">(DIT
    ((0)
        (IN WHAT WAY)
        (WHAT RESEMBLANCE DO YOU SEE)
        (WHAT DOES THAT SIMILARITY SUGGEST TO YOU)
        (WHAT OTHER CONNECTIONS DO YOU SEE)
        (WHAT DO YOU SUPPOSE THAT RESEMBLANCE MEANS)
        (WHAT IS THE CONNECTION, DO YOU SUPPOSE)
        (COULD THERE REALLY BE SOME CONNECTION)
        (HOW)))</pre>
      <p>Three near-synonyms carry no replies of their own. Each is defined as nothing but a pointer to <code>DIT</code>:</p>
      <pre class="listing">(ALIKE 10 (=DIT))
(SAME  10 (=DIT))
(LIKE  10 (=DIT))</pre>
      <p>The <code>(=DIT)</code> directive tells ELIZA to substitute <code>DIT</code> and run its rules instead. So &ldquo;Men are all alike&rdquo; matches <code>ALIKE</code>, defers to <code>DIT</code>, and produces &ldquo;IN WHAT WAY&rdquo;, the famous first line of the 1966 dialogue. The <code>=</code> is how ELIZA builds <em>equivalence classes</em> of keywords: rather than repeat the resemblance replies under three headings, Weizenbaum routes them all through one artificial token. It is a small economy, and it gives away the whole trick. ELIZA recognises a keyword and pours your own words into a shared template; it understands nothing. <a href="how.html">Watch this happen step by step &rsaquo;</a></p>
    </section>

    <section class="block">
      <div class="book-promo">
        <a class="book-promo-img" href="book.html"><img src="assets/images/eliza-book-2026.png" alt="Inventing ELIZA (MIT Press, Software Studies)" loading="lazy"></a>
        <div class="book-promo-text">
          <span class="kicker">MIT Press &middot; Software Studies</span>
          <h2>Inventing ELIZA</h2>
          <p>How the First Chatbot Shaped the Future of AI. The story of how the lost source was recovered, and what a close reading reveals about the program and the politics it still carries. Written by the full project team.</p>
          <p><a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/">Order from MIT Press &rsaquo;</a> &nbsp; <a href="book.html">About the book &rsaquo;</a></p>
        </div>
      </div>
    </section>

    <section class="block callout">
      <span class="kicker">Hidden in the machine</span>
      <p>Somewhere on this site the DOCTOR is still listening. If you find her, she will answer in the words of the genuine 1966 script. Nothing you say leaves your browser.</p>
    </section>
`;

write('index.html', page({
  title: 'The first chatbot',
  desc: 'A Critical Code Studies reading of ELIZA, Joseph Weizenbaum’s 1966 chatbot, built on the original source recovered from the MIT archive.',
  hero: homeHero, body: homeBody,
  scripts: ['console.js']
}));

// ---------------------------------------------------------------------------
// OVERVIEW
// ---------------------------------------------------------------------------
write('overview.html', page({
  title: 'Overview', desc: 'What ELIZA was: a general-purpose conversational system, of which DOCTOR was only one script.',
  body: `
      <span class="kicker">Overview</span>
      <h1 class="page">What ELIZA was</h1>
      <div class="lede"><p>ELIZA was the world&rsquo;s first chatbot: the first program that let a person hold a conversation with a computer in ordinary language. Joseph Weizenbaum wrote it at MIT between roughly 1964 and 1966, on an IBM 7094 running the Compatible Time-Sharing System (CTSS), as part of Project MAC.</p></div>

      <h2>A system, not a single program</h2>
      <p>ELIZA itself is an engine. It reads a <em>script</em> &mdash; a list of keywords and transformation rules &mdash; and uses it to turn what you type into a reply. DOCTOR, the script that made ELIZA famous, made it answer like a Rogerian psychotherapist: offering little of its own, mostly reflecting your words back as questions. DOCTOR is the most renowned script, but it is only one of many possibilities for the ELIZA system. <a href="doctor.html">Read the DOCTOR script &rsaquo;</a></p>

      <figure class="figure">
        <img src="assets/images/ai-pioneers-1968.jpg" alt="Claude Shannon, John McCarthy, Ed Fredkin and Joseph Weizenbaum at MIT, April 1968" loading="lazy">
        <figcaption>The world ELIZA came from: Claude Shannon, John McCarthy, Ed Fredkin and Joseph Weizenbaum at MIT, April 1968.</figcaption>
      </figure>

      <h2>How a reply is made</h2>
      <p>Weizenbaum&rsquo;s 1966 paper describes the whole mechanism in a few pages. The recovered source shows it working in detail:</p>
      <ul class="method">
        <li data-n="1"><b>Read the script</b> &mdash; load a file of keywords, each with decomposition and reassembly rules.</li>
        <li data-n="2"><b>Greet</b> &mdash; print the opening line (&ldquo;HOW DO YOU DO. PLEASE TELL ME YOUR PROBLEM&rdquo;).</li>
        <li data-n="3"><b>Scan</b> &mdash; take the user&rsquo;s sentence, apply word substitutions, and find the highest-ranked keyword.</li>
        <li data-n="4"><b>Decompose</b> &mdash; match the sentence against that keyword&rsquo;s patterns, splitting it into numbered parts.</li>
        <li data-n="5"><b>Reassemble</b> &mdash; slot those parts into a reply template, and print it.</li>
        <li data-n="6"><b>Loop</b> &mdash; wait for the next line, and occasionally recall something you said earlier.</li>
      </ul>
      <p style="margin-top:1.4rem"><a href="how.html">Watch these steps run on a phrase of your own &rsaquo;</a></p>

      <div class="callout"><span class="kicker">The trick, and the point</span><p>ELIZA never understands anything. It rearranges your own words. Weizenbaum was disturbed that people knew this and confided in it anyway. The gap between what the program does and what people believe it does is what we now call the ELIZA effect.</p></div>

      <h2>The machine it ran on</h2>
      <p>There were no screens. People talked to ELIZA on teletypes, electromechanical printers like the IBM 2741 and the Teletype Model 33, which struck characters onto a roll of paper at ten to fourteen characters a second. The conversation was a physical object: ink on a page, produced together by a person and a machine. <a href="blog/post.html?p=2-talking-to-eliza-on-an-asr-33-teletype">Talking to ELIZA on an ASR 33 &rsaquo;</a></p>
      <figure class="figure half">
        <img src="assets/images/eliza-1967-twenty-first-century.jpg" alt="ELIZA being used on a teletype in 1967" loading="lazy">
        <figcaption>ELIZA in use in 1967, filmed for the documentary <em>The Twenty-First Century</em>, &lsquo;The Communications Revolution&rsquo; (first broadcast 1967).</figcaption>
      </figure>

      <div class="rule">FURTHER</div>
      <div class="reading">
        <ul>
          <li><a href="code.html">The program</a> &mdash; the recovered MAD-SLIP source, read closely.</li>
          <li><a href="versions.html">The versions</a> &mdash; at least five ELIZAs between 1965 and 1968.</li>
          <li><a href="try.html">Try ELIZA</a> &mdash; the genuine 1966 script, running in your browser.</li>
        </ul>
      </div>
`}));

// ---------------------------------------------------------------------------
// CODE / THE PROGRAM
// ---------------------------------------------------------------------------
const listing = `<span class="seq">        </span><span class="lbl">ELIZA</span>   <span class="kw">MAD</span>
            <span class="kw">EXTERNAL FUNCTION</span> (MYTRAN,KEY)
            <span class="kw">NORMAL MODE IS INTEGER</span>
            <span class="kw">PRINT COMMENT</span> <span class="str">$WHICH SCRIPT DO YOU WISH TO PLAY$</span>
<span class="lbl">START</span>       LISTRD.(MTLIST.(INPUT),0)
            T'H SCAN, FOR WORD=POPTOP.(INPUT)
                I=<span class="kw">HASH</span>.(WORD,5)
                <span class="kw">W'R</span> LISTMT.(KEY(I)) .NE. 0, <span class="kw">T'O</span> SCAN
                S=SEQRDR.(KEY(I))
<span class="lbl">FOUND</span>       KEYWRD=SEQLR.(S,F)
<span class="lbl">TRY</span>         <span class="kw">W'R</span> YMATCH.(TOP.(ES),INPUT,MTLIST.(TEST)) .E. 0, <span class="kw">T'O</span> MATCH
<span class="lbl">MATCH</span>       ASSMBL.(REASMB,TEST,OUTPUT)
            TPRINT.(OUTPUT,0)
            <span class="kw">T'O</span> START
<span class="lbl">NOMATCH(1)</span>  <span class="kw">PRINT COMMENT</span> <span class="str">$PLEASE CONTINUE $</span>
<span class="lbl">NOMATCH(2)</span>  <span class="kw">PRINT COMMENT</span> <span class="str">$HMMM $</span>
<span class="lbl">NOMATCH(3)</span>  <span class="kw">PRINT COMMENT</span> <span class="str">$GO ON , PLEASE $</span>
<span class="lbl">NOMATCH(4)</span>  <span class="kw">PRINT COMMENT</span> <span class="str">$I SEE $</span>`;

// full recovered MAD-SLIP source, read at build time and listed on a fanfold plate
const madFull = fs.readFileSync(path.join(OUT, 'sources', 'ELIZA-1965b.mad'), 'utf8')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\s+$/, '');

write('code.html', page({
  title: 'The program', desc: 'A close reading of the recovered ELIZA MAD-SLIP source code.',
  body: `
      <span class="kicker">The code</span>
      <h1 class="page">The program</h1>
      <div class="lede"><p>ELIZA was written in MAD-SLIP: the MAD procedural language, extended with SLIP, Weizenbaum&rsquo;s own Symmetric List Processor for handling lists. The recovered listing is about 420 lines. Reading it is an exercise in software archaeology.</p></div>

      <h2>MAD, abbreviated</h2>
      <p>MAD is a procedural language in the FORTRAN family, but with wordy keywords that programmers shortened: <code>W'R</code> for <code>WHENEVER</code>, <code>T'O</code> for <code>TRANSFER TO</code>, <code>T'H</code> for <code>THROUGH</code>. These contractions made sense at a teletype in 1965; decades later they are part of what makes the code hard to read. CTSS itself stored text in 6-bit BCD, packing six characters into a 36-bit word, a reminder of computing before ASCII was standard.</p>

      <h2>The heart of the loop</h2>
      <p>The main ELIZA function reads a sentence, hashes each word to find a keyword in the <code>KEY</code> table, matches the sentence with <code>YMATCH</code> (decomposition), and builds a reply with <code>ASSMBL</code> (reassembly). When nothing matches, it falls back to one of four holding phrases:</p>
      <pre class="listing">${listing}</pre>
      <p class="post-meta" style="margin-top:1rem">Excerpt, ELIZA-1965b.mad. The full recovered source is in the <a href="https://github.com/critical-code-studies/ELIZA">repository</a> and the <a href="https://hdl.handle.net/1721.3/201699">MIT archive</a>.</p>

      <h2>What the code revealed</h2>
      <p>Some things in the source were never explained in the published paper.</p>
      <div class="callout"><span class="kicker">The certain counting mechanism</span><p>Weizenbaum wrote that a memory is recalled when &ldquo;a certain counting mechanism is in a particular state&rdquo;, and implied the choice was random. The source shows otherwise: a counter cycles 1&ndash;4 through the replies, and only on 4 is a memory recalled; the memory template is chosen by a hash of the last word you typed. Nothing random about it. <a href="blog/post.html?p=1-a-certain-counting-mechanism">Read more &rsaquo;</a></p></div>

      <div class="callout"><span class="kicker">PLEASE INSTRUCT ME</span><p>The recovered version contains a <code>CHANGE</code> function, an interactive editor that let a user rewrite ELIZA&rsquo;s script while it was running. It was barely mentioned in the 1966 paper and seems to have been lost from every later version. It anticipates, by decades, the idea of a system you reshape by talking to it.</p></div>

      <h2>Reconstruction</h2>
      <p>Several functions were missing from the recovered listing and had to be carefully rebuilt: <code>BCDIT</code> (binary to BCD), <code>INLST</code> (used by matching and assembly), <code>LETTER</code> (character classification), and various initialisation routines. The reconstructed ELIZA now runs on an emulated CTSS. As the team behind the emulation put it, &ldquo;running the original code feels good and authentic. Finding bugs in it only adds to the authenticity.&rdquo; <a href="blog/post.html?p=10-reconstructing-eliza">On reconstruction &rsaquo;</a></p>

      <div class="rule">METHOD</div>
      <p>We read the source the way Critical Code Studies reads any code: as a text, within its historical and material context, where naming and structure carry meaning, and so, often, do the bugs. The command vocabulary of the editor (<code>TYPE</code>, <code>SUBST</code>, <code>APPEND</code>, <code>ADD</code>, <code>START</code>, <code>RANK</code>, <code>DISPLA</code>) is a small grammar of power; the iteration over a fixed table is a trace of the machine&rsquo;s limits. <a href="https://electronicbookreview.com/essay/reading-eliza-critical-code-studies-in-action/">Reading ELIZA: CCS in Action &rsaquo;</a></p>

      <div class="rule">THE FULL SOURCE</div>
      <p>The complete recovered listing, <code>ELIZA-1965b.mad</code>, in MAD-SLIP, as a line-printer printout. This is the 1965b version from the printout in Weizenbaum&rsquo;s archive (it adds &ldquo;but&rdquo; as a delimiter and lacks the NEWKEY function), and the basis for the close reading above. Also in the <a href="https://github.com/critical-code-studies/ELIZA">repository</a> and the <a href="https://hdl.handle.net/1721.3/201699">MIT archive</a>.</p>
      ${fanfold('PRINT ELIZA MAD', `<pre class="fanfold-listing">${madFull}</pre>`)}
`}));

// ---------------------------------------------------------------------------
// SLIP
// ---------------------------------------------------------------------------
write('slip.html', page({
  title: 'SLIP', desc: 'SLIP, Weizenbaum’s Symmetric List Processor: the list-processing library that the MAD half of MAD-SLIP relied on to run ELIZA.',
  body: `
      <span class="kicker">The code</span>
      <h1 class="page">SLIP</h1>
      <div class="lede"><p>ELIZA is written in MAD-SLIP: the MAD procedural language, extended with SLIP, Joseph Weizenbaum&rsquo;s own list-processing library. SLIP is the half of MAD-SLIP that gives ELIZA its grip on structure: lists of words, tables of keywords, and the decomposition and reassembly rules that build a reply.</p></div>

      <h2>What SLIP is</h2>
      <p>SLIP stands for <strong>Symmetric LIst Processor</strong>. Weizenbaum designed it around 1962 and described it in the Communications of the ACM in 1963, when the list-processing ideas of IPL and LISP were still new. It is not a standalone language but a set of routines bolted onto a host language, first FORTRAN and then MAD. The version ELIZA used ran on MIT&rsquo;s CTSS on the IBM 7094: MAD for the procedures, SLIP for the lists.</p>

      <h2>Why &ldquo;symmetric&rdquo;</h2>
      <p>SLIP&rsquo;s lists are <strong>doubly linked</strong>: every cell holds a pointer to the next cell and to the previous one. That two-way, symmetric linkage is where the name comes from. It lets a program walk a list forwards or backwards, splice cells in and out from either end, and treat any cell as a place to read from or write to. Free cells are kept on an <strong>Available Space List</strong> (AVSL); creating a list draws cells from it, deleting a list returns them.</p>

      <figure class="figure" style="max-width:none">
        ${fanfold('', slipCell({ paper: true }))}
        <figcaption>Each cell is an information carrier: a datum held between two links, a <span style="color:var(--eliza)">next</span> pointer forward and a <span style="color:var(--lamp-amber)">prev</span> pointer back, with the organisation provided entirely by those pointers. Real SLIP lists also close into a ring through a header cell.</figcaption>
      </figure>

      <h2>A line of dialogue as a list</h2>
      <p>When you type to ELIZA, your words become a SLIP list, one word per cell. Here is the opening line of the 1966 conversation, <em>Men are all alike</em>, held the way ELIZA holds it:</p>
      <figure class="figure" style="max-width:none">
        ${fanfold('', slipChain(['MEN', 'ARE', 'ALL', 'ALIKE'], { paper: true, labels: true, alt: 'the words MEN, ARE, ALL, ALIKE held as a doubly linked SLIP list' }))}
        <figcaption>ELIZA walks this list with a sequence reader (<code>SEQRDR</code> / <code>SEQLR</code>), matches it against a keyword&rsquo;s decomposition pattern, and builds the reply by splicing cells into a new list.</figcaption>
      </figure>

      <h2>What ELIZA added to SLIP</h2>
      <p>The original SLIP has two distinct modes. One handles organisation: the previous and next pointers and the sublists they string together. The other handles data, and in the original it was given short shrift, supporting only integers and real numbers. Weizenbaum extended the data half so a cell could also carry <em>text</em>, the words of a sentence, the keywords of a script, the templates of a reply. Most of the original SLIP is pointer maintenance; most of the SLIP that ELIZA needs is datum handling.</p>

      <h2>How ELIZA uses it</h2>
      <p>Almost every structure in ELIZA is a SLIP list. The user&rsquo;s input is read into a list of words. The script&rsquo;s keywords live in a hash table (<code>KEY</code>) of lists. Each keyword&rsquo;s decomposition and reassembly rules are lists of lists. The memory of what you said is a list of transformed sentences. To produce a reply, ELIZA walks these lists with SLIP&rsquo;s readers, matching and rebuilding as it goes.</p>

      <h2>Reading the idioms</h2>
      <p>Once you know they are SLIP calls, the dense lines of the recovered source begin to read. A few recur throughout:</p>
      <ul>
        <li><code>SEQRDR</code> / <code>SEQLR</code>: make a <em>sequence reader</em> for a list, then read its next cell left to right. This is how ELIZA scans a list.</li>
        <li><code>POPTOP</code> / <code>POPBOT</code>: remove and return the cell at the top (or bottom) of a list.</li>
        <li><code>NEWTOP</code> / <code>NEWBOT</code>: add a new cell at the top (or bottom) of a list.</li>
        <li><code>HASH</code>: turn a word into a table index, used both for the keyword table and for the memory mechanism.</li>
        <li><code>LSSCPY</code>, <code>SUBST</code>, <code>IRALST</code>: copy a list, substitute a cell, and return a list&rsquo;s cells to free space.</li>
      </ul>
      <p>These are the verbs of ELIZA. The <a href="code.html">close reading of the program</a> follows them through the main loop, and the <a href="how.html">step-by-step demo</a> shows the result.</p>

      <div class="callout"><span class="kicker">A living implementation</span><p>SLIP did not stay locked in 1963. Arthur Schwarz, a member of this project, has written <strong>gSlip</strong>, a public-domain implementation of SLIP, which makes it possible to run and study SLIP code today rather than only read it.</p></div>

      <div class="rule">REFERENCE</div>
      <div class="bib"><p class="ref">Weizenbaum, J. (1963) &lsquo;Symmetric List Processor&rsquo;, <em>Communications of the ACM</em>, 6(9), pp. 524&ndash;536.</p></div>
`}));

// ---------------------------------------------------------------------------
// DOCTOR SCRIPT
// ---------------------------------------------------------------------------
write('doctor.html', page({
  title: 'The DOCTOR script', desc: 'Weizenbaum’s Rogerian therapist script for ELIZA: how its keyword rules work, a searchable dictionary of every keyword, and the full 1966 script.',
  scripts: ['eliza-hay.js', 'dict.js'],
  body: `
      <span class="kicker">The code</span>
      <h1 class="page">The DOCTOR script</h1>
      <div class="lede"><p>DOCTOR is the script that made ELIZA famous. It is a list of keywords, each with patterns for taking apart what you say and templates for putting a reply back together. Feed ELIZA this script and it answers like a Rogerian therapist.</p></div>

      <div class="rule" id="dictionary">THE DICTIONARY</div>
      <p>Every word DOCTOR knows, and the rules behind it. Type to filter the keyword list, then click a keyword to read its transformation rules: the <em>decomposition</em> patterns that take your sentence apart, and the <em>reassembly</em> templates that build a reply.</p>
      <div id="dict-app"></div>

      <h2>How a rule works</h2>
      <p>Each keyword carries a rank and a set of rules. A <em>decomposition</em> pattern splits your sentence into numbered parts; a <em>reassembly</em> template builds a reply from those parts. Take the keyword <code>ALIKE</code>, ranked high so it wins over ordinary words:</p>
      <pre class="listing">(ALIKE 10 (=DIT))

(DIT
    ((0)
        (IN WHAT WAY)
        (WHAT RESEMBLANCE DO YOU SEE)
        (WHAT DOES THAT SIMILARITY SUGGEST TO YOU)))</pre>
      <p>Say &ldquo;Men are all alike&rdquo; and <code>ALIKE</code> fires, hands off to <code>DIT</code>, and ELIZA replies &ldquo;IN WHAT WAY&rdquo;. The next time, it cycles to the following template. The famous opening of Weizenbaum&rsquo;s paper is nothing more than this.</p>

      <h2>The canonical conversation</h2>
      <p>This is the exchange Weizenbaum printed in the 1966 CACM paper. Every ELIZA line is produced by the rules in the DOCTOR script. <a href="try.html">Try it yourself &rsaquo;</a></p>
      <div class="dialogue">
        ${dlg([
          ['p',"Men are all alike."],
          ['e',"IN WHAT WAY"],
          ['p',"They're always bugging us about something or other."],
          ['e',"CAN YOU THINK OF A SPECIFIC EXAMPLE"],
          ['p',"Well, my boyfriend made me come here."],
          ['e',"YOUR BOYFRIEND MADE YOU COME HERE"],
          ['p',"He says I'm depressed much of the time."],
          ['e',"I AM SORRY TO HEAR YOU ARE DEPRESSED"],
          ['p',"It's true. I am unhappy."],
          ['e',"DO YOU THINK COMING HERE WILL HELP YOU NOT TO BE UNHAPPY"],
          ['p',"I need some help, that much seems certain."],
          ['e',"WHAT WOULD IT MEAN TO YOU IF YOU GOT SOME HELP"],
          ['p',"Perhaps I could learn to get along with my mother."],
          ['e',"TELL ME MORE ABOUT YOUR FAMILY"],
          ['p',"My mother takes care of me."],
          ['e',"WHO ELSE IN YOUR FAMILY TAKES CARE OF YOU"],
          ['p',"You are like my father in some ways."],
          ['e',"WHAT RESEMBLANCE DO YOU SEE"]
        ])}
      </div>

      <h2>Three scripts, one in progress</h2>
      <p>There are three known contemporaneous DOCTOR scripts: the one published as an appendix to the 1966 paper, and two more (<code>.TAPE. 102</code> and <code>.TAPE. 100</code>) on a printout in Weizenbaum&rsquo;s archive. They are clearly successive drafts: keywords gained extra replies, a misplaced line was fixed, redirects were simplified. The script was built incrementally, almost without a plan, each change improving ELIZA&rsquo;s ability to conceal its lack of understanding. <a href="blog/post.html?p=8-the-doctor-script-a-work-in-progress">The DOCTOR script, a work in progress &rsaquo;</a></p>

      <div class="callout"><span class="kicker">Memory</span><p>One special rule, <code>MEMORY</code>, watches for when you mention something that is &ldquo;yours&rdquo;, stores a transformed version of it, and brings it back later (&ldquo;EARLIER YOU SAID YOUR&hellip;&rdquo;). It is the closest DOCTOR comes to keeping track of a conversation.</p></div>

      <div class="rule">THE FULL SCRIPT</div>
      <p>The whole DOCTOR script as published in the appendix to Weizenbaum&rsquo;s 1966 <cite>Communications of the ACM</cite> paper, transcribed by Anthony C. Hay (<code>DOCTOR.txt</code> in the <a href="https://github.com/critical-code-studies/ELIZA">repository</a>). This is the exact text the engine on this site reads, listed here as a line-printer printout.</p>
      ${fanfold('PRINT DOCTOR', '<pre id="dict-script" class="fanfold-listing"></pre>')}
`}));

// ---------------------------------------------------------------------------
// DICTIONARY (merged into doctor.html; kept as a redirect so old links resolve)
// ---------------------------------------------------------------------------
write('dictionary.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=doctor.html#dictionary">
  <link rel="canonical" href="${SITE}/doctor.html">
  <title>The DOCTOR dictionary &middot; ELIZA (1966)</title>
</head>
<body>
  <p>The DOCTOR dictionary is now part of <a href="doctor.html#dictionary">the DOCTOR script page</a>. Redirecting&hellip;</p>
</body>
</html>
`);

// ---------------------------------------------------------------------------
// VERSIONS
// ---------------------------------------------------------------------------
write('versions.html', page({
  title: 'The versions', desc: 'At least five major versions of ELIZA between 1965 and 1968, and the scripts beyond DOCTOR.',
  body: `
      <span class="kicker">ELIZA</span>
      <h1 class="page">The versions</h1>
      <div class="lede"><p>There was never one ELIZA. The project documents at least five major versions between 1965 and 1968, each with distinct capabilities, and some likely lost for good. ELIZA is better understood as a multiplicity than as a single object.</p></div>

      <ul class="timeline">
        <li><span class="yr">1965a</span><span class="vh">earliest</span><p>Uses only &ldquo;.&rdquo; and &ldquo;,&rdquo; to break input into sentences.</p></li>
        <li><span class="yr">1965b</span><span class="vh">recovered source</span><p>Adds &ldquo;but&rdquo; as a delimiter; lacks the NEWKEY function. This is the version whose printout we recovered, and the basis for the close reading on this site.</p></li>
        <li><span class="yr">1966</span><span class="vh">CACM</span><p>The version described in Weizenbaum&rsquo;s Communications of the ACM paper. Introduces the NEWKEY function and a keyword stack, enabling more contextual memory.</p></li>
        <li><span class="yr">1967</span><span class="vh">OPL</span><p>Sophisticated script handling: evaluators allowing expressions of unlimited complexity, and a generalised script system.</p></li>
        <li><span class="yr">1968+</span><span class="vh">platform</span><p>Multiple simultaneous scripts, inter-script communication, and dynamic editing. Used for computer-assisted education at MIT and Harvard. No source for this version has yet been found.</p></li>
      </ul>

      <h2>Beyond DOCTOR</h2>
      <p>The archive holds evidence of scripts well beyond the Rogerian therapist: <strong>ARITHM</strong> for mathematics tutoring, <strong>YAPYAP</strong> for psychiatric research at Massachusetts General Hospital, <strong>SPACKS</strong> engaging Barry Spacks&rsquo;s poetry about Belsen, and even a Nixon parody. Weizenbaum built ELIZA into a family of programs whose use has been largely forgotten. <a href="blog/post.html?p=11-the-plurality-of-eliza">The plurality of ELIZA &rsaquo;</a></p>

      <div class="callout"><span class="kicker">What is lost</span><p>Despite extensive archival work, no source survives for ELIZA&rsquo;s sophisticated later versions. The OPL-based multi-script platform deployed in classrooms has simply disappeared, leaving only fragments in Project MAC progress reports. The tragedy is not only the missing code, but the absence of the institutional habits that would have preserved it. <a href="blog/post.html?p=5-eliza-version-variation">Version variation &rsaquo;</a></p></div>
`}));

// ---------------------------------------------------------------------------
// TRY ELIZA
// ---------------------------------------------------------------------------
write('try.html', page({
  title: 'Try ELIZA', desc: 'Talk to a faithful re-creation of the 1966 ELIZA, running the genuine DOCTOR script in your browser.',
  scripts: ['eliza-hay.js'],
  body: `
      <span class="kicker">Try ELIZA</span>
      <h1 class="page">Talk to ELIZA</h1>
      <div class="lede"><p>A faithful re-creation of the 1966 ELIZA, running the genuine DOCTOR script in your browser. Type a sentence and press enter; nothing you type leaves your browser.</p></div>
      <p>The replies come from Anthony Hay&rsquo;s exact re-creation of the engine. A few of the original asterisk commands work, type <code>*help</code>. For the full version, with the CACM replay and custom scripts, open Hay&rsquo;s ELIZA <a href="https://anthay.github.io/eliza.html">full screen</a>.</p>
      <div id="try-eliza-mount"></div>
      <p class="post-meta" style="margin-top:0.8rem">Engine: Anthony Hay&rsquo;s CC0 re-creation (<a href="https://github.com/anthay/ELIZA">github.com/anthay/ELIZA</a>), the same one behind the <a href="how.html">step-by-step demo</a>.</p>
`}));

// ---------------------------------------------------------------------------
// HOW IT WORKS (step-by-step demo)
// ---------------------------------------------------------------------------
write('how.html', page({
  title: 'How it works', desc: 'Type a phrase and watch ELIZA process it step by step through the genuine DOCTOR script: keywords, ranking, decomposition and reassembly.',
  scripts: ['eliza-hay.js', 'trace.js'],
  body: `
      <h1 class="page">How it works</h1>
      <div class="lede"><p>Type a sentence and step through exactly what ELIZA does with it.</p></div>
      <div id="trace-app"></div>
      <p class="post-meta" style="margin-top:1rem">Responses by Anthony Hay&rsquo;s CC0 ELIZA engine - the same engine you can talk to on the <a href="try.html">Try ELIZA</a> page.</p>

      <div class="rule">THE DELIMITERS</div>
      <p>ELIZA does not read a whole sentence at once. It scans left to right and breaks the input at three delimiters: the comma, the full stop, and the word <strong>BUT</strong>. Leading clauses that contain no keyword are thrown away; as soon as a clause with a keyword is found, ELIZA stops at the next delimiter and works only on that clause. So &ldquo;You are not very aggressive but I think you don&rsquo;t want me to notice that&rdquo; is cut at <em>but</em>, and ELIZA replies only to &ldquo;you are not very aggressive&rdquo;. The comma and full stop are described in Weizenbaum&rsquo;s 1966 paper; the <strong>BUT</strong> delimiter is present in the recovered source though it is not mentioned there.</p>

      <div class="rule">THE MEMORY</div>
      <p>ELIZA can also &lsquo;remember&rsquo;. When you say something about what is <em>yours</em> (a sentence the <code>MY</code> keyword catches), ELIZA transforms it and files it away. It chooses from <strong>four</strong> memory templates, picked by a hash of the last word you typed, so &ldquo;my mother takes care of me&rdquo; becomes a stored phrase like <em>BUT YOUR MOTHER TAKES CARE OF YOU</em>. These phrases queue up in the order they were made.</p>
      <p>A counter runs quietly alongside, cycling 1, 2, 3, 4. When it reaches <strong>4</strong> and your latest line contains no keyword, ELIZA reaches into the queue and replays the oldest stored phrase instead of a bland &ldquo;please go on&rdquo;. This is the &ldquo;certain counting mechanism&rdquo; Weizenbaum mentioned but never explained; the recovered source shows it exactly, four memory templates (<code>MYTRAN(4)</code>) and a one-to-four counter, with the stored phrases held in an open-ended list. Watch the memory bar in the demo above fill and get pulled out at the end as you play the 1966 conversation.</p>

      <p class="micro" style="margin-top:2.4rem;font-size:0.72rem;letter-spacing:0.5px">This visualisation repurposes Anthony Hay&rsquo;s faithful reconstruction of ELIZA (released CC0 public domain): his engine generates the responses exactly as Weizenbaum&rsquo;s 1966 program would, and we use it to demo each step.</p>
      <p class="micro" style="margin-top:0.8rem;font-size:0.72rem;letter-spacing:0.5px">His code runs essentially unchanged. We lifted the engine out of his <code>eliza.html</code> (removing only its on-screen terminal) and left the algorithm untouched, then wrapped it in a small harness that loads the 1966 DOCTOR script and runs a single response. It talks to the demo through Hay&rsquo;s own tracer interface: ELIZA already supports a step-by-step trace mode, so we add a tracer that records each step the engine takes (keyword ranking, decomposition, reassembly, memory), and the display turns those records into the panels above. Both the harness and tracer (<a href="https://github.com/critical-code-studies/ELIZA/blob/main/assets/eliza-hay.js">eliza-hay.js</a>) and the display (<a href="https://github.com/critical-code-studies/ELIZA/blob/main/assets/trace.js">trace.js</a>) are available to view.</p>
`}));

// ---------------------------------------------------------------------------
// PEOPLE
// ---------------------------------------------------------------------------
write('people.html', page({
  title: 'TEAM-ELIZA', desc: 'The ELIZA Archaeology Project team.',
  body: `
      <span class="kicker">TEAM-ELIZA</span>
      <h1 class="page">TEAM-ELIZA</h1>
      <div class="lede"><p>The ELIZA Archaeology Project is a collaboration of scholars, programmers, philosophers and artists, with diverse interests and many different voices.</p></div>
      ${fanfold(['R ELIZA', 'W 1631.2', 'ELIZA NOT FOUND.', 'R 1631.2+.04', 'LISTF TEAM *'], `<div class="team-list">
        ${TEAM.map(([n, r, b, photo]) => `<div class="team-row">
          <div class="team-photo${photo ? '' : ' empty'}">${photo ? `<img src="assets/images/${photo}" alt="${n}" loading="lazy">` : '<span>[ PHOTO ]</span>'}</div>
          <div class="team-info"><p class="name">${n}</p><p class="role">${r}</p><p class="bio">${b}</p></div>
        </div>`).join('\n        ')}
        </div>`, { stain: 'coffee', stainPos: 'tr' })}
      <div class="rule">AFFILIATIONS</div>
      ${fanfold('LISTF AFFIL *', `<div class="logos">
          <a class="logo" href="https://www.sussex.ac.uk" target="_blank" rel="noopener"><img src="assets/images/sussex.jpg" alt="University of Sussex" loading="lazy"></a>
          <a class="logo" href="https://www.ox.ac.uk" target="_blank" rel="noopener"><img src="assets/images/oxford.png" alt="University of Oxford" loading="lazy"></a>
          <a class="logo" href="https://www.stanford.edu" target="_blank" rel="noopener"><img src="assets/images/stanford.png" alt="Stanford University" loading="lazy"></a>
          <a class="logo" href="https://www.usc.edu" target="_blank" rel="noopener"><img src="assets/images/usc.jpg" alt="University of Southern California" loading="lazy"></a>
          <a class="logo" href="https://www.khm.de" target="_blank" rel="noopener"><img src="assets/images/khm-logo.png" alt="Academy of Media Arts Cologne (KHM)" loading="lazy"></a>
          <a class="logo" href="https://haccslab.com" target="_blank" rel="noopener"><img src="assets/images/haccslab.png" alt="HaCCS Lab" loading="lazy"></a>
        </div>`)}
      <div class="rule">WITH THANKS</div>
      ${fanfold('PRINT THANKS', `<p class="plate-body">With thanks to guest contributor Walt Bilofsky, to critical friends Claire Carroll and Rebecca Roach, to the MIT Libraries and Distinctive Collections, to the Charles Babbage Institute, and to Rupert Lane, Tom Van Vleck and Jerry Saltzer for help understanding CTSS.</p>`)}
`}));

// ---------------------------------------------------------------------------
// TALKS
// ---------------------------------------------------------------------------
write('talks.html', page({
  title: 'Talks', desc: 'Talks and code critiques on ELIZA by the project team.',
  body: `
      <span class="kicker">Talks</span>
      <h1 class="page">Talks &amp; code critiques</h1>

      <h2 class="yeargroup">2026</h2>
      <ul class="talklist">
        <li><span class="who">Berry, D. M.</span><span class="ttl">&ldquo;From Script to Vector: ELIZA and the Age of AI&rdquo;</span><span class="meta">Roskilde University, Denmark &middot; 29 April 2026</span></li>
        <li><span class="who">Ciston, S.</span><span class="ttl"><a href="https://zkm.de/de/media/videos/sarah-ciston-dont-be-evil-reckoning-with-the-risks-of-technofascism-from-eliza-to" target="_blank" rel="noopener">&ldquo;Don&rsquo;t (?) Be Evil: Reckoning with the Risks of Technofascism from ELIZA to Anthropic (or: How I learned to worry just enough to keep loving what I code)&rdquo;</a></span><span class="meta">Envisioning AI: Legacy and Impact of the Connection Machine, ZKM, Karlsruhe, Germany &middot; 27 March 2026</span></li>
        <li><span class="who">Berry, D. M.</span><span class="ttl">&ldquo;From Script to Vector: ELIZA and the Age of AI&rdquo;</span><span class="meta">Aarhus University, Denmark &middot; 20 March 2026</span></li>
        <li><span class="who">Berry, D. M.</span><span class="ttl">&ldquo;Generative AI and Computational Capitalism: Towards a Critical Theory of Artificial Intelligence&rdquo;</span><span class="meta">University of Birmingham &middot; 22 January 2026</span></li>
      </ul>

      <h2 class="yeargroup">2025</h2>
      <ul class="talklist">
        <li><span class="who">Berry, D. M.</span><span class="ttl">&ldquo;Generative AI and Computational Capitalism: Towards a Critical Theory of Artificial Intelligence&rdquo;</span><span class="meta">Workshop on Critical Theory of the Computational, Weizenbaum Institute, Berlin &middot; 16 October 2025</span></li>
        <li><span class="who">Berry, D. M.</span><span class="ttl">&ldquo;Digital Kintsugi: The Art and Ethics of Reconstructing ELIZA&rsquo;s Digital Ruins&rdquo;</span><span class="meta">ELO25 @ 25: Love Letters to the Past and Future, Electronic Literature Organization, York University, Toronto, Canada &middot; 10&ndash;13 July 2025</span></li>
      </ul>

      <h2 class="yeargroup">2023</h2>
      <ul class="talklist">
        <li><span class="who">Berry, D. M.</span><span class="ttl">&ldquo;Reading ELIZA: Understanding Weizenbaum through his code&rdquo;</span><span class="meta">Weizenbaum&rsquo;s Worlds: Technological Change and Computer Criticism in the U.S. and Germany, ca. 1960&ndash;1990, Humboldt / Weizenbaum Institute, Berlin &middot; 3 November 2023</span></li>
        <li><span class="who">Ciston, S., Berry, D. M., Hay, A. C., Marino, M. C., Millican, P., Schwarz, A. I., Shrager, J. &amp; Weil, P.</span><span class="ttl">&ldquo;Getting to know ELIZA: ChatGPT&rsquo;s Great Grandmother&rdquo;</span><span class="meta">MIT &middot; 11 October 2023</span></li>
      </ul>

      <h2 class="yeargroup">2022</h2>
      <ul class="talklist">
        <li><span class="who">Shrager, J., Berry, D. M., Marino, M. C. &amp; Douglass, J.</span><span class="ttl">&ldquo;The Original ELIZA in MAD-SLIP&rdquo;</span><span class="meta">Critical Code Studies Working Group, code critique</span></li>
      </ul>

      <h2 class="yeargroup">2016</h2>
      <ul class="talklist">
        <li><span class="who">Berry, D. M.</span><span class="ttl">&ldquo;Archaeologies of Code: Reading ELIZA&rdquo;</span><span class="meta">Critical Code Studies Working Group, code critique</span></li>
      </ul>
`}));

// ---------------------------------------------------------------------------
// BOOK
// ---------------------------------------------------------------------------
write('book.html', page({
  title: 'The book', desc: 'Inventing ELIZA: How the First Chatbot Shaped the Future of AI (MIT Press).',
  body: `
      <span class="kicker">The book</span>
      <h1 class="page">Inventing ELIZA</h1>
      <figure class="figure portrait">
        <a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/"><img src="assets/images/inventing-eliza.jpg" alt="Inventing ELIZA book cover" loading="lazy"></a>
        <figcaption>Inventing ELIZA (MIT Press, Software Studies, 2026).</figcaption>
      </figure>
      <div class="lede"><p>How the First Chatbot Shaped the Future of AI. A study by Sarah Ciston, David M. Berry, Anthony C. Hay, Mark C. Marino, Peter Millican, Arthur I. Schwarz, Jeff Shrager and Peggy Weil, built on the recovered source code, published by MIT Press in the Software Studies series.</p></div>
      <p>As we reach the 60th anniversary of ELIZA&rsquo;s public debut, <em>Inventing ELIZA</em> offers the first comprehensive critical analysis of Joseph Weizenbaum&rsquo;s groundbreaking chatbot system through the lens of Critical Code Studies. Drawing on extensive archival research at MIT, Stanford, and UCLA, the book presents the rediscovered original source code of ELIZA alongside previously unseen scripts that had been missing for decades, revealing a far more sophisticated system than previously documented. The authors trace ELIZA&rsquo;s development (1965&ndash;1968), showing that Weizenbaum created a chatbot within a conversational programming environment, with previously unknown innovations well ahead of its time. Through close reading of both code and paratexts, the book reconstructs ELIZA&rsquo;s conceptual evolution and situates it within the historical context of early AI development.</p>
      <p>Although DOCTOR is routinely identified with ELIZA itself, it was only one of many possibilities for the ELIZA conversational system. The book also follows the program&rsquo;s namesake, Eliza Doolittle of <em>Pygmalion</em> and <em>My Fair Lady</em>, into the present, asking how the problematic assumptions of gender and class carried in that name resurface in later systems, from Microsoft&rsquo;s Tay to Alexa.</p>
      <p>The book&rsquo;s companion website, <a href="https://findingeliza.org">findingeliza.org</a>, includes a faithful recreation of the first chatbot and news about continued research.</p>
      <div class="cover-note muted">
        <span class="kicker">MIT Press &middot; Software Studies</span>
        <h2>Inventing ELIZA</h2>
        <p>Inventing ELIZA: How the First Chatbot Shaped the Future of AI. By Sarah Ciston, David M. Berry, Anthony C. Hay, Mark C. Marino, Peter Millican, Arthur I. Schwarz, Jeff Shrager and Peggy Weil.</p>
        <p><a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/">mitpress.mit.edu/9780262052481 &rsaquo;</a></p>
      </div>
`}));

// ---------------------------------------------------------------------------
// LINKS
// ---------------------------------------------------------------------------
write('links.html', page({
  title: 'Resources', desc: 'Related projects and resources on ELIZA and Joseph Weizenbaum.',
  body: `
      <span class="kicker">Resources</span>
      <h1 class="page">Resources</h1>
      <ul class="links">
        <li><a href="https://sites.google.com/view/elizagen-org/About">ELIZAGEN</a><span class="meta"> &mdash; tracing the legacy of Weizenbaum&rsquo;s ELIZA (DOCTOR) program, edited by Jeff Shrager.</span></li>
        <li><a href="https://github.com/anthay/ELIZA">anthay/ELIZA</a><span class="meta"> &mdash; Anthony Hay&rsquo;s historically exact C++ recreation, with scripts.</span></li>
        <li><a href="https://github.com/critical-code-studies/ELIZA">critical-code-studies/ELIZA</a><span class="meta"> &mdash; the source for this site, the recovered MAD-SLIP listing and the DOCTOR script.</span></li>
        <li><a href="https://hdl.handle.net/1721.3/201699">MIT Distinctive Collections</a><span class="meta"> &mdash; the 1965 ELIZA printout in Weizenbaum&rsquo;s archive.</span></li>
        <li><a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/">Inventing ELIZA</a><span class="meta"> &mdash; the book, MIT Press.</span></li>
        <li><a href="https://electronicbookreview.com/essay/reading-eliza-critical-code-studies-in-action/">Reading ELIZA: CCS in Action</a><span class="meta"> &mdash; Berry and Marino, Electronic Book Review.</span></li>
        <li><a href="https://99percentinvisible.org/episode/the-eliza-effect/">The ELIZA Effect</a><span class="meta"> &mdash; 99% Invisible podcast episode.</span></li>
        <li><a href="https://critical-code-studies.github.io/SHRDLU/">SHRDLU</a><span class="meta"> &mdash; the companion CCS reading of Winograd&rsquo;s SHRDLU (1968&ndash;70).</span></li>
      </ul>
`}));

// ---------------------------------------------------------------------------
// ABOUT
// ---------------------------------------------------------------------------
write('about.html', page({
  title: 'About', desc: 'About the ELIZA Archaeology Project.',
  body: `
      <span class="kicker">About</span>
      <h1 class="page">About the project</h1>
      <figure class="figure portrait">
        <img src="assets/images/weizenbaum.jpg" alt="Joseph Weizenbaum" loading="lazy">
        <figcaption>Joseph Weizenbaum (1923&ndash;2008), creator of ELIZA.</figcaption>
      </figure>
      <div class="lede"><p>ELIZA is one of the most influential computer programs in history. Created by Joseph Weizenbaum at MIT in the mid-1960s, it was the world&rsquo;s first chatbot: the first program to let people hold a conversation with a computer.</p></div>
      <p>Its behaviour was controlled by scripts, of which DOCTOR is the most renowned, making ELIZA reply like a Rogerian psychotherapist: offering little of its own, instead asking leading questions. The program achieved remarkable cultural impact despite its modest size, about 420 lines of MAD-SLIP. Its descendants and echoes run from HAL 9000 to Siri and Alexa.</p>
      <p>For decades after its 1966 publication in the Communications of the ACM, the original source code was unavailable. The team rediscovered the original ELIZA code in Weizenbaum&rsquo;s archive at MIT in 2021, making it possible to investigate the history of the chatbot through authentic artifacts. This site, and the book <a href="book.html"><em>Inventing ELIZA</em></a>, are the result. Meet the people behind it on the <a href="people.html">TEAM-ELIZA</a> page.</p>
      <figure class="figure half">
        <img src="assets/images/weizenbaum-mit-80s.jpg" alt="Joseph Weizenbaum at MIT in the 1980s" loading="lazy">
        <figcaption>Joseph Weizenbaum at MIT in the 1980s.</figcaption>
      </figure>
`}));

// ---------------------------------------------------------------------------
// BIBLIOGRAPHY
// ---------------------------------------------------------------------------
write('bibliography.html', page({
  title: 'Bibliography', desc: 'Selected writings on ELIZA, Weizenbaum, and Critical Code Studies.',
  body: `
      <span class="kicker">Bibliography</span>
      <h1 class="page">Writings</h1>
      <div class="lede"><p>Selected writings by the project and its members on ELIZA, Joseph Weizenbaum, and the reading of code as a cultural text.</p></div>
      ${fanfold('PRINT BIBLIO', `<div class="bib">
        <h3>By the project</h3>
        <p class="ref">Ciston, S., Berry, D. M., Hay, A. C., Marino, M. C., Millican, P., Schwarz, A. I., Shrager, J. and Weil, P. (2026) <em>Inventing ELIZA: How the First Chatbot Shaped the Future of AI</em>. Cambridge, MA: MIT Press (Software Studies). Available at: <a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/">https://mitpress.mit.edu/9780262052481/inventing-eliza/</a></p>
        <p class="ref">Berry, D. M. and Marino, M. C. (2024) &lsquo;Reading ELIZA: Critical Code Studies in Action&rsquo;, <em>Electronic Book Review</em>. Available at: <a href="https://electronicbookreview.com/essay/reading-eliza-critical-code-studies-in-action/">https://electronicbookreview.com/essay/reading-eliza-critical-code-studies-in-action/</a></p>
        <p class="ref">Berry, D. M., Hay, A., Millican, P. and Shrager, J. (2023) &lsquo;Finding ELIZA: Rediscovering Weizenbaum&rsquo;s Source Code, Comments and Faksimiles&rsquo;, in Baranovska, M. and H&ouml;ltgen, S. (eds.) <em>Hello, I&rsquo;m Eliza. 50 Jahre Gespr&auml;che mit Computern</em> (Computerarch&auml;ologie, Bd. 5), 2nd edn. Bochum: Projektverlag, pp. 247&ndash;248.</p>
        <p class="ref">Lane, R. et al. (2025) &lsquo;ELIZA Reanimated: Restoring the Mother of All Chatbots to One of the World&rsquo;s First Time-Sharing Systems&rsquo;. Preprint.</p>

        <h3>Weizenbaum on ELIZA</h3>
        <p class="ref">Weizenbaum, J. (1966) &lsquo;ELIZA: A Computer Program For the Study of Natural Language Communication Between Man And Machine&rsquo;, <em>Communications of the ACM</em>, 9(1), pp. 36&ndash;45.</p>
        <p class="ref">Weizenbaum, J. (1967) &lsquo;Contextual Understanding by Computers&rsquo;, <em>Communications of the ACM</em>, 10(8), pp. 474&ndash;480.</p>
        <p class="ref">Weizenbaum, J. (1976) <em>Computer Power and Human Reason: From Judgment to Calculation</em>. San Francisco: W. H. Freeman.</p>

        <h3>On Weizenbaum and the ELIZA effect</h3>
        <p class="ref">Berry, D. M. (2023) &lsquo;The Limits of Computation: Joseph Weizenbaum and the ELIZA Chatbot&rsquo;, <em>Weizenbaum Journal of the Digital Society</em>, 3(3). Available at: <a href="https://doi.org/10.34669/WI.WJDS/3.3.2">https://doi.org/10.34669/WI.WJDS/3.3.2</a></p>
        <p class="ref">Berry, D. M. (2023) &lsquo;The Explainability Turn&rsquo;, <em>Digital Humanities Quarterly</em>, 17(2).</p>
        <p class="ref">Dillon, S. (2020) &lsquo;The Eliza Effect and its Dangers: From Demystification to Gender Critique&rsquo;, <em>Journal for Cultural Research</em>, 24(1), pp. 1&ndash;15.</p>
        <p class="ref">Marino, M. C. (2020) <em>Critical Code Studies</em>. Cambridge, MA: MIT Press.</p>
        <p class="ref">Turkle, S. (1997) <em>Life on the Screen: Identity in the Age of the Internet</em>. New York: Touchstone.</p>
      </div>`)}
`}));

// ---------------------------------------------------------------------------
// helper: dialogue block
// ---------------------------------------------------------------------------
function dlg(turns) {
  return turns.map(([who, msg]) => {
    const cls = who === 'e' ? 'eliza' : 'person';
    const label = who === 'e' ? 'ELIZA' : 'You';
    return `<div class="turn ${cls}"><span class="who">${label}</span><span class="msg">${msg.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span></div>`;
  }).join('\n        ');
}

// ---------------------------------------------------------------------------
// BLOG: index shell + generic post shell (content lives in blog/posts/*.md,
// rendered client-side by blog.js + marked. See blog/CONTRIBUTING.md.)
// ---------------------------------------------------------------------------
write('blog.html', page({
  title: 'Blog', desc: 'The ELIZA Archaeology Project blog: discoveries, close readings and guest posts.',
  scripts: ['marked.min.js', 'blog.js'],
  body: `
      <span class="kicker">Blog</span>
      <h1 class="page">Blog</h1>
      <div class="lede"><p>Discoveries, close readings, hardware experiments and guest posts from the ELIZA Archaeology Project.</p></div>
      <ul class="posts" id="blog-list"><li><div><p class="meta">Loading posts&hellip;</p></div></li></ul>
`}));

write('blog/post.html', page({
  depth: 1, title: 'Blog', desc: 'The ELIZA Archaeology Project blog.',
  scripts: ['marked.min.js', 'blog.js'],
  body: `      <div id="post"><p class="post-meta">Loading&hellip;</p></div>`
}));

console.log('structural pages written');
module.exports = { page, write, dlg, OUT, BLOGDIR };
