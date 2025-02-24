const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Check if MONGO_URI is provided
if (!process.env.MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not set in .env file!");
    process.exit(1);
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});

// Handle MongoDB disconnects
mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected!");
});

// Routes
const restaurantRoutes = require("./routes/restaurantRoutes");
app.use("/api/restaurants", restaurantRoutes);

// Global 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🚨 Global Error:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
