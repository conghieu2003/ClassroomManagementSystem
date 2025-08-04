import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';

const Sidebar = () => {
  const userRole = authService.getUserRole();

  const renderMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <li>
              <Link to="/dashboard" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Trang chủ</span>
              </Link>
            </li>
            <li>
              <Link to="/users" className="nav-link">
                <i className="fas fa-users"></i>
                <span>Quản lý người dùng</span>
              </Link>
            </li>
            <li>
              <Link to="/rooms" className="nav-link">
                <i className="fas fa-door-open"></i>
                <span>Quản lý phòng học</span>
              </Link>
            </li>
            <li>
              <Link to="/subjects" className="nav-link">
                <i className="fas fa-book"></i>
                <span>Quản lý môn học</span>
              </Link>
            </li>
            <li>
              <Link to="/schedules" className="nav-link">
                <i className="fas fa-calendar-alt"></i>
                <span>Quản lý lịch học</span>
              </Link>
            </li>
          </>
        );
      case 'teacher':
        return (
          <>
            <li>
              <Link to="/dashboard" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Trang chủ</span>
              </Link>
            </li>
            <li>
              <Link to="/schedule" className="nav-link">
                <i className="fas fa-calendar-alt"></i>
                <span>Lịch dạy</span>
              </Link>
            </li>
            <li>
              <Link to="/room-requests" className="nav-link">
                <i className="fas fa-exchange-alt"></i>
                <span>Yêu cầu đổi phòng</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link">
                <i className="fas fa-user"></i>
                <span>Thông tin cá nhân</span>
              </Link>
            </li>
          </>
        );
      case 'student':
        return (
          <>
            <li>
              <Link to="/dashboard" className="nav-link">
                <i className="fas fa-home"></i>
                <span>Trang chủ</span>
              </Link>
            </li>
            <li>
              <Link to="/schedule" className="nav-link">
                <i className="fas fa-calendar-alt"></i>
                <span>Lịch học</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link">
                <i className="fas fa-user"></i>
                <span>Thông tin cá nhân</span>
              </Link>
            </li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Quản lý phòng học</h3>
      </div>
      <nav>
        <ul className="sidebar-menu">
          {renderMenuItems()}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 