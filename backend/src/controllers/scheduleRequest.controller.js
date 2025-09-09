const scheduleRequestService = require('../services/scheduleRequest.service');

const createScheduleRequest = async (req, res) => {
    try {
        const requestData = req.body;
        const result = await scheduleRequestService.createScheduleRequest(requestData);

        res.status(201).json({
            success: true,
            message: 'Yêu cầu đã được tạo thành công',
            data: result
        });
    } catch (error) {
        console.error('Error creating schedule request:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo yêu cầu',
            error: error.message
        });
    }
};

const getScheduleRequests = async (req, res) => {
    try {
        const { status, requesterId } = req.query;
        const result = await scheduleRequestService.getScheduleRequests({ status, requesterId });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting schedule requests:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu',
            error: error.message
        });
    }
};

const getTeacherSchedules = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const result = await scheduleRequestService.getTeacherSchedules(teacherId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting teacher schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy lịch giảng viên',
            error: error.message
        });
    }
};

const updateScheduleRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, note } = req.body;
        const { id: approverId } = req.user;

        const result = await scheduleRequestService.updateScheduleRequestStatus(
            requestId,
            status,
            approverId,
            note
        );

        res.status(200).json({
            success: true,
            message: 'Trạng thái yêu cầu đã được cập nhật',
            data: result
        });
    } catch (error) {
        console.error('Error updating schedule request status:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật trạng thái yêu cầu',
            error: error.message
        });
    }
};

const getScheduleRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;
        const result = await scheduleRequestService.getScheduleRequestById(requestId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting schedule request by id:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin yêu cầu',
            error: error.message
        });
    }
};

module.exports = {
    createScheduleRequest,
    getScheduleRequests,
    getTeacherSchedules,
    updateScheduleRequestStatus,
    getScheduleRequestById
};
