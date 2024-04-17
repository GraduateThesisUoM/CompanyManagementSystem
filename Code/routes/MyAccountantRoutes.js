const express = require("express");
const router = express.Router();

var mongoose = require('mongoose');

//Models
const Accountant  = require("../Schemas/Accountant");;
const Review  = require("../Schemas/Review");
const Request = require("../Schemas/Request");
const Company = require("../Schemas/Company");

const Notification = require("../Schemas/Notification");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

/*--------    ΜΥ ACCOUNTΑΝΤ */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const company = await Company.findOne({_id:req.user.company});
      if(company.companyaccountant.status == 'self_accountant'){
        if(company.companyaccountant){
          res.redirect('self-accountant');
        }
      }
      else{
        if(company.companyaccountant.status =="not_assigned" || company.companyaccountant.status =="fired"){
          if(req.user.companyOwner = 1){
            res.redirect('pick-accountant');
          }
          else{
            res.redirect('/?message="Access Denied"');
          }
        }
        else if (company.companyaccountant.status == "assigned"){
          const users_accountant = await Accountant.findOne({_id:new mongoose.Types.ObjectId(company.companyaccountant.id)});

          const users_requests = await Request.find({ sender_id :req.user._id, receiver_id :users_accountant._id});
          var accountant_review = await Review.findOne({company_id:company._id,reviewer_id: req.user._id, reviewed_id: users_accountant._id, type:"client"});
          if (accountant_review == null){
            accountant_review = new Review({
              company_id: company._id,
              reviewer_id: req.user._id,
              reviewed_id: users_accountant._id,
              rating: -1,
              registrationDate: ''
            });
          }
  
          res.render('user_pages/my_accountant.ejs', { user: req.user, accountant: users_accountant, review : accountant_review, requests : users_requests,
            notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
        }
        else{
          res.redirect('pick-accountant');
        }
                
      }
      //-----------------------------------------------------------
      /*
        
        

      */
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error='+err);
    }
});

module.exports = router;