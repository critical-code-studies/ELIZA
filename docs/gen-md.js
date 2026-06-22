/* Writes the Markdown blog: blog/posts/<slug>.md (11 files), blog/posts.json
   (the manifest), and blog/CONTRIBUTING.md. Run: node gen-md.js
   Posts 1,2,4,7,8,9,10,11 are full text; 3,5,6 are faithful condensations. */
const fs = require('fs');
const path = require('path');
const OUT = path.join(process.env.HOME, 'Projects', 'eliza');
const PD = path.join(OUT, 'blog', 'posts');
fs.mkdirSync(PD, { recursive: true });
const noDash = s => s.replace(/—/g, ', ');

const posts = [
{ n:1, slug:'1-a-certain-counting-mechanism', title:'A certain counting mechanism', date:'11 January 2024', author:'Anthony Hay',
md:`Joseph Weizenbaum’s ELIZA is quite a simple program. Its algorithm is almost completely described in eight pages of his 1966 CACM paper (Weizenbaum 1966). And yet Weizenbaum says that people became deeply emotionally involved with ELIZA after just a short time talking to it, and they were convinced that ELIZA understood them. That such a simple program could have such a powerful effect is what interests me most about it. In order to better understand how people could feel this way I wanted to experience conversing with ELIZA for myself.

Over the last 60 years there have been many versions of ELIZA made by many different people. But these seemed to be inspired by ELIZA rather than accurate recreations and I wanted to be sure I was seeing what the people in 1966 would have seen. Although the 1966 CACM paper is a good description of how ELIZA works, I was disappointed that his description of the mechanism that decides when to recall a memory is vague.

Weizenbaum states that when “a certain counting mechanism is in a particular state” the memory will be recalled (Weizenbaum 1966: 41). He also says that the mechanism used to create memories is partly random. So it seemed it would not be possible to recreate an ELIZA and know that your conversation with it was exactly what it would have been with the original.

That all changed when the original ELIZA source code was rediscovered in 2020 (see Berry et al. 2023). This code is not the final version, as it is missing some functions Weizenbaum describes in his CACM paper. But it does show us exactly how the “certain counting mechanism” works:

- it’s a simple counter of the replies made to the user that repeatedly cycles through 1..4
- only when the value is 4 will a memory be recalled

The code also shows us that the selection of the memory template to be used when a memory is created is not random, as Weizenbaum stated: it depends on a hash-digest of the last word in the user’s current input text. Once we had also found the hash algorithm he used, the whole memory creation and recall was no longer a mystery.

This means I can now explore conversations with ELIZA like it was 1966.

#### References

Berry, D. M., Hay, A., Millican, P. and Shrager, J. (2023) Finding ELIZA: Rediscovering Weizenbaum’s Source Code, Comments and Faksimiles, in Baranovska, M. and Höltgen, S. (eds.) *Hello, I’m Eliza. 50 Jahre Gespräche mit Computern* (Computerarchäologie, Bd. 5), 2nd edn. Bochum: Projektverlag, pp. 247–248.

Weizenbaum, J. (1966) ELIZA: A Computer Program For the Study of Natural Language Communication Between Man And Machine, *Communications of the ACM*, 9(1), 36–45.` },

{ n:2, slug:'2-talking-to-eliza-on-an-asr-33-teletype', title:'Talking to ELIZA on an ASR 33 Teletype', date:'15 March 2024', author:'Anthony Hay',
md:`Joseph Weizenbaum developed ELIZA between 1964 and 1966 on an IBM 7094 under an operating system called CTSS (Compatible Time-Sharing System). Since ELIZA is an interactive program we can assume he was using some kind of computer terminal (rather than batch processing and card decks). We know he had an IBM 2741 teletypewriter at home at about this time, which prints text onto paper at 14 characters per second. We also know that the participants in the 1965 Project MAC ELIZA pilot study were talking to ELIZA using similar teletypewriters.

The Teletype Model 33 ASR was made at about the same time as the 2741 and was in widespread use. What would it be like to talk to ELIZA over one of those teletypes?

My father, who worked for the UK General Post Office, gave me a GPO surplus ASR 33 teletype in 1978 to use with my 77-68 home computer. The teletype sends and receives data through a serial cable using a protocol called RS-232. I replaced the worn out DB-25 male connector on this cable with a new DB-9 male connector. For this project it was sufficient to connect only DB-9 pins 2 (receive data, RXD), 3 (transmit data, TXD) and 5 (signal ground).

Note that RS-232 was designed to connect Data Terminal Equipment (DTE), such as the ASR 33 teletype or a computer, to Data Communications Equipment (DCE), such as a modem. The connector pins are named with respect to the DTE. So for example, pin 3 TXD is an output at the DTE end and an input at the DCE end. Because I want to connect two DTEs together, my ASR 33 to my computer, I need to use a null-modem cable, which swaps connections such as pins 2 and 3.

My Windows computer dates from 2008 and comes with two RS-232 COM ports built in. So using my null-modem cable I can connect the ASR 33 directly to my PC. Most modern personal computers don’t have RS-232 ports. USB to RS-232 cables are available and I’ll say more about them later.

When you press a key on the ASR 33 keyboard, the machine transmits eleven bits: 1 start bit, 7 ASCII data bits, 1 even parity bit and 2 stop bits. It transmits these at 110 baud, which means it can transmit at a maximum of 10 characters per second. It receives data at the same rate.

I ran the PuTTY terminal emulator on my Windows 10 computer and configured the serial settings baud=110 data=7 parity=e stop=2 for the COM port where the teletype was connected. Using this I could send characters to and receive characters from the teletype. I added code to my recreation of Weizenbaum’s ELIZA to read and write to a serial port under Windows.

My teletype is a 50 year-old electromechanical wonder from a time before software ate the world and it’s good to see it run again. I’ve successfully made simple repairs to it, such as replacing the crumbling rubber pad on the typewheel hammer with a plastic tube. I also mended a snapped platen shaft. But I couldn’t get through the MEN ARE ALL ALIKE dialog without either me or the teletype mistyping something, or something seizing up.

What if your PC doesn’t have a COM port? There are USB to RS-232 adapter cables available. I tried a StarTech ICUSB232FTN cable with an FTDI chip, but it did not work because it does not support the 110 baud rate my ASR 33 requires; the lowest it supports is 300 baud. I also tried a Plugable PL2303-DB9 adapter with a Prolific PL2303GT chip, which does support 110 baud; Windows 10 installed a driver automatically and it worked. On my Apple M1 Mac I confirmed the Plugable cable works too, but only after installing a suitable Prolific driver.

There are other considerations a more complete solution might handle: sending a non-printing NUL after the carriage return and linefeed to give the carriage time to get home; automatically wrapping at column 72; honouring the SIMPLEX / LOCAL / DUPLEX switch; and using the RUB OUT key (which transmits ASCII DEL) since there is no backspace and, once a character is printed on the paper, the ASR 33 has no means of erasing it.

Finally, is this useful? Talking to ELIZA on a slow, noisy mechanical teletype felt like interactive performance art. I could make the machine print words on the paper. ELIZA could make the machine print words on the paper. It was evocative, emotional and exciting; an experience, a happening. Maybe this has helped me come a little closer to understanding how people may have felt when talking to ELIZA in the 1960s.` },

{ n:3, slug:'3-weizenbaums-secretary', title:"Weizenbaum's Secretary", date:'20 March 2024', author:'David M. Berry and Sarah Ciston',
md:`The ELIZA Archaeology project has spent years investigating the identity of Weizenbaum’s secretary, the “young lady” referenced in his influential accounts of ELIZA. Weizenbaum described how his secretary, after watching him work on the program for months, asked to interact with it, and then, knowing full well it was only a computer program, asked him to leave the room after only a few exchanges.

This anecdote became foundational to his analysis of what we now call the ELIZA effect: the tendency to attribute understanding and intelligence to a system far beyond what is warranted. As Weizenbaum put it, “extremely short exposures to a relatively simple computer program could induce powerful delusional thinking in quite normal people.”

We have found multiple versions of the famous conversation across publications from 1965 to 1976, with subtle variations in wording; the conversation was clearly edited before publication. Weizenbaum referred to the person variously as “young lady”, “user” and “patient”, and it is not always clear whether the secretary and the young lady were the same person, different people, or a composite. Working from Project MAC administrative staff records, we have identified likely candidates, and now believe we have identified her with a high degree of certainty.

The post is part of a wider effort to restore recognition to the women written out of computing history, and to ask why we are more familiar with stories about a feminised program than with the real women who made early computing possible.` },

{ n:4, slug:'4-judging-computation', title:'Judging Computation', date:'12 June 2024', author:'David M. Berry',
md:`Artificial intelligence (AI) is now seen to be one of the most important global challenges of the 21st century. The rising policy importance of this challenge is demonstrated by President Biden’s Executive Order on AI and the UK government’s AI Summit at Bletchley Park, both in 2023. These moments raise important issues by exploring the foundational concepts of “judgement” and “calculation” in relation to the grounding of the idea of artificial intelligence and machine learning. The question I want to look at here is not only how we can better understand the historical and theoretical ideas of artificial intelligence, but how we can offer a response to an implicit notion of a decision-making capacity, often deployed in explaining AI even today.

The importance of these questions is highlighted by the rapid deployment of AI systems and public concern with bias, transparency, responsibility and trust. Yet little work has been done on placing these notions within the context of debates begun in early AI research programmes from the 1960s. This blogpost seeks to examine some of these lacunae and start the work of deeply engaging with this aporia.

To understand how AI becomes a project to create a capacity for calculable, or “computational”, decisions, I want to suggest that it is crucial to map the constellations of concepts articulated historically by different theorists, programmers and projects. Key is the idea that it is possible to translate “judgement” into classifications that can be programmed or learned by a machine. AI was greatly influenced by notions of calculability in cybernetics, statistics, cognitive science and operations research, particularly around pattern recognition (Simon, 1982).

This lets us trace what I call “AI anxiety”, which is often implicitly based on a sedimented notion of human judgement. My aim is to trace the connections between judgement and decision-making, and the ways they connect digital processes, representations and techniques through their operationalisation, particularly in recent debates about AI alignment.

The key starting probe is the work and scattered writings of Joseph Weizenbaum. Working at MIT in the 1960s, Weizenbaum became famous for ELIZA in 1966. The reaction of users who believed the computer was intelligent greatly concerned him, and was later described as the ELIZA effect (Turkle, 1997). Weizenbaum described being treated as a “heretic” in AI research as he questioned its direction and its problematic theorisation of humans, with Marvin Minsky, for example, describing the brain as a “meat machine” (Long, 1985, p. 47). Weizenbaum wrote: “the knowledge of behaviour of German academics during the Hitler time weighed on me very heavily. I was born in Germany, I couldn’t relax and sit by and watch [MIT] behaving in the same way” (ben-Aaron, 1985, p. 2).

As a computer scientist, Weizenbaum was awarded a fellowship at Stanford, where he wrote *Computer Power and Human Reason: From Judgment to Calculation*. He drew on Mumford (“authoritarian technics”), Horkheimer (“instrumental reason”), Arendt (“calculation”), Dreyfus (“whole/part”), Jonas (“responsibility”), Anders (“obsolescence”), Chomsky (“understanding”) and Freud (“psychoanalysis”). He linked “calculability” to a scientific knowing in contrast to a judgement that leads to morally obligatory ways of living. As he wrote:

> The scientific man has above all things to strive at self-elimination in his judgments, wrote Karl Pearson in 1892. Of the many scientists I know, only a very few would disagree with that statement. Yet it must be acknowledged that it urges man to strive to become a disembodied intelligence, to himself become an instrument, a machine. So far has man’s initially so innocent liaison with prostheses and pointer readings brought him. And upon a culture so fashioned burst the computer (Weizenbaum 1976: 25–26).

The fear that “judgement” mimicked by a computer program could become normalised, either using the tricks Weizenbaum described in ELIZA, or by re-conceptualising judgement as calculation, is a key question for him and for my own research. As he wrote: “‘judgment’ is not the proper word, for their decision would be reached by the application of logic only. It would, in effect, be nothing more than a determined calculation, a logical process which could have only one outcome” (Weizenbaum 1976: 44).

Indeed, AI has been described as “not a monolithic paradigm of rationality but a spurious architecture made of adapting techniques and tricks” (Pasquinelli and Joler, 2021). Weizenbaum, obsessed with tricks and con games, would probably agree. As he wrote: “Computers can make judicial decisions, computers can make psychiatric judgments... The point is that they ought not be given such tasks... the relevant issues are neither technological nor even mathematical; they are ethical... since we do not now have any ways of making computers wise, we ought not now to give computers tasks that demand wisdom” (Weizenbaum 1976: 227).

Even in systems such as ChatGPT, the chain of reasoning is often opaque, and explainability has been offered as a solution (Berry 2023a). But it is clear the system is not exercising judgement in the human sense; it is a computed decision, the result of a cascading flow of combinatorial logical functions flowing through digital code.

I find it helpful to think about the distinction between calculation and judgement within social philosophy, and to connect this to the social problem of the computable. “The computable” should be understood critically, as a question of what kinds of problems are appropriate for computation, what ought to be done, rather than the technical question of what can or cannot be computed. It might help to think of this as the question of the “uncomputable”: a set of human or social issues that society deems inappropriate for computation, and thus ethically, even if not strictly technically, uncomputable.

#### Bibliography

ben-Aaron, D. (1985) ‘Weizenbaum examines computers and society’, The Tech, 17 February.
Berry, D.M. (2023a) ‘The Explainability Turn’, Digital Humanities Quarterly, 17(2).
Berry, D.M. (2023b) ‘The Limits of Computation: Joseph Weizenbaum and the ELIZA Chatbot’, Weizenbaum Journal of the Digital Society, 3(3).
Long, M. (1985) ‘Turncoat of the Computer Revolution’, New Age Journal, December, pp. 47–51.
Pasquinelli, M. and Joler, V. (2021) ‘The Nooscope manifested: AI as instrument of knowledge extractivism’, AI & Society, 36(4), pp. 1263–1280.
Simon, H.A. (1982) Models of bounded rationality. MIT Press.
Turkle, S. (1997) Life on the screen: identity in the age of the Internet. Touchstone.
Weizenbaum, J. (1976) Computer power and human reason: from judgment to calculation. Freeman.` },

{ n:5, slug:'5-eliza-version-variation', title:'ELIZA Version Variation', date:'22 July 2024', author:'David M. Berry',
md:`The ELIZA Archaeology project has identified at least five major versions of ELIZA, with some potentially lost to history, and has been mapping the source-code variations to understand how different iterations reflected their historical and cultural contexts.

The versions are: **1965a**, which used only “.” and “,” to delimit sentences; **1965b**, which added “but” as a delimiter but lacked the NEWKEY function; the **1966 CACM** version, which introduced NEWKEY and the keyword stack; **1967**, with sophisticated script handling using OPL; and **1968+**, which enabled advanced programming through scripts (with contributions by Walter E. Daniels).

Weizenbaum explained that the later versions differ from the old one in two main respects: they added evaluators allowing expressions of unlimited complexity, and they generalised the script system to handle multiple simultaneous scripts.

The work raises questions about how ELIZA versions transported linguistic and conceptual ideas across cultures, what the variations reveal about the software’s technical complexity, and which elements prompted the most adaptation across versions and languages. The central claim is that ELIZA should be understood as a multiplicity rather than a singular object: at once a technical and a cultural artifact, shaped by the constraints of 1960s computing.` },

{ n:6, slug:'6-elliza-the-original-chatbot-applied-like-a-modern-llm', title:'ELLIZA: The Original Chatbot Applied Like a Modern LLM', date:'9 September 2024', author:'Jeff Shrager',
md:`Mark Marino and Sarah Ciston asked Team ELIZA to locate a script that produced a particular educational conversation from Edwin F. Taylor’s 1968 paper “Automated Tutoring and Its Discontents”, a Socratic-style dialogue about a poem.

The original 1966 ELIZA simply reacted to input without logical decision-making. The extended ELIZA described by Hayward in 1968 supported conditionals, arithmetic and branching, letting scripts behave like real programs; the tutoring dialogue would have been difficult in the original ELIZA, which lacks conditional responses and dialogue sequencing.

Rather than reverse-engineer the extended ELIZA, I explored whether the original’s pattern matching alone could carry an educational dialogue: creating a script keyed off all the content words in the subject matter, with leading prompts to drive the conversation forward.

I built an educational script about *Animal Farm* by having ChatGPT generate assertions about the novel, then using Lisp to convert those assertions into ELIZA script format. As I put it, I was, in a simplistic yet fundamental sense, using ELIZA like ChatGPT: pulling data to drive a conversational system, much as ChatGPT pulls data from the web to set its parameters.

The resulting conversation shows the original ELIZA conducting an educational dialogue about *Animal Farm*, with the memory mechanism triggering appropriately and leading prompts encouraging engagement. The code and transcripts are on the elizagen and Anthony Hay ELIZA repositories.` },

{ n:7, slug:'7-guest-post-berkeley-and-weizenbaum', title:'Edmund Berkeley and Joseph Weizenbaum', date:'20 November 2024', author:'Rebecca Roach (guest post)',
md:`In the archives of the Charles Babbage Institute lie a remarkable set of documents dating from 1965. They are part of the papers of Edmund Berkeley, a pioneering figure in computer science, who co-founded the Association for Computing Machinery (ACM) in 1947. Berkeley corresponded with Joseph Weizenbaum, the creator of ELIZA, who apparently sent him this example of, among other things, the strong emotional responses that interacting with the programme and script could evoke. Berkeley, a name unfamiliar to many today, was an early computer scientist who studied mathematics and logic at Harvard. This exchange is particularly fascinating because it represents a meeting of minds between two figures who understood early on that the social and psychological implications of computing would be as significant as its technical capabilities.

Berkeley’s 1949 book *Giant Brains, or Machines That Think* was one of the first popular works to explore the potential of computers, and throughout the 1950s and 1960s he published *Computers and Automation*, a magazine which featured articles about the social implications of computing alongside technical content. Berkeley wrote extensively about privacy concerns and the potential for computers to be used for surveillance. He was one of the first to recognise that computers would play a crucial role in military systems, and he argued for the development of ethical guidelines for computer scientists. Berkeley also co-created his own early chatbot, a programme designed to emulate an “elevator operator” (note the service and class associations) which could converse about the weather.

I came across this material as part of my research for a book I am currently writing, *Machine Talk*, which offers an alternative history of computing from the perspective of the writers and poets, women, non-Western and otherwise marginalised figures who often get left out of the stories we tell about computer innovation. Indeed, women are normally featured as the users, rather than the inventors, of computers in this early period, despite the crucial contributions of people like Grace Hopper, Margaret Masterman, and Betty Holberton. The book is also a history of the idea of computers, not as “machines that think”, but as “machines that talk”.

This all might seem like an odd topic for a literature professor, but I am keen to show that literature and computing are far from oppositional. They have shared intellectual, institutional and technological roots. The history of “machines that talk” is also the history of computers as linguistic, and textual, tools.

My own interest in ELIZA, aside from it being the most famous of talking machines, comes from the fact that we are more likely to be familiar with the stories about this feminised program than we are with many real women in computer history. I am interested in knowing why that is and how we might change it: I am interested in what it is in the origin story of ELIZA that makes it so culturally compelling, even today.

*Rebecca Roach is Associate Professor of Contemporary Literature at the University of Birmingham. Digital images courtesy of the Charles Babbage Institute Archives, Edmund Berkeley Collection, University of Minnesota Libraries.*` },

{ n:8, slug:'8-the-doctor-script-a-work-in-progress', title:'The DOCTOR script: a work in progress', date:'9 December 2024', author:'Anthony Hay',
md:`There are three known contemporaneous scripts compatible with the version of ELIZA described in Weizenbaum’s 1966 Communications of the ACM paper: one was published as an appendix to that paper, and the other two appear in a computer printout in Weizenbaum’s archive at MIT. Here we take a quick look at these three scripts to see how they compare: they are similar, and the ones from the archive appear to show the published DOCTOR script at an earlier stage of development.

The printout of the ELIZA source code is in a folder dated 1965. Sandwiching the code are two ELIZA scripts. Weizenbaum developed ELIZA on an IBM 7094 under the Compatible Time-Sharing System, or CTSS. The first script is named .TAPE. 102; the file containing the ELIZA code is named SPEAK MAD; and the last script is named .TAPE. 100. CTSS simulated physical tape units as files named .TAPE. n. When ELIZA starts it asks “WHICH SCRIPT DO YOU WISH TO PLAY” and reads the script from the file named .TAPE. plus the number you give.

.TAPE. 102 and .TAPE. 100 are very similar; there is a minor error in .TAPE. 102. All the keywords in .TAPE. 102 are present in .TAPE. 100 and the CACM script, and (except for MY and WAS) at the same precedence. The special keywords MEMORY and NONE are the same in all three.

Two new keywords, HOW and WHEN, appear in .TAPE. 100, both redirecting to WHAT. In .TAPE. 102 the list (DON'T YOU KNOW) was placed at the top level where a keyword rule is expected, which makes the script ill-formed; this is corrected in .TAPE. 100, where the line is moved inside the PERHAPS rule:

\`\`\`
(PERHAPS
    ((0)
        (YOU DON'T SEEM QUITE CERTAIN)
        (WHY THE UNCERTAIN TONE)
        (CAN'T YOU BE MORE POSITIVE)
        (YOU AREN'T SURE)
        (DON'T YOU KNOW)))
\`\`\`

Weizenbaum was probably editing with a line-based text editor on a teletype, positioning an invisible pointer; it is easy to assume the pointer is in the right place when it is not. Another possibility is that the script was punched onto cards and some were inserted or removed incorrectly. The line numbers support this: a jump of 30 rather than the usual 10 appears around the error.

In .TAPE. 102 the WHAT keyword has one transformation rule with three reassembly rules; in .TAPE. 100 it gains six more. The WHY rule is simplified in .TAPE. 102 by replacing its last transformation rule with a redirect to WHAT.

The differences between .TAPE. 100 and the CACM DOCTOR are smaller: HOW, WHEN, PERHAPS and WHAT are unchanged; WHY changes slightly. The March 1965 code supports (=keyword) at the transformation-rule level but not yet at the reassembly-rule level, functionality used in ten of the CACM keyword rules (AM, ARE, CAN, DREAMT, I, LIKE, REMEMBER, WAS, WHY and YOU). By the time the paper was submitted in September 1965 Weizenbaum had also added the NEWKEY and PRE functions; five CACM rules use NEWKEY and two use PRE.

This printout gives us a glimpse into the development of the ELIZA code and DOCTOR script. It suggests a process of incremental improvement of ELIZA/DOCTOR’s ability to conceal its lack of understanding; almost as if it was built without a plan.

*With thanks to Rupert Lane, Tom Van Vleck and Jerry Saltzer for help understanding CTSS. Transcripts of the three scripts are at [github.com/anthay/ELIZA](https://github.com/anthay/ELIZA/tree/master/scripts).*` },

{ n:9, slug:'9-guest-post-the-software-toolworks-eliza', title:"The Software Toolworks' ELIZA", date:'16 January 2025', author:'Walt Bilofsky (guest post)',
md:`ELIZA played a key role in the journey of the pioneering software publishing company The Software Toolworks from a one-man shop in a converted garage to a publicly traded company with over 600 employees. Here’s how it went.

I started the Toolworks in February 1980, selling software on 5¼" floppy disks for the Heathkit H89 computer. By the end of the year there were 13 titles by myself and five other authors, and an employee.

Around a year later, I saw an ad for ELIZA and tracked down the publisher, Artificial Intelligence Research Group. This was actually a fellow named Steve Grumette, who agreed to license his program to the Toolworks. After working for a week to try to make it run on Heath’s BASIC interpreter, I realized it would be easier to just write it from scratch in C.

I phoned Joe Weizenbaum, whom I knew from my graduate student years at MIT, to find out how to license ELIZA. It had been published as part of his January 1966 article in the Communications of the ACM, so they owned the copyright. For $75 they sold me full rights to reproduce the article. (Back in those days, computers filled rooms and cost millions but software was given away.)

All I had wanted from ACM was the right to reproduce ELIZA’s DOCTOR script, but why waste anything? So the entire article was included as an appendix to the program’s manual, to lend it gravitas and maybe teach someone something. The manual also contained instructions for the user to change and extend the script if they wished.

The Toolworks never wound up using Grumette’s program, but having agreed to license it I thought it only fair to pay him a royalty, which we did for some years. Since my C version of ELIZA could be sold for other computers, we went into competition with him, but the royalty cushioned the blow.

In 1984 Les Crane, who had a Grammy and a career as a TV talk show host, decided presciently that software was going to be the next show business. After publishing a software version of the I Ching, he decided that his next product would be Software Golden Oldies, Vol. 1. He licensed versions of Pong and Life, and then approached Steve Grumette about ELIZA. Steve knew that his version wouldn’t port easily, and we had dealt fairly with him, so he sent Les to us. We licensed Les our version of ELIZA, along with The Original Adventure, the only version to pay anything to Adventure’s creators, Will Crowther and Don Woods.

So Software Golden Oldies Vol. 1 was published. It became the product that Electronic Arts chose to kick off its Affiliate Label Program. It sold over 100,000 copies and laid the foundation for the 1986 merger of Les’s company into The Software Toolworks.

ELIZA also influenced the mega-hit program Mavis Beacon Teaches Typing. It was written by a three person team; my task was the user interface. Joe Weizenbaum’s ELIZA had taught me that if the software reflects the user’s input back to them in a conversational way, they will perceive a presence that transcends ordinary computer interactions. Although the user didn’t converse with Mavis 1.0, she used conversational language to make observations and suggestions based on the user’s typing, even suggesting they might be getting tired if their error rate increased. This contributed to the perception of a real person that made Mavis such a success.

Lifted by sales of Chessmaster and Mavis, the Toolworks went public in 1988. It grew to over $150 million in revenue and was acquired in 1994 by the British conglomerate Pearson plc.

ELIZA, I owe you a big thank you for helping bring that about.

YOU’RE NOT REALLY TALKING ABOUT ME, ARE YOU?` },

{ n:10, slug:'10-reconstructing-eliza', title:'Reconstructing ELIZA', date:'25 January 2025', author:'David M. Berry and Sarah Ciston',
md:`The reconstruction of historical software presents fascinating challenges at the intersection of computer science, digital preservation, and software archaeology. In recent work reconstructing Joseph Weizenbaum’s original ELIZA from 1965, the team encountered unique difficulties that highlight important questions about software preservation and historical authenticity.

ELIZA, created by Joseph Weizenbaum at MIT in the early 1960s, is usually considered the world’s first chatbot. It was developed in MAD-SLIP on MIT’s Compatible Time-Sharing System (CTSS), running on an IBM 7094. Our recent discovery of original ELIZA printouts in Weizenbaum’s archives at MIT, including an early version of the famous DOCTOR script and MAD-SLIP code, provided an unprecedented opportunity to resurrect this foundational piece of computing history.

The team’s reconstruction revealed several key technical challenges. CTSS used 6-bit BCD character encoding, packing six characters into a 36-bit word, a reminder of computing before standardised ASCII encoding. The MAD programming language itself used verbose keywords that could be abbreviated, making the code particularly difficult to interpret decades later. For example, ‘WHENEVER’ could be shortened to ‘W'R’, a convention that made sense in the era of punch cards but presents challenges for modern interpretation.

Several critical functions were missing from the recovered code and had to be carefully reconstructed: BCDIT, a function for converting binary numbers to BCD format; INLST, a crucial function used in XMATCH and ASSMBL operations; LETTER, a character classification function with no extant documentation; and various initialisation routines for common data areas.

The reconstruction required not just technical expertise but detective work to understand the original system’s behaviour. As Lane et al. (2025) note, “running the original code feels good and authentic. Finding bugs in it only adds to the authenticity.”

This archaeological approach to code reconstruction raises important questions about authenticity and preservation. Should we fix historical bugs when we find them? How do we balance historical accuracy with the desire for a working system? These questions parallel debates in architectural preservation about restoration versus reconstruction. How are we to preserve the material traces of something that exists in many versions, iterations, and offshoots, in particular before the era of Git (which itself presents new problems for contemporary software archiving)?

The process also highlighted how software preservation differs from physical artefact preservation. Unlike buildings or manuscripts, software exists simultaneously as human-readable text and machine-executable instructions. This dual nature creates unique challenges for preservation and reconstruction.

Our work on ELIZA demonstrates the importance of treating historical software as both technical and cultural heritage. The reconstruction reveals not just the technical sophistication of early computing but also the social and institutional context of AI, which did not result from a linear progression of developments but rather shifted and iterated back over itself.

The reconstructed ELIZA, now running on an emulated CTSS system, offers a unique window into computing history. It stands as testimony to both the ingenuity of early computer scientists and the importance of preserving our digital heritage.` },

{ n:11, slug:'11-the-plurality-of-eliza', title:'The Plurality of ELIZA: Code, History, and Computing’s Amnesia', date:'8 December 2025', author:'David M. Berry, Sarah Ciston, Anthony Hay, Mark C. Marino, Arthur Schwarz, Jeff Shrager, Peggy Weil and Peter Millican',
md:`The recovery of lost source code is an important scholarly practice of “critical code studies” (Berry and Marino 2024). The co-authored book *Inventing ELIZA: How the First Chatbot Shaped the Future of AI* (MIT Press, 2026) argues that ELIZA was never merely the simple pattern-matching therapist of popular imagination, but rather a sophisticated platform with an impressive architectural design that inspired Weizenbaum’s later critical stance on AI. These are details that are either omitted, overlooked, or forgotten by most accounts. Inventing ELIZA builds on research which began when we discovered Joseph Weizenbaum’s original ELIZA code in the MIT Archives in 2021. There we uncovered not just missing code in the form of the MAD-SLIP printout but a forgotten complexity in ELIZA’s history (Weizenbaum 1966, 1967).

ELIZA and DOCTOR are not synonymous. This distinction, obvious once stated, has been obscured for sixty years by the proliferation of BASIC and Lisp implementations that treated DOCTOR’s Rogerian therapy script as if it were ELIZA, rather than one demonstration of a general-purpose system. We document at least five major versions of ELIZA (1965a, 1965b, 1966, 1967, 1968+), each with distinct capabilities that complicate any simple narrative about it.

The technical differences are worth dwelling upon. What we call ELIZA 1966 is described in Weizenbaum’s key article in Communications of the ACM, where he introduced the NEWKEY function and keyword stack that enabled sophisticated contextual memory. But ELIZA 1967 and 1968+ also incorporated OPL (Open-ended Programming Language), enabling multiple simultaneous scripts, inter-script communication, and dynamic script editing. This incremental improvement transformed ELIZA from a single-persona chatbot into something closer to an educational platform, actually used for computer-assisted education at MIT and Harvard.

We also discovered evidence of other scripts in the archive beyond DOCTOR, including ARITHM for mathematics tutoring, YAPYAP for psychiatric research at Massachusetts General Hospital, SPACKS engaging with Barry Spacks’s poetry about Belsen, and even a Nixon parody script. Some of these we have the output printouts from, and some the actual script listings too. These alternative personas show that Weizenbaum developed ELIZA into a “family of programs” whose actual use and experimentation has been largely forgotten.

We use an approach drawn from critical code studies, treating source code as a text requiring close reading within its historical and material context (Berry and Marino 2024; Marino 2020). For example, the recovered code contains a “certain counting mechanism” for memory recall that Weizenbaum described but never fully explained, which we can now read in the source. Additionally ELIZA uses “but” as a delimiter alongside “.” and “,” despite the CACM paper only mentioning the latter two.

What is surprising is what remains lost from a time not that far from our own (Berry 2025). Despite extensive archival work, we have not been able to find source code for ELIZA’s sophisticated later versions. The OPL-based multi-script platform deployed in educational settings has simply disappeared, leaving only fragmentary evidence in Project MAC progress reports and user documentation. We suspect that CTSS backup tapes might contain later versions, but none have so far been located.

This loss highlights a structural problem in how computer science understands its own history. The discipline tends to privilege abstract and reproducible artifacts, such as manuals, textbooks, and formal specifications, over material and situated ones, such as printouts, design notes, hand-edited code, or working drafts. We speculate that this mirrors computing’s epistemological outlook: that it sees code as separable from execution context.

This belief that algorithms can be understood and documented as separate from implementations dates back to the early foundation of computing as a practice. But as our book shows, it is precisely the material traces that reveal how algorithms and computing software/hardware are intertwined deeply at both a conceptual and material level. To try to understand computation as purely formal is to misunderstand what it is, both practically and historically. Algorithms tell you how it should work, whereas archival materials such as source code tell you how it actually worked, how it was developed, and how programmers think through problems of computation in situated contexts.

Computer science’s lack of consistent archival practices perhaps reflects a deeper failure to recognise software as historical rather than purely logical objects. Too often, programs and source code are treated as if their essence exists in a platonic space of algorithms, transcending the material contingencies of specific machines, institutions, and historical moments. We argue that, in addition to often being a functioning system, code is a material artifact. The contingent preservation of Weizenbaum’s rare source code listing enabled this research, and shows the value of these materials. Archives and computing departments should be working together to decide what should be preserved, and how, before more important source code and documentary material are lost.

These absences in computing’s history are not merely gaps in the historical record but, we argue, symptoms of how computer science values its own past. The field must recognise software as material culture, requiring preservation of situated practices and not just formal specifications and published algorithms. The tragedy is not simply that we lack ELIZA 1968+’s source code, but that today we still lack the institutional commitments and disciplinary frameworks that would have preserved it.

One of the key questions in the book is whether computing, both in its academic and practical form, can learn from our recovery of an important historical software artefact, or whether today’s computing and AI software will suffer similar amnesia. Will current LLMs like ChatGPT, Claude, and Gemini have their complexity flattened into simple stories, their sophisticated architectures and material experimentation lost because they do not archive important material traces? If Inventing ELIZA succeeds, it will be because it shows that computing history matters, that code has politics, and that the stories we tell about technology shape the futures we are able to imagine and change.

For more information see the book: [mitpress.mit.edu/9780262052481/inventing-eliza](https://mitpress.mit.edu/9780262052481/inventing-eliza/)` }
];

