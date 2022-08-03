const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const fileUploader = require('../config/cloudinary.config');

router.post(
  '/homestay',
  fileUploader.fields([
    { name: 'images', maxCount: 8 },
  ]),
  commentController.addCommentInHomestay
);

router.get('/homestay/:homestay_id', commentController.getAllCommentInHomestay);

router.get('/', commentController.getAll);

router.patch('/:id', commentController.updateComment);

module.exports = router;
