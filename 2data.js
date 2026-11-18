// PROCESSING LAYER: Handles transcript updates, timestamps, highlights, summaries, and notebook operations

function getCurrentTimestamp() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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

    const stampedLine = "[" + getCurrentTimestamp() + "] " + cleanTranscript;
    if (currentNotes.trim() === "") {
        return stampedLine;
    }
    return currentNotes.trim() + "\n\n" + stampedLine;
}

function appendKeyMomentToNotes(currentNotes, finalTranscript) {
    const cleanTranscript = finalTranscript.trim();
    const tailSnippet = cleanTranscript ? " " + cleanTranscript.slice(-140).trim() : " ";
    const marker = "★ KEY POINT [" + getCurrentTimestamp() + "]:" + tailSnippet;

    if (currentNotes.trim() === "") {
        return marker;
    }
    return currentNotes.trim() + "\n\n" + marker;
}

function generateStudySummary(notesText) {
    const cleanText = notesText.trim();
    if (!cleanText) {
        return null;
    }

    const lines = cleanText.split(/\n+/).map(function (line) {
        return line.trim();
    }).filter(Boolean);

    // 1. Extract any starred Key Moments
    const keyMoments = lines.filter(function (line) {
        return line.indexOf("★ KEY POINT") === 0;
    });

    // 2. Strip timestamps and markers to analyze main text
    const strippedText = cleanText
        .replace(/★ KEY POINT \[\d{1,2}:\d{2}(?:\s?[AP]M)?\]:?/gi, "")
        .replace(/\[\d{1,2}:\d{2}(?:\s?[AP]M)?\]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

    const stopWords = new Set([
        "the", "and", "that", "have", "for", "not", "with", "you", "this", "but",
        "his", "from", "they", "say", "her", "she", "will", "one", "all", "would",
        "there", "their", "what", "about", "which", "when", "make", "can", "like",
        "time", "just", "him", "know", "take", "into", "year", "your", "some",
        "could", "them", "see", "other", "than", "then", "now", "look", "only",
        "come", "its", "over", "think", "also", "back", "after", "use", "two",
        "how", "our", "work", "first", "well", "way", "even", "new", "want",
        "because", "any", "these", "give", "most", "are", "was", "were", "been",
        "being", "has", "had", "does", "did", "doing", "very", "more", "going"
    ]);

    const wordCounts = {};
    const words = strippedText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    words.forEach(function (word) {
        if (!stopWords.has(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    });

    const topKeywords = Object.keys(wordCounts)
        .sort(function (a, b) {
            return wordCounts[b] - wordCounts[a];
        })
        .slice(0, 6);

    // 3. Score sentences by keyword frequency to pick top 3 takeaway sentences
    const rawSentences = strippedText
        .split(/(?<=[.!?])\s+|\n+/)
        .map(function (s) {
            return s.trim();
        })
        .filter(function (s) {
            return s.length >= 20;
        });

    const scoredSentences = rawSentences.map(function (sentence, index) {
        const sentenceWords = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        let score = 0;
        sentenceWords.forEach(function (w) {
            if (wordCounts[w]) {
                score += wordCounts[w];
            }
        });
        return {
            text: sentence,
            index: index,
            score: sentenceWords.length > 0 ? score / Math.sqrt(sentenceWords.length) : 0
        };
    });

    const topSentences = scoredSentences
        .sort(function (a, b) {
            return b.score - a.score;
        })
        .slice(0, 3)
        .sort(function (a, b) {
            return a.index - b.index;
        })
        .map(function (item) {
            return item.text;
        });

    return {
        wordCount: words.length,
        keyMoments: keyMoments,
        keywords: topKeywords,
        takeaways: topSentences.length > 0 ? topSentences : [strippedText.slice(0, 220)]
    };
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
