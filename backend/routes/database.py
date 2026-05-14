"""
routes/database.py — Database connection management.

Endpoints:
  POST   /api/db/test      — Test a connection and return schema preview
  POST   /api/db/connect   — Connect + persist credentials to Neon DB
  GET    /api/db/saved     — Retrieve the current user's saved credentials
  DELETE /api/db/saved     — Delete the current user's saved credentials
  GET    /api/db/status    — Return current connection URL
  GET    /api/db/schema    — Return schema of the connected user DB
  GET    /api/db/analytics — Return aggregated analytics data
"""

from __future__ import annotations

import random
from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

import core.database as db_core
from core.database import set_engine, test_engine, get_app_db
from core.encryption import encrypt_password, decrypt_password
from core.models import UserDbCredential


router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class DBConnectionRequest(BaseModel):
    db_type:  str
    host:     Optional[str] = None
    port:     Optional[int] = None
    db_name:  str
    username: Optional[str] = None
    password: Optional[str] = None


class SavedCredentialResponse(BaseModel):
    db_type:  str
    host:     Optional[str]
    port:     Optional[int]
    db_name:  str
    username: Optional[str]
    password: str            # always "••••••••" — never returned in plaintext
    updated_at: datetime


# ---------------------------------------------------------------------------
# Helper: build a SQLAlchemy connection string
# ---------------------------------------------------------------------------

def build_connection_string(req: DBConnectionRequest) -> str:
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


# ---------------------------------------------------------------------------
# POST /test — test connection without saving
# ---------------------------------------------------------------------------

@router.post("/test")
def test_db_connection(
    request: DBConnectionRequest,
):
    """Test a database connection and return a schema preview."""
    conn_str = build_connection_string(request)
    try:
        schema_info = test_engine(conn_str)
        return {"status": "success", "message": "Connection successful", "schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {e}")


# ---------------------------------------------------------------------------
# POST /connect — connect and persist credentials
# ---------------------------------------------------------------------------

