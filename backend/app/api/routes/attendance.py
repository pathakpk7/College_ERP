import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student, Attendance, Subject, Semester, AttendanceResetEvent
from app.schemas.erp_schemas import (
    AttendanceSummaryResponse, SubjectAttendanceSummary,
    DayWiseAttendanceRecord, AttendanceCalculatorRequest, AttendanceCalculatorResponse
)
from app.utils.enums import AttendanceStatus

router = APIRouter()


@router.get("/semesters")
def get_student_semesters(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    semesters = db.query(Semester).order_by(Semester.semester_number.asc()).all()
    results = []

    for sem in semesters:
        subs = db.query(Subject).filter(
            Subject.semester_id == sem.id,
            Subject.branch == student.branch
        ).all()
        if not subs:
            subs = db.query(Subject).filter(Subject.semester_id == sem.id).all()
            
        sub_ids = [s.id for s in subs]

        atts = db.query(Attendance).filter(
            Attendance.student_id == student.id,
            Attendance.subject_id.in_(sub_ids)
        ).all() if sub_ids else []

        t = len(atts)
        p = sum(1 for a in atts if a.status == AttendanceStatus.PRESENT)
        ab = sum(1 for a in atts if a.status == AttendanceStatus.ABSENT)
        perc = round((p / t * 100), 1) if t > 0 else 0.0

        results.append({
            "semester_number": sem.semester_number,
            "academic_year": sem.academic_year,
            "is_current": (sem.semester_number == student.current_semester),
            "overall_percentage": perc,
            "total_classes": t,
            "present_classes": p,
            "absent_classes": ab
        })

    return results


@router.get("/summary", response_model=AttendanceSummaryResponse)
def get_attendance_summary(semester: int = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    # Determine targeted semester
    target_sem_num = semester if semester else student.current_semester
    target_sem = db.query(Semester).filter(Semester.semester_number == target_sem_num).first()

    # Query branch-specific subjects for the targeted semester
    if target_sem:
        subjects = db.query(Subject).filter(
            Subject.semester_id == target_sem.id,
            Subject.branch == student.branch
        ).all()
        if not subjects:
            subjects = db.query(Subject).filter(Subject.semester_id == target_sem.id).all()
    else:
        subjects = db.query(Subject).filter(Subject.branch == student.branch).all()

    sub_ids = [s.id for s in subjects]

    # Query latest reset event (only applicable for current semester)
    latest_reset = None
    if semester is None or semester == student.current_semester:
        latest_reset = db.query(AttendanceResetEvent).order_by(AttendanceResetEvent.created_at.desc()).first()

    query = db.query(Attendance).filter(Attendance.student_id == student.id, Attendance.subject_id.in_(sub_ids)) if sub_ids else db.query(Attendance).filter(Attendance.id == -1)
    if latest_reset:
        query = query.filter(Attendance.date >= latest_reset.effective_date)

    attendances = query.all()
    total_classes = len(attendances)
    present_classes = sum(1 for a in attendances if a.status == AttendanceStatus.PRESENT)
    absent_classes = sum(1 for a in attendances if a.status == AttendanceStatus.ABSENT)
    overall_perc = round((present_classes / total_classes * 100), 1) if total_classes > 0 else 0.0

    # Group by subject
    subject_summaries = []
    for sub in subjects:
        sub_att = [a for a in attendances if a.subject_id == sub.id]
        s_total = len(sub_att)
        s_present = sum(1 for a in sub_att if a.status == AttendanceStatus.PRESENT)
        s_absent = sum(1 for a in sub_att if a.status == AttendanceStatus.ABSENT)
        s_perc = round((s_present / s_total * 100), 1) if s_total > 0 else 0.0

        dates = [a.date for a in sub_att]
        l_start = min(dates) if dates else None
        l_updated = max(dates) if dates else None

        subject_summaries.append(SubjectAttendanceSummary(
            subject_id=sub.id,
            subject_code=sub.subject_code,
            subject_name=sub.subject_name,
            credits=sub.credits,
            total_classes=s_total,
            present_classes=s_present,
            absent_classes=s_absent,
            percentage=s_perc,
            lecture_start=l_start,
            lecture_updated=l_updated
        ))

    reset_info = f"{latest_reset.reset_type} (Effective {latest_reset.effective_date})" if latest_reset else None

    return {
        "overall_percentage": overall_perc,
        "total_classes": total_classes,
        "present_classes": present_classes,
        "absent_classes": absent_classes,
        "last_reset_event": reset_info,
        "subjects": subject_summaries
    }


@router.get("/day-wise", response_model=List[DayWiseAttendanceRecord])
def get_day_wise_attendance(semester: int = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    target_sem_num = semester if semester else student.current_semester
    target_sem = db.query(Semester).filter(Semester.semester_number == target_sem_num).first()

    if target_sem:
        subjects = db.query(Subject).filter(
            Subject.semester_id == target_sem.id,
            Subject.branch == student.branch
        ).all()
        if not subjects:
            subjects = db.query(Subject).filter(Subject.semester_id == target_sem.id).all()
        sub_ids = [s.id for s in subjects]
        query = db.query(Attendance).filter(Attendance.student_id == student.id, Attendance.subject_id.in_(sub_ids)) if sub_ids else db.query(Attendance).filter(Attendance.id == -1)
    else:
        query = db.query(Attendance).filter(Attendance.student_id == student.id)

    records = query.order_by(Attendance.date.desc()).all()
    
    result = []
    for r in records:
        sub = db.query(Subject).filter(Subject.id == r.subject_id).first()
        result.append(DayWiseAttendanceRecord(
            id=r.id,
            date=r.date,
            subject_code=sub.subject_code if sub else "N/A",
            subject_name=sub.subject_name if sub else "N/A",
            status=r.status,
            class_number=r.class_number
        ))
    return result


@router.post("/calculate", response_model=AttendanceCalculatorResponse)
def calculate_attendance(req: AttendanceCalculatorRequest):
    P = req.present_classes
    T = req.total_classes
    R = req.remaining_classes
    target = req.required_percentage / 100.0  # e.g., 0.75

    if T <= 0:
        return AttendanceCalculatorResponse(
            current_percentage=0.0,
            max_possible_percentage=100.0 if R > 0 else 0.0,
            required_additional_classes=0,
            is_possible=True,
            message="No classes conducted yet."
        )

    current_perc = round((P / T) * 100, 2)
    max_possible_perc = round(((P + R) / (T + R)) * 100, 2)

    # Check if student already meets requirement
    if (P / T) >= target:
        return AttendanceCalculatorResponse(
            current_percentage=current_perc,
            max_possible_percentage=max_possible_perc,
            required_additional_classes=0,
            is_possible=True,
            message=f"You already meet or exceed the required {req.required_percentage}% attendance!"
        )

    # Calculate additional required classes: x = ceil((target * T - P) / (1 - target))
    num = (target * T) - P
    den = 1.0 - target
    x = math.ceil(num / den)

    if x <= R:
        return AttendanceCalculatorResponse(
            current_percentage=current_perc,
            max_possible_percentage=max_possible_perc,
            required_additional_classes=x,
            is_possible=True,
            message=f"You need to attend at least {x} out of the remaining {R} classes to reach {req.required_percentage}%."
        )
    else:
        return AttendanceCalculatorResponse(
            current_percentage=current_perc,
            max_possible_percentage=max_possible_perc,
            required_additional_classes=x,
            is_possible=False,
            message=f"It is mathematically impossible to reach {req.required_percentage}% even if you attend all {R} remaining classes. Maximum possible attendance is {max_possible_perc}%."
        )
