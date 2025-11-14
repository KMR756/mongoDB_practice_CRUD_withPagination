import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
import { MongoClient, ServerApiVersion } from "mongodb"
import express from "express"
const app = express()

const PORT = process.env.PORT || 3000

// middleware
app.use(express.json())
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
}))


const uri = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // create d and collection
        const db = client.db("books-management-system")
        const booksCollection = db.collection("books")


        // create book (post)
        app.post("/books", async (req, res) => {
            const bookData = req.body
            // console.log(bookData);
            try {
                const book = await booksCollection.insertOne(bookData)
                res.status(201).json({
                    success: true,
                    message: "book created suceesfully.",
                    book
                })
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "book creation unsuccessfull.",
                    error: error.message
                })
            }

        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);















app.get("/", (req, res) => {
    res.send("server is cooking...")
})

app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);

})