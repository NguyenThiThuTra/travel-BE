const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const fileUploader = require('../configs/cloudinary.config');

router.route('/').get(categoryController.getAllCategory);
router.patch(
  '/:id',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  categoryController.updateCategory
);
router
  .route('/:id')
  .get(categoryController.getCategory)
  // .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
