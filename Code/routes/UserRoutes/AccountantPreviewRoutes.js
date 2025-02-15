const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const Client = require(path_constants.schemas.two.client);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);

const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

/*--------   ACCOUNTANT PREVIEW */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
  try{
    console.log("AccountantPreviewRoutes")
    const accountant = await Accountant.findOne({_id:req.query.id})
    const access = generalFunctions.checkAccessRigts(req,res);
    if(access.response){
      const reviews = await Review.find({reviewed_id:accountant._id, type: 1} )//"client"
      var reviews_data = [];
      for( r of reviews){
        reviews_data.push({
          company : r.company,
          reviewer_id : r.reviewer_id,
          reviewed_id : r.reviewed_id,
          text : r.text,
          rating : r.rating,
          type : r.type,
          registrationDate : r.registrationDate,
          person : await Client.findOne({_id: r.reviewer_id}),
          company_obj : await Company.findOne({_id: r.company})
        })
      }
      const clients = await Node.find({type:1,type2:3,status:2})
      const company = await Company.findOne(_id=req.user.company);
      var company_node = await Node.findOne({company:req.user.company,type:1,next:'-'}).sort({ registrationDate: -1 });
      console.log(company_node)
      if(company_node == null){
        company_node = {
          receiver_id: accountant._id,
          status: 6
        }
      }
    
      const data = { accountant: accountant,
        company: company,
        num_of_clients : clients.length,
        company_node:company_node,
         user: req.user,
         //reviews: reviews
         reviews: reviews_data
        }
    
    
        res.render('user_pages/preview_accountant.ejs', data );  
    }
    else{
      res.redirect('/error?error='+access.error);
    }
  }
  catch(e){
    console.error('Error on create page:', e);
    res.redirect('/error?error='+e);
  }
});



router.post('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    console.log("AccountantPreviewRoutes")
    
    const company = await Company.findOne({_id:req.user.company});
    const company_node = await generalFunctions.get_accountant_node(company._id);
    console.log(company_node);

    
    if(company_node ){
      console.log('2')
      clientAccountantFunctions.fire_accountant(company._id,req.user._id)
    }
    const accountant = await Accountant.findOne({_id:req.body.accountant_id})

    if(req.body.user_action == "cancel_request"){

      console.log("Cancel accountant request");
      clientAccountantFunctions.cancel_hiring_req_to_accountant(company._id,req.user._id);
      
    }
    else if(req.body.user_action == "sent_request"){
      console.log("Sent accountant request "+accountant._id);

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