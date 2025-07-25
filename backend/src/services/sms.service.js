class SmsService {
    constructor() {
        // Store OTPs with their expiration time (5 minutes)
        this.otpStore = new Map();
    }

    // Generate a random 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP to phone number (mock implementation)
    async sendOTP(phone) {
        try {
            console.log(`Bắt đầu tạo và gửi OTP cho số điện thoại: ${phone}`);
            const otp = this.generateOTP();
            console.log(`OTP đã được tạo: ${otp}`);
            
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 5); // OTP expires in 5 minutes
            console.log(`Thời gian hết hạn: ${expiryTime}`);
            
            // Store OTP with expiry time
            this.otpStore.set(phone, {
                otp,
                expiryTime
            });
            console.log(`OTP đã được lưu trong store với key ${phone}`);
            
            // Log OTP (for development purposes)
            console.log(`[SMS Service] OTP sent to ${phone}: ${otp}`);
            
            return { success: true, message: 'OTP đã được gửi thành công' };
        } catch (error) {
            console.error('Lỗi chi tiết khi gửi OTP:', error);
            return { success: false, message: 'Không thể gửi OTP' };
        }
    }

    // Verify OTP
    verifyOTP(phone, userOTP) {
        try {
            const otpData = this.otpStore.get(phone);
            
            if (!otpData) {
                return { success: false, message: 'OTP không tồn tại hoặc đã hết hạn' };
            }
            
            const { otp, expiryTime } = otpData;
            const currentTime = new Date();
            
            if (currentTime > expiryTime) {
                this.otpStore.delete(phone);
                return { success: false, message: 'OTP đã hết hạn' };
            }
            
            if (otp !== userOTP) {
                return { success: false, message: 'OTP không chính xác' };
            }
            
            // OTP is valid, remove it from store to prevent reuse
            this.otpStore.delete(phone);
            
            return { success: true, message: 'Xác thực OTP thành công' };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, message: 'Lỗi xác thực OTP' };
        }
    }

    // Lấy mã OTP đã lưu (chỉ dùng cho mục đích kiểm thử)
    getStoredOTP(phone) {
        try {
            const otpData = this.otpStore.get(phone);
            if (!otpData) {
                return null;
            }
            
            const { otp, expiryTime } = otpData;
            const currentTime = new Date();
            
            if (currentTime > expiryTime) {
                return null;
            }
            
            return { otp, expiryTime };
        } catch (error) {
            console.error('Lỗi khi lấy OTP đã lưu:', error);
            return null;
        }
    }
}

module.exports = new SmsService(); 