from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.db.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.utils.enums import (
    UserRole, AttendanceStatus, NocStatus, AssessmentType,
    FeeStatus, LibraryStatus, GrievanceStatus, MaterialType
)
from app.models.all_models import (
    User, Student, Faculty, Semester, Subject, Enrollment,
    Attendance, Registration, NocApplication, Fee, Mark,
    LibraryRecord, Message, PlacementDrive, ForumPost,
    ForumComment, TimetableSlot, AcademicMaterial, Notice
)


def init_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding database with 7-period timetable & fresh sample data...")

        # 1. Users
        student_user = User(
            username="student",
            email="alex.student@college.edu",
            password_hash=get_password_hash("student123"),
            role=UserRole.STUDENT
        )
        faculty_user = User(
            username="faculty",
            email="dr.smith@college.edu",
            password_hash=get_password_hash("faculty123"),
            role=UserRole.FACULTY
        )
        admin_user = User(
            username="admin",
            email="admin@college.edu",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add_all([student_user, faculty_user, admin_user])
        db.commit()

        # Refresh users
        db.refresh(student_user)
        db.refresh(faculty_user)
        db.refresh(admin_user)

        # 2. Student Profile (Semester 7 for NOC eligibility)
        student_profile = Student(
            user_id=student_user.id,
            enrollment_number="2022CSE0101",
            full_name="Alex Johnson",
            email="alex.student@college.edu",
            phone="+1 555-0192",
            branch="Computer Science & Engineering",
            current_semester=7,
            admission_year=2022,
            section="A",
            date_of_birth=date(2003, 5, 14),
            cgpa=8.65,
            backlogs=0,
            skills="React, Python, FastAPI, PostgreSQL, Tailwind CSS, Docker",
            resume_link="https://drive.google.com/file/d/sample-resume",
            github_link="https://github.com/alex-johnson-dev",
            linkedin_link="https://linkedin.in/in/alex-johnson-dev",
            preferred_roles="Full Stack Engineer, Backend Developer, Data Engineer"
        )
        db.add(student_profile)

        # 3. Faculty Profile
        faculty_profile = Faculty(
            user_id=faculty_user.id,
            employee_id="FAC9901",
            full_name="Dr. Robert Smith",
            department="Computer Science & Engineering",
            designation="Professor & HOD",
            email="dr.smith@college.edu",
            phone="+1 555-8832"
        )
        db.add(faculty_profile)
        db.commit()
        db.refresh(student_profile)

        # 4. Semesters
        # 4. Semesters (Current Sem 7, Previous Sem 1 to 6)
        sem7 = Semester(semester_number=7, academic_year="2025-2026", start_date=date(2025, 8, 1), end_date=date(2025, 12, 20), is_current=True)
        sem6 = Semester(semester_number=6, academic_year="2024-2025", start_date=date(2025, 1, 10), end_date=date(2025, 5, 25), is_current=False)
        sem5 = Semester(semester_number=5, academic_year="2024-2025", start_date=date(2024, 8, 1), end_date=date(2024, 12, 20), is_current=False)
        sem4 = Semester(semester_number=4, academic_year="2023-2024", start_date=date(2024, 1, 10), end_date=date(2024, 5, 25), is_current=False)
        sem3 = Semester(semester_number=3, academic_year="2023-2024", start_date=date(2023, 8, 1), end_date=date(2023, 12, 20), is_current=False)
        sem2 = Semester(semester_number=2, academic_year="2022-2023", start_date=date(2023, 1, 10), end_date=date(2023, 5, 25), is_current=False)
        sem1 = Semester(semester_number=1, academic_year="2022-2023", start_date=date(2022, 8, 1), end_date=date(2022, 12, 20), is_current=False)

        db.add_all([sem7, sem6, sem5, sem4, sem3, sem2, sem1])
        db.commit()
        for sm in [sem7, sem6, sem5, sem4, sem3, sem2, sem1]:
            db.refresh(sm)

        # 5. Subjects (Sem 7 Current & Historical)
        sub1 = Subject(subject_code="BCS701", subject_name="ARTIFICIAL INTELLIGENCE", semester_id=sem7.id, branch="Computer Science", credits=4)
        sub2 = Subject(subject_code="BCS071", subject_name="CLOUD COMPUTING", semester_id=sem7.id, branch="Computer Science", credits=4)
        sub3 = Subject(subject_code="BOE070", subject_name="PROJECT MANAGEMENT", semester_id=sem7.id, branch="Computer Science", credits=3)
        sub4 = Subject(subject_code="CRT ENG", subject_name="CRT ENGLISH", semester_id=sem7.id, branch="Computer Science", credits=3)
        sub5 = Subject(subject_code="CRT LR", subject_name="CRT LOGICAL REASONING", semester_id=sem7.id, branch="Computer Science", credits=4)
        sub6 = Subject(subject_code="CRT QUA", subject_name="CRT QUANTS", semester_id=sem7.id, branch="Computer Science", credits=3)
        sub7 = Subject(subject_code="MT4", subject_name="MOCK TEST", semester_id=sem7.id, branch="Computer Science", credits=2)
        sub8 = Subject(subject_code="BCS751", subject_name="ARTIFICIAL INTELLIGENCE LAB", semester_id=sem7.id, branch="Computer Science", credits=2)

        # Sem 6 Subjects
        sem6_sub1 = Subject(subject_code="BCS601", subject_name="COMPILER DESIGN", semester_id=sem6.id, branch="Computer Science", credits=4)
        sem6_sub2 = Subject(subject_code="BCS602", subject_name="COMPUTER NETWORKS", semester_id=sem6.id, branch="Computer Science", credits=4)
        sem6_sub3 = Subject(subject_code="BCS603", subject_name="WEB TECHNOLOGY", semester_id=sem6.id, branch="Computer Science", credits=3)
        sem6_sub4 = Subject(subject_code="BCS651", subject_name="NETWORKS LAB", semester_id=sem6.id, branch="Computer Science", credits=2)

        # Sem 5 Subjects
        sem5_sub1 = Subject(subject_code="BCS501", subject_name="DATABASE MANAGEMENT SYSTEMS", semester_id=sem5.id, branch="Computer Science", credits=4)
        sem5_sub2 = Subject(subject_code="BCS502", subject_name="DESIGN & ANALYSIS OF ALGORITHMS", semester_id=sem5.id, branch="Computer Science", credits=4)

        db.add_all([sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sem6_sub1, sem6_sub2, sem6_sub3, sem6_sub4, sem5_sub1, sem5_sub2])
        db.commit()

        # 6. Enrollments
        all_subs = [sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sem6_sub1, sem6_sub2, sem6_sub3, sem6_sub4, sem5_sub1, sem5_sub2]
        for s in all_subs:
            db.add(Enrollment(student_id=student_profile.id, subject_id=s.id, semester_id=s.semester_id))
        db.commit()

        # 7. Attendance Records for Sem 7 (Matching exact subjects from screenshots)
        today = date.today()
        # Subject 1: BCS701 ARTIFICIAL INTELLIGENCE
        for i in range(14):
            d = date(2026, 7, 14) + timedelta(days=i * 3)
            db.add(Attendance(student_id=student_profile.id, subject_id=sub1.id, date=d, status=AttendanceStatus.ABSENT, class_number=2))

        # Subject 2: BCS071 CLOUD COMPUTING
        for i in range(9):
            d = date(2026, 7, 23) + timedelta(days=i * 4)
            st = AttendanceStatus.PRESENT if i == 0 else AttendanceStatus.ABSENT
            db.add(Attendance(student_id=student_profile.id, subject_id=sub2.id, date=d, status=st, class_number=1))

        # Subject 3: BOE070 PROJECT MANAGEMENT
        for i in range(19):
            d = date(2026, 7, 14) + timedelta(days=i * 2)
            db.add(Attendance(student_id=student_profile.id, subject_id=sub3.id, date=d, status=AttendanceStatus.ABSENT, class_number=1))

        # Subject 4: CRT ENG CRT ENGLISH
        for i in range(28):
            d = date(2026, 7, 15) + timedelta(days=i)
            st = AttendanceStatus.PRESENT if i == 5 else AttendanceStatus.ABSENT
            db.add(Attendance(student_id=student_profile.id, subject_id=sub4.id, date=d, status=st, class_number=4))

        # Subject 5: CRT LR CRT LOGICAL REASONING
        for i in range(41):
            d = date(2026, 7, 14) + timedelta(days=i)
            st = AttendanceStatus.PRESENT if i < 7 else AttendanceStatus.ABSENT
            cls_num = (i % 5) + 1
            db.add(Attendance(student_id=student_profile.id, subject_id=sub5.id, date=d, status=st, class_number=cls_num))

        # Subject 6: CRT QUA CRT QUANTS
        for i in range(7):
            d = date(2026, 7, 21) + timedelta(days=i * 3)
            db.add(Attendance(student_id=student_profile.id, subject_id=sub6.id, date=d, status=AttendanceStatus.ABSENT, class_number=6))

        # Subject 7: MT4 MOCK TEST
        for i in range(4):
            d = date(2026, 8, 7) + timedelta(days=i)
            db.add(Attendance(student_id=student_profile.id, subject_id=sub7.id, date=d, status=AttendanceStatus.ABSENT, class_number=3))

        # Subject 8: BCS751 ARTIFICIAL INTELLIGENCE LAB
        for i in range(6):
            d = date(2026, 7, 16) + timedelta(days=i * 2)
            db.add(Attendance(student_id=student_profile.id, subject_id=sub8.id, date=d, status=AttendanceStatus.ABSENT, class_number=1))

        # Sem 6 Attendance (Historical records)
        for i in range(30):
            d = date(2025, 2, 1) + timedelta(days=i)
            st = AttendanceStatus.PRESENT if i % 4 != 0 else AttendanceStatus.ABSENT
            db.add(Attendance(student_id=student_profile.id, subject_id=sem6_sub1.id, date=d, status=st, class_number=1))
            db.add(Attendance(student_id=student_profile.id, subject_id=sem6_sub2.id, date=d, status=st, class_number=2))

        # Sem 5 Attendance (Historical records)
        for i in range(35):
            d = date(2024, 9, 1) + timedelta(days=i)
            st = AttendanceStatus.PRESENT if i % 5 != 0 else AttendanceStatus.ABSENT
            db.add(Attendance(student_id=student_profile.id, subject_id=sem5_sub1.id, date=d, status=st, class_number=1))

        db.commit()

        # 8. Registration Records
        db.add(Registration(
            student_id=student_profile.id,
            semester_id=sem7.id,
            academic_year="2025-2026",
            registration_date=date(2025, 7, 25),
            status="APPROVED",
            registration_number="REG2025-SEM7-0101",
            remarks="Regular Semester Registration Complete"
        ))
        db.add(Registration(
            student_id=student_profile.id,
            semester_id=sem6.id,
            academic_year="2024-2025",
            registration_date=date(2025, 1, 5),
            status="APPROVED",
            registration_number="REG2025-SEM6-0101",
            remarks="Cleared all subjects in first attempt"
        ))
        db.commit()

        # 9. NOC Application (Approved sample)
        db.add(NocApplication(
            student_id=student_profile.id,
            application_type="Industrial Training / Internship NOC",
            reason="Requesting NOC for 6-month Software Engineering Internship at Microsoft India.",
            status=NocStatus.APPROVED,
            applied_at=datetime.utcnow() - timedelta(days=10),
            reviewed_at=datetime.utcnow() - timedelta(days=5),
            reviewer_id=faculty_user.id,
            remarks="Verified academic standing and CGPA > 8.0. NOC Approved."
        ))

        # 10. Fee Records
        db.add(Fee(
            student_id=student_profile.id,
            semester_id=sem7.id,
            total_fee=65000.0,
            amount_paid=65000.0,
            payment_date=date(2025, 7, 26),
            payment_status=FeeStatus.PAID,
            receipt_number="REC-2025-07-8891"
        ))
        db.add(Fee(
            student_id=student_profile.id,
            semester_id=sem6.id,
            total_fee=65000.0,
            amount_paid=65000.0,
            payment_date=date(2025, 1, 6),
            payment_status=FeeStatus.PAID,
            receipt_number="REC-2025-01-4412"
        ))
        db.commit()

        # 11. Sessional Marks
        db.add_all([
            Mark(student_id=student_profile.id, subject_id=sub1.id, assessment_type=AssessmentType.SESSIONAL_1, marks=27.5, maximum_marks=30.0, updated_by=faculty_user.id),
            Mark(student_id=student_profile.id, subject_id=sub1.id, assessment_type=AssessmentType.SESSIONAL_2, marks=28.0, maximum_marks=30.0, updated_by=faculty_user.id),
            Mark(student_id=student_profile.id, subject_id=sub2.id, assessment_type=AssessmentType.SESSIONAL_1, marks=24.0, maximum_marks=30.0, updated_by=faculty_user.id),
            Mark(student_id=student_profile.id, subject_id=sub3.id, assessment_type=AssessmentType.SESSIONAL_1, marks=26.5, maximum_marks=30.0, updated_by=faculty_user.id),
            Mark(student_id=student_profile.id, subject_id=sub5.id, assessment_type=AssessmentType.SESSIONAL_1, marks=29.0, maximum_marks=30.0, updated_by=faculty_user.id),
        ])

        # 12. Library Records
        db.add_all([
            LibraryRecord(student_id=student_profile.id, book_title="Designing Data-Intensive Applications", book_author="Martin Kleppmann", issue_date=today - timedelta(days=20), due_date=today - timedelta(days=5), return_date=None, fine_amount=25.0, status=LibraryStatus.OVERDUE),
            LibraryRecord(student_id=student_profile.id, book_title="Clean Code: A Handbook of Agile Software Craftsmanship", book_author="Robert C. Martin", issue_date=today - timedelta(days=40), due_date=today - timedelta(days=25), return_date=today - timedelta(days=24), fine_amount=0.0, status=LibraryStatus.RETURNED),
            LibraryRecord(student_id=student_profile.id, book_title="Pattern Recognition and Machine Learning", book_author="Christopher Bishop", issue_date=today - timedelta(days=5), due_date=today + timedelta(days=10), return_date=None, fine_amount=0.0, status=LibraryStatus.ISSUED),
        ])

        # 13. Messages / Grievance
        db.add_all([
            Message(sender_id=faculty_user.id, receiver_id=student_user.id, subject="Project Submission Reminder", content="Please submit your Distributed Systems lab assignment before Friday midnight.", is_read=False),
            Message(sender_id=student_user.id, receiver_id=admin_user.id, subject="Library Portal Access Issue", content="I noticed a slight mismatch in overdue fine calculation for my returned book.", is_read=True, is_grievance=True, grievance_status=GrievanceStatus.RESOLVED),
        ])

        # 14. Placement Drives
        db.add_all([
            PlacementDrive(
                company_name="Google India",
                job_role="Software Engineer (L3)",
                eligibility_criteria="CGPA >= 8.0, No active backlogs, B.Tech CSE / IT / ECE",
                drive_date=date(2025, 10, 15),
                application_deadline=date(2025, 9, 30),
                salary_package="₹ 32.0 LPA",
                preparation_resources="Focus on Data Structures, Algorithms, System Design, OS fundamentals."
            ),
            PlacementDrive(
                company_name="Microsoft",
                job_role="Software Development Engineer",
                eligibility_criteria="CGPA >= 7.5, B.Tech All Branches",
                drive_date=date(2025, 11, 2),
                application_deadline=date(2025, 10, 20),
                salary_package="₹ 28.5 LPA",
                preparation_resources="Leetcode Medium/Hard problems, OOP concepts, SQL queries."
            )
        ])

        # 15. Forum Posts & Comments
        p1 = ForumPost(title="Best resources for mastering System Design in 2026?", content="Hey everyone! Looking for recommendations on modern microservices and database sharding tutorials.", author_id=student_user.id)
        db.add(p1)
        db.commit()
        db.refresh(p1)
        db.add(ForumComment(post_id=p1.id, author_id=faculty_user.id, content="Check out 'Designing Data-Intensive Applications' available in the college library!"))

        # 16. Timetable Slots (7 Daily Class Periods)
        daily_schedule = [
            (1, "09:00 AM", "09:55 AM", "CS701", "Distributed Systems", "Dr. Robert Smith", "LH 101"),
            (2, "09:55 AM", "10:50 AM", "CS702", "Machine Learning", "Dr. Emily Davis", "LH 102"),
            (3, "11:05 AM", "12:00 PM", "CS703", "Cloud Computing", "Prof. Alan Turing", "LH 204"),
            (4, "12:00 PM", "12:55 PM", "CS704", "Cyber Security & Cryptography", "Dr. Sarah Connor", "LH 105"),
            (5, "01:30 PM", "02:25 PM", "CS705", "Full Stack Web Engineering", "Dr. Robert Smith", "Lab 3"),
            (6, "02:25 PM", "03:20 PM", "CS701", "Distributed Systems Lab", "Dr. Robert Smith", "Lab 3"),
            (7, "03:20 PM", "04:15 PM", "CS702", "Machine Learning Lab", "Dr. Emily Davis", "Computer Lab 1"),
        ]

        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        for day in days:
            for period_num, st, et, sub_code, sub_name, fac, room in daily_schedule:
                db.add(TimetableSlot(
                    semester=7,
                    branch="Computer Science & Engineering",
                    section="A",
                    period_number=period_num,
                    subject_code=sub_code,
                    subject_name=sub_name,
                    faculty_name=fac,
                    day_of_week=day,
                    start_time=st,
                    end_time=et,
                    room_number=room
                ))

        # 17. Academic Materials
        db.add_all([
            AcademicMaterial(title="Distributed Systems Lecture Notes 1-5", description="Covers RPC, Raft Consensus, and Paxos Overview", subject_code="CS701", subject_name="Distributed Systems", uploaded_by_name="Dr. Robert Smith", file_path="/uploads/cs701_lecture_1_5.pdf", material_type=MaterialType.NOTE, upload_date=date(2025, 8, 12)),
            AcademicMaterial(title="Machine Learning Assignment 1 — Regression & Classification", description="Implement Gradient Descent from scratch in Python", subject_code="CS702", subject_name="Machine Learning", uploaded_by_name="Dr. Emily Davis", file_path="/uploads/cs702_assignment1.pdf", material_type=MaterialType.ASSIGNMENT, due_date=date(2025, 9, 25), upload_date=date(2025, 9, 1))
        ])

        # 18. Official Notices
        db.add_all([
            Notice(title="Mid-Semester Exam Schedule Released", content="The Mid-Sem examination for 7th Semester CSE begins on Oct 10th, 2025.", category="EXAM", posted_by="Controller of Examinations", posted_date=date(2025, 9, 1)),
            Notice(title="Fee Payment Deadline Extension", content="Last date for 7th semester fee payment extended to Sept 15th without late fee.", category="ACADEMIC", posted_by="Accounts Office", posted_date=date(2025, 8, 28)),
            Notice(title="Google Placement Drive Announcement", content="Registration link for Google India SDE campus placement drive is now active.", category="PLACEMENT", posted_by="Placement Cell", posted_date=date(2025, 9, 3))
        ])

        db.commit()
        print("Successfully seeded database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
