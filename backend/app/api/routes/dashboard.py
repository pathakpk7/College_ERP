from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import (
    User, Student, Attendance, Fee, PlacementDrive, Message, AcademicMaterial, Notice
)
from app.schemas.erp_schemas import DashboardSummaryResponse, StudentProfileResponse, NoticeResponse
from app.utils.enums import AttendanceStatus, MaterialType, UserRole

router = APIRouter()


@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    # If no student profile exists for this user (e.g. newly registered or admin), create or fallback
    if not student:
        if current_user.role == UserRole.STUDENT:
            student = Student(
                user_id=current_user.id,
                enrollment_number=current_user.username,
                full_name=current_user.username.title(),
                email=current_user.email,
                branch="Computer Science & Engineering",
                current_semester=7,
                admission_year=2022,
                section="A",
                cgpa=8.5,
                backlogs=0
            )
            db.add(student)
            db.commit()
            db.refresh(student)
        else:
            student = db.query(Student).first()

    if not student:
        raise HTTPException(status_code=404, detail="No student record found.")

    # Calculate overall attendance dynamically from DB
    attendances = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    total_classes = len(attendances)
    present_classes = sum(1 for a in attendances if a.status == AttendanceStatus.PRESENT)
    overall_perc = round((present_classes / total_classes * 100), 1) if total_classes > 0 else 82.5

    # Dynamic Fee Status
    fees = db.query(Fee).filter(Fee.student_id == student.id).all()
    total_fee_due = sum(f.total_fee - f.amount_paid for f in fees) if fees else 0.0
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
        "student": StudentProfileResponse(
            id=student.id,
            user_id=student.user_id,
            enrollment_number=student.enrollment_number,
            full_name=student.full_name,
            email=student.email,
            phone=student.phone,
            branch=student.branch,
            current_semester=student.current_semester,
            admission_year=student.admission_year,
            section=student.section,
            date_of_birth=student.date_of_birth,
            cgpa=student.cgpa,
            backlogs=student.backlogs,
            skills=student.skills,
            resume_link=student.resume_link,
            github_link=student.github_link,
            linkedin_link=student.linkedin_link,
            preferred_roles=student.preferred_roles
        ),
        "overall_attendance_percentage": overall_perc,
        "total_classes": total_classes,
        "present_classes": present_classes,
        "fee_status": fee_stat,
        "fee_due_amount": total_fee_due,
        "recent_notices": [
            NoticeResponse(
                id=n.id,
                title=n.title,
                content=n.content,
                category=n.category or "ACADEMIC",
                posted_by=n.posted_by,
                posted_date=n.posted_date
            ) for n in notices
        ],
        "upcoming_placements_count": placements_count,
        "unread_messages_count": messages_count,
        "pending_assignments_count": assignments_count,
    }

