-- =====================================================
-- SAMPLE DATA - CLASSROOM MANAGEMENT SYSTEM
-- Đại học Công nghiệp TP. Hồ Chí Minh (IUH)
-- =====================================================

USE ClassroomManagement;
GO

-- =====================================================
-- 1. DỮ LIỆU TRẠNG THÁI HỌC VẤN
-- =====================================================
INSERT INTO AcademicStatus (name) VALUES
(N'Đang học'),
(N'Đã tốt nghiệp'),
(N'Bỏ học');

-- =====================================================
-- 2. DỮ LIỆU LOẠI PHÒNG/LỚP
-- =====================================================
INSERT INTO ClassRoomType (name) VALUES
(N'Lý thuyết'),
(N'Thực hành'),
(N'Online');

-- =====================================================
-- 3. DỮ LIỆU LOẠI YÊU CẦU
-- =====================================================
INSERT INTO RequestType (name) VALUES
(N'Đổi phòng'),
(N'Đổi lịch'),
(N'Tạm ngưng'),
(N'Thi'),
(N'Đổi giáo viên');

-- =====================================================
-- 4. DỮ LIỆU TRẠNG THÁI YÊU CẦU
-- =====================================================
INSERT INTO RequestStatus (name) VALUES
(N'Chờ xử lý'),
(N'Hoàn thành'),
(N'Từ chối');

-- =====================================================
-- 5. DỮ LIỆU KHOA/PHÒNG BAN
-- =====================================================
INSERT INTO Department (code, name) VALUES
('CNTT', N'Khoa Công nghệ Thông tin'),
('CK', N'Khoa Công nghệ Cơ khí'),
('CD', N'Khoa Công nghệ Điện'),
('CDT', N'Khoa Công nghệ Điện tử'),
('QTKD', N'Khoa Quản trị Kinh doanh'),
('NN', N'Khoa Ngoại ngữ');

