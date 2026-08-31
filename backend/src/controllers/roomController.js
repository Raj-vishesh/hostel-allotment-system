const pool = require('../config/db');

// CREATE - naya room add karna
const createRoom = async (req, res) => {
  try {
    // Frontend se data nikaalo
    const { room_number, hostel_block, capacity, floor, room_type } = req.body;

    // Validation - important fields khali na ho
    if (!room_number || !hostel_block) {
      return res.status(400).json({ message: 'Room number and hostel block are required' });
    }
 
    const [result] = await pool.query(
      'INSERT INTO rooms (room_number, hostel_block, capacity, floor, room_type) VALUES (?, ?, ?, ?, ?)',
      [room_number, hostel_block, capacity || 1, floor || null, room_type || null]
    );

    res.status(201).json({
      message: 'Room created successfully',
      roomId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// READ - saare rooms ki list lao
const getAllRooms = async (req, res) => {
  try {
    const [rooms] = await pool.query('SELECT * FROM rooms');
    res.status(200).json({
      count: rooms.length,
      rooms: rooms,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE - ek specific room delete karo uski id se
const deleteRoom = async (req, res) => {
  try {

    const { id } = req.params;

    // Pehle check karo room exist karta hai (behtar error message ke liye)
    const [existingRoom] = await pool.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (existingRoom.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Delete karo
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createRoom, getAllRooms, deleteRoom };