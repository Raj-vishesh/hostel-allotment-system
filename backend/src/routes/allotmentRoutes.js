const express = require('express');
const router = express.Router();
const { getMyAllotment, getAllAllotments, getAdminStudents } = require('../controllers/allotmentController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/my', verifyToken, getMyAllotment);
router.get('/admin-students', verifyToken, getAdminStudents);
router.get('/', verifyToken, getAllAllotments);

module.exports = router;