const mongoose = require("mongoose");

const CourseProgress = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    userIdL: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subSection",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("courseProgess", CourseProgress);
