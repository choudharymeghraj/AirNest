try {
    const MongoStore = require("connect-mongo");
    console.log("MongoStore loaded successfully");
} catch (err) {
    console.error("Failed to load MongoStore:", err);
}
