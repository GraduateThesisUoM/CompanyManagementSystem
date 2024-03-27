const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../Schemas/Accountant");
const Review  = require("../Schemas/Review");
const Notification = require("../Schemas/Notification");
const Company  = require("../Schemas/Company");
const Request = require("../Schemas/Request");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

//Create Notification Function
const create_notification = require("../CreateNotification");
const send_hiring_req_to_accountant =require("../SendHiringReqToAccountan")

/*--------   ACCOUNTANT PREVIEW */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  const reviews = await Review.find({reviewed_id:req.session.accountant._id, type: "client"} )
  const company = await Company.findOne(_id=req.user.company);
  res.render('user_pages/preview_accountant.ejs', { accountant: req.session.accountant,company: company, user: req.user, reviews: reviews,
    notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}) });
});



router.post('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    const company = await Company.findOne(_id=req.user.company);
    
    if(company.companyaccountant.status !="not_assigned"){
      const last_accountant = await Accountant.findOne({_id:company.companyaccountant.id});
      for (let i = 0; i < last_accountant.clients.length; i++){
        if( last_accountant.clients[i].id.equals(req.user._id)){
          last_accountant.clients.splice(i, 1);
          await last_accountant.save();
          break;
        }
      }
    }
    
    const accountant = await Accountant.findOne({_id:req.session.accountant._id});
    console.log(accountant);

    if(req.body.user_action == "cancel_request"){
      console.log("Cancel accountant request");
      company.companyaccountant.id = 'not_assigned';
      company.companyaccountant.status = "not_assigned";
      await company.save();

      const hiring_request = await Request.findOne({sender_id:company._id,receiver_id:accountant._id,type:'hiring',status:'pending'});
      hiring_request.status = "canceled";
      await hiring_request.save();
    }
    else if(req.body.user_action == "sent_request"){
      console.log("Sent accountant request");
      accountant.clients.push({id: req.user._id, status: "pending"});
      await accountant.save();

      company.companyaccountant.id = accountant._id;
      company.companyaccountant.status = "pending";
      await company.save();

      create_notification(company.companyaccountant.id, req.user._id, "hiring-request-notification");

      send_hiring_req_to_accountant(company._id, accountant._id);
      
    } 
    await req.user.save();
    res.redirect('/pick-accountant?message=success_send_req_to_accountant');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=pick-accountant&error='+err);
  }
});

module.exports = router;