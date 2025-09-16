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
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Class as ClassIcon,
  Room as RoomIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { roomService } from '../../services/api';

// Data mẫu cho testing
const sampleTeachers: Teacher[] = [
  {
    id: '1',
    teacherCode: '10000000',
    fullName: 'Nguyễn Văn Giáo',
    email: 'teacher@example.com',
    classes: [
      {
        id: '1',
        code: 'COMP101',
        className: 'Lập trình cơ bản',
        subjectName: 'Nhập môn lập trình',
        subjectCode: 'NMLT',
        maxStudents: 90,
        schedules: [
          {
            id: '1',
            dayOfWeek: 3,
            dayName: 'Thứ 3',
            timeSlot: 'Tiết 1-3',
            startTime: '07:00',
            endTime: '09:30',
            room: {
              id: '1',
              code: 'LT101',
              name: 'Phòng lý thuyết 101',
              capacity: 100,
              type: 'lecture'
            }
          },
          {
            id: '2',
            dayOfWeek: 5,
            dayName: 'Thứ 5',
            timeSlot: 'Tiết 7-9',
            startTime: '13:00',
            endTime: '15:30',
            room: {
              id: '3',
              code: 'TH101',
              name: 'Phòng thực hành 101',
              capacity: 30,
              type: 'lab'
            }
          }
        ]
      },
      {
        id: '5',
        code: 'COMP103',
        className: 'Lập trình Web',
        subjectName: 'Lập trình Web',
        subjectCode: 'LTW',
        maxStudents: 70,
        schedules: [
          {
            id: '3',
            dayOfWeek: 6,
            dayName: 'Thứ 6',
            timeSlot: 'Tiết 4-6',
            startTime: '09:45',
            endTime: '12:15',
            room: {
              id: '1',
              code: 'LT101',
              name: 'Phòng lý thuyết 101',
              capacity: 100,
              type: 'lecture'
            }
          }
        ]
      }
    ]
  },
  {
    id: '2',
    teacherCode: '10000001',
    fullName: 'Trần Thị Dạy',
    email: 'teacher2@example.com',
    classes: [
      {
        id: '3',
        code: 'COMP102',
        className: 'Cơ sở dữ liệu',
        subjectName: 'Cơ sở dữ liệu',
        subjectCode: 'CSDL',
        maxStudents: 80,
        schedules: [
          {
            id: '4',
            dayOfWeek: 2,
            dayName: 'Thứ 2',
            timeSlot: 'Tiết 4-6',
            startTime: '09:45',
            endTime: '12:15',
            room: {
              id: '2',
              code: 'LT201',
              name: 'Phòng lý thuyết 201',
              capacity: 150,
              type: 'lecture'
            }
          },
          {
            id: '5',
            dayOfWeek: 4,
            dayName: 'Thứ 4',
            timeSlot: 'Tiết 7-9',
            startTime: '13:00',
            endTime: '15:30',
            room: {
              id: '4',
              code: 'TH102',
              name: 'Phòng thực hành 102',
              capacity: 30,
              type: 'lab'
            }
          }
        ]
      }
    ]
  },
  {
    id: '3',
    teacherCode: '10000002',
    fullName: 'Lê Thị Minh',
    email: 'teacher3@example.com',
    classes: [
      {
        id: '6',
        code: 'COMP201',
        className: 'Cấu trúc dữ liệu và giải thuật',
        subjectName: 'Cấu trúc dữ liệu',
        subjectCode: 'CTDL',
        maxStudents: 60,
        schedules: [
          {
            id: '6',
            dayOfWeek: 2,
            dayName: 'Thứ 2',
            timeSlot: 'Tiết 1-3',
            startTime: '07:00',
            endTime: '09:30',
            room: {
              id: '7',
              code: 'LT301',
              name: 'Phòng lý thuyết 301',
              capacity: 120,
              type: 'lecture'
            }
          },
          {
            id: '7',
            dayOfWeek: 4,
            dayName: 'Thứ 4',
            timeSlot: 'Tiết 7-9',
            startTime: '13:00',
            endTime: '15:30',
            room: {
              id: '8',
              code: 'TH301',
              name: 'Phòng thực hành 301',
              capacity: 40,
              type: 'lab'
            }
          }
        ]
      },
      {
        id: '8',
        code: 'COMP202',
        className: 'Lập trình hướng đối tượng',
        subjectName: 'Lập trình OOP',
        subjectCode: 'OOP',
        maxStudents: 50,
        schedules: [
          {
            id: '8',
            dayOfWeek: 6,
            dayName: 'Thứ 6',
            timeSlot: 'Tiết 1-3',
            startTime: '07:00',
            endTime: '09:30',
            room: {
              id: '10',
              code: 'LT401',
              name: 'Phòng lý thuyết 401',
              capacity: 80,
              type: 'lecture'
            }
          }
        ]
      }
    ]
  }
];

