const express = require("express");
const router = express.Router();

var mongoose = require("mongoose");

const path_constants = require("../../constantsPaths");

//Models
const Company = require(path_constants.schemas.two.company);
const Accountant = require(path_constants.schemas.two.accountant);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Report = require(path_constants.schemas.two.report);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------    ΜΥ Company */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      if (generalFunctions.checkAccessRigts(req, res)) {
        const data = {
          user: req.user,
          company: await Company.findOne({ _id: req.user.company }),
          notification_list: await Notification.find({
            $and: [{ user_id: req.user.id }, { status: "unread" }],
          }),
        };
        res.render("user_pages/my_company.ejs", data);
      } else {
        res.redirect("/error?origin_page=my-company&error=acces denid");
      }
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.user.company });
    if (company.license.requested > 0 || company.license.for_removal > 0) {
      const report = await Report.findOne({
        reporter_id: company._id,
        reporter_id: company._id,
        reason: "licence",
        status: "pending",
      });
      //report.status = 'canceled';
      if (report != null) {
        if (report.status == "pending") {
          report.status = "canceled";
          await report.save();
        }
      }
    }

    if (req.body.requested_license == -1) {
      company.license.requested = 0;
      company.license.for_removal = 0;
      //remove newReport
      await company.save();
      console.log("cansel");
    } else {
      if (req.body.requested_license > 0) {
        console.log("add");
        company.license.requested = req.body.requested_license;
        //company.license.for_removal = 0;
        await company.save();
      } else if (req.body.remove_license > 0) {
        console.log("remove");
        /*company.license.requested = 0;
          company.license.for_removal = req.body.remove_license;*/
        company.license.requested = req.body.remove_license * -1;
        await company.save();
      }
      const newReport = await generalFunctions.createReport(
        company._id,
        company._id,
        "licence",
        "-"
      );
      console.log(newReport);
    }

    res.redirect("/my-company");
  } catch (e) {
    console.error(e);
    res.redirect("/error?origin_page=my-company&error=" + e);
  }
});

router.post(
  "/edit-company",
  Authentication.checkAuthenticated,
  async (req, res) => {
    try {
      const access = generalFunctions.checkAccessRigts(req, res);
      if (access.response) {
        const company = await Company.findOne({ _id: req.user.company });
        company.name = req.body.new_company_name;
        company.logo = req.body.new_company_logo;
        await company.save();
        res.redirect("/my-company?message=data-updated");
      } else {
        res.redirect("/error?error=" + access.error);
      }
    } catch (e) {
      console.error(e);
      res.redirect("/error?error=" + e);
    }
  }
);

router.post(
  "/change-company-status",
  Authentication.checkAuthenticated,
  async (req, res) => {
    try {
      const company = await Company.findOne({ _id: req.user.company });
      company.status = Math.abs(company.status - 1);
      await company.save();
      res.redirect(
        "/my-company?message=company-status-" + Math.abs(company.status - 1)
      );
    } catch (e) {
      console.error(e);
      res.redirect("/error?origin_page=my-company&error=" + e);
    }
  }
);

module.exports = router;
