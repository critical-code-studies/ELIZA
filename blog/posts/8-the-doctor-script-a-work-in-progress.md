---
title: 'The DOCTOR script: a work in progress'
date: 9 December 2024
author: Anthony Hay
---

![Joseph Weizenbaum (1923-2008)](images/8-doctor-1.jpg)
*Joseph Weizenbaum (1923-2008)*

There are three known contemporaneous scripts compatible with the version of ELIZA described in Joseph Weizenbaum’s 1966 Communications of the ACM paper: one was published as an appendix to that paper, and the other two appear in a computer printout in Weizenbaum’s archive at MIT. Here we take a quick look at these three scripts to see how they compare: they are similar and the ones from the archive appear to show the published DOCTOR script at an earlier stage of development.

The printout of the ELIZA source code is in a folder dated 1965 ([https://hdl.handle.net/1721.3/201699](https://hdl.handle.net/1721.3/201699)). Sandwiching the code are two ELIZA scripts. Here is the beginning of the first:

![The beginning of the first script](images/8-doctor-3.jpg)


Weizenbaum developed ELIZA on an IBM 7094 under an operating system called Compatible Time-Sharing System, or CTSS. The first line of the above printout shows the PRINT heading:

![PRINT heading](images/8-doctor-4.jpg)

The first script is named .TAPE. 102. The PRINT headings that appear later in the printout show that the file containing the ELIZA code is named SPEAK MAD, and the last script is named .TAPE. 100.

CTSS simulated physical tape units as files. These pseudo-tape unit files were named .TAPE. n, where n is an integer greater than zero. From the ELIZA code in this printout we can see that when it starts it asks

```
WHICH SCRIPT DO YOU WISH TO PLAY
```

The user must respond to this by entering a number. ELIZA will then read the script from the file named .TAPE. + the number specified.

Turning to the contents of the scripts: .TAPE. 102 and .TAPE. 100 are very similar. There is a minor error in .TAPE. 102, which is described below. Here are lists of all the keywords specified in the three scripts, ordered by the precedence they are assigned in the script and then alphabetically:

![Keyword lists for the three scripts](images/8-doctor-5.jpg)

All the keywords in .TAPE. 102 are present in the .TAPE. 100 and CACM scripts. Except for the MY and WAS keywords, they are given the same precedence in all three scripts. The special keywords MEMORY and NONE are the same in all three scripts.

The differences between .TAPE. 102 and .TAPE. 100 are shown below. As there seems to be a clear progression from .TAPE. 102 to .TAPE. 100 I’m making the assumption that the latter was derived from the former. The listing appears to be an offline printout from a line printer, not something produced locally on Weizenbaum’s terminal, so it’s puzzling that these two scripts appear on the same printout; why print out .TAPE. 102 when you have already found and fixed a bug in it and developed it further? The pencil mark on the left suggests that someone looked closely at it.

Two new keywords, HOW and WHEN, appear in .TAPE. 100

```
(HOW
    (=WHAT))

(WHEN
    (=WHAT))
```

In .TAPE. 102, the list (DON'T YOU KNOW) has been placed at the top level where a keyword rule is expected. This is the minor error mentioned above and makes .TAPE. 102 an ill-formed script:

```
(PERHAPS
    ((0)
        (YOU DON'T SEEM QUITE CERTAIN)
        (WHY THE UNCERTAIN TONE)
        (CAN'T YOU BE MORE POSITIVE)
        (YOU AREN'T SURE)))

(MAYBE
    (=PERHAPS))

(DON'T YOU KNOW)
```

This is corrected in .TAPE. 100, where the list is moved into the PERHAPS keyword rule:

```
(PERHAPS
    ((0)
        (YOU DON'T SEEM QUITE CERTAIN)
        (WHY THE UNCERTAIN TONE)
        (CAN'T YOU BE MORE POSITIVE)
        (YOU AREN'T SURE)
        (DON'T YOU KNOW)))

(MAYBE
    (=PERHAPS))
```

Weizenbaum was probably editing the script with a line-based text editor on a teletype, where you have to issue commands to position a “pointer” where you wish to insert text. But the pointer is not visible to you and it’s easy to assume it’s in the right place when it is not.

Another possible cause of this error is that at some point the script was punched onto a deck of cards, and then some cards were incorrectly inserted or removed. You may have noticed that in the listing image above, (CAN'T YOU BE MORE POSITIVE) is line 150 and the next line is (YOU AREN'T SURE))), which is numbered 180—a jump of 30 compared to the usual 10. Something happened here. Also, the incorrectly placed (DON'T YOU KNOW) is line 200 in .TAPE. 102, and line 200 is missing from .TAPE. 100.

In .TAPE. 102 the WHAT keyword has one transformation rule with three reassembly rules:

```
(WHAT
    ((0)
        (WHY DO YOU ASK)
        (DOES THAT QUESTION INTEREST YOU)
        (WHAT IS IT YOU REALLY WANT TO KNOW)))
```

In .TAPE. 100 that transformation rule has been given an additional six reassembly rules:

```
(WHAT
    ((0)
        (WHY DO YOU ASK)
        (DOES THAT QUESTION INTEREST YOU)
        (WHAT IS IT YOU REALLY WANT TO KNOW)
        (ARE SUCH QUESTIONS MUCH ON YOUR MIND)
        (WHAT ANSWER WOULD PLEASE YOU MOST)
        (WHAT DO YOU THINK)
        (WHAT COMES TO YOUR MIND WHEN YOU ASK THAT)
        (HAVE YOU ASKED SUCH QUESTIONS BEFORE)
        (HAVE YOU ASKED ANYONE ELSE)))
```

Finally, Weizenbaum simplifies the WHY keyword rule in .TAPE. 102 by replacing the last transformation rule with (=WHAT)

```
(WHY
    ((0 WHY DON'T I 0)
        (DO YOU BELIEVE I DON'T 5)
        (PERHAPS I WILL 5 IN GOOD TIME)
        (SHOULD YOU 5 YOURSELF)
        (YOU WANT ME TO 5))
    ((0 WHY CAN'T YOU 0)
        (DO YOU THINK YOU SHOULD BE ABLE TO 5)
        (DO YOU WANT TO BE ABLE TO 5)
        (DO YOU BELIEVE THIS WILL HELP YOU TO 5)
        (HAVE YOU ANY IDEA WHY YOU CAN'T 5))
    ((0 WHY 0)
        (WHY DO YOU THINK 3)
        (IS IT TRUE THAT 3)
        (DOES THAT QUESTION INTEREST YOU)
        (DO YOU WORRY MUCH ABOUT WHY 3)))
```

becomes

```
(WHY
    ((0 WHY DON'T I 0)
        (DO YOU BELIEVE I DON'T 5)
        (PERHAPS I WILL 5 IN GOOD TIME)
        (SHOULD YOU 5 YOURSELF)
        (YOU WANT ME TO 5))
    ((0 WHY CAN'T YOU 0)
        (DO YOU THINK YOU SHOULD BE ABLE TO 5)
        (DO YOU WANT TO BE ABLE TO 5)
        (DO YOU BELIEVE THIS WILL HELP YOU TO 5)
        (HAVE YOU ANY IDEA WHY YOU CAN'T 5))
    (=WHAT))
```

I won’t go into the same level of detail about the differences between .TAPE. 100 and CACM DOCTOR. The HOW, WHEN, PERHAPS and WHAT keyword rules are unchanged between those two. WHY is changed slightly to

```
(WHY
    ((0 WHY DON'T I 0)
        (DO YOU BELIEVE I DON'T 5)
        (PERHAPS I WILL 5 IN GOOD TIME)
        (SHOULD YOU 5 YOURSELF)
        (YOU WANT ME TO 5)
        (=WHAT))
    ((0 WHY CAN'T YOU 0)
        (DO YOU THINK YOU SHOULD BE ABLE TO 5)
        (DO YOU WANT TO BE ABLE TO 5)
        (DO YOU BELIEVE THIS WILL HELP YOU TO 5)
        (HAVE YOU ANY IDEA WHY YOU CAN'T 5)
        (=WHAT))
    (=WHAT))
```

Although the March 1965 ELIZA code in this printout supports (=keyword) at the transformation rule level, it does not support it at the reassembly rule level. (The WHY rule shown above is using (=WHAT) at both levels.) This missing functionality is used in ten of the CACM DOCTOR keyword rules: AM, ARE, CAN, DREAMT, I, LIKE, REMEMBER, WAS, WHY and YOU.

There is other functionality that Weizenbaum had not yet added to ELIZA in March 1965. By the time his paper was submitted to the CACM in September 1965 (it was published in January 1966) he had added the NEWKEY and PRE functions. Five keyword rules in CACM DOCTOR use NEWKEY (DREAM, DREAMT, LIKE, REMEMBER and WAS) and two use PRE (I’M and YOU’RE).

Of the other keywords in .TAPE. 100, most appear unchanged in CACM DOCTOR, and appear there in the same order relative to each other. Some of the keyword rules are significantly altered, such as WAS and I.

![Screenshot of ELIZA being used in 1967 from The Twenty-First Century, "The Communications Revolution", first broadcast, 1/29/67.](images/8-doctor-2.jpg)
*Screenshot of ELIZA being used in 1967 from The Twenty-First Century, "The Communications Revolution", first broadcast, 1/29/67, [https://youtu.be/j8fDkSqnghg](https://youtu.be/j8fDkSqnghg)*

This printout gives us a glimpse into the development of the ELIZA code and DOCTOR script. It suggests a process of incremental improvement of ELIZA/DOCTOR’s ability to conceal its lack of understanding; almost as if it was built without a plan.

Blogpost by Anthony Hay.

Thank you Rupert Lane, Tom Van Vleck and Jerry Saltzer for helping me understand a little about CTSS. Transcripts of these three scripts may be found here: [https://github.com/anthay/ELIZA/tree/master/scripts](https://github.com/anthay/ELIZA/tree/master/scripts).
