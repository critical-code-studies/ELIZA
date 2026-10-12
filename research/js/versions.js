/*
 * versions.js - ELIZA as the bench sees it, in three layers: the scripts (layer 'script'), which
 * run on ELIZA (layer 'eliza'), which calls SLIP (layer 'slip'). Each record's layer is its fork,
 * the group the version picker and Read ▾ list it under; js/layers.js joins the layers.
 *
 * The program: five versions, 1965 to 1968 and after, as Inventing ELIZA (Ciston et al. 2026,
 * Table 1.1) compares them: the delimiters each breaks input at, NEWKEY, the function that
 * edits the script, the keyword stack, hard-coded messages, how scripts are handled, and the
 * evidence for each. Only 1965b's source survives, the printout recovered from Weizenbaum's
 * papers at MIT; the others are records, with annotations kept on them.
 * The scripts: what the program reads and runs, not versions of it. DOCTOR as printed in the
 * appendix to the 1966 paper is held; others survive in the archive and are not yet here.
 * SLIP: the list-processing library in MAD and FAP, as its listing in Weizenbaum's papers has it
 * (dome.mit.edu, handle 1721.3/201707), transcribed by Arthur Schwarz, with the three routines
 * ELIZA needs that the listing lacks, reconstructed in 2024 by Anthony Hay, Arthur Schwarz and
 * Rupert Lane. Its licence is in sources/SLIP/LICENSE.txt.
 * Files are under sources/ and shown exactly as held.
 */
