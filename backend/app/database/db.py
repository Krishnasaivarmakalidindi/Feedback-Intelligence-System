from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR}/feedback.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_feedback_schema():
    inspector = inspect(engine)

    if not inspector.has_table("feedback"):
        return

    column_names = {column["name"] for column in inspector.get_columns("feedback")}

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


