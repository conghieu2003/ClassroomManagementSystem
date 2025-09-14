import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  Stack
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridSortModel,
  GridToolbar,
  GridActionsCellItem,
  GridRowParams,
  useGridApiRef
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { User } from '../../types';
import { fetchUsersThunk, updateUserThunk } from '../../redux/slices/userSlice';
import { RootState, AppDispatch } from '../../redux/store';

interface RoleOption {
  id: string;
  text: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { users, usersLoading, usersError } = useSelector((state: RootState) => state.user);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dataGridRef = useGridApiRef();

  const roleOptions: RoleOption[] = [{
    id: 'all',
    text: 'Tất cả'
  }, {
    id: 'teacher',
    text: 'Giảng viên'
  }, {
    id: 'student',
    text: 'Sinh viên'
  }];

  // Computed statistics
  const userStats = useMemo(() => {  
    const totalUsers = users.length;
    const students = users.filter(user => user.role === 'student').length;
    const teachers = users.filter(user => user.role === 'teacher').length;
    const admins = users.filter(user => user.role === 'admin').length;
    const activeUsers = users.filter(user => user.status === 'active' || user.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    return {
      total: totalUsers,
      students,
      teachers,
      admins,
      active: activeUsers,
      inactive: inactiveUsers
    };
  }, [users]);

  const fetchUsers = useCallback((role?: string): void => {
    const roleFilter = role === 'all' || !role ? undefined : (role as any);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    dispatch(fetchUsersThunk({ role: roleFilter, username: currentUser?.username }));
  }, [dispatch]);

  const handleRoleFilterChange = useCallback((newRole: string) => {
    setIsFiltering(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setFilterRole(newRole);
      fetchUsers(newRole);
      setIsFiltering(false);
    }, 500);
  }, [fetchUsers]);

  // Initial load only
  useEffect(() => {
    const roleFilter = filterRole === 'all' ? undefined : (filterRole as any);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    dispatch(fetchUsersThunk({ role: roleFilter, username: currentUser?.username }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      isActive: user.status === 'active',
      phone: user.phone || ''
    });
  
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      const updateData = {
        phone: editFormData.phone,
        isActive: editFormData.isActive
      };
      
      // Gọi API thông qua slice - slice sẽ tự động cập nhật state
      await dispatch(updateUserThunk({ userId: editingUser.id, userData: updateData }));
      
      setEditDialogOpen(false);
      setEditingUser(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleSendEmail = (user: User) => {
    const subject = encodeURIComponent('Thông báo từ hệ thống quản lý lớp học');
    const body = encodeURIComponent(`Xin chào ${user.fullName},\n\nĐây là email được gửi từ hệ thống quản lý lớp học.\n\nTrân trọng,\nBan quản trị`);
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'teacher': return 'Giảng viên';
      case 'student': return 'Sinh viên';
      case 'admin': return 'Quản trị viên';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'primary';
      case 'student': return 'secondary';
      case 'admin': return 'error';
      default: return 'default';
    }
  };


  const handleRefresh = (): void => {
    setIsFiltering(true);
    fetchUsers(filterRole);
    setTimeout(() => setIsFiltering(false), 500);
  };

  // Sử dụng DataGrid API để export với ref
  const handleExportData = (): void => {
    if (dataGridRef.current) {
      // Sử dụng API của DataGrid để export
      dataGridRef.current.exportDataAsCsv({
        fileName: `users_${dayjs().format('YYYY-MM-DD')}`,
        utf8WithBom: true, // Thêm BOM cho tiếng Việt
        includeHeaders: true,
        delimiter: ',',
        getRowsToExport: () => {
          // Trả về array của row IDs
          return users.map(user => user.id);
        }
      });
    }
  };


  // DataGrid columns configuration với flex layout - Tối ưu width để fill hết table
  const columns: GridColDef[] = [
    {
      field: 'username',
      headerName: 'ID',
      flex: 0.10, // 10% width
      minWidth: 80,
      filterable: true,
      sortable: true
    },
    {
      field: 'fullName',
      headerName: 'Họ và tên',
      flex: 0.20, // 20% width
      minWidth: 150,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
          <PersonIcon color="action" sx={{ marginTop: '2px', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ 
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            lineHeight: 1.4
          }}>
            {params?.value || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'code',
      headerName: 'Mã số',
      flex: 0.10, // 10% width
      minWidth: 80,
      filterable: true,
      sortable: true,
      renderCell: (params: any) => {
        const user = params?.row;
        
        if (!user) return 'N/A';
        
        let code = 'N/A';
        if (user.role === 'teacher') {
          code = user.teacherCode || 'N/A';
        } else if (user.role === 'student') {
          code = user.studentCode || 'N/A';
        } else if (user.role === 'admin') {
          code = 'ADMIN';
        }
        
        return code;
      }
    },
    {
      field: 'role',
      headerName: 'Vai trò',
      flex: 0.12, // 12% width
      minWidth: 100,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Chip 
          label={getRoleText(params?.value || '')} 
          color={getRoleColor(params?.value || '') as any}
          size="small"
        />
      )
    },
    {
      field: 'phone',
      headerName: 'Số điện thoại',
      flex: 0.12, // 12% width
      minWidth: 100,
      filterable: true,
      sortable: true,
      renderCell: (params: any) => {
        const phone = params?.row?.phone || params?.value;
        return phone || 'N/A';
      }
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 0.28, // 28% width - cột email chiếm nhiều không gian nhất
      minWidth: 200,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          lineHeight: 1.4
        }}>
          {params?.value || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      flex: 0.10, // 10% width
      minWidth: 100,
      filterable: true,
      sortable: true,
      renderCell: (params) => {
        if (!params?.row) return <Chip label="N/A" size="small" />;
        return (
          <Chip
            label={params.row.status === 'active' || params.row.isActive ? 'Hoạt động' : 'Đã khóa'}
            color={params.row.status === 'active' || params.row.isActive ? 'success' : 'error'}
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ cursor: 'pointer' }}
          />
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Thao tác',
      flex: 0.08, // 8% width
      minWidth: 100,
      getActions: (params: GridRowParams) => {
        if (!params?.row) return [];
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Chỉnh sửa"
            onClick={() => handleEdit(params.row)}
            color="primary"
          />,
          <GridActionsCellItem
            icon={<EmailIcon />}
            label="Gửi email"
            onClick={() => handleSendEmail(params.row)}
          />
        ];
      }
    }
  ];

