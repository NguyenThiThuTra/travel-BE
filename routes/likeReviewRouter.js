const express = require('express');
const router = express.Router();
const likeReviewController = require('../controllers/likeReviewController');
const fileUploader = require('../config/cloudinary.config');

router.route('/').get(likeReviewController.getAllLikeReview);
// getLikeReviewByUserId
router.route('/review').post(likeReviewController.getLikeReviewByUserId);
router.patch('/:id', likeReviewController.updateLikeReview);
router
  .route('/:id')
  .get(likeReviewController.getLikeReview)
  // .patch(roomController.updateRoom)
  .delete(likeReviewController.deleteLikeReview);

module.exports = router;
