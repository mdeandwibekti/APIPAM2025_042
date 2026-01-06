const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// --- CREATE PRODUCT ---
router.post('/', productController.createProduct);

// --- GET ALL PRODUCTS (dengan filter & search) ---
router.get('/', productController.getAllProducts);

// --- GET PRODUCT STATISTICS ---
router.get('/stats', productController.getProductStats);

// --- SEARCH PRODUCTS ---
router.get('/search/:keyword', productController.searchProducts);

// --- GET PRODUCTS BY CATEGORY ---
router.get('/category/:category', productController.getProductByCategory);

// --- GET PRODUCT BY ID ---
router.get('/:id', productController.getProductById);

// --- GET PRODUCTS BY SELLER ID ---
router.get('/seller/:seller_id', productController.getProductBySellerId);

// --- UPDATE PRODUCT ---
router.put('/:id', productController.updateProduct);

// --- UPDATE PRODUCT STOCK ---
router.patch('/:id/stock', productController.updateProductStock);

// --- UPDATE PRODUCT RATING ---
router.patch('/:id/rating', productController.updateProductRating);

// --- DEACTIVATE PRODUCT ---
router.patch('/:id/deactivate', productController.deactivateProduct);

// --- ACTIVATE PRODUCT ---
router.patch('/:id/activate', productController.activateProduct);

// --- DELETE PRODUCT ---
router.delete('/:id', productController.deleteProduct);

module.exports = router;
