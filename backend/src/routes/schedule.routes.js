const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/teacher/:teacherId', scheduleController.getTeacher);
router.get('/student/:studentId', scheduleController.getStudent);
router.get('/room/:roomId', scheduleController.getRoom);

module.exports = router;


