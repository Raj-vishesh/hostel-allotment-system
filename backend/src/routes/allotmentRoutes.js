const express = require('express');
const router = express.Router();
const { getMyAllotment } = require('../controllers/allotmentController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/my', verifyToken, getMyAllotment);

module.exports = router;