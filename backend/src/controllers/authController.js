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

// jwt library import kar rahe hain - JWT_SECRET se token sign/verify karne ke liye
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    // Frontend se email aur password nikalo
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email se user dhoondo database mein
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // Agar user mila hi nahi - generic error (security ke liye, 
    // "email exist nahi karta" specifically nahi batate)
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Query se pehla (aur akela) matching user nikaal lo
    const user = users[0];

    // bcrypt.compare() - entered password ko DB wale hash se compare karta hai
    // Ye bilkul waisa hi kaam karta hai jaisa Day 2 mein samjha tha:
    // fresh hash nahi banate, balki bcrypt internally check karta hai match hai ya nahi
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Password sahi hai - ab JWT token banate hain
    // Payload mein sirf non-sensitive info daal rahe hain (userId, role)
    // JWT_SECRET .env se aa raha hai - isी se signature banega
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // token 7 din baad expire ho jayega
    );

    // Token aur basic user info wapas bhej rahe hain
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Ab dono functions export karo (register already tha, login add kiya)
module.exports = { register, login };