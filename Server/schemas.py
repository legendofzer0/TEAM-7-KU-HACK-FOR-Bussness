from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from pydantic import EmailStr, Field


class ChatRequest(BaseModel):
    message: str
    chat_record_id: Optional[str] = None
    chat_name: Optional[str] = None

class SensorEventCreate(BaseModel):
    sensor_type: str
    value: str

class SensorEventOut(BaseModel):
    id: int
    sensor_type: str
    value: str
    recorded_at: datetime

    class Config:
        orm_mode = True

class ContactUsBase(BaseModel):
    name: str = Field(..., example="Jenish Maharjan")
    email: EmailStr = Field(..., example="jenish@example.com")
    message: str = Field(..., example="Hello, I have a question...")

class ContactUsCreate(ContactUsBase):
    pass

class ContactUsResponse(ContactUsBase):
    id: int

    class Config:
        orm_mode = True