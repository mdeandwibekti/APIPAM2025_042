const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

const auth = require('../middlewares/authMiddleware');

router.post('/', auth, cartController.addToCart);
router.get('/user/:user_id', auth, cartController.getCartByUserId);
router.put('/:id', auth, cartController.updateCartItem);
router.delete('/:id', auth, cartController.removeFromCart);


// --- ADD TO CART ---

// --- GET CART BY USER ID ---

// --- GET CART SUMMARY ---
router.get('/user/:user_id/summary', cartController.getCartSummary);

// --- GET CART ITEM BY ID ---
router.get('/:id', cartController.getCartItemById);

// --- UPDATE CART ITEM QUANTITY ---
// --- UPDATE QUANTITY (PATCH) ---
router.patch('/:id/quantity', cartController.updateCartQuantity);


// --- CLEAR CART (HAPUS SEMUA ITEM) ---
router.delete('/user/:user_id', cartController.clearCart);

module.exports = router;
