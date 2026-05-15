"""
routes/database.py — Database connection management.

Endpoints:
  POST   /api/db/test               — Test a connection and return schema preview
  POST   /api/db/connect            — Connect + persist connection to app DB
  POST   /api/db/reconnect/{id}     — Re-activate a saved connection by ID
  GET    /api/db/saved              — List the user's saved connections
  DELETE /api/db/saved/{id}         — Delete a saved connection by ID
  GET    /api/db/status             — Return current connection status
  GET    /api/db/schema             — Return schema of the connected user DB
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import create_engine, inspect
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

import core.database as db_core
from core.database import set_engine, test_engine, get_app_db
from core.encryption import encrypt_password, decrypt_password
from core.models import User, DatabaseConnection
from core.security import verify_clerk_token


router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class DBConnectionRequest(BaseModel):
    name:     Optional[str] = None   # friendly label (auto-generated if omitted)
    db_type:  str
    host:     Optional[str] = None
    port:     Optional[int] = None
    db_name:  str
    username: Optional[str] = None
    password: Optional[str] = None


class SavedConnectionResponse(BaseModel):
    id:            str
    name:          str
    db_type:       str
    host_hint:     Optional[str]
    db_name_hint:  Optional[str]
    is_active:     bool
    created_at:    datetime
    updated_at:    datetime

    class Config:
        from_attributes = True


class TableNameResponse(BaseModel):
    status: str
    connection_id: str
    tables: list[str]
    count: int


class ColumnSchemaResponse(BaseModel):
    name: str
    type: str
    nullable: bool
    default: Optional[str] = None
    primary_key: bool = False


class ForeignKeyResponse(BaseModel):
    constrained_columns: list[str]
    referred_schema: Optional[str] = None
    referred_table: Optional[str] = None
    referred_columns: list[str]


class IndexResponse(BaseModel):
    name: str
    columns: list[str]
    unique: bool = False


class TableSchemaResponse(BaseModel):
    name: str
    schema_name: Optional[str] = None
    full_name: str
    columns: list[ColumnSchemaResponse]
    primary_key: list[str]
    foreign_keys: list[ForeignKeyResponse]
    indexes: list[IndexResponse]


class DatabaseSchemaResponse(BaseModel):
    status: str
    connection_id: str
    tables: list[TableSchemaResponse]
    count: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_connection_string(req: DBConnectionRequest) -> str:
    """Build a SQLAlchemy connection string from the request fields."""
    if req.db_type.lower() == "sqlite":
        return f"sqlite:///./{req.db_name}" if req.db_name else "sqlite:///./demo.db"

    if not all([req.host, req.db_name, req.username, req.password]):
        raise HTTPException(
            status_code=400,
            detail="Missing required connection parameters (host, db_name, username, password).",
        )

    port_str = f":{req.port}" if req.port else ""
    db_type = req.db_type.lower()

    if db_type == "postgresql":
        return f"postgresql://{req.username}:{req.password}@{req.host}{port_str}/{req.db_name}"
    elif db_type == "mysql":
        return f"mysql+pymysql://{req.username}:{req.password}@{req.host}{port_str}/{req.db_name}"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported database type: {req.db_type}")


def _resolve_user(clerk_user_id: str, db: Session) -> User:
    """Look up the User row by Clerk ID. Raises 404 if not found."""
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User with clerk_user_id '{clerk_user_id}' not found. "
                   "Has the Clerk user.created webhook fired?",
        )
    return user


def _parse_connection_uuid(connection_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(connection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid connection ID format.")


def _get_user_connection(connection_id: str, user: User, app_db: Session) -> DatabaseConnection:
    conn_uuid = _parse_connection_uuid(connection_id)
    conn = (
        app_db.query(DatabaseConnection)
        .filter(
            DatabaseConnection.id == conn_uuid,
            DatabaseConnection.user_id == user.id,
        )
        .first()
    )
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")
    return conn


def _connect_args_for(connection_string: str) -> dict[str, Any]:
    connect_args: dict[str, Any] = {}
    if connection_string.startswith("postgresql") and "sslmode" not in connection_string:
        connect_args["sslmode"] = "prefer"
    return connect_args


def _table_full_name(table_name: str, schema_name: Optional[str]) -> str:
    return f"{schema_name}.{table_name}" if schema_name else table_name


def _split_table_name(table: str) -> tuple[Optional[str], str]:
    if "." not in table:
        return None, table
    schema_name, table_name = table.split(".", 1)
    return schema_name or None, table_name


def _get_table_names_from_connection(connection_string: str) -> list[str]:
    engine = create_engine(
        connection_string,
        pool_pre_ping=True,
        connect_args=_connect_args_for(connection_string),
    )
    try:
        inspector = inspect(engine)
        return [
            _table_full_name(table_name, schema_name)
            for schema_name, table_name in _iter_user_tables(inspector)
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect database: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect database: {e}") from e
    finally:
        engine.dispose()


def _get_schema_from_connection(
    connection_string: str,
    table_filter: Optional[str] = None,
) -> list[TableSchemaResponse]:
    engine = create_engine(
        connection_string,
        pool_pre_ping=True,
        connect_args=_connect_args_for(connection_string),
    )
    try:
        inspector = inspect(engine)
        selected_schema, selected_table = _split_table_name(table_filter) if table_filter else (None, None)
        tables = []

        for schema_name, table_name in _iter_user_tables(inspector):
            if selected_table and table_name != selected_table:
                continue
            if selected_schema is not None and schema_name != selected_schema:
                continue

            primary_key = (
                (inspector.get_pk_constraint(table_name, schema=schema_name) or {})
                .get("constrained_columns", [])
            )
            pk_columns = set(primary_key)
            columns = [
                ColumnSchemaResponse(
                    name=column["name"],
                    type=str(column["type"]),
                    nullable=bool(column.get("nullable", True)),
                    default=str(column["default"]) if column.get("default") is not None else None,
                    primary_key=column["name"] in pk_columns,
                )
                for column in inspector.get_columns(table_name, schema=schema_name)
            ]
            foreign_keys = [
                ForeignKeyResponse(
                    constrained_columns=fk.get("constrained_columns") or [],
                    referred_schema=fk.get("referred_schema"),
                    referred_table=fk.get("referred_table"),
                    referred_columns=fk.get("referred_columns") or [],
                )
                for fk in inspector.get_foreign_keys(table_name, schema=schema_name)
            ]
            indexes = [
                IndexResponse(
                    name=index.get("name") or "",
                    columns=index.get("column_names") or [],
                    unique=bool(index.get("unique", False)),
                )
                for index in inspector.get_indexes(table_name, schema=schema_name)
            ]
            tables.append(
                TableSchemaResponse(
                    name=table_name,
                    schema_name=schema_name,
                    full_name=_table_full_name(table_name, schema_name),
                    columns=columns,
                    primary_key=primary_key,
                    foreign_keys=foreign_keys,
                    indexes=indexes,
                )
            )

        if table_filter and not tables:
            raise HTTPException(status_code=404, detail=f"Table '{table_filter}' not found.")

        return tables
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect database: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect database: {e}") from e
    finally:
        engine.dispose()


def _iter_user_tables(inspector):
    default_schema = inspector.default_schema_name
    dialect_name = inspector.bind.dialect.name

    if dialect_name in {"mysql", "sqlite"}:
        schema_names = [default_schema]
    else:
        try:
            schema_names = inspector.get_schema_names()
        except SQLAlchemyError:
            schema_names = [default_schema]

    user_schemas = [
        schema_name
        for schema_name in schema_names
        if schema_name not in {"information_schema", "pg_catalog"}
        and not (schema_name or "").startswith("pg_toast")
        and not (schema_name or "").startswith("pg_temp")
    ] or [None]

    for schema_name in user_schemas:
        effective_schema = None if schema_name == default_schema else schema_name
        try:
            table_names = inspector.get_table_names(schema=effective_schema)
        except SQLAlchemyError:
            continue
        for table_name in table_names:
            yield effective_schema, table_name


# ---------------------------------------------------------------------------
# POST /test — test connection without saving
# ---------------------------------------------------------------------------

@router.post("/test")
def test_db_connection(
    request: DBConnectionRequest,
    payload: dict = Depends(verify_clerk_token),
):
    """Test a database connection and return a schema preview."""
    conn_str = build_connection_string(request)
    try:
        schema_info = test_engine(conn_str)
        return {"status": "success", "message": "Connection successful", "schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {e}")


# ---------------------------------------------------------------------------
# POST /connect — connect and persist connection
# ---------------------------------------------------------------------------

@router.post("/connect")
def connect_db(
    request: DBConnectionRequest,
    app_db: Session = Depends(get_app_db),
    payload: dict = Depends(verify_clerk_token),
):
    """
    Connect to the user's database engine (in-memory) and persist the
    connection details to the app database.
    """
    conn_str = build_connection_string(request)

    # 1. Verify the connection is actually reachable
    try:
        test_engine(conn_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {e}")

    # 2. Set the in-memory engine for this session
    set_engine(conn_str)

    # 3. Resolve the user from the Clerk token
    clerk_user_id = payload["sub"]
    user = _resolve_user(clerk_user_id, app_db)

    # 4. Encrypt the full connection string
    conn_str_enc = encrypt_password(conn_str)

    # 5. Auto-generate a name if not provided
    conn_name = request.name or f"{request.db_type} — {request.db_name}"

    # 6. Check for an existing connection with the same name for this user
    existing = (
        app_db.query(DatabaseConnection)
        .filter(
            DatabaseConnection.user_id == user.id,
            DatabaseConnection.name == conn_name,
        )
        .first()
    )

    if existing:
        # Upsert — update the existing record
        existing.db_type = request.db_type
        existing.connection_string_enc = conn_str_enc
        existing.host_hint = request.host
        existing.db_name_hint = request.db_name
        existing.is_active = True
        existing.updated_at = datetime.utcnow()
        connection_id = str(existing.id)
    else:
        connection = DatabaseConnection(
            user_id=user.id,
            name=conn_name,
            db_type=request.db_type,
            connection_string_enc=conn_str_enc,
            host_hint=request.host,
            db_name_hint=request.db_name,
            is_active=True,
        )
        app_db.add(connection)
        app_db.flush()
        connection_id = str(connection.id)

    app_db.commit()

    return {
        "status": "success",
        "message": f"Connected to '{request.db_name}' and connection saved.",
        "connection_id": connection_id,
    }


# ---------------------------------------------------------------------------
# POST /reconnect/{connection_id} — re-activate a saved connection
# ---------------------------------------------------------------------------

@router.post("/reconnect/{connection_id}")
def reconnect_db(
    connection_id: str,
    app_db: Session = Depends(get_app_db),
    payload: dict = Depends(verify_clerk_token),
):
    """
    Re-activate a previously saved database connection.
    Decrypts the stored connection string and sets the in-memory engine.
    """
    clerk_user_id = payload["sub"]
    user = _resolve_user(clerk_user_id, app_db)

    try:
        conn_uuid = uuid.UUID(connection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid connection ID format.")

    conn = (
        app_db.query(DatabaseConnection)
        .filter(
            DatabaseConnection.id == conn_uuid,
            DatabaseConnection.user_id == user.id,
        )
        .first()
    )
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")

    # Decrypt the stored connection string
    conn_str = decrypt_password(conn.connection_string_enc)
    if not conn_str:
        raise HTTPException(
            status_code=500,
            detail="Could not decrypt connection string. The encryption key may have changed.",
        )

    # Verify the connection is still reachable
    try:
        test_engine(conn_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Reconnection failed: {e}")

    # Set the in-memory engine
    set_engine(conn_str)

    # Update the timestamp
    conn.updated_at = datetime.utcnow()
    app_db.commit()

    return {
        "status": "success",
        "message": f"Reconnected to '{conn.name}'.",
        "connection_id": str(conn.id),
        "name": conn.name,
        "db_type": conn.db_type,
    }


# ---------------------------------------------------------------------------
# GET /saved — list the user's saved connections
# ---------------------------------------------------------------------------

@router.get("/saved", response_model=list[SavedConnectionResponse])
def get_saved_connections(
    app_db: Session = Depends(get_app_db),
    payload: dict = Depends(verify_clerk_token),
):
    """
    Return all saved database connections for the authenticated user.
    Connection strings are never returned — only metadata hints.
    """
    clerk_user_id = payload["sub"]
    user = _resolve_user(clerk_user_id, app_db)

    connections = (
        app_db.query(DatabaseConnection)
        .filter(DatabaseConnection.user_id == user.id)
        .order_by(DatabaseConnection.updated_at.desc())
        .all()
    )

    return [
        SavedConnectionResponse(
            id=str(c.id),
            name=c.name,
            db_type=c.db_type,
            host_hint=c.host_hint,
            db_name_hint=c.db_name_hint,
            is_active=c.is_active,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in connections
    ]


# ---------------------------------------------------------------------------
# GET /connections/{connection_id}/tables - table names for a saved database
# ---------------------------------------------------------------------------

@router.get("/connections/{connection_id}/tables", response_model=TableNameResponse)
def get_connection_table_names(
    connection_id: str,
    app_db: Session = Depends(get_app_db),
    payload: dict = Depends(verify_clerk_token),
):
    """Return table names for a specific saved database connection."""
    clerk_user_id = payload["sub"]
    user = _resolve_user(clerk_user_id, app_db)
    conn = _get_user_connection(connection_id, user, app_db)

    conn_str = decrypt_password(conn.connection_string_enc)
    if not conn_str:
        raise HTTPException(
            status_code=500,
            detail="Could not decrypt connection string. The encryption key may have changed.",
        )

    tables = _get_table_names_from_connection(conn_str)
    return {
        "status": "success",
        "connection_id": str(conn.id),
        "tables": tables,
        "count": len(tables),
    }


# ---------------------------------------------------------------------------
# GET /connections/{connection_id}/schema - structured schema for saved database
# ---------------------------------------------------------------------------

@router.get("/connections/{connection_id}/schema", response_model=DatabaseSchemaResponse)
def get_connection_schema(
    connection_id: str,
    table: Optional[str] = Query(
        default=None,
        description="Optional table name. Use schema.table for non-default schemas.",
    ),
    app_db: Session = Depends(get_app_db),
    payload: dict = Depends(verify_clerk_token),
):
    """
    Return structured table schema for a specific saved database connection.
    Pass ?table=table_name or ?table=schema.table to limit the response.
    """
    clerk_user_id = payload["sub"]
    user = _resolve_user(clerk_user_id, app_db)
    conn = _get_user_connection(connection_id, user, app_db)

    conn_str = decrypt_password(conn.connection_string_enc)
    if not conn_str:
        raise HTTPException(
            status_code=500,
            detail="Could not decrypt connection string. The encryption key may have changed.",
        )

    tables = _get_schema_from_connection(conn_str, table_filter=table)
    return {
        "status": "success",
        "connection_id": str(conn.id),
        "tables": tables,
        "count": len(tables),
    }


# ---------------------------------------------------------------------------
# DELETE /saved/{connection_id} — delete a saved connection
# ---------------------------------------------------------------------------

@router.delete("/saved/{connection_id}")
def delete_saved_connection(
    connection_id: str,
    app_db: Session = Depends(get_app_db),
    payload: dict = Depends(verify_clerk_token),
):
    """Delete a specific saved database connection."""
    clerk_user_id = payload["sub"]
    user = _resolve_user(clerk_user_id, app_db)

    try:
        conn_uuid = uuid.UUID(connection_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid connection ID format.")

    conn = (
        app_db.query(DatabaseConnection)
        .filter(
            DatabaseConnection.id == conn_uuid,
            DatabaseConnection.user_id == user.id,
        )
        .first()
    )
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")

    app_db.delete(conn)
    app_db.commit()
    return {"status": "deleted", "message": "Saved connection removed."}


# ---------------------------------------------------------------------------
# GET /status — connection status (no sensitive data)
# ---------------------------------------------------------------------------

@router.get("/status")
def get_db_status(payload: dict = Depends(verify_clerk_token)):
    """Return whether a user database is currently connected in-memory."""
    is_connected = db_core._user_engine is not None
    return {
        "status": "connected" if is_connected else "disconnected",
    }


# ---------------------------------------------------------------------------
# GET /schema — schema of the connected user database
# ---------------------------------------------------------------------------

@router.get("/schema")
def get_current_schema(payload: dict = Depends(verify_clerk_token)):
    """Return schema information for the currently connected user database."""
    try:
        from core.database import get_schema_info
        schema_info = get_schema_info()
        return {"status": "success", "schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schema: {e}")
