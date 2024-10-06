const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn; // Get book ID from the URL
  const review = req.query.review; // Get review from the request body
  const username = req.session.authorization.username; // Get username from the session
 

  // Check if the user is logged in
  if (!username) {
    return res.status(400).send("Username is required");
  }
  // Set the username in the session
  // res.send(`User ${username} logged in`);
  // Validate the review
  if (!review) {
    return res.status(400).send("Review is required");
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).send("Book not found");
  }

  // Add or modify the review
  books[isbn].reviews[username] = review;
  // res.send(`Review for "${books[id].title}" by ${username} has been added/modified.`);
  res.send(`Review for a book with ISBN ${isbn} has been added/modified.`);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get ISBN from URL parameters
  const username = req.session.authorization.username; // Get logged-in username from session

    // Check if the user is logged in
    if (!username) {
        return res.status(401).send("User not logged in");
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).send("Book not found");
    }

    // Check if the user has a review for this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).send("No review found for this user");
    }

    // Delete the review
    delete books[isbn].reviews[username];

    res.send(`Reviews for the ISBN ${isbn} posted by user ${username} has been deleted.`);


});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
