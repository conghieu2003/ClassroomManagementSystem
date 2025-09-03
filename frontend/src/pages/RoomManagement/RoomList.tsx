import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../../services/api';
import { Room } from '../../types';

interface Filters {
  status: string;
  type: string;
  capacity: string;
}

interface ExtendedRoom extends Room {
  location?: string;
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<ExtendedRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    type: 'all',
    capacity: 'all'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (): Promise<void> => {
    try {
      const response = await roomService.getAllRooms();
      setRooms(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredRooms = rooms.filter(room => {
    if (filters.status !== 'all' && room.status !== filters.status) return false;
    if (filters.type !== 'all' && room.type !== filters.type) return false;
    if (filters.capacity !== 'all') {
      const capacity = parseInt(room.capacity.toString());
      switch (filters.capacity) {
        case 'small': return capacity <= 30;
        case 'medium': return capacity > 30 && capacity <= 60;
        case 'large': return capacity > 60;
        default: return true;
      }
    }
    return true;
  });

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="room-list-page">
      <div className="page-header">
        <h2>Quản lý phòng học</h2>
        <Link to="/rooms/create" className="create-btn">
          <i className="fas fa-plus"></i>
          Thêm phòng học mới
        </Link>
      </div>

      <div className="filters-section">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Trống</option>
          <option value="inUse">Đang sử dụng</option>
          <option value="maintenance">Bảo trì</option>
        </select>

        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="all">Tất cả loại phòng</option>
          <option value="theory">Phòng lý thuyết</option>
          <option value="lab">Phòng thực hành</option>
          <option value="seminar">Phòng hội thảo</option>
        </select>

        <select
          name="capacity"
          value={filters.capacity}
          onChange={handleFilterChange}
        >
          <option value="all">Tất cả sức chứa</option>
          <option value="small">Nhỏ (&le; 30)</option>
          <option value="medium">Trung bình (31-60)</option>
          <option value="large">Lớn (&gt; 60)</option>
        </select>
      </div>

      <div className="room-grid">
        {filteredRooms.map((room) => (
          <div key={room.id} className={`room-card ${room.status}`}>
            <div className="room-header">
              <h3>{room.name}</h3>
              <span className={`status-badge ${room.status}`}>
                {room.status === 'available' && 'Trống'}
                {room.status === 'inUse' && 'Đang sử dụng'}
                {room.status === 'maintenance' && 'Bảo trì'}
              </span>
            </div>
            
            <div className="room-info">
              <p>
                <i className="fas fa-users"></i>
                Sức chứa: {room.capacity} sinh viên
              </p>
              <p>
                <i className="fas fa-door-open"></i>
                Loại phòng: {room.type === 'theory' ? 'Lý thuyết' : room.type === 'lab' ? 'Thực hành' : 'Hội thảo'}
              </p>
              <p>
                <i className="fas fa-map-marker-alt"></i>
                Vị trí: {room.location || 'Chưa xác định'}
              </p>
            </div>

            <div className="room-actions">
              <Link to={`/rooms/${room.id}`} className="view-btn">
                Chi tiết
              </Link>
              <Link to={`/rooms/${room.id}/edit`} className="edit-btn">
                Chỉnh sửa
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
