USE master;
IF EXISTS(SELECT * FROM sys.databases WHERE name = 'ClassroomManagement')
BEGIN
    DROP DATABASE ClassroomManagement;
END
GO

-- Danh mục Khoa/Bộ môn
CREATE TABLE Department (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(255) UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Danh mục Chuyên ngành (gắn với Khoa)
CREATE TABLE Major (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    departmentId INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (departmentId) REFERENCES Department(id)
);

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
    avatar NVARCHAR(500), -- URL hoặc đường dẫn đến ảnh đại diện
    gender NVARCHAR(10), -- 'male', 'female', 'other'
    dateOfBirth DATE, -- Ngày tháng năm sinh
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (accountId) REFERENCES Account(id) ON DELETE CASCADE
);

-- Thông tin cá nhân mở rộng (có thể cập nhật sau)
CREATE TABLE PersonalProfile (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    idCardNumber NVARCHAR(50) NULL,
    idCardIssueDate DATE NULL,
    idCardIssuePlace NVARCHAR(255) NULL,
    placeOfBirth NVARCHAR(255) NULL,
    permanentAddress NVARCHAR(500) NULL,
    phoneEmergency NVARCHAR(50) NULL,
    bankName NVARCHAR(255) NULL,
    bankBranch NVARCHAR(255) NULL,
    bankAccountNumber NVARCHAR(50) NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE
);

-- Quan hệ gia đình cơ bản (có thể cập nhật sau)
CREATE TABLE FamilyInfo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    fatherFullName NVARCHAR(255) NULL,
    fatherYearOfBirth INT NULL,
    fatherPhone NVARCHAR(50) NULL,
    motherFullName NVARCHAR(255) NULL,
    motherYearOfBirth INT NULL,
    motherPhone NVARCHAR(50) NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE
);

-- Thông tin học vấn (dùng chung cho teacher/student)
CREATE TABLE AcademicProfile (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    role NVARCHAR(20) NOT NULL, -- 'teacher' | 'student'
    campus NVARCHAR(255) NULL,
    trainingType NVARCHAR(255) NULL,
    degreeLevel NVARCHAR(255) NULL,
    academicYear NVARCHAR(50) NULL,
    enrollmentDate DATE NULL,
    classCode NVARCHAR(50) NULL, -- cho sinh viên
    title NVARCHAR(255) NULL, -- cho giảng viên
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE
);

-- Tạo bảng Teacher
CREATE TABLE Teacher (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    teacherCode NVARCHAR(50) UNIQUE NOT NULL,
    departmentId INT NULL,
    majorId INT NULL,
    FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE,
    FOREIGN KEY (departmentId) REFERENCES Department(id),
    FOREIGN KEY (majorId) REFERENCES Major(id)
);

-- Tạo bảng Student
CREATE TABLE Student (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT UNIQUE NOT NULL,
    studentCode NVARCHAR(50) UNIQUE NOT NULL,
    departmentId INT NULL,
    majorId INT NULL,
    FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE,
    FOREIGN KEY (departmentId) REFERENCES Department(id),
    FOREIGN KEY (majorId) REFERENCES Major(id)
);

-- Seed dữ liệu khoa/phòng ban mẫu
INSERT INTO Department (code, name) VALUES
 ('CNTT', N'Khoa Công nghệ thông tin'),
 ('DTVT', N'Khoa Điện tử Viễn thông'),
 ('QTKD', N'Khoa Quản trị Kinh doanh'),
 ('NN', N'Khoa Ngoại ngữ');

