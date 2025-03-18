
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const User = require("../../models/User");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:5000/api/oauth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log(profile);

//       try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (!user) {
//           user = new User({
//             googleId: profile.id,
//             userName: profile.displayName,
//             email: profile.emails[0].value,
//             // avatar: profile.photos[0].value,
//           });
//           await user.save();
//         }

//         // ✅ Generate JWT Token
//         const token = jwt.sign(
//           { id: user._id, name: user.userName, email: user.email },
//           process.env.JWT_SECRET,
//           { expiresIn: "7d" } // Token valid for 7 days
//         );

//         return done(null, { user, token });
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
require('dotenv').config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:5000/api/oauth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            userName: profile.displayName,
            email: profile.emails[0].value,
          });
        }

        const token = jwt.sign(
          {
            id: user._id,
            role: "user",
            email: user.email,
            userName: user.userName,
          },
          process.env.JWT_SECRET,
          { expiresIn: "60m" }
        );

        return done(null, { user, token }); // ✅ No need to serialize
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


