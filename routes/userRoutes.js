// routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const jwtVerify = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization');

  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded; // Attach the decoded user information to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Register User
router.post('/register', upload.single('image'), async (req, res) => {
  try {
    const { email, password, name, gender, age, username } = req.body;

    // Check if image file is provided
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Check if email or username already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      gender,
      age,
      username,
      profileImage: req.file.buffer, // Storing image as buffer in DB
      contentType: req.file.mimetype, // MIME type for image
    });

    // Save the user to the database
    await user.save();

    // Respond with success
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id,username }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Error logging in', error });
  }
});

// Get All Users
router.get('/getALluser',jwtVerify, async (req, res) => {
  try {
    const users = await User.find();
    const requestingUser=req?.user?.username
    const usersWithImages = users.map(user => {
       {
        return {
          username: user.username,
          name: user.name,
          profileImage: `data:${user.contentType};base64,${user.profileImage.toString('base64')}`
        };
      }
      // If the user is the requesting user, return null
      return null;
    }).filter(user => user !== null); 
    res.status(200).json(usersWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Search Users by Username
router.get('/search', jwtVerify, async (req, res) => {
  try {
    const { username } = req.query;
    const regex = new RegExp(username, 'i'); // 'i' makes the search case-insensitive
    const users = await User.find({ username: regex });
    const requestingUser=req?.user?.username
    const usersWithImages = users.map(user => {
      if (user.username !== requestingUser) {
        return {
          username: user.username,
          name: user.name,
          profileImage: `data:${user.contentType};base64,${user.profileImage.toString('base64')}`
        };
      }
      // If the user is the requesting user, return null
      return null;
    }).filter(user => user !== null); 
    res.status(200).json(usersWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error });
  }
});

// Get User by ID
router.get('/getByUsername/:id', jwtVerify, async (req, res) => {
  try {
    const user = await User.find({ username: req.params.id });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// Update User
router.put('/updateUser/:id',upload.single('image'), jwtVerify, async (req, res) => {
  try {
    const { name, gender } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    // Find the user by username (req.params.id) and update the fields
    const user = await User.findOneAndUpdate(
      { username: req.params.id }, // Search by username
      { name, gender, profileImage: req.file.buffer, contentType: req.file.mimetype }, // Fields to update
      { new: true } // Return the updated document
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});


// Delete User
router.delete('/delete/:id', jwtVerify, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

module.exports = router;
