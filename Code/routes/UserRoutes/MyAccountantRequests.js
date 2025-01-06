const express = require("express"); 
const router = express.Router();

var mongoose = require('mongoose');
const path_constants = require('../../constantsPaths');

//Models
const Node = require(path_constants.schemas.two.node);
const Accountant = require(path_constants.schemas.two.accountant);
const Company = require(path_constants.schemas.two.company);

const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get General Functions
const generalFunctions = require( path_constants.generalFunctions_folder.two);
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const company = await Company.findOne({_id:req.user.company});
      const company_accountant_node =  await generalFunctions.get_accountant_node(company._id)

      const newNode = await generalFunctions.create_node({
        company: company._id,
        sender_id: req.user._id,
        receiver_id: company_accountant_node.receiver_id,
        type: 3,
        type2: req.body.request_type,
        title: req.body.request_title,
        text: req.body.request_text,
        due_date: req.body.request_due_date
      });


      
      console.log('Reuest created successfully');
      res.redirect('/my-accountant');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?error=' + err);
    }
});

module.exports = router;