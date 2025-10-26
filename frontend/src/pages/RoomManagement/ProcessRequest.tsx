import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Paper,
    Divider,
    Stack,
    TextField
} from '@mui/material';
import {
    Person as PersonIcon,
    Class as ClassIcon,
    Room as RoomIcon,
    Schedule as ScheduleIcon,
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { roomService } from '../../services/api';

interface ProcessRequestData {
    id: number;
    requestTypeId: number;
    classScheduleId?: number;
    requesterId: number;
    requestDate: string;
    timeSlotId: number;
    changeType?: string;
    reason: string;
    requestStatusId: number;
    createdAt: string;
    movedToTimeSlotId?: number;
    movedToDate?: string;
    movedToDayOfWeek?: number;
    requester?: {
        id: number;
        fullName: string;
        email: string;
    };
    RequestType?: {
        id: number;
        name: string;
    };
    RequestStatus?: {
        id: number;
        name: string;
    };
    classSchedule?: {
        id: number;
        class?: {
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
            ClassRoomType?: {
                name: string;
            };
        };
        dayOfWeek: number;
        timeSlotId: number;
    };
}

interface SuggestedRoom {
    id: number;
    code: string;
    name: string;
    capacity: number;
    building: string;
    floor: number;
    ClassRoomType?: {
        name: string;
    };
    isAvailable: boolean;
    isFreedByException?: boolean;
    exceptionInfo?: {
        className: string;
        exceptionType: string;
        exceptionReason: string;
        exceptionTypeName: string;
    };
}

const ProcessRequest: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [requestData, setRequestData] = useState<ProcessRequestData | null>(null);
    const [suggestedRooms, setSuggestedRooms] = useState<SuggestedRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (requestId) {
            loadRequestData();
        }
    }, [requestId]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadRequestData = async () => {
        try {
            setLoading(true);
            // Load request details
            const response = await roomService.getScheduleRequestById(parseInt(requestId!));
            console.log('API Response:', response);
            if (response.success) {
                console.log('Request Data:', response.data);
                console.log('Request Type:', response.data.RequestType?.name);
                console.log('movedToTimeSlotId:', response.data.movedToTimeSlotId);
                console.log('movedToDate:', response.data.movedToDate);
                console.log('movedToDayOfWeek:', response.data.movedToDayOfWeek);
                setRequestData(response.data);
                await loadSuggestedRooms(response.data);
            } else {
                toast.error('Không thể tải thông tin yêu cầu');
                navigate('/rooms/requests');
            }
        } catch (error) {
            console.error('Error loading request data:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
            navigate('/rooms/requests');
        } finally {
            setLoading(false);
        }
    };

    const loadSuggestedRooms = async (request: ProcessRequestData) => {
        try {
            const classMaxStudents = request.classSchedule?.class?.maxStudents || 0;
            const classRoomTypeId = request.classSchedule?.classRoom?.ClassRoomType?.name === 'Thực hành' ? '2' : '1';

            console.log('Class requirements:', { classMaxStudents, classRoomTypeId });

            // ⭐ Nếu là yêu cầu "Đổi lịch" và có ngày cụ thể → Sử dụng API mới
            if (request.RequestType?.name === 'Đổi lịch' && 
                request.movedToTimeSlotId && 
                request.movedToDayOfWeek && 
                request.movedToDate) {
                
                console.log('🎯 Using getAvailableRoomsForException API');
                console.log('Request params:', {
                    timeSlotId: request.movedToTimeSlotId,
                    dayOfWeek: request.movedToDayOfWeek,
                    date: request.movedToDate,
                    capacity: classMaxStudents,
                    classRoomTypeId
                });

                const availableRoomsResponse = await roomService.getAvailableRoomsForException(
                    Number(request.movedToTimeSlotId),
                    Number(request.movedToDayOfWeek),
                    request.movedToDate.split('T')[0], // Format: YYYY-MM-DD
                    classMaxStudents,
                    classRoomTypeId
                );

                if (availableRoomsResponse.success) {
                    const { normalRooms, freedRooms } = availableRoomsResponse.data;
                    
                    console.log('✅ Available rooms:', {
                        normal: normalRooms.length,
                        freed: freedRooms.length
                    });

                    // Merge normal và freed rooms với flag để phân biệt
                    const allAvailable = [
                        ...freedRooms.map((room: any) => ({ 
                            ...room, 
                            isFreedByException: true,
                            sortPriority: 1 // Freed rooms có priority cao hơn
                        })),
                        ...normalRooms.map((room: any) => ({ 
                            ...room, 
                            isFreedByException: false,
                            sortPriority: 2
                        }))
                    ];

                    // Sort: Freed rooms trước, sau đó sort theo capacity gần với yêu cầu nhất
                    allAvailable.sort((a: any, b: any) => {
                        if (a.sortPriority !== b.sortPriority) {
                            return a.sortPriority - b.sortPriority;
                        }
                        const aDiff = Math.abs(a.capacity - classMaxStudents);
                        const bDiff = Math.abs(b.capacity - classMaxStudents);
                        return aDiff - bDiff;
                    });

                    console.log('Suggested rooms:', allAvailable.slice(0, 15));
                    setSuggestedRooms(allAvailable.slice(0, 15)); // Top 15 suggestions

                    if (freedRooms.length > 0) {
                        toast.info(
                            `🎉 Có ${freedRooms.length} phòng trống do lớp khác nghỉ/thi trong ngày này`,
                            { autoClose: 5000 }
                        );
                    }

                    return;
                }
            }

            // ⭐ Logic cũ: Cho các trường hợp khác (hoặc khi API mới fail)
            console.log('Using legacy room suggestion logic');
            
            const roomsResponse = await roomService.getAllRooms();
            console.log('Rooms response:', roomsResponse);
            
            if (roomsResponse.success) {
                const allRooms = roomsResponse.data;
                console.log('All rooms:', allRooms);

                let suggested = allRooms.filter((room: any) => {
                    const capacityMatch = room.capacity >= classMaxStudents;
                    const roomType = room.type || room.ClassRoomType?.name;
                    const typeMatch = roomType === 'Thực hành' ||
                        (classRoomTypeId === '1' && roomType === 'Lý thuyết');
                    const available = room.isAvailable !== false;

                    return capacityMatch && typeMatch && available;
                });

                console.log(`After initial filtering: ${suggested.length} rooms found`);

                // Kiểm tra conflict cho case "Đổi lịch" không có ngày cụ thể
                if (request.RequestType?.name === 'Đổi lịch' && request.movedToTimeSlotId && request.movedToDayOfWeek) {
                    console.log('Checking schedule conflicts for time change request (legacy)');

                    const schedulesResponse = await roomService.getSchedulesByTimeSlotAndDate(
                        Number(request.movedToTimeSlotId),
                        Number(request.movedToDayOfWeek)
                    );

                    if (schedulesResponse.success) {
                        const existingSchedules = schedulesResponse.data;
                        suggested = suggested.filter((room: any) => {
                            const hasConflict = existingSchedules.some((schedule: any) =>
                                schedule.classRoomId && schedule.classRoomId === parseInt(room.id)
                            );
                            return !hasConflict;
                        });
                    }
                }

                console.log(`After schedule conflict filtering: ${suggested.length} rooms found`);

                // Sort by capacity
                suggested.sort((a: any, b: any) => {
                    const aDiff = Math.abs(a.capacity - classMaxStudents);
                    const bDiff = Math.abs(b.capacity - classMaxStudents);
                    return aDiff - bDiff;
                });

                console.log('Suggested rooms:', suggested.slice(0, 10));
                setSuggestedRooms(suggested.slice(0, 10));
            }
        } catch (error) {
            console.error('Error loading suggested rooms:', error);
            toast.error('Không thể tải danh sách phòng đề xuất');
        }
    };

    const handleProcessRequest = async () => {
        if (!selectedRoomId) {
            toast.error('Vui lòng chọn phòng học');
            return;
        }

        try {
            setProcessing(true);

            // Update request status to approved with selected room
            const updateResponse = await roomService.updateScheduleRequestStatus(
                parseInt(requestId!),
                2, // Approved status
                adminNote || 'Yêu cầu đã được chấp nhận và phân phòng',
                selectedRoomId ? selectedRoomId.toString() : undefined
            );

            if (updateResponse.success) {
                toast.success('Đã xử lý yêu cầu thành công');
                navigate('/rooms/requests');
            } else {
                toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
            }
        } catch (error) {
            console.error('Error processing request:', error);
            toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
        } finally {
            setProcessing(false);
        }
    };

    const getDayName = (dayOfWeek: number): string => {
        // Mapping theo logic của WeeklySchedule.tsx: 1=CN, 2=T2, 3=T3, 4=T4, 5=T5, 6=T6, 7=T7
        const days = ['', 'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[dayOfWeek] || '';
    };

    const getRequestTypeText = (requestTypeId: number): string => {
        switch (requestTypeId) {
            case 7: return 'Đổi phòng';
            case 8: return 'Đổi lịch';
            case 9: return 'Đổi giáo viên';
            default: return 'Không xác định';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!requestData) {
        return (
            <Alert severity="error">
                Không tìm thấy thông tin yêu cầu
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/rooms/requests')}
                    sx={{ mr: 2 }}
                >
                    Quay lại
                </Button>
                <Typography variant="h4" component="h1">
                    Xử lý yêu cầu #{requestData.id}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Thông tin yêu cầu */}
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Thông tin yêu cầu
                            </Typography>

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Loại yêu cầu:
                                    </Typography>
                                    <Chip
                                        label={requestData.RequestType?.name || getRequestTypeText(requestData.requestTypeId)}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Người yêu cầu:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                                        <Typography variant="body2">
                                            {requestData.requester?.fullName}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {requestData.requester?.email}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Lý do yêu cầu:
                                    </Typography>
                                    <Paper sx={{ p: 2, mt: 0.5, bgcolor: 'grey.50' }}>
                                        <Typography variant="body2">
                                            {requestData.reason}
                                        </Typography>
                                    </Paper>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Ngày gửi:
                                    </Typography>
                                    <Typography variant="body2">
                                        {new Date(requestData.createdAt).toLocaleDateString('vi-VN')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* Thông tin lớp học */}
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Thông tin lớp học
                            </Typography>

                            {requestData.classSchedule?.class ? (
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Tên lớp:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <ClassIcon sx={{ mr: 1, fontSize: 16 }} />
                                            <Typography variant="body2">
                                                {requestData.classSchedule.class.className}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {requestData.classSchedule.class.subjectName} ({requestData.classSchedule.class.subjectCode})
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Sĩ số:
                                        </Typography>
                                        <Typography variant="body2">
                                            {requestData.classSchedule.class.maxStudents} sinh viên
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Lịch học hiện tại:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                                            <Typography variant="body2">
                                                {getDayName(requestData.classSchedule.dayOfWeek)} - Tiết {requestData.classSchedule.timeSlotId}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Hiển thị lịch yêu cầu cho đổi lịch */}
                                    {requestData.RequestType?.name === 'Đổi lịch' && requestData.movedToTimeSlotId && requestData.movedToDayOfWeek && (
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Lịch học yêu cầu:
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <ScheduleIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                                                <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                    {getDayName(requestData.movedToDayOfWeek)} - Tiết {requestData.movedToTimeSlotId}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Thứ trong tuần: {getDayName(requestData.movedToDayOfWeek)}
                                            </Typography>
                                        </Box>
                                    )}

                                    {requestData.classSchedule.classRoom && (
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Phòng hiện tại:
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <RoomIcon sx={{ mr: 1, fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    {requestData.classSchedule.classRoom.name} ({requestData.classSchedule.classRoom.code})
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Sức chứa: {requestData.classSchedule.classRoom.capacity} chỗ
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            ) : (
                                <Alert severity="info">
                                    Yêu cầu phòng độc lập (không liên quan đến lớp học cụ thể)
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Chọn phòng học */}
            <Box sx={{ mt: 3 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Chọn phòng học phù hợp
                        </Typography>

                        {requestData.RequestType?.name === 'Đổi lịch' && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Lưu ý:</strong> Các phòng được đề xuất đã được kiểm tra không trùng lịch với lịch học yêu cầu.
                                    Lịch yêu cầu: {getDayName(requestData.movedToDayOfWeek || 7)} - Tiết {requestData.movedToTimeSlotId}
                                </Typography>
                            </Alert>
                        )}

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Phòng học đề xuất</InputLabel>
                            <Select
                                value={selectedRoomId}
                                onChange={(e) => setSelectedRoomId(e.target.value as number)}
                                label="Phòng học đề xuất"
                            >
                                {suggestedRooms.map((room) => (
                                    <MenuItem key={room.id} value={room.id}>
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1">
                                                    {room.name} ({room.code})
                                                </Typography>
                                                {room.isFreedByException && (
                                                    <Chip
                                                        label="🎉 Trống do ngoại lệ"
                                                        size="small"
                                                        color="success"
                                                        sx={{ 
                                                            fontSize: '0.7rem', 
                                                            height: '20px',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {room.building} - Tầng {room.floor} | Sức chứa: {room.capacity} |
                                                Loại: {room.ClassRoomType?.name}
                                            </Typography>
                                            {room.isFreedByException && room.exceptionInfo && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        display: 'block',
                                                        color: 'success.main',
                                                        fontStyle: 'italic',
                                                        mt: 0.5
                                                    }}
                                                >
                                                    Lớp {room.exceptionInfo.className} {room.exceptionInfo.exceptionType === 'cancelled' ? 'nghỉ' : 'thi'}
                                                </Typography>
                                            )}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {suggestedRooms.length === 0 && (
                            <Alert severity="warning">
                                Không tìm thấy phòng học phù hợp. Vui lòng kiểm tra lại yêu cầu.
                            </Alert>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            label="Ghi chú của admin"
                            placeholder="Nhập ghi chú về việc xử lý yêu cầu..."
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/rooms/requests')}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleProcessRequest}
                                disabled={!selectedRoomId || processing}
                            >
                                {processing ? 'Đang xử lý...' : 'Xử lý yêu cầu'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default ProcessRequest;
