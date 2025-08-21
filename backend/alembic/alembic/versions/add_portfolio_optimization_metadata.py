"""Add portfolio optimization metadata

Revision ID: add_portfolio_optimization_metadata
Revises: 
Create Date: 2025-08-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_portfolio_optimization_metadata'
down_revision = None
depends_on = None


def upgrade():
    # Add optimization metadata columns to portfolios table
    op.add_column('portfolios', sa.Column('optimization_method', sa.String(), nullable=True))
    op.add_column('portfolios', sa.Column('risk_tolerance', sa.String(), nullable=True))
    op.add_column('portfolios', sa.Column('investment_amount', sa.Float(), nullable=True))
    op.add_column('portfolios', sa.Column('expected_return', sa.Float(), nullable=True))
    op.add_column('portfolios', sa.Column('expected_volatility', sa.Float(), nullable=True))
    op.add_column('portfolios', sa.Column('sharpe_ratio', sa.Float(), nullable=True))


def downgrade():
    # Remove optimization metadata columns from portfolios table
    op.drop_column('portfolios', 'sharpe_ratio')
    op.drop_column('portfolios', 'expected_volatility')
    op.drop_column('portfolios', 'expected_return')
    op.drop_column('portfolios', 'investment_amount')
    op.drop_column('portfolios', 'risk_tolerance')
    op.drop_column('portfolios', 'optimization_method')
