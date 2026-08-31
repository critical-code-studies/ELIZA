---
title: ELIZA Version Variation
date: 22 July 2024
author: David M. Berry
---

![Table of ELIZA version variation (Berry 2024 [updated]).](images/5-eliza-version-variation-1.jpg)
*Table of ELIZA version variation (Berry 2024 [updated]).*

We now believe that there were multiple versions of ELIZA and part of this project is mapping the version variation of the source code. As we seek to understand the ELIZA code, we have been able to ascertain that there were actually at least five major versions of ELIZA and maybe many more (listed below by date), a number of which have been forgotten (and possibly lost) and a final planned version of which there are only textual references in other documentation. We don’t have the code for all of them necessarily, but they might still be in archives or private papers.

We are interested in how differences among ELIZA versions express historical contextual factors, cultural and political changes, and the impacts of imported and transformed ELIZAs on receiving cultures (e.g. we know of at least one French adaptation). We aim to look at how do ELIZA versions transport ideas in language, thought and behaviour? What do they reveal about the limits of translatability of languages and concepts? What do the express or covert genetic relations among versions reveal about transcultural transmission and software cultures of the time? What do ELIZA versions tell us about software's original technical and literary complexity? Which elements of ELIZA provoke most/least variation among versions and languages, e.g. persona parts, phrases, lines, rhetorical devices, metaphors, semantic features, lexis? Do versions for users, for the teaching, for different media (teletype/screen) differ in regular ways? Can understandings of ELIZA re-implementations be transferred to other versioning, transmedia adaptation, and even non-textual software artefacts? (see Berry and Marino 2024).

Weizenbaum described how he continued work on developing ELIZA as the "difficulty with the [original ELIZA] system currently [was] that it can do very little other than generate plausible responses”. Later versions, he wrote,

> differ from the old one in two main respects. First, it contains an evaluator capable of accepting expressions (programs) of unlimited complexity and evaluating (executing) them. It is, of course, also capable of storing the results of such evaluations for subsequent retrieval and use. Secondly, the idea of the script has been generalized so that now it is possible for the program to contain three different scripts simultaneously and to fetch new scripts from among an unlimited supply stored on a disk storage unit, intercommunication among coexisting scripts is also possible (Weizenbaum 1967: 478).

These later advances were, sadly, poorly documented and much of the original source code remains missing except for the 1965b source code listing of ELIZA and some of the scripts which we have recovered from the archives at MIT (see Berry et al 2023; Berry and Marino 2024).

Weizenbaum describes how “the most famous script is the one where ELIZA plays the psychiatrist, but there were others. I remember an undergraduate at that time who is now full professor at MIT — Steve Ward by name — who wrote a script that was a parody of the way President Nixon talked. That was not hard to do: Nixon has a very characteristic way of speaking, like "Let me say this about that" and so on” (Weizenbaum 1995: 254).[1]

The ELIZA versions we believe we have identified are shown in the table below.

![ELIZA versions table](images/5-eliza-version-variation-2.jpg)

Notes:

ELIZA 1965a: Delimits sentences with only “.” and “,” (evidence from MIT archive flowcharts);

ELIZA 1965b: Delimits sentences with “.” and “,” and “but”. Lacks the NEWKEY function. Includes undocumented CHANGE function, and hard-coded messages (the version recovered from the MIT archives);

ELIZA 1966 CACM: Includes the NEWKEY function, keyword stack and “but” delimiter. Interestingly the algorithm described in the CACM article does not mention the "but" delimiter but without it the examples Weizenbaum gives would not be correct, therefore we can surmise that the "but" delimiter was in the code, even if not in the CACM article so even though it is omitted from the article it is present in the dialogues.

ELIZA 1967: Adds sophisticated script handling using OPL. Evidence from not only descriptions in Weizenbaum (1967) and Taylor (1968) but also the extant ARITHM, F29, FIGURE scripts in the archive

ELIZA 1968+: A description of the planning of this version appears in Taylor (1968). However, the scripts SPACKS, INTRVW, and FVP1 also give evidence of its use in much more sophisticated programming through the text of the scripts developed by Walter E. Daniels.

We have also reconstructed evidence that seems to suggest that multiple versions of ELIZA also circulated and have been looking at other university archives to try to unearth them.

ELIZA version variation has an important bearing on ELIZA's identity as a research object. So when we talk about ELIZA in future, perhaps we should be more aware of the multiplicity of its identity as a software object. Especially as software versioning was underdeveloped in the 1960s. ELIZA was certainly a work in progress, less than a finished software object, and very much like a process of research activity with stop-offs along the way.

