from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student, PlacementDrive
from app.schemas.erp_schemas import PlacementDriveResponse, PlacementProfileUpdateRequest, StudentProfileResponse

router = APIRouter()


@router.get("", response_model=List[PlacementDriveResponse])
def get_placement_drives(db: Session = Depends(get_db)):
    return db.query(PlacementDrive).order_by(PlacementDrive.drive_date.asc()).all()


@router.patch("/profile", response_model=StudentProfileResponse)
def update_placement_profile(
    req: PlacementProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    student.skills = req.skills
    if req.resume_link is not None:
        student.resume_link = req.resume_link
    if req.github_link is not None:
        student.github_link = req.github_link
    if req.linkedin_link is not None:
        student.linkedin_link = req.linkedin_link
    if req.preferred_roles is not None:
        student.preferred_roles = req.preferred_roles

    db.commit()
    db.refresh(student)
    return student
