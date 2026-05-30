"""add target column

Revision ID: 52a1b9e2c3d4
Revises: c49406e2eccc
Create Date: 2026-05-30 10:35:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '52a1b9e2c3d4'
down_revision = 'c49406e2eccc'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('projects', sa.Column('target_column', sa.String(), nullable=True))

def downgrade():
    op.drop_column('projects', 'target_column')
