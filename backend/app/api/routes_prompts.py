import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import (
    PromptResponse,
    PublishResponse,
    RatingTagResponse,
    SnapshotResponse,
    UpdateDraftRequest,
)
from app.db.models import GlobalPrompt, PromptSnapshot, RatingTag, ScoringPrompt
from app.db.session import get_db

router = APIRouter(prefix="/api", tags=["prompts"])

# --- Base Prompt ---

@router.get("/prompts/base", response_model=PromptResponse)
async def get_base_prompt(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GlobalPrompt).limit(1))
    prompt = result.scalars().first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Base prompt not initialized")
    return prompt

@router.put("/prompts/base", response_model=PromptResponse)
async def update_base_prompt_draft(
    payload: UpdateDraftRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(GlobalPrompt).limit(1))
    prompt = result.scalars().first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Base prompt not initialized")

    prompt.draft_prompt_text = payload.draft_prompt_text
    prompt.has_draft_changes = prompt.draft_prompt_text != prompt.prompt_text
    await db.commit()
    await db.refresh(prompt)
    return prompt

@router.post("/prompts/base/discard", response_model=PromptResponse)
async def discard_base_prompt_draft(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GlobalPrompt).limit(1))
    prompt = result.scalars().first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Base prompt not initialized")

    prompt.draft_prompt_text = prompt.prompt_text
    prompt.has_draft_changes = False
    await db.commit()
    await db.refresh(prompt)
    return prompt

# --- Scoring Prompt ---

@router.get("/prompts/scoring", response_model=PromptResponse)
async def get_scoring_prompt(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScoringPrompt).limit(1))
    prompt = result.scalars().first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Scoring prompt not initialized")
    return prompt

@router.put("/prompts/scoring", response_model=PromptResponse)
async def update_scoring_prompt_draft(
    payload: UpdateDraftRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ScoringPrompt).limit(1))
    prompt = result.scalars().first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Scoring prompt not initialized")

    prompt.draft_prompt_text = payload.draft_prompt_text
    prompt.has_draft_changes = prompt.draft_prompt_text != prompt.prompt_text
    await db.commit()
    await db.refresh(prompt)
    return prompt

@router.post("/prompts/scoring/discard", response_model=PromptResponse)
async def discard_scoring_prompt_draft(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ScoringPrompt).limit(1))
    prompt = result.scalars().first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Scoring prompt not initialized")

    prompt.draft_prompt_text = prompt.prompt_text
    prompt.has_draft_changes = False
    await db.commit()
    await db.refresh(prompt)
    return prompt

# --- Publish / Snapshots ---

@router.post("/prompts/publish", response_model=PublishResponse)
async def publish_prompts(db: AsyncSession = Depends(get_db)):
    base_res = await db.execute(select(GlobalPrompt).limit(1))
    base = base_res.scalars().first()

    scoring_res = await db.execute(select(ScoringPrompt).limit(1))
    scoring = scoring_res.scalars().first()

    if not base or not scoring:
        raise HTTPException(status_code=404, detail="Prompts not initialized")

    # If neither has draft changes, we still allow publish or return existing version
    final_base_text = base.draft_prompt_text if base.draft_prompt_text is not None else base.prompt_text
    final_scoring_text = scoring.draft_prompt_text if scoring.draft_prompt_text is not None else scoring.prompt_text

    snap_res = await db.execute(
        select(PromptSnapshot.version_number).order_by(desc(PromptSnapshot.version_number)).limit(1)
    )
    latest_snap_version = snap_res.scalar_one_or_none() or 0

    new_version = max(base.version, scoring.version, latest_snap_version) + 1

    base.prompt_text = final_base_text
    base.draft_prompt_text = final_base_text
    base.has_draft_changes = False
    base.version = new_version

    scoring.prompt_text = final_scoring_text
    scoring.draft_prompt_text = final_scoring_text
    scoring.has_draft_changes = False
    scoring.version = new_version

    published_at = datetime.datetime.now(datetime.timezone.utc)

    snapshot = PromptSnapshot(
        version_number=new_version,
        global_prompt_text=final_base_text,
        scoring_prompt_text=final_scoring_text,
        interest_prompts_json=[],
        published_at=published_at,
    )
    db.add(snapshot)

    await db.commit()

    return PublishResponse(
        message="Prompts published successfully",
        version=new_version,
        published_at=published_at,
    )

@router.get("/prompts/snapshots", response_model=list[SnapshotResponse])
async def list_snapshots(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PromptSnapshot).order_by(desc(PromptSnapshot.version_number))
    )
    return result.scalars().all()

# --- Tags ---

@router.get("/tags", response_model=list[RatingTagResponse])
async def list_rating_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RatingTag).where(RatingTag.is_active.is_(True)).order_by(desc(RatingTag.weight))
    )
    return result.scalars().all()
