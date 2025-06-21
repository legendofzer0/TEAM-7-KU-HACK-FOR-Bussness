# users/routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import verify_firebase_token
from db import get_db
from models import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Get current user's profile
@router.get("/me")
def get_my_profile(user=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(firebase_uid=user["uid"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Get all users (admin only)
@router.get("/")
def list_users(user=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(firebase_uid=user["uid"]).first()
    if db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return db.query(User).all()

# Delete a user by ID (admin only)
@router.delete("/{user_id}")
def delete_user(user_id: int, user=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(firebase_uid=user["uid"]).first()
    if db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    target_user = db.query(User).filter_by(id=user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(target_user)
    db.commit()
    return {"message": "User deleted"}
