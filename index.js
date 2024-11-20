const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');  // Import the cors package

// Load environment variables from the .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Enable CORS for specific frontend origin (security: allow only specific domains)
const allowedOrigins = ['https://instint.in']; // Frontend domain(s)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allow requests from allowed origins
      callback(null, true);
    } else {
      // Reject requests from disallowed origins
      callback(new Error('CORS not allowed'), false);
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Set up middleware to parse incoming JSON data (use express built-in middleware)
app.use(express.json());  // For parsing application/json

// MongoDB connection setup
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);  // Exit the process if the database connection fails
  });

// Import the User model (adjust path as needed)
const User = require('./models/user');

// Registration route
app.post('/register', (req, res) => {
  const { firstName, middleName, lastName, mobile, gmail, address, workArea, area, shopName } = req.body;

  // Validate input
  if (!firstName || !lastName || !mobile || !gmail || !address || !workArea || !shopName) {
    return res.status(400).send('<h2>Error!</h2><p>All fields are required.</p>');
  }

  // Create a new user object
  const newUser = new User({
    firstName,
    middleName,
    lastName,
    mobile,
    gmail,
    address,
    workArea,
    area: area || [],  // Default to empty array if area is not provided
    shopName,
  });

  // Save the user to the MongoDB database
  newUser.save()
    .then(() => {
      res.send('<h2>Registration Successful!</h2><p>Your registration has been completed successfully.</p><a href="/">Go to Home</a>');
    })
    .catch((error) => {
      console.error('Error saving user:', error);
      res.status(500).send('<h2>Error!</h2><p>Something went wrong. Please try again later.</p>');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
