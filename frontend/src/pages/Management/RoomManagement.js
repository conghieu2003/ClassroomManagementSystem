import React, { useState, useEffect } from 'react';
import { DataGrid } from 'devextreme-react/data-grid';
import { LoadPanel } from 'devextreme-react/load-panel';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react/select-box';

const RoomManagement = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const statusOptions = [{
    id: 'all',
    text: 'Tất cả'
  }, {
    id: 'available',
    text: 'Phòng trống'
  }, {
    id: 'inUse',
    text: 'Đang sử dụng'
  }];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
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
    alignment: 'right'
  }, {
    dataField: 'capacity',
    caption: 'Sức chứa',
    width: 100,
    alignment: 'right'
  }, {
    dataField: 'type',
    caption: 'Loại phòng',
    width: 150,
    lookup: {
      dataSource: [
        { id: 'theory', text: 'Lý thuyết' },
        { id: 'practice', text: 'Thực hành' },
        { id: 'lab', text: 'Phòng lab' }
      ],
      displayExpr: 'text',
      valueExpr: 'id'
    }
  }, {
    dataField: 'facilities',
    caption: 'Trang thiết bị',
    width: 200
  }, {
    dataField: 'status',
    caption: 'Trạng thái',
    width: 120,
    cellRender: (cellData) => {
      const color = cellData.value === 'available' ? '#4caf50' : '#f44336';
      return (
        <div style={{
          backgroundColor: color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {cellData.value === 'available' ? 'Trống' : 'Đang sử dụng'}
        </div>
      );
    }
  }, {
    dataField: 'currentClass',
    caption: 'Lớp hiện tại',
    width: 200
  }];

  const handleRefresh = () => {
    fetchRooms();
  };

  const filteredRooms = () => {
    if (filterStatus === 'all') return rooms;
    return rooms.filter(room => room.status === filterStatus);
  };

  return (
    <div style={{ padding: '20px' }}>
      <LoadPanel
        visible={loading}
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
            onValueChanged={(e) => setFilterStatus(e.value)}
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
        <Button
          text="Thêm phòng học"
          icon="plus"
          type="default"
          stylingMode="contained"
          onClick={() => {/* TODO: Handle add room */}}
        />
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
    </div>
  );
};

export default RoomManagement; 