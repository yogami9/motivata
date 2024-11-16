const Content = require('../models/Content');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// Helper function to validate file extensions
const isValidFileType = (type, extension) => {
    const videoTypes = ['mp4', 'mkv', 'webm', 'avi']; // Video formats
    const podcastTypes = ['mp3', 'wav']; // Podcast formats
    const documentTypes = ['pdf', 'docx', 'xlsx', 'pptx']; // Document formats
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif']; // Image formats for thumbnail

    switch (type) {
        case 'Video':
            return videoTypes.includes(extension);
        case 'Podcast':
            return podcastTypes.includes(extension);
        case 'Article':
            return documentTypes.includes(extension);
        case 'Thumbnail':
            return imageTypes.includes(extension);
        default:
            return false; // Invalid type
    }
};

// Create new content with file upload
exports.createContent = async (req, res) => {
    const {
        title,
        description,
        contentType,
        isPremium
    } = req.body;

    // Check if the content file and thumbnail file are uploaded
    if (!req.file) {
        return res.status(400).send('No content file uploaded.');
    }
    if (!req.files.thumbnail) {
        return res.status(400).send('No thumbnail uploaded.');
    }

    // Extract the file extension for both the content file and the thumbnail
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    const thumbnailExtension = req.files.thumbnail.originalname.split('.').pop().toLowerCase();

    // Validate the content file type
    if (!isValidFileType(contentType, fileExtension)) {
        return res.status(400).send(`Invalid file type for ${contentType}.`);
    }
    
    // Validate the thumbnail type
    if (!isValidFileType('Thumbnail', thumbnailExtension)) {
        return res.status(400).send('Invalid thumbnail file type.');
    }

    const content = new Content({
        title,
        description,
        contentType,
        thumbnail: {
            data: req.files.thumbnail[0].buffer,  // Change according to your setup if you process differently
            contentType: req.files.thumbnail[0].mimetype,
        },
        isPremium,
        file: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
        }
    });

    try {
        await content.save();
        res.status(201).json(content);
    } catch (err) {
        console.error('Error creating content:', err);
        res.status(400).send('Error creating content: ' + err.message);
    }
};

// Get all content
exports.getAllContent = async (req, res) => {
    try {
        const content = await Content.find();
        res.json(content);
    } catch (err) {
        console.error('Error fetching all content:', err);
        res.status(500).send('Error fetching content: ' + err.message);
    }
};

// Get content by ID
exports.getContentById = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).send('Content not found.');

        const isUserSubscribed = await Subscription.findOne({
            userId: req.user._id,
            expirationDate: { $gt: new Date() }
        });

        // Access control for premium content
        if (content.isPremium && !isUserSubscribed) {
            return res.status(403).send('Access to this content is restricted. Please subscribe.');
        }

        const { file, ...rest } = content.toObject();
        res.json(rest);
    } catch (err) {
        console.error('Error fetching content by ID:', err);
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
            isPremium: req.body.isPremium,
        };

        // Check if a new file or thumbnail was uploaded
        if (req.file) {
            const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
            if (!isValidFileType(updatedData.contentType, fileExtension)) {
                return res.status(400).send(`Invalid file type for ${updatedData.contentType}.`);
            }
            updatedData.file = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }
        
        if (req.files.thumbnail) {
            const thumbnailExtension = req.files.thumbnail[0].originalname.split('.').pop().toLowerCase();
            if (!isValidFileType('Thumbnail', thumbnailExtension)) {
                return res.status(400).send('Invalid thumbnail file type.');
            }
            updatedData.thumbnail = {
                data: req.files.thumbnail[0].buffer,
                contentType: req.files.thumbnail[0].mimetype,
            };
        }

        const content = await Content.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!content) return res.status(404).send('Content not found.');
        res.json(content);
    } catch (err) {
        console.error('Error updating content:', err);
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
        console.error('Error deleting content:', err);
        res.status(400).send('Error deleting content: ' + err.message);
    }
};

// Get all video content
exports.getAllVideos = async (req, res) => {
    try {
        const videos = await Content.find({ contentType: 'Video' });
        res.json(videos);
    } catch (err) {
        console.error('Error fetching videos:', err);
        res.status(400).send('Error fetching videos: ' + err.message);
    }
};

// Get all podcast content
exports.getAllPodcasts = async (req, res) => {
    try {
        const podcasts = await Content.find({ contentType: 'Podcast' });
        res.json(podcasts);
    } catch (err) {
        console.error('Error fetching podcasts:', err);
        res.status(400).send('Error fetching podcasts: ' + err.message);
    }
};

// Get all article content
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Content.find({ contentType: 'Article' });
        res.json(articles);
    } catch (err) {
        console.error('Error fetching articles:', err);
        res.status(400).send('Error fetching articles: ' + err.message);
    }
};