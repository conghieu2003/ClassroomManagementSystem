import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
// Removed MUI X Date Pickers to avoid version conflicts - using HTML5 inputs instead
import { authService, scheduleService } from '../../services/api';
import { fetchRoomsThunk, selectRooms } from '../../redux/slices/roomSlice';
import { Schedule, User } from '../../types';

const UnifiedDashboard = () => {
  const dispatch = useDispatch();
  const rooms = useSelector(selectRooms);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  
  // Weekly schedule states
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filterType, setFilterType] = useState('all');
  const [selectedWeekDate, setSelectedWeekDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states for schedule creation/editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    roomId: '',
    type: 'class'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      setCurrentUser(user);
      setUserRole(user.role || 'student');
    }
  }, []);

  useEffect(() => {
    dispatch(fetchRoomsThunk() as any);
  }, [dispatch]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await scheduleService.getAllSchedules();
        if (response && response.data) {
          setSchedules(response.data);
        } else {
          // Fallback mock data based on init.sql structure
          const mockSchedules: Schedule[] = [
            { id: '1', startTime: '2024-09-09T07:00:00.000Z', endTime: '2024-09-09T09:30:00.000Z', roomId: '1', subject: 'Nhập môn lập trình', title: 'Lập trình cơ bản - Lý thuyết', description: 'Lớp COMP101 - Lý thuyết', type: 'class', teacherId: '1', studentIds: ['1', '2', '3', '4', '5'] },
            { id: '2', startTime: '2024-09-09T13:00:00.000Z', endTime: '2024-09-09T15:30:00.000Z', roomId: '3', subject: 'Nhập môn lập trình', title: 'Lập trình cơ bản - Thực hành', description: 'Lớp COMP101 - Thực hành nhóm 1', type: 'practice', teacherId: '1', studentIds: ['1'] },
            { id: '3', startTime: '2024-09-10T09:45:00.000Z', endTime: '2024-09-10T12:15:00.000Z', roomId: '2', subject: 'Cơ sở dữ liệu', title: 'Cơ sở dữ liệu - Lý thuyết', description: 'Lớp COMP102 - Lý thuyết', type: 'class', teacherId: '2', studentIds: ['1', '2', '4', '5'] }
          ];
          setSchedules(mockSchedules);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        const mockSchedules: Schedule[] = [
          { id: '1', startTime: '2024-09-09T07:00:00.000Z', endTime: '2024-09-09T09:30:00.000Z', roomId: '1', subject: 'Nhập môn lập trình', title: 'Lập trình cơ bản - Lý thuyết', description: 'Lớp COMP101 - Lý thuyết', type: 'class', teacherId: '1', studentIds: ['1', '2', '3', '4', '5'] }
        ];
        setSchedules(mockSchedules);
      }
    };
    fetchSchedules();
  }, [dispatch]);

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        title: schedule.title || '',
        description: schedule.description || '',
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        roomId: schedule.roomId || '',
        type: schedule.type || 'class'
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(),
        roomId: '',
        type: 'class'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleSaveSchedule = async () => {
    try {
      if (editingSchedule) {
        await scheduleService.updateSchedule(editingSchedule.id!, formData);
      } else {
        await scheduleService.createSchedule(formData);
      }
      // Refresh schedules
      const response = await scheduleService.getAllSchedules();
      if (response && response.data) {
        setSchedules(response.data);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await scheduleService.deleteSchedule(scheduleId);
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const renderWeeklySchedule = () => {
    // Get week dates (Monday to Sunday)
    const getWeekDates = (date: Date) => {
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        weekDates.push(day);
      }
      return weekDates;
    };

    const weekDates = getWeekDates(currentWeek);
    const timeSlots = ['Sáng', 'Chiều', 'Tối'];

    const navigateWeek = (direction: 'prev' | 'next') => {
      const newWeek = new Date(currentWeek);
      newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentWeek(newWeek);
    };

    const goToCurrentWeek = () => {
      setCurrentWeek(new Date());
    };

    const getScheduleForSlot = (day: Date, timeSlot: string) => {
      const dayStr = day.toISOString().split('T')[0];
      return schedules?.filter(schedule => {
        const scheduleDate = new Date(schedule.startTime).toISOString().split('T')[0];
        const scheduleTime = new Date(schedule.startTime).getHours();
        let timeMatch = false;
        
        if (timeSlot === 'Sáng') timeMatch = scheduleTime >= 7 && scheduleTime < 12;
        else if (timeSlot === 'Chiều') timeMatch = scheduleTime >= 12 && scheduleTime < 18;
        else if (timeSlot === 'Tối') timeMatch = scheduleTime >= 18 && scheduleTime < 22;
        
        return scheduleDate === dayStr && timeMatch;
      }) || [];
    };

    const getScheduleColor = (type: string) => {
      switch (type) {
        case 'class': return '#f5f5f5'; // Lý thuyết
        case 'practice': return '#4caf50'; // Thực hành
        case 'online': return '#2196f3'; // Trực tuyến
        case 'exam': return '#ffeb3b'; // Thi
        case 'suspended': return '#f44336'; // Tạm ngưng
        default: return '#f5f5f5';
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'nowrap',
          gap: 1,
          minHeight: 60,
          overflow: 'hidden'
        }}>
          {/* Left: Title */}
          <Typography variant="h5" sx={{ 
            color: '#1976d2', 
            fontWeight: 'bold', 
            flex: '0 0 auto',
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            whiteSpace: 'nowrap'
          }}>
            Lịch học, lịch thi theo tuần
          </Typography>
          
          {/* Center: Radio Buttons and Date */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            flex: '1 1 auto',
            justifyContent: 'center',
            minWidth: 0
          }}>
            {/* Filter Radio Buttons */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={filterType}
                  onChange={(e: any) => setFilterType(e.target.value)}
                >
                  <FormControlLabel 
                    value="all" 
                    control={<Radio size="small" />} 
                    label="Tất cả" 
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                  />
                  <FormControlLabel 
                    value="class" 
                    control={<Radio size="small" />} 
                    label="Lịch học" 
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                  />
                  <FormControlLabel 
                    value="exam" 
                    control={<Radio size="small" />} 
                    label="Lịch thi" 
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Date Input */}
            <TextField
              type="date"
              value={selectedWeekDate}
              onChange={(e: any) => setSelectedWeekDate(e.target.value)}
              size="small"
              sx={{ 
                width: 130,
                '& .MuiInputBase-input': { fontSize: '0.8rem' }
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Right: Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            flex: '0 0 auto',
            flexWrap: 'nowrap'
          }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={goToCurrentWeek}
              sx={{ 
                fontSize: '0.75rem',
                minWidth: 'auto',
                px: 1
              }}
            >
              Hiện tại
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<PrintIcon sx={{ fontSize: '0.8rem' }} />}
              sx={{ 
                fontSize: '0.75rem',
                minWidth: 'auto',
                px: 1
              }}
            >
              In lịch
            </Button>

            {/* Week Navigation */}
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigateWeek('prev')}
              startIcon={<ArrowBackIcon sx={{ fontSize: '0.8rem' }} />}
              sx={{ 
                fontSize: '0.75rem',
                minWidth: 'auto',
                px: 1
              }}
            >
              Trở về
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigateWeek('next')}
              endIcon={<ArrowForwardIcon sx={{ fontSize: '0.8rem' }} />}
              sx={{ 
                fontSize: '0.75rem',
                minWidth: 'auto',
                px: 1
              }}
            >
              Tiếp
            </Button>

            {/* Fullscreen Toggle */}
            <IconButton size="small" sx={{ p: 0.5 }}>
              <FullscreenIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Schedule Grid */}
        <Box sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 1,
          overflow: 'hidden',
          mb: 3
        }}>
          {/* Header Row */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '120px repeat(7, 1fr)',
            backgroundColor: '#1976d2',
            color: 'white'
          }}>
            <Box sx={{ p: 2, borderRight: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              Ca học
            </Box>
            {weekDates.map((day, index) => (
              <Box key={index} sx={{ p: 2, borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'][index]}
                </Typography>
                <Typography variant="body2">
                  {day.toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Time Slots Rows */}
          {timeSlots.map((timeSlot, slotIndex) => (
            <Box key={slotIndex} sx={{ 
              display: 'grid', 
              gridTemplateColumns: '120px repeat(7, 1fr)',
              borderBottom: '1px solid #e0e0e0'
            }}>
              {/* Time Slot Header */}
              <Box sx={{ 
                p: 2, 
                borderRight: '1px solid #e0e0e0',
                backgroundColor: '#fff9c4',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold'
              }}>
                {timeSlot}
              </Box>

              {/* Day Cells */}
              {weekDates.map((day, dayIndex) => {
                const daySchedules = getScheduleForSlot(day, timeSlot);
                const filteredSchedules = filterType === 'all' 
                  ? daySchedules 
                  : daySchedules.filter(s => s.type === filterType);

                return (
                  <Box 
                    key={dayIndex} 
                    sx={{ 
                      p: 1, 
                      borderRight: '1px solid #e0e0e0',
                      minHeight: 80,
                      backgroundColor: 'white'
                    }}
                  >
                    {filteredSchedules.map((schedule, scheduleIndex) => (
                      <Box
                        key={scheduleIndex}
                        sx={{
                          backgroundColor: getScheduleColor(schedule.type || 'class'),
                          p: 1,
                          mb: 0.5,
                          borderRadius: 0.5,
                          fontSize: '0.75rem',
                          border: '1px solid #ddd'
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                          {schedule.title || schedule.subject}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {new Date(schedule.startTime).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(schedule.endTime).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          Phòng: {schedule.roomId}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Legend */}
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          flexWrap: 'wrap',
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1
        }}>
          {[
            { type: 'class', color: '#f5f5f5', text: 'Lịch học lý thuyết' },
            { type: 'practice', color: '#4caf50', text: 'Lịch học thực hành' },
            { type: 'online', color: '#2196f3', text: 'Lịch học trực tuyến' },
            { type: 'exam', color: '#ffeb3b', text: 'Lịch thi' },
            { type: 'suspended', color: '#f44336', text: 'Lịch tạm ngưng' }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                backgroundColor: item.color, 
                border: '1px solid #ddd',
                borderRadius: 0.5
              }} />
              <Typography variant="caption">{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {/* Weekly Schedule - Direct display without tabs */}
      {renderWeeklySchedule()}

      {/* Schedule Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Chỉnh sửa lịch' : 'Thêm lịch mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={formData.title}
              onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Thời gian bắt đầu"
                value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                onChange={(e: any) => setFormData({ ...formData, startTime: e.target.value ? new Date(e.target.value) : new Date() })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="datetime-local"
                label="Thời gian kết thúc"
                value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                onChange={(e: any) => setFormData({ ...formData, endTime: e.target.value ? new Date(e.target.value) : new Date() })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Phòng học</InputLabel>
                <Select
                  value={formData.roomId}
                  onChange={(e: any) => setFormData({ ...formData, roomId: e.target.value })}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={String(room.id)}>
                      {room.roomNumber} - Tòa {room.building}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Loại</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="class">Lý thuyết</MenuItem>
                  <MenuItem value="practice">Thực hành</MenuItem>
                  <MenuItem value="exam">Thi</MenuItem>
                  <MenuItem value="meeting">Họp</MenuItem>
                  <MenuItem value="event">Sự kiện</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveSchedule} variant="contained">
            {editingSchedule ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedDashboard;