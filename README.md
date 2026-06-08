# Error404404 — Command Deck

A browser-based terminal interface. Type commands to navigate, launch a mini game, trigger visual effects, and unlock a hidden developer mode.

## Commands

| Command | What it does |
|---|---|
| `help` | List all commands |
| `ls` | List available sections |
| `open <name>` | Navigate to a page (`radio`, `feeds`, `cmd`, `classified`) |
| `radio` | Go to the radio station |
| `cmd` | Go to the command deck |
| `game` | Launch Asteroids-Mini (playable in-browser canvas game) |
| `matrix` | Trigger the matrix rain effect |
| `theme` | Toggle developer (green) mode |
| `clear` | Clear the terminal output |
| `exit` | Close the terminal |

**Tip:** Tab-completes command names. ↑/↓ arrows cycle command history.

**Easter egg:** Enter the Konami code (↑↑↓↓←→←→BA) to unlock developer mode and the hidden dev console.

## Files

| File | Purpose |
|---|---|
| `cmd.html` | Styled version — full site design |
| `cmd-plain.html` | Plain version — dark terminal UI, fully self-contained |
| `classified.html` | Secret vault page — linked from both versions |
| `style.css` | Shared stylesheet (styled version only) |
| `main.js` | Shared JavaScript — terminal engine, game, Konami, boot screen |
| `BG.jpg` | Background image |
| `rain.gif` | Rain overlay effect |
| `portal.mp3` | Background audio track (footer audio player) |

## Deploying

Drop the folder contents onto GitHub Pages or any static host. No build step required.

`classified.html` must be in the same folder for the classified vault link to work.

## Versions

- **Styled (`cmd.html`)** — requires `style.css`, `main.js`, `BG.jpg`, `rain.gif`, `portal.mp3`, `classified.html`
- **Plain (`cmd-plain.html`)** — requires `classified.html` only; all JS and styles are inlined
