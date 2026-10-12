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
    refs: { names: { '1965b': 'EL65B', doctor65t100: 'DOC65-T100', doctor65t102: 'DOC65-T102', doctor: 'DOC66', 'doctor65c-news': 'DOC-C65-NEWS', 'doctor65c-0305': 'DOC-C650305', 'doctor65c-0322-draft': 'DOC-C650322-DRAFT', 'doctor65c-0322-ditto': 'DOC-C650322-DITTO', 'doctor65c-0322-print': 'DOC-C650322-PRINT', 'doctor65c-0322-typed': 'DOC-C650322-TYPED', 'help64c-s': 'HELP-C640611-S', 'help64c-p': 'HELP-C640611-P', c641001: 'C641001', 'f29-67': 'F29-67', figure68: 'FIG-68', spacks68c: 'SPACKS-C68', slip1965: 'SLIP65' }, prefix: 'EL-', dir: 'sources' },
    forks: [['script', 'Scripts (run on ELIZA)'], ['eliza', 'ELIZA (calls SLIP)'], ['slip', 'SLIP'], ['output', 'Outputs (conversations)']],   // the version picker's groups: the layers (js/layers.js)
    start: '1965b',
    // the code in layers, top first (js/layers.js): a script runs on ELIZA, which calls SLIP. A
    // name a layer uses and does not define is looked up in the version chosen in the layer
    // below; a script's forms, in the ELIZA code that acts on them.
    layers: {
      list: [
        { id: 'script', label: 'Scripts', below: 'eliza', relation: 'runs on', start: 'doctor', note: 'What ELIZA reads and runs: keywords and their rules',
          // the catalogue, and its named subsets (js/scripts.js): a subset narrows the list above
          more: function () {
            var S = root.SW.subsets, cur = S ? S.current().id : '';
            return [['scripts', 'The scripts catalogue', '35 scripts and conversations, after Inventing ELIZA, Table 1.2']].concat(
              S ? S.list.map(function (x) { return ['subset:' + x.id, 'Subset: ' + x.short, x.id ? x.label : 'every script held', x.id === cur]; }) : []);
          } },
        { id: 'eliza', label: 'ELIZA', below: 'slip', relation: 'calls', start: '1965b', note: 'The program, in MAD-SLIP' },
        { id: 'slip', label: 'SLIP', start: 'slip1965', note: 'The list-processing library, in MAD and FAP' }
      ],
      pick: function (p) {
        if (p === 'scripts') { root.SW.setTab('scripts'); return true; }
        if (/^subset:/.test(p) && root.SW.subsets) { root.SW.subsets.set(p.slice(7)); return true; }
      },
      // under Scripts, Read ▾ lists the subset chosen (its copies and its outputs), or every script
      shown: function (id, vs) {
        var S = root.SW.subsets, sub = S && S.current();
        if (id !== 'script' || !sub || !sub.id) return vs;
        return sub.versions.map(function (vid) { return root.SWVersions.byId(vid); }).filter(Boolean);
      },
      forms: {
        script: {
          MEMORY: { re: /TOP\.\(INPUT\) \.E\. \$MEMORY\$/, what: 'Where ELIZA, reading a script, takes in its MEMORY entry.' },
          NONE: { re: /TOP\.\(INPUT\) \.E\. \$NONE\$/, what: 'Where ELIZA, reading a script, takes in its NONE entry.' },
          '=': { re: /TOP\.\(ES\) \.E\. \$=\$/, what: 'Where ELIZA, applying a rule, goes on to the keyword named after =.' },
          NEWKEY: { missing: 'NEWKEY does not appear in this version of ELIZA’s code. Inventing ELIZA (Table 1.1) dates the NEWKEY function to ELIZA 1966.' },
          PRE: { missing: 'PRE does not appear in this version of ELIZA’s code.' },
          DLIST: { missing: 'DLIST does not appear in this version of ELIZA’s code.' }
        }
      }
    },
    // MAD-SLIP and the ELIZA scripts (kit/lang-mad.js): cards, remarks, decks; a script's lists
    lang: 'mad',
    caseFold: true,
    entry: 'ELIZA',                                        // the deck where the program starts (Functional overview)
    // the About box (kit/about.js); purpose, inside and sources are HTML
    about: {
      icon: '<img src="img/icon.svg" alt="" width="40" height="40">',
      author: 'David M. Berry', citeAuthor: 'Berry, D. M.',
      purpose: 'A bench for the critical reading of ELIZA, Joseph Weizenbaum’s program at MIT (1964–66, MAD-SLIP on CTSS), in its versions: the recovered 1965 source and the DOCTOR script published in 1966, with the lost versions on record. Part of the ELIZA Archaeology Project (findingeliza.org).',
      inside: 'The texts as held, divided into lines and read as MAD-SLIP and as an ELIZA script: routines, labels, remarks, keywords and the SLIP list functions, the script’s keywords and rules. Nothing is run yet.',
      sources: 'The program’s five versions as Inventing ELIZA (2026, Table 1.1) compares them; of these, the recovered printout of the 1965b source, from Weizenbaum’s papers at MIT (released CC0, hdl.handle.net/1721.3/201699). The scripts it ran, apart: the DOCTOR script as printed in the appendix to Weizenbaum’s 1966 paper, transcribed by Anthony C. Hay. Details under Versions.',
      code: 'https://github.com/critical-code-studies/ELIZA',
      catalogue: { skip: [], held: 'held as source' }
    },
    // the default colour theme's name, and the accent of figures exported on black and on white
    theme: { label: '7094', note: 'line-printer white on the console’s charcoal, coral lamps (the default)' },
    accent: { dark: '#ec6a42', light: '#b0401d' },
    // the people whose initials or names are written into the text (Compare marks them)
    hands: [],
    group: 'vZePbqDz',                                     // the project's Hypothesis group (hypothes.is/groups/vZePbqDz/eliza)
    relation: 'ELIZA, ',
    topShare: false,
    settings: {
      tour: 'A few stops through reading, comparing and annotating; about a minute.',
      groupHint: 'Annotations are shared through the project’s private Hypothesis group, <b>vZePbqDz</b> (set for you). Paste another group’s link or ID only to use a different one, and a personal API token (hypothes.is/account/developer). Without them, annotations are kept as drafts in this browser and can be exported or published later.',
      groupPlaceholder: 'https://hypothes.is/groups/vZePbqDz/eliza',
      themeHint: 'The colours of the whole bench: listings, annotations and figures. The ◐ button in the top bar switches between your last light and dark themes.'
    },
    tag: 'bk:',   // the prefix of this bench's tags in Hypothesis (a bench made before bench-kit 0.5.0 names its old prefix here)
    tagsHint: 'e.g. SLIP, script, NEWKEY, provenance',   // examples of tags, in the annotate dialog
    joinCard: '',
    // the worked examples in Help ▸ Advanced annotation
    annoHelp: {
      manual: 'https://doi.org/10.1145/365153.365168', manualName: 'Weizenbaum’s 1966 paper',
      start: 'the major loop begins here', search: 'keyword',
      refA: 'DB, EL65B, ELIZA-1965b.mad:248–260', refB: 'DB, DOC66, DOCTOR.txt:24–31',
      noteA: 'The major loop reads a sentence…', noteB: 'The script’s first keyword…', quoteA: 'The major loop reads a sentence…',
      boxA: 'ELIZA 1965b, ELIZA-1965b.mad, lines 248–260', boxB: 'DOCTOR (1966), DOCTOR.txt, lines 24–31',
      tryText: 'Each word is looked up with `HASH.(WORD,5)`', code: '`HASH.(WORD,5)`',
      caption: 'A link from an annotation on the DOCTOR script to one on the 1965b source. The 1965b annotation lists it under Linked from'
    },
    compare: { comment: 'R', normalised: false, reading: 'Reading',
               supplied: ['support files', 'Include the support files, not only the program files'] },
    comparePrefix: 'ELIZA: ',
    genealogy: { set: ['1965b'], line: 'doctor', lineNames: { doctor: 'DOCTOR, 1965–66', figure: 'F29 and FIGURE, 1967–68', eliza: 'ELIZA, 1965–68' } },
    figureNum: { print: '#b0401d', paper: '#b0401d', phosphor: '#f0a83a' },
    paratexts: { org: 'critical-code-studies', repo: 'eliza_paratexts', cache: 'eliza-paratexts', tokenName: 'ELIZA research bench' },   // the private repository of scans and documents
    examples: { date: 'e.g. 1966-01, or 1965', archive: 'e.g. MIT Libraries, Weizenbaum papers', versions: 'e.g. 1965b, doctor',
                refs: 'e.g. [REF: EL65B, ELIZA-1965b.mad:248]', publisher: 'e.g. Communications of the ACM', finding: 'F1' },
    // the first version is lost, and the tree grows from it
    stemma: { root: '1965a', lostBetween: {}, skip: ['doctor', 'doctor65t100', 'doctor65t102', 'spacks68c', 'doctor65c-news', 'doctor65c-0305', 'doctor65c-0322-draft', 'doctor65c-0322-ditto', 'doctor65c-0322-print', 'doctor65c-0322-typed', 'help64c-s', 'help64c-p', 'c641001', 'f29-67', 'figure68', 'slip1965'], lostOnTrunk: true },   // the scripts and the library are not in the program's descent
    edition: {
      built: function () { return ['Read as', 'MAD-SLIP cards and an ELIZA script, divided into lines']; },
      layout: function (raw) { return String(raw); },
      words: false,
      files: ['all files', 'Include the support and documentation files, not only the program files']
    },
    // Help ▸ Referencing and versions (kit/helppages.js): how the bench's references read
    refHelp: {
      example: '[REF: EL65B, ELIZA-1965b.mad:248–260]',
      about: '<p><b>EL</b>, then the version (<b>65B</b>, the 1965b source as recovered); then the file (<b>ELIZA-1965b.mad</b>) and the lines (<b>248–260</b>), counted in the file as held, not by the cards’ sequence numbers. A script has a name of its own: <b>DOC66</b>, DOCTOR as printed in 1966.</p>',
      more: '<p>Shorter forms: the version alone, <span class="mono">[REF: EL65B]</span>; a whole file, <span class="mono">[REF: DOC66, DOCTOR.txt]</span>. A lost version is named with the prefix: <span class="mono">EL-1966</span>.</p>',
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
