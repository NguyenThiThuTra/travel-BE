const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.post('/', locationController.createLocation);

router.route('/').get(locationController.getAllLocations);

router
    .route('/:id')
    .get(locationController.getAllLocations)
    .patch(locationController.updateLocation)
    .delete(locationController.deleteLocation);

module.exports = router;
