-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    grade VARCHAR(20),
    subject VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Marks table
CREATE TABLE IF NOT EXISTS marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    test_type VARCHAR(20) NOT NULL CHECK (test_type IN ('quiz', 'exam', 'assignment', 'project')),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    max_score INTEGER NOT NULL DEFAULT 100,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);

-- Create Claims table
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mark_id INTEGER NOT NULL REFERENCES marks(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES users(id),
    review_comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- Create Bulletins table
CREATE TABLE IF NOT EXISTS bulletins (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    overall_average DECIMAL(5,2) DEFAULT 0,
    grade VARCHAR(2) DEFAULT 'F' CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    total_days INTEGER DEFAULT 0,
    present_days INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INTEGER NOT NULL REFERENCES users(id)
);

-- Create Bulletin Subjects table (for storing subject-wise data in bulletins)
CREATE TABLE IF NOT EXISTS bulletin_subjects (
    id SERIAL PRIMARY KEY,
    bulletin_id INTEGER NOT NULL REFERENCES bulletins(id) ON DELETE CASCADE,
    subject_name VARCHAR(50) NOT NULL,
    teacher_name VARCHAR(100) NOT NULL,
    average_score DECIMAL(5,2) DEFAULT 0
);

-- Create Bulletin Marks table (for storing individual marks in bulletins)
CREATE TABLE IF NOT EXISTS bulletin_marks (
    id SERIAL PRIMARY KEY,
    bulletin_subject_id INTEGER NOT NULL REFERENCES bulletin_subjects(id) ON DELETE CASCADE,
    test_type VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    date TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_teacher_id ON marks(teacher_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject ON marks(subject);
CREATE INDEX IF NOT EXISTS idx_claims_student_id ON claims(student_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_bulletins_student_id ON bulletins(student_id);
CREATE INDEX IF NOT EXISTS idx_bulletins_semester ON bulletins(semester);
