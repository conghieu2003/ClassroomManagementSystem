import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import notify from 'devextreme/ui/notify';
import axios from 'axios';
import { API_URL } from '../../services/api';
import { 
    Button, 
    LoadPanel, 
    TextBox, 
    DateBox, 
    SelectBox,
    ValidationGroup,
    Validator
} from 'devextreme-react';
import { RequiredRule, EmailRule } from 'devextreme-react/validator';
import 'devextreme/dist/css/dx.light.css';

const CompleteProfile = () => {
    const [formData, setFormData] = useState({
        accountId: '',
        fullName: '',
        gender: true,
        birthday: null,
        email: '',
        phone: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        // Check if we have the required data from OTP verification
        if (!location.state || !location.state.accountId || !location.state.phone) {
            notify('Thông tin không hợp lệ. Vui lòng thử lại.', 'error', 3000);
            navigate('/login');
            return;
        }
        
        // Pre-fill the form with account ID and phone
        setFormData(prev => ({
            ...prev,
            accountId: location.state.accountId,
            phone: location.state.phone
        }));
    }, [location.state, navigate]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        const requiredFields = ['fullName', 'birthday', 'email', 'department'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            notify('Vui lòng nhập đầy đủ thông tin', 'error', 3000);
            return;
        }
        
        try {
            setLoading(true);
            
            const response = await axios.post(`${API_URL}/auth/complete-registration`, formData);
            
            if (response.data.success) {
                notify(response.data.message, 'success', 2000);
                
                // Redirect to login page after successful registration
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                notify(response.data.message || 'Đăng ký thất bại', 'error', 3000);
            }
        } catch (error) {
            notify(
                error.response?.data?.message || 'Đã xảy ra lỗi khi hoàn tất đăng ký',
                'error',
                3000
            );
        } finally {
            setLoading(false);
        }
    };
    
    const genderOptions = [
        { value: true, text: 'Nam' },
        { value: false, text: 'Nữ' }
    ];
    
    const departmentOptions = [
        { value: 'CNTT', text: 'Công nghệ thông tin' },
        { value: 'QTKD', text: 'Quản trị kinh doanh' },
        { value: 'KTPM', text: 'Kỹ thuật phần mềm' },
        { value: 'HTTT', text: 'Hệ thống thông tin' },
        { value: 'KHMT', text: 'Khoa học máy tính' }
    ];
    
    return (
        <div className="complete-profile-container" style={{
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
            <div className="form-card" style={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)',
                padding: '40px',
                width: '100%',
                maxWidth: '600px'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#333',
                    fontSize: '24px'
                }}>Hoàn tất thông tin cá nhân</h2>
                
                <ValidationGroup>
                    <form onSubmit={handleSubmit}>
                        <div className="section-title" style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#2da0a8',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '8px',
                            marginBottom: '15px',
                            marginTop: '25px'
                        }}>Thông tin tài khoản</div>
                        
                        <div className="form-row" style={{
                            display: 'flex',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <div className="label" style={{
                                width: '120px',
                                paddingRight: '15px',
                                textAlign: 'right',
                                fontWeight: '500',
                                color: '#555'
                            }}>Tài khoản:</div>
                            <div className="input-container" style={{ flex: '1' }}>
                                <TextBox
                                    value={formData.accountId}
                                    readOnly={true}
                                    stylingMode="outlined"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row" style={{
                            display: 'flex',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <div className="label" style={{
                                width: '120px',
                                paddingRight: '15px',
                                textAlign: 'right',
                                fontWeight: '500',
                                color: '#555'
                            }}>Số điện thoại:</div>
                            <div className="input-container" style={{ flex: '1' }}>
                                <TextBox
                                    value={formData.phone}
                                    readOnly={true}
                                    stylingMode="outlined"
                                />
                            </div>
                        </div>
                        
                        <div className="section-title" style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#2da0a8',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '8px',
                            marginBottom: '15px',
                            marginTop: '25px'
                        }}>Thông tin cá nhân</div>
                        
                        <div className="form-row" style={{
                            display: 'flex',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <div className="label" style={{
                                width: '120px',
                                paddingRight: '15px',
                                textAlign: 'right',
                                fontWeight: '500',
                                color: '#555'
                            }}>Họ và tên:</div>
                            <div className="input-container" style={{ flex: '1' }}>
                                <TextBox
                                    value={formData.fullName}
                                    onValueChanged={e => setFormData({...formData, fullName: e.value})}
                                    placeholder="Nhập họ và tên"
                                    stylingMode="outlined"
                                >
                                    <Validator>
                                        <RequiredRule message="Họ và tên là bắt buộc" />
                                    </Validator>
                                </TextBox>
                            </div>
                        </div>
                        
                        <div className="form-row" style={{
                            display: 'flex',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <div className="label" style={{
                                width: '120px',
                                paddingRight: '15px',
                                textAlign: 'right',
                                fontWeight: '500',
                                color: '#555'
                            }}>Giới tính:</div>
                            <div className="input-container" style={{ flex: '1' }}>
                                <SelectBox
                                    items={genderOptions}
                                    valueExpr="value"
                                    displayExpr="text"
                                    value={formData.gender}
                                    defaultValue={true}
                                    onValueChanged={e => setFormData({...formData, gender: e.value})}
                                    stylingMode="outlined"
                                    placeholder="Chọn giới tính"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row" style={{
                            display: 'flex',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <div className="label" style={{
                                width: '120px',
                                paddingRight: '15px',
                                textAlign: 'right',
                                fontWeight: '500',
                                color: '#555'
                            }}>Ngày sinh:</div>
                            <div className="input-container" style={{ flex: '1' }}>
                                <DateBox
                                    value={formData.birthday}
                                    type="date"
                                    pickerType="calendar"
                                    displayFormat="dd/MM/yyyy"
                                    onValueChanged={e => setFormData({...formData, birthday: e.value})}
                                    max={new Date()}
                                    stylingMode="outlined"
                                    openOnFieldClick={true}
                                    placeholder="Chọn ngày sinh"
                                >
                                    <Validator>
                                        <RequiredRule message="Ngày sinh là bắt buộc" />
                                    </Validator>
                                </DateBox>
                            </div>
                        </div>
                        
                        <div className="form-row" style={{
                            display: 'flex',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <div className="label" style={{
                                width: '120px',
                                paddingRight: '15px',
                                textAlign: 'right',
                                fontWeight: '500',
                                color: '#555'
                            }}>Email:</div>
                            <div className="input-container" style={{ flex: '1' }}>
                                <TextBox
                                    value={formData.email}
                                    onValueChanged={e => setFormData({...formData, email: e.value})}
                                    placeholder="Nhập địa chỉ email"
                                    mode="email"
                                    stylingMode="outlined"
                                >
                                    <Validator>
                                        <RequiredRule message="Email là bắt buộc" />
                                        <EmailRule message="Email không hợp lệ" />
                                    </Validator>
                                </TextBox>
                            </div>
                        </div>
                        
                        <div className="form-row" style={{
                            display: 'flex',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <div className="label" style={{
                                width: '120px',
                                paddingRight: '15px',
                                textAlign: 'right',
                                fontWeight: '500',
                                color: '#555'
                            }}>Khoa:</div>
                            <div className="input-container" style={{ flex: '1' }}>
                                <SelectBox
                                    items={departmentOptions}
                                    valueExpr="value"
                                    displayExpr="text"
                                    value={formData.department}
                                    onValueChanged={e => setFormData({...formData, department: e.value})}
                                    placeholder="Chọn khoa"
                                    stylingMode="outlined"
                                    searchEnabled={true}
                                >
                                    <Validator>
                                        <RequiredRule message="Khoa là bắt buộc" />
                                    </Validator>
                                </SelectBox>
                            </div>
                        </div>
                        
                        <div className="submit-container" style={{
                            marginTop: '30px',
                            textAlign: 'center'
                        }}>
                            <Button
                                text="Hoàn tất đăng ký"
                                type="success"
                                useSubmitBehavior={true}
                                width="50%"
                                height={40}
                            />
                        </div>
                    </form>
                </ValidationGroup>
                
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

export default CompleteProfile; 