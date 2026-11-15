// DATA LAYER: Holds app state and initializes the browser SpeechRecognition API

const appState = {
    isListening: false,
    finalTranscript: "",
    interimTranscript: "",
    recognition: null
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
