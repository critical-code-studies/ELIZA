---
title: 'ELLIZA: The Original Chatbot Applied Like a Modern LLM'
date: 9 September 2024
author: Jeff Shrager
---

![ELIZA SPACKS script output (Taylor 1968).](images/6-elliza-1.jpg)
*ELIZA SPACKS script output (Taylor 1968).*

A few days ago Mark Marino and Sarah Ciston asked the rest of Team ELIZA whether we knew where the script was that created this conversation, and if we didn't have it, what could it have looked like:

![ELIZA SPACKS dialog](images/6-elliza-2.jpg)

This comes from the paper "Automated Tutoring and Its Discontents" by Edwin F. Taylor (Taylor, 1968). The work discussed in that paper applied ELIZA to tutoring instead of conversation. The version of ELIZA used in this tutoring work has a lot of additional functionality not found in the original ELIZA as described in Weizenbaum's 1966 CACM paper. Whereas the original ELIZA simply reacted to user input without any capacity for logic-driven decision-making, the extended ELIZA (described in Hayward, 1968) allowed scripts to function essentially like programs, including conditionals, arithmetic computations, and branching. The sort of Socratic-style dialog demonstrated in the SPACKS dialog would be difficult to replicate in the original ELIZA because it includes conditional responses and dialog sequencing.

In response to Mark and Sarah's query I initially wrote a simple Lisp program that replicated exactly the SPACKS dialog, and with which you could hold various slightly alternate discussions. It had a tiny bit of trivial pattern-matching and conditional response capability. This was quite easy, requiring just three short Lisp functions and a script that wasn't much longer than the conversation itself.

