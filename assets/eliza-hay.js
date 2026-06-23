/* eliza-hay.js - Anthony Hay's faithful ELIZA engine (the DOCTOR script
   running as Weizenbaum's 1966 program would have). Vendored verbatim from
   https://anthay.github.io/eliza.html (engine only; DOM UI removed), which is
   released CC0 1.0 (public domain) by Anthony Hay and Max Hay. We add a
   structured tracer + window.ElizaHay.trace() at the end to drive the demo. */
(function () {


/*  Joseph Weizenbaum created ELIZA sixty years ago and described its
    operation in a paper published in the January 1966 edition of
    Communications of the Association of Computing Machinery.  This
    webpage is an attempt to recreate the experience of talking to ELIZA.
    We believe that the responses to user inputs are exactly the same
    as Weizenbaum's 1966 ELIZA running his DOCTOR script would have been.

    The Github repo for this code is https://github.com/anthay/ELIZA
    The website for the best book about ELIZA is https://inventingeliza.com/
    There is lots more about ELIZA at elizagen.org
*/


/*
    1.00 Anthony Hay        2025-03-08  Filter more punctuation; more script warnings
    0.97 Anthony Hay        2024-06-25  Be more forgiving of non-Hollerith characters
    0.96 Anthony Hay        2024-06-23  Add script syntax to *savedoc output
    0.95 Anthony Hay        2024-01-14  Add *full; fix font colour bug
    0.94 Max Hay            2024-01-04  Improve console focus gain
    0.93 Anthony Hay        2023-12-16  Recreate bug in SLIP YMATCH
    0.91 Anthony Hay        2023-11-21  Add *fontsize
    0.90 Anthony Hay        2023-11-17  Add *load, *tracepre, *maxtran, *clear
    0.00 Ant & Max Hay      2023-10-31  Initial version (with thanks to
                                        Mark C. Marino & ChatGPT4 for help
                                        with the initial conversion from C++)
*/
const VERSION = '1.00';


//////// //       //// ////////    ///    //        ///////   //////   ////  //////  
//       //        //       //    // //   //       //     // //    //   //  //    // 
//       //        //      //    //   //  //       //     // //         //  //       
//////   //        //     //    //     // //       //     // //   ////  //  //       
//       //        //    //     ///////// //       //     // //    //   //  //       
//       //        //   //      //     // //       //     // //    //   //  //    // 
//////// //////// //// //////// //     // ////////  ///////   //////   ////  //////  


const HOLLERITH_UNDEFINED = 0xFF; // (must be > 63)
const HOLLERITHENCODING_TABLE_SIZE = 256;

// This table maps ordinary character code units to their Hollerith
// encoding, or HOLLERITH_UNDEFINED if that character does not exist
// in the Hollerith character set.
const hollerithEncoding = (() => {
    // Define the static BCD array
    const bcd = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 0, '=', '\'', 0, 0, 0,
        '+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 0, '.', ')',  0, 0, 0,
        '-', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 0, '$', '*',  0, 0, 0,
        ' ', '/', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 0, ',', '(',  0, 0, 0
    ];

    let toBcd = Array(HOLLERITHENCODING_TABLE_SIZE).fill(HOLLERITH_UNDEFINED);
    for (let c = 0; c < 64; c++) {
        if (bcd[c]) {
            toBcd[bcd[c].charCodeAt(0)] = c;
        }
    }
    return toBcd;
})();

// Return true iff given u8 is in the Hollerith character set
function hollerithDefined(u8) {
    console.assert(typeof(u8) === "number");
    if (u8 >= HOLLERITHENCODING_TABLE_SIZE)
        return false;
    return hollerithEncoding[u8] !== HOLLERITH_UNDEFINED;
}


function utf32ArrayFromString(s) {
    console.assert(typeof(s) === "string");
    let result = [];
    for (let i = 0; i < s.length; ) {
        const u = s.charCodeAt(i++);
        if (u < 0xd800)
            result.push(u);
        else if (u > 0xdfff)
            result.push(u);
        else {
            console.assert(i < s.length);
            const v = s.charCodeAt(i++);
            result.push(0x10000 + (u - 0xd800) * 0x400 + (v - 0xdc00));
        }
    }
    return result;
}

function utf8ArrayFromString(s) {
    const encoder = new TextEncoder();
    const utf8Array = encoder.encode(s);
    return Array.from(utf8Array);
}


// return given string uppercased and with certain punctuation filtered
function elizaUppercase(s) {
    let result = "";
    const nonBcdReplacementChar = '-';
    const utf32 = utf32ArrayFromString(s);
    for (let c32 of utf32) {
        switch (c32) {
        case 0x2019:        // 'RIGHT SINGLE QUOTATION MARK' (U+2019)
            result += '\''; //   => 'APOSTROPHE' (U+0027)
            break;          // [hoping I’m will become I'M, for example]

        case 0x2018:        // 'LEFT SINGLE QUOTATION MARK' (U+2018)
        case 0x0060:        // 'GRAVE ACCENT' (U+0060) [backtick]
        case 0x0022:        // 'QUOTATION MARK' (U+0022)
        case 0x00AB:        // 'LEFT-POINTING DOUBLE ANGLE QUOTATION MARK' (U+00AB)
        case 0x00BB:        // 'RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK' (U+00BB)
        case 0x201A:        // 'SINGLE LOW-9 QUOTATION MARK' (U+201A)
        case 0x201B:        // 'SINGLE HIGH-REVERSED-9 QUOTATION MARK' (U+201B)
        case 0x201C:        // 'LEFT DOUBLE QUOTATION MARK' (U+201C)
        case 0x201D:        // 'RIGHT DOUBLE QUOTATION MARK' (U+201D)
        case 0x201E:        // 'DOUBLE LOW-9 QUOTATION MARK' (U+201E)
        case 0x201F:        // 'DOUBLE HIGH-REVERSED-9 QUOTATION MARK' (U+201F)
        case 0x2039:        // 'SINGLE LEFT-POINTING ANGLE QUOTATION MARK' (U+2039)
        case 0x203A:        // 'SINGLE RIGHT-POINTING ANGLE QUOTATION MARK' (U+203A)
            result += ' ';  //   => 'SPACE' (U+0020)
            break;

        case 0x0021:        // 'EXCLAMATION MARK' (U+0021)
        case 0x003F:        // 'QUESTION MARK' (U+003F)
            result += '.';  //   => 'FULL STOP' (U+002E)
            break;

        case 0x00A1:        // 'INVERTED EXCLAMATION MARK' (U+00A1)
        case 0x00BF:        // 'INVERTED QUESTION MARK' (U+00BF)
            result += ' ';  //   => 'SPACE' (U+0020)
            break;

        case 0x003A:        // 'COLON' (U+003A)
        case 0x003B:        // 'SEMICOLON' (U+003B)
        case 0x2013:        // 'EN DASH' (U+2013)
        case 0x2014:        // 'EM DASH' (U+2014)
            result += ',';  //   => 'COMMA' (U+002C)
            break;

        default:
            result += String.fromCodePoint(c32).toUpperCase();
            break;
        }
    }
    return result;
}


// Return true iff given c is delimiter (see delimiter())
function delimiterCharacter(c) {
    return c === ',' || c === '.';
}


// Return true iff given s is an ELIZA delimiter
function delimiter(s) {
    console.assert(typeof(s) === "string");
    return s === "BUT" || (s.length === 1 && delimiterCharacter(s[0]));
}


// Split given string s into a list of "words"; delimiters are words
// e.g. split("one   two, three.") -> ["one", "two", ",", "three", "."]
function split(s) {
    console.assert(typeof(s) === "string");
    let result = [];
    let word = "";
    for (let ch of s) {
        if (delimiterCharacter(ch) || ch === ' ') {
            if (word) {
                result.push(word);
                word = "";
            }
            if (ch !== ' ') {
                result.push(ch);
            }
        } else {
            word += ch;
        }
    }
    if (word) {
        result.push(word);
    }
    return result;
}


// Join given words into one space separated string
// e.g. join(["one", "two", "", "3"]) -> "one two 3"
function join(words) {
    console.assert(Array.isArray(words));
    return words.filter(str => str.trim() !== "").join(" ");
}


// Return numeric value of given s or -1, e.g. toInt("2") -> 2, toInt("two") -> -1
function toInt(s) {
    console.assert(typeof(s) === "string");
    let result = 0;
    for (let c of s) {
        if (!isNaN(c)) { // Check if character is a digit
            result = 10 * result + parseInt(c);
        } else {
            return -1;
        }
    }
    return result;
}


// e.g. inlist("DEPRESSED", "(*SAD HAPPY DEPRESSED)") -> true
// e.g. inlist("FATHER", "(/FAMILY)") -> true (assuming tags("FAMILY") -> "... FATHER ...")
function inlist(word, wordlist, tags) {
    console.assert(typeof(word) === "string");
    console.assert(typeof(wordlist) === "string");
    console.assert(tags instanceof Map);
    if (wordlist.endsWith(')')) {
        wordlist = wordlist.slice(0, -1);
    }
    if (wordlist.startsWith('(')) {
        wordlist = wordlist.substring(1);
    }
    wordlist = wordlist.trim();

    if (wordlist.startsWith('*')) { // (*SAD HAPPY DEPRESSED)
        // without bug:
        //return wordlist.substring(1).trim().split(' ').includes(word);

        // to recreate bug apparently in original SLIP YMATCH:
        const t = wordlist.substring(1).trim().split(' ');
        const word6 = word.substring(0, 6);
        for (const w of t) {
            for (let i = 0; i < w.length; i += 6) {
                if (w.substring(i, i + 6) === word6)
                    return true;
            }
        }
        return false;
    }
    else if (wordlist.startsWith('/')) { // (/NOUN FAMILY)
        const t = wordlist.substring(1).trim().split(' ');
        for (const tag of t) {
            if (tags.has(tag)) {
                if (tags.get(tag).includes(word)) {
                    return true;
                }
            }
        }
    }

    return false;
}


