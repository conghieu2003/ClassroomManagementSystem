import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Snackbar
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAssignIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../redux/store';
import {
  loadAllData,
  loadAvailableRooms,
  loadRoomsByDepartmentAndType,
  assignRoomToSchedule,
  setSelectedDepartment,
  setSelectedClass,
  setSelectedTeacher,
  setSelectedStatus,
  setError,
  setSuccessMessage,
  openAssignDialog,
  closeAssignDialog,
  setSelectedRoom
} from '../../redux/slices/roomSchedulingSlice';
import { scheduleManagementService } from '../../services/api';

// Import types from slice
import type { 
  ScheduleData
} from '../../redux/slices/roomSchedulingSlice';

const RoomScheduling: React.FC = () => {
  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const {
    // Data
    classes,
    departments,
    teachers,
    stats,
    requestTypes,
    availableRooms,
    
    // Filters
    selectedDepartment,
    selectedClass,
    selectedTeacher,
    selectedStatus,
    
    // UI State
    loading,
    error,
    successMessage,
    
    // Dialog state
    assignDialogOpen,
    selectedSchedule,
    selectedRoom,
    isAssigning
  } = useSelector((state: RootState) => state.roomScheduling);
  

  // Load all data using Redux
  const handleLoadAllData = useCallback(() => {
    dispatch(loadAllData());
  }, [dispatch]);

  // Refresh data after successful operations
  const refreshData = () => {
    dispatch(loadAllData());
  };


  // Assign room to schedule using Redux
  const handleAssignRoom = () => {
    if (!selectedSchedule || !selectedRoom) return;
    
    dispatch(assignRoomToSchedule({
      scheduleId: selectedSchedule.scheduleId.toString(),
      roomId: selectedRoom
    }));
  };

  // Auto assign rooms for a class
  const handleAutoAssign = async (classId: number) => {
    try {
      // Tạm thời sử dụng logic đơn giản cho auto assign
      const classData = classes.find(c => c.classId === classId);
      if (classData && classData.schedules) {
        let successCount = 0;
        // Chỉ lấy lịch học chưa có phòng (statusId = 1)
        const pendingSchedules = classData.schedules.filter(schedule => schedule.statusId === 1);
        for (const schedule of pendingSchedules) {
          const roomsResponse = await scheduleManagementService.getAvailableRoomsForSchedule(schedule.scheduleId.toString());
          if (roomsResponse.data && roomsResponse.data.length > 0) {
            await scheduleManagementService.assignRoomToSchedule(schedule.scheduleId.toString(), roomsResponse.data[0].id.toString());
            successCount++;
          }
        }
        
        if (successCount > 0) {
          dispatch(setSuccessMessage(`Tự động gán phòng thành công: ${successCount} lịch học`));
          refreshData();
        }
      }
    } catch (err: any) {
      console.error('Error auto assigning:', err);
      dispatch(setError(err.response?.data?.message || 'Lỗi tự động gán phòng'));
    }
  };

  // Open assign dialog
  const handleOpenAssignDialog = (schedule: ScheduleData) => {
    dispatch(openAssignDialog(schedule));
    
    // Tìm thông tin lớp học để lấy departmentId
    const classInfo = classes.find(c => c.classId === schedule.classId);
    if (classInfo) {
      const department = departments.find(d => d.name === classInfo.departmentName);
      if (department) {
        dispatch(loadRoomsByDepartmentAndType({
          departmentId: department.id.toString(),
          classRoomTypeId: schedule.classRoomTypeId.toString()
        }));
      } else {
        dispatch(loadAvailableRooms(schedule.scheduleId.toString()));
      }
    } else {
      dispatch(loadAvailableRooms(schedule.scheduleId.toString()));
    }
  };

  // Filter classes based on selected filters
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      // Tìm departmentId từ departments array
      const department = departments.find(d => d.name === cls.departmentName);
      const departmentMatch = !selectedDepartment || (department && department.id.toString() === selectedDepartment);
      
      // Tìm teacherId từ teachers array
      const teacher = teachers.find(t => t.fullName === cls.teacherName);
      const teacherMatch = !selectedTeacher || (teacher && teacher.id.toString() === selectedTeacher);
      
      // Nếu có filter khoa, kiểm tra giáo viên có thuộc khoa đó không
      let teacherDepartmentMatch = true;
      if (selectedDepartment && teacher) {
        teacherDepartmentMatch = !!(teacher.departmentId && teacher.departmentId.toString() === selectedDepartment);
      }
      
      const classMatch = !selectedClass || cls.classId.toString() === selectedClass;
      const statusMatch = !selectedStatus || cls.statusId.toString() === selectedStatus;
      
      return departmentMatch && classMatch && teacherMatch && teacherDepartmentMatch && statusMatch;
    });
  }, [classes, departments, teachers, selectedDepartment, selectedClass, selectedTeacher, selectedStatus]);

  // Filter options for dropdowns based on selected department
  const filteredClassesForDropdown = useMemo(() => {
    if (!selectedDepartment) return classes;
    
    const selectedDept = departments.find(d => d.id.toString() === selectedDepartment);
    if (!selectedDept) return classes;
    
    return classes.filter(cls => cls.departmentName === selectedDept.name);
  }, [classes, departments, selectedDepartment]);

  const filteredTeachersForDropdown = useMemo(() => {
    if (!selectedDepartment) return teachers;
    
    return teachers.filter(teacher => 
      teacher.departmentId && teacher.departmentId.toString() === selectedDepartment
    );
  }, [teachers, selectedDepartment]);

  // Flatten schedules for grid display
  const scheduleRows = useMemo(() => {
    const rows: any[] = [];
    
      filteredClasses.forEach(cls => {
        // Hiển thị tất cả lịch học (cả chờ phân phòng và đã phân phòng)
        cls.schedules.forEach((schedule: ScheduleData) => {
        rows.push({
          id: `${cls.id}-${schedule.id}`,
          classId: cls.classId,
          className: cls.className,
          subjectCode: cls.subjectCode,
          teacherName: cls.teacherName,
          departmentName: cls.departmentName,
          scheduleId: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          dayName: schedule.dayName,
          timeSlot: schedule.timeSlot,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          weekPattern: schedule.weekPattern,
          startWeek: schedule.startWeek,
          endWeek: schedule.endWeek,
          note: schedule.note,
          status: schedule.statusId, // Sử dụng statusId từ schedule
          maxStudents: cls.maxStudents,
          classRoomTypeId: schedule.classRoomTypeId,
          classRoomTypeName: schedule.classRoomTypeName,
          practiceGroup: schedule.practiceGroup,
          roomId: schedule.roomId,
          roomName: schedule.roomName,
          roomCode: schedule.roomCode
        });
      });
    });
    
    return rows;
  }, [filteredClasses]);

  // Grid columns
  const columns: GridColDef[] = [
    {
      field: 'className',
      headerName: 'Tên lớp học',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.subjectCode}
          </Typography>
        </Box>
      )
    },
    {
      field: 'teacherName',
      headerName: 'Giảng viên',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box display="flex" alignItems="flex-start" gap={1} sx={{ width: '100%' }}>
          <PersonIcon fontSize="small" color="primary" sx={{ mt: 0.5, flexShrink: 0 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              wordBreak: 'break-word', 
              whiteSpace: 'normal',
              lineHeight: 1.4,
              width: '100%'
            }}
          >
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'departmentName',
      headerName: 'Khoa',
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            wordBreak: 'break-word', 
            whiteSpace: 'normal',
            lineHeight: 1.4,
            width: '100%'
          }}
        >
          {params.value}
        </Typography>
      )
    },
    {
      field: 'dayName',
      headerName: 'Thứ',
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color="primary" 
          variant="outlined"
          sx={{
            whiteSpace: 'normal',
            height: 'auto',
            '& .MuiChip-label': {
              whiteSpace: 'normal',
              lineHeight: 1.2,
              padding: '4px 8px'
            }
          }}
        />
      )
    },
    {
      field: 'timeSlot',
      headerName: 'Tiết học',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.startTime} - {params.row.endTime}
          </Typography>
        </Box>
      )
    },
    {
      field: 'classRoomTypeName',
      headerName: 'Phòng/lớp',
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.row.classRoomTypeId === 1 ? 'primary' : params.row.classRoomTypeId === 2 ? 'secondary' : 'default'} 
          variant="outlined"
          sx={{
            whiteSpace: 'normal',
            height: 'auto',
            '& .MuiChip-label': {
              whiteSpace: 'normal',
              lineHeight: 1.2,
              padding: '4px 8px'
            }
          }}
        />
      )
    },
    {
      field: 'practiceGroup',
      headerName: 'Nhóm TH',
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => {
        if (params.row.classRoomTypeId === 2 && params.value) {
          return (
            <Chip 
              label={`Nhóm ${params.value}`} 
              size="small" 
              color="secondary" 
              variant="filled"
              sx={{
                whiteSpace: 'normal',
                height: 'auto',
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                  padding: '4px 8px'
                }
              }}
            />
          );
        }
        return <Typography variant="body2" color="text.secondary">-</Typography>;
      }
    },
    {
      field: 'maxStudents',
      headerName: 'Số SV',
      minWidth: 70,
      flex: 0.4,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        // Ẩn Số SV cho nhóm thực hành (classRoomTypeId === 2)
        if (params.row.classRoomTypeId === 2) {
          return <Typography variant="body2" color="text.secondary">-</Typography>;
        }
        return <Typography variant="body2">{params.value}</Typography>;
      }
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => {
        // Sử dụng trực tiếp statusId từ database
        const statusType = requestTypes.find(type => type.id === params.value);
        
        if (statusType) {
          let color: 'warning' | 'success' | 'default' = 'default';
          if (statusType.id === 1) color = 'warning'; // Chờ phân phòng
          else if (statusType.id === 2) color = 'success'; // Đã phân phòng
          
          return (
            <Chip 
              label={statusType.name} 
              size="small" 
              color={color}
              variant="filled"
              sx={{ 
                whiteSpace: 'normal',
                height: 'auto',
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                  padding: '4px 8px'
                }
              }}
            />
          );
        }
        
        return (
          <Chip 
            label="Không xác định" 
            size="small" 
            color="default"
            variant="filled"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box display="flex" gap={0.5} justifyContent="center">
          <Tooltip title="Gán phòng">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenAssignDialog(params.row)}
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tự động gán phòng">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleAutoAssign(params.row.classId)}
            >
              <AutoAssignIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Load data on component mount
  useEffect(() => {
    handleLoadAllData();
  }, [handleLoadAllData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

    return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            Sắp xếp phòng học
          </Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={handleLoadAllData}
              disabled={loading}
            >
            Làm mới
            </Button>
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(setError(null))}>
            {error}
          </Alert>
        )}

        {isAssigning && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Đang cập nhật trạng thái gán phòng...
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mb={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ClassIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{stats.totalClasses}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng số lớp
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ScheduleIcon color="warning" />
                  <Box>
                    <Typography variant="h6">{stats.pendingClasses}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lớp chờ phân phòng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <RoomIcon color="success" />
                  <Box>
                    <Typography variant="h6">{stats.assignedClasses}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lớp đã phân phòng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CalendarIcon color="info" />
                  <Box>
                    <Typography variant="h6">
                      {stats.assignmentRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ phân phòng
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

      {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bộ lọc
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Khoa</InputLabel>
                <Select
                value={selectedDepartment}
                  label="Khoa"
                onChange={(e) => {
                  dispatch(setSelectedDepartment(e.target.value));
                  // Reset các filter khác khi thay đổi khoa
                  dispatch(setSelectedClass(''));
                  dispatch(setSelectedTeacher(''));
                }}
                >
                <MenuItem value="">Tất cả</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Lớp học</InputLabel>
                <Select
                value={selectedClass}
                label="Lớp học"
                onChange={(e) => dispatch(setSelectedClass(e.target.value))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {filteredClassesForDropdown.map((cls) => (
                  <MenuItem key={cls.classId} value={cls.classId.toString()}>
                    {cls.className} ({cls.subjectCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Giảng viên</InputLabel>
                <Select
                value={selectedTeacher}
                  label="Giảng viên"
                onChange={(e) => dispatch(setSelectedTeacher(e.target.value))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {filteredTeachersForDropdown.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.fullName} ({teacher.teacherCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                value={selectedStatus}
                  label="Trạng thái"
                onChange={(e) => dispatch(setSelectedStatus(e.target.value))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {requestTypes.map(type => (
                  <MenuItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </MenuItem>
                ))}
                </Select>
              </FormControl>
          </Stack>
        </Paper>

        {/* Data Grid */}
        <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
            rows={scheduleRows}
          columns={columns}
            pageSizeOptions={[10, 25, 50]}
          initialState={{
              pagination: { paginationModel: { pageSize: 25 } }
          }}
            slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: 1.4,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              overflow: 'visible',
              height: 'auto !important',
              minHeight: '80px !important'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8f9fa',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              minHeight: '80px !important',
              '& .MuiDataGrid-cell': {
                minHeight: '80px !important',
                maxHeight: 'none !important',
                padding: '12px 16px'
              }
            }
          }}
        />
      </Paper>

        {/* Assign Room Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => dispatch(closeAssignDialog())} maxWidth="sm" fullWidth>
          <DialogTitle>
            Gán phòng cho lịch học
            {selectedSchedule && (
              <Typography variant="body2" color="text.secondary">
                {selectedSchedule.dayName} - {selectedSchedule.timeSlot}
              </Typography>
            )}
          </DialogTitle>
        <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn phòng</InputLabel>
                    <Select
                value={selectedRoom}
                label="Chọn phòng"
                onChange={(e) => dispatch(setSelectedRoom(e.target.value))}
              >
                  {availableRooms.map((room) => {
                    const hasConflict = !room.isAvailable;
                    return (
                      <MenuItem 
                        key={room.id} 
                        value={room.id}
                        disabled={hasConflict}
                        sx={{ 
                          opacity: hasConflict ? 0.5 : 1,
                          backgroundColor: hasConflict ? '#ffebee' : 'transparent'
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="bold">
                              {room.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={room.type} 
                                size="small" 
                                color={room.type === 'Lý thuyết' ? 'primary' : 'secondary'} 
                                variant="outlined"
                              />
                              {hasConflict && (
                                <Chip 
                                  label="Đã sử dụng" 
                                  size="small" 
                                  color="error" 
                                  variant="filled"
                                />
                              )}
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {room.code} - {room.capacity} chỗ - {room.building} tầng {room.floor}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {room.department} {room.isSameDepartment && '✓'}
                          </Typography>
                          {hasConflict && room.conflictInfo && (
                            <Typography variant="caption" color="error">
                              ⚠️ Đã được sử dụng bởi {room.conflictInfo.className} ({room.conflictInfo.teacherName}) 
                              trong khung giờ {room.conflictInfo.time}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                    </Select>
                  </FormControl>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => dispatch(closeAssignDialog())}>
              Hủy
            </Button>
            <Button 
              onClick={handleAssignRoom} 
              variant="contained"
              disabled={!selectedRoom || isAssigning}
              startIcon={isAssigning ? <CircularProgress size={20} /> : <AssignmentIcon />}
            >
              {isAssigning ? 'Đang gán phòng...' : 'Gán phòng'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => dispatch(setSuccessMessage(null))}
          message={successMessage}
        />
      </Box>
    </Container>
  );
};

export default RoomScheduling;