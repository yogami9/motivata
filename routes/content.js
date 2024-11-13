const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
    createContent,
    getAllContent,
    getContentById,
    updateContent,
    deleteContent,
    getAllVideos,
    getAllPodcasts,
    getAllArticles,
} = require('../controllers/contentController');
const auth = require('../middleware/auth');

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // Limit to 5 MB

// Create a new content item with file upload
router.post('/', auth, upload.single('file'), createContent);

// Retrieve all content items
router.get('/', getAllContent);

// Retrieve content by id
router.get('/:id', getContentById);

// Update content by id
router.put('/:id', auth, upload.single('file'), updateContent);

// Delete content by id
router.delete('/:id', auth, deleteContent);

// Retrieve all videos
router.get('/videos', getAllVideos);

// Retrieve all podcasts
router.get('/podcasts', getAllPodcasts);

// Retrieve all articles
router.get('/articles', getAllArticles);

module.exports = router;