
const express = require("express");
const Report = require("../models/Report");

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    // 1. Read the area from the URL
    const { area, type, category } = req.query;

    // 2. Build the MongoDB filter
    const filter = {};

    if (area) {
      filter["location.area"] = area;
    }
     
    // Filter by lost or found
    if (type) {
      if (!["lost", "found"].includes(type)) {
        return res.status(400).json({
        success: false,
        message: "Type must be lost or found"
     });
    }

     filter.type = type;
    }

     // Filter by category
     if (category) {
     filter.category = category;
      }

    // 3. Search MongoDB
    const reports = await Report.find(filter);

    // 4. Return the results
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });
  }
});



router.post("/", async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      location,
      eventDate
    } = req.body;

    const report = await Report.create({
      type,
      title,
      category,
      description,
      location,
      eventDate
    });

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Create report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create report"
    });
  }
});

module.exports = router;
