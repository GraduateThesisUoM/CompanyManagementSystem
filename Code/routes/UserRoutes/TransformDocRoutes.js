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
      console.log('create-doc-transform---------------'); // Inspect what you are getting from the form
      console.log(req.body.series_to);
      console.log(req.body.doc_id);

      var original = await Document.findOne({_id:req.body.doc_id});
      var to_series = await Series.findOne({_id:req.body.series_to});
      to_series.count = to_series.count + 1;
      await to_series.save();
      
      var new_doc = new Document(original.toObject());
      new_doc._id = undefined; // Remove `_id` so MongoDB generates a new one
      new_doc.series = to_series._id;
      new_doc.doc_num = to_series.count;
      await new_doc.save();

      original.next = new_doc._id;
      await original.save();

      return res.redirect(req.body.url);
    } catch (error) {
      console.error("Error processing the transformation form:", error);
      // Handle the error (you could redirect to an error page or show an error message)
      return res.status(500).send("There was an error processing your request.");
    }
  });


  module.exports = router;
