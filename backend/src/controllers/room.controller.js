const roomService = require('../services/room.service');

class RoomController {
  // Helper methods
  sendResponse(res, statusCode, success, data, message = null) {
    return res.status(statusCode).json({
      success,
      data,
      message
    });
  }

  sendError(res, error) {
    console.error('Room Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }

  // API lấy danh sách phòng
  async getAllRooms(req, res) {
    try {
      const rooms = await roomService.getAllRooms();
      return res.status(200).json({
        success: true,
        data: rooms
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

  // API lấy phòng học theo khoa và loại phòng
  async getRoomsByDepartmentAndType(req, res) {
    try {
      const { departmentId, classRoomTypeId } = req.query;
      const rooms = await roomService.getRoomsByDepartmentAndType(departmentId, classRoomTypeId);
      return res.status(200).json({
        success: true,
        data: rooms
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

  // API lấy thông tin phòng theo ID
  async getRoomById(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomById(roomId);
      return res.status(200).json({
        success: true,
        data: room
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

  // API tạo phòng mới
  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body);
      return res.status(201).json({
        success: true,
        data: room,
        message: 'Tạo phòng học thành công'
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

  // API cập nhật phòng
  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.updateRoom(roomId, req.body);
      return res.status(200).json({
        success: true,
        data: room,
        message: 'Cập nhật phòng học thành công'
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

  // API xóa phòng
  async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;
      const result = await roomService.deleteRoom(roomId);
      return res.status(200).json({
        success: true,
        data: result
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

  // API lấy danh sách loại phòng
  async getClassRoomTypes(req, res) {
    try {
      const types = await roomService.getClassRoomTypes();
      return res.status(200).json({
        success: true,
        data: types
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

  // API lấy danh sách khoa
  async getDepartments(req, res) {
    try {
      const departments = await roomService.getDepartments();
      return res.status(200).json({
        success: true,
        data: departments
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

  // API lấy danh sách loại yêu cầu
  async getRequestTypes(req, res) {
    try {
      const types = await roomService.getRequestTypes();
      return res.status(200).json({
        success: true,
        data: types
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

  // API lấy danh sách trạng thái yêu cầu
  async getRequestStatuses(req, res) {
    try {
      const statuses = await roomService.getRequestStatuses();
      return res.status(200).json({
        success: true,
        data: statuses
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

  // API lấy danh sách tiết học
  async getTimeSlots(req, res) {
    try {
      const timeSlots = await roomService.getTimeSlots();
      return res.status(200).json({
        success: true,
        data: timeSlots
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

  // API lấy danh sách giảng viên
  async getTeachers(req, res) {
    try {
      const teachers = await roomService.getTeachers();
      return res.status(200).json({
        success: true,
        data: teachers
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

  // API lấy danh sách lớp học của giảng viên
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

  // API lấy thông tin chi tiết của một lớp học
  async getClassScheduleById(req, res) {
    try {
      const { scheduleId } = req.params;
      const schedule = await roomService.getClassScheduleById(scheduleId);
      return res.status(200).json({
        success: true,
        data: schedule
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