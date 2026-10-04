# Subagent Charter: AI Research & Scoring Engine (`engine-agent`)

## Purpose & Scope
The `engine-agent` owns Gemini Google Search Grounding discovery, the two-prompt scoring pipeline, and the mathematical domain affinity reinforcement loop for **T.I.M.E.**.

## Key Responsibilities
- **Search Grounding**: Implement `BaseResearchProvider` with Gemini Thinking/Flash models using Google Search Grounding (`tools=[{"google_search": {}}]`) returning structured JSON items directly (`title`, `url`, `summary`, `source_domain`, `published_date`).
- **Deduplication**: URL tracking parameter stripping, canonicalization, and seen-item exclusion.
- **Scoring Pipeline**: Execute the Scorer Agent against candidate summaries using the 0–100 rubric prompt (`rubric` score threshold default 50).
- **Domain Affinity Mathematics**:
  - Item final score:
    $$\text{final\_score} = \text{model\_score} + \sum \text{tag\_weights}$$
  - Cumulative running average:
    $$\text{running\_avg} = \frac{\sum \text{final\_scores}}{\text{item\_count}}$$
  - Future affinity bonus:
    $$\text{bonus} = \frac{\text{running\_avg} - 50}{K} \quad (\text{default } K=3)$$
  - Adjusted model score:
    $$\text{score}_{\text{adj}} = \text{model\_score} + \text{bonus}$$

## Inputs & Dependencies
- Depends on: `db-agent` (snapshots, items, domain affinity tables).
- Consumed by: `api-agent` (Eval lab triggers and cron tasks).
