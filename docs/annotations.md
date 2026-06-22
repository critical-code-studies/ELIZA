# Annotations for ELIZA

Generated: 2026-01-25T12:09:00.140Z

## ELIZA-1965b.mad

**Line 1** [observation] (DMB)
> This ELIZA version possessed a sophisticated capability that set it apart from later implementations: the CHANGE function. This interactive editor provided users with metalevel control over ELIZA’s operation, most notably the ability to modify ELIZA’s script during runtime. The function’s most significant feature was its capability to edit the internal representation of scripts like DOCTOR while the program was running. This functionality was briefly mentioned in Weizenbaum’s original CACM paper, but the details of its implementation and operation were never fully documented. The CHANGE function represented an advanced feature for its time, allowing users to interact with and modify ELIZA’s behavior at a fundamental level. This capability was particularly noteworthy given the technical constraints of 1960s computing systems. Intriguingly, this interactive editing feature appears to have been lost in the evolutionary chain of subsequent ELIZA implementations. The presence of the CHANGE function suggests that Weizenbaum envisioned ELIZA not just as a static program but also as an interactive system that could be modified and adapted by its users—a remarkably forward-thinking concept for its era. This aspect of ELIZA’s design presages modern ideas about customizable AI systems and interactive program- ming environments.

**Line 1** [context] (DMB)
> “An important consequence of the editing facility built into ELIZA is that a given ELIZA script need not start out to be a large, full-blown scenario. On the contrary, it should begin as a quite modest set of keywords and transfor- mation rules and permitted to be grown and molded as experience with it builds up. This appears to be the best. way to use a truly, interactive man-machine facility—i.e., not as a device for rapidly debugging a code representing a fully thought out solution to a problem, but rather as an aid for the exploration of problem solving strategies”; Weizenbaum, “ELIZA,” 42.SC

**Line 2** [pattern] (DMB)
> The last eight columns were reserved for sequence numbers. These numbers may have been renumbered by a card puncher. As in BASIC, using jumps of 10 made room for code to be inserted after the fact.MM

**Line 3** [observation] (DMB)
> Specifies the normal mode for all variables is an integer.AS Without this statement, variables are assumed to be floating point.AH

**Line 4** [observation] (DMB)
> A single function may have multiple entry points. The caller views each entry point as a separate function. Internally, all entry points within a single function are scoped within the function, with each entry point start- ing as a label named in the declaration.JS

**Line 4** [observation] (DMB)
> Function names must end with a period so that they are recognized by the compiler.DMB

**Line 5** [observation] (DMB)
> Create a list called INPUT.

**Line 6** [observation] (DMB)
> G = array of strings; it has 7 strings in this array (over line 6 and 7). Each string has a maximum of six characters as that is the word size note: $ … $ is a quotation string.

**Line 6** [observation] (DMB)
> V’S means VECTOR VALUES (which defines an array).PW

**Line 7** [critique] (DMB)
> The command strings in array G (“TYPE,” “SUBST,” “APPEND,” “ADD,” “START,” “RANK,” “DISPLA”) create what critical code studies might term a vocabulary of power—a restricted command set that shapes possible interactions for the CHANGE function. The imperative grammatical mood of these commands can be seen to reveal assumptions about human-computer power dynamics.DMB

**Line 7** [observation] (DMB)
> 1$START The 1 indicates that this is a continuation of the previous line.AH

**Line 8** [observation] (DMB)
> A format statement for input or output. When used, output (PRINT) or input (READ), a 3-decimal digit number is output or input. It’s confusing because the same name, containing the same values, are used in several functions for the same purpose. What’s even more confusing is that the declaration (V’S) can appear either before or after its use. See for example, lines 26, 212, and 386 for use, and 410 (the ELIZA function) for another definition.AS

**Line 9** [observation] (DMB)
> Flag returned when iterating over a list. In CHANGE it is never used except as an output parameter for SEQLR. SEQLR demands two arguments, so that even though it is never used, it must be defined. When used, it acts as a boolean. Initializing it to zero (0) initializes its value to false. It is possible that the name FIT is a shorthand for “Flag ITerator.”AS

**Line 10** [observation] (DMB)
> The CHANGE routine allows you to change the script (as in the DOCTOR script) while you are interacting with it. It is not mentioned in the CACM paper. What’s remarkable about this code is that it allows the interactor to develop a script while interfacing with it. According to the CACM paper, the interactor could change the script while interacting with the system and then resume the conversation.MM, AH

