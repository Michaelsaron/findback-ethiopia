
const express = require("express");
const mongoose = require("mongoose");
const Report = require("../models/Report");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Escape special characters in search text
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ============================================
// GET /api/v1/reports
// Public reports: search, filter, sort, paginate
// ============================================

router.get("/", async (req, res) => {
  try {
    const {
      area,
      type,
      category,
      search,
      page,
      limit,
      sort
    } = req.query;

    const filter = {};

    if (area !== undefined) {
      if (
        typeof area !== "string" ||
        area.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Area must be text up to 100 characters"
        });
      }

      if (area.trim()) {
        filter["location.area"] = {
          $regex: escapeRegex(area.trim()),
          $options: "i"
        };
      }
    }

    if (type !== undefined) {
      if (
        typeof type !== "string" ||
        !["lost", "found"].includes(type)
      ) {
        return res.status(400).json({
          success: false,
          message: "Type must be lost or found"
        });
      }

      filter.type = type;
    }

    if (category !== undefined) {
      if (
        typeof category !== "string" ||
        !["bag", "electronics", "documents", "other"].includes(category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category"
        });
      }

      filter.category = category;
    }

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

      if (search.trim()) {
        const keyword = escapeRegex(search.trim());

        filter.$or = [
          {
            title: {
              $regex: keyword,
              $options: "i"
            }
          },
          {
            description: {
              $regex: keyword,
              $options: "i"
            }
          }
        ];
      }
    }

    const pageNumber =
      page === undefined ? 1 : Number(page);

    const limitNumber =
      limit === undefined ? 10 : Number(limit);

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
          "Page must be positive and limit must be between 1 and 100"
      });
    }

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
    const skip = (pageNumber - 1) * limitNumber;

    const [total, reports] = await Promise.all([
      Report.countDocuments(filter),
      Report.find(filter)
        .sort({
          createdAt: sortOrder,
          _id: sortOrder
        })
        .skip(skip)
        .limit(limitNumber)
    ]);

    return res.status(200).json({
      success: true,
      count: reports.length,
      total,
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
// GET /api/v1/reports/mine
// Only reports created by the logged-in user
// ============================================

router.get("/mine", protect, async (req, res) => {
  try {
    const reports = await Report.find({
      createdBy: req.user._id
    }).sort({
      createdAt: -1,
      _id: -1
    });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Get my reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reports"
    });
  }
});

// ============================================
// GET /api/v1/reports/:id
// Public report details
// ============================================

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Get report details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report"
    });
  }
});

// ============================================
// POST /api/v1/reports
// Authenticated users create their own reports
// ============================================

router.post("/", protect, async (req, res) => {
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
      eventDate,
      createdBy: req.user._id
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


/**
 * PATCH /api/v1/reports/:id
 * Edit or resolve a report.
 * Only its owner can make changes.
 */
router.patch("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    // Only allow these fields to be changed.
    const allowedFields = [
      "type",
      "title",
      "category",
      "description",
      "location",
      "eventDate",
      "status"
    ];

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid update object is required"
      });
    }

    const fields = Object.keys(req.body);

    if (
      fields.length === 0 ||
      fields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty report update"
      });
    }

    const updates = {};

    for (const field of fields) {
      updates[field] = req.body[field];
    }

    // Prevent nested MongoDB update operators.
    if (Object.prototype.hasOwnProperty.call(updates, "location")) {
      const location = updates.location;

      if (
        !location ||
        typeof location !== "object" ||
        Array.isArray(location) ||
        Object.keys(location).some(
          (key) => !["city", "area", "landmark"].includes(key)
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid location"
        });
      }

      // Preserve other location fields during partial updates.
      const existing = await Report.findOne({
        _id: id,
        createdBy: req.user._id
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Report not found or not owned by you"
        });
      }

      updates.location = {
        ...existing.location.toObject(),
        ...location
      };
    }

    const report = await Report.findOneAndUpdate(
      {
        _id: id,
        createdBy: req.user._id
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        context: "query"
      }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or not owned by you"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: report
    });
  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid report data"
      });
    }

    console.error("Update report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update report"
    });
  }
});

/**
 * DELETE /api/v1/reports/:id
 * Only the report owner can delete it.
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID"
      });
    }

    const report = await Report.findOneAndDelete({
      _id: id,
      createdBy: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or not owned by you"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (error) {
    console.error("Delete report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete report"
    });
  }
});
module.exports = router;
