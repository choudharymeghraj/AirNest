const Listing = require("../models/listing");

module.exports.createListing = async (req, res) => {
    const listing = new Listing(req.body.listing);

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    listing.owner = req.user._id;
    await listing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings/${listing._id}`);

    console.log(req.file);

};
