

# Gather Cheat

A floating overlay for [Gather](https://app.gather.town). Drag it anywhere, collapse it, and jump back in with the same settings next visit.

![Version](https://img.shields.io/badge/version-1.0.4-7C5CFF?style=flat-square)
![Manifest](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-22C55E?style=flat-square)

![Gather Cheat menu](https://github.com/user-attachments/assets/19010d02-0575-4b6f-b8eb-483f3514b150)

## Functions

| | Function | What it does |
| --- | --- | --- |
| 01 | **Current Position** | Live readout of the map id and your `x` / `y` tile. |
| 02 | **Teleport Warp** | **Random** jumps once to a random tile on a random map. **Auto** repeats that jump every 2 seconds until you stop it, and remembers the choice. |
| 03 | **Speed** | Sets movement to `x1`, `x2`, `x3`, or `x4`. The active multiplier is highlighted and restored after you reconnect. |
| 04 | **Send Emote** | Spells the text one character at a time as an emote (about half a second each), then clears it. Press Enter to send, **Stop** to cut it short. The draft is saved. |
| 05 | **Enable OoB** | Lets you keep walking when a wall would stop you. Portals still behave normally. The toggle is remembered. |
| 06 | **Main PinP** | Sends the main game video into Picture-in-Picture. Mic and camera can still be toggled from the OS media controls. |

The title bar is the handle. Drag it to move the panel; the close control collapses the body. Position and open state stick in `localStorage`.

## Build

```bash
npm ci                 # install
npm run watch          # rebuild on change
npm run build          # production bundle
npm run build:package  # zip the extension
```

`npm run build` writes the content script into `public/js/`. Load that `public/` folder, not the repo root.

## Load the extension

1. Open `chrome://extensions/`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Choose the `public/` folder after a build.

The menu only appears on `https://app.gather.town/*`. It stays hidden until the game client is ready, then fades in on the first server heartbeat.
