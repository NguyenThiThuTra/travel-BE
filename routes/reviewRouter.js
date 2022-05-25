const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const fileUploader = require('../config/cloudinary.config');

router.post(
  '/',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  reviewController.postReview
);

router.route('/').get(reviewController.getAllReview);
router.patch(
  '/:id',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  reviewController.updateReview
);
router
  .route('/:id')
  .get(reviewController.getReview)
//   .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;