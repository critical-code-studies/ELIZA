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
// changes each build so browsers refetch changed CSS/JS/favicon. Do NOT treat
// this as a version to bump, and do NOT bump the VERSION file or tag releases
// for this repo (David's instruction, 2026-06-22).
const V = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
const SITE = 'https://critical-code-studies.github.io/ELIZA';

// ---- shared chrome ----------------------------------------------------------
function nav(depth) {
  const p = depth ? '../' : '';
  return `
      <a class="brand" href="${p}index.html" aria-label="ELIZA home">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 6 H22 L28 12 V26 H4 Z" fill="#d9cfbc"/><g fill="#14161b"><rect x="8" y="13" width="3" height="5" rx="0.8"/><rect x="14" y="13" width="3" height="5" rx="0.8"/></g><rect x="20" y="13" width="3" height="5" rx="0.8" fill="#ef6f44"/><text x="16" y="24" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="4.4" letter-spacing="0.3" fill="#14161b" opacity="0.5">000010</text></svg>
        <span class="brand-block"><span class="brand-text">ELIZA</span><span class="brand-tagline">Critical Code Studies · MIT · 1966</span></span>
      </a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span class="bars" aria-hidden="true">&#9776;</span>&nbsp;Menu</button>
      <nav class="site-nav" id="site-nav">
        <div class="nav-group">
          <button class="nav-top" aria-expanded="false">Main <span class="caret" aria-hidden="true">&#9662;</span></button>
          <div class="nav-menu">
            <a href="${p}index.html">Home</a><a href="${p}about.html">About</a><a href="${p}try.html">Try ELIZA</a><a href="${p}bibliography.html">Bibliography</a><a href="${p}links.html">Links</a>
          </div>
        </div>
        <div class="nav-group">
          <button class="nav-top" aria-expanded="false">ELIZA <span class="caret" aria-hidden="true">&#9662;</span></button>
          <div class="nav-menu">
            <a href="${p}overview.html">Overview</a><a href="${p}doctor.html">The DOCTOR script</a><a href="${p}versions.html">The versions</a><a href="${p}book.html">The book</a>
          </div>
        </div>
        <div class="nav-group">
          <button class="nav-top" aria-expanded="false">The code <span class="caret" aria-hidden="true">&#9662;</span></button>
          <div class="nav-menu"><a href="${p}code.html">The program</a><a href="${p}slip.html">SLIP</a><a href="${p}doctor.html">The DOCTOR script</a><a href="${p}how.html">How it works (demo)</a></div>
        </div>
        <a class="nav-top nav-direct" href="${p}blog.html">Blog</a>
        <a class="nav-top nav-direct" href="${p}people.html">TEAM-ELIZA</a>
        <a class="nav-top nav-direct" href="${p}talks.html">Talks</a>
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

const TEAM = [
  ['David M. Berry', 'Professor of Digital Humanities, University of Sussex', 'Writes widely on philosophy and technology, particularly computation, software and algorithms; recent work addresses explainability, human understanding, and the history of the university. Co-discovered the original ELIZA source in the MIT archive.'],
  ['Sarah Ciston', 'Mellon PhD Candidate, Media Arts + Practice, USC', 'Builds critical-creative tools to bring intersectional approaches to machine learning. Named AI Newcomer by the German Informatics Society and AI Anarchies Fellow at the Akademie der K&uuml;nste, Berlin. Author of <em>A Critical Field Guide to Working with Machine Learning Datasets</em> and founder of Code Collective.'],
  ['Anthony C. Hay', 'Programmer (formerly Digital Research, Novell); BSc, Imperial College London', 'Wrote a near-perfect clone of the original MAD-SLIP ELIZA in C++, first from Weizenbaum&rsquo;s 1966 paper, later corrected against the recovered MIT source. Untangled the &ldquo;certain counting mechanism&rdquo; behind ELIZA&rsquo;s memory.'],
  ['Mark C. Marino', 'Professor of Writing, USC; Director, Humanities and Critical Code Studies (HaCCS) Lab', 'Scholar of electronic literature; author of <em>Critical Code Studies</em> (MIT Press) and co-author of <em>10 PRINT CHR$(205.5+RND(1))</em>. Director of Communication for the Electronic Literature Organization.'],
  ['Peter Millican', 'Professor of Philosophy, Hertford College, Oxford', 'Founder of Oxford&rsquo;s Computer Science and Philosophy degree (2012). Author of the Elizabeth chatbot (2000), built to engage humanities students with the mechanics of conversation.'],
  ['Arthur I. Schwarz', 'Software developer and technical lead (aerospace, automotive); BS Physics, MS Computer Science', 'Developed gSlip, a public-domain implementation of SLIP, the list-processing library underpinning ELIZA. Interests include hashing algorithms and anomaly detection.'],
  ['Jeff Shrager', 'Adjunct Professor, Symbolic Systems, Stanford; Chief Scientist, Blue Dot Change', 'Self-described &ldquo;aging Lisp hacker&rdquo; who rediscovered Weizenbaum&rsquo;s original MAD-SLIP ELIZA in the MIT archive in 2021. Editor and curator of ELIZAgen.org; co-author of 100+ AI publications and co-founder of three biomedical AI startups.'],
  ['Peggy Weil', 'Adjunct Assistant Professor, USC School of Cinematic Arts', 'Multidisciplinary artist; did graduate work at the MIT Media Lab&rsquo;s Architecture Machine Group in the early 1980s. Created MrMind, the first net-art chatbot. Her work addresses physical, digital and sociopolitical landscapes.']
];

// ---------------------------------------------------------------------------
// HOME
// ---------------------------------------------------------------------------
const homeHero = `  <section class="hero">
    <canvas id="sourcewall" aria-hidden="true"></canvas>
    <div class="hero-inner">
      <div class="wrap">
       <div class="hero-panel">
        <p class="boot">JOSEPH WEIZENBAUM // 1966<span class="cursor" aria-hidden="true"></span></p>
        <h1>ELIZA</h1>
        <p class="sub">The first chatbot</p>
        <p class="tagline">In 1966 Joseph Weizenbaum gave people their first conversation with a machine. In 2021 we found its lost source code. This is a close reading of ELIZA: its program, its DOCTOR script, its many versions, and what it still tells us about artificial intelligence.</p>
        <div class="tt" id="tt-feed" aria-hidden="true"></div>
        <div class="hero-actions">
          <a class="btn" href="how.html">Watch it think</a>
          <a class="btn ghost" href="try.html">Talk to ELIZA</a>
          <a class="btn ghost" href="overview.html">Start reading</a>
        </div>
       </div>
      </div>
    </div>
  </section>`;

const homeBody = `
    <section class="block lede">
      <span class="kicker">The ELIZA Archaeology Project</span>
      <p>ELIZA was a small program with an enormous afterlife. Written in MAD-SLIP on MIT&rsquo;s Compatible Time-Sharing System, it let a person type ordinary English and receive a reply that seemed to understand. People confided in it. Weizenbaum spent the rest of his life warning us not to.</p>
    </section>

    <section class="block">
      <h2>Inventing ELIZA</h2>
      <p>This is an interdisciplinary investigation of ELIZA as a cultural and technical artifact, built around the original source code we recovered from Weizenbaum&rsquo;s papers in the MIT archive in 2021. We read the code, the DOCTOR script, the hardware it ran on, and the long shadow it cast over how we talk about thinking machines.</p>
      <p>It is a companion to the Critical Code Studies group&rsquo;s readings of <a href="https://critical-code-studies.github.io/SHRDLU/">SHRDLU</a> (1968&ndash;70) and Spacewar! (1962), and the public face of the collectively authored book <a href="book.html"><em>Inventing ELIZA</em></a> (MIT Press).</p>
      <div class="grid">
        <div class="card r"><p class="obj">Read</p><h3><a href="overview.html">Overview</a></h3><p>What ELIZA actually was, and why DOCTOR is not the same thing as ELIZA.</p></div>
        <div class="card b"><p class="obj">The code</p><h3><a href="code.html">The program</a></h3><p>A close reading of the recovered MAD-SLIP source, line by line.</p></div>
        <div class="card y"><p class="obj">The script</p><h3><a href="doctor.html">DOCTOR</a></h3><p>Weizenbaum&rsquo;s Rogerian therapist script, and how its patterns work.</p></div>
        <div class="card r"><p class="obj">Watch</p><h3><a href="how.html">How it works</a></h3><p>Type a phrase and step through ELIZA&rsquo;s rules, from keywords to reply.</p></div>
        <div class="card g"><p class="obj">Talk</p><h3><a href="try.html">Try ELIZA</a></h3><p>A faithful re-creation that runs the genuine 1966 script in your browser.</p></div>
      </div>
    </section>

    <div class="rule">FROM ITS CODE TO ITS IMPACT ON TECHNOCULTURE</div>

    <section class="block">
      <h2>ELIZA is a multiplicity</h2>
      <p>For sixty years a proliferation of BASIC and Lisp copies treated the DOCTOR therapy script as if it were ELIZA itself, rather than one demonstration of a general-purpose system. The archive tells a richer story: at least five major versions between 1965 and 1968, and scripts far beyond DOCTOR, from arithmetic tutoring to a Nixon parody.</p>
      <div class="stat-strip">
        <div class="stat"><div class="n">1966</div><div class="l">CACM paper</div></div>
        <div class="stat"><div class="n">~420</div><div class="l">lines of MAD-SLIP</div></div>
        <div class="stat"><div class="n">5+</div><div class="l">known versions</div></div>
        <div class="stat"><div class="n">2021</div><div class="l">source recovered</div></div>
      </div>
    </section>

    <section class="block">
      <div class="cover-note">
        <span class="kicker">Out 14 July 2026 &middot; MIT Press</span>
        <h2>Inventing ELIZA</h2>
        <p>How the First Chatbot Shaped the Future of AI. The recovery, the close reading, and the politics of the program, by the full project team. MIT Press, Software Studies series.</p>
        <p><a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/">Order from MIT Press &rsaquo;</a> &nbsp; <a href="book.html">About the book &rsaquo;</a></p>
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
  scripts: ['source-wall.js', 'teletype.js']
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

      <div class="callout"><span class="kicker">The trick, and the point</span><p>ELIZA never understands anything. It rearranges your own words. Weizenbaum was disturbed that people knew this and confided in it anyway. The gap between what the program does and what people believe it does is what he later called, and what we now call, the ELIZA effect.</p></div>

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
      <p>We read the source the way Critical Code Studies reads any code: as a text, within its historical and material context, where naming, structure and even bugs carry meaning. The command vocabulary of the editor (<code>TYPE</code>, <code>SUBST</code>, <code>APPEND</code>, <code>ADD</code>, <code>START</code>, <code>RANK</code>, <code>DISPLA</code>) is a small grammar of power; the iteration over a fixed table is a trace of the machine&rsquo;s limits. <a href="https://electronicbookreview.com/essay/reading-eliza-critical-code-studies-in-action/">Reading ELIZA: CCS in Action &rsaquo;</a></p>
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
  title: 'The DOCTOR script', desc: 'Weizenbaum’s Rogerian therapist script for ELIZA, and how its keyword patterns work.',
  body: `
      <span class="kicker">The code</span>
      <h1 class="page">The DOCTOR script</h1>
      <div class="lede"><p>DOCTOR is the script that made ELIZA famous. It is a list of keywords, each with patterns for taking apart what you say and templates for putting a reply back together. Feed ELIZA this script and it answers like a Rogerian therapist.</p></div>

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

      <p class="post-meta" style="margin-top:2rem">The full DOCTOR script is transcribed in the <a href="https://github.com/critical-code-studies/ELIZA">repository</a> (<code>DOCTOR.txt</code>), from the CACM appendix, transcribed by Anthony Hay.</p>
`}));

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
  body: `
      <span class="kicker">Try ELIZA</span>
      <h1 class="page">Talk to ELIZA</h1>
      <div class="lede"><p>This is Anthony Hay&rsquo;s faithful recreation of the original 1966 MAD-SLIP ELIZA. Type a sentence and press enter; it runs entirely in your browser and nothing you type is sent anywhere.</p></div>
      <p>It reproduces the original program&rsquo;s behaviour exactly, down to the bugs, with the original asterisk commands (type <code>*help</code>), the CACM replay, and the ability to load custom scripts.</p>
      <div class="eliza-embed"><iframe src="https://anthay.github.io/eliza.html" title="Anthony Hay&rsquo;s ELIZA" loading="lazy"></iframe></div>
      <p class="post-meta" style="margin-top:0.8rem">Source: <a href="https://github.com/anthay/ELIZA">github.com/anthay/ELIZA</a>. Or open it <a href="https://anthay.github.io/eliza.html">full screen</a>.</p>
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
      <p class="micro" style="margin-top:2.4rem">This visualisation repurposes Anthony Hay&rsquo;s faithful reconstruction of ELIZA (released CC0 public domain): his engine generates the responses exactly as Weizenbaum&rsquo;s 1966 program would, and we instrument it to surface each step. The code that does this is open: the step display in <a href="https://github.com/critical-code-studies/ELIZA/blob/main/assets/trace.js">trace.js</a> and the tracer that reads Hay&rsquo;s engine in <a href="https://github.com/critical-code-studies/ELIZA/blob/main/assets/eliza-hay.js">eliza-hay.js</a>.</p>
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
      <div class="people">
        ${TEAM.map(([n, r, b]) => `<div class="person-card"><p class="name">${n}</p><p class="role">${r}</p><p>${b}</p></div>`).join('\n        ')}
      </div>
      <div class="rule">WITH THANKS</div>
      <p class="micro">With thanks to guest contributors Rebecca Roach and Walt Bilofsky, to the MIT Libraries and Distinctive Collections, to the Charles Babbage Institute, and to Rupert Lane, Tom Van Vleck and Jerry Saltzer for help understanding CTSS.</p>
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
        <li><span class="ttl">&ldquo;From Script to Vector: ELIZA and the Age of AI&rdquo;</span><span class="meta">Roskilde University, Denmark &middot; 29 April 2026</span></li>
        <li><span class="ttl">&ldquo;From Script to Vector: ELIZA and the Age of AI&rdquo;</span><span class="meta">Aarhus University, Denmark &middot; 20 March 2026</span></li>
        <li><span class="ttl">&ldquo;Generative AI and Computational Capitalism: Towards a Critical Theory of Artificial Intelligence&rdquo;</span><span class="meta">University of Birmingham &middot; 22 January 2026</span></li>
      </ul>

      <h2 class="yeargroup">2025</h2>
      <ul class="talklist">
        <li><span class="ttl">&ldquo;Generative AI and Computational Capitalism: Towards a Critical Theory of Artificial Intelligence&rdquo;</span><span class="meta">Workshop on Critical Theory of the Computational, Weizenbaum Institute, Berlin &middot; 16 October 2025</span></li>
        <li><span class="ttl">&ldquo;Digital Kintsugi: The Art and Ethics of Reconstructing ELIZA&rsquo;s Digital Ruins&rdquo;</span><span class="meta">ELO25 @ 25: Love Letters to the Past and Future, Electronic Literature Organization, York University, Toronto, Canada &middot; 10&ndash;13 July 2025</span></li>
      </ul>

      <h2 class="yeargroup">2023</h2>
      <ul class="talklist">
        <li><span class="ttl">&ldquo;Reading ELIZA: Understanding Weizenbaum through his code&rdquo;</span><span class="meta">Weizenbaum&rsquo;s Worlds: Technological Change and Computer Criticism in the U.S. and Germany, ca. 1960&ndash;1990, Humboldt / Weizenbaum Institute, Berlin &middot; 3 November 2023</span></li>
        <li><span class="ttl">&ldquo;Getting to know ELIZA: ChatGPT&rsquo;s Great Grandmother&rdquo;</span><span class="meta">MIT &middot; 11 October 2023</span></li>
      </ul>

      <h2 class="yeargroup">2022</h2>
      <ul class="talklist">
        <li><span class="ttl">&ldquo;The Original ELIZA in MAD-SLIP&rdquo;</span><span class="meta">Critical Code Studies Working Group, code critique &middot; thread leaders Jeff Shrager, David M. Berry, Mark C. Marino, Jeremy Douglass</span></li>
      </ul>

      <h2 class="yeargroup">2016</h2>
      <ul class="talklist">
        <li><span class="ttl">&ldquo;Archaeologies of Code: Reading ELIZA&rdquo;</span><span class="meta">Critical Code Studies Working Group, code critique &middot; thread leader David M. Berry</span></li>
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
      <div class="lede"><p>How the First Chatbot Shaped the Future of AI. A collectively authored study built on the recovered source code, published by MIT Press in the Software Studies series, out 14 July 2026.</p></div>
      <figure class="figure portrait">
        <a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/"><img src="assets/images/inventing-eliza.jpg" alt="Inventing ELIZA book cover" loading="lazy"></a>
        <figcaption>Inventing ELIZA (MIT Press, Software Studies, 2026).</figcaption>
      </figure>
      <p>Working with MIT librarians, the project recovered the original ELIZA program code. The book is an in-depth reading of that code and its scripts, drawing on the methods of Critical Code Studies, and tracing the program from its code to its impact on technoculture.</p>
      <p>It makes a distinction often lost: although DOCTOR is routinely identified with ELIZA itself, it was only one of many possibilities for the ELIZA conversational system. The book also follows the program&rsquo;s namesake, Eliza Doolittle of <em>Pygmalion</em> and <em>My Fair Lady</em>, into the present, asking how the problematic assumptions of gender and class carried in that name resurface in later systems, from Microsoft&rsquo;s Tay to Alexa.</p>
      <div class="cover-note">
        <span class="kicker">Published 14 July 2026 &middot; MIT Press, Software Studies</span>
        <h2>Inventing ELIZA</h2>
        <p>Inventing ELIZA: How the First Chatbot Shaped the Future of AI. By Sarah Ciston, David M. Berry, Anthony C. Hay, Mark C. Marino, Peter Millican, Arthur I. Schwarz, Jeff Shrager and Peggy Weil.</p>
        <p><a href="https://mitpress.mit.edu/9780262052481/inventing-eliza/">mitpress.mit.edu/9780262052481 &rsaquo;</a></p>
      </div>
`}));

// ---------------------------------------------------------------------------
// LINKS
// ---------------------------------------------------------------------------
write('links.html', page({
  title: 'Links', desc: 'Related projects and resources on ELIZA and Joseph Weizenbaum.',
  body: `
      <span class="kicker">Links</span>
      <h1 class="page">Links</h1>
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
      <div class="bib">
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
      </div>
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
