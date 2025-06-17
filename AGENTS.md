# Agent instructions for circles-to-fish-static

This repository hosts a small static web application that converts osu! beatmaps into chart files for the in-development rhythm game **Sinker Sound**.

## Goals
- Provide an easy way to turn `.osz` beatmaps into Sinker Sound bundles for local testing.
- Supply a retro Windows 7 styled UI using [7.css](https://khang-nd.github.io/7.css/) with draggable windows powered by jQueryUI.
- Serve as a playful internal tool for the Sinker Sound team, including a handful of optional easter eggs.

## Repository Layout
- `public/` contains all static assets used for hosting the app.
  - `index.html` – main HTML page.
  - `js/` – JavaScript modules including `converter.js`, `ui.js`, `dvd.js`, `gravity.js` and `win7.js`
  - `css/styles.css` – additional styling layered over 7.css.
  - `tres/` – fish model files referenced by the converter.
  - `legacy/` – a preserved older version of the converter.
- `firebase.json` configures Firebase Hosting for deploying the `public` folder.

The project has no build step or automated tests. Simply open `public/index.html` in a browser or deploy it with Firebase to use the tool.

There are no other AGENTS.md files in the project.
