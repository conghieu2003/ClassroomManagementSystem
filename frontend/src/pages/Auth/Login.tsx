import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import 'devextreme/dist/css/dx.light.css';
import { Button } from 'devextreme-react/button';
import { TextBox } from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  useEffect(() => {
    if (loginData.username.startsWith('admin')) {
      setSelectedRole('admin');
    } else if (loginData.username.startsWith('gv')) {
      setSelectedRole('teacher');
    } else {
      setSelectedRole('student');
    }
  }, [loginData.username]);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu nhập
    if (!loginData.username || !loginData.password) {
      notify('Vui lòng nhập đầy đủ thông tin đăng nhập', 'error', 3000);
      return;
    }

    try {
      const response = await authService.login(loginData.username, loginData.password);
      
      if (response.success) {
        notify('Đăng nhập thành công', 'success', 2000);
        navigate('/dashboard');
      } else {
        let errorMessage = 'Đăng nhập thất bại';
        
        switch (response.errorCode) {
          case 'INVALID_PASSWORD':
            errorMessage = 'Mật khẩu không chính xác';
            break;
          case 'ACCOUNT_INACTIVE':
            errorMessage = 'Tài khoản đã bị khóa';
            break;
          case 'ACCOUNT_NOT_FOUND':
            errorMessage = 'Tài khoản không tồn tại';
            break;
          case 'SYSTEM_ERROR':
            errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
            break;
          default:
            errorMessage = response.message || 'Có lỗi xảy ra khi đăng nhập';
        }
        
        notify(errorMessage, 'error', 3000);
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      notify('Không thể kết nối đến máy chủ', 'error', 3000);
    }
  };
    
  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      notify('Mật khẩu xác nhận không khớp', 'error', 3000);
      return;
    }
    try {
      const response = await authService.register(registerData);
      if (response.success) {
        notify('Đăng ký thành công', 'success', 2000);
        setIsActive(false);
      } else {
        notify(response.message || 'Đăng ký thất bại', 'error', 3000);
      }
    } catch (error) {
      notify('Có lỗi xảy ra khi đăng ký', 'error', 3000);
    }
  };

  return (
    <div style={{
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'Montserrat, sans-serif',
      backgroundColor: '#c9d6ff',
      background: 'linear-gradient(to right, #e2e2e2, #c9d6ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '30px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '850px',
        minHeight: '600px'
      }}>
        {/* Sign In Container */}
        <div style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          transition: 'all 0.6s ease-in-out',
          left: 0,
          width: '50%',
          opacity: isActive ? 0 : 1,
          zIndex: isActive ? 1 : 2,
          transform: isActive ? 'translateX(-100%)' : 'translateX(0)'
        }}>
          <div style={{
            background: '#fff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 40px',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Đăng nhập</h1>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px', 
              marginBottom: '20px',
              width: '100%'
            }}>
              {['student', 'teacher', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    background: selectedRole === role ? '#2da0a8' : '#f5f6fa',
                    color: selectedRole === role ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className={`fas fa-${role === 'student' ? 'user-graduate' : role === 'teacher' ? 'chalkboard-teacher' : 'user-shield'}`} style={{ fontSize: '20px' }}></i>
                  <span>{role === 'student' ? 'Sinh viên' : role === 'teacher' ? 'Giảng viên' : 'Admin'}</span>
                </button>
              ))}
            </div>
            
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '300px' }}>
              <TextBox
                stylingMode="filled"
                placeholder={selectedRole === 'student' ? 'Mã số sinh viên' : selectedRole === 'teacher' ? 'Mã giảng viên' : 'Tên đăng nhập'}
                value={loginData.username}
                onValueChanged={(e: any) => setLoginData({...loginData, username: e.value})}
                width="100%"
                style={{ marginBottom: '15px' }}
              />
              <TextBox
                stylingMode="filled"
                mode="password"
                placeholder="Mật khẩu"
                value={loginData.password}
                onValueChanged={(e: any) => setLoginData({...loginData, password: e.value})}
                width="100%"
                style={{ marginBottom: '20px' }}
              />
              <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                <a href="#" style={{ textDecoration: 'none', color: '#333', fontSize: '14px' }}>
                  Quên mật khẩu?
                </a>
              </p>
              <Button
                width="100%"
                height={40}
                text="ĐĂNG NHẬP"
                type="default"
                stylingMode="contained"
                useSubmitBehavior={true}
              />
            </form>
          </div>
        </div>

        {/* Sign Up Container */}
        <div style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          transition: 'all 0.6s ease-in-out',
          left: 0,
          width: '50%',
          opacity: isActive ? 1 : 0,
          zIndex: isActive ? 5 : 1,
          transform: isActive ? 'translateX(100%)' : 'translateX(0)'
        }}>
          <div style={{
            background: '#fff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 40px',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Đăng ký tài khoản</h1>
            
            <form onSubmit={handleRegister} style={{ width: '100%', maxWidth: '300px' }}>
              <TextBox
                stylingMode="filled"
                placeholder="Tên đăng nhập"
                value={registerData.username}
                onValueChanged={(e: any) => setRegisterData({...registerData, username: e.value})}
                width="100%"
                style={{ marginBottom: '15px' }}
              />
              <TextBox
                stylingMode="filled"
                placeholder="Họ và tên"
                value={registerData.fullName}
                onValueChanged={(e: any) => setRegisterData({...registerData, fullName: e.value})}
                width="100%"
                style={{ marginBottom: '15px' }}
              />
              <TextBox
                stylingMode="filled"
                mode="email"
                placeholder="Email"
                value={registerData.email}
                onValueChanged={(e: any) => setRegisterData({...registerData, email: e.value})}
                width="100%"
                style={{ marginBottom: '15px' }}
              />
              <TextBox
                stylingMode="filled"
                mode="password"
                placeholder="Mật khẩu"
                value={registerData.password}
                onValueChanged={(e: any) => setRegisterData({...registerData, password: e.value})}
                width="100%"
                style={{ marginBottom: '15px' }}
              />
              <TextBox
                stylingMode="filled"
                mode="password"
                placeholder="Xác nhận mật khẩu"
                value={registerData.confirmPassword}
                onValueChanged={(e: any) => setRegisterData({...registerData, confirmPassword: e.value})}
                width="100%"
                style={{ marginBottom: '20px' }}
              />
              <Button
                width="100%"
                height={40}
                text="ĐĂNG KÝ"
                type="default"
                stylingMode="contained"
                useSubmitBehavior={true}
              />
            </form>
          </div>
        </div>

        {/* Overlay Container */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '50%',
          height: '100%',
          overflow: 'hidden',
          transition: 'all 0.6s ease-in-out',
          zIndex: isActive ? 99 : 100,
          transform: isActive ? 'translateX(-100%)' : 'none'
        }}>
          <div style={{
            background: 'linear-gradient(to right, #5c6bc0, #2da0a8)',
            color: '#fff',
            position: 'relative',
            left: '-100%',
            height: '100%',
            width: '200%',
            transform: isActive ? 'translateX(50%)' : 'translateX(0)',
            transition: 'all 0.6s ease-in-out',
            textAlign: 'center',
            display: 'flex'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '0 40px',
              textAlign: 'center'
            }}>
              <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Chào mừng trở lại!</h1>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0 0 30px' }}>
                Đăng nhập để sử dụng các tính năng của hệ thống quản lý phòng học
              </p>
              <Button
                text="ĐĂNG NHẬP"
                type="default"
                stylingMode="outlined"
                onClick={() => setIsActive(false)}
                width={200}
              />
            </div>

            <div style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '0 40px',
              textAlign: 'center'
            }}>
              <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>
                Hệ thống Quản lý Phòng học
              </h1>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0 0 30px' }}>
                Chưa có tài khoản? Đăng ký để trải nghiệm hệ thống quản lý phòng học hiện đại
              </p>
              <Button
                text="ĐĂNG KÝ"
                type="default"
                stylingMode="outlined"
                onClick={() => setIsActive(true)}
                width={200}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
