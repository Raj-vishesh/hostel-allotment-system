const bcrypt = require('bcrypt');
const pool = require('../config/db');

const register = async (req, res) => {
  try {
    // Frontend se aaya JSON data destructure kar rahe hain
    const { name, email, password, role } = req.body;

    // Basic validation - koi field khali na ho
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check karo email already database mein exist to nahi karta
    // '?' placeholder use kiya hai SQL Injection se bachne ke liye
    // (directly string jodte to hacker malicious SQL inject kar sakta tha)
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    // Agar query se koi row mili, matlab email already registered hai
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Password ko bcrypt se hash kar rahe hain - PLAIN password kabhi store nahi karte
    // '10' yahan "salt rounds" hai - jitna zyada number utna slow/secure (10 = industry standard)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Naya user database mein insert kar rahe hain
    // Note: hashedPassword store ho raha hai, original password kahin nahi ja raha
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // Success response - insertId MySQL automatically deta hai naye row ka ID
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
    });
  } catch (err) {
    // Agar kahin bhi error aaye (DB down, bad query, etc.) - yahan catch hoga
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Is function ko export kar rahe hain taaki route file isse use kar sake
module.exports = { register };