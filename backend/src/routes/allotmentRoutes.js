const express = require('express');
const router = express.Router();
const { getMyAllotment, getAllAllotments } = require('../controllers/allotmentController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/my', verifyToken, getMyAllotment);
router.get('/', verifyToken, getAllAllotments);

module.exports = router;