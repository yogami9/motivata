const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.register = async(req, res) => {
    const {
        email,
        password,
        confirmPassword,  // This is for validation only
        username
    } = req.body;

    // Validate that the passwords match
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        email,
        password: hashedPassword, // Only save the hashed password
        username
    });

    try {
        await newUser.save();
        res.status(201).send('User registered successfully.');
    } catch (err) {
        res.status(400).send('Error registering user: ' + err.message);
    }
};

exports.login = async(req, res) => {
    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid credentials.');
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token });
};

exports.adminLogin = async(req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(400).send('Invalid credentials.');
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET);
    res.json({ token });
};