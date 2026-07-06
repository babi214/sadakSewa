// Run: node scripts/migrateProvinceNames.js
// Updates user province fields from old names (Pradesh) to new names (Province)

const mongoose = require("mongoose");
require("dotenv").config();

const provinceMapping = {
  "Koshi Pradesh": "Koshi Province",
  "Madhesh Pradesh": "Madhesh Province",
  "Bagmati Pradesh": "Bagmati Province",
  "Gandaki Pradesh": "Gandaki Province",
  "Lumbini Pradesh": "Lumbini Province",
  "Karnali Pradesh": "Karnali Province",
  "Sudurpashchim Pradesh": "Sudurpaschim Province",
};

async function migrate() {
  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const users = db.collection("users");
  const reports = db.collection("reports");

  let totalUsers = 0, totalReports = 0;

  for (const [oldName, newName] of Object.entries(provinceMapping)) {
    const uRes = await users.updateMany({ province: oldName }, { $set: { province: newName } });
    if (uRes.modifiedCount) console.log(`Users: ${oldName} -> ${newName} (${uRes.modifiedCount})`);
    totalUsers += uRes.modifiedCount;

    const rRes = await reports.updateMany({ province: oldName }, { $set: { province: newName } });
    if (rRes.modifiedCount) console.log(`Reports: ${oldName} -> ${newName} (${rRes.modifiedCount})`);
    totalReports += rRes.modifiedCount;
  }

  console.log(`\nDone. Updated ${totalUsers} users and ${totalReports} reports.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
