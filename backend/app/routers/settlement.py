from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas import (
    SettlementRequest,
    SettlementResponse,
    SettlementHistoryListOut,
    ApiResponse,
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
    response_model=ApiResponse[SettlementResponse],
    summary="Predict settlement",
    description=(
        "Run the settlement prediction engine on a specific loan. Returns the "
        "recommended settlement percentage, amount, priority, and risk category."
    ),
)
def predict_settlement(
    data: SettlementRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan = get_loan_by_id(db, loan_id=data.loan_id, user_id=current_user.id)

    all_loans = current_user.loans
    total_outstanding = calculate_total_outstanding(all_loans)
    profile = current_user.financial_profile
    monthly_income = profile.monthly_income if profile else 0.0
    debt_ratio = calculate_debt_income_ratio(total_outstanding, monthly_income)

    result = settlement_engine.predict_settlement(
        db,
        user_id=current_user.id,
        loan=loan,
        debt_income_ratio=debt_ratio,
        stress_level=profile.stress_level if profile else "Low",
    )
    return ApiResponse(
        success=True,
        message="Settlement recommendation generated successfully",
        data=result
    )


@router.get(
    "/history",
    response_model=ApiResponse[SettlementHistoryListOut],
    summary="Get settlement history",
    description="Retrieve all past settlement predictions for the authenticated user with pagination.",
)
def get_settlement_history(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=200, description="Maximum records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = settlement_engine.get_settlement_history(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    total = settlement_engine.get_settlement_history_count(db, user_id=current_user.id)
    data = SettlementHistoryListOut(records=records, total=total)
    return ApiResponse(
        success=True,
        message="Settlement history retrieved successfully",
        data=data
    )

