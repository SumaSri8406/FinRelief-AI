from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time


from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth_router,
    loans_router,
    financial_router,
    settlement_router,
    ai_router,
    history_router,
)
from app.core import logger
from app.utils import create_error_response
from app.services.gemini_service import gemini_service

# Initialize database tables on import.
# In production, use Alembic migrations instead.
try:
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Error initializing database: {e}")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "AI Powered Debt Relief & Financial Recovery Platform.\n\n"
        "Features:\n"
        "- JWT Authentication\n"
        "- Loan CRUD Management\n"
        "- Financial Health Engine\n"
        "- Settlement Prediction Engine\n"
        "- Google Gemini AI Integration (with automatic fallback)\n"
        "- AI Chat Counselor\n"
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error": {
                "code": exc.status_code,
                "details": exc.detail
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation Error",
            "error": {
                "code": 422,
                "details": exc.errors()
            }
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal Server Error",
            "error": {
                "code": 500,
                "details": str(exc)
            }
        }
    )


@app.middleware("http")
async def log_requests_and_handle_errors(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Incoming: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        logger.info(
            f"Completed: {request.method} {request.url.path} "
            f"- {response.status_code} in {process_time:.4f}s"
        )
        return response
    except Exception as exc:
        logger.error(
            f"Unhandled exception: {request.method} {request.url.path}: {exc}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Internal Server Error",
                "error": {
                    "code": 500,
                    "details": str(exc)
                }
            },
        )



@app.on_event("startup")
def startup_event():
    logger.info("=" * 50)
    logger.info(f"Starting {settings.PROJECT_NAME} API v2.0")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    db_display = (
        settings.DATABASE_URL.split("@")[-1]
        if "@" in settings.DATABASE_URL
        else settings.DATABASE_URL
    )
    logger.info(f"Database: {db_display}")

    if gemini_service.available:
        logger.info("Gemini AI: ENABLED")
    else:
        logger.info("Gemini AI: DISABLED (using fallback engine)")
    logger.info("=" * 50)


@app.on_event("shutdown")
def shutdown_event():
    logger.info("=" * 50)
    logger.info(f"Shutting down {settings.PROJECT_NAME} API")
    logger.info("=" * 50)


# Health checks
@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "app": settings.PROJECT_NAME,
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "gemini_available": gemini_service.available,
    }


@app.get(
    f"{settings.API_V1_STR}/health",
    status_code=status.HTTP_200_OK,
    tags=["Health"],
)
def v1_health_check():
    return {
        "status": "healthy",
        "version": "v1",
        "app": settings.PROJECT_NAME,
    }


# Register all routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(loans_router, prefix=settings.API_V1_STR)
app.include_router(financial_router, prefix=settings.API_V1_STR)
app.include_router(settlement_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
