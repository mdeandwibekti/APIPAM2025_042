const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// --- CREATE TRANSACTION ---
router.post('/', transactionController.createTransaction);

// --- GET ALL TRANSACTIONS ---
router.get('/', transactionController.getAllTransactions);

// --- GET TRANSACTION STATISTICS ---
router.get('/stats', transactionController.getTransactionStats);

// --- GET TRANSACTION BY ID ---
router.get('/:id', transactionController.getTransactionById);


// --- GET TRANSACTION BY USER ID ---
router.get('/user/:user_id', transactionController.getTransactionByUserId);

// --- UPDATE TRANSACTION STATUS ---
router.patch('/:id/status', transactionController.updateTransactionStatus);

// --- UPDATE TRANSACTION ---
router.put('/:id', transactionController.updateTransaction);

// --- DELETE TRANSACTION ---
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
