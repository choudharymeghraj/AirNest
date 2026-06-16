const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    
    req.flash("success", "Review Added Successfully!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
};

// Calculate average rating for a listing
module.exports.getAverageRating = async (listingId) => {
    const listing = await Listing.findById(listingId).populate('reviews');
    
    if (!listing || listing.reviews.length === 0) {
        return 0;
    }
    
    const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / listing.reviews.length).toFixed(1);
};
