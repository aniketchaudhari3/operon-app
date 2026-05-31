import os
import sys
from pathlib import Path

# Ensure local packages resolve when loaded from the monorepo root on Vercel.
_backend_root = Path(__file__).resolve().parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.health import router as health_router
from routers.parse import router as parse_router

app = FastAPI(title="Operon Backend")

def _cors_origins() -> list[str]:
    origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    for key in ("FRONTEND_URL", "VERCEL_URL"):
        value = os.environ.get(key, "").strip()
        if not value:
            continue
        origins.append(value if value.startswith("http") else f"https://{value}")
    return list(dict.fromkeys(origin.strip() for origin in origins if origin.strip()))


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(parse_router)
