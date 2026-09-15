from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.all_models import TimetableSlot
from app.schemas.erp_schemas import TimetableSlotResponse

router = APIRouter()


@router.get("", response_model=List[TimetableSlotResponse])
def get_timetable(db: Session = Depends(get_db)):
    return db.query(TimetableSlot).all()
