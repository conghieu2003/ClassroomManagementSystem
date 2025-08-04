USE master;
IF EXISTS(SELECT * FROM sys.databases WHERE name = 'ClassroomManagement')
BEGIN
    DROP DATABASE ClassroomManagement;
END
GO

CREATE DATABASE ClassroomManagement;
GO
USE [ClassroomManagement];

-- Bảng Account (Tài khoản)
CREATE TABLE [Account] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2
);

-- Bảng User (Người dùng)
CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    accountId INT UNIQUE NOT NULL,
    fullName NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    phone NVARCHAR(20),
    address NVARCHAR(255),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2,
    FOREIGN KEY (accountId) REFERENCES Account(id)
);

-- Bảng Teacher (Giáo viên)
CREATE TABLE [Teacher] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    teacherCode NVARCHAR(20) UNIQUE NOT NULL,
    department NVARCHAR(100),
    FOREIGN KEY (userId) REFERENCES [User](id)
);

-- Bảng Student (Sinh viên)
CREATE TABLE [Student] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    studentCode NVARCHAR(20) UNIQUE NOT NULL,
    major NVARCHAR(100),
    FOREIGN KEY (userId) REFERENCES [User](id)
);

-- Bảng Subject (Môn học)
CREATE TABLE [Subject] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(20) UNIQUE NOT NULL,
    name NVARCHAR(100) NOT NULL,
    credits INT NOT NULL,
    description NVARCHAR(500)
);

-- Bảng Class (Lớp học)
CREATE TABLE [Class] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(20) UNIQUE NOT NULL,
    subjectId INT NOT NULL,
    teacherId INT NOT NULL,
    semester NVARCHAR(20) NOT NULL,
    academicYear NVARCHAR(20) NOT NULL,
    maxStudents INT NOT NULL,
    FOREIGN KEY (subjectId) REFERENCES Subject(id),
    FOREIGN KEY (teacherId) REFERENCES Teacher(id)
);

-- Bảng ClassRegistration (Đăng ký lớp)
CREATE TABLE [ClassRegistration] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL,
    studentId INT NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2,
    FOREIGN KEY (classId) REFERENCES Class(id),
    FOREIGN KEY (studentId) REFERENCES Student(id)
);

-- Bảng ClassRoom (Phòng học)
CREATE TABLE [ClassRoom] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(20) UNIQUE NOT NULL,
    name NVARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    building NVARCHAR(100) NOT NULL,
    floor INT NOT NULL,
    type NVARCHAR(50) NOT NULL,
    description NVARCHAR(500)
);

-- Bảng Schedule (Lịch học)
CREATE TABLE [Schedule] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL,
    classRoomId INT NOT NULL,
    teacherId INT NOT NULL,
    dayOfWeek INT NOT NULL CHECK (dayOfWeek BETWEEN 1 AND 7),
    startTime DATETIME2 NOT NULL,
    endTime DATETIME2 NOT NULL,
    FOREIGN KEY (classId) REFERENCES Class(id),
    FOREIGN KEY (classRoomId) REFERENCES ClassRoom(id),
    FOREIGN KEY (teacherId) REFERENCES Teacher(id)
);

-- Bảng RoomRequest (Yêu cầu đặt phòng)
CREATE TABLE [RoomRequest] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classRoomId INT NOT NULL,
    requesterId INT NOT NULL,
    purpose NVARCHAR(255) NOT NULL,
    startTime DATETIME2 NOT NULL,
    endTime DATETIME2 NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2,
    FOREIGN KEY (classRoomId) REFERENCES ClassRoom(id)
);

-- Tạo indexes
CREATE INDEX idx_account_username ON Account(username);
CREATE INDEX idx_user_email ON [User](email);
CREATE INDEX idx_teacher_code ON Teacher(teacherCode);
CREATE INDEX idx_student_code ON Student(studentCode);
CREATE INDEX idx_class_code ON Class(code);
CREATE INDEX idx_classroom_code ON ClassRoom(code);
CREATE INDEX idx_schedule_datetime ON Schedule(startTime, endTime);
CREATE INDEX idx_roomrequest_datetime ON RoomRequest(startTime, endTime);

-- Dữ liệu mẫu
INSERT INTO Account (username, password, role, isActive) VALUES 
('admin', '$2b$10$dVuGFg5OGO9NFZ/h8yFJXO', 'admin', 1),
('teacher1', '$2b$10$dVuGFg5OGO9NFZ/h8yFJXO', 'teacher', 1),
('student1', '$2b$10$dVuGFg5OGO9NFZ/h8yFJXO', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone) VALUES 
(1, N'Admin User', 'admin@example.com', '0123456789'),
(2, N'Teacher One', 'teacher1@example.com', '0123456788'),
(3, N'Student One', 'student1@example.com', '0123456787');

INSERT INTO Teacher (userId, teacherCode, department) VALUES 
(2, 'TCH001', N'Công nghệ thông tin');

INSERT INTO Student (userId, studentCode, major) VALUES 
(3, 'STU001', N'Công nghệ thông tin');

INSERT INTO ClassRoom (code, name, capacity, building, floor, type) VALUES 
('R001', N'Phòng 101', 40, N'A', 1, 'theory'),
('R002', N'Phòng Lab 1', 30, N'B', 2, 'lab');

INSERT INTO Subject (code, name, credits, description) VALUES 
('COMP101', N'Lập trình cơ bản', 3, N'Môn học nhập môn về lập trình'),
('COMP102', N'Cơ sở dữ liệu', 3, N'Môn học về database'); 