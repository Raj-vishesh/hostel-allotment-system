const express = require('express');
const router = express.Router();
const { runMatch } = require('../controllers/matchController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/run', verifyToken, runMatch);

module.exports = router;