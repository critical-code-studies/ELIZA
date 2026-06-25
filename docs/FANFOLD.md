# fanfold, a reusable line-printer plate

`fanfold()` renders a block of content as a sheet of continuous-form (fanfold)
line-printer paper: warm parchment, tractor-feed sprocket holes, and a typed
command header shaped to a chosen historic operating system (CTSS, ITS, Unix…).
It is two pieces with no dependencies: one small JS function that emits HTML, and
one block of CSS. Drop both into any static site or generator.

It was built for the ELIZA Archaeology Project (`critical-code-studies/ELIZA`),
where it carries the DOCTOR script, the MAD source, the team roster, the
bibliography and the affiliations, all as printouts from the same machine.

---

## Quick start

```js
// 1. include the JS below, then:
const html = fanfold('LISTF AFFIL *', '<div class="logos">…</div>');
// 2. include the CSS below. Done.
```

`fanfold(cmd, inner, opts)`:

- **`cmd`**: a command *string* that `opts.system` shapes into a session
  (e.g. CTSS adds the `W`/`R` supervisor lines), **or** an *array of lines* used
  verbatim when you want to author the whole transcript yourself.
- **`inner`**: the HTML that goes on the paper (a listing, a `<pre>`, prose…).
- **`opts`**: a system string (shorthand) or an options object (see below).

---

## Options

| key | values | default | effect |
|-----|--------|---------|--------|
| `system` | `CTSS` `ITS` `UNIX` `PDP1` `NONE` | `CTSS` | shapes the command header (prompt, casing, timing) |
| `age` | `clean` `aged` `damaged` | `clean` | paper condition: foxing, yellowing, blotches |
| `sprockets` | `true` `false` `'torn'` | `true` | feed holes on; off (straight edge); or `'torn'` (holes ripped off, ragged edge) |
| `stain` | `false` `'coffee'` `'coffee-small'` `'coffee-large'` | `false` | a coffee-ring stain (`coffee` = medium) |
| `edge` | `plain` `burned` `ripped` | `plain` | scorched edges, or a torn-off bottom |
| `banner` | a word, or pre-rendered ASCII | (none) | ASCII title at the top of the plate |
| `overlay` | HTML/SVG string | (none) | a free layer over the plate for doodles, arrows, flowcharts |

`opts` may also be just a system string: `fanfold('PRINT DOCTOR', body, 'CTSS')`.

### Systems

```js
fanfold('listf team *', body, 'CTSS')   // LISTF TEAM *  /  W 1631.2 … R 1631.2+.04
fanfold('listf', body, 'ITS')           // :LISTF … *
fanfold('ls team', body, 'UNIX')        // $ ls team … $
fanfold('TEAM', body, 'PDP1')           // TEAM   (bare, uppercase, no shell)
fanfold('TEAM', body, 'NONE')           // TEAM   (verbatim, no decoration)
```

CTSS times are derived deterministically from the command text, so a build is
reproducible (no `Math.random`). To hand-author a multi-step session (e.g. a
command that fails, then a fallback), pass an **array**: it is used verbatim:

```js
fanfold(['R ELIZA', 'W 1631.2', 'ELIZA NOT FOUND.', 'R 1631.2+.04', 'LISTF TEAM *'], body)
```

### Aesthetics

```js
fanfold('PRINT MEMO', body, { age: 'aged' })
fanfold('PRINT MEMO', body, { age: 'damaged', stain: 'coffee' })
fanfold('PRINT MEMO', body, { sprockets: 'torn', edge: 'ripped' })   // a torn-off scrap
fanfold('PRINT MEMO', body, { edge: 'burned' })
fanfold('LISTF', body, { sprockets: false })                          // clean, no holes
```

### Banner

A short word is auto-framed as an ASCII title. A multi-line string is placed
verbatim, so pipe in `figlet`, `toilet`, `jp2a` or any image-to-ASCII converter
and pass the result:

```js
fanfold('PRINT TITLE', body, { banner: 'ELIZA' })          // +-----------+ … boxed
fanfold('PRINT TITLE', body, { banner: figletOutput })     // your own ASCII art
```

> Image → ASCII is intentionally *out of scope* for the function (it would need an
> image library). Convert the image with an external tool, then pass the text via
> `banner`. The plate just prints what you give it.

### Overlay (doodles, flowcharts, marginalia)

`overlay` is a free layer (pointer-events: none) for hand-drawn extras. Supply
your own SVG/HTML and position it inline:

```js
fanfold('PRINT NOTES', body, {
  overlay: '<svg style="position:absolute;right:8%;top:12%;width:120px" viewBox="0 0 100 60">…arrow…</svg>'
})
```

