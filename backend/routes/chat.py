from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import get_db, get_schema_info
from core.security import verify_token, is_safe_query
from services.llm_orchestrator import llm_orchestrator

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db), current_user: dict = Depends(verify_token)):
    user_query = request.message
    
    schema_info = get_schema_info()
    
    try:
        sql_query = llm_orchestrator.generate_sql(user_query, schema_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Generation Error: {str(e)}")

    if not is_safe_query(sql_query):
        return {
            "reply": "I'm sorry, but I cannot execute that query due to security restrictions.",
            "sql": sql_query,
            "data": None
        }

    try:
        result = db.execute(text(sql_query))
        rows = result.fetchall()
        columns = result.keys()
        data = [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return {
            "reply": f"Error executing query: {str(e)}",
            "sql": sql_query,
            "data": None
        }

    try:
        summary = llm_orchestrator.summarize_results(user_query, sql_query, data[:10])
    except Exception as e:
        summary = "Could not generate summary due to LLM error."

    return {
        "reply": summary,
        "sql": sql_query,
        "data": data
    }
