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
