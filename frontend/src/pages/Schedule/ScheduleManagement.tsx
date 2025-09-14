import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  SwapHoriz as SwapIcon,
  CalendarToday as CalendarIcon,
  Room as RoomIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

// Mock data dựa trên sample_data.sql
const mockDepartments = [
  { id: 1, code: 'CNTT', name: 'Khoa Công nghệ Thông tin' },
  { id: 2, code: 'CK', name: 'Khoa Công nghệ Cơ khí' },
  { id: 3, code: 'CD', name: 'Khoa Công nghệ Điện' },
  { id: 4, code: 'CDT', name: 'Khoa Công nghệ Điện tử' },
  { id: 5, code: 'QTKD', name: 'Khoa Quản trị Kinh doanh' },
  { id: 6, code: 'NN', name: 'Khoa Ngoại ngữ' }
];

const mockClasses = [
  { id: 1, code: 'COMP101', className: 'Lập trình cơ bản', departmentId: 1 },
  { id: 2, code: 'COMP102', className: 'Cơ sở dữ liệu', departmentId: 1 },
  { id: 3, code: 'COMP103', className: 'Lập trình Web', departmentId: 1 },
  { id: 4, code: 'MECH101', className: 'Cơ học kỹ thuật', departmentId: 2 },
  { id: 5, code: 'MECH102', className: 'Thực hành CNC', departmentId: 2 },
  { id: 6, code: 'ELEC101', className: 'Điện tử cơ bản', departmentId: 4 },
  { id: 7, code: 'BUS101', className: 'Kế toán tài chính', departmentId: 5 }
];

const mockTeachers = [
  { id: 1, name: 'Nguyễn Văn Minh', code: 'GV001', departmentId: 1 },
  { id: 2, name: 'Trần Thị Lan', code: 'GV002', departmentId: 1 },
  { id: 3, name: 'Lê Văn Hùng', code: 'GV003', departmentId: 2 },
  { id: 4, name: 'Phạm Thị Mai', code: 'GV004', departmentId: 4 },
  { id: 5, name: 'Hoàng Văn Đức', code: 'GV005', departmentId: 5 }
];

const mockRooms = [
  { id: 1, code: 'H1.1', name: 'Phòng lý thuyết H1.1', capacity: 50, building: 'Tòa H', floor: 1, type: 'theory' },
  { id: 2, code: 'H1.2', name: 'Phòng lý thuyết H1.2', capacity: 50, building: 'Tòa H', floor: 1, type: 'theory' },
  { id: 3, code: 'H2.1', name: 'Phòng lý thuyết H2.1', capacity: 60, building: 'Tòa H', floor: 2, type: 'theory' },
  { id: 4, code: 'H3.1', name: 'Phòng thực hành H3.1', capacity: 30, building: 'Tòa H', floor: 3, type: 'lab' },
  { id: 5, code: 'A1.1', name: 'Phòng lý thuyết A1.1', capacity: 80, building: 'Tòa A', floor: 1, type: 'theory' },
  { id: 6, code: 'A2.1', name: 'Phòng lý thuyết A2.1', capacity: 100, building: 'Tòa A', floor: 2, type: 'theory' }
];

const mockTimeSlots = [
  { id: 1, slotName: 'Tiết 1-3', startTime: '06:30', endTime: '09:00', shift: 'morning' },
  { id: 2, slotName: 'Tiết 4-6', startTime: '09:10', endTime: '11:40', shift: 'morning' },
  { id: 3, slotName: 'Tiết 7-9', startTime: '12:30', endTime: '15:00', shift: 'afternoon' },
  { id: 4, slotName: 'Tiết 10-12', startTime: '15:10', endTime: '17:40', shift: 'afternoon' },
  { id: 5, slotName: 'Tiết 13-15', startTime: '18:00', endTime: '20:40', shift: 'evening' }
];

const statusOptions = [
  { value: 'pending', label: 'Chờ duyệt', color: 'warning' },
  { value: 'assigned', label: 'Đã phân phòng', color: 'info' },
  { value: 'active', label: 'Đang hoạt động', color: 'success' },
  { value: 'cancelled', label: 'Tạm ngưng', color: 'error' },
  { value: 'paused', label: 'Tạm dừng', color: 'warning' },
  { value: 'exam', label: 'Thi', color: 'secondary' }
];

