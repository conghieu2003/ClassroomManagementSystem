const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RoomService {
  async getAllRooms() {
    try {
      const rooms = await prisma.classRoom.findMany({
        include: {
          classSchedules: {
            where: {
              status: 'active'
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
          type: room.type,
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
              status: 'active'
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
      const { code, name, capacity, building, floor, campus, type, description } = roomData;

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
          type,
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
      const { code, name, capacity, building, floor, campus, type, description } = roomData;

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
          type: type || existingRoom.type,
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
          roomRequests: true
        }
      });

      if (!existingRoom) {
        throw new Error('Không tìm thấy phòng học');
      }

      // Kiểm tra phòng có đang được sử dụng không
      if (existingRoom.classSchedules.length > 0) {
        throw new Error('Không thể xóa phòng đang có lịch học');
      }

      if (existingRoom.roomRequests.length > 0) {
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
      const requests = await prisma.roomRequest.findMany({
        include: {
          classRoom: true,
          requester: {
            include: {
              account: true
            }
          },
          timeSlot: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return requests.map(request => ({
        id: request.id.toString(),
        roomId: request.classRoomId.toString(),
        roomCode: request.classRoom.code,
        roomName: request.classRoom.name,
        requesterId: request.requesterId.toString(),
        requesterName: request.requester.fullName,
        requesterEmail: request.requester.email,
        purpose: request.purpose,
        date: request.date,
        timeSlot: request.timeSlot.slotName,
        status: request.status,
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

      const request = await prisma.roomRequest.update({
        where: { id: parseInt(requestId) },
        data: { status },
        include: {
          classRoom: true,
          requester: {
            include: {
              account: true
            }
          },
          timeSlot: true
        }
      });

      return {
        id: request.id.toString(),
        roomId: request.classRoomId.toString(),
        roomCode: request.classRoom.code,
        roomName: request.classRoom.name,
        requesterId: request.requesterId.toString(),
        requesterName: request.requester.fullName,
        requesterEmail: request.requester.email,
        purpose: request.purpose,
        date: request.date,
        timeSlot: request.timeSlot.slotName,
        status: request.status,
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
              status: 'active'
            },
            include: {
              classSchedules: {
                where: {
                  status: 'active'
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
              id: schedule.classRoom.id.toString(),
              code: schedule.classRoom.code,
              name: schedule.classRoom.name,
              capacity: schedule.classRoom.capacity
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
              type: true
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
