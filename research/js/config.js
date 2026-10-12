/* config.js - the ELIZA bench's settings for bench-kit (research/kit). Loaded after kit/base.js, before the rest of the kit and the bench's own scripts.
 * The kit's README lists every setting. */
(function (root) {
  'use strict';
  root.SW.BENCH = {
    name: 'ELIZA',
    title: 'ELIZA Research Bench',
    slug: 'eliza',
    store: 'elbench.',                                     // the prefix of this bench's keys in the browser's storage
    base: 'https://findingeliza.org/research/',
    repo: 'https://github.com/critical-code-studies/ELIZA',
    // references to the sources (kit/refs.js): [REF: EL65B, ELIZA-1965b.mad:120], the files on GitHub under sources/
    refs: { names: { '1965b': 'EL65B', '1966': 'EL66' }, prefix: 'EL-', dir: 'sources' },
    forks: [['mit', 'MIT (CTSS)']],                        // the version picker's groups
    start: '1965b',
    // MAD-SLIP and the ELIZA scripts (kit/lang-mad.js): cards, remarks, decks; a script's lists
    lang: 'mad',
    caseFold: true,
    entry: 'ELIZA',                                        // the deck where the program starts (Functional overview)
    // the About box (kit/about.js); purpose, inside and sources are HTML
    about: {
      icon: '<img src="img/icon.svg" alt="" width="40" height="40">',
      author: 'David M. Berry', citeAuthor: 'Berry, D. M.',
      purpose: 'A bench for the critical reading of ELIZA, Joseph Weizenbaum’s program at MIT (1964–66, MAD-SLIP on CTSS), in its versions: the recovered 1965 source and the DOCTOR script published in 1966, with the lost versions on record. Part of the ELIZA Archaeology Project (findingeliza.org).',
      inside: 'The texts as held, divided into lines and read as MAD-SLIP and as an ELIZA script: decks, labels, remarks, keywords and the SLIP list functions, the script’s keywords and rules. Nothing is run yet.',
      sources: 'The recovered printout of the 1965 source, from Weizenbaum’s papers at MIT (released CC0, hdl.handle.net/1721.3/201699), and the DOCTOR script as printed in the appendix to Weizenbaum’s 1966 paper, transcribed by Anthony C. Hay. Details under Versions.',
      code: 'https://github.com/critical-code-studies/ELIZA',
      catalogue: { skip: [], held: 'held as source' }
    },
    // the default colour theme's name, and the accent of figures exported on black and on white
    theme: { label: '7094', note: 'line-printer white on the console’s charcoal, coral lamps (the default)' },
    accent: { dark: '#ec6a42', light: '#b0401d' },
    // the people whose initials or names are written into the text (Compare marks them)
    hands: [],
    group: '',                                             // the project's Hypothesis group's ID, once there is one
    relation: 'ELIZA, ',
    topShare: false,
    settings: {
      tour: 'A few stops through reading, comparing and annotating; about a minute.',
      groupHint: 'Annotations are shared through a Hypothesis group: paste its link or ID, and a personal API token (hypothes.is/account/developer). Without them, annotations are kept as drafts in this browser and can be exported or published later.',
      groupPlaceholder: 'https://hypothes.is/groups/…',
      themeHint: 'The colours of the whole bench: listings, annotations and figures. The ◐ button in the top bar switches between your last light and dark themes.'
    },
    tag: 'bk:',   // the prefix of this bench's tags in Hypothesis (a bench made before bench-kit 0.5.0 names its old prefix here)
    tagsHint: 'e.g. SLIP, script, NEWKEY, provenance',   // examples of tags, in the annotate dialog
    joinCard: '',
    // the worked examples in Help ▸ Advanced annotation
    annoHelp: {
      manual: 'https://doi.org/10.1145/365153.365168', manualName: 'Weizenbaum’s 1966 paper',
      start: 'the major loop begins here', search: 'keyword',
      refA: 'DB, EL65B, ELIZA-1965b.mad:248–260', refB: 'DB, EL66, DOCTOR.txt:24–31',
      noteA: 'The major loop reads a sentence…', noteB: 'The script’s first keyword…', quoteA: 'The major loop reads a sentence…',
      boxA: '1965b, ELIZA-1965b.mad, lines 248–260', boxB: '1966, DOCTOR.txt, lines 24–31',
      tryText: 'Each word is looked up with `HASH.(WORD,5)`', code: '`HASH.(WORD,5)`',
      caption: 'A link from an annotation on the 1966 script to one on the 1965 source. The 1965 annotation lists it under Linked from'
    },
    compare: { comment: 'R', normalised: false, reading: 'Reading',
               supplied: ['support files', 'Include the support files, not only the program files'] },
    comparePrefix: 'ELIZA: ',
    genealogy: { set: ['1965b', '1966'], line: 'mit', lineNames: { mit: 'MIT, 1965–68' } },
    figureNum: { print: '#b0401d', paper: '#b0401d', phosphor: '#f0a83a' },
    paratexts: { org: 'critical-code-studies', repo: 'eliza_paratexts', cache: 'eliza-paratexts' },   // a private repository for scans and documents (to be made)
    examples: { date: 'e.g. 1966-01, or 1965', archive: 'e.g. MIT Libraries, Weizenbaum papers', versions: 'e.g. 1965b, 1966',
                refs: 'e.g. [REF: EL65B, ELIZA-1965b.mad:248]', publisher: 'e.g. Communications of the ACM', finding: 'F1' },
    // the first version is lost, and the tree grows from it
    stemma: { root: '1965a', lostBetween: {}, skip: [], lostOnTrunk: true },
    edition: {
      built: function () { return ['Read as', 'MAD-SLIP cards and an ELIZA script, divided into lines']; },
      layout: function (raw) { return String(raw); },
      words: false,
      files: ['all files', 'Include the support and documentation files, not only the program files']
    },
    // Help ▸ Referencing and versions (kit/helppages.js): how the bench's references read
    refHelp: {
      example: '[REF: EL65B, ELIZA-1965b.mad:248–260]',
      about: '<p><b>EL</b>, then the version (<b>65B</b>, the 1965 source as recovered); then the file (<b>ELIZA-1965b.mad</b>) and the lines (<b>248–260</b>), counted in the file as held, not by the cards’ sequence numbers.</p>',
      more: '<p>Shorter forms: the version alone, <span class="mono">[REF: EL65B]</span>; a whole file, <span class="mono">[REF: EL66, DOCTOR.txt]</span>. A lost version is named with the prefix: <span class="mono">EL-1965a</span>.</p>',
      form: 'Form: [REF: EL<version>, <file>:<lines>], e.g. [REF: EL65B, ELIZA-1965b.mad:248–260].',
      versions: { title: 'The versions', all: true }
    },
    // Help ▸ What you should read (kit/helppages.js): the bench's reading, as HTML entries in groups.
    // (A bench that repairs its texts to run them adds cards: see the kit's README, Hooks.)
    // sitemap.html (Help ▸ Site map), written by kit/tools/sitemap.js
    sitemap: { site: ['../index.html', 'The ELIZA site'], opens: 'the 1965 source as recovered', lost: 'lost: no source survives',
               sitePages: [['../overview.html', 'overview'], ['../doctor.html', 'the DOCTOR script'], ['../versions.html', 'the versions'], ['../code.html', 'the code'], ['../slip.html', 'SLIP'], ['../bibliography.html', 'bibliography']] },
    reading: {
      intro: 'Where to begin on ELIZA, and on reading code as a cultural text.',
      menu: 'Weizenbaum’s paper, the team’s book, and reading code',
      groups: [
        ['ELIZA', [
          'Weizenbaum, J. (1966) ‘ELIZA—a computer program for the study of natural language communication between man and machine’, <i>Communications of the ACM</i>, 9(1), pp. 36–45. Available at: <a href="https://doi.org/10.1145/365153.365168">doi.org/10.1145/365153.365168</a>.',
          'Ciston, S., Berry, D. M., Hay, A., Marino, M. C., Millican, P., Schwarz, A., Shrager, J. and Weil, P. (2026) <i>Inventing ELIZA: How the First Chatbot Shaped the Future of AI</i>. Cambridge, MA: The MIT Press.'
        ]],
        ['Critical code studies', [
          'Marino, M. C. (2020) <i>Critical Code Studies</i>. Cambridge, MA: The MIT Press.',
          'Berry, D. M. (2011) <i>The Philosophy of Software: Code and Mediation in the Digital Age</i>. Basingstoke: Palgrave Macmillan.',
          'Berry, D. M. and Marino, M. C. (2024) ‘Reading ELIZA: Critical Code Studies in Action’, <i>Electronic Book Review</i>. Available at: <a href="https://electronicbookreview.com/essay/reading-eliza-critical-code-studies-in-action/" target="_blank" rel="noopener">https://electronicbookreview.com/essay/reading-eliza-critical-code-studies-in-action/</a>.']]
      ]
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
