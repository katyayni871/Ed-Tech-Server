const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const { cloudinaryUpload } = require("../utils/imageUploader");
require("dotenv").config();
const timeConverter = require("../utils/timeConverter");

exports.createCourse = async (request, response) => {
  try {
    const {
      courseName,
      courseDescription,
      whatWillYouLearn,
      price,
      categoryId,
      tag,
      instruction,
    } = request.body;
    let { status } = request.body;
    const thumbnail = request.files.thumbnail;

    if (
      !courseName ||
      !courseDescription ||
      !whatWillYouLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return response.status(400).json({
        success: false,
        message: "Missing input field",
      });
    }

    if (status || !status === undefined) {
      status = "Draft";
    }

    const userId = request.user.id;
    const instructor = await User.findById(userId, {
      accountType: "Instructor",
    });

    if (!instructor) {
      return response.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    const categoryDetails = await Category.findById(categoryId);

    if (!categoryDetails) {
      return response.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    // thumbnail upload

    const thumbnailDetails = await cloudinaryUpload(
      thumbnail,
      process.env.FOLDER_NAME
    ); // returns a secret url

    //creae a entry

    const courseDetails = await Course.create({
      courseName: courseName,
      courseDescription: courseDescription,
      whatWillYouLearn: whatWillYouLearn,
      price: price,
      instructor: instructor._id,
      thumbnail: thumbnailDetails.secure_url,
      category: categoryDetails._id,
      tag: tag,
      instruction: instruction,
      status: status,
    });

    // update the user
    const updatedUser = await User.findByIdAndUpdate(
      { _id: instructor._id },
      { $push: { courses: courseDetails._id } },
      { new: true }
    );

    // update the tag
    const updatedCategory = await Category.findByIdAndUpdate(
      { id: categoryDetails._id },
      { $push: { courses: courseDetails._id } },
      { new: true }
    );

    // response
    response.status(200).json({
      success: true,
      message: "Course Added",
      data: courseDetails,
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Internal server error, try again",
    });
  }
};

exports.getAllCourses = async (request, response) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    response.status(200).json({
      success: true,
      message: "All courses fetched",
      courses: allCourses,
    });
  } catch (err) {
    response.status(500).json({
      success: false,
      message: "Internal Server error, Try again",
      error: err.message,
    });
  }
};

exports.getCourseDetail = async (request, response) => {
  try {
    const { courseId } = request.body;
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .populate("ratingAndReview")
      .exec();

    if (!courseDetails) {
      return response.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Course Detail fetched",
      data: courseDetails,
    });
  } catch (err) {
    response.status(500).json({
      success: false,
      message: "Internal server error, try again",
      error: err.message,
    });
  }
};

exports.editCourse = async (request, response) => {
  try {
    const { courseId } = request.body;
    const updates = request.body;

    //validation

    if (!courseId || !updates) {
      return response.status(400).json({
        success: false,
        message: "Empty field",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return response.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (request.files) {
      const thumbnail = request.files.thumbnail;
      const uploadedThumbail = await cloudinaryUpload(
        thumbnail,
        process.env.IMAGE_FOLDER_NAME
      );
      course.thumbnail = uploadedThumbail.secure_url;
    }

    // Upload the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("ratingAndReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .populate("studentsEnrolled")
      .populate("category")
      .exec();

    return response.status(200).json({
      success: true,
      message: "Course edited successfully",
      data: updatedCourse,
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Internal server error, try again",
      error: err.message,
    });
  }
};

// delete course
exports.deleteCourse = async (request, response) => {
  try {
    const { courseId } = request.body;

    if (!courseId) {
      return response.status(400).json({
        success: false,
        message: "Empty fields",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return response.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Unlink category
    const unlinkCategory = await Category.findByIdAndUpdate(course.category, {
      $pull: { course: courseId },
    });

    // unlink user
    const unlinkInstructor = await User.findByIdAndUpdate(course.instructor, {
      $pull: { courses: courseId },
    });

    // delete
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (deletedCourse === null) {
      return response.status(400).json({
        success: false,
        message: "Unable to delete course",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Internal server error, try again",
      error: err.message,
    });
  }
};

// get instructor course
exports.getInstructorCourses = async (request, response) => {
  try {
    const userId = request.user.id;

    const user = await User.findById(userId).populate("courses").exec();

    const userCourses = user.courses;

    return response.status(200).json({
      success: true,
      message: "Instructor courses fetched",
      data: userCourses,
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Internal server error, try again",
      error: err.message,
    });
  }
};

// get full course content
exports.getFullCourseContent = async (request, response) => {
  try {
    //fetch
    //validation
    // get course
    // user progress
    // course duration
    // converting duration into desirable format
    // response
  } catch (err) {}
};

// mark subsection complete

// get instructor dashboard
