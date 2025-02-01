const express = require("express");
const router = express.Router();

//Models
const Client = require("../../Schemas/Client");
const Review = require("../../Schemas/Review");
const Request = require("../../Schemas/Node");
const Company = require("../../Schemas/Company");


//Authentication Function
const Authentication = require("../../AuthenticationFunctions");

/*--------   CLIENT PROFILE */
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      const accountants_client = await Company.findOne({ _id: req.query.id });
      const clients_requests = await Request.find({
        receiver_id: req.user._id,
        sender_id: accountants_client._id,
        status: "pending",
      });

      var accountant_review = await Review.findOne({
        reviewer_id: req.user._id,
        reviewed_id: accountants_client._id,
        type: "accountant",
      });
      if (accountant_review == null) {
        accountant_review = new Review({
          reviewer_id: req.user._id,
          reviewed_id: accountants_client._id,
          rating: -1,
          registrationDate: "",
        });
      }
      req.session.selected_client = accountants_client;

      res.render("accountant_pages/client_profile.ejs", {
        selected_client: accountants_client,
        user: req.user,
        review: accountant_review,
        clients_requests: clients_requests,
      });
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    const accountants_client = await Company.findOne({
      _id: req.body.clients_id,
    });
    let newReview;
    const review = await Review.findOne({
      reviewer_id: req.user._id,
      reviewed_id: accountants_client._id,
      rating: -1,
      type: "accountant",
    });

    if (review == null) {
      newReview = new Review({
        reviewer_id: req.user._id,
        reviewed_id: accountants_client._id,
        text: req.body.rating_textarea,
        type: "accountant",
        rating: req.body.rating_input,
      });

    } else {
      // Update the existing review's text and rating
      review.text = req.body.rating_textarea;
      review.rating = req.body.rating_input;
      newReview = review;
    }

    await newReview.save();
    console.log("Review created or updated successfully");
    res.redirect("/client-profile?id=" + req.body.clients_id);
  } catch (err) {
    console.error("Error updating user data:", err);
    res.redirect("/error?origin_page=client-profile&error=" + err);
  }
});

module.exports = router;
