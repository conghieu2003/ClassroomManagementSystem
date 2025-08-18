USE master;
IF EXISTS(SELECT * FROM sys.databases WHERE name = 'ClassroomManagement')
BEGIN
    DROP DATABASE ClassroomManagement;
END
GO

CREATE DATABASE ClassroomManagement;
GO

USE ClassroomManagement;
GO

-- Tạo bảng Account
CREATE TABLE Account (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL, -- 'admin', 'teacher', 'student'
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Tạo bảng User
CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    accountId INT UNIQUE NOT NULL,
    fullName NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    phone NVARCHAR(20),
    address NVARCHAR(255),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (accountId) REFERENCES Account(id) ON DELETE CASCADE
);

-- Tạo bảng Teacher
CREATE TABLE Teacher (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    teacherCode NVARCHAR(50) UNIQUE NOT NULL,
    department NVARCHAR(255),
    FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE
);

-- Tạo bảng Student
CREATE TABLE Student (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    studentCode NVARCHAR(50) UNIQUE NOT NULL,
    major NVARCHAR(255),
    FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE
);

-- Tạo bảng Class (đã loại bỏ liên kết với Subject và thêm thông tin môn học trực tiếp)
CREATE TABLE Class (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    className NVARCHAR(255) NOT NULL,
    subjectName NVARCHAR(255) NOT NULL,
    subjectCode NVARCHAR(50) NOT NULL,
    credits INT NOT NULL,
    teacherId INT NOT NULL,
    semester NVARCHAR(50) NOT NULL,
    academicYear NVARCHAR(50) NOT NULL,
    maxStudents INT NOT NULL,
    totalWeeks INT NOT NULL, -- Tổng số tuần học
    startDate DATE NOT NULL, -- Ngày bắt đầu khóa học
    endDate DATE NOT NULL, -- Ngày kết thúc khóa học
    description NVARCHAR(MAX),
    FOREIGN KEY (teacherId) REFERENCES Teacher(id)
);

-- Tạo bảng ClassType để phân biệt lớp lý thuyết và thực hành
CREATE TABLE ClassType (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL, -- Liên kết với lớp chính
    type NVARCHAR(50) NOT NULL, -- 'theory' (lý thuyết) hoặc 'practice' (thực hành)
    maxStudents INT NOT NULL, -- Số lượng sinh viên tối đa
    groupNumber INT, -- Số nhóm thực hành (null nếu là lý thuyết)
    FOREIGN KEY (classId) REFERENCES Class(id) ON DELETE CASCADE
);

-- Tạo bảng ClassGroup để quản lý các nhóm thực hành
CREATE TABLE ClassGroup (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classTypeId INT NOT NULL, -- Liên kết với loại lớp (chỉ áp dụng cho loại 'practice')
    groupName NVARCHAR(50) NOT NULL, -- Tên nhóm (ví dụ: 'Nhóm 1', 'Nhóm 2', ...)
    maxStudents INT NOT NULL, -- Số lượng sinh viên tối đa trong nhóm
    FOREIGN KEY (classTypeId) REFERENCES ClassType(id) ON DELETE CASCADE
);

-- Tạo bảng ClassRegistration
CREATE TABLE ClassRegistration (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL,
    studentId INT NOT NULL,
    practiceGroupId INT, -- Nhóm thực hành mà sinh viên đăng ký (có thể null nếu chưa phân nhóm)
    status NVARCHAR(50) NOT NULL, -- 'registered', 'approved', 'rejected'
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (classId) REFERENCES Class(id),
    FOREIGN KEY (studentId) REFERENCES Student(id),
    FOREIGN KEY (practiceGroupId) REFERENCES ClassGroup(id)
);

-- Tạo bảng ClassRoom
CREATE TABLE ClassRoom (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    building NVARCHAR(255) NOT NULL,
    floor INT NOT NULL,
    type NVARCHAR(50) NOT NULL, -- 'lecture', 'lab', 'seminar', etc.
    description NVARCHAR(MAX)
);

-- Tạo bảng TimeSlot để định nghĩa các khung giờ học
CREATE TABLE TimeSlot (
    id INT IDENTITY(1,1) PRIMARY KEY,
    slotName NVARCHAR(50) NOT NULL, -- Ví dụ: 'Tiết 1-3', 'Tiết 4-6', 'Tiết 7-9'
    startTime TIME NOT NULL, -- Giờ bắt đầu
    endTime TIME NOT NULL, -- Giờ kết thúc
    shift NVARCHAR(50) NOT NULL -- 'morning', 'afternoon', 'evening'
);

