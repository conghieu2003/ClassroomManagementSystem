const scheduleService = require('../services/schedule.service');

class ScheduleController {
    async getTeacher(req, res) {
        try {
            const { teacherId } = req.params;
            const data = await scheduleService.getTeacherSchedule(teacherId);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getStudent(req, res) {
        try {
            const { studentId } = req.params;
            const data = await scheduleService.getStudentSchedule(studentId);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getRoom(req, res) {
        try {
            const { roomId } = req.params;
            const data = await scheduleService.getRoomSchedule(roomId);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ScheduleController();


