const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");

//Models
const Company = require(path_constants.schemas.two.company);
const Accountant = require(path_constants.schemas.two.accountant);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Warehouse = require(path_constants.schemas.two.warehouse);
const User = require(path_constants.schemas.two.user);
const Person = require(path_constants.schemas.two.person);
const Item = require(path_constants.schemas.two.item);
const Series = require(path_constants.schemas.two.series);

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      // for delete let person = req.query.type === "buy" ? "supplier" : "customer";

      var list_warehouses =  await Warehouse.find({
        companyid: req.user.company,
        status: 1,
      });
      list_warehouses = list_warehouses.map((warehouse) => ({
        id: warehouse._id,
        title: warehouse.title,
      }));
      console.log(list_warehouses)

      var list_persons = await Person.find({
        company: req.user.company,
        type: req.query.type,
        status: 1,
      });
      list_persons = list_persons.map((item) => ({
        id: item._id,
        firstName: item.firstName,
        lastName: item.lastName,
      }));

      var list_items = await Item.find({
        companyID: req.user.company,
        status: 1,
        type: req.query.type
      });

      var list_series = await Series.find({
        companyID: req.user.company,
        status: 1,
        type: req.query.type,
      });

      var data = {
        user: req.user,
        persons: list_persons,
        warehouses : list_warehouses,
        items: list_items,
        series: list_series,
        notification_list: await Notification.find({
          $and: [{ user_id: req.user.id }, { status: "unread" }],
        }),
      };
      res.render(path_constants.pages.create_doc.view(), data);
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", async (req, res) => {
  try {
    const lines_of_doc = {};
    for (let i = 0; i < req.body.num_of_rows; i++) {
      const quantity = parseInt(req.body[`quantity_${i}`], 10);
      const tax = parseFloat(req.body[`tax_${i}`]).toFixed(2);
      const lineItem = req.body[`doc_line_item_${i}`]; // Assuming lineItem should remain a string or ID
      const discount = parseFloat(req.body[`discount_${i}`]).toFixed(2);
      const price_of_unit = parseFloat(req.body[`price_of_unit_${i}`]).toFixed(2);
      lines_of_doc[i] = { quantity, tax, lineItem, discount, price_of_unit };
    }
    console.log("-------------------------"+req.body.warehouse_id)
    const data = {
      company: req.user.company,
      sender: req.user._id,
      retail_wholesale : req.body.wholesale_retail,
      receiver: req.body.customer_id,
      warehouse : req.body.warehouse_id,
      type: req.body.doc_type,
      series: req.body.doc_series,
      generalDiscount: req.body.general_discount,
      invoiceData: lines_of_doc,
    };

    var doc = await generalFunctions.create_doc(data);

    res.redirect("/view?type=docs&id="+doc._id);
  } catch (e) {
    console.error(e);
    res.redirect(
      "/error?origin_page=create-doc&error=" + encodeURIComponent(e.message)
    );
  }
});

module.exports = router;
