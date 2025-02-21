const express = require("express");
const router = express.Router();
const url = require('url');

const path_constants = require("../../constantsPaths");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

//Models
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);
const Client = require(path_constants.schemas.two.client);
const Accountant = require(path_constants.schemas.two.accountant);


router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    console.log("TransferRoutes Get");
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      const warehouses = await Warehouse.find({company:req.user.company,status:1});
      const items = await Item.find({company:req.user.company,status:1});
      const persons = await Person.find({company:req.user.company,status:1})
      var location_to = [];
      for( w of warehouses){
        location_to.push({
          _id:w._id,
          name:w.title
        });
      }
      for( p of persons){
        location_to.push({
          _id:p._id,
          name:p.lastName + " " + p.firstName
        });
      }
      var data = {
        user : req.user,
        locations:location_to,
        items:items,
      }
      res.render(path_constants.pages.transfer.view(), data);
        
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error saving user:", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    console.log("TransferRoutes Post");
    const lines_of_doc = [];
    for (let i = 0; i < req.body.count; i++) {
      if (req.body[`item_select_${i}`] !== undefined) {
        lines_of_doc.push({ 
          quantity : req.body[`item_q_${i}`],
          lineItem : req.body[`item_select_${i}`],
          tax : 0,
          discount : 0,
          price_of_unit : 0  
        });
      }
    }
    console.log(lines_of_doc);
    var series = await Series.findOne({my_id:'777',status:1})
    var doc = await generalFunctions.create_doc( {
      company: req.user.company,
      sender: req.user._id,
      receiver: req.body.to_select,
      series: series._id,
      type: 3,
      retail_wholesale: 3,
      warehouse: req.body.from_select,
      generalDiscount: 0,
      invoiceData: lines_of_doc
    })
    /*
    company: data.company,
      sender: data.sender,
      receiver: data.receiver,
      series: data.series,
      type: data.type,
      doc_num: series.count,
      retail_wholesale:data.retail_wholesale,
      warehouse : data.warehouse,
      generalDiscount: data.generalDiscount,
      invoiceData: data.invoiceData
       */
    return res.redirect(`/view?type=transfers&id=${doc._id}`);

  } catch (e) {
    console.error(e);
    return res.redirect("/error?origin_page=/&error=" + encodeURIComponent(e.message));
  }
});


module.exports = router;
