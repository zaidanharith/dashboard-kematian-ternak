# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This repo is an early-stage scaffold for "dashboard-kematian-ternak" (livestock mortality dashboard). There is no application code yet:

- `backend/` — only `package.json` exists (name: `dashboard-kematian-ternak-backend`, CommonJS). No entry point, framework, or dependencies have been added yet.
- `frontend/` — a stock, unmodified `create-next-app` output (Next.js 16, React 19, TypeScript, Tailwind CSS 4). Only the default `layout.tsx`/`page.tsx`/`globals.css` exist under `frontend/src/app/`.
- `docs/` — present but empty.
- Root `README.md` is empty.

Since no domain code, routing conventions, data models, or backend framework choice exist yet, do not assume an architecture — check with the user before choosing a backend framework/DB or introducing frontend structure (routes, components, state management) beyond what's already scaffolded.

## Commands

Frontend (`frontend/`):
- `npm run dev` — start Next.js dev server (Turbopack default in Next 16)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, based on `eslint-config-next`)

Backend (`backend/`): no scripts defined beyond the placeholder `npm test` (exits with an error). Nothing to build/run/lint yet.

Root `package.json`: placeholder only, same no-op `npm test`.

## Notes for future work

- The frontend uses the Next.js App Router with the `@/*` path alias mapped to `frontend/src/*` (see `tsconfig.json`).
- Tailwind CSS 4 is configured via `@tailwindcss/postcss` (no separate `tailwind.config.js`).
- When backend work begins, check whether the user wants it wired to the frontend via a proxy/API route or as a fully separate service before assuming a structure.
