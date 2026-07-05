from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.loan import Loan
from app.schemas.loan import LoanCreate, LoanUpdate, LOAN_TYPES, LOAN_STATUSES


def _validate_loan_type(loan_type: str) -> None:
    if loan_type not in LOAN_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid loan type '{loan_type}'. Must be one of: {', '.join(LOAN_TYPES)}",
        )


def _validate_loan_status(loan_status: str) -> None:
    if loan_status not in LOAN_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{loan_status}'. Must be one of: {', '.join(LOAN_STATUSES)}",
        )


def get_loans_by_user(db: Session, user_id: int) -> list[Loan]:
    return db.query(Loan).filter(Loan.user_id == user_id).order_by(Loan.created_at.desc()).all()


def get_loan_by_id(db: Session, loan_id: int, user_id: int) -> Loan:
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with id {loan_id} not found.",
        )
    return loan


def create_loan(db: Session, user_id: int, loan_in: LoanCreate) -> Loan:
    _validate_loan_type(loan_in.loan_type)
    _validate_loan_status(loan_in.status)
    db_loan = Loan(user_id=user_id, **loan_in.model_dump())
    db.add(db_loan)
    try:
        db.flush()
        recalculate_user_financials(db, user_id)
        db.commit()
        db.refresh(db_loan)
    except Exception:
        db.rollback()
        raise
    return db_loan


def update_loan(db: Session, loan_id: int, user_id: int, loan_in: LoanUpdate) -> Loan:
    loan = get_loan_by_id(db, loan_id, user_id)
    update_data = loan_in.model_dump(exclude_unset=True)

    if "loan_type" in update_data:
        _validate_loan_type(update_data["loan_type"])
    if "status" in update_data:
        _validate_loan_status(update_data["status"])

    for field, value in update_data.items():
        setattr(loan, field, value)

    try:
        db.flush()
        recalculate_user_financials(db, user_id)
        db.commit()
        db.refresh(loan)
    except Exception:
        db.rollback()
        raise
    return loan


def delete_loan(db: Session, loan_id: int, user_id: int) -> None:
    loan = get_loan_by_id(db, loan_id, user_id)
    db.delete(loan)
    try:
        db.flush()
        recalculate_user_financials(db, user_id)
        db.commit()
    except Exception:
        db.rollback()
        raise


def recalculate_user_financials(db: Session, user_id: int) -> None:
    from app.models.financial_profile import FinancialProfile
    from app.models.loan import Loan
    from app.services.financial_engine import compute_full_financial_profile
    from app.services.settlement_engine import predict_settlement

    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
    income = profile.monthly_income if profile else 0.0
    expenses = profile.monthly_expenses if profile else 0.0

    loans = db.query(Loan).filter(Loan.user_id == user_id).all()

    profile_data = compute_full_financial_profile(
        db=db,
        user_id=user_id,
        monthly_income=income,
        monthly_expenses=expenses,
        loans=loans,
    )

    debt_ratio = profile_data.get("debt_income_ratio", 0.0)
    for l in loans:
        if l.status in ("active", "defaulted"):
            predict_settlement(
                db=db,
                user_id=user_id,
                loan=l,
                debt_income_ratio=debt_ratio,
            )

