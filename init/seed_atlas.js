if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
    console.error("ERROR: ATLASDB_URL is not defined in .env file.");
    process.exit(1);
}

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to Atlas DB");
}

const initDB = async () => {
    try {
        await main();

        // Optional: clear existing data? Usually 'yes' for a seed script but dangerous in prod.
        // For now, let's assume user wants to RESET the DB with seed data.
        await Listing.deleteMany({});
        console.log("Cleared existing listings");

        const user = await User.findOne({});
        if (!user) {
            console.log("No user found in Atlas DB. Please create a user first manually or via the app.");
            // We can't proceed without an owner, or we could create a dummy one.
            // For safety, let's just warn.
            // Or better, let's NOT create listings if no user, or assign to a default if we could.
            // But the original script fetched a ONE user.
            // If the DB is empty (Atlas), User.findOne({}) will be null.
            // We should probably create a user if none exists for the seed to work?
            // Let's create a demo user if none exists.
        }

        let ownerId;
        if (user) {
            ownerId = user._id;
        } else {
            // Create a dummy owner for the listings
            const newUser = new User({
                email: "demo@example.com",
                username: "demouser"
            });
            const registeredUser = await User.register(newUser, "password123");
            ownerId = registeredUser._id;
            console.log("Created demo user for listings ownership");
        }

        const categories = [
            "Farms",
            "Rooms",
            "Amazing views",
            "Iconic cities",
            "Surfing",
            "Amazing pools",
            "Beach",
            "Cabins",
            "OMG!",
            "Lakefront",
        ];

        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: ownerId,
            category: categories[Math.floor(Math.random() * categories.length)],
            reviews: [],
        }));

        await Listing.insertMany(initData.data);
        console.log("Data initialized to Atlas DB");

        mongoose.connection.close();
    } catch (err) {
        console.log("Init failed:", err);
        process.exit(1);
    }
};

initDB();
