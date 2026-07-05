from sqlalchemy.orm import Session

from app.models.loan import Loan
from app.models.financial_profile import FinancialProfile


def calculate_total_emi(loans: list[Loan]) -> float:
    return round(sum(loan.emi_amount for loan in loans if loan.status == "active"), 2)


def calculate_total_outstanding(loans: list[Loan]) -> float:
    return round(sum(loan.outstanding_amount for loan in loans if loan.status in ("active", "defaulted")), 2)


def calculate_monthly_surplus(monthly_income: float, monthly_expenses: float, total_emi: float) -> float:
    return round(monthly_income - monthly_expenses - total_emi, 2)


def calculate_emi_ratio(total_emi: float, monthly_income: float) -> float:
    if monthly_income <= 0:
        return 100.0
    return round((total_emi / monthly_income) * 100, 2)


def calculate_debt_income_ratio(total_outstanding: float, monthly_income: float) -> float:
    annual_income = monthly_income * 12
    if annual_income <= 0:
        return 100.0
    return round((total_outstanding / annual_income) * 100, 2)


def calculate_financial_health_score(
    emi_ratio: float,
    debt_income_ratio: float,
    monthly_surplus: float,
    monthly_income: float,
) -> float:
    score = 100.0

    # EMI ratio penalty: ideal < 30%, dangerous > 50%
    if emi_ratio > 50:
        score -= 35
    elif emi_ratio > 40:
        score -= 25
    elif emi_ratio > 30:
        score -= 15
    elif emi_ratio > 20:
        score -= 5

    # Debt-to-income ratio penalty: ideal < 30%
    if debt_income_ratio > 80:
        score -= 30
    elif debt_income_ratio > 60:
        score -= 20
    elif debt_income_ratio > 40:
        score -= 10
    elif debt_income_ratio > 30:
        score -= 5

    # Surplus penalty
    if monthly_income > 0:
        surplus_ratio = (monthly_surplus / monthly_income) * 100
        if surplus_ratio < 0:
            score -= 25
        elif surplus_ratio < 5:
            score -= 15
        elif surplus_ratio < 10:
            score -= 10
        elif surplus_ratio < 20:
            score -= 5

    return round(max(0.0, min(100.0, score)), 2)


def calculate_financial_stress_level(health_score: float) -> str:
    if health_score >= 70:
        return "Low"
    elif health_score >= 50:
        return "Medium"
    elif health_score >= 30:
        return "High"
    return "Critical"


def compute_full_financial_profile(
    db: Session,
    user_id: int,
    monthly_income: float,
    monthly_expenses: float,
    loans: list[Loan],
) -> dict:
    total_emi = calculate_total_emi(loans)
    total_outstanding = calculate_total_outstanding(loans)
    monthly_surplus = calculate_monthly_surplus(monthly_income, monthly_expenses, total_emi)
    emi_ratio = calculate_emi_ratio(total_emi, monthly_income)
    debt_income_ratio = calculate_debt_income_ratio(total_outstanding, monthly_income)
    health_score = calculate_financial_health_score(
        emi_ratio, debt_income_ratio, monthly_surplus, monthly_income
    )
    stress_level = calculate_financial_stress_level(health_score)

    # Persist / update the profile
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
    if not profile:
        profile = FinancialProfile(user_id=user_id)
        db.add(profile)

    profile.monthly_income = monthly_income
    profile.monthly_expenses = monthly_expenses
    profile.total_emi = total_emi
    profile.total_outstanding = total_outstanding
    profile.monthly_surplus = monthly_surplus
    profile.debt_income_ratio = debt_income_ratio
    profile.financial_health_score = health_score
    profile.stress_level = stress_level

    try:
        db.commit()
        db.refresh(profile)
    except Exception:
        db.rollback()
        raise

    return {
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "total_emi": total_emi,
        "total_outstanding": total_outstanding,
        "monthly_surplus": monthly_surplus,
        "emi_ratio": emi_ratio,
        "debt_income_ratio": debt_income_ratio,
        "financial_health_score": health_score,
        "stress_level": stress_level,
    }

