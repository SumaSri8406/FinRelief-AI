from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Determine database configuration based on URL
database_url = settings.DATABASE_URL

# For SQLite, we want to allow multi-threaded access and set a longer timeout
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30}

# Create engine
engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True  # Automatically checks connection viability
)

# Enable WAL mode and normal synchronization for SQLite performance
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

# Session factory for DB operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base model class
Base = declarative_base()

# DB Dependency helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
