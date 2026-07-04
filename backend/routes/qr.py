from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from qr.generator import generate_qr_code_base64
import os

router = APIRouter(tags=["qr"])

class QRGenerateRequest(BaseModel):
    item_id: str
    qr_id: str

class QRGenerateResponse(BaseModel):
    item_id: str
    qr_image: str

@router.post("/qr/generate", response_model=QRGenerateResponse)
async def generate_qr(request: QRGenerateRequest):
    # In a real app, you might want FRONTEND_URL from env, 
    # but for scanning we can construct the url the finder will open:
    base_url = os.environ.get("VITE_FRONTEND_URL", "http://localhost:5173")
    scan_url = f"{base_url}/scan/{request.qr_id}"
    
    # Generate the base64 image
    qr_base64 = generate_qr_code_base64(scan_url)
    
    return {
        "item_id": request.item_id,
        "qr_image": qr_base64
    }
