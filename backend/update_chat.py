import re

with open('routes/chat.py', 'r') as f:
    content = f.read()

# Add Request import
content = content.replace('from fastapi import APIRouter, Depends, HTTPException', 'from fastapi import APIRouter, Depends, HTTPException, Request')

# Update endpoint signature to accept Request
content = content.replace(
    'def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db), current_user: dict = Depends(verify_token)):',
    'def chat_endpoint(request: Request, chat_req: ChatRequest, db: Session = Depends(get_db), current_user: dict = Depends(verify_token)):'
)

# Update user_query usage
content = content.replace('user_query = request.message', 'user_query = chat_req.message')

# Add API Key extraction and passing
content = content.replace(
    'sql_query = llm_orchestrator.generate_sql(user_query, schema_info)',
    'api_key = request.headers.get("X-API-Key")\n        sql_query = llm_orchestrator.generate_sql(user_query, schema_info, api_key)'
)

content = content.replace(
    'summary = llm_orchestrator.summarize_results(user_query, sql_query, data[:10])',
    'api_key = request.headers.get("X-API-Key")\n        summary = llm_orchestrator.summarize_results(user_query, sql_query, data[:10], api_key)'
)

with open('routes/chat.py', 'w') as f:
    f.write(content)
print("Updated chat.py")
