const express = require("express");
const router = express.Router({ mergeParams: true });
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js"); // Make sure you have this middleware

// POST Route: Process the booking form
router.post("/listings/:id/book", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        // 1. Extract data from the form
        const { checkIn, checkOut, guests } = req.body.booking;

        // 2. Convert strings to Date objects
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        // 3. Validation: Check-out must be after Check-in
        if (end <= start) {
            req.flash("error", "Check-out date must be after check-in date!");
            return res.redirect(`/listings/${id}`);
        }

        // 4. Calculate Total Price
        // timeDiff is in milliseconds, so we convert to days
        const timeDiff = end.getTime() - start.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Base Price * Nights + Service Fee (2500 is dummy service fee)
        const totalPrice = (listing.price * nights) + 2500;

        // 5. Create and Save the Booking
        const newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: start,
            checkOut: end,
            guests: guests,
            totalPrice: totalPrice,
            status: "confirmed"
        });

        await newBooking.save();

        // 6. Redirect to success page
        req.flash("success", `Booking confirmed! Total: ₹${totalPrice}`);
        res.redirect("/user/bookings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Could not process booking");
        res.redirect(`/listings/${req.params.id}`);
    }
});
// DELETE Route: Cancel Booking
router.delete("/bookings/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        await Booking.findByIdAndDelete(id);
        req.flash("success", "Booking cancelled successfully!");
        res.redirect("/user/bookings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Could not cancel booking");
        res.redirect("/user/bookings");
    }
});

// GET Route: Render Edit Form
router.get("/bookings/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate("listing");
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/user/bookings");
        }
        res.render("bookings/edit.ejs", { booking });
    } catch (err) {
        console.error(err);
        req.flash("error", "Could not load edit form");
        res.redirect("/user/bookings");
    }
});

// PUT Route: Update Booking
router.put("/bookings/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, guests } = req.body.booking;

        const booking = await Booking.findById(id).populate("listing");
        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/user/bookings");
        }

        // Recalculate price
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (end <= start) {
            req.flash("error", "Check-out date must be after check-in date!");
            return res.redirect(`/bookings/${id}/edit`);
        }

        const timeDiff = end.getTime() - start.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const totalPrice = (booking.listing.price * nights) + 2500;

        // Update fields
        booking.checkIn = start;
        booking.checkOut = end;
        booking.guests = guests;
        booking.totalPrice = totalPrice;

        await booking.save();

        req.flash("success", `Booking updated! New Total: ₹${totalPrice}`);
        res.redirect("/user/bookings");

    } catch (err) {
        console.error(err);
        req.flash("error", "Could not update booking");
        res.redirect(`/bookings/${req.params.id}/edit`);
    }
});

module.exports = router;