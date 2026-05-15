from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    ForeignKey,
    CheckConstraint,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMP
from sqlalchemy.orm import declarative_base, relationship
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(Text, unique=True, nullable=False)
    email = Column(Text, nullable=False)
    display_name = Column(Text)
    plan = Column(Text, nullable=False, server_default="free")

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    # Relationships
    database_connections = relationship(
        "DatabaseConnection",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class DatabaseConnection(Base):
    __tablename__ = "database_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(Text, nullable=False)

    # postgres | mysql | sqlite | snowflake
    db_type = Column(Text, nullable=False)

    connection_string_enc = Column(Text, nullable=False)

    host_hint = Column(Text)
    db_name_hint = Column(Text)

    schema_cache = Column(JSONB)

    schema_synced_at = Column(TIMESTAMP(timezone=True))

    is_active = Column(Boolean, default=True)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    # Relationships
    user = relationship("User", back_populates="database_connections")

    conversations = relationship(
        "Conversation",
        back_populates="connection"
    )

    query_history = relationship(
        "QueryHistory",
        back_populates="connection",
        cascade="all, delete-orphan"
    )

    # Index
    __table_args__ = (
        Index("idx_connections_user", "user_id"),
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    connection_id = Column(
        UUID(as_uuid=True),
        ForeignKey("database_connections.id", ondelete="SET NULL")
    )

    title = Column(
        Text,
        server_default="New conversation"
    )

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    # Relationships
    user = relationship("User", back_populates="conversations")

    connection = relationship(
        "DatabaseConnection",
        back_populates="conversations"
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )

    # Indexes
    __table_args__ = (
        Index("idx_conversations_user", "user_id"),
        Index("idx_conversations_conn", "connection_id"),
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False
    )

    role = Column(Text, nullable=False)

    content = Column(Text, nullable=False)

    sql_generated = Column(Text)

    query_result = Column(JSONB)

    chart_type = Column(Text)

    row_count = Column(Integer)

    duration_ms = Column(Integer)

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "role IN ('user', 'assistant')",
            name="check_message_role"
        ),
        Index("idx_messages_conversation", "conversation_id"),
    )

    # Relationships
    conversation = relationship(
        "Conversation",
        back_populates="messages"
    )

    query_history = relationship(
        "QueryHistory",
        back_populates="message"
    )


class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    connection_id = Column(
        UUID(as_uuid=True),
        ForeignKey("database_connections.id", ondelete="CASCADE"),
        nullable=False
    )

    message_id = Column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="SET NULL")
    )

    sql_query = Column(Text, nullable=False)

    status = Column(Text, nullable=False)

    duration_ms = Column(Integer)

    error_message = Column(Text)

    executed_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('success', 'error', 'timeout')",
            name="check_query_status"
        ),
        Index("idx_query_history_conn", "connection_id"),
    )

    # Relationships
    connection = relationship(
        "DatabaseConnection",
        back_populates="query_history"
    )

    message = relationship(
        "Message",
        back_populates="query_history"
    )