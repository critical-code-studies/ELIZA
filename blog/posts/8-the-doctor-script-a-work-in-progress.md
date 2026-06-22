---
title: The DOCTOR script: a work in progress
date: 9 December 2024
author: Anthony Hay
---

There are three known contemporaneous scripts compatible with the version of ELIZA described in Weizenbaum’s 1966 Communications of the ACM paper: one was published as an appendix to that paper, and the other two appear in a computer printout in Weizenbaum’s archive at MIT. Here we take a quick look at these three scripts to see how they compare: they are similar, and the ones from the archive appear to show the published DOCTOR script at an earlier stage of development.

The printout of the ELIZA source code is in a folder dated 1965. Sandwiching the code are two ELIZA scripts. Weizenbaum developed ELIZA on an IBM 7094 under the Compatible Time-Sharing System, or CTSS. The first script is named .TAPE. 102; the file containing the ELIZA code is named SPEAK MAD; and the last script is named .TAPE. 100. CTSS simulated physical tape units as files named .TAPE. n. When ELIZA starts it asks “WHICH SCRIPT DO YOU WISH TO PLAY” and reads the script from the file named .TAPE. plus the number you give.

.TAPE. 102 and .TAPE. 100 are very similar; there is a minor error in .TAPE. 102. All the keywords in .TAPE. 102 are present in .TAPE. 100 and the CACM script, and (except for MY and WAS) at the same precedence. The special keywords MEMORY and NONE are the same in all three.

Two new keywords, HOW and WHEN, appear in .TAPE. 100, both redirecting to WHAT. In .TAPE. 102 the list (DON'T YOU KNOW) was placed at the top level where a keyword rule is expected, which makes the script ill-formed; this is corrected in .TAPE. 100, where the line is moved inside the PERHAPS rule:

```
(PERHAPS
    ((0)
        (YOU DON'T SEEM QUITE CERTAIN)
        (WHY THE UNCERTAIN TONE)
        (CAN'T YOU BE MORE POSITIVE)
        (YOU AREN'T SURE)
        (DON'T YOU KNOW)))
```

Weizenbaum was probably editing with a line-based text editor on a teletype, positioning an invisible pointer; it is easy to assume the pointer is in the right place when it is not. Another possibility is that the script was punched onto cards and some were inserted or removed incorrectly. The line numbers support this: a jump of 30 rather than the usual 10 appears around the error.

In .TAPE. 102 the WHAT keyword has one transformation rule with three reassembly rules; in .TAPE. 100 it gains six more. The WHY rule is simplified in .TAPE. 102 by replacing its last transformation rule with a redirect to WHAT.

The differences between .TAPE. 100 and the CACM DOCTOR are smaller: HOW, WHEN, PERHAPS and WHAT are unchanged; WHY changes slightly. The March 1965 code supports (=keyword) at the transformation-rule level but not yet at the reassembly-rule level, functionality used in ten of the CACM keyword rules (AM, ARE, CAN, DREAMT, I, LIKE, REMEMBER, WAS, WHY and YOU). By the time the paper was submitted in September 1965 Weizenbaum had also added the NEWKEY and PRE functions; five CACM rules use NEWKEY and two use PRE.

This printout gives us a glimpse into the development of the ELIZA code and DOCTOR script. It suggests a process of incremental improvement of ELIZA/DOCTOR’s ability to conceal its lack of understanding; almost as if it was built without a plan.

*With thanks to Rupert Lane, Tom Van Vleck and Jerry Saltzer for help understanding CTSS. Transcripts of the three scripts are at [github.com/anthay/ELIZA](https://github.com/anthay/ELIZA/tree/master/scripts).*
