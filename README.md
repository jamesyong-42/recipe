# Recipe

Paste, preview, and manage UI code snippets — instantly.

[Live Demo](https://jamesyong-42.github.io/recipe/)

## Features

- **Instant live preview** — paste any React or HTML snippet and see it render immediately
- **Smart dependency detection** — auto-detects npm imports from your code and loads only what's needed
- **Draggable split pane** — resize the code/preview ratio, or collapse the editor entirely
- **Two editors** — Monaco for HTML, Sandpack (CodeSandbox) for React with full TypeScript support
- **Cloud sync** — optionally connect your own Supabase for cross-device access
- **localStorage-first** — works offline with zero configuration
- **PWA** — installable on desktop and mobile
- **Mobile responsive** — code/preview tab switching on small screens

## Quick Start

```bash
git clone https://github.com/jamesyong-42/recipe.git
cd recipe
pnpm install
pnpm dev
```

Open [https://localhost:5178](https://localhost:5178) — paste a snippet or click "New Snippet" to get started.

## Cloud Sync (Optional)

Recipe works fully offline with localStorage. To enable cloud sync:

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run the setup SQL (available in Settings > Database Setup)
3. Click the gear icon in Recipe, enter your project URL and anon key, and connect

You can also set environment variables for your own deployment:

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

## Tech Stack

- [React 19](https://react.dev) + TypeScript
- [Vite 7](https://vite.dev)
- [Sandpack](https://sandpack.codesandbox.io) — live React preview
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — HTML editing
- [Supabase](https://supabase.com) — optional cloud storage
- [react-router-dom](https://reactrouter.com) — client-side routing

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server on port 5178 |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

## License

[MIT](LICENSE)
