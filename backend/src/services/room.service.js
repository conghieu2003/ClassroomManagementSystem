const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RoomService {
  // Helper method để xử lý dữ liệu phòng
  processRoomData(room, currentSchedule = null) {
    const status = currentSchedule ? 'inUse' : 'available';
    return {
      id: room.id.toString(),
      roomNumber: room.code,
      name: room.name,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      type: room.ClassRoomType?.name || 'Chưa xác định',
      campus: room.campus,
      department: room.department?.name || 'Chưa xác định',
      description: room.description,
      isAvailable: room.isAvailable,
      status,
      currentClass: currentSchedule?.class?.className || '',
      currentSubject: currentSchedule?.class?.subjectName || '',
      currentTeacher: currentSchedule?.teacher?.user?.fullName || '',
      schedule: currentSchedule ? `${this.getDayName(currentSchedule.dayOfWeek)}, ${currentSchedule.timeSlot.slotName}` : ''
    };
  }

  // Helper method để tìm lịch học hiện tại
  findCurrentSchedule(classSchedules) {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
    const currentTime = currentDate.toTimeString().slice(0, 8);

    return classSchedules.find(schedule => {
      const scheduleStartTime = schedule.timeSlot.startTime.toTimeString().slice(0, 8);
      const scheduleEndTime = schedule.timeSlot.endTime.toTimeString().slice(0, 8);
      
      return schedule.dayOfWeek === currentDayOfWeek && 
             currentTime >= scheduleStartTime && 
             currentTime <= scheduleEndTime;
    });
  }

  async getAllRooms() {
    try {
      const rooms = await prisma.classRoom.findMany({
        include: {
          ClassRoomType: true,
          department: true,
          classSchedules: {
            where: { status: 'active' },
            include: {
              class: true,
              teacher: { include: { user: true } },
              timeSlot: true
            }
          }
        }
      });

      return rooms.map(room => {
        const currentSchedule = this.findCurrentSchedule(room.classSchedules);
        return this.processRoomData(room, currentSchedule);
      });
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách phòng học: ${error.message}`);
    }
  }

  async getRoomById(roomId) {
    try {
      const room = await prisma.classRoom.findUnique({
        where: { id: parseInt(roomId) },
        include: {
          ClassRoomType: true,
          department: true,
          classSchedules: {
            where: { status: 'active' },
            include: {
              class: true,
              teacher: { include: { user: true } },
              timeSlot: true
            }
          }
        }
      });

      if (!room) {
        throw new Error('Không tìm thấy phòng học');
      }

      const currentSchedule = this.findCurrentSchedule(room.classSchedules);
      return this.processRoomData(room, currentSchedule);
    } catch (error) {
      throw new Error(`Lỗi lấy thông tin phòng học: ${error.message}`);
    }
  }

  async createScheduleRequest(requestData) {
    try {
      const { roomId, requestTypeId, reason, requestedDate, timeSlotId } = requestData;

      const scheduleRequest = await prisma.scheduleRequest.create({
        data: {
          requestTypeId: parseInt(requestTypeId),
          classRoomId: parseInt(roomId),
          requesterId: requestData.requesterId,
          requestDate: new Date(requestedDate),
          timeSlotId: parseInt(timeSlotId),
          reason,
          requestStatusId: 1 // pending
        }
      });

      return scheduleRequest;
    } catch (error) {
      throw new Error(`Lỗi tạo yêu cầu phòng: ${error.message}`);
    }
  }

  async createRoom(roomData) {
    try {
      const { code, name, capacity, building, floor, campus, classRoomTypeId, departmentId, description } = roomData;

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
          departmentId: departmentId ? parseInt(departmentId) : null,
          description
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
      const { code, name, capacity, building, floor, campus, classRoomTypeId, departmentId, description } = roomData;

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
          departmentId: departmentId !== undefined ? (departmentId ? parseInt(departmentId) : null) : existingRoom.departmentId,
          description: description !== undefined ? description : existingRoom.description
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

  async getScheduleRequests() {
    try {
      const requests = await prisma.scheduleRequest.findMany({
        where: {
          classRoomId: { not: null }
        },
        include: {
          classRoom: true,
          requester: { include: { account: true } },
          timeSlot: true,
          RequestStatus: true,
          RequestType: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return requests.map(request => ({
        id: request.id.toString(),
        roomId: request.classRoomId?.toString(),
        roomCode: request.classRoom?.code,
        roomName: request.classRoom?.name,
        requesterId: request.requesterId.toString(),
        requesterName: request.requester.fullName,
        requesterEmail: request.requester.email,
        reason: request.reason,
        requestDate: request.requestDate,
        timeSlot: request.timeSlot?.slotName,
        status: request.RequestStatus?.name,
        requestType: request.RequestType?.name,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }));
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách yêu cầu phòng: ${error.message}`);
    }
  }

  async updateScheduleRequestStatus(requestId, statusId) {
    try {
      const request = await prisma.scheduleRequest.update({
        where: { id: parseInt(requestId) },
        data: { 
          requestStatusId: parseInt(statusId),
          approvedAt: new Date()
        },
        include: {
          classRoom: true,
          requester: { include: { account: true } },
          timeSlot: true,
          RequestStatus: true,
          RequestType: true
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
        reason: request.reason,
        requestDate: request.requestDate,
        timeSlot: request.timeSlot?.slotName,
        status: request.RequestStatus?.name,
        requestType: request.RequestType?.name,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      };
    } catch (error) {
      throw new Error(`Lỗi cập nhật trạng thái yêu cầu phòng: ${error.message}`);
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

  async getDepartments() {
    try {
      return await prisma.department.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách khoa: ${error.message}`);
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

  getDayName(dayOfWeek) {
    const days = {
      1: 'Chủ nhật', 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4',
      5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7'
    };
    return days[dayOfWeek] || 'Không xác định';
  }
}

module.exports = new RoomService();
