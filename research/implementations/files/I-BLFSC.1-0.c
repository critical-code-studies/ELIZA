/* ELIZA - (c) 1981 The Software Toolworks, Ltd. All Rights Reserved */
/* Based on ELIZA by Joseph Weisenbaum, Comm. ACM V.9 no.1 January 1966 */

char *higuy = "\tELIZA 1.0 (2/7/84) - (c) 1981 The Software Toolworks\n\n";

/*#define HDOS HDOS       /*Comment out for CP/M version */
#define MSDOS MSDOS     /* Comment out for 8080 version */


/* Change history:
	1.1 9/16/85     Add TRIMMED version for non-Golden preloaded.
	1.1 2/26/85     Add GOLDEN version to preload script.
	1.0 2/7/84      Better line length routine for PCjr.
	1.0 10/8/82     ZDOS/PCDOS version (Not tested again on CP/M).
	1.0 1/23/82     Patch cell for line length; overflow bug.
	1.0 9/24/81     Original release. */

/* Basic data structure can be either list cell or atom.
  ATOM:         NEXT links keyword list.
		LINK is link for atomlist.
		TYPE: First byte is 1.
		KEY: for keywords, points back to keyword list.
  NUM. ATOM:    "Address" of atom is 1 in high byte, unsigned value in low
  LIST CELL:    NEXT points to next cell in list.
		LINK points to value of this list item.
		TYPE: First byte is 0 */

#ifdef MSDOS
#include "stdio.h"
FILE *deffout,*fout;
static putcha(c) { return putc(c,fout); }
#define NOFILE NULL

#else
#define FILE char
#define NULL -1
#define NOFILE 0
#define deffout 0       /* Default output descriptor */
extern FILE *fout;      /* Standard output */
#define putcha putchar
#define alloc sbrk
#endif

/* Definitions for atom or list cell */
#define NEXT 0          /* Forward pointer in linked list */
#define LINK 1          /* Link for list of all atoms */
#define TYPE 2          /* First byte 0 for list, -1 numeric atom, 1 atom */
#define KEY 3           /* For keywords, points to keylist entry */
/* Definitions for atom cell only */
#define NAME 4          /* Beginning of name data - 0 if list cell */

#define INDOFF 512      /* Starting point for index in linearizing list */
#define INDEND 1000     /* Better not have any data pre-stored below here */
#define NBUCKETS 29     /* Number of buckets for atoms */

int buckets[NBUCKETS];  /* The buckets */
int *nonelist=0;        /* List for special NONE keyword */
int *hello;             /* Greetings from ELIZA */
int *dlist=0;           /* Chain of DLIST definitions. */
int *memory=0;          /* Memory rewrite list */

int *dlista,            /* Atom for DLIST */
    *slasha,            /* Atom for slash */
    *stara,             /* Atom for asterisk */
    *equalsa,           /* Atom for equals */
    *nonea,             /* Atom for none */
    *exita,             /* Atom for exit */
    *savea,             /* Atom for save */
    *prea,              /* Atom for pre */
    *memrya,            /* Atom for memory */
    *newkeya;           /* Atom for newkey */

FILE *infile = 0;       /* Input file channel */
#define LTOKEN 64
char token[LTOKEN];     /* Input token */
#define TLINE 80        /* Number of tokens on input line */
#define NSTACK 20       /* Number of keywords in one phrase */
#define NELTS 40        /* Number of elements in a match */
#define NFREE 200       /* Max number of characters in a user input line */
char *tspace,*espace,   /* Beginning and end of temp string space.*/
		*fwee;  /* Next fwee byte */

#ifndef LLINE
#define LLINE 80

int zlineln=LLINE;      /* Length of line - patch for Osborne */

/* Memory feature.  Memory is a list of keyword right hand sides, taken
   from the MEMORY keyword inputs.  Membuf is a circular buffer which holds
   0-terminated memory responses.  */
char *membuf,*memend,   /* Output response buffer and end */
	*memin,         /* Pointer to next available char for storing response*/
	*memout,        /* Pointer to next response for output. */
	*memflag=0;     /* When nonzero, directs "output" into buffer. */
int memcount=0;         /* Number of inputs since a response from memory */
#define LMEM 1000       /* Maximum size of memory buffer */

/* Save feature.  Save buffer is savebuf - saveend; savein is input pointer.
   Saveflg = 0 when buffer is partly empty; becomes 1 when buffer recycles
   at which time contents are from savein to savein-1. */
char *savebuf,*saveend,*savein;
int saveflg = -1;

