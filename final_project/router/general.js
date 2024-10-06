const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};
public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});



// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  
// Create a Promise to fetch the books
const getBooks = new Promise((resolve, reject) => {
  // Simulating async operation, though not needed for static objects
  resolve(books); // Resolve with the books object
});

// Handle the resolved promise and send the result
getBooks
  .then((bookList) => {
    res.send(JSON.stringify(bookList, null, 4)); // Send the books as a response
  })
  .catch((error) => {
    // Handle any potential errors (though unlikely with this setup)
    res.status(500).send("Error fetching books");
  });

  // res.send(JSON.stringify(books, null, 4));   regular get :)
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Get ISBN from URL params

  // Create a Promise to fetch the book by ISBN
  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];

    if (book) {
      resolve(book); // Resolve with the book if found
    } else {
      reject("Book not found"); // Reject if no book found for the given ISBN
    }
  });
  // Handle the resolved promise
  getBookByISBN
    .then((book) => {
      res.send(JSON.stringify(book, null, 4)); // Send the book as a JSON response
    })
    .catch((error) => {
      res.status(404).send(error); // Send a 404 if book not found
    });

  // res.send(books[isbn]);
});

// Get book details based on author   NOT CALLBACK
// public_users.get("/author/:author", function (req, res) {
//   //Write your code here
//   const author = req.params.author;

//   let ids = Object.keys(books); // Get all IDs

//   let booksByAuthor = []; // Initialize the array for the response

//     // Loop through each ID to build the response
//     for (let id of ids) {
//       let book = books[id]; // Get the book using the current ID
     
//       if (books[id].author === author) {
//       booksByAuthor.push({
//           "isbn": id, 
//           "title": book.title,
//           "reviews": book.reviews
//       });
//   }}

  
//   res.send({ 'booksbyauthor': booksByAuthor });
// });
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author; 
    const getBooksByAuthor = () => {
    return new Promise((resolve, reject) => {
      let ids = Object.keys(books); // Get all book IDs
      let booksByAuthor = []; // Initialize the array for the response
      
      for (let id of ids) {
        let book = books[id];
        if (book.author === author) {
          booksByAuthor.push({
            "isbn": id,
            "title": book.title,
            "reviews": book.reviews,
          }); } } 
          if (booksByAuthor.length > 0) {
        resolve(booksByAuthor); // Resolve with the list of books
      } else {reject("No books found by this author");  }
    }); };
  try {  const booksByAuthor = await getBooksByAuthor();  
    res.send({ 'booksbyauthor': booksByAuthor });
  } catch (error) {
    // Handle any errors (like no books found)
    res.status(404).send(error);
  }
});



  // Loop through each ID to build the response----------------------------------------------------------------
 
    // let foundAuthor = Object.values(books).find((book) => (book.author = author));
    // let foundKey = Object.keys(books).find((book) => (book.author === author));
    // console.log(foundKey);
    // let formattedAuthor = { booksbyauthor: [foundAuthor] };
    //   booksByAuthor.push({
    //   isbn: foundKey,
    //   title: foundAuthor.title,
    //   reviews: foundAuthor.reviews,
    // });

    // // Send the response
    // res.send({ booksbyauthor: booksByAuthor });

  
//----------------------------------------------------------------

    // let foundAuthor = Object.values(books).find(book => book.author = author);
    // let formattedAuthor = { "booksbyauthor": [foundAuthor] };
    // res.send(formattedAuthor);
  
// });

// Get all books based on title     NO CALLBACK
// public_users.get("/title/:title", function (req, res) {
//   //Write your code here
//   const title = req.params.title;

//   let ids = Object.keys(books); // Get all IDs

//   let booksByTitle = []; // Initialize the array for the response

//     // Loop through each ID to build the response
//     for (let id of ids) {
//       let book = books[id]; // Get the book using the current ID
     
//       if (books[id].title === title) {
//       booksByTitle.push({
//           "isbn": id, 
//           "author": book.author,
//           "reviews": book.reviews
//       });
//   }}
//   res.send({ 'booksbytitle': booksByTitle });
// });

public_users.get("/title/:title", function (req, res) {
  const title = req.params.title; // Get title from URL params
  const getBooksByTitle = new Promise((resolve, reject) => {
    let ids = Object.keys(books); // Get all book IDs
    let booksByTitle = []; // Initialize the array for the response
    for (let id of ids) {
      let book = books[id];
      if (book.title === title) {
        booksByTitle.push({
          "isbn": id,
          "author": book.author,
          "reviews": book.reviews,
        });     }    }
    if (booksByTitle.length > 0) {
      resolve(booksByTitle); // Resolve with the list of books by title
    } else {       reject("No books found with this title"); // Reject if no books are found
    }  });
  getBooksByTitle
    .then((booksByTitle) => {
      res.send({ 'booksbytitle': booksByTitle }); // Send the filtered books as a JSON response
    })
    .catch((error) => {
      res.status(404).send(error); // Send a 404 error if no books are found
    });});




//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  let ids = Object.keys(books); // Get all IDs

  let booksByReview = []; // Initialize the array for the response

    // Loop through each ID to build the response
    for (let id of ids) {
      let book = books[id]; // Get the book using the current ID
     
      if (books[id].reviews === isbn) {
      booksByReview.push({
          "isbn": id, 
          "author": book.author,
          "title": book.title
      });
  }}

  if (booksByReview.length != 0) {
  res.send({ 'booksbyreviews': booksByReview });} else { res.send({});}
});

module.exports.general = public_users;
