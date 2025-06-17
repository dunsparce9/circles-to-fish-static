# Circles to Fish

This repository contains a simple web application for converting osu! beatmaps into chart bundles for the rhythm game **Sinker Sound**. It is built entirely with static assets and can be opened directly in a browser or served via Firebase Hosting.

## Structure
- `public/` – static assets served to the browser
  - `index.html` – main entry point
  - `js/` – JavaScript modules
  - `css/styles.css` – custom styles layered over [7.css](https://khang-nd.github.io/7.css)
  - `tres/` – fish model files used by the converter
  - `legacy/` – older version preserved for reference
- `firebase.json` – Firebase Hosting configuration

## Usage
Open `public/index.html` in a modern browser to use the converter locally. The project has no build step or automated tests.
