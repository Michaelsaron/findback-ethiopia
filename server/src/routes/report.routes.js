
const express = require("express");
const Report = require("../models/Report");

const router = express.Router();

// GET /api/v1/reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
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
