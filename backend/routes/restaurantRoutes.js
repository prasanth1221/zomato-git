const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
const axios = require("axios");
const vision = require("@google-cloud/vision");
// Function to get MongoDB collection reference after connection is established
const collection = () => mongoose.connection.collection("restaurants");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// Google Vision API Setup
const client = new vision.ImageAnnotatorClient({
  keyFilename: "D:\\projects\\Zomato-WebApp\\zomato-451917-fd021a674721.json", // Add your credentials JSON file
});

// Image Search API
router.post("/image-search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Detect Food Item from Image
    const [result] = await client.labelDetection(req.file.buffer);
    const labels = result.labelAnnotations.map((label) => label.description.toLowerCase());

    console.log("Detected labels:", labels);

    // Find the first detected food-related label
    const detectedFood = labels.find((label) =>
      ["pizza", "burger", "ice cream", "sushi", "pasta"].includes(label)
    );

    if (!detectedFood) {
      return res.status(404).json({ message: "No food item detected" });
    }

    console.log("Detected food:", detectedFood);

    // Search Restaurants with the detected food item
    const matchingRestaurants = await Restaurant.find({
      cuisines: { $regex: detectedFood, $options: "i" },
    });

    res.json({ foodItem: detectedFood, restaurants: matchingRestaurants });
  } catch (error) {
    console.error("Image processing error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// ✅ GET all restaurants while keeping nested structure
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 12;
        const skip = (page - 1) * pageSize;

        const totalRestaurants = await collection().countDocuments();
        const documents = await collection().find().skip(skip).limit(pageSize).toArray();

        console.log("Total Restaurants:", totalRestaurants);
        console.log("Fetched Restaurants:", documents.length);

        res.json({ totalRestaurants, data: documents });
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ GET restaurant by ID
router.get("/:id", async (req, res) => {
    try {
        const resId = Number(req.params.id);
        const document = await collection().findOne({ "restaurants.restaurant.R.res_id": resId });

        if (!document) return res.status(404).json({ error: "Restaurant not found" });

        const restaurant = document.restaurants.find(r => r.restaurant.R.res_id === resId);
        if (!restaurant) return res.status(404).json({ error: "Restaurant not found in the dataset" });

        res.json(restaurant);
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// ✅ Search restaurants by name or cuisines
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: "Query parameter is required" });

        const results = await collection().find({ "restaurant.name": { $regex: query, $options: "i" } }).toArray();
        if (results.length === 0) return res.status(404).json({ error: "No restaurants found" });

        res.json(results);
    } catch (error) {
        console.error("Error in search:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// ✅ Filter restaurants by country, cuisine, or average cost
router.get("/filter", async (req, res) => {
    try {
        const { country, cuisine, minCost, maxCost } = req.query;
        let filter = {};

        if (country) filter["restaurant.location.country_id"] = Number(country);
        if (cuisine) filter["restaurant.cuisines"] = { $regex: cuisine, $options: "i" };
        if (minCost && maxCost) {
            filter["restaurant.R.average_cost_for_two"] = {
                $gte: parseInt(minCost),
                $lte: parseInt(maxCost)
            };
        }

        const results = await collection().find(filter).toArray();
        res.json(results);
    } catch (error) {
        console.error("Error in filtering:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

module.exports = router;
