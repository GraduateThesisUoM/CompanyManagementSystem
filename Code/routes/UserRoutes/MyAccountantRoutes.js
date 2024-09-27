const express = require("express");
const router = express.Router();

var mongoose = require('mongoose');

//File with the paths
const path_constants = require('../../constantsPaths');

//Models
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Node = require(path_constants.schemas.two.node);
const Company = require(path_constants.schemas.two.company);
const Notification = require(path_constants.schemas.two.notification);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get General Functions
const generalFunctions = require( path_constants.generalFunctions_folder.two);
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);


/*--------    ΜΥ ACCOUNTΑΝΤ */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      if(generalFunctions.checkAccessRigts(req,res)){

        const company = await Company.findOne({_id:req.user.company});
        console.log(company)
        const company_accountant_node = await Node.findOne({_id:company.accountant});
        console.log(company_accountant_node)

        if(company_accountant_node == null ||
          (company_accountant_node.type2 != 'hiring' && company_accountant_node.status != 'canceled') ||
          (company_accountant_node.type2 != 'firing' && company_accountant_node.status != 'executed')
        ){
          if(req.user.companyOwner == 1){
            res.redirect('pick-accountant');
          }
          else{
            res.redirect('/?message="Access Denied"');
          }
        }
        else{
          if(company_accountant_node.company_id == company_accountant_node.receiver_id){
            if(req.user.companyOwner == 1){
              res.redirect('self-accountant');
            }
            else{
              res.redirect('/?message="Access Denied"');
            }
          }
          else{
            const users_accountant = await Accountant.findOne({_id:company_accountant_node.receiver_id});
            if(users_accountant == null ){
              if(req.user.companyOwner == 1){
                res.redirect('pick-accountant');
              }
              else{
                res.redirect('/?message="Access Denied"');
              }
            }
            else{
              const users_accountant = await Accountant.findOne({_id:company_accountant_node.receiver_id});
              const users_nodes = await Node.find({ sender_id :req.user._id, company_id:company._id , receiver_id :users_accountant._id, type:'request'});
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

              const data = {
                user: req.user,
                accountant: users_accountant,
                review : accountant_review,
                nodes : users_nodes,
                notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})
              }
              res.render('user_pages/my_accountant.ejs', data);
            }
          }
        }
      }
      else{
        res.redirect('/error?origin_page=my-accountant&error=acces denid');
      }
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error='+err);
    }
});

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
  try {
    const company = await Company.findOne({_id:req.user.company});
    const company_node = await Node.findOne({_id:company.accountant});
    
    
    //const accountant = await Accountant.findOne({_id:req.session.accountant._id});

    clientAccountantFunctions.fire_accountant(company._id,req.user._id,company_node.receiver_id);

    res.redirect('/my-accountant?refresh=true');
  }
  catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?origin_page=pick-accountant&error='+err);
  }
});

module.exports = router;