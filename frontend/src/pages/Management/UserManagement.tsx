import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from 'devextreme-react/data-grid';
import { LoadPanel } from 'devextreme-react/load-panel';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react/select-box';
import { User } from '../../types';
import { userService } from '../../services/api';

interface RoleOption {
  id: string;
  text: string;
}

interface ExtendedUser extends User {
  status?: 'active' | 'inactive';
}


const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');

  const roleOptions: RoleOption[] = [{
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
  }, [filterRole]);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const roleFilter = filterRole === 'all' ? undefined : (filterRole as any);
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const response = await userService.listUsers(roleFilter, currentUser?.username);
      if ((response as any).success) {
        setUsers(((response as any).data) || []);
      } else {
        console.error('Fetch users error:', (response as any).message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Removed inline create modal logic. Navigation will go to /users/create page.

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
    cellRender: (cellData: any) => {
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

  const handleRefresh = (): void => {
    fetchUsers();
  };

  const filteredUsers = (): ExtendedUser[] => users;

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
            onValueChanged={(e: any) => setFilterRole(e.value)}
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
          onClick={() => navigate('/users/create')}
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

      {/* Modal removed; navigation to /users/create is used instead */}
    </div>
  );
};

export default UserManagement;
