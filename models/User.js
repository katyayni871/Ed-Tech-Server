const mongoose = require("mongoose");

const User = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lasName: {
      type: String,
      requried: true,
      trim: true,
    },
    email: {
      type: String,
      requried: true,
    },
    password: {
      type: String,
      requried: true,
    },

    accountType: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profile",
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        requried: true,
      },
    ],
    image: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    expiresIn: {
      type: Date,
    },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseProgress",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", User);
