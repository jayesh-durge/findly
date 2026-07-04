from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import datetime

router = APIRouter(tags=["messages"])

class MessageCreate(BaseModel):
    item_id: str
    sender_id: Optional[str] = None
    sender_name: str
    sender_email: Optional[str] = None
    message_text: str
    receiver_id: str

class MessageResponse(BaseModel):
    id: int
    item_id: str
    sender_name: str
    sender_email: Optional[str]
    message_text: str
    receiver_id: str
    created_at: str

@router.post("/messages/send", response_model=dict)
async def send_message(msg: MessageCreate):
    from main import supabase
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    data = {
        "item_id": msg.item_id,
        "sender_id": msg.sender_id,
        "sender_name": msg.sender_name,
        "sender_email": msg.sender_email,
        "message_text": msg.message_text,
        "receiver_id": msg.receiver_id
    }
    
    try:
        print(f"Attempting to send message for item {msg.item_id} to receiver {msg.receiver_id}")
        response = supabase.table("messages").insert(data).execute()
        return {"status": "success", "message": "Message sent to owner"}
    except Exception as e:
        print(f"Error sending message for item {msg.item_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/messages/user/{user_id}", response_model=List[dict])
async def get_user_messages(user_id: str):
    from main import supabase
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    try:
        response = supabase.table("messages") \
            .select("*") \
            .eq("receiver_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        messages = response.data or []
        item_ids = sorted({msg.get("item_id") for msg in messages if msg.get("item_id")})
        items_by_qr_id = {}

        if item_ids:
            items_response = supabase.table("items") \
                .select("qr_id,item_name,is_lost") \
                .in_("qr_id", item_ids) \
                .execute()

            items_by_qr_id = {
                item["qr_id"]: {"item_name": item["item_name"], "is_lost": item.get("is_lost", False)}
                for item in (items_response.data or [])
            }

        enriched_messages = []
        for msg in messages:
            enriched_msg = dict(msg)
            enriched_msg["items"] = items_by_qr_id.get(msg.get("item_id"))
            enriched_messages.append(enriched_msg)

        return enriched_messages
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/messages/thread/{user1}/{user2}/{item_id}", response_model=List[dict])
async def get_message_thread(user1: str, user2: str, item_id: str):
    from main import supabase
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    try:
        # Get messages between two users regarding a specific item
        # Participants are either sender or receiver
        response = supabase.table("messages") \
            .select("*") \
            .eq("item_id", item_id) \
            .or_(f"and(sender_id.eq.{user1},receiver_id.eq.{user2}),and(sender_id.eq.{user2},receiver_id.eq.{user1})") \
            .order("created_at", desc=False) \
            .execute()
        return response.data
    except Exception as e:
        print(f"Error fetching thread: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/messages/thread/{user1}/{user2}/{item_id}")
async def delete_message_thread(user1: str, user2: str, item_id: str):
    from main import supabase
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    try:
        print(f"Deleting thread: {user1} <-> {user2} for item {item_id}")
        # Delete messages between two users regarding a specific item
        # Participants are either sender or receiver
        response = supabase.table("messages") \
            .delete() \
            .eq("item_id", item_id) \
            .or_(f"and(sender_id.eq.{user1},receiver_id.eq.{user2}),and(sender_id.eq.{user2},receiver_id.eq.{user1})") \
            .execute()
        print(f"Delete result: {response.data}")
        return {"status": "success", "message": "Chat deleted"}
    except Exception as e:
        print(f"Error deleting thread: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/messages/guest/{item_id}/{sender_name}")
async def delete_guest_chat(item_id: str, sender_name: str):
    from main import supabase
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    try:
        print(f"Deleting guest chat: {sender_name} for item {item_id}")
        # Delete guest messages (no sender_id)
        response = supabase.table("messages") \
            .delete() \
            .eq("item_id", item_id) \
            .eq("sender_name", sender_name) \
            .is_("sender_id", "null") \
            .execute()
        print(f"Delete result: {response.data}")
        return {"status": "success", "message": "Guest chat deleted"}
    except Exception as e:
        print(f"Error deleting guest chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/messages/read/{user1}/{user2}/{item_id}")
async def mark_messages_read(user1: str, user2: str, item_id: str):
    from main import supabase
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    try:
        # Mark messages incoming to user1 from user2 as read
        response = supabase.table("messages") \
            .update({"is_read": True}) \
            .eq("item_id", item_id) \
            .eq("receiver_id", user1) \
            .eq("sender_id", user2) \
            .execute()
        return {"status": "success", "message": "Messages marked as read"}
    except Exception as e:
        print(f"Error marking as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
