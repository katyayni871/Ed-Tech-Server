const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const { response } = require("express");

const otp = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

const sendVerificationEmail = async (email, otp) => {
  try {
    const response = await mailSender(
      email,
      "Verification email from StudyNotion",
      otp
    );
    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Error while sending email: ", error);
  }
};

otp.pre("save", async (next) => {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", otp);
