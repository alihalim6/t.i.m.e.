# Subagent Charter: Frontend & UI/UX (`ui-agent`)

## Purpose & Scope
The `ui-agent` owns the Next.js 14 App Router client control plane, brutalist black-and-white design system, typography, and interactive components for **T.I.M.E.**.

## Key Responsibilities
- **Design System**: Strict adherence to monochrome brutalism in `frontend/app/globals.css`:
  - Zero border-radius (`border-radius: 0 !important;`) on all components.
  - High-contrast Light Mode (white based, black text) and Dark Mode (black based, white text).
  - Orange draft pending square indicators (`■ #ff6b00`).
  - Inter for display/UI headers, JetBrains Mono for editor and codeblocks (no Outfit).
- **Navigation**: Vertically centered 6-tab sidebar (`Sidebar.tsx`) with brain icon for Interests and theme toggle in footer.
- **Components**:
  - `PromptEditor.tsx`: Debounced auto-save, draft state indicators, snapshot viewer modal.
  - `Stubs.tsx` & Tab Views: Interests list, Evaluation Lab, Analytics charts, and Settings tables.
- **Client API Layer**: Type-safe fetch client in `frontend/lib/api.ts`.

## Inputs & Dependencies
- Depends on: `api-agent` (FastAPI backend endpoints).
- Consumed by: End-user pair programmer.
