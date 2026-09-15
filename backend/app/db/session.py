import logging
from collections.abc import AsyncGenerator
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.config import settings

logger = logging.getLogger("time_backend.db")

# In case someone passes standard postgresql:// URL, convert to postgresql+asyncpg://
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

def create_engine_and_session(url: str):
    connect_args = {}
    if "sqlite" in url:
        connect_args["check_same_thread"] = False
    
    eng = create_async_engine(
        url,
        echo=False,
        future=True,
        pool_pre_ping=True,
        connect_args=connect_args,
    )
    session_factory = async_sessionmaker(
        bind=eng,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    return eng, session_factory

engine, AsyncSessionLocal = create_engine_and_session(db_url)

async def init_db_with_fallback():
    global engine, AsyncSessionLocal
    try:
        # Test connection
        async with engine.connect() as conn:
            pass
        logger.info(f"Connected to primary database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    except Exception as e:
        logger.warning(f"Could not connect to primary database ({e}). Falling back to local SQLite for development...")
        fallback_db = Path(__file__).resolve().parent.parent.parent / "time_dev.db"
        fallback_url = f"sqlite+aiosqlite:///{fallback_db}"
        engine, AsyncSessionLocal = create_engine_and_session(fallback_url)
        logger.info(f"Using development database: {fallback_url}")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
