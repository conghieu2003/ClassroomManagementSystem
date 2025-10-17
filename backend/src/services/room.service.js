const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RoomService {
  // Helper method để xử lý dữ liệu phòng
  processRoomData(room) {
    return {
      id: room.id.toString(),
      roomNumber: room.code,
      name: room.name,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      type: room.ClassRoomType?.name || '',
      campus: room.campus,
      department: room.department?.name || '',
      description: room.description,
      isAvailable: room.isAvailable
    };
  }

  async getAllRooms() {
    try {
      const rooms = await prisma.classRoom.findMany({
        include: {
          ClassRoomType: true,
          department: true
        }
      });

      console.log('Found rooms:', rooms.length);
      return rooms.map(room => this.processRoomData(room));
    } catch (error) {
      console.error('Error in getAllRooms:', error);
      throw new Error(`Lỗi lấy danh sách phòng học: ${error.message}`);
    }
  }

  // Lấy phòng học theo khoa và loại phòng
  async getRoomsByDepartmentAndType(departmentId, classRoomTypeId) {
    try {
      const whereClause = {
        isAvailable: true
      };

      // Lọc theo khoa nếu có
      if (departmentId && departmentId !== 'all') {
        whereClause.OR = [
          { departmentId: parseInt(departmentId) },
          { departmentId: null } // Phòng chung
        ];
      }

      // Lọc theo loại phòng nếu có
      if (classRoomTypeId && classRoomTypeId !== 'all') {
        whereClause.classRoomTypeId = parseInt(classRoomTypeId);
      }

      const rooms = await prisma.classRoom.findMany({
        where: whereClause,
        include: {
          ClassRoomType: true,
          department: true
        },
        orderBy: [
          { building: 'asc' },
          { floor: 'asc' },
          { code: 'asc' }
        ]
      });

      console.log(`Found ${rooms.length} rooms for department ${departmentId} and type ${classRoomTypeId}`);
      return rooms.map(room => this.processRoomData(room));
    } catch (error) {
      console.error('Error in getRoomsByDepartmentAndType:', error);
      throw new Error(`Lỗi lấy danh sách phòng học: ${error.message}`);
    }
  }

  async getRoomById(roomId) {
    try {
      const room = await prisma.classRoom.findUnique({
        where: { id: parseInt(roomId) },
        include: {
          ClassRoomType: true,
          department: true
        }
      });

      if (!room) {
        throw new Error('Không tìm thấy phòng học');
      }

      return this.processRoomData(room);
    } catch (error) {
      throw new Error(`Lỗi lấy thông tin phòng học: ${error.message}`);
    }
  }

  async createRoom(roomData) {
    try {
      const room = await prisma.classRoom.create({
        data: {
          code: roomData.code,
          name: roomData.name,
          capacity: parseInt(roomData.capacity),
          building: roomData.building,
          floor: parseInt(roomData.floor),
          campus: roomData.campus,
          classRoomTypeId: parseInt(roomData.classRoomTypeId),
          departmentId: roomData.departmentId ? parseInt(roomData.departmentId) : null,
          isAvailable: roomData.isAvailable !== false,
          description: roomData.description
        },
        include: {
          ClassRoomType: true,
          department: true
        }
      });

      return this.processRoomData(room);
    } catch (error) {
      throw new Error(`Lỗi tạo phòng học: ${error.message}`);
    }
  }

  async updateRoom(roomId, roomData) {
    try {
      const room = await prisma.classRoom.update({
        where: { id: parseInt(roomId) },
        data: {
          code: roomData.code,
          name: roomData.name,
          capacity: parseInt(roomData.capacity),
          building: roomData.building,
          floor: parseInt(roomData.floor),
          campus: roomData.campus,
          classRoomTypeId: parseInt(roomData.classRoomTypeId),
          departmentId: roomData.departmentId ? parseInt(roomData.departmentId) : null,
          isAvailable: roomData.isAvailable !== false,
          description: roomData.description
        },
        include: {
          ClassRoomType: true,
          department: true
        }
      });

      return this.processRoomData(room);
    } catch (error) {
      throw new Error(`Lỗi cập nhật phòng học: ${error.message}`);
    }
  }

  async deleteRoom(roomId) {
    try {
      // Kiểm tra xem phòng có đang được sử dụng không
      const schedules = await prisma.classSchedule.findMany({
        where: { classRoomId: parseInt(roomId) }
      });

      if (schedules.length > 0) {
        throw new Error('Không thể xóa phòng học đang được sử dụng');
      }

      await prisma.classRoom.delete({
        where: { id: parseInt(roomId) }
      });

      return { message: 'Xóa phòng học thành công' };
    } catch (error) {
      throw new Error(`Lỗi xóa phòng học: ${error.message}`);
    }
  }

  // Helper methods cho các API khác
  async getClassRoomTypes() {
    try {
      return await prisma.classRoomType.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách loại phòng: ${error.message}`);
    }
  }


  async getRequestTypes() {
    try {
      return await prisma.requestType.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách loại yêu cầu: ${error.message}`);
    }
  }

  async getRequestStatuses() {
    try {
      return await prisma.requestStatus.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách trạng thái yêu cầu: ${error.message}`);
    }
  }

  async getTimeSlots() {
    try {
      const timeSlots = await prisma.timeSlot.findMany({
        orderBy: { startTime: 'asc' }
      });

      return timeSlots.map(slot => ({
        id: slot.id,
        slotName: slot.slotName,
        startTime: slot.startTime.toTimeString().slice(0, 8),
        endTime: slot.endTime.toTimeString().slice(0, 8),
        shift: slot.shift
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách tiết học: ${error.message}`);
    }
  }


  // Lấy danh sách lớp học của giảng viên
  async getTeacherSchedules(userId) {
    try {
      // Tìm Teacher ID từ User ID
      const teacher = await prisma.teacher.findFirst({
        where: {
          userId: parseInt(userId)
        },
        select: {
          id: true
        }
      });

      if (!teacher) {
        return [];
      }

      const classSchedules = await prisma.classSchedule.findMany({
        where: {
          teacherId: teacher.id,
          classRoomId: {
            not: null  // Chỉ lấy những lớp đã có phòng
          }
        },
        include: {
          class: {
            select: {
              id: true,
              code: true,
              className: true,
              subjectName: true,
              subjectCode: true,
              maxStudents: true
            }
          },
          classRoom: {
            select: {
              id: true,
              code: true,
              name: true,
              capacity: true,
              ClassRoomType: {
                select: {
                  name: true
                }
              }
            }
          },
          timeSlot: {
            select: {
              id: true,
              slotName: true,
              startTime: true,
              endTime: true,
              shift: true
            }
          }
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { timeSlotId: 'asc' }
        ]
      });

      return classSchedules.map(schedule => ({
        id: schedule.id,
        classId: schedule.classId,
        teacherId: schedule.teacherId,
        classRoomId: schedule.classRoomId,
        dayOfWeek: schedule.dayOfWeek,
        timeSlotId: schedule.timeSlotId,
        weekPattern: schedule.weekPattern,
        startWeek: schedule.startWeek,
        endWeek: schedule.endWeek,
        status: schedule.statusId,
        class: {
          id: schedule.class.id,
          code: schedule.class.code,
          className: schedule.class.className,
          subjectName: schedule.class.subjectName,
          subjectCode: schedule.class.subjectCode,
          maxStudents: schedule.class.maxStudents
        },
        classRoom: schedule.classRoom ? {
          id: schedule.classRoom.id,
          code: schedule.classRoom.code,
          name: schedule.classRoom.name,
          capacity: schedule.classRoom.capacity,
          type: schedule.classRoom.ClassRoomType?.name || ''
        } : null,
        timeSlot: {
          id: schedule.timeSlot.id,
          slotName: schedule.timeSlot.slotName,
          startTime: schedule.timeSlot.startTime.toTimeString().slice(0, 8),
          endTime: schedule.timeSlot.endTime.toTimeString().slice(0, 8),
          shift: schedule.timeSlot.shift
        }
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách lớp học của giảng viên: ${error.message}`);
    }
  }

  // Lấy thông tin chi tiết của một lớp học
  async getClassScheduleById(scheduleId) {
    try {
      const schedule = await prisma.classSchedule.findUnique({
        where: {
          id: parseInt(scheduleId)
        },
        include: {
          class: {
            select: {
              id: true,
              code: true,
              className: true,
              subjectName: true,
              subjectCode: true,
              maxStudents: true,
              credits: true,
              semester: true,
              academicYear: true
            }
          },
          classRoom: {
            select: {
              id: true,
              code: true,
              name: true,
              capacity: true,
              building: true,
              floor: true,
              ClassRoomType: {
                select: {
                  name: true
                }
              }
            }
          },
          timeSlot: {
            select: {
              id: true,
              slotName: true,
              startTime: true,
              endTime: true,
              shift: true
            }
          },
          teacher: {
            select: {
              id: true,
              teacherCode: true,
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!schedule) {
        throw new Error('Không tìm thấy lớp học');
      }

      return {
        id: schedule.id,
        classId: schedule.classId,
        teacherId: schedule.teacherId,
        classRoomId: schedule.classRoomId,
        dayOfWeek: schedule.dayOfWeek,
        timeSlotId: schedule.timeSlotId,
        weekPattern: schedule.weekPattern,
        startWeek: schedule.startWeek,
        endWeek: schedule.endWeek,
        status: schedule.statusId,
        class: {
          id: schedule.class.id,
          code: schedule.class.code,
          className: schedule.class.className,
          subjectName: schedule.class.subjectName,
          subjectCode: schedule.class.subjectCode,
          maxStudents: schedule.class.maxStudents,
          credits: schedule.class.credits,
          semester: schedule.class.semester,
          academicYear: schedule.class.academicYear
        },
        classRoom: schedule.classRoom ? {
          id: schedule.classRoom.id,
          code: schedule.classRoom.code,
          name: schedule.classRoom.name,
          capacity: schedule.classRoom.capacity,
          type: schedule.classRoom.ClassRoomType?.name || '',
          building: schedule.classRoom.building,
          floor: schedule.classRoom.floor
        } : null,
        timeSlot: {
          id: schedule.timeSlot.id,
          slotName: schedule.timeSlot.slotName,
          startTime: schedule.timeSlot.startTime.toTimeString().slice(0, 8),
          endTime: schedule.timeSlot.endTime.toTimeString().slice(0, 8),
          shift: schedule.timeSlot.shift
        },
        teacher: {
          id: schedule.teacher.id,
          teacherCode: schedule.teacher.teacherCode,
          fullName: schedule.teacher.user.fullName,
          email: schedule.teacher.user.email
        }
      };
    } catch (error) {
      throw new Error(`Lỗi lấy thông tin lớp học: ${error.message}`);
    }
  }

  // Lấy lịch học theo time slot và thứ trong tuần
  async getSchedulesByTimeSlotAndDate(timeSlotId, dayOfWeek) {
    try {
      const schedules = await prisma.classSchedule.findMany({
        where: {
          timeSlotId: parseInt(timeSlotId),
          dayOfWeek: parseInt(dayOfWeek) // dayOfWeek (1-7)
        },
        include: {
          class: {
            select: {
              id: true,
              className: true,
              subjectName: true
            }
          },
          classRoom: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          teacher: {
            select: {
              id: true,
              teacherCode: true,
              user: {
                select: {
                  fullName: true
                }
              }
            }
          }
        }
      });

      return schedules.map(schedule => ({
        id: schedule.id,
        classRoomId: schedule.classRoomId,
        classRoom: schedule.classRoom,
        class: schedule.class,
        teacher: schedule.teacher,
        dayOfWeek: schedule.dayOfWeek,
        timeSlotId: schedule.timeSlotId
      }));
    } catch (error) {
      console.error('Error getting schedules by time slot and date:', error);
      throw new Error(`Lỗi lấy lịch học: ${error.message}`);
    }
  }
}

module.exports = new RoomService();