But this wasn't really what Mark and Sarah were asking for; They wanted the original script from Hayward's extended ELIZA that would re-create the SPACKS dialog. It's possible that we could have figured this out, more-or-less, based on the extensive documentation available for Hayward's extended ELIZA, but it would be a lot of work, and we don't have a clone of Hayward's ELIZA to test it on. But we do have an excellent clone of the original ELIZA, due to Anthony Hay ([https://github.com/anthay/ELIZA](https://github.com/anthay/ELIZA)). This got me thinking about how one might use the original ELIZA to carry out something like a socratic dialog; Could we use the original ELIZA's capabilities of simple pattern matching and context-free conversational (non)continuity to teach, even if not quite socratically?

The core idea I hit upon to accomplish this was to create an ELIZA script keyed off all the content words in the subject matter -- in this case, the SPACKS poem -- and including "leading prompts", at the end of the responses, that would drive the conversation forward. For example, where the script might say something like: "BELSEN IS IN NORTHWEST GERMANY", I might add "DOES THIS MAKE YOU WONDER ANYTHING?", or some-such phrase that would lead the user to continue the conversation, sort of like Weizenbaum's DOCTOR script asking things like "WHAT WOULD IT MEAN TO YOU IF YOU GOT A PONY?" in response to the user saying "I WANT A PONY."

Since I don't know anything at all about the SPACKS poem, I thought to do it around my favorite poem, The Raven. Initially I thought that I would just find some facts about The Raven online, or make them up myself from the poem's text, or that, given those, I could get ChatGPT to create the script from those by carefully specifying what I wanted the script to look like. As I was exploring around for commentary on The Raven I came across a site that sells student essays. They didn't have any about The Raven, but they had hundreds about Animal Farm, so I decided to go with political allegory instead of gothic poetry.

Now, I have a strongly-held belief that computer programmers are special in two fundamental ways: First, they have a very high tolerance for frustration; Debugging complex programs can involve failing over and over and over again, sometimes for days! Secondly, computer programmers are fundamentally lazy; Why should we waste our precious time doing menial tasks when we can web-surf while a computer does the menial tasks for us!?

Applying the second principle to the task of creating an educational ELIZA script for Animal Farm, I started by copy-pasting the first pages of these essays into a document. (I could only get the first pages for free, but there was enough meat there to provide plenty of assertions about Animal Farm and its interpretation, at least for this experiment.) I got the first pages from about 10 of them -- maybe a few hundred lines -- initially, with the idea that I would get ChatGPT to read these and pull non-redundant assertions from them, which I would then take to the next step of turning that into an ELIZA script.

At around this moment it suddenly occurred to me that I was, in a simplistic yet fundamental sense, using ELIZA like ChatGPT! That is, I was pulling data from the web about Animal Farm to LEARN a script that would drive the ELIZA conversational platform, just as ChatGPT pulls data from the web about everything to create a set of parameters that drives the ChatGPT conversational platform!

I actually went quite a ways down the path of pulling papers and getting ChatGPT to extract assertions from them, before realizing that I didn't need to pull the papers at all, because -- big Duh! -- ChatGPT had already read everything there is to read about Animal Farm, so all I had to do was to ask it to create the assertions from its already-scrapped knowledge base! Then I would "simply" get ChatGPT to format these into the desired ELIZA script. Easy Peasy!

ChatGPT indeed easily created a bunch of assertions about Animal Farm, but getting it to "simply" format them as an ELIZA script turned out to be more complex than I had expected. After an hour of failed "prompt engineering" (see the first principle of software engineers: high frustration threshold ... but we're also good at telling when to fold 'em!) I decided that it would be easiest to just download the assertions and write a simple Lisp program to massage them into the ELIZA script I wanted.

Conveniently, ELIZA scripts are formatted EXACTLY like s-expressions -- the lingua franca of Lisp, so it was very simple to write lisp code to wrangle the assertions created by ChatGPT into an ELIZA script that could carry on a bit of an educational conversation about Animal Farm.

Below I go into the details, but in accord with the "dessert first" principle, here's a transcript of the resulting chatbot. This is Anthony Hay's near-exact clone of Weizenbaum's 1966 ELIZA running a script automatically created by my Lisp code, using as input ChatGPT's assertions about Animal Farm. The I/O here is unedited -- exactly as it appeared, but I've added some lines of commentary, beginning with ";;;".

The Lisp code that creates the scripts, and the transcript reproduced below are available here:

[https://github.com/jeffshrager/elizagen.org/tree/master/elliza](https://github.com/jeffshrager/elizagen.org/tree/master/elliza)

along with the script that created that conversation using Anthony Hay's ELIZA clone, which can be found here:

[https://github.com/anthay/ELIZA](https://github.com/anthay/ELIZA)

```
Hi! Let's talk about animal farm! What do you want to know?

What did the pigs do?

AFTER THEY TAKE OVER THE FARM THE PIGS ACCUMULATE MORE POWER AND BEGIN TO GET RID OF THEIR ENEMIES WHAT OTHER QUESTIONS DOES THAT BRING TO MIND?

;;; Notice that right away we hit one of the responses where
;;; a leading prompt is appended to the assertion:
;;; WHAT OTHER QUESTIONS DOES THAT BRING TO MIND?

Is the story all about power?

ORWELL WROTE ANIMAL FARM AS A WARNING TO READERS WITH THE CENTRAL THEME THAT POWER CORRUPTS AND ABSOLUTE POWER CORRUPTS ABSOLUTELY

I think that the pigs are evil.

THAT THE PIGS ARE EVIL IS INTERESTING. CAN I ANSWER ANY QUESTIONS ABOUT IT?

;;; In the above sentence, the "THINK" keyword triggers
;;; ELIZA's memory saving mechanism, so we should see this
;;; come back at some point. Also, notice that whereas almost
;;; all other keywords result in an assertion as an answer,
;;; THINK actually does classical ELIZA-like reformulation of
;;; part of the user's input.

Do the pigs kill anyone?

IN ANIMAL FARM THE PIGS CONVINCE THE ANIMALS TO RISE UP AND OVERTAKE MR JONES AND HUMANKIND IN GENERAL

I think that they kill another animal.

I HAD NOT THOUGHT THAT THEY KILL ANOTHER ANIMAL . MAYBE YOU HAVE QUESTIONS ABOUT IT.

;;; Again, "THINK" above triggers memory saving, and the
;;; response includes part of the input sentence.

Don't they kill a horse?

THE CHARACTER OF BOXER THE HORSE WAS INSPIRED BY ORWELL’S OBSERVATIONS OF THE BRITISH WORKING CLASS

Does the horse die?

THE CHARACTER OF BOXER THE HORSE WAS INSPIRED BY ORWELL’S OBSERVATIONS OF THE BRITISH WORKING CLASS

Don't they send it to the glue factory?

NAPOLEON SENDS BOXER TO THE GLUE FACTORY DESPITE THE ANIMALS BEING TOLD BY SQUEALER THAT BOXER DIED IN THE HOSPITAL

Napoleon is the bad one!

THE SHEEP ARE TAUGHT TO CHANT FOUR LEGS GOOD TWO LEGS BAD

;;; This is an unfortunate mis-cue to the word "BAD".

I mean that I think Napoleon is evil.

GO ON , PLEASE

;; Anthony Hay points out that Had I said "I mean that I think
;; that Napoleon is evil" it would have matched the (0 THINK
;; THAT 0) pattern and the response would have been:
;; "IF IT IS TRUE THAT NAPOLEON IS EVIL THAT MIGHT BRING UP
;; OTHER QUESTIONS YOU CAN ASK" instead of "GO ON , PLEASE".
;; (Alternatively, I could add a (0 THINK 0) rule to the THINK
;; keyword after the (0 THINK THAT 0) rule. I didn't do that
;; because there are many uses of "THINK" that don't work the
;; same way as "THINK THAT" and I was afraid of mis-cues.

What are some other ideas?

IN THE SOVIET UNION BELIEF IN RELIGION WAS FORBIDDEN BECAUSE IT DISOBEYED KARL MARX’S IDEAS

;;; Again, here is cued on "IDEAS", which should probably be
;;; a stop word.

Is the church a central idea?

MOSES REPRESENTS RELIGION SPECIFICALLY THE RUSSIAN ORTHODOX CHURCH

Who is Moses?

MOSES REPRESENTS RELIGION SPECIFICALLY THE RUSSIAN ORTHODOX CHURCH DO YOU HAVE ANY INTERESTING THOUGHTS ABOUT THAT?

I think that Moses is a central character.

IF IT IS TRUE THAT MOSES IS A CENTRAL CHARACTER THAT MIGHT BRING UP OTHER QUESTIONS YOU CAN ASK.

;;; Above another memory store trigged on THINK.
;;; In the below I'm going to try to trigger memory recall:

Hmmm

BEFORE YOU SAID YOU THOUGHT THAT THE PIGS ARE EVIL . I HAD NOT THOUGHT ABOUT THAT. ARE THERE QUESTIONS YOU HAVE ABOUT IT?

;;; That was a memory recall, and a nearly perfect
;;; conversational contribution!

Yes I think that the pigs take over.

THAT THE PIGS TAKE OVER IS INTERESTING. CAN I ANSWER ANY QUESTIONS ABOUT IT?

How do the pigs take over?

THE PIGS WERE WALKING AROUND ON THEIR HIND LEGS AND ENGAGING IN BUSINESS WITH HUMANS WHAT OTHER QUESTIONS DOES THAT BRING TO MIND?

Do any other animals engage with humans?

THE SHEEP’S CHANTING IS USED TO DROWN OUT ANY DISSENT DURING MEETINGS WHAT DO YOU THINK ABOUT THAT?

I think it is a symbol for using power to control the masses.

I SEE

;;; Again, I'm going to try to get memory to respond, like
;;; I did above. This time I have somewhat less luck:

And?

ASK ME SOMETHING ELSE ABOUT ANIMAL FARM.

Like what?

ANYTHING ELSE YOU WANT TO KNOW ABOUT ANIMAL FARM?

;;; Even though I'm trying like mad to get a memory-based
;;; response, ELIZA is just regurgitating NONE responses.

hmm

WHAT ELSE WOULD YOU LIKE TO KNOW ABOUT ANIMAL FARM?

I think I'm out of things to ask.

I SEE

Do you have anything to share?

DO YOU FEEL STRONGLY ABOUT DISCUSSING ANIMAL FARM?

I have to do it for a class.

COMMON ANIMALS ARE A NAIVE WORKING CLASS WHO ARE UNABLE OR UNWILLING TO QUESTION AUTHORITY CONDEMNING THEMSELVES TO SUFFER THE FULL EXTENT OF THE RULING CLASS’S OPPRESSION WHAT DO YOU THINK ABOUT THAT?

;;; The word "class" cue's a tangential response, so I go
;;; back to the discussion.

I think that the idea of the working class is a core concept.

I HAD NOT THOUGHT THAT THE IDEA OF THE WORKING CLASS IS A CORE CONCEPT . MAYBE YOU HAVE QUESTIONS ABOUT IT.

;;; Another "THINK" memory save reformulated response. We're
;;; certainly loading up memory here. I hope we can get some
;;; of it back eventually!

Who represents the working class?

MOSES REPRESENTS RELIGION SPECIFICALLY THE RUSSIAN ORTHODOX CHURCH DO YOU HAVE ANY INTERESTING THOUGHTS ABOUT THAT?

;;; In what follows I go back to trying to hit memory:

Aha!

ASK ME SOMETHING ELSE ABOUT ANIMAL FARM.

Okay.

ANYTHING ELSE YOU WANT TO KNOW ABOUT ANIMAL FARM?

Nope.

WHAT ELSE WOULD YOU LIKE TO KNOW ABOUT ANIMAL FARM?

Nothing.

BEFORE YOU SAID YOU THOUGHT THAT THEY KILL ANOTHER ANIMAL . IF THAT IS TRUE IT MIGHT BRING UP OTHER QUESTIONS YOU CAN ASK.

;;; Ahhhhhh. There we go!
```

Blog Post by Jeff Shrager

#### Acknowledgements

Anthony Hay helped out with some details of the ELIZA script that I wasn't entirely conversant with. Also, thanks for his terrific ELIZA clone that I used to test it on. He also provided detailed comments on drafts of this post.

#### Bibliography

Taylor, EF 1968. Automated Tutoring and Its Discontents. American Journal of Physics 36, 496. doi: 10.1119/1.1974953 [https://drive.google.com/file/d/1bVp1_EDLPSwvTo3jkPnDLNDsSxtWMitu](https://drive.google.com/file/d/1bVp1_EDLPSwvTo3jkPnDLNDsSxtWMitu)

Hayward, P 1968 ELIZA SCRIPTWRITER'S MANUAL A Manual for the Use of the ELIZA Conversational Computer System. Education Research Center Massachusetts Institute of Technology Cambridge, Massachusetts. [https://archive.computerhistory.org/resources/access/text/2022/04/102683842-05-01-acc.pdf](https://archive.computerhistory.org/resources/access/text/2022/04/102683842-05-01-acc.pdf)

The Lisp code that creates the scripts, and the transcript reproduced below are available here:

[https://github.com/jeffshrager/elizagen.org/tree/master/elliza](https://github.com/jeffshrager/elizagen.org/tree/master/elliza)

along with the script that created that conversation using Anthony Hay's ELIZA clone, which can be found here:

[https://github.com/anthay/ELIZA](https://github.com/anthay/ELIZA)
