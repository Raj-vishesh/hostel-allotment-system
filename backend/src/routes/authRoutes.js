// Express ka Router object import kar rahe hain
// 'express' se poora library import karne ki jagah, sirf 'Router' feature use kar rahe hain
const express = require('express');

// router ek "mini Express app" jaisa hota hai - isme hum sirf routes define karte hain,
// isse main index.js file chhoti aur organized rehti hai
const router = express.Router();

// authController se register function import kar rahe hain
// { register } curly braces isliye hain kyunki authController.js mein humne
// 'module.exports = { register }' kiya tha - ye "named export" hai
const { register, login } = require('../controllers/authController');

const verifyToken = require('../middleware/authMiddleware');

// router.post() ka matlab: jab is URL par POST request aaye, to 'register' function chalao
// POST isliye use kiya (GET nahi) kyunki hum server ko NAYA DATA bhej rahe hain (create operation)
// '/register' yahan chhota path hai - poora URL '/api/auth/register' banega (index.js mein prefix milega)
router.post('/register', register);

router.post('/login' , login);

// NAYA ROUTE: '/profile' - isme verifyToken middleware pehle chalega
// Agar token valid hai tabhi ye anonymous function chalega
// Route mein 2 functions diye hain: middleware pehle, phir handler - Express dono ko sequence mein chalata hai
router.get('/profile', verifyToken, (req, res) => {
  // Yahan req.user available hai kyunki middleware ne isme attach kiya tha
  res.json({
    message: 'This is protected data',
    user: req.user,
  });
});

module.exports = router;