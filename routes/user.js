const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Booking = require("../models/booking.js"); // <--- 1. Import Booking Model
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js"); // <--- 2. Import isLoggedIn
const userController = require("../controllers/users.js");

// Signup Routes
router.get("/signup", userController.renderSignupForm);
router.post("/signup", wrapAsync(userController.signup));

// Login Routes
router.get("/login", userController.renderLoginForm);
router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.login
);

// Logout Route
router.get("/logout", userController.logout);

// ---------------------------------------------------------
// NEW ROUTE: My Bookings Dashboard
// ---------------------------------------------------------
router.get("/user/bookings", isLoggedIn, wrapAsync(async (req, res) => {
    // Find all bookings for the current user and populate listing info
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("users/bookings.ejs", { bookings });
}));

module.exports = router;