from sqlalchemy.orm import Session

from app.core import logger
from app.models.ai_history import AIHistory
from app.services.gemini_service import gemini_service, GeminiUnavailableError
from app.services import fallback_engine


def generate_strategy(
    db: Session,
    user_id: int,
    monthly_income: float,
    monthly_expenses: float,
    outstanding_amount: float,
    loan_type: str,
    overdue_months: int,
    interest_rate: float,
    lender_name: str,
) -> dict:
    prompt_summary = (
        f"Strategy: {loan_type} loan, ₹{outstanding_amount:,.0f} outstanding, "
        f"{overdue_months}mo overdue, {interest_rate}% rate"
    )

    try:
        text = gemini_service.generate_strategy(
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            outstanding_amount=outstanding_amount,
            loan_type=loan_type,
            overdue_months=overdue_months,
            interest_rate=interest_rate,
            lender_name=lender_name,
        )
        model_used = "gemini-pro"
        is_fallback = False
    except (GeminiUnavailableError, Exception) as exc:
        logger.info(f"Gemini unavailable, using fallback: {exc}")
        text = fallback_engine.generate_strategy_fallback(
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            outstanding_amount=outstanding_amount,
            loan_type=loan_type,
            overdue_months=overdue_months,
            interest_rate=interest_rate,
            lender_name=lender_name,
        )
        model_used = "fallback"
        is_fallback = True

    _save_history(db, user_id, "strategy", prompt_summary, text, model_used, is_fallback)
    return {"strategy": text, "is_fallback": is_fallback, "model_used": model_used}


def generate_letter(
    db: Session,
    user_id: int,
    borrower_name: str,
    lender_name: str,
    loan_type: str,
    outstanding_amount: float,
    proposed_settlement_amount: float,
    overdue_months: int,
    reason: str,
) -> dict:
    prompt_summary = (
        f"Letter: {borrower_name} to {lender_name}, "
        f"₹{outstanding_amount:,.0f} → ₹{proposed_settlement_amount:,.0f}"
    )

    try:
        text = gemini_service.generate_letter(
            borrower_name=borrower_name,
            lender_name=lender_name,
            loan_type=loan_type,
            outstanding_amount=outstanding_amount,
            proposed_settlement_amount=proposed_settlement_amount,
            overdue_months=overdue_months,
            reason=reason,
        )
        model_used = "gemini-pro"
        is_fallback = False
    except (GeminiUnavailableError, Exception) as exc:
        logger.info(f"Gemini unavailable, using fallback: {exc}")
        text = fallback_engine.generate_letter_fallback(
            borrower_name=borrower_name,
            lender_name=lender_name,
            loan_type=loan_type,
            outstanding_amount=outstanding_amount,
            proposed_settlement_amount=proposed_settlement_amount,
            overdue_months=overdue_months,
            reason=reason,
        )
        model_used = "fallback"
        is_fallback = True

    _save_history(db, user_id, "letter", prompt_summary, text, model_used, is_fallback)
    return {"letter": text, "is_fallback": is_fallback, "model_used": model_used}


def chat(
    db: Session,
    user_id: int,
    message: str,
    monthly_income: float = None,
    monthly_expenses: float = None,
    total_outstanding: float = None,
) -> dict:
    prompt_summary = f"Chat: {message[:100]}"

    try:
        text = gemini_service.chat(
            message=message,
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            total_outstanding=total_outstanding,
        )
        model_used = "gemini-pro"
        is_fallback = False
    except (GeminiUnavailableError, Exception) as exc:
        logger.info(f"Gemini unavailable, using fallback: {exc}")
        text = fallback_engine.chat_fallback(
            message=message,
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            total_outstanding=total_outstanding,
        )
        model_used = "fallback"
        is_fallback = True

    _save_history(db, user_id, "chat", prompt_summary, text, model_used, is_fallback)
    return {"reply": text, "is_fallback": is_fallback, "model_used": model_used}


def _save_history(
    db: Session,
    user_id: int,
    request_type: str,
    prompt_summary: str,
    response_text: str,
    model_used: str,
    is_fallback: bool,
) -> None:
    record = AIHistory(
        user_id=user_id,
        request_type=request_type,
        prompt_summary=prompt_summary,
        response_text=response_text,
        model_used=model_used,
        is_fallback=is_fallback,
    )
    db.add(record)
    db.commit()
