import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Container,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Room as RoomIcon,
  Business as BuildingIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { roomService, scheduleManagementService } from '../../services/api';
import { toast } from 'react-toastify';

interface Department {
  id: number;
  name: string;
  code: string;
}

interface ClassRoomType {
  id: number;
  name: string;
}

interface TimeSlot {
  id: number;
  slotName: string;
  startTime: string;
  endTime: string;
  shift: number;
}

interface Room {
  id: string;
  code: string;
  name: string;
  capacity: number;
  building: string;
  floor: number;
  type: string;
  campus: string;
  department: string;
  description: string;
  isAvailable: boolean;
  roomNumber: string;
  searchDayOfWeek?: string | null;
  searchTimeSlot?: string | null;
  searchDate?: string | null;
  occupancyStatus?: string;
  scheduleInfo?: any;
  className?: string | null;
  teacherName?: string | null;
}

interface FilterState {
  departmentId: string;
  classRoomTypeId: string;
  dayOfWeek: string;
  timeSlotId: string;
  minCapacity: string;
  selectedDate: string;
}

const AvailableRooms: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roomTypes, setRoomTypes] = useState<ClassRoomType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    departmentId: '',
    classRoomTypeId: '',
    dayOfWeek: '',
    timeSlotId: '',
    minCapacity: '',
    selectedDate: ''
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      const [deptRes, typesRes, slotsRes] = await Promise.all([
        scheduleManagementService.getDepartments(),
        scheduleManagementService.getClassRoomTypes(),
        roomService.getTimeSlots()
      ]);

      if (deptRes.success) {
        setDepartments(deptRes.data);
      }

      if (typesRes.success) {
        setRoomTypes(typesRes.data);
      }

      if (slotsRes.success) {
        setTimeSlots(slotsRes.data);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
      toast.error('Không thể tải dữ liệu khởi tạo');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      setHasSearched(true);

      // Validate: Must have both day and time slot
      if (!filters.dayOfWeek || !filters.timeSlotId) {
        toast.warning('Vui lòng chọn Thứ và Tiết học để kiểm tra tình trạng phòng');
        setSearching(false);
        return;
      }

      // Step 1: Get rooms filtered by department and type
      let rooms: any[] = [];
      
      if (filters.departmentId || filters.classRoomTypeId) {
        const roomsResponse = await scheduleManagementService.getRoomsByDepartmentAndType(
          filters.departmentId || 'all',
          filters.classRoomTypeId || 'all'
        );
        
        if (roomsResponse.success) {
          rooms = roomsResponse.data;
        }
      } else {
        // Get all rooms if no department/type filter
        const allRoomsResponse = await roomService.getAllRooms();
        if (allRoomsResponse.success) {
          rooms = allRoomsResponse.data;
        }
      }

      console.log('Rooms after dept/type filter:', rooms.length);

      // Step 2: Filter by minimum capacity
      if (filters.minCapacity) {
        const minCap = parseInt(filters.minCapacity);
        rooms = rooms.filter(room => room.capacity >= minCap);
      }

      console.log('Rooms after capacity filter:', rooms.length);

      // Step 3: Get schedule data - *** QUAN TRỌNG: Truyền date parameter ***
      const schedulesResponse = await roomService.getSchedulesByTimeSlotAndDate(
        parseInt(filters.timeSlotId),
        parseInt(filters.dayOfWeek),
        filters.selectedDate || undefined // ← Thêm tham số ngày cụ thể
      );

      let scheduleData: any[] = [];
      let occupiedRoomIds: string[] = [];

      if (schedulesResponse.success) {
        scheduleData = schedulesResponse.data;
        
        // Lọc bỏ các schedule có ngoại lệ (classRoomId = null)
        occupiedRoomIds = scheduleData
          .filter((schedule: any) => schedule.classRoomId && !schedule.hasException)
          .map((schedule: any) => schedule.classRoomId.toString());

        console.log('Occupied room IDs (excluding exceptions):', occupiedRoomIds);
        console.log('Schedule data:', scheduleData);
        
        // Log các phòng bị giải phóng do ngoại lệ
        const freedRooms = scheduleData.filter((s: any) => s.hasException && s.originalClassRoom);
        if (freedRooms.length > 0) {
          console.log('🎉 Rooms freed due to exceptions:', freedRooms.map((s: any) => ({
            room: s.originalClassRoom.name,
            exceptionType: s.exceptionType,
            class: s.class.className,
            reason: s.exceptionReason
          })));
          
          toast.info(
            `🎉 Phát hiện ${freedRooms.length} phòng trống do ngoại lệ lịch học (nghỉ/thi/dời lịch)`,
            { autoClose: 5000 }
          );
        }
      }

      // Step 4: Add metadata to all rooms
      const selectedTimeSlot = timeSlots.find(s => s.id.toString() === filters.timeSlotId);
      
      const enrichedRooms = rooms.map(room => {
        const isOccupied = occupiedRoomIds.includes(room.id.toString());
        const scheduleInfo = scheduleData.find((s: any) => 
          s.classRoomId?.toString() === room.id.toString() && !s.hasException
        );
        
        // Kiểm tra xem phòng này có phải là freed room không
        const freedSchedule = scheduleData.find((s: any) => 
          s.hasException && s.originalClassRoom?.id.toString() === room.id.toString()
        );
        
        return {
          ...room,
          searchDayOfWeek: filters.dayOfWeek,
          searchTimeSlot: selectedTimeSlot ? `${selectedTimeSlot.slotName}` : '',
          searchDate: filters.selectedDate || null,
          occupancyStatus: isOccupied ? 'Đã có lớp' : 'Còn trống',
          scheduleInfo: scheduleInfo || null,
          className: scheduleInfo?.class?.className || null,
          teacherName: scheduleInfo?.teacher?.user?.fullName || null,
          // Thêm thông tin về ngoại lệ nếu là freed room
          isFreedByException: !!freedSchedule,
          exceptionInfo: freedSchedule ? {
            className: freedSchedule.class.className,
            exceptionType: freedSchedule.exceptionType,
            exceptionReason: freedSchedule.exceptionReason,
            exceptionTypeName: freedSchedule.exceptionTypeName
          } : null
        };
      });

      console.log('All rooms with status:', enrichedRooms.length);
      console.log('Available rooms:', enrichedRooms.filter(r => r.occupancyStatus === 'Còn trống').length);
      console.log('Occupied rooms:', enrichedRooms.filter(r => r.occupancyStatus === 'Đã có lớp').length);
      console.log('Freed rooms:', enrichedRooms.filter(r => r.isFreedByException).length);

      setAvailableRooms(enrichedRooms);
      
      const availableCount = enrichedRooms.filter(r => r.occupancyStatus === 'Còn trống').length;
      const occupiedCount = enrichedRooms.filter(r => r.occupancyStatus === 'Đã có lớp').length;
      const freedCount = enrichedRooms.filter(r => r.isFreedByException).length;
      
      let successMessage = `Tìm thấy ${enrichedRooms.length} phòng: ${availableCount} trống, ${occupiedCount} đã có lớp`;
      if (freedCount > 0) {
        successMessage += ` (${freedCount} phòng trống do ngoại lệ)`;
      }
      
      toast.success(successMessage);
    } catch (error) {
      console.error('Error searching rooms:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm phòng');
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setFilters({
      departmentId: '',
      classRoomTypeId: '',
      dayOfWeek: '',
      timeSlotId: '',
      minCapacity: '',
      selectedDate: ''
    });
    setSelectedDate(null);
    setAvailableRooms([]);
    setHasSearched(false);
  };

  const getDayName = (dayValue: string): string => {
    const days: { [key: string]: string } = {
      '1': 'Chủ nhật',
      '2': 'Thứ 2',
      '3': 'Thứ 3',
      '4': 'Thứ 4',
      '5': 'Thứ 5',
      '6': 'Thứ 6',
      '7': 'Thứ 7'
    };
    return days[dayValue] || '';
  };

  const getShiftName = (shift: number): string => {
    const shifts: { [key: number]: string } = {
      1: 'Sáng',
      2: 'Chiều',
      3: 'Tối'
    };
    return shifts[shift] || '';
  };

  const columns: GridColDef[] = [
    {
      field: 'roomNumber',
      headerName: 'Mã phòng',
      flex: 0.12,
      minWidth: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RoomIcon color="primary" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'name',
      headerName: 'Tên phòng',
      flex: 0.15,
      minWidth: 130
    },
    {
      field: 'building',
      headerName: 'Tòa',
      flex: 0.08,
      minWidth: 70,
      renderCell: (params) => (
        <Chip 
          icon={<BuildingIcon fontSize="small" />}
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'floor',
      headerName: 'Tầng',
      flex: 0.06,
      minWidth: 60,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'capacity',
      headerName: 'Sức chứa',
      flex: 0.1,
      minWidth: 90,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'type',
      headerName: 'Loại',
      flex: 0.12,
      minWidth: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Lý thuyết' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      )
    },
    {
      field: 'searchDate',
      headerName: 'Ngày',
      flex: 0.12,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {new Date(params.value).toLocaleDateString('vi-VN')}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
        )
      )
    },
    {
      field: 'searchDayOfWeek',
      headerName: 'Thứ',
      flex: 0.1,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {getDayName(params.value)}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
        )
      )
    },
    {
      field: 'searchTimeSlot',
      headerName: 'Tiết học',
      flex: 0.12,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.value}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
        )
      )
    },
    {
      field: 'occupancyStatus',
      headerName: 'Tình trạng sử dụng',
      flex: 0.2,
      minWidth: 200,
      renderCell: (params) => {
        const row = params.row;
        const isFreed = row.isFreedByException;
        
        if (isFreed) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
              <Chip
                icon={<CheckCircleIcon fontSize="small" />}
                label="Còn trống"
                size="small"
                color="success"
                sx={{ fontWeight: 'medium' }}
              />
              <Chip
                label={`🎉 Do ${row.exceptionInfo?.exceptionType || 'ngoại lệ'}`}
                size="small"
                color="info"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: '18px' }}
              />
            </Box>
          );
        }
        
        return (
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label={params.value}
            size="small"
            color={params.value === 'Còn trống' ? 'success' : 'error'}
            sx={{ fontWeight: 'medium' }}
          />
        );
      }
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Tìm kiếm phòng trống
            </Typography>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton 
                onClick={loadMasterData}
                color="primary"
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Bộ lọc tìm kiếm
          </Typography>

          <Grid container spacing={2}>
            {/* Department Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel shrink>Khoa</InputLabel>
                <Select
                  value={filters.departmentId}
                  onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                  label="Khoa"
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (!selected) {
                      return <em style={{ color: '#666' }}>Tất cả</em>;
                    }
                    const dept = departments.find(d => d.id.toString() === selected.toString());
                    return dept ? dept.name : selected;
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Room Type Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel shrink>Loại phòng</InputLabel>
                <Select
                  value={filters.classRoomTypeId}
                  onChange={(e) => setFilters({ ...filters, classRoomTypeId: e.target.value })}
                  label="Loại phòng"
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (!selected) {
                      return <em style={{ color: '#666' }}>Tất cả</em>;
                    }
                    const type = roomTypes.find(t => t.id.toString() === selected.toString());
                    return type ? type.name : selected;
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {roomTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DatePicker
                  label="Chọn ngày cụ thể"
                  value={selectedDate}
                  onChange={(newValue) => {
                    setSelectedDate(newValue);
                    if (newValue) {
                      const dateStr = newValue.format('YYYY-MM-DD');
                      const dayOfWeekValue = newValue.day();
                      const adjustedDay = dayOfWeekValue === 0 ? '1' : (dayOfWeekValue + 1).toString();
                      
                      setFilters({ 
                        ...filters, 
                        selectedDate: dateStr,
                        dayOfWeek: adjustedDay
                      });
                    } else {
                      setFilters({ 
                        ...filters, 
                        selectedDate: '',
                        dayOfWeek: ''
                      });
                    }
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: "Chọn ngày...",
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Day of Week Filter (Auto-filled from date or manual) */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              {filters.selectedDate ? (
                <TextField
                  fullWidth
                  label="Thứ trong tuần"
                  value={filters.dayOfWeek ? getDayName(filters.dayOfWeek) : ''}
                  disabled
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#1976d2',
                      fontWeight: 'bold'
                    }
                  }}
                />
              ) : (
                <FormControl fullWidth>
                  <InputLabel shrink>Thứ trong tuần</InputLabel>
                  <Select
                    value={filters.dayOfWeek}
                    onChange={(e) => setFilters({ ...filters, dayOfWeek: e.target.value })}
                    label="Thứ trong tuần"
                    displayEmpty
                    notched
                    renderValue={(selected) => {
                      if (!selected) {
                        return <em style={{ color: '#666' }}>Tất cả</em>;
                      }
                      return getDayName(selected);
                    }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="2">Thứ 2</MenuItem>
                    <MenuItem value="3">Thứ 3</MenuItem>
                    <MenuItem value="4">Thứ 4</MenuItem>
                    <MenuItem value="5">Thứ 5</MenuItem>
                    <MenuItem value="6">Thứ 6</MenuItem>
                    <MenuItem value="7">Thứ 7</MenuItem>
                    <MenuItem value="1">Chủ nhật</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>

            {/* Time Slot Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel shrink>Tiết học</InputLabel>
                <Select
                  value={filters.timeSlotId}
                  onChange={(e) => setFilters({ ...filters, timeSlotId: e.target.value })}
                  label="Tiết học"
                  displayEmpty
                  notched
                  renderValue={(selected) => {
                    if (!selected) {
                      return <em style={{ color: '#666' }}>Tất cả</em>;
                    }
                    const slot = timeSlots.find(s => s.id.toString() === selected.toString());
                    return slot ? `${slot.slotName} (${slot.startTime} - ${slot.endTime}) - ${getShiftName(slot.shift)}` : selected;
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {timeSlots.map((slot) => (
                    <MenuItem key={slot.id} value={slot.id}>
                      {slot.slotName} ({slot.startTime} - {slot.endTime}) - {getShiftName(slot.shift)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Minimum Capacity Filter */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Sức chứa tối thiểu"
                value={filters.minCapacity}
                onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Box sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'flex-end' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={searching}
                  sx={{ height: '56px' }}
                >
                  {searching ? 'Đang tìm...' : 'Tìm kiếm'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  sx={{ height: '56px' }}
                >
                  Đặt lại
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Filter Summary */}
          <Alert severity="info" sx={{ mt: 2 }}>
            {filters.dayOfWeek && filters.timeSlotId ? (
              <>
                <strong>✓ Đang kiểm tra:</strong>{' '}
                {filters.selectedDate && (
                  <>
                    Ngày <strong>{new Date(filters.selectedDate).toLocaleDateString('vi-VN')}</strong> ({getDayName(filters.dayOfWeek)})
                  </>
                )}
                {!filters.selectedDate && (
                  <>
                    <strong>{getDayName(filters.dayOfWeek)}</strong> (lịch cố định hàng tuần)
                  </>
                )}
                {' - '}
                <strong>{timeSlots.find(s => s.id.toString() === filters.timeSlotId)?.slotName}</strong>
              </>
            ) : (
              <>
                <strong>⚠️ Lưu ý:</strong> Vui lòng chọn <strong>Ngày/Thứ</strong> và <strong>Tiết học</strong> để xem tình trạng phòng
              </>
            )}
          </Alert>
        </CardContent>
      </Card>

      {/* Results Section */}
      {hasSearched && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">
                Kết quả tìm kiếm: {availableRooms.length} phòng
              </Typography>
              {availableRooms.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${availableRooms.filter(r => r.occupancyStatus === 'Còn trống').length} Còn trống`}
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                  <Chip 
                    label={`${availableRooms.filter(r => r.occupancyStatus === 'Đã có lớp').length} Đã có lớp`}
                    color="error"
                  />
                </Box>
              )}
            </Box>

            {availableRooms.length === 0 ? (
              <Alert severity="warning">
                Không tìm thấy phòng nào phù hợp với các tiêu chí đã chọn. 
                Vui lòng thử điều chỉnh bộ lọc.
              </Alert>
            ) : (
              <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={availableRooms}
                  columns={columns}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 25 }
                    }
                  }}
                  disableRowSelectionOnClick
                  disableColumnFilter={false}
                  disableColumnMenu={false}
                  sx={{
                    height: 600,
                    width: '100%',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#1976d2',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 600,
                      minHeight: '56px !important',
                      maxHeight: '56px !important'
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontSize: '14px'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      backgroundColor: '#1976d2',
                      color: '#ffffff',
                      '&:focus': {
                        outline: 'none'
                      },
                      '&:focus-within': {
                        outline: 'none'
                      }
                    },
                    '& .MuiDataGrid-iconButtonContainer': {
                      color: '#ffffff'
                    },
                    '& .MuiDataGrid-sortIcon': {
                      color: '#ffffff'
                    },
                    '& .MuiDataGrid-menuIconButton': {
                      color: '#ffffff'
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                />
              </Paper>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default AvailableRooms;

