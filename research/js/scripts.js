/*
 * scripts.js - the scripts catalogue (Read ▾ › Scripts), drawn by bench-kit's kit/catalogue.js:
 * the scripts ELIZA ran and the conversations run on them, as Inventing ELIZA (Ciston et al. 2026,
 * Table 1.2) documents them, extant in Weizenbaum's papers at MIT, mentioned in articles, or
 * referenced elsewhere, and those found since, which the book does not list (ie: false). Each
 * entry of the table is its row as printed: filename, description, type, where it is referenced,
 * whether it is in the archive, and its year. held: the versions under which this bench holds
 * copies of the script or its outputs; evidence: the version of ELIZA Table 1.1 cites it as
 * evidence for. Loaded before kit/catalogue.js.
 */
(function (root) {
  'use strict';

  var SW = root.SW, esc = SW.esc;
  var TAYLOR = 'Taylor, “Automated Tutoring and Its Discontents”', HINTS = '“HINTS ON USING, CONTROLLING, AND COMPLAINING ABOUT ELIZA.” May be built in, not script.';
  var HR = 'Harvard Review (Spring 1965)';

  var SCRIPTS = [
    { n: 1, file: '1965 CONVERSATION THE FIRST', desc: 'In which the editor talks to the computer.', author: 'Andrew T. Weil', type: ['OUTPUT'], ref: HR, archive: 'Published', year: '1965' },
    { n: 2, file: '1965 CONVERSATION THE SECOND', desc: 'In which a distraught young lady consults the machine.', author: 'Weizenbaum', type: ['OUTPUT'], ref: HR, archive: 'Published', year: '1965' },
    { n: 3, file: '1965 CONVERSATION THE THIRD', desc: 'In which a human psychiatrist meets his mechanical counterpart.', author: 'Weizenbaum', type: ['OUTPUT'], ref: HR, archive: 'Published', year: '1965' },
    { n: 4, file: 'ANTIPR', desc: '', type: ['NONE'], ref: TAYLOR + ' (WATSNU)', archive: '', year: '1968' },
    { n: 5, file: 'ARITHM', desc: 'Undertakes mathematical calculations within the conversation and is able to evaluate and return the result.', type: ['SCRIPT', 'OUTPUT'], ref: 'Archive', archive: 'Yes', year: 'Unknown', evidence: '1967' },
    { n: 6, file: 'CANVEC', desc: 'By this time the student has studied 4-vectors using a textbook of his choice. Notice that the machine is ready to analyze an example provided by the student (although in this conversation the student asks the machine to provide the example). Notice also that toward the end of the interchange the machine misinterprets the student answer “Wwhy not” to mean “No,” thus ending the conversation.', type: ['OUTPUT'], ref: TAYLOR, archive: '', year: '1968' },
    { n: 7, file: 'COLOR', desc: 'Script to ask about colors of things.', type: ['SCRIPT', 'OUTPUT'], ref: 'Archive', archive: 'Yes', year: '1967' },
    { n: 8, file: 'COMMNT', desc: HINTS, type: ['NONE'], ref: TAYLOR + ' (WATSNU script)', archive: '', year: '1968' },
    { n: 9, file: 'DOC', desc: '', type: ['NONE'], ref: '', archive: 'No', year: 'December 18, 1967' },
    { n: 10, file: 'DOCTOR', desc: 'The famous Rogerian DOCTOR script.', type: ['SCRIPT', 'OUTPUT'], ref: '“Eliza,” the CACM 1966 paper', archive: 'Yes', year: '1966', held: ['doctor65t100', 'doctor65t102', 'doctor', 'doctor65c-news', 'doctor65c-0305', 'doctor65c-0322-draft', 'doctor65c-0322-ditto', 'doctor65c-0322-print', 'doctor65c-0322-typed'] },
    { n: 11, file: 'ELEVTR', desc: 'Discusses the physics of an elevator.', type: ['OUTPUT'], ref: TAYLOR + ' (WATSNU)', archive: 'Yes?', year: '1968' },
    { n: 12, file: 'F29', desc: 'Appears to be an early version of the FIGURE mathematical definition script.', type: ['SCRIPT'], ref: 'Archive', archive: 'Yes', year: 'December 26, 1967', evidence: '1967', held: ['f29-67'] },
    { n: 13, file: 'FIGURE', desc: 'Appears to be a late version of F29 extended with many more definitions and responses.', type: ['SCRIPT'], ref: 'Archive', archive: 'Yes', year: 'January 9, 1968', evidence: '1967', held: ['figure68'] },
    { n: 14, file: 'FORVEC', desc: '', type: ['NONE'], ref: 'Archive', archive: 'No', year: '1967' },
    { n: 15, file: 'FRANCE', desc: '', type: ['OUTPUT'], ref: 'Taylor, “ELIZA Program”', archive: 'No', year: '1967' },
    { n: 16, file: 'FVP1', desc: 'Discussion of the exercise FVP1, in which the student fills in a table and then discusses his table entries with ELIZA. The statement of the problem precedes the conversation. Notice that during the conversation (regarding question 3) the machine treats a wrong answer as right, but by accident the error is discovered by the student. Notice also that after the problem has been discussed to the satisfaction of the student (parts of the conversation omitted here), the machine initiates a discussion on some issues related to the problem.', type: ['OUTPUT'], ref: TAYLOR, archive: 'No', year: '1968', evidence: '1968' },
    { n: 17, file: 'FVQUIZ', desc: '', type: ['NONE'], ref: TAYLOR + ' (WATSNU)', archive: '', year: '1968' },
    { n: 18, file: 'GIRL', desc: 'Written to demonstrate how to write scripts. A real tutorial script must be able, among other things, to follow a developing line of argument. The ELIZA scriptwriter has approximately 100 commands (“functions”) available for instructing the computer how to proceed. GIRL uses only three of these functions: TYPE, GOTO, and POPTOP, the last two of which simply tell the machine how to begin processing the program section of the script.', type: ['SCRIPT', 'OUTPUT'], ref: TAYLOR, archive: 'No', year: '1968' },
    { n: 19, file: 'HELP', desc: 'May be a test script run by Weizenbaum.', type: ['OUTPUT'], ref: '', archive: '', year: 'Unknown', held: ['help64c-s', 'help64c-p'] },
    { n: 20, file: 'HOWCON', desc: HINTS, type: ['NONE'], ref: TAYLOR + ' (WATSNU script)', archive: '', year: '1968' },
    { n: 21, file: 'HOWUSE', desc: HINTS, type: ['NONE'], ref: TAYLOR + ' (WATSNU script)', archive: '', year: '1968' },
    { n: 22, file: 'INTRVW', desc: 'Part of a student conversation using INTRVW, the script that begins the study of 4-vectors. Notice how the conversation proceeds even when the student expresses himself less than clearly. The symbol QQ is sometimes used instead of the question mark. Other times the question mark is simply omitted.', type: ['OUTPUT'], ref: TAYLOR, archive: 'No', year: '1968', evidence: '1968' },
    { n: 23, file: 'MIT', desc: '', type: ['NONE'], ref: 'Archive', archive: 'No', year: '1967' },
    { n: 24, file: 'NEWENG', desc: 'Discusses New England states.', type: ['SCRIPT', 'OUTPUT'], ref: 'Taylor, “The ELIZA Program”', archive: 'No', year: '1967' },
    { n: 25, file: 'ORTH1', desc: '', type: ['NONE'], ref: 'Archive', archive: 'No', year: '1967' },
    { n: 26, file: 'PHOTON', desc: '', type: ['NONE'], ref: 'Archive', archive: 'No', year: '1967' },
    { n: 27, file: 'POLETA', desc: 'Discusses the “Pole and Barn Paradox.”', type: ['OUTPUT'], ref: '', archive: 'Yes?', year: 'Unknown' },
    { n: 28, file: 'QMPROB', desc: '', type: ['NONE'], ref: 'Archive', archive: 'No', year: '1967' },
    { n: 29, file: 'RLPOLN', desc: '', type: ['NONE'], ref: 'Archive', archive: 'No', year: '1967' },
    { n: 30, file: 'SOS', desc: HINTS, type: ['NONE'], ref: TAYLOR + ' (WATSNU script)', archive: '', year: '1968' },
    { n: 31, file: 'SPACKS', desc: 'Discusses a quoted line of poetry by Barry Spacks of the MIT humanities department.', type: ['OUTPUT'], ref: TAYLOR, archive: 'No', year: '1968', evidence: '1968', held: ['spacks68c'] },
    { n: 32, file: 'STATES', desc: '', type: ['NONE'], ref: 'Archive', archive: 'No', year: '1967' },
    { n: 33, file: 'SYNCTA', desc: 'Discusses time synchronization.', type: ['OUTPUT'], ref: TAYLOR + ' (WATSNU script)', archive: 'Yes?', year: '1968' },
    { n: 34, file: 'WATSNU, PREVIOUSLY LSTSCR', desc: 'Lists all other scripts. This may not be a script but instead actually a function in ELIZA.', type: ['OUTPUT'], ref: TAYLOR, archive: '', year: '1968' },
    { n: 35, file: 'XYPOLN', desc: '', type: ['NONE'], ref: '', archive: '', year: 'Unknown' },
    // found since, not in Inventing ELIZA (ie: false)
    { id: 'many', file: 'MANY', desc: 'A script named in the directory listing of the CTSS session of 16 January 1968 that printed F29 and FIGURE: MANY SCRIPT, 9 records, no date printed.', type: ['NONE'], ref: 'Archive (the CTSS session of 16 January 1968)', archive: 'No', year: 'Before January 16, 1968', ie: false },
    { id: 'readf69', file: '(unnamed; readf 69$)', desc: 'The script read in a CTSS session of 1 October 1964 (resume oplsep, then (readf 69$)), whose lists, printed as it loads, include HELP, DL and FIRSTP; the conversation it ran survives. That it is HELP is an inference from the list’s name.', type: ['OUTPUT'], ref: 'Archive', archive: 'Yes', year: 'October 1, 1964', ie: false, held: ['c641001'] }
  ];

  SCRIPTS.forEach(function (s) { s.key = s.n != null ? s.n : s.id; });

  // where an entry is referenced, as a group for the filter
  function sourceOf(s) {
    return /Discontents/.test(s.ref) ? 'taylor68' : /Taylor/.test(s.ref) ? 'taylor-eliza' : /Harvard/.test(s.ref) ? 'harvard' :
      /CACM/.test(s.ref) ? 'cacm' : /^Archive/.test(s.ref) ? 'archive' : 'none';
  }
  var MONTHS = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
  function yearKey(y) {
    var m = /(\w+) (\d+), (\d{4})$/.exec(y);
    if (m) return +m[3] * 10000 + (MONTHS[m[1]] || 0) * 100 + +m[2];
    return /^\d{4}$/.test(y) ? +y * 10000 : 99999999;
  }
  function dash(x) { return x ? esc(x) : '<span class="faint">—</span>'; }

  SW.BENCH.catalogue = {
    view: 'scripts', store: 'scripts', noun: 'script', key: 'key', held: 'held',
    title: 'The scripts',
    rows: SCRIPTS,
    intro: function (cat) {
      return 'The scripts ELIZA ran and the conversations run on them, as <i>Inventing ELIZA</i> (Ciston et al. 2026, Table 1.2) documents them: those extant in Weizenbaum’s papers at MIT, mentioned in articles, or referenced elsewhere. The book’s authors are sure there are many others; those found since are marked “not in IE”. ' +
        'Type: SCRIPT, a copy of the script survives; OUTPUT, a copy of a conversation it generated survives; NONE, neither survives, and the name is known only from a file or directory listing. Archive: whether it is in the archive. ' + cat.held() + ' of ' + SCRIPTS.length + ' have copies held here, to read in the last column. Copies are named by script, year and the identifier the document gives them, outputs by script and date.';
    },
    foot: 'From Ciston, Berry, Hay, Marino, Millican, Shrager, Schwarz and Weil, <i>Inventing ELIZA: How the First Chatbot Shaped the Future of AI</i> (MIT Press, 2026), Table 1.2, “Script Genealogy”, as printed; the entries marked “not in IE” are this bench’s. Evidence links follow Table 1.1.',
    columns: [
      { key: 'n', label: '#', cls: 'num', sort: function (a, b) { return (a.n || 999) - (b.n || 999); }, html: function (s) { return s.n != null ? String(s.n) : '<span class="faint">—</span>'; } },
      { key: 'file', label: 'Filename', cls: 'mono cat-file', sort: true },
      { key: 'desc', label: 'Description', cls: 'cat-desc', html: function (s) { return dash(s.desc) + (s.author ? ' <span class="faint">Author: ' + esc(s.author) + '.</span>' : ''); } },
      { key: 'type', label: 'Type', html: function (s) { return s.type.map(function (t) { return '<span class="badge sc-' + t.toLowerCase() + '">' + t + '</span>'; }).join(' '); } },
      { key: 'ref', label: 'Referenced', cls: 'cat-ref' },
      { key: 'archive', label: 'Archive' },
      { key: 'year', label: 'Year', cls: 'cat-year', sort: function (a, b) { return yearKey(a.year) - yearKey(b.year); } }
    ],
    search: function (s) { return [s.file, s.desc, s.author, s.ref, s.year].join(' '); },
    facets: [
      { id: 'type', label: 'Type', kind: 'seg', options: [['', 'All'], ['SCRIPT', 'Script survives'], ['OUTPUT', 'Output survives'], ['NONE', 'Name only']], test: function (s, v) { return s.type.indexOf(v) >= 0; } },
      { id: 'src', label: 'Referenced in', kind: 'select', options: [['', 'Any'], ['archive', 'The archive'], ['taylor68', 'Taylor, “Automated Tutoring and Its Discontents”'], ['taylor-eliza', 'Taylor, “The ELIZA Program”'],
          ['harvard', 'Harvard Review (1965)'], ['cacm', 'Weizenbaum, CACM (1966)'], ['none', 'Not given']], test: function (s, v) { return sourceOf(s) === v; } }
    ],
    source: { label: 'IE', yes: 'IE', no: 'not in IE', title: 'Listed in Inventing ELIZA (Ciston et al. 2026), Table 1.2', test: function (s) { return s.ie !== false; } },
    heldLabel: function (s, v) { return v.label.replace(new RegExp('^' + s.file.replace(/[^A-Z0-9]/g, '') + ' '), ''); },
    extra: function (s) {
      var ev = s.evidence && root.SWVersions.byId(s.evidence);
      return ev ? '<a href="#" class="cat-ev" data-cat-open="' + esc(ev.id) + '" title="Inventing ELIZA, Table 1.1, cites it as evidence for ' + esc(ev.label) + '">Evidence for ' + esc(ev.label) + '</a>' : '';
    },
    // named subsets: rows (keys), versions held (date order), the flow's line
    subsets: [
      { id: '', label: 'All ' + SCRIPTS.length, short: 'All' },
      { id: 'doctor', label: 'DOCTOR (copies and outputs)', short: 'DOCTOR', rows: [1, 2, 3, 9, 10], line: 'doctor',
        versions: ['doctor65t100', 'doctor65t102', 'doctor', 'doctor65c-news', 'doctor65c-0305', 'doctor65c-0322-draft', 'doctor65c-0322-ditto', 'doctor65c-0322-print', 'doctor65c-0322-typed'],
        note: 'The DOCTOR script: its copies of 1965 and 1966, and conversations run on it. The Harvard Review conversations (1–3) are counted here as DOCTOR’s, and DOC (9) as a copy of DOCTOR, by inference from their manner and name.' },
      { id: 'maths', label: 'Mathematics: F29, FIGURE, ARITHM', short: 'Mathematics', rows: [5, 12, 13], line: 'figure',
        versions: ['f29-67', 'figure68'],
        note: 'The scripts that define and compute: F29 and FIGURE, its later version, and ARITHM, which evaluates calculations within the conversation. Inventing ELIZA, Table 1.1, cites all three as evidence for ELIZA 1967.' },
      { id: 'taylor', label: 'Taylor’s tutorials, 1967–68', short: 'Taylor', test: function (s) { return /Taylor/.test(s.ref); },
        versions: ['spacks68c'],
        note: 'The scripts and conversations Edwin F. Taylor’s papers on ELIZA as a tutor describe or print (“The ELIZA Program” and “Automated Tutoring and Its Discontents”), among them the WATSNU listing of scripts.' },
      { id: 'help', label: 'Before ELIZA: HELP, 1964', short: 'HELP, 1964', rows: [19, 'readf69'],
        versions: ['help64c-s', 'help64c-p', 'c641001'],
        note: 'Program HELP, in typed outputs headed 11 June 1964, and the CTSS session of 1 October 1964, whose script has a list named HELP (that it is HELP is an inference). Both are dated before ELIZA’s usual dating of 1965.' }
    ]
  };
  SW.SCRIPTS = SCRIPTS;
})(this);
