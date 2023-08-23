const mailSender = require("../utils/mailSender");
const { contactUsEmail } = require("../mail/contactUsForm");
const mailSender = require("../utils/mailSender");

exports.contactUs = async (request, response) => {
  try {
    const { firstName, lastName, email, message, contactNumber, countryCode } =
      request.body;

    const mailResponse = await mailSender(
      email,
      "Contact Email",
      contactUsEmail(
        email,
        firstName,
        lastName,
        message,
        contactNumber,
        countryCode
      )
    );
    console.log(mailResponse);
    return response.status(200).json({
      success: true,
      message: "Contact email sent successfully",
    });
  } catch (err) {
    console.log(err);
    return response(500).json({
      success: false,
      message: "Server error, Try again",
      error: err.message,
    });
  }
};
