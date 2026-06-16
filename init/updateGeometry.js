const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/airnest";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const updateListingsGeometry = async () => {
  try {
    const listings = await Listing.find({});

    for (let listing of listings) {
      // Check if coordinates are [0, 0] or missing
      if (!listing.geometry || !listing.geometry.coordinates ||
        (listing.geometry.coordinates[0] === 0 && listing.geometry.coordinates[1] === 0)) {
        console.log(`Updating geometry for: ${listing.title}`);

        try {
          let response = await geocodingClient.forwardGeocode({
            query: listing.location || listing.country || 'New York',
            limit: 1
          }).send();

          if (response.body.features.length > 0) {
            listing.geometry = response.body.features[0].geometry;
            await listing.save();
            console.log(`✓ Updated: ${listing.title} - Coords: ${listing.geometry.coordinates}`);
          }
        } catch (error) {
          console.log(`✗ Error updating ${listing.title}:`, error.message);
          // Set default coordinates (New York) if geocoding fails
          listing.geometry = {
            type: 'Point',
            coordinates: [-74.006, 40.7128]
          };
          await listing.save();
          console.log(`✓ Set default coordinates for: ${listing.title}`);
        }
      } else {
        console.log(`Skipping ${listing.title} - Already has coordinates: ${listing.geometry.coordinates}`);
      }
    }

    console.log("\n✓ All listings updated!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error updating listings:", error);
    mongoose.connection.close();
  }
};

updateListingsGeometry();