Use it for a margin scribble, a circled word, a connecting arrow, or a small
flowchart drawn in SVG. There are no presets: bring your own marks (that is the
point, it keeps them human).

### Figures and images (no separate function needed)

Pass an empty/absent `cmd` and the plate renders with no command header, just the
paper. Put any HTML inside, an `<img>`, an inline `<svg>` diagram, a chart:

```js
fanfold('', '<img src="diagram.png" style="width:100%">')
fanfold('', svgDiagram, { sprockets: 'torn' })
```

So images and diagrams use the same `fanfold()`, there is no image-specific
variant. (For an SVG drawn on the paper, give it dark ink so it reads on the
parchment.)

---

## The JS (copy verbatim)

```js
function fanEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

function fanStamp(seed){
  let h = 0; for (let i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) >>> 0;
  const hh = 8 + (h%11), mm = (h>>>4)%60, t = (h>>>10)%10;
  const tod = String(hh).padStart(2,'0') + String(mm).padStart(2,'0') + '.' + t;
  return { tod, cpu: '.' + String(((h>>>16)%90)+10) };
}

function fanSession(cmds, system){
  const up = s=>s.toUpperCase(), low = s=>s.toLowerCase();
  switch (system) {
    case 'CTSS': { const head = cmds.map(up), { tod, cpu } = fanStamp(cmds.join(' '));
      head.push('W ' + tod); return { head, foot: ['R ' + tod + '+' + cpu] }; }
    case 'ITS':  return { head: cmds.map(c=>':'+up(c)), foot: ['*'] };
    case 'UNIX': return { head: cmds.map(c=>'$ '+low(c)), foot: ['$'] };
    case 'PDP1': return { head: cmds.map(up), foot: [] };
    default:     return { head: cmds.slice(), foot: [] }; // NONE
  }
}

function fanBanner(text){
  if (!text) return '';
  const raw = String(text); let art;
  if (raw.indexOf('\n') !== -1) { art = fanEsc(raw.replace(/\s+$/,'')); }
  else { const t = raw.toUpperCase().split('').join(' ');
    const bar = '+' + '-'.repeat(t.length+4) + '+';
    art = fanEsc(bar + '\n|  ' + t + '  |\n' + bar); }
  return `<pre class="ff-banner" aria-hidden="true">${art}</pre>`;
}

function fanfold(cmd, inner, opts){
  opts = (typeof opts === 'string') ? { system: opts } : (opts || {});
  const system = (opts.system || 'CTSS').toUpperCase();
  const cls = ['fanfold'];
  if (opts.age && opts.age !== 'clean') cls.push(opts.age);
  if (opts.sprockets === false) cls.push('no-sprockets');
  else if (opts.sprockets === 'torn') cls.push('torn');
  if (opts.stain) cls.push(opts.stain === true ? 'coffee' : opts.stain);
  if (opts.edge && opts.edge !== 'plain') cls.push(opts.edge);
  const verbatim = Array.isArray(cmd);
  const { head, foot } = verbatim ? { head: cmd, foot: [] } : fanSession([cmd], system);
  const lines = arr => arr.map(l => `<div class="cmd-line">${l}</div>`).join('');
  const banner = fanBanner(opts.banner);
  const footHtml = foot.length ? `<div class="fanfold-cmd fanfold-foot">${lines(foot)}</div>` : '';
  const overlay = opts.overlay ? `<div class="ff-overlay" aria-hidden="true">${opts.overlay}</div>` : '';
  return `<div class="${cls.join(' ')}">${overlay}${banner}<div class="fanfold-cmd">${lines(head)}</div>${inner}${footHtml}</div>`;
}
```

Put your code listing inside a `<pre class="fanfold-listing">…</pre>` (HTML-escape
it) as the `inner`; that class is styled for dark ink on paper.

---

## The CSS (standalone, copy verbatim)

Self-contained: it defines its own variables so it does not depend on a host
palette. Override `--ff-paper` / `--ff-ink` / `--ff-hole` / `--ff-mono` to theme.

