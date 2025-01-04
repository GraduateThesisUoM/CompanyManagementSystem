const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Accountant = require(path_constants.schemas.two.accountant);
const Review = require(path_constants.schemas.two.review);
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);

//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
const generalFunctions = require(path_constants.generalFunctions_folder.two)
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);


router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      const company = await Company.findOne({_id:req.user.company});
      const company_accountant_node = await Node.findOne({company: company._id, type: 1, type2: 1,next: "-"});

      let newReview;
      const review = await Review.findOne({
        company: company._id,
        reviewer_id: req.user._id,
        reviewed_id: company_accountant_node.sender_id,
        type: 1, // 1 = client
      });
  
      if (review == null) {
        newReview = new Review({
          company: company._id,
          reviewer_id: req.user._id,
          reviewed_id: company_accountant_node.sender_id,
          text: req.body.rating_textarea,
          type: 1, // 1 = client
          rating: req.body.rating_input,
        });
      } else {
        // Update the existing review's text and rating
        review.text = req.body.rating_textarea;
        review.rating = req.body.rating_input;
        newReview = review;
      }  
      await newReview.save();
      console.log('Review created or updated successfully');
      res.redirect('/my-accountant?message=rating_submitted_successfully');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?error=' + err);
    }
});

module.exports = router;