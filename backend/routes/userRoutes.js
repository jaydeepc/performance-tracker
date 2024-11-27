const express = require('express');
const router = express.Router();
const { 
    createUser, 
    getUsers, 
    getUserById, 
    getReportees, 
    updateUser, 
    deleteUser 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Allow first admin user creation without auth
router.post('/setup-admin', createUser);

// Protected routes
router.route('/')
    .post(protect, authorize('admin'), createUser)
    .get(protect, authorize('admin'), getUsers);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

// Manager routes
router.get('/managers/:managerId/reportees', protect, authorize('manager', 'admin'), getReportees);

module.exports = router;
