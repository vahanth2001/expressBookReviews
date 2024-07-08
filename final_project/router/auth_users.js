const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const SECRET_KEY = 'your_jwt_secret_key'; // Replace with your actual secret key

// Check if the username is valid
const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Check if the username and password match the one we have in records
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful", token });
});

// Middleware to authenticate the JWT token
regd_users.use("/auth/*", (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token.' });
    }

    // Save the decoded user information to request object for use in other routes
    req.user = decoded;
    next();
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  const book = books.find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) {
    book.reviews = [];
  }

  const username = req.user.username;
  book.reviews.push({ username, review });

  return res.status(200).json({ message: "Review added successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