-- Seed dữ liệu chuyên ngành mẫu theo Khoa
INSERT INTO Major (code, name, departmentId) VALUES
 -- Khoa CNTT
 ('SE', N'Kỹ thuật Phần mềm', (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')),
 ('AI', N'Trí tuệ nhân tạo', (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')),
 ('NET', N'Mạng máy tính', (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')),
 ('IOT', N'Internet of Things', (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')),
 -- Khoa Quản trị Kinh doanh (lấy làm ví dụ cho "Kế toán")
 ('ACC', N'Kế toán', (SELECT TOP 1 id FROM Department WHERE code = 'QTKD')),
 ('FIN', N'Tài chính', (SELECT TOP 1 id FROM Department WHERE code = 'QTKD')),
 ('MK', N'Marketing', (SELECT TOP 1 id FROM Department WHERE code = 'QTKD')),
 -- Khoa Điện tử Viễn thông
 ('CE', N'Kỹ thuật máy tính', (SELECT TOP 1 id FROM Department WHERE code = 'DTVT')),
 ('ET', N'Kỹ thuật điện tử', (SELECT TOP 1 id FROM Department WHERE code = 'DTVT')),
 -- Khoa Ngoại ngữ
 ('EN', N'Ngôn ngữ Anh', (SELECT TOP 1 id FROM Department WHERE code = 'NN')),
 ('JP', N'Ngôn ngữ Nhật', (SELECT TOP 1 id FROM Department WHERE code = 'NN')),
 ('KR', N'Ngôn ngữ Hàn', (SELECT TOP 1 id FROM Department WHERE code = 'NN'));

-- Tạo bảng Class mở rộng - chứa tất cả thông tin về lớp học
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
    classType NVARCHAR(50) NOT NULL DEFAULT 'theory', -- 'theory' hoặc 'practice'
    practiceEnabled BIT NOT NULL DEFAULT 0, -- Lớp/môn này có thực hành không
    maxPracticeGroups INT NULL, -- Tối đa bao nhiêu nhóm thực hành (null hoặc 0 = không giới hạn)
    description NVARCHAR(MAX),
    FOREIGN KEY (teacherId) REFERENCES Teacher(id)
);

-- Tạo bảng ClassStudent để quản lý danh sách sinh viên trong lớp
CREATE TABLE ClassStudent (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL,
    studentId INT NOT NULL,
    groupNumber INT, -- Số nhóm thực hành (null nếu là lớp lý thuyết)
    status NVARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'dropped'
    joinedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (classId) REFERENCES Class(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES Student(id) ON DELETE CASCADE,
    UNIQUE(classId, studentId) -- Một sinh viên chỉ có thể ở trong một lớp một lần
);

-- Tạo bảng ClassRoom
CREATE TABLE ClassRoom (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    building NVARCHAR(255) NOT NULL,
    floor INT NOT NULL,
    campus NVARCHAR(255) NULL,
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

-- Tạo bảng ClassSchedule để quản lý lịch học trực tiếp từ lớp
CREATE TABLE ClassSchedule (
    id INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL,
    teacherId INT NOT NULL,
    classRoomId INT NOT NULL,
    dayOfWeek INT NOT NULL, -- 1: Chủ nhật, 2: Thứ 2, ..., 7: Thứ 7
    timeSlotId INT NOT NULL, -- Liên kết với khung giờ học
    weekPattern NVARCHAR(50) NOT NULL DEFAULT 'weekly', -- 'weekly', 'biweekly', 'specific'
    startWeek INT NOT NULL, -- Tuần bắt đầu
    endWeek INT NOT NULL, -- Tuần kết thúc
    status NVARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'paused', 'exam'
    note NVARCHAR(MAX),
    FOREIGN KEY (classId) REFERENCES Class(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES Teacher(id),
    FOREIGN KEY (classRoomId) REFERENCES ClassRoom(id),
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

-- Ràng buộc và chỉ mục để đảm bảo tính toàn vẹn dữ liệu

-- Class
ALTER TABLE Class
ADD CONSTRAINT CK_Class_Dates CHECK (startDate <= endDate);

ALTER TABLE Class
ADD CONSTRAINT CK_Class_Type CHECK (classType IN ('theory', 'practice'));

-- ClassStudent: ràng buộc trạng thái
ALTER TABLE ClassStudent
ADD CONSTRAINT CK_ClassStudent_Status CHECK (status IN ('active', 'inactive', 'dropped'));

-- ClassRoom: loại phòng hợp lệ
ALTER TABLE ClassRoom
ADD CONSTRAINT CK_ClassRoom_Type CHECK (type IN ('lecture', 'lab', 'seminar', 'online'));

-- TimeSlot: ca học hợp lệ và thời gian kết thúc > thời gian bắt đầu
ALTER TABLE TimeSlot
ADD CONSTRAINT CK_TimeSlot_Shift CHECK (shift IN ('morning', 'afternoon', 'evening'));

ALTER TABLE TimeSlot
ADD CONSTRAINT CK_TimeSlot_Time CHECK (startTime < endTime);

-- ClassSchedule: ràng buộc ngày trong tuần và trạng thái
ALTER TABLE ClassSchedule
ADD CONSTRAINT CK_ClassSchedule_DayOfWeek CHECK (dayOfWeek BETWEEN 1 AND 7);

ALTER TABLE ClassSchedule
ADD CONSTRAINT CK_ClassSchedule_Status CHECK (status IN ('active', 'cancelled', 'paused', 'exam'));

ALTER TABLE ClassSchedule
ADD CONSTRAINT CK_ClassSchedule_Weeks CHECK (startWeek <= endWeek);

-- Tránh trùng lịch: phòng học không thể bị double-book trong cùng ngày/ca
CREATE UNIQUE INDEX UQ_ClassSchedule_Room_Time ON ClassSchedule (dayOfWeek, timeSlotId, classRoomId);
-- Tránh trùng lịch: giảng viên không thể dạy 2 nơi cùng ca/ngày
CREATE UNIQUE INDEX UQ_ClassSchedule_Teacher_Time ON ClassSchedule (dayOfWeek, timeSlotId, teacherId);

-- Thêm dữ liệu mẫu

---- Thêm tài khoản admin với password: 01012003
--DECLARE  @hashedPassword NVARCHAR(255) = '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi';

-- Thêm tài khoản admin
INSERT INTO Account (username, password, role, isActive)
VALUES ('admin', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'admin', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Admin System',
    'admin@example.com',
    '0123456789',
    N'Hà Nội, Việt Nam',
    'https://ui-avatars.com/api/?name=Admin+System&background=0D6EFD&color=fff',
    'male',
    '1990-01-01'
);

-- Seed hồ sơ admin
INSERT INTO PersonalProfile (userId) SELECT TOP 1 id FROM [User] WHERE email='admin@example.com';
INSERT INTO FamilyInfo (userId) SELECT TOP 1 id FROM [User] WHERE email='admin@example.com';
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear)
SELECT TOP 1 id, 'admin', N'Cơ sở 1', N'Chính quy', N'Đại học', '2024-2025' FROM [User] WHERE email='admin@example.com';

-- Thêm tài khoản giáo viên
INSERT INTO Account (username, password, role, isActive)
VALUES ('teacher','$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Nguyễn Văn Giáo',
    'teacher@example.com',
    '0123456788',
    N'Hà Nội, Việt Nam',
    'https://ui-avatars.com/api/?name=Nguyen+Van+Giao&background=198754&color=fff',
    'male',
    '1985-03-15'
);

-- Thêm thông tin giáo viên
INSERT INTO Teacher (userId, teacherCode, departmentId)
VALUES (
    SCOPE_IDENTITY(),
    '10000000',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')
);

-- Seed academic profile cho giáo viên 1
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, title)
SELECT TOP 1 id, 'teacher', N'Cơ sở 1', N'Chính quy', N'Thạc sĩ', '2024-2025', N'Giảng viên' FROM [User] WHERE email='teacher@example.com';

-- Thêm tài khoản giáo viên thứ 2
INSERT INTO Account (username, password, role, isActive)
VALUES ('teacher2','$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Trần Thị Dạy',
    'teacher2@example.com',
    '0123456787',
    N'TP. Hồ Chí Minh, Việt Nam',
    'https://ui-avatars.com/api/?name=Tran+Thi+Day&background=20C997&color=fff',
    'female',
    '1988-07-22'
);

INSERT INTO Teacher (userId, teacherCode, departmentId)
VALUES (
    SCOPE_IDENTITY(),
    '10000001',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')
);

-- Seed academic profile cho giáo viên 2
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, title)
SELECT TOP 1 id, 'teacher', N'Cơ sở 1', N'Chính quy', N'Thạc sĩ', '2024-2025', N'Giảng viên' FROM [User] WHERE email='teacher2@example.com';

-- Thêm 3 tài khoản sinh viên
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026511','$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Nguyễn Văn A',
    'nguyenvana@example.com',
    '0987654321',
    N'Hà Nội, Việt Nam',
    'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=DC3545&color=fff',
    'male',
    '2003-05-10'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026511',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    NULL
);
-- Seed academic profile cho SV
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, enrollmentDate, classCode)
SELECT TOP 1 id, 'student', N'Cơ sở 1', N'Chính quy', N'Đại học', '2024-2025', '2024-09-01', 'DH20CNTT1' FROM [User] WHERE email='nguyenvana@example.com';

INSERT INTO Account (username, password, role, isActive)
VALUES ('21026512','$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Trần Thị B',
    'tranthib@example.com',
    '0987654322',
    N'Hà Nội, Việt Nam',
    'https://ui-avatars.com/api/?name=Tran+Thi+B&background=FD7E14&color=fff',
    'female',
    '2003-08-15'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026512',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    NULL
);
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, enrollmentDate, classCode)
SELECT TOP 1 id, 'student', N'Cơ sở 1', N'Chính quy', N'Đại học', '2024-2025', '2024-09-01', 'DH20CNTT1' FROM [User] WHERE email='tranthib@example.com';

INSERT INTO Account (username, password, role, isActive)
VALUES ('21026513','$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Lê Văn C',
    'levanc@example.com',
    '0987654323',
    N'Hà Nội, Việt Nam',
    'https://ui-avatars.com/api/?name=Le+Van+C&background=6F42C1&color=fff',
    'male',
    '2003-12-03'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026513',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    NULL
);
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, enrollmentDate, classCode)
SELECT TOP 1 id, 'student', N'Cơ sở 1', N'Chính quy', N'Đại học', '2024-2025', '2024-09-01', 'DH20CNTT1' FROM [User] WHERE email='levanc@example.com';

-- Thêm sinh viên thứ 4
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026514','$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Phạm Thị D',
    'phamthid@example.com',
    '0987654324',
    N'Đà Nẵng, Việt Nam',
    'https://ui-avatars.com/api/?name=Pham+Thi+D&background=E83E8C&color=fff',
    'female',
    '2003-03-20'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026514',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    NULL
);
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, enrollmentDate, classCode)
SELECT TOP 1 id, 'student', N'Cơ sở 1', N'Chính quy', N'Đại học', '2024-2025', '2024-09-01', 'DH20CNTT1' FROM [User] WHERE email='phamthid@example.com';

-- Thêm sinh viên thứ 5
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026515','$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Hoàng Văn E',
    'hoangvane@example.com',
    '0987654325',
    N'Cần Thơ, Việt Nam',
    'https://ui-avatars.com/api/?name=Hoang+Van+E&background=17A2B8&color=fff',
    'male',
    '2003-11-08'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026515',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    NULL
);
INSERT INTO AcademicProfile (userId, role, campus, trainingType, degreeLevel, academicYear, enrollmentDate, classCode)
SELECT TOP 1 id, 'student', N'Cơ sở 1', N'Chính quy', N'Đại học', '2024-2025', '2024-09-01', 'DH20CNTT1' FROM [User] WHERE email='hoangvane@example.com';

-- Thêm phòng học
INSERT INTO ClassRoom (code, name, capacity, building, floor, campus, type, description)
VALUES 
    ('LT101', N'Phòng lý thuyết 101', 100, N'Tòa A', 1, N'Cơ sở 1 (TP. HCM)', 'lecture', N'Phòng học lớn cho lý thuyết'),
    ('LT201', N'Phòng lý thuyết 201', 150, N'Tòa A', 2, N'Cơ sở 1 (TP. HCM)', 'lecture', N'Phòng học lớn cho lý thuyết'),
    ('TH101', N'Phòng thực hành 101', 30, N'Tòa B', 1, N'Cơ sở 1 (TP. HCM)', 'lab', N'Phòng thực hành máy tính'),
    ('TH102', N'Phòng thực hành 102', 30, N'Tòa B', 1, N'Cơ sở 1 (TP. HCM)', 'lab', N'Phòng thực hành máy tính'),
    ('TH201', N'Phòng thực hành 201', 30, N'Tòa B', 2, N'Cơ sở 1 (TP. HCM)', 'lab', N'Phòng thực hành máy tính'),
    ('ONLINE', N'Lớp trực tuyến', 1000, N'Trực tuyến', 0, N'Trực tuyến', 'online', N'Phòng học trực tuyến');

-- Thêm khung giờ học
INSERT INTO TimeSlot (slotName, startTime, endTime, shift)
VALUES 
    (N'Tiết 1-3', '07:00:00', '09:30:00', 'morning'),
    (N'Tiết 4-6', '09:45:00', '12:15:00', 'morning'),
    (N'Tiết 7-9', '13:00:00', '15:30:00', 'afternoon'),
    (N'Tiết 10-12', '15:45:00', '18:15:00', 'afternoon'),
    (N'Tiết 13-15', '18:30:00', '21:00:00', 'evening');

-- Thêm lớp học
INSERT INTO Class (code, className, subjectName, subjectCode, credits, teacherId, semester, academicYear, maxStudents, totalWeeks, startDate, endDate, classType, practiceEnabled, maxPracticeGroups, description)
VALUES 
    ('COMP101', N'Lập trình cơ bản', N'Nhập môn lập trình', 'NMLT', 3, 1, N'Học kỳ 1', '2024-2025', 90, 15, '2024-09-01', '2024-12-15', 'theory', 1, 3, N'Môn học cơ bản về lập trình'),
    ('COMP101-TH', N'Lập trình cơ bản - Thực hành', N'Nhập môn lập trình', 'NMLT', 3, 1, N'Học kỳ 1', '2024-2025', 90, 15, '2024-09-01', '2024-12-15', 'practice', 0, NULL, N'Phần thực hành môn lập trình cơ bản'),
    ('COMP102', N'Cơ sở dữ liệu', N'Cơ sở dữ liệu', 'CSDL', 4, 2, N'Học kỳ 1', '2024-2025', 80, 15, '2024-09-01', '2024-12-15', 'theory', 1, 2, N'Môn học về cơ sở dữ liệu'),
    ('COMP102-TH', N'Cơ sở dữ liệu - Thực hành', N'Cơ sở dữ liệu', 'CSDL', 4, 2, N'Học kỳ 1', '2024-2025', 80, 15, '2024-09-01', '2024-12-15', 'practice', 0, NULL, N'Phần thực hành môn cơ sở dữ liệu'),
    ('COMP103', N'Lập trình Web', N'Lập trình Web', 'LTW', 3, 1, N'Học kỳ 1', '2024-2025', 70, 15, '2024-09-01', '2024-12-15', 'theory', 0, NULL, N'Môn học lập trình Web (chỉ lý thuyết)');

-- Thêm sinh viên vào lớp học
INSERT INTO ClassStudent (classId, studentId, groupNumber, status)
VALUES 
    -- Lớp lý thuyết COMP101
    (1, 1, NULL, 'active'), -- Sinh viên 1 vào lớp lý thuyết
    (1, 2, NULL, 'active'), -- Sinh viên 2 vào lớp lý thuyết
    (1, 3, NULL, 'active'), -- Sinh viên 3 vào lớp lý thuyết
    (1, 4, NULL, 'active'), -- Sinh viên 4 vào lớp lý thuyết
    (1, 5, NULL, 'active'), -- Sinh viên 5 vào lớp lý thuyết
    
    -- Lớp thực hành COMP101
    (2, 1, 1, 'active'),    -- Sinh viên 1 vào nhóm 1 thực hành
    (2, 2, 2, 'active'),    -- Sinh viên 2 vào nhóm 2 thực hành
    (2, 3, 3, 'active'),    -- Sinh viên 3 vào nhóm 3 thực hành
    
    -- Lớp lý thuyết COMP102
    (3, 1, NULL, 'active'),
    (3, 2, NULL, 'active'),
    (3, 4, NULL, 'active'),
    (3, 5, NULL, 'active'),
    
    -- Lớp thực hành COMP102
    (4, 1, 1, 'active'),
    (4, 2, 2, 'active'),
    (4, 4, 1, 'active'),
    (4, 5, 2, 'active'),
    
    -- Lớp lý thuyết COMP103 (chỉ lý thuyết)
    (5, 1, NULL, 'active'),
    (5, 3, NULL, 'active'),
    (5, 5, NULL, 'active');

-- Thêm lịch học trực tiếp từ lớp
INSERT INTO ClassSchedule (classId, teacherId, classRoomId, dayOfWeek, timeSlotId, weekPattern, startWeek, endWeek, status, note)
VALUES 
    -- Lớp lý thuyết COMP101: Thứ 3, tiết 1-3, tuần 1-15
    (1, 1, 1, 3, 1, 'weekly', 1, 15, 'active', N'Lịch học lý thuyết COMP101'),
    
    -- Lớp thực hành COMP101: Thứ 5, tiết 7-9, tuần 1-15
    (2, 1, 3, 5, 3, 'weekly', 1, 15, 'active', N'Lịch thực hành COMP101 nhóm 1'),
    (2, 1, 4, 5, 3, 'weekly', 1, 15, 'active', N'Lịch thực hành COMP101 nhóm 2'),
    (2, 1, 5, 5, 3, 'weekly', 1, 15, 'active', N'Lịch thực hành COMP101 nhóm 3'),
    
    -- Lớp lý thuyết COMP102: Thứ 2, tiết 4-6, tuần 1-15
    (3, 2, 2, 2, 2, 'weekly', 1, 15, 'active', N'Lịch học lý thuyết COMP102'),
    
    -- Lớp thực hành COMP102: Thứ 4, tiết 7-9, tuần 1-15
    (4, 2, 3, 4, 3, 'weekly', 1, 15, 'active', N'Lịch thực hành COMP102 nhóm 1'),
    (4, 2, 4, 4, 3, 'weekly', 1, 15, 'active', N'Lịch thực hành COMP102 nhóm 2'),
    
    -- Lớp lý thuyết COMP103: Thứ 6, tiết 4-6, tuần 1-15 (đổi timeSlot để tránh trùng giáo viên)
    (5, 1, 1, 6, 2, 'weekly', 1, 15, 'active', N'Lịch học lý thuyết COMP103'),
    
    -- Lịch thi giữa kỳ COMP101: Thứ 3, tiết 1-3, tuần 8
    (1, 1, 1, 3, 1, 'specific', 8, 8, 'exam', N'Thi giữa kỳ COMP101'),
    
    -- Lịch thi cuối kỳ COMP101: Thứ 3, tiết 1-3, tuần 15
    (1, 1, 1, 3, 1, 'specific', 15, 15, 'exam', N'Thi cuối kỳ COMP101');

-- Thêm yêu cầu phòng
INSERT INTO RoomRequest (classRoomId, requesterId, purpose, date, timeSlotId, status)
VALUES 
    (3, 2, N'Mượn phòng thực hành để dạy bổ sung', '2024-09-20', 4, 'pending'),
    (1, 2, N'Mượn phòng lý thuyết để tổ chức seminar', '2024-09-25', 2, 'approved'),
    (2, 1, N'Mượn phòng để tổ chức workshop', '2024-10-01', 3, 'pending'),
    (5, 1, N'Lớp trực tuyến cho sinh viên ở xa', '2024-09-15', 1, 'approved'),
    (4, 2, N'Thực hành bổ sung cho sinh viên yếu', '2024-09-22', 4, 'pending');