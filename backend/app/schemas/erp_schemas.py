from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from app.utils.enums import (
    UserRole, AttendanceStatus, NocStatus, AssessmentType,
    FeeStatus, LibraryStatus, GrievanceStatus, MaterialType
)


# Student & Dashboard Schemas
class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    enrollment_number: str
    full_name: str
    email: str
    phone: Optional[str]
    branch: str
    current_semester: int
    admission_year: int
    section: str
    date_of_birth: Optional[date]
    cgpa: float
    backlogs: int
    skills: Optional[str]
    resume_link: Optional[str]
    github_link: Optional[str]
    linkedin_link: Optional[str]
    preferred_roles: Optional[str]

    class Config:
        from_attributes = True


class NoticeResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    posted_by: str
    posted_date: date

    class Config:
        from_attributes = True


class DashboardSummaryResponse(BaseModel):
    student: StudentProfileResponse
    overall_attendance_percentage: float
    total_classes: int
    present_classes: int
    fee_status: str
    fee_due_amount: float
    recent_notices: List[NoticeResponse]
    upcoming_placements_count: int
    unread_messages_count: int
    pending_assignments_count: int


# Attendance Schemas
class SubjectAttendanceSummary(BaseModel):
    subject_id: int
    subject_code: str
    subject_name: str
    credits: int
    total_classes: int
    present_classes: int
    absent_classes: int
    percentage: float
    lecture_start: Optional[date] = None
    lecture_updated: Optional[date] = None


class AttendanceSummaryResponse(BaseModel):
    overall_percentage: float
    total_classes: int
    present_classes: int
    absent_classes: int
    last_reset_event: Optional[str] = None
    subjects: List[SubjectAttendanceSummary]


class DayWiseAttendanceRecord(BaseModel):
    id: int
    date: date
    subject_code: str
    subject_name: str
    status: AttendanceStatus
    class_number: int

    class Config:
        from_attributes = True


class AttendanceCalculatorRequest(BaseModel):
    present_classes: int
    total_classes: int
    remaining_classes: int
    required_percentage: float = 75.0


class AttendanceCalculatorResponse(BaseModel):
    current_percentage: float
    max_possible_percentage: float
    required_additional_classes: int
    is_possible: bool
    message: str


# Registration Log Schema
class RegistrationRecordResponse(BaseModel):
    id: int
    semester_number: int
    academic_year: str
    registration_date: date
    status: str
    registration_number: str
    remarks: Optional[str]


# NOC Application Schemas
class NocCreateRequest(BaseModel):
    application_type: str
    reason: str


class NocResponse(BaseModel):
    id: int
    student_id: int
    application_type: str
    reason: str
    status: NocStatus
    applied_at: datetime
    reviewed_at: Optional[datetime]
    remarks: Optional[str]

    class Config:
        from_attributes = True


# Fee Info Schemas
class FeeResponse(BaseModel):
    id: int
    semester_number: int
    academic_year: str
    total_fee: float
    amount_paid: float
    remaining_due: float
    payment_date: Optional[date]
    payment_status: FeeStatus
    receipt_number: Optional[str]


# Sessional Marks Schemas
class SubjectMarkResponse(BaseModel):
    subject_code: str
    subject_name: str
    assessment_type: AssessmentType
    marks: float
    maximum_marks: float
    percentage: float


class SessionalMarksSummaryResponse(BaseModel):
    marks_list: List[SubjectMarkResponse]
    estimated_internal_total: float
    max_internal_total: float


# Library Schemas
class LibraryRecordResponse(BaseModel):
    id: int
    book_title: str
    book_author: str
    issue_date: date
    due_date: date
    return_date: Optional[date]
    fine_amount: float
    status: LibraryStatus

    class Config:
        from_attributes = True


# Messaging & Grievance Schemas
class MessageCreateRequest(BaseModel):
    receiver_username: Optional[str] = None
    subject: str
    content: str
    is_grievance: bool = False


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    receiver_id: Optional[int]
    subject: str
    content: str
    is_read: bool
    is_grievance: bool
    grievance_status: Optional[GrievanceStatus]
    created_at: datetime


# Placement Schemas
class PlacementProfileUpdateRequest(BaseModel):
    skills: str
    resume_link: Optional[str] = None
    github_link: Optional[str] = None
    linkedin_link: Optional[str] = None
    preferred_roles: Optional[str] = None


class PlacementDriveResponse(BaseModel):
    id: int
    company_name: str
    job_role: str
    eligibility_criteria: str
    drive_date: date
    application_deadline: date
    salary_package: str
    preparation_resources: Optional[str]

    class Config:
        from_attributes = True


# Forum Schemas
class ForumPostCreateRequest(BaseModel):
    title: str
    content: str


class ForumCommentResponse(BaseModel):
    id: int
    author_name: str
    content: str
    created_at: datetime


class ForumPostResponse(BaseModel):
    id: int
    title: str
    content: str
    author_name: str
    created_at: datetime
    comments: List[ForumCommentResponse] = []


# Timetable Schema
class TimetableSlotResponse(BaseModel):
    id: int
    semester: int
    branch: str
    section: str
    period_number: int = 1
    subject_code: Optional[str] = "CS701"
    subject_name: str
    faculty_name: str
    day_of_week: str
    start_time: str
    end_time: str
    room_number: str

    class Config:
        from_attributes = True


# Academic Materials Schema
class AcademicMaterialResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    subject_code: str
    subject_name: str
    uploaded_by_name: str
    file_path: str
    material_type: MaterialType
    due_date: Optional[date]
    upload_date: date

    class Config:
        from_attributes = True
