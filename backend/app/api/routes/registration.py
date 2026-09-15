from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student, Registration, Semester
from app.schemas.erp_schemas import RegistrationRecordResponse

router = APIRouter()


@router.get("", response_model=List[RegistrationRecordResponse])
def get_registration_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    regs = db.query(Registration).filter(Registration.student_id == student.id).all()
    result = []
    for r in regs:
        sem = db.query(Semester).filter(Semester.id == r.semester_id).first()
        result.append(RegistrationRecordResponse(
            id=r.id,
            semester_number=sem.semester_number if sem else 0,
            academic_year=r.academic_year,
            registration_date=r.registration_date,
            status=r.status,
            registration_number=r.registration_number,
            remarks=r.remarks
        ))
    return result
