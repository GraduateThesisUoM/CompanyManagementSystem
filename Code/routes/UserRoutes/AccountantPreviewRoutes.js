const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../../Schemas/Accountant");
const Review  = require("../../Schemas/Review");
const Notification = require("../../Schemas/Notification");
const Company  = require("../../Schemas/Company");
const Node = require("../../Schemas/Node");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

//Create Notification Function
const create_notification = require("../../CreateNotification");
const clientAccountantFunctions = require("../../ClientAccountantFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------   ACCOUNTANT PREVIEW */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  try{
    if(generalFunctions.checkAccessRigts(req)){
      const reviews = await Review.find({reviewed_id:req.session.accountant._id, type: "client"} )
      const company = await Company.findOne(_id=req.user.company);
      var company_node = await Node.findOne({_id:company.accountant});
      if(company_node == null){
        company_node = {
          receiver_id: req.session.accountant._id,
          status:'temp'
        }
      }
    
      const data = { accountant: req.session.accountant,company: company,company_node:company_node, user: req.user, reviews: reviews,
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}) }
    
        generalFunctions.checkAccessRigts(req.user,'user_pages/preview_accountant.ejs',data,res);
    
      res.render('user_pages/preview_accountant.ejs', { accountant: req.session.accountant,company: company,company_node:company_node, user: req.user, reviews: reviews,
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]}) });  
    }
  }
  catch(e){
    console.error('Error on create page:', e);
    res.redirect('/error?origin_page=/preview-accountant&error='+e);
  }
});



router.post('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    const company = await Company.findOne({_id:req.user.company});
    const company_node = await Node.findOne({_id:company.accountant});
    
    if(company.accountant !="not_assigned" && company_node.status !="fired"){

      clientAccountantFunctions.fire_accountant(company._id,req.user._id)
    }
    
    const accountant = await Accountant.findOne({_id:req.session.accountant._id});

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
      /*accountant.clients.push({id: req.user._id, status: "pending"});
      await accountant.save();*/

      /*company.companyaccountant = accountant._id;
      company.companyaccountant.status = "pending";
      await company.save();*/

      //create_notification(company.companyaccountant.id, req.user._id, "hiring-request-notification");

      clientAccountantFunctions.send_hiring_req_to_accountant(company._id,req.user._id, accountant._id);
      
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