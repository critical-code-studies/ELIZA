# ELIZA: A Critical Code Studies Reading

A static website reading **ELIZA**, Joseph Weizenbaum's 1966 chatbot (MIT, Project
MAC, CTSS on the IBM 7094), as a cultural and technical text. The public face of
the **ELIZA Archaeology Project** and the book *Inventing ELIZA: How the First
Chatbot Shaped the Future of AI* (MIT Press, Software Studies). A companion to the
Critical Code Studies group's readings of [SHRDLU](https://critical-code-studies.github.io/SHRDLU/)
(1968–70) and Spacewar! (1962).

**Status:** v0.5.0. Companion to the book *Inventing ELIZA*, out 14 July 2026.

The site is built around the original MAD-SLIP source recovered from Weizenbaum's
papers in the MIT archive in 2021. It reads the code, the DOCTOR script, the
hardware, the many versions, and the program's long afterlife. It also runs a
faithful ELIZA in the browser.

## Aesthetic

The IBM 7094 / CTSS console: a steel grey-blue page and header, warm line-printer
text, and a bank of indicator lamps in the 7094 palette (the lamp red is the coral
of the *Inventing ELIZA* book cover). The person types lower case; ELIZA answers in
CAPITALS.

- **Hero console** (`console.js`): the hero panel is a working IBM 7094 console:
  a beige chassis with a steel face, nameplate, live blinking indicator-register
  lamps, rocker toggle switches, and a recessed CRT readout. The recovered
  ELIZA-1965b.mad source lists faintly on a fanfold sheet behind it.
- **Power down** (`console.js`): the lit red POWER button runs a 7094 shutdown:
  the lamps flurry and cut out as a Web Audio synth sings *Daisy Bell*, slowing and
  deepening like HAL 9000. A WHAT IS THIS? control opens a modal on the 1961 Bell
  Labs 7094 recording the scene alludes to.
- **Easter egg** (`term.js`): type the letters `e‑l‑i‑z‑a` anywhere and the
  DOCTOR wakes in an overlay, running the genuine 1966 script. Esc closes it.

## The site

Static HTML/CSS/JS, no framework, no build step. Served by GitHub Pages.

| Page | What it is |
|------|------------|
| `index.html` | Home: the argument, the 7094 console, the lamps, the power-down |
| `overview.html` | What ELIZA was; the system vs. the DOCTOR script |
| `doctor.html` | The DOCTOR script: how a rule works, the canonical dialogue |
| `code.html` | The program: MAD-SLIP, the counting mechanism, CHANGE, reconstruction |
| `how.html` | How it works: type a sentence (or pick an example) and step through ELIZA's processing |
| `versions.html` | At least five ELIZAs, 1965–1968, and the scripts beyond DOCTOR |
| `try.html` | A faithful ELIZA running the genuine DOCTOR script in the browser |
| `people.html` | The eight-person project team |
| `talks.html` | Talks and CCS code critiques |
| `book.html` | *Inventing ELIZA* (MIT Press) |
| `blog.html` + `blog/` | The 11 project blog posts, ported from the Google Site |
| `bibliography.html` | Selected writings |
| `about.html`, `links.html` | About, and Resources (related links; nav label is "Resources", file stays `links.html`) |
| `research/` | The ELIZA Research Bench (below) |

## The research bench