Also I do think that some of the historical specificity of the other levels which surround ELIZA point to its uniqueness in terms of the constellation of technology that was used to construct it. So, for example, it would be rare today to hard code extensions to an underlying computer programming language in assembly in order to extend its functionality to make ELIZA possible in the first place (after all that is what SLIP is doing).

So we are looking at both a technical object, a cultural object and a historical object and that these things might not always be the same thing. After all, ELIZA (as merged with DOCTOR) has become such a cultural object in its own right (which calls to be examined), that ELIZA's own history and technical specificity have become obscured (which also need to be uncovered and understood).

We aim to transform the public understanding of ELIZA, by exploring these questions in relation to the multiple ways in which ELIZA has become recognised as of global importance; to stimulate future research in ways which are accessible to non-academic communities; and to improve knowledge about this important historical software object.

Blog Post by David M. Berry

The work that resulted in this research finding could not have happened without the support and contribution of Team ELIZA, a research project looking into the history of the ELIZA source code. Thanks to Sarah Ciston, Anthony Hay, Mark C. Marino, Peter Millican, Jeff Shrager, Arthur Schwarz, and Peggy Weil.
See also Berry, D.M., Ciston, S., Hay, A., Marino, M.C., Millican, P., Shrager, J., Schwarz, A., Weil, P., Please Go On: Inventing ELIZA, Software Studies series. MIT Press, 2026.

#### Notes

[1] There are a number of additional scripts, in addition to DOCTOR, which support the idea that there is different functionality across the ELIZA versions. The scripts we have recovered from the MIT archives include: ARITHM (undertakes mathematical calculations within the conversation and is able to evaluate and return the result), F29 (appears to be an early version of the FIGURE mathematical definition script), FIGURE (appears to be F29 extended with many more definitions and responses), GIRL (which is a simple demonstration script), NEWENG (which discusses New England states). Scripts we have the output for, but not the script itself include: ELEVTR (discusses the physics of an elevator), POLETA (which discusses the "Pole and Barn Paradox"), SPACKS (discussion of a quoted line of poetry by Barry Spacks of the MIT humanities department), SYNCTA (the name of the script that discusses time synchronization). There are also references to scripts that we have neither the script nor its output: ANTIPR, INTRVW (described as an interview preliminary to the study of 4-vectors), FVP1, FVQUIZ, CANVEC, FRANCE, FORVEC, MIT, ORTH1, PHOTON, RLPOLN, STATES, QMPROB, WATSNU, XYPOLN. Earlier work on the reconstruction can be found at [https://wg.criticalcodestudies.com/index.php?p=/discussion/108/the-original-eliza-in-mad-slip-2022-code-critique](https://wg.criticalcodestudies.com/index.php?p=/discussion/108/the-original-eliza-in-mad-slip-2022-code-critique)

#### Bibliography

Berry, D.M., Hay, Anthony, Millican, P., Shrager, J., 2023. Finding ELIZA - Rediscovering Weizenbaum’s Source Code, Comments and Faksimiles, in: Baranovskaa, M., Höltgen, S. (Eds.), Hello, I’m Eliza. 50 Jahre Gespräche Mit Computern. Projektverlag, Bochum, pp. 247–248.

Berry, D.M., Marino, M.C., 2024. Reading ELIZA: Critical Code Studies in Action. Electronic Book Review.

Berry, D.M., Ciston, S., Hay, A., Marino, M.C., Millican, P., Shrager, J., Schwarz, A., Weil, P., Please Go On: Inventing ELIZA, Software Studies series. MIT Press, 2026.

Weizenbaum, J. (1966) ‘ELIZA - A Computer Program For the Study of Natural Language Communication Between Man And Machine’, Communications of the ACM, 9(1), pp. 36–45.

Weizenbaum, J. (1967) ‘Contextual understanding by computers’, Communications of the ACM, 10(8), pp. 474–480. Available at: [https://doi.org/10.1145/363534.363545](https://doi.org/10.1145/363534.363545)

Weizenbaum, J. (1976) Computer power and human reason: from judgment to calculation. San Francisco: Freeman.

Weizenbaum, J. (1995) ‘The Myth of the Last Metaphor’, in P. Baumgartner and S. Payr (eds) Speaking Minds – Interviews With Twenty Eminent Cognitive Scientists. Princeton, NJ: Princeton University Press, pp. 249–264.
