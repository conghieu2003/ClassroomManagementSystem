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
    Chip,
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
    CheckCircle as CheckCircleIcon,
    Add as AddIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { roomService } from '../../services/api';

// Interface cho ScheduleRequest dựa trên database schema
interface ScheduleRequestForm {
    requestType: 'room_request' | 'schedule_change' | 'exception';
    classScheduleId?: number;
    classRoomId?: number;
    requesterId: number;
    requestDate: string;
    timeSlotId: number;
    changeType?: 'room_change' | 'time_change' | 'both' | 'exception';
    oldClassRoomId?: number;
    newClassRoomId?: number;
    oldTimeSlotId?: number;
    newTimeSlotId?: number;
    exceptionDate?: string;
    exceptionType?: 'cancelled' | 'exam' | 'moved' | 'substitute';
    movedToDate?: string;
    movedToTimeSlotId?: number;
    movedToClassRoomId?: number;
    substituteTeacherId?: number;
    reason: string;
}

interface ClassSchedule {
    id: number;
    classId: number;
    teacherId: number;
    classRoomId?: number;
    dayOfWeek: number;
    timeSlotId: number;
    weekPattern: string;
    startWeek: number;
    endWeek: number;
    status: string;
    class: {
        id: number;
        code: string;
        className: string;
        subjectName: string;
        subjectCode: string;
        maxStudents: number;
    };
    classRoom?: {
        id: number;
        code: string;
        name: string;
        capacity: number;
        type: string;
    };
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

interface ClassRoom {
    id: number;
    code: string;
    name: string;
    capacity: number;
    building: string;
    floor: number;
    type: string;
    isAvailable: boolean;
}

const RoomRequestForm: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [rooms, setRooms] = useState<ClassRoom[]>([]);
    const [availableRooms, setAvailableRooms] = useState<ClassRoom[]>([]);
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

