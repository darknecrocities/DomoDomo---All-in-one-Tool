import os
from sqlmodel import SQLModel, create_engine, Session

# Set up local sqlite database file path
DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_FILE = os.path.join(DATABASE_DIR, "domodomo.db")
DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

# Enable write-ahead logging (WAL) for concurrent read/write scalability
connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    """Create database tables and enable WAL mode for local concurrency."""
    SQLModel.metadata.create_all(engine)
    # Enable WAL mode via raw connection execution
    with engine.connect() as conn:
        conn.exec_driver_sql("PRAGMA journal_mode=WAL;")

def get_session():
    """FastAPI dependency for database session injection."""
    with Session(engine) as session:
        yield session
