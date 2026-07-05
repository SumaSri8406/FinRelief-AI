import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    loans = relationship("Loan", back_populates="owner", cascade="all, delete-orphan")
    financial_profile = relationship(
        "FinancialProfile",
        back_populates="owner",
        uselist=False,
        cascade="all, delete-orphan",
    )
    settlement_records = relationship(
        "SettlementRecord", back_populates="owner", cascade="all, delete-orphan"
    )
    ai_history = relationship(
        "AIHistory", back_populates="owner", cascade="all, delete-orphan"
    )
