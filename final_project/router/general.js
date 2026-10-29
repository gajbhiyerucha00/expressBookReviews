
const express = require("express");
const axios = require("axios");

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const OPEN_LIBRARY_API = "https://openlibrary.org/search.json";

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Unable to register user."
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: "User already exists!"
        });
    }

    users.push({ username, password });

    return res.status(200).json({
        message: "User successfully registered. Now you can login"
    });
});

// Get all books from the local database
public_users.get("/", (req, res) => {
    return res.status(200).json(books);
});

// Get book details by ISBN from the local database
public_users.get("/isbn/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

// Get book details by author from the local database
public_users.get("/author/:author", (req, res) => {
    const author = req.params.author;

    const matchingBooks = Object.values(books).filter(
        book => book.author.toLowerCase() === author.toLowerCase()
    );

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    }

    return res.status(404).json({
        message: "Author not found"
    });
});

// Get book details by title from the local database
public_users.get("/title/:title", (req, res) => {
    const title = req.params.title;

    const matchingBooks = Object.values(books).filter(
        book => book.title.toLowerCase() === title.toLowerCase()
    );

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

// Get reviews for a book
public_users.get("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

// Axios: search Open Library by ISBN
public_users.get("/api/isbn/:isbn", async (req, res) => {
    try {
        const response = await axios.get(OPEN_LIBRARY_API, {
            params: {
                isbn: req.params.isbn
            }
        });

        return res.status(200).json(response.data.docs);
    } catch (error) {
        return res.status(502).json({
            message: "Unable to retrieve books by ISBN",
            error: error.message
        });
    }
});

// Axios: search Open Library by author
public_users.get("/api/author/:author", async (req, res) => {
    try {
        const response = await axios.get(OPEN_LIBRARY_API, {
            params: {
                author: req.params.author
            }
        });

        return res.status(200).json(response.data.docs);
    } catch (error) {
        return res.status(502).json({
            message: "Unable to retrieve books by author",
            error: error.message
        });
    }
});

// Axios: search Open Library by title
public_users.get("/api/title/:title", async (req, res) => {
    try {
        const response = await axios.get(OPEN_LIBRARY_API, {
            params: {
                title: req.params.title
            }
        });

        return res.status(200).json(response.data.docs);
    } catch (error) {
        return res.status(502).json({
            message: "Unable to retrieve books by title",
            error: error.message
        });
    }
});

module.exports.general = public_users;
