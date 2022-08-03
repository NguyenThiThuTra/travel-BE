const express = require('express');
const router = express.Router();
const homestayController = require('../controllers/homestayController');
const fileUploader = require('../config/cloudinary.config');
const authController = require('./../controllers/authController');

router.post(
  '/',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  homestayController.createHomestay
);

router.route('/').get(homestayController.getAllHomestay);
router.route('/search').get(homestayController.getAllHomestaySearch);
router.patch(
  '/:id',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  homestayController.updateHomestay
);
router.patch(
  '/:id/active',
  authController.protect,
  authController.getCurrentUser,
  homestayController.handleActiveHomestay
);
router
  .route('/:id')
  .get(homestayController.getHomestay)
  .delete(homestayController.deleteHomestay);

module.exports = router;
