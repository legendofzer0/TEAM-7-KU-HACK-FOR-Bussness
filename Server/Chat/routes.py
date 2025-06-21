from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from auth import verify_firebase_token
from db import get_db
from models import User, ChatMessage
from schemas import ChatRequest

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.post("/")
def chat(
    payload: ChatRequest,
    user=Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    uid = user["uid"]
    email = user["email"]

    # Step 1: Ensure user exists (create if missing)
    db_user = db.query(User).filter_by(firebase_uid=uid).first()
    if not db_user:
        db_user = User(firebase_uid=uid, email=email)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # Step 2: Save user message
    user_msg = ChatMessage(
        sender_uid=uid,
        message=payload.message,
        response=None
    )
    db.add(user_msg)

    # Step 3: Generate bot response
    bot_reply = f"This is a bot response to: {payload.message}"

    # Step 4: Save bot response
    bot_msg = ChatMessage(
        sender_uid=uid,
        message=payload.message,
        response=bot_reply
    )
    db.add(bot_msg)

    # Commit both messages together
    db.commit()

    return {"response": bot_reply}
