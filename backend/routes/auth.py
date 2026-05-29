from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.security import create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    print(f"Received username: '{request.username}'")
    print(f"Received password: '{request.password}'")
    if request.username == "admin@querytalk.ai" and request.password == "admin1234":
        token = create_access_token({"sub": request.username})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")
