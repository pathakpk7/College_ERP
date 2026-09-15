from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, Message
from app.schemas.erp_schemas import MessageCreateRequest, MessageResponse
from app.utils.enums import GrievanceStatus

router = APIRouter()


@router.get("/recipients")
def get_message_recipients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.id != current_user.id).all()
    return [{"username": u.username, "role": u.role.value} for u in users]


@router.get("", response_model=List[MessageResponse])
def get_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(
        (Message.sender_id == current_user.id) | (Message.receiver_id == current_user.id) | (Message.receiver_id == None)
    ).order_by(Message.created_at.desc()).all()

    result = []
    for m in msgs:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        result.append(MessageResponse(
            id=m.id,
            sender_id=m.sender_id,
            sender_name=sender.username if sender else "System",
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

    return MessageResponse(
        id=msg.id,
        sender_id=msg.sender_id,
        sender_name=current_user.username,
        receiver_id=msg.receiver_id,
        subject=msg.subject,
        content=msg.content,
        is_read=msg.is_read,
        is_grievance=msg.is_grievance,
        grievance_status=msg.grievance_status,
        created_at=msg.created_at
    )
