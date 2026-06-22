/* ============================================================
   eliza.js — a faithful re-implementation of Joseph Weizenbaum's
   ELIZA, driven by the verbatim DOCTOR script published in the
   January 1966 Communications of the ACM (and recovered in the
   MIT archive printout, 1965). Pure pattern matching: keyword
   ranking, decomposition / reassembly, equivalence (=KEY),
   NEWKEY, PRE, tag dlists, and the "certain counting mechanism"
   for memory that the recovered MAD-SLIP source finally
   explained (see blog post 1, Anthony Hay).

   No data leaves the browser. window.ELIZA.make() returns an
   engine with .greeting() and .reply(text). MIT-style: free to
   reuse. The script text below is Weizenbaum's, transcribed by
   Anthony Hay from the CACM appendix.
   ============================================================ */
(function () {
  var DOCTOR_SCRIPT = [
"(HOW DO YOU DO.  PLEASE TELL ME YOUR PROBLEM)",
"START",
"(SORRY ((0) (PLEASE DON'T APOLIGIZE) (APOLOGIES ARE NOT NECESSARY)",
"  (WHAT FEELINGS DO YOU HAVE WHEN YOU APOLOGIZE)",
"  (I'VE TOLD YOU THAT APOLOGIES ARE NOT REQUIRED)))",
"(DONT = DON'T)",
"(CANT = CAN'T)",
"(WONT = WON'T)",
"(REMEMBER 5",
"  ((0 YOU REMEMBER 0)",
"    (DO YOU OFTEN THINK OF 4)",
"    (DOES THINKING OF 4 BRING ANYTHING ELSE TO MIND)",
"    (WHAT ELSE DO YOU REMEMBER)",
"    (WHY DO YOU REMEMBER 4 JUST NOW)",
"    (WHAT IN THE PRESENT SITUATION REMINDS YOU OF 4)",
"    (WHAT IS THE CONNECTION BETWEEN ME AND 4))",
"  ((0 DO I REMEMBER 0)",
"    (DID YOU THINK I WOULD FORGET 5)",
"    (WHY DO YOU THINK I SHOULD RECALL 5 NOW)",
"    (WHAT ABOUT 5)",
"    (=WHAT)",
"    (YOU MENTIONED 5))",
"  ((0) (NEWKEY)))",
"(IF 3",
"  ((0 IF 0)",
"    (DO YOU THINK ITS LIKELY THAT 3)",
"    (DO YOU WISH THAT 3)",
"    (WHAT DO YOU THINK ABOUT 3)",
"    (REALLY, 2 3)))",
"(DREAMT 4",
"  ((0 YOU DREAMT 0)",
"    (REALLY, 4)",
"    (HAVE YOU EVER FANTASIED 4 WHILE YOU WERE AWAKE)",
"    (HAVE YOU DREAMT 4 BEFORE)",
"    (=DREAM)",
"    (NEWKEY)))",
"(DREAMED = DREAMT 4 (=DREAMT))",
"(DREAM 3",
"  ((0)",
"    (WHAT DOES THAT DREAM SUGGEST TO YOU)",
"    (DO YOU DREAM OFTEN)",
"    (WHAT PERSONS APPEAR IN YOUR DREAMS)",
"    (DON'T YOU BELIEVE THAT DREAM HAS SOMETHING TO DO WITH YOUR PROBLEM)",
"    (NEWKEY)))",
"(DREAMS = DREAM 3 (=DREAM))",
"(HOW (=WHAT))",
"(WHEN (=WHAT))",
"(ALIKE 10 (=DIT))",
"(SAME 10 (=DIT))",
"(CERTAINLY (=YES))",
"(FEEL DLIST(/BELIEF))",
"(THINK DLIST(/BELIEF))",
"(BELIEVE DLIST(/BELIEF))",
"(WISH DLIST(/BELIEF))",
"(MEMORY MY",
"  (0 YOUR 0 = LETS DISCUSS FURTHER WHY YOUR 3)",
"  (0 YOUR 0 = EARLIER YOU SAID YOUR 3)",
"  (0 YOUR 0 = BUT YOUR 3)",
"  (0 YOUR 0 = DOES THAT HAVE ANYTHING TO DO WITH THE FACT THAT YOUR 3))",
"(NONE",
"  ((0)",
"    (I AM NOT SURE I UNDERSTAND YOU FULLY)",
"    (PLEASE GO ON)",
"    (WHAT DOES THAT SUGGEST TO YOU)",
"    (DO YOU FEEL STRONGLY ABOUT DISCUSSING SUCH THINGS)))",
"(PERHAPS",
"  ((0)",
"    (YOU DON'T SEEM QUITE CERTAIN)",
"    (WHY THE UNCERTAIN TONE)",
"    (CAN'T YOU BE MORE POSITIVE)",
"    (YOU AREN'T SURE)",
"    (DON'T YOU KNOW)))",
"(MAYBE (=PERHAPS))",
"(NAME 15",
"  ((0)",
"    (I AM NOT INTERESTED IN NAMES)",
"    (I'VE TOLD YOU BEFORE, I DON'T CARE ABOUT NAMES - PLEASE CONTINUE)))",
"(DEUTSCH (=XFREMD))",
"(FRANCAIS (=XFREMD))",
"(ITALIANO (=XFREMD))",
"(ESPANOL (=XFREMD))",
"(XFREMD ((0) (I AM SORRY, I SPEAK ONLY ENGLISH)))",
"(HELLO ((0) (HOW DO YOU DO.  PLEASE STATE YOUR PROBLEM)))",
"(COMPUTER 50",
"  ((0)",
"    (DO COMPUTERS WORRY YOU)",
"    (WHY DO YOU MENTION COMPUTERS)",
"    (WHAT DO YOU THINK MACHINES HAVE TO DO WITH YOUR PROBLEM)",
"    (DON'T YOU THINK COMPUTERS CAN HELP PEOPLE)",
"    (WHAT ABOUT MACHINES WORRIES YOU)",
"    (WHAT DO YOU THINK ABOUT MACHINES)))",
"(MACHINE 50 (=COMPUTER))",
"(MACHINES 50 (=COMPUTER))",
"(COMPUTERS 50 (=COMPUTER))",
"(AM = ARE",
"  ((0 ARE YOU 0)",
"    (DO YOU BELIEVE YOU ARE 4)",
"    (WOULD YOU WANT TO BE 4)",
"    (YOU WISH I WOULD TELL YOU YOU ARE 4)",
"    (WHAT WOULD IT MEAN IF YOU WERE 4)",
"    (=WHAT))",
"  ((0)",
"    (WHY DO YOU SAY 'AM')",
"    (I DON'T UNDERSTAND THAT)))",
"(ARE",
"  ((0 ARE I 0)",
"    (WHY ARE YOU INTERESTED IN WHETHER I AM 4 OR NOT)",
"    (WOULD YOU PREFER IF I WEREN'T 4)",
"    (PERHAPS I AM 4 IN YOUR FANTASIES)",
"    (DO YOU SOMETIMES THINK I AM 4)",
"    (=WHAT))",
"  ((0 ARE 0)",
"    (DID YOU THINK THEY MIGHT NOT BE 3)",
"    (WOULD YOU LIKE IT IF THEY WERE NOT 3)",
"    (WHAT IF THEY WERE NOT 3)",
"    (POSSIBLY THEY ARE 3)))",
"(YOUR = MY",
"  ((0 MY 0)",
"    (WHY ARE YOU CONCERNED OVER MY 3)",
"    (WHAT ABOUT YOUR OWN 3)",
"    (ARE YOU WORRIED ABOUT SOMEONE ELSES 3)",
"    (REALLY, MY 3)))",
"(WAS 2",
"  ((0 WAS YOU 0)",
"    (WHAT IF YOU WERE 4)",
"    (DO YOU THINK YOU WERE 4)",
"    (WERE YOU 4)",
"    (WHAT WOULD IT MEAN IF YOU WERE 4)",
"    (WHAT DOES ' 4 ' SUGGEST TO YOU)",
"    (=WHAT))",
"  ((0 YOU WAS 0)",
"    (WERE YOU REALLY)",
"    (WHY DO YOU TELL ME YOU WERE 4 NOW)",
"    (PERHAPS I ALREADY KNEW YOU WERE 4))",
"  ((0 WAS I 0)",
"    (WOULD YOU LIKE TO BELIEVE I WAS 4)",
"    (WHAT SUGGESTS THAT I WAS 4)",
"    (WHAT DO YOU THINK)",
"    (PERHAPS I WAS 4)",
"    (WHAT IF I HAD BEEN 4))",
"  ((0) (NEWKEY)))",
"(WERE = WAS (=WAS))",
"(ME = YOU)",
"(YOU'RE = I'M ((0 I'M 0) (PRE (I ARE 3) (=YOU))))",
"(I'M = YOU'RE ((0 YOU'RE 0) (PRE (YOU ARE 3) (=I))))",
"(MYSELF = YOURSELF)",
"(YOURSELF = MYSELF)",
"(MOTHER DLIST(/NOUN FAMILY))",
"(MOM = MOTHER DLIST(/ FAMILY))",
"(DAD = FATHER DLIST(/ FAMILY))",
"(FATHER DLIST(/NOUN FAMILY))",
"(SISTER DLIST(/FAMILY))",
"(BROTHER DLIST(/FAMILY))",
"(WIFE DLIST(/FAMILY))",
"(CHILDREN DLIST(/FAMILY))",
"(I = YOU",
"  ((0 YOU (* WANT NEED) 0)",
"    (WHAT WOULD IT MEAN TO YOU IF YOU GOT 4)",
"    (WHY DO YOU WANT 4)",
"    (SUPPOSE YOU GOT 4 SOON)",
"    (WHAT IF YOU NEVER GOT 4)",
"    (WHAT WOULD GETTING 4 MEAN TO YOU)",
"    (WHAT DOES WANTING 4 HAVE TO DO WITH THIS DISCUSSION))",
"  ((0 YOU ARE 0 (*SAD UNHAPPY DEPRESSED SICK ) 0)",
"    (I AM SORRY TO HEAR YOU ARE 5)",
"    (DO YOU THINK COMING HERE WILL HELP YOU NOT TO BE 5)",
"    (I'M SURE ITS NOT PLEASANT TO BE 5)",
"    (CAN YOU EXPLAIN WHAT MADE YOU 5))",
"  ((0 YOU ARE 0 (*HAPPY ELATED GLAD BETTER) 0)",
"    (HOW HAVE I HELPED YOU TO BE 5)",
"    (HAS YOUR TREATMENT MADE YOU 5)",
"    (WHAT MAKES YOU 5 JUST NOW)",
"    (CAN YOU EXPLAIN WHY YOU ARE SUDDENLY 5))",
"  ((0 YOU WAS 0) (=WAS))",
"  ((0 YOU (/BELIEF) YOU 0)",
"    (DO YOU REALLY THINK SO)",
"    (BUT YOU ARE NOT SURE YOU 5)",
"    (DO YOU REALLY DOUBT YOU 5))",
"  ((0 YOU 0 (/BELIEF) 0 I 0) (=YOU))",
"  ((0 YOU ARE 0)",
"    (IS IT BECAUSE YOU ARE 4 THAT YOU CAME TO ME)",
"    (HOW LONG HAVE YOU BEEN 4)",
"    (DO YOU BELIEVE IT NORMAL TO BE 4)",
"    (DO YOU ENJOY BEING 4))",
"  ((0 YOU (* CAN'T CANNOT) 0)",
"    (HOW DO YOU KNOW YOU CAN'T 4)",
"    (HAVE YOU TRIED)",
"    (PERHAPS YOU COULD 4 NOW)",
"    (DO YOU REALLY WANT TO BE ABLE TO 4))",
"  ((0 YOU DON'T 0)",
"    (DON'T YOU REALLY 4)",
"    (WHY DON'T YOU 4)",
"    (DO YOU WISH TO BE ABLE TO 4)",
"    (DOES THAT TROUBLE YOU))",
"  ((0 YOU FEEL 0)",
"    (TELL ME MORE ABOUT SUCH FEELINGS)",
"    (DO YOU OFTEN FEEL 4)",
"    (DO YOU ENJOY FEELING 4)",
"    (OF WHAT DOES FEELING 4 REMIND YOU))",
"  ((0 YOU 0 I 0)",
"    (PERHAPS IN YOUR FANTASY WE 3 EACH OTHER)",
"    (DO YOU WISH TO 3 ME)",
"    (YOU SEEM TO NEED TO 3 ME)",
"    (DO YOU 3 ANYONE ELSE))",
"  ((0)",
"    (YOU SAY 1)",
"    (CAN YOU ELABORATE ON THAT)",
"    (DO YOU SAY 1 FOR SOME SPECIAL REASON)",
"    (THAT'S QUITE INTERESTING)))",
"(YOU = I",
"  ((0 I REMIND YOU OF 0) (=DIT))",
"  ((0 I ARE 0)",
"    (WHAT MAKES YOU THINK I AM 4)",
"    (DOES IT PLEASE YOU TO BELIEVE I AM 4)",
"    (DO YOU SOMETIMES WISH YOU WERE 4)",
"    (PERHAPS YOU WOULD LIKE TO BE 4))",
"  ((0 I 0 YOU)",
"    (WHY DO YOU THINK I 3 YOU)",
"    (YOU LIKE TO THINK I 3 YOU - DON'T YOU)",
"    (WHAT MAKES YOU THINK I 3 YOU)",
"    (REALLY, I 3 YOU)",
"    (DO YOU WISH TO BELIEVE I 3 YOU)",
"    (SUPPOSE I DID 3 YOU - WHAT WOULD THAT MEAN)",
"    (DOES SOMEONE ELSE BELIEVE I 3 YOU))",
"  ((0 I 0)",
"    (WE WERE DISCUSSING YOU - NOT ME)",
"    (OH, I 3)",
"    (YOU'RE NOT REALLY TALKING ABOUT ME - ARE YOU)",
"    (WHAT ARE YOUR FEELINGS NOW)))",
"(YES",
"  ((0)",
"    (YOU SEEM QUITE POSITIVE)",
"    (YOU ARE SURE)",
"    (I SEE)",
"    (I UNDERSTAND)))",
"(NO",
"  ((0)",
"    (ARE YOU SAYING 'NO' JUST TO BE NEGATIVE)",
"    (YOU ARE BEING A BIT NEGATIVE)",
"    (WHY NOT)",
"    (WHY 'NO'))) ",
"(MY = YOUR 2",
"  ((0 YOUR 0 (/FAMILY) 0)",
"    (TELL ME MORE ABOUT YOUR FAMILY)",
"    (WHO ELSE IN YOUR FAMILY 5)",
"    (YOUR 4)",
"    (WHAT ELSE COMES TO MIND WHEN YOU THINK OF YOUR 4))",
"  ((0 YOUR 0)",
"    (YOUR 3)",
"    (WHY DO YOU SAY YOUR 3)",
"    (DOES THAT SUGGEST ANYTHING ELSE WHICH BELONGS TO YOU)",
"    (IS IT IMPORTANT TO YOU THAT 2 3)))",
"(CAN",
"  ((0 CAN I 0)",
"    (YOU BELIEVE I CAN 4 DON'T YOU)",
"    (=WHAT)",
"    (YOU WANT ME TO BE ABLE TO 4)",
"    (PERHAPS YOU WOULD LIKE TO BE ABLE TO 4 YOURSELF))",
"  ((0 CAN YOU 0)",
"    (WHETHER OR NOT YOU CAN 4 DEPENDS ON YOU MORE THAN ON ME)",
"    (DO YOU WANT TO BE ABLE TO 4)",
"    (PERHAPS YOU DON'T WANT TO 4)",
"    (=WHAT)))",
"(WHAT",
"  ((0)",
"    (WHY DO YOU ASK)",
"    (DOES THAT QUESTION INTEREST YOU)",
"    (WHAT IS IT YOU REALLY WANT TO KNOW)",
"    (ARE SUCH QUESTIONS MUCH ON YOUR MIND)",
"    (WHAT ANSWER WOULD PLEASE YOU MOST)",
"    (WHAT DO YOU THINK)",
"    (WHAT COMES TO YOUR MIND WHEN YOU ASK THAT)",
"    (HAVE YOU ASKED SUCH QUESTIONS BEFORE)",
"    (HAVE YOU ASKED ANYONE ELSE)))",
"(BECAUSE",
"  ((0)",
"    (IS THAT THE REAL REASON)",
"    (DON'T ANY OTHER REASONS COME TO MIND)",
"    (DOES THAT REASON SEEM TO EXPLAIN ANYTHING ELSE)",
"    (WHAT OTHER REASONS MIGHT THERE BE)))",
"(WHY",
"  ((0 WHY DON'T I 0)",
"    (DO YOU BELIEVE I DON'T 5)",
"    (PERHAPS I WILL 5 IN GOOD TIME)",
"    (SHOULD YOU 5 YOURSELF)",
"    (YOU WANT ME TO 5)",
"    (=WHAT))",
"  ((0 WHY CAN'T YOU 0)",
"    (DO YOU THINK YOU SHOULD BE ABLE TO 5)",
"    (DO YOU WANT TO BE ABLE TO 5)",
"    (DO YOU BELIEVE THIS WILL HELP YOU TO 5)",
"    (HAVE YOU ANY IDEA WHY YOU CAN'T 5)",
"    (=WHAT))",
"  (=WHAT))",
"(EVERYONE 2",
"  ((0 (* EVERYONE EVERYBODY NOBODY NOONE) 0)",
"    (REALLY, 2)",
"    (SURELY NOT 2)",
"    (CAN YOU THINK OF ANYONE IN PARTICULAR)",
"    (WHO, FOR EXAMPLE)",
"    (YOU ARE THINKING OF A VERY SPECIAL PERSON)",
"    (WHO, MAY I ASK)",
"    (SOMEONE SPECIAL PERHAPS)",
"    (YOU HAVE A PARTICULAR PERSON IN MIND, DON'T YOU)",
"    (WHO DO YOU THINK YOU'RE TALKING ABOUT)))",
"(EVERYBODY 2 (= EVERYONE))",
"(NOBODY 2 (= EVERYONE))",
"(NOONE 2 (= EVERYONE))",
"(ALWAYS 1",
"  ((0)",
"    (CAN YOU THINK OF A SPECIFIC EXAMPLE)",
"    (WHEN)",
"    (WHAT INCIDENT ARE YOU THINKING OF)",
"    (REALLY, ALWAYS)))",
"(LIKE 10",
"  ((0 (*AM IS ARE WAS) 0 LIKE 0) (=DIT))",
"  ((0) (NEWKEY)))",
"(DIT",
"  ((0)",
"    (IN WHAT WAY)",
"    (WHAT RESEMBLANCE DO YOU SEE)",
"    (WHAT DOES THAT SIMILARITY SUGGEST TO YOU)",
"    (WHAT OTHER CONNECTIONS DO YOU SEE)",
"    (WHAT DO YOU SUPPOSE THAT RESEMBLANCE MEANS)",
"    (WHAT IS THE CONNECTION, DO YOU SUPPOSE)",
"    (COULD THERE REALLY BE SOME CONNECTION)",
"    (HOW)))"
  ].join("\n");

  // ---- tokenizer: ( ) are individual tokens; everything else is an atom ----
  function tokenize(s) {
    var toks = [], i = 0, n = s.length, cur = "";
    function flush() { if (cur.length) { toks.push(cur); cur = ""; } }
    while (i < n) {
      var c = s[i];
      if (c === "(" || c === ")") { flush(); toks.push(c); }
      else if (c === " " || c === "\t" || c === "\n" || c === "\r") { flush(); }
      else { cur += c; }
      i++;
    }
    flush();
    return toks;
  }

  // ---- recursive-descent: token list -> nested arrays ----
  function parseForms(toks) {
    var pos = 0;
    function parseList() {
      var arr = [];
      while (pos < toks.length) {
        var t = toks[pos++];
        if (t === "(") arr.push(parseList());
        else if (t === ")") return arr;
        else arr.push(t);
      }
      return arr;
    }
    var forms = [];
    while (pos < toks.length) {
      var t = toks[pos++];
      if (t === "(") forms.push(parseList());
      else forms.push(t); // bare atom, e.g. START
    }
    return forms;
  }

  function isInt(s) { return typeof s === "string" && /^\d+$/.test(s); }

  // ---- build the keyword table from the parsed script ----
  function buildScript(text) {
    // strip comment lines
    text = text.split("\n").filter(function (l) { return !/^\s*;/.test(l); }).join("\n");
    var forms = parseForms(tokenize(text));
    var keys = {};        // word -> entry
    var tagsOf = {};      // word -> [tags]
    var greeting = "HOW DO YOU DO. PLEASE TELL ME YOUR PROBLEM";
    var none = null, memory = null;

    // a redirect can be written "(= KEY)" -> ["=","KEY"] or "(=KEY)" -> ["=KEY"]
    function asGoto(arr) {
      if (!Array.isArray(arr) || !arr.length) return null;
      var a = arr[0];
      if (a === "=") return arr[1];
      if (typeof a === "string" && a.charAt(0) === "=" && a.length > 1) return a.slice(1);
      return null;
    }

    function parseReasm(r) {
      // r is always an array
      var g = asGoto(r);
      if (g) return { type: "goto", key: g };
      if (r[0] === "NEWKEY") return { type: "newkey" };
      if (r[0] === "PRE") return { type: "pre", template: r[1], key: asGoto(r[2]) };
      return { type: "tmpl", tokens: r };
    }

    forms.forEach(function (form) {
      if (!Array.isArray(form)) return;       // 'START'
      if (form.length === 0) return;           // trailing ()
      var word = form[0];

      if (word === "MEMORY") {
        memory = { key: form[1], rules: [] };
        for (var m = 2; m < form.length; m++) {
          var tpl = form[m];
          var eq = tpl.indexOf("=");
          memory.rules.push({ decomp: tpl.slice(0, eq), reasm: tpl.slice(eq + 1) });
        }
        return;
      }

      var entry = { word: word, rank: 0, subst: null, rules: [] };
      var i = 1;
      while (i < form.length) {
        var tok = form[i];
        if (tok === "=") { entry.subst = form[i + 1]; i += 2; continue; }
        if (isInt(tok)) { entry.rank = parseInt(tok, 10); i++; continue; }
        if (tok === "DLIST") {
          var tg = form[i + 1] || [];
          tagsOf[word] = tg.map(function (t) { return t.replace(/^\//, ""); })
                           .filter(function (t) { return t.length; });
          i += 2; continue;
        }
        if (Array.isArray(tok)) {
          var g0 = asGoto(tok);
          if (g0) {                             // bare redirect, e.g. (HOW (=WHAT))
            entry.rules.push({ decomp: "*", reasm: [{ type: "goto", key: g0 }] });
          } else {                              // rule group ((decomp)(reasm)...)
            var decomp = tok[0];
            var reasm = tok.slice(1).map(parseReasm);
            entry.rules.push({ decomp: decomp, reasm: reasm, idx: 0 });
          }
          i++; continue;
        }
        i++;
      }
      keys[word] = entry;
      if (word === "NONE") none = entry;
    });

    // first form is the greeting if it looks like words (no nested rule)
    if (Array.isArray(forms[0]) && forms[0].every(function (x) { return typeof x === "string"; })
        && forms[0][0] !== "SORRY") {
      greeting = forms[0].join(" ").replace(/\s+/g, " ");
    }

    return { keys: keys, tagsOf: tagsOf, greeting: greeting, none: none, memory: memory };
  }

  // ---- decomposition match: returns array of component strings, or null ----
  function singleMatch(tok, word, tagsOf) {
    if (typeof tok === "string") return tok === word;
    if (Array.isArray(tok)) {
      var head = tok[0] || "";
      if (head.charAt(0) === "*") {            // (* A B) or (*A B)
        var set = tok.map(function (t) { return t.replace(/^\*/, ""); })
                     .filter(function (t) { return t.length; });
        return set.indexOf(word) !== -1;
      }
      if (head.charAt(0) === "/") {            // (/BELIEF) or (/ FAMILY)
        var want = tok.map(function (t) { return t.replace(/^\//, ""); })
                      .filter(function (t) { return t.length; });
        var has = tagsOf[word] || [];
        for (var k = 0; k < want.length; k++)
          if (has.indexOf(want[k]) !== -1) return true;
        return false;
      }
    }
    return false;
  }

  function match(pat, words, tagsOf) {
    if (pat.length === 0) return words.length === 0 ? [] : null;
    var tok = pat[0];
    if (tok === "0") {                         // wildcard: 0+ words, smallest first
      for (var n = 0; n <= words.length; n++) {
        var rest = match(pat.slice(1), words.slice(n), tagsOf);
        if (rest) return [words.slice(0, n).join(" ")].concat(rest);
      }
      return null;
    }
    if (words.length === 0) return null;
    if (singleMatch(tok, words[0], tagsOf)) {
      var r = match(pat.slice(1), words.slice(1), tagsOf);
      if (r) return [words[0]].concat(r);
    }
    return null;
  }

  function reassemble(tokens, comps) {
    var out = [];
    tokens.forEach(function (t) {
      if (isInt(t)) {
        var c = comps[parseInt(t, 10) - 1];
        if (c !== undefined && c !== "") out.push(c);
      } else {
        out.push(t);
      }
    });
    return out.join(" ").replace(/\s+/g, " ").replace(/\s+([,.!?'])/g, "$1").trim();
  }

  // ---- the engine ----
  function make() {
    var S = buildScript(DOCTOR_SCRIPT);
    var memStack = [];
    var replyCount = 0;

    function applyEntry(entry, words, depth) {
      if (!entry || depth > 12) return null;
      for (var i = 0; i < entry.rules.length; i++) {
        var rule = entry.rules[i];
        var comps = rule.decomp === "*" ? [words.join(" ")]
                                        : match(rule.decomp, words, S.tagsOf);
        if (!comps) continue;
        var r = rule.reasm[(rule.idx || 0) % rule.reasm.length];
        rule.idx = (rule.idx || 0) + 1;
        if (r.type === "tmpl") return reassemble(r.tokens, comps);
        if (r.type === "newkey") return " NEWKEY";
        if (r.type === "goto") {
          var res = applyEntry(S.keys[r.key], words, depth + 1);
          if (res !== null) return res;
          continue;
        }
        if (r.type === "pre") {
          var nw = reassemble(r.template, comps).split(" ");
          var res2 = applyEntry(S.keys[r.key], nw, depth + 1);
          if (res2 !== null) return res2;
          continue;
        }
      }
      return null;
    }

    function clean(text) {
      return text.toUpperCase()
                 .replace(/[^A-Z0-9' ]/g, " ")
                 .replace(/\s+/g, " ").trim();
    }

    function reply(text) {
      replyCount++;
      var raw = clean(text);
      if (!raw) return pickNone();
      var words0 = raw.split(" ");
      var words = [], stack = [];
      words0.forEach(function (w) {
        var e = S.keys[w];
        var sub = (e && e.subst) ? e.subst : w;
        words.push(sub);
        if (e && (e.rules.length || e.rank > 0 || e.subst)) {
          // a word counts as a keyword if it has rules (or is a ranked/equiv key)
          if (e.rules.length || e.rank > 0) stack.push(e);
        }
      });
      // dedupe keep highest rank, stable; sort by rank desc
      var seen = {};
      stack = stack.filter(function (e) { if (seen[e.word]) return false; seen[e.word] = 1; return true; });
      stack.sort(function (a, b) { return b.rank - a.rank; });

      // memory: if MY fired, store a transformed memory for later recall
      if (S.memory && seen[S.memory.key]) {
        var mr = S.memory.rules[hash(words[words.length - 1]) % S.memory.rules.length];
        var mc = match(mr.decomp, words, S.tagsOf);
        if (mc) memStack.push(reassemble(mr.reasm, mc));
      }

      for (var i = 0; i < stack.length; i++) {
        var res = applyEntry(stack[i], words, 0);
        if (res === " NEWKEY") continue;
        if (res !== null) return res;
      }
      // nothing matched: recall a memory on the 4th-state of the counter, else NONE
      if (memStack.length && replyCount % 4 === 0) return memStack.shift();
      return pickNone();
    }

    function pickNone() {
      if (!S.none) return "PLEASE GO ON";
      return applyEntry(S.none, [""], 0) || "PLEASE GO ON";
    }

    function hash(w) { var h = 0; w = w || ""; for (var i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0; return h; }

    return {
      greeting: function () { return S.greeting; },
      reply: reply,
      keywords: function () { return Object.keys(S.keys).sort(); }
    };
  }

  window.ELIZA = { make: make };
})();
