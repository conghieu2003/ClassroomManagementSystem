import React, { useState, useEffect } from 'react';
import { scheduleService, roomService, authService } from '../../services/api';
import { Schedule, Room, User } from '../../types';

interface RequestForm {
  scheduleId: string;
  currentRoomId: string;
  requestedRoomId: string;
  reason: string;
  requestDate: string;
}

interface ExtendedSchedule extends Schedule {
  subjectName?: string;
  roomName?: string;
  studentCount?: number;
  date?: Date;
}

const RoomRequest: React.FC = () => {
  const [schedules, setSchedules] = useState<ExtendedSchedule[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSchedule, setSelectedSchedule] = useState<ExtendedSchedule | null>(null);
  const [requestForm, setRequestForm] = useState<RequestForm>({
    scheduleId: '',
    currentRoomId: '',
    requestedRoomId: '',
    reason: '',
    requestDate: new Date().toISOString().split('T')[0]
  });

  const currentUser: User | null = authService.getCurrentUser();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!currentUser) return;
      
      try {
        const [schedulesResponse, roomsResponse] = await Promise.all([
          scheduleService.getTeacherSchedule(currentUser.id),
          roomService.getAllRooms()
        ]);
        setSchedules(schedulesResponse.data || []);
        setAvailableRooms(roomsResponse.data || []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleScheduleSelect = (schedule: ExtendedSchedule): void => {
    setSelectedSchedule(schedule);
    setRequestForm(prev => ({
      ...prev,
      scheduleId: schedule.id,
      currentRoomId: schedule.roomId
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      // Gửi yêu cầu đổi phòng
      await roomService.createRoomRequest({
        ...requestForm,
        teacherId: currentUser.id,
        status: 'pending'
      });

      // Reset form
      setRequestForm({
        scheduleId: '',
        currentRoomId: '',
        requestedRoomId: '',
        reason: '',
        requestDate: new Date().toISOString().split('T')[0]
      });
      setSelectedSchedule(null);

      alert('Yêu cầu đổi phòng đã được gửi thành công!');
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!');
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!currentUser) {
    return <div>Không thể tải thông tin người dùng</div>;
  }

  return (
    <div className="room-request-page">
      <div className="page-header">
        <h2>Yêu cầu đổi phòng học</h2>
      </div>

      <div className="request-content">
        <div className="schedule-list">
          <h3>Lịch dạy của bạn</h3>
          <div className="schedule-cards">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`schedule-card ${selectedSchedule?.id === schedule.id ? 'selected' : ''}`}
                onClick={() => handleScheduleSelect(schedule)}
              >
                <div className="schedule-info">
                  <h4>{schedule.subjectName || 'Không có tên môn học'}</h4>
                  <p>
                    <i className="fas fa-calendar"></i>
                    {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                  </p>
                  <p>
                    <i className="fas fa-clock"></i>
                    {schedule.startTime} - {schedule.endTime}
                  </p>
                  <p>
                    <i className="fas fa-door-open"></i>
                    Phòng: {schedule.roomName || 'Chưa xác định'}
                  </p>
                  <p>
                    <i className="fas fa-users"></i>
                    Số sinh viên: {schedule.studentCount || 'Chưa xác định'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedSchedule && (
          <form onSubmit={handleSubmit} className="request-form">
            <h3>Thông tin yêu cầu đổi phòng</h3>
            
            <div className="form-group">
              <label>Phòng học hiện tại:</label>
              <input
                type="text"
                value={selectedSchedule.roomName || 'Chưa xác định'}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phòng học mong muốn:</label>
              <select
                name="requestedRoomId"
                value={requestForm.requestedRoomId}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn phòng --</option>
                {availableRooms
                  .filter(room => room.id !== selectedSchedule.roomId)
                  .map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - Sức chứa: {room.capacity}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="form-group">
              <label>Lý do đổi phòng:</label>
              <textarea
                name="reason"
                value={requestForm.reason}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Vui lòng nêu rõ lý do cần đổi phòng..."
              />
            </div>

            <button type="submit" className="submit-btn">
              Gửi yêu cầu
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RoomRequest;
