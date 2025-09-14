const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ClassScheduleService {
  // =====================================================
  // CLASS SCHEDULE GET - LẤY DANH SÁCH LỊCH HỌC
  // =====================================================
  
  async ClassScheduleGet() {
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

      const result = classes.map(cls => {
        // Xác định trạng thái lớp dựa trên statusId của lịch học
        const hasAssignedSchedule = cls.classSchedules.some(schedule => schedule.statusId === 2);
        const classStatusId = hasAssignedSchedule ? 2 : 1; // 1: Chờ phân phòng, 2: Đã phân phòng
        
        return {
          id: cls.id,
          classId: cls.id,
          className: cls.className,
          subjectCode: cls.subjectCode,
          subjectName: cls.subjectName,
          teacherName: cls.teacher.user.fullName,
          teacherCode: cls.teacher.teacherCode,
          departmentName: cls.department.name,
          majorName: cls.major?.name || 'Chưa xác định',
          maxStudents: cls.maxStudents,
          classRoomTypeId: cls.classRoomTypeId,
          classRoomTypeName: cls.ClassRoomType.name,
          statusId: classStatusId,
          statusName: classStatusId === 1 ? 'Chờ phân phòng' : 'Đã phân phòng',
          schedules: cls.classSchedules.map(schedule => ({
            id: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            dayName: this.getDayName(schedule.dayOfWeek),
            timeSlotId: schedule.timeSlotId,
            timeSlot: schedule.timeSlot.slotName,
            startTime: schedule.timeSlot.startTime.toISOString().slice(11, 19),
            endTime: schedule.timeSlot.endTime.toISOString().slice(11, 19),
            weekPattern: schedule.weekPattern,
            startWeek: schedule.startWeek,
            endWeek: schedule.endWeek,
            roomId: schedule.classRoomId,
            roomName: schedule.classRoom?.name || null,
            roomCode: schedule.classRoom?.code || null,
            classRoomTypeId: schedule.classRoomTypeId,
            classRoomTypeName: schedule.ClassRoomType?.name || 'Chưa xác định',
            practiceGroup: schedule.practiceGroup,
            statusId: schedule.statusId,
            statusName: this.getStatusName(schedule.statusId),
            note: schedule.note
          }))
        };
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('[ClassScheduleService.ClassScheduleGet] Error:', error);
      return {
        success: false,
        message: `Lỗi lấy danh sách lịch học: ${error.message}`
      };
    }
  }

  // Lấy thông tin chi tiết lịch học theo ID lớp
  async ClassScheduleGetById(classId) {
    try {
      const cls = await prisma.class.findUnique({
        where: { id: parseInt(classId) },
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
        }
      });

      if (!cls) {
        return {
          success: false,
          message: 'Không tìm thấy lớp học'
        };
      }

      const hasAssignedSchedule = cls.classSchedules.some(schedule => schedule.statusId === 2);
      const classStatusId = hasAssignedSchedule ? 2 : 1;

      return {
        success: true,
        data: {
          id: cls.id,
          classId: cls.id,
          className: cls.className,
          subjectCode: cls.subjectCode,
          subjectName: cls.subjectName,
          teacherName: cls.teacher.user.fullName,
          teacherCode: cls.teacher.teacherCode,
          departmentName: cls.department.name,
          majorName: cls.major?.name || 'Chưa xác định',
          maxStudents: cls.maxStudents,
          classRoomTypeId: cls.classRoomTypeId,
          classRoomTypeName: cls.ClassRoomType.name,
          statusId: classStatusId,
          statusName: classStatusId === 1 ? 'Chờ phân phòng' : 'Đã phân phòng',
          schedules: cls.classSchedules.map(schedule => ({
            id: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            dayName: this.getDayName(schedule.dayOfWeek),
            timeSlotId: schedule.timeSlotId,
            timeSlot: schedule.timeSlot.slotName,
            startTime: schedule.timeSlot.startTime.toISOString().slice(11, 19),
            endTime: schedule.timeSlot.endTime.toISOString().slice(11, 19),
            weekPattern: schedule.weekPattern,
            startWeek: schedule.startWeek,
            endWeek: schedule.endWeek,
            roomId: schedule.classRoomId,
            roomName: schedule.classRoom?.name || null,
            roomCode: schedule.classRoom?.code || null,
            classRoomTypeId: schedule.classRoomTypeId,
            classRoomTypeName: schedule.ClassRoomType?.name || 'Chưa xác định',
            practiceGroup: schedule.practiceGroup,
            statusId: schedule.statusId,
            statusName: this.getStatusName(schedule.statusId),
            note: schedule.note
          }))
        }
      };
    } catch (error) {
      console.error('[ClassScheduleService.ClassScheduleGetById] Error:', error);
      return {
        success: false,
        message: `Lỗi lấy thông tin lịch học: ${error.message}`
      };
    }
  }

  // =====================================================
  // CLASS SCHEDULE UPDATE - CẬP NHẬT GÁN PHÒNG
  // =====================================================
  
  async ClassScheduleUpdate(scheduleId, roomId, assignedBy) {
    try {
      console.log(`[ClassScheduleUpdate] Bắt đầu gán phòng - ScheduleID: ${scheduleId}, RoomID: ${roomId}`);
      
      // Kiểm tra nếu scheduleId có dạng "classId-scheduleId"
      let actualScheduleId = scheduleId;
      if (typeof scheduleId === 'string' && scheduleId.includes('-')) {
        const parts = scheduleId.split('-');
        actualScheduleId = parts[1]; // Lấy phần thứ 2 (scheduleId thực tế)
        console.log(`[ClassScheduleUpdate] Parsed scheduleId: ${actualScheduleId} from ${scheduleId}`);
      }
      
      const schedule = await prisma.classSchedule.findUnique({
        where: { id: parseInt(actualScheduleId) },
        include: {
          class: {
            include: {
              teacher: {
                include: { user: true }
              },
              ClassRoomType: true
            }
          },
          timeSlot: true
        }
      });

      if (!schedule) {
        return {
          success: false,
          message: 'Không tìm thấy lịch học'
        };
      }

      console.log(`[ClassScheduleUpdate] Lịch học hiện tại - classRoomId: ${schedule.classRoomId}, statusId: ${schedule.statusId}`);

      // Chỉ kiểm tra nếu lịch học đã có phòng VÀ statusId = 2 (Đã phân phòng)
      if (schedule.classRoomId && schedule.statusId === 2) {
        console.log(`[ClassScheduleUpdate] Lỗi: Lịch học đã được gán phòng (classRoomId: ${schedule.classRoomId}, statusId: ${schedule.statusId})`);
        return {
          success: false,
          message: 'Lịch học đã được gán phòng'
        };
      }

      // Kiểm tra phòng có khả dụng không
      const room = await prisma.classRoom.findUnique({
        where: { id: parseInt(roomId) }
      });

      if (!room || !room.isAvailable) {
        return {
          success: false,
          message: 'Phòng học không khả dụng'
        };
      }

      // Kiểm tra xung đột
      const conflict = await prisma.classSchedule.findFirst({
        where: {
          dayOfWeek: schedule.dayOfWeek,
          timeSlotId: schedule.timeSlotId,
          classRoomId: parseInt(roomId),
          statusId: { in: [2, 3] }
        }
      });

      if (conflict) {
        return {
          success: false,
          message: 'Phòng học đã được sử dụng trong khung giờ này'
        };
      }

      // Cập nhật lịch học với statusId = 2 (Đã phân phòng)
      const updatedSchedule = await prisma.classSchedule.update({
        where: { id: parseInt(actualScheduleId) },
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
          classRoom: true,
          timeSlot: true
        }
      });

      // Xác định trạng thái lớp sau khi gán
      const classInfo = await prisma.class.findUnique({
        where: { id: updatedSchedule.classId },
        include: { classSchedules: true }
      });

      const hasAssignedSchedule = classInfo?.classSchedules.some(schedule => schedule.statusId === 2) || false;
      const classStatusId = hasAssignedSchedule ? 2 : 1;

      const result = {
        // Thông tin lịch học
        scheduleId: updatedSchedule.id,
        scheduleStatusId: 2,
        scheduleStatusName: 'Đã phân phòng',
        
        // Thông tin lớp học
        classId: updatedSchedule.classId,
        className: updatedSchedule.class.className,
        classStatusId: classStatusId,
        
        // Thông tin phòng học
        roomId: updatedSchedule.classRoomId,
        roomName: updatedSchedule.classRoom.name,
        roomCode: updatedSchedule.classRoom.code,
        
        // Thông tin giảng viên
        teacherId: updatedSchedule.class.teacherId,
        teacherName: updatedSchedule.class.teacher.user.fullName,
        
        // Thông tin thời gian
        dayOfWeek: updatedSchedule.dayOfWeek,
        dayName: this.getDayName(updatedSchedule.dayOfWeek),
        timeSlot: updatedSchedule.timeSlot.slotName,
        assignedAt: updatedSchedule.assignedAt
      };
      
      console.log(`[ClassScheduleUpdate] Gán phòng thành công - ScheduleID: ${actualScheduleId}, RoomID: ${roomId}, ClassStatusID: ${classStatusId}`);
      
      return {
        success: true,
        data: result,
        message: 'Gán phòng thành công'
      };
    } catch (error) {
      console.error(`[ClassScheduleUpdate] Lỗi gán phòng - ScheduleID: ${scheduleId}, Error: ${error.message}`);
      return {
        success: false,
        message: `Lỗi gán phòng: ${error.message}`
      };
    }
  }

  // Hủy gán phòng
  async ClassScheduleUnassign(scheduleId) {
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
        success: true,
        data: {
          id: updatedSchedule.id,
          statusId: 1,
          statusName: 'Chờ phân phòng'
        },
        message: 'Đã hủy gán phòng thành công'
      };
    } catch (error) {
      console.error('[ClassScheduleService.ClassScheduleUnassign] Error:', error);
      return {
        success: false,
        message: `Lỗi hủy gán phòng: ${error.message}`
      };
    }
  }

  // =====================================================
  // LẤY PHÒNG KHẢ DỤNG CHO LỊCH HỌC
  // =====================================================
  
  async getAvailableRoomsForSchedule(scheduleId) {
    try {
      // Kiểm tra nếu scheduleId có dạng "classId-scheduleId"
      let actualScheduleId = scheduleId;
      if (typeof scheduleId === 'string' && scheduleId.includes('-')) {
        const parts = scheduleId.split('-');
        actualScheduleId = parts[1]; // Lấy phần thứ 2 (scheduleId thực tế)
        console.log(`[getAvailableRoomsForSchedule] Parsed scheduleId: ${actualScheduleId} from ${scheduleId}`);
      }
      
      const schedule = await prisma.classSchedule.findUnique({
        where: { id: parseInt(actualScheduleId) },
        include: {
          class: {
            include: { 
              ClassRoomType: true,
              department: true
            }
          },
          ClassRoomType: true
        }
      });

      if (!schedule) {
        return {
          success: false,
          message: 'Không tìm thấy lịch học'
        };
      }

      // Lấy phòng phù hợp với loại phòng và khoa
      const availableRooms = await prisma.classRoom.findMany({
        where: {
          classRoomTypeId: schedule.ClassRoomType.id,
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

      // Kiểm tra xung đột thời gian
      const conflictingSchedules = await prisma.classSchedule.findMany({
        where: {
          dayOfWeek: schedule.dayOfWeek,
          timeSlotId: schedule.timeSlotId,
          classRoomId: { not: null },
          statusId: { in: [2, 3] } // Đã phân phòng hoặc đang hoạt động
        }
      });

      const conflictingRoomIds = conflictingSchedules.map(s => s.classRoomId);
      
      console.log(`[getAvailableRoomsForSchedule] Found ${availableRooms.length} available rooms`);
      console.log(`[getAvailableRoomsForSchedule] Schedule classRoomTypeId: ${schedule.ClassRoomType.id}, classRoomTypeName: ${schedule.ClassRoomType.name}`);
      
      const filteredRooms = availableRooms
        .filter(room => !conflictingRoomIds.includes(room.id))
        .map(room => ({
          id: room.id,
          code: room.code,
          name: room.name,
          capacity: room.capacity,
          building: room.building,
          floor: room.floor,
          type: room.ClassRoomType.name,
          department: room.department?.name || 'Phòng chung',
          isSameDepartment: room.departmentId === schedule.class.departmentId
        }));
        
      console.log(`[getAvailableRoomsForSchedule] Filtered to ${filteredRooms.length} rooms after conflict check`);

      return {
        success: true,
        data: filteredRooms
      };
    } catch (error) {
      console.error('[ClassScheduleService.getAvailableRoomsForSchedule] Error:', error);
      return {
        success: false,
        message: `Lỗi lấy phòng khả dụng: ${error.message}`
      };
    }
  }

  // =====================================================
  // HELPER METHODS
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
}

module.exports = new ClassScheduleService();
