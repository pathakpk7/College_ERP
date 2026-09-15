-- College ERP System PostgreSQL Database Schema

CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'ADMIN');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED');
CREATE TYPE noc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE assessment_type AS ENUM ('SESSIONAL_1', 'SESSIONAL_2', 'MARKUP_1', 'MARKUP_2');
CREATE TYPE fee_status AS ENUM ('PAID', 'PARTIAL', 'PENDING', 'OVERDUE');
CREATE TYPE library_status AS ENUM ('ISSUED', 'RETURNED', 'OVERDUE');
CREATE TYPE grievance_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE material_type AS ENUM ('NOTE', 'ASSIGNMENT');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    branch VARCHAR(100) NOT NULL,
    current_semester INT NOT NULL,
    admission_year INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    date_of_birth DATE,
    cgpa NUMERIC(3,2) DEFAULT 0.0,
    backlogs INT DEFAULT 0,
    skills TEXT,
    resume_link VARCHAR(255),
    github_link VARCHAR(255),
    linkedin_link VARCHAR(255),
    preferred_roles VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Table
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20)
);

-- Semesters Table
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    semester_number INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE
);

-- Subjects Table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    semester_id INT NOT NULL REFERENCES semesters(id),
    branch VARCHAR(100) NOT NULL,
    credits INT DEFAULT 3
);

-- Enrollments Table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    subject_id INT NOT NULL REFERENCES subjects(id),
    semester_id INT NOT NULL REFERENCES semesters(id)
);

-- Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    subject_id INT NOT NULL REFERENCES subjects(id),
    date DATE NOT NULL,
    status attendance_status DEFAULT 'PRESENT',
    class_number INT DEFAULT 1
);

-- Registrations Table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    semester_id INT NOT NULL REFERENCES semesters(id),
    academic_year VARCHAR(20) NOT NULL,
    registration_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'APPROVED',
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    remarks VARCHAR(255)
);

-- NOC Applications Table
CREATE TABLE noc_applications (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    application_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    status noc_status DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_id INT REFERENCES users(id),
    remarks TEXT
);

-- Fees Table
CREATE TABLE fees (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    semester_id INT NOT NULL REFERENCES semesters(id),
    total_fee NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) DEFAULT 0.0,
    payment_date DATE,
    payment_status fee_status DEFAULT 'PENDING',
    receipt_number VARCHAR(50)
);

-- Marks Table
CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    subject_id INT NOT NULL REFERENCES subjects(id),
    assessment_type assessment_type NOT NULL,
    marks NUMERIC(5,2) NOT NULL,
    maximum_marks NUMERIC(5,2) DEFAULT 30.0,
    updated_by INT REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Library Records Table
CREATE TABLE library_records (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    book_title VARCHAR(255) NOT NULL,
    book_author VARCHAR(150) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount NUMERIC(8,2) DEFAULT 0.0,
    status library_status DEFAULT 'ISSUED'
);

-- Messages Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_grievance BOOLEAN DEFAULT FALSE,
    grievance_status grievance_status DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Placement Drives Table
CREATE TABLE placement_drives (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    job_role VARCHAR(150) NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    drive_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    salary_package VARCHAR(50) NOT NULL,
    preparation_resources TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Forum Posts & Comments
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id INT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable Table
CREATE TABLE timetable_slots (
    id SERIAL PRIMARY KEY,
    semester INT NOT NULL,
    branch VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    room_number VARCHAR(20) NOT NULL
);

-- Academic Materials Table
CREATE TABLE academic_materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    uploaded_by_name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    material_type material_type DEFAULT 'NOTE',
    due_date DATE,
    upload_date DATE DEFAULT CURRENT_DATE
);
