import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearErrors } from '../../redux/slices/authSlice';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import notify from 'devextreme/ui/notify';
import axios from 'axios';
import { API_URL } from '../../services/api';

const Login = () => {
    const [isActive, setIsActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        account: '',
        password: ''
    });
    
    const [registerData, setRegisterData] = useState({
        account: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading: authLoading, error, isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            notify({ message: 'Đăng nhập thành công', type: 'success', displayTime: 2000 });
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (error) {
            notify({ message: error, type: 'error', displayTime: 3000 });
            dispatch(clearErrors());
        }
    }, [error, dispatch]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        const { account, password } = formData;
        
        if (!account || !password) {
            notify({ message: 'Vui lòng nhập đầy đủ thông tin', type: 'error', displayTime: 3000 });
            return;
        }
        
        try {
            await dispatch(login({
                account,
                password
            })).unwrap();
        } catch (error) {
            console.error('Login submission error:', error);
        }
    };
    
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        const { account, password, confirmPassword, phone } = registerData;
        
        if (!account || !password || !confirmPassword || !phone) {
            notify({ message: 'Vui lòng nhập đầy đủ thông tin', type: 'error', displayTime: 3000 });
            return;
        }
        
        if (password !== confirmPassword) {
            notify({ message: 'Mật khẩu xác nhận không khớp', type: 'error', displayTime: 3000 });
            return;
        }
        
        // Validate phone number format (simple validation)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            notify({ message: 'Số điện thoại không hợp lệ', type: 'error', displayTime: 3000 });
            return;
        }
        
        try {
            setLoading(true);
            
            console.log('Đang gửi yêu cầu đăng ký với dữ liệu:', {
                accountId: account,
                password,
                phone
            });
            
            const response = await axios.post(`${API_URL}/auth/register`, {
                accountId: account,
                password,
                phone
            });
            
            console.log('Phản hồi từ server:', response.data);
            
            if (response.data.success) {
                notify({ message: response.data.message, type: 'success', displayTime: 2000 });
                
                // Navigate to OTP verification page with account and phone
                navigate('/otp-verification', {
                    state: {
                        account,
                        password,
                        phone
                    }
                });
            } else {
                notify({ message: response.data.message || 'Đăng ký thất bại', type: 'error', displayTime: 3000 });
            }
        } catch (error) {
            console.error('Lỗi đăng ký chi tiết:', error);
            console.error('Response data:', error.response?.data);
            console.error('Status code:', error.response?.status);
            console.error('Headers:', error.response?.headers);
            
            notify({ 
                message: error.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký', 
                type: 'error', 
                displayTime: 3000 
            });
        } finally {
            setLoading(false);
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
                        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Sign In</h1>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                            {['G+', 'f', '⌂', 'in'].map((icon, index) => (
                                <a 
                                    key={index} 
                                    href="#"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none',
                                        color: '#333',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                        
                        <span style={{ fontSize: '14px', marginBottom: '20px' }}>or use your account</span>
                        
                        <form onSubmit={handleLoginSubmit} style={{ width: '100%', maxWidth: '300px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <input 
                                    type="text"
                                    name="account"
                                    placeholder="Tài khoản"
                                    value={formData.account}
                                    onChange={(e) => setFormData({...formData, account: e.target.value})}
                                    style={{
                                        backgroundColor: '#f5f6fa',
                                        border: 'none',
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        width: '100%',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px', position: 'relative' }}>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Mật khẩu"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    style={{
                                        backgroundColor: '#f5f6fa',
                                        border: 'none',
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        width: '100%',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#333'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            
                            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <a 
                                    href="#"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#333',
                                        fontSize: '14px'
                                    }}
                                >
                                    Quên mật khẩu?
                                </a>
                            </p>
                            
                            <button 
                                type="submit"
                                disabled={authLoading}
                                style={{
                                    backgroundColor: '#2da0a8',
                                    color: '#fff',
                                    fontSize: '14px',
                                    padding: '10px 0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    cursor: authLoading ? 'not-allowed' : 'pointer',
                                    width: '100%'
                                }}
                            >
                                {authLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                            </button>
                        </form>
                    </div>
                </div>

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
                        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Create Account</h1>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                            {['G+', 'f', '⌂', 'in'].map((icon, index) => (
                                <a 
                                    key={index} 
                                    href="#"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none',
                                        color: '#333',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                        
                        <span style={{ fontSize: '14px', marginBottom: '20px' }}>or use email for registration</span>
                        
                        {/* Registration Form */}
                        <form onSubmit={handleRegisterSubmit} style={{ width: '100%', maxWidth: '300px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <input 
                                    type="text"
                                    name="account"
                                    placeholder="Tài khoản"
                                    value={registerData.account}
                                    onChange={(e) => setRegisterData({...registerData, account: e.target.value})}
                                    style={{
                                        backgroundColor: '#f5f6fa',
                                        border: 'none',
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        width: '100%',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px', position: 'relative' }}>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Mật khẩu"
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                    style={{
                                        backgroundColor: '#f5f6fa',
                                        border: 'none',
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        width: '100%',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#333'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            
                            <div style={{ marginBottom: '15px', position: 'relative' }}>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Xác nhận mật khẩu"
                                    value={registerData.confirmPassword}
                                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                    style={{
                                        backgroundColor: '#f5f6fa',
                                        border: 'none',
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        width: '100%',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#333'
                                    }}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <input 
                                    type="text"
                                    name="phone"
                                    placeholder="Số điện thoại"
                                    value={registerData.phone}
                                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                                    style={{
                                        backgroundColor: '#f5f6fa',
                                        border: 'none',
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        borderRadius: '8px',
                                        width: '100%',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={loading}
                                style={{
                                    backgroundColor: '#2da0a8',
                                    color: '#fff',
                                    fontSize: '14px',
                                    padding: '10px 0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    width: '100%'
                                }}
                            >
                                {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
                            </button>
                        </form>
                    </div>
                </div>

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
                            textAlign: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Welcome Back!</h1>
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.5',
                                margin: '0 0 30px',
                                maxWidth: '350px'
                            }}>
                                Đăng nhập để sử dụng các tính năng của hệ thống
                            </p>
                            <button onClick={() => setIsActive(false)} style={{
                                backgroundColor: 'transparent',
                                border: '2px solid #fff',
                                color: '#fff',
                                fontSize: '14px',
                                padding: '10px 30px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                cursor: 'pointer'
                            }}>
                                ĐĂNG NHẬP
                            </button>
                        </div>

                        <div style={{
                            width: '50%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            padding: '0 40px',
                            textAlign: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>
                                Classroom Management System
                            </h1>
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.5',
                                margin: '0 0 30px',
                                maxWidth: '350px'
                            }}>
                                Hệ thống quản lý lớp học hiện đại, tiện lợi và dễ sử dụng
                            </p>
                            <button onClick={() => setIsActive(true)} style={{
                                backgroundColor: 'transparent',
                                border: '2px solid #fff',
                                color: '#fff',
                                fontSize: '14px',
                                padding: '10px 30px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                cursor: 'pointer'
                            }}>
                                ĐĂNG KÝ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 