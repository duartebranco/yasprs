# PS4 PKG Sender — Web UI

A lightweight web-based replacement for the original Electron app.  
No Electron, no Webpack, no complex build step — just Node.js + Express + a clean browser UI.

## Requirements

- Node.js 16+
- PS4 running HEN / GoldHEN with **Remote Package Installer (RPI)** open
- PS4 and your PC on the **same local network**

## Setup

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Open your browser to: **http://localhost:3000**

## Usage

### 1. Settings Tab
- Enter your **PS4 IP address** (find it in PS4 → Settings → Network → View Connection Status)
- Enter the **PKG Base Path** — the folder on your PC containing `.pkg` files  
  (subdirectories are scanned automatically)
- Click **Save Configuration**

### 2. Packages Tab
- Click **Refresh** to scan your PKG folder
- Use the search box to filter
- Click **▶ Send to PS4** on any package to queue it on your PS4

### How it works
1. This app runs a local Express server on port 3000
2. When you click "Send to PS4", it calls the PS4's RPI API at `http://<PS4_IP>:12800/api/install`
3. The PS4 then fetches the `.pkg` file from this server over your local network
4. The install begins in RPI on your PS4

## Notes

- Your PKG files are served from this machine — both your PC and PS4 must be on the same network
- Config is saved to `~/.ps4-pkg-sender-config.json`
- The server port is 3000 by default (set `PORT=xxxx` env var to change)
