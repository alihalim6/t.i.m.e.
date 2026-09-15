# T.I.M.E. ("Things I Might Enjoy")

Automated multi-agent AI newsletter curator and prompt engineering evaluation lab. Discovers high-value content with Gemini Google Search Grounding, scores summaries against a customizable rubric, incorporates domain affinity reinforcement learning, and delivers interactive newsletters with Gmail AMP actions.

---

## Viewing the Database

You can inspect the database tables and data using **Postico**, **Docker Desktop**, or **pgAdmin**.

### Option A: PostgreSQL with Postico (Recommended)

1. **Start Docker Desktop**:
   Open the **Docker Desktop** app on your Mac and wait for the Docker engine icon to turn green.

2. **Start the Database Containers**:
   In your terminal, navigate to the project root and run:
   ```bash
   docker compose up -d
   ```
   *(This starts PostgreSQL 16 on port `5433` to prevent port collisions with any local Mac Postgres/Postgres.app, and pgAdmin on port `5050`)*

3. **Connect with Postico**:
   Open **Postico**, click **New Favorite**, and enter the following connection settings:
   - **Nickname**: `T.I.M.E. Local`
   - **Host**: `localhost` (or `127.0.0.1`)
   - **Port**: `5433`
   - **User**: `time_user`
   - **Password**: `time_pass`
   - **Database**: `time_db`

4. **Connect**:
   Click **Connect**. You will see all initialized tables:
   - `global_prompts` — Fetcher agent Base Prompt text, draft state, and versions.
   - `scoring_prompts` — Scorer agent rubric text, draft state, and versions.
   - `prompt_snapshots` — Published version archives.
   - `rating_tags` — The 6 emoji-free rating tags (`Great` +15, `OK` +5, `Meh` -5, `Paywalled` -10, `Not Interested` -10, `Basura` -15).
   - `app_settings` — Evaluation parameters (`score_threshold: 50`, `affinity_k_factor: 3`).

---

### Option B: Docker Desktop UI & Web GUI (pgAdmin)

- **In Docker Desktop**:
  Open Docker Desktop to see the `t.i.m.e.` container group (`time-db-1` and `time-pgadmin-1`). You can inspect container health, logs, and volume storage (`pgdata`).
- **In your browser (pgAdmin 4)**:
  Navigate to `http://localhost:5050`
  - **Login**: `admin@time.local`
  - **Password**: `admin`
  - Add server: Host `db`, Port `5432`, Username `time_user`, Password `time_pass`.

---

### Option C: SQLite Development Fallback

If Docker Desktop is **not running** when the backend starts, the FastAPI server automatically falls back to a local SQLite database at:
```
backend/time_dev.db
```
- Because Postico is designed specifically for PostgreSQL, it connects to PostgreSQL (Option A).
- If using the SQLite fallback without Docker, you can inspect `backend/time_dev.db` using any SQLite viewer (such as **DB Browser for SQLite** or the **SQLite Viewer** extension in VS Code / IDE).
- Starting Docker Desktop and running `docker compose up -d` will allow the backend to use PostgreSQL directly.

---

## Local Development Setup

### 1. Backend (FastAPI + Async SQLAlchemy)

```bash
# Setup Python 3.11 environment (if not already created)
python3.11 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt

# Start backend server
PYTHONPATH=backend backend/venv/bin/uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

### 2. Frontend (Next.js 14)

```bash
cd frontend
npm run dev
```
- Control Plane UI: `http://localhost:3000`

### 3. Running Automated Tests

```bash
backend/venv/bin/pytest backend/tests/ -v
```
