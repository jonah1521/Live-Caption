# HANDOFF

**Goal:** Live captioning and note-taking web app for deaf and hard-of-hearing students to follow lectures and save notes in real time.

**Live link and repo:** https://jonah1521.github.io/Live-Caption-Notetaker/ (`jonah1521/Live-Caption-Notetaker`)

**Files:**
- `index.html` - main page layout and script/style loader
- `README.md` - project description and feature overview
- `HANDOFF.md` - current project status and handoff instructions
- `2_scripts/1_data.js` - DATA: app state and Web Speech API initialization
- `2_scripts/2_rules.js` - PROCESSING: transcript formatting and note appending rules
- `2_scripts/3_display.js` - PRESENTATION: caption rendering, status messages, and button states
- `2_scripts/4_start.js` - startup event listeners connecting UI buttons to speech recognition
- `3_styles/style.css` - responsive styling for desktop and mobile

**Working now:** Complete 8-file codebase ready to commit to the repository root and deploy on GitHub Pages.

**Last session:** Sent complete files for `index.html`, `3_styles/style.css`, `2_scripts/1_data.js`, `2_scripts/2_rules.js`, `2_scripts/3_display.js`, `2_scripts/4_start.js`, `README.md`, and `HANDOFF.md`.

**Next step:** Save all 8 files into their exact paths in `jonah1521/Live-Caption-Notetaker`, verify `index.html` is at the top level (root), and open `https://jonah1521.github.io/Live-Caption-Notetaker/` in Chrome or Edge.

**Decisions:** Plain HTML, CSS, and JavaScript only with no external libraries or API keys so it runs cleanly on GitHub Pages and works on both phones and laptops.

**APIs and data:** Browser built-in Web Speech API (`window.SpeechRecognition` / `window.webkitSpeechRecognition`) configured for `en-US` with `continuous = true` and `interimResults = true`.

**How to check it:** Open `https://jonah1521.github.io/Live-Caption-Notetaker/` in Google Chrome or Microsoft Edge, press Ctrl+Shift+R (or Cmd+Shift+R on Mac), click "Start Captions", allow microphone access, and verify live text appears on the left and copies to the notes box on the right.