// Mock schedule data - lịch học thực tế
const mockSchedules = [
  {
    id: 1,
    classId: 1,
    className: 'Lập trình cơ bản',
    classCode: 'COMP101',
    subjectCode: 'NMLT',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 1,
    roomName: 'H1.1 - Phòng lý thuyết H1.1',
    dayOfWeek: 2, // Thứ 2
    timeSlotId: 1,
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'theory',
    status: 'active',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    note: 'Lịch học lý thuyết COMP101'
  },
  {
    id: 2,
    classId: 2,
    className: 'Cơ sở dữ liệu',
    classCode: 'COMP102',
    subjectCode: 'CSDL',
    teacherId: 2,
    teacherName: 'Trần Thị Lan',
    roomId: 2,
    roomName: 'H1.2 - Phòng lý thuyết H1.2',
    dayOfWeek: 3, // Thứ 3
    timeSlotId: 3,
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'theory',
    status: 'active',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    note: 'Lịch học lý thuyết COMP102'
  },
  {
    id: 3,
    classId: 3,
    className: 'Lập trình Web',
    classCode: 'COMP103',
    subjectCode: 'LTW',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 4,
    roomName: 'H3.1 - Phòng thực hành H3.1',
    dayOfWeek: 4, // Thứ 4
    timeSlotId: 4,
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'active',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    note: 'Lịch thực hành COMP103'
  }
];

// Mock schedule requests data - yêu cầu thay đổi
const mockScheduleRequests = [
  {
    id: 1,
    requestType: 'room_request',
    classId: 1,
    className: 'Lập trình cơ bản',
    classCode: 'COMP101',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    currentRoom: 'H1.1',
    newRoom: 'H2.1',
    currentTimeSlot: 'Tiết 1-3',
    newTimeSlot: 'Tiết 1-3',
    currentDate: '2024-10-15',
    newDate: '2024-10-15',
    reason: 'Phòng hiện tại quá nhỏ cho số lượng sinh viên',
    status: 'pending',
    requestDate: '2024-10-10',
    requesterName: 'Nguyễn Văn Minh'
  },
  {
    id: 2,
    requestType: 'schedule_change',
    classId: 2,
    className: 'Cơ sở dữ liệu',
    classCode: 'COMP102',
    teacherId: 2,
    teacherName: 'Trần Thị Lan',
    currentRoom: 'H1.2',
    newRoom: 'H2.2',
    currentTimeSlot: 'Tiết 7-9',
    newTimeSlot: 'Tiết 10-12',
    currentDate: '2024-10-16',
    newDate: '2024-10-16',
    reason: 'Giảng viên có lịch trùng với tiết 7-9',
    status: 'approved',
    requestDate: '2024-10-08',
    requesterName: 'Trần Thị Lan'
  }
];

