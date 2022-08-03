const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const fileUploader = require('../config/cloudinary.config');

router.post(
  '/',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  roomController.createRoom
);

router.route('/').get(roomController.getAllRooms);
router.patch(
  '/:id',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  roomController.updateRoom
);
router
  .route('/:id')
  .get(roomController.getRoom)
  .delete(roomController.deleteRoom);

module.exports = router;
