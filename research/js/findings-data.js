/*
 * findings-data.js - this bench's own findings and how bench-kit's Findings (kit/findings.js)
 * shows them: the list, its categories and its texts. Loaded before the kit. The findings
 * here are the project's, with their evidence in the texts.
 */
(function (root) {
  'use strict';
  var B = root.SW.BENCH;

  // Evidence is a line, found by pattern in a version's text (so it survives renumbering),
  // or a view (tab, b: Collate's other version).
  B.findings = [
    { no: 'F1', kind: 'Version', cat: 'versions', level: 'key', title: 'ELIZA 1965b breaks its input at “but” as well as at “.” and “,”',
      text: 'In the recovered source, a word ends the part of the input being read when it is a full stop, a comma or BUT. Inventing ELIZA (Table 1.1) dates the “but” delimiter to 1965b: the flowcharts of 1965a show “.” and “,” only.',
      ev: [{ v: '1965b', re: /\$BUT\$/, label: 'the test, in the 1965b source' }] },
    { no: 'F2', kind: 'Version', cat: 'versions', level: 'key', title: 'NEWKEY is in the DOCTOR script of 1966 and nowhere in the 1965b source',
      text: 'DOCTOR as printed in 1966 ends several rules with (NEWKEY), which sends ELIZA on to the next keyword. The word appears nowhere in the 1965b source: the script as printed calls on a function the recovered program does not have. Inventing ELIZA (Table 1.1) places NEWKEY, with the keyword stack, in ELIZA 1966, whose program is lost.',
      ev: [{ v: 'doctor', re: /\(NEWKEY\)/, label: 'NEWKEY, in DOCTOR (1966)' }] },
    { no: 'F3', kind: 'Version', cat: 'program', level: 'key', title: 'ELIZA 1965b writes four of its replies into the program',
      text: 'When no rule matches, the 1965b source prints one of four replies set in the program itself, not drawn from the script: PLEASE CONTINUE, HMMM, GO ON, PLEASE and I SEE (NOMATCH(1) to NOMATCH(4)). Inventing ELIZA (Table 1.1) records hard-coded messages for 1965b and for no later version.',
      ev: [{ v: '1965b', re: /^NOMATCH\(1\)/, label: 'the four replies, in the 1965b source' }] },
    { no: 'F4', kind: 'Version', cat: 'program', level: 'key', title: 'ELIZA 1965b edits its script through CHANGE, a function the 1966 paper does not describe',
      text: 'The first routine of the 1965b source is CHANGE, entered from the main loop when the input is “+”: PLEASE INSTRUCT ME, then the commands TYPE, SUBST, APPEND, ADD, START, RANK and DISPLA on the script it holds. Inventing ELIZA (Table 1.1) calls it undocumented; from 1966 the script is edited by an EDIT function.',
      ev: [{ v: '1965b', re: /^\s+ENTRY TO CHANGE\./, label: 'CHANGE’s entry' }, { v: '1965b', re: /CHANGE\.\(KEY,MYTRAN\)/, label: 'where the main loop calls it' }] }
  ];
  // A category is found from the words of a finding (the one with most matches), unless a cat: tag sets it
  B.findingCats = [
    ['text', 'The texts', /\b(remarks?|cards?|transcri\w*|printouts?|listings?)\b/gi],
    ['program', 'The program', /\b(routines?|functions?|SLIP|loops?|lists?|reads?|keywords?)\b/gi],
    ['versions', 'Versions', /\b(versions?|1965a|1965b|1966|1967|1968|lost)\b/gi]
  ];
  B.findingsTitle = 'Findings';
  B.findingsSubtitle = 'What the sources and their comparison show';
  B.findingsIntro = 'What the group and the bench have established, each with its evidence one click away. Crew: the group’s findings, by member. Bench: the bench’s own, with its checks run afresh.';
  B.findingsSide = 'bench';
  B.findingsRecheck = 'Run the checks again, and fetch the group’s findings';
})(typeof window !== 'undefined' ? window : globalThis);
