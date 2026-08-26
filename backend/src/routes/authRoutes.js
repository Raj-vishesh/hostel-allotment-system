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

// router.post() ka matlab: jab is URL par POST request aaye, to 'register' function chalao
// POST isliye use kiya (GET nahi) kyunki hum server ko NAYA DATA bhej rahe hain (create operation)
// '/register' yahan chhota path hai - poora URL '/api/auth/register' banega (index.js mein prefix milega)
router.post('/register', register);

router.post('/login' , login);

// Is router ko export kar rahe hain taaki index.js ise use kar sake
module.exports = router;