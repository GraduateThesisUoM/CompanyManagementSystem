const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require('../../constantsPaths');

//Models
const Accountant = require("../../Schemas/Accountant");
const Review = require("../../Schemas/Review");

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get General Functions
const generalFunctions = require( path_constants.generalFunctions_folder.two);
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);

/*--------   Self ACCOUNTANT */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      res.render("user_pages/self_accountant.ejs", {
        user: req.user,
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error fetching accountants:", err);
    res.redirect("/error?error=" + err);
  }
});

module.exports = router;
