// STARTUP LAYER: Connects buttons and speech events when the page loads

document.addEventListener("DOMContentLoaded", function () {
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const copyBtn = document.getElementById("copy-caption-btn");
    const clearNotesBtn = document.getElementById("clear-notes-btn");
    const notesInput = document.getElementById("notes-input");

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
        updateStatus("Error: " + event.error);
        appState.isListening = false;
        updateButtonStates(false);
    };

    appState.recognition.onend = function () {
        appState.isListening = false;
        updateStatus("Stopped");
        updateButtonStates(false);
    };

    startBtn.addEventListener("click", function () {
        appState.recognition.start();
    });

    stopBtn.addEventListener("click", function () {
        appState.recognition.stop();
    });

    copyBtn.addEventListener("click", function () {
        notesInput.value = appendCaptionsToNotes(notesInput.value, appState.finalTranscript);
    });

    clearNotesBtn.addEventListener("click", function () {
        notesInput.value = "";
    });
});