/*  return true iff words match pattern; if they match, matchingComponents
    are the actual matched words, one for each element of pattern

    e.g. match(tags, [0, YOU, (* WANT NEED), 0], [YOU, NEED, NICE, FOOD], mc) -> true
      with mc = [<empty>, YOU, NEED, NICE FOOD]

    Note that grouped words in pattern, such as (* WANT NEED), must be presented
    as a single stringlist entry. */
function match(tags, p, w) {
    let pattern = p.slice();
    let words = w.slice();

    let matchingComponents = [];
    if (pattern.length === 0) {
        return [words.length === 0, matchingComponents];
    }

    let patword = pattern.shift();
    let n = toInt(patword);

    if (n < 0) { // patword is e.g. "ARE" or "(*SAD HAPPY DEPRESSED)"
        if (words.length === 0) {
            return [false]; // patword cannot match nothing
        }
        let currentWord = words.shift();
        if (patword.startsWith('(')) {
            // patword is a group, is currentWord in that group?
            if (!inlist(currentWord, patword, tags)) {
                return [false]; // patword cannot match nothing
            }
        } else if (patword !== currentWord) {
            return [false]; // patword is a single word and it doesn't match
        }

        // so far so good; can we match remainder of pattern with remainder of words?
        let [success, mc] = match(tags, pattern, words);
        if (success) {
            matchingComponents.push(currentWord);
            matchingComponents.push(...mc);
            return [true, matchingComponents];
        }
    } else if (n === 0) { // 0 matches zero or more of any words
        let component = [];
        let mc;
        while (true) {
            [success, mc] = match(tags, pattern, words);
            if (success) {
                matchingComponents.push(join(component));
                matchingComponents.push(...mc);
                return [true, matchingComponents];
            }
            if (words.length === 0) {
                return [false];
            }
            component.push(words.shift());
        }
    } else { // match exactly n of any words [page 38 (a)]
        if (words.length < n) {
            return [false];
        }
        let component = [];
        for (let i = 0; i < n; i++) {
            component.push(words.shift());
        }
        let [success, mc] = match(tags, pattern, words);
        if (success) {
            matchingComponents.push(join(component));
            matchingComponents.push(...mc);
            return [true, matchingComponents];
        }
    }
    return [false];
}


// return words constructed from given reassemblyRule and components
// e.g. reassemble([ARE, YOU, 1], [MAD, ABOUT YOU]) -> [ARE, YOU, MAD]
function reassemble(reassemblyRule, components) {
    console.assert(Array.isArray(reassemblyRule));
    console.assert(Array.isArray(components));
    let result = [];
    for (let r of reassemblyRule) {
        let n = toInt(r);
        if (n < 0) {
            result.push(r);
        } else if (n === 0 || n > components.length) {
            // index out of range should never happen because indexes
            // are checked when the script is processed
            result.push("HMMM");
        } else {
            let expanded = split(components[n - 1]);
            result = result.concat(expanded);
        }
    }
    return result;
}


function reassemblyIndexesValid(decompositionRule, reassemblyRule) {
    console.assert(Array.isArray(decompositionRule));
    console.assert(Array.isArray(reassemblyRule));
    let indexOutOfRangeMsg = '';
    const lastDisassemblyPartIndex = decompositionRule.length;

    for (const r of reassemblyRule) {
        let n = toInt(r);
        if (n < 0) {
            continue; // it's not an index
        }
        if (n === 0 || n > lastDisassemblyPartIndex) {
            indexOutOfRangeMsg = `reassembly index '${n}' out of range [1..${lastDisassemblyPartIndex}]`;
            return [false, indexOutOfRangeMsg];
        }
    }

    return [true, ''];
}


// recreate the SLIP HASH function: return an n-bit hash value for
// the given 36-bit datum d, for values of n in range 0..15
function hash(d, n) {
    console.assert(0 <= n && n <= 15)

    d &= BigInt("0x7FFFFFFFF");
    d *= d;
    d >>= 35n - BigInt(Math.floor(n / 2));
    return Number(d & (BigInt(1) << BigInt(n)) - 1n);
}


// return the 36-bit Hollerith encoding of the word str, appropriately
// space padded, or the last chunk of the word if over 6 characters long
function lastChunkAsBcd(str) {
    let result = BigInt(0);

    const append = (u8) => {
        result <<= BigInt(6);
        if (hollerithDefined(u8))
            result |= BigInt(hollerithEncoding[u8]);
        else
            result |= BigInt(u8) & BigInt(0x3F);
    };

    let count = 0;
    if (str) {
        const s = utf8ArrayFromString(str);
        for (let c of s.slice(Math.floor((s.length - 1) / 6) * 6)) {
            append(c);
            count++;
        }
    }
    while (count++ < 6) {
        append(0x20); // space pad to six characters
    }

    return result;
}



const SPECIAL_RULE_NONE = "zNONE";

const ACTION_INAPPLICABLE = 0; // no transformation could be performed
const ACTION_COMPLETE     = 1; // transformation of input is complete
const ACTION_NEWKEY       = 2; // request caller try next keyword in keystack
const ACTION_LINKKEY      = 3; // request caller try returned keyword

const TRACE_PREFIX = ' | ';


// decomposition and associated reassembly rules
class Transform {
    constructor(decomposition = [], reassemblyRules = []) {
        this.decomposition = decomposition;
        this.reassemblyRules = reassemblyRules;
        this.nextReassemblyRule = 0;
    }
};


class RuleKeyword {
    constructor(keyword = "", wordSubstitution = "", precedence = 0, tags = [], linkKeyword = "") {
        this.keyword = keyword;
        this.wordSubstitution = wordSubstitution;
        this.precedence = precedence;
        this.tags = tags;
        this.linkKeyword = linkKeyword;
        this.transforms = [];
        this.trace = '';
    }
    setKeyword(keyword) {
        this.keyword = keyword;
    }
    addTransformationRule(decomposition, reassemblyRules) {
        this.transforms.push(new Transform(decomposition, reassemblyRules));
    }
    getPrecedence() {
        return this.precedence;
    }
    getKeyword() {
        return this.keyword;
    }
    applyWordSubstitution(word) {
        if (!this.wordSubstitution || word !== this.keyword)
            return word;
        return this.wordSubstitution;
    }
    dlistTags() {
        return this.tags;
    }
    hasTransformation() {
        return this.transforms.length > 0 || !!this.linkKeyword;
    }
    applyTransformation(words, tags) {
        this.trace =
            TRACE_PREFIX + 'selected keyword: ' + this.keyword + '\n' +
            TRACE_PREFIX + 'input: ' + join(words) + '\n';
        let constituents = [];

        let r = 0;
        while (r < this.transforms.length) {
            [success, constituents] = match(tags, this.transforms[r].decomposition, words);
            if (success)
                break;
            r++;
        }

        if (r === this.transforms.length) {
            if (this.linkKeyword.length === 0) {
                this.trace += TRACE_PREFIX + 'ill-formed script? No decomposition rule matches\n';
                return [ACTION_INAPPLICABLE]; // [page 39 (f)] should not happen?
            }

            this.trace += TRACE_PREFIX + 'reference to equivalence class: ' + this.linkKeyword + '\n';
            return [ACTION_LINKKEY, words, this.linkKeyword];
        }

        let rule = this.transforms[r];
        const reassemblyRule = rule.reassemblyRules[rule.nextReassemblyRule];

        this.trace += TRACE_PREFIX + 'matching decompose pattern: (' + join(rule.decomposition) + ')\n';
        this.trace += TRACE_PREFIX + 'decomposition parts: ';
        for (let id = 0; id < constituents.length; ++id) {
            if (id)
                this.trace += ', ';
            this.trace += (id + 1) + ':"' + constituents[id] + '"';
        }
        this.trace += '\n';
        this.trace += TRACE_PREFIX + 'selected reassemble rule: (' + join(reassemblyRule) + ')\n';

        rule.nextReassemblyRule++;
        if (rule.nextReassemblyRule === rule.reassemblyRules.length) {
            rule.nextReassemblyRule = 0;
        }

        if (reassemblyRule.length === 1 && reassemblyRule[0] === "NEWKEY") {
            return [ACTION_NEWKEY];
        }

        if (reassemblyRule.length === 2 && reassemblyRule[0] === '=') {
            return [ACTION_LINKKEY, words, reassemblyRule[1]];
        }

        // is it the special-case reassembly rule '( PRE ( reassembly ) ( =reference ) )'
        // (note: this is the only reassemblyRule that is still in a list)
        if (reassemblyRule.length !== 0 && reassemblyRule[0] === "(") {
            console.assert(reassemblyRule[1] === "PRE");
            console.assert(reassemblyRule[2] === "(");
            let reassembly = [];
            let i = 3;
            while (reassemblyRule[i] !== ")") {
                reassembly.push(reassemblyRule[i++]);
            }
            i += 3; // skip ')', '(' and '='
            let link = reassemblyRule[i];
            words = reassemble(reassembly, constituents);
            return [ACTION_LINKKEY, words, link];
        }

        words = reassemble(reassemblyRule, constituents);
        return [ACTION_COMPLETE, words];
    }
    toString() {
        let sexp = "(";
        sexp += (this.keyword === SPECIAL_RULE_NONE) ? "NONE" : this.keyword;

        if (this.wordSubstitution !== "") {
            sexp += " = " + this.wordSubstitution;
        }

        if (this.tags.length > 0) {
            sexp += " DLIST(/" + join(this.tags) + ")";
        }

        if (this.precedence > 0) {
            sexp += " " + this.precedence;
        }

        for (const k of this.transforms) {
            sexp += "\n    ((" + join(k.decomposition) + ")";
            for (const r of k.reassemblyRules) {
                if (r.length !== 0 && r[0] == "(")
                    sexp += "\n        " + join(r); // it's a PRE rule
                else
                    sexp += "\n        (" + join(r) + ")";
            }
            sexp += ")";
        }

        if (this.linkKeyword) {
            sexp += "\n    (=" + this.linkKeyword + ")";
        }

        sexp += ")\n";
        return sexp;
    }
    traceText() {
        return this.trace;
    }
}


