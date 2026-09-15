from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student, Mark, Subject
from app.schemas.erp_schemas import SessionalMarksSummaryResponse, SubjectMarkResponse

router = APIRouter()


@router.get("", response_model=SessionalMarksSummaryResponse)
def get_sessional_marks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    marks_records = db.query(Mark).filter(Mark.student_id == student.id).all()
    marks_list = []
    total_obtained = 0.0
    total_max = 0.0

    for m in marks_records:
        sub = db.query(Subject).filter(Subject.id == m.subject_id).first()
        perc = round((m.marks / m.maximum_marks) * 100, 1) if m.maximum_marks > 0 else 0.0
        total_obtained += m.marks
        total_max += m.maximum_marks

        marks_list.append(SubjectMarkResponse(
            subject_code=sub.subject_code if sub else "N/A",
            subject_name=sub.subject_name if sub else "N/A",
            assessment_type=m.assessment_type,
            marks=m.marks,
            maximum_marks=m.maximum_marks,
            percentage=perc
        ))

    # Configurable estimated internal score formula: (total obtained / total max) * 40
    estimated_internal = round((total_obtained / total_max * 40.0), 1) if total_max > 0 else 0.0

    return SessionalMarksSummaryResponse(
        marks_list=marks_list,
        estimated_internal_total=estimated_internal,
        max_internal_total=40.0
    )