char *filename="DOCTOR";/* Default script name */
int nextc=0;            /* Next input character */
int dbug=0;             /* Debugging switch */
extern char lastout;    /* Last character typed */

main(argc,argv) char *argv[]; {
	char *input[TLINE],*stack[TLINE];
	static int *ip,*jp,*kp,i,prio,nstack;
	char *c,**w,**fw;

#ifdef MSDOS
	deffout = fout = stdout;
#endif
	putstr(higuy);
#ifdef TRIMMED
	putstr("   A product of\nThe Software Toolworks\n");
	putstr("14478 Glorietta Drive\nSherman Oaks, CA 91423\n\n");
#endif
	/* Process arguments */
	while (argc > 1) {
		c = *++argv; --argc;
		if (*c == '-') switch (*++c) {
			case 'd': case 'D': dbug = 1; break;
			default: putstr("Bad flag: -"); putchar(*c);
				putchar('\n'); }
		else filename = c; }
	infile = -1;

	for (i = NBUCKETS; i; ) buckets[--i] = 0;
	/* Enter some special atoms */
	dlista = atom("DLIST",1);
	slasha = atom("/",1);
	stara = atom("*",1);
	equalsa = atom("=",1);
	newkeya = atom("NEWKEY",1);
	exita = atom("EXIT",1);
	savea = atom("SAVE",1);
	prea = atom("PRE",1);
	memrya = atom("MEMORY",1);
	nonea = atom("NONE",1);

	/* Read the script */
	if ((infile = openf(filename)) == NOFILE) {
		putstr("Can't open script file:");
		putstr(filename); putchr('\n'); exit(); }
	hello = readlist();
	readkeylist();
	fclose(infile);

	if (dbug) { putstr("DLIST: "); plist(dlist); putstr("\n\n");
		    putstr("MEMORY: "); plist(memory); putstr("\n\n"); }
	infile = 0; nextc = 0;
	memend = LMEM + (membuf = memin = memout = blloc(LMEM));
	tspace = blloc(NFREE + LTOKEN); espace = tspace + NFREE + LTOKEN;
#ifdef MSDOS
	/*allmem();     /* we already have all of memory */
	/* 64k - next fwee location - fudge factor */
/*      i = 0xFFFF - sbrk(0) - 1000;
*** fudge for MSDOS C/80 */   i = 10000;
	saveend = i + (savein = savebuf = blloc(i));
#else
	saveend = 10 + (savein = savebuf = espace);
	for (i = 0; (c = alloc(100)) != -1; ++i) saveend = c + 100;
	i =* 100;
#endif
	if (dbug) {outdec(i);
		   putstr(" bytes of memory still available.\n"); }
	saveflg = 0;                    /* Turn it on */

	/* Say hello to the pigeon. */
	for (ip = hello; ip; ip = ip[NEXT]) outtoken(ip[LINK]);
	endout();

	/* Talk to him. */
	for (;;) {
		getline(input);
		if (*input == savea && endit(input[1])) { save(); continue; }

		/* Following keyword scan from Fig. 2 flowchart of CACM paper */
		w = fw = input;
		nextphrase: prio = nstack = 0;          /* Scan next phrase */
		for (;;) {
		    if (isatoken(*w)) { if (ip = iskeyword(*w)) {
			if (keyprio(*w) > prio) {       /* Prio highest yet? */
			  for (i = nstack; i > 0; --i)  /* Stack on top */
				stack[i] = stack[i-1];
			  if (nstack < NSTACK-1) ++nstack;
			  stack[0] = *w;
			  prio = keyprio(*w); }
			else stack[nstack++] = *w;      /* Stack on bottom */
			ip = *w; ip = ip[KEY]; ip = ip[NEXT]; /* Check for = */
			if (ip[LINK] == equalsa) {      /* Replace by equiv. */
			  ip = ip[NEXT]; *w = ip[LINK]; }
			}}
		    else if (endit(*w)) break;          /* End of phrase? */
		    ++w;                                /* Next word. */
		    }
		if (dbug) {
		    for (i = 0; i < nstack; ++i) {
			putstr("Keyword "); outdec(i);
			putstr(" prio ");
			outdec(keyprio(stack[i])); outtoken(stack[i]);
			putchr('\n'); }
		    lastout = ' '; putstr("INPUT AFTER REWRITE: ");
		    for (ip = fw; ip <= w; ip++) outtoken(*ip);
		    endout(); }

		/* Start trying to match keywords from stack */
		for (i = 0; i < nstack; ++i) {          /* For keywords */
		    for (ip = memory; ip; ip = ip[NEXT]) {   /* Memory? */
			jp = ip[LINK]; if (jp[LINK] == stack[i]) {
			    if (dbug) { putstr("TRYING MEMORY MATCH: ");
					plist(jp); putchr('\n'); }
			    memflag = memin;            /* Start diversion */
			    prio = dbug; dbug = 0;      /* Turn off printout*/
			    if (match(next(jp),fw)      /* Got one! */
				      && memstore(0)) { /* ... and it fits. */
					memin = memflag;/* so keep it. */
					if (dbug) {putstr("STORED IN MEMORY: ");
						   putstr(memin);
					}         }
			    dbug = prio;
			    memflag = memcount = 0; break;   /* End diversion */
			}   }
		    if (match(keymatch(stack[i]),fw)) goto success;
		    }
		/* End of keyword scan */
		while (**w != '\n') if (endit(*++w) == 0) { /* Another phrase?*/
			fw = w; goto nextphrase; }      /* Yes - go check it.*/
		if (memcount > 5 && memin != memout) {  /* Memory response? */
			for (;;) {                      /* Output it */
				c = *memout++;
				if (memout == memend) memout = membuf;
				if (c) putchr(c); else break; }
			memcount = -1; }
		  else if (nonelist == 0 || match(next(nonelist),fw) == 0)
		    putstr("Error - NONE keyword missing or not applicable.\n");
		success: ++memcount;
	}       }

