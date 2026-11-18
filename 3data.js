// PRESENTATION LAYER: Updates the screen, button states, and saved notebooks list

function updateStatus(message) {
    const statusEl = document.getElementById("status");
    statusEl.textContent = "Status: " + message;
}

function updateSaveIndicator(message) {
    const saveEl = document.getElementById("save-status");
    if (saveEl) {
        saveEl.textContent = message;
    }
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

function renderNotebooksList(searchQuery) {
    const listEl = document.getElementById("notebooks-list");
    if (!listEl) {
        return;
    }

    if (appState.notebooks.length === 0) {
        listEl.innerHTML = '<p class="placeholder">No saved notebooks yet. Save your current notes above to keep them here.</p>';
        return;
    }

    const query = (searchQuery || "").trim().toLowerCase();
    const filteredNotebooks = query
        ? appState.notebooks.filter(function (nb) {
            return (
                nb.title.toLowerCase().includes(query) ||
                nb.content.toLowerCase().includes(query)
            );
        })
        : appState.notebooks;

    if (filteredNotebooks.length === 0) {
        listEl.innerHTML = '<p class="placeholder">No saved notebooks match "' + query + '".</p>';
        return;
    }

    listEl.innerHTML = "";

    filteredNotebooks.forEach(function (nb) {
        const item = document.createElement("div");
        item.className = "notebook-item";

        const info = document.createElement("div");
        info.className = "notebook-info";

        const titleEl = document.createElement("strong");
        titleEl.textContent = nb.title;

        const dateEl = document.createElement("span");
        dateEl.className = "notebook-date";
        dateEl.textContent = "Saved: " + nb.updatedAt;

        info.appendChild(titleEl);
        info.appendChild(dateEl);

        const actions = document.createElement("div");
        actions.className = "notebook-actions";

        const loadBtn = document.createElement("button");
        loadBtn.className = "btn small primary";
        loadBtn.textContent = "Open";
        loadBtn.setAttribute("data-action", "open");
        loadBtn.setAttribute("data-id", nb.id);

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "btn small secondary-inline";
        downloadBtn.textContent = "Download .txt";
        downloadBtn.setAttribute("data-action", "download");
        downloadBtn.setAttribute("data-id", nb.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn small danger-outline";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("data-action", "delete");
        deleteBtn.setAttribute("data-id", nb.id);

        actions.appendChild(loadBtn);
        actions.appendChild(downloadBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(info);
        item.appendChild(actions);
        listEl.appendChild(item);
    });
}
