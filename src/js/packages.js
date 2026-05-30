import { api } from "./api.js";
import { toast, esc, emptyState, countLabel } from "./ui.js";

let allPkgs = [];

export async function loadPkgs() {
    const container = document.getElementById("pkg-list-container");
    const count = document.getElementById("pkg-count");

    container.innerHTML = '<div class="empty"><span class="spin"></span></div>';
    count.textContent = "";

    const d = await api("/api/pkgs");

    if (!d || d.error) {
        container.innerHTML = emptyState(
            d?.error || "Connection error",
            "Check your PKG base path in Settings",
        );
        allPkgs = [];
        return;
    }

    allPkgs = d.pkgs;
    count.textContent = countLabel(allPkgs.length);
    renderPkgs(allPkgs);
}

export function filterPkgs() {
    const q = document.getElementById("pkg-search").value.toLowerCase();
    const filtered = q
        ? allPkgs.filter(
              (p) =>
                  p.name.toLowerCase().includes(q) ||
                  p.relativePath.toLowerCase().includes(q),
          )
        : allPkgs;

    document.getElementById("pkg-count").textContent = q
        ? `${filtered.length} / ${allPkgs.length}`
        : countLabel(allPkgs.length);

    renderPkgs(filtered);
}

function renderPkgs(pkgs) {
    const container = document.getElementById("pkg-list-container");

    if (!pkgs.length) {
        container.innerHTML = emptyState("No matches");
        return;
    }

    const rows = pkgs
        .map(
            (pkg, i) => `
    <tr>
      <td>
        <div class="pkg-name">${esc(pkg.name)}</div>
        ${pkg.relativePath !== pkg.name ? `<div class="pkg-sub">${esc(pkg.relativePath)}</div>` : ""}
      </td>
      <td class="pkg-size">${pkg.sizeFormatted}</td>
      <td class="pkg-action">
        <button class="btn btn-send" id="sb-${i}" data-path="${esc(pkg.path)}">Send</button>
      </td>
    </tr>
  `,
        )
        .join("");

    container.innerHTML = `
    <table>
      <thead><tr>
        <th>Package</th>
        <th class="r">Size</th>
        <th class="r">Action</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

    pkgs.forEach((pkg, i) => {
        document
            .getElementById(`sb-${i}`)
            .addEventListener("click", () => sendPkg(pkg.path, i));
    });
}

async function sendPkg(pkgPath, i) {
    const btn = document.getElementById(`sb-${i}`);
    btn.disabled = true;
    btn.className = "btn btn-send sending";
    btn.textContent = "Sending...";

    const d = await api("/api/send", { method: "POST", body: { pkgPath } });

    if (d?.success) {
        btn.className = "btn btn-send ok";
        btn.textContent = "Queued";
        toast("Install queued on PS4.", "ok");
    } else {
        btn.className = "btn btn-send fail";
        btn.textContent = "Failed";
        toast("Error: " + (d?.error || "Unknown error"), "fail");
    }

    setTimeout(() => {
        btn.className = "btn btn-send";
        btn.textContent = "Send";
        btn.disabled = false;
    }, 3000);
}
