const express = require('express');
const router = express.Router();
const scheduleManagementController = require('../controllers/scheduleManagement.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Routes công khai (không cần xác thực)
router.get('/classes', scheduleManagementController.getClassesForScheduling);
router.get('/stats', scheduleManagementController.getSchedulingStats);
router.get('/available-rooms/:scheduleId', scheduleManagementController.getAvailableRoomsForSchedule);
router.get('/departments', scheduleManagementController.getDepartments);
router.get('/teachers', scheduleManagementController.getTeachers);
router.get('/request-types', scheduleManagementController.getRequestTypes);

// Routes yêu cầu xác thực
router.use(verifyToken);

// Gán phòng cho lịch học
router.post('/assign-room/:scheduleId', authorize(['admin']), scheduleManagementController.assignRoomToSchedule);
router.delete('/unassign-room/:scheduleId', authorize(['admin']), scheduleManagementController.unassignRoomFromSchedule);

module.exports = router;
