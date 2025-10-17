const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tạo ngoại lệ lịch học
const createScheduleException = async (data) => {
  const {
    classScheduleId,
    exceptionDate,
    exceptionType,
    requestTypeId,
    newTimeSlotId,
    newClassRoomId,
    newDate,
    substituteTeacherId,
    reason,
    note,
    requesterId
  } = data;
  
  try {
    // Validation
    if (!classScheduleId || !exceptionDate || !exceptionType || !requestTypeId || !requesterId || !reason) {
      throw new Error('Thiếu thông tin bắt buộc');
    }

    // Kiểm tra lịch học có tồn tại không
    const schedule = await prisma.classSchedule.findFirst({
      where: {
        id: classScheduleId,
        statusId: 2 // active status
      },
      include: {
        class: true,
        teacher: {
          include: {
            user: true
          }
        },
        classRoom: true,
        timeSlot: true
      }
    });

    if (!schedule) {
      throw new Error('Không tìm thấy lịch học hoặc lịch học không hoạt động');
    }

    // Kiểm tra ngày ngoại lệ có nằm trong khoảng thời gian của lịch học không
    const exceptionDateObj = new Date(exceptionDate);
    const startDate = new Date(schedule.class.startDate);
    const endDate = new Date(schedule.class.endDate);

    if (exceptionDateObj < startDate || exceptionDateObj > endDate) {
      throw new Error('Ngày ngoại lệ phải nằm trong khoảng thời gian của lịch học');
    }

    // Kiểm tra đã có ngoại lệ cho ngày này chưa
    const existingException = await prisma.scheduleRequest.findFirst({
      where: {
        classScheduleId: classScheduleId,
        exceptionDate: new Date(exceptionDate),
        requestTypeId: requestTypeId
      }
    });

    if (existingException) {
      throw new Error('Đã có ngoại lệ cho ngày này');
    }

    // Tạo ngoại lệ lịch học
    const newException = await prisma.scheduleRequest.create({
      data: {
        requestTypeId: requestTypeId,
        classScheduleId: classScheduleId,
        requesterId: requesterId,
        requestDate: new Date(),
        timeSlotId: schedule.timeSlotId,
        exceptionDate: new Date(exceptionDate),
        exceptionType: exceptionType,
        newTimeSlotId: newTimeSlotId || null,
        newClassRoomId: newClassRoomId || null,
        movedToDate: newDate ? new Date(newDate) : null,
        movedToTimeSlotId: newTimeSlotId || null,
        movedToClassRoomId: newClassRoomId || null,
        substituteTeacherId: substituteTeacherId || null,
        reason: reason,
        requestStatusId: 2, // Completed status
        note: note || null
      },
      include: {
        classSchedule: {
          include: {
            class: true,
            teacher: {
              include: {
                user: true
              }
            },
            classRoom: true,
            timeSlot: true
          }
        },
        RequestStatus: true,
        requester: true
      }
    });

    return newException;

  } catch (error) {
    throw error;
  }
};

