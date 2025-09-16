const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RoomService {
  async getAllRooms() {
    try {
      const rooms = await prisma.classRoom.findMany({
        include: {
          classSchedules: {
            where: {
              statusId: 1 // active status
            },
            include: {
              class: true,
              teacher: {
                include: {
                  user: true
                }
              },
              timeSlot: true
            }
          }
        }
      });

      // Xử lý dữ liệu để thêm thông tin trạng thái và lịch học hiện tại
      const processedRooms = rooms.map(room => {
        const currentDate = new Date();
        const currentDayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Chuyển Chủ nhật từ 0 thành 7
        const currentTime = currentDate.toTimeString().slice(0, 8); // HH:MM:SS

        // Tìm lịch học hiện tại của phòng
        const currentSchedule = room.classSchedules.find(schedule => {
          const scheduleStartTime = schedule.timeSlot.startTime.toTimeString().slice(0, 8);
          const scheduleEndTime = schedule.timeSlot.endTime.toTimeString().slice(0, 8);

          return schedule.dayOfWeek === currentDayOfWeek &&
            currentTime >= scheduleStartTime &&
            currentTime <= scheduleEndTime;
        });

        // Xác định trạng thái phòng
        let status = 'available';
        let currentClass = '';
        let currentSubject = '';
        let currentTeacher = '';
        let schedule = '';

        if (currentSchedule) {
          status = 'inUse';
          currentClass = currentSchedule.class.className;
          currentSubject = currentSchedule.class.subjectName;
          currentTeacher = currentSchedule.teacher.user.fullName;
          schedule = `${this.getDayName(currentSchedule.dayOfWeek)}, ${currentSchedule.timeSlot.slotName}`;
        }

        return {
          id: room.id.toString(),
          roomNumber: room.code,
          name: room.name,
          building: room.building,
          floor: room.floor,
          capacity: room.capacity,
          type: room.ClassRoomType?.name || 'Unknown',
          campus: room.campus,
          description: room.description,
          status,
          currentClass,
          currentSubject,
          currentTeacher,
          schedule,
          isAvailable: status === 'available'
        };
      });

      return processedRooms;
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách phòng học: ${error.message}`);
    }
  }

  async getRoomById(roomId) {
    try {
      const room = await prisma.classRoom.findUnique({
        where: { id: parseInt(roomId) },
        include: {
          classSchedules: {
            where: {
              statusId: 1 // active status
            },
            include: {
              class: true,
              teacher: {
                include: {
                  user: true
                }
              },
              timeSlot: true
            }
          }
        }
      });

      if (!room) {
        throw new Error('Không tìm thấy phòng học');
      }

      return room;
    } catch (error) {
      throw new Error(`Lỗi lấy thông tin phòng học: ${error.message}`);
    }
  }

  async createRoomRequest(requestData) {
    try {
      const { roomId, requestType, reason, requestedDate, requestedTime } = requestData;

      // Tìm timeSlot dựa trên requestedTime
      let timeSlotId = null;
      if (requestedTime) {
        const timeSlot = await prisma.timeSlot.findFirst({
          where: {
            startTime: {
              lte: new Date(`2000-01-01T${requestedTime.split('-')[0]}:00`)
            },
            endTime: {
              gte: new Date(`2000-01-01T${requestedTime.split('-')[1]}:00`)
            }
          }
        });
        timeSlotId = timeSlot?.id;
      }

      const roomRequest = await prisma.roomRequest.create({
        data: {
          classRoomId: parseInt(roomId),
          requesterId: requestData.requesterId,
          purpose: reason,
          date: new Date(requestedDate),
          timeSlotId: timeSlotId || 1, // Default timeSlot nếu không tìm thấy
          status: 'pending'
        }
      });

      return roomRequest;
    } catch (error) {
      throw new Error(`Lỗi tạo yêu cầu phòng: ${error.message}`);
    }
  }

  async createRoom(roomData) {
    try {
      const { code, name, capacity, building, floor, campus, type, description, classRoomTypeId } = roomData;

      // Kiểm tra phòng đã tồn tại chưa
      const existingRoom = await prisma.classRoom.findUnique({
        where: { code }
      });

      if (existingRoom) {
        throw new Error('Mã phòng đã tồn tại');
      }

      const room = await prisma.classRoom.create({
        data: {
          code,
          name,
          capacity: parseInt(capacity),
          building,
          floor: parseInt(floor),
          campus,
          classRoomTypeId: parseInt(classRoomTypeId),
          description
        }
      });

      return room;
    } catch (error) {
      throw new Error(`Lỗi tạo phòng học: ${error.message}`);
    }
  }

  async updateRoom(roomId, roomData) {
    try {
      const { code, name, capacity, building, floor, campus, type, description, classRoomTypeId } = roomData;

      // Kiểm tra phòng có tồn tại không
      const existingRoom = await prisma.classRoom.findUnique({
        where: { id: parseInt(roomId) }
      });

      if (!existingRoom) {
        throw new Error('Không tìm thấy phòng học');
      }

      // Kiểm tra mã phòng trùng lặp (nếu có thay đổi)
      if (code && code !== existingRoom.code) {
        const duplicateRoom = await prisma.classRoom.findUnique({
          where: { code }
        });

        if (duplicateRoom) {
          throw new Error('Mã phòng đã tồn tại');
        }
      }

      const room = await prisma.classRoom.update({
        where: { id: parseInt(roomId) },
        data: {
          code: code || existingRoom.code,
          name: name || existingRoom.name,
          capacity: capacity ? parseInt(capacity) : existingRoom.capacity,
          building: building || existingRoom.building,
          floor: floor ? parseInt(floor) : existingRoom.floor,
          campus: campus !== undefined ? campus : existingRoom.campus,
          classRoomTypeId: classRoomTypeId ? parseInt(classRoomTypeId) : existingRoom.classRoomTypeId,
          description: description !== undefined ? description : existingRoom.description
        }
      });

      return room;
    } catch (error) {
      throw new Error(`Lỗi cập nhật phòng học: ${error.message}`);
    }
  }

  async deleteRoom(roomId) {
    try {
      // Kiểm tra phòng có tồn tại không
      const existingRoom = await prisma.classRoom.findUnique({
        where: { id: parseInt(roomId) },
        include: {
          classSchedules: true,
          scheduleRequestRooms: true
        }
      });

      if (!existingRoom) {
        throw new Error('Không tìm thấy phòng học');
      }

      // Kiểm tra phòng có đang được sử dụng không
      if (existingRoom.classSchedules.length > 0) {
        throw new Error('Không thể xóa phòng đang có lịch học');
      }

      if (existingRoom.scheduleRequestRooms.length > 0) {
        throw new Error('Không thể xóa phòng đang có yêu cầu');
      }

      await prisma.classRoom.delete({
        where: { id: parseInt(roomId) }
      });

      return { message: 'Phòng học đã được xóa thành công' };
    } catch (error) {
      throw new Error(`Lỗi xóa phòng học: ${error.message}`);
    }
  }

  async getRoomRequests() {
    try {
      const requests = await prisma.scheduleRequest.findMany({
        include: {
          classRoom: true,
          requester: {
            include: {
              account: true
            }
          },
          RequestType: true,
          RequestStatus: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return requests.map(request => ({
        id: request.id.toString(),
        roomId: request.classRoomId?.toString(),
        roomCode: request.classRoom?.code,
        roomName: request.classRoom?.name,
        requesterId: request.requesterId.toString(),
        requesterName: request.requester.fullName,
        requesterEmail: request.requester.email,
        purpose: request.reason,
        date: request.requestDate,
        timeSlot: 'N/A', // Có thể lấy từ timeSlot relation nếu cần
        status: request.RequestStatus?.name || 'pending',
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách yêu cầu phòng: ${error.message}`);
    }
  }

  async updateRoomRequestStatus(requestId, status) {
    try {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new Error('Trạng thái không hợp lệ');
      }

      // Map status string to requestStatusId
      let requestStatusId = 1; // pending
      if (status === 'approved') {
        requestStatusId = 2;
      } else if (status === 'rejected') {
        requestStatusId = 3;
      }

      const request = await prisma.scheduleRequest.update({
        where: { id: parseInt(requestId) },
        data: { requestStatusId },
        include: {
          classRoom: true,
          requester: {
            include: {
              account: true
            }
          },
          RequestType: true,
          RequestStatus: true
        }
      });

      return {
        id: request.id.toString(),
        roomId: request.classRoomId?.toString(),
        roomCode: request.classRoom?.code,
        roomName: request.classRoom?.name,
        requesterId: request.requesterId.toString(),
        requesterName: request.requester.fullName,
        requesterEmail: request.requester.email,
        purpose: request.reason,
        date: request.requestDate,
        timeSlot: 'N/A',
        status: request.RequestStatus?.name || 'pending',
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      };
    } catch (error) {
      throw new Error(`Lỗi cập nhật trạng thái yêu cầu phòng: ${error.message}`);
    }
  }

  async getTeachersWithClasses() {
    try {
      const teachers = await prisma.teacher.findMany({
        include: {
          user: true,
          classes: {
            where: {
              // Filter active classes if needed
            },
            include: {
              classSchedules: {
                where: {
                  statusId: 1 // active status
                },
                include: {
                  classRoom: true,
                  timeSlot: true
                }
              }
            }
          }
        }
      });

      return teachers.map(teacher => ({
        id: teacher.id.toString(),
        teacherCode: teacher.teacherCode,
        fullName: teacher.user.fullName,
        email: teacher.user.email,
        classes: teacher.classes.map(cls => ({
          id: cls.id.toString(),
          code: cls.code,
          className: cls.className,
          subjectName: cls.subjectName,
          subjectCode: cls.subjectCode,
          maxStudents: cls.maxStudents,
          schedules: cls.classSchedules.map(schedule => ({
            id: schedule.id.toString(),
            dayOfWeek: schedule.dayOfWeek,
            dayName: this.getDayName(schedule.dayOfWeek),
            timeSlot: schedule.timeSlot.slotName,
            startTime: schedule.timeSlot.startTime.toTimeString().slice(0, 5),
            endTime: schedule.timeSlot.endTime.toTimeString().slice(0, 5),
            room: {
              id: schedule.classRoom?.id?.toString(),
              code: schedule.classRoom?.code,
              name: schedule.classRoom?.name,
              capacity: schedule.classRoom?.capacity
            }
          }))
        }))
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách giảng viên và lớp học: ${error.message}`);
    }
  }

  async getTimeSlots() {
    try {
      const timeSlots = await prisma.timeSlot.findMany({
        orderBy: {
          startTime: 'asc'
        }
      });

      return timeSlots.map(slot => ({
        id: slot.id.toString(),
        slotName: slot.slotName,
        startTime: slot.startTime.toTimeString().slice(0, 5),
        endTime: slot.endTime.toTimeString().slice(0, 5),
        shift: slot.shift
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách tiết học: ${error.message}`);
    }
  }

  async getTeacherSchedules(teacherId) {
    try {
      const classSchedules = await prisma.classSchedule.findMany({
        where: {
          teacherId: parseInt(teacherId)
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
              building: true,
              floor: true,
              campus: true,
              classRoomTypeId: true,
              ClassRoomType: {
                select: {
                  id: true,
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

      return classSchedules;
    } catch (error) {
      throw new Error(`Lỗi lấy lịch giảng viên: ${error.message}`);
    }
  }

  async getTeachers() {
    try {
      const teachers = await prisma.teacher.findMany({
        include: {
          user: true,
          department: true,
          major: true
        }
      });

      return teachers.map(teacher => ({
        id: teacher.id,
        teacherCode: teacher.teacherCode,
        fullName: teacher.user.fullName,
        email: teacher.user.email,
        department: teacher.department?.name,
        major: teacher.major?.name
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách giảng viên: ${error.message}`);
    }
  }

  // API lấy danh sách phòng học có thể chọn cho yêu cầu
  async getAvailableRoomsForRequest(filters = {}) {
    try {
      const {
        classRoomTypeId,
        departmentId,
        minCapacity,
        building,
        campus,
        excludeRoomId // Phòng hiện tại cần loại trừ
      } = filters;

      // Xây dựng điều kiện where
      const whereConditions = {
        isAvailable: true
      };

      if (classRoomTypeId) {
        whereConditions.classRoomTypeId = parseInt(classRoomTypeId);
      }

      if (departmentId) {
        whereConditions.departmentId = parseInt(departmentId);
      }

      if (minCapacity) {
        whereConditions.capacity = {
          gte: parseInt(minCapacity)
        };
      }

      if (building) {
        whereConditions.building = {
          contains: building,
          mode: 'insensitive'
        };
      }

      if (campus) {
        whereConditions.campus = {
          contains: campus,
          mode: 'insensitive'
        };
      }

      if (excludeRoomId) {
        whereConditions.id = {
          not: parseInt(excludeRoomId)
        };
      }

      const rooms = await prisma.classRoom.findMany({
        where: whereConditions,
        include: {
          ClassRoomType: {
            select: {
              id: true,
              name: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          },
          classSchedules: {
            where: {
              statusId: 1  // active status
            },
            select: {
              id: true,
              dayOfWeek: true,
              timeSlotId: true,
              class: {
                select: {
                  className: true,
                  subjectName: true
                }
              },
              timeSlot: {
                select: {
                  slotName: true,
                  startTime: true,
                  endTime: true
                }
              }
            }
          }
        },
        orderBy: [
          { building: 'asc' },
          { floor: 'asc' },
          { code: 'asc' }
        ]
      });

      // Xử lý dữ liệu để thêm thông tin trạng thái
      const processedRooms = rooms.map(room => {
        // Tính số lịch học hiện tại
        const currentSchedules = room.classSchedules.length;

        // Xác định trạng thái phòng
        let status = 'available';
        let statusText = 'Sẵn sàng';

        if (currentSchedules > 0) {
          status = 'partially_used';
          statusText = `Đang sử dụng ${currentSchedules} lịch`;
        }

        return {
          id: room.id,
          code: room.code,
          name: room.name,
          capacity: room.capacity,
          building: room.building,
          floor: room.floor,
          campus: room.campus,
          description: room.description,
          isAvailable: room.isAvailable,
          status,
          statusText,
          currentSchedules,
          ClassRoomType: {
            id: room.ClassRoomType.id,
            name: room.ClassRoomType.name
          },
          department: room.department ? {
            id: room.department.id,
            name: room.department.name
          } : null,
          schedules: room.classSchedules.map(schedule => ({
            id: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            dayName: this.getDayName(schedule.dayOfWeek),
            timeSlot: schedule.timeSlot.slotName,
            startTime: schedule.timeSlot.startTime.toTimeString().slice(0, 5),
            endTime: schedule.timeSlot.endTime.toTimeString().slice(0, 5),
            className: schedule.class.className,
            subjectName: schedule.class.subjectName
          }))
        };
      });

      return processedRooms;
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách phòng học: ${error.message}`);
    }
  }

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
}

module.exports = new RoomService();