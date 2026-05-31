# Frontend

Next.js app for Operon — a visual workflow editor with auth, project management, and a ReactFlow canvas for building pipeline graphs.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons
- **Canvas:** ReactFlow (`@xyflow/react`)
- **State & data:** Zustand, TanStack React Query
- **Auth & DB:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)

## Setup & running

**Prerequisites:** Node.js ≥ 18, pnpm 9

```bash
# From monorepo root
pnpm install

# Copy env and fill in Supabase credentials
cp apps/frontend/.env.example apps/frontend/.env.local
```

Required env vars in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BACKEND_URL=http://localhost:8000` (server-only; proxied via `/api/pipelines/parse`)

Start the dev server (requires backend on port 8000):

```bash
pnpm --filter frontend dev
# or from this directory
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |

### Key routes

| Route | Note |
|-------|---------|
| `/login`, `/signup` | Auth |
| `/dashboard` | Project list |
| `/dashboard/projects/[id]` | Flow canvas editor |
