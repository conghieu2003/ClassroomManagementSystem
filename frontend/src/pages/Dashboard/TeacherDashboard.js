 import React, { useEffect, useState } from 'react';
import { authService, scheduleService } from '../../services/api';
import WeeklySchedule from '../../components/Schedule/WeeklySchedule';

const TeacherDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await scheduleService.getTeacherSchedule(currentUser.id);
        setSchedules(response.data);
      } catch (error) {
        console.error('Lỗi khi tải lịch dạy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [currentUser.id]);

  const handleRoomRequestClick = (schedule) => {
    // Xử lý yêu cầu đổi phòng
    console.log('Yêu cầu đổi phòng cho lịch:', schedule);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h2>Xin chào, {currentUser.fullName}</h2>
        <div className="teacher-info">
          <p>Mã giảng viên: {currentUser.teacherId}</p>
          <p>Khoa: {currentUser.department}</p>
          <p>Chức danh: {currentUser.title}</p>
        </div>
      </div>

      <div className="schedule-section">
        <h3>Lịch dạy trong tuần</h3>
        <WeeklySchedule 
          schedules={schedules} 
          onRoomRequestClick={handleRoomRequestClick}
        />
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h4>Tổng số lớp phụ trách</h4>
          <p>{new Set(schedules.map(s => s.classId)).size}</p>
        </div>
        <div className="summary-card">
          <h4>Số tiết dạy trong tuần</h4>
          <p>{schedules.reduce((sum, s) => sum + s.duration, 0)}</p>
        </div>
        <div className="summary-card">
          <h4>Số phòng học sử dụng</h4>
          <p>{new Set(schedules.map(s => s.roomId)).size}</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 