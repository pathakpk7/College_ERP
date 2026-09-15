from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.db.database import get_db
from app.core.dependencies import require_role, get_current_user
from app.models.all_models import User, Student, Faculty, NocApplication, Notice, PlacementDrive, Fee, AttendanceResetEvent
from app.utils.enums import UserRole, NocStatus
from pydantic import BaseModel

router = APIRouter()


class ReviewNocRequest(BaseModel):
    status: NocStatus
    remarks: str


class CreateNoticeRequest(BaseModel):
    title: str
    content: str
    category: str = "ACADEMIC"


class CreatePlacementDriveRequest(BaseModel):
    company_name: str
    job_role: str
    eligibility_criteria: str
    drive_date: date
    application_deadline: date
    salary_package: str
    preparation_resources: str = None


class ResetAttendanceRequest(BaseModel):
    reset_type: str  # e.g., 'SESSIONAL_1', 'SESSIONAL_2', 'SEMESTER'
    effective_date: date
    remarks: str = "Official administrative attendance reset following exams."
    preparation_resources: str = None


@router.get("/dashboard")
def get_admin_dashboard(current_user: User = Depends(require_role([UserRole.ADMIN])), db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    total_faculty = db.query(Faculty).count()
    pending_nocs = db.query(NocApplication).filter(NocApplication.status == NocStatus.PENDING).count()
    
    fees = db.query(Fee).all()
    total_revenue = sum(f.amount_paid for f in fees)
    total_pending_fee = sum(f.total_fee - f.amount_paid for f in fees)

    return {
        "admin_username": current_user.username,
        "total_students": total_students,
        "total_faculty": total_faculty,
        "pending_noc_applications": pending_nocs,
        "total_fee_collected": total_revenue,
        "total_fee_due": total_pending_fee,
    }


@router.get("/noc-applications")
def get_detailed_noc_applications(current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.FACULTY])), db: Session = Depends(get_db)):
    apps = db.query(NocApplication).order_by(NocApplication.applied_at.desc()).all()
    results = []
    for a in apps:
        student = db.query(Student).filter(Student.id == a.student_id).first()
        results.append({
            "id": a.id,
            "student_id": a.student_id,
            "student_name": student.full_name if student else "Unknown Student",
            "enrollment_number": student.enrollment_number if student else "N/A",
            "branch": student.branch if student else "N/A",
            "current_semester": student.current_semester if student else 1,
            "cgpa": student.cgpa if student else 0.0,
            "backlogs": student.backlogs if student else 0,
            "application_type": a.application_type,
            "reason": a.reason,
            "status": a.status,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "reviewed_at": a.reviewed_at.isoformat() if a.reviewed_at else None,
            "remarks": a.remarks
        })
    return results


@router.patch("/noc/{noc_id}")
def review_noc_application(noc_id: int, req: ReviewNocRequest, current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.FACULTY])), db: Session = Depends(get_db)):
    noc = db.query(NocApplication).filter(NocApplication.id == noc_id).first()
    if not noc:
        raise HTTPException(status_code=404, detail="NOC application not found.")

    noc.status = req.status
    noc.remarks = req.remarks
    noc.reviewed_at = datetime.utcnow()
    noc.reviewer_id = current_user.id

    db.commit()
    db.refresh(noc)
    return {"message": f"NOC application status updated to {req.status.value}."}


@router.get("/notices")
def get_all_notices(db: Session = Depends(get_db)):
    notices = db.query(Notice).order_by(Notice.posted_date.desc()).all()
    return [{"id": n.id, "title": n.title, "content": n.content, "category": n.category, "posted_by": n.posted_by, "posted_date": n.posted_date.isoformat()} for n in notices]


@router.post("/notices")
def post_notice(req: CreateNoticeRequest, current_user: User = Depends(require_role([UserRole.ADMIN])), db: Session = Depends(get_db)):
    notice = Notice(
        title=req.title,
        content=req.content,
        category=req.category,
        posted_by="Office of Administration",
        posted_date=date.today()
    )
    db.add(notice)
    db.commit()
    return {"message": "Notice published successfully."}


@router.delete("/notices/{notice_id}")
def delete_notice(notice_id: int, current_user: User = Depends(require_role([UserRole.ADMIN])), db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found.")
    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully."}


@router.get("/placements/all")
def get_all_placement_drives(db: Session = Depends(get_db)):
    drives = db.query(PlacementDrive).order_by(PlacementDrive.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "company_name": d.company_name,
            "job_role": d.job_role,
            "eligibility_criteria": d.eligibility_criteria,
            "drive_date": d.drive_date.isoformat() if d.drive_date else "",
            "application_deadline": d.application_deadline.isoformat() if d.application_deadline else "",
            "salary_package": d.salary_package,
            "preparation_resources": d.preparation_resources
        }
        for d in drives
    ]


@router.post("/placements")
def publish_placement_drive(req: CreatePlacementDriveRequest, current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.FACULTY])), db: Session = Depends(get_db)):
    drive = PlacementDrive(
        company_name=req.company_name,
        job_role=req.job_role,
        eligibility_criteria=req.eligibility_criteria,
        drive_date=req.drive_date,
        application_deadline=req.application_deadline,
        salary_package=req.salary_package,
        preparation_resources=req.preparation_resources
    )
    db.add(drive)
    db.commit()
    return {"message": "Placement drive published successfully."}


@router.delete("/placements/{drive_id}")
def delete_placement_drive(drive_id: int, current_user: User = Depends(require_role([UserRole.ADMIN])), db: Session = Depends(get_db)):
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found.")
    db.delete(drive)
    db.commit()
    return {"message": "Placement drive deleted successfully."}


@router.post("/attendance/reset")
def reset_attendance_cycle(req: ResetAttendanceRequest, current_user: User = Depends(require_role([UserRole.ADMIN])), db: Session = Depends(get_db)):
    event = AttendanceResetEvent(
        reset_type=req.reset_type,
        effective_date=req.effective_date,
        remarks=req.remarks,
        created_at=datetime.utcnow()
    )
    db.add(event)
    db.commit()
    return {"message": f"Official attendance reset recorded for {req.reset_type} effective {req.effective_date.isoformat()}."}
