const pool = require('../config/db');

const submitPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferences } = req.body;

    if (!Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({
        message: 'Preferences array is required'
      });
    }

    const [students] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const studentId = students[0].id;

    await pool.query(
      'DELETE FROM preferences WHERE student_id = ?',
      [studentId]
    );

    for (const pref of preferences) {
      const { room_id, rank_order } = pref;

      await pool.query(
        'INSERT INTO preferences (student_id, room_id, rank_order) VALUES (?, ?, ?)',
        [studentId, room_id, rank_order]
      );
    }

    res.status(201).json({
      message: 'Preferences submitted successfully'
    });

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

const getMyPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [students] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const studentId = students[0].id;

    const [preferences] = await pool.query(
      `SELECT p.id, p.rank_order, r.id AS room_id, r.room_number, r.hostel_block, r.floor, r.room_type, r.capacity
       FROM preferences p
       JOIN rooms r ON p.room_id = r.id
       WHERE p.student_id = ?
       ORDER BY p.rank_order ASC`,
      [studentId]
    );

    res.status(200).json({
      preferences
    });

  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

module.exports = {
  submitPreferences,
  getMyPreferences
};