import random
from datetime import date, datetime, timedelta
from app.db.database import SessionLocal
from app.models.all_models import (
    User, Faculty, Subject, Semester, TimetableSlot, AcademicMaterial
)
from app.core.security import get_password_hash
from app.utils.enums import UserRole, MaterialType

def seed_faculty_and_admins():
    db = SessionLocal()
    try:
        print("Starting Faculty, Admin, Timetable, and Academic Material Seeding...")

        # 1. Administrators & Leadership
        admin_data = [
            {
                "username": "principal",
                "email": "principal@uit.ac.in",
                "full_name": "Prof. Sanjay Srivastava",
                "employee_id": "EMP001",
                "designation": "Principal & Director",
                "department": "Administration & Leadership",
                "phone": "+91 98765 43210",
                "role": UserRole.ADMIN,
                "password": "admin123"
            },
            {
                "username": "abhishek.malviya",
                "email": "dean.academic@uit.ac.in",
                "full_name": "Prof. Abhishek Malviya",
                "employee_id": "EMP002",
                "designation": "Dean of Academic Affairs",
                "department": "Office of Academic Affairs",
                "phone": "+91 98765 43211",
                "role": UserRole.ADMIN,
                "password": "admin123"
            },
            {
                "username": "manas.pandey",
                "email": "dsw@uit.ac.in",
                "full_name": "Prof. Manas Pandey",
                "employee_id": "EMP003",
                "designation": "Dean of Student Welfare",
                "department": "Student Affairs & Welfare",
                "phone": "+91 98765 43212",
                "role": UserRole.ADMIN,
                "password": "admin123"
            },
            {
                "username": "divya.bartaria",
                "email": "dean.corporate@uit.ac.in",
                "full_name": "Dr. Divya Bartaria",
                "employee_id": "EMP004",
                "designation": "Dean Corporate & Industry Relations",
                "department": "Training & Placement Cell",
                "phone": "+91 98765 43213",
                "role": UserRole.ADMIN,
                "password": "admin123"
            }
        ]

        # 2. HODs (Faculty)
        hod_data = [
            {
                "username": "prafull.pandey",
                "email": "hod.cse@uit.ac.in",
                "full_name": "Prof. Prafull Pandey",
                "employee_id": "EMP010",
                "designation": "Professor & HOD",
                "department": "Computer Science & Engineering",
                "phone": "+91 98765 43220",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "rohit.kumar",
                "email": "hod.it@uit.ac.in",
                "full_name": "Prof. Rohit",
                "employee_id": "EMP011",
                "designation": "Professor & HOD",
                "department": "Information Technology",
                "phone": "+91 98765 43221",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "man.singh",
                "email": "hod.civil@uit.ac.in",
                "full_name": "Prof. Man Singh",
                "employee_id": "EMP012",
                "designation": "Professor & HOD",
                "department": "Civil Engineering",
                "phone": "+91 98765 43222",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "rehan.haider",
                "email": "hod.me@uit.ac.in",
                "full_name": "Prof. Rehan Haider",
                "employee_id": "EMP013",
                "designation": "Professor & HOD",
                "department": "Mechanical Engineering",
                "phone": "+91 98765 43223",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "surya.prakash",
                "email": "hod.ece@uit.ac.in",
                "full_name": "Prof. Surya Prakash",
                "employee_id": "EMP014",
                "designation": "Professor & HOD",
                "department": "Electronics & Communication Engineering",
                "phone": "+91 98765 43224",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            }
        ]

        # 3. Departmental Faculty Members
        faculty_data = [
            {
                "username": "arjun.singh",
                "email": "arjun.singh@uit.ac.in",
                "full_name": "Arjun",
                "employee_id": "EMP020",
                "designation": "Associate Professor",
                "department": "Computer Science & Engineering",
                "phone": "+91 98765 43230",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "umesh.pandey",
                "email": "umesh.pandey@uit.ac.in",
                "full_name": "Dr. Umesh Kumar Pandey",
                "employee_id": "EMP021",
                "designation": "Professor",
                "department": "Applied Sciences & Mathematics",
                "phone": "+91 98765 43231",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "john.rizvi",
                "email": "john.rizvi@uit.ac.in",
                "full_name": "John Rizvi",
                "employee_id": "EMP022",
                "designation": "Associate Professor",
                "department": "Information Technology",
                "phone": "+91 98765 43232",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "shruti.sharma",
                "email": "shruti.sharma@uit.ac.in",
                "full_name": "Shruti Sharma",
                "employee_id": "EMP023",
                "designation": "Assistant Professor",
                "department": "Computer Science & Engineering",
                "phone": "+91 98765 43233",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "sonali.kumari",
                "email": "sonali.kumari@uit.ac.in",
                "full_name": "Sonali Kumari",
                "employee_id": "EMP024",
                "designation": "Assistant Professor",
                "department": "CSE (Artificial Intelligence & ML)",
                "phone": "+91 98765 43234",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "urvashi.raj",
                "email": "urvashi.raj@uit.ac.in",
                "full_name": "Urvashi Raj",
                "employee_id": "EMP025",
                "designation": "Assistant Professor",
                "department": "Computer Science & Engineering",
                "phone": "+91 98765 43235",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "umesh.singh",
                "email": "umesh.singh@uit.ac.in",
                "full_name": "Umesh Singh",
                "employee_id": "EMP026",
                "designation": "Assistant Professor",
                "department": "Civil Engineering",
                "phone": "+91 98765 43236",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "gaurav.narain",
                "email": "gaurav.narain@uit.ac.in",
                "full_name": "Gaurav Narain",
                "employee_id": "EMP027",
                "designation": "Assistant Professor",
                "department": "Mechanical Engineering",
                "phone": "+91 98765 43237",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "dhananjay.singh",
                "email": "dhananjay.singh@uit.ac.in",
                "full_name": "Dhananjay Singh",
                "employee_id": "EMP028",
                "designation": "Assistant Professor",
                "department": "Electronics & Communication Engineering",
                "phone": "+91 98765 43238",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "param.goel",
                "email": "param.goel@uit.ac.in",
                "full_name": "Param Goel",
                "employee_id": "EMP029",
                "designation": "Assistant Professor",
                "department": "Computer Science & Engineering",
                "phone": "+91 98765 43239",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "anubhav.asthana",
                "email": "anubhav.asthana@uit.ac.in",
                "full_name": "Anubhav Asthana",
                "employee_id": "EMP030",
                "designation": "Assistant Professor",
                "department": "Information Technology",
                "phone": "+91 98765 43240",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "rajesh.sharma",
                "email": "rajesh.sharma@uit.ac.in",
                "full_name": "Dr. Rajesh Sharma",
                "employee_id": "EMP031",
                "designation": "Professor",
                "department": "Computer Science & Engineering",
                "phone": "+91 98765 43241",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "neha.gupta",
                "email": "neha.gupta@uit.ac.in",
                "full_name": "Dr. Neha Gupta",
                "employee_id": "EMP032",
                "designation": "Associate Professor",
                "department": "CSE (Artificial Intelligence & ML)",
                "phone": "+91 98765 43242",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "vikas.tripathi",
                "email": "vikas.tripathi@uit.ac.in",
                "full_name": "Er. Vikas Tripathi",
                "employee_id": "EMP033",
                "designation": "Assistant Professor",
                "department": "Electronics & Communication Engineering",
                "phone": "+91 98765 43243",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "rk.mishra",
                "email": "rk.mishra@uit.ac.in",
                "full_name": "Dr. R. K. Mishra",
                "employee_id": "EMP034",
                "designation": "Professor",
                "department": "Mechanical Engineering",
                "phone": "+91 98765 43244",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "amit.verma",
                "email": "amit.verma@uit.ac.in",
                "full_name": "Er. Amit Verma",
                "employee_id": "EMP035",
                "designation": "Assistant Professor",
                "department": "Civil Engineering",
                "phone": "+91 98765 43245",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            },
            {
                "username": "pooja.saxena",
                "email": "pooja.saxena@uit.ac.in",
                "full_name": "Dr. Pooja Saxena",
                "employee_id": "EMP036",
                "designation": "Associate Professor",
                "department": "Applied Sciences & Mathematics",
                "phone": "+91 98765 43246",
                "role": UserRole.FACULTY,
                "password": "faculty123"
            }
        ]

        all_staff = admin_data + hod_data + faculty_data

        # Upsert Users and Faculty profiles
        for staff in all_staff:
            user = db.query(User).filter(
                (User.username == staff["username"]) | (User.email == staff["email"])
            ).first()

            if not user:
                user = User(
                    username=staff["username"],
                    email=staff["email"],
                    password_hash=get_password_hash(staff["password"]),
                    role=staff["role"],
                    is_active=True
                )
                db.add(user)
                db.flush()
                print(f"Created User: {staff['username']} ({staff['role']})")
            else:
                user.role = staff["role"]
                user.password_hash = get_password_hash(staff["password"])
                db.flush()

            faculty = db.query(Faculty).filter(
                (Faculty.user_id == user.id) | (Faculty.employee_id == staff["employee_id"])
            ).first()

            if not faculty:
                faculty = Faculty(
                    user_id=user.id,
                    employee_id=staff["employee_id"],
                    full_name=staff["full_name"],
                    department=staff["department"],
                    designation=staff["designation"],
                    email=staff["email"],
                    phone=staff["phone"]
                )
                db.add(faculty)
                print(f"Created Faculty profile: {staff['full_name']} [{staff['employee_id']}]")
            else:
                faculty.user_id = user.id
                faculty.full_name = staff["full_name"]
                faculty.department = staff["department"]
                faculty.designation = staff["designation"]
                faculty.email = staff["email"]
                faculty.phone = staff["phone"]
                faculty.employee_id = staff["employee_id"]

        db.commit()
        print("Faculty & Admin Profiles committed successfully.")

        # Update generic default accounts if present
        default_faculty_user = db.query(User).filter(User.username == "faculty").first()
        if default_faculty_user:
            default_faculty_user.password_hash = get_password_hash("faculty123")
            fac_p = db.query(Faculty).filter(Faculty.user_id == default_faculty_user.id).first()
            if not fac_p:
                db.add(Faculty(
                    user_id=default_faculty_user.id,
                    employee_id="FAC001",
                    full_name="Prof. Prafull Pandey",
                    department="Computer Science & Engineering",
                    designation="Professor & HOD",
                    email="faculty@uit.ac.in",
                    phone="+91 98765 43220"
                ))

        default_admin_user = db.query(User).filter(User.username == "admin").first()
        if default_admin_user:
            default_admin_user.password_hash = get_password_hash("admin123")
            fac_a = db.query(Faculty).filter(Faculty.user_id == default_admin_user.id).first()
            if not fac_a:
                db.add(Faculty(
                    user_id=default_admin_user.id,
                    employee_id="ADM001",
                    full_name="Prof. Sanjay Srivastava",
                    department="Administration & Leadership",
                    designation="Principal & Director",
                    email="admin@uit.ac.in",
                    phone="+91 98765 43210"
                ))
        db.commit()

        # 4. Populate Full Timetable Matrix
        print("\nPopulating Timetable Slots for all Branches, Semesters & Sections...")
        db.query(TimetableSlot).delete()
        db.commit()

        branches = [
            "Computer Science & Engineering",
            "Information Technology",
            "Electronics & Communication Engineering",
            "Mechanical Engineering",
            "Civil Engineering",
            "CSE (Artificial Intelligence & ML)"
        ]

        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        periods = [
            (1, "09:00 AM", "09:50 AM"),
            (2, "09:50 AM", "10:40 AM"),
            (3, "10:50 AM", "11:40 AM"),
            (4, "11:40 AM", "12:30 PM"),
            (5, "01:15 PM", "02:05 PM"),
            (6, "02:05 PM", "02:55 PM"),
            (7, "03:00 PM", "03:50 PM"),
            (8, "03:50 PM", "04:40 PM"),
        ]

        dept_faculty_map = {
            "Computer Science & Engineering": [
                "Prof. Prafull Pandey", "Arjun", "Shruti Sharma", "Urvashi Raj", "Param Goel", "Dr. Rajesh Sharma"
            ],
            "Information Technology": [
                "Prof. Rohit", "John Rizvi", "Anubhav Asthana"
            ],
            "CSE (Artificial Intelligence & ML)": [
                "Sonali Kumari", "Dr. Neha Gupta", "Param Goel", "Prof. Prafull Pandey"
            ],
            "Electronics & Communication Engineering": [
                "Prof. Surya Prakash", "Dhananjay Singh", "Er. Vikas Tripathi"
            ],
            "Mechanical Engineering": [
                "Prof. Rehan Haider", "Gaurav Narain", "Dr. R. K. Mishra"
            ],
            "Civil Engineering": [
                "Prof. Man Singh", "Umesh Singh", "Er. Amit Verma"
            ],
            "Applied Sciences": [
                "Dr. Umesh Kumar Pandey", "Dr. Pooja Saxena"
            ]
        }

        room_map = {
            "Computer Science & Engineering": ["LT-101", "LT-102", "CS-Lab 1", "CS-Lab 2", "CS-Lab 3"],
            "Information Technology": ["LT-201", "LT-202", "IT-Lab 1", "IT-Lab 2"],
            "CSE (Artificial Intelligence & ML)": ["LT-103", "AI-GPU Lab", "DS-Lab 1"],
            "Electronics & Communication Engineering": ["LT-301", "VLSI-Lab", "Embedded-Lab", "DSP-Lab"],
            "Mechanical Engineering": ["LT-401", "CAD/CAM Lab", "Thermal-Lab", "Central Workshop"],
            "Civil Engineering": ["LT-501", "Survey-Lab", "Structure-Lab", "Geotech-Lab"]
        }

        slots_to_create = []

        for branch in branches:
            branch_subjects = db.query(Subject).filter(Subject.branch == branch).all()
            if not branch_subjects:
                branch_subjects = db.query(Subject).all()

            for sem_num in range(1, 9):
                sem = db.query(Semester).filter(Semester.semester_number == sem_num).first()
                sem_subjects = [s for s in branch_subjects if (sem and s.semester_id == sem.id)]
                if not sem_subjects:
                    sem_subjects = branch_subjects[:6] if branch_subjects else []

                if not sem_subjects:
                    continue

                for section in ["A", "B", "C"]:
                    avail_faculty = list(dept_faculty_map.get(branch, ["Prof. Prafull Pandey", "Arjun"]))
                    if sem_num in [1, 2]:
                        avail_faculty.extend(dept_faculty_map.get("Applied Sciences", []))

                    avail_rooms = room_map.get(branch, ["LT-101", "LT-102", "Lab-1"])

                    for day in days_of_week:
                        for period_num, start_t, end_t in periods:
                            subj = sem_subjects[(period_num + days_of_week.index(day)) % len(sem_subjects)]
                            assigned_faculty = avail_faculty[(period_num + days_of_week.index(day)) % len(avail_faculty)]
                            room = avail_rooms[(period_num + days_of_week.index(day)) % len(avail_rooms)]

                            slot = TimetableSlot(
                                semester=sem_num,
                                branch=branch,
                                section=section,
                                period_number=period_num,
                                subject_code=subj.subject_code,
                                subject_name=subj.subject_name,
                                faculty_name=assigned_faculty,
                                day_of_week=day,
                                start_time=start_t,
                                end_time=end_t,
                                room_number=room
                            )
                            slots_to_create.append(slot)

        db.bulk_save_objects(slots_to_create)
        db.commit()
        print(f"Created {len(slots_to_create)} Timetable Slots across all branches, semesters, and sections.")

        # 5. Populate Academic Materials
        print("\nPopulating Academic Materials...")
        db.query(AcademicMaterial).delete()
        db.commit()

        sample_materials = [
            {
                "title": "Unit 1: Advanced Graph Algorithms & Flow Networks",
                "description": "Comprehensive lecture notes, proofs for Ford-Fulkerson, Edmonds-Karp, and dynamic programming on trees.",
                "subject_code": "CS701",
                "subject_name": "Design & Analysis of Algorithms",
                "uploaded_by_name": "Prof. Prafull Pandey",
                "file_path": "/uploads/materials/CS701_Unit1_Graph_Algorithms.pdf",
                "external_link": "https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/",
                "material_type": MaterialType.NOTE,
                "target_year": 4,
                "semester_number": 7,
                "target_branch": "Computer Science & Engineering",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=12)
            },
            {
                "title": "Assignment 2: Cloud Native Microservices Architecture & Docker",
                "description": "Implement a 3-tier containerized service using Docker Compose, Envoy reverse proxy, and Redis caching.",
                "subject_code": "CS702",
                "subject_name": "Cloud Computing & DevOps",
                "uploaded_by_name": "Arjun",
                "file_path": "/uploads/materials/CS702_Assignment_2_DevOps.pdf",
                "external_link": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
                "material_type": MaterialType.ASSIGNMENT,
                "target_year": 4,
                "semester_number": 7,
                "target_branch": "Computer Science & Engineering",
                "target_section": None,
                "due_date": date.today() + timedelta(days=10),
                "upload_date": date.today() - timedelta(days=5)
            },
            {
                "title": "AKTU Previous 5 Years Solved Question Papers (2019-2024)",
                "description": "Complete compilation of university exam questions with step-by-step marking scheme answers.",
                "subject_code": "CS701",
                "subject_name": "Design & Analysis of Algorithms",
                "uploaded_by_name": "Shruti Sharma",
                "file_path": "/uploads/materials/CS701_AKTU_PYQ_Solved_2019_2024.pdf",
                "external_link": None,
                "material_type": MaterialType.PYQ,
                "target_year": 4,
                "semester_number": 7,
                "target_branch": "Computer Science & Engineering",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=20)
            },
            {
                "title": "Deep Learning: Convolutional & Recurrent Neural Networks (CNN/RNN)",
                "description": "Lecture slides, PyTorch implementation notebooks, and backpropagation mathematical derivations.",
                "subject_code": "AI601",
                "subject_name": "Deep Learning & Neural Networks",
                "uploaded_by_name": "Sonali Kumari",
                "file_path": "/uploads/materials/AI601_Deep_Learning_Notes.pdf",
                "external_link": "https://cs231n.stanford.edu/",
                "material_type": MaterialType.NOTE,
                "target_year": 3,
                "semester_number": 6,
                "target_branch": "CSE (Artificial Intelligence & ML)",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=8)
            },
            {
                "title": "Engineering Mathematics III: Fourier Series & Complex Variables",
                "description": "Standard textbook solutions, solved example sheets, and Cauchy-Riemann equations practice bank.",
                "subject_code": "BAS301",
                "subject_name": "Engineering Mathematics III",
                "uploaded_by_name": "Dr. Umesh Kumar Pandey",
                "file_path": "/uploads/materials/BAS301_Fourier_Complex_Variables.pdf",
                "external_link": None,
                "material_type": MaterialType.NOTE,
                "target_year": 2,
                "semester_number": 3,
                "target_branch": None,
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=15)
            },
            {
                "title": "Web Security & Penetration Testing Guidelines",
                "description": "OWASP Top 10 vulnerabilities, SQL injection prevention, XSS mitigation, and JWT security best practices.",
                "subject_code": "IT602",
                "subject_name": "Information & Network Security",
                "uploaded_by_name": "John Rizvi",
                "file_path": "/uploads/materials/IT602_Web_Security_OWASP.pdf",
                "external_link": "https://owasp.org/www-project-top-ten/",
                "material_type": MaterialType.NOTE,
                "target_year": 3,
                "semester_number": 6,
                "target_branch": "Information Technology",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=18)
            },
            {
                "title": "Digital Signal Processing Lab Manual & MATLAB Codes",
                "description": "FFT implementations, FIR/IIR Butterworth filter design scripts, and frequency response analysis.",
                "subject_code": "EC551",
                "subject_name": "Digital Signal Processing Lab",
                "uploaded_by_name": "Prof. Surya Prakash",
                "file_path": "/uploads/materials/EC551_DSP_Lab_Manual.pdf",
                "external_link": None,
                "material_type": MaterialType.NOTE,
                "target_year": 3,
                "semester_number": 5,
                "target_branch": "Electronics & Communication Engineering",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=25)
            },
            {
                "title": "Fluid Mechanics & Turbo-Machinery Formula Cheat Sheet",
                "description": "Bernoulli equation derivations, Navier-Stokes simplified forms, boundary layer theory summary.",
                "subject_code": "ME401",
                "subject_name": "Fluid Mechanics",
                "uploaded_by_name": "Prof. Rehan Haider",
                "file_path": "/uploads/materials/ME401_Fluid_Mechanics_Formulas.pdf",
                "external_link": None,
                "material_type": MaterialType.NOTE,
                "target_year": 2,
                "semester_number": 4,
                "target_branch": "Mechanical Engineering",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=30)
            },
            {
                "title": "Structural Analysis & Reinforced Concrete Design (IS 456:2000)",
                "description": "Limit state method design problems for singly/doubly reinforced beams and cantilever slabs.",
                "subject_code": "CE501",
                "subject_name": "Design of Concrete Structures",
                "uploaded_by_name": "Prof. Man Singh",
                "file_path": "/uploads/materials/CE501_RCC_Design_IS456.pdf",
                "external_link": None,
                "material_type": MaterialType.NOTE,
                "target_year": 3,
                "semester_number": 5,
                "target_branch": "Civil Engineering",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=22)
            },
            {
                "title": "ICPC & LeetCode Hard Contest Preparation Guide",
                "description": "Segment Trees with Lazy Propagation, Trie Data Structures, Fenwick Trees, and Bitmask DP templates.",
                "subject_code": "CS705",
                "subject_name": "Competitive Programming & Problem Solving",
                "uploaded_by_name": "Param Goel",
                "file_path": "/uploads/materials/CS705_Competitive_Programming_Guide.pdf",
                "external_link": "https://cp-algorithms.com/",
                "material_type": MaterialType.CONTEST_PREP,
                "target_year": None,
                "semester_number": None,
                "target_branch": None,
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=7)
            },
            {
                "title": "Operating Systems: Concurrency, Deadlocks & Virtual Memory",
                "description": "Banker's Algorithm, Semaphore synchronization primitives, Page replacement algorithms with examples.",
                "subject_code": "BCS401",
                "subject_name": "Operating Systems",
                "uploaded_by_name": "Urvashi Raj",
                "file_path": "/uploads/materials/BCS401_OS_Virtual_Memory.pdf",
                "external_link": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
                "material_type": MaterialType.NOTE,
                "target_year": 2,
                "semester_number": 4,
                "target_branch": "Computer Science & Engineering",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=14)
            },
            {
                "title": "Full Stack Web Development with React, Node.js & PostgreSQL",
                "description": "REST API design standards, state management with Redux/Zustand, Tailwind CSS responsive layouts.",
                "subject_code": "IT501",
                "subject_name": "Web Technologies",
                "uploaded_by_name": "Anubhav Asthana",
                "file_path": "/uploads/materials/IT501_FullStack_React_Node.pdf",
                "external_link": "https://fullstackopen.com/en/",
                "material_type": MaterialType.NOTE,
                "target_year": 3,
                "semester_number": 5,
                "target_branch": "Information Technology",
                "target_section": None,
                "due_date": None,
                "upload_date": date.today() - timedelta(days=9)
            }
        ]

        for m_data in sample_materials:
            mat = AcademicMaterial(**m_data)
            db.add(mat)

        db.commit()
        print(f"Populated {len(sample_materials)} Academic Materials successfully.")
        print("\nAll Faculty, Admins, Timetables, and Academic Materials seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_faculty_and_admins()
