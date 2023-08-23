const { instance } = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const { courseEnrollmentEmail } = require("../mail/courseEnrollment");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");

//capture the payment

exports.capturePayment = async (request, response) => {
  // get courseId and UserId
  const { courseId } = request.body;
  const userId = request.user.id;

  // Validation

  // Validation of CourseId
  if (!courseId) {
    return response.status(400).json({
      success: false,
      message: "Course ID not found",
    });
  }

  // Validation of UserId
  if (!userId) {
    return response.status(400).json({
      success: false,
      message: "User ID not found",
    });
  }
  let course;
  try {
    course = await Course.findById({ courseId });
    if (!course) {
      return response.status(400).json({
        success: false,
        message: "User ID not found",
      });
    }

    // Check if already paid
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentEnrolled.includes(uid)) {
      return response.status(400).json({
        success: false,
        message: "User already purchased the course",
      });
    }
  } catch (err) {
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }

  // create order
  const amount = course.price * 100;
  const currency = "INR";

  const options = {
    amount,
    currency,
    receipt: Math.random(Date.now()).toString,
    notes: {
      course: courseId,
      user: userId,
    },
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);

    // return order
    return response.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      coursethumbnail: course.thumbnail,
      price: paymentResponse.price,
      currency: paymentResponse.currency,
      orderId: paymentResponse.id,
    });
  } catch (err) {
    response.status(500).json({
      success: false,
      message: "Internal Server error, Try again",
      error: err.message,
    });
  }
};

exports.verifySignature = async (request, response) => {
  const webHookSecret = "1234567";

  const signature = request.header["x-razorpay-signature"];

  const shaSum = await crypto.createHmac("sha256", webHookSecret);
  shaSum.update(JSON.stringify(request.body));
  const digest = shaSum.digest("hex");

  if (digest === signature) {
    try {
      // payment complete
      console.log("Payment is authorized");

      // update the models
      const { courseId, userId } = request.body.payload.payment.entity.notes;

      const enrolledCourse = await Course.findByIdAndUpdate(
        courseId,
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return response.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      console.log(enrolledCourse);

      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      console.log(enrolledStudent);

      const mailResponse = await mailSender(
        enrolledStudent.email,
        `Payment Recieved`,
        courseEnrollmentEmail(`${enrolledCourse.courseName}`)
      );

      console.log(mailResponse);

      return response.status(200).json({
        success: true,
        message: "Course purshased successfully",
      });
    } catch (err) {
      response.status(500).json({
        success: false,
        message: "Internal Server error, Try again",
        error: err.message,
      });
    }
  }
};
