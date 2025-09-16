const roomService = require('../services/room.service');

class RoomController {
  async getAllRooms(req, res) {
    try {
      const rooms = await roomService.getAllRooms();
      return res.status(200).json({
        success: true,
        data: rooms
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRoomById(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomById(roomId);
      return res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async createRoomRequest(req, res) {
    try {
      const requestData = {
        ...req.body,
        requesterId: req.user.id // Lấy từ middleware auth
      };

      const roomRequest = await roomService.createRoomRequest(requestData);
      return res.status(201).json({
        success: true,
        data: roomRequest,
        message: 'Yêu cầu phòng đã được tạo thành công'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async createRoom(req, res) {
    try {
      const roomData = req.body;
      const room = await roomService.createRoom(roomData);
      return res.status(201).json({
        success: true,
        data: room,
        message: 'Phòng học đã được tạo thành công'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const roomData = req.body;
      const room = await roomService.updateRoom(roomId, roomData);
      return res.status(200).json({
        success: true,
        data: room,
        message: 'Phòng học đã được cập nhật thành công'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;
      await roomService.deleteRoom(roomId);
      return res.status(200).json({
        success: true,
        message: 'Phòng học đã được xóa thành công'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRoomRequests(req, res) {
    try {
      const requests = await roomService.getRoomRequests();
      return res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateRoomRequestStatus(req, res) {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
      const request = await roomService.updateRoomRequestStatus(requestId, status);
      return res.status(200).json({
        success: true,
        data: request,
        message: 'Trạng thái yêu cầu phòng đã được cập nhật'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTeachersWithClasses(req, res) {
    try {
      const teachers = await roomService.getTeachersWithClasses();
      return res.status(200).json({
        success: true,
        data: teachers
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTimeSlots(req, res) {
    try {
      const timeSlots = await roomService.getTimeSlots();
      return res.status(200).json({
        success: true,
        data: timeSlots
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTeacherSchedules(req, res) {
    try {
      const { teacherId } = req.params;
      const schedules = await roomService.getTeacherSchedules(teacherId);
      return res.status(200).json({
        success: true,
        data: schedules
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // API lấy lịch dạy của giảng viên
  async getTeacherSchedules(req, res) {
    try {
      const { teacherId } = req.params;
      const schedules = await roomService.getTeacherSchedules(teacherId);
      return res.status(200).json({
        success: true,
        data: schedules
      });
    } catch (error) {
      console.error('Room Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // API lấy danh sách phòng học có thể chọn cho yêu cầu
  async getAvailableRoomsForRequest(req, res) {
    try {
      const filters = req.query;
      const rooms = await roomService.getAvailableRoomsForRequest(filters);

      return res.status(200).json({
        success: true,
        data: rooms,
        message: `Tìm thấy ${rooms.length} phòng học phù hợp`
      });
    } catch (error) {
      console.error('Room Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = new RoomController();
