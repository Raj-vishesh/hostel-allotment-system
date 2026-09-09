const express = require('express');
const router = express.Router();
const { submitPreferences, getMyPreferences } = require('../controllers/preferenceController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, submitPreferences);
router.get('/my', verifyToken, getMyPreferences);

module.exports = router;