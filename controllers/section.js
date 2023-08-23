const Section = require("../models/Section");
const Course = require("../models/Course");
const e = require("express");

// create
exports.createSection = async (request, response) => {
  try {
    const { sectionName, courseId } = request.body;

    if (!sectionName || !courseId) {
      return response.status(400).json({
        success: false,
        message: "Empty fields",
      });
    }

    const createdSection = await Section.create({
      sectionName: sectionName,
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: createdSection } },
      { new: true }
    )
      .populate("section")
      .populate("subSection")
      .exec();

    response.status(200).json({
      success: true,
      message: "Section Created",
      updatedCourse,
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

// Update
exports.updateSection = async (request, response) => {
  try {
    const { sectionName, sectionId } = request.body;

    if (!sectionName || !sectionId) {
      return response.status(400).json({
        success: false,
        message: "Empty Field",
      });
    }

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName: sectionName },
      { new: true }
    )
      .populate("subSection")
      .exec();

    response.status(200).json({
      success: true,
      message: "Updated Section",
      updatedSection,
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

// Delete
exports.deleteSection = async (request, response) => {
  try {
    const { sectionId, courseId } = request.params;
    if (!sectionId) {
      return response.status(400).json({
        success: false,
        message: "Section Id not found",
      });
    }

    await Section.findByIdAndDelete(sectionId);
    const updatedCourse = await Course.findByIdAndUpdate(courseId, {
      $pull: { courseContent: sectionId },
    });
    response.status(200).json({
      success: true,
      message: "Section Deleted",
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
