const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models

const User = require(path_constants.schemas.two.user);
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two)


/*--------   PROFILE */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      //if (req.user.type == "accountant") {
        /*const reviews = await Review.find({
          reviewed_id: req.user._id,
          type: 1,//client
        });
        const users = await User.find({ type: "user" });

        const reviewUserArray = reviews.map((review) => {
          const matchingUser = users.find(
            (user) => user._id.toString() === review.reviewer_id.toString()
          );
          return { review, user: matchingUser };
        });

        res.render("accountant_pages/profile_accountant.ejs", {
          user: req.user,
          reviews: reviewUserArray,
        });
      }
      if (req.user.type == "user") {
        res.render("user_pages/profile_user.ejs", {
          user: req.user,
        });
      }*/
        res.render("user_pages/profile_user.ejs", {
          user: req.user,
        });
        
    }
    else{
      res.redirect('/error?error='+access.error);
    }
   
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    req.user.firstName = req.body.firstName;
    req.user.lastName = req.body.lastName;
    req.user.email = req.body.email;
    req.user.afm = req.body.afm;
    req.user.mydatakey = req.body.mydatakey;
    if (req.user.type == "user") {
      req.user.companyName = req.body.companyName;
      req.user.companyLogo = req.body.companyLogo;
    }
    await req.user.save();
    res.redirect("/profile-page?message=updatedatacopmlete");
  } catch (err) {
    console.error("Error updating user data:", err);
    res.redirect("/error?origin_page=profile-page&error=" + err);
  }
});

module.exports = router;
