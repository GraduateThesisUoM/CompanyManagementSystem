const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Notification = require(path_constants.schemas.two.notification);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);

//Create Notification Function
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
    console.log(req.session.accountant._id)
    var accountant = await Accountant.findOne({_id:req.session.accountant._id});

    if(req.body.user_action == "cancel_request"){

      console.log("Cancel accountant request");
      clientAccountantFunctions.cancel_hiring_req_to_accountant(company._id,req.user._id,accountant._id,);
      
    }
    else if(req.body.user_action == "sent_request"){
      console.log("Sent accountant request");

      await clientAccountantFunctions.send_hiring_req_to_accountant(company._id,req.user._id, accountant._id);
      
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