"""
SQLAlchemy ORM models for the QueryTalk AI application database (Neon PostgreSQL).
The 'user_db_credentials' table stores each Clerk user's external DB connection
details so they persist across sessions.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, func
from core.database import Base


class UserDbCredential(Base):
    """
    Stores one external database connection per Clerk user (upserted on each connect).
    The DB password is encrypted at rest with Fernet before being saved.
    """
    __tablename__ = "user_db_credentials"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    clerk_user_id = Column(String(255), unique=True, nullable=False, index=True)
    db_type       = Column(String(50),  nullable=False)
    host          = Column(String(255), nullable=True)
    port          = Column(Integer,     nullable=True)
    db_name       = Column(String(255), nullable=False)
    username      = Column(String(255), nullable=True)
    password_enc  = Column(String(512), nullable=True)   # Fernet-encrypted ciphertext
    created_at    = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return (
            f"<UserDbCredential user={self.clerk_user_id!r} "
            f"db_type={self.db_type!r} db={self.db_name!r}>"
        )
