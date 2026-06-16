if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js"); // <--- NEW: Imported Booking Route

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// -------------------- DATABASE --------------------
async function ensureListingIndexes() {
    try {
        const collection = mongoose.connection.db.collection("listings");
        const indexes = await collection.indexes();
        const titleIndex = indexes.find((idx) => idx.name === "title_1" && idx.unique);
        if (titleIndex) {
            await collection.dropIndex("title_1");
            console.log("Dropped legacy unique index title_1 on listings");
        }
    } catch (err) {
        console.warn("Index cleanup skipped:", err.message);
    }
}

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
    await ensureListingIndexes();
}
main().catch(err => console.log(err));

// -------------------- VIEW ENGINE --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// -------------------- MIDDLEWARE --------------------
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- SESSION --------------------
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// -------------------- PASSPORT --------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- GLOBAL VARIABLES --------------------
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    res.locals.currUser = req.user;
    next();
});

// -------------------- ROUTES --------------------
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", bookingRouter); // <--- NEW: Connected Booking Routes here

// -------------------- 404 HANDLER --------------------
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// -------------------- SERVER --------------------
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});