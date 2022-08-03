const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const fileUploader = require('../config/cloudinary.config');
const authController = require('./../controllers/authController');

router.route('/').get(categoryController.getAllCategory);
router.patch(
  '/:id',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  categoryController.updateCategory
);
router.patch(
  '/:id/active',
  authController.protect,
  authController.getCurrentUser,
  categoryController.handleActiveCategory
);
router
  .route('/:id')
  .get(categoryController.getCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
