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
 
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
 
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = { register };


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


    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Query se pehla (aur akela) matching user nikaal lo
    const user = users[0];


    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


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