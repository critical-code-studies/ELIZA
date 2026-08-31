---
title: The SLIP API and ELIZA
date: 31 August 2026
author: Arthur Schwarz
---

The Symmetric List Processor (SLIP) API forms an integral part of Eliza, the world’s first chatbot.

SLIP is an Application Program Interface (API) which supports a Directed Acyclic Graph (DAG), with each node on the graph having two lists. One list contains <key, value> pairs, and the other has atomic objects, integers, floating point numbers, BCD ‘strings’ and references to contained lists, other nodes on the graph. SLIP is referred to as either a DAG or as a list of lists. Each reference has an underlying theoretical basis, and although not disjoint, are yet not the same.

It serves some purpose in understanding SLIP’s use and usefulness to Eliza to address some of the superficial features of SLIP, and then to extend those features to a discussion of their use in Eliza. SLIP, in its role as a list of lists, allows for the dynamic creation and deletion of lists, and list constituent parts, atomic objects. The nature of this API supports its extension. Based on user needs, the SLIP facilities can be extended to perform other functions. Think of this as a house with rooms, where each room serves a separate function. When a new function is needed, a new room is built. SLIP can be used in this way. When some new functionality is needed the primitive capabilities of SLIP can be encapsulated into a named function, and then used.

A user can create or delete a list or list atom at any time, and the API will reuse deleted list cells. Note the reuse. Reuse allows the same list cell to be recaptured at runtime for some future use. This recapturing of space for future use reduces the requirement for space allocation, that is, the total space needed is dictated by the maximum aggregate space needed over time, and not the maximum static space needed at any one instance. This means that at compile time, all space needed does not have to be defined to the instantaneous maximum. For example, Eliza is a chatbot. As a chatbot, Eliza allows user input (interaction) to Eliza. Suppose we must define the maximum user input allowed, say 48 words. That means that if a user inputs more than 48 words something, some words, are lost. And if the user inputs less than 48 words, the extra space is not needed. Now, in SLIP, there is no defined size for the user input. Instead, space is dynamically allocated when the user provides an input, and deleted after Eliza is through processing the input. The amortized space needs are accommodated and the instantaneous needs ignored. Eliza does not have to determine the maximum user input allowed, SLIP handles current needs on the fly.

<figure class="post-diagram">
<svg viewBox="0 0 660 250" role="img" aria-label="A fixed buffer reserves space whether it is used or not; SLIP takes cells when they are needed and returns them afterwards">
<defs><marker id="sa1" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L6.5,3 L0,6 Z" fill="var(--lamp-amber)"/></marker></defs>
<text x="14" y="22" font-family="var(--mono)" font-size="11" fill="var(--beam)">A FIXED BUFFER, DECIDED IN ADVANCE</text>
<g stroke="var(--lamp-amber)" stroke-width="1.5" fill="none">
<rect x="14" y="38" width="72" height="28"/><rect x="90" y="38" width="72" height="28"/><rect x="166" y="38" width="72" height="28"/><rect x="242" y="38" width="72" height="28"/>
</g>
<g stroke="var(--ink-dim)" stroke-width="1.2" stroke-dasharray="4 3" fill="none">
<rect x="318" y="38" width="72" height="28"/><rect x="394" y="38" width="72" height="28"/><rect x="470" y="38" width="72" height="28"/><rect x="546" y="38" width="72" height="28"/>
</g>
<g font-family="var(--mono)" font-size="10" text-anchor="middle" fill="var(--bright)">
<text x="50" y="57">MEN</text><text x="126" y="57">ARE</text><text x="202" y="57">ALL</text><text x="278" y="57">ALIKE</text>
</g>
<text x="468" y="86" font-family="var(--mono)" font-size="9" text-anchor="middle" fill="var(--ink-dim)">reserved, unused</text>
<text x="14" y="88" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">a longer sentence is truncated; a shorter one wastes the rest</text>
<text x="14" y="140" font-family="var(--mono)" font-size="11" fill="var(--beam)">SLIP: CELLS TAKEN WHEN NEEDED, RETURNED WHEN DONE</text>
<g stroke="var(--eliza)" stroke-width="1.5" fill="none">
<rect x="14" y="156" width="72" height="28"/><rect x="90" y="156" width="72" height="28"/><rect x="166" y="156" width="72" height="28"/><rect x="242" y="156" width="72" height="28"/>
</g>
<g font-family="var(--mono)" font-size="10" text-anchor="middle" fill="var(--bright)">
<text x="50" y="175">MEN</text><text x="126" y="175">ARE</text><text x="202" y="175">ALL</text><text x="278" y="175">ALIKE</text>
</g>
<rect x="470" y="156" width="148" height="28" stroke="var(--lamp-amber)" stroke-width="1.5" fill="none"/>
<text x="544" y="175" font-family="var(--mono)" font-size="10" text-anchor="middle" fill="var(--ink-dim)">free list</text>
<path d="M470,164 C400,150 360,150 318,164" stroke="var(--lamp-amber)" stroke-width="1.4" fill="none" marker-end="url(#sa1)"/>
<path d="M318,178 C360,196 400,196 470,178" stroke="var(--lamp-amber)" stroke-width="1.4" fill="none" marker-end="url(#sa1)"/>
<text x="394" y="146" font-family="var(--mono)" font-size="9" text-anchor="middle" fill="var(--ink-dim)">take</text>
<text x="394" y="208" font-family="var(--mono)" font-size="9" text-anchor="middle" fill="var(--ink-dim)">return</text>
<text x="14" y="236" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">no maximum has to be chosen: the space needed is the amount in use at the time</text>
</svg>
<figcaption>Why the dynamic use of space matters. A fixed buffer has to be sized in advance, so it either truncates the input or reserves room that is never used. SLIP draws cells when the sentence arrives and returns them when Eliza has finished with it.</figcaption>
</figure>