-- Tạo bảng Schedule
CREATE TABLE Schedule (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL,
    classTypeId INT NOT NULL, -- Liên kết với loại lớp (lý thuyết hoặc thực hành)
    classGroupId INT, -- Nhóm thực hành (null nếu là lớp lý thuyết)
    classRoomId INT NOT NULL,
    teacherId INT NOT NULL,
    dayOfWeek INT NOT NULL, -- 1: Chủ nhật, 2: Thứ 2, ..., 7: Thứ 7
    timeSlotId INT NOT NULL, -- Liên kết với khung giờ học
    weekNumber INT NOT NULL, -- Tuần học thứ mấy
    date DATE NOT NULL, -- Ngày cụ thể
    status NVARCHAR(50) NOT NULL DEFAULT 'normal', -- 'normal', 'exam', 'cancelled'
    note NVARCHAR(MAX),
    FOREIGN KEY (classId) REFERENCES Class(id),
    FOREIGN KEY (classTypeId) REFERENCES ClassType(id),
    FOREIGN KEY (classGroupId) REFERENCES ClassGroup(id),
    FOREIGN KEY (classRoomId) REFERENCES ClassRoom(id),
    FOREIGN KEY (teacherId) REFERENCES Teacher(id),
    FOREIGN KEY (timeSlotId) REFERENCES TimeSlot(id)
);

-- Tạo bảng RoomRequest
CREATE TABLE RoomRequest (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classRoomId INT NOT NULL,
    requesterId INT NOT NULL, -- ID của người yêu cầu (từ bảng User)
    purpose NVARCHAR(MAX) NOT NULL,
    date DATE NOT NULL, -- Ngày yêu cầu
    timeSlotId INT NOT NULL, -- Liên kết với khung giờ
    status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (classRoomId) REFERENCES ClassRoom(id),
    FOREIGN KEY (requesterId) REFERENCES [User](id),
    FOREIGN KEY (timeSlotId) REFERENCES TimeSlot(id)
);

-- Thêm dữ liệu mẫu

-- Thêm tài khoản sinh viên với MSSV: 21026511, password: 01012003
-- Đầu tiên hash password với bcrypt
DECLARE @hashedPassword NVARCHAR(255) = '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi'; -- Đây là hash của '01012003'

-- Thêm tài khoản admin
INSERT INTO Account (username, password, role, isActive)
VALUES ('admin', @hashedPassword, 'admin', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address)
VALUES (
    SCOPE_IDENTITY(),
    N'Admin',
    'admin@example.com',
    '0123456789',
    N'Hà Nội, Việt Nam'
);

-- Thêm tài khoản giáo viên
INSERT INTO Account (username, password, role, isActive)
VALUES ('teacher', @hashedPassword, 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address)
VALUES (
    SCOPE_IDENTITY(),
    N'Nguyễn Văn Giáo',
    'teacher@example.com',
    '0123456788',
    N'Hà Nội, Việt Nam'
);

-- Thêm thông tin giáo viên
INSERT INTO Teacher (userId, teacherCode, department)
VALUES (
    SCOPE_IDENTITY(),
    'TC001',
    N'Khoa Công nghệ thông tin'
);

-- Thêm 3 tài khoản sinh viên
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026511', @hashedPassword, 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address)
VALUES (
    SCOPE_IDENTITY(),
    N'Nguyễn Văn A',
    'nguyenvana@example.com',
    '0987654321',
    N'Hà Nội, Việt Nam'
);

INSERT INTO Student (userId, studentCode, major)
VALUES (
    SCOPE_IDENTITY(),
    '21026511',
    N'Công nghệ thông tin'
);

INSERT INTO Account (username, password, role, isActive)
VALUES ('21026512', @hashedPassword, 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address)
VALUES (
    SCOPE_IDENTITY(),
    N'Trần Thị B',
    'tranthib@example.com',
    '0987654322',
    N'Hà Nội, Việt Nam'
);

INSERT INTO Student (userId, studentCode, major)
VALUES (
    SCOPE_IDENTITY(),
    '21026512',
    N'Công nghệ thông tin'
);

INSERT INTO Account (username, password, role, isActive)
VALUES ('21026513', @hashedPassword, 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address)
VALUES (
    SCOPE_IDENTITY(),
    N'Lê Văn C',
    'levanc@example.com',
    '0987654323',
    N'Hà Nội, Việt Nam'
);

INSERT INTO Student (userId, studentCode, major)
VALUES (
    SCOPE_IDENTITY(),
    '21026513',
    N'Công nghệ thông tin'
);

-- Thêm phòng học
INSERT INTO ClassRoom (code, name, capacity, building, floor, type, description)
VALUES 
    ('LT101', N'Phòng lý thuyết 101', 100, N'Tòa A', 1, 'lecture', N'Phòng học lớn cho lý thuyết'),
    ('LT201', N'Phòng lý thuyết 201', 150, N'Tòa A', 2, 'lecture', N'Phòng học lớn cho lý thuyết'),
    ('TH101', N'Phòng thực hành 101', 30, N'Tòa B', 1, 'lab', N'Phòng thực hành máy tính'),
    ('TH102', N'Phòng thực hành 102', 30, N'Tòa B', 1, 'lab', N'Phòng thực hành máy tính'),
    ('TH201', N'Phòng thực hành 201', 30, N'Tòa B', 2, 'lab', N'Phòng thực hành máy tính');

