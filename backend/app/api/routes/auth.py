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

    # Search user by username, email, student enrollment_number, college_id, or faculty employee_id / full_name
    user = db.query(User).filter(
        (User.username.ilike(login_id)) | (User.email.ilike(login_id))
    ).first()

    if not user:
        # Try finding via Student enrollment number, college ID, or full name
        student = db.query(Student).filter(
            (Student.enrollment_number.ilike(login_id)) |
            (Student.college_id.ilike(login_id)) |
            (Student.full_name.ilike(login_id))
        ).first()
        if student:
            user = student.user

    if not user:
        # Try finding via Faculty employee ID, name, or email
        faculty = db.query(Faculty).filter(
            (Faculty.employee_id.ilike(login_id)) |
            (Faculty.full_name.ilike(login_id)) |
            (Faculty.email.ilike(login_id))
        ).first()
        if faculty:
            user = faculty.user

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login credentials or password",
        )
    
    # If designation is provided for Faculty/Admin, update profile if needed
    if request.designation and user.role in [UserRole.FACULTY, UserRole.ADMIN]:
        fac = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if fac and request.designation != fac.designation:
            fac.designation = request.designation
            db.commit()

    # Resolve full name & detailed account labels
    full_name = user.username
    account_label = user.role.value.title()
    identifier = user.username
    college_id = None
    roll_number = None
    branch = None
    section = None
    semester = None
    year = None

    if user.role == UserRole.STUDENT:
        st = db.query(Student).filter(Student.user_id == user.id).first()
        if st:
            full_name = st.full_name
            identifier = st.enrollment_number
            roll_number = st.enrollment_number
            college_id = st.college_id or f"UIT{st.admission_year % 100}{st.id:04d}"
            branch = st.branch
            section = st.section
            semester = st.current_semester
            year = (st.current_semester + 1) // 2
            branch_short = "CSE" if "computer" in st.branch.lower() else st.branch
            account_label = f"Student • {branch_short} (Year {year})"
    elif user.role == UserRole.FACULTY:
        fac = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if fac:
            full_name = fac.full_name
            identifier = fac.employee_id
            account_label = f"{fac.designation or 'Faculty'} • {fac.department or 'Dept of CSE'}"
    elif user.role == UserRole.ADMIN:
        fac = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if fac:
            full_name = fac.full_name
            identifier = fac.employee_id
            account_label = f"{fac.designation or 'Administrator'} • {fac.department or 'Administration'}"
        else:
            full_name = "System Administrator"
            account_label = "System Administrator • Campus Head"

    access_token = create_access_token(subject=user.username, role=user.role.value)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "username": user.username,
        "user_id": user.id,
        "email": user.email,
        "full_name": full_name,
        "account_label": account_label,
        "identifier": identifier,
        "college_id": college_id,
        "roll_number": roll_number,
        "branch": branch,
        "section": section,
        "semester": semester,
        "year": year,
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

    resolved_full_name = request.full_name or assigned_username.title()
    account_label = "Student Account"
    identifier = assigned_username

    # Create Role-Specific Profile
    if request.role == UserRole.STUDENT:
        enrollment = request.enrollment_number or assigned_username
        student = Student(
            user_id=new_user.id,
            enrollment_number=enrollment,
            full_name=resolved_full_name,
            email=request.email,
            branch=request.branch or "Computer Science & Engineering",
            current_semester=request.semester or 1,
            admission_year=2026,
            section=request.section or "A",
            cgpa=0.0,
            backlogs=0
        )
        db.add(student)
        identifier = enrollment
        calc_year = ((request.semester or 1) + 1) // 2
        account_label = f"Student • {request.branch or 'CSE'} (Year {calc_year})"
    elif request.role in [UserRole.FACULTY, UserRole.ADMIN]:
        emp_id = request.employee_id or assigned_username
        faculty = Faculty(
            user_id=new_user.id,
            employee_id=emp_id,
            full_name=resolved_full_name,
            department=request.department or "Computer Science & Engineering",
            designation=request.designation or "Professor",
            email=request.email
        )
        db.add(faculty)
        identifier = emp_id
        account_label = f"{request.designation or 'Faculty'} • {request.department or 'Dept of CSE'}"

    db.commit()

    # Generate Access Token
    access_token = create_access_token(subject=new_user.username, role=new_user.role.value)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.role.value,
        "username": new_user.username,
        "user_id": new_user.id,
        "full_name": resolved_full_name,
        "account_label": account_label,
        "identifier": identifier,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    full_name = current_user.username
    account_label = current_user.role.value.title()
    identifier = current_user.username
    college_id = None
    roll_number = None
    branch = None
    section = None
    semester = None
    year = None

    if current_user.role == UserRole.STUDENT:
        st = db.query(Student).filter(Student.user_id == current_user.id).first()
        if st:
            full_name = st.full_name
            identifier = st.enrollment_number
            roll_number = st.enrollment_number
            college_id = st.college_id or f"UIT{st.admission_year % 100}{st.id:04d}"
            branch = st.branch
            section = st.section
            semester = st.current_semester
            year = (st.current_semester + 1) // 2
            branch_short = "CSE" if "computer" in (st.branch or "").lower() else st.branch
            account_label = f"Student • {branch_short} (Year {year})"
    elif current_user.role == UserRole.FACULTY:
        fac = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if fac:
            full_name = fac.full_name
            identifier = fac.employee_id
            account_label = f"{fac.designation or 'Faculty'} • {fac.department or 'Dept of CSE'}"
    elif current_user.role == UserRole.ADMIN:
        fac = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if fac:
            full_name = fac.full_name
            identifier = fac.employee_id
            account_label = f"{fac.designation or 'Administrator'} • {fac.department or 'Administration'}"
        else:
            full_name = "System Administrator"
            account_label = "System Administrator • Campus Head"

    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        full_name=full_name,
        account_label=account_label,
        identifier=identifier,
        college_id=college_id,
        roll_number=roll_number,
        branch=branch,
        section=section,
        semester=semester,
        year=year
    )


