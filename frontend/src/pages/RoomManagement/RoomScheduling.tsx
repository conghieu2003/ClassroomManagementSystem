import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Container,
  Chip,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  useGridApiRef
} from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Sample data for room scheduling - Classes that need room assignment
const sampleSchedules = [
  {
    id: 1,
    classId: 1,
    className: 'Lập trình cơ bản',
    subjectCode: 'NMLT',
    teacherId: 1,
    teacherName: 'Nguyễn Văn Giáo',
    roomId: null,
    roomName: null,
    timeSlotId: 1,
    timeSlot: 'Tiết 1-3 (07:00-09:30)',
    dayOfWeek: 3,
    dayName: 'Thứ 3',
    week: 1,
    semester: 'HK1-2024',
    status: 'pending' as const,
    capacity: 100,
    enrolledStudents: 85,
    utilization: 0
  },
  {
    id: 2,
    classId: 2,
    className: 'Cơ sở dữ liệu',
    subjectCode: 'CSDL',
    teacherId: 2,
    teacherName: 'Trần Thị Dạy',
    roomId: null,
    roomName: null,
    timeSlotId: 2,
    timeSlot: 'Tiết 4-6 (09:45-12:15)',
    dayOfWeek: 2,
    dayName: 'Thứ 2',
    week: 1,
    semester: 'HK1-2024',
    status: 'pending' as const,
    capacity: 150,
    enrolledStudents: 120,
    utilization: 0
  },
  {
    id: 3,
    classId: 3,
    className: 'Cấu trúc dữ liệu và giải thuật',
    subjectCode: 'CTDL',
    teacherId: 3,
    teacherName: 'Lê Thị Minh',
    roomId: null,
    roomName: null,
    timeSlotId: 3,
    timeSlot: 'Tiết 7-9 (13:00-15:30)',
    dayOfWeek: 4,
    dayName: 'Thứ 4',
    week: 1,
    semester: 'HK1-2024',
    status: 'pending' as const,
    capacity: 30,
    enrolledStudents: 25,
    utilization: 0
  },
  {
    id: 4,
    classId: 4,
    className: 'Lập trình Web',
    subjectCode: 'LTW',
    teacherId: 4,
    teacherName: 'Phạm Văn Học',
    roomId: null,
    roomName: null,
    timeSlotId: 4,
    timeSlot: 'Tiết 10-12 (15:45-18:15)',
    dayOfWeek: 6,
    dayName: 'Thứ 6',
    week: 1,
    semester: 'HK1-2024',
    status: 'pending' as const,
    capacity: 30,
    enrolledStudents: 28,
    utilization: 0
  },
  {
    id: 5,
    classId: 5,
    className: 'Lập trình hướng đối tượng',
    subjectCode: 'OOP',
    teacherId: 5,
    teacherName: 'Hoàng Thị Giảng',
    roomId: null,
    roomName: null,
    timeSlotId: 1,
    timeSlot: 'Tiết 1-3 (07:00-09:30)',
    dayOfWeek: 5,
    dayName: 'Thứ 5',
    week: 1,
    semester: 'HK1-2024',
    status: 'pending' as const,
    capacity: 120,
    enrolledStudents: 95,
    utilization: 0
  },
  {
    id: 6,
    classId: 6,
    className: 'Mạng máy tính',
    subjectCode: 'MMT',
    teacherId: 6,
    teacherName: 'Võ Thị Mạng',
    roomId: 1,
    roomName: 'LT101 - Phòng lý thuyết 101',
    timeSlotId: 2,
    timeSlot: 'Tiết 4-6 (09:45-12:15)',
    dayOfWeek: 3,
    dayName: 'Thứ 3',
    week: 1,
    semester: 'HK1-2024',
    status: 'scheduled' as const,
    capacity: 100,
    enrolledStudents: 80,
    utilization: 80
  },
  {
    id: 7,
    classId: 7,
    className: 'Hệ điều hành',
    subjectCode: 'HDH',
    teacherId: 7,
    teacherName: 'Đặng Văn Hệ',
    roomId: 2,
    roomName: 'LT201 - Phòng lý thuyết 201',
    timeSlotId: 3,
    timeSlot: 'Tiết 7-9 (13:00-15:30)',
    dayOfWeek: 4,
    dayName: 'Thứ 4',
    week: 1,
    semester: 'HK1-2024',
    status: 'scheduled' as const,
    capacity: 150,
    enrolledStudents: 120,
    utilization: 80
  }
];

