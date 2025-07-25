import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Room as RoomIcon,
} from '@mui/icons-material';

function StatCard({ title, value, icon, color }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
            }}
          >
            {React.cloneElement(icon, { sx: { color: color } })}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const stats = [
    {
      title: 'Tổng số phòng',
      value: '50',
      icon: <RoomIcon />,
      color: '#2196f3',
    },
    {
      title: 'Phòng lý thuyết',
      value: '30',
      icon: <SchoolIcon />,
      color: '#4caf50',
    },
    {
      title: 'Phòng thực hành',
      value: '20',
      icon: <SchoolIcon />,
      color: '#ff9800',
    },
    {
      title: 'Lịch học hôm nay',
      value: '24',
      icon: <EventIcon />,
      color: '#f44336',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Tổng quan
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thống kê sử dụng phòng học
            </Typography>
            {/* TODO: Add chart component here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lịch học hôm nay
            </Typography>
            {/* TODO: Add schedule list component here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 