/* Try matching the input against the pattern list for a keyword. */
match(patlist,fw) int *patlist,*fw; {
	static int *pat,*w,*x,nelt,*p,*ip,i,*jp;
	int elt[NELTS],newphr[LTOKEN];
    newkey:
	elt[0] = fw;
	for (; patlist; patlist = patlist[NEXT]) {
		pat = patlist[LINK];
		if (pat[LINK] == equalsa) { p = pat; goto equals; }
		if (dbug) {
		  putstr("Matching pattern "); plist(pat[LINK]); putchr('\n');}
		nelt = 0; w = fw;
		for (p = pat[LINK]; p; ) {
			if ((w = matchelt(p,w)) == 0) {      /* Pattern fails */
				if (dbug) putstr("Pattern fails.\n");
				break; }
			if (dbug) {plist(p[LINK]); putstr(" matches ");
				   for (ip = elt[nelt]; ip < w; ++ip)
				       outtoken(*ip); putchr('\n'); }
			elt[++nelt] = w;
			if (nelt == NELTS) goto success;
			if ((p = p[NEXT]) == 0) {
				if (endit(*w)) goto success;
				break;              /* Unmatched stuff left */
		}       }       }
	return 0;   /* Did not find a match - return failure. */

    success:    /* Found a match.  Pick off first action rule; place at end */
	if (pat[NEXT] == 0) return 0;   /* If no actions, ignore. */
	p = pat[NEXT];                  /* p is the one we do. */
	pat[NEXT] = p[NEXT];            /* Take it out of line; */
	while (pat[NEXT]) pat = pat[NEXT];      /* Find end of list */
	pat[NEXT] = p; p[NEXT] = 0;     /* Put p at the end. */
	if (dbug) {putstr("Performing action: ");plist(p[LINK]); putchr('\n');}
	for (p = p[LINK]; p; p = p[NEXT]) {     /* Do the rewrite */
		ip = p[LINK];
		if (ip == equalsa) { equals:    /* = newkeyword */
			ip = next(p);
			if (ip[LINK] == exita) { /* Special case: = EXIT */
				while (ip = ip[NEXT]) outtoken(ip[LINK]);
				endout(); exit(); }
			if (patlist = keymatch(ip[LINK])) goto newkey;
			putstr("Error: (= nonkeyword): "); plist(p);
			putchr('\n');
			return 0; }
		if (ip == newkeya) return 0;    /* NEWKEY - so this one fails */
		if (ip == prea) {               /* (PRE (COMP RULE) (=NEW)) */
			p = next(p);            /* Rewrite */
			for (x = newphr, ip = p[LINK]; ip; ip = ip[NEXT])
			    if (isnum(jp = ip[LINK]) &&
					(i = val(jp)) <= nelt  && i > 0)
				   for (w = elt[i-1]; w < elt[i]; ) *x++ = *w++;
			    else if (isatom(jp)) *x++ = jp;
			*x++ = fwee; *fwee++ = '\n'; *fwee++ = 0;
			if (dbug) { putstr("INPUT AFTER PRE REWRITE: ");
				for (w = newphr; w < x; outtoken(*w++));
				endout(); }
			p = next(p);
			p = p[LINK];
			if (p[LINK] == equalsa && (ip = p[NEXT]) &&
						(patlist = keymatch(ip[LINK])))
				return match(patlist,newphr);
			putstr("Error - (= keyword) missing in PRE: ");
			plist(p); putchr('\n'); return 0;
			}
		if (isnum(ip) &&                /* Output pat. el't */
			(i = val(ip)) <= nelt  && i > 0)
		    for (w = elt[i-1]; w < elt[i]; ) outtoken(*w++);
		 else if (isatom(ip)) outtoken(ip);      /* Output a word */
		}
	endout();
	return 1; }                     /* Return success */

