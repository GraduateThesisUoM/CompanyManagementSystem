const express = require("express");
const router = express.Router();

//File with the paths
const path_constants = require("../../constantsPaths");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);
//Models
const Series = require(path_constants.schemas.two.series);
const Notification = require(path_constants.schemas.two.notification);


/*--------   Create */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    var secondary_data = [];
    if (access.response) {
      if (
        req.user.type == "admin" &&
        req.session.selected_client == undefined
      ) {
        res.redirect("/clients");
      } else {
        if(req.query.create == 'series'){
          secondary_data = await Series.find({company:req.user.company, status:1,type:req.query.type})
          console.log(secondary_data);
        }
        const data = {
          user: req.user,
          companyId: req.user.company,
          notification_list: await Notification.find({
            $and: [{ user_id: req.user.id }, { status: "unread" }],
          }),
          secondary_data : secondary_data
        };
        if (req.user.type == "admin") {
          data.clientId = req.session.selected_client._id;
        }
        res.render(path_constants.pages.create.view(), data);
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
    console.log(company)
    console.log(req.body.create_type);

    var created_obj;//Declare Variable

    if (req.body.create_type == "Warehouse") {
      data = {
        company :company._id,
        title: req.body.warehouse_title,
        location:req.body.warehouse_address
      }
      created_obj = await generalFunctions.createWarehouse(
        data
      );
    } else if (req.body.create_type == "items") {
      data = {
        company: company._id,
        title: req.body.items_title,
        description: req.body.items_description,
        type: req.body.obj_type,
        price_r: req.body.items_price_r,
        price_w: req.body.items_price_w,
        discount_r: req.body.items_price_r_disc,
        discount_w: req.body.items_price_w_disc,
        tax_r: req.body.items_tax_w,
        tax_w: req.body.items_tax_w,
      };
      created_obj = await generalFunctions.createItem(data);
    } else if (req.body.create_type == "series") {
      console.log("series_sealed"+req.body.series_sealed)
      data = {
        company: company._id,
        title: req.body.series_title,
        acronym: req.body.series_acronym,
        type: req.body.obj_type,
        sealed: req.body.series_sealed,
        effects_warehouse: req.body.effects_warehouse_y_n_input,
        effects_account : req.body.effects_accounts_y_n_input ,
        transforms_to : req.body.transforms_y_n_input
      };
      created_obj = await generalFunctions.createSeries(data);
    } else if (req.body.create_type == "persons") {
      data = {
        type: req.body.obj_type,
        firstName: req.body.person_firstName,
        lastName: req.body.person_lastName,
        email: req.body.person_email,
        afm: req.body.person_vat,
        phone: req.body.person_phone,
        company: company,

        address: req.body.person_address,
        district: req.body.person_district,
        city: req.body.person_city,
        country: req.body.person_country,
        zip: req.body.person_zip
      };
      console.log('dddd')
      created_obj = await generalFunctions.create_person(data);
    }
    else{
      console.log("Type not found CreateRoutes.js")
    }
    //res.redirect("/list?searchfor="+req.body.create_type+"&message="+req.body.create_type+" created successfully");
    res.redirect("/view?type="+req.body.create_type+"&id="+created_obj._id+"&message="+req.body.create_type+" created successfully");
  } catch (e) {
    console.error("** " + e + " **");
    res.redirect("/error?origin_page=create&error=" + e);
  }
});

module.exports = router;
