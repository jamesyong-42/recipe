<div align="center">

# Recipe

**Paste, preview, and manage UI code snippets — instantly.**

[Live Demo](https://jamesyong-42.github.io/recipe/) &nbsp;&middot;&nbsp; [Report Bug](https://github.com/jamesyong-42/recipe/issues) &nbsp;&middot;&nbsp; [Request Feature](https://github.com/jamesyong-42/recipe/issues)

</div>

---

Recipe is a lightweight, browser-based tool for saving and previewing UI code snippets. Paste any React or HTML code and see it render live — no build step, no server, no signup required.

## Highlights

| | Feature | Description |
|---|---|---|
| **&lt;/&gt;** | **Live Preview** | Paste React or HTML and see it render instantly via Sandpack and Monaco |
| **:package:** | **Smart Dependencies** | Auto-detects `import` statements and loads only the npm packages your snippet needs |
| **:arrows_leftright:** | **Draggable Split** | Resize the code/preview panes by dragging, or collapse the editor entirely |
| **:cloud:** | **Cloud Sync** | Optionally connect your own Supabase — configure it right from the Settings UI |
| **:floppy_disk:** | **Offline First** | Works immediately with localStorage, zero config, no account needed |
| **:iphone:** | **Mobile Ready** | Responsive layout with code/preview tab switching on small screens |
| **:rocket:** | **PWA** | Installable on desktop and mobile as a standalone app |

## Quick Start

```bash
git clone https://github.com/jamesyong-42/recipe.git
cd recipe
pnpm install
pnpm dev
```

Open **https://localhost:5178** — paste a snippet or click **New Snippet** to get started.

## Cloud Sync (Optional)

Recipe works fully offline with localStorage. To enable cross-device sync:

1. Create a free project at [supabase.com](https://supabase.com)
2. In Recipe, click the **gear icon** > expand **Database Setup** > copy the SQL
3. Run the SQL in your Supabase project's **SQL Editor**
4. Enter your project URL and anon key in Recipe's Settings, then click **Test & Connect**

Alternatively, set environment variables for your own deployment:

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + TypeScript |
| Build | [Vite 7](https://vite.dev) with Brotli compression |
| React Preview | [Sandpack](https://sandpack.codesandbox.io) (CodeSandbox runtime) |
| HTML Editor | [Monaco Editor](https://microsoft.github.io/monaco-editor/) |
| Storage | [Supabase](https://supabase.com) (optional) + localStorage |
| Routing | [react-router-dom v7](https://reactrouter.com) |

## Project Structure

```
src/
  components/    UI components (editors, gallery, settings modal, split pane)
  contexts/      React context (Supabase connection state)
  hooks/         Custom hooks (useSnippets, useSplitPane, useInView)
  lib/           Utilities (dependency detection, Supabase manager, Sandpack helpers)
  pages/         Route pages (Home, Snippet)
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

[MIT](LICENSE) &copy; 2025-2026 James Yong