/* Match first elt in pat starting at w; return first unmatched token, or 0 */
matchelt(pat,w) int *pat,*w; {
	int *p,i,*ip,*jp;

	p = pat[LINK];
	if (isnum(p)) {
		if (i = val(p)) {               /* Nonzero number */
			for (; i--; ++w) if (endit(*w)) return 0;
			return w; }
		if ((p = pat[NEXT]) == 0) {     /* Terminal 0 */
			while (endit(*w) == 0) ++w;
			return w; }             /* Match everything left */
		while (endit(*w) == 0) {        /* Match up to next match */
			if (matchelt(p,w)) return w;
			++w; }
		return 0; }                     /* No next match - fail */
	if (isatom(p))                          /* Atom - match if equal */
		return p == *w ? w+1 : 0;
	if (p[LINK] == stara)                   /* List of words */
		ip = p[NEXT];
	 else if (p[LINK] == slasha) {          /* DLIST */
		p = next(p); p = p[LINK];
		for (ip = dlist; ip; ip = ip[NEXT]) {   /* Search DLIST */
			jp = ip[LINK];
			if (p == jp[LINK]) {ip = jp[NEXT]; break; } }
		if (ip == 0) {putstr("Error - undefined DLIST: ");
			      outtoken(p); putchr('\n'); return 0; }
		}
	else { putstr("Error - bad pattern element: "); plist(p);
	       putchr('\n'); return 0; }
	for (; ip; ip = ip[NEXT])               /* Search list for word */
	       if (ip[LINK] == *w) return w+1;
	return 0;
	}

/*      keymatch(p)     P is keyword; returns pointer to list of matches
	endit(w)        W is pointer to a terminator character.
	next(p)         P is list; return next elt; error if none.
	memstore(c)     Store char in mem buffer, if any room; return success.
	save()          Begin saving, if not already in progress.
*/
save() {
	char *p,outfile[50];
	if (fout != deffout) return
		putstr("\nOUR CONVERSATION IS ALREADY BEING SAVED.\n\n");
	putstr("\nWHAT FILE NAME SHALL I USE FOR SAVING OUR CONVERSATION?\n\n");
	for (p = outfile; (*p++ = getch()) != '\n'; );
	*--p = 0;
	if ((fout = fopen(outfile,"w")) == NOFILE) {
		fout = deffout;
		putstr("\nI CAN'T CREATE A FILE CALLED "); putstr(outfile);
		putstr(".  SORRY.\n\n");
		return; }
	p = saveflg ? savein : savebuf;
	do {    putcha(*p++);
		if (p == saveend) p = savebuf;
	   } while (p != savein);
	putstr( "\nALL RIGHT.  PLEASE GO ON.\n\n");
	}

memstore(c) char c; {
	static char *p;
	p = memflag; if (++p == memend) p = membuf;
	if (p == memout) return 0;
	*memflag = c; memflag = p; return 1; }

next(p) int *p; {
	if (p[NEXT]) return p[NEXT];
	putstr("Error - missing element(s) in a list: ");
	plist(p); putchr('\n'); return p; }

endit(w) char *w; { return w >= tspace && terminator(*w); }

keymatch(p) int *p; {
	static int *ip;
	if (dbug) { putstr("Invoking keyword "); outtoken(p); putchr('\n'); }
	p = p[KEY]; p = p[NEXT];        /* Skip keyword */
	if (p[LINK] == equalsa) {       /* Skip rewrite */
		p = p[NEXT]; p = p[NEXT]; }
	if (isnum(p[LINK])) p = p[NEXT];/* Skip priority */
	return p; }

char *openp;
openf(f) char *f; {             /* Open file -- if HDOS, use program device */
	char name[30];          /* Use default extension SCR */
	static int flg;
	static char *p;
	openp = name;
	flg = 0;
#ifdef HDOS
	for (p = f; *p; ) if (*p++ == ':') goto hasdev;
#asm
	LHLD openp              /* Get name of system file */
	LXI D,6
	XCHG
	DAD D
	MVI A,-1
	DB 377Q,54Q             /* SCALL .NAME */
#endasm
	openp =+ 3; *openp++ = ':';
#endif
	hasdev:
	while (*openp++ = *f) if (*f++ == '.') flg = 1;
	if (flg == 0) for (f = ".SCR",--openp; *openp++ = *f++; );
	return fopen(name,"r"); }

