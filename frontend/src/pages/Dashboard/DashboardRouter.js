import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const DashboardRouter = () => {
  const userRole = authService.getUserRole();

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      // Nếu không có role hợp lệ, đăng xuất và chuyển về trang login
      authService.logout();
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter; 