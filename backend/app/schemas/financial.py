from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
import datetime


class FinancialCalculationRequest(BaseModel):
    monthly_income: float = Field(..., gt=0, description="Gross monthly income")
    monthly_expenses: float = Field(..., ge=0, description="Total monthly expenses excluding EMIs")


class FinancialHealthResponse(BaseModel):
    monthly_income: float
    monthly_expenses: float
    total_emi: float
    total_outstanding: float
    monthly_surplus: float
    emi_ratio: float = Field(..., description="EMI as percentage of income")
    debt_income_ratio: float = Field(..., description="Total debt as percentage of annual income")
    financial_health_score: float = Field(..., description="Score from 0 to 100")
    stress_level: str = Field(..., description="Low, Medium, High, or Critical")


class FinancialProfileOut(BaseModel):
    id: int
    user_id: int
    monthly_income: float
    monthly_expenses: float
    total_emi: float
    total_outstanding: float
    monthly_surplus: float
    debt_income_ratio: float
    financial_health_score: float
    stress_level: str
    updated_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FinancialProfileCreate(FinancialCalculationRequest):
    pass

