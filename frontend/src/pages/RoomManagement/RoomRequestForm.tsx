import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Radio,
    RadioGroup,
    TextField,
    Paper
} from '@mui/material';
import {
    Person as PersonIcon,
    Class as ClassIcon,
    Room as RoomIcon,
    Schedule as ScheduleIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { roomService } from '../../services/api';

// Interface cho ScheduleRequest
interface ScheduleRequestForm {
    requestType: 'room_request' | 'schedule_change' | 'exception';
    classScheduleId?: number;
    requesterId: number;
    requestDate: string;
    timeSlotId: number;
    reason: string;
    note?: string;
}

interface ClassSchedule {
    id: number;
    classId: number;
    teacherId: number;
    classRoomId: number | null;
    dayOfWeek: number;
    timeSlotId: number;
    classRoomTypeId: number;
    class: {
        id: number;
        code: string;
        className: string;
        subjectName: string;
        subjectCode: string;
        maxStudents: number;
    };
    classRoom: {
        id: number;
        code: string;
        name: string;
        capacity: number;
        building: string;
        floor: number;
        campus: string | null;
        classRoomTypeId: number;
        ClassRoomType: {
            id: number;
            name: string;
        };
    } | null;
    timeSlot: {
        id: number;
        slotName: string;
        startTime: string;
        endTime: string;
        shift: string;
    };
}

interface TimeSlot {
    id: number;
    slotName: string;
    startTime: string;
    endTime: string;
    shift: string;
}

const RoomRequestForm: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const [formData, setFormData] = useState<ScheduleRequestForm>({
        requestType: 'room_request',
        requesterId: user?.id || 0,
        requestDate: new Date().toISOString().split('T')[0],
        timeSlotId: 0,
        reason: ''
    });

    const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Load time slots
            const timeSlotsResponse = await roomService.getTimeSlots();
            if (timeSlotsResponse.success) {
                setTimeSlots(timeSlotsResponse.data);
            }

            // Load teacher's class schedules
            if (user?.id) {
                const schedulesResponse = await roomService.getTeacherSchedules(user.id);
                if (schedulesResponse.success) {
                    setClassSchedules(schedulesResponse.data);
                }
            }
        } catch (error) {
            toast.error('Lỗi tải dữ liệu');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (dayOfWeek: number) => {
        const days: { [key: number]: string } = {
            1: 'Chủ nhật',
            2: 'Thứ 2',
            3: 'Thứ 3',
            4: 'Thứ 4',
            5: 'Thứ 5',
            6: 'Thứ 6',
            7: 'Thứ 7'
        };
        return days[dayOfWeek] || 'Không xác định';
    };

    const handleScheduleChange = (scheduleId: string) => {
        const schedule = classSchedules.find(s => s.id === parseInt(scheduleId));
        setSelectedSchedule(schedule || null);
        setFormData(prev => ({
            ...prev,
            classScheduleId: schedule?.id || 0,
            timeSlotId: schedule?.timeSlotId || 0
        }));
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];

        if (!formData.requestType) {
            errors.push('Vui lòng chọn loại yêu cầu');
        }
        if (!formData.classScheduleId) {
            errors.push('Vui lòng chọn lớp học');
        }
        if (!formData.timeSlotId) {
            errors.push('Vui lòng chọn tiết học');
        }
        if (!formData.reason.trim()) {
            errors.push('Vui lòng nhập lý do');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setConfirmDialogOpen(true);
    };

    const confirmSubmit = async () => {
        setLoading(true);
        try {
            const response = await roomService.createScheduleRequest(formData);
            if (response.success) {
                toast.success('Yêu cầu đã được gửi thành công!');
                // Reset form
                setFormData({
                    requestType: 'room_request',
                    requesterId: user?.id || 0,
                    requestDate: new Date().toISOString().split('T')[0],
                    timeSlotId: 0,
                    reason: ''
                });
                setSelectedSchedule(null);
            } else {
                toast.error(response.message || 'Có lỗi xảy ra khi gửi yêu cầu');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi yêu cầu');
            console.error('Error submitting request:', error);
        } finally {
            setLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    const renderFormContent = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            );
        }

        return (
            <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
                {/* Header */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Gửi yêu cầu đổi phòng/xin phòng
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Điền thông tin yêu cầu để gửi đến quản trị viên xem xét
                        </Typography>
                    </CardContent>
                </Card>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {/* Loại yêu cầu */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Loại yêu cầu
                        </Typography>
                        <FormControl component="fieldset">
                            <RadioGroup
                                value={formData.requestType}
                                onChange={(e) => setFormData(prev => ({ ...prev, requestType: e.target.value as any }))}
                            >
                                <FormControlLabel
                                    value="room_request"
                                    control={<Radio />}
                                    label="Yêu cầu đổi phòng"
                                />
                                <FormControlLabel
                                    value="schedule_change"
                                    control={<Radio />}
                                    label="Yêu cầu thay đổi lịch học"
                                />
                                <FormControlLabel
                                    value="exception"
                                    control={<Radio />}
                                    label="Yêu cầu ngoại lệ"
                                />
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Chọn lớp học */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <ClassIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Chọn lớp học
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Lớp học</InputLabel>
                            <Select
                                value={formData.classScheduleId?.toString() || ''}
                                onChange={(e) => handleScheduleChange(e.target.value)}
                                label="Lớp học"
                            >
                                {classSchedules.map((schedule) => (
                                    <MenuItem key={schedule.id} value={schedule.id}>
                                        <Box>
                                            <Typography variant="body1">{schedule.class.className}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {schedule.class.subjectName} ({schedule.class.subjectCode}) -
                                                {getDayName(schedule.dayOfWeek)} {schedule.timeSlot.slotName} -
                                                {schedule.classRoom?.name || 'Chưa có phòng'}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Chọn tiết học */}
                {selectedSchedule && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Chọn tiết học
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Tiết học hiện tại: {getDayName(selectedSchedule.dayOfWeek)} {selectedSchedule.timeSlot.slotName}
                                ({selectedSchedule.timeSlot.startTime}-{selectedSchedule.timeSlot.endTime})
                            </Alert>
                            <FormControl fullWidth>
                                <InputLabel>Tiết học</InputLabel>
                                <Select
                                    value={formData.timeSlotId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, timeSlotId: e.target.value as number }))}
                                    label="Tiết học"
                                >
                                    {timeSlots.map((slot) => (
                                        <MenuItem key={slot.id} value={slot.id}>
                                            <Box>
                                                <Typography variant="body1">{slot.slotName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {slot.startTime} - {slot.endTime} ({slot.shift})
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>
                )}

                {/* Thông tin yêu cầu */}
                {selectedSchedule && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Thông tin yêu cầu
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Paper sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Thông tin lớp học:</Typography>
                                            <Typography variant="body1">{selectedSchedule.class.className}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedSchedule.class.subjectName} ({selectedSchedule.class.subjectCode})
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Số sinh viên: {selectedSchedule.class.maxStudents}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Paper sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Thông tin hiện tại:</Typography>
                                            <Typography variant="body1">
                                                {getDayName(selectedSchedule.dayOfWeek)} {selectedSchedule.timeSlot.slotName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedSchedule.classRoom?.name || 'Chưa có phòng'}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Lý do yêu cầu */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Lý do yêu cầu
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Nhập lý do yêu cầu đổi phòng/xin phòng..."
                            variant="outlined"
                        />
                    </CardContent>
                </Card>

                {/* Ghi chú thêm */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Ghi chú thêm (tùy chọn)
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.note || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="Nhập ghi chú thêm nếu có..."
                            variant="outlined"
                        />
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SendIcon />}
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{ minWidth: 200 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Gửi yêu cầu'}
                    </Button>
                </Box>
            </Box>
        );
    };

    return (
        <>
            {renderFormContent()}

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Xác nhận gửi yêu cầu</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn gửi yêu cầu này không? Yêu cầu sẽ được gửi đến quản trị viên để xem xét.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
                    <Button onClick={confirmSubmit} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Xác nhận gửi'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RoomRequestForm;