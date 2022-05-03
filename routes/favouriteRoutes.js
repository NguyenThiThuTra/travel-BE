const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');

router.post('/', favouriteController.createFavourite);

router.route('/').get(favouriteController.getAllFavourite);
router.route('/user/:id').get(favouriteController.getRoomInFavourite);
router
  .route('/:id')
  .get(favouriteController.getFavourite)
  .patch(favouriteController.updateFavourite)
  .delete(favouriteController.deleteFavourite);
router.post('/delete', favouriteController.deleteManyFavourite);
module.exports = router;
