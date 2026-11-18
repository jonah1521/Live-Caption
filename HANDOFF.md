# HANDOFF

**Goal:** A free, offline-capable live captioning and note-taking web app for deaf and hard-of-hearing students so they can read real-time lecture captions, capture timestamped notes, highlight key exam points, save searchable notebooks, and generate instant study summaries during class.

**Live link and repo:** https://jonah1521.github.io/Live-Caption/ (GitHub repo: `jonah1521/Live-Caption`)

**Files:**
- `index.html` - Main page layout with Live Captions, Key Moment button, My Class Notes, Quick Study Summary panel, and Saved Notebooks search
- `README.md` - Project description and feature overview
- `HANDOFF.md` - Current project status and handoff instructions
- `data.js` - DATA: app state, Web Speech API (`SpeechRecognition`) setup, and `localStorage` persistence
- `2data.js` - PROCESSING: transcript updates, `[HH:MM]` timestamps, `★ KEY POINT` highlights, offline Quick Study Summary generator, and notebook rules
- `3data.js` - PRESENTATION: caption rendering, status updates, and live-filtered Saved Notebooks list
- `4data.js` - STARTUP: connects buttons, speech events, auto-restart on silence, summary rendering, and notebook search/actions
- `style.css` - Responsive desktop and mobile styling

**Working now:** Live speech-to-text captioning with automatic restart during classroom pauses, one-click timestamped caption copying, `★ Key Moment` highlights, auto-saved drafts in `localStorage`, named Saved Notebooks (open, `.txt` download, delete, and live keyword search), and an offline Quick Study Summary generator. Checked live on GitHub Pages (`https://jonah1521.github.io/Live-Caption/`).

**Last session:**
- Added automatic `[HH:MM]` timestamps to copied captions and `★ Key Moment` button (`Add timestamps to copied captions and Key Moment highlight button`)
- Added live search bar to filter Saved Notebooks by title or keyword (`Add search bar to filter saved notebooks by title or keyword`)
- Added 100% offline Quick Study Summary generator (`Add offline Quick Study Summary generator for class notes`)

**Next step:** Final polish check (test on phone and laptop before Friday, November 20, and update `README.md` if needed for the final presentation).

**Decisions:**
- Plain HTML, CSS, and JavaScript only—no frameworks, build steps, or external API keys so the app stays free and safe on GitHub Pages.
- Keep the existing flat 4-script architecture (`data.js`, `2data.js`, `3data.js`, `4data.js`) loaded in order[cite: 8].
- Summary generator runs 100% client-side in plain JavaScript using keyword frequency and starred `★ KEY POINT` extraction[cite: 8].

**APIs and data:**
- Browser Web Speech API (`window.SpeechRecognition` / `window.webkitSpeechRecognition`) for real-time microphone transcription (no external network API or key required).
- Browser `localStorage` for auto-saved note drafts and saved class notebooks.

**How to check it:**
1. Open `https://jonah1521.github.io/Live-Caption/` in Chrome or Edge.
2. Click **Start Captions**, speak into the microphone, pause 15+ seconds, and speak again to verify continuous auto-restart.
3. Click **Copy Captions to Notes** and **★ Key Moment** to verify timestamped notes and highlights appear in **My Class Notes**.
4. Click **Summarize Notes** to verify the **Quick Study Summary** panel displays top keywords, starred key moments, and main takeaways.
5. Enter a class title, click **Save Notebook**, and type in the **Search saved notebooks...** bar to verify instant filtering and `.txt` download.
