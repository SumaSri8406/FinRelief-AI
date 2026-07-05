from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.financial import (
    FinancialCalculationRequest,
    FinancialHealthResponse,
)
from app.services.financial_engine import compute_full_financial_profile
from app.services.loan_service import get_loans_by_user

router = APIRouter(prefix="/financial", tags=["Financial Engine"])


@router.get(
    "/health",
    response_model=FinancialHealthResponse,
    summary="Get financial health",
    description=(
        "Compute the authenticated user's full financial health profile based on "
        "their stored loans and most recent income/expenses. Requires at least one "
        "prior call to POST /calculate to set income and expenses."
    ),
)
def get_financial_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.financial_profile import FinancialProfile

    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.id)
        .first()
    )
    monthly_income = profile.monthly_income if profile else 0.0
    monthly_expenses = profile.monthly_expenses if profile else 0.0

    loans = get_loans_by_user(db, user_id=current_user.id)
    result = compute_full_financial_profile(
        db,
        user_id=current_user.id,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        loans=loans,
    )
    return result


@router.post(
    "/calculate",
    response_model=FinancialHealthResponse,
    summary="Calculate financial health",
    description=(
        "Supply current income and expenses. The engine calculates EMI totals from "
        "stored loans, computes surplus, debt ratios, health score, and stress level. "
        "The result is persisted to the user's financial profile."
    ),
)
def calculate_financial_health(
    data: FinancialCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loans = get_loans_by_user(db, user_id=current_user.id)
    result = compute_full_financial_profile(
        db,
        user_id=current_user.id,
        monthly_income=data.monthly_income,
        monthly_expenses=data.monthly_expenses,
        loans=loans,
    )
    return result
