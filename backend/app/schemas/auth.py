from pydantic import BaseModel, EmailStr
from typing import Optional
from app.utils.enums import UserRole


class CaptchaResponse(BaseModel):
    captcha_id: str
    captcha_image: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    user_id: int
    full_name: Optional[str] = None
    account_label: Optional[str] = None
    identifier: Optional[str] = None
    email: Optional[str] = None
    college_id: Optional[str] = None
    roll_number: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[int] = None
    year: Optional[int] = None




class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    username: Optional[str] = None
    identifier: Optional[str] = None
    password: str
    captcha_id: str
    captcha_solution: str
    designation: Optional[str] = None


class RegisterRequest(BaseModel):
    username: Optional[str] = None
    identifier: Optional[str] = None
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT
    captcha_id: str
    captcha_solution: str

    # Student specific fields
    full_name: Optional[str] = None
    enrollment_number: Optional[str] = None
    branch: Optional[str] = "Computer Science & Engineering"
    semester: Optional[int] = 1
    section: Optional[str] = "A"

    # Faculty specific fields
    employee_id: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"
    designation: Optional[str] = "Professor"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_active: bool
    full_name: Optional[str] = None
    account_label: Optional[str] = None
    identifier: Optional[str] = None
    college_id: Optional[str] = None
    roll_number: Optional[str] = None
    branch: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[int] = None
    year: Optional[int] = None

    class Config:
        from_attributes = True