class RuleMemory {
    constructor(keyword = "") {
        this.keyword = keyword;
        this.transforms = [];
        this.memories = [];
        this.trace = '';
    }
    setKeyword(keyword) {
        this.keyword = keyword;
    }
    addTransformationRule(decomposition, reassemblyRules) {
        this.transforms.push(new Transform(decomposition, reassemblyRules));
    }
    empty() {
        return !this.keyword || this.transforms.length === 0;
    }
    createMemory(keyword, words, tags) {
        if (keyword !== this.keyword || words.length === 0) {
            return;
        }

        // JW says rules are selected at random [page 41 (f)]
        // But the ELIZA code shows that rules are actually selected via a HASH
        // function on the last word of the user's input text.
        console.assert(this.transforms.length === 4);
        let transformation = this.transforms[hash(lastChunkAsBcd(words[words.length - 1]), 2)];
        const [success, constituents] = match(tags, transformation.decomposition, words);
        if (!success) {
            this.trace += TRACE_PREFIX;
            this.trace += "cannot form new memory: decomposition pattern (";
            this.trace += join(transformation.decomposition);
            this.trace += ") does not match user text\n";
            return;
        }
        const newMemory = join(reassemble(transformation.reassemblyRules[0], constituents));
        this.trace += TRACE_PREFIX + "new memory: " + newMemory + '\n';
        this.memories.push(newMemory);
    }
    memoryExists() {
        return this.memories.length > 0;
    }
    recallMemory() {
        return this.memories.length ? this.memories.shift() : "";
    }
    toString() {
        let sexp = "(MEMORY ";
        sexp += this.keyword;
        for (const k of this.transforms) {
            sexp += "\n    (" + join(k.decomposition);
            sexp += " = " + join(k.reassemblyRules[0]) + ")";
        }
        sexp += ")\n";
        return sexp;
    }
    traceMemoryStack() {
        let s = '';
        if (this.memories.length === 0)
            s += TRACE_PREFIX + 'memory queue: &lt;empty&gt;\n';
        else {
            s += TRACE_PREFIX + 'memory queue:\n';
            for (const m of this.memories)
                s += TRACE_PREFIX + '  ' + m + '\n';
        }
        return s;
    }
    clearTrace() {
        this.trace = '';
    }
    traceText() {
        return this.trace;
    }
}


// collect all tags from any of the given rules that have them into a tagmap
function collectTags(rules) {
    let tags = new Map();
    for (const [key, value] of rules) {
        let keywordTags = value.tags;
        for (const t of keywordTags) {
            if (!tags.has(t))
                tags.set(t, []);
            tags.get(t).push(key);
        }
    }
    return tags;
}


class nullTracer {
    beginResponse(words) {}
    limit(n, builtInMsg) {}
    discardSubclause(words) {}
    wordSubstitution(word, substitute) {}
    subclauseComplete(subclause, keystack, rules) {}
    memoryStack(t) {}
    createMemory(t) {}
    usingMemory(s) {}
    preTransform(keyword, words) {}
    transform(t, s) {}
    unknownKey(keyword, useNomatchMessage) {}
    decompFailed(useNomatchMessage) {}
    newkeyFailed() {}
    usingNone(s) {}
    text() {
        return '';
    }
    script() {
        return '';
    }
}

class preTracer extends nullTracer {
    constructor (write) {
        super();
        this.print = write;
    }
    beginResponse(words) {}
    limit(n, builtInMsg) {}
    discardSubclause(words) {}
    wordSubstitution(word, substitute) {}
    subclauseComplete(subclause, keystack, rules) {}
    memoryStack(t) {}
    createMemory(t) {}
    usingMemory(s) {}
    preTransform(keyword, words) {
        this.print(join(words) + '   :' + keyword);
    }
    transform(t, s) {}
    unknownKey(keyword, useNomatchMessage) {}
    decompFailed(useNomatchMessage) {}
    newkeyFailed() {}
    usingNone(s) {}
    text() {
        return '';
    }
    script() {
        return '';
    }
}


class Tracer extends nullTracer {
    constructor() {
        super();
        this.txt = '';
        this.scrip = '';
        this.prefix = " | ";
        this.wordSubstitutions = '';
    }
    beginResponse(words) {
        this.txt = this.prefix + "input: " + join(words) + '\n';
        this.scrip = '';
        this.wordSubstitutions = '';
    }
    limit(n, builtInMsg) {
        this.txt += this.prefix + "LIMIT: " + n + ' (' + builtInMsg + ')\n';
    }
    discardSubclause(words) {
        this.txt += this.prefix + "word substitutions made: "
            + (this.wordSubstitutions.length === 0 ? '&lt;none&gt;' : this.wordSubstitutions) + '\n';
        this.txt += this.prefix + "no keywords found in subclause: " + join(words) + '\n';
        this.wordSubstitutions = '';
    }
    wordSubstitution(word, substitute) {
        if (substitute != word) {
            if (this.wordSubstitutions.length !== 0)
                this.wordSubstitutions += ', ';
            this.wordSubstitutions += word + '/' + substitute;
        }
    }
    subclauseComplete(subclause, keystack, rules) {
        this.txt += this.prefix + "word substitutions made: "
            + (this.wordSubstitutions.length === 0 ? '&lt;none&gt;' : this.wordSubstitutions) + '\n';
        if (keystack.length === 0) {
            if (subclause.length !== 0)
                this.txt += this.prefix + "no keywords found in subclause: "
                    + subclause + '\n'
        }
        else {
            this.txt += this.prefix + "found keywords in subclause: " + subclause + '\n';
            this.txt += this.prefix + "keyword(precedence) stack:";
            let comma = false;
            for (let keyword of keystack) {
                this.txt += (comma ? ', ' : ' ') + keyword + '(';
                if (rules.has(keyword)) {
                    let rule = rules.get(keyword);
                    if (rule.hasTransformation())
                        this.txt += rule.precedence;
                    else
                        this.txt += "&lt;internal error: no transform associated with this keyword&gt;";
                }
                else
                    this.txt += "&lt;internal error: unknown keyword&gt;";
                this.txt += ')';
                comma = true;
            }
            this.txt += '\n';
        }
    }
    memoryStack(t) {
        this.txt += t;
    }
    createMemory(t) {
        this.txt += t;
    }
    usingMemory(s) {
        this.txt += TRACE_PREFIX + 'LIMIT=4, (\"a certain counting mechanism is in a particular state\"),\n'
                  + TRACE_PREFIX + '  and there are unused memories, so the response is the oldest of these\n';
        this.scrip += s;
    }
    transform(t, s) {
        this.txt += t;
        this.scrip += s;
    }
    unknownKey(keyword, useNomatchMessage) {
        this.txt += TRACE_PREFIX + 'ill-formed script? "' + keyword + '" is not a keyword\n';
        if (useNomatchMessage)
            this.txt += TRACE_PREFIX + 'response is the built-in NOMACH[LIMIT] message\n';
    }
    decompFailed(useNomatchMessage) {
        this.txt += TRACE_PREFIX + 'ill-formed script? No decomposition rule matched input\n';
        if (useNomatchMessage)
            this.txt += TRACE_PREFIX + 'response is the built-in NOMACH[LIMIT] message\n';
    }
    newkeyFailed(responseSource) {
        this.txt += TRACE_PREFIX + 'keyword stack empty; response is a ' + responseSource + ' message\n';
    }
    usingNone(s) {
        this.txt += TRACE_PREFIX + 'response is the next remark from the NONE rule\n';
        this.scrip += s;
    }
    text() {
        return this.txt;
    }
    script() {
        return this.scrip;
    }
}



                //////// //       //// ////////    ///                    
                //       //        //       //    // //                   
                //       //        //      //    //   //                  
///////////     //////   //        //     //    //     //     /////////// 
                //       //        //    //     /////////                 
                //       //        //   //      //     //                 
                //////// //////// //// //////// //     //                 

