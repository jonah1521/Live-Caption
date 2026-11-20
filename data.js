// DATA LAYER: Holds app state, SpeechRecognition setup, localStorage storage, and keyless Wiktionary API fetch

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

async function fetchWordDefinition(word) {
    const cleanWord = word.trim().toLowerCase();
    const url = "https://en.wiktionary.org/api/rest_v1/page/definition/" + encodeURIComponent(cleanWord);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Word not found");
    }
    return response.json();
}
