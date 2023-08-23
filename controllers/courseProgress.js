const CourseProgress = require("../models/CourseProgress");
const User = require("../models/User");
const SubSection = require("../models/SubSection");
const errorHandler = require("../utils/errorHandler");
const ErrorHandler = require("../utils/errorHandler");

exports.updateCourseProgress = async (request, response, next) => {
  try {
    const { courseId, subSectionId } = request.body;
    const userId = request.user.id;

    if (!courseId || !subSectionId) {
      return response.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }
    const subSection = await SubSection.findById(subSectionId);
    let courseProgress = await CourseProgress.findOne({
      courseId: courseId,
      user: userId,
    });

    if (!courseProgress) {
      return next(new ErrorHandler("Course Progress not found", 404));
    }

    if (courseProgress.completedVideos.includes(subSection)) {
      return next(new ErrorHandler("Sub Section already included", 401));
    } else {
      courseProgress.completedVideos.push(subSection);
    }

    await courseProgress.save();

    return response.status(200).json({
      success: true,
      message: "Course progress updated successfully",
    });
  } catch (err) {}
};
