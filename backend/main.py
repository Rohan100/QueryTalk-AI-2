from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, chat
from core.database import init_db

app = FastAPI(title="QueryTalk AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to QueryTalk AI API"}
