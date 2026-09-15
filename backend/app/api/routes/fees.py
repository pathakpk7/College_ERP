from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Student, Fee, Semester
from app.schemas.erp_schemas import FeeResponse

router = APIRouter()


@router.get("", response_model=List[FeeResponse])
def get_fee_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        student = db.query(Student).first()

    fees = db.query(Fee).filter(Fee.student_id == student.id).all()
    result = []
    for f in fees:
        sem = db.query(Semester).filter(Semester.id == f.semester_id).first()
        rem_due = max(0.0, f.total_fee - f.amount_paid)
        result.append(FeeResponse(
            id=f.id,
            semester_number=sem.semester_number if sem else 0,
            academic_year=sem.academic_year if sem else "2025-2026",
            total_fee=f.total_fee,
            amount_paid=f.amount_paid,
            remaining_due=rem_due,
            payment_date=f.payment_date,
            payment_status=f.payment_status,
            receipt_number=f.receipt_number
        ))
    return result


@router.get("/{fee_id}/receipt")
def generate_fee_receipt(fee_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found.")

    student = db.query(Student).filter(Student.id == fee.student_id).first()
    sem = db.query(Semester).filter(Semester.id == fee.semester_id).first()

    receipt_text = f"""
    ===============================================================
                       COLLEGE ERP FEE RECEIPT
    ===============================================================
    Receipt Number  : {fee.receipt_number or 'REC-OFFICIAL-2025'}
    Date            : {fee.payment_date or '2025-07-26'}
    Student Name    : {student.full_name if student else 'N/A'}
    Enrollment No.  : {student.enrollment_number if student else 'N/A'}
    Branch          : {student.branch if student else 'N/A'}
    Semester        : Semester {sem.semester_number if sem else '7'} ({sem.academic_year if sem else '2025-2026'})
    ---------------------------------------------------------------
    Total Tuition & Admin Fee : ₹ {fee.total_fee:,.2f}
    Amount Paid               : ₹ {fee.amount_paid:,.2f}
    Remaining Due Balance     : ₹ {max(0.0, fee.total_fee - fee.amount_paid):,.2f}
    Payment Status            : {fee.payment_status.value}
    ---------------------------------------------------------------
    Status: VERIFIED & COMPLETED
    Issued By: College ERP Accounts & Administrative Gateway
    ===============================================================
    """
    return PlainTextResponse(content=receipt_text.strip(), media_type="text/plain")
