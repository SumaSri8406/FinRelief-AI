from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.schemas.user import UserCreate, UserOut, Token
from app.services.user_service import (
    get_user_by_email,
    create_user,
    authenticate_user,
)
from app.auth.security import create_access_token
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email, password, and optional full name.",
)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    return create_user(db, user_in=user_in)


@router.post(
    "/login",
    response_model=Token,
    summary="Login (form-data)",
    description="Authenticate with email and password using OAuth2 form encoding.",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    return {
        "access_token": create_access_token(subject=user.id),
        "token_type": "bearer",
    }


@router.post(
    "/login/json",
    response_model=Token,
    summary="Login (JSON)",
    description="Authenticate with email and password via JSON body. Convenient for frontend Axios clients.",
)
def login_json(credentials: LoginSchema, db: Session = Depends(get_db)):
    user = authenticate_user(
        db, email=credentials.email, password=credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    return {
        "access_token": create_access_token(subject=user.id),
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current user",
    description="Return the profile of the currently authenticated user.",
)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
