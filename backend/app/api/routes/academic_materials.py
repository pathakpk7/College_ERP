from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.all_models import AcademicMaterial
from app.schemas.erp_schemas import AcademicMaterialResponse

router = APIRouter()


@router.get("", response_model=List[AcademicMaterialResponse])
def get_academic_materials(db: Session = Depends(get_db)):
    return db.query(AcademicMaterial).order_by(AcademicMaterial.upload_date.desc()).all()
