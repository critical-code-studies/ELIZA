---
title: Talking to ELIZA on an ASR 33 Teletype
date: 15 March 2024
author: Anthony Hay
---

Joseph Weizenbaum developed ELIZA between 1964 and 1966 on an IBM 7094 under an operating system called CTSS (Compatible Time-Sharing System). Since ELIZA is an interactive program we can assume he was using some kind of computer terminal (rather than batch processing and card decks). We know he had an IBM 2741 teletypewriter at home at about this time, which prints text onto paper at 14 characters per second. We also know that the participants in the 1965 Project MAC ELIZA pilot study were talking to ELIZA using similar teletypewriters.

The Teletype Model 33 ASR was made at about the same time as the 2741 and was in widespread use. What would it be like to talk to ELIZA over one of those teletypes?

My father, who worked for the UK General Post Office, gave me a GPO surplus ASR 33 teletype in 1978 to use with my 77-68 home computer. The teletype sends and receives data through a serial cable using a protocol called RS-232. I replaced the worn out DB-25 male connector on this cable with a new DB-9 male connector. For this project it was sufficient to connect only DB-9 pins 2 (receive data, RXD), 3 (transmit data, TXD) and 5 (signal ground).

Note that RS-232 was designed to connect Data Terminal Equipment (DTE), such as the ASR 33 teletype or a computer, to Data Communications Equipment (DCE), such as a modem. The connector pins are named with respect to the DTE. So for example, pin 3 TXD is an output at the DTE end and an input at the DCE end. Because I want to connect two DTEs together, my ASR 33 to my computer, I need to use a null-modem cable, which swaps connections such as pins 2 and 3.

My Windows computer dates from 2008 and comes with two RS-232 COM ports built in. So using my null-modem cable I can connect the ASR 33 directly to my PC. Most modern personal computers don’t have RS-232 ports. USB to RS-232 cables are available and I’ll say more about them later.

When you press a key on the ASR 33 keyboard, the machine transmits eleven bits: 1 start bit, 7 ASCII data bits, 1 even parity bit and 2 stop bits. It transmits these at 110 baud, which means it can transmit at a maximum of 10 characters per second. It receives data at the same rate.

I ran the PuTTY terminal emulator on my Windows 10 computer and configured the serial settings baud=110 data=7 parity=e stop=2 for the COM port where the teletype was connected. Using this I could send characters to and receive characters from the teletype. I added code to my recreation of Weizenbaum’s ELIZA to read and write to a serial port under Windows.

My teletype is a 50 year-old electromechanical wonder from a time before software ate the world and it’s good to see it run again. I’ve successfully made simple repairs to it, such as replacing the crumbling rubber pad on the typewheel hammer with a plastic tube. I also mended a snapped platen shaft. But I couldn’t get through the MEN ARE ALL ALIKE dialog without either me or the teletype mistyping something, or something seizing up.

What if your PC doesn’t have a COM port? There are USB to RS-232 adapter cables available. I tried a StarTech ICUSB232FTN cable with an FTDI chip, but it did not work because it does not support the 110 baud rate my ASR 33 requires; the lowest it supports is 300 baud. I also tried a Plugable PL2303-DB9 adapter with a Prolific PL2303GT chip, which does support 110 baud; Windows 10 installed a driver automatically and it worked. On my Apple M1 Mac I confirmed the Plugable cable works too, but only after installing a suitable Prolific driver.

There are other considerations a more complete solution might handle: sending a non-printing NUL after the carriage return and linefeed to give the carriage time to get home; automatically wrapping at column 72; honouring the SIMPLEX / LOCAL / DUPLEX switch; and using the RUB OUT key (which transmits ASCII DEL) since there is no backspace and, once a character is printed on the paper, the ASR 33 has no means of erasing it.

Finally, is this useful? Talking to ELIZA on a slow, noisy mechanical teletype felt like interactive performance art. I could make the machine print words on the paper. ELIZA could make the machine print words on the paper. It was evocative, emotional and exciting; an experience, a happening. Maybe this has helped me come a little closer to understanding how people may have felt when talking to ELIZA in the 1960s.
