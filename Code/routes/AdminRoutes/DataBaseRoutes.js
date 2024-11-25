const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

const path_constants = require("../../constantsPaths");

//Models
const Report = require(path_constants.schemas.two.report);
const Review = require(path_constants.schemas.two.review);
const User = require(path_constants.schemas.two.user);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   ADMIN - USER PROFILE*/
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      res.redirect("/");
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

module.exports = router;
