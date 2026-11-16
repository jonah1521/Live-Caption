// PROCESSING LAYER: Handles transcript updates, note rules, and notebook operations

function processSpeechResults(event) {
    let interim = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            appState.finalTranscript += transcriptPiece + " ";
        } else {
            interim += transcriptPiece;
        }
    }

    appState.interimTranscript = interim;
}

function appendCaptionsToNotes(currentNotes, finalTranscript) {
    const cleanTranscript = finalTranscript.trim();
    if (!cleanTranscript) {
        return currentNotes;
    }

    if (currentNotes.trim() === "") {
        return cleanTranscript;
    }
    return currentNotes.trim() + "\n\n" + cleanTranscript;
}

function addNotebookEntry(title, content) {
    const cleanContent = content.trim();
    if (!cleanContent) {
        return null;
    }

    const cleanTitle = title.trim() || "Class Notes - " + new Date().toLocaleDateString();
    const newNotebook = {
        id: Date.now().toString(),
        title: cleanTitle,
        content: cleanContent,
        updatedAt: new Date().toLocaleString()
    };

    appState.notebooks.unshift(newNotebook);
    saveNotebooksToStorage();
    return newNotebook;
}

function deleteNotebookEntry(id) {
    appState.notebooks = appState.notebooks.filter(function (nb) {
        return nb.id !== id;
    });
    saveNotebooksToStorage();
}

function findNotebookById(id) {
    return appState.notebooks.find(function (nb) {
        return nb.id === id;
    }) || null;
}

function buildDownloadFilename(title) {
    const safeName = (title.trim() || "class-notes")
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return (safeName || "class-notes") + ".txt";
}
