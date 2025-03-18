// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   googleId: { type: String, sparse: true },
//   userName: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     sparse: true,
//   },
//   role: {
//     type: String,
//     default: "user",
//   },
// });

// const User = mongoose.model("User", UserSchema);
// module.exports = User;
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    sparse: true,
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: {
    type: String, // Stores the token for password reset
  },
  resetPasswordExpires: {
    type: Date, // Stores expiration time for the token
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
