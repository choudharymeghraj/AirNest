const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

router.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn, validateListing,
    wrapAsync(listingController.createListing)
);


//New route 
router.get("/new", isLoggedIn,listingController.renderNewForm);

//show route 
router.get("/:id", wrapAsync(listingController.showListing));


// Edit Route 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync (listingController.renderEditForm));

//update route 
router.put(
  "/:id",
  isLoggedIn,isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)
);



//delete 
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



module.exports = router;