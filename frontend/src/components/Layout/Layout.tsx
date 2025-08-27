import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { TextBox } from 'devextreme-react/text-box';
import { User } from '../../types';
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

  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [{
      id: 'home',
      text: 'Trang chủ',
      icon: 'home',
      path: '/dashboard'
    }, {
      id: 'schedule',
      text: 'Lịch học/thi',
      icon: 'event',
      path: '/schedule'
    }];

    const roleSpecificItems: Record<string, MenuItem[]> = {
      admin: [{
        id: 'rooms',
        text: 'Quản lý phòng học',
        icon: 'fas fa-door-open',
        path: '/rooms'
      }, {
        id: 'users',
        text: 'Quản lý người dùng',
        icon: 'fas fa-users',
        path: '/users'
      }, {
        id: 'subjects',
        text: 'Quản lý môn học',
        icon: 'fas fa-book',
        path: '/subjects'
      }],
      teacher: [{
        id: 'room-requests',
        text: 'Yêu cầu đổi phòng',
        icon: 'fas fa-exchange-alt',
        path: '/room-requests'
      }],
      student: []
    };

    return [...commonItems, ...(roleSpecificItems[userRole || ''] || [])];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        height: '50px',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0'
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

      <div style={{ display: 'flex', flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          backgroundColor: '#2C3E50',
          color: '#fff',
          padding: '20px 0'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {getMenuItems().map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                <i className={item.icon}></i>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
