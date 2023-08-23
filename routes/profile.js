const express = require("express");
const router = express.Router();

// Import
const { auth } = require("../middlewares/auth");

const {
  editProfile,
  getProfileDetails,
  deleteAccount,
  updateProfilePicture,
  instructorDashboard,
} = require("../controllers/profile");

// queries

router.put("/:userId/editProfile", editProfile);
router.get("/:userId/getProfileDetails", getProfileDetails);
router.delete("/deleteAccount", auth, deleteAccount);
router.put("/:userId/updateProfilePicture", updateProfilePicture);
router.get("/:userId/instructorDashboard", instructorDashboard);

module.exports = router;
