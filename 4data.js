// STARTUP LAYER: Connects buttons, speech events, live caption auto-clean, summaries, dictionary lookup, grammar quick-fix, and localStorage notebook actions when the page loads

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function stripHtmlTags(rawHtml) {
    const temp = document.createElement("div");
    temp.innerHTML = rawHtml || "";
    return (temp.textContent || temp.innerText || "").trim();
}

function renderDictionaryResult(container, word, data) {
    container.innerHTML = "";
    const englishEntries = data && Array.isArray(data.en) ? data.en : [];

    if (englishEntries.length === 0) {
        const msg = document.createElement("p");
        msg.className = "placeholder";
        msg.textContent = "No English definition found for \"" + word + "\".";
        container.appendChild(msg);
        return;
    }

    let shownCount = 0;
    englishEntries.forEach(function (entry) {
        if (shownCount >= 2 || !Array.isArray(entry.definitions)) {
            return;
        }
        const validDef = entry.definitions.find(function (item) {
            return stripHtmlTags(item.definition).length > 0;
        });
        if (!validDef) {
            return;
        }

        const block = document.createElement("div");
        block.className = "dictionary-entry";

        const posEl = document.createElement("span");
        posEl.className = "dictionary-pos";
        posEl.textContent = (entry.partOfSpeech || "Word") + ": ";
        block.appendChild(posEl);

        const defEl = document.createElement("span");
        defEl.textContent = stripHtmlTags(validDef.definition);
        block.appendChild(defEl);

        if (Array.isArray(validDef.examples) && validDef.examples.length > 0) {
            const exText = stripHtmlTags(validDef.examples[0]);
            if (exText) {
                const exEl = document.createElement("p");
                exEl.className = "dictionary-example";
                exEl.textContent = "Example: \"" + exText + "\"";
                block.appendChild(exEl);
            }
        }

        container.appendChild(block);
        shownCount += 1;
    });

    if (shownCount === 0) {
        const fallback = document.createElement("p");
        fallback.className = "placeholder";
        fallback.textContent = "No readable definition available for \"" + word + "\".";
        container.appendChild(fallback);
    }
}

function renderGrammarMatches(grammarPanel, grammarContent, notesInput, matches, onAppliedFix) {
    grammarContent.innerHTML = "";

    if (!Array.isArray(matches) || matches.length === 0) {
        const cleanMsg = document.createElement("p");
        cleanMsg.textContent = "No grammar or spelling issues found! Your notes look great.";
        grammarContent.appendChild(cleanMsg);
        grammarPanel.hidden = false;
        return;
    }

    matches.slice(0, 8).forEach(function (match) {
        const item = document.createElement("div");
        item.className = "grammar-item";

        const msgEl = document.createElement("p");
        msgEl.className = "grammar-message";
        msgEl.textContent = match.message || "Possible issue";
        item.appendChild(msgEl);

        const originalSlice = notesInput.value.slice(match.offset, match.offset + match.length);
        if (originalSlice) {
            const snipEl = document.createElement("p");
            snipEl.className = "grammar-snippet";
            snipEl.textContent = "Found: \"" + originalSlice + "\"";
            item.appendChild(snipEl);
        }

        if (Array.isArray(match.replacements) && match.replacements.length > 0) {
            const fixesRow = document.createElement("div");
            fixesRow.className = "grammar-fixes";

            match.replacements.slice(0, 3).forEach(function (rep) {
                if (!rep.value) {
                    return;
                }
                const fixBtn = document.createElement("button");
                fixBtn.type = "button";
                fixBtn.className = "fix-chip";
                fixBtn.textContent = "Fix -> " + rep.value;
                fixBtn.addEventListener("click", function () {
                    const currentText = notesInput.value;
                    const expectedWord = currentText.slice(match.offset, match.offset + match.length);
                    if (expectedWord === originalSlice) {
                        notesInput.value = currentText.slice(0, match.offset) + rep.value + currentText.slice(match.offset + match.length);
                    } else if (originalSlice && currentText.indexOf(originalSlice) !== -1) {
                        notesInput.value = currentText.replace(originalSlice, rep.value);
                    }
                    saveDraftToStorage(notesInput.value);
                    updateSaveIndicator("Applied fix: " + rep.value);
                    onAppliedFix();
                });
                fixesRow.appendChild(fixBtn);
            });

            item.appendChild(fixesRow);
        }

        grammarContent.appendChild(item);
    });

    grammarPanel.hidden = false;
}