(function (root) {
  'use strict';

  var SRC = '../sources/';

  // the list's machinery (links, descent, loading) is bench-kit's kit/versionlist.js
  var L = root.SWVersionList || require('../kit/versionlist.js'), files = L.files;

  var JW = 'Joseph Weizenbaum';
  var T11 = ' (Ciston et al. 2026, Inventing ELIZA, Table 1.1.)';

  // fork: the group a version is listed under in the version picker (SW.BENCH.forks)
  // status: 'recovered' (held), 'lost' (known only from the record and the evidence)
  // features: Table 1.1's columns, as this bench's About and Versions show them
  var VERSIONS = [
    { id: '1965a', label: 'ELIZA 1965a', date: '1965', sort: 19650100, authors: JW,
      fork: 'eliza', layer: 'eliza', status: 'lost', medium: null,
      features: { delimit: '“.” and “,”', newkey: false, edit: null, stack: false, hardcoded: false, scripts: 'Script', evidence: 'MIT Archive flowcharts' },
      summary: 'Delimits sentences with only “.” and “,”, as the flowcharts in the MIT archive show. No source is known.' + T11 },
    { id: '1965b', label: 'ELIZA 1965b', date: '1965', sort: 19650600, authors: JW,
      fork: 'eliza', layer: 'eliza', status: 'recovered', medium: 'Printout (MAD-SLIP, six decks)',
      features: { delimit: '“.”, “,” and “but”', newkey: false, edit: 'CHANGE function', stack: false, hardcoded: true, scripts: 'Script', evidence: 'MIT Archive source code' },
      summary: 'The version recovered from the MIT archives: the printout of its source, in Weizenbaum’s papers, released CC0 (hdl.handle.net/1721.3/201699). Delimits sentences with “.”, “,” and “but”. Lacks the NEWKEY function. Includes the undocumented CHANGE function, which edits the script, and hard-coded messages. Six decks of MAD-SLIP: CHANGE, TPRINT, LPRINT, TESTS, DOCBCD and ELIZA, the main program. The basis of the project’s close reading.' + T11,
      build: files('', ['ELIZA-1965b.mad']) },
    { id: '1966', label: 'ELIZA 1966', date: 'January 1966', sort: 19660100, authors: JW,
      fork: 'eliza', layer: 'eliza', status: 'lost', medium: null,
      features: { delimit: '“.”, “,” and “but”', newkey: true, edit: 'EDIT function', stack: true, hardcoded: false, scripts: 'Script', evidence: 'Weizenbaum, “ELIZA” (1966)' },
      summary: 'The version described in Weizenbaum’s paper in Communications of the ACM, 9(1), January 1966: the NEWKEY function and the keyword stack, and an EDIT function for the script. The “but” delimiter is left out of the article but present in its dialogues. Its program does not survive; the DOCTOR script printed with the paper is held under Scripts.' + T11 },
    { id: '1967', label: 'ELIZA 1967', date: '1967', sort: 19670100, authors: JW,
      fork: 'eliza', layer: 'eliza', status: 'lost', medium: null,
      features: { delimit: '“.”, “,” and “but”', newkey: true, edit: 'EDIT function', stack: true, hardcoded: false, scripts: 'OPL', evidence: 'Weizenbaum, “Contextual Understanding by Computers” and “OPL-I”; Taylor, “Automated Tutoring and Its Discontents”; the ARITHM, F29 and FIGURE scripts' },
      summary: 'Adds sophisticated script handling using OPL, as described in Weizenbaum’s “Contextual Understanding by Computers” and “OPL-I”, and in Taylor’s “Automated Tutoring and Its Discontents”. Also evidenced by the ARITHM, F29 and FIGURE scripts extant in the archive. No source is known.' + T11 },
    { id: '1968', label: 'ELIZA 1968+', date: '1968–', sort: 19680100, authors: JW,
      fork: 'eliza', layer: 'eliza', status: 'lost', medium: null,
      features: { delimit: '“.”, “,” and “but”', newkey: true, edit: 'EDIT function', stack: true, hardcoded: false, scripts: 'OPL', evidence: 'Taylor, “Automated Tutoring and Its Discontents”; the SPACKS, INTRVW and FVP1 scripts' },
      summary: 'Script handling by OPL. A description of the planning of this version appears in Taylor’s “Automated Tutoring and Its Discontents”; the scripts SPACKS, INTRVW and FVP1 give evidence of its use in work developed by Walter E. Daniels. No source has been found.' + T11 },
    // the scripts
    { id: 'doctor', label: 'DOCTOR (1966, as printed)', date: 'January 1966', sort: 19660101, authors: JW,
      fork: 'script', layer: 'script', status: 'recovered', medium: 'Script (the paper’s appendix)',
      summary: 'The DOCTOR script as printed in the appendix to Weizenbaum’s 1966 paper in Communications of the ACM, transcribed by Anthony C. Hay: keywords with their decomposition and reassembly rules, the Rogerian therapist ELIZA was best known for. A script, not a version of the program: the 1966 version ran it. Two more DOCTOR scripts, successive drafts, are on a printout in Weizenbaum’s papers (.TAPE. 100 and .TAPE. 102); they are not yet held here.',
      build: files('', ['DOCTOR.txt']) },
    // the library
    { id: 'slip1965', label: 'SLIP, as ELIZA used it', date: 'c. 1965', sort: 19650601, authors: JW,
      fork: 'slip', layer: 'slip', status: 'recovered', medium: 'Listing (MAD and FAP, 67 decks), with 3 routines reconstructed',
      summary: 'The SLIP library on CTSS as its listing among Weizenbaum’s papers at MIT has it (dome.mit.edu, handle 1721.3/201707): 67 decks, 51 in MAD and 16 in FAP, the 7094’s assembler, transcribed by Arthur Schwarz. It holds SLIP as published and the routines added for ELIZA (YMATCH, ASSMBL, HASH among them, which sit in the listing but do ELIZA’s work). Three routines ELIZA calls are missing from the listing; BCDIT, INLSTL and LETTER were reconstructed in 2024 by Anthony Hay, Arthur Schwarz and Rupert Lane for the restoration of ELIZA on CTSS, and are held beside it, marked as reconstructions.',
      build: files('SLIP/', ['SLIP-1965.mad', { src: 'bcdit.mad', role: 'support' }, { src: 'inlstl.mad', role: 'support' }, { src: 'letter.mad', role: 'support' }]) }
  ];

  // One dialect: the texts are read, not run. Kept for the views that ask.
  var DIALECTS = { mad: { label: 'MAD-SLIP and an ELIZA script (read, not run)', options: {}, noPass1: true } };

  VERSIONS.forEach(function (v) {
    v.dialect = 'mad';
    v.buildNotes = (v.buildNotes || []).map(function (t) { return { by: 'log', who: 'build log', date: '2026-10-12', text: t }; });
  });

  // ---------- descent ----------
  // The program's versions, one after another. The scripts and the library are not in this descent.
  var PARENT = { '1965b': '1965a', '1966': '1965b', '1967': '1966', '1968': '1967' };
  var WITNESS = {};
  var ALSO = {};
  var INFLUENCE = {};
  var LINES = [
    { id: 'eliza', label: 'ELIZA, 1965–68 (1965a → 1968+)', tip: '1968' }
  ];

  var api = L({ versions: VERSIONS, src: SRC, dialects: DIALECTS, lines: LINES,
                parent: PARENT, witness: WITNESS, also: ALSO, influence: INFLUENCE });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SWVersions = api;
})(this);
