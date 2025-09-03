import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid, LoadPanel } from 'devextreme-react';
import { AppDispatch, RootState } from '../../redux/store';
import { 
  fetchRoomsThunk,
  selectRooms, 
  selectRoomsLoading, 
  selectRoomsError,
  Room 
} from '../../redux/slices/roomSlice';

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const rooms = useSelector(selectRooms);
  const roomsLoading = useSelector(selectRoomsLoading);
  const roomsError = useSelector(selectRoomsError);

  useEffect(() => {
    if (rooms.length === 0) {
      dispatch(fetchRoomsThunk());
    }
  }, [dispatch, rooms.length]);

  const selectedRoom = rooms.find(room => room.id === roomId);

  if (roomsLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <LoadPanel
          visible={true}
          showIndicator={true}
          shading={true}
          showPane={true}
          shadingColor="rgba(0,0,0,0.4)"
        />
      </div>
    );
  }

  if (roomsError) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #f5c6cb'
        }}>
          Lỗi: {roomsError}
        </div>
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          color: '#0c5460', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #bee5eb'
        }}>
          Không tìm thấy phòng học
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#28a745';
      case 'inUse':
        return '#dc3545';
      case 'maintenance':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'inUse':
        return 'Đang sử dụng';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return 'Không xác định';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'Lý thuyết';
      case 'lab':
        return 'Thực hành';
      case 'seminar':
        return 'Seminar';
      case 'online':
        return 'Trực tuyến';
      default:
        return type;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          borderBottom: '2px solid #007bff',
          paddingBottom: '10px'
        }}>
          Chi tiết phòng học: {selectedRoom.roomNumber}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ color: '#555', marginBottom: '15px' }}>Thông tin cơ bản</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Tên phòng:</strong> {selectedRoom.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Số phòng:</strong> {selectedRoom.roomNumber}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Tòa nhà:</strong> {selectedRoom.building}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Tầng:</strong> {selectedRoom.floor}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Sức chứa:</strong> {selectedRoom.capacity} người
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Loại phòng:</strong> {getTypeText(selectedRoom.type)}
            </div>
            {selectedRoom.campus && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Cơ sở:</strong> {selectedRoom.campus}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ color: '#555', marginBottom: '15px' }}>Trạng thái hiện tại</h3>
            <div style={{ marginBottom: '15px' }}>
              <strong>Trạng thái:</strong>
              <span style={{
                backgroundColor: getStatusColor(selectedRoom.status),
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                marginLeft: '10px',
                fontSize: '14px'
              }}>
                {getStatusText(selectedRoom.status)}
              </span>
            </div>
            {selectedRoom.currentClass && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Lớp hiện tại:</strong> {selectedRoom.currentClass}
              </div>
            )}
            {selectedRoom.currentSubject && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Môn học:</strong> {selectedRoom.currentSubject}
              </div>
            )}
            {selectedRoom.currentTeacher && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Giảng viên:</strong> {selectedRoom.currentTeacher}
              </div>
            )}
            {selectedRoom.schedule && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Lịch học:</strong> {selectedRoom.schedule}
              </div>
            )}
          </div>
        </div>

        {selectedRoom.description && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#555', marginBottom: '15px' }}>Mô tả</h3>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '5px',
              border: '1px solid #e9ecef'
            }}>
              {selectedRoom.description}
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px'
      }}>
        <h3 style={{ color: '#555', marginBottom: '15px' }}>Lịch sử sử dụng</h3>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #e9ecef',
          textAlign: 'center',
          color: '#6c757d'
        }}>
          Tính năng này sẽ được phát triển trong tương lai
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
