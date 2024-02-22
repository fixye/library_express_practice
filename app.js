const express = require("express");
const helmet = require("helmet");
const Joi = require("joi");
const morgan = require('morgan')

const app = express();
const date = new Date();
const books = [
    {
        id: 1,
        title: "Mastering Ubuntu Server",
        author: "John Doe",
        year: 2013,
    },
    {
        id: 2,
        title: "Legal update",
        author: "No name",
        year: 2015,
    },
    {
        id: 3,
        title: "Pejsek a Kocicka",
        author: "Jan Novak",
        year: 2000,
    },
];

app.use(helmet());
app.use(express.json());
app.use(morgan('short'))

app.get("/api/books", (req, res) => {
    res.send(books);
});

app.get("/api/books/:id", (req, res) => {
    const { id } = req.params;

    const book = books.find((book) => book.id === parseInt(id));

    if (!book) return res.status(404).send("Book not found");

    res.send(book);
});

app.post("/api/books", (req, res) => {
    const { error } = validateBook(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.body.id = calcId(books);

    const { id, title, author, year } = req.body;
    const newBook = {
        id,
        title,
        author,
        year,
    };

    books.push(newBook);
    res.send(newBook);
});

app.put("/api/books/:id", (req, res) => {
    const bookToEdit = books.find(
        (book) => book.id === parseInt(req.params.id)
    );

    if (!bookToEdit)
        return res.status(404).send("No book with such ID was found.");

    const { error } = validateBook(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const index = books.indexOf(bookToEdit);
    const { id } = bookToEdit;
    const { title, author, year } = req.body;
    const newBook = {
        id,
        title,
        author,
        year,
    };

    books[index] = newBook;

    res.send(newBook);
});

app.delete("/api/books/:id", (req, res) => {
    const id = req.params.id;
    const bookExists = books.find((book) => book.id === parseInt(id));

    if (!bookExists)
        return res
            .status(404)
            .send("Bad requests. Book with the provided ID was not found.");

    const index = books.indexOf(bookExists);

    books.splice(index, 1);

    res.send(bookExists);
});

app.listen(3000, () => {
    console.log("Listenting on port 3000");
});

function validateBook(book) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(30).required(),

        author: Joi.string().required().min(3).max(30),

        year: Joi.number()
            .less(date.getFullYear() + 1)
            .integer()
            .required(),
    });

    return schema.validate(book);
}

function calcId(books) {
    if (books.length === 0) return 1;
    const highestId = books.reduce((max, book) => Math.max(max, book.id), 0);
    return highestId + 1;
}
