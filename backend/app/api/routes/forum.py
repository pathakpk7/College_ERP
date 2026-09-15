from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.all_models import User, ForumPost, ForumComment
from app.schemas.erp_schemas import ForumPostCreateRequest, ForumPostResponse, ForumCommentResponse

router = APIRouter()


@router.get("", response_model=List[ForumPostResponse])
def get_forum_posts(db: Session = Depends(get_db)):
    posts = db.query(ForumPost).order_by(ForumPost.created_at.desc()).all()
    result = []
    for p in posts:
        author = db.query(User).filter(User.id == p.author_id).first()
        comments_list = []
        for c in p.comments:
            c_author = db.query(User).filter(User.id == c.author_id).first()
            comments_list.append(ForumCommentResponse(
                id=c.id,
                author_name=c_author.username if c_author else "Anonymous",
                content=c.content,
                created_at=c.created_at
            ))
        result.append(ForumPostResponse(
            id=p.id,
            title=p.title,
            content=p.content,
            author_name=author.username if author else "Anonymous",
            created_at=p.created_at,
            comments=comments_list
        ))
    return result


@router.post("", response_model=ForumPostResponse)
def create_forum_post(
    req: ForumPostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = ForumPost(
        title=req.title,
        content=req.content,
        author_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return ForumPostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        author_name=current_user.username,
        created_at=post.created_at,
        comments=[]
    )
