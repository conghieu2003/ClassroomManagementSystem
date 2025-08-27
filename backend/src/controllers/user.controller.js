const userService = require('../services/user.service');

class UserController {
    async list(req, res) {
        try {
            const { role, username } = req.body || {};

            // Cross-check: username in body must match requester account
            if (username) {
                if (!req.user || !req.user.accountId) {
                    return res.status(401).json({ success: false, message: 'Thiếu thông tin xác thực' });
                }
                // Only allow if username belongs to the authenticated account
                if (req.user.username && req.user.username !== username) {
                    return res.status(403).json({ success: false, message: 'Không khớp người yêu cầu' });
                }
            }
            const data = await userService.listUsers(role);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();