function delay() {
    return new Promise((resolve, reject)=> {
        setTimeout(() => {
            resolve();
        }, 0);
    });
}

let globalInterruptElizaResponse = false;
class Eliza {
    constructor(rules, memoryRule, tracer, transformationLimit = 1000) {
        this.rules = rules;
        this.memoryRule = memoryRule;
        this.tracer = tracer;
        this.tags = collectTags(this.rules);
        this.limit = 1; // (this is Weizenbaum's "a certain counting mechanism")
        this.noMatchMessages = ["PLEASE CONTINUE", "HMMM", "GO ON , PLEASE", "I SEE"];
        this.transformationLimit = transformationLimit;
    }

    // return ELIZA's response to the given input string
    async response(input) {
        console.assert(typeof(input) === "string");
        let words = split(elizaUppercase(input));
        this.tracer.beginResponse(words);

        this.limit = (this.limit % 4) + 1;
        this.tracer.limit(this.limit, this.noMatchMessages[this.limit - 1]);

        let keystack = [];
        let topRank = 0;
        for (let i = 0; i < words.length; i++) {
            let word = words[i];

            if (delimiter(word)) {
                if (keystack.length === 0) {
                    this.tracer.discardSubclause(words.slice(0, i + 1));
                    words = words.slice(i + 1);
                    i = -1;
                    continue;
                } else {
                    words = words.slice(0, i);
                    break;
                }
            }

            if (this.rules.has(word)) {
                let rule = this.rules.get(word);
                if (rule.hasTransformation()) {
                    if (rule.precedence > topRank) {
                        keystack.unshift(word);
                        topRank = rule.precedence;
                    } else {
                        keystack.push(word);
                    }
                }
                let substitute = rule.applyWordSubstitution(word);
                this.tracer.wordSubstitution(word, substitute);
                words[i] = substitute;
            }
        }
        this.tracer.subclauseComplete(join(words), keystack, this.rules);

        this.memoryRule.clearTrace();
        this.tracer.memoryStack(this.memoryRule.traceMemoryStack());
        if (keystack.length === 0) {
            if (this.limit === 4 && this.memoryRule.memoryExists()) {
                this.tracer.usingMemory(this.memoryRule.toString());
                return this.memoryRule.recallMemory();
            }
        }

        let transformationCount = 0;
        globalInterruptElizaResponse = false;
        while (keystack.length > 0) {
            await delay();
            if (globalInterruptElizaResponse) {
                globalInterruptElizaResponse = false;
                return '--ELIZA response creation interrupted--';
            }
            const topKeyword = keystack.shift();
            this.tracer.preTransform(topKeyword, words);

            if (!this.rules.has(topKeyword)) {
                this.tracer.unknownKey(topKeyword, true);
                return this.noMatchMessages[this.limit - 1];
            }

            if (this.transformationLimit !== 0 && transformationCount++ > this.transformationLimit) {
                return `--transformation limit reached (*maxtran ${this.transformationLimit})--`;
            }

            const rule = this.rules.get(topKeyword);
            this.memoryRule.createMemory(topKeyword, words, this.tags);
            this.tracer.createMemory(this.memoryRule.traceText());

            const [ action, response, link ] = rule.applyTransformation(words, this.tags);
            this.tracer.transform(rule.traceText(), rule.toString());
            if (action === ACTION_COMPLETE) {
                return join(response);
            }

            if (action === ACTION_INAPPLICABLE) {
                this.tracer.decompFailed(true);
                return this.noMatchMessages[this.limit - 1];
            }

            if (action === ACTION_LINKKEY) {
                words = response;
                keystack.unshift(link);
            }
            else if (keystack.length === 0) {
                this.tracer.newkeyFailed('NONE');
                //return this.noMatchMessages[this.limit - 1]; TBD
                break;
            }
        }

        const noneRule = this.rules.get(SPECIAL_RULE_NONE);
        const [ action, response ] = noneRule.applyTransformation(words, this.tags);
        console.assert(action === ACTION_COMPLETE);
        this.tracer.usingNone(noneRule.toString());
        return join(response);
    }
}


 //////// //       //// ////////    ///     //////   //////  ////////  //// ////////  //////// 
 //       //        //       //    // //   //    // //    // //     //  //  //     //    //    
 //       //        //      //    //   //  //       //       //     //  //  //     //    //    
 //////   //        //     //    //     //  //////  //       ////////   //  ////////     //    
 //       //        //    //     /////////       // //       //   //    //  //           //    
 //       //        //   //      //     // //    // //    // //    //   //  //           //    
 //////// //////// //// //////// //     //  //////   //////  //     // //// //           //    


