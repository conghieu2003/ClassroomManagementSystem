const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Routes công khai (không cần xác thực)
router.get('/', roomController.getAllRooms);
router.get('/requests/all', roomController.getRoomRequests);
router.get('/teachers-with-classes', roomController.getTeachersWithClasses);
router.get('/time-slots', roomController.getTimeSlots);
router.get('/teachers', roomController.getTeachers);
router.get('/teacher/:teacherId/schedules', roomController.getTeacherSchedules);
router.get('/available-for-request', roomController.getAvailableRoomsForRequest);

// Routes yêu cầu xác thực
router.use(verifyToken);

router.get('/:roomId', authorize(['admin', 'teacher', 'student']), roomController.getRoomById);
router.post('/', authorize(['admin']), roomController.createRoom);
router.put('/:roomId', authorize(['admin']), roomController.updateRoom);
router.delete('/:roomId', authorize(['admin']), roomController.deleteRoom);
router.post('/requests', authorize(['admin', 'teacher', 'student']), roomController.createRoomRequest);
router.put('/requests/:requestId/status', authorize(['admin']), roomController.updateRoomRequestStatus);

module.exports = router;