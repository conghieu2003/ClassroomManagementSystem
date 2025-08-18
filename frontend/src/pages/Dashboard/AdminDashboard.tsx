import React, { useState, useEffect } from 'react';
import { DataGrid } from 'devextreme-react/data-grid';
import { LoadPanel } from 'devextreme-react/load-panel';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react/select-box';
import { Room } from '../../types';

interface RoomStats {
  total: number;
  inUse: number;
  available: number;
}

interface FilterOption {
  id: string;
  text: string;
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [roomStats, setRoomStats] = useState<RoomStats>({
    total: 0,
    inUse: 0,
    available: 0
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filterValue, setFilterValue] = useState<string>('all');

  const filterOptions: FilterOption[] = [{
    id: 'all',
    text: 'Tất cả phòng'
  }, {
    id: 'available',
    text: 'Phòng trống'
  }, {
    id: 'inUse',
    text: 'Phòng đang sử dụng'
  }];

  useEffect(() => {
    fetchRoomData();
  }, []);

  const fetchRoomData = async (): Promise<void> => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/rooms/stats');
      const data = await response.json();
      
      setRoomStats({
        total: data.total,
        inUse: data.inUse,
        available: data.available
      });
      
      setRooms(data.rooms);
    } catch (error) {
      console.error('Error fetching room data:', error);
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
    dataField: 'capacity',
    caption: 'Sức chứa',
    width: 100,
    alignment: 'right' as const
  }, {
    dataField: 'type',
    caption: 'Loại phòng',
    width: 150
  }, {
    dataField: 'status',
    caption: 'Trạng thái',
    width: 150,
    cellRender: (cellData: any) => {
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

  const handleRefresh = (): void => {
    fetchRoomData();
  };

  const filteredRooms = (): Room[] => {
    if (filterValue === 'all') return rooms;
    return rooms.filter(room => room.isAvailable === (filterValue === 'available'));
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
    <div style={{
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h3 style={{ margin: 0, color: color }}>{title}</h3>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginTop: '10px',
        color: '#333' 
      }}>
        {value}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <LoadPanel
        visible={loading}
        showIndicator={true}
        shading={true}
        showPane={true}
        shadingColor="rgba(0,0,0,0.4)"
      />

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <StatCard
          title="Tổng số phòng"
          value={roomStats.total}
          color="#2196f3"
        />
        <StatCard
          title="Phòng trống"
          value={roomStats.available}
          color="#4caf50"
        />
        <StatCard
          title="Phòng đang sử dụng"
          value={roomStats.inUse}
          color="#f44336"
        />
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SelectBox
            items={filterOptions}
            value={filterValue}
            onValueChanged={(e: any) => setFilterValue(e.value)}
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
        height="calc(100vh - 350px)"
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

export default AdminDashboard;
