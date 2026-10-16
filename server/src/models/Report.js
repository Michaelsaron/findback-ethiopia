
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    location: {
      city: {
        type: String,
        default: "Addis Ababa",
        enum: ["Addis Ababa"]
      },

      area: {
        type: String,
        required: true
      },

      landmark: String
    },

    eventDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open"
    },
    createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true
}
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
