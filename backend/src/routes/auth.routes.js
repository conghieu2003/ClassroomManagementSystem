const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');

router.post('/login', authController.login);
router.post('/register', authController.registerStep1);
router.post('/verify-otp', authController.verifyOTP);
router.post('/complete-registration', authController.completeRegistration);
router.get('/get-test-otp', authController.getTestOTP);

module.exports = router; 