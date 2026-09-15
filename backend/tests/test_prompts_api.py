import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.api.routes_prompts import router
from app.db.models import Base
from app.db.seed import seed_database
from app.db.session import get_db
from fastapi import FastAPI

# Test setup using in-memory SQLite
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def test_app():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async_session = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        await seed_database(session)

    app = FastAPI()
    app.include_router(router)

    async def override_get_db():
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    yield app

    await engine.dispose()

@pytest.mark.asyncio
async def test_get_base_and_scoring_prompts(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Base prompt
        res = await client.get("/api/prompts/base")
        assert res.status_code == 200
        data = res.json()
        assert data["version"] == 1
        assert "<base_instructions>" in data["prompt_text"]
        assert data["has_draft_changes"] is False

        # 2. Scoring prompt
        res = await client.get("/api/prompts/scoring")
        assert res.status_code == 200
        data = res.json()
        assert data["version"] == 1
        assert "editor-in-chief" in data["prompt_text"]
        assert data["has_draft_changes"] is False

@pytest.mark.asyncio
async def test_draft_update_and_discard(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Update draft
        res = await client.put(
            "/api/prompts/base",
            json={"draft_prompt_text": "Updated draft for base prompt"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["has_draft_changes"] is True
        assert data["draft_prompt_text"] == "Updated draft for base prompt"

        # Discard draft
        res = await client.post("/api/prompts/base/discard")
        assert res.status_code == 200
        data = res.json()
        assert data["has_draft_changes"] is False
        assert data["draft_prompt_text"] == data["prompt_text"]

@pytest.mark.asyncio
async def test_publish_flow_and_snapshot(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Modify base prompt draft
        await client.put(
            "/api/prompts/base",
            json={"draft_prompt_text": "Published base prompt v2"},
        )

        # Publish
        pub_res = await client.post("/api/prompts/publish")
        assert pub_res.status_code == 200
        pub_data = pub_res.json()
        assert pub_data["version"] == 2

        # Check base prompt is now v2 with no pending draft
        base_res = await client.get("/api/prompts/base")
        base_data = base_res.json()
        assert base_data["version"] == 2
        assert base_data["prompt_text"] == "Published base prompt v2"
        assert base_data["has_draft_changes"] is False

        # Check snapshots list
        snap_res = await client.get("/api/prompts/snapshots")
        assert snap_res.status_code == 200
        snaps = snap_res.json()
        assert len(snaps) >= 2
        assert snaps[0]["version_number"] == 2

@pytest.mark.asyncio
async def test_rating_tags_seed_no_emojis(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/tags")
        assert res.status_code == 200
        tags = res.json()
        tag_names = [t["name"] for t in tags]
        assert "Great" in tag_names
        assert "OK" in tag_names
        assert "Meh" in tag_names
        assert "Paywalled" in tag_names
        assert "Not Interested" in tag_names
        assert "Basura" in tag_names

        # Verify no emojis in tag labels or names
        for t in tags:
            assert all(ord(char) < 128 for char in t["name"])
