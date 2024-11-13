const express = require('express');
const router = express.Router();
const {
    register,
    login,
    adminLogin
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin); // New admin login route

module.exports = router;