@router.post("/connect")
def connect_db(
    request: DBConnectionRequest,
    app_db: Session = Depends(get_app_db),
):
    """
    Connect to the user's database engine (in-memory) and persist the
    credentials to Neon PostgreSQL for future sessions.
    """
    conn_str = build_connection_string(request)

    # 1. Verify the connection is actually reachable
    try:
        test_engine(conn_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {e}")

    # 2. Set the in-memory engine for this session
    set_engine(conn_str)

    # 3. Persist / update credentials in the app database
    clerk_user_id: str = "anonymous"


    password_enc = encrypt_password(request.password or "")

    existing = (
        app_db.query(UserDbCredential)
        .filter(UserDbCredential.clerk_user_id == clerk_user_id)
        .first()
    )

    if existing:
        # Upsert — update all fields
        existing.db_type     = request.db_type
        existing.host        = request.host
        existing.port        = request.port
        existing.db_name     = request.db_name
        existing.username    = request.username
        existing.password_enc = password_enc
        existing.updated_at  = datetime.utcnow()
    else:
        credential = UserDbCredential(
            clerk_user_id = clerk_user_id,
            db_type       = request.db_type,
            host          = request.host,
            port          = request.port,
            db_name       = request.db_name,
            username      = request.username,
            password_enc  = password_enc,
        )
        app_db.add(credential)

    app_db.commit()

    return {
        "status":  "success",
        "message": f"Connected to '{request.db_name}' and credentials saved.",
    }


# ---------------------------------------------------------------------------
# GET /saved — retrieve the user's saved credentials
# ---------------------------------------------------------------------------

@router.get("/saved", response_model=SavedCredentialResponse)
def get_saved_credential(
    app_db: Session = Depends(get_app_db),
):
    """
    Return the current user's saved DB credentials.
    The password field is always masked — it is never returned in plaintext.
    """
    clerk_user_id: str = "anonymous"
    cred = (
        app_db.query(UserDbCredential)
        .filter(UserDbCredential.clerk_user_id == clerk_user_id)
        .first()
    )
    if not cred:
        raise HTTPException(status_code=404, detail="No saved credentials found.")

    return SavedCredentialResponse(
        db_type    = cred.db_type,
        host       = cred.host,
        port       = cred.port,
        db_name    = cred.db_name,
        username   = cred.username,
        password   = "••••••••" if cred.password_enc else "",
        updated_at = cred.updated_at,
    )


# ---------------------------------------------------------------------------
# DELETE /saved — remove the user's saved credentials
# ---------------------------------------------------------------------------

@router.delete("/saved")
def delete_saved_credential(
    app_db: Session = Depends(get_app_db),
):
    """Delete the current user's saved database credentials."""
    clerk_user_id: str = "anonymous"
    cred = (
        app_db.query(UserDbCredential)
        .filter(UserDbCredential.clerk_user_id == clerk_user_id)
        .first()
    )
    if not cred:
        raise HTTPException(status_code=404, detail="No saved credentials found.")

    app_db.delete(cred)
    app_db.commit()
    return {"status": "deleted", "message": "Saved credentials removed."}


# ---------------------------------------------------------------------------
# GET /status
# ---------------------------------------------------------------------------

@router.get("/status")
def get_db_status():
    return {"status": "connected", "url": db_core.DATABASE_URL}


# ---------------------------------------------------------------------------
# GET /schema
# ---------------------------------------------------------------------------

@router.get("/schema")
def get_current_schema():
    try:
        from core.database import get_schema_info
        schema_info = get_schema_info()
        return {"status": "success", "schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schema: {e}")


# ---------------------------------------------------------------------------
# GET /analytics
# ---------------------------------------------------------------------------

@router.get("/analytics")
def get_analytics():
    try:
        session = db_core.SessionLocal()

        try:
            sales = session.execute(
                text("SELECT amount, date, user_id FROM sales")
            ).fetchall()
            users = session.execute(
                text("SELECT id, region, segment, acquisition_cost FROM users")
            ).fetchall()
        except Exception:
            session.close()
            return {"fallback": True}

        session.close()

        total_revenue    = sum(s[0] for s in sales) if sales else 0
        active_customers = len(set(s[2] for s in sales))

        today           = date.today()
        thirty_days_ago = today - timedelta(days=30)
        sixty_days_ago  = today - timedelta(days=60)

        sales_this_month = [s for s in sales if s[1] >= thirty_days_ago]
        sales_last_month = [s for s in sales if sixty_days_ago <= s[1] < thirty_days_ago]
        rev_this_month   = sum(s[0] for s in sales_this_month)
        rev_last_month   = sum(s[0] for s in sales_last_month)

        growth_pct = (
            ((rev_this_month - rev_last_month) / rev_last_month) * 100
            if rev_last_month > 0
            else 0
        )

        monthly_data: dict[str, float] = {}
        for s in sales:
            key = s[1].strftime("%b")
            monthly_data[key] = monthly_data.get(key, 0) + s[0]

        months_order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        growth_data = [
            {"name": m, "current": round(monthly_data[m], 2), "projected": round(monthly_data[m] * 1.1, 2)}
            for m in months_order if m in monthly_data
        ]

        user_regions   = {u[0]: u[1] for u in users}
        region_revenue: dict[str, float] = {}
        for s in sales:
            r = user_regions.get(s[2], "Unknown")
            region_revenue[r] = region_revenue.get(r, 0) + s[0]

        colors = ["#adc6ff", "#df7412", "#00a2e6", "#93000a", "#ffb786"]
        market_share_data, revenue_region_data = [], []
        for idx, (r, rev) in enumerate(region_revenue.items()):
            market_share_data.append({
                "name":  r,
                "value": round((rev / total_revenue * 100) if total_revenue else 0, 1),
                "color": colors[idx % len(colors)],
            })
            revenue_region_data.append({"name": r, "value": round(rev, 2)})

        user_revs: dict = {}
        for s in sales:
            user_revs[s[2]] = user_revs.get(s[2], 0) + s[0]

        customer_segments_data = [
            {
                "x":     round(u[3], 2),
                "y":     round(user_revs[u[0]], 2),
                "z":     random.randint(100, 500),
                "group": u[2] if u[2] else 1,
            }
            for u in users if u[3] and u[0] in user_revs
        ]

        return {
            "fallback": False,
            "kpis": {
                "totalRevenue":    round(total_revenue, 2),
                "growthPct":       round(growth_pct, 1),
                "activeCustomers": active_customers,
                "monthlySales":    len(sales_this_month),
            },
            "growthData":            growth_data,
            "marketShareData":       market_share_data,
            "revenueRegionData":     revenue_region_data,
            "customerSegmentsData":  customer_segments_data,
        }

    except Exception as e:
        return {"fallback": True, "error": str(e)}