-- =====================================================
-- 6. DỮ LIỆU CHUYÊN NGÀNH
-- =====================================================
INSERT INTO Major (code, name, departmentId) VALUES
-- Khoa CNTT
('SE', N'Kỹ thuật Phần mềm', (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')),
('AI', N'Trí tuệ nhân tạo', (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')),
('NET', N'Mạng máy tính', (SELECT TOP 1 id FROM Department WHERE code = 'CNTT')),
-- Khoa Cơ khí
('CTM', N'Công nghệ Chế tạo máy', (SELECT TOP 1 id FROM Department WHERE code = 'CK')),
('CNC', N'Công nghệ CNC', (SELECT TOP 1 id FROM Department WHERE code = 'CK')),
-- Khoa Điện
('DTCN', N'Điện tử Công nghiệp', (SELECT TOP 1 id FROM Department WHERE code = 'CD')),
('TDH', N'Tự động hóa', (SELECT TOP 1 id FROM Department WHERE code = 'CD')),
-- Khoa Điện tử
('VT', N'Viễn thông', (SELECT TOP 1 id FROM Department WHERE code = 'CDT')),
('DT', N'Điện tử', (SELECT TOP 1 id FROM Department WHERE code = 'CDT')),
-- Khoa QTKD
('KT', N'Kế toán', (SELECT TOP 1 id FROM Department WHERE code = 'QTKD')),
('TC', N'Tài chính', (SELECT TOP 1 id FROM Department WHERE code = 'QTKD')),
-- Khoa Ngoại ngữ
('TA', N'Ngôn ngữ Anh', (SELECT TOP 1 id FROM Department WHERE code = 'NN'));

-- =====================================================
-- 7. DỮ LIỆU KHUNG GIỜ HỌC (theo lịch IUH)
-- =====================================================
INSERT INTO TimeSlot (slotName, startTime, endTime, shift) VALUES
-- Buổi sáng (shift = 1)
(N'Tiết 1', '06:30:00', '07:20:00', 1),
(N'Tiết 2', '07:20:00', '08:10:00', 1),
(N'Tiết 3', '08:10:00', '09:00:00', 1),
(N'Tiết 4', '09:10:00', '10:00:00', 1),
(N'Tiết 5', '10:00:00', '10:50:00', 1),
(N'Tiết 6', '10:50:00', '11:40:00', 1),
-- Buổi chiều (shift = 2)
(N'Tiết 7', '12:30:00', '13:20:00', 2),
(N'Tiết 8', '13:20:00', '14:10:00', 2),
(N'Tiết 9', '14:10:00', '15:00:00', 2),
(N'Tiết 10', '15:10:00', '16:00:00', 2),
(N'Tiết 11', '16:00:00', '16:50:00', 2),
(N'Tiết 12', '16:50:00', '17:40:00', 2),
-- Buổi tối (shift = 3)
(N'Tiết 13', '18:00:00', '18:50:00', 3),
(N'Tiết 14', '18:50:00', '19:40:00', 3),
(N'Tiết 15', '19:50:00', '20:40:00', 3),
(N'Tiết 16', '20:40:00', '21:30:00', 3);

-- =====================================================
-- 8. DỮ LIỆU TÀI KHOẢN ADMIN
-- =====================================================
INSERT INTO Account (username, password, role, isActive)
VALUES ('admin', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'admin', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Admin System',
    'admin@iuh.edu.vn',
    '02838940390',
    N'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM',
    'https://ui-avatars.com/api/?name=Admin+System&background=0D6EFD&color=fff',
    'male',
    '1990-01-01'
);

-- =====================================================
-- 9. DỮ LIỆU GIẢNG VIÊN (5 người)
-- =====================================================
-- Giảng viên 1: CNTT
INSERT INTO Account (username, password, role, isActive)
VALUES ('gv001', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Nguyễn Văn Minh',
    'gv001.Minh@teacher.iuh.edu.vn',
    '0901234567',
    N'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM',
    'https://ui-avatars.com/api/?name=Nguyen+Van+Minh&background=198754&color=fff',
    'male',
    '1985-03-15'
);

INSERT INTO Teacher (userId, teacherCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    'GV001',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'SE')
);

-- Giảng viên 2: CNTT
INSERT INTO Account (username, password, role, isActive)
VALUES ('gv002', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Trần Thị Lan',
    'gv002.Lan@teacher.iuh.edu.vn',
    '0901234568',
    N'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM',
    'https://ui-avatars.com/api/?name=Tran+Thi+Lan&background=20C997&color=fff',
    'female',
    '1988-07-22'
);

INSERT INTO Teacher (userId, teacherCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    'GV002',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'AI')
);

-- Giảng viên 3: Cơ khí
INSERT INTO Account (username, password, role, isActive)
VALUES ('gv003', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Lê Văn Hùng',
    'gv003.Hung@teacher.iuh.edu.vn',
    '0901234569',
    N'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM',
    'https://ui-avatars.com/api/?name=Le+Van+Hung&background=DC3545&color=fff',
    'male',
    '1982-11-08'
);

INSERT INTO Teacher (userId, teacherCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    'GV003',
    (SELECT TOP 1 id FROM Department WHERE code = 'CK'),
    (SELECT TOP 1 id FROM Major WHERE code = 'CTM')
);

-- Giảng viên 4: Điện tử
INSERT INTO Account (username, password, role, isActive)
VALUES ('gv004', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Phạm Thị Mai',
    'gv004.Mai@teacher.iuh.edu.vn',
    '0901234570',
    N'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM',
    'https://ui-avatars.com/api/?name=Pham+Thi+Mai&background=FD7E14&color=fff',
    'female',
    '1987-05-12'
);

INSERT INTO Teacher (userId, teacherCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    'GV004',
    (SELECT TOP 1 id FROM Department WHERE code = 'CDT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'VT')
);

-- Giảng viên 5: QTKD
INSERT INTO Account (username, password, role, isActive)
VALUES ('gv005', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'teacher', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Hoàng Văn Đức',
    'gv005.Duc@teacher.iuh.edu.vn',
    '0901234571',
    N'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM',
    'https://ui-avatars.com/api/?name=Hoang+Van+Duc&background=6F42C1&color=fff',
    'male',
    '1983-09-25'
);

INSERT INTO Teacher (userId, teacherCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    'GV005',
    (SELECT TOP 1 id FROM Department WHERE code = 'QTKD'),
    (SELECT TOP 1 id FROM Major WHERE code = 'KT')
);

-- =====================================================
-- 10. DỮ LIỆU SINH VIÊN (20 người)
-- =====================================================
-- Sinh viên CNTT (10 người)
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026511', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Ao Công Hiếu',
    '21026511.Hieu@student.iuh.edu.vn',
    '0987654321',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Ao+Cong+Hieu&background=17A2B8&color=fff',
    'male',
    '2003-05-10'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026511',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'SE')
);

-- Sinh viên 2: CNTT - AI
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026512', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Nguyễn Thị Lan Anh',
    '21026512.LanAnh@student.iuh.edu.vn',
    '0987654322',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Nguyen+Thi+Lan+Anh&background=E83E8C&color=fff',
    'female',
    '2003-08-15'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026512',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'AI')
);

-- Sinh viên 3: CNTT - NET
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026513', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Trần Văn Minh',
    '21026513.Minh@student.iuh.edu.vn',
    '0987654323',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Tran+Van+Minh&background=28A745&color=fff',
    'male',
    '2003-02-20'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026513',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'NET')
);

