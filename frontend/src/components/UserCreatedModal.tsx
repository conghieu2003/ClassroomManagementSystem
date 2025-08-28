import React from 'react';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';

interface UserCreatedModalProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    role: string;
    teacherCode?: string;
    studentCode?: string;
  } | null;
}

const UserCreatedModal: React.FC<UserCreatedModalProps> = ({
  visible,
  onClose,
  userData
}) => {
  if (!userData) return null;

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Popup
      visible={visible}
      onHiding={onClose}
      title="Tài khoản đã được tạo thành công!"
      width={500}
      height={400}
      showCloseButton={true}
      showTitle={true}
    >
      <div style={{ padding: '20px' }}>
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#2e7d32', margin: '0 0 15px 0' }}>
            ✅ Tài khoản đã được tạo thành công
          </h3>
          <p style={{ margin: '0', color: '#1b5e20' }}>
            Thông tin đăng nhập đã được gửi đến email: <strong>{userData.email}</strong>
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px', color: '#333' }}>Thông tin tài khoản:</h4>
          
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span><strong>Họ và tên:</strong></span>
              <span>{userData.fullName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span><strong>Email:</strong></span>
              <span>{userData.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span><strong>Vai trò:</strong></span>
              <span>{userData.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}</span>
            </div>
            {userData.teacherCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span><strong>Mã giảng viên:</strong></span>
                <span>{userData.teacherCode}</span>
              </div>
            )}
            {userData.studentCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span><strong>Mã sinh viên:</strong></span>
                <span>{userData.studentCode}</span>
              </div>
            )}
          </div>

          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #ffeaa7'
          }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#856404' }}>Thông tin đăng nhập:</h5>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span><strong>Tên đăng nhập:</strong></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'monospace', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                  {userData.username}
                </span>
                <Button
                  icon="copy"
                  onClick={() => handleCopyToClipboard(userData.username)}
                  stylingMode="text"
                  hint="Sao chép"
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>Mật khẩu:</strong></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'monospace', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                  {userData.password}
                </span>
                <Button
                  icon="copy"
                  onClick={() => handleCopyToClipboard(userData.password)}
                  stylingMode="text"
                  hint="Sao chép"
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#d1ecf1', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#0c5460' }}>
            <strong>Lưu ý:</strong> Mật khẩu mặc định là "123456". 
            Người dùng nên đổi mật khẩu ngay sau khi đăng nhập lần đầu.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            text="Đóng"
            onClick={onClose}
            stylingMode="contained"
            type="default"
          />
        </div>
      </div>
    </Popup>
  );
};

export default UserCreatedModal;