posts.forEach(p => fs.writeFileSync(path.join(PD, p.slug + '.md'),
  noDash(`---\ntitle: ${p.title}\ndate: ${p.date}\nauthor: ${p.author}\n---\n\n${p.md}\n`)));

const manifest = posts.map(p => ({ n: p.n, slug: p.slug, title: p.title, date: p.date, author: p.author }));
fs.writeFileSync(path.join(OUT, 'blog', 'posts.json'), JSON.stringify(manifest, null, 2) + '\n');

const contrib = `# Adding a blog post

The blog needs no build step and no web framework. To add a post you create one
Markdown file and add one line to a list. You can do all of it from the GitHub
website, no software required.

## 1. Write the post

Create a new file in \`blog/posts/\` named with the next number and a short slug,
for example \`blog/posts/12-my-new-post.md\`. Start it with this header (the bit
between the two \`---\` lines), then write the post in Markdown below it:

\`\`\`
---
title: My New Post
date: 14 July 2026
author: Your Name
---

Write your post here in **Markdown**. Leave a blank line between paragraphs.

You can use *italics*, **bold**, [links](https://example.com), lists:

- like this
- and this

> and block quotes for quoting Weizenbaum.

And fenced code blocks for script or code:

\\\`\\\`\\\`
(PERHAPS
    ((0)
        (YOU DON'T SEEM QUITE CERTAIN)))
\\\`\\\`\\\`
\`\`\`

## 2. List it

Open \`blog/posts.json\` and add an entry at the end of the list (mind the comma):

\`\`\`
{ "n": 12, "slug": "12-my-new-post", "title": "My New Post", "date": "14 July 2026", "author": "Your Name" }
\`\`\`

The \`slug\` must exactly match the file name (without \`.md\`). That is all. The
post appears on the Blog page and at \`blog/post.html?p=12-my-new-post\`, and the
previous / next links sort themselves out from the order in this file.

## House style

- No em dashes. Use commas, or " - " with spaces, or rewrite the sentence.
- British spelling, except inside direct quotations.
- Curly quotes are fine. Keep paragraphs separated by a blank line.

## Previewing locally (optional)

Because posts are fetched at run time, opening the files directly with
\`file://\` will not work; you need a tiny local server. From the repository root:

\`\`\`
python3 -m http.server 8000
\`\`\`

then visit \`http://localhost:8000/blog.html\`. On the live GitHub Pages site this
is not needed; it just works.
`;
fs.writeFileSync(path.join(OUT, 'blog', 'CONTRIBUTING.md'), noDash(contrib));

console.log('wrote', posts.length, 'markdown posts + posts.json + CONTRIBUTING.md');
