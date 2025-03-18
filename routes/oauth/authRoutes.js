const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");


router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:5173/auth/login?error=AuthenticationFailed");
    }

    const { token } = req.user;

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Change to true if using HTTPS
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect("http://localhost:5173"); // ✅ Redirect to frontend
  }
);


// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" ,session:false}),
//   (req, res) => {
//     const { user, token } = req.user;
//     res.cookie("token", token, { httpOnly: true, secure: false }).json({
//       success: true,
//       message: "Logged in successfully",
//     });
//     res.redirect("http://localhost:5173"); // Redirect to frontend
//   }
// );




module.exports = router;
