# Operon — Workflow Platform

Turborepo monorepo for building and validating visual workflow pipelines. The frontend provides a drag-and-drop canvas editor; the backend validates pipeline DAGs before execution.

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Monorepo | Turborepo, pnpm workspaces, TypeScript |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, ReactFlow, Zustand, React Query, Supabase Auth |
| Backend | Python 3.12+, FastAPI, Pydantic, uvicorn, uv |
| Database | Supabase (Postgres + Auth) |
| Deploy | Vercel (frontend + backend), Docker (backend) |

## Setup & running

**Prerequisites:** Node.js ≥ 18, pnpm 9, Python ≥ 3.13, [uv](https://docs.astral.sh/uv/)

```bash
# From repo root
pnpm install
```

Run both frontend and backend:

```bash
pnpm dev
```

### Environment

**Frontend** — copy `apps/frontend/.env.example` → `apps/frontend/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BACKEND_URL=http://localhost:8000` (server-only; client calls `/api/pipelines/parse`)

**Backend** — copy `apps/backend/.env.example` → `apps/backend/.env` (optional for local dev):

- `CORS_ORIGINS=http://localhost:3000`

**Supabase** — run migration `supabase/migrations/20260530120000_create_projects.sql` and enable Email auth in the dashboard.

### Other commands

```bash
pnpm build       # build all apps
pnpm lint        # lint all apps
pnpm typecheck   # typecheck all apps
```

### Docker (backend)

```bash
docker compose up --build
```

## Apps

- [`apps/frontend`](apps/frontend/README.md) — Next.js workflow editor
- [`apps/backend`](apps/backend/README.md) — FastAPI pipeline validation API