```css
.fanfold {
  --ff-paper: #d9cfbc; --ff-ink: #2c2318; --ff-hole: #14161b;
  --ff-mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  position: relative; background: var(--ff-paper); border-radius: 3px;
  padding: 1.3rem 2.9rem 1.7rem; margin: 1.6rem 0; box-shadow: 0 14px 38px rgba(0,0,0,.4);
}
.fanfold::before, .fanfold::after {
  content: ""; position: absolute; top: 0; bottom: 0; width: 22px;
  background-image: radial-gradient(circle at center, var(--ff-hole) 0 3.4px, rgba(20,13,9,.18) 3.4px 4.3px, transparent 4.6px);
  background-size: 22px 26px; background-repeat: repeat-y; background-position: center 11px;
}
.fanfold::before { left: 0; border-right: 1px dashed rgba(20,13,9,.22); }
.fanfold::after  { right: 0; border-left: 1px dashed rgba(20,13,9,.22); }
.fanfold-cmd { font-family: var(--ff-mono); font-size: .72rem; letter-spacing: .5px; color: #3a2f24; margin-bottom: 1.4rem; }
.fanfold-cmd .cmd-line { white-space: pre-wrap; }
.fanfold-foot { margin: 1.3rem 0 0; }
.fanfold-listing { font-family: var(--ff-mono); font-size: .72rem; line-height: 1.5; color: var(--ff-ink); white-space: pre; overflow-x: auto; margin: 0; }
.ff-banner { font-family: var(--ff-mono); font-size: .62rem; line-height: 1.15; color: var(--ff-ink); margin: 0 0 1rem; white-space: pre; overflow-x: auto; }
.ff-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.ff-overlay svg, .ff-overlay img { position: absolute; }

/* aesthetic variants */
.fanfold.aged { background-color: #d3c6a8; background-image: radial-gradient(rgba(120,90,40,.05) 1px, transparent 1.4px); background-size: 7px 7px; }
.fanfold.damaged { background-color: #cabd99; color: #3a3020;
  background-image: radial-gradient(circle at 18% 84%, rgba(90,55,20,.18), transparent 22%), radial-gradient(circle at 92% 12%, rgba(90,55,20,.13), transparent 18%), radial-gradient(rgba(110,80,35,.06) 1px, transparent 1.4px);
  background-size: auto, auto, 6px 6px; }
.fanfold.no-sprockets, .fanfold.torn { padding-left: 1.7rem; padding-right: 1.7rem; }
.fanfold.no-sprockets::before, .fanfold.no-sprockets::after, .fanfold.torn::before, .fanfold.torn::after { display: none; }
.fanfold.torn { clip-path: polygon(0% 0%,100% 0%,99% 7%,100% 14%,98.5% 21%,100% 28%,99% 35%,100% 42%,98.5% 49%,100% 56%,99% 63%,100% 70%,98.5% 77%,100% 84%,99% 91%,100% 98%,100% 100%,0% 100%,1% 91%,0% 84%,1.5% 77%,0% 70%,1% 63%,0% 56%,1.5% 49%,0% 42%,1% 35%,0% 28%,1.5% 21%,0% 14%,1% 7%); }
.fanfold.ripped { clip-path: polygon(0 0,100% 0,100% 95%,96% 99%,92% 95%,88% 99%,84% 95%,80% 99%,76% 95%,72% 99%,68% 95%,64% 99%,60% 95%,56% 99%,52% 95%,48% 99%,44% 95%,40% 99%,36% 95%,32% 99%,28% 95%,24% 99%,20% 95%,16% 99%,12% 95%,8% 99%,4% 95%,0 99%); }
.fanfold.coffee { background-repeat: no-repeat;
  background-image: radial-gradient(circle at 84% 24%, transparent 24px, rgba(86,48,18,.16) 25px 29px, transparent 30px), radial-gradient(circle at 84% 24%, rgba(120,72,30,.06) 0 29px, transparent 30px); }
.fanfold.burned { box-shadow: inset 0 0 26px rgba(38,16,4,.55), inset 0 0 72px rgba(38,16,4,.22), 0 14px 38px rgba(0,0,0,.5); }
@media (max-width: 560px){ .fanfold { padding-left: 1.6rem; padding-right: 1.6rem; } }
```

---

## Porting checklist

1. Copy the JS function (5 helpers) and the CSS block into the new project.
2. Set `--ff-paper` / `--ff-ink` / `--ff-hole` / `--ff-mono` to taste.
3. Call `fanfold(cmd, inner, opts)` wherever you'd otherwise drop a code block,
   listing, table of links, or a panel; put code in `<pre class="fanfold-listing">`.
4. For a banner from an image, convert it first (`jp2a image.png`), pass the text.
5. For doodles/flowcharts, draw an SVG and pass it as `overlay`.

## Notes / limits

- `clip-path` powers `torn` / `ripped`; supported in all current browsers, it
  degrades to a straight edge in very old ones.
- Stains, burns and tears are stylised CSS, not photoreal textures. For richer
  grunge, swap the variant backgrounds for a paper/scan texture image.
- Arrays passed as `cmd` are verbatim: no system shaping, no auto W/R, no footer.
- Times and stamps are deterministic per command string, so builds are stable.
