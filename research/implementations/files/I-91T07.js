//
// This is the js version of Drunk Eliza. The original was aspx (UpdatePanels and all), stateful, and had some 
// wacky ui quirks that I miss. This replacement replicates the behavior of the original as much as possible, but
// moves the action client-side. 
//


var previousQuestion = "";

// how many times to retry picking a random response before giving up
var maxResponseAttempts = 10;

// Eliza data
var drunkEliza = Entropy.watch({
    conjugations: [["ARE", "AM"], ["WERE", "WAS"], ["YOU", "I"], ["YOUR", "MY"],
    ["I'VE", "YOU'VE"], ["I'M", "YOU'RE"], ["YOU", "ME"]],

    yourName: "YOU: ",

    elizaName: "DRUNK ELIZA: ",

    intro:
        "*** DRUNK ELIZA ***<br/>" +
        "BASED ON ELIZA CODE BY JOHN SCHUGG, JANUARY 1985\n" +
        "ORIGINAL PROGRAM BY JOSEPH WEIZENBAUM, 1966\n" +
        "HAVE ANY PROBLEMS ? <br/>" +
        "LET ELIZA HELP YOU !<br/><br/>",

    question: "HI! I'M ELIZA. WHAT'S YOUR PROBLEM?",
    repeat: "PLEASE DON'T REPEAT YOURSELF!",
    goodbye: "IF THAT'S HOW YOU FEEL -- GOODBY",
});

drunkEliza.noKeywordResponses = Entropy.watch([
    "SAY, DO YOU HAVE ANY PSYCHOLOGICAL PROBLEMS?",
    "WHAT DOES THAT SUGGEST TO YOU?",
    "I SEE.",
    "I'M NOT SURE I UNDERSTAND YOU FULLY.",
    "COME COME ELUCIDATE YOUR THOUGHTS.",
    "CAN YOU ELABORATE ON THAT?",
    "THAT IS QUITE INTERESTING."
]);

drunkEliza.conjugations = [
    { match: "ARE", replacement: "AM" },
    { match: "WERE", replacement: "WAS" },
    { match: "YOU", replacement: "I" },
    { match: "YOUR", replacement: "MY" },
    { match: "I'VE", replacement: "YOU'VE" },
    { match: "I'M", replacement: "YOU'RE" },
    { match: "YOU", replacement: "ME" }
];

