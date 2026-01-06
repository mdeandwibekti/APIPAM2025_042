const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// --- ADD TO CART ---
router.post('/', cartController.addToCart);

// --- GET CART BY USER ID ---
router.get('/user/:user_id', cartController.getCartByUserId);

// --- GET CART SUMMARY ---
router.get('/user/:user_id/summary', cartController.getCartSummary);

// --- GET CART ITEM BY ID ---
router.get('/:id', cartController.getCartItemById);

// --- UPDATE CART ITEM QUANTITY ---
router.put('/:id', cartController.updateCartItem);

// --- UPDATE QUANTITY (PATCH) ---
router.patch('/:id/quantity', cartController.updateCartQuantity);

// --- REMOVE ITEM FROM CART ---
router.delete('/:id', cartController.removeFromCart);

// --- CLEAR CART (HAPUS SEMUA ITEM) ---
router.delete('/user/:user_id', cartController.clearCart);

module.exports = router;
