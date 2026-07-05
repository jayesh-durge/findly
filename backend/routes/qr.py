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
    # Read frontend URL from environment — must be set to the deployed frontend URL in production
    base_url = (
        os.environ.get("FRONTEND_URL")
        or os.environ.get("VITE_FRONTEND_URL")
    )

    if not base_url:
        raise HTTPException(
            status_code=500,
            detail="FRONTEND_URL environment variable is not set on the server. Set it to your deployed frontend URL (e.g. https://findly.vercel.app)."
        )

    # Strip any trailing slash to avoid double-slash in URLs
    base_url = base_url.rstrip("/")
    scan_url = f"{base_url}/scan/{request.qr_id}"

    # Generate the base64 image
    qr_base64 = generate_qr_code_base64(scan_url)

    return {
        "item_id": request.item_id,
        "qr_image": qr_base64
    }
