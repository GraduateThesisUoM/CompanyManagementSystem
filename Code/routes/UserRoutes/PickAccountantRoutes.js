const express = require("express");
const router = express.Router();

//Models
const Accountant  = require("../../Schemas/Accountant");
const Review  = require("../../Schemas/Review");
const Notification = require("../../Schemas/Notification");
const Company  = require("../../Schemas/Company");
const Node  = require("../../Schemas/Node");

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

/*--------   PICK ACCOUNTANT */
router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const accountants = await Accountant.find({}); // Fetch all accountants from the database
      accountants.sort((a, b) => a.firstName.localeCompare(b.firstName));
      const company = await Company.findOne({_id:req.user.company});
      console.log("Pick Accountant  Company:"+company)
      var company_node = await Node.findOne({_id:company.accountant});
      console.log("Pick Accountant  Company Node:"+company_node)
      if (company_node == null){
        company_node = {
          company_id: company._id
        }
      }
  
      const ratings = [];
  
      for (const accountant of accountants){
        var average_rating = 0
      
        const reviews = await Review.find({reviewed_id: accountant._id, type: "client"});
  
        for (const review of reviews){
          average_rating = average_rating + review.rating;
        }
        if(reviews.length > 0){
          ratings.push((average_rating / reviews.length).toFixed(1));
        }
        else{
          ratings.push("-");
        }
        
      }
  
      res.render('user_pages/pick_accountant.ejs', { user: req.user,company:company,company_node:company_node, accountants: accountants, ratings: ratings,
        notification_list: await Notification.find({$and:[{user_id: req.user.id} , {status: "unread"}]})});
    } catch (err) {
      console.error('Error fetching accountants:', err);
      res.redirect('/error?origin_page=pick-accountant&error=' + err);
    }
});
  
router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFF");
      const accountant = await Accountant.findOne({_id:req.body.accountant_id});
      req.session.accountant = accountant;
      console.log(req.session.accountant );
      res.redirect('/preview-accountant');
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=pick-accountant&error='+err);
    }
});

module.exports = router;
  