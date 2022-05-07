const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/VNPayment', paymentController.createVNPayment);
router.get('/VNPayment/ipn', paymentController.ipnVNPayment);
router.get('/VNPayment/return', paymentController.returnVNPayment);
router.post('/VNPayment/callback', paymentController.callbackVNPayment);
router.post('/VNPayment/check', paymentController.checkVNPayment);
router.post('/VNPayment/cancel', paymentController.cancelVNPayment);
router.post('/VNPayment/refund', paymentController.refundVNPayment);
router.post('/VNPayment/query', paymentController.queryVNPayment);

module.exports = router;