-- Thêm lớp học
INSERT INTO Class (code, className, subjectName, subjectCode, credits, teacherId, semester, academicYear, maxStudents, totalWeeks, startDate, endDate, description)
VALUES 
    ('COMP101', N'Lập trình cơ bản', N'Nhập môn lập trình', 'NMLT', 3, 1, N'Học kỳ 1', '2024-2025', 90, 15, '2024-09-01', '2024-12-15', N'Môn học cơ bản về lập trình');

-- Thêm loại lớp (lý thuyết và thực hành)
INSERT INTO ClassType (classId, type, maxStudents, groupNumber)
VALUES 
    (1, 'theory', 90, NULL), -- Lớp lý thuyết
    (1, 'practice', 90, 3); -- Lớp thực hành chia làm 3 nhóm

-- Thêm các nhóm thực hành
INSERT INTO ClassGroup (classTypeId, groupName, maxStudents)
VALUES 
    (2, N'Nhóm 1', 30),
    (2, N'Nhóm 2', 30),
    (2, N'Nhóm 3', 30);

-- Đăng ký lớp học cho sinh viên
INSERT INTO ClassRegistration (classId, studentId, practiceGroupId, status)
VALUES 
    (1, 1, 1, N'approved'), -- Sinh viên 1 đăng ký nhóm thực hành 1
    (1, 2, 2, N'approved'), -- Sinh viên 2 đăng ký nhóm thực hành 2
    (1, 3, 3, N'approved'); -- Sinh viên 3 đăng ký nhóm thực hành 3

-- Thêm lịch học
-- Lịch học lý thuyết (tiết 1-3 sáng thứ 3)
INSERT INTO Schedule (classId, classTypeId, classGroupId, classRoomId, teacherId, dayOfWeek, timeSlotId, weekNumber, date, status, note)
VALUES 
    -- Tuần 1: Lý thuyết
    (1, 1, NULL, 1, 1, 3, 1, 1, '2024-09-03', 'normal', N'Buổi học lý thuyết đầu tiên'),
    -- Tuần 1: Thực hành cho 3 nhóm
    (1, 2, 1, 3, 1, 5, 3, 1, '2024-09-05', 'normal', N'Buổi thực hành nhóm 1'),
    (1, 2, 2, 4, 1, 5, 3, 1, '2024-09-05', 'normal', N'Buổi thực hành nhóm 2'),
    (1, 2, 3, 5, 1, 5, 3, 1, '2024-09-05', 'normal', N'Buổi thực hành nhóm 3'),
    
    -- Tuần 2: Lý thuyết
    (1, 1, NULL, 1, 1, 3, 1, 2, '2024-09-10', 'normal', N'Buổi học lý thuyết tuần 2'),
    -- Tuần 2: Thực hành cho 3 nhóm
    (1, 2, 1, 3, 1, 5, 3, 2, '2024-09-12', 'normal', N'Buổi thực hành nhóm 1'),
    (1, 2, 2, 4, 1, 5, 3, 2, '2024-09-12', 'normal', N'Buổi thực hành nhóm 2'),
    (1, 2, 3, 5, 1, 5, 3, 2, '2024-09-12', 'normal', N'Buổi thực hành nhóm 3'),
    
    -- Tuần 3: Lý thuyết (đổi sang thi giữa kỳ)
    (1, 1, NULL, 1, 1, 3, 1, 3, '2024-09-17', 'exam', N'Thi giữa kỳ phần lý thuyết'),
    -- Tuần 3: Thực hành cho 3 nhóm (nhóm 1 nghỉ học)
    (1, 2, 1, 3, 1, 5, 3, 3, '2024-09-19', 'cancelled', N'Nghỉ học do sửa phòng máy'),
    (1, 2, 2, 4, 1, 5, 3, 3, '2024-09-19', 'normal', N'Buổi thực hành nhóm 2'),
    (1, 2, 3, 5, 1, 5, 3, 3, '2024-09-19', 'normal', N'Buổi thực hành nhóm 3');

-- Thêm yêu cầu phòng
INSERT INTO RoomRequest (classRoomId, requesterId, purpose, date, timeSlotId, status)
VALUES 
    (3, 2, N'Mượn phòng thực hành để dạy bổ sung', '2024-09-20', 4, 'pending'),
    (1, 2, N'Mượn phòng lý thuyết để tổ chức seminar', '2024-09-25', 2, 'approved');