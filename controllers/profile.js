const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { cloudinaryUpload } = require("../utils/imageUploader");
require("dotenv").config();

exports.editProfile = async (request, response) => {
  try {
    const { dateOfBirth, about, gender, contactNumber } = request.body;

    if (!gender || !contactNumber) {
      return response.status(400).json({
        success: false,
        message: "Empty fields",
      });
    }

    const userId = request.user.id;
    const userDetails = await User.findById(userId);
    console.log(userDetails.additionalDetails);

    const profileDetails = await Profile.findById(
      userDetails.additionalDetails
    );

    console.log(profileDetails);

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();

    response.status(200).json({
      success: true,
      message: "Profile Updated",
      data: profileDetails,
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Internal Server error",
      error: err.message,
    });
  }
};

// Getallprofile details

exports.getProfileDetails = async (request, response) => {
  try {
    const userId = request.user.id;

    if (!userId) {
      return response.status(400).json({
        success: false,
        message: "User Id not found",
      });
    }

    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();
    // const profileDetails = await Profile.findById({
    //   _id: userDetails.additionalDetails,
    // });

    response.status(200).json({
      success: true,
      message: "Profile details fetched",
      userDetails,
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Internal Server error",
      error: err.message,
    });
  }
};

// delete account
exports.deleteAccount = async (request, response) => {
  try {
    // get id
    const userId = request.user.id;
    console.log(userId);
    // validation
    if (!userId) {
      return response.status(400).json({
        success: false,
        message: "User id not found",
      });
    }

    //find user
    const userDetails = await User.findById({ _id: userId });

    // delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    // delete user
    await User.findByIdAndDelete({ _id: userId });

    // enrolled field update

    // response
    response.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Internal Server error",
      error: err.message,
    });
  }
};

exports.updateProfilePicture = async (request, response) => {
  try {
    const imageFile = request.files.imageFile;
    const userId = request.user.id;

    const profilePicture = await cloudinaryUpload(
      imageFile,
      process.env.IMAGE_FOLDER_NAME
    );

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: profilePicture.secure_url },
      { new: true }
    );

    return response.status(200).json({
      success: true,
      message: "Profile picture is updated",
      data: updatedProfile,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Server error, try again",
      error: err.message,
    });
  }
};

exports.instructorDashboard = async (request, response) => {
  try {
    const instructor = request.user.id;
    const courses = await Course.findOne({ instructor: instructor });
    const courseData = courses.map((course) => {
      const totalStudentEnrolled = course.studentEnrolled.length;
      const totalAmount = totalStudentEnrolled * course.price;

      const courseWithStats = {
        _id: course.id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentEnrolled,
        totalAmount,
      };

      return courseWithStats;
    });

    return response.status(200).json({
      success: true,
      message: "Instructor Dashboard fetched",
      data: courseData,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Server error, try again",
      error: err.message,
    });
  }
};
// Task Scheduing
// Cron JOb