/* Subroutines:
	isatoken(p)     Tells whether p points to a known token atom
	iskeyword(p)    If p is a keyword token, returns ptr to keylist; else 0
	keyprio(p)      Returns priority of keyword p
	outtoken(p)     Outputs atom or string.
	endout()        Terminates current output line.
	getline(ary)    Fills ary with tokens from user's input line.
	plist(l)        Print a list
	readlist()      Read a list from infile.
	atom(s,f)       Look up atom named s in atom list; enter if f != 0;
	lookup(a,link)  Look in list for a sublist beginning with the atom a.
	link(ip,jp)     Ip is end of a list; add jp to it and return new end.
	isatom(ip)      Return nonzero if ip is an atom cell.
	isnum(ip)       Return nonzero if ip is a numeric atom pointer.
	val(ip)         If ip is a numeric atom pointer, returns value.
	atomcell(s)     Return an atom cell big enough to hold the name s.
	listcell        Return a new list cell.
	length(s)       Return length of string, including 0 terminator byte.
	blloc(n)        Alloc(n) with error if memory full.
	putstr(s)       Output a string.
	outdec(n)       Output number n.
	terminator(c)   Tell if c terminates a token.
	numchar(c)      Tell if c is a numeric character.
	nextnonblank()  Eat next blank char(s) and return nonblank following.
	nexttoken()     Eat blanks, stuff next token into array "token".
	gch()           Return next character from infile.
	nch()           Return next character, but don't eat it yet.
*/

isatoken(p) char *p; {return p < tspace || p >= espace; }

iskeyword(p) int *p; { return isatoken(p) == 0 ? 0 : isnum(p) ? 0 : p[KEY]; }

keyprio(p) int *p; {
	p = p[KEY];             /* Assume it's a keyword */
	p = next(p);            /* Step past any rewrite */
	if (p && p[LINK] == equalsa) { p = next(p); p = p[NEXT]; }
	if (p == 0) return 0;
	p = p[LINK];            /* If next elt is a number, return its val */
	return isnum(p) ? val(p) : 0; }

readkeylist() {
	static int *jp,*w,*wnext,*w3rd;
	while (jp = readlist()) {
		if (dbug) { putstr("RULE: ");
			    plist(jp); putstr("\n\n"); }
		for (w = jp; wnext = w[NEXT]; w = wnext) {    /* Find DLISTs */
		    if (wnext[LINK] == dlista) {        /* Got one */
			if ((w3rd = wnext[NEXT]) == 0) {
			   err: putstr("*** Error - Bad DLIST specification: ");
				plist(jp); break; }
			if (isatom(w3rd)) goto err;
			w[NEXT] = w3rd[NEXT];           /* Link it out */
			if (isatom(w = w3rd[LINK])) goto err;
			for (; w; w = w[NEXT])          /* Put on dlists */
			    if (w[LINK] != slasha)
				enter(w[LINK],jp[LINK],&dlist);
			break;
		     }  }
		if (jp[NEXT] == 0) continue;            /* DLIST, not keywd */
		if (isatom(w = jp[LINK]) == 0 || isnum(w)) {
			putstr("*** Error - bad keyword: ");
			kerr: plist(jp); putchr('\n'); }
		  else if (w == nonea) {                /* Divert NONE */
			if (nonelist) goto twice;
			nonelist = jp; }
		  else if (w == memrya) {              /* Divert MEMORY */
			wnext = memory;
			memory = listcell();
			memory[NEXT] = wnext;
			memory[LINK] = next(jp);  }
		  else if (w[KEY]) { twice:
			putstr("*** Error - keyword defined twice: ");
			goto kerr; }
		  else w[KEY] = jp;             /* Enter back ptr to keylist */
	}       }

/* List is a pointer to a list of lists.  The first element in each sublist is a
   key, followed by values.  This routine puts value on the sublist for key. */
enter(key,value,list) int *key,*value,*list; {
	static int *ip,*jp,*kp;
	for (ip = *list; ip; ip = ip[NEXT]) {
		jp = ip[LINK];
		if (jp[LINK] == key) {entre:    /* Found key. */
			kp = listcell();        /* Link value in */
			kp[LINK] = value;
			kp[NEXT] = jp[NEXT];
			jp[NEXT] = kp;
			return;
		}       }
	kp = listcell();                        /* Not found. */
	kp[NEXT] = *list; *list = kp;           /* Make new entry in list */
	kp[LINK] = jp = listcell();             /* Put key at head of entry */
	jp[LINK] = key;
	goto entre;                             /* Go complete entry */
	}