function renderSummaryPanel(summaryPanel, summaryContent, summary) {
    summaryContent.innerHTML = "";

    const statsEl = document.createElement("p");
    statsEl.textContent = "Total key words analyzed: " + summary.wordCount;
    summaryContent.appendChild(statsEl);

    if (summary.keywords.length > 0) {
        const kwTitle = document.createElement("p");
        kwTitle.className = "summary-section-title";
        kwTitle.textContent = "Top Topics & Keywords:";
        summaryContent.appendChild(kwTitle);

        const kwText = document.createElement("p");
        kwText.textContent = summary.keywords.join(", ");
        summaryContent.appendChild(kwText);
    }

    if (summary.keyMoments.length > 0) {
        const kmTitle = document.createElement("p");
        kmTitle.className = "summary-section-title";
        kmTitle.textContent = "Starred Key Moments (" + summary.keyMoments.length + "):";
        summaryContent.appendChild(kmTitle);

        const kmList = document.createElement("ul");
        summary.keyMoments.forEach(function (moment) {
            const li = document.createElement("li");
            li.textContent = moment;
            kmList.appendChild(li);
        });
        summaryContent.appendChild(kmList);
    }

    if (summary.takeaways.length > 0) {
        const tkTitle = document.createElement("p");
        tkTitle.className = "summary-section-title";
        tkTitle.textContent = "Main Takeaways:";
        summaryContent.appendChild(tkTitle);

        const tkList = document.createElement("ul");
        summary.takeaways.forEach(function (point) {
            const li = document.createElement("li");
            li.textContent = point;
            tkList.appendChild(li);
        });
        summaryContent.appendChild(tkList);
    }

    summaryPanel.hidden = false;
}

