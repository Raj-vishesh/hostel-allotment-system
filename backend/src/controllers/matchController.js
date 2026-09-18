const pool = require('../config/db');
const galeShapley = require('../utils/galeShapley');

const runMatch = async (req, res) => {
  try {
    // Step 1: Saari preferences nikaalo, rank ke hisaab se sorted
    const [preferences] = await pool.query(
      'SELECT student_id, room_id, rank_order FROM preferences ORDER BY student_id, rank_order ASC'
    );

    // Step 2: Saare rooms nikaalo
    const [rooms] = await pool.query('SELECT id, capacity FROM rooms');

    // Step 3: preferences rows ko galeShapley ke required format mein convert karo
    const studentPreferences = {};
    for (const pref of preferences) {
      // agar is student ke liye array abhi tak nahi bana, khali array bana do
      if (!studentPreferences[pref.student_id]) {
        studentPreferences[pref.student_id] = [];
      }
      studentPreferences[pref.student_id].push(pref.room_id);
    }

    // Step 4: rooms ko bhi required format mein convert karo
    const roomCapacities = {};
    for (const room of rooms) {
      roomCapacities[room.id] = room.capacity;
    }

    // Step 5: algorithm chalao
    const { roomAssignments, unmatchedStudents } = galeShapley(studentPreferences, roomCapacities);

    // Step 6: purane allotments clear karo (agar dobara match chalaya jaye to)
    await pool.query('DELETE FROM allotments');

    // Step 7: naye results ko allotments table mein insert karo
    let matchedCount = 0;
    for (const roomId in roomAssignments) {
      const studentsInRoom = roomAssignments[roomId];
      for (const studentId of studentsInRoom) {
        await pool.query(
          'INSERT INTO allotments (student_id, room_id) VALUES (?, ?)',
          [studentId, roomId]
        );
        matchedCount++;
      }
    }

    res.status(200).json({
      message: 'Matching completed successfully',
      matchedCount,
      unmatchedCount: unmatchedStudents.length,
      unmatchedStudents,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const resetMatch = async (req, res) => {
  try {
    await pool.query('DELETE FROM allotments');
    res.status(200).json({ message: 'Allotments reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { runMatch, resetMatch };