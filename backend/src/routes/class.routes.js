const express = require('express');
const router = express.Router();
const classController = require('../controllers/class.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.post('/', classController.create);

module.exports = router;


