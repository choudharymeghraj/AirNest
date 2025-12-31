const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

// INDEX + CATEGORY FILTER
router.get("/", wrapAsync(listingController.index));

// CREATE NEW LISTING - GET FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);

// CREATE NEW LISTING - POST
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

// SHOW LISTING
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT LISTING - GET FORM
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// EDIT LISTING - PUT
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

// DELETE LISTING
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
