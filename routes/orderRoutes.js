const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const orderController = require('../controllers/orderController');
const baseController = require('../controllers/baseController');

router.get('/destinations/:user_id', orderController.getDestinationOrderByUser);

router.post('/', orderController.createOrder);

router.route('/').get(orderController.getAllOrders);

router.route('/:id').get(orderController.getOrder);

router.route('/:id').patch(orderController.updateOrder);
router.route('/:id').delete(orderController.deleteOrder);

module.exports = router;
