const pool = require('../config/db');

const getMyAllotment = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [students] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const studentId = students[0].id;

    const [result] = await pool.query(
      `SELECT a.id, r.room_number, r.hostel_block, r.capacity, r.room_type, a.matched_at
       FROM allotments a
       JOIN rooms r ON a.room_id = r.id
       WHERE a.student_id = ?`,
      [studentId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'No allotment found yet' });
    }

    res.status(200).json({ allotment: result[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getMyAllotment };