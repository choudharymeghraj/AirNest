const Listing = require("../models/listing");
const Booking = require("../models/booking");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// Show booking confirmation page (before payment)
module.exports.showBookingPage = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate("owner");
        
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }
        
        // Get query parameters (dates and guests from the form)
        const { checkIn, checkOut, nights, guests } = req.query;
        
        res.render("bookings/confirm", { 
            listing,
            bookingData: {
                checkIn: checkIn || '',
                checkOut: checkOut || '',
                nights: nights || 1,
                guests: guests || 1
            }
        });
    } catch (error) {
        console.error("Error loading booking page:", error);
        req.flash("error", "Error loading booking page!");
        res.redirect("/listings");
    }
};

// Create Razorpay order
module.exports.createOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, nights, guests } = req.body.booking;
        
        const listing = await Listing.findById(id);
        
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found!"
            });
        }
        
        // Calculate total price (NO SERVICE FEE)
        const taxRate = 0.18; // 18% GST
        const nightsPrice = listing.price * parseInt(nights);
        const tax = Math.round(nightsPrice * taxRate);
        const totalPrice = nightsPrice + tax;
        
        // Create Razorpay order
        const options = {
            amount: totalPrice * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                listingId: listing._id.toString(),
                listingTitle: listing.title,
                userId: req.user._id.toString(),
                nights: nights,
                guests: guests
            }
        };
        
        const order = await razorpay.orders.create(options);
        
        // Create booking with pending status
        const newBooking = new Booking({
            listing: listing._id,
            user: req.user._id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            nights: parseInt(nights),
            guests: parseInt(guests),
            totalPrice: totalPrice,
            orderId: order.id,
            paymentStatus: 'pending'
        });
        
        await newBooking.save();
        
        res.json({
            success: true,
            order: order,
            bookingId: newBooking._id,
            key: process.env.RAZORPAY_KEY_ID,
            amount: totalPrice,
            listing: {
                title: listing.title,
                location: listing.location
            },
            user: {
                name: req.user.username,
                email: req.user.email || `${req.user.username}@example.com`
            }
        });
        
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating payment order",
            error: error.message 
        });
    }
};

// Verify payment and confirm booking
module.exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            bookingId 
        } = req.body;
        
        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");
        
        if (razorpay_signature === expectedSign) {
            // Payment verified successfully
            const booking = await Booking.findById(bookingId);
            
            if (!booking) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Booking not found" 
                });
            }
            
            booking.paymentStatus = 'completed';
            booking.paymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;
            booking.bookingStatus = 'confirmed';
            
            await booking.save();
            
            res.json({ 
                success: true, 
                bookingId: booking._id,
                message: "Payment verified successfully" 
            });
            
        } else {
            // Invalid signature
            const booking = await Booking.findById(bookingId);
            if (booking) {
                booking.paymentStatus = 'failed';
                await booking.save();
            }
            
            res.status(400).json({ 
                success: false, 
                message: "Payment verification failed" 
            });
        }
        
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error verifying payment",
            error: error.message 
        });
    }
};

// Show booking success page
module.exports.bookingSuccess = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate("listing")
            .populate("user");
        
        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect("/listings");
        }
        
        if (booking.user._id.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized access!");
            return res.redirect("/listings");
        }
        
        res.render("bookings/success", { booking });
    } catch (error) {
        console.error("Error loading success page:", error);
        req.flash("error", "Error loading booking details!");
        res.redirect("/listings");
    }
};

// Show user's bookings
module.exports.myBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 });
        
        res.render("bookings/index", { bookings });
    } catch (error) {
        console.error("Error loading bookings:", error);
        req.flash("error", "Error loading your bookings!");
        res.redirect("/listings");
    }
};

// Cancel booking (delete instead of marking as cancelled)
module.exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect("/bookings");
        }
        
        if (booking.user.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized!");
            return res.redirect("/bookings");
        }
        
        // Delete the booking instead of marking as cancelled
        await Booking.findByIdAndDelete(id);
        
        req.flash("success", "Booking cancelled and removed successfully!");
        res.redirect("/bookings");
        
    } catch (error) {
        console.error("Error cancelling booking:", error);
        req.flash("error", "Error cancelling booking!");
        res.redirect("/bookings");
    }
};
