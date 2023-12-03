const express = require("express");
const router = express.Router();

//Models
const Review  = require("../Schemas/Review");

//Authentication Functions
const Authentication = require("../AuthenticationFunctions");

//Create Notification Function
const create_notification = require("../CreateNotification");

router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      let newReview;
      const review = await Review.findOne({
        reviewer_id: req.user._id,
        reviewed_id: req.user.myaccountant.id,
        type: "client",
      });
  
      if (review == null) {
        newReview = new Review({
          reviewer_id: req.user._id,
          reviewed_id: req.user.myaccountant.id,
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

      create_notification(req.user.myaccountant.id, req.user._id, "review-notification");
  
      await newReview.save();
      console.log('Review created or updated successfully');
      res.redirect('/my-accountant');
    } catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=my-accountant&error=' + err);
    }
});

module.exports = router;