One feature of SLIP useful to Eliza is the dynamic nature of space usage, as seen above. But there is a more profound use. Eliza accepts a script where the script defines the dialog characteristics, and supports the notion that these dialog characteristics are given in the nature of a persona. How large can the script be? At the outset, Eliza does not know. A script can be very large, or very small. SLIP provides the mechanism for Eliza to ignore the size issue by deferring to SLIP’s dynamic use of space.

But although dynamic space usage is critical to Eliza, there is but one more feature of SLIP which is more important. SLIP can contain a list, and SLIP can contain a list containing a list. This is critical. It serves to define the characteristics of the script syntax, and serves to define all operations available for processing a script.

Let’s look at a list from the Eliza perspective. The mechanisms of iteration over a list are given in the SLIP API, Eliza is not concerned with iteration. The overarching design consideration is everything is a list. And a list is well-defined. Using the descriptive mechanisms employed by McCarthy in LISP, a list is an S-Expression. And an S-Expression is a list, “( …)” which contains lists, “(… (…) …)”. This is an easily described and elegant, recursive, structure. That is Eliza.

But, what are the lists, “(…)”, and what are the “…”. From the SLIP standpoint, SLIP doesn’t care, remember integer, floating point, and ‘string’. Oh, let me digress just a moment. Remember that SLIP has an easy way of extending itself, a house with many rooms adding a new room well that is a ‘string’. A ‘string’ is a SLIP extension consisting of 2 or more words in a list, each word containing 6-BCD characters (6-bits into 36-bit words). A ‘string’ is not native to SLIP, it is a construct, one heavily used by Eliza.

Now, let’s continue. Eliza formats this list of lists to support its goals. The lists are defined by Eliza, and the list contents are defined by Eliza. SLIP takes care of the mechanics of placement of objects into a list and the creation of a list (for scripts). And SLIP does this by providing a reader of lists. To the application, the API reads a list of lists (the BCD script) and creates a list of lists for programmatic use. If Eliza defines the script as an S-Expression, then SLIP will input this expression and create all needed internal structures (lists and atoms) without any additional coding by Eliza. Eliza gets for nothing what would be laborious to produce in code.

Ah, if only that were true. There is one little addition that has to be made to the input to allow SLIP to do everything. Strings have to be separately treated, by the SLIP API, unless the script is required to have no text ‘string’ greater than 6-BCD characters, or if larger, to accept that part of the ‘string’ will not be input, i.e., the string will be truncated. And that, is what Eliza does. All important words in the input script are 6-BCD characters or less, or are truncated to 6-BCD characters. And Eliza does not need to make any adjustment to the API for scripts.