-- Sinh viên 4: CNTT - SE
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026514', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Lê Thị Hương',
    '21026514.Huong@student.iuh.edu.vn',
    '0987654324',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Le+Thi+Huong&background=FFC107&color=fff',
    'female',
    '2003-11-08'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026514',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'SE')
);

-- Sinh viên 5: CNTT - AI
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026515', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Phạm Văn Đức',
    '21026515.Duc@student.iuh.edu.vn',
    '0987654325',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Pham+Van+Duc&background=17A2B8&color=fff',
    'male',
    '2003-04-12'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026515',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'AI')
);

-- Sinh viên 6: CNTT - NET
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026516', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Hoàng Thị Mai',
    '21026516.Mai@student.iuh.edu.vn',
    '0987654326',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Hoang+Thi+Mai&background=6F42C1&color=fff',
    'female',
    '2003-07-25'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026516',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'NET')
);

-- Sinh viên 7: CNTT - SE
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026517', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Vũ Văn Hùng',
    '21026517.Hung@student.iuh.edu.vn',
    '0987654327',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Vu+Van+Hung&background=DC3545&color=fff',
    'male',
    '2003-09-18'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026517',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'SE')
);

-- Sinh viên 8: CNTT - AI
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026518', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Đặng Thị Linh',
    '21026518.Linh@student.iuh.edu.vn',
    '0987654328',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Dang+Thi+Linh&background=20C997&color=fff',
    'female',
    '2003-01-30'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026518',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'AI')
);

-- Sinh viên 9: CNTT - NET
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026519', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Bùi Văn Nam',
    '21026519.Nam@student.iuh.edu.vn',
    '0987654329',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Bui+Van+Nam&background=FD7E14&color=fff',
    'male',
    '2003-06-14'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026519',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'NET')
);

-- Sinh viên 10: CNTT - SE
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026520', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Ngô Thị Thu',
    '21026520.Thu@student.iuh.edu.vn',
    '0987654330',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Ngo+Thi+Thu&background=6C757D&color=fff',
    'female',
    '2003-12-03'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026520',
    (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'SE')
);

-- Sinh viên 11: Cơ khí - CTM
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026521', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Đinh Văn Tài',
    '21026521.Tai@student.iuh.edu.vn',
    '0987654331',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Dinh+Van+Tai&background=198754&color=fff',
    'male',
    '2003-03-22'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026521',
    (SELECT TOP 1 id FROM Department WHERE code = 'CK'),
    (SELECT TOP 1 id FROM Major WHERE code = 'CTM')
);

-- Sinh viên 12: Cơ khí - CNC
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026522', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Cao Thị Hoa',
    '21026522.Hoa@student.iuh.edu.vn',
    '0987654332',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Cao+Thi+Hoa&background=E83E8C&color=fff',
    'female',
    '2003-10-11'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026522',
    (SELECT TOP 1 id FROM Department WHERE code = 'CK'),
    (SELECT TOP 1 id FROM Major WHERE code = 'CNC')
);

-- Sinh viên 13: Điện - DTCN
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026523', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Lý Văn Quang',
    '21026523.Quang@student.iuh.edu.vn',
    '0987654333',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Ly+Van+Quang&background=28A745&color=fff',
    'male',
    '2003-05-07'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026523',
    (SELECT TOP 1 id FROM Department WHERE code = 'CD'),
    (SELECT TOP 1 id FROM Major WHERE code = 'DTCN')
);

