const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/homestay', commentController.addCommentInHomestay);

router.get('/homestay/:homestay_id', commentController.getAllCommentInHomestay);

// router.get('/:id',commentController.getComment);
// // -- Only admin have permission to access for the below APIs
// // router.use(authController.restrictTo('admin'));
router.patch('/:id',commentController.updateComment);
// router.delete('/:id',commentController.deleteComment);

module.exports = router;
