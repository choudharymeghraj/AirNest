require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('../models/listing');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/airnest';

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to DB');

  const listings = await Listing.find({});
  let updated = 0;

  for (const l of listings) {
    if (!l.image) continue;
    let url = l.image.url;
    let filename = l.image.filename;

    if (!url) continue;

    const original = url;

    // Normalize backslashes
    url = url.replace(/\\/g, '/');

    // If url points to a local absolute path, rewrite to /uploads/<filename>
    const looksLikeWindowsAbs = /^[A-Za-z]:\//.test(url);
    const looksLikeLocalUploads = /\/uploads\//.test(url);

    if (looksLikeWindowsAbs) {
      // Use filename if present, else derive from basename
      const name = filename || path.basename(url);
      url = `/uploads/${name}`;
    }

    // If we already have /uploads/, ensure it’s correctly formatted
    if (looksLikeLocalUploads) {
      // strip anything before /uploads/
      const idx = url.indexOf('/uploads/');
      url = url.slice(idx);
    }

    if (url !== original) {
      l.image.url = url;
      await l.save();
      updated++;
      console.log(`Updated ${l._id}: ${original} -> ${url}`);
    }
  }

  console.log(`Done. Updated ${updated} listing image URLs.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
