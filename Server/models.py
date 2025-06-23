from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="user")

    chat_records = relationship("ChatRecord", back_populates="user")


class ChatRecord(Base):
    __tablename__ = "chat_records"

    id = Column(String, primary_key=True, index=True)  # UUID or session ID
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    user = relationship("User", back_populates="chat_records")
    messages = relationship("ChatMessage", back_populates="chat_record", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_record_id = Column(String, ForeignKey("chat_records.id"), nullable=False)
    sender_uid = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    chat_record = relationship("ChatRecord", back_populates="messages")

class SensorEvent(Base):
    __tablename__ = "sensor_events"

    id = Column(Integer, primary_key=True, index=True)
    sensor_type = Column(String, nullable=False)
    value = Column(String, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

class ContactUs(Base):
    __tablename__ = "contact_us"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=False, index=True, nullable=False)
    message = Column(Text, nullable=False)
    