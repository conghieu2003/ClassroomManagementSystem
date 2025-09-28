-- Script để cập nhật một số lớp đã có phòng cho testing
USE ClassroomManagement;

-- Cập nhật một số lớp của giảng viên 1 (gv001) đã có phòng
UPDATE ClassSchedule 
SET 
    classRoomId = 1,  -- Phòng H1.1
    statusId = 2,     -- Đã phân phòng
    assignedBy = 1,   -- Admin ID
    assignedAt = GETDATE()
WHERE teacherId = 1 AND classId = 1 AND dayOfWeek = 3 AND timeSlotId = 1;

UPDATE ClassSchedule 
SET 
    classRoomId = 2,  -- Phòng H1.2
    statusId = 2,     -- Đã phân phòng
    assignedBy = 1,   -- Admin ID
    assignedAt = GETDATE()
WHERE teacherId = 1 AND classId = 3 AND dayOfWeek = 6 AND timeSlotId = 4;

-- Cập nhật một số lớp của giảng viên 2 (gv002) đã có phòng
UPDATE ClassSchedule 
SET 
    classRoomId = 3,  -- Phòng H2.1
    statusId = 2,     -- Đã phân phòng
    assignedBy = 1,   -- Admin ID
    assignedAt = GETDATE()
WHERE teacherId = 2 AND classId = 2 AND dayOfWeek = 2 AND timeSlotId = 4;

-- Hiển thị kết quả
SELECT 
    cs.id,
    c.className,
    c.subjectName,
    t.teacherCode,
    cr.name as roomName,
    cs.dayOfWeek,
    ts.slotName,
    cs.statusId
FROM ClassSchedule cs
INNER JOIN Class c ON cs.classId = c.id
INNER JOIN Teacher t ON cs.teacherId = t.id
LEFT JOIN ClassRoom cr ON cs.classRoomId = cr.id
LEFT JOIN TimeSlot ts ON cs.timeSlotId = ts.id
WHERE cs.classRoomId IS NOT NULL
ORDER BY cs.teacherId, cs.dayOfWeek, cs.timeSlotId;