const CACM_1966_01_DOCTOR_SCRIPT = 
`;
; Joseph Weizenbaum's DOCTOR script for ELIZA
; Copyright (c) 1966 Association for Computing Machinery, Inc.
;
; This is a verbatim transcription of the script on page 44 of the
; January 1966 edition of Communications of the ACM, with the following
; caveats:
;
; a) Whitespace has been added to help reveal the structure of the script.
; b) In the CACM paper six lines were printed twice adjacent to each
;    other (with exactly 34 lines between each duplicate), making the
;    structure nonsensical. These duplicates have been commented out of
;    this transcription.
; c) There were no comments in the script in the CACM paper.
;

(HOW DO YOU DO.  PLEASE TELL ME YOUR PROBLEM)

START

(SORRY
    ((0)
        (PLEASE DON'T APOLIGIZE)
        (APOLOGIES ARE NOT NECESSARY)
        (WHAT FEELINGS DO YOU HAVE WHEN YOU APOLOGIZE)
        (I'VE TOLD YOU THAT APOLOGIES ARE NOT REQUIRED)))

(DONT = DON'T)
(CANT = CAN'T)
(WONT = WON'T)

(REMEMBER 5
    ((0 YOU REMEMBER 0)
         (DO YOU OFTEN THINK OF 4)
         (DOES THINKING OF 4 BRING ANYTHING ELSE TO MIND)
         (WHAT ELSE DO YOU REMEMBER)
         (WHY DO YOU REMEMBER 4 JUST NOW)
         (WHAT IN THE PRESENT SITUATION REMINDS YOU OF 4)
         (WHAT IS THE CONNECTION BETWEEN ME AND 4))
    ((0 DO I REMEMBER 0)
         (DID YOU THINK I WOULD FORGET 5)
         (WHY DO YOU THINK I SHOULD RECALL 5 NOW)
         (WHAT ABOUT 5)
         (=WHAT)
         (YOU MENTIONED 5))
    ((0)
         (NEWKEY)))

(IF 3
    ((0 IF 0)
        (DO YOU THINK ITS LIKELY THAT 3)
        (DO YOU WISH THAT 3)
        (WHAT DO YOU THINK ABOUT 3)
        (REALLY, 2 3)))
; duplicate line removed: (WHAT DO YOU THINK ABOUT 3) (REALLY, 2 3)))

(DREAMT 4
    ((0 YOU DREAMT 0)
        (REALLY, 4)
        (HAVE YOU EVER FANTASIED 4 WHILE YOU WERE AWAKE)
        (HAVE YOU DREAMT 4 BEFORE)
        (=DREAM)
        (NEWKEY)))

(DREAMED = DREAMT 4
    (=DREAMT))

(DREAM 3
    ((0)
        (WHAT DOES THAT DREAM SUGGEST TO YOU)
        (DO YOU DREAM OFTEN)
        (WHAT PERSONS APPEAR IN YOUR DREAMS)
        (DON'T YOU BELIEVE THAT DREAM HAS SOMETHING TO DO WITH YOUR PROBLEM)
        (NEWKEY)))

(DREAMS = DREAM 3
    (=DREAM))

(HOW
    (=WHAT))
(WHEN
    (=WHAT))
(ALIKE 10
    (=DIT))
(SAME 10
    (=DIT))
(CERTAINLY
    (=YES))

(FEEL DLIST(/BELIEF))
(THINK DLIST(/BELIEF))
(BELIEVE DLIST(/BELIEF))
(WISH DLIST(/BELIEF))

(MEMORY MY
    (0 YOUR 0 = LETS DISCUSS FURTHER WHY YOUR 3)
    (0 YOUR 0 = EARLIER YOU SAID YOUR 3)
    (0 YOUR 0 = BUT YOUR 3)
    (0 YOUR 0 = DOES THAT HAVE ANYTHING TO DO WITH THE FACT THAT YOUR 3))

(NONE
    ((0)
        (I AM NOT SURE I UNDERSTAND YOU FULLY)
        (PLEASE GO ON)
        (WHAT DOES THAT SUGGEST TO YOU)
        (DO YOU FEEL STRONGLY ABOUT DISCUSSING SUCH THINGS)))

(PERHAPS
    ((0)
        (YOU DON'T SEEM QUITE CERTAIN)
        (WHY THE UNCERTAIN TONE)
        (CAN'T YOU BE MORE POSITIVE)
        (YOU AREN'T SURE)
        (DON'T YOU KNOW)))

(MAYBE
    (=PERHAPS))

(NAME 15
    ((0)
        (I AM NOT INTERESTED IN NAMES)
        (I'VE TOLD YOU BEFORE, I DON'T CARE ABOUT NAMES - PLEASE CONTINUE)))
; duplicate line removed: PLEASE CONTINUE)) )

(DEUTSCH
    (=XFREMD))
(FRANCAIS
    (=XFREMD))
(ITALIANO
    (=XFREMD))
(ESPANOL
    (=XFREMD))

(XFREMD
    ((0)
        (I AM SORRY, I SPEAK ONLY ENGLISH)))

(HELLO
    ((0)
        (HOW DO YOU DO.  PLEASE STATE YOUR PROBLEM)))

(COMPUTER 50
    ((0)
        (DO COMPUTERS WORRY YOU)
        (WHY DO YOU MENTION COMPUTERS)
        (WHAT DO YOU THINK MACHINES HAVE TO DO WITH YOUR PROBLEM)
        (DON'T YOU THINK COMPUTERS CAN HELP PEOPLE)
        (WHAT ABOUT MACHINES WORRIES YOU)
        (WHAT DO YOU THINK ABOUT MACHINES)))

(MACHINE 50
    (=COMPUTER))
(MACHINES 50
    (=COMPUTER))
(COMPUTERS 50
    (=COMPUTER))

(AM = ARE
    ((0 ARE YOU 0)
        (DO YOU BELIEVE YOU ARE 4)
        (WOULD YOU WANT TO BE 4)
        (YOU WISH I WOULD TELL YOU YOU ARE 4)
        (WHAT WOULD IT MEAN IF YOU WERE 4)
        (=WHAT))
    ((0)
        (WHY DO YOU SAY 'AM')
        (I DON'T UNDERSTAND THAT)))

(ARE
    ((0 ARE I 0)
        (WHY ARE YOU INTERESTED IN WHETHER I AM 4 OR NOT)
        (WOULD YOU PREFER IF I WEREN'T 4)
        (PERHAPS I AM 4 IN YOUR FANTASIES)
        (DO YOU SOMETIMES THINK I AM 4)
        (=WHAT))
    ((0 ARE 0)
        (DID YOU THINK THEY MIGHT NOT BE 3)
        (WOULD YOU LIKE IT IF THEY WERE NOT 3)
        (WHAT IF THEY WERE NOT 3)
        (POSSIBLY THEY ARE 3)))

(YOUR = MY
    ((0 MY 0)
        (WHY ARE YOU CONCERNED OVER MY 3)
        (WHAT ABOUT YOUR OWN 3)
        (ARE YOU WORRIED ABOUT SOMEONE ELSES 3)
        (REALLY, MY 3)))

(WAS 2
    ((0 WAS YOU 0)
        (WHAT IF YOU WERE 4)
        (DO YOU THINK YOU WERE 4)
        (WERE YOU 4)
        (WHAT WOULD IT MEAN IF YOU WERE 4)
        (WHAT DOES ' 4 ' SUGGEST TO YOU)
        (=WHAT))
    ((0 YOU WAS 0)
        (WERE YOU REALLY)
        (WHY DO YOU TELL ME YOU WERE 4 NOW)
; duplicate line removed: (WERE YOU REALLY) (WHY DO YOU TELL ME YOU WERE 4 NOW)
        (PERHAPS I ALREADY KNEW YOU WERE 4))
    ((0 WAS I 0)
        (WOULD YOU LIKE TO BELIEVE I WAS 4)
        (WHAT SUGGESTS THAT I WAS 4)
        (WHAT DO YOU THINK)
        (PERHAPS I WAS 4)
        (WHAT IF I HAD BEEN 4))
    ((0)
        (NEWKEY)))

(WERE = WAS
    (=WAS))
(ME = YOU)

(YOU'RE = I'M
    ((0 I'M 0)
        (PRE (I ARE 3) (=YOU))))

(I'M = YOU'RE
    ((0 YOU'RE 0)
        (PRE (YOU ARE 3) (=I))))

(MYSELF = YOURSELF)
(YOURSELF = MYSELF)

(MOTHER DLIST(/NOUN FAMILY))
(MOM = MOTHER DLIST(/ FAMILY))
(DAD = FATHER DLIST(/ FAMILY))
(FATHER DLIST(/NOUN FAMILY))
(SISTER DLIST(/FAMILY))
(BROTHER DLIST(/FAMILY))
(WIFE DLIST(/FAMILY))
(CHILDREN DLIST(/FAMILY))

(I = YOU
    ((0 YOU (* WANT NEED) 0)
        (WHAT WOULD IT MEAN TO YOU IF YOU GOT 4)
        (WHY DO YOU WANT 4)
        (SUPPOSE YOU GOT 4 SOON)
        (WHAT IF YOU NEVER GOT 4)
        (WHAT WOULD GETTING 4 MEAN TO YOU)
        (WHAT DOES WANTING 4 HAVE TO DO WITH THIS DISCUSSION))
    ((0 YOU ARE 0 (*SAD UNHAPPY DEPRESSED SICK ) 0)
        (I AM SORRY TO HEAR YOU ARE 5)
        (DO YOU THINK COMING HERE WILL HELP YOU NOT TO BE 5)
        (I'M SURE ITS NOT PLEASANT TO BE 5)
        (CAN YOU EXPLAIN WHAT MADE YOU 5))
    ((0 YOU ARE 0 (*HAPPY ELATED GLAD BETTER) 0)
        (HOW HAVE I HELPED YOU TO BE 5)
        (HAS YOUR TREATMENT MADE YOU 5)
        (WHAT MAKES YOU 5 JUST NOW)
        (CAN YOU EXPLAIN WHY YOU ARE SUDDENLY 5))
    ((0 YOU WAS 0)
        (=WAS))
; duplicate line removed: ((0 YOU WAS 0) (=WAS))
    ((0 YOU (/BELIEF) YOU 0)
        (DO YOU REALLY THINK SO)
        (BUT YOU ARE NOT SURE YOU 5)
        (DO YOU REALLY DOUBT YOU 5))
    ((0 YOU 0 (/BELIEF) 0 I 0)
        (=YOU))
    ((0 YOU ARE 0)
        (IS IT BECAUSE YOU ARE 4 THAT YOU CAME TO ME)
        (HOW LONG HAVE YOU BEEN 4)
        (DO YOU BELIEVE IT NORMAL TO BE 4)
        (DO YOU ENJOY BEING 4))
    ((0 YOU (* CAN'T CANNOT) 0)
        (HOW DO YOU KNOW YOU CAN'T 4)
        (HAVE YOU TRIED)
        (PERHAPS YOU COULD 4 NOW)
        (DO YOU REALLY WANT TO BE ABLE TO 4))
    ((0 YOU DON'T 0)
        (DON'T YOU REALLY 4)
        (WHY DON'T YOU 4)
        (DO YOU WISH TO BE ABLE TO 4)
        (DOES THAT TROUBLE YOU))
    ((0 YOU FEEL 0)
        (TELL ME MORE ABOUT SUCH FEELINGS)
        (DO YOU OFTEN FEEL 4)
        (DO YOU ENJOY FEELING 4)
        (OF WHAT DOES FEELING 4 REMIND YOU))
    ((0 YOU 0 I 0)
        (PERHAPS IN YOUR FANTASY WE 3 EACH OTHER)
        (DO YOU WISH TO 3 ME)
        (YOU SEEM TO NEED TO 3 ME)
        (DO YOU 3 ANYONE ELSE))
    ((0)
        (YOU SAY 1)
        (CAN YOU ELABORATE ON THAT)
        (DO YOU SAY 1 FOR SOME SPECIAL REASON)
        (THAT'S QUITE INTERESTING)))

(YOU = I
    ((0 I REMIND YOU OF 0)
        (= DIT))
    ((0 I ARE 0)
        (WHAT MAKES YOU THINK I AM 4)
        (DOES IT PLEASE YOU TO BELIEVE I AM 4)
        (DO YOU SOMETIMES WISH YOU WERE 4)
        (PERHAPS YOU WOULD LIKE TO BE 4))
    ((0 I 0 YOU)
        (WHY DO YOU THINK I 3 YOU)
        (YOU LIKE TO THINK I 3 YOU - DON'T YOU)
        (WHAT MAKES YOU THINK I 3 YOU)
        (REALLY, I 3 YOU)
        (DO YOU WISH TO BELIEVE I 3 YOU)
; duplicate line removed: (REALLY, I 3 YOU) (DO YOU WISH TO BELIEVE I 3 YOU)
        (SUPPOSE I DID 3 YOU - WHAT WOULD THAT MEAN)
        (DOES SOMEONE ELSE BELIEVE I 3 YOU))
    ((0 I 0)
        (WE WERE DISCUSSING YOU - NOT ME)
        (OH, I 3)
        (YOU'RE NOT REALLY TALKING ABOUT ME - ARE YOU)
        (WHAT ARE YOUR FEELINGS NOW)))

(YES
    ((0)
        (YOU SEEM QUITE POSITIVE)
        (YOU ARE SURE)
        (I SEE)
        (I UNDERSTAND)))

(NO
    ((0)
        (ARE YOU SAYING 'NO' JUST TO BE NEGATIVE)
        (YOU ARE BEING A BIT NEGATIVE)
        (WHY NOT)
        (WHY 'NO')))

(MY = YOUR 2
    ((0 YOUR 0 (/FAMILY) 0)
        (TELL ME MORE ABOUT YOUR FAMILY)
        (WHO ELSE IN YOUR FAMILY 5)
        (YOUR 4)
        (WHAT ELSE COMES TO MIND WHEN YOU THINK OF YOUR 4))
    ((0 YOUR 0)
        (YOUR 3)
        (WHY DO YOU SAY YOUR 3)
        (DOES THAT SUGGEST ANYTHING ELSE WHICH BELONGS TO YOU)
        (IS IT IMPORTANT TO YOU THAT 2 3)))

(CAN
    ((0 CAN I 0)
        (YOU BELIEVE I CAN 4 DON'T YOU)
        (=WHAT)
        (YOU WANT ME TO BE ABLE TO 4)
        (PERHAPS YOU WOULD LIKE TO BE ABLE TO 4 YOURSELF))
    ((0 CAN YOU 0)
        (WHETHER OR NOT YOU CAN 4 DEPENDS ON YOU MORE THAN ON ME)
        (DO YOU WANT TO BE ABLE TO 4)
        (PERHAPS YOU DON'T WANT TO 4)
        (=WHAT)))

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

(BECAUSE
    ((0)
        (IS THAT THE REAL REASON)
        (DON'T ANY OTHER REASONS COME TO MIND)
        (DOES THAT REASON SEEM TO EXPLAIN ANYTHING ELSE)
        (WHAT OTHER REASONS MIGHT THERE BE)))

(WHY
    ((0 WHY DON'T I 0)
        (DO YOU BELIEVE I DON'T 5)
        (PERHAPS I WILL 5 IN GOOD TIME)
        (SHOULD YOU 5 YOURSELF)
        (YOU WANT ME TO 5)
        (=WHAT))
; duplicate line removed: (=WHAT))
    ((0 WHY CAN'T YOU 0)
        (DO YOU THINK YOU SHOULD BE ABLE TO 5)
        (DO YOU WANT TO BE ABLE TO 5)
        (DO YOU BELIEVE THIS WILL HELP YOU TO 5)
        (HAVE YOU ANY IDEA WHY YOU CAN'T 5)
        (=WHAT))
    (=WHAT))

(EVERYONE 2
    ((0 (* EVERYONE EVERYBODY NOBODY NOONE) 0)
        (REALLY, 2)
        (SURELY NOT 2)
        (CAN YOU THINK OF ANYONE IN PARTICULAR)
        (WHO, FOR EXAMPLE)
        (YOU ARE THINKING OF A VERY SPECIAL PERSON)
        (WHO, MAY I ASK)
        (SOMEONE SPECIAL PERHAPS)
        (YOU HAVE A PARTICULAR PERSON IN MIND, DON'T YOU)
        (WHO DO YOU THINK YOU'RE TALKING ABOUT)))

(EVERYBODY 2
    (= EVERYONE))
(NOBODY 2
    (= EVERYONE))
(NOONE 2
    (= EVERYONE))

(ALWAYS 1
    ((0)
        (CAN YOU THINK OF A SPECIFIC EXAMPLE)
        (WHEN)
        (WHAT INCIDENT ARE YOU THINKING OF)
        (REALLY, ALWAYS)))

(LIKE 10
    ((0 (*AM IS ARE WAS) 0 LIKE 0)
        (=DIT))
    ((0)
        (NEWKEY)))

(DIT
    ((0)
        (IN WHAT WAY)
        (WHAT RESEMBLANCE DO YOU SEE)
        (WHAT DOES THAT SIMILARITY SUGGEST TO YOU)
        (WHAT OTHER CONNECTIONS DO YOU SEE)
        (WHAT DO YOU SUPPOSE THAT RESEMBLANCE MEANS)
        (WHAT IS THE CONNECTION, DO YOU SUPPOSE)
        (COULD THERE REALLY BE SOME CONNECTION)
        (HOW)))

()

; --- End of ELIZA script ---


; The ELIZA script syntax:
;
; eliza_script        : opening_remarks ['START'] rules ['(' ')']             ;
; opening_remarks     : '(' {word | punctuation} ')'                          ;
; rules               : keyword_rule {keyword_rule} memory_rule none_rule     ;
;
; keyword_rule        : '(' keyword rule ')'                                  ;
; keyword             : word                                                  ;
; rule                : '=' substitute_word
;                     | 'DLIST' tags
;                     | ['=' substitute_word]
;                         ['DLIST' tags]
;                         [precedence]
;                         reference
;                     | ['=' substitute_word]
;                         ['DLIST' tags]
;                         [precedence]
;                         transformation {transformation}
;                         [reference]                                         ;
;
; memory_rule         : '(' 'MEMORY' keyword
;                         '(' decompose_terms '=' reassemble_terms ')'
;                         '(' decompose_terms '=' reassemble_terms ')'
;                         '(' decompose_terms '=' reassemble_terms ')'
;                         '(' decompose_terms '=' reassemble_terms ')' ')'    ;
;
; none_rule           : '(' 'NONE' '(' '(' '0' ')'
;                         reassemble_pattern {reassemble_pattern} ')' ')'     ;
;
; substitute_word     : word                                                  ;
; precedence          : integer                                               ;
; reference           : '(' '=' keyword ')'                                   ;
;
; transformation      : '(' decompose_pattern
;                         reassemble_rule {reassemble_rule} ')'               ;
; decompose_pattern   : '(' decompose_terms ')'                               ;
; decompose_terms     : decompose_term {decompose_term}                       ;
; decompose_term      : word | match_count | tags | any_of                    ;
; match_count         : integer                                               ;
; tags                : '(' '/' word {word} ')'                               ;
; any_of              : '(' '*' word {word} ')'                               ;
;
; reassemble_rule     : reassemble_pattern
;                     | reference
;                     | newkey
;                     | pre_transform_ref                                     ;
;
; reassemble_pattern  : '(' reassemble_terms ')'                              ;
; reassemble_terms    : reassemble_term {reassemble_term}                     ;
; reassemble_term     : word | punctuation | match_index                      ;
; match_index         : integer                                               ;
; newkey              : '(' 'NEWKEY' ')'                                      ;
; pre_transform_ref   : '(' 'PRE' reassemble_pattern reference ')'            ;
;
; word                : word_char {word_char}                                 ;
; word_char           : 'A'-'Z' | '-' | ''' (i.e. a single quote)             ;
; punctuation         : ',' | '.'                                             ;
; integer             : digit {digit}                                         ;
; digit               : '0'-'9'                                               ;

; (See https://github.com/anthay/ELIZA for details of this implementation.)
`;