readlist() {
	int *ip,*np;
	static int *jp;
	if (nextnonblank() != '(') {    /* Atom follows; read it */
		if (nch() <= 0) return 0;
		nexttoken();
		return atom(token,1); }
	/* Not an atom.  Create a list. */
	gch();                          /* Gobble ( */
	np = &ip; ip = 0;
	while (nextnonblank() != ')')
		if (nch() <= 0) {
			putstr("End of script file - missing ).\n");
			return ip; }
		else if (jp = readlist()) np=link(np,jp); else return ip;
	gch();                          /* Gobble ) */
	return ip; }

char lastout='\n';
outtoken(p) char *p; {
	static char *q;
	static int *ip;
	if (isatoken(p)) {ip = p; q = &ip[NAME]; } else q = p;
	putstr(lastout == '\n' ? "\n" : lastout == '.' ? "  " :
					terminator(*q) ? "" : " ");
	ckline(q);
	while (*q) putchr(lastout = *q++);
	}

endout() {              /* Terminate output sentence */
	switch (lastout) {
		default: putchr('.');
		case '.':
		case '?': case '!': lastout = putchr('\n'); putchr('\n');
	}       }

/* Get a typed line from keyboard.  Process it into tokens.
  A token is either (1) a pointer to the word in temp string space;
  (2) a pointer to the keylist entry for a keyword. */
getline(tokens) int *tokens; {
	static char *p;
	static int ntokens;

	fwee = tspace; ntokens = -1;
	for (;;) {
		if (ntokens < TLINE-1) ntokens++;
		nexttoken();
		if (terminator(token[0]) ||
		    (tokens[ntokens] = atom(token,0)) == 0) {
			tokens[ntokens] = fwee;
			if (fwee < espace) for (p = token; *fwee++ = *p++; ); }
		if (token[0] == '\n') return;
	}       }


plist(ip) int *ip; {
	if (ip == 0) putstr("<empty>");
	else if (isnum(ip)) {
		outdec(val(ip)); }
	else if (isatom(ip)) putstr(ip+NAME);
	else {  putchr('(');
		while (ip) {
			plist(ip[LINK]);
			if (ip = ip[NEXT]) putchr(' '); }
		putchr(')');
	}       }

link(ip,jp) int *ip,*jp; {
	ip[NEXT] = listcell();
	ip = ip[NEXT];
	ip[LINK] = jp;
	return ip; }

int *atomqq,*cbucket;
/* Look up atom s in atom list.  If not found, f => enter it. */
atom(s,f) char *s; int f; {
	static int i,*np;
	static char *p,*q;

	if (numchar(*s)) {                      /* Number - compute value */
		p = s;
		if (f == 0) return 0;
		for (i = 0; *s; ) i = 10 * i + *s++ - '0';
		if (i & 0177400) {putstr("Error - number over 255: ");
				  putstr(p); putchr('\n'); }
		return i + 0400; }
	atomqq = s;
	i = *s + 3 * s[1];                      /* Hash on first 3 letter */
	if (s[1]) i += 7 * s[2];
	i %= NBUCKETS;                          /* Get bucket for this atom */
	if (cbucket = np = buckets[i]) {
#ifdef MSDOS
	  look: p = s; q = &np[NAME];
		while (*p == *q++) if (*p++ == 0) return np;
		if (np[LINK]) { np = np[LINK]; goto look; }
#else
#asm
	LHLD cbucket
	XCHG                    ; DE = PTR TO ATOMLIST EL'T
LOOK:   LXI H,2*NAME
	DAD D
	PUSH H
	POP B                   ; BC = PTR TO NAME
	LHLD atomqq             ; HL = NAME BEING SEARCHED FOR
LOOP:   LDAX B
	CMP M
	JNZ DRAT                ; CHAR DOESN'T MATCH => FAILS.
	INX B
	INX H
	ORA A                   ; CHAR NONZERO => KEEP LOOKING.
	JNZ LOOP
	XCHG                    ; ZERO CHARS MATCH => SUCCESS
#endasm
	return;
#asm
DRAT:   LXI H,2*LINK            ; FAILS - CHECK NEXT ATOM IN LIST.
	DAD D
	MOV E,M
	INX H
	MOV D,M
	MOV A,D
	ORA E
	JNZ LOOK
#endasm
#endif
		}
	if (f == 0) return 0;
	np = atomcell(s);
	np[LINK] = buckets[i];                  /* Link into bucket list */
	buckets[i] = np;
	for (q = &np[NAME]; *q++ = *s++; )
	np[TYPE] = 1;                           /* Type 1 for atom */
	return np; }

