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

// Lấy lịch học theo tuần
const getWeeklySchedule = async (weekStartDate, filters = {}) => {
  try {
    // Tính toán ngày bắt đầu và kết thúc tuần
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

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
      WHERE cs.status IN ('assigned', 'active')
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

    query += ' ORDER BY cs.dayOfWeek, ts.startTime';

    const result = await db.query(query, params);
    return result.recordset;
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