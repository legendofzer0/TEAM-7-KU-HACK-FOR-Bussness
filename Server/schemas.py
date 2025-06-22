from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    chat_record_id: Optional[str] = None
    chat_name: Optional[str] = None
