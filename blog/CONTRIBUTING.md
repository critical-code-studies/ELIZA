# Adding a blog post

The blog needs no build step and no web framework. To add a post you create one
Markdown file and add one line to a list. You can do all of it from the GitHub
website, no software required.

## 1. Write the post

Create a new file in `blog/posts/` named with the next number and a short slug,
for example `blog/posts/12-my-new-post.md`. Start it with this header (the bit
between the two `---` lines), then write the post in Markdown below it:

```
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

\`\`\`
(PERHAPS
    ((0)
        (YOU DON'T SEEM QUITE CERTAIN)))
\`\`\`
```

## 2. List it

Open `blog/posts.json` and add an entry at the end of the list (mind the comma):

```
{ "n": 12, "slug": "12-my-new-post", "title": "My New Post", "date": "14 July 2026", "author": "Your Name" }
```

The `slug` must exactly match the file name (without `.md`). That is all. The
post appears on the Blog page and at `blog/post.html?p=12-my-new-post`, and the
previous / next links sort themselves out from the order in this file.

## House style

- No em dashes. Use commas, or " - " with spaces, or rewrite the sentence.
- British spelling, except inside direct quotations.
- Curly quotes are fine. Keep paragraphs separated by a blank line.

## Previewing locally (optional)

Because posts are fetched at run time, opening the files directly with
`file://` will not work; you need a tiny local server. From the repository root:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000/blog.html`. On the live GitHub Pages site this
is not needed; it just works.
