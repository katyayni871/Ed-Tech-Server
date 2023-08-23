const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// Auth
exports.auth = async (request, response, next) => {
  try {
    //Fetch
    //3 ways to fetch it according to preference wise
    const token =
      request.cookies.token ||
      request.token ||
      request.header("Authorisation").replace("Bearer ", "");

    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    //decode
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      request.user = decode;
    } catch (err) {
      return response.status(403).json({
        success: false,
        message: "UnAutharised",
      });
    }

    // go to next parameter
    next();
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// isStudent
exports.isStudent = async (request, response, next) => {
  try {
    if (request.user.accountType !== "Student") {
      return response.status(400).json({
        success: false,
        message: "This is a protected route for student only",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// isInstructor
exports.isInstructor = async (request, response, next) => {
  try {
    if (request.user.accountType !== "Instructor") {
      return response.status(400).json({
        success: false,
        message: "This is a protected route for instructor only",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// isAdmin
exports.isAdmin = async (request, response, next) => {
  try {
    if (request.user.accountType !== "Admin") {
      return response.status(400).json({
        success: false,
        message: "This is a protected route for admin only",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
