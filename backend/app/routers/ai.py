from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import (
    StrategyRequest,
    StrategyResponse,
    LetterRequest,
    LetterResponse,
    ChatRequest,
    ChatResponse,
)
from app.services import ai_orchestrator

router = APIRouter(prefix="/ai", tags=["AI Engine"])


@router.post(
    "/generate-strategy",
    response_model=StrategyResponse,
    summary="Generate negotiation strategy",
    description=(
        "Generate a personalized debt negotiation strategy using Gemini AI. "
        "If the AI service is unavailable, the rule-based fallback engine is used automatically. "
        "The response includes an `is_fallback` flag indicating which engine was used."
    ),
)
def generate_strategy(
    data: StrategyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ai_orchestrator.generate_strategy(
        db=db,
        user_id=current_user.id,
        monthly_income=data.monthly_income,
        monthly_expenses=data.monthly_expenses,
        outstanding_amount=data.outstanding_amount,
        loan_type=data.loan_type,
        overdue_months=data.overdue_months,
        interest_rate=data.interest_rate,
        lender_name=data.lender_name,
    )


@router.post(
    "/generate-letter",
    response_model=LetterResponse,
    summary="Generate settlement letter",
    description=(
        "Generate a professional settlement negotiation letter addressed to the lender. "
        "Uses Gemini AI when available, otherwise falls back to rule-based templates."
    ),
)
def generate_letter(
    data: LetterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ai_orchestrator.generate_letter(
        db=db,
        user_id=current_user.id,
        borrower_name=data.borrower_name,
        lender_name=data.lender_name,
        loan_type=data.loan_type,
        outstanding_amount=data.outstanding_amount,
        proposed_settlement_amount=data.proposed_settlement_amount,
        overdue_months=data.overdue_months,
        reason=data.reason,
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with AI counselor",
    description=(
        "Ask the FinRelief AI counselor a financial question. Optionally provide "
        "income, expenses, and outstanding debt for context-aware responses. "
        "Falls back to rule-based responses if Gemini AI is unavailable."
    ),
)
def ai_chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ai_orchestrator.chat(
        db=db,
        user_id=current_user.id,
        message=data.message,
        monthly_income=data.monthly_income,
        monthly_expenses=data.monthly_expenses,
        total_outstanding=data.total_outstanding,
    )
