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
      console.log("MyAccountantRoutes")
      const access = generalFunctions.checkAccessRigts(req,res);
      if(access.response){

        const company = await Company.findOne({_id:req.user.company});
        const company_accountant_node = await generalFunctions.get_accountant_node(company._id)

        console.log('company_accountant_node : '+company_accountant_node)

        //has not anountant
        if(company_accountant_node == null /*||
          (company_accountant_node.type2 != 'hiring' && company_accountant_node.status != 'canceled') ||
          (company_accountant_node.type2 != 'firing' && company_accountant_node.status != 'executed')*/
        ){
          console.log('2')
          if(req.user.companyOwner == 1){
            res.redirect('pick-accountant');
          }
          else{
            res.redirect('/?message="Access Denied"');
          }
        }
        else{//has  anountant
          //self acountant
          if(company_accountant_node.company.equals(company_accountant_node.receiver_id)){
            console.log('3')
            if(req.user.companyOwner == 1){
              console.log('self-accountant')
              res.redirect('self-accountant');
            }
            else{
              res.redirect('/?message="Access Denied"');
            }
          }
          else{
            console.log('4')
            const users_accountant = await Accountant.findOne({_id:company_accountant_node.receiver_id});
            console.log("users_accountant : "+users_accountant)
            if(users_accountant == null ){
              if(req.user.companyOwner == 1){
                res.redirect('pick-accountant');
              }
              else{
                res.redirect('/?message="Access Denied"');
              }
            }
            else{
              var accountant_review = await Review.findOne({
                company:company._id,
                reviewer_id: req.user._id,
                reviewed_id: company_accountant_node.receiver_id,
                type:1});

              if (accountant_review == null){
                accountant_review = new Review({
                  company_id: company._id,
                  reviewer_id: req.user._id,
                  reviewed_id: company_accountant_node.receiver_id,
                  rating: 0,
                  registrationDate: ''
                });
              }

                var nodes = await Node.find({
                  company: company._id,
                  $or: [{ receiver_id: req.user._id }, { sender_id: req.user._id }],
                  type: 3,
                  next: '-',
                  type2: { $in: [31, 32, 33, 34,3] }
                }).sort({ registrationDate: -1 }).limit(5);

                nodes = nodes.map(node => {
                  return {
                    _id: node._id,
                    type: generalFunctions.get_type2(node.type2),
                    title: node.title,
                    text: node.text,
                    due_date: generalFunctions.formatDate(node.due_date),
                    status: generalFunctions.get_status(node.status),
                    registrationDate: generalFunctions.formatDate(node.registrationDate)
                  }
                })

                const data = {
                user: req.user,
                accountant: users_accountant,
                review: accountant_review,
                nodes : nodes
                }

              res.render('user_pages/my_accountant.ejs', data);
            }
          }
        }
      }
      else{
        res.redirect('/error?error='+access.error);
      }
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?error='+err);
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