const ScheduleManagement = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isFromRequest, setIsFromRequest] = useState(false);

  // Form state for dialog
  const [formData, setFormData] = useState({
    classId: '',
    teacherId: '',
    roomId: '',
    timeSlotId: '',
    dayOfWeek: 2,
    status: 'active',
    startDate: dayjs(),
    endDate: dayjs().add(15, 'week'),
    note: ''
  });

  // Filtered data
  const [filteredClasses, setFilteredClasses] = useState(mockClasses);
  const [filteredTeachers, setFilteredTeachers] = useState(mockTeachers);
  const [filteredRooms, setFilteredRooms] = useState(mockRooms);

  // Filter classes by department when teacher changes
  React.useEffect(() => {
    if (selectedTeacher) {
      const teacher = mockTeachers.find(t => t.id === parseInt(selectedTeacher));
      if (teacher) {
        setFilteredClasses(mockClasses.filter(c => c.departmentId === teacher.departmentId));
      }
    } else {
      setFilteredClasses(mockClasses);
    }
  }, [selectedTeacher]);

  // Filter teachers by department when class changes
  React.useEffect(() => {
    if (selectedClass) {
      const classInfo = mockClasses.find(c => c.id === parseInt(selectedClass));
      if (classInfo) {
        setFilteredTeachers(mockTeachers.filter(t => t.departmentId === classInfo.departmentId));
      }
    } else {
      setFilteredTeachers(mockTeachers);
    }
  }, [selectedClass]);

  // Filter rooms by type when class changes
  React.useEffect(() => {
    if (formData.classId) {
      const classInfo = mockClasses.find(c => c.id === parseInt(formData.classId));
      if (classInfo) {
        const classType = classInfo.className.includes('Thực hành') ? 'lab' : 'theory';
        setFilteredRooms(mockRooms.filter(r => r.type === classType));
      }
    } else {
      setFilteredRooms(mockRooms);
    }
  }, [formData.classId]);

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    let filtered = mockSchedules;

    if (selectedDepartment) {
      const departmentId = parseInt(selectedDepartment);
      filtered = filtered.filter(schedule => {
        const classInfo = mockClasses.find(c => c.id === schedule.classId);
        return classInfo?.departmentId === departmentId;
      });
    }

    if (selectedClass) {
      const classId = parseInt(selectedClass);
      filtered = filtered.filter(schedule => schedule.classId === classId);
    }

    if (selectedTeacher) {
      const teacherId = parseInt(selectedTeacher);
      filtered = filtered.filter(schedule => schedule.teacherId === teacherId);
    }

    if (selectedStatus) {
      filtered = filtered.filter(schedule => schedule.status === selectedStatus);
    }

    return filtered;
  }, [selectedDepartment, selectedClass, selectedTeacher, selectedStatus]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    let filtered = mockScheduleRequests;

    if (selectedDepartment) {
      const departmentId = parseInt(selectedDepartment);
      filtered = filtered.filter(req => {
        const classInfo = mockClasses.find(c => c.id === req.classId);
        return classInfo?.departmentId === departmentId;
      });
    }

    if (selectedClass) {
      const classId = parseInt(selectedClass);
      filtered = filtered.filter(req => req.classId === classId);
    }

    if (selectedTeacher) {
      const teacherId = parseInt(selectedTeacher);
      filtered = filtered.filter(req => req.teacherId === teacherId);
    }

    if (selectedStatus) {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    return filtered;
  }, [selectedDepartment, selectedClass, selectedTeacher, selectedStatus]);

  const handleOpenScheduleDialog = (schedule: any, fromRequest: boolean = false) => {
    setIsFromRequest(fromRequest);
    
    if (fromRequest) {
      // Từ yêu cầu - điền sẵn thông tin
      setFormData({
        classId: schedule.classId.toString(),
        teacherId: schedule.teacherId.toString(),
        roomId: schedule.currentRoom ? mockRooms.find(r => r.code === schedule.currentRoom)?.id.toString() || '' : '',
        timeSlotId: schedule.currentTimeSlot ? mockTimeSlots.find(s => s.slotName === schedule.currentTimeSlot)?.id.toString() || '' : '',
        dayOfWeek: 2,
        status: 'pending',
        startDate: dayjs(schedule.currentDate),
        endDate: dayjs(schedule.currentDate).add(15, 'week'),
        note: schedule.reason || ''
      });
    } else {
      // Từ danh sách lớp - điền thông tin hiện tại
      setFormData({
        classId: schedule.classId.toString(),
        teacherId: schedule.teacherId.toString(),
        roomId: schedule.roomId.toString(),
        timeSlotId: schedule.timeSlotId.toString(),
        dayOfWeek: schedule.dayOfWeek,
        status: schedule.status,
        startDate: dayjs(schedule.startDate),
        endDate: dayjs(schedule.endDate),
        note: schedule.note || ''
      });
    }
    
    setScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setIsFromRequest(false);
    setFormData({
      classId: '',
      teacherId: '',
      roomId: '',
      timeSlotId: '',
      dayOfWeek: 2,
      status: 'active',
      startDate: dayjs(),
      endDate: dayjs().add(15, 'week'),
      note: ''
    });
  };

  const handleSaveSchedule = () => {
    console.log('Save schedule:', formData);
    // Here you would typically save to backend
    handleCloseScheduleDialog();
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'assigned': return <CheckCircleIcon />;
      case 'active': return <CheckCircleIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'paused': return <PendingIcon />;
      case 'exam': return <ScheduleIcon />;
      default: return <PendingIcon />;
    }
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case 'room_request': return 'Yêu cầu phòng';
      case 'schedule_change': return 'Thay đổi lịch';
      case 'exception': return 'Ngoại lệ';
      default: return type;
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek] || 'Chủ nhật';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Quản lý lịch học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và điều chỉnh lịch học, xử lý yêu cầu thay đổi lịch
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3, boxShadow: 2 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Danh sách lịch học" />
            <Tab label="Yêu cầu thay đổi" />
          </Tabs>
        </Paper>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Theo khoa</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Theo khoa"
                >
                  <MenuItem value="">Tất cả khoa</MenuItem>
                  {mockDepartments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Theo lớp</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Theo lớp"
                >
                  <MenuItem value="">Tất cả lớp</MenuItem>
                  {filteredClasses.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.className}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Theo GV</InputLabel>
                <Select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  label="Theo GV"
                >
                  <MenuItem value="">Tất cả GV</MenuItem>
                  {filteredTeachers.map(teacher => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {statusOptions.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <DatePicker
                label="Ngày"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenScheduleDialog({}, false)}
                fullWidth
                sx={{ height: '40px' }}
              >
                Thêm lịch học
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Content based on tab */}
        {currentTab === 0 ? (
          /* Schedules List */
          <Paper sx={{ boxShadow: 3 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Danh sách lịch học ({filteredSchedules.length})
              </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {filteredSchedules.map((schedule) => (
                  <Box key={schedule.id} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleOpenScheduleDialog(schedule, false)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                            {schedule.className}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(schedule.status)}
                            label={statusOptions.find(s => s.value === schedule.status)?.label || schedule.status}
                            color={getStatusColor(schedule.status) as any}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Mã lớp:</strong> {schedule.classCode} - {schedule.subjectCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Giảng viên:</strong> {schedule.teacherName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Phòng:</strong> {schedule.roomName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Thời gian:</strong> {getDayName(schedule.dayOfWeek)} - {schedule.timeSlot}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Ca:</strong> {schedule.shift === 'morning' ? 'Sáng' : schedule.shift === 'afternoon' ? 'Chiều' : 'Tối'}
                          </Typography>
                        </Box>

                        {schedule.note && (
                          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                            "{schedule.note}"
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenScheduleDialog(schedule, false);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {filteredSchedules.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Không có lịch học nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Hãy thêm lịch học mới hoặc thay đổi bộ lọc
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        ) : (
          /* Requests List */
          <Paper sx={{ boxShadow: 3 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Danh sách yêu cầu ({filteredRequests.length})
              </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {filteredRequests.map((request) => (
                  <Box key={request.id} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleOpenScheduleDialog(request, true)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                            {request.className}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(request.status)}
                            label={request.status === 'pending' ? 'Chờ duyệt' : 
                                   request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Loại yêu cầu:</strong> {getRequestTypeText(request.requestType)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Mã lớp:</strong> {request.classCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Giảng viên:</strong> {request.teacherName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Ngày yêu cầu:</strong> {dayjs(request.requestDate).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                          "{request.reason}"
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenScheduleDialog(request, true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {filteredRequests.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Không có yêu cầu nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Hãy thêm yêu cầu mới hoặc thay đổi bộ lọc
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Schedule Dialog */}
        <Dialog 
          open={scheduleDialogOpen} 
          onClose={handleCloseScheduleDialog}
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { minHeight: '80vh' }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            pb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SwapIcon color="primary" />
              <Typography variant="h6" component="div">
                {isFromRequest ? 'Xử lý yêu cầu thay đổi lịch' : 'Điều chỉnh lịch học'}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseScheduleDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Thông tin lớp học */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Thông tin lớp học
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Chọn lớp học</InputLabel>
                    <Select
                      value={formData.classId}
                      onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                      label="Chọn lớp học"
                      required
                    >
                      {filteredClasses.map(cls => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.className} ({cls.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Giảng viên</InputLabel>
                    <Select
                      value={formData.teacherId}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                      label="Giảng viên"
                      required
                    >
                      {filteredTeachers.map(teacher => (
                        <MenuItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phòng học</InputLabel>
                    <Select
                      value={formData.roomId}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                      label="Phòng học"
                      required
                    >
                      {filteredRooms.map(room => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.name} ({room.code}) - {room.capacity} chỗ
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tiết học</InputLabel>
                    <Select
                      value={formData.timeSlotId}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeSlotId: e.target.value }))}
                      label="Tiết học"
                      required
                    >
                      {mockTimeSlots.map(slot => (
                        <MenuItem key={slot.id} value={slot.id}>
                          {slot.slotName} ({slot.startTime}-{slot.endTime})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ngày trong tuần</InputLabel>
                    <Select
                      value={formData.dayOfWeek.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                      label="Ngày trong tuần"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(day => (
                        <MenuItem key={day} value={day.toString()}>
                          {getDayName(day)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={formData.startDate}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, startDate: newValue || dayjs() }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <DatePicker
                    label="Ngày kết thúc"
                    value={formData.endDate}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, endDate: newValue || dayjs() }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Box>

                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      label="Trạng thái"
                      required
                    >
                      {statusOptions.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Ghi chú"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  size="small"
                />
              </Box>

              {/* Preview */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Xem trước thông tin
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Thông tin lịch học
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ClassIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formData.classId ? mockClasses.find(c => c.id === parseInt(formData.classId))?.className : 'Chưa chọn'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formData.teacherId ? mockTeachers.find(t => t.id === parseInt(formData.teacherId))?.name : 'Chưa chọn'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <RoomIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formData.roomId ? mockRooms.find(r => r.id === parseInt(formData.roomId))?.name : 'Chưa chọn'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formData.timeSlotId ? mockTimeSlots.find(s => s.id === parseInt(formData.timeSlotId))?.slotName : 'Chưa chọn'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {getDayName(formData.dayOfWeek)} - {formData.startDate?.format('DD/MM/YYYY')} đến {formData.endDate?.format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Trạng thái hiện tại
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Chip
                          icon={getStatusIcon(formData.status)}
                          label={statusOptions.find(s => s.value === formData.status)?.label || formData.status}
                          color={getStatusColor(formData.status) as any}
                          size="small"
                        />
                      </Box>
                      {formData.note && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Ghi chú:</strong> {formData.note}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseScheduleDialog} variant="outlined">
              Hủy
            </Button>
            <Button onClick={handleSaveSchedule} variant="contained" color="primary">
              {isFromRequest ? 'Xử lý yêu cầu' : 'Lưu thay đổi'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleManagement;