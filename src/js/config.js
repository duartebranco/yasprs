import { api } from "./api.js";
import { toast } from "./ui.js";

export async function loadConfig() {
    const c = await api("/api/config");
    if (!c) return;
    document.getElementById("ps4ip").value = c.ps4ip || "";
    document.getElementById("ps4port").value = c.ps4port || "12800";
    document.getElementById("pkgBasePath").value = c.pkgBasePath || "";
}

export async function saveConfig() {
    const body = {
        ps4ip: document.getElementById("ps4ip").value.trim(),
        ps4port: document.getElementById("ps4port").value.trim() || "12800",
        pkgBasePath: document.getElementById("pkgBasePath").value.trim(),
    };
    const d = await api("/api/config", { method: "POST", body });
    toast(
        d?.success ? "Configuration saved." : "Failed to save.",
        d?.success ? "ok" : "fail",
    );
}

export async function loadNetworkIPs() {
    const d = await api("/api/network");
    if (!d) return;

    const el = document.getElementById("ip-list");
    el.innerHTML = d.ips.length
        ? d.ips.map((ip) => `<span class="ip-chip">${ip}</span>`).join("")
        : '<span style="font-size:12px;color:var(--sub)">None found</span>';

    document.getElementById("server-info").textContent = d.ips[0]
        ? `${d.ips[0]}:3001`
        : "localhost:3001";
}
