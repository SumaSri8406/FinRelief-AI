from sqlalchemy.orm import Session

from app.models.loan import Loan
from app.models.settlement_record import SettlementRecord


def _calculate_base_settlement_percentage(
    loan_type: str,
    interest_rate: float,
    overdue_months: int,
) -> float:
    base = 70.0

    # Loan type adjustments
    type_adjustments = {
        "credit_card": -15.0,
        "personal": -10.0,
        "business": -8.0,
        "auto": -5.0,
        "student": -3.0,
        "home": 0.0,
    }
    base += type_adjustments.get(loan_type, -5.0)

    # Interest rate adjustments: higher rates give more room for settlement
    if interest_rate > 30:
        base -= 10
    elif interest_rate > 20:
        base -= 7
    elif interest_rate > 15:
        base -= 4

    # Overdue months: longer overdue increases settlement leverage
    if overdue_months > 24:
        base -= 15
    elif overdue_months > 12:
        base -= 10
    elif overdue_months > 6:
        base -= 5
    elif overdue_months > 3:
        base -= 2

    return max(30.0, min(90.0, base))


def _calculate_priority(overdue_months: int, debt_ratio: float) -> str:
    if overdue_months > 12 or debt_ratio > 60:
        return "Critical"
    elif overdue_months > 6 or debt_ratio > 40:
        return "High"
    elif overdue_months > 3 or debt_ratio > 25:
        return "Medium"
    return "Low"


def _calculate_risk_category(
    overdue_months: int,
    interest_rate: float,
    outstanding_ratio: float,
) -> str:
    risk_score = 0

    if overdue_months > 12:
        risk_score += 3
    elif overdue_months > 6:
        risk_score += 2
    elif overdue_months > 3:
        risk_score += 1

    if interest_rate > 25:
        risk_score += 2
    elif interest_rate > 15:
        risk_score += 1

    if outstanding_ratio > 80:
        risk_score += 2
    elif outstanding_ratio > 50:
        risk_score += 1

    if risk_score >= 6:
        return "Critical"
    elif risk_score >= 4:
        return "High"
    elif risk_score >= 2:
        return "Moderate"
    return "Low"


def predict_settlement(
    db: Session,
    user_id: int,
    loan: Loan,
    debt_income_ratio: float = 0.0,
    stress_level: str = None,
) -> dict:
    outstanding_ratio = 0.0
    if loan.original_amount > 0:
        outstanding_ratio = (loan.outstanding_amount / loan.original_amount) * 100

    settlement_pct = _calculate_base_settlement_percentage(
        loan_type=loan.loan_type,
        interest_rate=loan.interest_rate,
        overdue_months=loan.overdue_months,
    )

    # Debt-income ratio adjustment
    if debt_income_ratio > 50:
        settlement_pct -= 5
    elif debt_income_ratio > 30:
        settlement_pct -= 2

    settlement_pct = round(max(30.0, min(90.0, settlement_pct)), 1)
    recommended_amount = round(loan.outstanding_amount * (settlement_pct / 100), 2)

    priority = _calculate_priority(loan.overdue_months, debt_income_ratio)
    risk_category = _calculate_risk_category(
        loan.overdue_months, loan.interest_rate, outstanding_ratio
    )

    strategy_text = (
        f"Based on the analysis of your {loan.loan_type} loan with {loan.lender_name}, "
        f"we recommend settling at {settlement_pct}% of the outstanding balance. "
        f"The outstanding amount is ₹{loan.outstanding_amount:,.2f}, and the recommended "
        f"settlement amount is ₹{recommended_amount:,.2f}. "
        f"Priority level: {priority}. Risk category: {risk_category}. "
        f"With {loan.overdue_months} month(s) overdue at {loan.interest_rate}% interest rate, "
        f"negotiating a lump-sum settlement is advisable to prevent further credit score damage."
    )

    # Persist to database (Reuse existing record for the loan if available to avoid bloat)
    record = db.query(SettlementRecord).filter(SettlementRecord.loan_id == loan.id).first()
    if not record:
        record = SettlementRecord(user_id=user_id, loan_id=loan.id)
        db.add(record)

    record.outstanding_amount = loan.outstanding_amount
    record.recommended_percentage = settlement_pct
    record.recommended_amount = recommended_amount
    record.priority = priority
    record.risk_category = risk_category
    record.ai_generated = False
    record.strategy_text = strategy_text

    try:
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        raise

    # Fetch financial health (stress level) to include in response
    if stress_level is None:
        from app.models.financial_profile import FinancialProfile
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
        stress_level = profile.stress_level if profile else "Low"

    return {
        "loan_id": loan.id,
        "loan_type": loan.loan_type,
        "lender_name": loan.lender_name,
        "outstanding_amount": loan.outstanding_amount,
        "recommended_percentage": settlement_pct,
        "recommended_amount": recommended_amount,
        "priority": priority,
        "risk_category": risk_category,
        "strategy_text": strategy_text,
        "ai_generated": False,
        "financial_health": stress_level,
    }


def get_settlement_history(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> list[SettlementRecord]:
    return (
        db.query(SettlementRecord)
        .filter(SettlementRecord.user_id == user_id)
        .order_by(SettlementRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_settlement_history_count(db: Session, user_id: int) -> int:
    return db.query(SettlementRecord).filter(SettlementRecord.user_id == user_id).count()

