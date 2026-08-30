const express = require('express');
const router = express.Router();

// Controller se functions import kiye
const { createRoom, getAllRooms, deleteRoom } = require('../controllers/roomController');

// Auth middleware import kiya - login zaroori hai add/delete ke liye
const verifyToken = require('../middleware/authMiddleware');

// CREATE - verifyToken pehle chalega, phir createRoom
router.post('/', verifyToken, createRoom);

// READ - public rakha hai (students bhi bina login rooms dekh sakein)
router.get('/', getAllRooms);

// DELETE - ':id' se pata chalega konsa room delete karna hai
router.delete('/:id', verifyToken, deleteRoom);

module.exports = router;