// Lấy danh sách ngoại lệ lịch học
const getScheduleExceptions = async (params) => {
  const { page, limit, scheduleId, exceptionType, userId } = params;
  const offset = (page - 1) * limit;

  try {
    const whereConditions = {
      requestTypeId: { in: [3, 4, 5, 6, 7, 8, 9] } // Lấy tất cả loại ngoại lệ (ID 3-9)
    };

    if (scheduleId) {
      whereConditions.classScheduleId = parseInt(scheduleId);
    }

    if (exceptionType) {
      whereConditions.exceptionType = exceptionType;
    }

    if (userId) {
      whereConditions.requesterId = parseInt(userId);
    }

    const [exceptions, total] = await Promise.all([
      prisma.scheduleRequest.findMany({
        where: whereConditions,
        include: {
          classSchedule: {
            include: {
              class: true,
              teacher: {
                include: {
                  user: true
                }
              },
              classRoom: true,
              timeSlot: true
            }
          },
          RequestStatus: true,
          requester: true,
          newClassRoom: true,
          newTimeSlot: true,
          substituteTeacher: {
            include: {
              user: true
            }
          }
        },
        orderBy: [
          { exceptionDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.scheduleRequest.count({
        where: whereConditions
      })
    ]);

  return {
      data: exceptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };

  } catch (error) {
    throw error;
  }
};

// Lấy chi tiết ngoại lệ lịch học
const getScheduleExceptionById = async (id) => {
  try {
    const exception = await prisma.scheduleRequest.findFirst({
      where: {
        id: parseInt(id),
        requestTypeId: { in: [3, 4, 5, 6, 7, 8, 9] } // Lấy tất cả loại ngoại lệ
      },
      include: {
        classSchedule: {
          include: {
            class: true,
            teacher: {
              include: {
                user: true
              }
            },
            classRoom: true,
            timeSlot: true
          }
        },
        RequestStatus: true,
        requester: true,
        newClassRoom: true,
        newTimeSlot: true,
        substituteTeacher: {
          include: {
            user: true
          }
        }
      }
    });

    return exception;

  } catch (error) {
    throw error;
  }
};

// Cập nhật ngoại lệ lịch học
const updateScheduleException = async (id, updateData, userId) => {
  const {
    exceptionType,
    newTimeSlotId,
    newClassRoomId,
    newDate,
    substituteTeacherId,
    reason,
    note,
    requestStatusId
  } = updateData;
  
  try {
    // Kiểm tra ngoại lệ có tồn tại không
    const existingException = await prisma.scheduleRequest.findFirst({
      where: {
        id: parseInt(id),
        requestTypeId: { in: [3, 4, 5, 6, 7, 8, 9] } // Lấy tất cả loại ngoại lệ
      }
    });

    if (!existingException) {
      throw new Error('Không tìm thấy ngoại lệ lịch học');
    }

    // Cập nhật ngoại lệ
    const updatedException = await prisma.scheduleRequest.update({
      where: {
        id: parseInt(id)
      },
      data: {
        exceptionType: exceptionType,
        newTimeSlotId: newTimeSlotId || null,
        newClassRoomId: newClassRoomId || null,
        movedToDate: newDate || null,
        movedToTimeSlotId: newTimeSlotId || null,
        movedToClassRoomId: newClassRoomId || null,
        substituteTeacherId: substituteTeacherId || null,
        reason: reason,
        note: note || null,
        requestStatusId: requestStatusId || 2
      },
      include: {
        classSchedule: {
          include: {
            class: true,
            teacher: {
              include: {
                user: true
              }
            },
            classRoom: true,
            timeSlot: true
          }
        },
        RequestStatus: true,
        requester: true,
        newClassRoom: true,
        newTimeSlot: true,
        substituteTeacher: {
          include: {
            user: true
          }
        }
      }
    });

    return updatedException;

  } catch (error) {
    throw error;
  }
};

// Xóa ngoại lệ lịch học
const deleteScheduleException = async (id, userId) => {
  try {
    const result = await prisma.scheduleRequest.deleteMany({
      where: {
        id: parseInt(id),
        requestTypeId: { in: [3, 4, 5, 6, 7, 8, 9] } // Lấy tất cả loại ngoại lệ
      }
    });

    return result.count > 0;

  } catch (error) {
    throw error;
  }
};

// Lấy lịch học có thể tạo ngoại lệ
const getAvailableSchedules = async (params) => {
  const { page, limit, search, userId } = params;
  const offset = (page - 1) * limit;
  
  try {
    const whereConditions = {
      statusId: 2 // active status
    };

    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
      whereConditions.OR = [
        {
          class: {
            className: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          class: {
            code: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          teacher: {
            user: {
              fullName: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    // Debug: Kiểm tra dữ liệu trong database
    const allSchedules = await prisma.classSchedule.findMany({
      where: whereConditions,
      include: {
        class: {
          include: {
            department: true
          }
        },
        teacher: {
          include: {
            user: true
          }
        },
        classRoom: true,
        timeSlot: true,
        ClassRoomType: true 
      },
      take: 5 // Chỉ lấy 5 records đầu để debug
    });

    console.log('Raw database data (first 5 records):', JSON.stringify(allSchedules, null, 2));

    const [schedules, total] = await Promise.all([
      prisma.classSchedule.findMany({
        where: whereConditions,
        include: {
          class: {
            include: {
              department: true
            }
          },
          teacher: {
            include: {
              user: true
            }
          },
          classRoom: true,
          timeSlot: true,
          ClassRoomType: true
        },
        orderBy: [
          { class: { className: 'asc' } },
          { dayOfWeek: 'asc' },
          { timeSlot: { startTime: 'asc' } }
        ],
        skip: offset,
        take: limit
      }),
      prisma.classSchedule.count({
        where: whereConditions
      })
    ]);

    // Format dữ liệu để match với AvailableSchedule interface
    const formattedSchedules = schedules.map(schedule => {
      // Tính toán ngày học tiếp theo dựa trên lịch học
      const today = new Date();
      const dayOfWeek = schedule.dayOfWeek; // 1=Chủ nhật, 2=Thứ 2, ..., 7=Thứ 7
      
      // Tìm ngày học tiếp theo
      const nextClassDate = getNextClassDate(today, dayOfWeek, schedule.class.startDate, schedule.class.endDate);
      
      // Xác định loại lớp (lý thuyết/thực hành) dựa trên ClassRoomType
      const classType = getClassType(schedule.ClassRoomType?.name);
      
      // Debug log
      console.log('Schedule data:', {
        id: schedule.id,
        className: schedule.class.className,
        subjectName: schedule.class.subjectName,
        classCode: schedule.class.code,
        teacherName: schedule.teacher.user.fullName,
        roomName: schedule.classRoom?.name,
        dayOfWeek: schedule.dayOfWeek,
        startDate: schedule.class.startDate,
        endDate: schedule.class.endDate,
        nextClassDate: nextClassDate,
        classRoomType: schedule.ClassRoomType?.name,
        classType: classType,
        practiceGroup: schedule.practiceGroup
      });
      
      return {
        id: schedule.id,
        className: schedule.class.className || schedule.class.subjectName || 'Chưa có tên lớp',
        classCode: schedule.class.code || 'Chưa có mã lớp',
        departmentId: schedule.class.departmentId,
        departmentName: schedule.class.department?.name || 'Chưa xác định',
        teacherName: schedule.teacher.user.fullName || 'Chưa có tên giảng viên',
        teacherCode: schedule.teacher.teacherCode || 'Chưa có mã giảng viên',
        roomName: schedule.classRoom?.name || 'Chưa phân phòng',
        roomCode: schedule.classRoom?.code || '',
        slotName: schedule.timeSlot.slotName || 'Chưa có tiết',
        startTime: schedule.timeSlot.startTime ? schedule.timeSlot.startTime.toTimeString().slice(0, 8) : '00:00:00',
        endTime: schedule.timeSlot.endTime ? schedule.timeSlot.endTime.toTimeString().slice(0, 8) : '00:00:00',
        shift: schedule.timeSlot.shift || 1,
        dayOfWeek: schedule.dayOfWeek,
        startDate: schedule.class.startDate ? schedule.class.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: schedule.class.endDate ? schedule.class.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        nextClassDate: nextClassDate.toISOString().split('T')[0],
        dayName: getDayName(schedule.dayOfWeek),
        // Thêm thông tin về loại lớp và nhóm thực hành
        classType: classType, // 'theory' hoặc 'practice'
        classRoomType: schedule.ClassRoomType?.name || 'Chưa xác định',
        practiceGroup: schedule.practiceGroup || null
        // Bỏ availableDates vì không cần hiển thị ngày tạo ngoại lệ trên card
      };
    });

    return {
      data: formattedSchedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    throw error;
  }
};

// Helper function để tính ngày học tiếp theo
const getNextClassDate = (today, dayOfWeek, classStartDate, classEndDate) => {
  const todayDate = new Date(today);
  const startDate = new Date(classStartDate);
  const endDate = new Date(classEndDate);
  
  console.log('getNextClassDate inputs:', {
    today: todayDate.toISOString(),
    dayOfWeek,
    classStartDate: startDate.toISOString(),
    classEndDate: endDate.toISOString()
  });
  
  // Nếu lớp đã kết thúc, trả về ngày kết thúc
  if (todayDate > endDate) {
    console.log('Class has ended, returning end date');
    return endDate;
  }
  
  // Nếu lớp chưa bắt đầu, trả về ngày bắt đầu
  if (todayDate < startDate) {
    console.log('Class has not started, returning start date');
    return startDate;
  }
  
  // Tính ngày học tiếp theo trong tuần
  const currentDayOfWeek = todayDate.getDay(); // 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7
  const targetDayOfWeek = dayOfWeek === 1 ? 0 : dayOfWeek - 1; // Convert to JavaScript day format
  
  console.log('Day calculation:', {
    currentDayOfWeek,
    targetDayOfWeek,
    dayOfWeek,
    todayString: todayDate.toDateString()
  });
  
  let daysUntilNext = targetDayOfWeek - currentDayOfWeek;
  if (daysUntilNext <= 0) {
    daysUntilNext += 7; // Next week
  }
  
  const nextDate = new Date(todayDate);
  nextDate.setDate(todayDate.getDate() + daysUntilNext);
  
  console.log('Calculated next date:', {
    daysUntilNext,
    nextDate: nextDate.toISOString(),
    nextDateString: nextDate.toDateString()
  });
  
  // Đảm bảo ngày không vượt quá ngày kết thúc lớp
  if (nextDate > endDate) {
    console.log('Next date exceeds end date, returning end date');
    return endDate;
  }
  
  return nextDate;
};

// Helper function để lấy tên thứ
const getDayName = (dayOfWeek) => {
  const days = {
    1: 'Chủ nhật',
    2: 'Thứ 2',
    3: 'Thứ 3',
    4: 'Thứ 4',
    5: 'Thứ 5',
    6: 'Thứ 6',
    7: 'Thứ 7'
  };
  return days[dayOfWeek] || 'Không xác định';
};

// Helper function để xác định loại lớp
const getClassType = (classRoomTypeName) => {
  if (!classRoomTypeName) return 'theory';
  
  const typeName = classRoomTypeName.toLowerCase();
  if (typeName.includes('thực hành') || typeName.includes('practice') || typeName.includes('lab')) {
    return 'practice';
  }
  return 'theory';
};


module.exports = {
  createScheduleException,
  getScheduleExceptions,
  getScheduleExceptionById,
  updateScheduleException,
  deleteScheduleException,
  getAvailableSchedules
};
