from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import (
    GlobalPrompt,
    ScoringPrompt,
    PromptSnapshot,
    RatingTag,
    AppSetting,
    Interest,
)

SEED_BASE_PROMPT = """<base_instructions>
You are a curator for a personal-interest email newsletter. Your job is to find quality
items that fit the interest outlined below. Generate a thorough summary of each item found.
Each item's summary will be used by another agent to score its quality. Items that score
above a numeric threshold will be included in the email.
</base_instructions>

<interest>
{interest_prompt}
</interest>

Look for items of all types, including:
<non_exhaustive_item_type_list>
- articles
- blogs
- videos
- podcasts
- research publications
- academic and scientific journals
- general website pages
</non_exhaustive_item_type_list>"""

SEED_SCORING_PROMPT = """The following items were gathered from the web by another agent:
<items>
{items}
</items>

The agent was given the following prompt outlining what to look for when gathering items
for the area of interest:
<area_of_interest>
{area_of_interest}
</area_of_interest>
<interest_prompt>
{interest_prompt}
</interest_prompt>

You are the editor-in-chief for an email newsletter containing items that may be of
interest to the recipient. Your job is to score each item on a scale of 0-100 based on
how well you think it aligns with what the recipient is looking for. Use the following
rubric:
<rubric>
75-100: Great find, high likelihood that recipient will enjoy and appreciate this find.
50-74: Seems to fit the area of interest enough, could potentially be a good find.
25-49: May or may not be what recipient is looking for, not likely to be interesting,
       or lacking enough context to be considered a good find.
0-24:  Garbage, completely off-topic or lacking adequate summary, definitely wouldn't
       be of interest to recipient.
</rubric>"""

SEED_TAGS = [
    {"name": "Great", "label": "Great", "weight": 15},
    {"name": "OK", "label": "OK", "weight": 5},
    {"name": "Meh", "label": "Meh", "weight": -5},
    {"name": "Paywalled", "label": "Paywalled", "weight": -10},
    {"name": "Not Interested", "label": "Not Interested", "weight": -10},
    {"name": "Basura", "label": "Basura", "weight": -15},
]

SEED_APP_SETTINGS = [
    {"key": "score_threshold", "value": {"threshold": 50}},
    {"key": "affinity_k_factor", "value": {"k_factor": 3}},
    {"key": "max_items_per_email", "value": {"count": 10}},
]

SEED_INTERESTS = [
    {
        "name": "AI Systems & Agents",
        "prompt_text": "Deep technical articles, architectural breakdowns, research papers, and thoughtful essays on multi-agent systems, LLM evaluation, reasoning architectures, tool use, and cognitive agents. Avoid generic buzzword regurgitation, beginner tutorials, and promotional funding announcements.",
    },
    {
        "name": "Mechanical Keyboards",
        "prompt_text": "Custom mechanical keyboard builds, switch acoustics and materials, firmware developments (QMK/ZMK), ergonomic layout experiments, and keycap artisan craftsmanship. Focus on high-effort enthusiast reviews and open-source keyboard projects.",
    },
    {
        "name": "Distributed Systems",
        "prompt_text": "Engineering post-mortems, distributed consensus algorithms (Raft, Paxos), high-throughput messaging architectures, storage engines, and latency mitigation in large-scale backend infrastructure.",
    },
]

async def seed_database(session: AsyncSession) -> None:
    # 1. Global Prompt
    result = await session.execute(select(GlobalPrompt).limit(1))
    base_prompt = result.scalars().first()
    if not base_prompt:
        base_prompt = GlobalPrompt(
            version=1,
            prompt_text=SEED_BASE_PROMPT,
            draft_prompt_text=SEED_BASE_PROMPT,
            has_draft_changes=False,
        )
        session.add(base_prompt)

    # 2. Scoring Prompt
    result = await session.execute(select(ScoringPrompt).limit(1))
    scoring_prompt = result.scalars().first()
    if not scoring_prompt:
        scoring_prompt = ScoringPrompt(
            version=1,
            prompt_text=SEED_SCORING_PROMPT,
            draft_prompt_text=SEED_SCORING_PROMPT,
            has_draft_changes=False,
        )
        session.add(scoring_prompt)

    await session.flush()

    # 3. Initial Snapshot if none exist
    result = await session.execute(select(PromptSnapshot).limit(1))
    snapshot = result.scalars().first()
    if not snapshot:
        snapshot = PromptSnapshot(
            version_number=1,
            global_prompt_text=SEED_BASE_PROMPT,
            scoring_prompt_text=SEED_SCORING_PROMPT,
            interest_prompts_json=[],
        )
        session.add(snapshot)

    # 4. Rating Tags (No emojis)
    for tag_data in SEED_TAGS:
        result = await session.execute(
            select(RatingTag).where(RatingTag.name == tag_data["name"])
        )
        if not result.scalars().first():
            session.add(RatingTag(**tag_data))

    # 5. App Settings
    for setting in SEED_APP_SETTINGS:
        result = await session.execute(
            select(AppSetting).where(AppSetting.key == setting["key"])
        )
        if not result.scalars().first():
            session.add(AppSetting(**setting))

    # 6. Seed Interests if none exist
    result = await session.execute(select(Interest).limit(1))
    if not result.scalars().first():
        for item in SEED_INTERESTS:
            session.add(
                Interest(
                    name=item["name"],
                    prompt_text=item["prompt_text"],
                    draft_prompt_text=item["prompt_text"],
                    has_draft_changes=False,
                    is_active=True,
                )
            )

    await session.commit()