**Line 10** [observation] (DMB)
> The imagination to use a piece of code to introduce an editor into the active script is a novelty, an innovation in that time, probably a sign of the environment (MIT) in which he was working. Absolutely remarkable.AS

**Line 10** [context] (DMB)
> This rather clumsy method of editing the scripts appears to be abandoned in later ELIZA versions, which switch to calling the 17– 21 ED editing software by typing the keyword EDIT. This is described in the CACM paper. ED has a very interesting history in itself.DMB

**Line 10** [observation] (DMB)
> ED probably allows direct script change rather than using punched cards as the input medium (see line 13).AS

**Line 11** [question] (DMB)
> Don’t miss the MTLIST (empty list) pun built into SLIP, to empty the list.MM

**Line 11** [observation] (DMB)
> Create a list using input from a punched card deck. The format of the list is (JOB, KEYWORD …).AS

**Line 12** [observation] (DMB)
> The input format for the punched cards is (JOB, KEYWORD …), where JOB is one of the VECTOR VALUES in G and KEYWORD, is one of the keywords in the hash table, KEY. Note that the KEYWORD is not required for START and DISPLA and that the ellipses refers to a legal S-expression for an ELIZA script.AH

**Line 17** [observation] (DMB)
> THEMA is a label. The code on line 14 jumps to this label when the user’s input has successfully matched one of the command names in the list on lines 6 and 7. Program execution then continues from this label onwards. This line says, whenever J equals 5, exit this CHANGE function, returning the value returned by the function IRALST when given the parameter INPUT. J will have the value 5 here when the user entered the command “START,” presumably meaning start running ELIZA again. The value returned from IRALST is the count of the number of times the INPUT list is a sublist of other lists. A value of zero means it is a sublist of no other lists and has been deleted. This value is of no interest to the code where CHANGE was called and is ignored by that code. Weizenbaum wishes to both clear INPUT and exit the CHANGE function, but only one statement may follow the comma in a WHENEVER conditional. Returning the value of the IRALST function call via FUNCTION RETURN combines these two actions into one statement.AH

**Line 19** [observation] (DMB)
> Lines 19–36 execute the DISPLA JOB function. All KEY WORDS are output, using the KEY hash table, followed by the four memory transformation rules.AS

**Line 19** [critique] (DMB)
> The iteration over 33 positions in this key data structure might also reflect the binary thinking prevalent during the Cold War era—the power of two structures that echo the binary oppositions (East/West, communist/ capitalist) dominating 1960s geopolitics and the cultural context of the time.DMB

**Line 22** [observation] (DMB)
> The mechanics of output keywords is to create a sequence reader for the keyword stored at the current keyword slot in the hash table (line 21), and continue to output a keyword (line 25) for each conflict stored in table (line 23). Note that it is the keyword script that is output, not just the keyword.AS

**Line 29** [context] (DMB)
> In a sense DISPLA gives us the Freudian’s dream, a chance to look at the DOCTOR’s notebook. However, it outputs not DOCTOR’s memories of sessions, but whatever the script has prewritten in order to converse with the patient. So we’re seeing the DOCTOR’s cheat sheet.MM, SC

**Line 29** [observation] (DMB)
> DISPLA prints the four memory templates used to create the saved memories, e.g., if running the DOCTOR script, for example, “DOES THAT HAVE ANYTHING TO DO WITH THE FACT THAT YOUR 3.” The saved memories are in MYLIST in the ELIZA function and are not available to CHANGE.AH

**Line 36** [context] (DMB)
> There were no “screens” at this time. At the IFIP 1960 conference, Ivan Sutherland introduced a graphics monitor and hardware. The purpose was to draw (display) figures. It was not designed to support the type of monitor functionality we have today.AS

**Line 36** [observation] (DMB)
> The stored script keywords are output in the order that they were stored in the key word hash table (KEY). I.e., if for example the first slot, call it KEY(5), contains “PERHAPS” and “MAYBE,” then they would be output in the order shown. This continues until all 32 keyword slots (see line 19) have been processing.AS

**Line 36** [question] (DMB)
> This language seems so difficult to read. Was it difficult at the time?MM

**Line 36** [context] (DMB)
> It is hard to appreciate the distinct development environment of the 1960s. From its medium specificity, using teletypewriters and paper and punch cards, to a lack of dynamic screen-based editing and even common software editing tools.DMB