const sampleTimeSlots: TimeSlot[] = [
  {
    id: '1',
    slotName: 'Tiết 1-3',
    startTime: '07:00',
    endTime: '09:30',
    shift: 'morning'
  },
  {
    id: '2',
    slotName: 'Tiết 4-6',
    startTime: '09:45',
    endTime: '12:15',
    shift: 'morning'
  },
  {
    id: '3',
    slotName: 'Tiết 7-9',
    startTime: '13:00',
    endTime: '15:30',
    shift: 'afternoon'
  },
  {
    id: '4',
    slotName: 'Tiết 10-12',
    startTime: '15:45',
    endTime: '18:15',
    shift: 'afternoon'
  },
  {
    id: '5',
    slotName: 'Tiết 13-15',
    startTime: '18:30',
    endTime: '21:00',
    shift: 'evening'
  }
];

const sampleRooms: Room[] = [
  {
    id: '1',
    code: 'LT101',
    name: 'Phòng lý thuyết 101',
    capacity: 100,
    type: 'lecture'
  },
  {
    id: '2',
    code: 'LT201',
    name: 'Phòng lý thuyết 201',
    capacity: 150,
    type: 'lecture'
  },
  {
    id: '3',
    code: 'TH101',
    name: 'Phòng thực hành 101',
    capacity: 30,
    type: 'lab'
  },
  {
    id: '4',
    code: 'TH102',
    name: 'Phòng thực hành 102',
    capacity: 30,
    type: 'lab'
  },
  {
    id: '5',
    code: 'TH201',
    name: 'Phòng thực hành 201',
    capacity: 30,
    type: 'lab'
  },
  {
    id: '6',
    code: 'ONLINE',
    name: 'Lớp trực tuyến',
    capacity: 1000,
    type: 'online'
  },
  {
    id: '7',
    code: 'LT301',
    name: 'Phòng lý thuyết 301',
    capacity: 120,
    type: 'lecture'
  },
  {
    id: '8',
    code: 'TH301',
    name: 'Phòng thực hành 301',
    capacity: 40,
    type: 'lab'
  },
  {
    id: '9',
    code: 'TH302',
    name: 'Phòng thực hành 302',
    capacity: 40,
    type: 'lab'
  },
  {
    id: '10',
    code: 'LT401',
    name: 'Phòng lý thuyết 401',
    capacity: 80,
    type: 'lecture'
  },
  {
    id: '11',
    code: 'SEM101',
    name: 'Phòng seminar 101',
    capacity: 50,
    type: 'seminar'
  },
  {
    id: '12',
    code: 'SEM201',
    name: 'Phòng seminar 201',
    capacity: 60,
    type: 'seminar'
  }
];

interface Teacher {
  id: string;
  teacherCode: string;
  fullName: string;
  email: string;
  classes: Class[];
}

interface Class {
  id: string;
  code: string;
  className: string;
  subjectName: string;
  subjectCode: string;
  maxStudents: number;
  schedules: Schedule[];
}

interface Schedule {
  id: string;
  dayOfWeek: number;
  dayName: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  room: Room;
}

interface Room {
  id: string;
  code: string;
  name: string;
  capacity: number;
  type: string; // 'lecture', 'lab', 'seminar', 'online'
  ClassRoomType?: {
    id: number;
    name: string;
  };
  statusText?: string;
}

interface TimeSlot {
  id: string;
  slotName: string;
  startTime: string;
  endTime: string;
  shift: string;
}

interface RoomRequestData {
  teacherId: string;
  classId: string;
  currentRoomId: string;
  requestedRoomId: string;
  timeSlotId: string;
  reason: string;
  requestType: 'change' | 'request';
}

