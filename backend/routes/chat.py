from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import get_db, get_schema_info, get_dialect_name
from core.security import is_safe_query
from services.llm_orchestrator import llm_orchestrator

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
def chat_endpoint(request: Request, chat_req: ChatRequest, db: Session = Depends(get_db)):
    user_query = chat_req.message
    
    schema_info = get_schema_info()
    dialect = get_dialect_name()
    
    try:
        api_key = request.headers.get("X-API-Key")
        sql_query = llm_orchestrator.generate_sql(user_query, schema_info, dialect, api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Generation Error: {str(e)}")

    max_retries = 2
    attempt = 0
    success = False
    data = None
    last_error = None

    while attempt <= max_retries:
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
            success = True
            break
        except Exception as e:
            last_error = str(e)
            attempt += 1
            if attempt <= max_retries:
                try:
                    api_key = request.headers.get("X-API-Key")
                    sql_query = llm_orchestrator.correct_sql(
                        user_query=user_query,
                        schema_info=schema_info,
                        failed_sql=sql_query,
                        error_message=last_error,
                        dialect=dialect,
                        api_key=api_key
                    )
                except Exception as llm_err:
                    last_error = f"{last_error} (Self-correction failed: {str(llm_err)})"
                    break
            else:
                break

    if not success:
        try:
            api_key = request.headers.get("X-API-Key")
            error_explanation = llm_orchestrator.explain_error(user_query, sql_query, last_error, api_key)
        except Exception as explain_err:
            error_explanation = f"Error executing query: {last_error}"

        return {
            "reply": error_explanation,
            "sql": sql_query,
            "data": None
        }

    try:
        api_key = request.headers.get("X-API-Key")
        summary = llm_orchestrator.summarize_results(user_query, sql_query, data[:10], api_key)
    except Exception as e:
        summary = "Could not generate summary due to LLM error."

    return {
        "reply": summary,
        "sql": sql_query,
        "data": data
    }
