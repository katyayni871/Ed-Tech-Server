const { response } = require("express");
const Category = require("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// create category
exports.createCategory = async (request, response) => {
  try {
    const { name, description } = request.body;
    if (!name || !description) {
      return response.status(400).json({
        success: false,
        message: "Empty field",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    if (!categoryDetails) {
      return response.status(400).json({
        success: false,
        message: "Somthing went wrong",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Category created successfully",
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

// get all category
exports.getAllCategory = async (request, response) => {
  try {
    const categories = await Category.find(
      {},
      { name: true, description: true }
    );

    if (!categories) {
      return response.status(404).json({
        success: false,
        message: "Something went wrong",
      });
    }

    if (categories.length === 0) {
      return response.status(400).json({
        success: false,
        message: "No Categories found",
      });
    }
    return response.status(200).json({
      success: true,
      message: "Fetched all the Categories",
      data: tags,
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

// category page details
exports.categoryPageDetails = async (request, response) => {
  try {
    // fetch
    const { categoryId } = request.body;

    // getCategory
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    // validate
    if (!selectedCategory) {
      return response.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // get courses for different category
    const differentCategory = await Category.findById({
      _id: { $ne: categoryId },
    })
      .populate({
        path: "courses",
        match: { status: "published" },
        populate: "instructor",
        populate: "ratingAndReview",
      })
      .exec();

    const allCategories = await Category.find({}).populate({
      path: "course",
      match: { status: "Published" },
      populate: {
        path: "instructor",
      },
    });

    const allCourses = allCategories.flatMap((category) => category.courses);
    // top selling courses
    const topSellingCourses = allCourses
      .sort((a, b) => b.studentEnrolled.length > a.studentEnrolled.length)
      .slice(0, 10);

    // return
    return response.status(200).json({
      success: true,
      message: "Courses Fetched",
      data: {
        selectedCategory,
        differentCategory,
        topSellingCourses,
      },
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

// catergoriesSorted

exports.categoriesSortedPage = async (request, response) => {
  try {
    const { categoryId } = request.body;

    if (!categoryId) {
      return response.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    const categoryDetails = await Category.findById(categoryId)
      .populate("courses")
      .exec((err, results) => {
        if (err) {
          return response.status(400).json({
            success: false,
            message: "Something went wrong",
          });
        } else {
          Category.aggregate([
            { $match: { _id: categoryId } },
            {
              $project: {
                name: 1,
                courses: 1,
                numberOfStudents: { $size: "$studentEnrolled" },
              },
            },
            { $sort: { numberOfStudents: -1 } },
          ]).exec((err, sortedResults) => {
            if (err) {
              return response.status(400).json({
                success: false,
                message: "Something went wrong",
              });
            } else {
              console.log("Results from sorted -> ", sortedResults);
              categoryDetails = sortedResults;
            }
          });
        }
      });

    if (!categoryDetails) {
      return response.status(400).json({
        success: false,
        message: "Something went wrong",
      });
    }

    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    return response.status(200).json({
      success: true,
      message: "Sorted Categories fetched",
      data: { categoryDetails, differentCategories },
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
