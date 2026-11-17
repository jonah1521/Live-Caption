// DATA LAYER: Holds app state, SpeechRecognition setup, and localStorage notebook storage

const STORAGE_KEYS = {
    DRAFT: "liveCaption_activeDraft",
    NOTEBOOKS: "liveCaption_savedNotebooks"
};

const appState = {
    isListening: false,
    shouldKeepListening: false,
    finalTranscript: "",
    interimTranscript: "",
    recognition: null,
    notebooks: []
};

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    return recognition;
}

function loadDraftFromStorage() {
    return localStorage.getItem(STORAGE_KEYS.DRAFT) || "";
}

function saveDraftToStorage(text) {
    localStorage.setItem(STORAGE_KEYS.DRAFT, text);
}

function loadNotebooksFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
        appState.notebooks = raw ? JSON.parse(raw) : [];
    } catch (error) {
        appState.notebooks = [];
    }
    return appState.notebooks;
}

function saveNotebooksToStorage() {
    localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(appState.notebooks));
}
