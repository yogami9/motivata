const express = require('express');
const auth = require('../middleware/auth'); 
const Admin = require('../models/Admin');

const router = express.Router();

// Get all admins
router.get('/', auth, async (req, res) => {
    const admins = await Admin.find();
    res.json(admins);
});

// Get admin by id
router.get('/:id', auth, async (req, res) => {
    const admin = await Admin.findById(req.params.id);
    res.json(admin);
});

// Update admin
router.put('/:id', auth, async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.findByIdAndUpdate(req.params.id, { username, password: hashedPassword });
    res.send('Admin updated successfully.');
});

// Delete admin
router.delete('/:id', auth, async (req, res) => {
    await Admin.findByIdAndDelete(req.params.id);
    res.send('Admin deleted successfully.');
});

module.exports = router;