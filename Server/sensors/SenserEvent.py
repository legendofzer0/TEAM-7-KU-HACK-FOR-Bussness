from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import SensorEvent
from schemas import SensorEventCreate, SensorEventOut
from db import get_db

router = APIRouter(
    prefix="/sensor-event",
    tags=["SensorEvent"]
)

@router.post("/", response_model=SensorEventOut)
def create_sensor_event(payload: SensorEventCreate, db: Session = Depends(get_db)):
    event = SensorEvent(sensor_type=payload.sensor_type, value=payload.value)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/", response_model=list[SensorEventOut])
def get_all_events(db: Session = Depends(get_db)):
    return db.query(SensorEvent).order_by(SensorEvent.recorded_at.desc()).all()
