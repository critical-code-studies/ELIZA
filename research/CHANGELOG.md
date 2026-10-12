# Changelog: the research bench

Changes to the ELIZA research bench (`research/`). The bench keeps its own version numbers, raised by 0.0.1 with each change (the `?v=` on every script and stylesheet in `index.html`); this file records the versions published, newest first.

## 0.1.10 (2026-10-12)

- The scripts catalogue (Read ▾ › Scripts): the 35 scripts and conversations of Inventing ELIZA's Table 1.2, as printed, with search, filters by type, source and holding, sorting by number, name and year; DOCTOR opens in Read, and the scripts Table 1.1 cites as evidence link to ELIZA 1967 and 1968+.

## 0.1.9 (2026-10-12)

- The ↘ marks after calls are gone from the code, which reads as printed again; a name's pop-up holds the jump (↘ to the layer below), and Ctrl- or Cmd-click goes straight there.

## 0.1.8 (2026-10-12)

- Every row of a name's pop-up has a jump icon (→ in this text, ↗ to the layer above, ↘ to the layer below) and selects its line, with the breadcrumb, the link and ◀ back; Ctrl- or Cmd-click opens a routine in the layer below where it begins to run.

## 0.1.7 (2026-10-12)

- A jump to another layer keeps the listing out of sight until it is at the line, so the new layer is never shown at the old place.

## 0.1.6 (2026-10-12)

- A jump to the layer below waits for the routine's listing to be drawn, then scrolls to its line, so it lands on the line at once instead of after the old listing has shown.

## 0.1.5 (2026-10-12)

- A jump to another layer now brings the line into view: the version opened was drawn where the listing had been scrolled, so YMATCH's jump showed SLIP at the old place.

## 0.1.4 (2026-10-12)

- ↘ after every call that the layer below defines: one click jumps to where it begins to run (MAD's ENTRY TO, a FAP routine's labelled first line), so YMATCH lands on line 1684 and HASH on 772. Pop-ups and the calls lens go there too. The SLIP page's attribution is gone from the pop-up.

## 0.1.3 (2026-10-12)

- A name's pop-up reads as a hover card: what it is and where it lives (Function in SLIP, its own routine), what the project says of it, then Defined, Used here and Called from the layer above, each a row of line, routine and code that opens it. Deck is now called routine wherever a reader sees it (the Key explains the decks of cards).

## 0.1.2 (2026-10-12)

- Jump to… works however soon a name is clicked: a pop-up opened while SLIP is still being read says so and fills in when it arrives, and every layer of the stack is read as the page opens. Ctrl- or Cmd-click on a name goes straight to its definition, here or in a layer below.

## 0.1.1 (2026-10-12)

- Layers, after an IDE: Scripts run on ELIZA, which calls SLIP. Read ▾ lists each layer and its versions; the version picker is grouped by layer. A name used in a layer and defined in the one below opens in its pop-up with the definition's first lines and Jump to…; ◀ ▶ (Alt+← and Alt+→) go back and forward; a breadcrumb shows layer › version › file › deck › line; links carry the stack. A script's MEMORY, NONE and = open the ELIZA code that acts on them; NEWKEY, PRE and DLIST say they are not in ELIZA 1965b. The versions as Inventing ELIZA compares them (Table 1.1), with DOCTOR apart as a script. SLIP added (the listing, MAD and FAP, transcribed by Arthur Schwarz, with three routines reconstructed in 2024), with its licence; the calls lens finds 35 of ELIZA's 37 calls in it. Findings F3 (hard-coded replies) and F4 (CHANGE).

## 0.1.0 (2026-10-12)

- The bench, from bench-kit's template (bench-kit 0.35.1), for ELIZA's texts: the 1965 source as recovered (`sources/ELIZA-1965b.mad`) and the DOCTOR script printed in 1966 (`sources/DOCTOR.txt`), with 1965a, 1967 and 1968+ as records of lost versions.
- Read as MAD-SLIP and as an ELIZA script, by `kit/lang-mad.js`: card labels, remark cards, continuation cards and sequence numbers, MAD's keywords whole and short, `$text$`, dotted relations, SLIP and other calls; the script's keywords, `=` references, `/` classes and rule numbers. A name's pop-up gives where it is defined and used, and what the project's SLIP page says of the calls it names.
- Lenses: remarks and comments; the names the program defines (decks, functions, labels); SLIP and other calls; the script's keywords.
- Findings: the `but` delimiter of 1965b, and NEWKEY in the 1966 script and not in the 1965 source.
- Annotations through the project's Hypothesis group (vZePbqDz); paratexts in the private repository critical-code-studies/eliza_paratexts.
