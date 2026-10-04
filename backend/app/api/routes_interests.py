from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Interest
from app.db.session import get_db
from app.api.schemas import (
    InterestResponse,
    CreateInterestRequest,
    UpdateInterestDraftRequest,
    ToggleInterestRequest,
)

router = APIRouter(prefix="/api/interests", tags=["interests"])

@router.get("", response_model=list[InterestResponse])
async def list_interests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Interest).order_by(Interest.id))
    return result.scalars().all()

@router.post("", response_model=InterestResponse, status_code=status.HTTP_201_CREATED)
async def create_interest(
    req: CreateInterestRequest, db: AsyncSession = Depends(get_db)
):
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Interest name cannot be empty")

    prompt_text = req.prompt_text.strip()
    interest = Interest(
        name=name,
        prompt_text=prompt_text,
        draft_prompt_text=prompt_text,
        has_draft_changes=False,
        is_active=True,
    )
    db.add(interest)
    await db.commit()
    await db.refresh(interest)
    return interest

@router.get("/{interest_id}", response_model=InterestResponse)
async def get_interest(interest_id: int, db: AsyncSession = Depends(get_db)):
    interest = await db.get(Interest, interest_id)
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")
    return interest

@router.put("/{interest_id}", response_model=InterestResponse)
async def update_interest_draft(
    interest_id: int,
    req: UpdateInterestDraftRequest,
    db: AsyncSession = Depends(get_db),
):
    interest = await db.get(Interest, interest_id)
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    if req.name is not None:
        new_name = req.name.strip()
        if new_name:
            interest.name = new_name

    if req.draft_prompt_text is not None:
        interest.draft_prompt_text = req.draft_prompt_text
        interest.has_draft_changes = interest.draft_prompt_text != interest.prompt_text

    await db.commit()
    await db.refresh(interest)
    return interest

@router.post("/{interest_id}/discard", response_model=InterestResponse)
async def discard_interest_draft(
    interest_id: int, db: AsyncSession = Depends(get_db)
):
    interest = await db.get(Interest, interest_id)
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    interest.draft_prompt_text = interest.prompt_text
    interest.has_draft_changes = False
    await db.commit()
    await db.refresh(interest)
    return interest

@router.patch("/{interest_id}/toggle", response_model=InterestResponse)
async def toggle_interest_active(
    interest_id: int,
    req: ToggleInterestRequest | None = None,
    db: AsyncSession = Depends(get_db),
):
    interest = await db.get(Interest, interest_id)
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    if req is not None:
        interest.is_active = req.is_active
    else:
        interest.is_active = not interest.is_active

    await db.commit()
    await db.refresh(interest)
    return interest

@router.delete("/{interest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interest(interest_id: int, db: AsyncSession = Depends(get_db)):
    interest = await db.get(Interest, interest_id)
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    await db.delete(interest)
    await db.commit()
    return None
