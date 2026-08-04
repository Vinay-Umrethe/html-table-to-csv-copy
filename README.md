# HTML Table To CSV Copier Extension

Copying **HTML** tables from the web and pasting them into Excel or VS Code or Notepad usually sucks. It dumps everything into a space-separated mess that breaks all columns plus all syntax is broken due to rendered Unicode being copied.

So I wrote this simple JavaScript native script to fix that...

It hooks into the native browser `copy` event and forces any highlighted tables to copy as **CSV** instead of anything raw.

A few edge cases it handles so you don't have to:

- If you lazily highlight only just a little area anywhere on the table, it auto-expands the selection to grab the whole thing.
- If you copy a mix of normal paragraphs or any other content with a table in between, it keeps the other content intact with normal line breaks, and just swaps the table part into CSV.
- It does not destroy the HTML payload. So, if you paste into Word, you still get a visual table. If you paste into Excel or Notepad, you get plain CSV.

- **KaTeX Support**: Prevents equations from copying as mashing visual and hidden text together. It strips the hidden accessibility text and extracts the actual `$LaTeX$` source *(With a fallback to preserve visual math if the source is missing)*.

**This was inspired by [KaTex](https://katex.org/) library's official [copy-tex extension](https://github.com/KaTeX/KaTeX/tree/main/contrib/copy-tex).**

Just drop this script into your page *(or the `public` folder*) and it works globally as it is natively vanilla JavaScript. No dependencies, no extra libraries...

## Usage

Place it before closing `</body>` tag and use from `public/scripts/` folder of your project:

```html
<script src="/scripts/table-copy-csv.js" defer></script>
```

## Demo

Open [`index.html`](index.html) in any browser to test the script.

## License

Copyright &copy; 2026 Vinay Umrethe <umrethevinay@gmail.com>.

[MIT](https://opensource.org/license/mit) License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
