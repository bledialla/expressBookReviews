const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.find(user => user.username === username) ? true : false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const user = req.session.authorization.username;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "No book found with the provided ISBN" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[user] = review;

  res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.session.authorization.username;

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "No book found with the provided ISBN" });
  }

  if (!book.reviews) {
    return res.status(404).json({ message: "No reviews found for the book with the provided ISBN" });
  }

  if (!book.reviews[user]) {
    return res.status(404).json({ message: "No reviews found for the book by the user" });
  }

  delete book.reviews[user];

  res.send(`Reviews for the ISBN ${isbn} by the user ${user} deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
