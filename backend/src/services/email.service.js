const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Cấu hình transporter cho email
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Hoặc service khác tùy theo nhu cầu
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password'
            }
        });
    }

    async sendEmail({ to, subject, content }) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: to,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                            <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
                            <div style="background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                                ${content.replace(/\n/g, '<br>')}
                            </div>
                            <div style="text-align: center; color: #666; font-size: 12px;">
                                <p>Email này được gửi tự động từ hệ thống quản lý lớp học</p>
                                <p>Vui lòng không trả lời email này</p>
                            </div>
                        </div>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error(`Lỗi gửi email: ${error.message}`);
        }
    }

    // Method để gửi email thông báo tài khoản mới
    async sendAccountNotification({ to, username, password, fullName, role }) {
        const subject = 'Thông báo tài khoản mới - Hệ thống quản lý lớp học';
        const content = `
            <h3>Chào ${fullName},</h3>
            <p>Tài khoản của bạn đã được tạo thành công trong hệ thống quản lý lớp học.</p>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1976d2;">Thông tin đăng nhập:</h4>
                <p><strong>Tên đăng nhập:</strong> ${username}</p>
                <p><strong>Mật khẩu:</strong> ${password}</p>
                <p><strong>Vai trò:</strong> ${role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}</p>
            </div>
            
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #f57c00;">Lưu ý quan trọng:</h4>
                <ul>
                    <li>Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản</li>
                    <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                    <li>Liên hệ admin nếu gặp vấn đề khi đăng nhập</li>
                </ul>
            </div>
            
            <p>Trân trọng,<br>Ban quản trị hệ thống</p>
        `;

        return this.sendEmail({ to, subject, content });
    }
}

module.exports = new EmailService();
