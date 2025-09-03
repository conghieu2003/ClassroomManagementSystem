import React, { useState, useEffect } from 'react';
import { DataGrid } from 'devextreme-react/data-grid';
import { LoadPanel } from 'devextreme-react/load-panel';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react/select-box';
import { Popup } from 'devextreme-react/popup';
import { TextBox } from 'devextreme-react/text-box';
import { TextArea } from 'devextreme-react/text-area';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { 
  fetchRoomsThunk, 
  createRoomRequestThunk,
  selectRooms, 
  selectRoomsLoading, 
  selectRoomsError,
  Room 
} from '../../redux/slices/roomSlice';

interface StatusOption {
  id: string;
  text: string;
}

interface ExtendedRoom extends Room {
  currentClass?: string;
  currentSubject?: string;
  currentTeacher?: string;
  schedule?: string;
}

interface RoomRequest {
  roomId: string;
  requestType: 'change' | 'request';
  reason: string;
  requestedDate?: string;
  requestedTime?: string;
}

const RoomManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rooms = useSelector(selectRooms);
  const roomsLoading = useSelector(selectRoomsLoading);
  const roomsError = useSelector(selectRoomsError);
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [requestPopupVisible, setRequestPopupVisible] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<ExtendedRoom | null>(null);
  const [requestType, setRequestType] = useState<'change' | 'request'>('request');
  const [requestReason, setRequestReason] = useState<string>('');
  const [requestedDate, setRequestedDate] = useState<string>('');
  const [requestedTime, setRequestedTime] = useState<string>('');

  const statusOptions: StatusOption[] = [{
    id: 'all',
    text: 'Tất cả'
  }, {
    id: 'available',
    text: 'Phòng trống'
  }, {
    id: 'inUse',
    text: 'Đang sử dụng'
  }, {
    id: 'maintenance',
    text: 'Bảo trì'
  }];

  useEffect(() => {
    dispatch(fetchRoomsThunk());
  }, [dispatch]);

  const handleRequestRoom = (room: ExtendedRoom, type: 'change' | 'request'): void => {
    setSelectedRoom(room);
    setRequestType(type);
    setRequestReason('');
    setRequestedDate('');
    setRequestedTime('');
    setRequestPopupVisible(true);
  };

  const handleSubmitRequest = async (): Promise<void> => {
    if (!selectedRoom || !requestReason.trim()) {
      alert('Vui lòng nhập lý do!');
      return;
    }

    try {
      const requestData = {
        roomId: selectedRoom.id,
        requestType,
        reason: requestReason,
        requestedDate: requestedDate || undefined,
        requestedTime: requestedTime || undefined
      };

      const result = await dispatch(createRoomRequestThunk(requestData)).unwrap();
      
      alert(requestType === 'change' ? 'Yêu cầu đổi phòng đã được gửi!' : 'Yêu cầu xin phòng đã được gửi!');
      setRequestPopupVisible(false);
      setSelectedRoom(null);
      setRequestReason('');
      setRequestedDate('');
      setRequestedTime('');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert(error.message || 'Có lỗi xảy ra khi gửi yêu cầu!');
    }
  };

  const columns = [{
    dataField: 'roomNumber',
    caption: 'Số phòng',
    width: 100
  }, {
    dataField: 'building',
    caption: 'Tòa nhà',
    width: 120
  }, {
    dataField: 'floor',
    caption: 'Tầng',
    width: 80,
    alignment: 'right' as const
  }, {
    dataField: 'capacity',
    caption: 'Sức chứa',
    width: 100,
    alignment: 'right' as const
  }, {
    dataField: 'type',
    caption: 'Loại phòng',
    width: 150,
    lookup: {
      dataSource: [
        { id: 'lecture', text: 'Lý thuyết' },
        { id: 'lab', text: 'Thực hành' },
        { id: 'seminar', text: 'Seminar' },
        { id: 'online', text: 'Trực tuyến' }
      ],
      displayExpr: 'text',
      valueExpr: 'id'
    }
  }, {
    dataField: 'status',
    caption: 'Trạng thái',
    width: 120,
    cellTemplate: (container: any, options: any) => {
      const room = options.data;
      const status = room.status;
      
      let color = '#4caf50';
      let text = 'Trống';
      
      if (status === 'inUse') {
        color = '#f44336';
        text = 'Đang sử dụng';
      } else if (status === 'maintenance') {
        color = '#ff9800';
        text = 'Bảo trì';
      }
      
      const statusDiv = document.createElement('div');
      statusDiv.style.backgroundColor = color;
      statusDiv.style.color = 'white';
      statusDiv.style.padding = '4px 8px';
      statusDiv.style.borderRadius = '4px';
      statusDiv.style.textAlign = 'center';
      statusDiv.textContent = text;
      
      container.appendChild(statusDiv);
    }
  }, {
    dataField: 'currentClass',
    caption: 'Lớp hiện tại',
    width: 150,
    cellTemplate: (container: any, options: any) => {
      const room = options.data;
      if (room.currentClass) {
        container.textContent = room.currentClass;
      } else {
        container.textContent = 'Không có';
      }
    }
  }, {
    dataField: 'currentSubject',
    caption: 'Môn học',
    width: 150,
    cellTemplate: (container: any, options: any) => {
      const room = options.data;
      if (room.currentSubject) {
        container.textContent = room.currentSubject;
      } else {
        container.textContent = 'Không có';
      }
    }
  }, {
    dataField: 'currentTeacher',
    caption: 'Giảng viên',
    width: 150,
    cellTemplate: (container: any, options: any) => {
      const room = options.data;
      if (room.currentTeacher) {
        container.textContent = room.currentTeacher;
      } else {
        container.textContent = 'Không có';
      }
    }
  }, {
    dataField: 'schedule',
    caption: 'Thời gian học',
    width: 150,
    cellTemplate: (container: any, options: any) => {
      const room = options.data;
      if (room.schedule) {
        container.textContent = room.schedule;
      } else {
        container.textContent = 'Không có';
      }
    }
  }, {
    caption: 'Thao tác',
    width: 200,
    cellTemplate: (container: any, options: any) => {
      const room = options.data;
      
      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.gap = '8px';
      
      // Xác định trạng thái phòng
      const isAvailable = room.status === 'available';
      const isInUse = room.status === 'inUse';
      const isMaintenance = room.status === 'maintenance';
      
      // Nút đổi phòng (chỉ hiển thị khi phòng đang được sử dụng)
      if (isInUse && !isMaintenance) {
        const changeBtn = document.createElement('button');
        changeBtn.textContent = 'Đổi phòng';
        changeBtn.style.padding = '4px 8px';
        changeBtn.style.backgroundColor = '#ff9800';
        changeBtn.style.color = 'white';
        changeBtn.style.border = 'none';
        changeBtn.style.borderRadius = '4px';
        changeBtn.style.cursor = 'pointer';
        changeBtn.onclick = () => handleRequestRoom(room, 'change');
        actionsDiv.appendChild(changeBtn);
      }
      
      // Nút xin phòng (chỉ hiển thị khi phòng trống)
      if (isAvailable && !isMaintenance) {
        const requestBtn = document.createElement('button');
        requestBtn.textContent = 'Xin phòng';
        requestBtn.style.padding = '4px 8px';
        requestBtn.style.backgroundColor = '#007bff';
        requestBtn.style.color = 'white';
        requestBtn.style.border = 'none';
        requestBtn.style.borderRadius = '4px';
        requestBtn.style.cursor = 'pointer';
        requestBtn.onclick = () => handleRequestRoom(room, 'request');
        actionsDiv.appendChild(requestBtn);
      }
      
      // Nếu không có action nào, hiển thị "Không có"
      if (actionsDiv.children.length === 0) {
        const noAction = document.createElement('span');
        noAction.textContent = 'Không có';
        noAction.style.color = '#999';
        actionsDiv.appendChild(noAction);
      }
      
      container.appendChild(actionsDiv);
    }
  }];

  const handleRefresh = (): void => {
    dispatch(fetchRoomsThunk());
  };

  const filteredRooms = (): ExtendedRoom[] => {
    if (filterStatus === 'all') return rooms;
    
    return rooms.filter(room => {
      if (filterStatus === 'available') {
        return room.status === 'available';
      } else if (filterStatus === 'inUse') {
        return room.status === 'inUse';
      } else if (filterStatus === 'maintenance') {
        return room.status === 'maintenance';
      }
      return true;
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <LoadPanel
        visible={roomsLoading}
        showIndicator={true}
        shading={true}
        showPane={true}
        shadingColor="rgba(0,0,0,0.4)"
      />

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SelectBox
            items={statusOptions}
            value={filterStatus}
            onValueChanged={(e: any) => setFilterStatus(e.value)}
            width={200}
            displayExpr="text"
            valueExpr="id"
          />
          <Button
            icon="refresh"
            onClick={handleRefresh}
            stylingMode="contained"
          />
        </div>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>Quản lý phòng học</h2>
        </div>
      </div>

      <DataGrid
        dataSource={filteredRooms()}
        columns={columns}
        showBorders={true}
        rowAlternationEnabled={true}
        showColumnLines={true}
        showRowLines={true}
        columnAutoWidth={true}
        wordWrapEnabled={true}
        height="calc(100vh - 200px)"
        paging={{
          pageSize: 10
        }}
        pager={{
          showPageSizeSelector: true,
          allowedPageSizes: [5, 10, 20],
          showInfo: true
        }}
      />

      {/* Request Room Popup */}
      <Popup
        visible={requestPopupVisible}
        onHiding={() => {
          setRequestPopupVisible(false);
          setSelectedRoom(null);
          setRequestReason('');
          setRequestedDate('');
          setRequestedTime('');
        }}
        title={requestType === 'change' ? 'Yêu cầu đổi phòng' : 'Yêu cầu xin phòng'}
        width={500}
        height={400}
        showTitle={true}
        dragEnabled={false}
        closeOnOutsideClick={true}
      >
        <div style={{ padding: '20px' }}>
          {selectedRoom && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <strong>Phòng:</strong> {selectedRoom.roomNumber} - {selectedRoom.building}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Lý do {requestType === 'change' ? 'đổi phòng' : 'xin phòng'}:
                </label>
                <TextArea
                  value={requestReason}
                  onValueChanged={(e: any) => setRequestReason(e.value)}
                  placeholder="Nhập lý do..."
                  height={80}
                />
              </div>

              {requestType === 'request' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Ngày muốn sử dụng:
                    </label>
                    <TextBox
                      value={requestedDate}
                      onValueChanged={(e: any) => setRequestedDate(e.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Thời gian muốn sử dụng:
                    </label>
                    <TextBox
                      value={requestedTime}
                      onValueChanged={(e: any) => setRequestedTime(e.value)}
                      placeholder="HH:MM - HH:MM"
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button
                  text="Hủy"
                  stylingMode="outlined"
                  onClick={() => {
                    setRequestPopupVisible(false);
                    setSelectedRoom(null);
                    setRequestReason('');
                    setRequestedDate('');
                    setRequestedTime('');
                  }}
                />
                <Button
                  text="Gửi yêu cầu"
                  stylingMode="contained"
                  type="default"
                  onClick={handleSubmitRequest}
                />
              </div>
            </>
          )}
        </div>
      </Popup>
    </div>
  );
};

export default RoomManagement;
