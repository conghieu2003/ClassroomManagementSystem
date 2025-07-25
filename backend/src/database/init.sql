CREATE DATABASE ClassroomManagement;
GO
use [ClassroomManagement]

-- Create Account table
CREATE TABLE Account (
    accountId CHAR(8) PRIMARY KEY,
    password VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    isActive BIT DEFAULT 1
);

-- Create User table with foreign key to Account
CREATE TABLE [User] (
    userId INT IDENTITY(1,1) PRIMARY KEY,
    accountId CHAR(8) UNIQUE NOT NULL,
    fullName NVARCHAR(100) NOT NULL,
    gender BIT,
    birthday DATE,
    email VARCHAR(100),
    phone VARCHAR(15),
    avatar VARCHAR(255),
    department NVARCHAR(100),
    FOREIGN KEY (accountId) REFERENCES Account(accountId)
);

-- Insert sample data
INSERT INTO Account (accountId, password, role) VALUES
('20110001', 'password123', 'student'),
('20110002', 'password123', 'student'),
('10000001', 'password123', 'teacher'),
('10000002', 'password123', 'teacher'),
('00000001', 'admin123', 'admin');

INSERT INTO [User] (accountId, fullName, gender, birthday, email, phone, department) VALUES
('20110001', N'Nguyễn Văn A', 1, '2002-01-01', 'a.nguyen@student.hcmute.edu.vn', '0901234567', N'Khoa Công nghệ Thông tin'),
('20110002', N'Trần Thị B', 0, '2002-02-02', 'b.tran@student.hcmute.edu.vn', '0901234568', N'Khoa Công nghệ Thông tin'),
('10000001', N'Lê Văn C', 1, '1985-03-03', 'c.le@hcmute.edu.vn', '0901234569', N'Khoa Công nghệ Thông tin'),
('10000002', N'Phạm Thị D', 0, '1988-04-04', 'd.pham@hcmute.edu.vn', '0901234570', N'Khoa Công nghệ Thông tin'),
('00000001', N'Admin', 1, '1990-05-05', 'admin@hcmute.edu.vn', '0901234571', N'Phòng Đào tạo');

CREATE TABLE Room (
    roomId INT IDENTITY(1,1) PRIMARY KEY,
    roomCode VARCHAR(20) NOT NULL UNIQUE,
    roomName NVARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    building NVARCHAR(100),
    roomType VARCHAR(50), -- 'theory', 'practice', 'lab'
    status VARCHAR(20) DEFAULT 'available' -- 'available', 'maintenance'
);

CREATE TABLE Subject (
    subjectId INT IDENTITY(1,1) PRIMARY KEY,
    subjectCode VARCHAR(20) NOT NULL UNIQUE,
    subjectName NVARCHAR(100) NOT NULL,
    credits INT NOT NULL,
    description NVARCHAR(500)
);

CREATE TABLE Class (
    classId INT IDENTITY(1,1) PRIMARY KEY,
    classCode VARCHAR(20) NOT NULL UNIQUE,
    className NVARCHAR(100) NOT NULL,
    subjectId INT NOT NULL,
    teacherId INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    FOREIGN KEY (subjectId) REFERENCES Subject(subjectId),
    FOREIGN KEY (teacherId) REFERENCES [User](userId)
);

CREATE TABLE Schedule (
    scheduleId INT IDENTITY(1,1) PRIMARY KEY,
    classId INT NOT NULL,
    roomId INT NOT NULL,
    dayOfWeek INT NOT NULL, -- 2 (Monday) to 8 (Sunday)
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled'
    FOREIGN KEY (classId) REFERENCES Class(classId),
    FOREIGN KEY (roomId) REFERENCES Room(roomId)
);

-- Tạo các index
CREATE INDEX idx_user_account ON [User](accountId);
CREATE INDEX idx_user_email ON [User](email);
CREATE INDEX idx_class_teacher ON Class(teacherId);
CREATE INDEX idx_class_subject ON Class(subjectId);
CREATE INDEX idx_schedule_class ON Schedule(classId);
CREATE INDEX idx_schedule_room ON Schedule(roomId);
CREATE INDEX idx_schedule_date ON Schedule(startDate, endDate);
CREATE INDEX idx_room_status ON Room(status);

-- Stored procedure kiểm tra phòng trống
CREATE PROCEDURE sp_CheckRoomAvailability
    @roomId INT,
    @dayOfWeek INT,
    @startTime TIME,
    @endTime TIME,
    @startDate DATE,
    @endDate DATE,
    @excludeScheduleId INT = NULL
AS
BEGIN
    SELECT 
        s.scheduleId,
        s.startTime,
        s.endTime,
        c.className,
        r.roomName
    FROM Schedule s
    JOIN Class c ON s.classId = c.classId
    JOIN Room r ON s.roomId = r.roomId
    WHERE s.roomId = @roomId 
        AND s.dayOfWeek = @dayOfWeek
        AND s.status = 'active'
        AND ((s.startTime <= @endTime AND s.endTime >= @startTime)
        OR (s.startTime <= @endTime AND s.endTime >= @startTime))
        AND ((s.startDate <= @endDate AND s.endDate >= @startDate)
        OR (s.startDate <= @endDate AND s.endDate >= @startDate))
        AND (@excludeScheduleId IS NULL OR s.scheduleId != @excludeScheduleId);
END;
GO

-- Stored procedure tạo lịch học mới
CREATE PROCEDURE sp_CreateSchedule
    @classId INT,
    @roomId INT,
    @dayOfWeek INT,
    @startTime TIME,
    @endTime TIME,
    @startDate DATE,
    @endDate DATE
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Kiểm tra xem phòng có đang bảo trì không
        IF EXISTS (SELECT 1 FROM Room WHERE roomId = @roomId AND status = 'maintenance')
        BEGIN
            THROW 50001, 'Phòng đang trong thời gian bảo trì', 1;
        END

        -- Kiểm tra trùng lịch
        IF EXISTS (
            SELECT 1 
            FROM Schedule 
            WHERE roomId = @roomId 
                AND dayOfWeek = @dayOfWeek
                AND status = 'active'
                AND ((startTime <= @endTime AND endTime >= @startTime)
                OR (startTime <= @endTime AND endTime >= @startTime))
                AND ((startDate <= @endDate AND endDate >= @startDate)
                OR (startDate <= @endDate AND endDate >= @startDate))
        )
        BEGIN
            THROW 50002, 'Phòng đã được đặt trong khung giờ này', 1;
        END

        -- Tạo lịch học mới
        INSERT INTO Schedule (classId, roomId, dayOfWeek, startTime, endTime, startDate, endDate)
        VALUES (@classId, @roomId, @dayOfWeek, @startTime, @endTime, @startDate, @endDate);

        COMMIT;
        SELECT SCOPE_IDENTITY() as scheduleId;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END;
GO 