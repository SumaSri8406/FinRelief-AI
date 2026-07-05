import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    monthly_income = Column(Float, nullable=False, default=0.0)
    monthly_expenses = Column(Float, nullable=False, default=0.0)
    total_emi = Column(Float, nullable=False, default=0.0)
    total_outstanding = Column(Float, nullable=False, default=0.0)
    monthly_surplus = Column(Float, nullable=False, default=0.0)
    debt_income_ratio = Column(Float, nullable=False, default=0.0)
    financial_health_score = Column(Float, nullable=False, default=0.0)
    stress_level = Column(String, nullable=False, default="Low")  # Low, Medium, High, Critical

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    owner = relationship("User", back_populates="financial_profile")
