const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ScheduleManagementService {
  // =====================================================
  // 1. LẤY DỮ LIỆU CHO FRONTEND
  // =====================================================
  
  // Lấy danh sách lớp học cần sắp xếp phòng
  async getClassesForScheduling() {
    try {
      const classes = await prisma.class.findMany({
        include: {
          teacher: {
            include: {
              user: true,
              department: true
            }
          },
          department: true,
          major: true,
          ClassRoomType: true,
          classSchedules: {
            include: {
              timeSlot: true,
              classRoom: true,
              ClassRoomType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return classes.map(cls => {
         // Xác định trạng thái lớp: chỉ khi TẤT CẢ lịch học đều có phòng mới coi là "Đã phân phòng"
         const allSchedulesAssigned = cls.classSchedules.length > 0 && cls.classSchedules.every(schedule => schedule.statusId === 2);
         const classStatusId = allSchedulesAssigned ? 2 : 1;
        
        return {
          id: cls.id.toString(),
          classId: cls.id,
          className: cls.className,
          subjectCode: cls.subjectCode,
          subjectName: cls.subjectName,
          teacherName: cls.teacher.user.fullName,
          departmentName: cls.department.name,
          majorName: cls.major?.name || 'Chưa xác định',
          maxStudents: cls.maxStudents,
          classRoomTypeId: cls.classRoomTypeId,
          classRoomTypeName: cls.ClassRoomType?.name || 'Chưa xác định',
          departmentId: cls.departmentId,
          statusId: classStatusId, // Trả về trực tiếp RequestType ID
          schedules: cls.classSchedules.map(schedule => ({
            id: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            dayName: this.getDayName(schedule.dayOfWeek),
            timeSlot: schedule.timeSlot.slotName,
            roomId: schedule.classRoomId,
            roomName: schedule.classRoom?.name || null,
            roomCode: schedule.classRoom?.code || null,
            classRoomTypeId: schedule.classRoomTypeId,
            classRoomTypeName: schedule.ClassRoomType?.name || 'Chưa xác định',
            practiceGroup: schedule.practiceGroup,
            statusId: schedule.statusId,
            statusName: this.getStatusName(schedule.statusId)
          }))
        };
      });
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách lớp học: ${error.message}`);
    }
  }

  // Lấy thống kê sắp xếp phòng
  async getSchedulingStats() {
    try {
      // Đếm lịch học theo statusId
      const totalSchedules = await prisma.classSchedule.count();
      const pendingSchedules = await prisma.classSchedule.count({
        where: { statusId: 1 }
      });
      const assignedSchedules = await prisma.classSchedule.count({
        where: { statusId: 2 }
      });

      // Đếm lớp học
      const allClasses = await prisma.class.findMany({
        include: { classSchedules: true }
      });

      let assignedClasses = 0;
      let pendingClasses = 0;

      allClasses.forEach(cls => {
         // Chỉ coi là "đã phân phòng" khi TẤT CẢ lịch học đều có phòng
         const allSchedulesAssigned = cls.classSchedules.length > 0 && cls.classSchedules.every(schedule => schedule.statusId === 2);
         if (allSchedulesAssigned) {
          assignedClasses++;
        } else {
          pendingClasses++;
        }
      });

      return {
        totalClasses: allClasses.length,
        pendingClasses,
        assignedClasses,
        totalSchedules,
        pendingSchedules,
        assignedSchedules,
        assignmentRate: totalSchedules > 0 ? Math.round((assignedSchedules / totalSchedules) * 100) : 0
      };
    } catch (error) {
      throw new Error(`Lỗi lấy thống kê: ${error.message}`);
    }
  }

  // Lấy danh sách phòng khả dụng cho lịch học
  async getAvailableRoomsForSchedule(scheduleId) {
    try {
      const schedule = await prisma.classSchedule.findUnique({
        where: { id: parseInt(scheduleId) },
        include: {
          class: {
            include: { 
              ClassRoomType: true,
              department: true
            }
          },
          timeSlot: true // Lấy thông tin timeSlot để kiểm tra khung giờ
        }
      });

      if (!schedule) {
        throw new Error('Không tìm thấy lịch học');
      }

      // Lấy phòng phù hợp với loại phòng và khoa
      const availableRooms = await prisma.classRoom.findMany({
        where: {
          classRoomTypeId: schedule.classRoomTypeId, // Sử dụng classRoomTypeId từ ClassSchedule
          isAvailable: true,
          capacity: { gte: schedule.class.maxStudents },
          OR: [
            { departmentId: schedule.class.departmentId }, // Phòng cùng khoa
            { departmentId: null } // Phòng chung
          ]
        },
        include: {
          ClassRoomType: true,
          department: true
        },
        orderBy: [
          { departmentId: 'asc' }, // Phòng cùng khoa trước
          { capacity: 'asc' }
        ]
      });

      // Kiểm tra xung đột thời gian - phòng chỉ bận trong khung giờ cụ thể
      const conflictingSchedules = await prisma.classSchedule.findMany({
        where: {
          dayOfWeek: schedule.dayOfWeek,
          timeSlotId: schedule.timeSlotId, // Cùng tiết học = cùng khung giờ
          classRoomId: { not: null },
          statusId: { in: [2, 3] }, // Đã phân phòng hoặc đang hoạt động
          id: { not: parseInt(scheduleId) } // Loại trừ lịch hiện tại
        },
        include: {
          timeSlot: true,
          class: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          }
        }
      });

      const conflictingRoomIds = conflictingSchedules.map(s => s.classRoomId);
      
      
      return availableRooms
        .filter(room => !conflictingRoomIds.includes(room.id))
        .map(room => {
          // Tìm thông tin conflict nếu có
          const conflictInfo = conflictingSchedules.find(s => s.classRoomId === room.id);
          
          return {
          id: room.id,
          code: room.code,
          name: room.name,
          capacity: room.capacity,
          building: room.building,
          floor: room.floor,
          type: room.ClassRoomType.name,
          department: room.department?.name || 'Phòng chung',
            isSameDepartment: room.departmentId === schedule.class.departmentId,
            isAvailable: !conflictingRoomIds.includes(room.id),
            conflictInfo: conflictInfo ? {
              time: `${conflictInfo.timeSlot.startTime}-${conflictInfo.timeSlot.endTime}`,
              className: conflictInfo.class.className,
              teacherName: conflictInfo.class.teacher.user.fullName
            } : null
          };
        });
    } catch (error) {
      throw new Error(`Lỗi lấy phòng khả dụng: ${error.message}`);
    }
  }

  // =====================================================
  // 2. GÁN PHÒNG CHO LỊCH HỌC
  // =====================================================
  
  async assignRoomToSchedule(scheduleId, roomId, assignedBy) {
    try {
      
      const schedule = await prisma.classSchedule.findUnique({
        where: { id: parseInt(scheduleId) },
        include: {
          class: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          },
          timeSlot: true
        }
      });

      if (!schedule) {
        throw new Error('Không tìm thấy lịch học');
      }


      // Chỉ kiểm tra nếu lịch học đã có phòng VÀ statusId = 2 (Đã phân phòng)
      if (schedule.classRoomId && schedule.statusId === 2) {
        throw new Error('Lịch học đã được gán phòng');
      }

      // Kiểm tra phòng có khả dụng không
      const room = await prisma.classRoom.findUnique({
        where: { id: parseInt(roomId) }
      });

      if (!room || !room.isAvailable) {
        throw new Error('Phòng học không khả dụng');
      }

       // Kiểm tra xung đột - phòng chỉ bận trong khung giờ cụ thể
      const conflict = await prisma.classSchedule.findFirst({
        where: {
          dayOfWeek: schedule.dayOfWeek,
          timeSlotId: schedule.timeSlotId,
          classRoomId: parseInt(roomId),
           statusId: { in: [2, 3] }, // Chỉ kiểm tra lịch đã phân phòng và đang hoạt động
           id: { not: parseInt(scheduleId) } // Loại trừ lịch hiện tại
         },
         include: {
           timeSlot: true,
           class: {
             include: {
               teacher: {
                 include: { user: true }
               }
             }
           }
        }
      });

      if (conflict) {
         const conflictTime = `${conflict.timeSlot.startTime}-${conflict.timeSlot.endTime}`;
         const conflictClass = conflict.class.className;
         const conflictTeacher = conflict.class.teacher.user.fullName;
         throw new Error(`Phòng học đã được sử dụng trong khung giờ ${conflictTime} bởi lớp ${conflictClass} (${conflictTeacher})`);
      }

      // Cập nhật lịch học với statusId = 2 (Đã phân phòng)
      const updatedSchedule = await prisma.classSchedule.update({
        where: { id: parseInt(scheduleId) },
        data: {
          classRoomId: parseInt(roomId),
          statusId: 2, // RequestType ID cho "Đã phân phòng"
          assignedBy: parseInt(assignedBy),
          assignedAt: new Date()
        },
        include: {
          class: {
            include: {
              teacher: {
                include: { user: true }
              }
            }
          },
          classRoom: {
            include: {
              ClassRoomType: true
            }
          },
          ClassRoomType: true,
          timeSlot: true
        }
      });

      // Xác định trạng thái lớp sau khi gán
      const classInfo = await prisma.class.findUnique({
        where: { id: updatedSchedule.classId },
        include: { classSchedules: true }
      });

       // Kiểm tra xem TẤT CẢ lịch học của lớp đã được phân phòng chưa
       const allSchedulesAssigned = classInfo?.classSchedules.every(schedule => schedule.statusId === 2) || false;
       const classStatusId = allSchedulesAssigned ? 2 : 1; // Chỉ khi TẤT CẢ lịch đều có phòng mới coi là "Đã phân phòng"

      const result = {
        // Thông tin lịch học
        scheduleId: updatedSchedule.id,
        scheduleStatusId: 2, // RequestType ID
        scheduleStatusName: 'Đã phân phòng',
        
        // Thông tin lớp học
        classId: updatedSchedule.classId,
        className: updatedSchedule.class.className,
        classStatusId: classStatusId, // Trả về trực tiếp RequestType ID
        
        // Thông tin phòng học
        roomId: updatedSchedule.classRoomId,
        roomName: updatedSchedule.classRoom.name,
        roomCode: updatedSchedule.classRoom.code,
        roomType: updatedSchedule.classRoom.ClassRoomType?.name || 'Chưa xác định',
        
        // Thông tin loại phòng/lớp
        classRoomTypeId: updatedSchedule.classRoomTypeId,
        classRoomTypeName: updatedSchedule.ClassRoomType?.name || 'Chưa xác định',
        practiceGroup: updatedSchedule.practiceGroup,
        
        // Thông tin giảng viên
        teacherId: updatedSchedule.class.teacherId,
        teacherName: updatedSchedule.class.teacher.user.fullName,
        
        // Thông tin thời gian
        dayOfWeek: updatedSchedule.dayOfWeek,
        dayName: this.getDayName(updatedSchedule.dayOfWeek),
        timeSlot: updatedSchedule.timeSlot.slotName,
        assignedAt: updatedSchedule.assignedAt
      };
      
      return result;
    } catch (error) {
      throw new Error(`Lỗi gán phòng: ${error.message}`);
    }
  }

  // Hủy gán phòng
  async unassignRoomFromSchedule(scheduleId) {
    try {
      const updatedSchedule = await prisma.classSchedule.update({
        where: { id: parseInt(scheduleId) },
        data: {
          classRoomId: null,
          statusId: 1, 
          assignedBy: null,
          assignedAt: null
        }
      });

      return {
        id: updatedSchedule.id,
        statusId: 1,
        statusName: 'Chờ phân phòng',
        message: 'Đã hủy gán phòng thành công'
      };
    } catch (error) {
      throw new Error(`Lỗi hủy gán phòng: ${error.message}`);
    }
  }

  // =====================================================
  // 3. LẤY DỮ LIỆU FILTER
  // =====================================================
  
  // Lấy danh sách khoa
  async getDepartments() {
    try {
      return await prisma.department.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách khoa: ${error.message}`);
    }
  }

  // Lấy danh sách giảng viên
  async getTeachers() {
    try {
      const teachers = await prisma.teacher.findMany({
        include: {
          user: true,
          department: true
        },
        orderBy: { user: { fullName: 'asc' } }
      });

      return teachers.map(teacher => ({
        id: teacher.id,
        fullName: teacher.user.fullName,
        name: teacher.user.fullName,
        code: teacher.teacherCode,
        departmentId: teacher.departmentId,
        departmentName: teacher.department?.name || 'Chưa xác định'
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách giảng viên: ${error.message}`);
    }
  }

  // Lấy danh sách RequestType (trạng thái lịch học)
  async getRequestTypes() {
    try {
      const requestTypes = await prisma.requestType.findMany({
        where: { id: { lte: 6 } }, // Chỉ lấy trạng thái lịch học (1-6)
        orderBy: { id: 'asc' }
      });

      return requestTypes.map(type => ({
        id: type.id,
        name: type.name
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách trạng thái: ${error.message}`);
    }
  }

  // =====================================================
  // 4. LỊCH HỌC THEO TUẦN
  // =====================================================
  
  // Lấy lịch học theo tuần - hỗ trợ role-based access
  async getWeeklySchedule(weekStartDate, filters = {}, userRole = 'admin', userId = null) {
    try {
      // Tính toán ngày bắt đầu và kết thúc tuần
      const startDate = new Date(weekStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      // Tính tuần học hiện tại (dựa trên ngày bắt đầu học kỳ)
      // Lấy ngày bắt đầu học kỳ từ lớp học đầu tiên hoặc sử dụng ngày mặc định
      const earliestClass = await prisma.class.findFirst({
        orderBy: { startDate: 'asc' },
        select: { startDate: true }
      });
      
      const semesterStartDate = earliestClass?.startDate ? new Date(earliestClass.startDate) : new Date('2025-09-01');
      const currentWeek = Math.floor((startDate - semesterStartDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
      
      // Xây dựng điều kiện where dựa trên role
      let whereCondition = {
        // Filter theo tuần học: chỉ lấy lịch trong khoảng startWeek và endWeek
        startWeek: { lte: currentWeek }, // Lịch học bắt đầu trước hoặc trong tuần này
        endWeek: { gte: currentWeek }, // Lịch học kết thúc sau hoặc trong tuần này
        // Filter theo thời gian: chỉ lấy lịch trong khoảng startDate và endDate của lớp
        class: {
          startDate: { lte: endDate }, // Lớp học bắt đầu trước hoặc trong tuần này
          endDate: { gte: startDate }, // Lớp học kết thúc sau hoặc trong tuần này
          ...(filters.departmentId && {
            departmentId: parseInt(filters.departmentId)
          })
        },
        ...(filters.classId && {
          classId: parseInt(filters.classId)
        }),
        ...(filters.teacherId && {
          teacherId: parseInt(filters.teacherId)
        })
      };

      // Role-based filtering
      if (userRole === 'teacher' && userId) {
        // Lấy teacherId từ userId
        const teacher = await prisma.teacher.findFirst({
          where: { userId: parseInt(userId) },
          select: { id: true }
        });
        
        if (!teacher) {
          return [];
        }
        
        // Giáo viên chỉ xem lịch học của lớp họ dạy
        whereCondition.teacherId = teacher.id;
        // Giáo viên chỉ xem lịch đã có phòng
        whereCondition.OR = [
          { statusId: { in: [2, 3] } }, // Đã phân phòng, Đang hoạt động
          { 
            AND: [
              { statusId: 1 }, // Chờ phân phòng
              { classRoomId: { not: null } } // Nhưng đã có phòng
            ]
          }
        ];
      } else if (userRole === 'student' && userId) {
        // Lấy studentId từ userId
        const student = await prisma.student.findFirst({
          where: { userId: parseInt(userId) },
          select: { id: true }
        });
        
        if (!student) {
          return [];
        }
        
        // Sinh viên chỉ xem lịch học của lớp họ học
        // Cần join với bảng ClassStudent để lấy lớp của sinh viên
        whereCondition.class = {
          ...whereCondition.class,
          classStudents: {
            some: {
              studentId: student.id
            }
          }
        };
        // Sinh viên chỉ xem lịch đã có phòng
        whereCondition.OR = [
          { statusId: { in: [2, 3] } }, // Đã phân phòng, Đang hoạt động
          { 
            AND: [
              { statusId: 1 }, // Chờ phân phòng
              { classRoomId: { not: null } } // Nhưng đã có phòng
            ]
          }
        ];
      } else {
        // Admin/Manager xem tất cả lịch đã có phòng
        whereCondition.OR = [
          { statusId: { in: [2, 3] } }, // Đã phân phòng, Đang hoạt động
          { 
            AND: [
              { statusId: 1 }, // Chờ phân phòng
              { classRoomId: { not: null } } // Nhưng đã có phòng (từ yêu cầu đã được chấp nhận)
            ]
          }
        ];
      }

      // Lấy lịch học theo điều kiện đã xây dựng
      const schedules = await prisma.classSchedule.findMany({
        where: whereCondition,
        include: {
          class: {
            include: {
              teacher: {
                include: {
                  user: true,
                  department: true
                }
              },
              department: true,
              major: true,
              ClassRoomType: true
            }
          },
          classRoom: {
            include: {
              ClassRoomType: true,
              department: true
            }
          },
          timeSlot: true,
          ClassRoomType: true,
          // Include thông tin ngoại lệ
          scheduleRequests: {
            where: {
              requestStatusId: 2, // Chỉ lấy các yêu cầu đã được phê duyệt
              requestTypeId: { in: [3, 4, 5, 6, 7, 8, 9] } // Lấy tất cả loại ngoại lệ (ID 3-9)
            },
            include: {
              RequestType: true,
              RequestStatus: true,
              movedToTimeSlot: true,
              movedToClassRoom: true,
              newTimeSlot: true,
              newClassRoom: true,
              substituteTeacher: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { timeSlotId: 'asc' }
        ]
      });

      // =====================================================
      // QUERY THÊM: Lấy các exceptions có movedToDate trong tuần này
      // nhưng schedule gốc không nằm trong điều kiện filter
      // (Ví dụ: Thi ngày 17/12/2025 nhưng lớp học kết thúc 15/12/2025)
      // =====================================================
      
      const standaloneExceptions = await prisma.scheduleRequest.findMany({
        where: {
          exceptionType: { in: ['exam', 'moved'] },
          movedToDate: {
            gte: startDate,
            lte: endDate
          },
          requestStatusId: 2, // Chỉ lấy exceptions đã được phê duyệt
          // Áp dụng filters giống như schedules
          ...(filters.classId && {
            classSchedule: {
              classId: parseInt(filters.classId)
            }
          }),
          ...(filters.teacherId && {
            classSchedule: {
              teacherId: parseInt(filters.teacherId)
            }
          })
        },
        include: {
          classSchedule: {
            include: {
              class: {
                include: {
                  teacher: {
                    include: {
                      user: true,
                      department: true
                    }
                  },
                  department: true,
                  major: true,
                  ClassRoomType: true
                }
              },
              classRoom: {
                include: {
                  ClassRoomType: true,
                  department: true
                }
              },
              timeSlot: true,
              ClassRoomType: true
            }
          },
          RequestType: true,
          RequestStatus: true,
          movedToTimeSlot: true,
          movedToClassRoom: true,
          newTimeSlot: true,
          newClassRoom: true,
          substituteTeacher: {
            include: {
              user: true
            }
          }
        }
      });

      // Lọc thêm theo department nếu có filter (vì không thể filter trực tiếp trong where)
      const filteredStandaloneExceptions = standaloneExceptions.filter(exception => {
        if (!exception.classSchedule) return false;
        
        // Apply department filter if exists
        if (filters.departmentId) {
          return exception.classSchedule.class.departmentId === parseInt(filters.departmentId);
        }
        
        // Role-based filtering for standalone exceptions
        if (userRole === 'teacher' && userId) {
          const teacher = exception.classSchedule.class.teacher;
          return teacher && teacher.userId === parseInt(userId);
        } else if (userRole === 'student' && userId) {
          // Cần check xem student có trong lớp không
          // (Tạm thời bỏ qua, cần implement nếu cần thiết)
          return true;
        }
        
        return true;
      });

      // Chuyển đổi dữ liệu với logic xử lý lịch chuyển
      const weeklySchedules = [];
      const processedScheduleIds = new Set(); // Track schedules đã xử lý
      
      schedules.forEach(schedule => {
        processedScheduleIds.add(schedule.id);
        const timeSlot = schedule.timeSlot;
        if (!timeSlot) {
          return;
        }
        const shift = this.getShiftFromTimeSlot(timeSlot.shift);
        
        // Filter scheduleRequests theo ngày chính xác trong tuần
        const relevantExceptions = schedule.scheduleRequests.filter(request => {
          if (!request.exceptionDate) return false;
          
          const exceptionDate = new Date(request.exceptionDate);
          const exceptionDateStr = exceptionDate.toISOString().split('T')[0]; // YYYY-MM-DD
          
          // Tính ngày của schedule trong tuần hiện tại
          const startDateObj = new Date(weekStartDate);
          let scheduleDayOffset;
          if (schedule.dayOfWeek === 1) { // Chủ nhật
            scheduleDayOffset = 6;
          } else {
            scheduleDayOffset = schedule.dayOfWeek - 2;
          }
          const scheduleDate = new Date(startDateObj);
          scheduleDate.setDate(startDateObj.getDate() + scheduleDayOffset);
          const scheduleDateStr = scheduleDate.toISOString().split('T')[0];
          
          return exceptionDateStr === scheduleDateStr;
        });
        
        // Lấy ngoại lệ đầu tiên (nếu có)
        const exception = relevantExceptions[0];
        
        // Kiểm tra xem có phải lịch chuyển (moved/exam) không
        const isMoved = exception && (exception.exceptionType === 'moved' || exception.exceptionType === 'exam');
        const movedToDate = exception?.movedToDate;
        
        // Kiểm tra ngày chuyển đến có trong tuần này không
        let isMovedToThisWeek = false;
        let movedToDayOfWeek = null;
        
        if (isMoved && movedToDate) {
          const movedDate = new Date(movedToDate);
          const startDateObj = new Date(weekStartDate);
          const endDateObj = new Date(startDateObj);
          endDateObj.setDate(startDateObj.getDate() + 6);
          
          if (movedDate >= startDateObj && movedDate <= endDateObj) {
            isMovedToThisWeek = true;
            const movedDayJS = movedDate.getDay(); // 0=CN, 1=T2, ..., 6=T7
            movedToDayOfWeek = movedDayJS === 0 ? 1 : movedDayJS + 1; // Convert to 1=CN, 2=T2, ..., 7=T7
          }
        }
        
        // LOGIC: Chỉ hiển thị lịch gốc khi KHÔNG có exception moved/exam
        const shouldShowOriginal = !isMoved;
        
        if (shouldShowOriginal) {
          weeklySchedules.push({
          id: schedule.id,
          classId: schedule.classId,
          className: schedule.class.className,
          classCode: schedule.class.code,
          subjectCode: schedule.class.subjectCode,
          subjectName: schedule.class.subjectName,
          teacherId: schedule.teacherId,
          teacherName: schedule.class.teacher?.user?.fullName || 'Chưa xác định',
          teacherCode: schedule.class.teacher?.teacherCode || '',
          roomId: schedule.classRoomId,
          roomName: schedule.classRoom?.name || (schedule.statusId === 1 ? 'Chưa phân phòng' : 'Chưa xác định'),
          roomCode: schedule.classRoom?.code || '',
          roomType: schedule.classRoom?.ClassRoomType?.name || (schedule.statusId === 1 ? 'Chờ phân phòng' : 'Chưa xác định'),
          dayOfWeek: schedule.dayOfWeek,
          dayName: this.getDayName(schedule.dayOfWeek),
          timeSlot: timeSlot.slotName,
          timeRange: `${timeSlot.startTime}-${timeSlot.endTime}`,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          shift: shift.key,
          shiftName: shift.name,
          type: this.getScheduleType(schedule.classRoomTypeId),
          status: this.getStatusName(schedule.statusId),
          statusId: schedule.statusId,
          weekPattern: schedule.weekPattern,
          startWeek: schedule.startWeek,
          endWeek: schedule.endWeek,
          practiceGroup: schedule.practiceGroup,
          maxStudents: schedule.class.maxStudents,
          departmentId: schedule.class.departmentId,
          departmentName: schedule.class.department?.name || 'Chưa xác định',
          majorId: schedule.class.majorId,
          majorName: schedule.class.major?.name || 'Chưa xác định',
          timeSlotOrder: this.getTimeSlotOrder(timeSlot.id),
          assignedAt: schedule.assignedAt,
          note: schedule.note,
          // Thông tin ngoại lệ
          exceptionDate: exception?.exceptionDate || null,
          exceptionType: exception?.exceptionType || null,
          exceptionReason: exception?.reason || null,
          exceptionStatus: exception?.RequestStatus?.name || null,
          requestTypeId: exception?.requestTypeId || null,
          isOriginalSchedule: true
        });
        }
        
        // Nếu có lịch được chuyển đến trong tuần này, tạo entry mới
        if (isMovedToThisWeek && movedToDayOfWeek) {
          const movedTimeSlot = exception.movedToTimeSlot || exception.newTimeSlot;
          const movedRoom = exception.movedToClassRoom || exception.newClassRoom;
          const substituteTeacher = exception.substituteTeacher;
          const movedShift = movedTimeSlot ? this.getShiftFromTimeSlot(movedTimeSlot.shift) : shift;
          
          weeklySchedules.push({
            id: schedule.id + 100000, // ID ảo để tránh trùng
            classId: schedule.classId,
            className: schedule.class.className,
            classCode: schedule.class.code,
            subjectCode: schedule.class.subjectCode,
            subjectName: schedule.class.subjectName,
            teacherId: substituteTeacher ? substituteTeacher.id : schedule.teacherId,
            teacherName: substituteTeacher ? substituteTeacher.user.fullName : (schedule.class.teacher?.user?.fullName || 'Chưa xác định'),
            teacherCode: substituteTeacher ? substituteTeacher.teacherCode : (schedule.class.teacher?.teacherCode || ''),
            roomId: movedRoom ? movedRoom.id : schedule.classRoomId,
            roomName: movedRoom ? movedRoom.name : (schedule.classRoom?.name || 'Chưa xác định'),
            roomCode: movedRoom ? movedRoom.code : (schedule.classRoom?.code || ''),
            roomType: movedRoom ? (movedRoom.ClassRoomType?.name || 'Chưa xác định') : (schedule.classRoom?.ClassRoomType?.name || 'Chưa xác định'),
            dayOfWeek: movedToDayOfWeek, // Ngày mới được chuyển đến
            dayName: this.getDayName(movedToDayOfWeek),
            timeSlot: movedTimeSlot ? movedTimeSlot.slotName : timeSlot.slotName,
            timeRange: movedTimeSlot ? `${movedTimeSlot.startTime}-${movedTimeSlot.endTime}` : `${timeSlot.startTime}-${timeSlot.endTime}`,
            startTime: movedTimeSlot ? movedTimeSlot.startTime : timeSlot.startTime,
            endTime: movedTimeSlot ? movedTimeSlot.endTime : timeSlot.endTime,
            shift: movedShift.key,
            shiftName: movedShift.name,
            type: this.getScheduleType(schedule.classRoomTypeId),
            status: exception.RequestType.name,
            statusId: exception.requestTypeId,
            weekPattern: schedule.weekPattern,
            startWeek: schedule.startWeek,
            endWeek: schedule.endWeek,
            practiceGroup: schedule.practiceGroup,
            maxStudents: schedule.class.maxStudents,
            departmentId: schedule.class.departmentId,
            departmentName: schedule.class.department?.name || 'Chưa xác định',
            majorId: schedule.class.majorId,
            majorName: schedule.class.major?.name || 'Chưa xác định',
            timeSlotOrder: movedTimeSlot ? this.getTimeSlotOrder(movedTimeSlot.id) : this.getTimeSlotOrder(timeSlot.id),
            assignedAt: schedule.assignedAt,
            note: `Đã chuyển từ ${this.getDayName(schedule.dayOfWeek)} - ${timeSlot.slotName}`,
            // Thông tin ngoại lệ
            exceptionDate: exception.exceptionDate,
            exceptionType: exception.exceptionType,
            exceptionReason: exception.reason,
            exceptionStatus: exception.RequestStatus.name,
            requestTypeId: exception.requestTypeId,
            isMovedSchedule: true, // Đánh dấu đây là lịch đã được chuyển
            originalDayOfWeek: schedule.dayOfWeek,
            originalTimeSlot: timeSlot.slotName
          });
        }
      });

      // =====================================================
      // XỬ LÝ STANDALONE EXCEPTIONS
      // (Exceptions có movedToDate trong tuần này nhưng schedule gốc không được query ra)
      // =====================================================
      
      filteredStandaloneExceptions.forEach(exception => {
        const schedule = exception.classSchedule;
        
        // Bỏ qua nếu schedule đã được xử lý ở trên
        if (processedScheduleIds.has(schedule.id)) {
          return;
        }
        
        // Chỉ xử lý exceptions có movedToDate trong tuần này
        const movedDate = new Date(exception.movedToDate);
        const movedDayJS = movedDate.getDay(); // 0=CN, 1=T2, ..., 6=T7
        const movedToDayOfWeek = movedDayJS === 0 ? 1 : movedDayJS + 1; // Convert to 1=CN, 2=T2, ..., 7=T7
        
        const movedTimeSlot = exception.movedToTimeSlot || exception.newTimeSlot;
        const movedRoom = exception.movedToClassRoom || exception.newClassRoom;
        const substituteTeacher = exception.substituteTeacher;
        const originalTimeSlot = schedule.timeSlot;
        
        if (!originalTimeSlot) {
          return;
        }
        
        const movedShift = movedTimeSlot ? this.getShiftFromTimeSlot(movedTimeSlot.shift) : this.getShiftFromTimeSlot(originalTimeSlot.shift);
        
        // Tạo virtual schedule cho standalone exception
        weeklySchedules.push({
          id: schedule.id + 100000 + exception.id, // ID ảo để tránh trùng
          classId: schedule.classId,
          className: schedule.class.className,
          classCode: schedule.class.code,
          subjectCode: schedule.class.subjectCode,
          subjectName: schedule.class.subjectName,
          teacherId: substituteTeacher ? substituteTeacher.id : schedule.teacherId,
          teacherName: substituteTeacher ? substituteTeacher.user.fullName : (schedule.class.teacher?.user?.fullName || 'Chưa xác định'),
          teacherCode: substituteTeacher ? substituteTeacher.teacherCode : (schedule.class.teacher?.teacherCode || ''),
          roomId: movedRoom ? movedRoom.id : schedule.classRoomId,
          roomName: movedRoom ? movedRoom.name : (schedule.classRoom?.name || 'Chưa xác định'),
          roomCode: movedRoom ? movedRoom.code : (schedule.classRoom?.code || ''),
          roomType: movedRoom ? (movedRoom.ClassRoomType?.name || 'Chưa xác định') : (schedule.classRoom?.ClassRoomType?.name || 'Chưa xác định'),
          dayOfWeek: movedToDayOfWeek, // Ngày mới được chuyển đến
          dayName: this.getDayName(movedToDayOfWeek),
          timeSlot: movedTimeSlot ? movedTimeSlot.slotName : originalTimeSlot.slotName,
          timeRange: movedTimeSlot ? `${movedTimeSlot.startTime}-${movedTimeSlot.endTime}` : `${originalTimeSlot.startTime}-${originalTimeSlot.endTime}`,
          startTime: movedTimeSlot ? movedTimeSlot.startTime : originalTimeSlot.startTime,
          endTime: movedTimeSlot ? movedTimeSlot.endTime : originalTimeSlot.endTime,
          shift: movedShift.key,
          shiftName: movedShift.name,
          type: this.getScheduleType(schedule.classRoomTypeId),
          status: exception.RequestType.name,
          statusId: exception.requestTypeId,
          weekPattern: schedule.weekPattern,
          startWeek: schedule.startWeek,
          endWeek: schedule.endWeek,
          practiceGroup: schedule.practiceGroup,
          maxStudents: schedule.class.maxStudents,
          departmentId: schedule.class.departmentId,
          departmentName: schedule.class.department?.name || 'Chưa xác định',
          majorId: schedule.class.majorId,
          majorName: schedule.class.major?.name || 'Chưa xác định',
          timeSlotOrder: movedTimeSlot ? this.getTimeSlotOrder(movedTimeSlot.id) : this.getTimeSlotOrder(originalTimeSlot.id),
          assignedAt: schedule.assignedAt,
          note: `Đã chuyển từ ${this.getDayName(schedule.dayOfWeek)} - ${originalTimeSlot.slotName}`,
          // Thông tin ngoại lệ
          exceptionDate: exception.exceptionDate,
          exceptionType: exception.exceptionType,
          exceptionReason: exception.reason,
          exceptionStatus: exception.RequestStatus.name,
          requestTypeId: exception.requestTypeId,
          isMovedSchedule: true, // Đánh dấu đây là lịch đã được chuyển
          isStandaloneException: true, // Đánh dấu đây là exception độc lập (nằm ngoài khoảng thời gian học)
          originalDayOfWeek: schedule.dayOfWeek,
          originalTimeSlot: originalTimeSlot.slotName
        });
      });

      return weeklySchedules;
    } catch (error) {
      throw new Error(`Lỗi lấy lịch học theo tuần: ${error.message}`);
    }
  }

  // =====================================================
  // 5. HELPER METHODS
  // =====================================================
  
  getDayName(dayOfWeek) {
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
  }

  getStatusName(statusId) {
    const statuses = {
      1: 'Chờ phân phòng',
      2: 'Đã phân phòng',
      3: 'Đang hoạt động',
      4: 'Đã hủy',
      5: 'Tạm ngưng',
      6: 'Thi'
    };
    return statuses[statusId] || 'Không xác định';
  }

  getShiftFromTimeSlot(shiftId) {
    const shifts = {
      1: { key: 'morning', name: 'Sáng' },
      2: { key: 'afternoon', name: 'Chiều' },
      3: { key: 'evening', name: 'Tối' }
    };
    return shifts[shiftId] || { key: 'morning', name: 'Sáng' };
  }

  getScheduleType(classRoomTypeId) {
    const types = {
      1: 'theory',
      2: 'practice',
      3: 'online'
    };
    return types[classRoomTypeId] || 'theory';
  }

  getTimeSlotOrder(timeSlotId) {
    // Dựa trên sample_data.sql, timeSlotId từ 1-16
    // Sắp xếp theo thứ tự: 1-6 (sáng), 7-12 (chiều), 13-16 (tối)
    if (timeSlotId <= 6) return 1; // Tiết 1-3, 4-6
    if (timeSlotId <= 12) return 2; // Tiết 7-9, 10-12
    return 3; // Tiết 13-15, 16
  }
}

module.exports = new ScheduleManagementService();