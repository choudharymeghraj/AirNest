const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("MongoDB connection already established");
        return;
    }

    let dbUrl = process.env.ATLASDB_URL;
    const localUrl = "mongodb://127.0.0.1:27017/airnest";

    if (dbUrl && dbUrl.includes("xxxxx")) {
        console.warn("⚠️  Invalid ATLASDB_URL detected (contains 'xxxxx'). Falling back to local DB.");
        dbUrl = localUrl;
    }

    try {
        await mongoose.connect(dbUrl || localUrl, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("Mongo error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