async function polishFinalizedCaptionSentence(sentence) {
    if (!appState.autoCorrectCaptions || !sentence || sentence.split(" ").length < 3) {
        return;
    }

    // Respect LanguageTool free rate limit (max 20 requests/min -> 1 call every 3.5s)
    const now = Date.now();
    if (now - appState.lastCaptionApiCheckAt < 3500) {
        return;
    }
    appState.lastCaptionApiCheckAt = now;

    try {
        const result = await fetchGrammarCheck(sentence);
        const polished = applyLanguageToolTopFixes(sentence, result.matches);
        if (replaceCaptionSentence(sentence, polished)) {
            renderCaptions();
        }
    } catch (error) {
        // Keep the instant local cleanup silently if offline or rate-limited
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const autoCorrectToggleBtn = document.getElementById("autocorrect-toggle-btn");
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const copyBtn = document.getElementById("copy-caption-btn");
    const highlightBtn = document.getElementById("highlight-btn");
    const grammarBtn = document.getElementById("grammar-btn");
    const closeGrammarBtn = document.getElementById("close-grammar-btn");
    const grammarPanel = document.getElementById("grammar-panel");
    const grammarContent = document.getElementById("grammar-content");
    const summarizeBtn = document.getElementById("summarize-btn");
    const closeSummaryBtn = document.getElementById("close-summary-btn");
    const summaryPanel = document.getElementById("summary-panel");
    const summaryContent = document.getElementById("summary-content");
    const clearNotesBtn = document.getElementById("clear-notes-btn");
    const notesInput = document.getElementById("notes-input");
    const notebookTitleInput = document.getElementById("notebook-title");
    const saveNotebookBtn = document.getElementById("save-notebook-btn");
    const downloadCurrentBtn = document.getElementById("download-current-btn");
    const notebookSearchInput = document.getElementById("notebook-search");
    const notebooksList = document.getElementById("notebooks-list");
    const dictionaryInput = document.getElementById("dictionary-input");
    const dictionaryBtn = document.getElementById("dictionary-btn");
    const dictionaryResult = document.getElementById("dictionary-result");

    function getCurrentSearchQuery() {
        return notebookSearchInput ? notebookSearchInput.value : "";
    }

    // Load saved draft and saved notebooks on startup
    notesInput.value = loadDraftFromStorage();
    loadNotebooksFromStorage();
    renderNotebooksList(getCurrentSearchQuery());

    // Toggle Auto-Clean Captions On/Off
    if (autoCorrectToggleBtn) {
        autoCorrectToggleBtn.addEventListener("click", function () {
            appState.autoCorrectCaptions = !appState.autoCorrectCaptions;
            autoCorrectToggleBtn.textContent = appState.autoCorrectCaptions ? "Auto-Clean: ON" : "Auto-Clean: OFF";
            autoCorrectToggleBtn.setAttribute("aria-pressed", appState.autoCorrectCaptions ? "true" : "false");
            autoCorrectToggleBtn.className = appState.autoCorrectCaptions ? "btn secondary-inline" : "btn danger-outline";
        });
    }

    // Grammar & Spelling Quick-Fix check
    async function runGrammarCheck() {
        if (!grammarPanel || !grammarContent) {
            return;
        }
        const text = notesInput.value.trim();
        if (!text) {
            updateSaveIndicator("Type or copy some notes first before checking grammar.");
            return;
        }
        grammarContent.innerHTML = "<p class=\"placeholder\">Checking grammar and spelling...</p>";
        grammarPanel.hidden = false;
        try {
            const result = await fetchGrammarCheck(notesInput.value);
            renderGrammarMatches(grammarPanel, grammarContent, notesInput, result.matches, runGrammarCheck);
            updateSaveIndicator("Grammar check complete");
        } catch (error) {
            grammarContent.innerHTML = "<p class=\"placeholder\">Could not reach the grammar service right now. Try again in a moment.</p>";
        }
    }

    if (grammarBtn) {
        grammarBtn.addEventListener("click", runGrammarCheck);
    }

    if (closeGrammarBtn && grammarPanel) {
        closeGrammarBtn.addEventListener("click", function () {
            grammarPanel.hidden = true;
        });
    }

    // Dictionary lookup handler
    async function handleDictionaryLookup() {
        if (!dictionaryInput || !dictionaryResult) {
            return;
        }
        const word = dictionaryInput.value.trim();
        if (!word) {
            dictionaryResult.innerHTML = "<p class=\"placeholder\">Type a word first to look up its definition.</p>";
            return;
        }
        dictionaryResult.innerHTML = "<p class=\"placeholder\">Looking up \"" + word + "\"...</p>";
        try {
            const data = await fetchWordDefinition(word);
            renderDictionaryResult(dictionaryResult, word, data);
        } catch (error) {
            dictionaryResult.innerHTML = "<p class=\"placeholder\">Could not find a definition for \"" + word + "\". Check spelling and try again.</p>";
        }
    }

    if (dictionaryBtn) {
        dictionaryBtn.addEventListener("click", handleDictionaryLookup);
    }

    if (dictionaryInput) {
        dictionaryInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                handleDictionaryLookup();
            }
        });
    }

    // Filter saved notebooks live as the user types in the search box
    if (notebookSearchInput) {
        notebookSearchInput.addEventListener("input", function () {
            renderNotebooksList(getCurrentSearchQuery());
        });
    }

    // Generate offline study summary from current notes
    if (summarizeBtn && summaryPanel && summaryContent) {
        summarizeBtn.addEventListener("click", function () {
            const summary = generateStudySummary(notesInput.value);
            if (!summary) {
                updateSaveIndicator("Type or copy some notes first before summarizing.");
                return;
            }
            renderSummaryPanel(summaryPanel, summaryContent, summary);
            updateSaveIndicator("Study summary ready");
        });
    }

    if (closeSummaryBtn && summaryPanel) {
        closeSummaryBtn.addEventListener("click", function () {
            summaryPanel.hidden = true;
        });
    }

    // Auto-save active notes while typing
    notesInput.addEventListener("input", function () {
        saveDraftToStorage(notesInput.value);
        updateSaveIndicator("Auto-saved");
    });

    // Save current notes as a named notebook entry
    if (saveNotebookBtn) {
        saveNotebookBtn.addEventListener("click", function () {
            const title = notebookTitleInput ? notebookTitleInput.value : "";
            const saved = addNotebookEntry(title, notesInput.value);
            if (!saved) {
                updateSaveIndicator("Type or copy some notes first before saving.");
                return;
            }
            if (notebookTitleInput) {
                notebookTitleInput.value = "";
            }
            renderNotebooksList(getCurrentSearchQuery());
            updateSaveIndicator("Saved notebook: " + saved.title);
        });
    }

    // Download current active notes as a .txt file
    if (downloadCurrentBtn) {
        downloadCurrentBtn.addEventListener("click", function () {
            const content = notesInput.value.trim();
            if (!content) {
                updateSaveIndicator("Nothing to download yet.");
                return;
            }
            const title = notebookTitleInput ? notebookTitleInput.value : "";
            const filename = buildDownloadFilename(title);
            downloadTextFile(filename, content);
            updateSaveIndicator("Downloaded " + filename);
        });
    }

    // Handle Open, Download .txt, and Delete clicks inside Saved Notebooks
    if (notebooksList) {
        notebooksList.addEventListener("click", function (event) {
            const button = event.target.closest("button");
            if (!button) {
                return;
            }

            const action = button.getAttribute("data-action");
            const id = button.getAttribute("data-id");
            const notebook = findNotebookById(id);

            if (!notebook) {
                return;
            }

            if (action === "open") {
                notesInput.value = notebook.content;
                if (notebookTitleInput) {
                    notebookTitleInput.value = notebook.title;
                }
                if (summaryPanel) {
                    summaryPanel.hidden = true;
                }
                if (grammarPanel) {
                    grammarPanel.hidden = true;
                }
                saveDraftToStorage(notesInput.value);
                updateSaveIndicator("Opened: " + notebook.title);
            } else if (action === "download") {
                const filename = buildDownloadFilename(notebook.title);
                downloadTextFile(filename, notebook.content);
                updateSaveIndicator("Downloaded " + filename);
            } else if (action === "delete") {
                deleteNotebookEntry(id);
                renderNotebooksList(getCurrentSearchQuery());
                updateSaveIndicator("Deleted: " + notebook.title);
            }
        });
    }

    // Speech Recognition setup
    appState.recognition = setupSpeechRecognition();

    if (!appState.recognition) {
        updateStatus("Speech recognition not supported in this browser. Please use Chrome or Edge.");
        startBtn.disabled = true;
        return;
    }

    appState.recognition.onstart = function () {
        appState.isListening = true;
        updateStatus("Listening...");
        updateButtonStates(true);
    };

    appState.recognition.onresult = function (event) {
        const newlyFinalizedSentences = processSpeechResults(event);
        renderCaptions();
        newlyFinalizedSentences.forEach(function (sentence) {
            polishFinalizedCaptionSentence(sentence);
        });
    };

    appState.recognition.onerror = function (event) {
        // Ignore harmless "no-speech" or "aborted" timeouts so auto-restart can keep going
        if (event.error === "no-speech" || event.error === "aborted") {
            return;
        }
        // Stop auto-restarting if mic permission is denied or not allowed
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            appState.shouldKeepListening = false;
        }
        updateStatus("Error: " + event.error);
        appState.isListening = false;
        updateButtonStates(false);
    };

    appState.recognition.onend = function () {
        appState.isListening = false;
        if (appState.shouldKeepListening) {
            try {
                appState.recognition.start();
                return;
            } catch (error) {
                // Ignore if already starting
            }
        }
        updateStatus("Stopped");
        updateButtonStates(false);
    };

    startBtn.addEventListener("click", function () {
        appState.shouldKeepListening = true;
        try {
            appState.recognition.start();
        } catch (error) {
            // Ignore if already running
        }
    });

    stopBtn.addEventListener("click", function () {
        appState.shouldKeepListening = false;
        appState.recognition.stop();
    });

    copyBtn.addEventListener("click", function () {
        notesInput.value = appendCaptionsToNotes(notesInput.value, appState.finalTranscript);
        saveDraftToStorage(notesInput.value);
        updateSaveIndicator("Auto-saved");
    });

    if (highlightBtn) {
        highlightBtn.addEventListener("click", function () {
            notesInput.value = appendKeyMomentToNotes(notesInput.value, appState.finalTranscript);
            notesInput.focus();
            notesInput.scrollTop = notesInput.scrollHeight;
            saveDraftToStorage(notesInput.value);
            updateSaveIndicator("Key moment marked");
        });
    }

    clearNotesBtn.addEventListener("click", function () {
        notesInput.value = "";
        if (summaryPanel) {
            summaryPanel.hidden = true;
        }
        if (grammarPanel) {
            grammarPanel.hidden = true;
        }
        saveDraftToStorage("");
        updateSaveIndicator("Draft cleared");
    });
});
