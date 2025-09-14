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
        // Xác định trạng thái lớp dựa trên statusId của lịch học
        const hasAssignedSchedule = cls.classSchedules.some(schedule => schedule.statusId === 2);
        const classStatusId = hasAssignedSchedule ? 2 : 1; 
        
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
        const hasAssignedSchedule = cls.classSchedules.some(schedule => schedule.statusId === 2);
        if (hasAssignedSchedule) {
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
          }
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
      
      return availableRooms
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
        throw new Error('Phòng học đã được sử dụng trong khung giờ này');
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

      const hasAssignedSchedule = classInfo?.classSchedules.some(schedule => schedule.statusId === 2) || false;
      const classStatusId = hasAssignedSchedule ? 2 : 1; // Trả về trực tiếp RequestType ID

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
  // 4. HELPER METHODS
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

module.exports = new ScheduleManagementService();
