import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { RootState, AppDispatch } from '../../redux/store';
import { 
  fetchWeeklySchedule, 
  fetchDepartments, 
  fetchClasses, 
  fetchTeachers 
} from '../../redux/slices/scheduleSlice';

// Types
interface WeeklyScheduleItem {
  id: number;
  classId: number;
  className: string;
  classCode: string;
  subjectCode: string;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  teacherCode: string;
  roomId: number;
  roomName: string;
  roomCode: string;
  roomType: string;
  dayOfWeek: number;
  dayName: string;
  timeSlot: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  shift: string;
  shiftName: string;
  type: string;
  status: string;
  statusId: number;
  weekPattern: string;
  startWeek: number;
  endWeek: number;
  practiceGroup?: number;
  maxStudents: number;
  departmentId: number;
  departmentName: string;
  majorId?: number;
  majorName: string;
  timeSlotOrder: number;
  assignedAt: string;
  note?: string;
  // Thông tin ngoại lệ
  exceptionDate?: string;
  exceptionType?: string;
  exceptionReason?: string;
  exceptionStatus?: string;
}

// Memoized Schedule Card Component
const ScheduleCard = memo(({ schedule, getScheduleColor }: { 
  schedule: WeeklyScheduleItem; 
  getScheduleColor: (type: string, exceptionType?: string) => string;
}) => {
  const isException = schedule.exceptionDate && schedule.exceptionType;
  const isCancelled = schedule.exceptionType === 'cancelled';
  const isExam = schedule.exceptionType === 'exam' || schedule.statusId === 6;
  
  return (
    <Card 
      sx={{ 
        mb: 1, 
        backgroundColor: getScheduleColor(schedule.type, schedule.exceptionType),
        border: isException ? '2px solid #ff6b6b' : '1px solid #ddd',
        position: 'relative',
        opacity: isCancelled ? 0.6 : 1,
        '&:last-child': { mb: 0 }
      }}
    >
      {/* Nhãn ngoại lệ */}
      {isException && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: isCancelled ? '#ff6b6b' : isExam ? '#ffa726' : '#66bb6a',
            color: 'white',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '0 4px 0 8px',
            zIndex: 1
          }}
        >
          {isCancelled ? 'TẠM NGƯNG' : isExam ? 'THI' : 'NGOẠI LỆ'}
        </Box>
      )}
      
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 'bold', 
            fontSize: '0.75rem',
            textDecoration: isCancelled ? 'line-through' : 'none',
            color: isCancelled ? '#666' : 'inherit'
          }}
        >
          {schedule.className}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            fontSize: '0.7rem',
            textDecoration: isCancelled ? 'line-through' : 'none',
            color: isCancelled ? '#666' : 'inherit'
          }}
        >
          {schedule.classCode} - {schedule.subjectCode}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            fontSize: '0.7rem',
            textDecoration: isCancelled ? 'line-through' : 'none',
            color: isCancelled ? '#666' : 'inherit'
          }}
        >
          Tiết: {schedule.timeSlot}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            fontSize: '0.7rem',
            textDecoration: isCancelled ? 'line-through' : 'none',
            color: isCancelled ? '#666' : 'inherit'
          }}
        >
          Phòng: {schedule.roomName || 'Chưa phân'}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            fontSize: '0.7rem',
            textDecoration: isCancelled ? 'line-through' : 'none',
            color: isCancelled ? '#666' : 'inherit'
          }}
        >
          GV: {schedule.teacherName}
        </Typography>
        {schedule.practiceGroup && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              fontSize: '0.7rem',
              textDecoration: isCancelled ? 'line-through' : 'none',
              color: isCancelled ? '#666' : 'inherit'
            }}
          >
            Nhóm: {schedule.practiceGroup}
          </Typography>
        )}
        {isException && schedule.exceptionReason && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              fontSize: '0.65rem',
              color: isCancelled ? '#d32f2f' : isExam ? '#f57c00' : '#2e7d32',
              fontStyle: 'italic',
              mt: 0.5
            }}
          >
            {schedule.exceptionReason}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

