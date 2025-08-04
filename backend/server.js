const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000; // You can use any port, 5000 is a common choice

// Use CORS to allow requests from your frontend
app.use(cors());

// A simple middleware to parse incoming JSON requests
app.use(express.json());

// A basic "Hello World" endpoint
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// A simple API endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});