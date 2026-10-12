/*
 * findings-checks.js - this bench's checks in Findings (bench-kit's kit/findings.js), run
 * afresh each time the Bench side is shown: the files each version holds, with their lines. Add a check with SW.findings.addCheck({ title, run, doc }).
 */
(function (root) {
  'use strict';
  var SW = root.SW, V = root.SWVersions, last = null;
  function checkFiles(box) {
    box.innerHTML = '<p class="hint">Reading the versions…</p>';
    var vs = V.VERSIONS.filter(function (v) { return v.build; });
    Promise.all(vs.map(function (v) { return SW.build(v.id); })).then(function (bs) {
      var rows = [];
      bs.forEach(function (b) { b.parts.forEach(function (p, i) { rows.push([b.v.label, p.src.split('/').pop(), p.role, b.lines[i].length]); }); });
      last = rows;
      box.innerHTML = '';
      box.appendChild(SW.table(['Version', 'File', 'Role', 'Lines'], rows, { cls: ['', 'mono', '', 'num'] }));
    }).catch(function (err) { box.innerHTML = '<p class="badge err">' + SW.esc(err.message) + '</p>'; });
  }
  SW.findings.addCheck({ title: 'The files of each version, counted now', run: checkFiles, doc: function () {
    return last ? [{ type: 'h2', text: 'The files of each version' }, SW.tableBlock('Files and lines, ' + SW.fmtDate(SW.today()), ['Version', 'File', 'Role', 'Lines'], last)] : [];
  } });
})(typeof window !== 'undefined' ? window : globalThis);
