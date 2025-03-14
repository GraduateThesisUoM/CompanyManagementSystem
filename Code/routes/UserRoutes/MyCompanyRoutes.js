const express = require("express");
const router = express.Router();

var mongoose = require("mongoose");

const path_constants = require("../../constantsPaths");

//Models
const Company = require(path_constants.schemas.two.company);
const Document = require(path_constants.schemas.two.document);
const Node = require(path_constants.schemas.two.node);
const Series = require(path_constants.schemas.two.series);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------    ΜΥ Company */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      if (req.query.action === "export") {
        const companyData = {  
          companyId: req.user.company,
          data: {}  
        };
        for (const key in generalFunctions.schemaMap) {
          if (Object.prototype.hasOwnProperty.call(generalFunctions.schemaMap, key)) {
            companyData.data[key] = await generalFunctions.schemaMap[key]
              .find({ company: req.user.company })
              .lean()
              .exec();
          }
        }
      
        return res.json(companyData);
      }
      var docs = await Document.find({company: req.user.company,next:'-'});
      var credit = 0;
      var debit = 0;
        for (let d of docs) {
            const series = await Series.findOne({ _id: d.series, company: d.company });
            if( series.effects_account == 1){
              credit += generalFunctions.get_docs_value(d);
            }
            else if( series.effects_account == -1){
              debit += generalFunctions.get_docs_value(d);
            }
        }
        console.log(credit)
        console.log(debit)
        const data = {
          user: req.user,
          company: await Company.findOne({ _id: req.user.company }),
          credit: parseFloat(credit).toFixed(2),
          debit: parseFloat(debit).toFixed(2)
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
      /*const newReport = await generalFunctions.create_node(
        {
          company: company,
          sender_id: req.user.id,
          type: 10,
      }
      );
      console.log(newReport);*/
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
      generalFunctions.importExport('export','company',req.user.company);
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
