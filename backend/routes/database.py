from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from core.database import set_engine, test_engine
import core.database as db_core
from core.security import verify_token
import random

router = APIRouter()

class DBConnectionRequest(BaseModel):
    db_type: str
    host: Optional[str] = None
    port: Optional[int] = None
    db_name: str
    username: Optional[str] = None
    password: Optional[str] = None

def build_connection_string(req: DBConnectionRequest) -> str:
    if req.db_type.lower() == 'sqlite':
        if not req.db_name:
            return "sqlite:///./demo.db"
        return f"sqlite:///./{req.db_name}"
    
    if not all([req.host, req.db_name, req.username, req.password]):
        raise HTTPException(status_code=400, detail="Missing required connection parameters")
    
    port_str = f":{req.port}" if req.port else ""
    if req.db_type.lower() == 'postgresql':
        return f"postgresql://{req.username}:{req.password}@{req.host}{port_str}/{req.db_name}"
    elif req.db_type.lower() == 'mysql':
        return f"mysql+pymysql://{req.username}:{req.password}@{req.host}{port_str}/{req.db_name}"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported database type: {req.db_type}")

@router.post("/test")
def test_db_connection(request: DBConnectionRequest, current_user: dict = Depends(verify_token)):
    conn_str = build_connection_string(request)
    try:
        schema_info = test_engine(conn_str)
        return {"status": "success", "message": "Connection successful", "schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

@router.post("/connect")
def connect_db(request: DBConnectionRequest, current_user: dict = Depends(verify_token)):
    conn_str = build_connection_string(request)
    try:
        set_engine(conn_str)
        return {"status": "success", "message": f"Successfully connected to {request.db_name}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect and set engine: {str(e)}")

@router.get("/status")
def get_db_status(current_user: dict = Depends(verify_token)):
    return {
        "status": "connected",
        "url": db_core.DATABASE_URL
    }

@router.get("/schema")
def get_current_schema(current_user: dict = Depends(verify_token)):
    try:
        from core.database import get_schema_info
        schema_info = get_schema_info()
        return {"status": "success", "schema": schema_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schema: {str(e)}")


from sqlalchemy import text
from datetime import datetime, date, timedelta

@router.get("/analytics")
def get_analytics(current_user: dict = Depends(verify_token)):
    try:
        from core.database import SessionLocal
        session = SessionLocal()
        
        # Try to fetch sales and users
        try:
            sales = session.execute(text("SELECT amount, date, user_id FROM sales")).fetchall()
            users = session.execute(text("SELECT id, region, segment, acquisition_cost FROM users")).fetchall()
        except Exception:
            session.close()
            # Fallback if standard tables don't exist
            return {"fallback": True}
            
        session.close()
        
        # Aggregate Data in Python to avoid cross-dialect SQL issues
        total_revenue = sum(s[0] for s in sales) if sales else 0
        active_customers = len(set(s[2] for s in sales))
        
        # Dates
        today = date.today()
        thirty_days_ago = today - timedelta(days=30)
        sixty_days_ago = today - timedelta(days=60)
        
        sales_this_month = [s for s in sales if s[1] >= thirty_days_ago]
        sales_last_month = [s for s in sales if sixty_days_ago <= s[1] < thirty_days_ago]
        
        rev_this_month = sum(s[0] for s in sales_this_month)
        rev_last_month = sum(s[0] for s in sales_last_month)
        
        growth_pct = 0
        if rev_last_month > 0:
            growth_pct = ((rev_this_month - rev_last_month) / rev_last_month) * 100
            
        # Monthly Growth Data (last 12 months)
        monthly_data = {}
        for s in sales:
            month_key = s[1].strftime("%b")
            if month_key not in monthly_data:
                monthly_data[month_key] = 0
            monthly_data[month_key] += s[0]
            
        # Ensure ordered months
        months_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        growth_data = []
        for m in months_order:
            if m in monthly_data:
                growth_data.append({
                    "name": m,
                    "current": round(monthly_data[m], 2),
                    "projected": round(monthly_data[m] * 1.1, 2) # Mock projected
                })
        
        # Market Share & Revenue by Region
        user_regions = {u[0]: u[1] for u in users}
        region_revenue = {}
        for s in sales:
            r = user_regions.get(s[2], "Unknown")
            if r not in region_revenue:
                region_revenue[r] = 0
            region_revenue[r] += s[0]
            
        colors = ['#adc6ff', '#df7412', '#00a2e6', '#93000a', '#ffb786']
        market_share_data = []
        revenue_region_data = []
        color_idx = 0
        for r, rev in region_revenue.items():
            market_share_data.append({
                "name": r,
                "value": round((rev / total_revenue) * 100 if total_revenue > 0 else 0, 1),
                "color": colors[color_idx % len(colors)]
            })
            revenue_region_data.append({
                "name": r,
                "value": round(rev, 2)
            })
            color_idx += 1
            
        # Customer Segments (Acquisition Cost vs Total User Revenue)
        user_revs = {}
        for s in sales:
            if s[2] not in user_revs:
                user_revs[s[2]] = 0
            user_revs[s[2]] += s[0]
            
        customer_segments_data = []
        for u in users:
            uid, region, segment, acq_cost = u
            if acq_cost and uid in user_revs:
                customer_segments_data.append({
                    "x": round(acq_cost, 2),
                    "y": round(user_revs[uid], 2),
                    "z": random.randint(100, 500), # random z size for scatter
                    "group": segment if segment else 1
                })
        
        return {
            "fallback": False,
            "kpis": {
                "totalRevenue": round(total_revenue, 2),
                "growthPct": round(growth_pct, 1),
                "activeCustomers": active_customers,
                "monthlySales": len(sales_this_month)
            },
            "growthData": growth_data,
            "marketShareData": market_share_data,
            "revenueRegionData": revenue_region_data,
            "customerSegmentsData": customer_segments_data
        }
    except Exception as e:
        return {"fallback": True, "error": str(e)}
