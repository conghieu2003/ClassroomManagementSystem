const db = require('../config/db.config');
const PDFDocument = require('pdfkit');

// Lấy danh sách lịch học với filter
const getSchedules = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        cs.id,
        cs.classId,
        c.className,
        c.code as classCode,
        c.subjectCode,
        cs.teacherId,
        u.fullName as teacherName,
        cs.classRoomId,
        cr.name as roomName,
        cs.dayOfWeek,
        ts.slotName as timeSlot,
        CONCAT(ts.startTime, '-', ts.endTime) as timeRange,
        ts.shift,
        CASE 
          WHEN c.classType = 'theory' THEN 'theory'
          WHEN c.classType = 'practice' THEN 'practice'
          WHEN c.classType = 'mixed' THEN 'theory'
          ELSE 'theory'
        END as type,
        cs.status,
        cs.weekPattern,
        cs.startWeek,
        cs.endWeek
      FROM ClassSchedule cs
      INNER JOIN Class c ON cs.classId = c.id
      INNER JOIN Teacher t ON cs.teacherId = t.id
      INNER JOIN [User] u ON t.userId = u.id
      INNER JOIN TimeSlot ts ON cs.timeSlotId = ts.id
      LEFT JOIN ClassRoom cr ON cs.classRoomId = cr.id
      WHERE 1=1
    `;

    const params = [];

    // Filter theo khoa
    if (filters.departmentId) {
      query += ' AND c.departmentId = ?';
      params.push(filters.departmentId);
    }

    // Filter theo lớp
    if (filters.classId) {
      query += ' AND cs.classId = ?';
      params.push(filters.classId);
    }

    // Filter theo giảng viên
    if (filters.teacherId) {
      query += ' AND cs.teacherId = ?';
      params.push(filters.teacherId);
    }

    // Filter theo loại lịch
    if (filters.scheduleType && filters.scheduleType !== 'all') {
      if (filters.scheduleType === 'study') {
        query += ' AND c.classType IN (?, ?)';
        params.push('theory', 'practice');
      } else if (filters.scheduleType === 'exam') {
        query += ' AND cs.status = ?';
        params.push('exam');
      }
    }

    // Filter theo ngày
    if (filters.startDate) {
      query += ' AND cs.createdAt >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND cs.createdAt <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY cs.dayOfWeek, ts.startTime';

    const result = await db.query(query, params);
    return result.recordset;
  } catch (error) {
    console.error('Error in getSchedules:', error);
    throw error;
  }
};

// Lấy lịch học theo tuần với thông tin ngoại lệ
const getWeeklySchedule = async (weekStartDate, filters = {}) => {
  try {
    // Tính toán ngày bắt đầu và kết thúc tuần
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    console.log('🔍 [DEBUG] Weekly schedule date range:', {
      weekStartDate,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    // Build where clause
    const whereClause = {
      OR: [
        { statusId: { in: [2, 3, 5, 6] } }, // Đã phân phòng, Đang hoạt động, Tạm ngưng, Thi
        { 
          AND: [
            { statusId: 1 }, // Chờ phân phòng
            { classRoomId: { not: null } } // Nhưng đã có phòng (từ yêu cầu đã được chấp nhận)
          ]
        }
      ]
    };

    // Filter theo khoa
    if (filters.departmentId) {
      whereClause.class = {
        departmentId: filters.departmentId
      };
    }

    // Filter theo lớp
    if (filters.classId) {
      whereClause.classId = filters.classId;
    }

    // Filter theo giảng viên
    if (filters.teacherId) {
      whereClause.teacherId = filters.teacherId;
    }

    // Filter theo loại lịch
    if (filters.scheduleType && filters.scheduleType !== 'all') {
      if (filters.scheduleType === 'study') {
        whereClause.OR = [
          { statusId: { in: [2, 3] } }, // Đã phân phòng, Đang hoạt động
          { 
            AND: [
              { statusId: 1 }, // Chờ phân phòng
              { classRoomId: { not: null } } // Nhưng đã có phòng
            ]
          }
        ];
      } else if (filters.scheduleType === 'exam') {
        whereClause.OR = [
          { statusId: 6 } // Chỉ lấy lịch thi
        ];
      }
    }

    const schedules = await db.classSchedule.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            department: true,
            major: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        },
        timeSlot: true,
        classRoom: true,
        ClassRoomType: true,
        RequestType: true,
         scheduleRequests: {
           where: {
             requestStatusId: 2, // Chỉ lấy các yêu cầu đã được phê duyệt (admin tạo hoặc đã xử lý)
             requestTypeId: { in: [3, 4, 5, 6, 7, 8, 9] } // Lấy tất cả loại ngoại lệ (ID 3-9)
           },
           include: {
             RequestType: true
           }
         }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { timeSlot: { startTime: 'asc' } }
      ]
    });

    // Debug: Kiểm tra tất cả scheduleRequests trước khi filter
    console.log('🔍 [DEBUG] All schedules found:', schedules.length);
    schedules.forEach(schedule => {
      if (schedule.id === 1) {
        console.log('🔍 [DEBUG] Schedule 1 details:', {
          id: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          scheduleRequestsCount: schedule.scheduleRequests.length,
          scheduleRequests: schedule.scheduleRequests.map(req => ({
            id: req.id,
            requestTypeId: req.requestTypeId,
            requestStatusId: req.requestStatusId,
            exceptionDate: req.exceptionDate,
            exceptionType: req.exceptionType,
            reason: req.reason,
            RequestType: req.RequestType
          }))
        });
      }
    });

    // Transform data to match expected format
    const result = schedules.map(schedule => {
      // Filter scheduleRequests theo ngày chính xác trong tuần
      const relevantExceptions = schedule.scheduleRequests.filter(request => {
        if (!request.exceptionDate) return false;
        
        const exceptionDate = new Date(request.exceptionDate);
        const exceptionDateStr = exceptionDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Tính ngày của schedule trong tuần hiện tại
        // dayOfWeek: 1=CN, 2=T2, 3=T3, 4=T4, 5=T5, 6=T6, 7=T7
        const startDate = new Date(weekStartDate);
        const scheduleDayOffset = schedule.dayOfWeek - 1; // 1=CN -> 0, 2=T2 -> 1, 3=T3 -> 2, ...
        const scheduleDate = new Date(startDate);
        scheduleDate.setDate(startDate.getDate() + scheduleDayOffset);
        const scheduleDateStr = scheduleDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Chỉ lấy ngoại lệ khi ngày ngoại lệ khớp chính xác với ngày của schedule
        const isRelevant = exceptionDateStr === scheduleDateStr;
        
        // Debug log cho schedule ID 1
        if (schedule.id === 1) {
          console.log('🔍 [DEBUG] Date filter for schedule 1:', {
            scheduleId: schedule.id,
            scheduleDayOfWeek: schedule.dayOfWeek,
            scheduleDateStr: scheduleDateStr,
            exceptionDate: request.exceptionDate,
            exceptionDateStr,
            isRelevant: isRelevant
          });
        }
        
        return isRelevant;
      });
      
      // Get the first exception if exists
      const exception = relevantExceptions.length > 0 ? relevantExceptions[0] : null;
      
      // Debug log để kiểm tra ngoại lệ
      if (schedule.id === 1) { // classScheduleId = 1
        console.log('🔍 [DEBUG] Schedule ID 1:', {
          scheduleId: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          allScheduleRequests: schedule.scheduleRequests.map(req => ({
            id: req.id,
            requestTypeId: req.requestTypeId,
            requestStatusId: req.requestStatusId,
            exceptionDate: req.exceptionDate,
            exceptionType: req.exceptionType,
            reason: req.reason
          })),
          relevantExceptions: relevantExceptions.map(req => ({
            id: req.id,
            requestTypeId: req.requestTypeId,
            requestStatusId: req.requestStatusId,
            exceptionDate: req.exceptionDate,
            exceptionType: req.exceptionType,
            reason: req.reason
          })),
          exception: exception ? {
            id: exception.id,
            requestTypeId: exception.requestTypeId,
            requestStatusId: exception.requestStatusId,
            exceptionDate: exception.exceptionDate,
            exceptionType: exception.exceptionType,
            reason: exception.reason
          } : null,
          weekStartDate,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
      }
      
      return {
        id: schedule.id,
        classId: schedule.classId,
        className: schedule.class.className,
        classCode: schedule.class.code,
        subjectCode: schedule.class.subjectCode,
        subjectName: schedule.class.subjectName,
        teacherId: schedule.teacherId,
        teacherName: schedule.teacher.user.fullName,
        teacherCode: schedule.teacher.teacherCode,
        roomId: schedule.classRoomId,
        roomName: schedule.classRoom?.name || null,
        roomCode: schedule.classRoom?.code || null,
        roomType: schedule.ClassRoomType.name,
        dayOfWeek: schedule.dayOfWeek,
        timeSlot: schedule.timeSlot.slotName,
        timeRange: `${schedule.timeSlot.startTime}-${schedule.timeSlot.endTime}`,
        startTime: schedule.timeSlot.startTime,
        endTime: schedule.timeSlot.endTime,
        shift: schedule.timeSlot.shift,
        shiftName: schedule.timeSlot.shift === 1 ? 'morning' : 
                   schedule.timeSlot.shift === 2 ? 'afternoon' : 'evening',
        type: schedule.ClassRoomType.name === 'Lý thuyết' ? 'theory' :
              schedule.ClassRoomType.name === 'Thực hành' ? 'practice' : 'online',
        status: schedule.RequestType.name,
        statusId: schedule.statusId,
        weekPattern: schedule.weekPattern,
        startWeek: schedule.startWeek,
        endWeek: schedule.endWeek,
        practiceGroup: schedule.practiceGroup,
        maxStudents: schedule.class.maxStudents,
        departmentId: schedule.class.departmentId,
        departmentName: schedule.class.department?.name || null,
        majorId: schedule.class.majorId,
        majorName: schedule.class.major?.name || null,
        timeSlotOrder: schedule.timeSlot.id,
        assignedAt: schedule.assignedAt,
        note: schedule.note,
        // Exception data
        exceptionDate: exception?.exceptionDate || null,
        exceptionType: exception?.exceptionType || null,
        exceptionReason: exception?.reason || null,
        exceptionStatus: exception?.RequestType?.name || null,
        requestTypeId: exception?.requestTypeId || null
      };
    });

    // Debug: Kiểm tra kết quả cuối cùng
    console.log('🔍 [DEBUG] Final result for schedule ID 1:', result.find(r => r.id === 1));

    return result;
  } catch (error) {
    console.error('Error in getWeeklySchedule:', error);
    throw error;
  }
};

// Lấy danh sách khoa
const getDepartments = async () => {
  try {
    const query = 'SELECT id, code, name FROM Department ORDER BY name';
    const result = await db.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error in getDepartments:', error);
    throw error;
  }
};

// Lấy danh sách lớp học
const getClasses = async (departmentId) => {
  try {
    let query = 'SELECT id, code, className, departmentId FROM Class';
    const params = [];

    if (departmentId) {
      query += ' WHERE departmentId = ?';
      params.push(departmentId);
    }

    query += ' ORDER BY className';

    const result = await db.query(query, params);
    return result.recordset;
  } catch (error) {
    console.error('Error in getClasses:', error);
    throw error;
  }
};

// Lấy danh sách giảng viên
const getTeachers = async (departmentId) => {
  try {
    let query = `
      SELECT t.id, u.fullName as name, t.teacherCode as code, t.departmentId
      FROM Teacher t
      INNER JOIN [User] u ON t.userId = u.id
    `;
    const params = [];

    if (departmentId) {
      query += ' WHERE t.departmentId = ?';
      params.push(departmentId);
    }

    query += ' ORDER BY u.fullName';

    const result = await db.query(query, params);
    return result.recordset;
  } catch (error) {
    console.error('Error in getTeachers:', error);
    throw error;
  }
};

// Tạo lịch học mới
const createSchedule = async (scheduleData) => {
  try {
    const {
      classId,
      teacherId,
      classRoomId,
      dayOfWeek,
      timeSlotId,
      weekPattern,
      startWeek,
      endWeek,
      status,
      assignedBy,
      note
    } = scheduleData;

    const query = `
      INSERT INTO ClassSchedule 
      (classId, teacherId, classRoomId, dayOfWeek, timeSlotId, weekPattern, startWeek, endWeek, status, assignedBy, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      classId,
      teacherId,
      classRoomId,
      dayOfWeek,
      timeSlotId,
      weekPattern,
      startWeek,
      endWeek,
      status || 'pending',
      assignedBy,
      note
    ];

    const result = await db.query(query, params);
    return { id: result.recordset.insertId, ...scheduleData };
  } catch (error) {
    console.error('Error in createSchedule:', error);
    throw error;
  }
};

