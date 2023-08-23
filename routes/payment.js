const express = require("express");
const router = express.Router();

// Import
const { auth, isStudent } = require("../middlewares/auth");

const { capturePayment, verifySignature } = require("../controllers/payment");

// queries
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", auth, isStudent, verifySignature);

module.exports = router;
