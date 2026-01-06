const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// --- PUBLIC ROUTES ---
router.post('/register', userController.register);
router.post('/login', userController.login);

// --- PRIVATE ROUTES (Bisa ditambah middleware auth nanti) ---
// Get all users
router.get('/', userController.getAllUsers);

// Get user by id
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', userController.updateUser);

// Change password
router.post('/:id/change-password', userController.changePassword);

// Delete user
router.delete('/:id', userController.deleteUser);

// Deactivate user
router.patch('/:id/deactivate', userController.deactivateUser);

// Activate user
router.patch('/:id/activate', userController.activateUser);

module.exports = router;
