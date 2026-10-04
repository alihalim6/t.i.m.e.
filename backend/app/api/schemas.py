import datetime
from typing import Any
from pydantic import BaseModel

class PromptResponse(BaseModel):
    id: int
    version: int
    prompt_text: str
    draft_prompt_text: str | None
    has_draft_changes: bool
    updated_at: datetime.datetime | None

    model_config = {"from_attributes": True}

class UpdateDraftRequest(BaseModel):
    draft_prompt_text: str

class PublishResponse(BaseModel):
    message: str
    version: int
    published_at: datetime.datetime

class SnapshotResponse(BaseModel):
    id: int
    version_number: int
    global_prompt_text: str
    scoring_prompt_text: str
    interest_prompts_json: list[Any]
    published_at: datetime.datetime

    model_config = {"from_attributes": True}

class RatingTagResponse(BaseModel):
    id: int
    name: str
    label: str
    weight: int
    is_active: bool
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

class InterestResponse(BaseModel):
    id: int
    name: str
    prompt_text: str
    draft_prompt_text: str | None
    has_draft_changes: bool
    is_active: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime | None

    model_config = {"from_attributes": True}

class CreateInterestRequest(BaseModel):
    name: str
    prompt_text: str = ""

class UpdateInterestDraftRequest(BaseModel):
    name: str | None = None
    draft_prompt_text: str | None = None

class ToggleInterestRequest(BaseModel):
    is_active: bool

