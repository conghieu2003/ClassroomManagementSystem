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
}

module.exports = new RoomController();
