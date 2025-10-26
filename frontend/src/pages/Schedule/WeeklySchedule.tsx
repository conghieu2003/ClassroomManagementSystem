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
  fetchTeachers,
  selectWeeklyScheduleLoading
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
  // Exception data
  exceptionDate?: string | null;
  exceptionType?: string | null;
  exceptionReason?: string | null;
  exceptionStatus?: string | null;
  requestTypeId?: number | null;
}

// Function để lấy tên RequestType từ ID
const getRequestTypeName = (requestTypeId: number) => {
  switch (requestTypeId) {
    case 1: return 'Chờ phân phòng';
    case 2: return 'Đã phân phòng';
    case 3: return 'Đang hoạt động';
    case 4: return 'Đã hủy';
    case 5: return 'Tạm ngưng';
    case 6: return 'Thi';
    case 7: return 'Đổi phòng';
    case 8: return 'Đổi lịch';
    case 9: return 'Đổi giáo viên';
    default: return 'Ngoại lệ';
  }
};

// Function để tính toán tuần hiện tại
const getCurrentWeek = (selectedDate: Dayjs) => {
  const dayOfWeek = selectedDate.day(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
  let startOfWeek;
  
  // Tính ngày bắt đầu tuần (Thứ 2)
  if (dayOfWeek === 0) { // Chủ nhật
    startOfWeek = selectedDate.subtract(6, 'day'); // Lùi 6 ngày để đến Thứ 2
  } else {
    startOfWeek = selectedDate.subtract(dayOfWeek - 1, 'day'); // Lùi để đến Thứ 2
  }
  
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = startOfWeek.add(i, 'day');
    weekDays.push({
      dayOfWeek: i === 6 ? 1 : i + 2, // 2=Thứ 2, 3=Thứ 3, ..., 7=Thứ 7, 1=Chủ nhật
      date: day,
      dayName: dayNames[i],
      dayNumber: day.format('DD/MM/YYYY')
    });
  }
  return weekDays;
};

