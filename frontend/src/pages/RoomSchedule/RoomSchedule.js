import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';

function RoomSchedule() {
  const [filterParams, setFilterParams] = useState({
    roomType: 'all',
    searchTerm: '',
  });

  // Mock data - replace with API call
  const rows = [
    { 
      id: 1, 
      roomNumber: 'A101', 
      type: 'Lý thuyết', 
      capacity: 50,
      status: 'Trống',
      currentClass: '-',
      nextClass: 'CNPM - 15:00'
    },
    { 
      id: 2, 
      roomNumber: 'B201', 
      type: 'Thực hành', 
      capacity: 30,
      status: 'Đang sử dụng',
      currentClass: 'KTPM - 13:00',
      nextClass: 'CNPM - 15:00'
    },
    // Add more mock data here
  ];

  const columns = [
    { 
      field: 'roomNumber', 
      headerName: 'Số phòng', 
      width: 130 
    },
    { 
      field: 'type', 
      headerName: 'Loại phòng', 
      width: 130 
    },
    { 
      field: 'capacity', 
      headerName: 'Sức chứa', 
      width: 130,
      type: 'number'
    },
    { 
      field: 'status', 
      headerName: 'Trạng thái', 
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === 'Trống' ? '#4caf50' : '#ff9800',
            color: 'white',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '0.875rem'
          }}
        >
          {params.value}
        </Box>
      )
    },
    { 
      field: 'currentClass', 
      headerName: 'Lớp hiện tại', 
      width: 180 
    },
    { 
      field: 'nextClass', 
      headerName: 'Lớp tiếp theo', 
      width: 180 
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button 
            variant="contained" 
            size="small" 
            sx={{ mr: 1 }}
            onClick={() => handleEditRoom(params.row)}
          >
            Sửa
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleViewSchedule(params.row)}
          >
            Lịch
          </Button>
        </Box>
      ),
    },
  ];

  const handleEditRoom = (room) => {
    // TODO: Implement edit room logic
    console.log('Edit room:', room);
  };

  const handleViewSchedule = (room) => {
    // TODO: Implement view schedule logic
    console.log('View schedule:', room);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Quản lý phòng học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Implement add room */}}
        >
          Thêm phòng
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              name="searchTerm"
              value={filterParams.searchTerm}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Loại phòng</InputLabel>
              <Select
                name="roomType"
                value={filterParams.roomType}
                label="Loại phòng"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="theory">Lý thuyết</MenuItem>
                <MenuItem value="practice">Thực hành</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>
    </Box>
  );
}

export default RoomSchedule; 