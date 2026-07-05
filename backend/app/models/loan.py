import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    loan_type = Column(String, nullable=False)  # personal, home, auto, credit_card, student, business
    lender_name = Column(String, nullable=False)
    original_amount = Column(Float, nullable=False)
    outstanding_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    emi_amount = Column(Float, nullable=False, default=0.0)
    tenure_months = Column(Integer, nullable=False, default=0)
    overdue_months = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="active")  # active, closed, settled, defaulted

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="loans")
    settlement_records = relationship("SettlementRecord", back_populates="loan", cascade="all, delete-orphan")
