const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const fileUploader = require('../config/cloudinary.config');

router.post(
  '/',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  destinationController.createDestination
);
router.post(
  '/addHomestay',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  destinationController.addHomestayAndUpdateDestination
);
router.route('/').get(destinationController.getAllDestinations);

router.route('/:id').get(destinationController.getDestination);
router
  .route('/homestays/:homestay_id')
  .patch(destinationController.updateDestinationOfHomestay);
// -- Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));
router.patch(
  '/:id',
  fileUploader.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'images', maxCount: 8 },
  ]),
  destinationController.updateDestination
);
router.route('/:id').delete(destinationController.deleteDestination);
router
  .route('/:id/homestays')
  .get(destinationController.getHomestayInDestination);

module.exports = router;
