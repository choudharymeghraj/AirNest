const mongoose = require('mongoose');
const Listing = require('../models/listing');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to DB');
  const titleArg = process.argv[2] || 'abcd hcc';
  console.log(`Removing listing matching title (case-insensitive): "${titleArg}"`);
  const deleted = await Listing.findOneAndDelete({ title: { $regex: new RegExp(titleArg, 'i') } });
  if (!deleted) {
    console.log('No matching listing found.');
  } else {
    console.log('Deleted listing:');
    console.log({ id: deleted._id.toString(), title: deleted.title });
  }
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
