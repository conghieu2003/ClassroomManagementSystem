const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authorize } = require('../middleware/auth');

// Lấy danh sách tất cả phòng học
router.get('/', authorize(['admin', 'teacher', 'student']), roomController.getAllRooms);

// Lấy thông tin chi tiết một phòng học
router.get('/:roomId', authorize(['admin', 'teacher', 'student']), roomController.getRoomById);

// Tạo yêu cầu phòng
router.post('/requests', authorize(['admin', 'teacher', 'student']), roomController.createRoomRequest);

module.exports = router;
