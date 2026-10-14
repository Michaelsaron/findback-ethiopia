
const express = require("express");
const Report = require("../models/Report");

const router = express.Router();

// ============================================
// GET /api/v1/reports
// Filtering, searching, sorting, pagination
// ============================================

router.get("/", async (req, res) => {
  try {
    // 1. Read query parameters from the URL
    const {
      area,
      type,
      category,
      search,
      page,
      limit,
      sort
    } = req.query;

    // 2. Build MongoDB filter
    const filter = {};

    // Filter by area
    if (area) {
  if (typeof area !== "string" || area.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Area must be text up to 100 characters"
    });
  }

  const safeArea = area
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (safeArea) {
    filter["location.area"] = {
      $regex: safeArea,
      $options: "i"
    };
  }
}

    // Filter by report type
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

    // 3. Keyword search
    if (search !== undefined) {
      if (
        typeof search !== "string" ||
        search.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Search must be text up to 100 characters"
        });
      }

      const keyword = search.trim();

      if (keyword) {
        // Escape special regex characters
        const safeKeyword = keyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        filter.$or = [
          {
            title: {
              $regex: safeKeyword,
              $options: "i"
            }
          },
          {
            description: {
              $regex: safeKeyword,
              $options: "i"
            }
          }
        ];
      }
    }

    // 4. Pagination
    const pageNumber =
      page === undefined ? 1 : Number(page);

    const limitNumber =
      limit === undefined ? 10 : Number(limit);

    // Validate pagination values
    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be a positive integer and limit must be between 1 and 100"
      });
    }

    // 5. Sorting
    if (
      sort !== undefined &&
      !["newest", "oldest"].includes(sort)
    ) {
      return res.status(400).json({
        success: false,
        message: "Sort must be newest or oldest"
      });
    }

    const sortOrder = sort === "oldest" ? 1 : -1;

    // Calculate how many reports to skip
    const skip = (pageNumber - 1) * limitNumber;

    // 6. Count all reports matching the filters
    const total = await Report.countDocuments(filter);

    // 7. Fetch only the requested page
    const reports = await Report.find(filter)
      .sort({
        createdAt: sortOrder,
        _id: sortOrder
      })
      .skip(skip)
      .limit(limitNumber);

    // 8. Send successful response
    return res.status(200).json({
      success: true,
      count: reports.length,
      total: total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: reports
    });

  } catch (error) {
    console.error("Get reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });
  }
});


// ============================================
// POST /api/v1/reports
// Create a new lost or found report
// ============================================

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

    return res.status(201).json({
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

    return res.status(500).json({
      success: false,
      message: "Failed to create report"
    });
  }
});

module.exports = router;
