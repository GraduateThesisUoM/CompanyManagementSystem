const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

//Models

const Series = require(path_constants.schemas.two.series);
const Document = require(path_constants.schemas.two.document);


router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      console.log('EditDocRoutes---------------'); // Inspect what you are getting from the form

      var original = await Document.findOne({_id:req.body.doc_id});

      const lines_of_doc = {};
    for (let i = 0; i < req.body.num_of_rows; i++) {
      const quantity = parseInt(req.body[`quantity_${i}`], 10);
      const tax = parseFloat(req.body[`tax_${i}`]).toFixed(2);
      const lineItem = req.body[`doc_line_item_${i}`]; // Assuming lineItem should remain a string or ID
      const discount = parseFloat(req.body[`discount_${i}`]).toFixed(2);
      const price_of_unit = parseFloat(req.body[`price_of_unit_${i}`]).toFixed(2);
      lines_of_doc[i] = { quantity, tax, lineItem, discount, price_of_unit };
    }

      var new_doc = await generalFunctions.create_doc({
        series: req.body.doc_series,
        company: original.company,
        sender: req.user._id,
        receiver: req.body.customer_id,
        type: req.body.type2,
        retail_wholesale: req.body.wholesale_retail,
        warehouse: req.body.warehouse_id,
        generalDiscount: req.body.general_discount_amount,
        invoiceData: lines_of_doc,
      })
      original.next = new_doc._id;
      original.edited = 1;

      await original.save();
      
      return res.redirect('/view?type=docs&id='+new_doc._id+'&type2='+req.body.type2);
    } catch (error) {
      console.error("Error processing the transformation form:", error);
      // Handle the error (you could redirect to an error page or show an error message)
      return res.status(500).send("There was an error processing your request.");
    }
  });


  module.exports = router;
