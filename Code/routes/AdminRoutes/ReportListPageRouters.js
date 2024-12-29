const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Notification = require(path_constants.schemas.two.notification);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const Report = require(path_constants.schemas.two.report);
const User = require(path_constants.schemas.two.report);



//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);

//Create Notification Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

/*--------   REPORT LIST PAGE */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      res.render("admin_pages/report_list_page.ejs", {
        user: req.user,
        pending_reports: await Report.find({ status: "pending" }),
        reviewed_reports: await Report.find({ status: "reviewed" }),
        dismissed_reports: await Report.find({ status: "dismissed" }),
        company_list: await Company.find(),
        user_list: await User.find(),
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

module.exports = router;
