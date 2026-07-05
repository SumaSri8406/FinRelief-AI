import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class AIHistory(Base):
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    request_type = Column(String, nullable=False)  # strategy, letter, chat
    prompt_summary = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    model_used = Column(String, nullable=False, default="fallback")  # gemini-pro, fallback
    is_fallback = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="ai_history")
