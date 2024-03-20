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
        if(company.companyaccountant.id =="not_assigned"){
          if(req.user.companyOwner = 1){
            res.redirect('pick-accountant');
          }
          else{
            res.redirect('/?message="ggg"');
          }
        }
        else{
          console.log(company);
          console.log(company.companyaccountant.id);
          //const users_accountant = await Accountant.findOne({_id:new mongoose.Types.ObjectId('65ef5180dadc35321e27658d')});
          const users_accountant = await Accountant.findOne({_id:'65ef5180dadc35321e27658d'});
          console.log(users_accountant);
  
          res.render('user_pages/my_accountant.ejs', { user: req.user, accountant: users_accountant, review : accountant_review, requests : users_requests,
            notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
        }
                
      }
      //-----------------------------------------------------------
      /*if (req.user.myaccountant.status == "self_accountant"){
        res.redirect('self-accountant');
      }
      else if (req.user.myaccountant.status == "assigned"){
        const users_accountant = await Accountant.findOne({_id:req.user.myaccountant.id});
        const users_requests = await Request.find({ sender_id :req.user._id, receiver_id :req.user.myaccountant.id});
        var accountant_review = await Review.findOne({reviewer_id: req.user._id, reviewed_id: req.user.myaccountant.id, type:"client"});
        if (accountant_review == null){
          accountant_review = new Review({
            reviewer_id: req.user._id,
            reviewed_id: req.user.myaccountant.id,
            rating: -1,
            registrationDate: ''
          });
        }
  
        res.render('user_pages/my_accountant.ejs', { user: req.user, accountant: users_accountant, review : accountant_review, requests : users_requests,
          notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
      }
      else{
        res.redirect('pick-accountant');
      }*/
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error='+err);
    }
});

module.exports = router;