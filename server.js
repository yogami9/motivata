const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('./config/db');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const subscriptionRoutes = require('./routes/subscription');
const userRoutes = require('./routes/user'); // User CRUD operations
const adminRoutes = require('./routes/admin'); // Admin CRUD operations

const app = express();
const PORT = Number(process.env.PORT) || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/users', userRoutes); // User routes
app.use('/api/admins', adminRoutes); // Admin routes

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});