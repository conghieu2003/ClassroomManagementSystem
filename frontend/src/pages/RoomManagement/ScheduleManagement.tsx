import React, { useState, useEffect } from 'react';
import { scheduleService, roomService } from '../../services/api';
import WeeklySchedule from '../../components/Schedule/WeeklySchedule';
import { Schedule, Room } from '../../types';

interface NewSchedule {
  subjectId: string;
  roomId: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  studentCount: number;
}

const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    subjectId: '',
    roomId: '',
    teacherId: '',
    date: '',
    startTime: '',
    endTime: '',
    studentCount: 0,
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [roomsResponse] = await Promise.all([
          roomService.getAllRooms(),
        ]);
        setRooms(roomsResponse.data || []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchRoomSchedules(selectedRoom);
    }
  }, [selectedRoom]);

  const fetchRoomSchedules = async (roomId: string): Promise<void> => {
    try {
      const response = await scheduleService.getRoomSchedule(roomId);
      setSchedules(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải lịch phòng học:', error);
    }
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedRoom(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: name === 'studentCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await scheduleService.createSchedule(newSchedule);
      // Refresh schedules after creating new one
      if (selectedRoom) {
        fetchRoomSchedules(selectedRoom);
      }
      // Reset form
      setNewSchedule({
        subjectId: '',
        roomId: '',
        teacherId: '',
        date: '',
        startTime: '',
        endTime: '',
        studentCount: 0,
      });
    } catch (error) {
      console.error('Lỗi khi tạo lịch học:', error);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="schedule-management">
      <div className="page-header">
        <h2>Quản lý lịch học</h2>
      </div>

      <div className="schedule-controls">
        <div className="room-selector">
          <label>Chọn phòng học:</label>
          <select value={selectedRoom} onChange={handleRoomChange}>
            <option value="">-- Chọn phòng --</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - Sức chứa: {room.capacity}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          <h3>Thêm lịch học mới</h3>
          
          <div className="form-group">
            <label>Môn học:</label>
            <input
              type="text"
              name="subjectId"
              value={newSchedule.subjectId}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phòng học:</label>
            <select
              name="roomId"
              value={newSchedule.roomId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - Sức chứa: {room.capacity}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Giảng viên:</label>
            <input
              type="text"
              name="teacherId"
              value={newSchedule.teacherId}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ngày:</label>
            <input
              type="date"
              name="date"
              value={newSchedule.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giờ bắt đầu:</label>
              <input
                type="time"
                name="startTime"
                value={newSchedule.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Giờ kết thúc:</label>
              <input
                type="time"
                name="endTime"
                value={newSchedule.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Số lượng sinh viên:</label>
            <input
              type="number"
              name="studentCount"
              value={newSchedule.studentCount}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Thêm lịch học
          </button>
        </form>
      </div>

      <div className="schedule-display">
        <h3>Lịch học hiện tại</h3>
        {selectedRoom ? (
          <WeeklySchedule schedules={schedules} />
        ) : (
          <p>Vui lòng chọn phòng học để xem lịch</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleManagement;
