const roomService = require('../services/room.service');

class RoomController {
  // Helper method để xử lý response
  sendResponse(res, statusCode, success, data = null, message = '') {
    return res.status(statusCode).json({ success, data, message });
  }

  // Helper method để xử lý error
  sendError(res, error, statusCode = 400) {
    return res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }

  // API lấy danh sách phòng
  async getAllRooms(req, res) {
    try {
      const rooms = await roomService.getAllRooms();
      return this.sendResponse(res, 200, true, rooms);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API lấy thông tin phòng theo ID
  async getRoomById(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomById(roomId);
      return this.sendResponse(res, 200, true, room);
    } catch (error) {
      return this.sendError(res, error);
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

  // API tạo phòng mới
  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body);
      return this.sendResponse(res, 201, true, room, 'Phòng học đã được tạo thành công');
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API cập nhật phòng
  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const room = await roomService.updateRoom(roomId, req.body);
      return this.sendResponse(res, 200, true, room, 'Phòng học đã được cập nhật thành công');
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API xóa phòng
  async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;
      await roomService.deleteRoom(roomId);
      return this.sendResponse(res, 200, true, null, 'Phòng học đã được xóa thành công');
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API tạo yêu cầu phòng (ScheduleRequest)
  async createScheduleRequest(req, res) {
    try {
      const requestData = {
        ...req.body,
        requesterId: req.user.id
      };
      const request = await roomService.createScheduleRequest(requestData);
      return this.sendResponse(res, 201, true, request, 'Yêu cầu phòng đã được tạo thành công');
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API lấy danh sách yêu cầu phòng
  async getScheduleRequests(req, res) {
    try {
      const requests = await roomService.getScheduleRequests();
      return this.sendResponse(res, 200, true, requests);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API cập nhật trạng thái yêu cầu phòng
  async updateScheduleRequestStatus(req, res) {
    try {
      const { requestId } = req.params;
      const { statusId } = req.body;
      const request = await roomService.updateScheduleRequestStatus(requestId, statusId);
      return this.sendResponse(res, 200, true, request, 'Trạng thái yêu cầu phòng đã được cập nhật');
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API lấy danh sách loại phòng
  async getClassRoomTypes(req, res) {
    try {
      const types = await roomService.getClassRoomTypes();
      return this.sendResponse(res, 200, true, types);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API lấy danh sách giảng viên với lớp học
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

  // API lấy danh sách khoa
  async getDepartments(req, res) {
    try {
      const departments = await roomService.getDepartments();
      return this.sendResponse(res, 200, true, departments);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API lấy danh sách loại yêu cầu
  async getRequestTypes(req, res) {
    try {
      const types = await roomService.getRequestTypes();
      return this.sendResponse(res, 200, true, types);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API lấy danh sách trạng thái yêu cầu
  async getRequestStatuses(req, res) {
    try {
      const statuses = await roomService.getRequestStatuses();
      return this.sendResponse(res, 200, true, statuses);
    } catch (error) {
      return this.sendError(res, error);
    }
  }

  // API lấy danh sách tiết học
  async getTimeSlots(req, res) {
    try {
      const timeSlots = await roomService.getTimeSlots();
      return this.sendResponse(res, 200, true, timeSlots);
    } catch (error) {
      return this.sendError(res, error);
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
}

module.exports = new RoomController();
