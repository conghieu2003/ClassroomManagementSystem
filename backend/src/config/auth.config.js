module.exports = {
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'classroom_management_secret_key',
        expiresIn: '24h', // Token hết hạn sau 24 giờ
        refreshExpiresIn: '7d' // Refresh token hết hạn sau 7 ngày
    },

    // Bcrypt configuration
    bcrypt: {
        saltRounds: 10 // Số vòng lặp để tạo salt
    },

    // Password policy
    passwordPolicy: {
        minLength: 6,
        maxLength: 50,
        requireNumbers: true,
        requireUppercase: false,
        requireLowercase: false,
        requireSymbols: false
    },

    // Login attempts
    loginAttempts: {
        maxAttempts: 5, // Số lần thử đăng nhập tối đa
        lockoutDuration: 15 * 60 * 1000, // Thời gian khóa (15 phút)
        resetAfter: 60 * 60 * 1000 // Reset số lần thử sau 1 giờ
    }
}; 