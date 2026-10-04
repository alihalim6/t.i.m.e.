import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_prompts import router as prompts_router
from app.api.routes_interests import router as interests_router
from app.config import settings
from app.db.models import Base
from app.db.seed import seed_database
from app.db import session as db_session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("time_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Verifying database connection...")
    await db_session.init_db_with_fallback()

    logger.info("Initializing database schema...")
    async with db_session.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Checking initial seed data...")
    async with db_session.AsyncSessionLocal() as session:
        await seed_database(session)

    logger.info("T.I.M.E. Backend ready.")
    yield

    logger.info("Shutting down database connections...")
    await db_session.engine.dispose()

app = FastAPI(
    title="T.I.M.E. API",
    description="Things I Might Enjoy — Multi-agent AI newsletter & prompt engineering lab",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prompts_router)
app.include_router(interests_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": "T.I.M.E."}