[findingeliza.org/research/](https://findingeliza.org/research/) reads ELIZA (MIT, 1964–68) in its surviving versions: the 1965 MAD-SLIP source, its SLIP library, the DOCTOR scripts of 1965 and 1966, and the conversations printed from them. It links every name in the code to where it is defined and used, collates any two texts line by line or by routine (Versions ▸ Collate), shares annotations through a private Hypothesis group, and carries the Implementations catalogue of later ELIZAs (`research/implementations/`). Its shared code is [bench-kit](https://github.com/critical-code-studies/bench-kit), a git submodule at `research/kit`.

**Usage guide:** [findingeliza.org/research/usage.html](https://findingeliza.org/research/usage.html), with worked examples, the two tokens and troubleshooting.

Run it locally (Python 3; the clone is about 76 MB):

```
git clone --recurse-submodules https://github.com/critical-code-studies/ELIZA.git
cd ELIZA
python3 -m http.server 8000
```

Then open `http://localhost:8000/research/`. Opened as a file, the bench stops at "Could not load": it has to be served over HTTP. If the clone was made without `--recurse-submodules`, run `git submodule update --init`.

Tests (Node 22 and Google Chrome or Chromium; no packages): `node research/kit/tools/test.js`.

**Tokens.** Reading, collating, exporting and Implementations need none. Two optional tokens, pasted into ⚙ Settings and kept in the browser's local storage (nothing is configured on the server):

- **Hypothesis API token** (hypothes.is/account/developer), for shared annotations. Join the project's group by invitation first; ⚙ Settings ▸ Annotations ▸ Test connection checks it.
- **GitHub fine-grained token**, for the Paratexts tab, which reads and writes the private repository `critical-code-studies/eliza_paratexts`. Team only: accept the invitation to the `critical-code-studies` organisation first, then use ⚙ Settings ▸ Paratexts ▸ Open the token form, choosing Only select repositories and `eliza_paratexts`.

**Releasing the bench:** `node research/kit/tools/release.js <version> "<changelog line>" [--kit <tag>]` sets the `?v=` on every script and stylesheet, adds the line to `research/CHANGELOG.md`, and with `--kit` moves the submodule to that bench-kit release.

**Licence.** bench-kit is GPL-3.0. This repository has no licence file; the texts carry their own rights, given in the bench's About box.

## The ELIZA engine

`assets/eliza.js` is a faithful JavaScript re-implementation of Weizenbaum's
algorithm, driven by the verbatim DOCTOR script from the 1966 CACM appendix
(transcribed by Anthony Hay). It implements keyword ranking, decomposition /
reassembly, equivalence (`=KEY`), `NEWKEY`, `PRE`, tag dlists, and the "certain
counting mechanism" for memory that the recovered source finally explained. It
reproduces the canonical 1966 conversation. For the historically exact recreation,
see Anthony Hay's [C++ ELIZA](https://github.com/anthay/ELIZA).

## House rules

- **No em dashes** (verify `grep -rc "—" *.html` = 0). En dashes allowed; British spelling.
- **Cache-buster:** bump `?v=N` in the generator when a versioned asset changes.
- **Verify, never fabricate.** Citations to be confirmed against Zotero before final.

## Sources

- `sources/ELIZA-1965b.mad`: the recovered MAD-SLIP source.
- `sources/DOCTOR.txt`: the 1966 CACM DOCTOR script (Anthony Hay transcription).
- `docs/annotations.md`: close-reading annotations on the source.

## Adding a blog post (for co-authors)

The blog has no build step. To add a post, create one Markdown file in
`blog/posts/` and add one line to `blog/posts.json`. You can do it entirely in the
GitHub web interface. Full instructions: [blog/CONTRIBUTING.md](blog/CONTRIBUTING.md).

Posts are Markdown with a small front-matter header (title / date / author) and are
rendered in the browser by `assets/blog.js` and the vendored `assets/marked.min.js`.
The Blog index (`blog.html`) and each post (`blog/post.html?p=<slug>`) read from
`blog/posts.json`. Because posts are fetched at run time, preview locally with a
server (`python3 -m http.server`), not `file://`; on GitHub Pages it just works.

## Regenerating the structural HTML

The non-blog pages share chrome generated by a small Node script (not a runtime
build): `docs/gen.js`. Edit it and run `node docs/gen.js` to rebuild Home, Overview,
Code, DOCTOR, Versions, Try, People, Talks, Book, Bibliography, About, Links and the
Blog shells. Editing the emitted HTML directly is also fine. `docs/gen-md.js` only
seeded the initial 11 Markdown posts; do not re-run it once co-authors edit posts.