class Script {
    constructor() {
        // ELIZA's opening remarks e.g. "HOW DO YOU DO.  PLEASE TELL ME YOUR PROBLEM"
        this.helloMessage = [];

        // maps keywords -> transformation rules
        this.rules = new Map();

        // the one and only special case MEMORY rule
        this.memoryRule = new RuleMemory();
    }
};


function scriptToString(s) {
    let txt = "(" + join(s.helloMessage) + ")\n";
    const rules = new Map([...s.rules.entries()].sort());
    for (const [key, value] of rules) {
        txt += value.toString();
    }
    txt += s.memoryRule.toString();
    return txt;
}


class Token {
    constructor(t = 'eof', value = '') {
        this.t = t;
        this.value = value;
    }
    symbol(v) {
        if (v) {
            return this.t === 'symbol' && this.value === v;
        }
        return this.t === 'symbol';
    }
    number() {
        return this.t === 'number';
    }
    open() {
        return this.t === 'open_bracket';
    }
    close() {
        return this.t === 'close_bracket';
    }
    eof() {
        return this.t === 'eof';
    }
    equals(rhs) {
        return this.t === rhs.t && this.value === rhs.value;
    }
}

class Tokenizer {
    constructor(scriptText) {
        this.scriptText = scriptText;
        this.script = new Script;
        this.t = new Token();
        this.got_token = false;
        this.buf = [];
        this.bufptr = 0;
        this.line_number = 1;
    }
    peektok() {
        if (this.got_token) {
            return this.t;
        }
        this.got_token = true;
        return this.t = this.readtok();
    }
    nexttok() {
        if (this.got_token) {
            this.got_token = false;
            return this.t;
        }
        return this.readtok();
    }
    readtok() {
        let ch = '';
        for (;;) {
            do { // skip whitespace
                if (this.eof())
                    return new Token('eof');
                ch = this.nextch();
                if (this.is_newline(ch))
                    this.consume_newline(ch);
            } while (this.is_whitespace(ch));
            if (ch != ';')
                break;
            do { // skip comment
                if (this.eof())
                    return new Token('eof');
                ch = this.nextch();
            } while (!this.is_newline(ch));
            this.consume_newline(ch);
        }

        if (ch == '(')
            return new Token('open_bracket');

        if (ch == ')')
            return new Token('close_bracket');

        if (ch == '=')
            return new Token('symbol', '=');

        if (this.is_digit(ch)) {
            let t = new Token('number');
            t.value += ch;
            while (!this.eof()) {
                ch = this.peekch();
                if (!this.is_digit(ch)) {
                    break;
                }
                t.value += ch;
                this.nextch();
            }
            return t;
        }

        // anything else is a symbol
        let t = new Token('symbol');
        t.value += ch;
        while (!this.eof()) {
            ch = this.peekch();
            if (this.non_symbol(ch) || ch === '=') {
                break;
            }
            t.value += ch;
            ch = this.nextch();
        }
        t.value = elizaUppercase(t.value);
        return t;
    }
    eof() {
        return this.bufptr === this.scriptText.length;
    }
    nextch() {
        console.assert(!this.eof());
        return this.scriptText[this.bufptr++];
    }
    peekch() {
        console.assert(!this.eof());
        return this.scriptText[this.bufptr];
    }
    is_whitespace(ch) {
        return ch <= ' ' || ch == '\x7F';
        // this must hold: is_newline(ch) implies is_whitespace(ch)
    }
    is_newline(ch) {
        return ch === '\x0A'     // LF
            || ch === '\x0B'     // VT
            || ch === '\x0C'     // FF
            || ch === '\x0D';    // CR
    }
    consume_newline(ch) {
        if (ch === '\x0D' && !this.eof() && this.peekch(ch) === '\x0A') {
            this.nextch(ch); // CR/LF is one line ending
        }
        this.line_number++;
    }
    is_digit(ch) {
        return ch.length == 1 && ch >= '0' && ch <= '9';
    }
    non_symbol(ch) {
        return ch === '(' || ch === ')' || ch === ';' || this.is_whitespace(ch);
    }
}


