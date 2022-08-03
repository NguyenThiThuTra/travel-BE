const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');
const fileUploader = require('../config/cloudinary.config');

router.post(
  '/',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  reviewController.postReview
);

router.get('/', authController.getCurrentUser, reviewController.getAllReview);

router.route('/destination').get(reviewController.getAllReviewDestination);

router.post('/like', reviewController.likeReview);

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
  .delete(reviewController.deleteReview);

module.exports = router;
