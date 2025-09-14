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
  TableRow
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


// Mock schedule data dựa trên sample_data.sql - Sắp xếp theo thứ tự tiết học logic
const mockSchedules = [
  // THỨ 2 - CA SÁNG (1-6)
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
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 1
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
    dayOfWeek: 2, // Thứ 2
    timeSlot: 'Tiết 4-6',
    timeRange: '09:10-11:40',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 2
  },
  // THỨ 2 - CA CHIỀU (7-12)
  {
    id: 3,
    classId: 4,
    className: 'Cơ học kỹ thuật',
    classCode: 'MECH101',
    subjectCode: 'CHKT',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 3,
    roomName: 'H2.1 - Phòng lý thuyết H2.1',
    dayOfWeek: 2, // Thứ 2
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 3
  },
  {
    id: 4,
    classId: 5,
    className: 'Thực hành CNC',
    classCode: 'MECH102',
    subjectCode: 'THCNC',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 4,
    roomName: 'H3.1 - Phòng thực hành H3.1',
    dayOfWeek: 2, // Thứ 2
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 4
  },
  // THỨ 3 - CA SÁNG (1-6)
  {
    id: 5,
    classId: 6,
    className: 'Điện tử cơ bản',
    classCode: 'ELEC101',
    subjectCode: 'DTCB',
    teacherId: 4,
    teacherName: 'Phạm Thị Mai',
    roomId: 5,
    roomName: 'A1.1 - Phòng lý thuyết A1.1',
    dayOfWeek: 3, // Thứ 3
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 1
  },
  {
    id: 6,
    classId: 7,
    className: 'Kế toán tài chính',
    classCode: 'BUS101',
    subjectCode: 'KTTN',
    teacherId: 5,
    teacherName: 'Hoàng Văn Đức',
    roomId: 6,
    roomName: 'A2.1 - Phòng lý thuyết A2.1',
    dayOfWeek: 3, // Thứ 3
    timeSlot: 'Tiết 4-6',
    timeRange: '09:10-11:40',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 2
  },
  // THỨ 3 - CA CHIỀU (7-12)
  {
    id: 7,
    classId: 1,
    className: 'Lập trình cơ bản',
    classCode: 'COMP101',
    subjectCode: 'NMLT',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 1,
    roomName: 'H1.1 - Phòng lý thuyết H1.1',
    dayOfWeek: 3, // Thứ 3
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 3
  },
  {
    id: 8,
    classId: 2,
    className: 'Cơ sở dữ liệu',
    classCode: 'COMP102',
    subjectCode: 'CSDL',
    teacherId: 2,
    teacherName: 'Trần Thị Lan',
    roomId: 2,
    roomName: 'H1.2 - Phòng lý thuyết H1.2',
    dayOfWeek: 3, // Thứ 3
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 4
  },
  // THỨ 4 - CA SÁNG (1-6)
  {
    id: 9,
    classId: 3,
    className: 'Lập trình Web',
    classCode: 'COMP103',
    subjectCode: 'LTW',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 3,
    roomName: 'H2.1 - Phòng lý thuyết H2.1',
    dayOfWeek: 4, // Thứ 4
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 1
  },
  {
    id: 10,
    classId: 4,
    className: 'Cơ học kỹ thuật',
    classCode: 'MECH101',
    subjectCode: 'CHKT',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 4,
    roomName: 'H3.1 - Phòng thực hành H3.1',
    dayOfWeek: 4, // Thứ 4
    timeSlot: 'Tiết 4-6',
    timeRange: '09:10-11:40',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 2
  },
  // THỨ 4 - CA CHIỀU (7-12)
  {
    id: 11,
    classId: 5,
    className: 'Thực hành CNC',
    classCode: 'MECH102',
    subjectCode: 'THCNC',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 5,
    roomName: 'A1.1 - Phòng lý thuyết A1.1',
    dayOfWeek: 4, // Thứ 4
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 3
  },
  {
    id: 12,
    classId: 6,
    className: 'Điện tử cơ bản',
    classCode: 'ELEC101',
    subjectCode: 'DTCB',
    teacherId: 4,
    teacherName: 'Phạm Thị Mai',
    roomId: 6,
    roomName: 'A2.1 - Phòng lý thuyết A2.1',
    dayOfWeek: 4, // Thứ 4
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 4
  },
  // THỨ 5 - CA SÁNG (1-6)
  {
    id: 13,
    classId: 7,
    className: 'Kế toán tài chính',
    classCode: 'BUS101',
    subjectCode: 'KTTN',
    teacherId: 5,
    teacherName: 'Hoàng Văn Đức',
    roomId: 1,
    roomName: 'H1.1 - Phòng lý thuyết H1.1',
    dayOfWeek: 5, // Thứ 5
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 1
  },
  {
    id: 14,
    classId: 1,
    className: 'Lập trình cơ bản',
    classCode: 'COMP101',
    subjectCode: 'NMLT',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 2,
    roomName: 'H1.2 - Phòng lý thuyết H1.2',
    dayOfWeek: 5, // Thứ 5
    timeSlot: 'Tiết 4-6',
    timeRange: '09:10-11:40',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 2
  },
  // THỨ 5 - CA CHIỀU (7-12)
  {
    id: 15,
    classId: 2,
    className: 'Cơ sở dữ liệu',
    classCode: 'COMP102',
    subjectCode: 'CSDL',
    teacherId: 2,
    teacherName: 'Trần Thị Lan',
    roomId: 3,
    roomName: 'H2.1 - Phòng lý thuyết H2.1',
    dayOfWeek: 5, // Thứ 5
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 3
  },
  {
    id: 16,
    classId: 3,
    className: 'Lập trình Web',
    classCode: 'COMP103',
    subjectCode: 'LTW',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 4,
    roomName: 'H3.1 - Phòng thực hành H3.1',
    dayOfWeek: 5, // Thứ 5
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 4
  },
  // THỨ 6 - CA SÁNG (1-6)
  {
    id: 17,
    classId: 4,
    className: 'Cơ học kỹ thuật',
    classCode: 'MECH101',
    subjectCode: 'CHKT',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 5,
    roomName: 'A1.1 - Phòng lý thuyết A1.1',
    dayOfWeek: 6, // Thứ 6
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 1
  },
  {
    id: 18,
    classId: 5,
    className: 'Thực hành CNC',
    classCode: 'MECH102',
    subjectCode: 'THCNC',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 6,
    roomName: 'A2.1 - Phòng lý thuyết A2.1',
    dayOfWeek: 6, // Thứ 6
    timeSlot: 'Tiết 4-6',
    timeRange: '09:10-11:40',
    shift: 'morning',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 2
  },
  // THỨ 6 - CA CHIỀU (7-12)
  {
    id: 19,
    classId: 6,
    className: 'Điện tử cơ bản',
    classCode: 'ELEC101',
    subjectCode: 'DTCB',
    teacherId: 4,
    teacherName: 'Phạm Thị Mai',
    roomId: 1,
    roomName: 'H1.1 - Phòng lý thuyết H1.1',
    dayOfWeek: 6, // Thứ 6
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 3
  },
  {
    id: 20,
    classId: 7,
    className: 'Kế toán tài chính',
    classCode: 'BUS101',
    subjectCode: 'KTTN',
    teacherId: 5,
    teacherName: 'Hoàng Văn Đức',
    roomId: 2,
    roomName: 'H1.2 - Phòng lý thuyết H1.2',
    dayOfWeek: 6, // Thứ 6
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 4
  },
  // THỨ 7 - CA SÁNG (1-6)
  {
    id: 21,
    classId: 1,
    className: 'Lập trình cơ bản',
    classCode: 'COMP101',
    subjectCode: 'NMLT',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 3,
    roomName: 'H2.1 - Phòng lý thuyết H2.1',
    dayOfWeek: 7, // Thứ 7
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 1
  },
  {
    id: 22,
    classId: 2,
    className: 'Cơ sở dữ liệu',
    classCode: 'COMP102',
    subjectCode: 'CSDL',
    teacherId: 2,
    teacherName: 'Trần Thị Lan',
    roomId: 4,
    roomName: 'H3.1 - Phòng thực hành H3.1',
    dayOfWeek: 7, // Thứ 7
    timeSlot: 'Tiết 4-6',
    timeRange: '09:10-11:40',
    shift: 'morning',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 2
  },
  // THỨ 7 - CA CHIỀU (7-12)
  {
    id: 23,
    classId: 3,
    className: 'Lập trình Web',
    classCode: 'COMP103',
    subjectCode: 'LTW',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 5,
    roomName: 'A1.1 - Phòng lý thuyết A1.1',
    dayOfWeek: 7, // Thứ 7
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 3
  },
  {
    id: 24,
    classId: 4,
    className: 'Cơ học kỹ thuật',
    classCode: 'MECH101',
    subjectCode: 'CHKT',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 6,
    roomName: 'A2.1 - Phòng lý thuyết A2.1',
    dayOfWeek: 7, // Thứ 7
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 4
  },
  // CHỦ NHẬT - CA SÁNG (1-6)
  {
    id: 25,
    classId: 5,
    className: 'Thực hành CNC',
    classCode: 'MECH102',
    subjectCode: 'THCNC',
    teacherId: 3,
    teacherName: 'Lê Văn Hùng',
    roomId: 1,
    roomName: 'H1.1 - Phòng lý thuyết H1.1',
    dayOfWeek: 8, // Chủ nhật
    timeSlot: 'Tiết 1-3',
    timeRange: '06:30-09:00',
    shift: 'morning',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 1
  },
  {
    id: 26,
    classId: 6,
    className: 'Điện tử cơ bản',
    classCode: 'ELEC101',
    subjectCode: 'DTCB',
    teacherId: 4,
    teacherName: 'Phạm Thị Mai',
    roomId: 2,
    roomName: 'H1.2 - Phòng lý thuyết H1.2',
    dayOfWeek: 8, // Chủ nhật
    timeSlot: 'Tiết 4-6',
    timeRange: '09:10-11:40',
    shift: 'morning',
    type: 'theory',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 2
  },
  // CHỦ NHẬT - CA CHIỀU (7-12)
  {
    id: 27,
    classId: 7,
    className: 'Kế toán tài chính',
    classCode: 'BUS101',
    subjectCode: 'KTTN',
    teacherId: 5,
    teacherName: 'Hoàng Văn Đức',
    roomId: 3,
    roomName: 'H2.1 - Phòng lý thuyết H2.1',
    dayOfWeek: 8, // Chủ nhật
    timeSlot: 'Tiết 7-9',
    timeRange: '12:30-15:00',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 3
  },
  {
    id: 28,
    classId: 1,
    className: 'Lập trình cơ bản',
    classCode: 'COMP101',
    subjectCode: 'NMLT',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Minh',
    roomId: 4,
    roomName: 'H3.1 - Phòng thực hành H3.1',
    dayOfWeek: 8, // Chủ nhật
    timeSlot: 'Tiết 10-12',
    timeRange: '15:10-17:40',
    shift: 'afternoon',
    type: 'practice',
    status: 'assigned',
    weekPattern: 'weekly',
    startWeek: 1,
    endWeek: 15,
    timeSlotOrder: 4
  }
];

const WeeklySchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [scheduleType, setScheduleType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

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

  // Filter schedules dựa trên các điều kiện
  const filteredSchedules = useMemo(() => {
    let filtered = mockSchedules;

    // Filter theo loại lịch
    if (scheduleType === 'study') {
      filtered = filtered.filter(s => s.type === 'theory' || s.type === 'practice');
    } else if (scheduleType === 'exam') {
      filtered = filtered.filter(s => s.type === 'exam');
    }

    // Filter theo khoa
    if (selectedDepartment) {
      const departmentId = parseInt(selectedDepartment);
      filtered = filtered.filter(s => {
        const classInfo = mockClasses.find(c => c.id === s.classId);
        return classInfo?.departmentId === departmentId;
      });
    }

    // Filter theo lớp
    if (selectedClass) {
      const classId = parseInt(selectedClass);
      filtered = filtered.filter(s => s.classId === classId);
    }

    // Filter theo giảng viên
    if (selectedTeacher) {
      const teacherId = parseInt(selectedTeacher);
      filtered = filtered.filter(s => s.teacherId === teacherId);
    }

    return filtered;
  }, [scheduleType, selectedDepartment, selectedClass, selectedTeacher]);

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

  const getScheduleColor = (type: string) => {
    switch (type) {
      case 'theory': return '#f8f9fa'; // Light grey
      case 'practice': return '#d4edda'; // Green
      case 'online': return '#cce7ff'; // Light blue
      case 'exam': return '#fff3cd'; // Yellow
      case 'cancelled': return '#f8d7da'; // Red
      default: return '#f8f9fa';
    }
  };


  const handlePreviousWeek = () => {
    setSelectedDate(prev => prev.subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setSelectedDate(prev => prev.add(1, 'week'));
  };

  const handleCurrentWeek = () => {
    setSelectedDate(dayjs());
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* Filters Row */}
        <Paper sx={{ p: 1.5, mb: 1, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Theo khoa</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
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
                {mockDepartments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id} sx={{ fontSize: '0.75rem' }}>
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
                {mockClasses.map(cls => (
                  <MenuItem key={cls.id} value={cls.id} sx={{ fontSize: '0.75rem' }}>
                    {cls.className}
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
                {mockTeachers.map(teacher => (
                  <MenuItem key={teacher.id} value={teacher.id} sx={{ fontSize: '0.75rem' }}>
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
                  onChange={(newValue) => newValue && setSelectedDate(newValue)}
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
        <Paper sx={{ boxShadow: 3 }}>
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
                  {currentWeek.map((day, index) => (
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
                        {daySchedules.map((schedule) => (
                          <Card 
                            key={schedule.id} 
                            sx={{ 
                              mb: 1, 
                              backgroundColor: getScheduleColor(schedule.type),
                              border: '1px solid #ddd',
                              '&:last-child': { mb: 0 }
                            }}
                          >
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
                            </CardContent>
                          </Card>
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
              <Box sx={{ width: 20, height: 20, backgroundColor: '#f8d7da', border: '1px solid #ddd' }} />
              <Typography variant="body2">Lịch tạm ngưng</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default WeeklySchedule;
