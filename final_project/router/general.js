const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);
  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "No books found by this author" });
  }
  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
  if (booksByTitle.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }
  return res.status(200).json(booksByTitle);
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
