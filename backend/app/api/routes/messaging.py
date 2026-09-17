from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Message, Student, Faculty
from app.schemas.erp_schemas import MessageCreateRequest, MessageResponse
from app.utils.enums import GrievanceStatus, UserRole

router = APIRouter()


@router.get("/recipients")
def get_message_recipients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipients = []

    if current_user.role == UserRole.STUDENT:
        # Students can only communicate with Institutional Authorities and Faculty (NEVER other students)
        recipients.append({
            "username": "admin",
            "label": "Grievance Redressal Committee • Admin Office",
            "role": "ADMIN"
        })
        recipients.append({
            "username": "admin",
            "label": "Office of the Dean & Academic Affairs",
            "role": "ADMIN"
        })
        recipients.append({
            "username": "admin",
            "label": "Examination & Evaluation Cell",
            "role": "ADMIN"
        })
        recipients.append({
            "username": "admin",
            "label": "Accounts & Fee Verification Section",
            "role": "ADMIN"
        })

        faculty_members = db.query(Faculty).all()
        for fac in faculty_members:
            fac_user = db.query(User).filter(User.id == fac.user_id).first()
            if fac_user:
                recipients.append({
                    "username": fac_user.username,
                    "label": f"{fac.full_name} • {fac.designation} ({fac.department})",
                    "role": "FACULTY"
                })
        return recipients

    elif current_user.role == UserRole.FACULTY:
        recipients.append({
            "username": "admin",
            "label": "Campus Administration & Dean Office",
            "role": "ADMIN"
        })
        recipients.append({
            "username": "admin",
            "label": "Examination & Evaluation Cell",
            "role": "ADMIN"
        })
        other_faculty = db.query(Faculty).filter(Faculty.user_id != current_user.id).all()
        for fac in other_faculty:
            fac_user = db.query(User).filter(User.id == fac.user_id).first()
            if fac_user:
                recipients.append({
                    "username": fac_user.username,
                    "label": f"{fac.full_name} • {fac.designation} ({fac.department})",
                    "role": "FACULTY"
                })
        return recipients

    else:
        # Admin Portal view
        recipients.append({
            "username": "faculty",
            "label": "All Faculty Members Broadcast",
            "role": "FACULTY"
        })
        faculty_members = db.query(Faculty).all()
        for fac in faculty_members:
            fac_user = db.query(User).filter(User.id == fac.user_id).first()
            if fac_user:
                recipients.append({
                    "username": fac_user.username,
                    "label": f"{fac.full_name} • {fac.designation} ({fac.department})",
                    "role": "FACULTY"
                })
        return recipients


@router.get("", response_model=List[MessageResponse])
def get_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(
        (Message.sender_id == current_user.id) | (Message.receiver_id == current_user.id) | (Message.receiver_id == None)
    ).order_by(Message.created_at.desc()).all()

    result = []
    for m in msgs:
        sender_label = "System Administration"
        if m.sender_id:
            s_user = db.query(User).filter(User.id == m.sender_id).first()
            if s_user:
                if s_user.role == UserRole.STUDENT:
                    st = db.query(Student).filter(Student.user_id == s_user.id).first()
                    sender_label = f"{st.full_name} ({st.college_id or st.enrollment_number})" if st else s_user.username
                elif s_user.role == UserRole.FACULTY:
                    fac = db.query(Faculty).filter(Faculty.user_id == s_user.id).first()
                    sender_label = f"{fac.full_name} ({fac.designation})" if fac else "Faculty Desk"
                elif s_user.role == UserRole.ADMIN:
                    sender_label = "Grievance Redressal Committee"

        result.append(MessageResponse(
            id=m.id,
            sender_id=m.sender_id,
            sender_name=sender_label,
            receiver_id=m.receiver_id,
            subject=m.subject,
            content=m.content,
            is_read=m.is_read,
            is_grievance=m.is_grievance,
            grievance_status=m.grievance_status,
            created_at=m.created_at
        ))
    return result


@router.post("", response_model=MessageResponse)
def send_message(req: MessageCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    receiver_id = None
    if req.receiver_username:
        rec = db.query(User).filter(User.username == req.receiver_username).first()
        if rec:
            receiver_id = rec.id

    msg = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        subject=req.subject,
        content=req.content,
        is_grievance=req.is_grievance,
        grievance_status=GrievanceStatus.OPEN if req.is_grievance else None,
        created_at=datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    sender_label = "System Administration"
    if current_user.role == UserRole.STUDENT:
        st = db.query(Student).filter(Student.user_id == current_user.id).first()
        sender_label = f"{st.full_name} ({st.college_id or st.enrollment_number})" if st else current_user.username
    elif current_user.role == UserRole.FACULTY:
        fac = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        sender_label = f"{fac.full_name} ({fac.designation})" if fac else "Faculty Member"

    return MessageResponse(
        id=msg.id,
        sender_id=msg.sender_id,
        sender_name=sender_label,
        receiver_id=msg.receiver_id,
        subject=msg.subject,
        content=msg.content,
        is_read=msg.is_read,
        is_grievance=msg.is_grievance,
        grievance_status=msg.grievance_status,
        created_at=msg.created_at
    )
