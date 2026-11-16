# HANDOFF

**Goal:** Live captioning and note-taking web app for deaf and hard-of-hearing students to follow lectures, auto-save drafts, organize named notebooks, and download notes as `.txt` files.

**Live link and repo:** https://jonah1521.github.io/Live-Caption/ (`jonah1521/Live-Caption`)

**Files:**
- `index.html` - main page layout with Live Captions, My Class Notes, notebook title/save/download bar, and Saved Notebooks card
- `README.md` - project description and feature overview
- `HANDOFF.md` - current project status and handoff instructions
- `data.js` - DATA: app state, Web Speech API setup, and localStorage helpers for auto-saved drafts and named notebooks
- `2data.js` - PROCESSING: transcript formatting, note appending, notebook add/delete/lookup, and `.txt` filename rules
- `3data.js` - PRESENTATION: caption rendering, status messages, auto-save indicator, and Saved Notebooks list rendering
- `4data.js` - startup event listeners connecting speech recognition, auto-save, notebook save/open/delete, and `.txt` file download
- `style.css` - responsive styling for desktop and mobile including the notebook bar and Saved Notebooks list

**Working now:** Live captioning, note-taking, automatic draft persistence in `localStorage`, saving/opening/deleting named notebooks, and downloading notes as `.txt` files on GitHub Pages.

**Last session:** Built the Saved Notebooks feature across all 6 core files (`data.js`, `2data.js`, `3data.js`, `4data.js`, `index.html`, `style.css`) using commits:
- `Add localStorage draft and notebook storage functions to data.js`
- `Add notebook creation, deletion, and filename rules to 2data.js`
- `Add saved notebooks list rendering and save status UI to 3data.js`
- `Wire up auto-save, saved notebooks, and .txt download in 4data.js`
- `Add notebook title bar, save/download buttons, and Saved Notebooks card to index.html`
- `Add notebook title bar, save indicator, and Saved Notebooks card styles to style.css`

**Next step:** Commit this updated `HANDOFF.md` to `jonah1521/Live-Caption`, verify all Saved Notebooks features on the live URL, and paste `HANDOFF.md` into a new chat when ready to add the next feature.

**Decisions:** Plain HTML, CSS, and JavaScript only with no external libraries or API keys; kept existing root-level file layout (`index.html`, `style.css`, `data.js`, `2data.js`, `3data.js`, `4data.js`) and used browser `localStorage` so notes persist offline without a backend server.

**APIs and data:**
- Browser built-in Web Speech API (`window.SpeechRecognition` / `window.webkitSpeechRecognition`) configured for `en-US` with `continuous = true` and `interimResults = true`
- Browser `localStorage` keys: `liveCaption_activeDraft` (string) and `liveCaption_savedNotebooks` (JSON array of `{ id, title, content, updatedAt }`)

**How to check it:**
1. Open `https://jonah1521.github.io/Live-Caption/` in Chrome or Edge and hard-refresh (`Ctrl+Shift+R` on Windows / `Cmd+Shift+R` on Mac).
2. Type a title (e.g., `Biology 101`) and some notes, then click **Save Notebook** — verify it appears in the **Saved Notebooks** section below with **Open**, **Download .txt**, and **Delete** buttons.
3. Refresh the browser tab — verify both your active note draft and your Saved Notebooks list remain saved.
4. Click **Download .txt** — verify a `.txt` file downloads to your device.
