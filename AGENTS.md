# AGENTS.md — Project Stack Rules

This file defines the canonical technology stack and architectural conventions for **chesslearn**. All agents and contributors must follow these rules.

---

## Framework

- **Next.js** with **App Router** and **TypeScript**
- Use the App Router (`app/` directory) exclusively — no Pages Router
- Server Components are the **default**; add `"use client"` only when strictly necessary (interactivity, browser APIs, hooks)

---

## Styling

- **Tailwind CSS** — utility-first, no custom CSS files unless absolutely unavoidable
- **shadcn/ui** — use existing components from `components/ui/`
- **Lucide Icons** — import icons from `lucide-react` only

---

## Chess Logic

- **chess.js** — all chess engine logic (move validation, FEN parsing, game state) must be **isolated inside a custom hook**, e.g. `hooks/use-chess-game.ts`
- **react-chessboard** — used only for rendering the board UI; it must receive props from the custom hook, not contain logic itself
- Never import `chess.js` directly in components or pages — always go through the hook

---

## Database

- **Supabase** (PostgreSQL backend)
- All database queries and API calls must live in **`/lib/api/`**

---

## Architecture & TypeScript

- **Strict TypeScript** — `strict: true` in `tsconfig.json`; `any` is **forbidden**; use `unknown` + type guards when the type is truly dynamic
- Server Components by default; only opt into Client Components when required
- Data-fetching logic belongs in `/lib/api/`
- Keep components presentational; business logic goes in hooks (`hooks/`) or lib utilities (`lib/`)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
