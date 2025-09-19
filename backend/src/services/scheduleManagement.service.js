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

      console.log(`[GET_AVAILABLE_ROOMS] Lịch học: ${schedule.class.className} - ${schedule.timeSlot.slotName} (${schedule.timeSlot.startTime}-${schedule.timeSlot.endTime})`);

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
      
      console.log(`[GET_AVAILABLE_ROOMS] Tìm thấy ${conflictingSchedules.length} lịch xung đột trong khung giờ ${schedule.timeSlot.startTime}-${schedule.timeSlot.endTime}`);
      
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
      console.log(`[ASSIGN_ROOM] Bắt đầu gán phòng - ScheduleID: ${scheduleId}, RoomID: ${roomId}`);
      
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

      console.log(`[ASSIGN_ROOM] Lịch học hiện tại - classRoomId: ${schedule.classRoomId}, statusId: ${schedule.statusId}`);

      // Chỉ kiểm tra nếu lịch học đã có phòng VÀ statusId = 2 (Đã phân phòng)
      if (schedule.classRoomId && schedule.statusId === 2) {
        console.log(`[ASSIGN_ROOM] Lỗi: Lịch học đã được gán phòng (classRoomId: ${schedule.classRoomId}, statusId: ${schedule.statusId})`);
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
      
      console.log(`[ASSIGN_ROOM] Gán phòng thành công - ScheduleID: ${scheduleId}, RoomID: ${roomId}, ClassStatusID: ${classStatusId}`);
      return result;
    } catch (error) {
      console.error(`[ASSIGN_ROOM] Lỗi gán phòng - ScheduleID: ${scheduleId}, Error: ${error.message}`);
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
          statusId: 1, // RequestType ID cho "Chờ phân phòng"
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
  
  // Lấy lịch học theo tuần - chỉ hiển thị lịch đã có phòng đầy đủ
  async getWeeklySchedule(weekStartDate, filters = {}) {
    try {
      console.log(`[GET_WEEKLY_SCHEDULE] Week start: ${weekStartDate}, Filters:`, filters);
      
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
      
      console.log(`[GET_WEEKLY_SCHEDULE] Current week: ${currentWeek}, Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Lấy tất cả lịch học đã được phân phòng (statusId = 2 hoặc 3)
      const schedules = await prisma.classSchedule.findMany({
        where: {
          statusId: { in: [2, 3] }, // Chỉ lấy lịch đã phân phòng và đang hoạt động
          classRoomId: { not: null }, // Phải có phòng
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
        },
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
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { timeSlotId: 'asc' }
        ]
      });

      console.log(`[GET_WEEKLY_SCHEDULE] Found ${schedules.length} assigned schedules`);

      // Chuyển đổi dữ liệu để phù hợp với frontend
      const weeklySchedules = schedules.map(schedule => {
        const timeSlot = schedule.timeSlot;
        const shift = this.getShiftFromTimeSlot(timeSlot.shift);
        
        return {
          id: schedule.id,
          classId: schedule.classId,
          className: schedule.class.className,
          classCode: schedule.class.code,
          subjectCode: schedule.class.subjectCode,
          subjectName: schedule.class.subjectName,
          teacherId: schedule.teacherId,
          teacherName: schedule.class.teacher.user.fullName,
          teacherCode: schedule.class.teacher.teacherCode,
          roomId: schedule.classRoomId,
          roomName: schedule.classRoom.name,
          roomCode: schedule.classRoom.code,
          roomType: schedule.classRoom.ClassRoomType.name,
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
          departmentName: schedule.class.department.name,
          majorId: schedule.class.majorId,
          majorName: schedule.class.major?.name || 'Chưa xác định',
          timeSlotOrder: this.getTimeSlotOrder(timeSlot.id),
          assignedAt: schedule.assignedAt,
          note: schedule.note
        };
      });

      return weeklySchedules;
    } catch (error) {
      console.error('Error getting weekly schedule:', error);
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