class ElizaScriptReader {
    constructor(scriptText) {
        this.tok = new Tokenizer(scriptText);
        this.script = new Script;
        this.occurrencesOfReferences = [];

        this.script.helloMessage = this.rdlist();
        if (this.tok.peektok().symbol("START")) {
            this.tok.nexttok();
        }

        while (this.readRule())
            ;

        // Check if the script meets the minimum requirements
        if (!this.script.rules.has(SPECIAL_RULE_NONE)) {
            throw new Error("Script error: no NONE rule specified; see Jan 1966 CACM page 41");
        }
        if (!this.script.memoryRule.keyword) {
            throw new Error("Script error: no MEMORY rule specified; see Jan 1966 CACM page 41");
        }
        if (!this.script.rules.has(this.script.memoryRule.keyword)) {
            throw new Error(`Script error: MEMORY rule keyword '${this.script.memoryRule.keyword}' is not also a keyword in its own right; see Jan 1966 CACM page 41`);
        }
        for (const [lineNumber, referencedKeyword] of this.occurrencesOfReferences) {
            if (!this.script.rules.has(referencedKeyword)) {
                throw new Error(`Script error on line ${lineNumber}: '=${referencedKeyword}' referenced keyword does not exist`);
            }
            if (!this.script.rules.get(referencedKeyword).hasTransformation()) {
                throw new Error(`Script error on line ${lineNumber}: '=${referencedKeyword}' referenced keyword has no associated transformation rules`);
            }
        }
    }

    readRule() {
        let t = this.tok.nexttok();
        if (t.eof()) {
            return false;
        }
        if (!t.open()) {
            throw new Error(this.errormsg("expected '('"));
        }
        t = this.tok.peektok();
        if (t.close()) {
            this.tok.nexttok();
            return true;
        }
        if (!t.symbol()) {
            throw new Error(this.errormsg("expected keyword|MEMORY|NONE"));
        }
        if (t.value === "MEMORY") {
            return this.readMemoryRule();
        }
        return this.readKeywordRule();
    }

    readKeywordRule() {
        let keyword = "";
        let msg_keyword = "";
        let keywordSubstitution = "";
        let precedence = 0;
        let tags = [];
        let transformation = [];
        let className = "";

        let t = this.tok.nexttok();
        msg_keyword = keyword = t.value;
        if (keyword === "NONE") {
            keyword = SPECIAL_RULE_NONE;
        }
        if (this.script.rules.has(keyword)) {
            throw new Error(this.errormsg(`keyword rule already specified for keyword '${msg_keyword}'`));
        }
        if (this.tok.peektok().close()) {
            throw new Error(this.errormsg(`keyword '${msg_keyword}' has no associated body`));
        }

        for (t = this.tok.nexttok(); !t.close(); t = this.tok.nexttok()) {
            if (t.symbol("=")) {
                t = this.tok.nexttok();
                if (!t.symbol()) {
                    throw new Error(this.errormsg("expected keyword"));
                }
                keywordSubstitution = t.value;
            } else if (t.number()) {
                precedence = parseInt(t.value);
            } else if (t.symbol("DLIST")) {
                t = this.tok.nexttok();
                if (t.eof() || !t.open())
                    throw new Error(this.errormsg("expected '('"));
                t = this.tok.nexttok();
                if (!t.symbol() || !t.value.startsWith('/'))
                    throw new Error(this.errormsg("expected '/'"));
                if (t.value.length > 1) {
                    let tag = t.value.substring(1);
                    tags = this.rdlist(false);
                    tags.unshift(tag);
                }
                else {
                    tags = this.rdlist(false);
                }
            } else if (t.open()) {
                t = this.tok.peektok();
                if (t.symbol("=")) {
                    this.tok.nexttok();
                    t = this.tok.nexttok();
                    if (!t.symbol()) {
                        throw new Error(this.errormsg("expected equivalence class name"));
                    }
                    className = t.value;
                    this.occurrencesOfReferences.push([this.tok.line_number, t.value]);

                    if (!this.tok.nexttok().close()) {
                        throw new Error(this.errormsg("expected ')'"));
                    }
                    if (!this.tok.peektok().close()) {
                        throw new Error(this.errormsg("expected ')'"));
                    }
                } else {
                    let trans = {
                        decomposition: this.rdlist(),
                        reassembly: []
                    };
                    if (trans.decomposition.length == 0)
                        throw new Error(this.errormsg("decompose pattern cannot be empty"));
                    while (this.tok.peektok().open()) {
                        const reassembly = this.readReassembly();
                        const [valid, message] = reassemblyIndexesValid(trans.decomposition, reassembly);
                        if (!valid) {
                            throw new Error(this.errormsg(message));
                        }
                        trans.reassembly.push(reassembly);
                    }
                    if (!this.tok.nexttok().close()) {
                        throw new Error(this.errormsg("expected ')'"));
                    }
                    transformation.push(trans);
                }
            } else {
                throw new Error(this.errormsg("malformed rule"));
            }
        }

        let r = new RuleKeyword(keyword, keywordSubstitution, precedence, tags, className);
        for (let tr of transformation) {
            r.addTransformationRule(tr.decomposition, tr.reassembly);
        }
        this.script.rules.set(keyword, r);

        return true;
    }

    readReassembly() {
        if (!this.tok.nexttok().open()) {
            throw new Error(this.errormsg("expected '('"));
        }

        if (!this.tok.peektok().symbol("PRE")) {
            const reassembly = this.rdlist(false);
            if (reassembly.length != 0 && reassembly[0] == "=") {
                if (reassembly.length != 2)
                    throw new Error(this.errormsg("expected reference keyword to follow '='"));
                this.occurrencesOfReferences.push([this.tok.line_number, reassembly[1]]);
            }
            return reassembly;
        }

        // It's a PRE reassembly, e.g. (PRE (I ARE 3) (=YOU))
        this.tok.nexttok(); // skip "PRE"
        const pre = ["(", "PRE"];
        const reconstruct = this.rdlist();
        const reference = this.rdlist();
        if (reference.length !== 2 || reference[0] !== '=') {
            throw new Error(this.errormsg("expected '(=reference)' in PRE rule"));
        }
        this.occurrencesOfReferences.push([this.tok.line_number, reference[1]]);

        pre.push("(", ...reconstruct, ")");
        pre.push("(", ...reference, ")");
        pre.push(")");

        if (!this.tok.nexttok().close()) {
            throw new Error(this.errormsg("expected ')'"));
        }

        return pre;
    }

    readMemoryRule() {
        let t = this.tok.nexttok();
        console.assert(t.symbol("MEMORY"));

        t = this.tok.nexttok();
        if (!t.symbol()) {
            throw new Error(this.errormsg("expected keyword to follow MEMORY; expected form is (MEMORY keyword (decomp1=reassm1)(decomp2=reassm2)(decomp3=reassm3)(decomp4=reassm4))"));
        }

        if (this.script.memoryRule.keyword) {
            throw new Error(this.errormsg("multiple MEMORY rules specified"));
        }

        this.script.memoryRule.keyword = t.value;

        for (let i = 0; i < 4; ++i) {
            if (!this.tok.nexttok().open()) {
                throw new Error(this.errormsg("expected '('; expected form is (MEMORY keyword (decomp1=reassm1)(decomp2=reassm2)(decomp3=reassm3)(decomp4=reassm4))"));
            }

            const decomposition = [];
            for (t = this.tok.nexttok(); !t.symbol("=") && !t.eof(); t = this.tok.nexttok()) {
                decomposition.push(t.value);
            }
            if (decomposition.length === 0) {
                throw new Error(this.errormsg("expected 'decompose_terms = reassemble_terms'"));
            }
            if (!t.symbol("=")) {
                throw new Error(this.errormsg("expected '='; expected form is (MEMORY keyword (decomp1=reassm1)(decomp2=reassm2)(decomp3=reassm3)(decomp4=reassm4))"));
            }

            const reassembly = [];
            for (t = this.tok.nexttok(); !t.close() && !t.eof(); t = this.tok.nexttok()) {
                reassembly.push(t.value);
            }
            if (reassembly.length === 0) {
                throw new Error(this.errormsg("expected 'decompose_terms = reassemble_terms'"));
            }
            if (!t.close()) {
                throw new Error(this.errormsg("expected ')'; expected form is (MEMORY keyword (decomp1=reassm1)(decomp2=reassm2)(decomp3=reassm3)(decomp4=reassm4))"));
            }
            const [valid, message] = reassemblyIndexesValid(decomposition, reassembly);
            if (!valid) {
                throw new Error(this.errormsg(message));
            }
            const reassembly_rules = [];
            reassembly_rules.push(reassembly);

            this.script.memoryRule.addTransformationRule(decomposition, reassembly_rules);
        }

        if (!this.tok.nexttok().close()) {
            throw new Error(this.errormsg("expected ')'; expected form is (MEMORY keyword (decomp1=reassm1)(decomp2=reassm2)(decomp3=reassm3)(decomp4=reassm4))"));
        }

        return true;
    }

