from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["rewards"])


class SendCoinsRequest(BaseModel):
    sender_id: str
    receiver_id: str
    amount: int
    message: Optional[str] = "Thanks for returning my item! ☕"


@router.post("/rewards/send")
async def send_coins(req: SendCoinsRequest):
    from main import supabase

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not initialized")

    if req.amount <= 0 or req.amount > 100:
        raise HTTPException(status_code=400, detail="Amount must be between 1 and 100")

    if req.sender_id == req.receiver_id:
        raise HTTPException(status_code=400, detail="Cannot send coins to yourself")

    try:
        # Get sender balance without using unsafe .single()
        sender_res = supabase.table("users").select("coins").eq("id", req.sender_id).execute()
        if not sender_res.data or len(sender_res.data) == 0:
            raise HTTPException(status_code=404, detail="Sender not found")

        sender_coins = sender_res.data[0].get("coins", 0) or 0
        if sender_coins < req.amount:
            raise HTTPException(status_code=400, detail=f"Not enough coins. You have {sender_coins} coins.")

        # Deduct from sender
        supabase.table("users").update({"coins": sender_coins - req.amount}).eq("id", req.sender_id).execute()

        # Add to receiver
        recv_res = supabase.table("users").select("coins").eq("id", req.receiver_id).execute()
        if not recv_res.data or len(recv_res.data) == 0:
            # Rollback coins to sender if receiver doesn't exist
            supabase.table("users").update({"coins": sender_coins}).eq("id", req.sender_id).execute()
            raise HTTPException(status_code=404, detail="Receiver not found")

        receiver_coins = recv_res.data[0].get("coins", 0) or 0
        supabase.table("users").update({"coins": receiver_coins + req.amount}).eq("id", req.receiver_id).execute()

        # Log transaction
        supabase.table("coin_transactions").insert({
            "sender_id": req.sender_id,
            "receiver_id": req.receiver_id,
            "amount": req.amount,
            "message": req.message,
        }).execute()

        return {"success": True, "new_balance": sender_coins - req.amount}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in send_coins transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database transaction error: {str(e)}")


@router.get("/rewards/balance/{user_id}")
async def get_balance(user_id: str):
    from main import supabase

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not initialized")

    try:
        res = supabase.table("users").select("coins, full_name, email").eq("id", user_id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"coins": res.data[0].get("coins", 0) or 0, "user": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching balance for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/rewards/transactions/{user_id}")
async def get_transactions(user_id: str):
    from main import supabase

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not initialized")

    try:
        res = supabase.table("coin_transactions") \
            .select("*, sender:sender_id(full_name, email), receiver:receiver_id(full_name, email)") \
            .or_(f"sender_id.eq.{user_id},receiver_id.eq.{user_id}") \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()

        return res.data or []
    except Exception as e:
        print(f"Error fetching transactions for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

