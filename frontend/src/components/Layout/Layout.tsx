import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { TextBox } from 'devextreme-react/text-box';
import { User } from '../../types';
import Sidebar from './Sidebar';
import 'devextreme/dist/css/dx.light.css';

interface MenuItem {
  id: string;
  text: string;
  icon: string;
  path: string;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser: User | null = authService.getCurrentUser();
  const userRole: string | null = authService.getUserRole();

  // Xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuItemClick = (action: string): void => {
    setShowUserMenu(false);
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'password':
        navigate('/change-password');
        break;
      case 'logout':
        authService.logout();
        navigate('/login');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      width: '100vw',
      minWidth: '1200px', // Kích thước tối thiểu để không bị co lại khi zoom
      maxWidth: '100vw', // Không vượt quá viewport width
      overflow: 'hidden', // Ngăn scroll toàn trang
      position: 'fixed', // Cố định layout
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{
        height: '50px',
        minHeight: '50px',
        maxHeight: '50px',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0, // Không cho phép co lại
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '30px' }} />
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <TextBox
              style={{
                width: '300px',
                borderRadius: '20px',
                backgroundColor: '#f5f5f5'
              }}
              mode="search"
              placeholder="Tìm kiếm..."
              value={searchText}
              onValueChanged={(e: any) => setSearchText(e.value)}
              stylingMode="filled"
            />
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }} onClick={() => navigate('/dashboard')}>
            <i className="fas fa-home" style={{ fontSize: '20px', color: '#666' }}></i>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div 
            ref={userMenuRef}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '4px'
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              <i className="fas fa-user"></i>
            </div>
            <span style={{ color: '#333' }}>{currentUser?.fullName || 'Người dùng'}</span>
            <i className="fas fa-chevron-down" style={{ fontSize: '12px', color: '#666' }}></i>
          </div>

          {showUserMenu && (
            <div 
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '5px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                width: '200px',
                zIndex: 1000
              }}
            >
              <div 
                onClick={() => handleMenuItemClick('profile')}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <i className="fas fa-user" style={{ width: '20px' }}></i>
                <span>Thông tin cá nhân</span>
              </div>
              <div 
                onClick={() => handleMenuItemClick('password')}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <i className="fas fa-key" style={{ width: '20px' }}></i>
                <span>Đổi mật khẩu</span>
              </div>
              <div 
                onClick={() => handleMenuItemClick('logout')}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <i className="fas fa-sign-out-alt" style={{ width: '20px' }}></i>
                <span>Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flex: 1, 
        backgroundColor: '#f5f5f5',
        minHeight: 0, // Quan trọng để flex hoạt động đúng
        width: '100%'
      }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          minWidth: 0, // Quan trọng để flex hoạt động đúng
          width: '100%'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
