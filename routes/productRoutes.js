const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const productController = require('../controllers/productController');
const verifyToken = require('../middlewares/verifyToken');

// ================= MULTER =================
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, 'prod-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ================= ROUTES =================

// 🔓 PUBLIC
router.get('/', productController.getAllProducts);
router.get('/seller/:seller_id', productController.getProductBySellerId);
router.get('/:id', productController.getProductById);

// 🔐 AUTH
router.get('/my/products', verifyToken, productController.getMyProducts);

router.post(
    '/',
    verifyToken,
    upload.single('image'),
    productController.createProduct
);

router.put(
    '/:id',
    verifyToken,
    upload.single('image'),
    productController.updateProduct
);

router.delete(
    '/:id',
    verifyToken,
    productController.deleteProduct
);

module.exports = router;
