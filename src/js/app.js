import { loadConfig, saveConfig, loadNetworkIPs } from "./config.js";
import { loadPkgs, filterPkgs } from "./packages.js";

document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document
            .querySelectorAll(".tab-btn")
            .forEach((b) => b.classList.remove("active"));
        document
            .querySelectorAll(".tab-pane")
            .forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document
            .getElementById("tab-" + btn.dataset.tab)
            .classList.add("active");
        if (btn.dataset.tab === "packages") loadPkgs();
    });
});

document.getElementById("btn-save").addEventListener("click", saveConfig);
document.getElementById("btn-refresh").addEventListener("click", loadPkgs);
document.getElementById("pkg-search").addEventListener("input", filterPkgs);

loadConfig();
loadNetworkIPs();
