// PROCESSING LAYER: Handles transcript updates and note rules

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
