const express = require("express");
const router = express.Router();

// Import
const {
  sendOTP,
  signUp,
  login,
  changePassword,
} = require("../controllers/auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/resetPassword");

const { auth } = require("../middlewares/auth");

// queries
router.post("/sendOTP", auth, sendOTP);
router.post("/signup", auth, signUp);
router.post("/login", auth, login);
router.post("/changePassword", auth, changePassword);
router.post("/resetPasswordToken", auth, resetPasswordToken);
router.post("/resetPassword", auth, resetPassword);

module.exports = router;
