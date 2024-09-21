// routes/postRoutes.js
const express = require('express');
const Post = require('../models/Post');

const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Create Post
router.post('/createPost',upload.single('image'), async (req, res) => {
  try {
    const { username, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    const post = new Post({ username, image:req.file.buffer, contentType: req.file.mimetype , description });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: 'Error creating post', error: error?.message });
  }
});

// Get All Posts
router.get('/getAllPost', async (req, res) => {
  const { page = 1, limit = 3 } = req.query; // Default to page 1 and limit of 3 posts
  try {
    const posts = await Post.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)  // Skip posts based on page
      .limit(Number(limit))     // Limit the number of posts returned
      .populate('user');

    const hasMorePosts = posts.length === Number(limit);

    const postsWithImages = posts.map(post => ({
      username: post.username,
      description: post.description,
      comments: post.comments,
      timestamp: post.timestamp,
      pid: post.pid,
      image: `data:${post.contentType};base64,${post.image.toString('base64')}`
    }));

    res.json({ posts: postsWithImages, hasMorePosts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});



router.post('/getAllPostByUserName', async (req, res) => {
  try {
    const { username } = req.body
    const posts = await Post.find({ username }).sort({ timestamp: -1 }).populate('user');
    const postsWithImages = posts.map(post => ({
      username: post.username,
      description: post.description,
      comments: post.comments,
      timestamp: post.timestamp,
      pid:post.pid,
      image: `data:${post.contentType};base64,${post.image.toString('base64')}`
    }));
    res.json(postsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});

router.post('/getPostByDescription', async (req, res) => {
  try {
    const { description } = req.body; // Get description from the request body
    // Use $regex to find posts with descriptions that include the input description (case-insensitive)
    const posts = await Post.find({ 
      description: { $regex: description, $options: 'i' } // 'i' for case-insensitive search
    }).sort({ timestamp: -1 });

    // Map over posts to include the image as a base64 string
    const postsWithImages = posts.map(post => ({
      username: post.username,
      description: post.description,
      comments: post.comments,
      timestamp: post.timestamp,
      pid:post.pid,
      image: `data:${post.contentType};base64,${post.image.toString('base64')}`
    }));

    res.json(postsWithImages); // Return the posts as JSON with images in base64 format
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});

// Get Post by ID
router.post('/getPostById', async (req, res) => {
  try {
    const { pid, username } = req.body
    const post = await Post.find({ pid, username })
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error });
  }
});

// Update Post
router.put('/updatePost', async (req, res) => {
  try {
    const { pid, username, description, comments } = req.body;

    // Find the post by pid and username
    const post = await Post.findOne({ pid, username });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Update description if provided
    if (description) post.description = description;
    if (comments && Array.isArray(comments)) {
      // Append new comments to existing ones
      post.comments = [...post.comments, ...comments];
    }
    // Add new comments if provided

    // Save the updated post
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

router.put('/updatePostDescription', async (req, res) => {
  try {
    const { pid, username, description } = req.body;

    // Find the post by pid and username
    const post = await Post.findOne({ pid, username });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Update description if provided
    if (description) post.description = description;
 
 
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});


router.put('/addComment', async (req, res) => {
  try {
    const { pid, username,comments } = req.body;

    // Find the post by pid and username
    const post = await Post.findOne({ pid, username });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Update description if provided
    if (comments && Array.isArray(comments)) {
      // Append new comments to existing ones
      post.comments = [...post.comments, ...comments];
    }
    // Add new comments if provided

    // Save the updated post
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete Post
router.delete('/deletePost/:pid/:username', async (req, res) => {
  try {
    const { pid, username } = req.params;

    // Delete the post by pid and username
    const result = await Post.deleteOne({ pid, username });

    // Check if any document was deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});


module.exports = router;
