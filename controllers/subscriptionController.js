const Subscription = require('../models/Subscription');
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

// Create a new subscription
exports.createSubscription = async (req, res) => {
    const { userId, plan, amount, durationDays } = req.body;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + durationDays);

    const newSubscription = new Subscription({
        userId,
        plan,
        amount,
        durationDays,
        expirationDate
    });

    try {
        const subscription = await newSubscription.save();
        res.status(201).json(subscription);
    } catch (err) {
        res.status(400).send('Error creating subscription: ' + err.message);
    }
};

// Read all subscriptions
exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json(subscriptions);
    } catch (err) {
        res.status(500).send('Error retrieving subscriptions: ' + err.message);
    }
};

// Read a subscription by ID
exports.getSubscriptionById = async (req, res) => {
    const { id } = req.params;
    try {
        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).send('Subscription not found');
        }
        res.status(200).json(subscription);
    } catch (err) {
        res.status(500).send('Error retrieving subscription: ' + err.message);
    }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const subscription = await Subscription.findByIdAndUpdate(id, updates, { new: true });
        if (!subscription) {
            return res.status(404).send('Subscription not found');
        }
        res.status(200).json(subscription);
    } catch (err) {
        res.status(400).send('Error updating subscription: ' + err.message);
    }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
    const { id } = req.params;

    try {
        const subscription = await Subscription.findByIdAndDelete(id);
        if (!subscription) {
            return res.status(404).send('Subscription not found');
        }
        res.status(204).send(); // No content
    } catch (err) {
        res.status(500).send('Error deleting subscription: ' + err.message);
    }
};

// Payment processing functions
exports.payWithPaystack = async (req, res) => {
    const { email, amount } = req.body;

    const response = await paystack.transaction.initialize({
        email,
        amount: amount * 100 // Convert KSh to kobo or smallest currency unit
    });
    res.json({ authorization_url: response.data.authorization_url });
};

// Confirm payment and activate subscription
exports.confirmPayment = async (req, res) => {
    const { subscriptionId, reference } = req.body;

    const response = await paystack.transaction.verify(reference);

    if (response.status && response.data.status === "success") {
        const subscription = await Subscription.findById(subscriptionId);
        if (subscription) {
            subscription.isActive = true; 
            subscription.startDate = Date.now();
            subscription.expirationDate = new Date(Date.now() + subscription.durationDays * 24 * 60 * 60 * 1000);
            await subscription.save();
            return res.json(subscription);
        }
    }

    res.status(400).send('Payment confirmation failed.');
};