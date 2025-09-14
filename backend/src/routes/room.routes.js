const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Routes công khai (không cần xác thực)
router.get('/', roomController.getAllRooms);
router.get('/types', roomController.getClassRoomTypes);
router.get('/departments', roomController.getDepartments);
router.get('/request-types', roomController.getRequestTypes);
router.get('/request-statuses', roomController.getRequestStatuses);
router.get('/time-slots', roomController.getTimeSlots);
router.get('/requests', roomController.getScheduleRequests);

// Routes yêu cầu xác thực
router.use(verifyToken);

// Quản lý phòng học
router.get('/:roomId', authorize(['admin', 'teacher', 'student']), roomController.getRoomById);
router.post('/', authorize(['admin']), roomController.createRoom);
router.put('/:roomId', authorize(['admin']), roomController.updateRoom);
router.delete('/:roomId', authorize(['admin']), roomController.deleteRoom);

// Quản lý yêu cầu phòng
router.post('/requests', authorize(['admin', 'teacher']), roomController.createScheduleRequest);
router.put('/requests/:requestId/status', authorize(['admin']), roomController.updateScheduleRequestStatus);

module.exports = router;
