// PRESENTATION LAYER: Updates the screen and button states

function updateStatus(message) {
    const statusEl = document.getElementById("status");
    statusEl.textContent = "Status: " + message;
}

function renderCaptions() {
    const captionBox = document.getElementById("caption-box");

    if (!appState.finalTranscript && !appState.interimTranscript) {
        captionBox.innerHTML = '<p class="placeholder">Click "Start Captions" and speak into your microphone...</p>';
        return;
    }

    captionBox.innerHTML =
        "<span>" + appState.finalTranscript + "</span>" +
        '<span class="interim-text">' + appState.interimTranscript + "</span>";

    captionBox.scrollTop = captionBox.scrollHeight;
}

function updateButtonStates(isListening) {
    document.getElementById("start-btn").disabled = isListening;
    document.getElementById("stop-btn").disabled = !isListening;
}
