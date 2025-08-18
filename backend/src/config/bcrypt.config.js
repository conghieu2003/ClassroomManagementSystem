const bcrypt = require('bcrypt');
const authConfig = require('./auth.config');

/**
 * Hash một password sử dụng bcrypt
 * @param {string} password - Password cần hash
 * @returns {Promise<string>} - Password đã được hash
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, authConfig.bcrypt.saltRounds);
};

/**
 * So sánh password với hash
 * @param {string} password - Password cần kiểm tra
 * @param {string} hash - Hash đã lưu trong database
 * @returns {Promise<boolean>} - True nếu password khớp
 */
const comparePassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('Lỗi khi so sánh password:', error);
        return false;
    }
};

module.exports = {
    hashPassword,
    comparePassword
};