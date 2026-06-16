require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing');

mongoose.connect('mongodb://127.0.0.1:27017/airnest')
  .then(async () => {
    console.log('Connected to DB');
    const listings = await Listing.find().limit(3);

    listings.forEach(listing => {
      console.log('\n-------------------');
      console.log('Title:', listing.title);
      console.log('Location:', listing.location);
      console.log('Geometry:', listing.geometry);
      console.log('Coordinates:', listing.geometry?.coordinates);
    });

    mongoose.connection.close();
  })
  .catch(err => console.error(err));
