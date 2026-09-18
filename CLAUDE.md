# CLAUDE.md

Context for contributing to **Stupid Apps** — a collection of tiny,
browser-only utilities. Everything runs on the client; there is no backend.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (configured in `src/index.css`, no `tailwind.config`)
- **shadcn/ui** — New York style, components in `src/components/ui`
- **react-router-dom** for routing
- Deployed to **GitHub Pages** via `.github/workflows/deploy.yml` on push to `main`

## Commands

Use the Makefile (`make help` lists everything):

- `make dev` — dev server at http://localhost:5173
- `make build` — production build (runs `tsc -b` then `vite build`)
- `make typecheck` / `make lint`
- `make check` — lint + typecheck + build; run this before pushing

## How the app registry works

The landing page is **self-maintaining**. `src/apps/registry.ts` discovers apps
with `import.meta.glob('./*/app.tsx')`, so adding a tool never touches shared
files. Each app declares a `category`; the landing page renders one section per
category (order in `registry.ts` → `categoryOrder`) and creates a `/<id>` route.

### Adding a new app

1. Create `src/apps/<slug>/app.tsx`.
2. Export a `const app: StupidApp` (see `src/apps/types.ts`) with `id`, `title`,
   `description`, `icon` (a lucide icon), `category`, and `Component`.
3. Done — it shows up on the landing page and gets its route automatically.

```tsx
export const app: StupidApp = {
  id: 'my-tool',            // kebab-case, unique, becomes the URL
  title: 'My Tool',
  description: 'One-line pitch shown on the card.',
  icon: SomeLucideIcon,
  category: 'Text',         // must be one of AppCategory in types.ts
  Component: MyTool,
}
```

## Conventions

- **Keep files atomic.** If an app grows past ~120 lines, split logic into a
  sibling file (`strip.ts`, `subnet.ts`, `diff-view.tsx`, …). Look at existing
  apps for the pattern.
- **Reuse the shared primitives** in `src/components/common`: `Field`,
  `OutputBox`, `CopyButton`, `NamesInput`, `ToolCard`, `ToolShell`. Don't
  re-implement labelled inputs or copy buttons.
- **Install dependencies, never use a CDN.** `npm install <pkg>` and import it.
- **Everything is client-side and private** — no network calls with user input.
  Say so in the UI when it's reassuring (e.g. the JWT decoder).
- Use the `@/` import alias for anything under `src/`.
- Pure logic goes in `.ts` files (easy to reason about and test); `app.tsx`
  wires state and UI.

## Layout

```
src/
  apps/<slug>/app.tsx   # app definition (metadata + component)
  apps/<slug>/*.ts      # heavier logic, kept small
  apps/registry.ts      # auto-discovery — do not hand-maintain a list
  apps/types.ts         # StupidApp contract + AppCategory union
  components/ui/         # shadcn primitives
  components/common/     # shared atoms
  components/layout/     # Header, Footer, PageShell
  pages/                 # LandingPage, AppPage, NotFoundPage
  hooks/use-theme.ts     # light/dark theme
```

## Deployment notes

- Vite `base` is `/stupid-apps/` (project page). If the repo is renamed, update
  `base` in `vite.config.ts` and the `basename` picks it up via
  `import.meta.env.BASE_URL`.
- The workflow copies `dist/index.html` → `dist/404.html` so client-side deep
  links resolve on a hard refresh.
