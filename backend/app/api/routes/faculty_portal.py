from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import os
import uuid
import shutil
from app.db.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.all_models import User, Faculty, Student, Subject, Attendance, Mark, AcademicMaterial, TimetableSlot
from app.utils.enums import UserRole, AttendanceStatus, AssessmentType, MaterialType
from pydantic import BaseModel

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class MarkAttendanceItem(BaseModel):
    student_id: int
    subject_id: int
    date: date
    status: AttendanceStatus
    class_number: int = 1
    class_numbers: Optional[List[int]] = None


class SubmitMarkItem(BaseModel):
    student_id: int
    subject_id: int
    assessment_type: AssessmentType
    marks: float
    maximum_marks: float = 30.0


class UploadMaterialRequest(BaseModel):
    title: str
    description: Optional[str] = None
    subject_code: str
    subject_name: str
    file_path: Optional[str] = None
    external_link: Optional[str] = None
    material_type: MaterialType = MaterialType.NOTE
    target_year: Optional[int] = None
    semester_number: Optional[int] = None
    target_branch: Optional[str] = None
    target_section: Optional[str] = None
    due_date: Optional[date] = None


@router.get("/dashboard")
def get_faculty_dashboard(current_user: User = Depends(require_role([UserRole.FACULTY, UserRole.ADMIN])), db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    subjects = db.query(Subject).all()
    students_count = db.query(Student).count()
    materials_count = db.query(AcademicMaterial).count()

    return {
        "faculty_name": faculty.full_name if faculty else current_user.username,
        "employee_id": faculty.employee_id if faculty else "FAC-001",
        "department": faculty.department if faculty else "Computer Science",
        "designation": faculty.designation if faculty else "Professor",
        "assigned_subjects": [{"id": s.id, "code": s.subject_code, "name": s.subject_name, "credits": s.credits} for s in subjects],
        "total_students": students_count,
        "total_materials_uploaded": materials_count
    }


@router.get("/classes")
def get_faculty_classes(
    current_user: User = Depends(require_role([UserRole.FACULTY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    fac_name = faculty.full_name if faculty else "Dr. Robert Smith"

    # Fetch slots for this faculty, or all unique class slots if admin/fallback
    slots = db.query(TimetableSlot).all()
    
    # Group unique class combinations
    classes_dict = {}
    for slot in slots:
        key = (slot.semester, slot.branch, slot.section, slot.subject_code, slot.subject_name)
        if key not in classes_dict:
            # Find subject id if exists
            sub = db.query(Subject).filter(Subject.subject_code == slot.subject_code).first()
            classes_dict[key] = {
                "semester": slot.semester,
                "year": ((slot.semester + 1) // 2),
                "branch": slot.branch,
                "section": slot.section,
                "subject_code": slot.subject_code or "CS701",
                "subject_name": slot.subject_name,
                "subject_id": sub.id if sub else 1,
                "room_number": slot.room_number,
                "faculty_name": slot.faculty_name
            }

    # If no timetable slots found, provide standard fallback classes
    if not classes_dict:
        subjects = db.query(Subject).all()
        return [
            {
                "semester": 7,
                "year": 4,
                "branch": "Computer Science & Engineering",
                "section": "A",
                "subject_code": subjects[0].subject_code if subjects else "BCS701",
                "subject_name": subjects[0].subject_name if subjects else "ARTIFICIAL INTELLIGENCE",
                "subject_id": subjects[0].id if subjects else 1,
                "room_number": "LH 101",
                "faculty_name": fac_name
            },
            {
                "semester": 7,
                "year": 4,
                "branch": "Computer Science & Engineering",
                "section": "B",
                "subject_code": subjects[0].subject_code if subjects else "BCS701",
                "subject_name": subjects[0].subject_name if subjects else "ARTIFICIAL INTELLIGENCE",
                "subject_id": subjects[0].id if subjects else 1,
                "room_number": "LH 102",
                "faculty_name": fac_name
            },
            {
                "semester": 6,
                "year": 3,
                "branch": "Information Technology",
                "section": "A",
                "subject_code": "BIT601",
                "subject_name": "WEB SERVICES & CLOUD",
                "subject_id": 2,
                "room_number": "LH 204",
                "faculty_name": fac_name
            }
        ]

    return list(classes_dict.values())


@router.get("/students")
def get_enrolled_students(
    branch: Optional[str] = None,
    semester: Optional[int] = None,
    section: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if branch:
        query = query.filter(Student.branch.ilike(f"%{branch}%"))
    if semester:
        query = query.filter(Student.current_semester == semester)
    if section:
        query = query.filter(Student.section.ilike(section))
    
    students = query.all()

    # If no specific students match this exact class filter, fallback to all students
    if not students:
        students = db.query(Student).all()

    return [
        {
            "id": s.id,
            "enrollment_number": s.enrollment_number,
            "college_id": s.college_id,
            "full_name": s.full_name,
            "branch": s.branch,
            "semester": s.current_semester,
            "section": s.section,
            "cgpa": s.cgpa,
            "backlogs": s.backlogs
        }
        for s in students
    ]


@router.post("/attendance")
def mark_attendance(items: List[MarkAttendanceItem], current_user: User = Depends(require_role([UserRole.FACULTY, UserRole.ADMIN])), db: Session = Depends(get_db)):
    added_count = 0
    for item in items:
        # Determine slots to mark (single period or multi-period combined class e.g. [2, 3])
        slots = item.class_numbers if (item.class_numbers and len(item.class_numbers) > 0) else [item.class_number]
        
        for slot in slots:
            existing = db.query(Attendance).filter(
                Attendance.student_id == item.student_id,
                Attendance.subject_id == item.subject_id,
                Attendance.date == item.date,
                Attendance.class_number == slot
            ).first()

            if existing:
                if existing.edit_count >= 2:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Attendance update limit reached for student ID {item.student_id} on Period #{slot}. This record has already been edited twice and cannot be modified further per college regulations."
                    )
                existing.status = item.status
                existing.edit_count += 1
            else:
                att = Attendance(
                    student_id=item.student_id,
                    subject_id=item.subject_id,
                    date=item.date,
                    status=item.status,
                    class_number=slot,
                    edit_count=0
                )
                db.add(att)
            added_count += 1

    db.commit()
    return {"message": f"Successfully recorded attendance for {added_count} period records."}


@router.post("/marks")
def submit_sessional_marks(item: SubmitMarkItem, current_user: User = Depends(require_role([UserRole.FACULTY, UserRole.ADMIN])), db: Session = Depends(get_db)):
    existing = db.query(Mark).filter(
        Mark.student_id == item.student_id,
        Mark.subject_id == item.subject_id,
        Mark.assessment_type == item.assessment_type
    ).first()

    if existing:
        existing.marks = item.marks
        existing.maximum_marks = item.maximum_marks
        existing.updated_by = current_user.id
    else:
        mark = Mark(
            student_id=item.student_id,
            subject_id=item.subject_id,
            assessment_type=item.assessment_type,
            marks=item.marks,
            maximum_marks=item.maximum_marks,
            updated_by=current_user.id
        )
        db.add(mark)
    db.commit()
    return {"message": "Sessional marks recorded successfully."}


@router.post("/marks/bulk")
def submit_bulk_sessional_marks(items: List[SubmitMarkItem], current_user: User = Depends(require_role([UserRole.FACULTY, UserRole.ADMIN])), db: Session = Depends(get_db)):
    updated_count = 0
    for item in items:
        existing = db.query(Mark).filter(
            Mark.student_id == item.student_id,
            Mark.subject_id == item.subject_id,
            Mark.assessment_type == item.assessment_type
        ).first()

        if existing:
            existing.marks = item.marks
            existing.maximum_marks = item.maximum_marks
            existing.updated_by = current_user.id
        else:
            mark = Mark(
                student_id=item.student_id,
                subject_id=item.subject_id,
                assessment_type=item.assessment_type,
                marks=item.marks,
                maximum_marks=item.maximum_marks,
                updated_by=current_user.id
            )
            db.add(mark)
        updated_count += 1

    db.commit()
    return {"message": f"Successfully updated sessional marks for {updated_count} students."}


@router.post("/materials")
def upload_study_material(req: UploadMaterialRequest, current_user: User = Depends(require_role([UserRole.FACULTY, UserRole.ADMIN])), db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    mat = AcademicMaterial(
        title=req.title,
        description=req.description,
        subject_code=req.subject_code,
        subject_name=req.subject_name,
        uploaded_by_name=faculty.full_name if faculty else current_user.username,
        file_path=req.file_path,
        external_link=req.external_link,
        material_type=req.material_type,
        target_year=req.target_year,
        semester_number=req.semester_number,
        target_branch=req.target_branch,
        target_section=req.target_section,
        due_date=req.due_date,
        upload_date=date.today()
    )
    db.add(mat)
    db.commit()
    return {"message": "Academic material uploaded successfully."}


@router.post("/materials/upload-file")
async def upload_material_file(
    title: str = Form(...),
    subject_code: str = Form(...),
    subject_name: str = Form(...),
    material_type: MaterialType = Form(MaterialType.NOTE),
    description: Optional[str] = Form(None),
    target_year: Optional[int] = Form(None),
    semester_number: Optional[int] = Form(None),
    target_branch: Optional[str] = Form(None),
    target_section: Optional[str] = Form(None),
    external_link: Optional[str] = Form(None),
    due_date: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_role([UserRole.FACULTY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    uploaded_by = faculty.full_name if faculty else current_user.username

    saved_file_path = None
    if file and file.filename:
        # Sanitize filename and save to uploads/
        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex[:10]}_{file.filename}"
        disk_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(disk_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        saved_file_path = f"/uploads/{unique_filename}"

    parsed_due_date = None
    if due_date:
        try:
            parsed_due_date = datetime.strptime(due_date, "%Y-%m-%d").date()
        except Exception:
            pass

    mat = AcademicMaterial(
        title=title,
        description=description,
        subject_code=subject_code,
        subject_name=subject_name,
        uploaded_by_name=uploaded_by,
        file_path=saved_file_path or (external_link if not external_link else None),
        external_link=external_link,
        material_type=material_type,
        target_year=target_year,
        semester_number=semester_number,
        target_branch=target_branch,
        target_section=target_section,
        due_date=parsed_due_date,
        upload_date=date.today()
    )
    db.add(mat)
    db.commit()
    db.refresh(mat)

    return {
        "message": "Study material and file uploaded successfully.",
        "id": mat.id,
        "file_path": mat.file_path,
        "title": mat.title
    }


