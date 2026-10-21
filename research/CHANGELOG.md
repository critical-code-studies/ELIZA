# Changelog: the research bench

Changes to the ELIZA research bench (`research/`). The bench keeps its own version numbers, raised by 0.0.1 with each change (the `?v=` on every script and stylesheet in `index.html`); this file records the versions published, newest first.

## 0.1.88 (2026-10-21)

- The kit at 0.67.0: Help ▸ Implementations, a guide of its own (also &help=implementations); Help ▸ Codes, links and sharing lists the I-code.

## 0.1.87 (2026-10-21)

- The kit at 0.66.3: a submenu opens as soon as the pointer reaches it; the list the pointer is heading into stays open while it crosses other items.

## 0.1.86 (2026-10-19)

- The kit at 0.66.2: Interlisp read by definition with ' as QUOTE only at an atom's start, its font codes stripped, and PUTPROPS and RPLQQ read as properties; an Implementations entry can name its Lisp reader.

## 0.1.85 (2026-10-19)

- The kit at 0.66.1: Lisp read by definition takes ' as a letter in BBN-LISP and PDP-6 Lisp (where the scripts write DON'T and I'M), and Interlisp has a reader of its own with ' as QUOTE.

## 0.1.84 (2026-10-19)

- The Implementations tab now runs on the kit's module (kit/implementations.js and implementations.css, kit 0.66.0). The bench's own parts are in config.js: the catalogue, the ELIZAGEN credit, and the delimiter rule (compared on whether BUT is a delimiter). Compare reads the Lisp line by definition through kit/lispdefs.js, as the variorum's Compare does.

## 0.1.83 (2026-10-19)

- Implementations: the catalogue names its variorum roots (`variorum`: v:1965b, v:1966, v:doctor, each with its label and the bench version it opens), for the kit's Implementations view.

## 0.1.82 (2026-10-19)

