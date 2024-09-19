const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const compression = require('compression');
app.use(compression());
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
  }));
connectDB();

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



app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use('/api/posts', jwtVerify, postRoutes);
app.get('/health', (req, res) => {
    res.send({ "msg": "API working fine" })
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
