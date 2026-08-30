require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');

// YE LINE PEHLE AANI CHAHIYE - app yahan banta hai
const app = express();

app.use(cors());
app.use(express.json());

// AB YE LINES - app already ban chuka hai isliye ye chalengi
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    res.json({ status: 'connected', tables: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));