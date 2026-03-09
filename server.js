const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();

const CONFIG_DIR = process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, "yasprs")
    : path.join(os.homedir(), ".config", "yasprs");
const CONFIG_FILE = path.join(CONFIG_DIR, "profile.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
        }
    } catch (e) {}
    return { ps4ip: "", pkgBasePath: "", serverPort: 12800 };
}

function saveConfig(config) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function formatSize(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + " GB";
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + " MB";
    return (bytes / 1e3).toFixed(2) + " KB";
}

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const alias of iface) {
            if (alias.family === "IPv4" && !alias.internal) {
                return alias.address;
            }
        }
    }
    return "localhost";
}

// recursively find all .pkg files under a directory
function scanPkgs(dir, basePath) {
    const pkgs = [];
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                pkgs.push(...scanPkgs(fullPath, basePath));
            } else if (
                entry.isFile() &&
                entry.name.toLowerCase().endsWith(".pkg")
            ) {
                const stats = fs.statSync(fullPath);
                pkgs.push({
                    name: entry.name,
                    path: fullPath,
                    relativePath: path.relative(basePath, fullPath),
                    size: stats.size,
                    sizeFormatted: formatSize(stats.size),
                });
            }
        }
    } catch (e) {}
    return pkgs;
}

// recursively find a file by name under a directory
function findFile(dir, name) {
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const found = findFile(full, name);
                if (found) return found;
            } else if (entry.name === name) {
                return full;
            }
        }
    } catch (e) {}
    return null;
}

app.get("/api/config", (req, res) => {
    res.json(loadConfig());
});

app.post("/api/config", (req, res) => {
    const updated = { ...loadConfig(), ...req.body };
    saveConfig(updated);
    res.json({ success: true, config: updated });
});

app.get("/api/pkgs", (req, res) => {
    const config = loadConfig();
    const basePath = config.pkgBasePath;

    if (!basePath || !fs.existsSync(basePath)) {
        return res.json({
            pkgs: [],
            error: basePath ? "Path does not exist" : "No base path configured",
        });
    }

    res.json({ pkgs: scanPkgs(basePath, basePath) });
});

app.get("/api/network", (req, res) => {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const iface of Object.values(interfaces)) {
        for (const alias of iface) {
            if (alias.family === "IPv4" && !alias.internal) {
                ips.push(alias.address);
            }
        }
    }
    res.json({ ips });
});

app.post("/api/send", async (req, res) => {
    const { pkgPath } = req.body;
    const config = loadConfig();

    if (!config.ps4ip) {
        return res
            .status(400)
            .json({ success: false, error: "PS4 IP not configured" });
    }

    if (!pkgPath || !fs.existsSync(pkgPath)) {
        return res
            .status(400)
            .json({ success: false, error: "PKG file not found" });
    }

    const serverIP = getLocalIP();
    const serverPort = process.env.PORT || 3001;
    const fileKey = encodeURIComponent(path.basename(pkgPath));
    const pkgUrl = `http://${serverIP}:${serverPort}/pkg-files/${fileKey}`;
    const ps4Url = `http://${config.ps4ip}:12800/api/install`;

    try {
        const payload = JSON.stringify({ type: "direct", packages: [pkgUrl] });
        const response = await axios.post(ps4Url, payload, {
            timeout: 10000,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        res.json({ success: true, response: response.data, pkgUrl });
    } catch (err) {
        const msg = err.response
            ? `PS4 responded with ${err.response.status}: ${JSON.stringify(err.response.data)}`
            : err.message;
        res.status(500).json({ success: false, error: msg });
    }
});

app.get("/pkg-files/:filename", (req, res) => {
    const config = loadConfig();
    const basePath = config.pkgBasePath;
    const filename = decodeURIComponent(req.params.filename);

    if (!basePath) {
        return res.status(404).send("Base path not configured");
    }

    const filePath = findFile(basePath, filename);
    if (!filePath) {
        return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(
        `\nPS4 PKG Sender Web UI running at http://localhost:${PORT}\n`,
    );
});
