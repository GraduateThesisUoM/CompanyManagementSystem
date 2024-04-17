const express = require("express"); 
const router = express.Router();

var mongoose = require('mongoose');


//Models
const Request = require("../Schemas/Request");
const Accountant = require("../Schemas/Accountant");
const Company = require("../Schemas/Company");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const company = await Company.findOne({_id:req.user.company});
      const users_accountant = await Accountant.findOne({_id:new mongoose.Types.ObjectId(company.companyaccountant.id)});

      const newRequest = new Request({
        company_id: company._id,
        sender_id: req.user._id,
        receiver_id: users_accountant._id,
        type: req.body.request_type,
        title: req.body.request_title,
        text: req.body.request_text,
        due_date : req.body.request_due_date
      });

      if(req.body.request_due_date != ""){
        newRequest.due_date = req.body.request_due_date;
      }
      newRequest.save();
      
      console.log('Reuest created successfully');
      res.redirect('/my-accountant');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error=' + err);
    }
});

module.exports = router;