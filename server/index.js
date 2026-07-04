const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require("./routes/reportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const locationRoutes = require("./routes/locationRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes)
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/locations", locationRoutes);
// app.use((err, req, res, next) => {
//     console.error("--- SERVER ERROR STACK ---");
//     console.error(err); // This prints the actual error to your VS Code terminal
//     console.error("--------------------------");

//     // This forces Postman to receive JSON instead of HTML
//     res.status(err.status || 500).json({
//         success: false,
//         message: err.message || "An unknown error occurred",
//     });
// });

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});