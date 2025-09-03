import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from 'devextreme-react/data-grid';
import { LoadPanel } from 'devextreme-react/load-panel';
import { Button } from 'devextreme-react/button';
import { SelectBox } from 'devextreme-react/select-box';
import { Popup } from 'devextreme-react/popup';
import { TextBox } from 'devextreme-react/text-box';
import { CheckBox } from 'devextreme-react/check-box';
import { User } from '../../types';
import { fetchUsersThunk, updateUserThunk, clearUsersError } from '../../redux/slices/userSlice';
import { RootState, AppDispatch } from '../../redux/store';

interface RoleOption {
  id: string;
  text: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { users, usersLoading, usersError } = useSelector((state: RootState) => state.user);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editPopupVisible, setEditPopupVisible] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

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

  const fetchUsers = (): void => {
    const roleFilter = filterRole === 'all' ? undefined : (filterRole as any);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    dispatch(fetchUsersThunk({ role: roleFilter, username: currentUser?.username }));
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      isActive: user.status === 'active',
      phone: user.phone || ''
    });
    setEditPopupVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      // Chuyển đổi dữ liệu để phù hợp với backend
      const updateData = {
        phone: editFormData.phone,
        isActive: editFormData.isActive
      };
      
      // Gọi API để cập nhật user thông qua Redux
      await dispatch(updateUserThunk({ userId: editingUser.id, userData: updateData }));
      
      setEditPopupVisible(false);
      setEditingUser(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật người dùng');
    }
  };

  const handleSendEmail = (user: User) => {
    // Mở email client với thông tin người dùng
    const subject = encodeURIComponent('Thông báo từ hệ thống quản lý lớp học');
    const body = encodeURIComponent(`Xin chào ${user.fullName},\n\nĐây là email được gửi từ hệ thống quản lý lớp học.\n\nTrân trọng,\nBan quản trị`);
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`);
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
    caption: 'Mã số',
    width: 120,
    cellTemplate: (container: any, options: any) => {
      const user = options.data;
      
      let code = 'N/A';
      if (user.role === 'teacher') {
        code = user.teacherCode || 'N/A';
      } else if (user.role === 'student') {
        code = user.studentCode || 'N/A';
      } else if (user.role === 'admin') {
        code = 'ADMIN';
      }
      
      container.textContent = code;
    }
  }, {
    dataField: 'role',
    caption: 'Vai trò',
    width: 120,
    lookup: {
      dataSource: [
        { id: 'teacher', text: 'Giảng viên' },
        { id: 'student', text: 'Sinh viên' },
        { id: 'admin', text: 'Quản trị viên' }
      ],
      displayExpr: 'text',
      valueExpr: 'id'
    }
  }, {
    dataField: 'phone',
    caption: 'Số điện thoại',
    width: 150,
    cellRender: (cellData: any) => {
      return cellData.value || 'N/A';
    }
  }, {
    dataField: 'email',
    caption: 'Email',
    width: 200
  }, {
    dataField: 'status',
    caption: 'Trạng thái',
    width: 120,
    cellRender: (cellData: any) => {
      const isActive = cellData.value === 'active';
      const color = isActive ? '#4caf50' : '#f44336';
      const text = isActive ? 'Hoạt động' : 'Đã khóa';
      return (
        <div style={{
          backgroundColor: color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onClick={() => handleEdit(cellData.data)}
        title="Click để chỉnh sửa">
          {text}
        </div>
      );
    }
  }, {
    caption: 'Thao tác',
    width: 200,
    cellTemplate: (container: any, options: any) => {
      const user = options.data;
      
      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.gap = '8px';
      
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Chỉnh sửa';
      editBtn.style.padding = '4px 8px';
      editBtn.style.backgroundColor = '#007bff';
      editBtn.style.color = 'white';
      editBtn.style.border = 'none';
      editBtn.style.borderRadius = '4px';
      editBtn.style.cursor = 'pointer';
      editBtn.onclick = () => handleEdit(user);
      
      const emailBtn = document.createElement('button');
      emailBtn.textContent = 'Gửi mail';
      emailBtn.style.padding = '4px 8px';
      emailBtn.style.backgroundColor = '#28a745';
      emailBtn.style.color = 'white';
      emailBtn.style.border = 'none';
      emailBtn.style.borderRadius = '4px';
      emailBtn.style.cursor = 'pointer';
      emailBtn.onclick = () => handleSendEmail(user);
      
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(emailBtn);
      container.appendChild(actionsDiv);
    }
  }];

  const handleRefresh = (): void => {
    fetchUsers();
  };  
  return (
    <div style={{ padding: '20px' }}>
      <LoadPanel
        visible={usersLoading}
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
        dataSource={users}
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

      {/* Edit User Popup */}
      <Popup
        visible={editPopupVisible}
        onHiding={() => {
          setEditPopupVisible(false);
          setEditingUser(null);
          setEditFormData({});
        }}
        title="Chỉnh sửa người dùng"
        width={400}
        height={300}
        showTitle={true}
        dragEnabled={false}
        closeOnOutsideClick={true}
      >
        <div style={{ padding: '20px' }}>
          {editingUser && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <strong>Người dùng:</strong> {editingUser.fullName}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Số điện thoại:
                </label>
                <TextBox
                  value={editFormData.phone}
                  onValueChanged={(e: any) => setEditFormData({
                    ...editFormData,
                    phone: e.value
                  })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <CheckBox
                  text="Hoạt động"
                  value={editFormData.isActive}
                  onValueChanged={(e: any) => setEditFormData({
                    ...editFormData,
                    isActive: e.value
                  })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button
                  text="Hủy"
                  stylingMode="outlined"
                  onClick={() => {
                    setEditPopupVisible(false);
                    setEditingUser(null);
                    setEditFormData({});
                  }}
                />
                <Button
                  text="Lưu"
                  stylingMode="contained"
                  type="default"
                  onClick={handleSaveEdit}
                />
              </div>
            </>
          )}
        </div>
      </Popup>
    </div>
  );
};

export default UserManagement;
