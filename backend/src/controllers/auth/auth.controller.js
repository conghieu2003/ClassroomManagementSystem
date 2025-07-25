const authService = require('../../services/auth.service');
const smsService = require('../../services/sms.service');

class AuthController {
    async login(req, res) {
        try {
            const { account, password } = req.body;
            const user = await authService.login(account, password);
            res.json({ success: true, user });
        } catch (error) {
            res.status(401).json({ 
                success: false, 
                message: error.message || 'Thông tin đăng nhập không chính xác' 
            });
        }
    }

    // Step 1: Register with account, password, and phone number
    async registerStep1(req, res) {
        try {
            console.log('Dữ liệu nhận được từ request đăng ký:', req.body);
            
            const { accountId, password, phone } = req.body;
            
            console.log('Đã trích xuất dữ liệu:', { accountId, password: '***', phone });
            
            // Validate input
            if (!accountId || !password || !phone) {
                console.log('Thiếu thông tin đăng ký:', { 
                    hasAccountId: !!accountId, 
                    hasPassword: !!password, 
                    hasPhone: !!phone 
                });
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ thông tin'
                });
            }
            
            const result = await authService.registerStep1(accountId, password, phone);
            console.log('Kết quả đăng ký:', result);
            res.json(result);
        } catch (error) {
            console.error('Lỗi đăng ký chi tiết:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Đăng ký thất bại'
            });
        }
    }

    // Step 2: Verify OTP
    async verifyOTP(req, res) {
        try {
            const { phone, otp } = req.body;
            
            // Validate input
            if (!phone || !otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ thông tin'
                });
            }
            
            const result = await authService.verifyOTP(phone, otp);
            res.json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Xác thực OTP thất bại'
            });
        }
    }

    // Step 3: Complete registration with user details
    async completeRegistration(req, res) {
        try {
            const userData = req.body;
            
            // Validate required fields
            const requiredFields = ['accountId', 'fullName', 'gender', 'birthday', 'email', 'phone', 'department'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    return res.status(400).json({
                        success: false,
                        message: `Vui lòng nhập ${field}`
                    });
                }
            }
            
            const result = await authService.completeRegistration(userData);
            res.json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Hoàn tất đăng ký thất bại'
            });
        }
    }

    // Endpoint để lấy mã OTP cho mục đích kiểm thử
    async getTestOTP(req, res) {
        try {
            const { phone } = req.query;
            
            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại không được cung cấp'
                });
            }
            
            const otpData = smsService.getStoredOTP(phone);
            
            if (!otpData || !otpData.otp) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy mã OTP cho số điện thoại này'
                });
            }
            
            res.json({
                success: true,
                otp: otpData.otp
            });
        } catch (error) {
            console.error('Lỗi khi lấy mã OTP kiểm thử:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy mã OTP kiểm thử'
            });
        }
    }
}

module.exports = new AuthController(); 