const express = require("express");
const router = express.Router();

// import
const { contactUs } = require("../controllers/contact");

// query
router.post("/contactUs", contactUs);

module.exports = contactUs;
