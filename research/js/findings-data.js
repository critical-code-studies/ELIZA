/*
 * findings-data.js - this bench's own findings and how bench-kit's Findings (kit/findings.js)
 * shows them: the list, its categories and its texts. Loaded before the kit. The findings
 * here are the project's, with their evidence in the texts.
 */
(function (root) {
  'use strict';
  var B = root.SW.BENCH;

  // Evidence is a line, found by pattern in a version's text (so it survives renumbering),
  // or a view (tab, b: Compare's other version).
  B.findings = [
    { no: 'F1', kind: 'Version', cat: 'versions', level: 'key', title: 'The 1965 source breaks its input at “but” as well as at “.” and “,”',
      text: 'In the recovered source, a word ends the part of the input being read when it is a full stop, a comma or BUT. The project counts “but” among the delimiters as what distinguishes 1965b from the earliest version, 1965a, which broke input at “.” and “,” only.',
      ev: [{ v: '1965b', re: /\$BUT\$/, label: 'the test, in the 1965 source' }] },
    { no: 'F2', kind: 'Version', cat: 'versions', level: 'key', title: 'NEWKEY is in the 1966 script and nowhere in the 1965 source',
      text: 'The DOCTOR script printed in 1966 ends several rules with (NEWKEY), which sends ELIZA on to the next keyword. The word appears nowhere in the 1965 source: the script as printed calls on a function that the recovered program does not have. The project places NEWKEY, with a keyword stack, in the 1966 version, whose program is lost.',
      ev: [{ v: '1966', re: /\(NEWKEY\)/, label: 'NEWKEY, in the 1966 script' }, { v: '1965b', tab: 'compare', b: '1966', label: 'Compare' }] }
  ];
  // A category is found from the words of a finding (the one with most matches), unless a cat: tag sets it
  B.findingCats = [
    ['text', 'The texts', /\b(remarks?|cards?|transcri\w*|printouts?|listings?)\b/gi],
    ['program', 'The program', /\b(decks?|functions?|SLIP|loops?|lists?|reads?|keywords?)\b/gi],
    ['versions', 'Versions', /\b(versions?|1965a|1965b|1966|1967|1968|lost)\b/gi]
  ];
  B.findingsTitle = 'Findings';
  B.findingsSubtitle = 'What the sources and their comparison show';
  B.findingsIntro = 'What the group and the bench have established, each with its evidence one click away. Crew: the group’s findings, by member. Bench: the bench’s own, with its checks run afresh.';
  B.findingsSide = 'bench';
  B.findingsRecheck = 'Run the checks again, and fetch the group’s findings';
})(typeof window !== 'undefined' ? window : globalThis);