interface ScheduleRequest {
  id: number;
  requestType: string;
  classScheduleId: number;
  requesterId: number;
  requestDate: string;
  timeSlotId: number;
  reason: string;
  status: string;
  createdAt: string;
  classSchedule?: {
    class: {
      className: string;
      subjectName: string;
      maxStudents: number;
    };
    classRoom?: {
      name: string;
      id: number;
    };
    classRoomTypeId: number;
  };
  requester?: {
    fullName: string;
  };
}

// Không cần steps nữa vì sẽ hiển thị tất cả cùng lúc

const RoomRequest: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // State cho admin quản lý yêu cầu
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ScheduleRequest | null>(null);
  const [roomSelectionDialogOpen, setRoomSelectionDialogOpen] = useState(false);


  const [formData, setFormData] = useState<RoomRequestData>({
    teacherId: '',
    classId: '',
    currentRoomId: '',
    requestedRoomId: '',
    timeSlotId: '',
    reason: '',
    requestType: 'change'
  });

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);


  useEffect(() => {
    loadInitialData();
    loadScheduleRequests();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Sử dụng data mẫu thay vì gọi API
      setTeachers(sampleTeachers);
      setTimeSlots(sampleTimeSlots);
      setRooms(sampleRooms);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load schedule requests cho admin
  const loadScheduleRequests = async () => {
    try {
      const response = await roomService.getScheduleRequests();
      if (response.success) {
        setScheduleRequests(response.data);
      }
    } catch (error) {
      console.error('Error loading schedule requests:', error);
    }
  };

  // Load available rooms cho admin chọn phòng mới
  const loadAvailableRooms = async (filters = {}) => {
    try {
      const response = await roomService.getAvailableRoomsForRequest(filters);
      if (response.success) {
        setAvailableRooms(response.data);
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
    }
  };

  // Admin chọn phòng mới cho yêu cầu
  const handleSelectNewRoom = (request: ScheduleRequest) => {
    setSelectedRequest(request);
    const filters = {
      classRoomTypeId: request.classSchedule?.classRoomTypeId,
      minCapacity: request.classSchedule?.class?.maxStudents,
      excludeRoomId: request.classSchedule?.classRoom?.id
    };
    loadAvailableRooms(filters);
    setRoomSelectionDialogOpen(true);
  };

  // Admin cập nhật phòng mới
  const handleUpdateRoom = async (newRoomId: number) => {
    if (!selectedRequest) return;

    try {
      const response = await roomService.updateScheduleRequestRoom(selectedRequest.id, newRoomId);
      if (response.success) {
        toast.success('Phòng mới đã được cập nhật');
        loadScheduleRequests();
        setRoomSelectionDialogOpen(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật phòng');
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.teacherId) {
      errors.push('Vui lòng chọn giảng viên');
    }
    if (!formData.classId) {
      errors.push('Vui lòng chọn lớp học');
    }
    if (!formData.currentRoomId) {
      errors.push('Vui lòng chọn phòng hiện tại');
    }
    if (!formData.requestedRoomId) {
      errors.push('Vui lòng chọn phòng mới');
    }
    if (!formData.timeSlotId) {
      errors.push('Vui lòng chọn tiết học');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleTeacherChange = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setSelectedTeacher(teacher || null);
    setFormData(prev => ({ ...prev, teacherId, classId: '', currentRoomId: '', requestedRoomId: '', timeSlotId: '' }));
    setSelectedClass(null);
    setSelectedSchedule(null);
  };

  const handleClassChange = (classId: string) => {
    const classData = selectedTeacher?.classes.find(c => c.id === classId);
    setSelectedClass(classData || null);
    setFormData(prev => ({ ...prev, classId, currentRoomId: '', requestedRoomId: '', timeSlotId: '' }));
    setSelectedSchedule(null);
  };

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = selectedClass?.schedules.find(s => s.id === scheduleId);
    setSelectedSchedule(schedule || null);
    setFormData(prev => ({ ...prev, currentRoomId: schedule?.room.id || '', timeSlotId: schedule?.timeSlot || '' }));

    // Filter available rooms based on capacity and room type
    if (schedule && selectedClass) {
      const currentRoomType = schedule.room.type;
      const available = rooms.filter(room =>
        room.capacity >= selectedClass.maxStudents &&
        room.type === currentRoomType
      );
      setAvailableRooms(available);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call với data mẫu
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

      // Tạo yêu cầu mẫu
      const requestData = {
        id: Date.now().toString(),
        roomId: formData.requestedRoomId,
        requestType: formData.requestType,
        requestedDate: new Date().toISOString().split('T')[0],
        requestedTime: `${selectedSchedule?.startTime}-${selectedSchedule?.endTime}`,
        teacher: selectedTeacher?.fullName,
        class: selectedClass?.className,
        currentRoom: selectedSchedule?.room.name,
        requestedRoom: rooms.find(r => r.id === formData.requestedRoomId)?.name,
        timeSlot: timeSlots.find(t => t.id === formData.timeSlotId)?.slotName
      };

      console.log('Yêu cầu đổi phòng:', requestData);
      toast.success('Yêu cầu đổi phòng đã được gửi thành công!');

      // Reset form
      setFormData({
        teacherId: '',
        classId: '',
        currentRoomId: '',
        requestedRoomId: '',
        timeSlotId: '',
        reason: '',
        requestType: 'change'
      });
      setSelectedTeacher(null);
      setSelectedClass(null);
      setSelectedSchedule(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu');
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
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
                    requestType: e.target.value as 'change' | 'request',
                    teacherId: '',
                    classId: '',
                    currentRoomId: '',
                    requestedRoomId: '',
                    timeSlotId: '',
                    reason: ''
                  }));
                  setSelectedTeacher(null);
                  setSelectedClass(null);
                  setSelectedSchedule(null);
                }}
                row
              >
                <FormControlLabel value="change" control={<Radio />} label="Đổi phòng" />
                <FormControlLabel value="request" control={<Radio />} label="Xin phòng mới" />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Bước 1: Chọn giảng viên */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Chọn giảng viên
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Giảng viên</InputLabel>
              <Select
                value={formData.teacherId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                label="Giảng viên"
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    <Box>
                      <Typography variant="body1">{teacher.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {teacher.teacherCode} - {teacher.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Bước 2: Chọn lớp học */}
        {selectedTeacher && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ClassIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Chọn lớp học
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select
                  value={formData.classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  label="Lớp học"
                >
                  {selectedTeacher.classes.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.id}>
                      <Box>
                        <Typography variant="body1">{classItem.className}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {classItem.subjectName} ({classItem.subjectCode}) - {classItem.maxStudents} sinh viên
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        )}

        {/* Bước 3: Chọn phòng hiện tại */}
        {selectedClass && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <RoomIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Chọn phòng hiện tại
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Phòng hiện tại</InputLabel>
                <Select
                  value={formData.currentRoomId}
                  onChange={(e) => {
                    const schedule = selectedClass.schedules.find(s => s.room.id === e.target.value);
                    handleScheduleChange(schedule?.id || '');
                  }}
                  label="Phòng hiện tại"
                >
                  {selectedClass.schedules.map((schedule) => (
                    <MenuItem key={schedule.room.id} value={schedule.room.id}>
                      <Box>
                        <Typography variant="body1">{schedule.room.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {schedule.room.code} - {schedule.dayName} {schedule.timeSlot} ({schedule.startTime}-{schedule.endTime})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        )}

        {/* Bước 4: Chọn phòng mới */}
        {selectedClass && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <RoomIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Chọn phòng mới
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Phòng được đề xuất phải có sức chứa tối thiểu {selectedClass.maxStudents} sinh viên và cùng loại với phòng hiện tại
                {selectedSchedule && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Loại phòng hiện tại: <strong>{selectedSchedule.room.type === 'lecture' ? 'Lý thuyết' : selectedSchedule.room.type === 'lab' ? 'Thực hành' : selectedSchedule.room.type === 'seminar' ? 'Seminar' : 'Trực tuyến'}</strong>
                  </Typography>
                )}
              </Alert>
              <FormControl fullWidth>
                <InputLabel>Phòng mới</InputLabel>
                <Select
                  value={formData.requestedRoomId}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedRoomId: e.target.value }))}
                  label="Phòng mới"
                >
                  {availableRooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      <Box>
                        <Typography variant="body1">{room.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {room.code} - Sức chứa: {room.capacity} sinh viên - Loại: {room.type === 'lecture' ? 'Lý thuyết' : room.type === 'lab' ? 'Thực hành' : room.type === 'seminar' ? 'Seminar' : 'Trực tuyến'}
                          {room.capacity >= selectedClass.maxStudents ? (
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

        {/* Bước 5: Chọn tiết học */}
        {selectedSchedule && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Chọn tiết học
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Tiết học hiện tại: {selectedSchedule.dayName} {selectedSchedule.timeSlot} ({selectedSchedule.startTime}-{selectedSchedule.endTime})
              </Alert>
              <FormControl fullWidth>
                <InputLabel>Tiết học muốn đổi</InputLabel>
                <Select
                  value={formData.timeSlotId}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeSlotId: e.target.value }))}
                  label="Tiết học muốn đổi"
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
        {selectedTeacher && selectedClass && selectedSchedule && formData.requestedRoomId && formData.timeSlotId && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Thông tin yêu cầu
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Loại yêu cầu:</Typography>
                  <Typography variant="body1">
                    {formData.requestType === 'change' ? 'Đổi phòng' : 'Xin phòng mới'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Giảng viên:</Typography>
                  <Typography variant="body1">{selectedTeacher?.fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Lớp học:</Typography>
                  <Typography variant="body1">{selectedClass?.className}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Phòng hiện tại:</Typography>
                  <Typography variant="body1">{selectedSchedule?.room.name} ({selectedSchedule?.room.code})</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Phòng mới:</Typography>
                  <Typography variant="body1">
                    {rooms.find(r => r.id === formData.requestedRoomId)?.name}
                    ({rooms.find(r => r.id === formData.requestedRoomId)?.code})
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tiết học:</Typography>
                  <Typography variant="body1">
                    {timeSlots.find(t => t.id === formData.timeSlotId)?.slotName}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Yêu cầu đổi/xin phòng
      </Typography>

      {/* Danh sách yêu cầu cho admin */}
      {user?.role === 'admin' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Danh sách yêu cầu đổi phòng
            </Typography>
            {scheduleRequests.length > 0 ? (
              <Box>
                {scheduleRequests.map((request) => (
                  <Paper key={request.id} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1">
                          <strong>Lớp học:</strong> {request.classSchedule?.class?.className}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Môn học:</strong> {request.classSchedule?.class?.subjectName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Giảng viên:</strong> {request.requester?.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Phòng hiện tại:</strong> {request.classSchedule?.classRoom?.name || 'Chưa có phòng'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Lý do:</strong> {request.reason}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Trạng thái:</strong> {request.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Ngày gửi:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          variant="outlined"
                          onClick={() => handleSelectNewRoom(request)}
                          disabled={request.status !== 'pending'}
                        >
                          Chọn phòng mới
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có yêu cầu đổi phòng nào
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

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
          onClick={() => setConfirmDialogOpen(true)}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Gửi yêu cầu'}
        </Button>
      </Box>

      {/* Dialog để admin chọn phòng mới */}
      <Dialog open={roomSelectionDialogOpen} onClose={() => setRoomSelectionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chọn phòng mới cho yêu cầu</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Yêu cầu: {selectedRequest.classSchedule?.class?.className}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Phòng hiện tại: {selectedRequest.classSchedule?.classRoom?.name || 'Chưa có phòng'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Yêu cầu sức chứa tối thiểu: {selectedRequest.classSchedule?.class?.maxStudents} sinh viên
              </Typography>

              <Typography variant="h6" gutterBottom>
                Danh sách phòng có thể chọn:
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {availableRooms.map((room) => (
                  <Paper key={room.id} sx={{ p: 2, mb: 1, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    onClick={() => handleUpdateRoom(parseInt(room.id))}>
                    <Typography variant="body1">{room.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {room.code} - Sức chứa: {room.capacity} sinh viên -
                      Loại: {room.ClassRoomType?.name || 'Chưa xác định'} -
                      {room.statusText || 'Sẵn sàng'}
                      {room.capacity >= (selectedRequest.classSchedule?.class?.maxStudents || 0) ? (
                        <Chip label="Phù hợp" color="success" size="small" sx={{ ml: 1 }} />
                      ) : (
                        <Chip label="Không phù hợp" color="error" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomSelectionDialogOpen(false)}>Hủy</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Xác nhận gửi yêu cầu</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn gửi yêu cầu này không?
          </Typography>
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

export default RoomRequest;
