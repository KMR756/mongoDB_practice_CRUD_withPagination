app.get("/books", async (req, res) => {
    try {

        //-------------------------------
        // 1. Extract all query parameters
        //-------------------------------
        const {
            search,
            page,
            limit,
            minYear,
            maxYear,
            minPrice,
            maxPrice,
            genre,
            sortBy,
            order,
            author
        } = req.query;

        //---------------------------------------
        // 2. Pagination Setup (page & limit)
        //---------------------------------------

        // Make sure page never becomes less than 1
        const currentPage = Math.max(1, parseInt(page) || 1);

        // Number of items to show per page
        const perPage = parseInt(limit) || 10;

        // How many items to skip
        const skip = (currentPage - 1) * perPage;


        //------------------------
        // 3. Build Filter Object
        //------------------------
        const filter = {};

        //-------------------
        // a) SEARCH filter
        //-------------------
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        //------------------------
        // b) GENRE filter
        //------------------------
        if (genre) {
            filter.genre = genre;
        }

        //------------------------
        // c) AUTHOR filter
        //------------------------
        if (author) {
            filter.author = author;
        }

        //----------------------------
        // d) YEAR RANGE filter
        //----------------------------
        if (minYear || maxYear) {
            filter.year = {};
            if (minYear) filter.year.$gte = Number(minYear);  // >=
            if (maxYear) filter.year.$lte = Number(maxYear);  // <=
        }

        //----------------------------
        // e) PRICE RANGE filter
        //----------------------------
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice); // >=
            if (maxPrice) filter.price.$lte = Number(maxPrice); // <=
        }


        //---------------------------
        // 4. Sorting Configuration
        //---------------------------
        const sortOptions = {};

        if (sortBy) {
            // sortBy = price, year, title, createdAt, etc.
            // order = asc or desc
            sortOptions[sortBy] = order === "desc" ? -1 : 1;
        } else {
            // default sorting → newest first
            sortOptions.createdAt = -1;
        }


        //---------------------------
        // 5. Execute Mongo Query
        //---------------------------
        const items = await BookCollection
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(perPage)
            .toArray();


        //-------------------------------
        // 6. Count Total Matching Items
        //-------------------------------
        const totalItems = await BookCollection.countDocuments(filter);

        //---------------------------
        // 7. Build Response
        //---------------------------
        const totalPages = Math.ceil(totalItems / perPage);

        res.status(200).json({
            success: true,
            currentPage,
            totalPages,
            perPage,
            totalItems,
            items
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});
