const express = require("express");
const router = express.Router();

var mongoose = require("mongoose");

const path_constants = require("../../constantsPaths");

//Models
const Company = require(path_constants.schemas.two.company);
const Accountant = require(path_constants.schemas.two.accountant);
const Node = require(path_constants.schemas.two.node);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------    ΜΥ Company */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
        const data = {
          user: req.user,
          company: await Company.findOne({ _id: req.user.company }),
        };
        res.render("user_pages/my_company.ejs", data);
      
    } else {
      res.redirect("/error?origin_page=my-company&error=acces denid");
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
      const node = await Node.findOne({
        company: company._id,
        type: 10,
        status: 3,//pending
        next:"-"
      });
      node.status = 5;
      await node.save();
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
      const newReport = await generalFunctions.create_node(
        {
          company: company,
          sender_id: req.user.id,
          type: 10,
      }
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

        const company = await Company.findOne({ _id: req.user.company });
        company.name = req.body.new_company_name;
        company.logo = req.body.new_company_logo;
        await company.save();
        res.redirect("/my-company?message=data-updated");
      
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

router.post(
  "/export",
  Authentication.checkAuthenticated,
  async (req, res) => {
    try {
      console.log("export");
      generalFunctions.importExport('export',req.user.company);
      res.redirect(
        "/my-company?f=export&message=exported"
      );
    } catch (e) {
      console.error(e);
      res.redirect("/error?origin_page=my-company&error=" + e);
    }
  }
);

module.exports = router;
