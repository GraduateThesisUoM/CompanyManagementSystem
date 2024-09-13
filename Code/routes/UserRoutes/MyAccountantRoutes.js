const express = require("express");
const router = express.Router();

var mongoose = require('mongoose');

//Models
const Accountant  = require("../../Schemas/Accountant");;
const Review  = require("../../Schemas/Review");
const Node = require("../../Schemas/Node");
const Company = require("../../Schemas/Company");

const Notification = require("../../Schemas/Notification");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------    ΜΥ ACCOUNTΑΝΤ */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      if(generalFunctions.checkAccessRigts(req,res)){

        const company = await Company.findOne({_id:req.user.company});
        console.log(company)
        const company_accountant_node = await Node.findOne({_id:company.accountant});
        console.log(company_accountant_node)

        if(company_accountant_node == null ){
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

        //self accounant
        /*if(company_accountant_node.company_id == company_accountant_node.receiver_id){
          if(req.user.companyOwner = 1){
            res.redirect('self-accountant');
          }
          else{
            res.redirect('/?message="Access Denied"');
          }
        }*/
        //------------
        /*else{
          // has not accountant
          if(company.accountant =="not_assigned" || company_accountant_node.type2 =="firing" || company_accountant_node.status =="pending"){
            if(req.user.companyOwner = 1){
              res.redirect('pick-accountant');
            }
            else{
              res.redirect('/?message="Access Denied"');
            }
          }
          //has accountant
          else {
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
        }*/
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

module.exports = router;