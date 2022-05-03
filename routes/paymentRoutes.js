const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/VNPayment', paymentController.createVNPayment);

module.exports = router;
