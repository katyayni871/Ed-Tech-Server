const User = require("../models/User");
const OTP = require("../models/otp");
const Profile = require("../models/Profile");
const otpGenerate = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/emailVerification");
const passwordChange = require("../mail/passwordChange");
require("dotenv").config();

// send OTP
exports.sendOTP = async (request, response) => {
  try {
    const { email } = request.body;

    const checkAccount = await User.findOne({ email });
    if (checkAccount) {
      return response.status(401).json({
        success: false,
        message: "Account already exist",
      });
    }

    var otp = otpGenerate.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpBody = await OTP.create({
      email,
      otp,
    });

    const mailResponse = await mailSender(
      email,
      "Email verification",
      otpTemplate(otp)
    );
    console.log(mailResponse);
    return response.status(200).json({
      success: true,
      message: "OTP successfully sent",
      otp,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      success: false,
      message: "Internal Server error",
      error: err.message,
    });
  }
};
//sign up
exports.signUp = async (request, response) => {
  if (request.body?.iss === "https://accounts.google.com") {
    try {
      const { firstName, lastName, email, contactNumber, image } = request.body;

      const accountType = "Student";

      // validation
      if (!firstName || !lastName || !email || !image) {
        return response.status(400).json({
          success: false,
          message: "Missing Fields",
        });
      }

      //check user
      const user = await User.findOne({ email: email });

      if (user) {
        return response.status(402).json({
          success: false,
          message: "User already exist",
        });
      }

      // password
      const hashedPassword = null;

      //create profile
      const profileDetails = await Profile.create({
        gender: null,
        contactNumber: contactNumber,
        dateOfBirth: null,
        about: null,
      });

      console.log(profileDetails);

      // create user
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountType,
        additionalDetails: profileDetails._id,
        image,
      });

      return response.status(200).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (err) {
      console.log(err);
      response.status(500).json({
        success: false,
        message: "Internal Server error",
        error: err.message,
      });
    }
  } else {
    try {
      //fetch
      const {
        firstName,
        lastName,
        email,
        contactNumber,
        accountType,
        password,
        confirmPassword,
        otp,
      } = request.body;

      // validate
      if (
        !firstName ||
        !lastName ||
        !email ||
        !contactNumber ||
        !password ||
        !confirmPassword ||
        !otp
      ) {
        return response.status(403).json({
          success: false,
          message: "Fill out all the details",
        });
      }

      // password check
      if (password !== confirmPassword) {
        return response.status(401).json({
          success: false,
          message: "Password did not match",
        });
      }

      //  check account
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response.status(401).json({
          success: false,
          message: "Account already exist",
        });
      }

      // find OTP
      const recentOtp = await OTP.find({ email })
        .sort({ createdAt: -1 })
        .limit(1);

      if (recentOtp.length === 0) {
        return response.status(404).json({
          success: false,
          message: "OTP not found",
        });
      }

      // OTP check
      if (recentOtp[0].otp !== otp) {
        return response.status(400).json({
          success: false,
          message: "OTP did not match",
        });
      }

      // create hashpassword
      const hashedPassword = await bcrypt.hash(password, 10);

      // create Profile
      const profile = await Profile.create({
        gender: null,
        dateOfBirth: null,
        contactNumber: contactNumber,
        about: null,
      });

      // create the user
      const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        additionalDetails: profile._id,
        accountType,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
      });

      return response.status(200).json({
        success: true,
        message: "Account created successfully",
        data: user,
      });
    } catch (err) {
      console.log(err);
      response.status(500).json({
        success: false,
        message: "Internal Server error",
        error: err.message,
      });
    }
  }
};

//login
exports.login = async (request, response) => {
  // google login
  if (request.body.access_token) {
    try {
      const { access_token } = request.body;

      if (!access_token) {
        return response.status(404).json({
          success: false,
          message: "Access token not found",
        });
      }

      const googleResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const googleData = googleResponse.data;

      if (!googleData?.email_verified) {
        return response.status(402).json({
          success: false,
          message: "Email not verified by google",
        });
      }

      const login_cred = {
        firstName: googleData.given_name,
        lastName: googleData.family_name,
        email: googleData.email,
      };

      const user = await User.findOne({
        email: login_cred.email,
        firstName: login_cred.firstName,
        lastName: login_cred.lastName,
      })
        .populate("additionalDetails")
        .exec();

      if (!user) {
        return response.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user = user.toObject();
      user.token = token;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      response.cookie("token", token, options).status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          user,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      response.status(500).json({
        success: false,
        message: "Internal Server error",
        error: err.message,
      });
    }
  } else {
    try {
      // fetch
      const { email, password } = request.body;

      // validation
      if (!email || !password) {
        return response.status(403).json({
          success: false,
          message: "Fill out credentials",
        });
      }

      //find
      const user = await User.findOne({ email })
        .populate("additionalDetails")
        .exec();

      if (!user) {
        return response.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      //password match and token
      if (await bcrypt.compare(password, user.password)) {
        const payload = {
          email: user.email,
          id: user._id,
          role: user.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "2h",
        });

        user.toObject();
        user.token = token;
        user.password = undefined;

        //cookie
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 100),
          httpOnly: true,
        };
        response.cookie("token", token, options).status(200).json({
          success: true,
          user,
          message: "User Logged in",
        });
      } else {
        return response.status(401).json({
          success: false,
          message: "Password incorrect",
        });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({
        success: false,
        message: "Internal Server error",
        error: err.message,
      });
    }
  }
};

// change password
exports.changePassword = async (request, response) => {
  try {
    //fetch
    const userId = request.user.id;
    const { oldpassword, newPassword, confirmNewPassword } = request.body;

    // validation
    if (newPassword != confirmNewPassword) {
      return response.status(401).json({
        success: false,
        message: "Password did not match",
      });
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    // send mail - password updated
    try {
      const emailResponse = await mailSender(
        updatedUser.email,
        passwordChange(
          updatedUser.email,
          `<p>Password updated for ${updatedUser.firstName}, ${updatedUser.lasName}</p>`
        )
      );
    } catch (err) {
      return response.status(500).json({
        success: false,
        message: "Somthing went wrong ",
        error: err.message,
      });
    }

    // return response
    return response.status(200).json({
      success: true,
      message: "Password changed and email sent successfully",
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
