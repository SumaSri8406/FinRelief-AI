from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.ai_history import AIHistory
from app.schemas.ai import AIHistoryListOut

router = APIRouter(prefix="/history", tags=["History"])


@router.get(
    "/ai",
    response_model=AIHistoryListOut,
    summary="Get AI interaction history",
    description=(
        "Retrieve the authenticated user's AI interaction history, ordered by most recent first. "
        "Supports pagination via skip and limit query parameters."
    ),
)
def get_ai_history(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=200, description="Maximum records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(AIHistory)
        .filter(AIHistory.user_id == current_user.id)
        .order_by(AIHistory.created_at.desc())
    )
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    return AIHistoryListOut(records=records, total=total)
