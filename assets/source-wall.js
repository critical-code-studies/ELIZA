/* Hero wallpaper: the recovered MAD-SLIP source of ELIZA, drifting slowly
   upward behind the hero like a CTSS line-printer listing on the IBM 7094.
   Faint coral phosphor on console charcoal; a handful of load-bearing tokens
   (KEYWORD scan, HASH, YMATCH, the NOMATCH replies, PLEASE INSTRUCT ME) glow
   brighter as they pass an ignition band near the centre. The lines are
   verbatim from ELIZA-1965b.mad (the printout found in Weizenbaum's MIT
   archive in 2021). Honours prefers-reduced-motion (static dim listing). */
(function () {
  var canvas = document.getElementById('sourcewall');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // verbatim excerpts from ELIZA-1965b.mad, with the original CTSS sequence
  // numbers in the last columns. The heart of ELIZA: keyword scan, hashing,
  // the YMATCH decomposition, reassembly, memory, and the human-facing strings.
  var SRC = [
    "        ELIZA   MAD",
    "            EXTERNAL FUNCTION (MYTRAN,KEY)                    000010",
    "            NORMAL MODE IS INTEGER                           000020",
    "            PRINT COMMENT $WHICH SCRIPT DO YOU WISH TO PLAY$ 000060",
    "START       LISTRD.(MTLIST.(INPUT),0)                        000300",
    "            T'H SCAN, FOR WORD=POPTOP.(INPUT)                 000780",
    "                I=HASH.(WORD,5)                               000790",
    "                W'R LISTMT.(KEY(I)) .NE. 0, T'O SCAN          000800",
    "                S=SEQRDR.(KEY(I))                             000810",
    "FOUND           KEYWRD=SEQLR.(S,F)                            000830",
    "                W'R RANK .G. HIRANK, T'O SAVE                 001150",
    "                   OR W'R KEYWRD .E. MEMORY                   001220",
    "                    I=HASH.(BOT.(INPUT),2)+1                  001230",
    "                    NEWBOT.(REGEL.(MYTRAN(I),INPUT,MINE),     001240",
    "                                            MYLIST)           001250",
    "TRY             W'R YMATCH.(TOP.(ES),INPUT,MTLIST.(TEST)) .E. 0, T'O MATCH",
    "MATCH           ASSMBL.(REASMB,TEST,OUTPUT)                   001560",
    "                TPRINT.(OUTPUT,0)                             001600",
    "                T'O START                                     001620",
    "NOMATCH(1)      PRINT COMMENT $PLEASE CONTINUE $              002200",
    "NOMATCH(2)      PRINT COMMENT $HMMM $                         002220",
    "NOMATCH(3)      PRINT COMMENT $GO ON , PLEASE $               002240",
    "NOMATCH(4)      PRINT COMMENT $I SEE $                        002260",
    "CHANGE      PRINT COMMENT $PLEASE INSTRUCT ME$                001400",
    "            PRINT COMMENT $MEMORY LIST FOLLOWS$               001610",
    "            SUBJECT=KEY(HASH.(THEME,5))                       001680",
    "            E'N                                               002200"
  ];

  var W, H, DPR, line = 18, t = 0, raf, offset = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    line = W < 740 ? 15 : 19;
    ctx.font = (line - 6) + "px ui-monospace, 'SF Mono', Menlo, monospace";
    ctx.textBaseline = "top";
  }

  // tokens that should glow when near the ignition band
  var HOT = /(KEYWORD|KEYWRD|HASH|YMATCH|ASSMBL|REASMB|MEMORY|PLEASE INSTRUCT ME|WHICH SCRIPT|NOMATCH|REGEL|MYTRAN|MYLIST)/;

  function drawLine(text, y) {
    var dist = Math.abs(y - H * 0.46);
    var band = Math.max(0, 1 - dist / (H * 0.42));     // brighter near centre
    var base = 0.10 + band * 0.30;
    var hot = HOT.test(text);
    ctx.fillStyle = hot
      ? "rgba(239,111,68," + (0.18 + band * 0.62) + ")"
      : "rgba(232,228,218," + base + ")";
    if (hot && band > 0.5) ctx.shadowColor = "rgba(239,111,68,0.6)", ctx.shadowBlur = 8;
    else ctx.shadowBlur = 0;
    ctx.fillText(text, W < 740 ? 14 : Math.max(24, W * 0.06), y);
    ctx.shadowBlur = 0;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var total = SRC.length * line;
    offset = (offset + 0.28) % total;                   // slow upward drift
    // draw enough copies to fill the height, looping
    var startIdx = Math.floor(offset / line);
    var y0 = -(offset % line);
    for (var row = 0; y0 + row * line < H + line; row++) {
      var idx = (startIdx + row) % SRC.length;
      drawLine(SRC[idx], y0 + row * line);
    }
    raf = requestAnimationFrame(frame);
  }

  function staticDraw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i * line < H + line; i++) drawLine(SRC[i % SRC.length], i * line);
  }

  function start() { resize(); if (reduce) staticDraw(); else { cancelAnimationFrame(raf); frame(); } }
  window.addEventListener('resize', function () { resize(); if (reduce) staticDraw(); });
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
