const mongoose = require("mongoose");

const Profile = new mongoose.Schema(
  {
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    about: {
      type: String,
    },
    profileImage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("profile", Profile);
