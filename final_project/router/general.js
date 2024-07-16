const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');

const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  
  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }

  if(isValid(username)){
    return res.status(400).json({message: "Username already exists"});
  }
  users.push({username, password});

  return res.status(200).json({message: "Customer successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json({
    "books": books
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book) : res.status(404).json({message: "No book found with the provided ISBN"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const booksByAuthor = Object.entries(books).filter(([, value]) => value.author === req.params.author)
  .map(([key, value]) =>{
    return {isbn: key, title: value.title, reviews: value.reviews};
  });
  return booksByAuthor.length !== 0 ? res.status(200).json({booksByAuthor}) : res.status(404).json({message: `No books found by the author ${req.params.author}`});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const booksByTitle = Object.entries(books).filter(([, value]) => value.title === req.params.title)
    .map(([key, value]) =>{
      return {isbn: key, title: value.title, reviews: value.reviews};
    });
  return booksByTitle.length !== 0 ? res.status(200).json({booksByTitle}) : res.status(404).json({message: `No books found with the title ${req.params.title}`});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const review = books[req.params.isbn]?.reviews;
  return review ? res.status(200).json(review) : res.status(404).json({message: `No reviews found for the book with the ISBN ${req.params.isbn}`});
});


const baseURL = "http://localhost:5000";

// Get the book list available in the shop using Promise callbacks
public_users.get('/books', function (req, res) {
  axios.get(`${baseURL}/`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      return res.status(500).json({ message: "Error retrieving book list" });
    });
});



// Get book details based on ISBN using async-await with Axios
public_users.get('/books/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`${baseURL}/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.log("we are here");
    const response = error.response;
    return response.status === 404 ? res.status(response.status).json(response.data) : res.status(500).json({ message: "Error retrieving book details" });
  }
});


// Get book details based on author using Promise callbacks
public_users.get('/books/author/:author', function (req, res) {
  const author = req.params.author;
  axios.get(`${baseURL}/author/${author}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      const response = error.response;
      return response.status === 404 ? res.status(response.status).json(response.data) : res.status(500).json({ message: "Error retrieving book details" });
    });
});


// Get book details based on title using async-await with Axios
public_users.get('/books/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(`${baseURL}/title/${title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const response = error.response;
    return response.status === 404 ? res.status(response.status).json(response.data) : res.status(500).json({ message: "Error retrieving book details" });
  }
});


module.exports.general = public_users;
