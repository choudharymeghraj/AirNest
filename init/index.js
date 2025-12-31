const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

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

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    const user = await User.findOne({});
    if (!user) {
      console.log("No user found. Please create a user first.");
      return;
    }
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: user._id,
      image: {
        filename: "listingimage",
        url: obj.image,
      },
      category: "Rooms",
      reviews: [],
      location: obj.address,
      country: "United States", // Default country
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
  } catch (err) {
    console.log("Init failed:", err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.log(`Validation error at ${key}: ${err.errors[key].message}`);
      });
    }
  }
};

initDB();