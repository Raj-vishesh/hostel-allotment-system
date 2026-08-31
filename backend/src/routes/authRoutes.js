const express = require('express');

const router = express.Router();

const { register, login } = require('../controllers/authController');

const verifyToken = require('../middleware/authMiddleware');


router.post('/register', register);

router.post('/login' , login);

router.get('/profile', verifyToken, (req, res) => {
  // Yahan req.user available hai kyunki middleware ne isme attach kiya tha
  res.json({
    message: 'This is protected data',
    user: req.user,
  });
});

module.exports = router;