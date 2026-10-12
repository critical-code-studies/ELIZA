/*
 * main.js - the ELIZA bench's parts of the frame (bench-kit's kit/shell.js, loaded after it is
 * set): its views, in the order of the tabs, and the language and machine shown beside the
 * picker. The picker's groups and the version shown first are in js/config.js (forks, start).
 */
(function (root) {
  'use strict';
  root.SW.BENCH.shell = {
    views: ['read', 'analyse', 'compare', 'genealogy', 'about', 'findings', 'notes', 'paratexts'],
    lang: function (vv) {
      var script = (vv.build || []).every(function (f) { return !/\.mad$/i.test(f.src); });
      return { text: (script ? 'ELIZA script' : 'MAD-SLIP') + ' · IBM 7094 · CTSS',
        title: script ? 'An ELIZA script: keywords with their decomposition and reassembly rules, as lists. The program reads it; this version’s program does not survive. Click for the project’s page on the code.' :
          'MAD (the Michigan Algorithm Decoder) with SLIP, Weizenbaum’s Symmetric List Processor, for the IBM 7094 under CTSS at MIT. Click for the project’s page on the code.' };
    }
  };
})(this);
