from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.all_models import User, Student, Faculty
from app.schemas.auth import LoginRequest, RegisterRequest, Token, UserResponse, CaptchaResponse
from app.core.dependencies import get_current_user
from app.utils.captcha import generate_captcha_challenge
from app.utils.enums import UserRole

router = APIRouter()

# Captcha storage dictionary (captcha_id -> solution text)
captcha_store = {}


@router.get("/captcha", response_model=CaptchaResponse)
def get_captcha():
    captcha_id, text, svg_image = generate_captcha_challenge()
    captcha_store[captcha_id] = text.upper()
    return {
        "captcha_id": captcha_id,
        "captcha_image": svg_image
    }


def verify_captcha_solution(captcha_id: str, solution: str):
    expected = captcha_store.pop(captcha_id, None)
    if not expected or solution.strip().upper() != expected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid captcha solution. Please try again."
        )


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Verify Captcha
    verify_captcha_solution(request.captcha_id, request.captcha_solution)

    login_id = (request.identifier or request.username or "").strip()
    if not login_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Roll Number, Employee ID, Username, or Email is required."
        )

    # Search user by username, email, student enrollment_number, or faculty employee_id / full_name
    user = db.query(User).filter(
        (User.username == login_id) | (User.email == login_id)
    ).first()

    if not user:
        # Try finding via Student enrollment number
        student = db.query(Student).filter(Student.enrollment_number == login_id).first()
        if student:
            user = student.user

    if not user:
        # Try finding via Faculty employee ID or name or email
        faculty = db.query(Faculty).filter(
            (Faculty.employee_id == login_id) | (Faculty.full_name == login_id) | (Faculty.email == login_id)
        ).first()
        if faculty:
            user = faculty.user

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login credentials or password",
        )
    
    # If designation is provided for Faculty/Admin, update profile if needed
    if request.designation and user.role == UserRole.FACULTY:
        fac = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if fac and request.designation != fac.designation:
            fac.designation = request.designation
            db.commit()

    access_token = create_access_token(subject=user.username, role=user.role.value)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "username": user.username,
        "user_id": user.id,
    }


@router.post("/register", response_model=Token)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Verify Captcha
    verify_captcha_solution(request.captcha_id, request.captcha_solution)

    # Determine unique username
    if request.role == UserRole.STUDENT:
        assigned_username = request.enrollment_number or request.username or request.identifier or f"STUDENT_{request.email.split('@')[0]}"
    elif request.role in [UserRole.FACULTY, UserRole.ADMIN]:
        assigned_username = request.employee_id or request.username or request.identifier or f"FAC_{request.email.split('@')[0]}"
    else:
        assigned_username = request.username or request.identifier or request.email.split('@')[0]

    assigned_username = assigned_username.strip()

    # Check if username or email exists
    if db.query(User).filter((User.username == assigned_username) | (User.email == request.email)).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this Roll Number / Employee ID / Email already exists."
        )

    # Create User
    new_user = User(
        username=assigned_username,
        email=request.email,
        password_hash=get_password_hash(request.password),
        role=request.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Role-Specific Profile
    if request.role == UserRole.STUDENT:
        enrollment = request.enrollment_number or assigned_username
        student = Student(
            user_id=new_user.id,
            enrollment_number=enrollment,
            full_name=request.full_name or assigned_username.title(),
            email=request.email,
            branch=request.branch or "Computer Science & Engineering",
            current_semester=request.semester or 1,
            admission_year=2026,
            section=request.section or "A",
            cgpa=0.0,
            backlogs=0
        )
        db.add(student)
    elif request.role in [UserRole.FACULTY, UserRole.ADMIN]:
        emp_id = request.employee_id or assigned_username
        faculty = Faculty(
            user_id=new_user.id,
            employee_id=emp_id,
            full_name=request.full_name or f"Dr. {assigned_username.title()}",
            department=request.department or "Computer Science & Engineering",
            designation=request.designation or "Professor",
            email=request.email
        )
        db.add(faculty)

    db.commit()

    # Generate Access Token
    access_token = create_access_token(subject=new_user.username, role=new_user.role.value)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.role.value,
        "username": new_user.username,
        "user_id": new_user.id,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