/* Look up in list the list element beginning with the atom named s. */
lookup(a,list) int *a; int *list; {
	static int *ip,*jp;
	for (ip = list; ip; ip = ip[NEXT]) {
		jp = ip[LINK]; if (jp[LINK] = a) return jp;
		}
	return 0; }

isatom(ip) int *ip; { return isnum(ip) ? -1 : ip[TYPE] & 0377; }

isnum(ip) int ip; { return ((ip & 0177400) == 0400); }

val(ip) int ip; { return ip & 0377; }

atomcell(s) char *s; {
	static int *p, n;
	n = NAME + NAME + length(s);
	do { p = blloc(n); } while (isnum(p));        /* No low values please */
	p[KEY] = p[NEXT] = p[LINK] = p[TYPE] = 0;
	return p; }

listcell() {
	static int *p;
	static char *c;
	c = p = blloc(TYPE + TYPE + 1);
	c[TYPE+TYPE] = 0;
	p[NEXT] = p[LINK] = 0;
	return p; }

/* Return length of string s, including terminating 0 byte */
length(s) char *s; {
	static char *p;
	for (p = s; *p++; );
	return p - s; }

blloc(n) int n; {
	static int i;
	static long l;
#ifndef MSDOS
	if (n > 2000 || n < 0) {
		putstr("Internal error: blloc arg too large.\n"); exit(); }
#endif
	l += n;
	if ((i = alloc(n)) != NULL) return i;
	putstr("Error - out of memory.\n");
	printf("Asked for %ld total, %d this time.\n",l,n);
	exit(); }

putstr(s) char *s; {
	ckline(s);
	while (*s) if (putchr(*s++) == ' ') ckline(s); }

int pcol=0;
ckline(s) char *s; {
	static int i;
	for (i = pcol; *s && terminator(*s++) == 0; ++i);
	if (i >= zlineln - 1) putchr('\n'); }

putchr(c) char c; {      /* Output to both output file (if any) and terminal */
	static FILE *f;
	if (memflag) {  /* "Output" being shunted to memory buffer? */
		memstore(c); return c; }
	putcha(c);
	if (fout != deffout) { f = fout; fout = deffout; putcha(c); fout = f; }
	  else savech(c);
	if (c == '\n') pcol = 0;
	 else if (++pcol == zlineln - 1) putchr('\n');
	return c;
	}

/* If conversation not being output to a file, save it in the buffer. */
savech(c) char *c; {
	if (saveflg == -1) return;
	*savein++ = c;
	if (savein == saveend) saveflg = savein = savebuf; }

outdec(n) {
	if (n < 0) { putchr('-'); n = -n; }
	if (n > 9) outdec(n/10);
	putchr('0' + n % 10); }

blank(c) char c; {
#ifdef MSDOS
    switch (c) {
	case ' ': case '\t': return 1;
	case '\n': if (infile) return 1;        /* Ignore in script only */
	default: return 0; }
#else
#asm
	LXI H,2
	DAD SP
	MOV A,M
BLANK1: CPI ' '         ; Enter here for internal call
	RZ
BLANX:  CPI 9
	RZ
	LHLD infile
	CPI 10
	RZ
	LXI H,0
#endasm
#endif
}

/* Tell whether a character terminates a token. */
terminator(c) char c; {
#ifdef MSDOS
  switch (c) {
	case '\n':
	case -1: case '(': case ')': return 1;  /* Always terminators     */
	case '.': case '?': case '!': case ',': /* Terminate only from user */
		case ';': case ':': case '-': return infile ? 0 : -1;
	default: return blank(c);  }
#else
#asm
	POP H
	POP B
	PUSH B
	PUSH H
	MOV A,C
	CPI 100Q                ; Greater than '@'?
	JP TERMNO               ; Not terminator
	LXI H,TERMTB
	DAD B
	MOV A,M
	MOV L,A
	MVI H,0
	ORA A                   ; 0 or 1 is correct value
	RP
	LDA infile              ; -1 return 1 only if infile == 0
	ORA A
	RZ
TERMNO: LXI H,0                 ; Return 'no'
	RET
	DB 1                    ; Table: 1 always term, -1 from user only
TERMTB: DB 0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0      ; TAB, NL
	DB 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
	DB 1,-1,0,0,0,0,0,0,1,1,0,0,-1,-1,-1,0  ; BK ! ( ) , - .
	DB 0,0,0,0,0,0,0,0,0,0,-1,-1,0,0,0,-1   ; : ; ?
#endasm
#endif
}
numchar(c) char c; { return c < '0' ? 0 : c > '9' ? 0 : 1; }

