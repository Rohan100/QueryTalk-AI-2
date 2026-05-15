import warnings
warnings.filterwarnings("ignore", message=".*Core Pydantic V1 functionality isn't compatible with Python 3.14 or greater.*")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, chat, database, webhooks


app = FastAPI(title="QueryTalk AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(database.router, prefix="/api/db", tags=["Database"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])

@app.get("/")
def read_root():
    return {"message": "Welcome to QueryTalk AI API"}
