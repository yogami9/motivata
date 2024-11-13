const express = require('express');
const router = express.Router();
const {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    payWithPaystack,
    confirmPayment
} = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// CRUD operations
router.post('/', auth, createSubscription); // Create
router.get('/', auth, getAllSubscriptions); // Read all
router.get('/:id', auth, getSubscriptionById); // Read by ID
router.put('/:id', auth, updateSubscription); // Update
router.delete('/:id', auth, deleteSubscription); // Delete

// Payment processing
router.post('/pay', payWithPaystack);
router.post('/confirm', auth, confirmPayment);

module.exports = router;