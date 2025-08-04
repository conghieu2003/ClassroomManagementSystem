import React, { useState, useEffect } from 'react';
import { DataGrid } from 'devextreme-react/data-grid';
import { LoadPanel } from 'devextreme-react/load-panel';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react/select-box';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');

  const roleOptions = [{
    id: 'all',
    text: 'Tất cả'
  }, {
    id: 'teacher',
    text: 'Giảng viên'
  }, {
    id: 'student',
    text: 'Sinh viên'
  }];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [{
    dataField: 'username',
    caption: 'Tên đăng nhập',
    width: 150
  }, {
    dataField: 'fullName',
    caption: 'Họ và tên',
    width: 200
  }, {
    dataField: 'email',
    caption: 'Email',
    width: 200
  }, {
    dataField: 'role',
    caption: 'Vai trò',
    width: 120,
    lookup: {
      dataSource: [
        { id: 'teacher', text: 'Giảng viên' },
        { id: 'student', text: 'Sinh viên' }
      ],
      displayExpr: 'text',
      valueExpr: 'id'
    }
  }, {
    dataField: 'status',
    caption: 'Trạng thái',
    width: 120,
    cellRender: (cellData) => {
      const color = cellData.value === 'active' ? '#4caf50' : '#f44336';
      return (
        <div style={{
          backgroundColor: color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {cellData.value === 'active' ? 'Hoạt động' : 'Khóa'}
        </div>
      );
    }
  }];

  const handleRefresh = () => {
    fetchUsers();
  };

  const filteredUsers = () => {
    if (filterRole === 'all') return users;
    return users.filter(user => user.role === filterRole);
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
            items={roleOptions}
            value={filterRole}
            onValueChanged={(e) => setFilterRole(e.value)}
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
          text="Thêm người dùng"
          icon="plus"
          type="default"
          stylingMode="contained"
          onClick={() => {/* TODO: Handle add user */}}
        />
      </div>

      <DataGrid
        dataSource={filteredUsers()}
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

export default UserManagement; 