- Implementations: an alternate held privately (a carrier with other programs on it, such as FREUD's Dallas Assortment disk) is named in the source bar, with a link to the paratext holding it.

## 0.1.81 (2026-10-19)

- The kit at 0.65.3: a picture in an item with alternates no longer shows an empty pane; the bench says what to do when a GitHub token is lost or has expired.

## 0.1.80 (2026-10-19)

- Implementations: every code file in Jeff Shrager's elizagen.org is now held and public. Added as alternates: the raw transcriptions of Cosell's 1969 and 1972 programs (I-1O7VW), elizagen's genealogy extract of the Samson PDP-6 program (I-2N9J5), and the annotated transcription of Weizenbaum's MAD-SLIP source of 16 February 2022 (I-S5CMF).

## 0.1.79 (2026-10-19)

- Implementations: an alternate held privately names the paratext record that holds it (heldAt) in place of a file. FREUD (I-SYV6R) publishes its listing, with the Dallas Assortment disk image and its catalogue held privately at P-WYFAB (other programs are on the disk); no entry-level heldAt on a published entry.

## 0.1.78 (2026-10-19)

- The kit at 0.65.2: the GitHub and Hypothesis tokens are written only when changed, removed only when confirmed, kept out of password managers' autofill, and left out of backup files.

## 0.1.77 (2026-10-19)

- Implementations: heldAt names only an entry's own code file held privately. A published entry's paratext record moves to its paratexts (I-2D9J7's manual); FREUD (I-SYV6R) keeps heldAt, as its disk image is still private.

## 0.1.76 (2026-10-19)

- The kit at 0.65.1: an implementation's code (I-XXXXX) written in any text is a link, and Go to a code opens it.

## 0.1.75 (2026-10-19)

- Implementations: Jeff Shrager confirms (19 October 2026) that every version public on elizagen.org is shared with permission, or was collected from an open-access public version with provenance. Every elizagen entry's clearance now quotes him, and seven versions listed on elizagen.org are published: the Burroughs B5500 script, Drunk ELIZA (Temkin), Classic Eliza in Tcl, Eliza for the TI-83 Plus (Ryves), Doctor in Berkeley Logo (Harvey), Elizabeth (Millican), and the FREUD listing from the Dallas Assortment disk. The two Apple II disks stay private, as they carry other programs. 138 entries, 57 with files.

## 0.1.74 (2026-10-19)

- Implementations: Walt Bilofsky's ELIZA, released by him under Creative Commons BY 4.0 (January 2025), published: a new entry for the C source (version 1.1 of 16 September 1985 and 1.0 of 7 February 1984, with its data modules, DOCTOR script, link and batch files, README and reconstruction card), and the 1982 IBM PC disk (ELIZA.COM and the two DOCTOR scripts). The Heath H8 disk stays private, as it carries Heath's HDOS. Entries whose files are held privately now name the paratext record that holds them (Awaiting clearance); 138 entries, 50 with files.

## 0.1.73 (2026-10-19)

- The kit at 0.65.0: Compare ▸ By function, for Lisp benches (kit/lispdefs.js); not used here.

## 0.1.72 (2026-10-19)

- Implementations: the Tree's frame and label colours, whose rules still named the test viewer's id (the labels were near-invisible on dark themes).

## 0.1.71 (2026-10-19)

- Implementations: the Tree's labels in the sans font (the 0.1.70 rule did not reach the text elements).

## 0.1.70 (2026-10-19)

- Implementations: the Tree's labels in the bench's sans font, as in the test viewer (they had taken the monospace).

## 0.1.69 (2026-10-19)

- Implementations is a tab of the bench, no longer a page of its own, so the header, the version picker, the menus and the themes stay in place (it had lost them all). The viewer is now js/implementations.js and css/implementations.css, on the bench's colours. Its state rides in the address as iv, ic, ia, ib, ifeat, ifam and ist beside v and tab, and links to the old page (implementations/?view=…&code=…) redirect into the tab. Go to a code (#, or ?code= in a link) opens an I-code at Read.

## 0.1.68 (2026-10-19)

- The kit at 0.64.1: the site map lists links in the tab row to pages of their own.

## 0.1.67 (2026-10-19)

- Implementations, a new page linked from the tab bar: every known implementation of ELIZA (137 entries), with its lineage, features and source, as List, Read, Tree, Matrix and Compare. Source files are published for the 48 entries cleared by licence, public domain or Jeff Shrager’s permission for the files he collected at ELIZAGEN; the rest are described, with their files held privately until cleared. HTML files are served as plain text.

## 0.1.66 (2026-10-19)

- The kit at 0.64.0: every paratext type and medium mapped to a standard term (Library of Congress Genre/Form Terms, the Getty AAT, RDA carrier types), shown in the item's box and carried in the Dublin Core export.

## 0.1.65 (2026-10-19)

- About: the later implementations among the paratexts credited to Jeff Shrager and ELIZAGEN, who collected and shared them, with links to shrager.org and elizagen.org.

## 0.1.64 (2026-10-19)

- The kit at 0.63.0: a new Type list (what the thing is, 58 types in ten groups, with a find box), a new optional Medium (the carrier of a program or object), and both lists extensible from the bench with New type and New medium.

## 0.1.63 (2026-10-19)

- The kit at 0.62.1: the Add box fixed after testing. Each mode shows only its own part; Versions shown and empty unless chosen; Type required; a link's Shows as must be chosen; stubs tagged missing and to-locate; program source kept as readable text; duplicates named; no file left without a record when a save fails. The corpus rule reworded.

## 0.1.62 (2026-10-19)

- The kit at 0.62.0: corpora, for a bulk body of material from one source kept in the catalogue but out of the default paratext list (a Corpus menu and a Corpora block, each with counts; a search reports what it finds in other corpora; a corpus may also list paratexts of its set). A catalogue without corpora is unchanged.

## 0.1.61 (2026-10-18)

- The kit at 0.61.0: Paratext rules, to locate and to request (the tags to-locate and to-request, and a Request: paragraph saying whom to ask and for what), in the README, Help and the Add ▸ Missing hint.

## 0.1.60 (2026-10-14)

- The kit at 0.60.0: ⚙ Settings ▸ Paratexts sets how many items either side to fetch ahead (Off to 10, 1 by default).

## 0.1.59 (2026-10-14)

- The kit at 0.59.0: in Paratexts, a sequence editor (make, order, rename and delete sequences); a stub's last part is Searched:; the items either side of an open one are fetched ahead.

## 0.1.58 (2026-10-14)

- The kit at 0.58.0: in Paratexts, related items, linked both ways.

## 0.1.57 (2026-10-14)

- The kit at 0.57.0: in Paratexts, Back and Next through the list an item was opened from, and through sequences (fixed orders, such as a run of logbooks).

## 0.1.56 (2026-10-14)

- The kit at 0.56.1: missing items read Provenance found but item not available or missing, in small capitals.

## 0.1.55 (2026-10-14)

- The kit at 0.56.0: in Paratexts, the count names any filter that hides matches, with a button to clear it; a long description starts at the top of its box.

## 0.1.54 (2026-10-14)

- The kit at 0.55.0: in Paratexts, stubs for missing items (Add an item ▸ Missing), shown as Missing · to locate, with where each is cited.

## 0.1.53 (2026-10-14)

- The kit at 0.54.0: the Language filter finds an item by any language it can be read in, its own or a translation's; cards mark translations.

## 0.1.52 (2026-10-14)

- The kit at 0.53.7: hovering a star shows the rating a click would give.

## 0.1.51 (2026-10-14)

- The kit at 0.53.6: unrated stars fainter.

## 0.1.50 (2026-10-14)

- The kit at 0.53.5: rated stars a little brighter.

## 0.1.49 (2026-10-14)

- The kit at 0.53.4: unrated stars drawn as outlines, rated stars filled in gold.

## 0.1.48 (2026-10-14)

- The kit at 0.53.3: in Paratexts, an embedded player or a video fills the width of the view.

## 0.1.47 (2026-10-13)

- The kit at 0.53.2: in Paratexts, Download follows the reading showing (a transcript, not its recording).

## 0.1.46 (2026-10-13)

- The kit at 0.53.1: in Paratexts, every card laid out the same way (code and rating at the top, title, type and date, tags, collections).

## 0.1.45 (2026-10-13)

- The kit at 0.53.0: in Paratexts, a link can be shown as a Text file, Code or Other.

## 0.1.44 (2026-10-13)

- The kit at 0.52.0: ⚙ Settings › You has Tell me when a newer release is live, on by default.

## 0.1.43 (2026-10-13)

- The kit at 0.51.1: the newer-release bar looks every five minutes and on coming back to the tab.

## 0.1.42 (2026-10-13)

- The kit at 0.51.0: in Paratexts, an item's readings as a row of buttons, all in view (Audio · Transcript · Translation).

## 0.1.41 (2026-10-13)

- The kit at 0.50.1: in Paratexts, the switchers above an item's view stay at its top left.

## 0.1.40 (2026-10-13)

- The kit at 0.50.0: in Paratexts, an item's alternates as a flip (Original | Translated) or short labels, with the reading's title and note as a caption under them; Catalogued on one line, editable.

## 0.1.39 (2026-10-13)

- The kit at 0.49.0: in Paratexts, an item's Download, GitHub, Open and Source under ☰; Catalogued by a field under More metadata, which can be corrected; closing an item with changes not saved asks first.

## 0.1.38 (2026-10-13)

- bench-kit 0.48.0: the paratext list takes a Language filter, by name; Read ▾ can list a bench's files by part.

## 0.1.37 (2026-10-13)

- bench-kit 0.47.0: the newer-release bar reads the bench's own version; menus mark the open submenu, the place you are and the item under the pointer apart.

## 0.1.36 (2026-10-13)

- bench-kit 0.46.1: a release dates itself (the bench-date shown in Help and About); the site map names the groups of Help and Graphics again.

## 0.1.35 (2026-10-13)

- bench-kit 0.46.0: Help ▾ and Graphics ▾ in submenus, one for each group, its first items named under it.

## 0.1.34 (2026-10-13)

- bench-kit 0.45.0: Read ▾ in submenus, one for each layer, ELIZA first (the stack keeps its order, and ?stack= links with it), each naming its chosen version; within Scripts, DOCTOR's three copies in a submenu of their own, then F29 and FIGURE, then the catalogue and its subsets.

## 0.1.33 (2026-10-13)

- bench-kit 0.44.4: the top bar's small print (version, reference, language line) in the bar's own ink, readable in every theme; on the paper theme's blue bar it had all but vanished.

## 0.1.32 (2026-10-13)

- bench-kit 0.44.3: no specimen that looks like a real code or group anywhere in the kit; examples are given as shapes (A-XXXXX, P-XXXXX, XX-N1).

## 0.1.31 (2026-10-13)

- bench-kit 0.44.2: no made-up Hypothesis address in the joining guide or ⚙ Settings; they ask for the group link from the invitation.

## 0.1.30 (2026-10-13)

- bench-kit 0.44.1: where to get a token, beside the box that wants one.

## 0.1.29 (2026-10-13)

- The version menu lists ELIZA first, then the scripts, then SLIP, then the outputs.

## 0.1.28 (2026-10-13)

- bench-kit 0.44.0: paratexts take a type (what the item is: 51 kinds, from memo, thesis, working paper and electronic mail to program listing, punched cards and oral history), with a Type column, filter and chip, and exports that carry it; the list's rows in alternate shades; a link shows as video, audio, an image, a PDF or a page; two-state switches on the toolbars, Normal / Expand for contractions and Kintsugi / Leiden for a paratext's gaps.

## 0.1.27 (2026-10-13)

- bench-kit 0.43.1: the MAD contractions written out mark what the manual warns each is not; written short contracts whole statements, and only where a statement begins (NORMAL MODE IS INTEGER to N'R, never NORMAL MODE IS I'R), leaving PRINT COMMENT and EXTERNAL FUNCTION, which have no contraction, as they are.

## 0.1.26 (2026-10-13)

- The MAD statement table: contractions expand from Appendix A of the 1966 MAD manual, cited.

## 0.1.25 (2026-10-13)

- bench-kit 0.43.0, the card lens: the MAD and FAP listings read as cards, in this edition's columns (label 1–11, flag 12, statement 13–80, sequence 81–86): the sequence numbers in a gutter of their own, a column ruler, continuation cards joined to their statement, remark cards marked; statement text past column 72 is no longer drawn or read as the sequence field (line 351's T'O MATCH). The MAD contraction table is to come, from the Michigan manual.

## 0.1.24 (2026-10-13)

- bench-kit 0.42.0: a paratext can carry its lacunae, drawn where they are as kintsugi seams, and Help gains Marks and conventions.

## 0.1.23 (2026-10-13)

- bench-kit 0.41.1: switching to a translation shows the translation, not the original.

## 0.1.22 (2026-10-13)

- bench-kit 0.41.0: a paratext can carry a translation beside the original, switchable in the item view.

## 0.1.21 (2026-10-13)

- bench-kit 0.40.1: the stars on a paratext's card rate it (a click on one was read as a click on a collection); a rating shows at once on the card and in the open panel, averages too, and is not undone by an earlier save returning. From 0.40.0: the paratext panel tightened, its record folded to six fields, reactions folded away; a double-click in a find field selects all of it.

## 0.1.20 (2026-10-13)

- On bench-kit 0.39.1: outputs are files read as text by their role, not their folder, and the comparisons read them so; a bar offers to reload when a newer release is live.

## 0.1.19 (2026-10-13)

- On bench-kit 0.38.0: the layers (kit/layers.js) and the scripts catalogue (kit/catalogue.js) are the kit's now, and a jump lands at its line because Read draws a version there. The catalogue marks each entry as in Inventing ELIZA (IE, Table 1.2) or not, with a filter, and lists two scripts found since, MANY and the unnamed script of 1 October 1964. A subset chosen in Read ▾ opens the catalogue on it.

## 0.1.18 (2026-10-12)

- The "Men are all alike" conversation of 22 March 1965 as its four versions, in page order: typescript draft [DOC-C650322-DRAFT], ditto [DOC-C650322-DITTO], printout [DOC-C650322-PRINT] and typed copy [DOC-C650322-TYPED], to compare in Versions › Compare.

## 0.1.17 (2026-10-12)

- Named subsets of the script library: All, DOCTOR (copies and outputs), Mathematics (F29, FIGURE, ARITHM), Taylor's tutorials 1967-68, Before ELIZA: HELP 1964. A subset filters the catalogue, narrows Read ▾'s Scripts to its copies and outputs, and turns the genealogy's flow to its line. The comparisons and the genealogy leave out the transcribers' notes at the head of a script or output.

## 0.1.16 (2026-10-12)

- F29 1967 [F29-67] and FIGURE 1968 [FIG-68], with the CTSS session of 16 January 1968 that printed them, and a flow line for the pair; five more outputs: HELP conversations of 11 June 1964 (student [HELP-C640611-S], patient [HELP-C640611-P]), the conversation of 1 October 1964 [C641001], and DOCTOR conversations of 5 March 1965 [DOC-C650305] and 22 March 1965 (men) [DOC-C650322], transcribed from the scans and unchecked.

## 0.1.15 (2026-10-12)

- The genealogy's flow follows DOCTOR or ELIZA: a line DOCTOR, 1965–66 (TAPE 100, TAPE 102, CACM, in date order, the two tapes not ordered between themselves) beside ELIZA, 1965–68, and opens on DOCTOR, the line with copies to compare.

## 0.1.14 (2026-10-12)

- The catalogue's types in colour: SCRIPT and OUTPUT, a copy survives, in blue; NONE, only the name, in red.

## 0.1.13 (2026-10-12)

- A second output: DOCTOR conversation, 1965 (terrible news) [DOC-C65-NEWS], the typed conversation from Weizenbaum's papers (handle 1721.3/201700), read by machine across its 32 copies and checked against the first.

## 0.1.12 (2026-10-12)

- The scripts held as copies named by script, year and the identifier the document gives them: DOCTOR 1965 (TAPE 100) [DOC65-T100] and (TAPE 102) [DOC65-T102], printed the same day and not ordered, beside DOCTOR 1966 (CACM) [DOC66]. Outputs, conversations ELIZA produced, are a group of their own, read as text: the SPACKS conversation, 1968 [SPACKS-C68]. A script without START opens with its first list. The catalogue opens each copy.

## 0.1.11 (2026-10-12)

- The scripts catalogue says what its types mean: SCRIPT, a copy of the script survives; OUTPUT, a copy of a conversation it generated; NONE, only the name, from a file or directory listing.

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
