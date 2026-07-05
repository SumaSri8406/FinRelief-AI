from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.settlement import (
    SettlementPredictionRequest,
    SettlementPredictionResponse,
    SettlementHistoryListOut,
)
from app.services.loan_service import get_loan_by_id
from app.services import settlement_engine
from app.services.financial_engine import (
    calculate_total_outstanding,
    calculate_debt_income_ratio,
)

router = APIRouter(prefix="/settlement", tags=["Settlement Prediction"])


@router.post(
    "/predict",
    response_model=SettlementPredictionResponse,
    summary="Predict settlement",
    description=(
        "Run the settlement prediction engine on a specific loan. Returns the "
        "recommended settlement percentage, amount, priority, and risk category."
    ),
)
def predict_settlement(
    data: SettlementPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = get_loan_by_id(db, loan_id=data.loan_id, user_id=current_user.id)

    from app.services.loan_service import get_loans_by_user
    from app.models.financial_profile import FinancialProfile

    all_loans = get_loans_by_user(db, current_user.id)
    total_outstanding = calculate_total_outstanding(all_loans)
    profile = (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == current_user.id)
        .first()
    )
    monthly_income = profile.monthly_income if profile else 0.0
    debt_ratio = calculate_debt_income_ratio(total_outstanding, monthly_income)

    result = settlement_engine.predict_settlement(
        db,
        user_id=current_user.id,
        loan=loan,
        debt_income_ratio=debt_ratio,
    )
    return result


@router.get(
    "/history",
    response_model=SettlementHistoryListOut,
    summary="Get settlement history",
    description="Retrieve all past settlement predictions for the authenticated user.",
)
def get_settlement_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = settlement_engine.get_settlement_history(db, user_id=current_user.id)
    return SettlementHistoryListOut(records=records, total=len(records))
