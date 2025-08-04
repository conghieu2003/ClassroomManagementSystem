import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>HỆ THỐNG QUẢN LÝ PHÒNG HỌC</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span>{currentUser?.fullName || 'Người dùng'}</span>
          <span className="role-badge">
            {currentUser?.role === 'admin' && 'Quản trị viên'}
            {currentUser?.role === 'teacher' && 'Giảng viên'}
            {currentUser?.role === 'student' && 'Sinh viên'}
          </span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header; 