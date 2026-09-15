"""initial_tables_prompts_tags_settings

Revision ID: 1208df9f664f
Revises: 
Create Date: 2026-09-03 11:35:07.388886

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = '1208df9f664f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. global_prompts
    op.create_table(
        'global_prompts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('prompt_text', sa.Text(), nullable=False),
        sa.Column('draft_prompt_text', sa.Text(), nullable=True),
        sa.Column('has_draft_changes', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. scoring_prompts
    op.create_table(
        'scoring_prompts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('prompt_text', sa.Text(), nullable=False),
        sa.Column('draft_prompt_text', sa.Text(), nullable=True),
        sa.Column('has_draft_changes', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. prompt_snapshots
    op.create_table(
        'prompt_snapshots',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('global_prompt_text', sa.Text(), nullable=False),
        sa.Column('scoring_prompt_text', sa.Text(), nullable=False),
        sa.Column('interest_prompts_json', sa.JSON().with_variant(JSONB, 'postgresql'), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prompt_snapshots_version_number'), 'prompt_snapshots', ['version_number'], unique=False)

    # 4. rating_tags
    op.create_table(
        'rating_tags',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('label', sa.String(length=100), nullable=False),
        sa.Column('weight', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # 5. app_settings
    op.create_table(
        'app_settings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.JSON().with_variant(JSONB, 'postgresql'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key')
    )
    op.create_index(op.f('ix_app_settings_key'), 'app_settings', ['key'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_app_settings_key'), table_name='app_settings')
    op.drop_table('app_settings')
    op.drop_table('rating_tags')
    op.drop_index(op.f('ix_prompt_snapshots_version_number'), table_name='prompt_snapshots')
    op.drop_table('prompt_snapshots')
    op.drop_table('scoring_prompts')
    op.drop_table('global_prompts')
