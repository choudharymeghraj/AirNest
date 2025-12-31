const Listing = require("../models/listing");


module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    let alllistings;
    if (category) {
        alllistings = await Listing.find({ category: category });
    } else if (search) {
        const regex = new RegExp(search, 'i'); // Case-insensitive regex
        alllistings = await Listing.find({
            $or: [
                { title: regex },
                { description: regex },
                { location: regex },
                { country: regex }
            ]
        });
    } else {
        alllistings = await Listing.find({});
    }
    res.render("listings/index", { alllistings, category, search });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params; const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
    if (!req.body.listing || !req.body.listing.category) {
        req.flash("error", "Please choose a category before creating the listing.");
        return res.redirect("/listings/new");
    }
    const newListing = new Listing(req.body.listing);
    if (req.file) {
        newListing.image = {
            url: req.file.secure_url,
            filename: req.file.public_id,
        };
    }
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing Created Successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (req.file) {
        const listing = await Listing.findById(id);
        listing.image = {
            url: req.file.secure_url,
            filename: req.file.public_id,
        };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
};