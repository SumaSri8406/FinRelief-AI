from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.config import settings
from app.database import engine, Base
from app.routers import auth_router
from app.core import logger
from app.utils import create_error_response

# Initialize database tables
# For development/SQLite, create tables on startup if they don't exist.
# In a full production environment, Alembic would handle this.
try:
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Error initializing database: {e}")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI Powered Debt Relief & Financial Recovery Platform - Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handling middleware / Request timing logging
@app.middleware("http")
async def log_requests_and_handle_errors(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Incoming Request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        logger.info(f"Request Completed: {request.method} {request.url.path} - Status: {response.status_code} - Duration: {process_time:.4f}s")
        return response
    except Exception as exc:
        logger.error(f"Unhandled exception during {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response("Internal Server Error", str(exc)),
        )

# Startup and Shutdown Events
@app.on_event("startup")
def startup_event():
    logger.info("=========================================")
    logger.info(f"Starting {settings.PROJECT_NAME} API Service")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database URL: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    logger.info("=========================================")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("=========================================")
    logger.info(f"Shutting down {settings.PROJECT_NAME} API Service")
    logger.info("=========================================")

# Global Root Health Check
@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

# API Versioning Version 1 Root & Health Check
@app.get(f"{settings.API_V1_STR}/health", status_code=status.HTTP_200_OK)
def v1_health_check():
    return {
        "status": "healthy",
        "version": "v1",
        "app": settings.PROJECT_NAME
    }

# Router Registrations
app.include_router(auth_router, prefix=settings.API_V1_STR)
