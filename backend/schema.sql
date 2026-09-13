-- ============================================================
-- OurEdu College Portal — MySQL Schema
-- Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE college_portal;

-- ── Users and Departments ────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(100) NOT NULL UNIQUE,
  hod_id INT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid    VARCHAR(128) UNIQUE,
  email           VARCHAR(150) NOT NULL UNIQUE,
  name            VARCHAR(100) NOT NULL,
  role            ENUM('student','faculty','admin') NOT NULL,
  mobile          VARCHAR(20),
  roll_no         VARCHAR(30),
  branch          VARCHAR(100),
  department_id   INT NULL,
  profile_image   LONGTEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO departments (name) VALUES
  ('Computer Science'), ('Electronics'), ('Mechanical'), ('Civil'), ('Information Technology');

-- ── Students ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(15),
  department VARCHAR(60),
  roll_no    VARCHAR(20) UNIQUE,
  year       TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Faculty ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  phone       VARCHAR(15),
  department  VARCHAR(60),
  designation ENUM('Professor','Associate Professor','Assistant Professor','Lecturer') DEFAULT 'Lecturer',
  experience  TINYINT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Attendance ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date       DATE NOT NULL,
  subject    VARCHAR(100),
  status     ENUM('Present','Absent') NOT NULL,
  verification_photo LONGTEXT,
  marked_by  INT,                        -- faculty id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_att (student_id, date, subject),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Fees ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT NOT NULL,
  title       VARCHAR(100),
  description VARCHAR(200),
  amount      DECIMAL(10,2) NOT NULL,
  due_date    DATE,
  status      ENUM('Paid','Pending') DEFAULT 'Pending',
  payment_id  VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Payment Logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  payment_id VARCHAR(100) NOT NULL,
  order_id   VARCHAR(100),
  amount     DECIMAL(10,2),
  status     VARCHAR(30) DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Timetables, Marks, Assignments, Exams and Results ────
CREATE TABLE IF NOT EXISTS subjects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  department_id INT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timetables (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  subject       VARCHAR(100) NOT NULL,
  faculty_id    INT NULL,
  time_slot     VARCHAR(50) NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS marks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  marks      DECIMAL(6,2) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assignments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  faculty_id INT NULL,
  file       LONGTEXT,
  deadline   DATETIME NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exams (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  subject_id    INT NOT NULL,
  date          DATE NOT NULL,
  time          TIME NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS results (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  exam_id    INT NOT NULL,
  marks      DECIMAL(6,2) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  type       ENUM('bonafide','ID') NOT NULL,
  status     ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Seed Sample Students ──────────────────────────────────
INSERT IGNORE INTO students (name, email, phone, department, roll_no, year) VALUES
  ('Aditya Kumar',  'aditya@college.edu',  '9876543210', 'Computer Science', '21CS001', 3),
  ('Priya Sharma',  'priya@college.edu',   '9876543211', 'Electronics',      '21EC001', 3),
  ('Ravi Patel',    'ravi@college.edu',    '9876543212', 'Mechanical',       '21ME001', 3),
  ('Sneha Mehta',   'sneha@college.edu',   '9876543213', 'Civil',            '21CV001', 2),
  ('Kiran Nair',    'kiran@college.edu',   '9876543214', 'Computer Science', '22CS001', 2),
  ('Anjali Singh',   'anjali@college.edu',  '9876543215', 'Computer Science', '21CS006', 3),
  ('Mohit Gupta',    'mohit@college.edu',   '9876543216', 'Computer Science', '21CS007', 3),
  ('Divya Reddy',    'divya@college.edu',   '9876543217', 'Computer Science', '21CS008', 3);

-- ── Seed Sample Faculty ───────────────────────────────────
INSERT IGNORE INTO faculty (name, email, phone, department, designation, experience) VALUES
  ('Dr. Ramesh Kumar', 'ramesh@college.edu', '9876501001', 'Computer Science', 'Professor',           18),
  ('Dr. Sunita Joshi', 'sunita@college.edu', '9876501002', 'Electronics',      'Associate Professor', 12),
  ('Ms. Kavitha Rao',  'kavitha@college.edu','9876501004', 'Computer Science', 'Assistant Professor',  6);

-- ── Seed Sample Fees ─────────────────────────────────────
INSERT IGNORE INTO fees (student_id, title, description, amount, due_date, status) VALUES
  (1, 'Tuition Fee', 'Semester 5 2024-25', 45000.00, '2024-09-30', 'Pending'),
  (1, 'Hostel Fee',  'Oct–Dec 2024',       18000.00, '2024-09-15', 'Pending'),
  (1, 'Library Fee', 'Annual 2024-25',      1500.00, '2024-10-31', 'Paid'),
  (2, 'Tuition Fee', 'Semester 5 2024-25', 45000.00, '2024-09-30', 'Pending');
