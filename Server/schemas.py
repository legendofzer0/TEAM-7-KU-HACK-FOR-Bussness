from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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