from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import (
    User, Student, Attendance, Fee, PlacementDrive, Message, AcademicMaterial, Notice
)
from app.schemas.erp_schemas import DashboardSummaryResponse, StudentProfileResponse, NoticeResponse
from app.utils.enums import AttendanceStatus, MaterialType

router = APIRouter()


@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()
        if not student:
            raise HTTPException(status_code=404, detail="No student data available.")

    # Calculate overall attendance dynamically
    attendances = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    total_classes = len(attendances)
    present_classes = sum(1 for a in attendances if a.status == AttendanceStatus.PRESENT)
    overall_perc = round((present_classes / total_classes * 100), 1) if total_classes > 0 else 0.0

    # Dynamic Fee Status
    fees = db.query(Fee).filter(Fee.student_id == student.id).all()
    total_fee_due = sum(f.total_fee - f.amount_paid for f in fees)
    fee_stat = "PAID" if total_fee_due <= 0 else "PENDING"

    # Dynamic Notices from DB
    notices = db.query(Notice).order_by(Notice.posted_date.desc()).limit(5).all()

    # Dynamic Placements count
    placements_count = db.query(PlacementDrive).count()

    # Dynamic Unread messages count
    messages_count = db.query(Message).filter(Message.receiver_id == current_user.id, Message.is_read == False).count()

    # Dynamic Pending assignments count
    assignments_count = db.query(AcademicMaterial).filter(AcademicMaterial.material_type == MaterialType.ASSIGNMENT).count()

    return {
        "student": StudentProfileResponse.from_orm(student),
        "overall_attendance_percentage": overall_perc,
        "total_classes": total_classes,
        "present_classes": present_classes,
        "fee_status": fee_stat,
        "fee_due_amount": total_fee_due,
        "recent_notices": [NoticeResponse.from_orm(n) for n in notices],
        "upcoming_placements_count": placements_count,
        "unread_messages_count": messages_count,
        "pending_assignments_count": assignments_count,
    }
