# Changelog: the research bench

Changes to the ELIZA research bench (`research/`). The bench keeps its own version numbers, raised by 0.0.1 with each change (the `?v=` on every script and stylesheet in `index.html`); this file records the versions published, newest first.

## 0.1.0 (2026-10-12)

- The bench, from bench-kit's template (bench-kit 0.35.1), for ELIZA's texts: the 1965 source as recovered (`sources/ELIZA-1965b.mad`) and the DOCTOR script printed in 1966 (`sources/DOCTOR.txt`), with 1965a, 1967 and 1968+ as records of lost versions.
- Read as MAD-SLIP and as an ELIZA script, by `kit/lang-mad.js`: card labels, remark cards, continuation cards and sequence numbers, MAD's keywords whole and short, `$text$`, dotted relations, SLIP and other calls; the script's keywords, `=` references, `/` classes and rule numbers. A name's pop-up gives where it is defined and used, and what the project's SLIP page says of the calls it names.
- Lenses: remarks and comments; the names the program defines (decks, functions, labels); SLIP and other calls; the script's keywords.
- Findings: the `but` delimiter of 1965b, and NEWKEY in the 1966 script and not in the 1965 source.
