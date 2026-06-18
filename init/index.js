const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

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

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    let user = await User.findOne({});
    if (!user) {
      console.log("No user found. Creating a new user...");
      const newUser = new User({ email: "admin@airnest.com", username: "admin" });
      user = await User.register(newUser, "admin123");
      console.log("New user created:", user.username);
    }
    const categories = [
      "Farms",
      "Rooms",
      "Amazing views",
      "Iconic cities",
      "Surfing",
      "Amazing pools",
      "Beach",
      "Cabins",
      "OMG!",
      "Lakefront",
    ];

    const sampleAmenities = [
      ["Wifi", "Air conditioning", "Kitchen", "Parking", "TV", "Pool"],
      ["Wifi", "Kitchen", "Heating", "Workspace", "Pet friendly"],
      ["Wifi", "Air conditioning", "Kitchen", "Beach access", "Hot tub"],
      ["Wifi", "Heating", "Fireplace", "Mountain view", "Patio"],
      ["Wifi", "Air conditioning", "Gym", "Elevator", "Security system"]
    ];

    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: user._id,
      category: categories[Math.floor(Math.random() * categories.length)],
      reviews: [],
      maxGuests: Math.floor(Math.random() * 5) + 2, // 2 to 6 guests
      amenities: sampleAmenities[Math.floor(Math.random() * sampleAmenities.length)],
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 to 5.0
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