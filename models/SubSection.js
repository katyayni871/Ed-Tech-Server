const mongoose = require("mongoose");

const SubSection = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("subSection", SubSection);
