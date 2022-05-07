const express = require('express');
const router = express.Router();
const homestayController = require('../controllers/homestayController');
const fileUploader = require('../config/cloudinary.config');
//end upload
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
router
  .route('/:id')
  .get(homestayController.getHomestay)
  // .patch(homestayController.updateHomestay)
  .delete(homestayController.deleteHomestay);

module.exports = router;
