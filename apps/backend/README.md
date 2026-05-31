# Backend

FastAPI service for Operon — validates workflow pipeline graphs (DAG structure, cycles, connectivity) via a REST API consumed by the frontend canvas.

## Tech stack

- **Runtime:** Python 3.12+
- **Framework:** FastAPI, Pydantic v2, uvicorn
- **Package manager:** uv
- **Linting & types:** Ruff, Pyright
- **Deploy:** Vercel (serverless), Docker

## Setup & running

**Prerequisites:** Python ≥ 3.12, [uv](https://docs.astral.sh/uv/)

```bash
# From monorepo root — install Python deps
cd apps/backend && uv sync
```

Optional env (defaults work for local dev):

```bash
cp .env.example .env
# CORS_ORIGINS=http://localhost:3000
```

Start the dev server:

```bash
# From repo root (starts frontend + backend)
pnpm dev

# Or from this directory
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API available at [http://localhost:8000](http://localhost:8000). Docs at `/docs`.

### Scripts

| Command | Description |
|---------|-------------|
| `uv run uvicorn main:app --reload --port 8000` | Start dev server |
| `uv run ruff check .` | Lint |
| `uv run pyright` | Typecheck |

### Docker

From monorepo root:

```bash
docker compose up --build
```

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Service info |
| GET | `/health` | Health check |
| POST | `/pipelines/parse` | Validate pipeline DAG |
