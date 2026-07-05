import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class SettlementRecord(Base):
    __tablename__ = "settlement_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    loan_id = Column(
        Integer,
        ForeignKey("loans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    outstanding_amount = Column(Float, nullable=False)
    recommended_percentage = Column(Float, nullable=False)
    recommended_amount = Column(Float, nullable=False)
    priority = Column(String, nullable=False)  # Low, Medium, High, Critical
    risk_category = Column(String, nullable=False)  # Low, Moderate, High, Critical
    ai_generated = Column(Boolean, nullable=False, default=False)
    strategy_text = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="settlement_records")
    loan = relationship("Loan", back_populates="settlement_records")
