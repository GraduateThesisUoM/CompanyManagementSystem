const express = require("express");
const router = express.Router();

//Models
const Notification = require("../../Schemas/Notification");

//Authentication Function
const Authentication = require("../../AuthenticationFunctions");
//General Functions
const generalFunctions = require("../../GeneralFunctions");
//File with the paths
const constants = require("../../constantsPaths");

/*--------   Create */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      if (
        req.user.type == "admin" &&
        req.session.selected_client == undefined
      ) {
        res.redirect("/clients");
      } else {
        const data = {
          user: req.user,
          companyId: req.user.company,
          notification_list: await Notification.find({
            $and: [{ user_id: req.user.id }, { status: "unread" }],
          }),
        };
        if (req.user.type == "admin") {
          data.clientId = req.session.selected_client._id;
        }
        res.render(constants.pages.create.view(), data);
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
  console.log("Create Post");

  try {
    var company = "";
    var data = {};
    if (req.user.type == "admin") {
      company = req.session.selected_client._id;
    } else {
      company = req.user.company;
    }
    console.log(req.body.create_type);
    if (req.body.create_type == "Warehouse") {
      data = {
        companyid :company._id,
        title: req.body.warehouse_title,
        location:req.body.warehouse_address
      }
      const warehouse = await generalFunctions.createWarehouse(
        data
      );
      console.log(warehouse);
    } else if (req.body.create_type == "items") {
      data = {
        companyID: company._id,
        title: req.body.items_title,
        description: req.body.items_description,
        price_r: req.body.items_price_r,
        price_w: req.body.items_price_w,
        discount_r: req.body.items_price_r_disc,
        discount_w: req.body.items_price_w_disc,
        tax_r: req.body.items_tax_w,
        tax_w: req.body.items_tax_w,
      };
      const item = await generalFunctions.createItem(data);
      console.log(item);
    } else if (req.body.create_type == "series") {
      const isSealed = req.body.series_sealed === "on" ? 1 : 0;
      console.log(isSealed);
      data = {
        companyID: company._id,
        title: req.body.series_title,
        acronym: req.body.series_acronym,
        type: req.body.series_type,
        sealed: isSealed,
      };
      const series = await generalFunctions.createSeries(data);
      console.log(series);
    } else if (req.body.create_type == "person") {
      data = {
        type: req.query.type,
        firstName: req.body.person_firstName,
        lastName: req.body.person_lastName,
        email: req.body.person_email,
        afm: req.body.person_vat,
        phone: req.body.person_phone,
        company: company,
      };
      const person = await generalFunctions.create_person(data);
      console.log(person);
    }
    else{
      console.log("Type not found CreateRoutes.js")
    }
    res.redirect("/list?searchfor="+req.body.create_type+"&message="+req.body.create_type+" created successfully");
  } catch (e) {
    console.error("** " + e + " **");
    res.redirect("/error?origin_page=create&error=" + e);
  }
});

module.exports = router;
