const { mongo, default: mongoose } = require("mongoose");
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/RatingAndReview");

exports.createRatingAndReview = async (request, response) => {
  try {
    const { courseId, rating, review } = request.body;
    const userId = request.user.id;

    //  validation
    // check course enrolled
    const validCourse = await Course.findOne({
      _id: courseId,
      studentEnrolled: { $elematch: { $eq: courseId } },
    });

    if (!validCourse) {
      return response.status(400).json({
        success: false,
        message: "Course not purchased",
      });
    }

    // check user already reviewed the course
    const alreadyReviewed = await RatingAndReview.find({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return response.status(403).json({
        success: false,
        message: "Already reviewed the course",
      });
    }

    // create review rating
    const createdReviewRating = {
      review: review,
      rating: rating,
      user: userId,
      course: courseId,
    };

    // db interact
    const updatedReviewAndRating = await RatingAndReview.create(
      createdReviewRating
    );

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { ratingAndReview: updatedReviewAndRating._id } },
      { new: true }
    );

    console.log(updatedCourse);

    // return response
    return response.status(200).json({
      success: true,
      message: "Rating and review created",
      updatedReviewAndRating,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Internal Server error",
      error: err.message,
    });
  }
};

exports.getAverageRating = async (request, response) => {
  try {
    //fetch id
    const { courseId } = request.body;

    //  calculate avg ratng
    const avgRating = await RatingAndReview.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "rating" },
        },
      },
    ]);

    if (result.length > 0) {
      return response.status(200).json({
        success: true,
        message: "Average Rating fetched",
        averageRating: avgRating[0].averageRating,
      });
    }

    return response.status(200).json({
      success: true,
      message: "No ratings published ",
      averageRating: 0,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Internal Server error",
      error: err.message,
    });
  }
};

//getallratingandreview

exports.getAllRatingAndReview = async (request, response) => {
  try {
    const allRatings = await RatingAndReview.find()
      .sort({ rating: "desc" })
      .populate({
        path: "course",
        select: "courseName",
      })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .exec();

    return response.status(200).json({
      success: true,
      data: allRatings,
      message: "All ratings fetched",
    });
  } catch (error) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Internal Server error",
      error: err.message,
    });
  }
};
