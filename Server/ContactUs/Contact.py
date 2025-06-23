# contact_us/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from auth import verify_firebase_token
from db import get_db
from models import ContactUs, User
from schemas import ContactUsCreate, ContactUsResponse

router = APIRouter(
    prefix="/contact",
    tags=["Contact Us"]
)

# Create a new contact message (no auth needed)
@router.post("/", response_model=ContactUsResponse, status_code=status.HTTP_201_CREATED)
def create_contact_us(contact: ContactUsCreate, db: Session = Depends(get_db)):
    contact_entry = ContactUs(**contact.dict())
    db.add(contact_entry)
    db.commit()
    db.refresh(contact_entry)
    return contact_entry

# Get all contact messages (admin only)
@router.get("/")
def list_contacts(user=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(firebase_uid=user["uid"]).first()
    if not db_user or db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return db.query(ContactUs).all()

# Delete a contact message by ID (admin only)
@router.delete("/{contact_id}")
def delete_contact(contact_id: int, user=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(firebase_uid=user["uid"]).first()
    if not db_user or db_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    contact_entry = db.query(ContactUs).filter_by(id=contact_id).first()
    if not contact_entry:
        raise HTTPException(status_code=404, detail="Contact message not found")

    db.delete(contact_entry)
    db.commit()
    return {"message": "Contact message deleted"}
