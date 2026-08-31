const express = require('express');
const router = express.Router();


const { createRoom, getAllRooms, deleteRoom } = require('../controllers/roomController');

const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, createRoom);

router.get('/', getAllRooms);

router.delete('/:id', verifyToken, deleteRoom);

module.exports = router;