  if (usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      width: '100%',
      minWidth: '1200px', // Kích thước tối thiểu
      maxWidth: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {usersError}
        </Alert>
      )}

        {/* Statistics Cards */}
      <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: 2, 
          mb: 3,
          width: '100%',
          minWidth: '1200px', // Kích thước tối thiểu
          maxWidth: '100%',
          overflow: 'hidden',
          flexShrink: 0 // Không cho phép co lại
        }}>
          <Card sx={{ 
            height: 120, 
            minWidth: 150,
            maxWidth: 200,
            flex: '0 0 auto'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                    Tổng người dùng
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {userStats.total}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            height: 120, 
            minWidth: 150,
            maxWidth: 200,
            flex: '0 0 auto'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                    Sinh viên
                  </Typography>
                  <Typography variant="h5" component="div" color="secondary.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {userStats.students}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            height: 120, 
            minWidth: 150,
            maxWidth: 200,
            flex: '0 0 auto'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                    Giảng viên
                  </Typography>
                  <Typography variant="h5" component="div" color="info.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {userStats.teachers}
                  </Typography>
                </Box>
                <PersonAddIcon sx={{ fontSize: 28, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            height: 120, 
            minWidth: 150,
            maxWidth: 200,
            flex: '0 0 auto'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                    Hoạt động
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {userStats.active}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 28, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            height: 120, 
            minWidth: 150,
            maxWidth: 200,
            flex: '0 0 auto'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                    Đã khóa
                  </Typography>
                  <Typography variant="h5" component="div" color="error.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {userStats.inactive}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 28, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            height: 120, 
            minWidth: 150,
            maxWidth: 200,
            flex: '0 0 auto'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '0.65rem' }}>
                    Quản trị viên
                  </Typography>
                  <Typography variant="h5" component="div" color="warning.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {userStats.admins}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 28, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Actions */}
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 180, maxWidth: 200 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Lọc theo vai trò</InputLabel>
            <Select
              value={filterRole}
                  onChange={(e: any) => handleRoleFilterChange(e.target.value)}
              label="Lọc theo vai trò"
                  size="small"
                  disabled={isFiltering}
                  sx={{ 
                    fontSize: '0.75rem',
                    opacity: isFiltering ? 0.7 : 1,
                    transition: 'opacity 0.2s ease-in-out'
                  }}
            >
              {roleOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id} sx={{ fontSize: '0.75rem' }}>
                  {option.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
              
              <Tooltip title="Làm mới dữ liệu">
                <IconButton 
                  onClick={handleRefresh}
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
              
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportData}
                size="small"
                sx={{ 
                  fontSize: '0.75rem',
                  minWidth: 120
                }}
              >
                Xuất dữ liệu
              </Button>
              
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/users/create')}
                size="small"
                sx={{ 
                  fontSize: '0.75rem',
                  minWidth: 140
                }}
        >
          Thêm người dùng
        </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* DataGrid với flex layout */}
        <Paper sx={{ 
          height: 600, 
          width: '100%', 
          maxWidth: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {isFiltering && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <CircularProgress size={40} />
                  </Box>
          )}
          <DataGrid
            apiRef={dataGridRef}
            rows={users}
            columns={columns}
            getRowId={(row) => row.id}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            loading={usersLoading || isFiltering}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
            }}
            disableRowSelectionOnClick
            disableColumnFilter
            disableColumnMenu={false}
            disableColumnResize={false} // Cho phép resize cột
            autoPageSize={false}
            sx={{
              height: 600,
              width: '100%',
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
                display: 'flex',
                alignItems: 'flex-start',
                paddingTop: '8px',
                paddingBottom: '8px',
              },
              '& .MuiDataGrid-row': {
                minHeight: '60px !important',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              },
            }}
            density="comfortable"
            checkboxSelection={false}
            disableColumnSelector={false}
            disableDensitySelector={false}
          />
        </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent>
          {editingUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <Typography component="span" fontWeight="bold">Người dùng:</Typography> {editingUser.fullName}
              </Typography>
              
              <TextField
                fullWidth
                label="Số điện thoại"
                value={editFormData.phone}
                onChange={(e: any) => setEditFormData({
                  ...editFormData,
                  phone: e.target.value
                })}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isActive}
                    onChange={(e: any) => setEditFormData({
                      ...editFormData,
                      isActive: e.target.checked
                    })}
                  />
                }
                label="Hoạt động"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={!editingUser}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