// Component tĩnh cho table header - không re-render
const ScheduleTableHeader = memo(({ selectedDate, headerRef }: { selectedDate: Dayjs, headerRef: React.RefObject<HTMLTableSectionElement> }) => {
  const currentWeek = useMemo(() => {
    const dayOfWeek = selectedDate.day(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    let startOfWeek;
    
    // Tính ngày bắt đầu tuần (Thứ 2)
    if (dayOfWeek === 0) { // Chủ nhật
      startOfWeek = selectedDate.subtract(6, 'day'); // Lùi 6 ngày để đến Thứ 2
    } else {
      startOfWeek = selectedDate.subtract(dayOfWeek - 1, 'day'); // Lùi để đến Thứ 2
    }
    
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      weekDays.push({
        dayOfWeek: i === 6 ? 1 : i + 2, // 2=Thứ 2, 3=Thứ 3, ..., 7=Thứ 7, 1=Chủ nhật
        date: day,
        dayName: dayNames[i],
        dayNumber: day.format('DD/MM/YYYY')
      });
    }
    return weekDays;
  }, [selectedDate]);

  return (
    <TableHead ref={headerRef}>
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
        {currentWeek.map((day, index) => (
          <TableCell 
            key={`${day.dayNumber}-${index}`} 
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
  );
});

ScheduleTableHeader.displayName = 'ScheduleTableHeader';

const ScheduleTableBody = memo(({ 
  scheduleGrid, 
  getScheduleColor,
  selectedDate
}: { 
  scheduleGrid: any[], 
  getScheduleColor: (schedule: WeeklyScheduleItem) => string,
  selectedDate: Dayjs
}) => {
  // Memoize schedule color function để tránh re-render
  const memoizedGetScheduleColor = useCallback(getScheduleColor, [getScheduleColor]);
  
  return (
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
          {shift.schedules.map((daySchedules: WeeklyScheduleItem[], dayIndex: number) => (
            <TableCell 
              key={dayIndex} 
              sx={{ 
                padding: '8px', 
                verticalAlign: 'top',
                minHeight: '120px',
                border: '1px solid #ddd'
              }}
            >
              {daySchedules.map((schedule: WeeklyScheduleItem) => {
                
                return (
                <Card 
                  key={schedule.id} 
                  sx={{ 
                    mb: 1, 
                    backgroundColor: memoizedGetScheduleColor(schedule),
                    border: '1px solid #ddd',
                    position: 'relative',
                    '&:last-child': { mb: 0 }
                  }}
                >
                  {/* Exception label overlay - chỉ hiển thị khi ngày ngoại lệ khớp với ngày của schedule */}
                  {(() => {
                    // Kiểm tra xem có ngoại lệ và ngày ngoại lệ có khớp với ngày hiện tại không
                    if (!schedule.exceptionDate || !schedule.requestTypeId) {
                      if (schedule.id === 1) {
                        console.log('🔍 [DEBUG] Schedule 1 no exception data:', {
                          id: schedule.id,
                          exceptionDate: schedule.exceptionDate,
                          requestTypeId: schedule.requestTypeId
                        });
                      }
                      return null;
                    }
                    
                    const exceptionDate = new Date(schedule.exceptionDate);
                    const exceptionDateStr = exceptionDate.toISOString().split('T')[0]; // YYYY-MM-DD
                    
                    // Lấy ngày hiện tại của schedule từ currentWeek
                    const currentWeek = getCurrentWeek(selectedDate);
                    const scheduleDay = currentWeek.find(day => day.dayOfWeek === schedule.dayOfWeek);
                    if (!scheduleDay) return null;
                    
                    const scheduleDateStr = scheduleDay.date.format('YYYY-MM-DD');
                    
                    // Chỉ hiển thị nhãn khi ngày ngoại lệ khớp với ngày của schedule
                    const shouldShowLabel = exceptionDateStr === scheduleDateStr;
                    
                    if (schedule.id === 1) {
                      console.log('🔍 [DEBUG] Exception label check:', {
                        scheduleId: schedule.id,
                        scheduleDayOfWeek: schedule.dayOfWeek,
                        exceptionDate: exceptionDateStr,
                        scheduleDate: scheduleDateStr,
                        shouldShowLabel: shouldShowLabel,
                        selectedDate: selectedDate.format('YYYY-MM-DD'),
                        currentWeek: currentWeek.map(day => ({ dayOfWeek: day.dayOfWeek, date: day.date.format('YYYY-MM-DD') })),
                        exceptionDateRaw: schedule.exceptionDate,
                        requestTypeId: schedule.requestTypeId
                      });
                    }
                    
                    if (schedule.id === 1) {
                      console.log('🔍 [DEBUG] Schedule 1 exception label decision:', {
                        id: schedule.id,
                        shouldShowLabel: shouldShowLabel,
                        requestTypeId: schedule.requestTypeId,
                        requestTypeName: getRequestTypeName(schedule.requestTypeId)
                      });
                    }
                    
                    return shouldShowLabel ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontSize: '0.6rem',
                          padding: '2px 4px',
                          borderRadius: '0 4px 0 4px',
                          fontWeight: 'bold',
                          zIndex: 1
                        }}
                      >
                        {getRequestTypeName(schedule.requestTypeId)}
                      </Box>
                    ) : null;
                  })()}
                  
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                      {schedule.className}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      {schedule.classCode} - {schedule.subjectCode}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      Tiết: {schedule.timeSlot}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      Phòng: {schedule.roomName}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      GV: {schedule.teacherName}
                    </Typography>
                    {schedule.practiceGroup && (
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        Nhóm: {schedule.practiceGroup}
                      </Typography>
                    )}
                    {schedule.exceptionReason && (
                      <Typography variant="caption" sx={{ 
                        display: 'block', 
                        fontSize: '0.65rem',
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        mt: 0.5
                      }}>
                        Lý do: {schedule.exceptionReason}
                      </Typography>
                    )}
                    {schedule.id === 1 && (
                      <Typography variant="caption" sx={{ 
                        display: 'block', 
                        fontSize: '0.6rem',
                        color: 'red',
                        mt: 0.5
                      }}>
                     </Typography>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
});

ScheduleTableBody.displayName = 'ScheduleTableBody';

const WeeklySchedule = memo(() => {
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
  
  // Get user role from auth state
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  // Sử dụng selector riêng cho weekly schedule loading
  const weeklyScheduleLoading = useSelector(selectWeeklyScheduleLoading);
  
  // Local loading state để control minimum loading time
  const [localLoading, setLocalLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local state
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [scheduleType, setScheduleType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  // Ref để tránh re-render không cần thiết
  const headerRef = useRef<HTMLTableSectionElement>(null);

  // Load initial data only once and only for admin
  useEffect(() => {
    // Chỉ fetch data nếu là admin và chưa có data
    if (isAdmin) {
      if (departments.length === 0) {
        dispatch(fetchDepartments());
      }
      if (classes.length === 0) {
        dispatch(fetchClasses());
      }
      if (teachers.length === 0) {
        dispatch(fetchTeachers());
      }
    }
  }, [dispatch, departments.length, classes.length, teachers.length, isAdmin]);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load weekly schedule when filters change with debouncing
  const loadWeeklySchedule = useCallback(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Show loading immediately
    setLocalLoading(true);
    
    // Debounce API call để tránh gọi quá nhiều lần
    debounceTimerRef.current = setTimeout(() => {
      const dayOfWeek = selectedDate.day(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
      let startOfWeek;
      
      if (dayOfWeek === 0) { 
        startOfWeek = selectedDate.subtract(6, 'day');
      } else {
        startOfWeek = selectedDate.subtract(dayOfWeek - 1, 'day'); 
      }
      
      const weekStartDate = startOfWeek.format('YYYY-MM-DD'); 
      const filters = isAdmin ? {
        departmentId: selectedDepartment ? parseInt(selectedDepartment) : undefined,
        classId: selectedClass ? parseInt(selectedClass) : undefined,
        teacherId: selectedTeacher ? parseInt(selectedTeacher) : undefined
      } : {};
      
      console.log('🔍 [DEBUG] Loading weekly schedule:', { weekStartDate, filters, isAdmin });
      dispatch(fetchWeeklySchedule({ weekStartDate, filters }));
    }, 100); // Debounce 100ms
  }, [dispatch, selectedDate, selectedDepartment, selectedClass, selectedTeacher, isAdmin]);

  useEffect(() => {
    loadWeeklySchedule();
  }, [loadWeeklySchedule]);

  // Effect để quản lý loading state với minimum time
  useEffect(() => {
    if (weeklyScheduleLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    } else if (localLoading) {
      // API call completed, but ensure minimum loading time
      loadingTimeoutRef.current = setTimeout(() => {
        setLocalLoading(false);
      }, 200); // Minimum 200ms loading time
    }
  }, [weeklyScheduleLoading, localLoading]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Filter schedules dựa trên các điều kiện
  const filteredSchedules = useMemo(() => {
    if (!weeklySchedules || weeklySchedules.length === 0) {
      console.log('🔍 [DEBUG] No weekly schedules to filter');
      return [];
    }

    console.log('🔍 [DEBUG] Filtering schedules:', {
      total: weeklySchedules.length,
      scheduleType,
      schedules: weeklySchedules.map(s => ({
        id: s.id,
        className: s.className,
        dayOfWeek: s.dayOfWeek,
        timeSlot: s.timeSlot,
        roomName: s.roomName,
        statusId: s.statusId,
        type: s.type
      }))
    });

    // Filter theo loại lịch
    if (scheduleType === 'study') {
      const filtered = weeklySchedules.filter(s => s.type === 'theory' || s.type === 'practice');
      console.log('🔍 [DEBUG] Study schedules filtered:', filtered.length);
      return filtered;
    } else if (scheduleType === 'exam') {
      const filtered = weeklySchedules.filter(s => s.type === 'exam');
      console.log('🔍 [DEBUG] Exam schedules filtered:', filtered.length);
      return filtered;
    }

    console.log('🔍 [DEBUG] All schedules (no filter):', weeklySchedules.length);
    return weeklySchedules;
  }, [weeklySchedules, scheduleType]);

  // Tạo lưới lịch học - chỉ phụ thuộc vào filteredSchedules, không phụ thuộc vào currentWeek
  const scheduleGrid = useMemo(() => {
    const shifts = [
      { key: 'morning', name: 'Sáng', color: '#fff3cd' },
      { key: 'afternoon', name: 'Chiều', color: '#d1ecf1' },
      { key: 'evening', name: 'Tối', color: '#f8d7da' }
    ];

    const grid = shifts.map(shift => {
      // Tạo 7 ngày cố định (Thứ 2 đến Chủ nhật)
      const shiftSchedules = Array.from({ length: 7 }, (_, i) => {
        // Map từ index 0-6 thành dayOfWeek 2-8, nhưng Chủ nhật (index 6) = dayOfWeek 1
        const dayOfWeek = i === 6 ? 1 : i + 2; // 2=Thứ 2, 3=Thứ 3, ..., 7=Thứ 7, 1=Chủ nhật
        const daySchedules = filteredSchedules.filter(schedule => 
          schedule.dayOfWeek === dayOfWeek && schedule.shift === shift.key
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

    console.log('🔍 [DEBUG] Schedule grid created:', {
      shifts: grid.length,
      totalSchedules: grid.reduce((sum, shift) => sum + shift.schedules.reduce((s, day) => s + day.length, 0), 0)
    });

    return grid;
  }, [filteredSchedules]); // Chỉ phụ thuộc vào filteredSchedules

  // Function để lấy màu sắc dựa trên RequestType ID
  const getRequestTypeColor = (requestTypeId: number): string => {
    switch (requestTypeId) {
      case 1: return '#e3f2fd'; // Light blue - Chờ phân phòng
      case 2: return '#f3e5f5'; // Light purple - Đã phân phòng
      case 3: return '#e8f5e8'; // Light green - Đang hoạt động
      case 4: return '#f8d7da'; // Red - Đã hủy
      case 5: return '#f8d7da'; // Red - Tạm ngưng
      case 6: return '#fff3cd'; // Yellow - Thi
      case 7: return '#ffeaa7'; // Light orange - Đổi phòng
      case 8: return '#d1ecf1'; // Light cyan - Đổi lịch
      case 9: return '#a8e6cf'; // Light green - Đổi giáo viên
      default: return '#f8f9fa'; // Default light grey
    }
  };

  const getScheduleColor = (schedule: WeeklyScheduleItem) => {
    // Kiểm tra ngoại lệ trước - sử dụng requestTypeId nếu có
    if (schedule.exceptionDate && schedule.requestTypeId) {
      return getRequestTypeColor(schedule.requestTypeId);
    }
    
    // Nếu không có ngoại lệ, dùng màu theo loại lớp
    switch (schedule.type) {
      case 'theory': return '#f8f9fa'; // Light grey
      case 'practice': return '#d4edda'; // Green
      case 'online': return '#cce7ff'; // Light blue
      default: return '#f8f9fa';
    }
  };

  const handlePreviousWeek = useCallback(() => {
    if (!weeklyScheduleLoading && !localLoading) {
      setSelectedDate(prev => prev.subtract(1, 'week'));
    }
  }, [weeklyScheduleLoading, localLoading]);

  const handleNextWeek = useCallback(() => {
    if (!weeklyScheduleLoading && !localLoading) {
      setSelectedDate(prev => prev.add(1, 'week'));
    }
  }, [weeklyScheduleLoading, localLoading]);

  const handleCurrentWeek = useCallback(() => {
    if (!weeklyScheduleLoading && !localLoading) {
      setSelectedDate(dayjs());
    }
  }, [weeklyScheduleLoading, localLoading]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Filter classes based on selected department - only for admin
  const filteredClassesForDropdown = useMemo(() => {
    if (!isAdmin || !selectedDepartment || !classes || classes.length === 0) return [];
    
    const selectedDept = departments?.find(d => d.id.toString() === selectedDepartment);
    if (!selectedDept) return [];
    
    return classes.filter(cls => cls.departmentId === selectedDept.id);
  }, [isAdmin, classes, departments, selectedDepartment]);

  // Filter teachers based on selected department - only for admin
  const filteredTeachersForDropdown = useMemo(() => {
    if (!isAdmin || !selectedDepartment || !teachers || teachers.length === 0) return [];
    
    return teachers.filter(teacher => 
      teacher.departmentId && teacher.departmentId.toString() === selectedDepartment
    );
  }, [isAdmin, teachers, selectedDepartment]);

  // Chỉ hiển thị loading toàn màn hình khi load initial data (departments, classes, teachers)
  // và chỉ khi là admin và chưa có data nào
  if (isAdmin && loading && departments.length === 0 && classes.length === 0 && teachers.length === 0) {
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

        {/* Filters Row - Only show for admin */}
        {isAdmin && (
          <Paper sx={{ p: 1.5, mb: 1, boxShadow: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Theo khoa</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedClass('');
                    setSelectedTeacher('');
                  }}
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
                  {departments.map(dept => (
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
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                  {filteredClassesForDropdown.map((cls) => (
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
                  onChange={(e) => setSelectedTeacher(e.target.value)}
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
        )}

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
                  onChange={(e) => setScheduleType(e.target.value)}
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
                  onChange={(newValue) => {
                    if (newValue && !weeklyScheduleLoading) {
                      setSelectedDate(newValue);
                    }
                  }}
                  disabled={weeklyScheduleLoading}
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
                   disabled={weeklyScheduleLoading || localLoading}
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
                   disabled={weeklyScheduleLoading || localLoading}
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
                   disabled={weeklyScheduleLoading || localLoading}
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
        <Paper sx={{ boxShadow: 3, position: 'relative' }}>
          {/* Loading overlay cho weekly schedule */}
          {(weeklyScheduleLoading || localLoading) && (
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
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Đang tải lịch học...
                </Typography>
              </Box>
            </Box>
          )}
          <TableContainer sx={{ overflow: 'auto', minWidth: '800px' }}>
            <Table sx={{ minWidth: '800px' }}>
              <ScheduleTableHeader selectedDate={selectedDate} headerRef={headerRef} />
              <ScheduleTableBody 
                scheduleGrid={scheduleGrid} 
                getScheduleColor={getScheduleColor}
                selectedDate={selectedDate}
              />
            </Table>
          </TableContainer>
        </Paper>

        {/* Legend */}
        <Paper sx={{ p: 2, mt: 3, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Chú thích:
          </Typography>
          
          {/* Loại lịch học */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
            Loại lịch học:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
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
          </Box>

          {/* Trạng thái ngoại lệ */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>
            Trạng thái ngoại lệ:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#e3f2fd', border: '1px solid #ddd' }} />
              <Typography variant="body2">Chờ phân phòng</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#f3e5f5', border: '1px solid #ddd' }} />
              <Typography variant="body2">Đã phân phòng</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#e8f5e8', border: '1px solid #ddd' }} />
              <Typography variant="body2">Đang hoạt động</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#f8d7da', border: '1px solid #ddd' }} />
              <Typography variant="body2">Đã hủy / Tạm ngưng</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#fff3cd', border: '1px solid #ddd' }} />
              <Typography variant="body2">Thi</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#ffeaa7', border: '1px solid #ddd' }} />
              <Typography variant="body2">Đổi phòng</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#d1ecf1', border: '1px solid #ddd' }} />
              <Typography variant="body2">Đổi lịch</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#a8e6cf', border: '1px solid #ddd' }} />
              <Typography variant="body2">Đổi giáo viên</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
});

WeeklySchedule.displayName = 'WeeklySchedule';

export default WeeklySchedule;
