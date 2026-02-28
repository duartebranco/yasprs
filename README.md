# YASPRS
**Yet Another Simple PS4 Remote Sender**

![packages tab](docs/screenshot_20260228_224720.png)

Send `.pkg` files to your PS4 over your local network via a web UI.

I did this so that, as opposed to other apps, you can set this up as a service on any headless server, and use the web UI as the GUI.

## Requirements

- Node.js 16+
- PS4 running HEN / GoldHEN with **Remote Package Installer** open
- PS4 and this machine on the same network

## Setup

Clone the repo.
```bash
git clone https://github.com/duartebranco/yasprs.git
cd yasprs/
```

Install the dependencies and start the server.
```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## Usage

1. **Settings** - enter your PS4's IP and the local folder where your `.pkg` files live, then save
2. **Packages** - click Refresh to list your files, then hit Send on any package

Config is saved to `$XDG_CONFIG_HOME/yasprs/profile.json` in the app folder (see [XDG convention](https://specifications.freedesktop.org/basedir/latest/)).

That's it! It's that simple.

Any problems, please open a new [issue](https://github.com/duartebranco/yasprs/issues).
