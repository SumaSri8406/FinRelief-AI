from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.loan import LoanCreate, LoanUpdate, LoanOut, LoanListOut
from app.services import loan_service

router = APIRouter(prefix="/loans", tags=["Loans"])


@router.get(
    "",
    response_model=LoanListOut,
    summary="List all loans",
    description="Retrieve all loans belonging to the authenticated user.",
)
def list_loans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loans = loan_service.get_loans_by_user(db, user_id=current_user.id)
    return LoanListOut(loans=loans, total=len(loans))


@router.get(
    "/{loan_id}",
    response_model=LoanOut,
    summary="Get loan by ID",
    description="Retrieve a specific loan by its ID. Must belong to the authenticated user.",
)
def get_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return loan_service.get_loan_by_id(db, loan_id=loan_id, user_id=current_user.id)


@router.post(
    "",
    response_model=LoanOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new loan",
    description="Add a new loan record for the authenticated user.",
)
def create_loan(
    loan_in: LoanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return loan_service.create_loan(db, user_id=current_user.id, loan_in=loan_in)


@router.put(
    "/{loan_id}",
    response_model=LoanOut,
    summary="Update a loan",
    description="Update an existing loan. Only provided fields will be changed.",
)
def update_loan(
    loan_id: int,
    loan_in: LoanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return loan_service.update_loan(
        db, loan_id=loan_id, user_id=current_user.id, loan_in=loan_in
    )


@router.delete(
    "/{loan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a loan",
    description="Permanently delete a loan record.",
)
def delete_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loan_service.delete_loan(db, loan_id=loan_id, user_id=current_user.id)
