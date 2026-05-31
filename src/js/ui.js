let toastTimer;

export function toast(msg, type = "info") {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = type;
    el.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.display = "none"), 4200);
}

export function esc(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function emptyState(title, hint = "") {
    return `<div class="empty"><div class="empty-title">${title}</div>${hint ? `<div class="empty-hint">${hint}</div>` : ""}</div>`;
}

export function countLabel(n) {
    return `${n} file${n !== 1 ? "s" : ""}`;
}