-- Sinh viên 14: Điện - TDH
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026524', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Trịnh Thị Nga',
    '21026524.Nga@student.iuh.edu.vn',
    '0987654334',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Trinh+Thi+Nga&background=FFC107&color=fff',
    'female',
    '2003-08-28'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026524',
    (SELECT TOP 1 id FROM Department WHERE code = 'CD'),
    (SELECT TOP 1 id FROM Major WHERE code = 'TDH')
);

-- Sinh viên 15: Điện tử - VT
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026525', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Võ Văn Sơn',
    '21026525.Son@student.iuh.edu.vn',
    '0987654335',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Vo+Van+Son&background=17A2B8&color=fff',
    'male',
    '2003-11-16'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026525',
    (SELECT TOP 1 id FROM Department WHERE code = 'CDT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'VT')
);

-- Sinh viên 16: Điện tử - DT
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026526', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Dương Thị Yến',
    '21026526.Yen@student.iuh.edu.vn',
    '0987654336',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Duong+Thi+Yen&background=6F42C1&color=fff',
    'female',
    '2003-02-09'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026526',
    (SELECT TOP 1 id FROM Department WHERE code = 'CDT'),
    (SELECT TOP 1 id FROM Major WHERE code = 'DT')
);

-- Sinh viên 17: QTKD - KT
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026527', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Phan Văn Bình',
    '21026527.Binh@student.iuh.edu.vn',
    '0987654337',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Phan+Van+Binh&background=DC3545&color=fff',
    'male',
    '2003-07-04'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026527',
    (SELECT TOP 1 id FROM Department WHERE code = 'QTKD'),
    (SELECT TOP 1 id FROM Major WHERE code = 'KT')
);

-- Sinh viên 18: QTKD - TC
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026528', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Lưu Thị Hạnh',
    '21026528.Hanh@student.iuh.edu.vn',
    '0987654338',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Luu+Thi+Hanh&background=20C997&color=fff',
    'female',
    '2003-12-19'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026528',
    (SELECT TOP 1 id FROM Department WHERE code = 'QTKD'),
    (SELECT TOP 1 id FROM Major WHERE code = 'TC')
);

-- Sinh viên 19: QTKD - KT
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026529', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Nguyễn Văn Cường',
    '21026529.Cuong@student.iuh.edu.vn',
    '0987654339',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Nguyen+Van+Cuong&background=FD7E14&color=fff',
    'male',
    '2003-04-26'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026529',
    (SELECT TOP 1 id FROM Department WHERE code = 'QTKD'),
    (SELECT TOP 1 id FROM Major WHERE code = 'KT')
);

-- Sinh viên 20: Ngoại ngữ - TA
INSERT INTO Account (username, password, role, isActive)
VALUES ('21026530', '$2b$10$Yrn9g4GJ7VmaD0atsM.EzurUFzq7D7qr9y4RkPAGYRLfBtMG9sthi', 'student', 1);

INSERT INTO [User] (accountId, fullName, email, phone, address, avatar, gender, dateOfBirth)
VALUES (
    SCOPE_IDENTITY(),
    N'Trần Thị Phương',
    '21026530.Phuong@student.iuh.edu.vn',
    '0987654340',
    N'TP.HCM',
    'https://ui-avatars.com/api/?name=Tran+Thi+Phuong&background=6C757D&color=fff',
    'female',
    '2003-09-13'
);

INSERT INTO Student (userId, studentCode, departmentId, majorId)
VALUES (
    SCOPE_IDENTITY(),
    '21026530',
    (SELECT TOP 1 id FROM Department WHERE code = 'NN'),
    (SELECT TOP 1 id FROM Major WHERE code = 'TA')
);

