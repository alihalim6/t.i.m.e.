import datetime
from typing import Any
from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class GlobalPrompt(Base):
    __tablename__ = "global_prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    draft_prompt_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    has_draft_changes: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

class ScoringPrompt(Base):
    __tablename__ = "scoring_prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    draft_prompt_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    has_draft_changes: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

class PromptSnapshot(Base):
    __tablename__ = "prompt_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    global_prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    scoring_prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    interest_prompts_json: Mapped[Any] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), default=list, nullable=False
    )
    published_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

class RatingTag(Base):
    __tablename__ = "rating_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    weight: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

class AppSetting(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    value: Mapped[Any] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), nullable=False
    )
