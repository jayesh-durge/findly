import sys
import os

# Add current directory to python path for robust importing when run from different directories
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
import uvicorn


load_dotenv()

app = FastAPI(title="Findly - Smart QR Lost & Found")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(url, key) if url and key else None

@app.get("/")
def read_root():
    return {"message": "Welcome to Findly API"}

from routes import items, qr, messages, rewards
app.include_router(items.router)
app.include_router(qr.router)
app.include_router(messages.router)
app.include_router(rewards.router)


if __name__ == "__main__":
    # Disable reload in production to avoid process management and port binding issues
    dev_mode = os.getenv("ENVIRONMENT", "production").lower() == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=dev_mode)

