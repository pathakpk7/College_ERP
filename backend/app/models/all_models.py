from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Date, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.utils.enums import (
    UserRole, AttendanceStatus, NocStatus, AssessmentType,
    FeeStatus, LibraryStatus, GrievanceStatus, MaterialType,
    BookCategory, BookOrderType, BookOrderStatus
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    enrollment_number = Column(String, unique=True, index=True, nullable=False)
    college_id = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    branch = Column(String, nullable=False)
    current_semester = Column(Integer, nullable=False)
    admission_year = Column(Integer, nullable=False)
    section = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    cgpa = Column(Float, default=0.0)
    backlogs = Column(Integer, default=0)
    skills = Column(Text, nullable=True)
    resume_link = Column(String, nullable=True)
    github_link = Column(String, nullable=True)
    linkedin_link = Column(String, nullable=True)
    preferred_roles = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    enrollments = relationship("Enrollment", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")
    registrations = relationship("Registration", back_populates="student")
    noc_applications = relationship("NocApplication", back_populates="student")
    fees = relationship("Fee", back_populates="student")
    marks = relationship("Mark", back_populates="student")
    library_records = relationship("LibraryRecord", back_populates="student")


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    user = relationship("User", back_populates="faculty_profile")


class Semester(Base):
    __tablename__ = "semesters"

    id = Column(Integer, primary_key=True, index=True)
    semester_number = Column(Integer, nullable=False)
    academic_year = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)

    subjects = relationship("Subject", back_populates="semester")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    subject_code = Column(String, unique=True, index=True, nullable=False)
    subject_name = Column(String, nullable=False)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False)
    branch = Column(String, nullable=False)
    credits = Column(Integer, default=3)

    semester = relationship("Semester", back_populates="subjects")
    enrollments = relationship("Enrollment", back_populates="subject")
    attendances = relationship("Attendance", back_populates="subject")
    marks = relationship("Mark", back_populates="subject")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False)

    student = relationship("Student", back_populates="enrollments")
    subject = relationship("Subject", back_populates="enrollments")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(SQLEnum(AttendanceStatus), default=AttendanceStatus.PRESENT, nullable=False)
    class_number = Column(Integer, default=1)
    edit_count = Column(Integer, default=0)

    student = relationship("Student", back_populates="attendances")
    subject = relationship("Subject", back_populates="attendances")


class AttendanceResetEvent(Base):
    __tablename__ = "attendance_reset_events"

    id = Column(Integer, primary_key=True, index=True)
    reset_type = Column(String, nullable=False)  # e.g., 'SESSIONAL_1', 'SESSIONAL_2', 'SEMESTER'
    effective_date = Column(Date, nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False)
    academic_year = Column(String, nullable=False)
    registration_date = Column(Date, default=date.today)
    status = Column(String, default="APPROVED")
    registration_number = Column(String, unique=True, nullable=False)
    remarks = Column(String, nullable=True)

    student = relationship("Student", back_populates="registrations")


class NocApplication(Base):
    __tablename__ = "noc_applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    application_type = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(SQLEnum(NocStatus), default=NocStatus.PENDING, nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    remarks = Column(Text, nullable=True)

    student = relationship("Student", back_populates="noc_applications")


class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False)
    total_fee = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)
    payment_date = Column(Date, nullable=True)
    payment_status = Column(SQLEnum(FeeStatus), default=FeeStatus.PENDING, nullable=False)
    receipt_number = Column(String, nullable=True)

    student = relationship("Student", back_populates="fees")


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    assessment_type = Column(SQLEnum(AssessmentType), nullable=False)
    marks = Column(Float, nullable=False)
    maximum_marks = Column(Float, default=30.0)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="marks")
    subject = relationship("Subject", back_populates="marks")


class LibraryRecord(Base):
    __tablename__ = "library_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    book_title = Column(String, nullable=False)
    book_author = Column(String, nullable=False)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    fine_amount = Column(Float, default=0.0)
    status = Column(SQLEnum(LibraryStatus), default=LibraryStatus.ISSUED, nullable=False)

    student = relationship("Student", back_populates="library_records")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    is_grievance = Column(Boolean, default=False)
    grievance_status = Column(SQLEnum(GrievanceStatus), default=GrievanceStatus.OPEN, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PlacementDrive(Base):
    __tablename__ = "placement_drives"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    job_role = Column(String, nullable=False)
    eligibility_criteria = Column(Text, nullable=False)
    drive_date = Column(Date, nullable=False)
    application_deadline = Column(Date, nullable=False)
    salary_package = Column(String, nullable=False)
    preparation_resources = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    comments = relationship("ForumComment", back_populates="post", cascade="all, delete-orphan")


class ForumComment(Base):
    __tablename__ = "forum_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("ForumPost", back_populates="comments")


class TimetableSlot(Base):
    __tablename__ = "timetable_slots"

    id = Column(Integer, primary_key=True, index=True)
    semester = Column(Integer, nullable=False)
    branch = Column(String, nullable=False)
    section = Column(String, nullable=False)
    period_number = Column(Integer, default=1)
    subject_code = Column(String, nullable=True)
    subject_name = Column(String, nullable=False)
    faculty_name = Column(String, nullable=False)
    day_of_week = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    room_number = Column(String, nullable=False)


class AcademicMaterial(Base):
    __tablename__ = "academic_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject_code = Column(String, nullable=False)
    subject_name = Column(String, nullable=False)
    uploaded_by_name = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    external_link = Column(String, nullable=True)
    material_type = Column(SQLEnum(MaterialType), default=MaterialType.NOTE, nullable=False)
    target_year = Column(Integer, nullable=True)  # 1, 2, 3, 4 (None = All years)
    semester_number = Column(Integer, nullable=True)  # 1 to 8 (None = All semesters)
    target_branch = Column(String, nullable=True)  # e.g., "Computer Science & Engineering" (None = All branches)
    target_section = Column(String, nullable=True)  # e.g., "A", "B" (None = All sections)
    due_date = Column(Date, nullable=True)
    upload_date = Column(Date, default=date.today)


class StoreBook(Base):
    __tablename__ = "store_books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    category = Column(SQLEnum(BookCategory), default=BookCategory.COMPUTER_SCIENCE, nullable=False)
    price = Column(Float, default=0.0, nullable=False)  # in INR (₹) for offline purchase
    borrow_fee = Column(Float, default=50.0, nullable=False)  # in INR (₹) for 1-month borrow
    rating = Column(Float, default=4.5)
    cover_image = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    publisher = Column(String, nullable=True)
    edition = Column(String, default="Latest Edition")
    stock_quantity = Column(Integer, default=10)
    is_available = Column(Boolean, default=True)
    expected_restock_date = Column(Date, nullable=True)  # e.g., date when out of stock will be replenished
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("StoreOrder", back_populates="book")



class StoreOrder(Base):
    __tablename__ = "store_orders"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("store_books.id"), nullable=False)
    order_type = Column(SQLEnum(BookOrderType), default=BookOrderType.BORROW, nullable=False)
    order_date = Column(Date, default=date.today)
    due_date = Column(Date, nullable=True)  # 6 months for borrow
    price_paid = Column(Float, default=0.0)
    status = Column(SQLEnum(BookOrderStatus), default=BookOrderStatus.APPROVED, nullable=False)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student")
    book = relationship("StoreBook", back_populates="orders")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="ACADEMIC")
    posted_by = Column(String, nullable=False)
    posted_date = Column(Date, default=date.today)

