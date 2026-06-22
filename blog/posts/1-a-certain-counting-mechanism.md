---
title: A certain counting mechanism
date: 11 January 2024
author: Anthony Hay
---

Joseph Weizenbaum’s ELIZA is quite a simple program. Its algorithm is almost completely described in eight pages of his 1966 CACM paper (Weizenbaum 1966). And yet Weizenbaum says that people became deeply emotionally involved with ELIZA after just a short time talking to it, and they were convinced that ELIZA understood them. That such a simple program could have such a powerful effect is what interests me most about it. In order to better understand how people could feel this way I wanted to experience conversing with ELIZA for myself.

Over the last 60 years there have been many versions of ELIZA made by many different people. But these seemed to be inspired by ELIZA rather than accurate recreations and I wanted to be sure I was seeing what the people in 1966 would have seen. Although the 1966 CACM paper is a good description of how ELIZA works, I was disappointed that his description of the mechanism that decides when to recall a memory is vague.

Weizenbaum states that when “a certain counting mechanism is in a particular state” the memory will be recalled (Weizenbaum 1966: 41). He also says that the mechanism used to create memories is partly random. So it seemed it would not be possible to recreate an ELIZA and know that your conversation with it was exactly what it would have been with the original.

That all changed when the original ELIZA source code was rediscovered in 2020 (see Berry et al. 2023). This code is not the final version, as it is missing some functions Weizenbaum describes in his CACM paper. But it does show us exactly how the “certain counting mechanism” works:

- it’s a simple counter of the replies made to the user that repeatedly cycles through 1..4
- only when the value is 4 will a memory be recalled

The code also shows us that the selection of the memory template to be used when a memory is created is not random, as Weizenbaum stated: it depends on a hash-digest of the last word in the user’s current input text. Once we had also found the hash algorithm he used, the whole memory creation and recall was no longer a mystery.

This means I can now explore conversations with ELIZA like it was 1966.

#### References

Berry, D. M., Hay, A., Millican, P. and Shrager, J. (2023) Finding ELIZA: Rediscovering Weizenbaum’s Source Code, Comments and Faksimiles, in Baranovska, M. and Höltgen, S. (eds.) *Hello, I’m Eliza. 50 Jahre Gespräche mit Computern* (Computerarchäologie, Bd. 5), 2nd edn. Bochum: Projektverlag, pp. 247–248.

Weizenbaum, J. (1966) ELIZA: A Computer Program For the Study of Natural Language Communication Between Man And Machine, *Communications of the ACM*, 9(1), 36–45.