Script S-Expressions are very interesting. They look like a series of S-Expressions, one S-Expression for each keyword. Eliza, as part of its functioning, then ‘recognizes’ each S-Expression by constructing a hash table, with each entry in the hash table referencing the body of an S-Expression. So, at the end of input processing, each script S-Expression is pointed to by a hash table entry. The Eliza logic cycles through the S-Expressions using the SLIP API, and then, not using the SLIP API, constructs an internal reference to the created S-Expression.

An S-Expression has the following format (this is a 2,000 league synopsis):

```
( keyword ((disassembly rule) (assembly rule)
                                  o o o
                              (assembly rule))
                 o o o
           (disassembly rule) (assembly rule)
                                  o o o
                              (assembly rule))
```

and the SLIP API reads this entire structure with a single function call, and returns a reference to the constructed list. Eliza has no software investment in the reading. Eliza, as mentioned, uses the returned list as an entry in the hash table, using the ‘keyword’ as the key, and the rules as the value, that is, decomposing the input structure by discarding the keyword and retaining the rules. Not a big job at this level.

<figure class="post-diagram">
<svg viewBox="0 0 660 260" role="img" aria-label="One SLIP call reads a whole script S-Expression and returns a list, which Eliza files in a hash table under its keyword">
<defs><marker id="sa2" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L6.5,3 L0,6 Z" fill="var(--lamp-amber)"/></marker></defs>
<text x="14" y="20" font-family="var(--mono)" font-size="11" fill="var(--beam)">THE SCRIPT, AS TEXT</text>
<rect x="14" y="32" width="268" height="150" stroke="var(--lamp-amber)" stroke-width="1.5" fill="none"/>
<g font-family="var(--mono)" font-size="10" fill="var(--bright)">
<text x="28" y="54">(SORRY</text>
<text x="46" y="72">((0)</text>
<text x="64" y="90">(PLEASE DON'T APOLOGISE)</text>
<text x="64" y="108">(APOLOGIES ARE NOT</text>
<text x="88" y="126">NECESSARY)))</text>
<text x="28" y="152" fill="var(--ink-dim)">(PERHAPS ... )</text>
<text x="28" y="170" fill="var(--ink-dim)">(ALIKE ... )</text>
</g>
<line x1="292" y1="105" x2="358" y2="105" stroke="var(--lamp-amber)" stroke-width="1.6" marker-end="url(#sa2)"/>
<text x="325" y="96" font-family="var(--mono)" font-size="9" text-anchor="middle" fill="var(--beam)">one SLIP</text>
<text x="325" y="120" font-family="var(--mono)" font-size="9" text-anchor="middle" fill="var(--beam)">call</text>
<text x="372" y="20" font-family="var(--mono)" font-size="11" fill="var(--beam)">ELIZA&#8217;S HASH TABLE</text>
<g stroke="var(--eliza)" stroke-width="1.5" fill="none">
<rect x="372" y="32" width="104" height="30"/><rect x="482" y="32" width="164" height="30"/>
<rect x="372" y="68" width="104" height="30"/><rect x="482" y="68" width="164" height="30"/>
<rect x="372" y="104" width="104" height="30"/><rect x="482" y="104" width="164" height="30"/>
</g>
<g font-family="var(--mono)" font-size="10" fill="var(--bright)">
<text x="386" y="52">SORRY</text><text x="496" y="52">rules for SORRY</text>
<text x="386" y="88">PERHAPS</text><text x="496" y="88">rules for PERHAPS</text>
<text x="386" y="124">ALIKE</text><text x="496" y="124">rules for ALIKE</text>
</g>
<text x="372" y="152" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">key: the keyword</text>
<text x="482" y="152" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">value: the list SLIP built</text>
<text x="14" y="212" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">SLIP builds every list and atom in the structure; Eliza only discards the keyword and keeps the rules</text>
</svg>
<figcaption>Reading a script. The whole nested structure arrives through a single SLIP call, which returns a reference to the constructed list. Eliza then files that list in a hash table under its keyword, and writes no code at all for the reading.</figcaption>
</figure>

Well, the user input isn’t a list. But the Eliza software makes it a list. Further, each disassembly rule is a regular expression and each assembly rule is a template. Given that the user input is, now, a list, Eliza uses the SLIP API to traverse the input, and based on the regular expression in the disassembly rule, to decompose the input into phrases, and again using the SLIP API, to compare the disassembled input for a match, and again using the SLIP API, when a match is found to construct an output using the assembly rule template. If the disassembly rule match is unsuccessful, the SLIP API is used to get the next disassembly rule. Eliza logic takes care of the side conditions of no match being found.

<figure class="post-diagram">
<svg viewBox="0 0 660 300" role="img" aria-label="A sentence becomes a SLIP list, is decomposed into numbered parts by a rule, and is rebuilt from a template into Eliza's reply">
<defs><marker id="sa3" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto"><path d="M0,0 L6.5,3 L0,6 Z" fill="var(--lamp-amber)"/></marker></defs>
<text x="14" y="20" font-family="var(--mono)" font-size="10" fill="var(--ink-dim)">you type</text>
<text x="14" y="40" font-family="var(--mono)" font-size="12" fill="var(--bright)">you are not very aggressive</text>
<line x1="120" y1="50" x2="120" y2="70" stroke="var(--lamp-amber)" stroke-width="1.4" marker-end="url(#sa3)"/>
<text x="134" y="66" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">Eliza makes it a SLIP list</text>
<g stroke="var(--eliza)" stroke-width="1.5" fill="none">
<rect x="14" y="78" width="60" height="26"/><rect x="78" y="78" width="60" height="26"/><rect x="142" y="78" width="60" height="26"/><rect x="206" y="78" width="60" height="26"/><rect x="270" y="78" width="86" height="26"/>
</g>
<g font-family="var(--mono)" font-size="9" text-anchor="middle" fill="var(--bright)">
<text x="44" y="95">YOU</text><text x="108" y="95">ARE</text><text x="172" y="95">NOT</text><text x="236" y="95">VERY</text><text x="313" y="95">AGGRESSIVE</text>
</g>
<line x1="120" y1="112" x2="120" y2="132" stroke="var(--lamp-amber)" stroke-width="1.4" marker-end="url(#sa3)"/>
<text x="134" y="128" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">the decomposition rule splits it</text>
<rect x="14" y="140" width="170" height="30" stroke="var(--lamp-amber)" stroke-width="1.5" fill="none"/>
<text x="28" y="159" font-family="var(--mono)" font-size="11" fill="var(--beam)">(0 YOU ARE 0)</text>
<g font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">
<text x="198" y="152">1 = nothing    2 = YOU    3 = ARE</text>
<text x="198" y="166">4 = NOT VERY AGGRESSIVE</text>
</g>
<line x1="120" y1="178" x2="120" y2="198" stroke="var(--lamp-amber)" stroke-width="1.4" marker-end="url(#sa3)"/>
<text x="134" y="194" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">the reassembly template rebuilds it</text>
<rect x="14" y="206" width="342" height="30" stroke="var(--lamp-amber)" stroke-width="1.5" fill="none"/>
<text x="28" y="225" font-family="var(--mono)" font-size="11" fill="var(--beam)">(WHAT MAKES YOU THINK I AM 4)</text>
<line x1="120" y1="244" x2="120" y2="264" stroke="var(--lamp-amber)" stroke-width="1.4" marker-end="url(#sa3)"/>
<text x="14" y="286" font-family="var(--mono)" font-size="12" fill="var(--eliza)">WHAT MAKES YOU THINK I AM NOT VERY AGGRESSIVE</text>
<text x="372" y="286" font-family="var(--mono)" font-size="9" fill="var(--ink-dim)">Eliza&#8217;s reply</text>
</svg>
<figcaption>The reply cycle. Every step of the traverse, the match and the rebuilding is done through the SLIP API; Eliza supplies the rules and the logic, not the mechanics. This is the exchange Weizenbaum printed in 1966.</figcaption>
</figure>

It’s a “look ma, no hands” moment. The API allows Eliza to concentrate on the logic of the problem, rather than the mechanics of the implementation.

This description is superficial. It does not, and is not meant, to be a full description of Eliza logic. How Eliza does everything. It is meant to show the significant role that the SLIP API has in processing, and to illustrate how Eliza concentrates on the program logic, while the SLIP API takes care of (some of the) program mechanics. Eliza is some 420 lines long. SLIP is some 1,300 lines long. Some SLIP functions are not used, which makes a simple addition of lines of code (420 + 1,300) not a productive exercise. But, SLIP has a huge influence on the overall behavior of Eliza, and a huge influence on the size (number of lines) of Eliza. Eliza would be much larger, perhaps much, much larger, without SLIP.
