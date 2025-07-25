import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return (
        <div style={{
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <header style={{
                marginBottom: '30px',
                padding: '20px 0',
                borderBottom: '1px solid #eee'
            }}>
                <h1>Dashboard</h1>
                <p>Chào mừng, {user?.fullName || 'Người dùng'}</p>
            </header>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2>Thông tin tài khoản</h2>
                    <div>
                        <p><strong>Mã số:</strong> {user?.accountId}</p>
                        <p><strong>Vai trò:</strong> {user?.role}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Khoa/Phòng ban:</strong> {user?.department}</p>
                    </div>
                </div>
                
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2>Lịch học hôm nay</h2>
                    <p>Không có lịch học nào hôm nay.</p>
                </div>
                
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2>Thông báo</h2>
                    <p>Không có thông báo mới.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 