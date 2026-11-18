# Live Caption & Note Taker

A free, accessible web app built for deaf and hard-of-hearing students to view real-time speech-to-text captions alongside a personal class note editor, searchable notebooks, and an offline study summary generator.

**Live App:** https://jonah1521.github.io/Live-Caption/

## Features
- **Continuous Live Captions:** Real-time speech-to-text transcription using the browser's built-in Web Speech API, with automatic restart during classroom pauses so captions never time out.
- **Timestamped Note Capture:** One-click **Copy Captions to Notes** transfers captured speech into your personal notes with automatic `[HH:MM]` timestamps.
- **Key Moment Highlights:** Click **★ Key Moment** during a lecture to stamp `★ KEY POINT [HH:MM]:` directly into your notes for quick exam review.
- **Auto-Saved Drafts & Named Notebooks:** Active notes auto-save in your browser (`localStorage`), and completed lectures can be saved as named notebooks with one-click `.txt` downloads.
- **Live Notebook Search:** Filter saved notebooks instantly by class title or keyword.
- **Offline Quick Study Summary:** Click **Summarize Notes** to extract starred `★ KEY POINT` highlights, top lecture keywords, and main takeaways—100% offline in plain JavaScript with no external AI keys.
- **Responsive Design:** Side-by-side caption and note layout on laptops that stacks cleanly on phones.

## How to Use
1. Open https://jonah1521.github.io/Live-Caption/ in **Google Chrome** or **Microsoft Edge**.
2. Click **Start Captions** and allow microphone access.
3. Read live captions on the left while typing personal notes on the right.
4. Click **Copy Captions to Notes** to append timestamped captions, or **★ Key Moment** to flag important exam topics.
5. Click **Summarize Notes** after class for an instant study overview, or enter a class title and click **Save Notebook** to store and search your notes later.

## Project Structure
- `index.html` — Main layout for Live Captions, My Class Notes, Quick Study Summary, and Saved Notebooks
- `style.css` — Responsive styling for desktop and mobile screens
- `data.js` — App state, Web Speech API setup, and `localStorage` persistence
- `2data.js` — Transcript formatting, timestamps, key-moment markers, offline summarizer, and notebook rules
- `3data.js` — Screen updates, caption rendering, and live-filtered Saved Notebooks list
- `4data.js` — Button events, speech recognition lifecycle, auto-restart, and file downloads
- `HANDOFF.md` — Current project status and development handoff notes
