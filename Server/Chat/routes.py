from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import uuid

from sensors.Chatbot import ChatBot

from auth import verify_firebase_token
from db import get_db
from models import User, ChatMessage, ChatRecord

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

# ──────────────────────
# 📦 Schemas
# ──────────────────────

class ChatRequest(BaseModel):
    message: str
    chat_record_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    sender_uid: str
    message: str
    response: Optional[str]
    timestamp: datetime

    class Config:
        orm_mode = True

class ChatRecordResponse(BaseModel):
    id: str
    name: str
    messages: List[ChatMessageResponse]

    class Config:
        orm_mode = True

# ──────────────────────
# 🧠 Utilities
# ──────────────────────

def truncate_to_100_words(text: str) -> str:
    words = text.strip().split()
    return " ".join(words[:100])

# ──────────────────────
# 📨 POST /chat/
# ──────────────────────

@router.post("/")
def chat(
    payload: ChatRequest,
    user=Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    uid = user["uid"]
    email = user.get("email", "")

    # Ensure user exists
    db_user = db.query(User).filter_by(firebase_uid=uid).first()
    if not db_user:
        db_user = User(firebase_uid=uid, email=email)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # Get or create ChatRecord
    if payload.chat_record_id:
        chat_record = db.query(ChatRecord).filter_by(id=payload.chat_record_id, user_id=db_user.id).first()
        if not chat_record:
            raise HTTPException(status_code=404, detail="Chat record not found.")
    else:
        record_id = str(uuid.uuid4())
        chat_record = ChatRecord(
            id=record_id,
            user_id=db_user.id,
            name=truncate_to_100_words(payload.message)
        )
        db.add(chat_record)
        db.commit()
        db.refresh(chat_record)

    # Call chatbot
    bot_reply = ChatBot(payload.message)

    # Save chat message
    chat_msg = ChatMessage(
        chat_record_id=chat_record.id,
        sender_uid=uid,
        message=payload.message,
        response=bot_reply
    )
    db.add(chat_msg)
    db.commit()
    db.refresh(chat_msg)

    return {
        "response": bot_reply,
        "chat_record_id": chat_record.id
    }

# ──────────────────────
# 📥 GET /chat/{chat_record_id}
# ──────────────────────

@router.get("/{chat_record_id}", response_model=ChatRecordResponse)
def get_chat_record(
    chat_record_id: str,
    user=Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    uid = user["uid"]

    db_user = db.query(User).filter_by(firebase_uid=uid).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")

    chat_record = db.query(ChatRecord).filter_by(id=chat_record_id, user_id=db_user.id).first()
    if not chat_record:
        raise HTTPException(status_code=404, detail="Chat record not found.")

    return chat_record
