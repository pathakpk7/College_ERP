from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student
from app.schemas.erp_schemas import StudentProfileResponse

router = APIRouter()


@router.get("/me", response_model=StudentProfileResponse)
def get_my_student_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found for current user.")
    return student
