const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:process.env.EMAIL,
    pass:process.env.NODEMAILER_PASSWORD
  },
});

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    const result = await newUser.save();
    if (result) {
      const mailOptions = {
        from: ' "shop vibe" testemail23mca20049@gmail.com',
        to: email,
        subject: "Welcome to Shop vibe",
        html: `
             <div style="background-image: url('https://via.placeholder.com/1600x400'); background-size: cover; padding: 40px; text-align: center; color: white;">
  <h1>Welcome to Shop Vibe!</h1>
  <p>Thank you for joining us at Shop Vibe! Your ultimate shopping destination.</p>
</div>

<div style="text-align: center; margin-top: 40px; padding: 20px;">
  <p>At Shop Vibe, we're dedicated to offering the best products and deals for you!</p>
  <img src="cid:unique@shopvibe.image" alt="Shop Vibe Image" style="width: 300px; height: auto; border-radius: 10px;">
</div>

              `,
        // attachments: [
        //   {
        //     filename: 'welcome-image.jpg',
        //     path: result.profile,  // Update with the correct path to your image
        //     cid: 'unique@learnigo.image' // Same as used in the 'img' tag in the HTML
        //   }
        // ]
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      // Send a success response
      // res.status(201).json({ user, token });
      res.status(200).json({
        success: true,
        message: "Registration successful",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

const sendEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email!",
      });
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Password reset link
    // const resetLink = `http://localhost:5173/auth/forget/token=${resetToken}`;
    const resetLink = `https://shop-vibe-ecom.netlify.app/auth/forget?token=${resetToken}`;


    // Email options
    const mailOptions = {
      from: '"Shop Vibe" <testemail23mca20049@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="padding: 20px; text-align: center; background-color: #f8f9fa;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
        </div>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error sending email",
        });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({
        success: true,
        message: "Password reset email sent successfully!",
      });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  console.log(token);
  console.log(newPassword);
  
  

  try {
    // Find user with the given reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token!",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};



module.exports = { registerUser, loginUser, logoutUser, authMiddleware ,sendEmail,resetPassword};
