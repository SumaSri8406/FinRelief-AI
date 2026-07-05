from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
import datetime

LOAN_TYPES = ["personal", "home", "auto", "credit_card", "student", "business"]
LOAN_STATUSES = ["active", "closed", "settled", "defaulted"]


class LoanBase(BaseModel):
    loan_type: str = Field(..., description="One of: personal, home, auto, credit_card, student, business")
    lender_name: str = Field(..., min_length=1, max_length=200)
    original_amount: float = Field(..., gt=0)
    outstanding_amount: float = Field(..., ge=0)
    interest_rate: float = Field(..., ge=0, le=100)
    emi_amount: float = Field(0.0, ge=0)
    tenure_months: int = Field(0, ge=0)
    overdue_months: int = Field(0, ge=0)
    status: str = Field("active", description="One of: active, closed, settled, defaulted")


class LoanCreate(LoanBase):
    pass


class LoanUpdate(BaseModel):
    loan_type: Optional[str] = None
    lender_name: Optional[str] = None
    original_amount: Optional[float] = Field(None, gt=0)
    outstanding_amount: Optional[float] = Field(None, ge=0)
    interest_rate: Optional[float] = Field(None, ge=0, le=100)
    emi_amount: Optional[float] = Field(None, ge=0)
    tenure_months: Optional[int] = Field(None, ge=0)
    overdue_months: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None


class LoanOut(LoanBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LoanListOut(BaseModel):
    loans: list[LoanOut]
    total: int

class LoanResponse(LoanOut):
    pass

