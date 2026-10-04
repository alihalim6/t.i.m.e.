# Subagent Charter: Database & Persistence (`db-agent`)

## Purpose & Scope
The `db-agent` owns database architecture, async SQLAlchemy ORM models, Alembic migrations, PostgreSQL 16 containerization, and data persistence for **T.I.M.E.**.

## Key Responsibilities
- **Data Modeling**: Design and maintain SQLAlchemy async models in `backend/app/db/models.py`:
  - `GlobalPrompt`, `ScoringPrompt`, `PromptSnapshot`
  - `Interest` (topic prompt, active state, draft changes)
  - `RatingTag` (6 emoji-free tags with weights)
  - `BatchEvalRun`, `AgentRun`, `Item`, `Rating`
  - `DomainAffinity` (running average tracking)
  - `AppSetting` (JSONB configuration parameters)
- **Migrations**: Generate and verify Alembic async migrations (`backend/alembic/versions/`).
- **Resilience**: Maintain dual-engine session management in `backend/app/db/session.py` (PostgreSQL container primary, local SQLite `time_dev.db` fallback).
- **Seed Scripts**: Keep initial system data current in `backend/app/db/seed.py`.

## Inputs & Dependencies
- Depends on: None (Foundational layer).
- Consumed by: `api-agent`, `engine-agent`.
