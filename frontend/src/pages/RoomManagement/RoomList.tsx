import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoomsThunk, selectRooms, selectRoomsLoading, selectRoomsError, clearRooms } from '../../redux/slices/roomSlice';
import { Room } from '../../types';
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
  Paper
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  useGridApiRef
} from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  MeetingRoom as RoomIcon,
  School as TheoryIcon,
  Science as LabIcon,
  Groups as SeminarIcon,
  Computer as OnlineIcon,
  Business as PracticeIcon
} from '@mui/icons-material';

interface ExtendedRoom extends Room {
  location?: string;
}

const RoomList = () => {
  const dispatch = useDispatch();
  const rooms = useSelector(selectRooms) as ExtendedRoom[];
  const loading = useSelector(selectRoomsLoading);
  const error = useSelector(selectRoomsError);
  const [refreshKey, setRefreshKey] = useState(0);
  const dataGridRef = useGridApiRef();

  useEffect(() => {
    console.log('🔄 Đang dispatch fetchRoomsThunk...');
    dispatch(fetchRoomsThunk() as any);
  }, [dispatch, refreshKey]);

  const handleRefresh = (): void => {
    console.log('🔄 Đang refresh danh sách phòng...');
    // Clear rooms state trước khi fetch lại
    dispatch(clearRooms());
    setRefreshKey(prev => prev + 1);
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'theory': return 'Lý thuyết';
      case 'lecture': return 'Lý thuyết'; // Fallback cho dữ liệu cũ
      case 'lab': return 'Thực hành';
      case 'practice': return 'Thực hành';
      case 'seminar': return 'Hội thảo';
      case 'online': return 'Trực tuyến';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory':
      case 'lecture': return 'primary';
      case 'lab': return 'secondary';
      case 'practice': return 'info';
      case 'seminar': return 'warning';
      case 'online': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'theory':
      case 'lecture': return <TheoryIcon />;
      case 'lab': return <LabIcon />;
      case 'practice': return <PracticeIcon />;
      case 'seminar': return <SeminarIcon />;
      case 'online': return <OnlineIcon />;
      default: return <RoomIcon />;
    }
  };

  // Tính thống kê phòng theo loại
  const roomStats = useMemo(() => {
    const stats = {
      total: rooms.length,
      theory: 0,
      lab: 0,
      practice: 0,
      seminar: 0,
      online: 0,
      other: 0
    };

    rooms.forEach(room => {
      switch (room.type) {
        case 'theory':
        case 'lecture':
          stats.theory++;
          break;
        case 'lab':
          stats.lab++;
          break;
        case 'practice':
          stats.practice++;
          break;
        case 'seminar':
          stats.seminar++;
          break;
        case 'online':
          stats.online++;
          break;
        default:
          stats.other++;
      }
    });

    return stats;
  }, [rooms]);

  // DataGrid columns configuration với flex layout
  const columns: GridColDef[] = [
    {
      field: 'roomNumber',
      headerName: 'Số phòng',
      flex: 0.15, // 15% width
      minWidth: 100,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RoomIcon color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'building',
      headerName: 'Tòa nhà',
      flex: 0.12, // 12% width
      minWidth: 80,
      filterable: true,
      sortable: true
    },
    {
      field: 'floor',
      headerName: 'Tầng',
      flex: 0.08, // 8% width
      minWidth: 60,
      filterable: true,
      sortable: true
    },
    {
      field: 'capacity',
      headerName: 'Sức chứa',
      flex: 0.12, // 12% width
      minWidth: 90,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {params.value} người
        </Typography>
      )
    },
    {
      field: 'type',
      headerName: 'Loại phòng',
      flex: 0.18, // 18% width
      minWidth: 120,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Chip
          icon={getTypeIcon(params.value)}
          label={getTypeText(params.value)}
          color={getTypeColor(params.value) as any}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'description',
      headerName: 'Mô tả',
      flex: 0.35, // 35% width - cột mô tả chiếm nhiều không gian nhất
      minWidth: 200,
      filterable: true,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          lineHeight: 1.4,
          maxWidth: '100%'
        }}>
          {params.value || 'Không có mô tả'}
        </Typography>
      )
    }
  ];

  if (loading) {
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
          Đang tải danh sách phòng học...
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
              <Typography variant="h6">Không thể tải danh sách phòng học</Typography>
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
              Quản lý phòng học
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
                  Tổng phòng
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {roomStats.total}
                </Typography>
              </Box>
              <RoomIcon sx={{ fontSize: 28, color: 'primary.main' }} />
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
                  Lý thuyết
                </Typography>
                <Typography variant="h5" component="div" color="primary.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {roomStats.theory}
                </Typography>
              </Box>
              <TheoryIcon sx={{ fontSize: 28, color: 'primary.main' }} />
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
                  Thực hành
                </Typography>
                <Typography variant="h5" component="div" color="secondary.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {roomStats.lab + roomStats.practice}
                </Typography>
              </Box>
              <LabIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
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
                  Hội thảo
                </Typography>
                <Typography variant="h5" component="div" color="warning.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {roomStats.seminar}
                </Typography>
              </Box>
              <SeminarIcon sx={{ fontSize: 28, color: 'warning.main' }} />
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
                  Trực tuyến
                </Typography>
                <Typography variant="h5" component="div" color="success.main" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {roomStats.online}
                </Typography>
              </Box>
              <OnlineIcon sx={{ fontSize: 28, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* DataGrid */}
      <Paper sx={{ 
        height: 600, 
        width: '100%', 
        maxWidth: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <DataGrid
          apiRef={dataGridRef}
          rows={rooms}
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
            '& .MuiDataGrid-columnHeader': {
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
    </Container>
  );
};

export default RoomList;