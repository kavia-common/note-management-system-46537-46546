# Ocean Notes (Astro)

A simple, modern notes app built with Astro. It uses an offline-first approach with `localStorage` and a small store. The UI follows the Ocean Professional theme (primary #2563EB, secondary #F59E0B).

## Quick Start

- Install dependencies:
  - npm install
- Start the dev server (port 3000 is configured):
  - npm run dev
- Open:
  - http://localhost:3000

## Features

- Sidebar notes list with search and last-updated sorting
- Create, read, update, delete notes
- Autosave with debounce while typing
- Markdown preview (safe subset)
- Keyboard shortcuts:
  - Ctrl/Cmd+S to save
  - Ctrl/Cmd+N to new note
- Offline-first with localStorage
- Theme toggle (light/dark)

## Structure

- src/pages/index.astro — main two-pane layout (sidebar + editor/preview)
- public/scripts/store.js — minimal store with localStorage persistence and an adapter interface
- public/scripts/components.js — UI helpers (list rendering, markdown preview, toast, debounce)
- src/layouts/Layout.astro — base styles and Ocean theme variables

## Environment

This project reads PUBLIC_* envs at the container level. No backend is used now. For a future backend:
- Define PUBLIC_API_BASE in the environment.
- Swap the adapter in public/scripts/store.js to an HTTP-based implementation.

## Notes

- First run seeds a “Welcome to Notes” example.
- All data is stored in browser localStorage under key `notes.v1`.
- No external UI libraries are required.

## Build

- npm run build
- npm run preview
