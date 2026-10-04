import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI

from app.api.routes_prompts import router as prompts_router
from app.api.routes_interests import router as interests_router
from app.db.models import Base
from app.db.seed import seed_database
from app.db.session import get_db

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
    app.include_router(prompts_router)
    app.include_router(interests_router)

    async def override_get_db():
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    yield app

    await engine.dispose()

@pytest.mark.asyncio
async def test_list_and_create_interests(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check initial seeded interests
        res = await client.get("/api/interests")
        assert res.status_code == 200
        items = res.json()
        assert len(items) >= 3
        assert items[0]["name"] == "AI Systems & Agents"
        assert items[0]["is_active"] is True

        # Create a new interest
        create_res = await client.post(
            "/api/interests",
            json={
                "name": "Quantum Computing",
                "prompt_text": "Qubit architectures, error correction, and quantum algorithms.",
            },
        )
        assert create_res.status_code == 201
        created = create_res.json()
        assert created["name"] == "Quantum Computing"
        assert created["draft_prompt_text"] == created["prompt_text"]
        assert created["has_draft_changes"] is False

@pytest.mark.asyncio
async def test_interest_draft_and_discard(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/interests")
        first_id = res.json()[0]["id"]
        original_text = res.json()[0]["prompt_text"]

        # Update draft
        put_res = await client.put(
            f"/api/interests/{first_id}",
            json={"draft_prompt_text": "Updated interest instructions for testing."},
        )
        assert put_res.status_code == 200
        updated = put_res.json()
        assert updated["has_draft_changes"] is True
        assert updated["prompt_text"] == original_text
        assert updated["draft_prompt_text"] == "Updated interest instructions for testing."

        # Discard draft
        discard_res = await client.post(f"/api/interests/{first_id}/discard")
        assert discard_res.status_code == 200
        reverted = discard_res.json()
        assert reverted["has_draft_changes"] is False
        assert reverted["draft_prompt_text"] == original_text

@pytest.mark.asyncio
async def test_toggle_active_and_delete(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create temp interest
        create_res = await client.post(
            "/api/interests",
            json={"name": "Temp Interest", "prompt_text": "Temporary prompt"},
        )
        temp_id = create_res.json()["id"]

        # Toggle active
        toggle_res = await client.patch(f"/api/interests/{temp_id}/toggle")
        assert toggle_res.status_code == 200
        assert toggle_res.json()["is_active"] is False

        toggle_back = await client.patch(
            f"/api/interests/{temp_id}/toggle", json={"is_active": True}
        )
        assert toggle_back.status_code == 200
        assert toggle_back.json()["is_active"] is True

        # Delete
        del_res = await client.delete(f"/api/interests/{temp_id}")
        assert del_res.status_code == 204

        get_res = await client.get(f"/api/interests/{temp_id}")
        assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_publish_flow_snapshots_interests(test_app):
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Edit interest draft
        res = await client.get("/api/interests")
        target_id = res.json()[0]["id"]
        await client.put(
            f"/api/interests/{target_id}",
            json={"draft_prompt_text": "Draft text published into snapshot."},
        )

        # Trigger unified publish
        pub_res = await client.post("/api/prompts/publish")
        assert pub_res.status_code == 200
        data = pub_res.json()
        assert data["version"] == 2

        # Check interest draft changes committed
        item_res = await client.get(f"/api/interests/{target_id}")
        item_data = item_res.json()
        assert item_data["has_draft_changes"] is False
        assert item_data["prompt_text"] == "Draft text published into snapshot."

        # Check latest snapshot contains the active interests
        snaps_res = await client.get("/api/prompts/snapshots")
        assert snaps_res.status_code == 200
        snapshots = snaps_res.json()
        latest = snapshots[0]
        assert latest["version_number"] == 2
        assert len(latest["interest_prompts_json"]) >= 3
        matching = next(
            (i for i in latest["interest_prompts_json"] if i["id"] == target_id), None
        )
        assert matching is not None
        assert matching["prompt_text"] == "Draft text published into snapshot."
