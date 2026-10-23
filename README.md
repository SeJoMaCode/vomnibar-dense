# Dense — a Vomnibar page for Vimium C

An information-dense custom Vomnibar page for [Vimium C](https://github.com/gdh1995/vimium-c): single-line 24px rows in columns (number, type, title, URL, age), a column header, and a vim-style status line with the mode, your position, counts by type and the selected URL.

**Preview:** https://sejomacode.github.io/vomnibar-dense/

## Install (Chrome)

Vimium C on Chrome only loads a custom Vomnibar page that lives inside an extension, so Dense ships as a tiny unpacked extension in [`extension/`](extension).

1. **Get the files.** Download this repo (Code → Download ZIP) and unzip it somewhere permanent.
2. **Copy Vimium C's script into it.** Open
   `chrome-extension://hfjbmagddngcpeloejdejnfgbamkjaeg/front/vomnibar.js`
   in a tab, press Ctrl+S, and save it as `extension/front/vomnibar.js`.
   This keeps the script matched to your installed Vimium C. Redo it after Vimium C updates.
3. **Load the extension.** Go to `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and pick the `extension` folder. Note the ID Chrome shows for "Dense Vomnibar for Vimium C".
4. **Point Vimium C at it.** In Vimium C's Options, under **Advanced**:
   - **Preferred Vomnibar page**: `chrome-extension://<Dense ID>/front/vomnibar.html`
   - **Vomnibar settings** (JSON): set `sizes` and add `time` to `styles`, keeping any other keys:

```json
{
  "maxMatches": 10,
  "queryInterval": 333,
  "sizes": "63,39,24,0.8,1944",
  "styles": "mono-url time"
}
```

5. Reload any open tabs and press `o`.

`sizes` matches the frame to this page's shorter bar and rows. `time` makes Vimium C send each result's visit time, which fills the age column.

## Notes

- `extension/front/vcid.js` holds Vimium C's extension ID. It's the Chrome Web Store ID by default; on Edge, replace it with the ID from `edge://extensions` (and use that ID in step 2).
- `data-version` in `vomnibar.html` must match your Vimium C (compare with `view-source:chrome-extension://hfjbmagddngcpeloejdejnfgbamkjaeg/front/vomnibar.html`). If they differ, Vimium C falls back to its built-in bar.
- On browser pages, the New Tab page and in incognito windows, Vimium C may still use its built-in bar.
- Your `/* #omni */` Custom CSS still applies on top of this page.
- `vomnibar.html` at the repo root is the same design as a standalone web page. It powers the demo, but Vimium C on Chrome won't use a web-hosted page.