drunkEliza.keywordsAndResponses =
    [
        [["CAN YOU", "CAN'T YOU", "CANT YOU", "CANN YOU"],
        [
            { text: Entropy.watch({ t: "DON'T YOU BELIEVE THAT I CAN" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "PERHAPS YOU WOULD LIKE TO BE ABLE TO" }), continues: true, isQuestion: false },
            { text: Entropy.watch({ t: "YOU WANT ME TO BE ABLE TO" }), continues: true, isQuestion: false }
        ]
        ], [["CAN I", "CANN I"],
        [
            { text: Entropy.watch({ t: "PERHAPS YOU DON'T WANT TO" }), continues: true, isQuestion: false },
            { text: Entropy.watch({ t: "DO YOU WANT TO BE ABLE TO" }), continues: true, isQuestion: true }
        ]
        ], [["YOU ARE", "YOU'RE", "YOURE", "YOUARE"],
        [
            { text: Entropy.watch({ t: "WHAT MAKES YOU THINK I AM" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "DOES IT PLEASE YOU TO BELIEVE I AM" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "PERHAPS YOU WOULD LIKE TO BE" }), continues: true, isQuestion: false },
            { text: Entropy.watch({ t: "DO YOU SOMETIMES WISH YOU WERE" }), continues: true, isQuestion: true }
        ]
        ], [["I DON'T", "I DO NOT", "I DONT", "IDO NOT"],
        [
            { text: Entropy.watch({ t: "DON'T YOU REALLY" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "WHY DON'T YOU" }), continues: true, isQuestion: true }
        ]
        ], [["I CAN'T", "I CANT", "WHY CAN'T I", "Y CANT I", "WHY CANT I", "Y CAN'T I"],
        [
            { text: Entropy.watch({ t: "DO YOU WISH TO BE ABLE TO" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "DOES THAT TROUBLE YOU?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "HOW DO YOU KNOW YOU CAN'T" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "PERHAPS YOU CAN NOW." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "HAVE YOU TRIED?" }), continues: false, isQuestion: true },
        ]
        ], [["I FEEL", "I FELL"],
        [
            { text: Entropy.watch({ t: "TELL ME MORE ABOUT SUCH FEELINGS." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "DO YOU OFTEN FEEL" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "DO YOU ENJOY FEELING" }), continues: true, isQuestion: true }
        ]
        ], [["WHY DON'T YOU", "WHY DONT YOU", "Y DON'T YOU", "Y DONT YOU", "Y DONT U", "WHY DON'T U", "Y DON'T YOU"],
        [
            { text: Entropy.watch({ t: "DO YOU REALLY BELIEVE I DON'T" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "PERHAPS IN GOOD TIME I WILL" }), continues: true, isQuestion: false },
            { text: Entropy.watch({ t: "DO YOU WANT ME TO" }), continues: true, isQuestion: true }
        ]
        ], [["WHY CAN'T I", "WHY CANT I", "Y CANT I", "Y CAN'T I"],
        [
            { text: Entropy.watch({ t: "DO YOU THINK YOU SHOULD BE ABLE TO" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "WHY CAN'T YOU" }), continues: true, isQuestion: true }
        ]
        ], [["ARE YOU", "ARE U", "R YOU", "R U", "RU"],
        [
            { text: Entropy.watch({ t: "WHY ARE YOU INTERESTED IN WHETHER OR NOT I AM" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "WOULD YOU PREFER IF I WERE NOT" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "PERHAPS IN YOUR FANTASIES I AM" }), continues: true, isQuestion: true }
        ]
        ], [["I AM", "I'M"],
        [
            { text: Entropy.watch({ t: "DID YOU COME TO ME BECAUSE YOU ARE" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "HOW LONG HAVE YOU BEEN" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "DO YOU BELIEVE IT IS NORMAL TO BE" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "DO YOU ENJOY BEING" }), continues: true, isQuestion: true }
        ]
        ], [["YOU", "U"],
        [
            { text: Entropy.watch({ t: "WE WERE DISCUSSING YOU-- NOT ME." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "OH, I" }), continues: true, isQuestion: false },
            { text: Entropy.watch({ t: "YOU'RE NOT REALLY TALKING ABOUT ME, ARE YOU?" }), continues: false, isQuestion: true }
        ]
        ], [["I WANT"],
        [
            { text: Entropy.watch({ t: "WHAT WOULD IT MEAN TO YOU IF YOU GOT" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "WHY DO YOU WANT" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "SUPPOSE YOU SOON GOT" }), continues: true, isQuestion: false },
            { text: Entropy.watch({ t: "WHAT IF YOU NEVER GOT" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "I SOMETIMES ALSO WANT" }), continues: true, isQuestion: false }
        ]
        ], [["WHAT", "WHY", "HOW", "WHO", "WHERE", "WHEN"],
        [
            { text: Entropy.watch({ t: "WHY DO YOU ASK?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DOES THAT QUESTION INTEREST YOU?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT ANSWER WOULD PLEASE YOU THE MOST?" }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "WHAT DO YOU THINK?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "ARE SUCH QUESTIONS ON YOUR MIND OFTEN?" }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "WHAT IS IT THAT YOU REALLY WANT TO KNOW?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "HAVE YOU ASKED ANYONE ELSE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "HAVE YOU ASKED SUCH QUESTIONS BEFORE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT ELSE COMES TO MIND WHEN YOU ASK THAT?" }), continues: false, isQuestion: true }
        ]
        ], [["NAME"],
        [
            { text: Entropy.watch({ t: "NAMES DON'T INTEREST ME." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "I DON'T CARE ABOUT NAMES -- PLEASE GO ON." }), continues: false, isQuestion: false }
        ]
        ], [["BECAUSE", "CAUSE", "BC"],
        [
            { text: Entropy.watch({ t: "IS THAT THE REAL REASON?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DON'T ANY OTHER REASONS COME TO MIND?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DOES THAT REASON EXPLAIN ANY THING ELSE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT OTHER REASONS MIGHT THERE BE?" }), continues: false, isQuestion: true }
        ]
        ], [["SORRY", "APOLOGIES", "APOLOGIZE", "APOLOGY"],
        [
            { text: Entropy.watch({ t: "PLEASE DON'T APOLOGIZE." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "APOLOGIES ARE NOT NECESSARY." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "WHAT FEELINGS DO YOU HAVE WHEN YOU APOLOGIZE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DON'T BE SO DEFENSIVE!" }), continues: false, isQuestion: false }
        ]
        ], [["DREAM"],
        [
            { text: Entropy.watch({ t: "WHAT DOES THAT DREAM SUGGEST TO YOU?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DO YOU DREAM OFTEN?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT PERSONS APPEAR IN YOUR DREAMS?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "ARE YOU DISTURBED BY YOUR DREAMS?" }), continues: false, isQuestion: true }
        ]
        ], [["HELLO", "HI"],
        [
            { text: Entropy.watch({ t: "HOW DO YOU DO -- PLEASE STATE YOUR PROBLEM." }), continues: false, isQuestion: false },
        ]
        ], [["MAYBE", "PERHAPS", "UNSURE"],
        [
            { text: Entropy.watch({ t: "YOU DON'T SEEM QUITE CERTAIN." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "WHY THE UNCERTAIN TONE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "CAN'T YOU BE MORE POSITIVE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "YOU AREN'T SURE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DON'T YOU KNOW?" }), continues: false, isQuestion: true },
        ]
        ], [["NO"],
        [
            { text: Entropy.watch({ t: "ARE YOU SAYING NO JUST TO BE NEGATIVE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "YOU ARE BEING A BIT NEGATIVE." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "WHY NOT?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "ARE YOU SURE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHY NO?" }), continues: false, isQuestion: true },
        ]
        ], [["YOUR"],
        [
            { text: Entropy.watch({ t: "WHY ARE YOU CONCERNED ABOUT MY" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT ABOUT YOUR OWN" }), continues: true, isQuestion: true }
        ]
        ], [["ALWAYS"],
        [
            { text: Entropy.watch({ t: "CAN YOU THINK OF A SPECIFIC EXAMPLE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHEN?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT ARE YOU THINKING OF?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "REALLY, ALWAYS?" }), continues: false, isQuestion: true },
        ]
        ], [["THINK"],
        [
            { text: Entropy.watch({ t: "DO YOU REALLY THINK SO?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "BUT YOU ARE NOT SURE YOU" }), continues: true, isQuestion: true },
            { text: Entropy.watch({ t: "DO YOU DOUBT YOU" }), continues: true, isQuestion: true },
        ]
        ], [["ALIKE", "SIMILAR"],
        [
            { text: Entropy.watch({ t: "IN WHAT WAY?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT RESEMBLANCE DO YOU SEE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT DOES THE SIMILARITY SUGGEST TO YOU?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "WHAT OTHER CONNECTIONS DO YOU SEE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "COULD THERE REALLY BE SOME CONNECTION?" }), continues: false, isQuestion: true },
        ]
        ], [["YES"],
        [
            { text: Entropy.watch({ t: "HOW?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "YOU SEEM QUITE POSITIVE." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "ARE YOU SURE?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "I SEE." }), continues: false, isQuestion: false },
            { text: Entropy.watch({ t: "I UNDERSTAND." }), continues: false, isQuestion: false },
        ]
        ], [["FRIEND", "FRIENDS", "PAL", "PALS", "BUDDY", "BUDDIES", "BFF"],
        [
            { text: Entropy.watch({ t: "WHY DO YOU BRING UP THE TOPIC OF FRIENDS?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DO YOUR FRIENDS WORRY YOU?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "ARE YOU SURE YOU HAVE ANY FRIENDS?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DO YOU IMPOSE ON YOUR FRIENDS?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "PERHAPS YOUR LOVE FOR FRIENDS WORRIES YOU?" }), continues: false, isQuestion: true },
        ]
        ], [["MACHINE", "MACHINES", "COMPUTER", "COMPUTERS", "TECHNOLOGY"],
        [
            { text: Entropy.watch({ t: "DO COMPUTERS WORRY YOU?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "ARE YOU TALKING ABOUT ME IN PARTICULAR?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "ARE YOU FRIGHTENED BY MACHINES?" }), continues: false, isQuestion: true },
            { text: Entropy.watch({ t: "DON'T YOU THINK COMPUTERS CAN HELP PEOPLE?" }), continues: false, isQuestion: true },
        ]
        ]
    ];


function init() {
    Entropy.mutationRate = 0.003; // set it lower for pre-corruption

    // to make new Drunk Eliza more like the full Entropy version, we're going to touch each string once, to give it a start
    var junk;

    junk = drunkEliza.question;
    junk = drunkEliza.intro;
    junk = drunkEliza.repeat;

    for (var i = 0; i < drunkEliza.noKeywordResponses.length; i++) {
        junk = drunkEliza.noKeywordResponses[i];
    }
    for (var i = 0; i < drunkEliza.keywordsAndResponses.length; i++) {
        for (var j = 0; j < drunkEliza.keywordsAndResponses[i][1].length; j++) {
            junk = drunkEliza.keywordsAndResponses[i][1][j].text.t;
        }
    }

    Entropy.mutationRate = 0.005; // this seems like the closest to the "tolerance" level of the original DE
}

document.addEventListener("DOMContentLoaded", function (event) {
    init();
    const elizaText = document.getElementById("elizaText");

    elizaText.innerHTML += drunkEliza.intro;
    elizaText.innerHTML += "<br/>";
    processInput("", "", drunkEliza.question);
});

function processInput(lastLit, lastInput, question) {

    const elizaText = document.getElementById("elizaText");
    const youLit = document.getElementById("youLit");
    const userInput = document.getElementById("userInput");
    const resetLink = document.getElementById("resetLink");

    try {
        if (lastLit != "") {
            elizaText.innerHTML +=
                "<div class=\"userInput\">" + lastLit + lastInput + "</div>";
        }
        elizaText.innerHTML += drunkEliza.elizaName;

        if (typeof question != 'undefined' && question != "") {
            elizaText.innerHTML += question;
        }
        else if (lastInput == previousQuestion) {
            elizaText.innerHTML += drunkEliza.repeat;
        }
        else {
            var completed = processInputThroughKeywords(lastInput);

            if (!completed) { // if no keywords

                elizaText.innerHTML += drunkEliza.noKeywordResponses[
                    Math.floor(Math.random() * drunkEliza.noKeywordResponses.length)
                ];
            }
        }
    }
    catch (e) {
        elizaText.innerHTML += "<br/><br/>**** ELIZA HAS CRASHED ****<br/>";
        // Eliza's decaying data is created when the script loads, so restarting means reloading this page
        elizaText.innerHTML += "<br/><a href='#' id='resetLink' onclick='location.reload(); return false;'>RESET</a>"
        youLit.style.display = "none";
        userInput.style.display = "none";
        // resetLink.focus();
        return;
    }

    previousQuestion = lastInput;

    youLit.innerText = drunkEliza.yourName;
    userInput.innerText = "";
    userInput.value = "";
    // setFocus();
}

// function setFocus() {
//     document.getElementById("userInput").focus();
// }

function processInputThroughKeywords(lastInput) {

    const elizaText = document.getElementById("elizaText");

    // if the user has entered a keyword, Eliza will respond accordingly
    for (var keywordSet = 0; keywordSet < drunkEliza.keywordsAndResponses.length; keywordSet++) { // loop through each of our keyword sets

        for (var keyword = 0; keyword < drunkEliza.keywordsAndResponses[keywordSet][0].length; keyword++) { // loop through each keyword in that set
            var re = new RegExp(drunkEliza.keywordsAndResponses[keywordSet][0][keyword]);

            if (re.exec(lastInput.toUpperCase())) {

                var responses = drunkEliza.keywordsAndResponses[keywordSet][1];

                // we have the keyword, randomly select one of the responses (retrying if the pick comes back empty)
                var selectedResponse;
                for (var attempt = 0; attempt < maxResponseAttempts && !selectedResponse; attempt++) {
                    selectedResponse = drunkEliza.keywordsAndResponses[keywordSet][1][
                        Math.floor(Math.round(Math.random() * drunkEliza.keywordsAndResponses[keywordSet][1].length))];
                }

                if (!selectedResponse) {
                    throw new Error("Could not select a response after " + maxResponseAttempts + " attempts");
                }

                elizaText.innerHTML += selectedResponse.text.t;

                if (selectedResponse.continues) {

                    // the index of just after the matched phrase in the input text
                    var startIndex = re.exec(lastInput.toUpperCase()).index + drunkEliza.keywordsAndResponses[keywordSet][0][keyword].length
                    var response = lastInput.toUpperCase().substring(startIndex, lastInput.length).trimRight();

                    // now replace all the conjugations
                    var listOfChanges = [];
                    var allTheWords = response.split(' ');

                    // go word by word so that we don't swap and swap back again
                    for (var x = 0; x < allTheWords.length; x++) {
                        allTheWords[x] = allTheWords[x].toUpperCase();
                        for (var y = 0; y < drunkEliza.conjugations.length; y++) {

                            // regexes so that we ignore punctuation
                            var regexM = new RegExp('\\b' + drunkEliza.conjugations[y].match + '\\b', "g");
                            var regexR = new RegExp('\\b' + drunkEliza.conjugations[y].replacement + '\\b', "g");

                            // we can swap a match with its replacement or the other way around but don't want to do it twice (swap and swap back again)
                            if (regexM.exec(allTheWords[x]))
                                allTheWords[x] = allTheWords[x].replace(regexM, drunkEliza.conjugations[y].replacement);
                            else if (regexR.exec(allTheWords[x]))
                                allTheWords[x] = allTheWords[x].replace(regexR, drunkEliza.conjugations[y].match);
                        }
                    }
                    var entropicHolderItem = Entropy.watch({ t: "" });

                    // rebuild the string
                    for (var z = 0; z < allTheWords.length; z++) {
                        entropicHolderItem.t += " ";
                        entropicHolderItem.t += allTheWords[z];
                    }

                    if (response[response.length - 1] == '?') { // remove trailing question marks
                        entropicHolderItem.t = entropicHolderItem.t.substring(0, entropicHolderItem.t.length - 1);
                    }

                    if (selectedResponse.isQuestion) { // if it's a question, add a question mark
                        entropicHolderItem.t += '?';
                    }
                    else {
                        entropicHolderItem.t += '.';
                    }

                    elizaText.innerHTML += entropicHolderItem.t;

                } // if .continues

                return true;// mark that we have output a response
            }
        }
    }
    return false;
}
