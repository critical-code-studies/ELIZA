---
title: ELLIZA: The Original Chatbot Applied Like a Modern LLM
date: 9 September 2024
author: Jeff Shrager
---

Mark Marino and Sarah Ciston asked Team ELIZA to locate a script that produced a particular educational conversation from Edwin F. Taylor’s 1968 paper “Automated Tutoring and Its Discontents”, a Socratic-style dialogue about a poem.

The original 1966 ELIZA simply reacted to input without logical decision-making. The extended ELIZA described by Hayward in 1968 supported conditionals, arithmetic and branching, letting scripts behave like real programs; the tutoring dialogue would have been difficult in the original ELIZA, which lacks conditional responses and dialogue sequencing.

Rather than reverse-engineer the extended ELIZA, I explored whether the original’s pattern matching alone could carry an educational dialogue: creating a script keyed off all the content words in the subject matter, with leading prompts to drive the conversation forward.

I built an educational script about *Animal Farm* by having ChatGPT generate assertions about the novel, then using Lisp to convert those assertions into ELIZA script format. As I put it, I was, in a simplistic yet fundamental sense, using ELIZA like ChatGPT: pulling data to drive a conversational system, much as ChatGPT pulls data from the web to set its parameters.

The resulting conversation shows the original ELIZA conducting an educational dialogue about *Animal Farm*, with the memory mechanism triggering appropriately and leading prompts encouraging engagement. The code and transcripts are on the elizagen and Anthony Hay ELIZA repositories.