-- =====================================================
-- 11. DỮ LIỆU PHÒNG HỌC
-- =====================================================
-- Phòng học Khoa CNTT (Dãy H, A)
INSERT INTO ClassRoom (code, name, capacity, building, floor, campus, classRoomTypeId, departmentId, isAvailable, description)
VALUES 
-- Dãy H - CNTT (Lý thuyết = 1, Thực hành = 2, Online = 3)
('H1.1', N'Phòng lý thuyết H1.1', 50, N'Tòa H', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng lý thuyết CNTT tầng 1'),
('H1.2', N'Phòng lý thuyết H1.2', 50, N'Tòa H', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng lý thuyết CNTT tầng 1'),
('H2.1', N'Phòng lý thuyết H2.1', 60, N'Tòa H', 2, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng lý thuyết CNTT tầng 2'),
('H2.2', N'Phòng lý thuyết H2.2', 60, N'Tòa H', 2, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng lý thuyết CNTT tầng 2'),
('H3.1', N'Phòng thực hành H3.1', 30, N'Tòa H', 3, N'Cơ sở chính', 2, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng thực hành CNTT tầng 3'),
('H3.2', N'Phòng thực hành H3.2', 30, N'Tòa H', 3, N'Cơ sở chính', 2, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng thực hành CNTT tầng 3'),
('H3.3', N'Phòng thực hành H3.3', 30, N'Tòa H', 3, N'Cơ sở chính', 2, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng thực hành CNTT tầng 3'),
('H3.4', N'Phòng thực hành H3.4', 30, N'Tòa H', 3, N'Cơ sở chính', 2, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng thực hành CNTT tầng 3'),

-- Dãy A - CNTT
('A1.1', N'Phòng lý thuyết A1.1', 80, N'Tòa A', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng lý thuyết CNTT tầng 1'),
('A1.2', N'Phòng lý thuyết A1.2', 80, N'Tòa A', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng lý thuyết CNTT tầng 1'),
('A2.1', N'Phòng lý thuyết A2.1', 100, N'Tòa A', 2, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), 1, N'Phòng lý thuyết CNTT tầng 2'),

-- Phòng học Khoa Cơ khí (Dãy D, B)
('D1.1', N'Phòng lý thuyết D1.1', 60, N'Tòa D', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CK'), 1, N'Phòng lý thuyết Cơ khí tầng 1'),
('D1.2', N'Phòng lý thuyết D1.2', 60, N'Tòa D', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CK'), 1, N'Phòng lý thuyết Cơ khí tầng 1'),
('B1.1', N'Phòng thực hành B1.1', 25, N'Tòa B', 1, N'Cơ sở chính', 2, (SELECT TOP 1 id FROM Department WHERE code = 'CK'), 1, N'Phòng thực hành Cơ khí tầng 1'),
('B1.2', N'Phòng thực hành B1.2', 25, N'Tòa B', 1, N'Cơ sở chính', 2, (SELECT TOP 1 id FROM Department WHERE code = 'CK'), 1, N'Phòng thực hành Cơ khí tầng 1'),

-- Phòng học Khoa Điện tử (Dãy V)
('V1.1', N'Phòng lý thuyết V1.1', 50, N'Tòa V', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'CDT'), 1, N'Phòng lý thuyết Điện tử tầng 1'),
('V2.1', N'Phòng thực hành V2.1', 30, N'Tòa V', 2, N'Cơ sở chính', 2, (SELECT TOP 1 id FROM Department WHERE code = 'CDT'), 1, N'Phòng thực hành Điện tử tầng 2'),

-- Phòng học Khoa QTKD (Dãy X)
('X1.1', N'Phòng lý thuyết X1.1', 70, N'Tòa X', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'QTKD'), 1, N'Phòng lý thuyết QTKD tầng 1'),
('X1.2', N'Phòng lý thuyết X1.2', 70, N'Tòa X', 1, N'Cơ sở chính', 1, (SELECT TOP 1 id FROM Department WHERE code = 'QTKD'), 1, N'Phòng lý thuyết QTKD tầng 1'),

-- Phòng học chung
('CHUNG1', N'Phòng học chung 1', 150, N'Tòa Trung tâm', 1, N'Cơ sở chính', 1, NULL, 1, N'Phòng học chung lớn'),
('CHUNG2', N'Phòng học chung 2', 200, N'Tòa Trung tâm', 2, N'Cơ sở chính', 1, NULL, 1, N'Phòng học chung rất lớn');

-- =====================================================
-- 12. DỮ LIỆU LỚP HỌC (chưa có phòng)
-- =====================================================
INSERT INTO Class (code, className, subjectName, subjectCode, credits, teacherId, departmentId, majorId, semester, academicYear, maxStudents, totalWeeks, startDate, endDate, classRoomTypeId, description)
VALUES 
-- Lớp CNTT (Lý thuyết = 1, Thực hành = 2, Online = 3)
('COMP101', N'Lập trình cơ bản', N'Nhập môn lập trình', 'NMLT', 3, 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), (SELECT TOP 1 id FROM Major WHERE code = 'SE'), N'Học kỳ 1', '2024-2025', 50, 15, '2024-09-01', '2024-12-15', 1, N'Môn học cơ bản về lập trình'),
('COMP102', N'Cơ sở dữ liệu', N'Cơ sở dữ liệu', 'CSDL', 4, 2, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), (SELECT TOP 1 id FROM Major WHERE code = 'SE'), N'Học kỳ 1', '2024-2025', 40, 15, '2024-09-01', '2024-12-15', 1, N'Môn học về cơ sở dữ liệu'),
('COMP103', N'Lập trình Web', N'Lập trình Web', 'LTW', 3, 1, (SELECT TOP 1 id FROM Department WHERE code = 'CNTT'), (SELECT TOP 1 id FROM Major WHERE code = 'SE'), N'Học kỳ 1', '2024-2025', 35, 15, '2024-09-01', '2024-12-15', 1, N'Môn học lập trình Web'),

-- Lớp Cơ khí
('MECH101', N'Cơ học kỹ thuật', N'Cơ học kỹ thuật', 'CHKT', 3, 3, (SELECT TOP 1 id FROM Department WHERE code = 'CK'), (SELECT TOP 1 id FROM Major WHERE code = 'CTM'), N'Học kỳ 1', '2024-2025', 45, 15, '2024-09-01', '2024-12-15', 1, N'Môn học cơ học kỹ thuật'),
('MECH102', N'Thực hành CNC', N'Thực hành CNC', 'THCNC', 2, 3, (SELECT TOP 1 id FROM Department WHERE code = 'CK'), (SELECT TOP 1 id FROM Major WHERE code = 'CNC'), N'Học kỳ 1', '2024-2025', 20, 15, '2024-09-01', '2024-12-15', 2, N'Môn học thực hành CNC'),

-- Lớp Điện tử
('ELEC101', N'Điện tử cơ bản', N'Điện tử cơ bản', 'DTCB', 3, 4, (SELECT TOP 1 id FROM Department WHERE code = 'CDT'), (SELECT TOP 1 id FROM Major WHERE code = 'VT'), N'Học kỳ 1', '2024-2025', 40, 15, '2024-09-01', '2024-12-15', 1, N'Môn học điện tử cơ bản'),

-- Lớp QTKD
('BUS101', N'Kế toán tài chính', N'Kế toán tài chính', 'KTTN', 3, 5, (SELECT TOP 1 id FROM Department WHERE code = 'QTKD'), (SELECT TOP 1 id FROM Major WHERE code = 'KT'), N'Học kỳ 1', '2024-2025', 60, 15, '2024-09-01', '2024-12-15', 1, N'Môn học kế toán tài chính');

-- =====================================================
-- 13. DỮ LIỆU LỊCH HỌC (chưa có phòng - status = pending)
-- =====================================================
INSERT INTO ClassSchedule (classId, teacherId, classRoomId, dayOfWeek, timeSlotId, weekPattern, startWeek, endWeek, status, assignedBy, assignedAt, note)
VALUES 
-- Lớp COMP101 (mixed): Thứ 3, tiết 1-3 và Thứ 5, tiết 7-9
-- TIẾT HỌC ĐÃ CỐ ĐỊNH - Admin chỉ cần gán phòng
(1, 1, NULL, 3, 1, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch học lý thuyết COMP101 - Tiết 1-3 cố định, chờ phân phòng'),
(1, 1, NULL, 5, 7, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch thực hành COMP101 - Tiết 7-9 cố định, chờ phân phòng'),

-- Lớp COMP102 (mixed): Thứ 2, tiết 4-6 và Thứ 4, tiết 7-9
(2, 2, NULL, 2, 4, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch học lý thuyết COMP102 - Chờ phân phòng'),
(2, 2, NULL, 4, 7, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch thực hành COMP102 - Chờ phân phòng'),

-- Lớp COMP103 (theory): Thứ 6, tiết 4-6
(3, 1, NULL, 6, 4, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch học lý thuyết COMP103 - Chờ phân phòng'),

-- Lớp MECH101 (mixed): Thứ 2, tiết 1-3 và Thứ 4, tiết 7-9
(4, 3, NULL, 2, 1, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch học lý thuyết MECH101 - Chờ phân phòng'),
(4, 3, NULL, 4, 7, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch thực hành MECH101 - Chờ phân phòng'),

-- Lớp MECH102 (practice): Thứ 7, tiết 7-9
(5, 3, NULL, 7, 7, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch thực hành MECH102 - Chờ phân phòng'),

-- Lớp ELEC101 (mixed): Thứ 3, tiết 4-6 và Thứ 5, tiết 7-9
(6, 4, NULL, 3, 4, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch học lý thuyết ELEC101 - Chờ phân phòng'),
(6, 4, NULL, 5, 7, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch thực hành ELEC101 - Chờ phân phòng'),

-- Lớp BUS101 (theory): Thứ 2, tiết 7-9
(7, 5, NULL, 2, 7, 'weekly', 1, 15, 'pending', NULL, NULL, N'Lịch học lý thuyết BUS101 - Chờ phân phòng');

-- =====================================================
-- 14. DỮ LIỆU YÊU CẦU THAY ĐỔI LỊCH HỌC
-- =====================================================
INSERT INTO ScheduleRequest (requestTypeId, classScheduleId, classRoomId, requesterId, requestDate, timeSlotId, changeType, oldClassRoomId, newClassRoomId, oldTimeSlotId, newTimeSlotId, exceptionDate, exceptionType, reason, approvedBy, requestStatusId, approvedAt, note)
VALUES 
-- Yêu cầu phòng độc lập (Đổi phòng = 1)
(1, NULL, 1, 1, '2024-10-15', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'Yêu cầu phòng cho buổi thuyết trình', NULL, 1, NULL, NULL),

-- Yêu cầu thay đổi phòng học (Đổi phòng = 1)
(1, 1, NULL, 1, '2024-10-15', 1, 'room_change', 1, 2, NULL, NULL, NULL, NULL, N'Phòng hiện tại quá nhỏ cho số lượng sinh viên', 1, 2, '2024-10-01 10:00:00', N'Admin đã phê duyệt thay đổi phòng'),

-- Yêu cầu thay đổi tiết học (Đổi lịch = 2)
(2, 2, NULL, 2, '2024-10-15', 7, 'time_change', NULL, NULL, 7, 10, NULL, NULL, N'Giảng viên có lịch trùng với tiết 7-9', 1, 1, NULL, N'Đang chờ admin xem xét'),

-- Yêu cầu thay đổi cả phòng và tiết (Đổi lịch = 2)
(2, 3, NULL, 3, '2024-10-15', 4, 'both', 2, 3, 4, 5, NULL, NULL, N'Phòng và tiết hiện tại không phù hợp', NULL, 1, NULL, N'Chờ admin phê duyệt'),

-- Ngoại lệ: Chuyển sang thi (Thi = 4)
(4, 1, NULL, 1, '2024-10-15', 1, 'exception', NULL, NULL, NULL, NULL, '2025-09-07', 'exam', N'Chuyển từ học sang thi giữa kỳ', 1, 2, '2024-10-01 10:00:00', N'Admin đã phê duyệt chuyển sang thi'),

-- Ngoại lệ: Nghỉ học (Tạm ngưng = 3)
(3, 2, NULL, 2, '2024-10-15', 7, 'exception', NULL, NULL, NULL, NULL, '2025-09-07', 'cancelled', N'Nghỉ học do bão', NULL, 1, NULL, N'Chờ admin phê duyệt'),

-- Ngoại lệ: Chuyển sang ngày khác (Đổi lịch = 2)
(2, 3, NULL, 3, '2024-10-15', 4, 'exception', NULL, NULL, NULL, NULL, '2025-09-07', 'moved', N'Chuyển lớp do nghỉ lễ', NULL, 1, NULL, N'Chờ admin phê duyệt');

-- =====================================================
-- END OF SAMPLE DATA
-- =====================================================
