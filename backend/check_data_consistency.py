from app.db.database import SessionLocal
from app.models.all_models import Student, Fee, Mark, Registration, Attendance, Semester, Subject

db = SessionLocal()
try:
    s = db.query(Student).filter(Student.full_name.ilike('%Vivek%')).first()
    print(f"Student: {s.full_name} (ID {s.id})")
    print(f"  Current Semester: {s.current_semester}")
    print(f"  Admission Year: {s.admission_year}")
    print(f"  College ID: {s.college_id}")
    print(f"  Branch: {s.branch}")
    print(f"  Section: {s.section}")
    print(f"  Email: {s.email}")

    fees = db.query(Fee).filter(Fee.student_id == s.id).all()
    print(f"\nFees ({len(fees)} records):")
    for f in fees:
        sem = db.query(Semester).filter(Semester.id == f.semester_id).first()
        sem_num = sem.semester_number if sem else f.semester_id
        acad = sem.academic_year if sem else "N/A"
        print(f"  Sem {sem_num} ({acad}): Total {f.total_fee}, Paid {f.amount_paid}, Status {f.payment_status.value}")

    regs = db.query(Registration).filter(Registration.student_id == s.id).all()
    print(f"\nRegistrations ({len(regs)} records):")
    for r in regs:
        sem = db.query(Semester).filter(Semester.id == r.semester_id).first()
        sem_num = sem.semester_number if sem else r.semester_id
        print(f"  Sem {sem_num} ({r.academic_year}): {r.status} - {r.registration_number}")

    marks = db.query(Mark).filter(Mark.student_id == s.id).all()
    print(f"\nMarks ({len(marks)} records):")
    for m in marks[:5]:
        sub = db.query(Subject).filter(Subject.id == m.subject_id).first()
        sub_code = sub.subject_code if sub else "N/A"
        print(f"  {sub_code}: {m.assessment_type.value} -> {m.marks}/{m.maximum_marks}")

    atts = db.query(Attendance).filter(Attendance.student_id == s.id).all()
    print(f"\nAttendance ({len(atts)} records)")
    sem_atts = {}
    for a in atts:
        sub = db.query(Subject).filter(Subject.id == a.subject_id).first()
        if sub:
            sem = db.query(Semester).filter(Semester.id == sub.semester_id).first()
            if sem:
                sem_atts[sem.semester_number] = sem_atts.get(sem.semester_number, 0) + 1
    print("  Attendance by semester:", sem_atts)

finally:
    db.close()
