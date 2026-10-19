function SetUpServer() {
  SetUpEliza()
  TopHeader = \
    "<HTML><title>An HTTP-based System with GAWK</title>\
    <HEAD><META HTTP-EQUIV=\"Content-Type\"\
    CONTENT=\"text/html; charset=iso-8859-1\"></HEAD>\
    <BODY BGCOLOR=\"#ffffff\" TEXT=\"#000000\"\
    LINK=\"#0000ff\" VLINK=\"#0000ff\"\
    ALINK=\"#0000ff\"> <A NAME=\"top\">"
  TopDoc    = "\
   <h2>Please choose one of the following actions:</h2>\
   <UL>\
   <LI>\
   <A HREF=" MyPrefix "/AboutServer>About this server</A>\
   </LI><LI>\
   <A HREF=" MyPrefix "/AboutELIZA>About Eliza</A></LI>\
   <LI>\
   <A HREF=" MyPrefix \
      "/StartELIZA>Start talking to Eliza</A></LI></UL>"
  TopFooter = "</BODY></HTML>"
}


function HandleGET() {
  # A real HTTP server would treat some parts of the URI as a file name.
  # We take parts of the URI as menu choices and go on accordingly.
  if (MENU[2] == "AboutServer") {
    Document    = "This is not a CGI script.\
      This is an httpd, an HTML file, and a CGI script all \
      in one GAWK script. It needs no separate www-server, \
      no installation, and no root privileges.\
      <p>To run it, do this:</p><ul>\
      <li> start this script with \"gawk -f httpserver.awk\",</li>\
      <li> and on the same host let your www browser open location\
           \"http://localhost:8080\"</li>\
      </ul>\<p>\ Details of HTTP come from:</p><ul>\
            <li>Hethmon:  Illustrated Guide to HTTP</p>\
            <li>RFC 2068</li></ul><p>JK 14.9.1997</p>"
  } else if (MENU[2] == "AboutELIZA") {
    Document    = "This is an implementation of the famous ELIZA\
        program by Joseph Weizenbaum. It is written in GAWK and\
        uses an HTML GUI."
  } else if (MENU[2] == "StartELIZA") {
    gsub(/\+/, " ", GETARG["YouSay"])
    # Here we also have to substitute coded special characters
    Document    = "<form method=GET>" \
      "<h3>" ElizaSays(GETARG["YouSay"]) "</h3>\
      <p><input type=text name=YouSay value=\"\" size=60>\
      <br><input type=submit value=\"Tell her about it\"></p></form>"
  }
}


function ElizaSays(YouSay) {
  if (YouSay == "") {
    cost = 0
    answer = "HI, IM ELIZA, TELL ME YOUR PROBLEM"
  } else {
    q = toupper(YouSay)
    gsub("'", "", q)
    if (q == qold) {
      answer = "PLEASE DONT REPEAT YOURSELF !"
    } else {
      if (index(q, "SHUT UP") > 0) {
        answer = "WELL, PLEASE PAY YOUR BILL. ITS EXACTLY ... $"\
                 int(100*rand()+30+cost/100)
      } else {
        qold = q
        w = "-"                 # no keyword recognized yet
        for (i in k) {          # search for keywords
          if (index(q, i) > 0) {
            w = i
            break
          }
        }
        if (w == "-") {         # no keyword, take old subject
          w    = wold
          subj = subjold
        } else {                # find subject
          subj = substr(q, index(q, w) + length(w)+1)
          wold = w
          subjold = subj        #  remember keyword and subject
        }
        for (i in conj)
           gsub(i, conj[i], q)   # conjugation
        # from all answers to this keyword, select one randomly
        answer = r[indices[int(split(k[w], indices) * rand()) + 1]]
        # insert subject into answer
        gsub("_", subj, answer)
      }
    }
  }
  cost += length(answer) # for later payment : 1 cent per character
  return answer
}


function SetUpEliza() {
  srand()
  wold = "-"
  subjold = " "

  # table for conjugation
  conj[" ARE "     ] = " AM "
  conj["WERE "     ] = "WAS "
  conj[" YOU "     ] = " I "
  conj["YOUR "     ] = "MY "
  conj[" IVE "     ] =\
  conj[" I HAVE "  ] = " YOU HAVE "
  conj[" YOUVE "   ] =\
  conj[" YOU HAVE "] = " I HAVE "
  conj[" IM "      ] =\
  conj[" I AM "    ] = " YOU ARE "
  conj[" YOURE "   ] =\
  conj[" YOU ARE " ] = " I AM "

  # table of all answers
  r[1]   = "DONT YOU BELIEVE THAT I CAN  _"
  r[2]   = "PERHAPS YOU WOULD LIKE TO BE ABLE TO _ ?"
  ...
