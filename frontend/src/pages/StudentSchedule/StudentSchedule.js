import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function StudentSchedule() {
  const [selectedWeek, setSelectedWeek] = useState('current');

  // Mock data - replace with API call
  const timeSlots = [
    '7:00 - 9:00',
    '9:00 - 11:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
  ];

  const weekDays = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
  ];

  // Mock schedule data - replace with API call
  const scheduleData = {
    'Thứ 2-7:00 - 9:00': {
      subject: 'Công nghệ phần mềm',
      room: 'A101',
      teacher: 'Nguyễn Văn A',
    },
    'Thứ 3-13:00 - 15:00': {
      subject: 'Kỹ thuật phần mềm',
      room: 'B201',
      teacher: 'Trần Thị B',
    },
    'Thứ 4-9:00 - 11:00': {
      subject: 'Cơ sở dữ liệu',
      room: 'A202',
      teacher: 'Lê Văn C',
    },
  };

  const renderScheduleCell = (day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    const scheduleItem = scheduleData[key];

    if (scheduleItem) {
      return (
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            p: 1,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {scheduleItem.subject}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Phòng: {scheduleItem.room}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            GV: {scheduleItem.teacher}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Lịch học
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tuần học</InputLabel>
              <Select
                value={selectedWeek}
                label="Tuần học"
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                <MenuItem value="prev">Tuần trước</MenuItem>
                <MenuItem value="current">Tuần này</MenuItem>
                <MenuItem value="next">Tuần sau</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
              {weekDays.map((day) => (
                <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((timeSlot) => (
              <TableRow key={timeSlot}>
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    width: '150px'
                  }}
                >
                  {timeSlot}
                </TableCell>
                {weekDays.map((day) => (
                  <TableCell 
                    key={`${day}-${timeSlot}`} 
                    align="center"
                    sx={{
                      minWidth: '200px',
                      height: '100px',
                      '&:hover': {
                        backgroundColor: '#fafafa',
                      },
                    }}
                  >
                    {renderScheduleCell(day, timeSlot)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Thông tin lớp học
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Mã lớp:</strong> CNTT1
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Khoa:</strong> Công nghệ thông tin
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Niên khóa:</strong> 2023-2024
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default StudentSchedule; 