/*
 * versions.js - ELIZA's versions as the bench sees them, and how they descend.
 *
 * ELIZA was never one program: the project documents at least five versions between 1965 and
 * 1968 (findingeliza.org/versions.html). Two texts survive: the printout of the 1965 source
 * (1965b), recovered from Weizenbaum's papers at MIT, and the DOCTOR script printed in the
 * appendix to the 1966 paper. The others are records: what is known of them, and annotations
 * kept on them. Files are under sources/ and shown exactly as held.
 * roles: 'program' (read in Read and compared), 'support', 'doc' (shown, never compared).
 */
(function (root) {
  'use strict';

  var SRC = '../sources/';

  // the list's machinery (links, descent, loading) is bench-kit's kit/versionlist.js
  var L = root.SWVersionList || require('../kit/versionlist.js'), files = L.files;

  var JW = 'Joseph Weizenbaum';

  // fork: the group a version is listed under in the version picker (SW.BENCH.forks)
  // status: 'recovered' (held), 'lost' (known only from the record)
  var VERSIONS = [
    { id: '1965a', label: '1965a, the earliest', date: '1965', sort: 19650100, authors: JW,
      fork: 'mit', status: 'lost', medium: null,
      summary: 'The earliest version the project documents. It broke input into sentences at “.” and “,” only. No source is known.' },
    { id: '1965b', label: '1965b, the recovered source', date: '1965', sort: 19650600, authors: JW,
      fork: 'mit', status: 'recovered', medium: 'Printout (MAD-SLIP, six decks)',
      summary: 'The version whose printout was recovered from Weizenbaum’s papers at MIT and released CC0 (hdl.handle.net/1721.3/201699). It adds “but” to the delimiters and has no NEWKEY function. Six decks of MAD-SLIP: CHANGE (commands TYPE, SUBST, APPEND, ADD, START, RANK and DISPLA, on the script it holds), TPRINT, LPRINT, TESTS, DOCBCD and ELIZA, the main program. The basis of the project’s close reading.',
      build: files('', ['ELIZA-1965b.mad']) },
    { id: '1966', label: '1966, the CACM version', date: 'January 1966', sort: 19660100, authors: JW,
      fork: 'mit', status: 'recovered', medium: 'Script only (the paper’s appendix)',
      summary: 'The version described in Weizenbaum’s paper in Communications of the ACM, 9(1), January 1966. It introduces the NEWKEY function and a keyword stack. Its program does not survive; its DOCTOR script does, printed in the paper’s appendix and transcribed by Anthony C. Hay. Two later drafts of the script, on a printout in Weizenbaum’s papers, are not yet held here.',
      build: files('', ['DOCTOR.txt']) },
    { id: '1967', label: '1967, OPL', date: '1967', sort: 19670100, authors: JW,
      fork: 'mit', status: 'lost', medium: null,
      summary: 'Script handling made general: evaluators allowing expressions of unlimited complexity, and a generalised script system. No source is known.' },
    { id: '1968', label: '1968 and after, the platform', date: '1968–', sort: 19680100, authors: JW,
      fork: 'mit', status: 'lost', medium: null,
      summary: 'Several scripts at once, scripts that could speak to each other, and editing while running; used for computer-assisted teaching at MIT and Harvard. No source has been found.' }
  ];

  // One dialect: the texts are read, not run. Kept for the views that ask.
  var DIALECTS = { mad: { label: 'MAD-SLIP and an ELIZA script (read, not run)', options: {}, noPass1: true } };

  VERSIONS.forEach(function (v) {
    v.dialect = 'mad';
    v.buildNotes = (v.buildNotes || []).map(function (t) { return { by: 'log', who: 'build log', date: '2026-10-12', text: t }; });
  });

  // ---------- descent ----------
  // parent: the version it was made from. The 1966 version descends from 1965b (it adds
  // NEWKEY); its program is lost and its script is what is held.
  var PARENT = { '1965b': '1965a', '1966': '1965b', '1967': '1966', '1968': '1967' };
  var WITNESS = {};
  var ALSO = {};
  var INFLUENCE = {};
  // lines of descent, for the genealogy: each to its last version (tip)
  var LINES = [
    { id: 'mit', label: 'MIT, 1965–68 (1965a → 1968)', tip: '1968' }
  ];

  var api = L({ versions: VERSIONS, src: SRC, dialects: DIALECTS, lines: LINES,
                parent: PARENT, witness: WITNESS, also: ALSO, influence: INFLUENCE });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SWVersions = api;
})(this);
