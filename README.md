# Stupid Apps

A collection of tiny, browser-only tools — the things you Google how to do
every time. No sign-up, no server: everything runs on the client.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (New York style) for components
- **react-router-dom** for routing
- Dependencies are installed (`npm install`), never pulled from a CDN

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Architecture

The landing page renders itself from a registry, so adding an app never means
editing shared files.

```
src/
  apps/
    <slug>/app.tsx      # each app: exports `app: StupidApp` (metadata + component)
    <slug>/*.ts         # heavier logic lives in sibling files, kept small
    registry.ts         # auto-discovers every app via import.meta.glob
    types.ts            # the StupidApp contract
  components/
    ui/                 # shadcn primitives
    common/             # shared atoms (Field, OutputBox, CopyButton, cards…)
    layout/             # Header, Footer, PageShell
  pages/                # LandingPage, AppPage, NotFoundPage
  hooks/                # use-theme
```

### Adding a new app

1. Create `src/apps/<slug>/app.tsx`.
2. Export an `app` object satisfying `StupidApp` (id, title, description, icon,
   category, and the `Component`).
3. That's it — it appears on the landing page, grouped under its category, and
   gets a route at `/<slug>` automatically.

Keep components atomic: push non-trivial logic into sibling `.ts` files and
reuse the shared pieces in `components/common`.

## The apps

**Encoding & Crypto** — JWT decoder · Hash generator · Base64 encoder/decoder
**Text** — Markdown stripper · Extra spaces stripper · JSON ↔ YAML · Character
& word counter · Lorem Ipsum (exact length) · Text diff
**Generators** — UUID generator · Random number/dice/coin · Secret Santa ·
Random team generator
**Time** — Cron explainer · Date difference
**Calculators** — IP/subnet calculator · Balls in a volume · Pay-per-activity
