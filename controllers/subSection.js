const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { cloudinaryUpload } = require("../utils/imageUploader");
require("dotenv").config();

// create
exports.createSubSection = async (request, response) => {
  try {
    // fetch
    const { title, description, duration } = request.body;
    const { sectionId } = request.params;
    const { video } = request.files.videoFile;

    // Upload
    const videoUploadDetails = await cloudinaryUpload(
      video,
      process.env.VIDEO_FILE_UPLOAD
    );

    // create
    const createdSubSection = await SubSection.create({
      title: title,
      description: description,
      duration: duration,
      videoUrl: videoUploadDetails.secure_url,
    });

    // update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: createdSubSection._id } },
      { new: true }
    )
      .populate("subSection")
      .exec();

    // response
    response.status(200).json({
      success: true,
      message: "Subsection Created",
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

// update
exports.editSubSection = async (request, response) => {
  try {
    const { subSectionId, title, description } = request.body;
    const { sectionId } = request.params;
    const videoFile = request.files.videoFile;

    if (!subSectionId || !sectionId || !title || !description) {
      return response.status(400).json({
        success: false,
        message: "Empty fields",
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return response.status(404).json({
        success: false,
        message: "Subsection not found",
      });
    }

    subSection.title = title;
    subSection.description = description;

    if (videoFile !== undefined) {
      const uploadResponse = await cloudinaryUpload(
        videoFile,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadResponse.secure_url;
      subSection.duration = `${uploadResponse.duration}`;
    }

    await subSection.save();

    const updatedSection = await Section.findById(sectionId)
      .populate("subSection")
      .exec();

    return response.status(200).json({
      success: true,
      message: "Sub Section updated successfully",
      data: updatedSection,
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

// delete
exports.deleteSubSection = async (request, response) => {
  try {
    const { subSectionId } = request.body;
    const { sectionId } = request.params;

    const subSection = await SubSection.findByIdAndDelete(subSectionId);
    if (!subSection) {
      return response.status(404).json({
        success: false,
        message: "Sub Section not found",
      });
    }

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSection: subSectionId } },
      { new: true }
    );

    response.status(200).json({
      success: true,
      message: "Sub Section deleted successfully",
      data: updatedSection,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
