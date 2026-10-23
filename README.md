# Dense — a Vomnibar page for Vimium C

An information-dense custom Vomnibar page for [Vimium C](https://github.com/gdh1995/vimium-c): single-line 24px rows in columns (number, type, title, URL, age), a column header, and a vim-style status line with the mode, your position, counts by type and the selected URL.

**Preview:** https://sejomacode.github.io/vomnibar-dense/

## Use it

In Vimium C's Options, under **Advanced**:

| Setting | Value |
| --- | --- |
| Vomnibar page | `https://sejomacode.github.io/vomnibar-dense/vomnibar.html` |
| Vomnibar sizes | `63,39,24,0.8,1944` |
| Vomnibar styles | add `time` (e.g. `mono-url time`) so the age column has data |

## Notes

- `data-version` in `vomnibar.html` must match your installed Vimium C. Compare it with
  `view-source:chrome-extension://hfjbmagddngcpeloejdejnfgbamkjaeg/front/vomnibar.html`
  (Chrome Web Store ID). If they differ, Vimium C falls back to its built-in bar.
- Only `vomnibar.html` is needed. Vimium C injects its own `vomnibar.js` into the page.
- On browser pages and sites with strict security policies, Vimium C uses its built-in bar.
- Favicons don't load on a web-hosted page; colored type glyphs stand in for them.
- Your `/* #omni */` Custom CSS still applies on top of this page.
- Opening `vomnibar.html` directly in a tab shows a demo with sample results.
