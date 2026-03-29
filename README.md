<div align="center">

# Recipe

**Paste, preview, and manage UI code snippets — instantly.**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Deploy](https://img.shields.io/github/actions/workflow/status/jamesyong-42/recipe/deploy.yml?label=deploy)](https://github.com/jamesyong-42/recipe/actions)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)

[Live Demo](https://jamesyong-42.github.io/recipe/)

</div>

---

- Live preview for React (Sandpack) and HTML (Monaco) snippets
- Auto-detects npm dependencies from imports
- Draggable split pane with collapsible editor
- Optional Supabase cloud sync — configurable from the UI
- Offline-first with localStorage, installable as PWA

## Getting Started

```bash
git clone https://github.com/jamesyong-42/recipe.git
cd recipe
pnpm install
pnpm dev
```

## Cloud Sync

Click the **gear icon** in the header to connect your own [Supabase](https://supabase.com) project. The setup SQL is provided in the Settings modal. No account required for local use.

## Tech Stack

React 19 · TypeScript · Vite 7 · Sandpack · Monaco Editor · Supabase · react-router-dom

## License

[MIT](LICENSE)
