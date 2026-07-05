from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
import datetime


class SettlementPredictionRequest(BaseModel):
    loan_id: int = Field(..., description="ID of the loan to predict settlement for")


class SettlementPredictionResponse(BaseModel):
    loan_id: int
    loan_type: str
    lender_name: str
    outstanding_amount: float
    recommended_percentage: float
    recommended_amount: float
    priority: str
    risk_category: str
    strategy_text: Optional[str] = None
    ai_generated: bool = False


class SettlementHistoryOut(BaseModel):
    id: int
    user_id: int
    loan_id: int
    outstanding_amount: float
    recommended_percentage: float
    recommended_amount: float
    priority: str
    risk_category: str
    ai_generated: bool
    strategy_text: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class SettlementHistoryListOut(BaseModel):
    records: list[SettlementHistoryOut]
    total: int
