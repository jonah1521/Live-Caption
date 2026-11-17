// STARTUP LAYER: Connects buttons, speech events, and localStorage notebook actions when the page loads

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

document.addEventListener("DOMContentLoaded", function () {
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const copyBtn = document.getElementById("copy-caption-btn");
    const highlightBtn = document.getElementById("highlight-btn");
    const clearNotesBtn = document.getElementById("clear-notes-btn");
    const notesInput = document.getElementById("notes-input");
    const notebookTitleInput = document.getElementById("notebook-title");
    const saveNotebookBtn = document.getElementById("save-notebook-btn");
    const downloadCurrentBtn = document.getElementById("download-current-btn");
    const notebooksList = document.getElementById("notebooks-list");

    // Load saved draft and saved notebooks on startup
    notesInput.value = loadDraftFromStorage();
    loadNotebooksFromStorage();
    renderNotebooksList();

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
            renderNotebooksList();
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
                saveDraftToStorage(notesInput.value);
                updateSaveIndicator("Opened: " + notebook.title);
            } else if (action === "download") {
                const filename = buildDownloadFilename(notebook.title);
                downloadTextFile(filename, notebook.content);
                updateSaveIndicator("Downloaded " + filename);
            } else if (action === "delete") {
                deleteNotebookEntry(id);
                renderNotebooksList();
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
        processSpeechResults(event);
        renderCaptions();
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
        saveDraftToStorage("");
        updateSaveIndicator("Draft cleared");
    });
});
