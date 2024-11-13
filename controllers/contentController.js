
const Content = require('../models/Content');
const Subscription = require('../models/Subscription');

// Create new content with file upload
exports.createContent = async (req, res) => {
    const {
        title,
        description,
        contentType,
        thumbnail,
        isPremium
    } = req.body;

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const content = new Content({
        title,
        description,
        contentType,
        thumbnail,
        isPremium,
        file: {
            data: req.file.buffer,
            contentType: req.file.mimetype
        }
    });

    try {
        await content.save();
        res.status(201).json(content);
    } catch (err) {
        res.status(400).send('Error creating content: ' + err.message);
    }
};

// Get all content
exports.getAllContent = async (req, res) => {
    const content = await Content.find();
    res.json(content);
};

// Get content by ID
exports.getContentById = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).send('Content not found.');

        // Check if the user is subscribed if the content is premium
        const isUserSubscribed = await Subscription.findOne({
            userId: req.User._id, // assuming req.User contains user info after auth middleware
            // Check if subscription is active
            expirationDate: { $gt: new Date() }
        });

        if (content.isPremium && !isUserSubscribed) {
            return res.status(403).send('Access to this content is restricted. Please subscribe.');
        }

        // Respond with content details excluding the file
        const { file, ...rest } = content.toObject();
        res.json(rest);
    } catch (err) {
        res.status(400).send('Error fetching content: ' + err.message);
    }
};

// Update content by ID
exports.updateContent = async (req, res) => {
    try {
        const updatedData = {
            title: req.body.title,
            description: req.body.description,
            contentType: req.body.contentType,
            thumbnail: req.body.thumbnail,
            isPremium: req.body.isPremium,
        };

        // Handle file upload
        if (req.file) {
            updatedData.file = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        const content = await Content.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!content) return res.status(404).send('Content not found.');
        res.json(content);
    } catch (err) {
        res.status(400).send('Error updating content: ' + err.message);
    }
};

// Delete content by ID
exports.deleteContent = async (req, res) => {
    try {
        const content = await Content.findByIdAndRemove(req.params.id);
        if (!content) return res.status(404).send('Content not found.');
        res.json({ message: 'Content deleted successfully.' });
    } catch (err) {
        res.status(400).send('Error deleting content: ' + err.message);
    }
};

// Get all video content
exports.getAllVideos = async (req, res) => {
    try {
        const videos = await Content.find({ contentType: 'Video' });
        res.json(videos);
    } catch (err) {
        res.status(400).send('Error fetching videos: ' + err.message);
    }
};

// Get all podcast content
exports.getAllPodcasts = async (req, res) => {
    try {
        const podcasts = await Content.find({ contentType: 'Podcast' });
        res.json(podcasts);
    } catch (err) {
        res.status(400).send('Error fetching podcasts: ' + err.message);
    }
};

// Get all article content
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Content.find({ contentType: 'Article' });
        res.json(articles);
    } catch (err) {
        res.status(400).send('Error fetching articles: ' + err.message);
    }
};