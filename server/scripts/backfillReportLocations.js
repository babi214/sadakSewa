// Run: node scripts/backfillReportLocations.js
// Reverse-geocodes reports missing province/district/municipality/locationName
// and fills in the fields using the same matching logic as the live endpoint.

const mongoose = require("mongoose");
require("dotenv").config();

const Report = require("../models/reportModel");
const { reverseGeocodeLocation } = require("../controllers/locationController");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function backfill() {
  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to MongoDB");

  const cursor = Report.find({
    $or: [
      { province: { $in: [null, ""] } },
      { district: { $in: [null, ""] } },
      { municipality: { $in: [null, ""] } },
      { locationName: { $in: [null, ""] } },
    ],
    "location.coordinates.1": { $exists: true },
  }).cursor();

  let total = 0, updated = 0, failed = 0;

  for await (const report of cursor) {
    total++;
    const [lng, lat] = report.location.coordinates;
    if (typeof lat !== "number" || typeof lng !== "number" || (lat === 0 && lng === 0)) {
      console.log(`[${report._id}] SKIP (invalid coords ${lat}, ${lng})`);
      continue;
    }

    try {
      const rev = await reverseGeocodeLocation(lat, lng);
      const locationName = [rev.province, rev.district, rev.municipality].filter(Boolean).join(", ");

      const set = {};
      if (!report.province) set.province = rev.province;
      if (!report.district) set.district = rev.district;
      if (!report.municipality) set.municipality = rev.municipality;
      if (!report.locationName && locationName) set.locationName = locationName;

      if (Object.keys(set).length) {
        await Report.updateOne({ _id: report._id }, { $set: set });
        updated++;
        console.log(`[${report._id}] ${lat.toFixed(4)}, ${lng.toFixed(4)} -> ${locationName || "(no match)"}`);
      } else {
        console.log(`[${report._id}] OK (already filled)`);
      }
    } catch (err) {
      failed++;
      console.log(`[${report._id}] FAILED: ${err.message}`);
    }

    if (total % 5 === 0) {
      console.log(`... ${total} processed, ${updated} updated, ${failed} failed`);
      await sleep(1100);
    }
  }

  console.log(`\nDone. ${total} checked, ${updated} updated, ${failed} failed.`);
  await mongoose.disconnect();
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