const sampleRooms = [
  { id: 1, name: 'LT101 - Phòng lý thuyết 101', type: 'theory', capacity: 100, building: 'Tòa H', floor: 1 },
  { id: 2, name: 'LT201 - Phòng lý thuyết 201', type: 'theory', capacity: 150, building: 'Tòa H', floor: 2 },
  { id: 3, name: 'TH101 - Phòng thực hành 101', type: 'lab', capacity: 30, building: 'Tòa H', floor: 1 },
  { id: 4, name: 'TH102 - Phòng thực hành 102', type: 'lab', capacity: 30, building: 'Tòa H', floor: 1 },
  { id: 5, name: 'LT301 - Phòng lý thuyết 301', type: 'theory', capacity: 120, building: 'Tòa H', floor: 3 }
];

const sampleTimeSlots = [
  { id: 1, name: 'Tiết 1-3', time: '07:00-09:30', shift: 'morning' },
  { id: 2, name: 'Tiết 4-6', time: '09:45-12:15', shift: 'morning' },
  { id: 3, name: 'Tiết 7-9', time: '13:00-15:30', shift: 'afternoon' },
  { id: 4, name: 'Tiết 10-12', time: '15:45-18:15', shift: 'afternoon' },
  { id: 5, name: 'Tiết 13-15', time: '18:30-21:00', shift: 'evening' }
];

interface Schedule {
  id: number;
  classId: number;
  className: string;
  subjectCode: string;
  teacherId: number;
  teacherName: string;
  roomId: number | null;
  roomName: string | null;
  timeSlotId: number;
  timeSlot: string;
  dayOfWeek: number;
  dayName: string;
  week: number;
  semester: string;
  status: 'scheduled' | 'pending' | 'conflict';
  capacity: number;
  enrolledStudents: number;
  utilization: number;
}

