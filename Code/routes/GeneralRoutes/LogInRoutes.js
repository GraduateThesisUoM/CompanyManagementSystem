const express = require("express");
const router = express.Router();

require("dotenv").config();

const bcrypt = require("bcrypt");
var mongoose = require("mongoose");

//File with the paths
const path_constants = require("../../constantsPaths");

const passport = require("passport");

const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Node = require(path_constants.schemas.two.node);
const Client = require(path_constants.schemas.two.client);
const Company = require(path_constants.schemas.two.company);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
//Get General Functions

const generalFunctions = require(path_constants.generalFunctions_folder.two);
const clientAccountantFunctions = require(path_constants
  .clientAccountantFunctions_folder.two);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   LOG IN */
router.get("/", Authentication.checkNotAuthenticated, async (req, res) => {
  //FOR TEST START
  if (req.query.restartdb === "export") {
    await generalFunctions.importExport('export');
  }
  else if (req.query.restartdb === "import") {
    await generalFunctions.importExport('import');
  }
  res.render("." + path_constants.pages.log_in.view());
});
router.post(
  path_constants.pages.index.url,
  Authentication.checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: path_constants.pages.index.url,
    failureRedirect: path_constants.pages.log_in.url,
    failureFlash: true,
  })
);

module.exports = router;
