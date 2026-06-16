const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/booking");

// Show booking confirmation page
router.get(
  "/listings/:id/book",
  isLoggedIn,
  wrapAsync(bookingController.showBookingPage)
);

// Create payment order
router.post(
  "/listings/:id/create-order",
  isLoggedIn,
  wrapAsync(bookingController.createOrder)
);

// Verify payment
router.post(
  "/bookings/verify-payment",
  isLoggedIn,
  wrapAsync(bookingController.verifyPayment)
);

// Booking success page  ✅ FIXED
router.get(
  "/bookings/:id/success",
  isLoggedIn,
  wrapAsync(bookingController.bookingSuccess)
);

// My bookings
router.get(
  "/bookings",
  isLoggedIn,
  wrapAsync(bookingController.myBookings)
);

// Cancel booking
router.post(
  "/bookings/:id/cancel",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

// Delete booking
router.delete(
  "/bookings/:id",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
