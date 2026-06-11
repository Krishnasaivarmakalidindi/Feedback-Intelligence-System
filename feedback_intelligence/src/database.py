import os
from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Locate root directory for fallback SQLite
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Check for PostgreSQL URL first, else fall back to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{BASE_DIR}/feedback.db"

# PostgreSQL connection adjustments vs SQLite argument checks
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_feedback_schema():
    """Validates schemas and applies default columns dynamically on runtime."""
    inspector = inspect(engine)

    if not inspector.has_table("feedback"):
        return

    column_names = {column["name"] for column in inspector.get_columns("feedback")}

    # Support dynamic migrations for SQLite or Postgres priority scaling columns
    if "priority_score" not in column_names:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE feedback ADD COLUMN priority_score INTEGER NOT NULL DEFAULT 1"
                )
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
