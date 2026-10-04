# Subagent Charter: Backend REST APIs (`api-agent`)

## Purpose & Scope
The `api-agent` owns FastAPI REST route handlers, Pydantic v2 schemas, validation, middleware, and backend automated tests for **T.I.M.E.**.

## Key Responsibilities
- **API Endpoints**: Design and maintain route modules in `backend/app/api/`:
  - `/api/prompts/*`: Base & scoring prompt draft auto-save, revert, snapshots, publish.
  - `/api/interests/*`: CRUD operations for topics of interest and draft management.
  - `/api/tags/*`: Active rating tags retrieval and weight updates.
  - `/api/eval/*`: Batch evaluation execution triggers and item ratings ingestion.
  - `/api/cron/*`: Authenticated scheduler triggers for newsletter dispatch.
- **Validation**: Enforce type-safe request/response schemas in `backend/app/api/schemas.py`.
- **Testing**: Maintain comprehensive `pytest` test suites in `backend/tests/`.

## Inputs & Dependencies
- Depends on: `db-agent` (models and sessions).
- Consumed by: `ui-agent` (Next.js frontend), `email-agent` (action callbacks).
