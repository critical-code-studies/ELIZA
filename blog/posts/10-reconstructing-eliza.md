---
title: Reconstructing ELIZA
date: 25 January 2025
author: David M. Berry and Sarah Ciston
---

The reconstruction of historical software presents fascinating challenges at the intersection of computer science, digital preservation, and software archaeology. In recent work reconstructing Joseph Weizenbaum’s original ELIZA from 1965, the team encountered unique difficulties that highlight important questions about software preservation and historical authenticity.

ELIZA, created by Joseph Weizenbaum at MIT in the early 1960s, is usually considered the world’s first chatbot. It was developed in MAD-SLIP on MIT’s Compatible Time-Sharing System (CTSS), running on an IBM 7094. Our recent discovery of original ELIZA printouts in Weizenbaum’s archives at MIT, including an early version of the famous DOCTOR script and MAD-SLIP code, provided an unprecedented opportunity to resurrect this foundational piece of computing history.

The team’s reconstruction revealed several key technical challenges. CTSS used 6-bit BCD character encoding, packing six characters into a 36-bit word, a reminder of computing before standardised ASCII encoding. The MAD programming language itself used verbose keywords that could be abbreviated, making the code particularly difficult to interpret decades later. For example, ‘WHENEVER’ could be shortened to ‘W'R’, a convention that made sense in the era of punch cards but presents challenges for modern interpretation.

Several critical functions were missing from the recovered code and had to be carefully reconstructed: BCDIT, a function for converting binary numbers to BCD format; INLST, a crucial function used in XMATCH and ASSMBL operations; LETTER, a character classification function with no extant documentation; and various initialisation routines for common data areas.

The reconstruction required not just technical expertise but detective work to understand the original system’s behaviour. As Lane et al. (2025) note, “running the original code feels good and authentic. Finding bugs in it only adds to the authenticity.”

This archaeological approach to code reconstruction raises important questions about authenticity and preservation. Should we fix historical bugs when we find them? How do we balance historical accuracy with the desire for a working system? These questions parallel debates in architectural preservation about restoration versus reconstruction. How are we to preserve the material traces of something that exists in many versions, iterations, and offshoots, in particular before the era of Git (which itself presents new problems for contemporary software archiving)?

The process also highlighted how software preservation differs from physical artefact preservation. Unlike buildings or manuscripts, software exists simultaneously as human-readable text and machine-executable instructions. This dual nature creates unique challenges for preservation and reconstruction.

Our work on ELIZA demonstrates the importance of treating historical software as both technical and cultural heritage. The reconstruction reveals not just the technical sophistication of early computing but also the social and institutional context of AI, which did not result from a linear progression of developments but rather shifted and iterated back over itself.

The reconstructed ELIZA, now running on an emulated CTSS system, offers a unique window into computing history. It stands as testimony to both the ingenuity of early computer scientists and the importance of preserving our digital heritage.
