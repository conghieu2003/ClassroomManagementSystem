import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import notify from 'devextreme/ui/notify';
import axios from 'axios';
import { API_URL } from '../../services/api';
import { 
    Button, 
    LoadPanel, 
    TextBox, 
    ValidationSummary, 
    Validator 
} from 'devextreme-react';
import { RequiredRule, PatternRule } from 'devextreme-react/validator';
import 'devextreme/dist/css/dx.light.css';

const OTPVerification = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    // Sử dụng useRef để theo dõi việc đã gửi OTP ban đầu hay chưa
    const initialOTPSent = useRef(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { phone, account } = location.state || {};
    
    // Hàm gửi OTP và lấy mã từ console
    const sendOTPAndGetCode = async () => {
        try {
            setLoading(true);
            
            const response = await axios.post(`${API_URL}/auth/register`, {
                accountId: account,
                password: location.state.password,
                phone
            });
            
            if (response.data.success) {
                notify('Mã OTP đã được gửi', 'success', 2000);
            } else {
                notify(response.data.message || 'Không thể gửi OTP', 'error', 3000);
            }
        } catch (error) {
            console.error('Lỗi khi gửi OTP:', error);
            notify(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi OTP', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (!phone || !account) {
            notify('Thông tin không hợp lệ. Vui lòng thử lại.', 'error', 3000);
            navigate('/login');
            return;
        }
        
        // Chỉ gửi OTP một lần khi component được mount
        if (!initialOTPSent.current) {
            initialOTPSent.current = true;
            sendOTPAndGetCode();
        }
        
        // Đếm ngược thời gian gửi lại OTP
        let timer;
        if (countdown > 0 && !canResend) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
            setCanResend(true);
        }
        
        return () => clearTimeout(timer);
    }, [countdown, canResend]);
    
    const handleVerifyOTP = async () => {
        if (!otp) {
            notify('Vui lòng nhập mã OTP', 'error', 3000);
            return;
        }
        
        try {
            setLoading(true);
            
            const response = await axios.post(`${API_URL}/auth/verify-otp`, {
                phone,
                otp
            });
            
            if (response.data.success) {
                notify(response.data.message, 'success', 2000);
                
                // Navigate to complete profile page with account and phone
                navigate('/complete-profile', {
                    state: {
                        accountId: response.data.data.accountId,
                        phone: response.data.data.phone
                    }
                });
            } else {
                notify(response.data.message || 'Xác thực thất bại', 'error', 3000);
            }
        } catch (error) {
            notify(
                error.response?.data?.message || 'Đã xảy ra lỗi khi xác thực OTP',
                'error',
                3000
            );
        } finally {
            setLoading(false);
        }
    };
    
    const handleResendOTP = async () => {
        setCountdown(60);
        setCanResend(false);
        sendOTPAndGetCode();
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
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)',
                padding: '40px',
                width: '100%',
                maxWidth: '500px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Xác thực OTP</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Mã OTP đã được gửi đến số điện thoại {phone}
                </p>
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyOTP();
                }}>
                    <div style={{ marginBottom: '25px' }}>
                        <div className="otp-input-container" style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '10px'
                        }}>
                            <TextBox
                                value={otp}
                                onValueChanged={e => setOtp(e.value)}
                                placeholder="Nhập mã OTP 6 số"
                                mode="tel"
                                maxLength={6}
                                stylingMode="outlined"
                                style={{
                                    fontSize: '20px',
                                    letterSpacing: '8px',
                                    textAlign: 'center',
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px'
                                }}
                            >
                                <Validator>
                                    <RequiredRule message="Vui lòng nhập mã OTP" />
                                    <PatternRule
                                        pattern="^[0-9]{6}$"
                                        message="Mã OTP phải có 6 chữ số"
                                    />
                                </Validator>
                            </TextBox>
                        </div>
                        <ValidationSummary />
                    </div>
                    
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px' 
                    }}>
                        <Button
                            text="Xác nhận"
                            type="success"
                            useSubmitBehavior={true}
                            width="50%"
                            height={40}
                        />
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                        {canResend ? (
                            <Button
                                text="Gửi lại mã OTP"
                                type="normal"
                                onClick={handleResendOTP}
                                stylingMode="text"
                            />
                        ) : (
                            <p style={{ color: '#666' }}>Gửi lại mã sau <span style={{ fontWeight: 'bold', color: '#2da0a8' }}>{countdown}</span> giây</p>
                        )}
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button
                            text="Quay lại đăng ký"
                            type="normal"
                            onClick={() => navigate('/login')}
                            stylingMode="text"
                        />
                    </div>
                </form>
                
                <LoadPanel
                    visible={loading}
                    showIndicator={true}
                    shading={true}
                    showPane={true}
                    shadingColor="rgba(0, 0, 0, 0.4)"
                    message="Đang xử lý..."
                />
            </div>
        </div>
    );
};

export default OTPVerification; 