const WeeklySchedule = () => {
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const {
    weeklySchedules,
    departments,
    classes,
    teachers,
    loading,
    error
  } = useSelector((state: RootState) => state.schedule);

  // Local loading state for schedule data only
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // Debounce filter changes to prevent rapid API calls
  const [debouncedFilters, setDebouncedFilters] = useState({
    departmentId: '',
    classId: '',
    teacherId: ''
  });

  // Keep previous data to prevent flickering - use stable reference
  const previousSchedulesRef = useRef<WeeklyScheduleItem[]>([]);
  
  // Cache for schedule data to avoid unnecessary API calls
  const scheduleCache = useRef<Map<string, WeeklyScheduleItem[]>>(new Map());
  
  // Loading timeout ref to prevent race conditions
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stable data reference to prevent unnecessary re-renders
  const stableSchedulesRef = useRef<WeeklyScheduleItem[]>([]);

  // Local state
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [scheduleType, setScheduleType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Load initial data
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchClasses());
    dispatch(fetchTeachers());
  }, [dispatch]);

  // Debounce filter changes with adaptive timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        departmentId: selectedDepartment,
        classId: selectedClass,
        teacherId: selectedTeacher
      });
    }, 250); // Reduced to 250ms for better responsiveness

    return () => clearTimeout(timer);
  }, [selectedDepartment, selectedClass, selectedTeacher]);

  // Generate cache key for current filters
  const getCacheKey = useCallback((weekStartDate: string, filters: any) => {
    return `${weekStartDate}-${filters.departmentId || 'all'}-${filters.classId || 'all'}-${filters.teacherId || 'all'}`;
  }, []);

  // Load weekly schedule when debounced filters change
  const loadWeeklySchedule = useCallback(async () => {
    const weekStartDate = selectedDate.startOf('week').add(1, 'day').format('YYYY-MM-DD'); // Start from Monday
    const filters = {
      departmentId: debouncedFilters.departmentId ? parseInt(debouncedFilters.departmentId) : undefined,
      classId: debouncedFilters.classId ? parseInt(debouncedFilters.classId) : undefined,
      teacherId: debouncedFilters.teacherId ? parseInt(debouncedFilters.teacherId) : undefined
    };
    
    const cacheKey = getCacheKey(weekStartDate, filters);
    
    // Check cache first
    if (scheduleCache.current.has(cacheKey)) {
      const cachedData = scheduleCache.current.get(cacheKey);
      if (cachedData) {
        // Use cached data without API call - update stable reference
        stableSchedulesRef.current = cachedData;
        return;
      }
    }
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Store current data before loading new data
    if (weeklySchedules && weeklySchedules.length > 0) {
      previousSchedulesRef.current = weeklySchedules;
    }
    
    // Only show loading if we don't have previous data
    if (previousSchedulesRef.current.length === 0) {
      setScheduleLoading(true);
    }
    
    try {
      const result = await dispatch(fetchWeeklySchedule({ weekStartDate, filters }));
      
      // Cache the result and update stable reference
      if (result.payload && Array.isArray(result.payload)) {
        const newData = result.payload as WeeklyScheduleItem[];
        scheduleCache.current.set(cacheKey, newData);
        stableSchedulesRef.current = newData;
        
        // Limit cache size to prevent memory leaks
        if (scheduleCache.current.size > 50) {
          const firstKey = scheduleCache.current.keys().next().value;
          if (firstKey) {
            scheduleCache.current.delete(firstKey);
          }
        }
      }
    } finally {
      // Ensure minimum loading time for smooth UX
      loadingTimeoutRef.current = setTimeout(() => {
        setScheduleLoading(false);
      }, 150);
    }
  }, [dispatch, selectedDate, debouncedFilters, weeklySchedules, getCacheKey]);

  useEffect(() => {
    loadWeeklySchedule();
  }, [loadWeeklySchedule]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Tính toán tuần hiện tại
  const currentWeek = useMemo(() => {
    const startOfWeek = selectedDate.startOf('week').add(1, 'day'); // Bắt đầu từ thứ 2
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      weekDays.push({
        dayOfWeek: i + 2, // 2 = Thứ 2, 3 = Thứ 3, ..., 8 = Chủ nhật
        date: day,
        dayName: dayNames[i],
        dayNumber: day.format('DD/MM/YYYY')
      });
    }
    return weekDays;
  }, [selectedDate]);

  const filteredSchedules = useMemo(() => {
    // Use stable reference to prevent flickering
    const currentData = (weeklySchedules && weeklySchedules.length > 0) ? weeklySchedules : 
                       (stableSchedulesRef.current.length > 0) ? stableSchedulesRef.current : 
                       previousSchedulesRef.current;
    let filtered = currentData || [];

    // Filter theo loại lịch
    if (scheduleType === 'study') {
      filtered = filtered.filter(s => s.type === 'theory' || s.type === 'practice');
    } else if (scheduleType === 'exam') {
      filtered = filtered.filter(s => s.type === 'exam');
    }

    return filtered;
  }, [weeklySchedules, scheduleType]);

  // Tạo lưới lịch học
  const scheduleGrid = useMemo(() => {
    const shifts = [
      { key: 'morning', name: 'Sáng', color: '#fff3cd' },
      { key: 'afternoon', name: 'Chiều', color: '#d1ecf1' },
      { key: 'evening', name: 'Tối', color: '#f8d7da' }
    ];

    const grid = shifts.map(shift => {
      const shiftSchedules = currentWeek.map(day => {
        const daySchedules = filteredSchedules.filter(schedule => 
          schedule.dayOfWeek === day.dayOfWeek && schedule.shift === shift.key
        );
        
        // Sắp xếp theo thứ tự tiết học (timeSlotOrder)
        return daySchedules.sort((a, b) => {
          const aOrder = a.timeSlotOrder || 0;
          const bOrder = b.timeSlotOrder || 0;
          return aOrder - bOrder;
        });
      });

      return {
        ...shift,
        schedules: shiftSchedules
      };
    });

    return grid;
  }, [currentWeek, filteredSchedules]);

  // Memoize current week to prevent unnecessary recalculations
  const memoizedCurrentWeek = useMemo(() => currentWeek, [currentWeek]);
  
  // Update stable reference when weeklySchedules changes
  useEffect(() => {
    if (weeklySchedules && weeklySchedules.length > 0) {
      stableSchedulesRef.current = weeklySchedules;
    }
  }, [weeklySchedules]);

  const getScheduleColor = useCallback((type: string, exceptionType?: string) => {
    // Xử lý màu sắc cho các trường hợp ngoại lệ
    if (exceptionType) {
      switch (exceptionType) {
        case 'cancelled': return '#f8d7da'; // Light red - Tạm ngưng
        case 'exam': return '#fff3cd'; // Light yellow - Thi
        case 'moved': return '#d1ecf1'; // Light blue - Chuyển lịch
        case 'substitute': return '#e2e3e5'; // Light grey - Thay thế
        default: return '#f8f9fa'; // Default
      }
    }
    
    // Màu sắc bình thường
    switch (type) {
      case 'theory': return '#f8f9fa'; // Light grey
      case 'practice': return '#d4edda'; // Green
      case 'online': return '#cce7ff'; // Light blue
      case 'exam': return '#fff3cd'; // Yellow
      default: return '#f8f9fa';
    }
  }, []);

  const handlePreviousWeek = useCallback(() => {
    setSelectedDate(prev => prev.subtract(1, 'week'));
  }, []);

  const handleNextWeek = useCallback(() => {
    setSelectedDate(prev => prev.add(1, 'week'));
  }, []);

  const handleCurrentWeek = useCallback(() => {
    setSelectedDate(dayjs());
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Event handlers for form controls
  const handleDepartmentChange = useCallback((e: any) => {
    setSelectedDepartment(e.target.value as string);
    setSelectedClass('');
    setSelectedTeacher('');
  }, []);

  const handleClassChange = useCallback((e: any) => {
    setSelectedClass(e.target.value as string);
  }, []);

  const handleTeacherChange = useCallback((e: any) => {
    setSelectedTeacher(e.target.value as string);
  }, []);

  const handleScheduleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleType(e.target.value);
  }, []);

  const handleDateChange = useCallback((newValue: Dayjs | null) => {
    if (newValue) {
      setSelectedDate(newValue);
    }
  }, []);

  // Filter classes based on selected department
  const filteredClassesForDropdown = useMemo(() => {
    if (!selectedDepartment) return classes || [];
    
    const selectedDept = departments?.find(d => d.id.toString() === selectedDepartment);
    if (!selectedDept) return classes || [];
    
    return (classes || []).filter(cls => cls.departmentId === selectedDept.id);
  }, [classes, departments, selectedDepartment]);

  // Filter teachers based on selected department
  const filteredTeachersForDropdown = useMemo(() => {
    if (!selectedDepartment) return teachers || [];
    
    return (teachers || []).filter(teacher => 
      teacher.departmentId && teacher.departmentId.toString() === selectedDepartment
    );
  }, [teachers, selectedDepartment]);

  // Only show full loading for initial data load
  if (loading && !departments && !classes && !teachers) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters Row */}
        <Paper sx={{ p: 1.5, mb: 1, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Theo khoa</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                label="Theo khoa"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    height: '40px'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Tất cả khoa</MenuItem>
                {(departments || []).map(dept => (
                  <MenuItem key={dept.id} value={dept.id.toString()} sx={{ fontSize: '0.75rem' }}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Theo lớp</InputLabel>
              <Select
                value={selectedClass}
                onChange={handleClassChange}
                label="Theo lớp"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    height: '40px'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Tất cả lớp</MenuItem>
                {filteredClassesForDropdown.map((cls: any) => (
                  <MenuItem key={cls.id} value={cls.id.toString()} sx={{ fontSize: '0.75rem' }}>
                    {cls.className || cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Theo GV</InputLabel>
              <Select
                value={selectedTeacher}
                onChange={handleTeacherChange}
                label="Theo GV"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    height: '40px'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Tất cả GV</MenuItem>
                {filteredTeachersForDropdown.map(teacher => (
                  <MenuItem key={teacher.id} value={teacher.id.toString()} sx={{ fontSize: '0.75rem' }}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Title and Controls Row */}
        <Paper sx={{ p: 1.5, mb: 3, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Title */}
            <Typography variant="h6" component="h1" sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold', 
              fontSize: '1rem'
            }}>
              Lịch học, lịch thi theo tuần
            </Typography>
            
            {/* Date and Radio buttons - Right side */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 'auto' }}>
              {/* Radio buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RadioGroup
                  row
                  value={scheduleType}
                  onChange={handleScheduleTypeChange}
                >
                  <FormControlLabel 
                    value="all" 
                    control={<Radio size="small" />} 
                    label="Tất cả" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        fontSize: '0.75rem',
                        ml: 0.5
                      }
                    }}
                  />
                  <FormControlLabel 
                    value="study" 
                    control={<Radio size="small" />} 
                    label="Lịch học" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        fontSize: '0.75rem',
                        ml: 0.5
                      }
                    }}
                  />
                  <FormControlLabel 
                    value="exam" 
                    control={<Radio size="small" />} 
                    label="Lịch thi" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        fontSize: '0.75rem',
                        ml: 0.5
                      }
                    }}
                  />
                </RadioGroup>
              </Box>
              
              {/* Date and Navigation */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <DatePicker
                  label="Chọn ngày"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      sx: { 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          height: '40px'
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.75rem'
                        }
                      }
                    } 
                  }}
                />
                
                 <Button
                   variant="outlined"
                   onClick={handleCurrentWeek}
                   size="small"
                   sx={{ 
                     borderRadius: '4px',
                     fontSize: '0.75rem',
                     textTransform: 'none',
                     px: 1.2,
                     py: 0.6,
                     height: '40px',
                     minWidth: '80px'
                   }}
                 >
                   Hiện tại
                 </Button>
                 
                 <Button
                   variant="outlined"
                   startIcon={<PrintIcon sx={{ fontSize: '0.75rem' }} />}
                   onClick={handlePrint}
                   size="small"
                   sx={{ 
                     borderRadius: '4px',
                     fontSize: '0.75rem',
                     textTransform: 'none',
                     px: 1.2,
                     py: 0.6,
                     height: '40px',
                     minWidth: '80px'
                   }}
                 >
                   In lịch
                 </Button>
                 
                 <Button
                   variant="outlined"
                   onClick={handlePreviousWeek}
                   size="small"
                   startIcon={<ArrowBackIcon sx={{ fontSize: '0.75rem' }} />}
                   sx={{ 
                     borderRadius: '4px',
                     fontSize: '0.75rem',
                     textTransform: 'none',
                     px: 1.2,
                     py: 0.6,
                     height: '40px',
                     minWidth: '80px'
                   }}
                 >
                   Trở về
                 </Button>
                 
                 <Button
                   variant="outlined"
                   onClick={handleNextWeek}
                   size="small"
                   endIcon={<ArrowForwardIcon sx={{ fontSize: '0.75rem' }} />}
                   sx={{ 
                     borderRadius: '4px',
                     fontSize: '0.75rem',
                     textTransform: 'none',
                     px: 1.2,
                     py: 0.6,
                     height: '40px',
                     minWidth: '80px'
                   }}
                 >
                   Tiếp
                 </Button>
                 
                 <IconButton 
                   color="primary"
                   size="small"
                   sx={{ 
                     borderRadius: '4px',
                     border: '1px solid #1976d2',
                     height: '40px',
                     width: '40px',
                     '&:hover': {
                       backgroundColor: 'rgba(25, 118, 210, 0.04)'
                     }
                   }}
                 >
                   <FullscreenIcon sx={{ fontSize: '0.75rem' }} />
                 </IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Schedule Grid */}
        <Paper sx={{ boxShadow: 3, position: 'relative', minHeight: '400px' }}>
          {/* Loading overlay for schedule data */}
          {scheduleLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                borderRadius: '4px',
                backdropFilter: 'blur(2px)'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={32} thickness={4} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Đang tải lịch học...
                </Typography>
              </Box>
            </Box>
          )}
          
          <TableContainer sx={{ overflow: 'auto', minWidth: '800px' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#e3f2fd', 
                      textAlign: 'center',
                      minWidth: '120px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      border: '1px solid #ddd'
                    }}
                  >
                    Ca học
                  </TableCell>
                  {memoizedCurrentWeek.map((day, index) => (
                    <TableCell 
                      key={index} 
                      sx={{ 
                        backgroundColor: '#1976d2', 
                        color: 'white',
                        textAlign: 'center',
                        minWidth: '150px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        border: '1px solid #ddd'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {day.dayName}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
                          {day.dayNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduleGrid.map((shift, shiftIndex) => (
                  <TableRow key={shift.key}>
                    <TableCell 
                      sx={{ 
                        backgroundColor: shift.color, 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        border: '1px solid #ddd'
                      }}
                    >
                      {shift.name}
                    </TableCell>
                    {shift.schedules.map((daySchedules, dayIndex) => (
                      <TableCell 
                        key={dayIndex} 
                        sx={{ 
                          padding: '8px', 
                          verticalAlign: 'top',
                          minHeight: '120px',
                          border: '1px solid #ddd'
                        }}
                      >
                        {daySchedules.map((schedule: WeeklyScheduleItem) => (
                          <ScheduleCard 
                            key={schedule.id} 
                            schedule={schedule}
                            getScheduleColor={getScheduleColor}
                          />
                        ))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Legend */}
        <Paper sx={{ p: 2, mt: 3, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Chú thích:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#f8f9fa', border: '1px solid #ddd' }} />
              <Typography variant="body2">Lịch học lý thuyết</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#d4edda', border: '1px solid #ddd' }} />
              <Typography variant="body2">Lịch học thực hành</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#cce7ff', border: '1px solid #ddd' }} />
              <Typography variant="body2">Lịch học trực tuyến</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#fff3cd', border: '1px solid #ddd' }} />
              <Typography variant="body2">Lịch thi</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#f8d7da', border: '2px solid #ff6b6b' }} />
              <Typography variant="body2">Lịch tạm ngưng</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#d1ecf1', border: '1px solid #ddd' }} />
              <Typography variant="body2">Lịch chuyển</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
            <strong>Lưu ý:</strong> Các lịch có nhãn màu trên góc phải là lịch ngoại lệ (tạm ngưng, thi, chuyển lịch)
          </Typography>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default WeeklySchedule;