    errormsg(msg) {
        return `Script error on line ${this.tok.line_number}: ${msg}`;
    }

    rdlist(prior = true) {
        let s = [];
        let t = this.tok.nexttok();
        if (prior) {
            if (!t.open()) {
                throw new Error(this.errormsg("expected '('"));
            }
            t = this.tok.nexttok();
        }
        while (!t.close()) {
            if (t.symbol() || t.number()) {
                s.push(t.value);
            } else if (t.open()) {
                let sublist = "";
                t = this.tok.nexttok();
                while (!t.close()) {
                    if (!t.symbol()) {
                        throw new Error(this.errormsg("expected symbol"));
                    }
                    if (sublist.length > 0) {
                        sublist += ' ';
                    }
                    sublist += t.value;
                    t = this.tok.nexttok();
                }
                s.push(`(${sublist})`);
            } else {
                throw new Error(this.errormsg("expected ')'"));
            }
            t = this.tok.nexttok();
        }
        return s;
    }
}


function readScript(scriptText) {
    try {
        const scriptReader = new ElizaScriptReader(scriptText);
        return ['success', scriptReader.script];
    }
    catch(e) {
        return [e.message];
    }
}



 //////// //       //// ////////    ///    //////// ////////  //////  //////// 
 //       //        //       //    // //      //    //       //    //    //    
 //       //        //      //    //   //     //    //       //          //    
 //////   //        //     //    //     //    //    //////    //////     //    
 //       //        //    //     /////////    //    //             //    //    
 //       //        //   //      //     //    //    //       //    //    //    
 //////// //////// //// //////// //     //    //    ////////  //////     //    


// return true iff arrays a and b contain the same elements in the same order
function equal(a, b) {
    console.assert(Array.isArray(a));
    console.assert(Array.isArray(b));

    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}


/* ---- structured tracer + factory added by the ELIZA Archaeology project ----
   Drives the step-by-step demo (assets/trace.js) from the authoritative engine
   above. We subclass Hay's nullTracer and parse his deterministic trace text
   into the same structured shape the demo already renders. */

function splitTop(str) {
  var toks = [], i = 0, n = str.length, depth = 0, cur = '';
  while (i < n) {
    var c = str[i];
    if (c === '(') { depth++; cur += c; }
    else if (c === ')') { depth--; cur += c; }
    else if (/\s/.test(c) && depth === 0) { if (cur) { toks.push(cur); cur = ''; } }
    else cur += c;
    i++;
  }
  if (cur) toks.push(cur);
  return toks;
}
function patternDisplay(tokens) {
  return tokens.map(function (tok) {
    if (tok === '0') return { t: '0', any: true };
    if (tok.charAt(0) === '(') {
      var inner = tok.slice(1, -1).trim();
      if (inner.charAt(0) === '*') {
        var set = inner.replace(/^\*\s*/, '').split(/\s+/).filter(Boolean);
        return { t: '(' + set.join(' | ') + ')', set: true };
      }
      if (inner.charAt(0) === '/') {
        var tg = inner.replace(/^\/\s*/, '').split(/\s+/).filter(Boolean);
        return { t: 'any ' + tg.join('/') + ' word', tag: true };
      }
      return { t: tok };
    }
    return { t: tok };
  });
}
function fillTemplate(template, parts) {
  var out = [];
  template.forEach(function (t) {
    if (/^\d+$/.test(t)) { var c = parts[+t - 1]; if (c) out.push(c); }
    else out.push(t);
  });
  return out.join(' ').replace(/\s+/g, ' ').replace(/\s+([,.!?'])/g, '$1').trim();
}

class HayTrace extends nullTracer {
  constructor() { super(); this.steps = []; this.keystack = []; this._mem = {}; }
  subclauseComplete(subclause, keystack, rules) {
    var self = this;
    this.keystack = keystack.map(function (k) {
      var rank = rules.has(k) ? rules.get(k).getPrecedence() : 0;
      return { word: k, rank: rank };
    });
  }
  createMemory(t) {
    var m = /new memory:\s*(.+)/.exec(t || '');
    if (m && !this._mem[m[1]]) { this._mem[m[1]] = 1; this.steps.push({ kind: 'memory-store', text: m[1].trim() }); }
  }
  usingMemory(s) { this.steps.push({ kind: 'memory-recall', text: '' }); }
  usingNone(s) { this.steps.push({ kind: 'none', output: '' }); }
  transform(t, s) {
    function grab(re) { var m = t.match(re); return m ? m[1].trim() : null; }
    var keyword = grab(/selected keyword:\s*(.+)/);
    var equiv = grab(/reference to equivalence class:\s*(.+)/);
    var patternStr = grab(/matching decompose pattern:\s*\((.*)\)\s*$/m);
    var reasmStr = grab(/selected reassemble rule:\s*\((.*)\)\s*$/m);
    var parts = [], pm, pre = /(\d+):"([^"]*)"/g;
    while ((pm = pre.exec(t))) parts[+pm[1] - 1] = pm[2];
    for (var i = 0; i < parts.length; i++) if (parts[i] === undefined) parts[i] = '';

    if (patternStr !== null) {
      this.steps.push({ kind: 'decompose', keyword: keyword, pattern: patternDisplay(splitTop(patternStr)), components: parts });
      if (reasmStr !== null) {
        var rt = reasmStr.trim(), toks = splitTop(rt);
        if (toks[0] === '=') this.steps.push({ kind: 'goto', from: keyword, to: toks[1] });
        else if (toks[0] === 'NEWKEY') this.steps.push({ kind: 'newkey', from: keyword });
        else if (toks[0] && toks[0].charAt(0) === '(') {
          var lm = rt.match(/=\s*([A-Z'\-]+)/); this.steps.push({ kind: 'pre', from: keyword, to: lm ? lm[1] : '', rebuilt: [] });
        } else {
          this.steps.push({ kind: 'reassemble', keyword: keyword, template: toks, components: parts, output: fillTemplate(toks, parts) });
        }
      }
    } else if (equiv) {
      this.steps.push({ kind: 'goto', from: keyword, to: equiv });
    }
  }
}

function buildScriptOrThrow() {
  var r = readScript(CACM_1966_01_DOCTOR_SCRIPT);
  if (r[0] !== 'success') throw new Error('ELIZA script error: ' + r[0]);
  return r[1];
}

// make a persistent ELIZA session: one engine whose memory queue, reply counter
// and reassembly cycling carry across turns (so a whole conversation can be
// replayed). session.trace(text) returns the structured trace for one turn,
// including the current memory queue.
window.ElizaHay = {
  make: function () {
    var script = buildScriptOrThrow();
    var eliza = new Eliza(script.rules, script.memoryRule, new HayTrace(), 0);
    return {
      trace: async function (text) {
        var tracer = new HayTrace();
        eliza.tracer = tracer;
        var reply = await eliza.response(text);
        var T = { input: text, cleaned: join(split(elizaUppercase(text))), steps: tracer.steps, keystack: tracer.keystack, output: reply };
        T.words = split(elizaUppercase(text)).map(function (w) {
          var has = script.rules.has(w) ? script.rules.get(w) : null;
          var isKey = !!(has && has.hasTransformation());
          var sub = has ? has.applyWordSubstitution(w) : w;
          return { raw: w, sub: (sub !== w ? sub : null), keyword: isKey, rank: has ? has.getPrecedence() : 0 };
        });
        T.steps.forEach(function (st) { if ((st.kind === 'memory-recall' || st.kind === 'none') && !st.output && !st.text) { if (st.kind === 'none') st.output = reply; else st.text = reply; } });
        // for an equivalence deferral (e.g. LIKE -> DIT), surface what the target
        // keyword actually is: its rank and the pool of replies it hands over.
        T.steps.forEach(function (st) {
          if (st.kind !== 'goto' || !st.to || !script.rules.has(st.to)) return;
          var tr = script.rules.get(st.to);
          st.toRank = tr.getPrecedence ? tr.getPrecedence() : null;
          st.fromRank = (st.from && script.rules.has(st.from) && script.rules.get(st.from).getPrecedence) ? script.rules.get(st.from).getPrecedence() : null;
          st.targetResponses = [];
          (tr.transforms || []).forEach(function (k) {
            (k.reassemblyRules || []).forEach(function (rr) {
              var line = join(rr);
              if (line && line !== 'NEWKEY' && line.charAt(0) !== '=') st.targetResponses.push(line);
            });
          });
        });
        T.memory = script.memoryRule.memories.slice();   // current memory queue, oldest first
        return T;
      }
    };
  },
  // single-shot trace in a fresh conversation
  trace: function (text) { return window.ElizaHay.make().trace(text); }
};
})();
