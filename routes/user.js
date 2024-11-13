const express = require('express');
const auth = require('../middleware/auth'); // Use the auth middleware for protected routes
const User = require('../models/User');

const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Get user by id
router.get('/:id', auth, async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

// Update user
router.put('/:id', auth, async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.findByIdAndUpdate(req.params.id, { username, email, password: hashedPassword });
    res.send('User updated successfully.');
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.send('User deleted successfully.');
});

module.exports = router;