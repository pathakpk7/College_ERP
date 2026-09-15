from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student, NocApplication
from app.schemas.erp_schemas import NocCreateRequest, NocResponse
from app.utils.enums import NocStatus, UserRole

router = APIRouter()


@router.post("", response_model=NocResponse)
def submit_noc_application(
    req: NocCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    # Enforcement: Only students in semester 7 or above can apply
    if student.current_semester < 7:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ineligible for NOC Application. Only 7th Semester or above students are permitted. Your current semester is {student.current_semester}."
        )

    noc = NocApplication(
        student_id=student.id,
        application_type=req.application_type,
        reason=req.reason,
        status=NocStatus.PENDING,
        applied_at=datetime.utcnow()
    )
    db.add(noc)
    db.commit()
    db.refresh(noc)
    return noc


@router.get("", response_model=List[NocResponse])
def get_noc_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.ADMIN or current_user.role == UserRole.FACULTY:
        return db.query(NocApplication).order_by(NocApplication.applied_at.desc()).all()
    
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return []
    return db.query(NocApplication).filter(NocApplication.student_id == student.id).order_by(NocApplication.applied_at.desc()).all()
