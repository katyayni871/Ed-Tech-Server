// packages
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
// reset password token

exports.resetPasswordToken = async (request, response) => {
  try {
    // fetch
    const { email } = request.body;

    // validaation
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(400).json({
        success: false,
        message: "Email not registered",
      });
    }

    // generate token
    const token = crypto.randomUUID();

    // update
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        expiresIn: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );

    // create url
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail
    mailSender(
      email,
      "Password reset link",
      `<p>Click here: <a href="${url}">${url}</a></p>`
    );

    // response
    response.status(200).json({
      success: true,
      message: "Reset password link sent",
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

// reset password
exports.resetPassword = async (request, response) => {
  try {
    // fetch
    const { password, confirmPassword, token } = request.body;
    // validate
    if (password !== confirmPassword) {
      return response.status(401).json({
        success: false,
        message: "Password did not match",
      });
    }

    // get the userdetail using token
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return response.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    // validate token time
    if (userDetails.expiresIn < Date.now()) {
      return response.status(400).json({
        success: false,
        message: "Token expired. Try again",
      });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    // response
    response.status(200).json({
      success: true,
      message: "Password changed successfully",
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
