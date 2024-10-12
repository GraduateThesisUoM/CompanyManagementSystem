const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require("../../constantsPaths");
const generalFunctions = require("../../GeneralFunctions");

//Models
const Report = require(path_constants.schemas.two.report);
const User = require(path_constants.schemas.two.user);
const Company = require(path_constants.schemas.two.company);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

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
