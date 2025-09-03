const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.post('/list', authorize(['admin']), userController.list);
router.get('/next-code', authorize(['admin']), userController.nextCode);
router.get('/departments', authorize(['admin']), userController.departments);
router.get('/majors', authorize(['admin']), userController.majors);
router.post('/create', authorize(['admin']), userController.create);
router.put('/:userId', authorize(['admin']), userController.update);

module.exports = router;


