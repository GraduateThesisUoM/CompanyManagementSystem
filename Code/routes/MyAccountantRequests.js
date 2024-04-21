const express = require("express"); 
const router = express.Router();

var mongoose = require('mongoose');


//Models
const Node = require("../Schemas/Node");
const Accountant = require("../Schemas/Accountant");
const Company = require("../Schemas/Company");


//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const company = await Company.findOne({_id:req.user.company});
      const company_accountant_node = await Node.findOne({_id:company.accountant});

      const users_accountant = await Accountant.findOne({_id:company_accountant_node.receiver_id});

      const newNode = new Node({
        company_id: company._id,
        sender_id: req.user._id,
        receiver_id: users_accountant._id,
        type: 'request',
        type2: req.body.request_type,
        title: req.body.request_title,
        text: req.body.request_text,
        due_date : req.body.request_due_date
      });

      if(req.body.request_due_date != ""){
        newNode.due_date = req.body.request_due_date;
      }
      newNode.save();
      
      console.log('Reuest created successfully');
      res.redirect('/my-accountant');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error=' + err);
    }
});

module.exports = router;