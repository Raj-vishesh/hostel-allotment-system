const express = require('express');
const router = express.Router();
const { runMatch, resetMatch } = require('../controllers/matchController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/run', verifyToken, runMatch);
router.post('/reset', verifyToken, resetMatch);

module.exports = router;