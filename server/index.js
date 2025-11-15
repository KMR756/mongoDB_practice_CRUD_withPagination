// TODO: Load environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

// TODO: Create express app
const app = express();

// TODO: Set port from env or default
const PORT = process.env.PORT || 3000;

// -------------------
// TODO: Middleware
// -------------------
app.use(express.json()); // parse JSON body
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL // allow requests from frontend
}));

// -------------------
// TODO: MongoDB Setup
// -------------------
const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // TODO: Connect to MongoDB
        await client.connect();

        // TODO: Select database and collection
        const db = client.db("books-management-system");
        const booksCollection = db.collection("books");

        // -------------------
        // TODO: POST /books -> Create a book
        // -------------------
        app.post("/books", async (req, res) => {
            try {
                const bookData = req.body;

                // TODO: Add validation here (title, author, publishedYear, price)
                // Example: if(!bookData.title) return res.status(400)...

                const result = await booksCollection.insertOne(bookData);

                res.status(201).json({
                    success: true,
                    message: "Book created successfully",
                    book: { _id: result.insertedId, ...bookData }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Book creation failed",
                    error: error.message
                });
            }
        });

        // -------------------
        // TODO: GET /books -> Fetch books with filters, pagination, sorting
        // -------------------
        app.get("/books", async (req, res) => {
            try {
                // TODO: Extract query parameters
                const {
                    page,
                    limit,
                    search,
                    genre,
                    author,
                    minYear,
                    maxYear,
                    minPrice,
                    maxPrice,
                    sortBy,
                    order
                } = req.query;

                // -------------------
                // TODO: Pagination
                // -------------------
                const currentPage = Math.max(1, parseInt(page, 10) || 1); // current page number
                const perPage = Math.min(parseInt(limit, 10) || 8, 100); // items per page, max 100
                const skip = (currentPage - 1) * perPage;

                // -------------------
                // TODO: Build filter object
                // -------------------
                const filter = {};

                // a) Search filter (title or description, case-insensitive)
                if (search) {
                    filter.$or = [
                        { title: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } }
                    ];
                }

                // b) Genre filter (case-insensitive)
                if (genre) {
                    filter.genre = { $regex: genre, $options: "i" };
                }

                // c) Author filter (case-insensitive)
                if (author) {
                    filter.author = { $regex: author, $options: "i" };
                }

                // d) Published year range filter
                if (minYear || maxYear) {
                    filter.publishedYear = {
                        ...(minYear && { $gte: parseInt(minYear, 10) }),
                        ...(maxYear && { $lte: parseInt(maxYear, 10) })
                    };
                }

                // e) Price range filter
                if (minPrice || maxPrice) {
                    filter.price = {
                        ...(minPrice && { $gte: parseFloat(minPrice) }),
                        ...(maxPrice && { $lte: parseFloat(maxPrice) })
                    };
                }

                // -------------------
                // TODO: Sorting
                // -------------------
                const sortOption = { [sortBy || "title"]: order === "desc" ? -1 : 1 };

                // -------------------
                // TODO: Fetch books and total count in parallel
                // -------------------
                const [books, totalBooks] = await Promise.all([
                    booksCollection.find(filter)
                        .sort(sortOption)
                        .skip(skip)
                        .limit(perPage)
                        .toArray(),
                    booksCollection.countDocuments(filter)
                ]);

                const totalPages = Math.ceil(totalBooks / perPage);

                // -------------------
                // TODO: Send response
                // -------------------
                res.status(200).json({
                    success: true,
                    books,
                    totalBooks,
                    currentPage,
                    perPage,
                    totalPages
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch books",
                    error: error.message
                });
            }
        });




        app.get("/books/:id", async (req, res) => {
            try {
                const bookId = req.params.id;

                // TODO: Validate id
                // if (!ObjectId.isValid(id)) {
                //     return res.status(400).json({
                //         success: false,
                //         message: "Invalid book ID"
                //     });
                // }

                // if (!ObjectId.isValid(bookId)) { // <--- Use this validation
                //     return res.status(400).json({
                //         success: false,
                //         message: "Invalid book ID format"
                //     });
                // }
                // Fetch book
                const result = await booksCollection.findOne({ _id: new ObjectId(bookId) })
                // console.log(result);

                // If book not found
                // if (!result) {
                //     return res.status(404).json({
                //         success: false,
                //         message: "Book not found"
                //     });
                // }

                // Send response to client
                res.status(200).json({
                    success: true,
                    book: result
                });

            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch book",
                    error: error.message
                });
            }
        });
        // update book by id
        app.put("/books/:bookId", async (req, res) => {

            const updateBook = await booksCollection.updateOne({ _id: new ObjectId(req.params.bookId) }, { $set: req.body })

            res.json(updateBook)
        })

        // delete book
        app.delete("/books/:bookId", async (req, res) => {
            const result = await booksCollection.deleteOne({ _id: new ObjectId(req.params.bookId) })
            res.json(result)
        })
        // -------------------
        // TODO: Test connection to MongoDB
        // -------------------
        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB successfully!");

    } finally {
        // TODO: Keep MongoClient open for server, close on exit
        // await client.close();
    }
}
run().catch(console.dir);

// -------------------
// TODO: Test root endpoint
// -------------------
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// -------------------
// TODO: Start server
// -------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