// Cập nhật lịch học
const updateSchedule = async (id, scheduleData) => {
  try {
    const {
      classId,
      teacherId,
      classRoomId,
      dayOfWeek,
      timeSlotId,
      weekPattern,
      startWeek,
      endWeek,
      status,
      assignedBy,
      note
    } = scheduleData;

    const query = `
      UPDATE ClassSchedule 
      SET classId = ?, teacherId = ?, classRoomId = ?, dayOfWeek = ?, timeSlotId = ?, 
          weekPattern = ?, startWeek = ?, endWeek = ?, status = ?, assignedBy = ?, note = ?,
          updatedAt = GETDATE()
      WHERE id = ?
    `;

    const params = [
      classId,
      teacherId,
      classRoomId,
      dayOfWeek,
      timeSlotId,
      weekPattern,
      startWeek,
      endWeek,
      status,
      assignedBy,
      note,
      id
    ];

    await db.query(query, params);
    return { id, ...scheduleData };
  } catch (error) {
    console.error('Error in updateSchedule:', error);
    throw error;
  }
};

// Xóa lịch học
const deleteSchedule = async (id) => {
  try {
    const query = 'DELETE FROM ClassSchedule WHERE id = ?';
    await db.query(query, [id]);
  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    throw error;
  }
};

// In lịch học (tạo PDF)
const printSchedule = async (filters = {}) => {
  try {
    const schedules = await getSchedules(filters);
    
    const doc = new PDFDocument();
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      // PDF generation completed
    });

    // Header
    doc.fontSize(20).text('Lịch học, lịch thi theo tuần', 50, 50);
    doc.fontSize(12).text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 50, 80);

    // Table headers
    let y = 120;
    doc.fontSize(10);
    doc.text('Lớp học', 50, y);
    doc.text('Giảng viên', 150, y);
    doc.text('Phòng', 250, y);
    doc.text('Thứ', 300, y);
    doc.text('Tiết', 350, y);
    doc.text('Trạng thái', 400, y);

    y += 20;
    doc.moveTo(50, y).lineTo(500, y).stroke();

    // Schedule data
    schedules.forEach(schedule => {
      y += 20;
      doc.text(schedule.className || '', 50, y);
      doc.text(schedule.teacherName || '', 150, y);
      doc.text(schedule.roomName || 'Chưa sắp xếp', 250, y);
      doc.text(schedule.dayOfWeek ? `Thứ ${schedule.dayOfWeek}` : '', 300, y);
      doc.text(schedule.timeSlot || '', 350, y);
      doc.text(schedule.status || '', 400, y);
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
    });
  } catch (error) {
    console.error('Error in printSchedule:', error);
    throw error;
  }
};

module.exports = {
  getSchedules,
  getWeeklySchedule,
  getDepartments,
  getClasses,
  getTeachers,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  printSchedule
};