const RoomScheduling = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rooms] = useState(sampleRooms);
  const [timeSlots] = useState(sampleTimeSlots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterWeek, setFilterWeek] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const dataGridRef = useGridApiRef();

  useEffect(() => {
    loadSchedules();
  }, [refreshKey]);

  const loadSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSchedules(sampleSchedules as Schedule[]);
    } catch (err) {
      setError('Không thể tải lịch sắp xếp phòng');
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedSchedule) {
      // Update the schedule in the state
      setSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule.id === selectedSchedule.id ? selectedSchedule : schedule
        )
      );
    }
    setEditDialogOpen(false);
    setSelectedSchedule(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'success';
      case 'pending': return 'warning';
      case 'conflict': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Đã sắp xếp';
      case 'pending': return 'Chưa sắp xếp';
      case 'conflict': return 'Xung đột';
      default: return status;
    }
  };


  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (filterWeek !== 'all' && schedule.week.toString() !== filterWeek) return false;
      if (filterDay !== 'all' && schedule.dayOfWeek.toString() !== filterDay) return false;
      if (filterStatus !== 'all' && schedule.status !== filterStatus) return false;
      return true;
    });
  }, [schedules, filterWeek, filterDay, filterStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = schedules.length;
    const scheduled = schedules.filter(s => s.status === 'scheduled' && s.roomId).length;
    const pending = schedules.filter(s => s.status === 'pending' || !s.roomId).length;
    const conflicts = schedules.filter(s => s.status === 'conflict').length;
    const scheduledSchedules = schedules.filter(s => s.roomId);
    const avgUtilization = scheduledSchedules.length > 0 
      ? Math.round(scheduledSchedules.reduce((sum, s) => sum + s.utilization, 0) / scheduledSchedules.length)
      : 0;

    return { total, scheduled, pending, conflicts, avgUtilization };
  }, [schedules]);

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 60,
      filterable: true,
      sortable: true
    },
    {
      field: 'className',
      headerName: 'Lớp học',
      width: 200,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <ClassIcon color="secondary" sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.75rem', lineHeight: 1.2 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'teacherName',
      headerName: 'Giảng viên',
      width: 150,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <PersonIcon color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'roomName',
      headerName: 'Phòng học',
      width: 180,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <RoomIcon color={params.value ? "info" : "disabled"} sx={{ fontSize: 16 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.75rem', 
              lineHeight: 1.2,
              color: params.value ? 'text.primary' : 'text.secondary',
              fontStyle: params.value ? 'normal' : 'italic'
            }}
          >
            {params.value || 'Chưa sắp xếp'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'timeSlot',
      headerName: 'Tiết học',
      width: 150,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <TimeIcon color="action" sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'dayName',
      headerName: 'Thứ',
      width: 80,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <CalendarIcon color="secondary" sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'utilization',
      headerName: 'Sử dụng',
      width: 100,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          {params.row.roomId ? (
            <>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                {params.value}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {params.row.enrolledStudents}/{params.row.capacity}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2, color: 'text.secondary', fontStyle: 'italic' }}>
              Chưa sắp xếp
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 120,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="filled"
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Chỉnh sửa lịch">
            <IconButton
              size="small"
              onClick={() => handleEditSchedule(params.row)}
              color="primary"
              sx={{ padding: 0.5 }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  if (loading && schedules.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="400px"
        flexDirection="column"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Đang tải lịch sắp xếp phòng...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6">Không thể tải lịch sắp xếp phòng</Typography>
              <Typography>{error}</Typography>
            </Alert>
            <Button 
              variant="contained" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              sx={{ mt: 2 }}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Card */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h4" component="h1" sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}>
              Sắp xếp phòng học
            </Typography>
            
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <Tooltip title="Làm mới dữ liệu">
                <IconButton 
                  onClick={handleRefresh}
                  color="primary"
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 2, 
        mb: 3 
      }}>
        <Card sx={{ 
          height: 120, 
          minWidth: 150,
          maxWidth: 250,
          flex: '0 0 auto'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                  Tổng lớp học
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          height: 120, 
          minWidth: 150,
          maxWidth: 250,
          flex: '0 0 auto'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                  Đã sắp xếp
                </Typography>
                <Typography variant="h5" component="div" color="success.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {stats.scheduled}
                </Typography>
              </Box>
              <ApproveIcon sx={{ fontSize: 28, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          height: 120, 
          minWidth: 150,
          maxWidth: 250,
          flex: '0 0 auto'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                  Chưa sắp xếp
                </Typography>
                <Typography variant="h5" component="div" color="warning.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {stats.pending}
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 28, color: 'warning.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          height: 120, 
          minWidth: 150,
          maxWidth: 250,
          flex: '0 0 auto'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                  Xung đột
                </Typography>
                <Typography variant="h5" component="div" color="error.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {stats.conflicts}
                </Typography>
              </Box>
              <RejectIcon sx={{ fontSize: 28, color: 'error.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          height: 120, 
          minWidth: 150,
          maxWidth: 250,
          flex: '0 0 auto'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                  Sử dụng TB
                </Typography>
                <Typography variant="h5" component="div" color="info.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {stats.avgUtilization}%
                </Typography>
              </Box>
              <RoomIcon sx={{ fontSize: 28, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bộ lọc
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tuần</InputLabel>
                <Select
                  value={filterWeek}
                  onChange={(e) => setFilterWeek(e.target.value)}
                  label="Tuần"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="1">Tuần 1</MenuItem>
                  <MenuItem value="2">Tuần 2</MenuItem>
                  <MenuItem value="3">Tuần 3</MenuItem>
                  <MenuItem value="4">Tuần 4</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Thứ</InputLabel>
                <Select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  label="Thứ"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="2">Thứ 2</MenuItem>
                  <MenuItem value="3">Thứ 3</MenuItem>
                  <MenuItem value="4">Thứ 4</MenuItem>
                  <MenuItem value="5">Thứ 5</MenuItem>
                  <MenuItem value="6">Thứ 6</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="scheduled">Đã sắp xếp</MenuItem>
                  <MenuItem value="pending">Chưa sắp xếp</MenuItem>
                  <MenuItem value="conflict">Xung đột</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* DataGrid */}
       <Paper sx={{ 
         height: 600, 
         minWidth: 1200
       }}>
        <DataGrid
          apiRef={dataGridRef}
          rows={filteredSchedules}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu={false}
          disableColumnResize={false}
          autoPageSize={false}
           sx={{
             minWidth: 1200,
             height: 600,
             '& .MuiDataGrid-columnHeader:last-child': {
               display: 'none',
             },
             '& .MuiDataGrid-cell:last-child': {
               display: 'none',
             },
             '& .MuiDataGrid-columnHeaders': {
               backgroundColor: 'primary.main',
               color: 'black',
               '& .MuiDataGrid-columnHeaderTitle': {
                 color: 'black',
                 fontWeight: 'bold',
               },
             },
             '& .MuiDataGrid-cell': {
               fontSize: '0.75rem',
             },
             '& .MuiDataGrid-row': {
               minHeight: '60px',
             },
           }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
          density="comfortable"
          checkboxSelection={false}
          disableColumnSelector={false}
          disableDensitySelector={false}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa lịch sắp xếp phòng</DialogTitle>
        <DialogContent>
          {selectedSchedule && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <TextField
                    fullWidth
                    label="Lớp học"
                    value={selectedSchedule.className}
                    disabled
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <TextField
                    fullWidth
                    label="Giảng viên"
                    value={selectedSchedule.teacherName}
                    disabled
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Phòng học</InputLabel>
                    <Select
                      value={selectedSchedule.roomId || ''}
                      label="Phòng học"
                      onChange={(e) => {
                        const roomId = e.target.value as number;
                        const selectedRoom = rooms.find(r => r.id === roomId);
                        setSelectedSchedule(prev => prev ? {
                          ...prev,
                          roomId: roomId || null,
                          roomName: selectedRoom?.name || null,
                          status: roomId ? 'scheduled' : 'pending'
                        } : null);
                      }}
                    >
                      <MenuItem value="">
                        <em>Chưa sắp xếp</em>
                      </MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.name} - {room.capacity} chỗ
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tiết học</InputLabel>
                    <Select
                      value={selectedSchedule.timeSlotId}
                      label="Tiết học"
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot.id} value={slot.id}>
                          {slot.name} - {slot.time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Thứ</InputLabel>
                    <Select
                      value={selectedSchedule.dayOfWeek}
                      label="Thứ"
                    >
                      <MenuItem value={2}>Thứ 2</MenuItem>
                      <MenuItem value={3}>Thứ 3</MenuItem>
                      <MenuItem value={4}>Thứ 4</MenuItem>
                      <MenuItem value={5}>Thứ 5</MenuItem>
                      <MenuItem value={6}>Thứ 6</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={selectedSchedule.status}
                      label="Trạng thái"
                    >
                      <MenuItem value="scheduled">Đã sắp xếp</MenuItem>
                      <MenuItem value="pending">Chưa sắp xếp</MenuItem>
                      <MenuItem value="conflict">Xung đột</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoomScheduling;
