const mongoose = require('mongoose');
const Listing = require('../models/listing');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to DB');
  const query = process.argv[2] || 'abcd|hcc';
  console.log(`Searching for listings with title matching (regex): /${query}/i`);
  const regex = new RegExp(query, 'i');
  const results = await Listing.find({ title: { $regex: regex } }).limit(50);
  if (!results.length) {
    console.log('No listings found matching the query.');
  } else {
    console.log(`Found ${results.length} listing(s):`);
    for (const r of results) {
      console.log(`- id: ${r._id.toString()} | title: ${r.title}`);
    }
  }
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
