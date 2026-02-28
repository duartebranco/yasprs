# YASPRS
**Yet Another Simple PS4 Remote Sender**

Send `.pkg` files to your PS4 over your local network via a web UI.

I did this so that, as opposed to other apps, you can set this up as a service on any headless server, and use the web UI as the GUI.

## Requirements

- Node.js 16+
- PS4 running HEN / GoldHEN with **Remote Package Installer** open
- PS4 and this machine on the same network

## Setup

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## Usage

1. **Settings** - enter your PS4's IP and the local folder where your `.pkg` files live, then save
2. **Packages** - click Refresh to list your files, then hit Send on any package

Config is saved to `config.json` in the app folder.
