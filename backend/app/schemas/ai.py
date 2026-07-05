from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
import datetime


class StrategyRequest(BaseModel):
    monthly_income: float = Field(..., gt=0)
    monthly_expenses: float = Field(..., ge=0)
    outstanding_amount: float = Field(..., gt=0)
    loan_type: str = Field(..., description="Type of loan")
    overdue_months: int = Field(0, ge=0)
    interest_rate: float = Field(0.0, ge=0)
    lender_name: str = Field("", description="Name of the lender")


class StrategyResponse(BaseModel):
    strategy: str
    is_fallback: bool = False
    model_used: str = "fallback"


class LetterRequest(BaseModel):
    borrower_name: str = Field(..., min_length=1)
    lender_name: str = Field(..., min_length=1)
    loan_type: str
    outstanding_amount: float = Field(..., gt=0)
    proposed_settlement_amount: float = Field(..., gt=0)
    overdue_months: int = Field(0, ge=0)
    reason: str = Field("financial hardship", description="Reason for requesting settlement")


class LetterResponse(BaseModel):
    letter: str
    is_fallback: bool = False
    model_used: str = "fallback"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    total_outstanding: Optional[float] = None


class ChatResponse(BaseModel):
    reply: str
    is_fallback: bool = False
    model_used: str = "fallback"


class AIHistoryOut(BaseModel):
    id: int
    user_id: int
    request_type: str
    prompt_summary: str
    response_text: str
    model_used: str
    is_fallback: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class AIHistoryListOut(BaseModel):
    records: list[AIHistoryOut]
    total: int
