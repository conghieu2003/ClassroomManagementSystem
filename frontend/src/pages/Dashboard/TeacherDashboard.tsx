import React, { useEffect, useState } from 'react';
import { authService, scheduleService } from '../../services/api';
import WeeklySchedule from '../../components/Schedule/WeeklySchedule';
import { Schedule, Teacher } from '../../types';

const TeacherDashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentUser: any = authService.getCurrentUser();

  useEffect(() => {
    const fetchSchedules = async (): Promise<void> => {
      if (!currentUser) return;
      
      try {
        const response = await scheduleService.getTeacherSchedule(String(currentUser.id));
        setSchedules(response.data || []);
      } catch (error) {
        console.error('Lỗi khi tải lịch dạy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [currentUser]);

  const handleRoomRequestClick = (schedule: Schedule): void => {
    // Xử lý yêu cầu đổi phòng
    console.log('Yêu cầu đổi phòng cho lịch:', schedule);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!currentUser) {
    return <div>Không thể tải thông tin người dùng</div>;
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h2>Xin chào, {currentUser.fullName}</h2>
        <div className="teacher-info">
          <p>Mã giảng viên: {currentUser.teacherCode || 'N/A'}</p>
          <p>Khoa: {currentUser.department || 'Chưa xác định'}</p>
          <p>Chức danh: {currentUser.title || 'Giảng viên'}</p>
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
          <p>{schedules.length}</p>
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
