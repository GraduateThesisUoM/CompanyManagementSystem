const express = require("express");
const router = express.Router();

var mongoose = require('mongoose');


//Models
const Review  = require("../../Schemas/Review");
const Accountant = require("../../Schemas/Accountant");
const Company = require("../../Schemas/Company");
const Node = require("../../Schemas/Node");


//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

//Create Notification Function
const create_notification = require("../../CreateNotification");

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const company = await Company.findOne({_id:req.user.company});
      const company_accountant_node = await Node.findOne({_id:company.accountant});

      const users_accountant = await Accountant.findOne({_id:company_accountant_node.receiver_id});

      let newReview;
      const review = await Review.findOne({
        company_id: company._id,
        reviewer_id: req.user._id,
        reviewed_id: users_accountant._id,
        type: "client",
      });
  
      if (review == null) {
        newReview = new Review({
          company_id: company._id,
          reviewer_id: req.user._id,
          reviewed_id: users_accountant._id,
          text: req.body.rating_textarea,
          type: "client",
          rating: req.body.rating_input,
        });
      } else {
        // Update the existing review's text and rating
        review.text = req.body.rating_textarea;
        review.rating = req.body.rating_input;
        newReview = review;
      }

      await create_notification(users_accountant._id, req.user._id,company._id,users_accountant._id, "review-notification");
  
      await newReview.save();
      console.log('Review created or updated successfully');
      res.redirect('/my-accountant?message=rating_submitted_successfully');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?error=' + err);
    }
});

module.exports = router;