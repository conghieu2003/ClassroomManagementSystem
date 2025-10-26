import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/api';

// Interface cho menu item
interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

// Interface cho menu configuration
interface MenuConfig {
  [key: string]: MenuItem[];
}

const Sidebar: React.FC = () => {
  const userRole = authService.getUserRole() || 'student'; // Default to student if no role
  const location = useLocation();
  
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['rooms'])); // Mặc định mở menu rooms

  const toggleMenu = (menuKey: string) => {
    const newExpandedMenus = new Set(expandedMenus);
    if (newExpandedMenus.has(menuKey)) {
      newExpandedMenus.delete(menuKey);
    } else {
      newExpandedMenus.add(menuKey);
    }
    setExpandedMenus(newExpandedMenus);
  };

  const isMenuExpanded = (menuKey: string) => expandedMenus.has(menuKey);

  // Cấu hình menu động theo role
  const menuConfig: MenuConfig = {
    admin: [
      {
        id: 'dashboard',
        name: 'Trang chủ',
        path: '/dashboard',
        icon: 'fas fa-home'
      },
      {
        id: 'users',
        name: 'Quản lý người dùng',
        path: '/users',
        icon: 'fas fa-users'
      },
      {
        id: 'rooms',
        name: 'Quản lý phòng học',
        path: '/rooms',
        icon: 'fas fa-door-open',
        children: [
          { id: 'all', name: 'Hệ thống phòng học', path: '/rooms', icon: 'fas fa-building' },
          { id: 'available-rooms', name: 'Danh sách phòng học', path: '/rooms/available', icon: 'fas fa-search' },
          { id: 'request-form', name: 'Yêu cầu xin/đổi phòng', path: '/rooms/requests', icon: 'fas fa-exchange-alt' },
          { id: 'request-list', name: 'Danh sách yêu cầu', path: '/rooms/requests/list', icon: 'fas fa-clipboard-list' },
          { id: 'room-scheduling', name: 'Sắp xếp phòng học', path: '/rooms/scheduling', icon: 'fas fa-calendar-check' },
          
        ]
      },
      {
        id: 'schedules',
        name: 'Quản lý lịch học',
        path: '/schedules',
        icon: 'fas fa-calendar-alt',
        children: [
          { id: 'weekly-schedule', name: 'Lịch học theo tuần', path: '/schedule/weekly', icon: 'fas fa-calendar-week' },
          { id: 'schedule-management', name: 'Quản lý ngoại lệ lịch học', path: '/schedule/management', icon: 'fas fa-exclamation-triangle' }
        ]
      }
    ],
    teacher: [
      {
        id: 'dashboard',
        name: 'Trang chủ',
        path: '/dashboard',
        icon: 'fas fa-home'
      },
      {
        id: 'schedule',
        name: 'Lịch dạy',
        path: '/schedule',
        icon: 'fas fa-calendar-alt',
        children: [
          { id: 'weekly-schedule', name: 'Lịch dạy theo tuần', path: '/schedule/weekly', icon: 'fas fa-calendar-week' }
        ]
      },
      {
        id: 'room-requests',
        name: 'Yêu cầu đổi phòng',
        path: '/room-requests',
        icon: 'fas fa-exchange-alt'
      },
      {
        id: 'profile',
        name: 'Thông tin cá nhân',
        path: '/profile',
        icon: 'fas fa-user'
      }
    ],
    student: [
      {
        id: 'dashboard',
        name: 'Trang chủ',
        path: '/dashboard',
        icon: 'fas fa-home'
      },
      {
        id: 'schedule',
        name: 'Lịch học',
        path: '/schedule',
        icon: 'fas fa-calendar-alt',
        children: [
          { id: 'weekly-schedule', name: 'Lịch học theo tuần', path: '/schedule/weekly', icon: 'fas fa-calendar-week' }
        ]
      },
      {
        id: 'profile',
        name: 'Thông tin cá nhân',
        path: '/profile',
        icon: 'fas fa-user'
      }
    ]
  };

  // Render menu item với children
  const renderMenuItem = (item: MenuItem): JSX.Element => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <li key={item.id} style={{ margin: 0 }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              color: '#bdc3c7',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              borderBottom: '1px solid #34495e',
              cursor: 'pointer',
              justifyContent: 'space-between'
            }}
            onClick={() => toggleMenu(item.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <i className={item.icon} style={{ marginRight: '10px', width: '20px', textAlign: 'center' as const }}></i>
              <span style={{ flex: 1 }}>{item.name}</span>
            </div>
            <i 
              className={`fas fa-chevron-${isMenuExpanded(item.id) ? 'up' : 'down'}`}
              style={{ fontSize: '12px' }}
            ></i>
          </div>
          {isMenuExpanded(item.id) && (
            <div style={{ 
              backgroundColor: '#34495e', 
              borderLeft: '3px solid #3498db', 
              padding: 0 
            }}>
              {item.children!.map((subItem) => {
                const isSubActive = location.pathname === subItem.path;
                return (
                  <Link
                    key={subItem.id}
                    to={subItem.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 20px',
                      color: isSubActive ? '#fff' : '#bdc3c7',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      borderBottom: '1px solid #34495e',
                      paddingLeft: '50px',
                      fontSize: '14px',
                      backgroundColor: isSubActive ? '#3498db' : '#34495e',
                      borderLeft: '3px solid #3498db'
                    }}
                  >
                    <i className={subItem.icon} style={{ width: '16px', marginRight: '8px' }}></i>
                    <span>{subItem.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={item.id} style={{ margin: 0 }}>
        <Link 
          to={item.path} 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            color: isActive ? '#fff' : '#bdc3c7',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            borderBottom: '1px solid #34495e',
            backgroundColor: isActive ? '#3498db' : 'transparent'
          }}
        >
          <i className={item.icon} style={{ marginRight: '10px', width: '20px', textAlign: 'center' as const }}></i>
          <span style={{ flex: 1 }}>{item.name}</span>
        </Link>
      </li>
    );
  };

  const renderMenuItems = (): JSX.Element | null => {
    const currentMenu = menuConfig[userRole as keyof MenuConfig];
    
    if (!currentMenu) {
      console.log('No menu found for role:', userRole);
      return null;
    }

    return (
      <>
        {currentMenu.map((item: MenuItem) => renderMenuItem(item))}
      </>
    );
  };

  return (
    <div style={{
      width: '250px',
      minWidth: '250px',
      maxWidth: '250px',
      backgroundColor: '#2C3E50',
      color: '#fff',
      height: '100%',
      overflowY: 'auto' as const,
      boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      flexShrink: 0, // Không cho phép co lại
      position: 'relative' // Cố định vị trí
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #34495e',
        textAlign: 'center' as const
      }}>
        <h3 style={{
          margin: 0,
          color: '#fff',
          fontSize: '18px',
          fontWeight: 600
        }}>Quản lý phòng học</h3>
      </div>
      <nav>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {renderMenuItems()}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
