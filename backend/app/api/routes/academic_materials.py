from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.core.dependencies import get_optional_current_user
from app.models.all_models import AcademicMaterial, User, Student
from app.schemas.erp_schemas import AcademicMaterialResponse
from app.utils.enums import MaterialType, UserRole

router = APIRouter()


@router.get("", response_model=List[AcademicMaterialResponse])
def get_academic_materials(
    year: Optional[int] = Query(None, description="Filter by target year (1-4)"),
    branch: Optional[str] = Query(None, description="Filter by branch"),
    section: Optional[str] = Query(None, description="Filter by section"),
    material_type: Optional[MaterialType] = Query(None, description="Filter by material type"),
    search: Optional[str] = Query(None, description="Search by title, subject or description"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AcademicMaterial)

    # If student is logged in and no specific year is requested, optionally filter for their year/section
    if current_user and current_user.role == UserRole.STUDENT and year is None:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if student:
            # Calculate year from semester (e.g. sem 7 -> year 4)
            calc_year = (student.current_semester + 1) // 2
            # Allow materials targeting their year OR materials targeting all years (target_year IS NULL)
            query = query.filter(
                (AcademicMaterial.target_year == calc_year) | (AcademicMaterial.target_year == None)
            )
            if student.section:
                # Allow materials for their section OR all sections (target_section IS NULL or "")
                query = query.filter(
                    (AcademicMaterial.target_section == student.section) |
                    (AcademicMaterial.target_section == None) |
                    (AcademicMaterial.target_section == "")
                )

    if year is not None:
        query = query.filter((AcademicMaterial.target_year == year) | (AcademicMaterial.target_year == None))

    if branch:
        query = query.filter(
            (AcademicMaterial.target_branch.ilike(f"%{branch}%")) | (AcademicMaterial.target_branch == None)
        )

    if section:
        query = query.filter(
            (AcademicMaterial.target_section == section) |
            (AcademicMaterial.target_section == None) |
            (AcademicMaterial.target_section == "")
        )

    if material_type:
        query = query.filter(AcademicMaterial.material_type == material_type)

    if search:
        term = f"%{search}%"
        query = query.filter(
            (AcademicMaterial.title.ilike(term)) |
            (AcademicMaterial.subject_name.ilike(term)) |
            (AcademicMaterial.subject_code.ilike(term)) |
            (AcademicMaterial.description.ilike(term))
        )

    return query.order_by(AcademicMaterial.upload_date.desc()).all()