            // Load rooms
            const roomsResponse = await roomService.getAllRooms();
            if (roomsResponse.success) {
                setRooms(roomsResponse.data);
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
        if (formData.requestType === 'room_request' && !formData.newClassRoomId) {
            errors.push('Vui lòng chọn phòng mới');
        }
        if (!formData.reason.trim()) {
            errors.push('Vui lòng nhập lý do');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleScheduleChange = (scheduleId: string) => {
        const schedule = classSchedules.find(s => s.id === parseInt(scheduleId));
        setSelectedSchedule(schedule || null);
        setFormData(prev => ({
            ...prev,
            classScheduleId: schedule?.id || 0,
            oldClassRoomId: schedule?.classRoomId,
            oldTimeSlotId: schedule?.timeSlotId
        }));

        // Filter available rooms based on capacity and room type
        if (schedule && schedule.class) {
            const currentRoomType = schedule.classRoom?.type || 'lecture';
            const available = rooms.filter(room =>
                room.capacity >= schedule.class.maxStudents &&
                room.type === currentRoomType &&
                room.isAvailable &&
                room.id !== schedule.classRoomId
            );
            setAvailableRooms(available);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const requestData = {
                ...formData,
                requesterId: user?.id || 0
            };

            const response = await roomService.createScheduleRequest(requestData);

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
                setAvailableRooms([]);
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

    const getDayName = (dayOfWeek: number): string => {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[dayOfWeek] || '';
    };

    const renderFormContent = () => {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Chọn loại yêu cầu */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Loại yêu cầu
                        </Typography>
                        <FormControl component="fieldset">
                            <RadioGroup
                                value={formData.requestType}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        requestType: e.target.value as 'room_request' | 'schedule_change' | 'exception',
                                        classScheduleId: undefined,
                                        newClassRoomId: undefined,
                                        newTimeSlotId: undefined
                                    }));
                                    setSelectedSchedule(null);
                                    setAvailableRooms([]);
                                }}
                                row
                            >
                                <FormControlLabel value="room_request" control={<Radio />} label="Xin phòng mới" />
                                <FormControlLabel value="schedule_change" control={<Radio />} label="Đổi phòng" />
                                <FormControlLabel value="exception" control={<Radio />} label="Ngoại lệ" />
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Chọn lớp học */}
                <Card>
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
                    <Card>
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

                {/* Chọn phòng mới (cho room_request và schedule_change) */}
                {(formData.requestType === 'room_request' || formData.requestType === 'schedule_change') && selectedSchedule && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <RoomIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Chọn phòng mới
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Phòng được đề xuất phải có sức chứa tối thiểu {selectedSchedule.class.maxStudents} sinh viên
                                {selectedSchedule.classRoom && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Loại phòng hiện tại: <strong>
                                            {selectedSchedule.classRoom.type === 'lecture' ? 'Lý thuyết' :
                                                selectedSchedule.classRoom.type === 'lab' ? 'Thực hành' :
                                                    selectedSchedule.classRoom.type === 'seminar' ? 'Seminar' : 'Trực tuyến'}
                                        </strong>
                                    </Typography>
                                )}
                            </Alert>
                            <FormControl fullWidth>
                                <InputLabel>Phòng mới</InputLabel>
                                <Select
                                    value={formData.newClassRoomId || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, newClassRoomId: e.target.value as number }))}
                                    label="Phòng mới"
                                >
                                    {availableRooms.map((room) => (
                                        <MenuItem key={room.id} value={room.id}>
                                            <Box>
                                                <Typography variant="body1">{room.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {room.code} - Sức chứa: {room.capacity} sinh viên -
                                                    Loại: {room.type === 'lecture' ? 'Lý thuyết' :
                                                        room.type === 'lab' ? 'Thực hành' :
                                                            room.type === 'seminar' ? 'Seminar' : 'Trực tuyến'}
                                                    {room.capacity >= selectedSchedule.class.maxStudents ? (
                                                        <Chip label="Phù hợp" color="success" size="small" sx={{ ml: 1 }} />
                                                    ) : (
                                                        <Chip label="Không phù hợp" color="error" size="small" sx={{ ml: 1 }} />
                                                    )}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>
                )}

                {/* Lý do yêu cầu */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Lý do yêu cầu
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Nhập lý do yêu cầu đổi phòng/xin phòng mới..."
                            variant="outlined"
                        />
                    </CardContent>
                </Card>

                {/* Thông tin tóm tắt */}
                {selectedSchedule && formData.timeSlotId && formData.reason && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
                                {(formData.requestType === 'room_request' || formData.requestType === 'schedule_change') && formData.newClassRoomId && (
                                    <Box>
                                        <Paper sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">Phòng yêu cầu:</Typography>
                                            <Typography variant="body1">
                                                {rooms.find(r => r.id === formData.newClassRoomId)?.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {rooms.find(r => r.id === formData.newClassRoomId)?.code} -
                                                Sức chứa: {rooms.find(r => r.id === formData.newClassRoomId)?.capacity} sinh viên
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        );
    };

    if (loading && !classSchedules.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Tạo yêu cầu phòng
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Tạo yêu cầu đổi phòng, xin phòng mới hoặc xử lý ngoại lệ cho lớp học của bạn.
            </Typography>

            {validationErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Box component="ul" sx={{ margin: 0, paddingLeft: 2.5 }}>
                        {validationErrors.map((error, index) => (
                            <Box component="li" key={index}>{error}</Box>
                        ))}
                    </Box>
                </Alert>
            )}

            {renderFormContent()}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<SendIcon />}
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={loading || !selectedSchedule || !formData.timeSlotId || !formData.reason.trim()}
                    sx={{ minWidth: 200 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Gửi yêu cầu'}
                </Button>
            </Box>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Xác nhận gửi yêu cầu</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn gửi yêu cầu này không?
                    </Typography>
                    {selectedSchedule && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Lớp học:</strong> {selectedSchedule.class.className}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Loại yêu cầu:</strong> {
                                    formData.requestType === 'room_request' ? 'Xin phòng mới' :
                                        formData.requestType === 'schedule_change' ? 'Đổi phòng' : 'Ngoại lệ'
                                }
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RoomRequestForm;
