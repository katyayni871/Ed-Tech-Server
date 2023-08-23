const express = require("express");
const router = express.Router();

// Import
const {
  createCourse,
  getAllCourses,
  getCourseDetail,
  getInstructorCourses,
  editCourse,
  deleteCourse,
  getFullCourseContent,
} = require("../controllers/course");

const {
  createCategory,
  getAllCategory,
  categoryPageDetails,
  categoriesSortedPage,
} = require("../controllers/category");

const {
  auth,
  isStudent,
  isAdmin,
  isInstructor,
} = require("../middlewares/auth");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section");

const {
  createSubSection,
  editSubSection,
  deleteSubSection,
} = require("../controllers/subSection");

const {
  createRatingAndReview,
  getAverageRating,
  getAllRatingAndReview,
} = require("../controllers/ratingAndReview");

const { updateCourseProgress } = require("../controllers/courseProgress");

// queries

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/getAllCatgory", getAllCategory);
router.post("/categoryPageDetails", categoryPageDetails);
router.get("/categoriesSortedPage", categoriesSortedPage);

router.post("/createCourse", auth, isInstructor, createCourse);
router.get("/getAllCourse", getAllCourses);
router.get("/getCourseDetail", getCourseDetail);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.get("/getFullCourseContent", getFullCourseContent);
router.post("/editCourse", auth, isInstructor, editCourse);
router.post("/deleteCourse", auth, isInstructor, deleteCourse);

router.post("/createSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/editSubSection", auth, isInstructor, editSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.post("/createReviewAndRating", auth, isStudent, createRatingAndReview);
router.get("/getAverageRating", getAverageRating);
router.get("/getAllRatingAndReview", getAllRatingAndReview);

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

module.exports = router;
