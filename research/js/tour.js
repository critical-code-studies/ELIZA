/*
 * tour.js - this bench's guided tour: its stops, and the offer made on a first visit. The
 * tour itself is bench-kit's (kit/tours.js), which reads them from SW.BENCH. A stop: title,
 * text, and where to go: v (version), tab, find (a pattern for the line to select in Read),
 * b (Compare's other version), focus (a selector to outline).
 */
(function (root) {
  'use strict';
  var B = root.SW.BENCH;
  B.tourOffer = 'A short tour shows how to read, compare and annotate ELIZA’s texts (five stops, about a minute).';
  B.tours = {
    welcome: { title: 'Welcome to the ELIZA bench', stops: [
      { title: 'Welcome to the bench', v: '1965b', tab: 'read', focus: '#pick-a',
        text: 'The bench holds ELIZA’s five versions, of which only 1965b’s source survives, and, apart, the scripts ELIZA ran, DOCTOR among them. Choose one here.' },
      { title: 'Reading the cards', v: '1965b', tab: 'read', find: /BEGIN MAJOR LOOP/, focus: '.ln.sel',
        text: 'The source as printed, card by card: labels at the left, a remark card (R) here marking the start of the major loop, the cards’ sequence numbers at the right. Click a name for where it is defined and used; the Key explains the marks.' },
      { title: 'Annotating together', v: '1965b', tab: 'read', find: /\$BUT\$/, focus: '#rd-selbar',
        text: 'Select a line (shift-click for a range) to annotate it, cite it or copy it. This one breaks the input at “.”, “,” and “but”. Annotations are signed with your initials and shared with the group through Hypothesis (⚙ Settings).' },
      { title: 'A script', v: 'doctor', tab: 'read', find: /^\(SORRY/, focus: '.ln.sel',
        text: 'DOCTOR as printed with the 1966 paper: each keyword with its decomposition and reassembly rules. A script is what ELIZA reads and runs, not a version of the program. Text ▸ The script’s keywords lists them all.' },
      { title: 'Versions and findings', v: '1965b', tab: 'genealogy', focus: '#tabs [data-tab="findings"]',
        text: 'Genealogy shows how the versions descend, the lost ones among them. Findings gathers what has been established, each with its evidence; My notes is your own tray for writing.' }
    ] }
  };
})(typeof window !== 'undefined' ? window : globalThis);
