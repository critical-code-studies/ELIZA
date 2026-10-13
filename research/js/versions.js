/*
 * versions.js - ELIZA as the bench sees it, in three layers: the scripts (layer 'script'), which
 * run on ELIZA (layer 'eliza'), which calls SLIP (layer 'slip'). Each record's layer is its fork,
 * the group the version picker and Read ▾ list it under; kit/layers.js joins the layers.
 *
 * The program: five versions, 1965 to 1968 and after, as Inventing ELIZA (Ciston et al. 2026,
 * Table 1.1) compares them: the delimiters each breaks input at, NEWKEY, the function that
 * edits the script, the keyword stack, hard-coded messages, how scripts are handled, and the
 * evidence for each. Only 1965b's source survives, the printout recovered from Weizenbaum's
 * papers at MIT; the others are records, with annotations kept on them.
 * The scripts: what the program reads and runs, not versions of it, each copy named by script,
 * year and the identifier its document gives it (DOCTOR 1965 (TAPE 100), DOCTOR 1966 (CACM)).
 * The outputs: conversations ELIZA produced, named by script and date, in no layer.
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
      fork: 'eliza', layer: 'eliza', status: 'recovered', medium: 'Printout (MAD-SLIP, six routines)',
      features: { delimit: '“.”, “,” and “but”', newkey: false, edit: 'CHANGE function', stack: false, hardcoded: true, scripts: 'Script', evidence: 'MIT Archive source code' },
      summary: 'The version recovered from the MIT archives: the printout of its source, in Weizenbaum’s papers, released CC0 (hdl.handle.net/1721.3/201699). Delimits sentences with “.”, “,” and “but”. Lacks the NEWKEY function. Includes the undocumented CHANGE function, which edits the script, and hard-coded messages. Six routines of MAD-SLIP, each compiled on its own: CHANGE, TPRINT, LPRINT, TESTS, DOCBCD and ELIZA, the main program. The basis of the project’s close reading.' + T11,
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
    // named by script, year and the identifier the document gives the copy; nothing shows which
    // of the two tapes printed on 6 March 1965 is the earlier, and they are not ordered
    { id: 'doctor65t100', label: 'DOCTOR 1965 (TAPE 100)', date: '6 March 1965', sort: 19650306, authors: JW,
      fork: 'script', layer: 'script', status: 'recovered', medium: 'Script (printout, .TAPE. 100)',
      summary: 'DOCTOR as printed after the ELIZA listing in Weizenbaum’s papers at MIT (handle 1721.3/201699), headed .TAPE. 100 and printed on 6 March 1965 in the same session as TAPE 102. It has HOW and WHEN rules that pass to WHAT, seven replies under WHAT, and sends WHY to WHAT. Transcribed by Anthony C. Hay.',
      build: files('scripts/', ['DOCTOR-1965-TAPE-100.txt']) },
    { id: 'doctor65t102', label: 'DOCTOR 1965 (TAPE 102)', date: '6 March 1965', sort: 19650306.1, authors: JW,
      fork: 'script', layer: 'script', status: 'recovered', medium: 'Script (printout, .TAPE. 102)',
      summary: 'DOCTOR as printed before the ELIZA listing in the same document, headed .TAPE. 102, printed in the same session as TAPE 100. It has no HOW or WHEN rules, one reply under WHAT, and its own WHY rule with four replies; one list, (DON’T YOU KNOW), stands outside the rule it belongs to. Transcribed by Anthony C. Hay.',
      build: files('scripts/', ['DOCTOR-1965-TAPE-102.txt']) },
    { id: 'f29-67', label: 'F29 1967', date: '26 December 1967', sort: 19671226, authors: JW,
      fork: 'script', layer: 'script', status: 'recovered', medium: 'Script (printout, CTSS session of 16 January 1968)',
      summary: 'A script of mathematical definitions (SQUARED, PI, TIMES THE…), printed with FIGURE in a CTSS session of 16 January 1968 (Weizenbaum’s papers at MIT, handle 1721.3/201708); its directory entry is dated 26 December 1967. Inventing ELIZA, Table 1.2, reads it as an early version of FIGURE; Table 1.1 cites it as evidence for ELIZA 1967. The printout ends in the middle of a rule. Transcribed from the scan, 12 October 2026, unchecked; the session, with its directory listing, is held beside it.',
      build: files('scripts/', ['F29-1967.txt', { src: 'CTSS-session-1968-01-16.txt', role: 'doc' }]) },
    { id: 'figure68', label: 'FIGURE 1968', date: '9 January 1968', sort: 19680109, authors: JW,
      fork: 'script', layer: 'script', status: 'recovered', medium: 'Script (printout, CTSS session of 16 January 1968)',
      summary: 'The mathematical definition script, F29 extended with many more definitions and responses (Inventing ELIZA, Table 1.2): comparisons, THANK, CALL, HOW MUCH, COMPUTE and a PROG section. Printed in the same CTSS session as F29; its directory entry is dated 9 January 1968. Table 1.1 cites it as evidence for ELIZA 1967. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('scripts/', ['FIGURE-1968.txt', { src: 'CTSS-session-1968-01-16.txt', role: 'doc' }]) },
    { id: 'doctor', label: 'DOCTOR 1966 (CACM)', date: 'January 1966', sort: 19660101, authors: JW,
      fork: 'script', layer: 'script', status: 'recovered', medium: 'Script (the paper’s appendix)',
      summary: 'The DOCTOR script as printed in the appendix to Weizenbaum’s 1966 paper in Communications of the ACM, transcribed by Anthony C. Hay: keywords with their decomposition and reassembly rules, the Rogerian therapist ELIZA was best known for. A script, not a version of the program: the 1966 version ran it. Two more DOCTOR scripts, successive drafts, are on a printout in Weizenbaum’s papers (.TAPE. 100 and .TAPE. 102); they are not yet held here.',
      build: files('', ['DOCTOR.txt']) },
    // the outputs: conversations ELIZA produced, named by script and date; in no layer
    { id: 'doctor65c-news', label: 'DOCTOR conversation, 1965 (terrible news)', date: '1965', sort: 19650100, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (typed conversation, 32 copies)',
      summary: 'A typed conversation in which the human, “Doctor, I have terrible news”, tells of a computer program at M.I.T. that will ruin them both, and argues that no computer could converse like a man; the program’s replies are indented. From the folder “Computer conversations, 1965” in Weizenbaum’s papers at MIT (handle 1721.3/201700), in 32 copies of one undated page. The script is not named; the replies are DOCTOR’s in manner. Read by machine across all copies, the majority reading taken for each line, and checked against the first copy.',
      build: files('outputs/', [{ src: 'DOCTOR-1965-terrible-news.txt', role: 'text' }]) },
    { id: 'help64c-s', label: 'HELP conversation, 11 June 1964 (student)', date: '11 June 1964', sort: 19640611, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (typed copy and ditto)',
      summary: 'Typed “Computer Output - June 11, 1964 - Program HELP”: a STUDENT and a PROF, each turn in parentheses; the student speaks of “that lovely program at PROJECT MAC”. A typescript with corrections and a ditto copy of it (Weizenbaum’s papers at MIT, handle 1721.3/201704). The date is typed on the copies, not printed by the machine; it is earlier than ELIZA’s usual dating. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'HELP-1964-06-11-student.txt', role: 'text' }]) },
    { id: 'help64c-p', label: 'HELP conversation, 11 June 1964 (patient)', date: '11 June 1964', sort: 19640611.1, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (typed copy and ditto)',
      summary: 'Typed “Computer output - June 11, 1964 - Program HELP”: a PATIENT and a DOCTOR, each turn in parentheses, beginning “I AM VERY DEPRESSED”. A typescript with corrections and a ditto copy (handle 1721.3/201705). Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'HELP-1964-06-11-patient.txt', role: 'text' }]) },
    { id: 'c641001', label: 'Conversation, 1 October 1964 (very depressed)', date: '1 October 1964', sort: 19641001, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (CTSS printout, hand-edited, and three typed copies)',
      summary: 'A CTSS session logged in on 1 October 1964: resume oplsep, (readf 69$), the script’s lists printed as it loads (among them one named HELP), the greeting HOW DO YOU DO - PLEASE SIT DOWN AT THE TYPEWRITER, and a conversation beginning “I am very depressed”. The printout is edited by hand and three typed copies follow the edits (handle 1721.3/201701). The script is not named; that it is HELP is an inference from the list. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'CONVERSATION-1964-10-01-very-depressed.txt', role: 'text' }]) },
    { id: 'doctor65c-0305', label: 'DOCTOR conversation, 5 March 1965', date: '5 March 1965', sort: 19650305, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (printout, hand-edited, and two typed copies)',
      summary: 'A conversation beginning “Doctor, I am terribly depressed”, dated in pencil “Conversation March 5/65”: a printout edited by hand (both sides of the conversation are rewritten) and two typed copies that give the edited text (handle 1721.3/201702). The script is not named; DOCTOR is inferred. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'DOCTOR-1965-03-05-conversation.txt', role: 'text' }]) },
    { id: 'doctor65c-0322-draft', label: 'DOCTOR conversation, 22 March 1965 (men, typescript draft)', date: '22 March 1965', sort: 19650322, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (typescript draft)',
      summary: 'The first of four versions of the conversation beginning “Men are all alike” (handle 1721.3/201703, page 2): a typescript on watermarked paper, shorter than the others and worded differently (“WHY THE UNCERTAIN TONE”, “You are very agressive”). The four are listed in page order, which does not say which came first. The folder is dated 22 March 1965; the script is not named, DOCTOR is inferred. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'DOCTOR-1965-03-22-men-draft.txt', role: 'text' }]) },
    { id: 'doctor65c-0322-ditto', label: 'DOCTOR conversation, 22 March 1965 (men, ditto)', date: '22 March 1965', sort: 19650322.1, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (ditto)',
      summary: 'The second version (pages 3–4): a ditto copy, close to the dialogue Weizenbaum published in 1966. The four are listed in page order, which does not say which came first. The folder is dated 22 March 1965; the script is not named, DOCTOR is inferred. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'DOCTOR-1965-03-22-men-ditto.txt', role: 'text' }]) },
    { id: 'doctor65c-0322-print', label: 'DOCTOR conversation, 22 March 1965 (men, printout)', date: '22 March 1965', sort: 19650322.2, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (printout)',
      summary: 'The third version (page 5): a terminal printout, the program’s own output; “Me are all alike” is corrected by hand to “Men”, and it keeps marks that look like CTSS’s erase character (toh""""other). The four are listed in page order, which does not say which came first. The folder is dated 22 March 1965; the script is not named, DOCTOR is inferred. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'DOCTOR-1965-03-22-men-printout.txt', role: 'text' }]) },
    { id: 'doctor65c-0322-typed', label: 'DOCTOR conversation, 22 March 1965 (men, typed copy)', date: '22 March 1965', sort: 19650322.3, authors: JW,
      fork: 'output', status: 'recovered', medium: 'Output (typed copy)',
      summary: 'The fourth version (pages 6–7): a typed copy with corrections struck over in black. The four are listed in page order, which does not say which came first. The folder is dated 22 March 1965; the script is not named, DOCTOR is inferred. Transcribed from the scan, 12 October 2026, unchecked.',
      build: files('outputs/', [{ src: 'DOCTOR-1965-03-22-men-typed.txt', role: 'text' }]) },
    { id: 'spacks68c', label: 'SPACKS conversation, 1968', date: '1968', sort: 19680102, authors: 'A student and ELIZA, printed by Edwin F. Taylor',
      fork: 'output', status: 'recovered', medium: 'Output (conversation, as printed)',
      summary: 'A student’s conversation with ELIZA running the SPACKS script, which discusses a line of Barry Spacks’s poem “Freshmen”, as Edwin F. Taylor printed it in “Automated Tutoring and Its Discontents” (American Journal of Physics, 1968). The script does not survive. Transcribed by Jeff Shrager for elizagen.org. Inventing ELIZA, Table 1.1, cites SPACKS as evidence for ELIZA 1968+.',
      build: files('outputs/', [{ src: 'SPACKS-1968-conversation.txt', role: 'text' }]) },
    // the library
    { id: 'slip1965', label: 'SLIP, as ELIZA used it', date: 'c. 1965', sort: 19650601, authors: JW,
      fork: 'slip', layer: 'slip', status: 'recovered', medium: 'Listing (MAD and FAP, 67 routines), with 3 reconstructed',
      summary: 'The SLIP library on CTSS as its listing among Weizenbaum’s papers at MIT has it (dome.mit.edu, handle 1721.3/201707): 67 routines, each compiled on its own (51 in MAD, 16 in FAP, the 7094’s assembler), transcribed by Arthur Schwarz. It holds SLIP as published and the routines added for ELIZA (YMATCH, ASSMBL, HASH among them, which sit in the listing but do ELIZA’s work). Three routines ELIZA calls are missing from the listing; BCDIT, INLSTL and LETTER were reconstructed in 2024 by Anthony Hay, Arthur Schwarz and Rupert Lane for the restoration of ELIZA on CTSS, and are held beside it, marked as reconstructions.',
      build: files('SLIP/', ['SLIP-1965.mad', { src: 'bcdit.mad', role: 'support' }, { src: 'inlstl.mad', role: 'support' }, { src: 'letter.mad', role: 'support' }]) }
  ];

  // One dialect: the texts are read, not run. Kept for the views that ask.
  var DIALECTS = { mad: { label: 'MAD-SLIP and an ELIZA script (read, not run)', options: {}, noPass1: true } };

  VERSIONS.forEach(function (v) {
    v.dialect = 'mad';
    v.buildNotes = (v.buildNotes || []).map(function (t) { return { by: 'log', who: 'build log', date: '2026-10-12', text: t }; });
  });

  // ---------- descent ----------
  // The program's versions, one after another; the scripts and the library are not in this descent.
  // DOCTOR's copies make a line of their own, for the genealogy's flow.
  var PARENT = { '1965b': '1965a', '1966': '1965b', '1967': '1966', '1968': '1967' };
  var WITNESS = {};
  var ALSO = {};
  var INFLUENCE = {};
  var LINES = [
    { id: 'eliza', label: 'ELIZA, 1965–68 (1965a → 1968+)', tip: '1968' },
    // the copies of DOCTOR in date order: the two tapes of 6 March 1965 are not ordered, so the
    // line lists them rather than descending from a parent
    { id: 'doctor', label: 'DOCTOR, 1965–66 (TAPE 100, TAPE 102, CACM)', ids: ['doctor65t100', 'doctor65t102', 'doctor'] },
    // F29 and FIGURE, which Inventing ELIZA (Table 1.2) reads as an early and a late version
    { id: 'figure', label: 'F29 and FIGURE, 1967–68', ids: ['f29-67', 'figure68'] }
  ];

  // where a file's text begins: a script's or an output's transcriber set a note at its head, in
  // lines starting ;, which the comparisons leave out; a MAD listing begins at its first line
  var findTitle = L.skipHead(';', function (b) { return !/\.mad$/i.test(b.src); });

  var api = L({ versions: VERSIONS, src: SRC, dialects: DIALECTS, lines: LINES,
                parent: PARENT, witness: WITNESS, also: ALSO, influence: INFLUENCE, findTitle: findTitle });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SWVersions = api;
})(this);
