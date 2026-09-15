from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student, LibraryRecord
from app.schemas.erp_schemas import LibraryRecordResponse
from app.utils.enums import LibraryStatus

router = APIRouter()

PER_DAY_FINE_RATE = 5.0  # ₹ 5.00 per late day


@router.get("", response_model=List[LibraryRecordResponse])
def get_library_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    records = db.query(LibraryRecord).filter(LibraryRecord.student_id == student.id).all()
    today = date.today()

    result = []
    for r in records:
        fine = r.fine_amount
        status = r.status

        # Calculate backend dynamic late fine if overdue & not returned yet
        if status == LibraryStatus.ISSUED and today > r.due_date:
            late_days = (today - r.due_date).days
            fine = round(late_days * PER_DAY_FINE_RATE, 2)
            status = LibraryStatus.OVERDUE

        result.append(LibraryRecordResponse(
            id=r.id,
            book_title=r.book_title,
            book_author=r.book_author,
            issue_date=r.issue_date,
            due_date=r.due_date,
            return_date=r.return_date,
            fine_amount=fine,
            status=status
        ))
    return result
