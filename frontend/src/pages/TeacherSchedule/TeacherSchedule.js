import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
} from '@mui/material';
import { scheduleService, userService } from '../../services/api';

const TeacherSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const currentUser = userService.getCurrentUser();
        if (!currentUser) {
          setError('Vui lòng đăng nhập');
          return;
        }

        const data = await scheduleService.getTeacherSchedule(currentUser.id);
        setSchedules(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải lịch dạy');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const getDayOfWeekText = (day) => {
    const days = {
      1: 'Thứ 2',
      2: 'Thứ 3',
      3: 'Thứ 4',
      4: 'Thứ 5',
      5: 'Thứ 6',
      6: 'Thứ 7',
      7: 'Chủ nhật',
    };
    return days[day] || '';
  };

  const formatTime = (time) => {
    return new Date('1970-01-01T' + time).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>Đang tải...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lịch Dạy
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thứ</TableCell>
                <TableCell>Môn học</TableCell>
                <TableCell>Lớp</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Ngày bắt đầu</TableCell>
                <TableCell>Ngày kết thúc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.ScheduleId}>
                  <TableCell>{getDayOfWeekText(schedule.DayOfWeek)}</TableCell>
                  <TableCell>{schedule.SubjectName}</TableCell>
                  <TableCell>{schedule.ClassName}</TableCell>
                  <TableCell>{schedule.RoomName}</TableCell>
                  <TableCell>
                    {`${formatTime(schedule.StartTime)} - ${formatTime(schedule.EndTime)}`}
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.StartDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.EndDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default TeacherSchedule; 