nextnonblank() {
#ifdef MSDOS
	while (blank(nch())) gch();
	return nch();
#else
#asm
	JMP NNB
NNB1:   LXI H,0
	SHLD nextc
NNB:    CALL nch
	MOV A,L
	CALL BLANK1
	MOV A,H
	ORA L
	JNZ NNB1
	LHLD nextc
#endasm
#endif
	}
nexttoken() {
	static char c,*p,*e;
	p = token; e = &token[LTOKEN-2];
	if (terminator( c = nextnonblank())) {
	    if (infile) {
		putstr("In script, misplaced character '"); putchr(nch());
		putchr('\n'); }
	    token[0] = gch(); token[1] = 0; return; }
#ifdef MSDOS
	 else if (nch() == '/' || nch() == '*'          /* Two special tokens */
		|| nch() == '=') *p++ = gch();
	 else if (numchar(c)) while (numchar(nch())) {  /* Numeric atom */
		*p = gch(); if (p < e) ++p; }
	 else while (terminator(nch()) == 0) {          /* Vanilla atom */
		*p = gch(); if (p < e) ++p; }
	*p = 0;
#else
#asm
	LDA nextc
	CPI '='+1       ; Rule out special chars.
	JP NXT1
	CPI '='
	JZ NXT2
	CPI '/'
	JZ NXT2
	CPI '*'
	JNZ NXT3
NXT2:   STA token
	XRA A
	STA token+1
	STA nextc
	RET
NXT3:   CPI '0'
	JM NXT1
	CPI '9'+1
	JP NXT1
NXT4:   STA token
	LXI H,0
	SHLD nextc
	LXI H,token+1
NXT4L:  PUSH H
	CALL nch
	MOV A,L
	CPI '0'
	JM NXT9
	CPI '9'+1
	JP NXT9
	LXI H,0
	SHLD nextc      ; (replaces gch())
	POP H
	MOV M,A
	INX H
	JMP NXT4L
NXT9:   POP H
	MVI M,0
	RET
NXT1:   LXI H,token
NXT1L:  LDA nextc
	MOV M,A
	INX H
	PUSH H
	LXI H,0
	SHLD nextc
	CALL nch
	PUSH H
	CALL termina
	POP D
	MOV A,L
	ORA H
	POP H
	JZ NXT1L
	MVI M,0
	RET
#endasm
#endif
	}

/* Routines to get character from infile (or tt:) with one char lookahead */
nch() {
#ifdef MSDOS
	return nextc ? nextc : (nextc = getch());
#else
#asm
	LHLD nextc
	MOV A,L
	ORA H
	RNZ
	CALL getch
	SHLD nextc
#endasm
#endif
}

gch() { static int c;
	if (c = nextc) { nextc = 0; return c; }
	return getch(); }

#ifdef MSDOSX
/* Line input with editing because Lattice doesn't think we need it. */
getchr() {
	static char linbuf[128],*linp;
	static int eol = 1;
	if (eol || *linp == 0) {
		linp = linbuf;
		for (;;) switch (*linp++ = bdos(6, 0xff)) {
			case 0: --linp; continue;  /* Wait for input */
			case 3: putstr("^C"); exit();
			case 24: putch('\\'); putchar('\n');
				 linp = linbuf; continue;
			case '\r': case '\n': goto bk;
			case '\b': case 0177:
				if (--linp == linbuf) continue;
				--linp; putch('\b');
				putch(' '); putch('\b');
				continue;
			default: putch(linp[-1]);
			}
		bk: putchar('\n');
		eol = 0; linp[-1] = '\n'; *linp = 0; linp = linbuf;
		}
	return *linp++;
	}
#else
#define getchr getchar
#endif

int getchc;
getch() {
	if (infile) getchc = getc(infile);
	else {  getchc = getchr();               /* If saving conversation, */
		if (fout != deffout) putcha(getchc);    /* echo to outfile. */
		   else savech(getchc); }
#ifdef MSDOS
	if (getchc >= 'a' && getchc <= 'z') getchc &= 0137;  /* Uppercase it */
	return getchc;
#else
#asm
	LHLD getchc
	MOV A,L
	CPI 'a'
	RM
	CPI 'z'+1
	RP
	ANI 137Q
	MOV L,A
#endasm
#endif
	}
Mw1.03     @                                8   ]    PRN:                                       txt                                                                                                                                                                                                                                        sf
                                                                                                                                                                                                                                                          V