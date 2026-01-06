const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// --- CREATE ORDER ---
router.post('/', orderController.createOrder);

// --- CREATE ORDER FROM CART ---
router.post('/from-cart', orderController.createOrderFromCart);

// --- GET ALL ORDERS ---
router.get('/', orderController.getAllOrders);

// --- GET ORDER STATISTICS ---
router.get('/stats', orderController.getOrderStats);

// --- GET ORDER BY ID ---
router.get('/:id', orderController.getOrderById);

// --- GET ORDER BY ORDER NUMBER ---
router.get('/number/:order_number', orderController.getOrderByNumber);

// --- GET ORDER BY USER ID ---
router.get('/user/:user_id', orderController.getOrderByUserId);

// --- UPDATE ORDER STATUS ---
router.patch('/:id/status', orderController.updateOrderStatus);

// --- UPDATE ORDER ---
router.put('/:id', orderController.updateOrder);

// --- CANCEL ORDER ---
router.patch('/:id/cancel', orderController.cancelOrder);

// --- DELETE ORDER ---
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
