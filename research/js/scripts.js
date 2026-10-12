/*
 * scripts.js - the scripts catalogue (Read ▾ › Scripts): the scripts ELIZA ran and the
 * conversations run on them, as Inventing ELIZA (Ciston et al. 2026, Table 1.2) documents them,
 * extant in Weizenbaum's papers at MIT, mentioned in articles, or referenced elsewhere. Each
 * entry is the table's row as printed: filename, description, type, where it is referenced,
 * whether it is in the archive, and its year. held: the versions under which this bench holds
 * copies of the script or its outputs; evidence: the version of ELIZA Table 1.1 cites it as
 * evidence for.
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
    { n: 10, file: 'DOCTOR', desc: 'The famous Rogerian DOCTOR script.', type: ['SCRIPT', 'OUTPUT'], ref: '“Eliza,” the CACM 1966 paper', archive: 'Yes', year: '1966', held: ['doctor65t100', 'doctor65t102', 'doctor', 'doctor65c-news', 'doctor65c-0305', 'doctor65c-0322'] },
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
    { n: 35, file: 'XYPOLN', desc: '', type: ['NONE'], ref: '', archive: '', year: 'Unknown' }
  ];

  // where an entry is referenced, as a group for the filter
  function sourceOf(s) {
    return /Discontents/.test(s.ref) ? 'taylor68' : /Taylor/.test(s.ref) ? 'taylor-eliza' : /Harvard/.test(s.ref) ? 'harvard' :
      /CACM/.test(s.ref) ? 'cacm' : s.ref === 'Archive' ? 'archive' : 'none';
  }
  var SOURCES = [['', 'Any'], ['archive', 'The archive'], ['taylor68', 'Taylor, “Automated Tutoring and Its Discontents”'], ['taylor-eliza', 'Taylor, “The ELIZA Program”'],
                 ['harvard', 'Harvard Review (1965)'], ['cacm', 'Weizenbaum, CACM (1966)'], ['none', 'Not given']];
  var TYPES = [['', 'All'], ['SCRIPT', 'Script survives'], ['OUTPUT', 'Output survives'], ['NONE', 'Name only']];
  var MONTHS = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
  function yearKey(y) {
    var m = /^(\w+) (\d+), (\d{4})$/.exec(y);
    if (m) return +m[3] * 10000 + (MONTHS[m[1]] || 0) * 100 + +m[2];
    return /^\d{4}$/.test(y) ? +y * 10000 : 99999999;
  }

  // ---------- named subsets of the library ----------
  // rows: the catalogue's entries; versions: the copies and outputs held here, in date order;
  // line: the genealogy's line of descent for the flow, where there is one
  var SUBSETS = [
    { id: '', label: 'All 35', short: 'All' },
    { id: 'doctor', label: 'DOCTOR (copies and outputs)', short: 'DOCTOR', rows: [1, 2, 3, 9, 10], line: 'doctor',
      versions: ['doctor65t100', 'doctor65t102', 'doctor', 'doctor65c-news', 'doctor65c-0305', 'doctor65c-0322'],
      note: 'The DOCTOR script: its copies of 1965 and 1966, and conversations run on it. The Harvard Review conversations (1–3) are counted here as DOCTOR’s, and DOC (9) as a copy of DOCTOR, by inference from their manner and name.' },
    { id: 'maths', label: 'Mathematics: F29, FIGURE, ARITHM', short: 'Mathematics', rows: [5, 12, 13], line: 'figure',
      versions: ['f29-67', 'figure68'],
      note: 'The scripts that define and compute: F29 and FIGURE, its later version, and ARITHM, which evaluates calculations within the conversation. Inventing ELIZA, Table 1.1, cites all three as evidence for ELIZA 1967.' },
    { id: 'taylor', label: 'Taylor’s tutorials, 1967–68', short: 'Taylor', taylor: true,
      versions: ['spacks68c'],
      note: 'The scripts and conversations Edwin F. Taylor’s papers on ELIZA as a tutor describe or print (“The ELIZA Program” and “Automated Tutoring and Its Discontents”), among them the WATSNU listing of scripts.' },
    { id: 'help', label: 'Before ELIZA: HELP, 1964', short: 'HELP, 1964', rows: [19],
      versions: ['help64c-s', 'help64c-p', 'c641001'],
      note: 'Program HELP, in typed outputs headed 11 June 1964, and the CTSS session of 1 October 1964, whose script has a list named HELP (that it is HELP is an inference). Both are dated before ELIZA’s usual dating of 1965.' }
  ];
  function subsetById(id) { return SUBSETS.filter(function (x) { return x.id === id; })[0] || SUBSETS[0]; }
  function inSubset(sub, s) { return !sub.id || (sub.taylor ? /Taylor/.test(s.ref) : (sub.rows || []).indexOf(s.n) >= 0); }
  var subId = '';
  try { subId = SW.store.get('scripts.subset') || ''; } catch (e) { /* storage closed */ }
  SW.subsets = {
    list: SUBSETS,
    current: function () { return subsetById(subId); },
    // choosing a subset filters the catalogue and Read ▾'s scripts, and turns the flow to its line
    set: function (id) {
      subId = subsetById(id).id;
      try { SW.store.set('scripts.subset', subId); } catch (e) { /* storage closed */ }
      var sub = subsetById(subId);
      if (sub.line && SW.genealogyLine) SW.genealogyLine(sub.line);
      var view = SW.$('#view-scripts'); if (view && SW.state.tab === 'scripts') render(view);
    }
  };

  var f = { q: '', type: '', src: '', held: false, sort: 'n', dir: 1 };
  try { var kept = JSON.parse(SW.store.get('scripts.filter') || 'null'); if (kept) f = Object.assign(f, kept); } catch (e) { /* storage closed */ }
  function keep() { try { SW.store.set('scripts.filter', JSON.stringify(f)); } catch (e) { /* storage closed */ } }

  function shown() {
    var q = f.q.trim().toLowerCase();
    var sub = subsetById(subId);
    return SCRIPTS.filter(function (s) {
      if (!inSubset(sub, s)) return false;
      if (f.type && s.type.indexOf(f.type) < 0) return false;
      if (f.src && sourceOf(s) !== f.src) return false;
      if (f.held && !s.held) return false;
      return !q || [s.file, s.desc, s.author, s.ref, s.year].join(' ').toLowerCase().indexOf(q) >= 0;
    }).sort(function (a, b) {
      var x = f.sort === 'file' ? a.file.localeCompare(b.file) : f.sort === 'year' ? yearKey(a.year) - yearKey(b.year) || a.n - b.n : a.n - b.n;
      return x * f.dir;
    });
  }

  function rowHTML(s) {
    var V = root.SWVersions, ev = s.evidence && V.byId(s.evidence);
    var go = (s.held || []).map(function (vid) {
      var v = V.byId(vid), short = v ? v.label.replace(new RegExp('^' + s.file + ' '), '') : vid;
      return '<button class="btn sc-read" data-sc-read="' + esc(vid) + '" title="Read ' + esc(v ? v.label : vid) + ' [' + esc(SW.refOf(vid)) + ']">' + esc(short) + ' ▸</button>';
    }).join('') +
      (ev ? '<a href="#" class="sc-ev" data-sc-ev="' + esc(ev.id) + '" title="Inventing ELIZA, Table 1.1, cites it as evidence for ' + esc(ev.label) + '">Evidence for ' + esc(ev.label) + '</a>' : '');
    return '<tr' + (s.held ? ' class="sc-held"' : '') + '><td class="num">' + s.n + '</td><td class="mono sc-file">' + esc(s.file) + '</td>' +
      '<td class="sc-desc">' + (s.desc ? esc(s.desc) : '<span class="faint">—</span>') + (s.author ? ' <span class="faint">Author: ' + esc(s.author) + '.</span>' : '') + '</td>' +
      '<td>' + s.type.map(function (t) { return '<span class="badge sc-' + t.toLowerCase() + '">' + t + '</span>'; }).join(' ') + '</td>' +
      '<td class="sc-ref">' + (s.ref ? esc(s.ref) : '<span class="faint">—</span>') + '</td>' +
      '<td>' + (s.archive ? esc(s.archive) : '<span class="faint">—</span>') + '</td>' +
      '<td class="sc-year">' + esc(s.year) + '</td><td class="sc-go">' + go + '</td></tr>';
  }

  function render(view) {
    var rows = shown(), arrow = function (k) { return f.sort === k ? (f.dir > 0 ? ' ↑' : ' ↓') : ''; };
    var held = SCRIPTS.filter(function (s) { return s.held; }).length, sub = subsetById(subId);
    view.innerHTML = '<div class="pad scripts">' +
      '<h2>The scripts</h2>' +
      '<p class="hint flow">The scripts ELIZA ran and the conversations run on them, as <i>Inventing ELIZA</i> (Ciston et al. 2026, Table 1.2) documents them: those extant in Weizenbaum’s papers at MIT, mentioned in articles, or referenced elsewhere. The book’s authors are sure there are many others. ' +
      'Type: SCRIPT, a copy of the script survives; OUTPUT, a copy of a conversation it generated survives; NONE, neither survives, and the name is known only from a file or directory listing. Archive: whether it is in the archive. ' + held + ' of ' + SCRIPTS.length + ' have copies held here, to read in the last column. Copies are named by script, year and the identifier the document gives them, outputs by script and date.</p>' +
      '<div class="sc-subset"><label>Subset <select id="sc-sub">' + SUBSETS.map(function (x) { return '<option value="' + x.id + '"' + (x.id === subId ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('') + '</select></label>' +
        (sub.note ? '<span class="hint flow">' + esc(sub.note) + (sub.line ? ' Versions › Genealogy › Flow follows it.' : '') + '</span>' : '') + '</div>' +
      '<div class="sc-filters">' +
        '<input type="search" id="sc-q" placeholder="Find a script, a word, a year" value="' + esc(f.q) + '" aria-label="Find a script">' +
        '<span class="seg-btns" role="group" aria-label="Type">' + TYPES.map(function (t) { return '<button class="btn' + (f.type === t[0] ? ' on' : '') + '" data-sc-type="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</span>' +
        '<label>Referenced in <select id="sc-src">' + SOURCES.map(function (o) { return '<option value="' + o[0] + '"' + (f.src === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>' +
        '<label><input type="checkbox" id="sc-held"' + (f.held ? ' checked' : '') + '> Held here</label>' +
        '<span class="faint sc-count">' + rows.length + ' of ' + (sub.id ? SCRIPTS.filter(function (x) { return inSubset(sub, x); }).length + ' in ' + esc(sub.short) : SCRIPTS.length) + '</span>' +
      '</div>' +
      '<div class="sc-wrap"><table class="data sc-table"><thead><tr>' +
        '<th data-sc-sort="n">#' + arrow('n') + '</th><th data-sc-sort="file">Filename' + arrow('file') + '</th><th>Description</th><th>Type</th><th>Referenced</th><th>Archive</th><th data-sc-sort="year">Year' + arrow('year') + '</th><th></th>' +
      '</tr></thead><tbody>' + (rows.length ? rows.map(rowHTML).join('') : '<tr><td colspan="8" class="hint">No script matches.</td></tr>') + '</tbody></table></div>' +
      '<p class="hint flow sc-src-note">From Ciston, Berry, Hay, Marino, Millican, Shrager, Schwarz and Weil, <i>Inventing ELIZA: How the First Chatbot Shaped the Future of AI</i> (MIT Press, 2026), Table 1.2, “Script Genealogy”, as printed. Evidence links follow Table 1.1.</p>' +
      '</div>';
    wire(view);
  }

  function wire(view) {
    var q = SW.$('#sc-q', view);
    q.oninput = function () { f.q = q.value; keep(); var at = q.selectionStart; render(view); var q2 = SW.$('#sc-q', view); q2.focus(); q2.setSelectionRange(at, at); };
    SW.$('#sc-sub', view).onchange = function (e) { SW.subsets.set(e.target.value); };
    SW.$('#sc-src', view).onchange = function (e) { f.src = e.target.value; keep(); render(view); };
    SW.$('#sc-held', view).onchange = function (e) { f.held = e.target.checked; keep(); render(view); };
    view.onclick = function (e) {
      var t = e.target.closest('[data-sc-type]');
      if (t) { f.type = t.dataset.scType; keep(); render(view); return; }
      var h = e.target.closest('[data-sc-sort]');
      if (h) { var k = h.dataset.scSort; f.dir = f.sort === k ? -f.dir : 1; f.sort = k; keep(); render(view); return; }
      var r = e.target.closest('[data-sc-read]');
      if (r) { SW.nav.go({ v: r.dataset.scRead, p: null, n: null }); return; }
      var ev = e.target.closest('[data-sc-ev]');
      if (ev) { e.preventDefault(); SW.openAt(ev.dataset.scEv); }
    };
  }

  SW.SCRIPTS = SCRIPTS;
  var view = SW.$('#view-scripts');
  if (view) SW.views.scripts = { show: function () { render(view); }, enter: function () { render(view); } };
})(this);
